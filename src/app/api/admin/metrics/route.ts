import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";

type ProfileRow = { user_id: string };
type TicketRow = { user_id: string; consumed_at: string | null };
type EntryRow = { user_id: string | null; status: "draft" | "locked" };
type AppViewSourceRow = {
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
};

function countOrZero(count: number | null) {
  return count ?? 0;
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 90, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const last24HoursStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    profiles,
    tickets,
    entries,
    totalViews,
    todayViews,
    last24HourViews,
    latestView,
    topSourceViews,
  ] = await Promise.all([
    supabase.from("worldcup_referral_profiles").select("user_id"),
    supabase
      .from("worldcup_tickets")
      .select("user_id,consumed_at")
      .eq("tournament_id", tournament.data.id),
    supabase
      .from("worldcup_entries")
      .select("user_id,status")
      .eq("tournament_id", tournament.data.id),
    supabase.from("worldcup_app_views").select("id", { count: "exact", head: true }),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", last24HoursStart.toISOString()),
    supabase
      .from("worldcup_app_views")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("worldcup_app_views")
      .select("created_at,utm_source,utm_medium,utm_campaign,utm_content")
      .not("utm_source", "is", null)
      .gte("created_at", last24HoursStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  for (const result of [profiles, tickets, entries]) {
    if (result.error) {
      return jsonError("Could not load admin metrics.", 500);
    }
  }

  const appViewTrackingReady =
    !totalViews.error && !todayViews.error && !last24HourViews.error && !latestView.error;
  const appViewSourceRows = topSourceViews.error ? [] : ((topSourceViews.data ?? []) as AppViewSourceRow[]);
  const profileRows = (profiles.data ?? []) as ProfileRow[];
  const ticketRows = (tickets.data ?? []) as TicketRow[];
  const entryRows = (entries.data ?? []) as EntryRow[];
  const profileUserIds = new Set(profileRows.map((profile) => profile.user_id).filter(Boolean));
  const ticketUserIds = new Set(ticketRows.map((ticket) => ticket.user_id).filter(Boolean));
  const lockedEntryUserIds = new Set(
    entryRows
      .filter((entry) => entry.status === "locked" && entry.user_id)
      .map((entry) => entry.user_id as string),
  );
  const paidUserIds = new Set([...ticketUserIds, ...lockedEntryUserIds]);
  const paidAccounts = [...profileUserIds].filter((userId) => paidUserIds.has(userId)).length;
  const freeAccounts = Math.max(profileUserIds.size - paidAccounts, 0);
  const lockedPaidEntries = entryRows.filter((entry) => entry.status === "locked").length;
  const draftEntries = entryRows.filter((entry) => entry.status === "draft").length;

  return NextResponse.json({
    generatedAt: now.toISOString(),
    accountsTotal: profileUserIds.size,
    freeAccounts,
    paidAccounts,
    lockedPaidEntries,
    draftEntries,
    ticketsAssigned: ticketRows.length,
    ticketsAvailable: ticketRows.filter((ticket) => !ticket.consumed_at).length,
    appViews: {
      total: appViewTrackingReady ? countOrZero(totalViews.count) : 0,
      today: appViewTrackingReady ? countOrZero(todayViews.count) : 0,
      last24Hours: appViewTrackingReady ? countOrZero(last24HourViews.count) : 0,
      lastViewedAt:
        appViewTrackingReady && latestView.data && "created_at" in latestView.data
          ? (latestView.data.created_at as string)
          : null,
      topSources: buildTopSources(appViewSourceRows),
      trackingReady: appViewTrackingReady,
    },
  });
}

function buildTopSources(rows: AppViewSourceRow[]) {
  const groups = new Map<
    string,
    {
      source: string;
      medium: string | null;
      campaign: string | null;
      content: string | null;
      count: number;
      lastViewedAt: string | null;
    }
  >();

  for (const row of rows) {
    const source = row.utm_source?.trim();
    if (!source) continue;

    const medium = row.utm_medium?.trim() || null;
    const campaign = row.utm_campaign?.trim() || null;
    const content = row.utm_content?.trim() || null;
    const key = [source, medium ?? "", campaign ?? "", content ?? ""].join("\u0000");
    const current = groups.get(key) ?? {
      source,
      medium,
      campaign,
      content,
      count: 0,
      lastViewedAt: null,
    };

    current.count += 1;
    if (!current.lastViewedAt || new Date(row.created_at).getTime() > new Date(current.lastViewedAt).getTime()) {
      current.lastViewedAt = row.created_at;
    }
    groups.set(key, current);
  }

  return [...groups.values()]
    .sort((left, right) => {
      if (right.count !== left.count) return right.count - left.count;
      return new Date(right.lastViewedAt ?? 0).getTime() - new Date(left.lastViewedAt ?? 0).getTime();
    })
    .slice(0, 5);
}
