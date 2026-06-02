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

function round2(value: number) {
  return Math.round(value * 100) / 100;
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

  const [participantHead, myEntry, referrals, agent] = await Promise.all([
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
  ]);

  if (participantHead.error) {
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
  if (entryIds.size > 0) {
    const rows = await supabase
      .from("worldcup_awarded_leaderboard")
      .select("entry_id,display_name,total_points,teams,leaderboard_rank")
      .eq("tournament_id", tournamentId)
      .in("entry_id", Array.from(entryIds));
    if (rows.error) {
      return jsonError("Could not load standings.", 500);
    }
    for (const row of (rows.data ?? []) as LeaderboardRow[]) {
      leaderboardById.set(row.entry_id, row);
    }
  }

  const myRow = myEntry.data?.id ? leaderboardById.get(myEntry.data.id as string) : undefined;
  const myRank = myRow?.leaderboard_rank ?? null;
  const myShareAmount = shareForRank(myRank);

  const me = myEntry.data
    ? {
        hasEntry: true,
        locked: (myEntry.data.status as string) === "locked",
        displayName: (myRow?.display_name ?? myEntry.data.display_name) as string,
        totalPoints: myRow ? Number(myRow.total_points) : 0,
        rank: myRank,
        teams: (myRow?.teams ?? []).map((team) => ({
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
      const rank = row?.leaderboard_rank ?? null;
      const share = shareForRank(rank);
      const feePercent = Number(referral.referral_fee_percent ?? 0);
      return {
        displayName: row?.display_name ?? "Referred player",
        totalPoints: row ? Number(row.total_points) : 0,
        rank,
        locked: Boolean(row),
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
    const available = await supabase
      .from("worldcup_ticket_codes")
      .select("code", { count: "exact", head: true })
      .eq("tournament_id", tournamentId)
      .eq("agent_user_id", user.id)
      .eq("status", "assigned");
    agentBlock = {
      isAgent: true,
      paidTickets: paid,
      commissionTickets: Number(agent.data.commission_tickets ?? 0),
      availableCodes: available.count ?? 0,
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
    agent: agentBlock,
  });
}
