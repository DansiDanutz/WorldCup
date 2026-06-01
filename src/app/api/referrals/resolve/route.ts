import { NextResponse } from "next/server";

import { normalizeReferralCode } from "@/lib/referrals";
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
    .select("referral_code,display_name")
    .eq("referral_code", referralCode)
    .maybeSingle();

  if (profile.error) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }

  return NextResponse.json({
    valid: Boolean(profile.data),
    referralCode,
    inviterName: profile.data?.display_name ?? null,
  });
}
