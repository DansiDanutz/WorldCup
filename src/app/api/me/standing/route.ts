import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import {
  calculateNetPrizePool,
  calculatePaidPlaces,
  calculatePayoutPlan,
} from "@/lib/prize-pool";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";

type LeaderboardRow = {
  entry_id: string;
  display_name: string | null;
  total_points: string | number;
  teams: Array<{ team_name?: string; total_points?: string | number }> | null;
  leaderboard_rank: number;
};

type EntryRow = {
  id: string;
  display_name: string | null;
  status: string;
};

type EntryTeamTotalRow = {
  entry_id: string;
  team_name: string | null;
  total_points: string | number;
};

type AgentCodeRow = {
  code?: string;
  kind?: string | null;
  assigned_at?: string | null;
};

function formatLeaderboardPreview(row: LeaderboardRow) {
  return {
    displayName: row.display_name ?? "Player",
    totalPoints: Number(row.total_points ?? 0),
    rank: row.leaderboard_rank,
    teams: (row.teams ?? []).map((team) => ({
      name: team.team_name ?? "",
      points: Number(team.total_points ?? 0),
    })),
  };
}

function formatAgentCodeRecord(row: AgentCodeRow | null | undefined) {
  return row?.assigned_at
    ? {
        code: row.code ?? "",
        kind: row.kind ?? "ticket",
        assignedAt: row.assigned_at,
      }
    : null;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function formatTeamsFromTotals(rows: EntryTeamTotalRow[]) {
  return rows
    .map((team) => ({
      name: team.team_name ?? "",
      points: Number(team.total_points ?? 0),
    }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}

function sumTeamTotals(rows: EntryTeamTotalRow[]) {
  return round2(rows.reduce((sum, team) => sum + Number(team.total_points ?? 0), 0));
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "me-standing", { limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const token = getBearerToken(request);
  if (!token) {
    return jsonError("Sign in with Google first.", 401);
  }

  const supabase = createServiceSupabaseClient();
  const userResult = await supabase.auth.getUser(token);
  if (userResult.error || !userResult.data.user) {
    return jsonError("Invalid session.", 401);
  }

  const user = userResult.data.user;
  if (getAuthProvider(user) !== "google") {
    return jsonError("Only Google sign-in is allowed.", 403);
  }

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id,prize_pool_amount,prize_pool_fee_percent")
    .eq("slug", "fifa-world-cup-2026")
    .single();
  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }
  const tournamentId = tournament.data.id;

  const [participantHead, myEntry, referrals, agent, topLeaderboard] = await Promise.all([
    supabase
      .from("worldcup_awarded_leaderboard")
      .select("entry_id", { count: "exact", head: true })
      .eq("tournament_id", tournamentId),
    supabase
      .from("worldcup_entries")
      .select("id,display_name,status")
      .eq("tournament_id", tournamentId)
      .eq("user_id", user.id)
      .order("locked_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("worldcup_referrals")
      .select("entry_id,referral_fee_percent,accepted_at")
      .eq("tournament_id", tournamentId)
      .eq("inviter_user_id", user.id),
    supabase
      .from("worldcup_agents")
      .select("paid_tickets,commission_tickets,active")
      .eq("tournament_id", tournamentId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("worldcup_awarded_leaderboard")
      .select("entry_id,display_name,total_points,teams,leaderboard_rank")
      .eq("tournament_id", tournamentId)
      .order("leaderboard_rank", { ascending: true })
      .limit(10),
  ]);

  if (participantHead.error || topLeaderboard.error) {
    return jsonError("Could not load the leaderboard.", 500);
  }

  const participants = participantHead.count ?? 0;
  const netPrizePool = calculateNetPrizePool(
    tournament.data.prize_pool_amount,
    tournament.data.prize_pool_fee_percent,
  );
  const paidPlaces = calculatePaidPlaces(participants);
  const payoutPlan = calculatePayoutPlan(netPrizePool, paidPlaces);
  const shareForRank = (rank: number | null | undefined) =>
    rank && rank <= paidPlaces ? (payoutPlan[rank - 1]?.amount ?? 0) : null;

  // Collect the entry ids we need leaderboard rows for (mine + referrals').
  const referralRows = (referrals.data ?? []) as Array<{
    entry_id: string | null;
    referral_fee_percent: number;
    accepted_at: string;
  }>;
  const entryIds = new Set<string>();
  if (myEntry.data?.id) {
    entryIds.add(myEntry.data.id as string);
  }
  for (const referral of referralRows) {
    if (referral.entry_id) {
      entryIds.add(referral.entry_id);
    }
  }

  const leaderboardById = new Map<string, LeaderboardRow>();
  const entriesById = new Map<string, EntryRow>();
  const teamTotalsByEntryId = new Map<string, EntryTeamTotalRow[]>();
  if (entryIds.size > 0) {
    const entryIdList = Array.from(entryIds);
    const [rows, entryRows, teamTotals] = await Promise.all([
      supabase
        .from("worldcup_awarded_leaderboard")
        .select("entry_id,display_name,total_points,teams,leaderboard_rank")
        .eq("tournament_id", tournamentId)
        .in("entry_id", entryIdList),
      supabase
        .from("worldcup_entries")
        .select("id,display_name,status")
        .eq("tournament_id", tournamentId)
        .in("id", entryIdList),
      supabase
        .from("worldcup_entry_team_totals")
        .select("entry_id,team_name,total_points")
        .eq("tournament_id", tournamentId)
        .in("entry_id", entryIdList),
    ]);
    if (rows.error || entryRows.error || teamTotals.error) {
      return jsonError("Could not load standings.", 500);
    }
    for (const row of (rows.data ?? []) as LeaderboardRow[]) {
      leaderboardById.set(row.entry_id, row);
    }
    for (const row of (entryRows.data ?? []) as EntryRow[]) {
      entriesById.set(row.id, row);
    }
    for (const row of (teamTotals.data ?? []) as EntryTeamTotalRow[]) {
      const bucket = teamTotalsByEntryId.get(row.entry_id) ?? [];
      bucket.push(row);
      teamTotalsByEntryId.set(row.entry_id, bucket);
    }
  }

  const shadowRankForPoints = async (totalPoints: number) => {
    const rankHead = await supabase
      .from("worldcup_awarded_leaderboard")
      .select("entry_id", { count: "exact", head: true })
      .eq("tournament_id", tournamentId)
      .gt("total_points", totalPoints);
    if (rankHead.error) {
      throw rankHead.error;
    }
    return (rankHead.count ?? 0) + 1;
  };

  const shadowPaidPlaces = calculatePaidPlaces(participants + 1);
  const shadowPayoutPlan = calculatePayoutPlan(netPrizePool, shadowPaidPlaces);
  const shareForShadowRank = (rank: number | null | undefined) =>
    rank && rank <= shadowPaidPlaces ? (shadowPayoutPlan[rank - 1]?.amount ?? 0) : null;

  let myShadowRank: number | null = null;
  const myEntryStatus = (myEntry.data?.status as string | undefined) ?? null;
  const myEntryTeamTotals = myEntry.data?.id
    ? teamTotalsByEntryId.get(myEntry.data.id as string) ?? []
    : [];
  const myTotalFromTeams = sumTeamTotals(myEntryTeamTotals);
  if (myEntry.data?.id && myEntryStatus !== "locked") {
    try {
      myShadowRank = await shadowRankForPoints(myTotalFromTeams);
    } catch {
      return jsonError("Could not load your preview rank.", 500);
    }
  }

  const myRow = myEntry.data?.id ? leaderboardById.get(myEntry.data.id as string) : undefined;
  const myRank = myEntryStatus === "locked" ? (myRow?.leaderboard_rank ?? null) : myShadowRank;
  const myShareAmount =
    myEntryStatus === "locked" ? shareForRank(myRank) : shareForShadowRank(myRank);

  const me = myEntry.data
    ? {
        hasEntry: true,
        locked: myEntryStatus === "locked",
        displayName: (myRow?.display_name ?? myEntry.data.display_name) as string,
        totalPoints: myRow ? Number(myRow.total_points) : myTotalFromTeams,
        rank: myRank,
        teams:
          myEntryTeamTotals.length > 0
            ? formatTeamsFromTotals(myEntryTeamTotals)
            : (myRow?.teams ?? []).map((team) => ({
                name: team.team_name ?? "",
                points: Number(team.total_points ?? 0),
              })),
        inPaidPlaces: myShareAmount != null,
        share: myShareAmount != null ? round2(myShareAmount) : null,
      }
    : { hasEntry: false };

  const referralStandings = referralRows
    .map((referral) => {
      const row = referral.entry_id ? leaderboardById.get(referral.entry_id) : undefined;
      const entry = referral.entry_id ? entriesById.get(referral.entry_id) : undefined;
      const teamTotals = referral.entry_id ? teamTotalsByEntryId.get(referral.entry_id) ?? [] : [];
      const totalPoints = row ? Number(row.total_points) : sumTeamTotals(teamTotals);
      const rank = row?.leaderboard_rank ?? null;
      const share = shareForRank(rank);
      const feePercent = Number(referral.referral_fee_percent ?? 0);
      return {
        displayName: row?.display_name ?? entry?.display_name ?? "Referred player",
        totalPoints,
        rank,
        locked: entry?.status === "locked",
        inPaidPlaces: share != null,
        share: share != null ? round2(share) : null,
        feePercent,
        myCut: share != null ? round2((share * feePercent) / 100) : null,
      };
    })
    .sort((a, b) => {
      if (a.rank == null) return 1;
      if (b.rank == null) return -1;
      return a.rank - b.rank;
    });

  const referralCutTotal = round2(
    referralStandings.reduce((sum, referral) => sum + (referral.myCut ?? 0), 0),
  );

  let agentBlock: Record<string, unknown> | null = null;
  if (agent.data && (agent.data.active as boolean)) {
    const paid = Number(agent.data.paid_tickets ?? 0);
    const [available, lastAssigned, lastPaid, lastCommission] = await Promise.all([
      supabase
        .from("worldcup_ticket_codes")
        .select("code,kind,assigned_at", { count: "exact" })
        .eq("tournament_id", tournamentId)
        .eq("agent_user_id", user.id)
        .eq("status", "assigned")
        .order("assigned_at", { ascending: true }),
      supabase
        .from("worldcup_ticket_codes")
        .select("code,kind,assigned_at")
        .eq("tournament_id", tournamentId)
        .eq("agent_user_id", user.id)
        .not("assigned_at", "is", null)
        .order("assigned_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("worldcup_ticket_codes")
        .select("code,kind,assigned_at")
        .eq("tournament_id", tournamentId)
        .eq("agent_user_id", user.id)
        .eq("kind", "paid")
        .not("assigned_at", "is", null)
        .order("assigned_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("worldcup_ticket_codes")
        .select("code,kind,assigned_at")
        .eq("tournament_id", tournamentId)
        .eq("agent_user_id", user.id)
        .eq("kind", "commission")
        .not("assigned_at", "is", null)
        .order("assigned_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (available.error || lastAssigned.error || lastPaid.error || lastCommission.error) {
      return jsonError("Could not load agent ticket records.", 500);
    }

    const nextCode = (available.data ?? [])[0] as AgentCodeRow | undefined;
    agentBlock = {
      isAgent: true,
      paidTickets: paid,
      commissionTickets: Number(agent.data.commission_tickets ?? 0),
      availableCodes: available.count ?? available.data?.length ?? 0,
      nextAvailableCode: nextCode?.code
        ? {
            code: nextCode.code,
            kind: nextCode.kind ?? "ticket",
          }
        : null,
      lastAssignedCode: formatAgentCodeRecord(lastAssigned.data as AgentCodeRow | null),
      lastPaidCode: formatAgentCodeRecord(lastPaid.data as AgentCodeRow | null),
      lastCommissionCode: formatAgentCodeRecord(lastCommission.data as AgentCodeRow | null),
      toNextFree: 10 - (paid % 10),
    };
  }

  return NextResponse.json({
    signedIn: true,
    me,
    tournament: {
      participants,
      paidPlaces,
      netPrizePool: round2(netPrizePool),
    },
    referrals: referralStandings,
    referralCutTotal,
    leaderboardTop: ((topLeaderboard.data ?? []) as LeaderboardRow[]).map(formatLeaderboardPreview),
    agent: agentBlock,
  });
}
