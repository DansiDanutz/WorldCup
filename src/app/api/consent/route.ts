import { NextResponse } from "next/server";

import { CURRENT_TERMS_VERSION, isConsentCurrent } from "@/lib/consent";
import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getClientIp } from "@/lib/request";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, ValidationError } from "@/lib/validation";

async function getUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return { error: jsonError("Sign in with Google first.", 401) as NextResponse } as const;
  }

  const supabase = createServiceSupabaseClient();
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return { error: jsonError("Invalid session.", 401) as NextResponse } as const;
  }

  if (getAuthProvider(userResult.data.user) !== "google") {
    return { error: jsonError("Only Google sign-in is allowed.", 403) as NextResponse } as const;
  }

  return { supabase, user: userResult.data.user } as const;
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "consent", { limit: 30, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const auth = await getUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  const consent = await auth.supabase
    .from("worldcup_consent")
    .select("age_confirmed,terms_version")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (consent.error) {
    return jsonError("Could not load consent status.", 500);
  }

  return NextResponse.json({
    consented: isConsentCurrent(consent.data),
    termsVersion: CURRENT_TERMS_VERSION,
  });
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "consent", { limit: 15, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const auth = await getUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  let ageConfirmed: boolean;
  let termsAccepted: boolean;

  try {
    const body = requireObject(await request.json());
    ageConfirmed = body.ageConfirmed === true;
    termsAccepted = body.termsAccepted === true;
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  if (!ageConfirmed) {
    return jsonError("You must confirm you meet the minimum age to play.", 400);
  }

  if (!termsAccepted) {
    return jsonError("You must accept the Terms and Privacy Policy.", 400);
  }

  const upsert = await auth.supabase.from("worldcup_consent").upsert(
    {
      user_id: auth.user.id,
      age_confirmed: true,
      terms_version: CURRENT_TERMS_VERSION,
      accepted_at: new Date().toISOString(),
      ip: getClientIp(request),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (upsert.error) {
    return jsonError("Could not save consent.", 500);
  }

  return NextResponse.json({ consented: true, termsVersion: CURRENT_TERMS_VERSION });
}
