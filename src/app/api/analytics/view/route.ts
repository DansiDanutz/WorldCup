import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { normalizeReferralCode } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { optionalString, requireObject, requireString, ValidationError } from "@/lib/validation";

function truncate(value: string | null, max: number) {
  if (!value) return null;
  return value.length > max ? value.slice(0, max) : value;
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "analytics-view", {
    limit: 90,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  let path: string;
  let referrer: string | null;
  let referralCode: string | null;
  let sessionId: string | null;
  let utmSource: string | null;
  let utmMedium: string | null;
  let utmCampaign: string | null;
  let utmContent: string | null;

  try {
    const body = requireObject(await request.json());
    path = requireString(body.path, "Path", { max: 240 });
    referrer = optionalString(body.referrer, "Referrer", 500);
    referralCode = normalizeReferralCode(optionalString(body.referralCode, "Referral code", 12));
    sessionId = optionalString(body.sessionId, "Session ID", 128);
    utmSource = optionalString(body.utmSource, "UTM source", 80);
    utmMedium = optionalString(body.utmMedium, "UTM medium", 80);
    utmCampaign = optionalString(body.utmCampaign, "UTM campaign", 120);
    utmContent = optionalString(body.utmContent, "UTM content", 160);
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  const supabase = createServiceSupabaseClient();
  const token = getBearerToken(request);
  const userResult = token ? await supabase.auth.getUser(token) : null;
  const userId = userResult && !userResult.error ? userResult.data.user?.id ?? null : null;

  const insert = await supabase.from("worldcup_app_views").insert({
    path,
    referrer,
    referral_code: referralCode || null,
    session_id: sessionId,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    user_id: userId,
    user_agent: truncate(request.headers.get("user-agent"), 500),
  });

  if (insert.error) {
    return NextResponse.json({ ok: false, stored: false }, { status: 202 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
