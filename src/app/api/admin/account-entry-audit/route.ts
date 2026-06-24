import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";

const TOURNAMENT_SLUG = "fifa-world-cup-2026";
const HOMEPAGE_LEADERBOARD_LIMIT = 50;
const AUDIT_LEADERBOARD_LIMIT = 500;
const AUTH_USERS_PAGE_SIZE = 1000;
const AUTH_USERS_MAX_PAGES = 10;

type EntryStatus = "draft" | "committed" | "locked";
type AuditEntryStatus = EntryStatus | "none";

type AuthUserRow = {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string | null;
  user_metadata?: Record<string, unknown>;
};

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  referral_code: string | null;
};

type EntryRow = {
  id: string;
  user_id: string | null;
  display_name: string;
  status: EntryStatus;
  created_at: string;
  committed_at: string | null;
  locked_at: string | null;
};

type EntryTeamRow = {
  entry_id: string;
  team_id: string;
  pick_slot: number;
};

type TeamRow = {
  id: string;
  name: string;
};

type PublicLeaderboardRow = {
  entry_id: string;
  is_paid: boolean;
  total_points: string | number | null;
  leaderboard_rank: number | null;
};

type ServiceSupabaseClient = ReturnType<typeof createServiceSupabaseClient>;

const statusPriority: Record<AuditEntryStatus, number> = {
  locked: 3,
  committed: 2,
  draft: 1,
  none: 0,
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "admin-account-entry-audit", {
    limit: 60,
    windowMs: 60_000,
  });
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
    .eq("slug", TOURNAMENT_SLUG)
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  let authUsers: AuthUserRow[] = [];
  let authUsersCapped = false;

  try {
    const authUserResult = await listAuthUsers(supabase);
    authUsers = authUserResult.users;
    authUsersCapped = authUserResult.capped;
  } catch {
    return jsonError("Could not load signed-in accounts.", 500);
  }

  const [profiles, entries, teams, publicLeaderboard] = await Promise.all([
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id,display_name,email,referral_code")
      .order("display_name", { ascending: true }),
    supabase
      .from("worldcup_entries")
      .select("id,user_id,display_name,status,created_at,committed_at,locked_at")
      .eq("tournament_id", tournament.data.id)
      .order("created_at", { ascending: false }),
    supabase.from("worldcup_teams").select("id,name"),
    supabase
      .from("worldcup_public_leaderboard")
      .select("entry_id,is_paid,total_points,leaderboard_rank")
      .eq("tournament_id", tournament.data.id)
      .order("leaderboard_rank", { ascending: true })
      .limit(AUDIT_LEADERBOARD_LIMIT),
  ]);

  for (const result of [profiles, entries, teams, publicLeaderboard]) {
    if (result.error) {
      return jsonError("Could not load account audit data.", 500);
    }
  }

  const entryRows = (entries.data ?? []) as EntryRow[];
  const entryIds = entryRows.map((entry) => entry.id);
  let entryTeams: EntryTeamRow[] = [];

  if (entryIds.length > 0) {
    const entryTeamsResult = await supabase
      .from("worldcup_entry_teams")
      .select("entry_id,team_id,pick_slot")
      .in("entry_id", entryIds)
      .order("pick_slot", { ascending: true });

    if (entryTeamsResult.error) {
      return jsonError("Could not load picked teams.", 500);
    }

    entryTeams = (entryTeamsResult.data ?? []) as EntryTeamRow[];
  }

  const profileByUserId = new Map(
    ((profiles.data ?? []) as ProfileRow[]).map((profile) => [profile.user_id, profile]),
  );
  const authUserById = new Map(authUsers.map((user) => [user.id, user]));
  const entriesByUserId = groupEntriesByUser(entryRows);
  const teamsById = new Map(((teams.data ?? []) as TeamRow[]).map((team) => [team.id, team]));
  const entryTeamsByEntryId = groupEntryTeams(entryTeams);
  const leaderboardByEntryId = new Map(
    ((publicLeaderboard.data ?? []) as PublicLeaderboardRow[]).map((row) => [
      row.entry_id,
      row,
    ]),
  );

  const userIds = new Set<string>();
  authUsers.forEach((user) => userIds.add(user.id));
  profileByUserId.forEach((_, userId) => userIds.add(userId));
  entryRows.forEach((entry) => {
    if (entry.user_id) {
      userIds.add(entry.user_id);
    }
  });

  const accounts = Array.from(userIds)
    .map((userId) => {
      const profile = profileByUserId.get(userId) ?? null;
      const authUser = authUserById.get(userId) ?? null;
      const entry = chooseBestEntry(entriesByUserId.get(userId) ?? []);
      const pickedTeams = entry
        ? (entryTeamsByEntryId.get(entry.id) ?? []).map((pickedTeam) => ({
            teamId: pickedTeam.team_id,
            teamName: teamsById.get(pickedTeam.team_id)?.name ?? pickedTeam.team_id,
            pickSlot: pickedTeam.pick_slot,
          }))
        : [];
      const leaderboardRow = entry ? leaderboardByEntryId.get(entry.id) ?? null : null;
      const leaderboardRank = leaderboardRow?.leaderboard_rank ?? null;
      const homepageVisible =
        leaderboardRank !== null && leaderboardRank <= HOMEPAGE_LEADERBOARD_LIMIT;
      const entryStatus: AuditEntryStatus = entry?.status ?? "none";
      const displayName =
        profile?.display_name ??
        entry?.display_name ??
        getAuthDisplayName(authUser) ??
        "WorldCup player";

      return {
        userId,
        displayName,
        email: profile?.email ?? authUser?.email ?? null,
        referralCode: profile?.referral_code ?? null,
        hasAuthAccount: Boolean(authUser),
        hasReferralProfile: Boolean(profile),
        authCreatedAt: authUser?.created_at ?? null,
        lastSignInAt: authUser?.last_sign_in_at ?? null,
        entryId: entry?.id ?? null,
        entryStatus,
        entryCreatedAt: entry?.created_at ?? null,
        committedAt: entry?.committed_at ?? null,
        lockedAt: entry?.locked_at ?? null,
        pickCount: pickedTeams.length,
        teams: pickedTeams,
        leaderboardRank,
        homepageVisible,
        paidEntry: leaderboardRow?.is_paid ?? entryStatus === "locked",
        totalPoints:
          leaderboardRow?.total_points === null || leaderboardRow?.total_points === undefined
            ? null
            : String(leaderboardRow.total_points),
        reason: getReason({
          entryStatus,
          pickCount: pickedTeams.length,
          leaderboardRank,
          homepageVisible,
          hasReferralProfile: Boolean(profile),
          hasAuthAccount: Boolean(authUser),
        }),
      };
    })
    .sort(sortAuditRows);

  const summary = {
    authUsers: authUsers.length,
    authUsersCapped,
    referralProfiles: profileByUserId.size,
    accounts: accounts.length,
    noEntry: accounts.filter((account) => account.entryStatus === "none").length,
    draftOnly: accounts.filter((account) => account.entryStatus === "draft").length,
    committed: accounts.filter((account) => account.entryStatus === "committed").length,
    locked: accounts.filter((account) => account.entryStatus === "locked").length,
    pickedThree: accounts.filter((account) => account.pickCount === 3).length,
    incompletePicks: accounts.filter(
      (account) => account.entryStatus !== "none" && account.pickCount > 0 && account.pickCount < 3,
    ).length,
    noPicks: accounts.filter((account) => account.pickCount === 0).length,
    publicLeaderboardRows: publicLeaderboard.data?.length ?? 0,
    homepageVisible: accounts.filter((account) => account.homepageVisible).length,
    finalizedOutsideHomepage: accounts.filter(
      (account) =>
        account.pickCount === 3 &&
        (account.entryStatus === "committed" || account.entryStatus === "locked") &&
        !account.homepageVisible,
    ).length,
  };

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    homepageLeaderboardLimit: HOMEPAGE_LEADERBOARD_LIMIT,
    auditLeaderboardLimit: AUDIT_LEADERBOARD_LIMIT,
    summary,
    accounts,
  });
}

