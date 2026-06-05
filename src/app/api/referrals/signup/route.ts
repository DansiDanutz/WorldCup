import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import {
  getAuthProvider,
  getOrCreateReferralProfile,
  normalizeReferralCode,
} from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  requireObject,
  requireString,
  ValidationError,
} from "@/lib/validation";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "referral-signup", {
    limit: 20,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();
  const token = getBearerToken(request);
  const userResult = token ? await supabase.auth.getUser(token) : null;

  if (!userResult?.data.user || userResult.error) {
    return jsonError("Sign in with Google before saving a signup referral.", 401);
  }

  const user = userResult.data.user;
  if (getAuthProvider(user) !== "google") {
    return jsonError("Only Google sign-in is allowed.", 403);
  }

  let referralCode: string;
  let referralTermsAccepted: boolean;

  try {
    const body = requireObject(await request.json());
    referralCode = normalizeReferralCode(requireString(body.referralCode, "Referral code", { max: 12 }));
    referralTermsAccepted = body.referralTermsAccepted === true;
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  if (!referralCode) {
    return jsonError("Referral code is required.", 400);
  }

  if (!referralTermsAccepted) {
    return jsonError("Accept the referral agreement before saving this inviter.", 400);
  }

  const [profile, inviter] = await Promise.all([
    getOrCreateReferralProfile(supabase, user),
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id,referral_code")
      .eq("referral_code", referralCode)
      .maybeSingle(),
  ]);

  if (inviter.error) {
    return jsonError("Could not validate referral code.", 500);
  }

  if (!inviter.data) {
    return jsonError("Referral code is not valid.", 404);
  }

  if (inviter.data.user_id === user.id) {
    return jsonError("You cannot use your own referral code.", 400);
  }

  if (
    profile.signup_referrer_user_id &&
    profile.signup_referrer_user_id !== inviter.data.user_id
  ) {
    return NextResponse.json({
      ok: true,
      locked: true,
      referralCode: profile.signup_referral_code,
      referrerUserId: profile.signup_referrer_user_id,
    });
  }

  const update = await supabase
    .from("worldcup_referral_profiles")
    .update({
      signup_referral_code: referralCode,
      signup_referrer_user_id: inviter.data.user_id,
      signup_referral_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .is("signup_referrer_user_id", null)
    .select("signup_referral_code,signup_referrer_user_id,signup_referral_accepted_at")
    .maybeSingle();

  if (update.error) {
    return jsonError("Could not save signup referral.", 500);
  }

  return NextResponse.json({
    ok: true,
    referralCode: update.data?.signup_referral_code ?? profile.signup_referral_code ?? referralCode,
    referrerUserId:
      update.data?.signup_referrer_user_id ?? profile.signup_referrer_user_id ?? inviter.data.user_id,
  });
}
