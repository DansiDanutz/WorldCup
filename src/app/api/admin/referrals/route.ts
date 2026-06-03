import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit, jsonError } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";

type ReferralRecord = {
  id: string;
  entry_id: string | null;
  inviter_user_id: string;
  invited_user_id: string;
  referral_code: string;
  referral_fee_percent: string;
  accepted_at: string;
};

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "admin", { limit: 90, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const auth = await requireAdmin(request, supabase);

  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }

  const referralsResult = await supabase
    .from("worldcup_referrals")
    .select("id,entry_id,inviter_user_id,invited_user_id,referral_code,referral_fee_percent,accepted_at")
    .order("accepted_at", { ascending: false });

  if (referralsResult.error) {
    return jsonError("Could not load the referral report.", 500);
  }

  const referrals = (referralsResult.data ?? []) as ReferralRecord[];
  const entryIds = referrals
    .map((referral) => referral.entry_id)
    .filter((entryId): entryId is string => Boolean(entryId));
  const inviterIds = referrals.map((referral) => referral.inviter_user_id);

  const [entriesResult, profilesResult, leaderboardResult] = await Promise.all([
    entryIds.length > 0
      ? supabase.from("worldcup_entries").select("id,display_name").in("id", entryIds)
      : Promise.resolve({ data: [], error: null }),
    inviterIds.length > 0
      ? supabase
          .from("worldcup_referral_profiles")
          .select("user_id,display_name,referral_code")
          .in("user_id", inviterIds)
      : Promise.resolve({ data: [], error: null }),
    entryIds.length > 0
      ? supabase
          .from("worldcup_awarded_leaderboard")
          .select("entry_id,total_points,leaderboard_rank")
          .in("entry_id", entryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  for (const result of [entriesResult, profilesResult, leaderboardResult]) {
    if (result.error) {
      return jsonError("Could not load the referral report.", 500);
    }
  }

  const entriesById = new Map(
    (entriesResult.data ?? []).map((entry) => [entry.id, entry.display_name ?? "Referred player"]),
  );
  const profilesByUserId = new Map(
    (profilesResult.data ?? []).map((profile) => [
      profile.user_id,
      { displayName: profile.display_name ?? "Inviter", referralCode: profile.referral_code },
    ]),
  );
  const leaderboardByEntryId = new Map(
    (leaderboardResult.data ?? []).map((row) => [
      row.entry_id,
      { totalPoints: row.total_points, leaderboardRank: row.leaderboard_rank },
    ]),
  );

  return NextResponse.json({
    referrals: referrals.map((referral) => {
      const inviter = profilesByUserId.get(referral.inviter_user_id);
      const leaderboard = leaderboardByEntryId.get(referral.entry_id ?? "");

      return {
        id: referral.id,
        referralCode: referral.referral_code,
        inviterDisplayName: inviter?.displayName ?? "Inviter",
        inviterReferralCode: inviter?.referralCode ?? referral.referral_code,
        invitedDisplayName: entriesById.get(referral.entry_id ?? "") ?? "Referred player",
        acceptedAt: referral.accepted_at,
        feePercent: referral.referral_fee_percent,
        invitedTotalPoints: leaderboard?.totalPoints ?? "0",
        invitedLeaderboardRank: leaderboard?.leaderboardRank ?? null,
      };
    }),
  });
}