async function listAuthUsers(supabase: ServiceSupabaseClient) {
  const users: AuthUserRow[] = [];

  for (let page = 1; page <= AUTH_USERS_MAX_PAGES; page += 1) {
    const result = await supabase.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    });

    if (result.error) {
      throw result.error;
    }

    users.push(...((result.data.users ?? []) as AuthUserRow[]));

    if ((result.data.users ?? []).length < AUTH_USERS_PAGE_SIZE) {
      return { users, capped: false };
    }
  }

  return { users, capped: true };
}

function groupEntriesByUser(entries: EntryRow[]) {
  const grouped = new Map<string, EntryRow[]>();

  for (const entry of entries) {
    if (!entry.user_id) {
      continue;
    }

    const current = grouped.get(entry.user_id) ?? [];
    current.push(entry);
    grouped.set(entry.user_id, current);
  }

  return grouped;
}

function groupEntryTeams(entryTeams: EntryTeamRow[]) {
  const grouped = new Map<string, EntryTeamRow[]>();

  for (const entryTeam of entryTeams) {
    const current = grouped.get(entryTeam.entry_id) ?? [];
    current.push(entryTeam);
    grouped.set(entryTeam.entry_id, current);
  }

  grouped.forEach((teamsForEntry) =>
    teamsForEntry.sort((a, b) => a.pick_slot - b.pick_slot),
  );

  return grouped;
}

