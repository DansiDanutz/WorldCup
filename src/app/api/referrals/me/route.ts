import { NextResponse } from "next/server";

import { calculateWalletBalance } from "@/lib/economy";
import { enforceRateLimit } from "@/lib/http";
import { getUserPaidActionGates } from "@/lib/paid-action-gates";
import {
  calculateNetPrizePool,
  calculatePaidPlaces,
  calculatePayoutPlan,
} from "@/lib/prize-pool";
import {
  getAuthProvider,
  getOrCreateReferralProfile,
  getUserDisplayName,
} from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { normalizeWorldCupTicketPriceAmount } from "@/lib/worldcup-ticket-price";

type EntryTeamTotalRow = {
  total_points: string | number;
};

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "referrals", { limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ error: "Sign in with Google first." }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const user = userResult.data.user;

  if (getAuthProvider(user) !== "google") {
    return NextResponse.json({ error: "Only Google sign-in is allowed." }, { status: 403 });
  }

  const [profile, paidActionGates] = await Promise.all([
    getOrCreateReferralProfile(supabase, user),
    getUserPaidActionGates(supabase, { userEmail: user.email }),
  ]);
  const referrals = await supabase
    .from("worldcup_referrals")
    .select("id,entry_id,referral_code,referral_fee_percent,accepted_at")
    .eq("inviter_user_id", user.id)
    .order("accepted_at", { ascending: false });

  if (referrals.error) {
    return NextResponse.json({ error: "Could not load referral activity." }, { status: 500 });
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id,ticket_price_amount,prize_pool_amount,prize_pool_fee_percent")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return NextResponse.json({ error: "Tournament is not available." }, { status: 500 });
  }

  const [tickets, transactions, ownEntry] = await Promise.all([
    supabase
      .from("worldcup_tickets")
      .select("id,consumed_at")
      .eq("tournament_id", tournament.data.id)
      .eq("user_id", user.id),
    supabase
      .from("worldcup_wallet_transactions")
      .select("from_user_id,to_user_id,amount")
      .eq("tournament_id", tournament.data.id)
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`),
    supabase
      .from("worldcup_entries")
      .select("id,display_name,status,locked_at")
      .eq("tournament_id", tournament.data.id)
      .eq("user_id", user.id)
      .order("locked_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (tickets.error || transactions.error || ownEntry.error) {
    return NextResponse.json(
      {
        error:
          tickets.error?.message ??
          transactions.error?.message ??
          ownEntry.error?.message ??
          "Could not load account status.",
      },
      { status: 500 },
    );
  }

  const ownEntryTeams = ownEntry.data?.id
    ? await supabase
        .from("worldcup_entry_teams")
        .select("team_id,pick_slot")
        .eq("entry_id", ownEntry.data.id)
        .order("pick_slot", { ascending: true })
    : null;

  if (ownEntryTeams?.error) {
    return NextResponse.json({ error: "Could not load your locked teams." }, { status: 500 });
  }

  let entryPreview: {
    totalPoints: number;
    rank: number | null;
    paidPlaces: number;
    projectedShare: number | null;
  } | null = null;

  if (ownEntry.data?.id && ownEntry.data.status === "draft") {
    const teamTotals = await supabase
      .from("worldcup_entry_team_totals")
      .select("total_points")
      .eq("tournament_id", tournament.data.id)
      .eq("entry_id", ownEntry.data.id);

    if (teamTotals.error) {
      return NextResponse.json({ error: "Could not load your free preview points." }, { status: 500 });
    }

    const totalPoints = round2(
      ((teamTotals.data ?? []) as EntryTeamTotalRow[]).reduce(
        (sum, team) => sum + Number(team.total_points ?? 0),
        0,
      ),
    );

    const [participantHead, rankHead] = await Promise.all([
      supabase
        .from("worldcup_awarded_leaderboard")
        .select("entry_id", { count: "exact", head: true })
        .eq("tournament_id", tournament.data.id),
      supabase
        .from("worldcup_awarded_leaderboard")
        .select("entry_id", { count: "exact", head: true })
        .eq("tournament_id", tournament.data.id)
        .gt("total_points", totalPoints),
    ]);

    if (participantHead.error || rankHead.error) {
      return NextResponse.json({ error: "Could not load your free preview rank." }, { status: 500 });
    }

    const previewRank = (rankHead.count ?? 0) + 1;
    const paidPlaces = calculatePaidPlaces((participantHead.count ?? 0) + 1);
    const payoutPlan = calculatePayoutPlan(
      calculateNetPrizePool(tournament.data.prize_pool_amount, tournament.data.prize_pool_fee_percent),
      paidPlaces,
    );
    const projectedShare =
      previewRank <= paidPlaces ? round2(payoutPlan[previewRank - 1]?.amount ?? 0) : null;

    entryPreview = {
      totalPoints,
      rank: previewRank,
      paidPlaces,
      projectedShare,
    };
  }

  const entryIds = (referrals.data ?? [])
    .map((referral) => referral.entry_id)
    .filter((entryId): entryId is string => Boolean(entryId));
  const entries =
    entryIds.length > 0
      ? await supabase.from("worldcup_entries").select("id,display_name").in("id", entryIds)
      : null;

  if (entries?.error) {
    return NextResponse.json({ error: "Could not load referred entries." }, { status: 500 });
  }

  const entriesById = new Map(
    (entries?.data ?? []).map((entry) => [entry.id, entry.display_name ?? "Referred player"]),
  );

  return NextResponse.json({
    referralCode: profile.referral_code,
    displayName: profile.display_name ?? getUserDisplayName(user),
    walletBalance: calculateWalletBalance(user.id, transactions.data ?? []).toFixed(8),
    ticketsAssigned: tickets.data?.length ?? 0,
    ticketsAvailable: (tickets.data ?? []).filter((ticket) => !ticket.consumed_at).length,
    ticketPriceAmount: normalizeWorldCupTicketPriceAmount(tournament.data.ticket_price_amount),
    entry: ownEntry.data
      ? {
          id: ownEntry.data.id,
          status: ownEntry.data.status,
          displayName: ownEntry.data.display_name,
          teamIds: (ownEntryTeams?.data ?? []).map((team) => team.team_id),
          lockedAt: ownEntry.data.locked_at,
        }
      : null,
    entryPreview,
    usdtSenderWalletAddress: profile.usdt_sender_wallet_address ?? null,
    usdtSenderWalletNetwork: profile.usdt_sender_wallet_network ?? null,
    usdtSenderWalletUpdatedAt: profile.usdt_sender_wallet_updated_at ?? null,
    usdtSenderWalletTrc20Address: profile.usdt_sender_wallet_trc20_address ?? null,
    usdtSenderWalletTrc20UpdatedAt: profile.usdt_sender_wallet_trc20_updated_at ?? null,
    usdtSenderWalletErc20Address: profile.usdt_sender_wallet_erc20_address ?? null,
    usdtSenderWalletErc20UpdatedAt: profile.usdt_sender_wallet_erc20_updated_at ?? null,
    paidActionGates,
    referrals: (referrals.data ?? []).map((referral) => ({
      id: referral.id,
      entryId: referral.entry_id,
      invitedDisplayName: entriesById.get(referral.entry_id ?? "") ?? "Referred player",
      referralCode: referral.referral_code,
      feePercent: referral.referral_fee_percent,
      acceptedAt: referral.accepted_at,
    })),
  });
}
