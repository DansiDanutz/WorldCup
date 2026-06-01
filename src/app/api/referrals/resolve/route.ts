import { NextResponse } from "next/server";

import { normalizeReferralCode } from "@/lib/referrals";
import { getInviterReferralPercent } from "@/lib/referral-rates";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const referralCode = normalizeReferralCode(url.searchParams.get("code"));

  if (!referralCode) {
    return NextResponse.json({ valid: false });
  }

  const supabase = createServiceSupabaseClient();
  const profile = await supabase
    .from("worldcup_referral_profiles")
    .select("user_id,referral_code,display_name")
    .eq("referral_code", referralCode)
    .maybeSingle();

  if (profile.error) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }

  let referralPercent = 3;

  if (profile.data) {
    const tournament = await supabase
      .from("worldcup_tournaments")
      .select("id")
      .eq("slug", "fifa-world-cup-2026")
      .single();

    if (tournament.error || !tournament.data) {
      return NextResponse.json({ valid: false }, { status: 500 });
    }

    const inviterEntry = await supabase
      .from("worldcup_entries")
      .select("referrer_user_id")
      .eq("tournament_id", tournament.data.id)
      .eq("user_id", profile.data.user_id)
      .maybeSingle();

    if (inviterEntry.error) {
      return NextResponse.json({ valid: false }, { status: 500 });
    }

    referralPercent = getInviterReferralPercent(Boolean(inviterEntry.data?.referrer_user_id));
  }

  return NextResponse.json({
    valid: Boolean(profile.data),
    referralCode,
    inviterName: profile.data?.display_name ?? null,
    referralPercent,
  });
}
