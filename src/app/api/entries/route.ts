import { NextResponse } from "next/server";

import { isConsentCurrent } from "@/lib/consent";
import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider, normalizeReferralCode } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getLockedTeamIds } from "@/lib/team-eligibility";
import {
  requireObject,
  requireString,
  requireStringArray,
  ValidationError,
} from "@/lib/validation";

const ENTRY_ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  NO_TICKET: { status: 403, message: "You need an assigned ticket before entering the game." },
  TEAM_SELECTION_CLOSED: { status: 403, message: "Team selection is closed." },
  TOURNAMENT_NOT_FOUND: { status: 500, message: "Tournament is not available." },
  INVALID_TEAM_COUNT: { status: 400, message: "Choose exactly 3 different teams." },
};

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "entries", { limit: 10, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  let displayName: string;
  let teamIds: string[];
  let referralCode: string;
  let referralTermsAccepted: boolean;

  try {
    const body = requireObject(await request.json());
    displayName = requireString(body.displayName, "Display name", { max: 60 });
    teamIds = requireStringArray(body.teamIds, "teamIds");
    referralCode = normalizeReferralCode(typeof body.referralCode === "string" ? body.referralCode : "");
    referralTermsAccepted = body.referralTermsAccepted === true;
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  if (new Set(teamIds).size !== 3) {
    return jsonError("Choose exactly 3 different teams.", 400);
  }

  const token = getBearerToken(request);
  const supabase = createServiceSupabaseClient();
  const userResult = token ? await supabase.auth.getUser(token) : null;

  if (!userResult?.data.user || userResult.error) {
    return jsonError("Sign in with Google before locking an entry.", 401);
  }

  const user = userResult.data.user;

  if (getAuthProvider(user) !== "google") {
    return jsonError("Only Google sign-in is allowed.", 403);
  }

  if (referralCode && !referralTermsAccepted) {
    return jsonError("Accept the referral agreement before joining with a referral code.", 400);
  }

  const consentResult = await supabase
    .from("worldcup_consent")
    .select("age_confirmed,terms_version")
    .eq("user_id", user.id)
    .maybeSingle();

  if (consentResult.error) {
    return jsonError("Could not verify consent.", 500);
  }

  if (!isConsentCurrent(consentResult.data)) {
    return jsonError("Confirm your age and accept the Terms before entering.", 403);
  }

  const [tournamentResult, teamsResult, groupMatchesResult] = await Promise.all([
    supabase.from("worldcup_tournaments").select("id,status").eq("slug", "fifa-world-cup-2026").single(),
    supabase.from("worldcup_teams").select("id,name").in("id", teamIds),
    supabase
      .from("worldcup_matches")
      .select("home_team_id,away_team_id,kickoff_at")
      .eq("stage_id", "group_stage")
      .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`),
  ]);

  if (tournamentResult.error || !tournamentResult.data) {
    return jsonError("Tournament is not available.", 500);
  }

  if (teamsResult.error || !teamsResult.data || teamsResult.data.length !== 3) {
    return jsonError("Choose exactly 3 valid teams.", 400);
  }

  if (groupMatchesResult.error) {
    return jsonError("Could not check team availability.", 500);
  }

  const lockedTeamIds = getLockedTeamIds(teamIds, groupMatchesResult.data ?? []);

  if (lockedTeamIds.length > 0) {
    const namesById = new Map((teamsResult.data ?? []).map((team) => [team.id, team.name]));
    const lockedTeamNames = lockedTeamIds.map((teamId) => namesById.get(teamId) ?? teamId);

    return jsonError(
      `${lockedTeamNames.join(", ")} can no longer be selected because the second group match has started.`,
      403,
    );
  }

  let referrerUserId: string | null = null;

  if (referralCode) {
    const referralProfile = await supabase
      .from("worldcup_referral_profiles")
      .select("user_id")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (referralProfile.error || !referralProfile.data) {
      return jsonError("Referral code is not valid.", 400);
    }

    if (referralProfile.data.user_id === user.id) {
      return jsonError("You cannot use your own referral code.", 400);
    }

    referrerUserId = referralProfile.data.user_id;
  }

  const entryResult = await supabase.rpc("worldcup_create_entry", {
    p_user_id: user.id,
    p_tournament_id: tournamentResult.data.id,
    p_display_name: displayName,
    p_team_ids: teamIds,
    p_referral_code: referralCode || null,
    p_referrer_user_id: referrerUserId,
  });

  if (entryResult.error) {
    const code = entryResult.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
    const mapped = ENTRY_ERROR_MESSAGES[code];

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    if (entryResult.error.code === "23505") {
      return jsonError("You already locked an entry for this tournament.", 409);
    }

    if (/second group-stage match/i.test(entryResult.error.message ?? "")) {
      return jsonError("A selected team can no longer be picked; its second group match has started.", 403);
    }

    return jsonError("Could not create entry.", 500);
  }

  return NextResponse.json({ entryId: entryResult.data });
}
