import { NextResponse } from "next/server";

import { isValidAdminSecret } from "@/lib/admin-auth";
import {
  calculateNetPrizePool,
  calculatePaidPlaces,
  calculatePayoutPlan,
} from "@/lib/prize-pool";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { AdminReferralReportPayload } from "@/lib/types";

type LeaderboardRecord = {
  entry_id: string;
  display_name: string;
  total_points: string;
  leaderboard_rank: number;
};

type ReferralRecord = {
  entry_id: string | null;
  inviter_user_id: string;
  referral_fee_percent: string;
};

type ProfileRecord = {
  user_id: string;
  display_name: string | null;
  referral_code: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as AdminReferralReportPayload;

  if (!isValidAdminSecret(payload.adminSecret)) {
    return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id,prize_pool_amount,prize_pool_fee_percent")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return NextResponse.json({ error: "Tournament is not available." }, { status: 500 });
  }

  const leaderboardResult = await supabase
    .from("worldcup_awarded_leaderboard")
    .select("entry_id,display_name,total_points,leaderboard_rank")
    .eq("tournament_id", tournament.data.id)
    .order("leaderboard_rank", { ascending: true });

  if (leaderboardResult.error) {
    return NextResponse.json({ error: leaderboardResult.error.message }, { status: 500 });
  }

  const leaderboard = (leaderboardResult.data ?? []) as LeaderboardRecord[];
  const participantCount = leaderboard.length;
  const paidPlaces = calculatePaidPlaces(participantCount);
  const prizePoolAmount = calculateNetPrizePool(
    tournament.data.prize_pool_amount,
    tournament.data.prize_pool_fee_percent,
  );
  const payoutPlan = calculatePayoutPlan(prizePoolAmount, paidPlaces);
  const paidEntries = leaderboard.slice(0, payoutPlan.length);
  const paidEntryIds = paidEntries.map((entry) => entry.entry_id);

  const referralsResult =
    paidEntryIds.length > 0
      ? await supabase
          .from("worldcup_referrals")
          .select("entry_id,inviter_user_id,referral_fee_percent")
          .in("entry_id", paidEntryIds)
      : { data: [], error: null };

  if (referralsResult.error) {
    return NextResponse.json({ error: referralsResult.error.message }, { status: 500 });
  }

  const referrals = (referralsResult.data ?? []) as ReferralRecord[];
  const inviterIds = [...new Set(referrals.map((referral) => referral.inviter_user_id))];
  const profilesResult =
    inviterIds.length > 0
      ? await supabase
          .from("worldcup_referral_profiles")
          .select("user_id,display_name,referral_code")
          .in("user_id", inviterIds)
      : { data: [], error: null };

  if (profilesResult.error) {
    return NextResponse.json({ error: profilesResult.error.message }, { status: 500 });
  }

  const referralsByEntryId = new Map(referrals.map((referral) => [referral.entry_id, referral]));
  const profilesByUserId = new Map(
    ((profilesResult.data ?? []) as ProfileRecord[]).map((profile) => [profile.user_id, profile]),
  );

  const rows = paidEntries.map((entry, index) => {
    const payout = payoutPlan[index];
    const referral = referralsByEntryId.get(entry.entry_id);
    const referralFeePercent = Number(referral?.referral_fee_percent ?? 0);
    const referralAmount = payout ? payout.amount * (referralFeePercent / 100) : 0;
    const inviter = referral ? profilesByUserId.get(referral.inviter_user_id) : null;
    const grossPrize = payout?.amount ?? 0;
    const netPrize = grossPrize - referralAmount;

    return {
      entryId: entry.entry_id,
      displayName: entry.display_name,
      leaderboardRank: entry.leaderboard_rank,
      totalPoints: entry.total_points,
      grossPrize: grossPrize.toFixed(2),
      referralFeePercent: referralFeePercent.toFixed(2),
      referralAmount: referralAmount.toFixed(2),
      netPrize: netPrize.toFixed(2),
      inviterDisplayName: inviter?.display_name ?? null,
      inviterReferralCode: inviter?.referral_code ?? null,
    };
  });

  const grossPrizeTotal = rows.reduce((sum, row) => sum + Number(row.grossPrize), 0);
  const referralTotal = rows.reduce((sum, row) => sum + Number(row.referralAmount), 0);
  const netPrizeTotal = rows.reduce((sum, row) => sum + Number(row.netPrize), 0);

  return NextResponse.json({
    participantCount,
    paidPlaces,
    prizePoolAmount: prizePoolAmount.toFixed(2),
    grossPrizeTotal: grossPrizeTotal.toFixed(2),
    referralTotal: referralTotal.toFixed(2),
    netPrizeTotal: netPrizeTotal.toFixed(2),
    rows,
  });
}