function chooseBestEntry(entries: EntryRow[]) {
  return [...entries].sort((a, b) => {
    const statusDelta = statusPriority[b.status] - statusPriority[a.status];
    if (statusDelta !== 0) {
      return statusDelta;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  })[0];
}

function getMetadataString(
  metadata: Record<string, unknown> | undefined,
  keys: string[],
) {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getAuthDisplayName(user: AuthUserRow | null) {
  if (!user) {
    return null;
  }

  return (
    getMetadataString(user.user_metadata, ["full_name", "name", "display_name"]) ??
    user.email?.split("@")[0] ??
    null
  );
}

function getReason(input: {
  entryStatus: AuditEntryStatus;
  pickCount: number;
  leaderboardRank: number | null;
  homepageVisible: boolean;
  hasReferralProfile: boolean;
  hasAuthAccount: boolean;
}) {
  if (!input.hasReferralProfile && input.hasAuthAccount) {
    return "Signed in, but no referral profile was created yet.";
  }

  if (input.entryStatus === "none") {
    return "Signed in/profile exists, but no 3-team entry was created.";
  }

  if (input.pickCount !== 3) {
    return `Entry exists, but only ${input.pickCount}/3 teams are saved.`;
  }

  if (input.entryStatus === "draft") {
    return "Picked 3 teams, but the entry is still draft and not finalized.";
  }

  if (input.homepageVisible) {
    return "Finalized and visible in the home page top 50.";
  }

  if (input.leaderboardRank) {
    return "Finalized and ranked, but hidden on the home page because only the top 50 are loaded.";
  }

  return "Finalized, but the public leaderboard did not return it in the audit window.";
}

function sortAuditRows<T extends { entryStatus: AuditEntryStatus; pickCount: number; homepageVisible: boolean; leaderboardRank: number | null; displayName: string }>(
  a: T,
  b: T,
) {
  const problemDelta = getProblemScore(a) - getProblemScore(b);

  if (problemDelta !== 0) {
    return problemDelta;
  }

  const rankDelta = (a.leaderboardRank ?? 999_999) - (b.leaderboardRank ?? 999_999);

  if (rankDelta !== 0) {
    return rankDelta;
  }

  return a.displayName.localeCompare(b.displayName);
}

function getProblemScore(input: {
  entryStatus: AuditEntryStatus;
  pickCount: number;
  homepageVisible: boolean;
  leaderboardRank: number | null;
}) {
  if (input.entryStatus === "none") {
    return 0;
  }

  if (input.pickCount !== 3) {
    return 1;
  }

  if (input.entryStatus === "draft") {
    return 2;
  }

  if (!input.leaderboardRank) {
    return 3;
  }

  if (!input.homepageVisible) {
    return 4;
  }

  return 5;
}
