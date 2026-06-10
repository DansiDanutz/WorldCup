import { NextResponse } from "next/server";

import { enforceGeoEligibility, enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import {
  getPolicyGeoEnv,
  loadOperatorPolicy,
} from "@/lib/operator-policy";
import { isPaidActionLaunchTestAdmin } from "@/lib/paid-action-gates";
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
  NO_TICKET: { status: 403, message: "You need an assigned ticket before entering the prize pool." },
  NO_DRAFT: { status: 400, message: "Pick your 3 teams before locking your entry." },
  ENTRY_ALREADY_LOCKED: { status: 409, message: "You already locked an entry for this tournament." },
  TEAMS_LOCKED: {
    status: 409,
    message: "Your 3 teams are locked and can no longer be changed.",
  },
  TEAM_SELECTION_CLOSED: { status: 403, message: "Team selection is closed." },
  TOURNAMENT_NOT_FOUND: { status: 500, message: "Tournament is not available." },
  INVALID_TEAM_COUNT: { status: 400, message: "Choose exactly 3 different teams." },
};

// "save-draft": keep editable free picks. "commit": lock the 3 teams forever for
// free (no ticket, not in the pool). "lock": consume a ticket and enter the paid
// prize pool / public leaderboard (works from a draft or an already-committed entry).
type EntryAction = "save-draft" | "commit" | "lock";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "entries", { limit: 10, windowMs: 60_000 });
  if (limited) {
    return limited;
  }

  const supabase = createServiceSupabaseClient();

  let displayName: string;
  let teamIds: string[];
  let referralCode: string;
  let referralTermsAccepted: boolean;
  let action: EntryAction;

  try {
    const body = requireObject(await request.json());
    action =
      body.action === "save-draft"
        ? "save-draft"
        : body.action === "commit"
          ? "commit"
          : "lock";
    displayName = requireString(body.displayName, "Display name", { max: 60 });
    teamIds = requireStringArray(body.teamIds, "teamIds");
    // Team ids are slug identifiers; restrict the charset before they are
    // interpolated into the PostgREST `.or()` availability filter below so a
    // crafted id (with `)`/`,`/quotes) cannot manipulate that query.
    if (teamIds.some((id) => !/^[A-Za-z0-9_-]+$/.test(id))) {
      throw new ValidationError("teamIds contains an invalid team identifier.");
    }
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
  const userResult = token ? await supabase.auth.getUser(token) : null;

  if (!userResult?.data.user || userResult.error) {
    return jsonError("Sign in with Google before locking an entry.", 401);
  }

  const user = userResult.data.user;

  if (getAuthProvider(user) !== "google") {
    return jsonError("Only Google sign-in is allowed.", 403);
  }

  if (action === "lock" && !isPaidActionLaunchTestAdmin(user.email)) {
    const operatorPolicy = await loadOperatorPolicy(supabase);
    const geoRestricted = enforceGeoEligibility(request, getPolicyGeoEnv(operatorPolicy));
    if (geoRestricted) {
      return geoRestricted;
    }
  }

  if (referralCode && !referralTermsAccepted) {
    return jsonError("Accept the referral agreement before joining with a referral code.", 400);
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

  // A free (committed) or already-paid (locked) entry has finalized its teams,
  // so buying a ticket to enter the paid pool is allowed any time during the
  // tournament. The team-pick cutoff below only governs still-editable picks.
  let enteringPoolWithLockedTeams = false;
  if (action === "lock") {
    const existingEntry = await supabase
      .from("worldcup_entries")
      .select("status")
      .eq("tournament_id", tournamentResult.data.id)
      .eq("user_id", user.id)
      .maybeSingle();
    enteringPoolWithLockedTeams =
      existingEntry.data?.status === "committed" || existingEntry.data?.status === "locked";
  }

  const lockedTeamIds = getLockedTeamIds(teamIds, groupMatchesResult.data ?? []);

  if (!enteringPoolWithLockedTeams && lockedTeamIds.length > 0) {
    const namesById = new Map((teamsResult.data ?? []).map((team) => [team.id, team.name]));
    const lockedTeamNames = lockedTeamIds.map((teamId) => namesById.get(teamId) ?? teamId);

    return jsonError(
      `${lockedTeamNames.join(", ")} can no longer be selected because the first match starts in less than one minute or already started.`,
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
  } else {
    const savedSignupReferral = await supabase
      .from("worldcup_referral_profiles")
      .select("signup_referral_code,signup_referrer_user_id,signup_referral_accepted_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (savedSignupReferral.error) {
      return jsonError("Could not load saved signup referral.", 500);
    }

    const savedReferrerUserId = savedSignupReferral.data?.signup_referrer_user_id ?? null;
    if (
      savedReferrerUserId &&
      savedReferrerUserId !== user.id &&
      savedSignupReferral.data?.signup_referral_accepted_at
    ) {
      referralCode = normalizeReferralCode(savedSignupReferral.data.signup_referral_code ?? "");
      referrerUserId = savedReferrerUserId;
    }
  }

  const draftResult = await supabase.rpc("worldcup_save_draft_entry", {
    p_user_id: user.id,
    p_tournament_id: tournamentResult.data.id,
    p_display_name: displayName,
    p_team_ids: teamIds,
    p_referral_code: referralCode || null,
    p_referrer_user_id: referrerUserId,
  });

  if (draftResult.error) {
    const code = draftResult.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";

    // Entering the pool ("lock") only consumes a ticket — it does not change
    // teams — so a draft-save rejection because the picks are already final
    // (committed or locked) is expected and we fall through to locking.
    const teamsAlreadyFinal =
      code === "TEAMS_LOCKED" ||
      code === "ENTRY_ALREADY_LOCKED" ||
      draftResult.error.code === "23505";

    if (!(action === "lock" && teamsAlreadyFinal)) {
      const mapped = ENTRY_ERROR_MESSAGES[code];

      if (mapped) {
        return jsonError(mapped.message, mapped.status);
      }

      if (draftResult.error.code === "23505") {
        return jsonError("You already locked an entry for this tournament.", 409);
      }

      if (/first match|second group-stage match/i.test(draftResult.error.message ?? "")) {
        return jsonError(
          "A selected team can no longer be picked; its first match starts in less than one minute or already started.",
          403,
        );
      }

      return jsonError("Could not create entry.", 500);
    }
  }

  if (action === "save-draft") {
    return NextResponse.json({ entryId: draftResult.data, status: "draft" });
  }

  if (action === "commit") {
    const commitResult = await supabase.rpc("worldcup_commit_entry", {
      p_user_id: user.id,
      p_tournament_id: tournamentResult.data.id,
    });

    if (commitResult.error) {
      const code = commitResult.error.message?.match(/[A-Z_]{4,}/)?.[0] ?? "";
      const mapped = ENTRY_ERROR_MESSAGES[code];

      if (mapped) {
        return jsonError(mapped.message, mapped.status);
      }

      if (/first match|second group-stage match/i.test(commitResult.error.message ?? "")) {
        return jsonError(
          "A selected team can no longer be picked; its first match starts in less than one minute or already started.",
          403,
        );
      }

      return jsonError("Could not lock your teams.", 500);
    }

    return NextResponse.json({ entryId: commitResult.data, status: "committed" });
  }

  const entryResult = await supabase.rpc("worldcup_lock_draft_entry", {
    p_user_id: user.id,
    p_tournament_id: tournamentResult.data.id,
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

    if (/first match|second group-stage match/i.test(entryResult.error.message ?? "")) {
      return jsonError(
        "A selected team can no longer be picked; its first match starts in less than one minute or already started.",
        403,
      );
    }

    return jsonError("Could not lock entry.", 500);
  }

  return NextResponse.json({ entryId: entryResult.data, status: "locked" });
}
