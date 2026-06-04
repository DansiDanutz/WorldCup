import { NextResponse } from "next/server";

import {
  canSubmitAgeDocs,
  formatAgeVerification,
  getAgeVerificationContact,
  normalizeAgeVerificationStatus,
} from "@/lib/age-verification";
import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider, getOrCreateReferralProfile } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";

const AGE_PROFILE_SELECT =
  "age_verification_status,age_verification_note,age_verification_submitted_at,age_verified_at";

type AgeVerificationDeps = {
  enforceRateLimit: typeof enforceRateLimit;
  getBearerToken: typeof getBearerToken;
  createServiceSupabaseClient: typeof createServiceSupabaseClient;
  getContact: () => string;
};

const defaultDeps: AgeVerificationDeps = {
  enforceRateLimit,
  getBearerToken,
  createServiceSupabaseClient,
  getContact: () => getAgeVerificationContact(),
};

export function createAgeVerificationHandlers(deps: AgeVerificationDeps) {
  async function resolveUser(
    request: Request,
  ): Promise<{ error: Response } | { supabase: any; user: any }> {
    const token = deps.getBearerToken(request);
    if (!token) {
      return { error: jsonError("Sign in with Google first.", 401) };
    }

    const supabase = deps.createServiceSupabaseClient();
    const userResult = await supabase.auth.getUser(token);
    if (userResult.error || !userResult.data.user) {
      return { error: jsonError("Invalid session.", 401) };
    }

    const user = userResult.data.user;
    if (getAuthProvider(user) !== "google") {
      return { error: jsonError("Only Google sign-in is allowed.", 403) };
    }

    return { supabase, user };
  }

  async function get(request: Request): Promise<Response> {
    const limited = await deps.enforceRateLimit(request, "age-verification", {
      limit: 30,
      windowMs: 60_000,
    });
    if (limited) {
      return limited;
    }

    const auth = await resolveUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    const profile = await auth.supabase
      .from("worldcup_referral_profiles")
      .select(AGE_PROFILE_SELECT)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (profile.error) {
      return jsonError("Could not load age verification status.", 500);
    }

    return NextResponse.json({
      ...formatAgeVerification(profile.data),
      contact: deps.getContact(),
    });
  }

  async function post(request: Request): Promise<Response> {
    const limited = await deps.enforceRateLimit(request, "age-verification", {
      limit: 10,
      windowMs: 60_000,
    });
    if (limited) {
      return limited;
    }

    const auth = await resolveUser(request);
    if ("error" in auth) {
      return auth.error;
    }

    // Make sure a referral profile row exists before we update the status.
    try {
      await getOrCreateReferralProfile(auth.supabase, auth.user);
    } catch {
      return jsonError("Could not load your account.", 500);
    }

    const current = await auth.supabase
      .from("worldcup_referral_profiles")
      .select("age_verification_status")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (current.error) {
      return jsonError("Could not load age verification status.", 500);
    }

    const status = normalizeAgeVerificationStatus(current.data?.age_verification_status);
    if (!canSubmitAgeDocs(status)) {
      return jsonError("Your age is already verified.", 409);
    }

    const now = new Date().toISOString();
    const updated = await auth.supabase
      .from("worldcup_referral_profiles")
      .update({
        age_verification_status: "pending",
        age_verification_submitted_at: now,
        age_verification_note: null,
        updated_at: now,
      })
      .eq("user_id", auth.user.id)
      .select(AGE_PROFILE_SELECT)
      .single();

    if (updated.error || !updated.data) {
      return jsonError("Could not update age verification.", 500);
    }

    return NextResponse.json({
      ...formatAgeVerification(updated.data),
      contact: deps.getContact(),
    });
  }

  return { get, post };
}

const handlers = createAgeVerificationHandlers(defaultDeps);

export async function GET(request: Request) {
  return handlers.get(request);
}

export async function POST(request: Request) {
  return handlers.post(request);
}
