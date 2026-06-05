import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { getAuthProvider } from "@/lib/referrals";
import {
  getResponsiblePlayRestriction,
  getSelfExclusionUntil,
  keepLongestSelfExclusion,
  loadResponsiblePlayStatus,
  RESPONSIBLE_PLAY_MAX_ENTRY_LIMIT,
  SELF_EXCLUSION_OPTIONS,
} from "@/lib/responsible-play";
import { createServiceSupabaseClient } from "@/lib/supabase";
import {
  optionalString,
  requireEnum,
  requireInteger,
  requireObject,
  ValidationError,
} from "@/lib/validation";

type SignedInUserResult =
  | { error: NextResponse }
  | {
      supabase: any;
      user: any;
    };

async function getSignedInGoogleUser(request: Request): Promise<SignedInUserResult> {
  const token = getBearerToken(request);

  if (!token) {
    return { error: jsonError("Sign in with Google first.", 401) };
  }

  const supabase = createServiceSupabaseClient();
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

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "responsible-play", {
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const auth = await getSignedInGoogleUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  return getStatusResponse(auth.supabase, auth.user.id);
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "responsible-play", {
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const auth = await getSignedInGoogleUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  let maxEntries: number | null | undefined;
  let requestedSelfExclusionUntil: string | null = null;
  let reason: string | null = null;

  try {
    const body = requireObject(await request.json());

    if ("maxEntries" in body) {
      maxEntries =
        body.maxEntries === null || body.maxEntries === ""
          ? null
          : requireInteger(body.maxEntries, "Entry limit", {
              min: 0,
              max: RESPONSIBLE_PLAY_MAX_ENTRY_LIMIT,
            });
    }

    if (body.selfExclusion !== undefined && body.selfExclusion !== null && body.selfExclusion !== "") {
      const option = requireEnum(body.selfExclusion, "Account pause duration", SELF_EXCLUSION_OPTIONS);
      requestedSelfExclusionUntil = getSelfExclusionUntil(option);
      reason = optionalString(body.reason, "Account pause note", 300);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return jsonError(error.message, 400);
    }

    return jsonError("Invalid request body.", 400);
  }

  if (maxEntries === undefined && !requestedSelfExclusionUntil) {
    return jsonError("Choose an entry limit or an account pause period.", 400);
  }

  const existing = await auth.supabase
    .from("worldcup_responsible_play_settings")
    .select("max_entries,self_excluded_until,self_exclusion_reason")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (existing.error) {
    return jsonError("Could not load account ticket limits.", 500);
  }

  const update: Record<string, unknown> = {
    user_id: auth.user.id,
    updated_at: new Date().toISOString(),
  };

  if (maxEntries !== undefined) {
    update.max_entries = maxEntries;
  } else {
    update.max_entries = existing.data?.max_entries ?? null;
  }

  if (requestedSelfExclusionUntil) {
    update.self_excluded_until = keepLongestSelfExclusion(
      existing.data?.self_excluded_until ?? null,
      requestedSelfExclusionUntil,
    );
    update.self_exclusion_reason = reason ?? existing.data?.self_exclusion_reason ?? null;
  } else {
    update.self_excluded_until = existing.data?.self_excluded_until ?? null;
    update.self_exclusion_reason = existing.data?.self_exclusion_reason ?? null;
  }

  const saved = await auth.supabase
    .from("worldcup_responsible_play_settings")
    .upsert(update, { onConflict: "user_id" })
    .select("user_id")
    .single();

  if (saved.error) {
    return jsonError("Could not save account ticket limits.", 500);
  }

  return getStatusResponse(auth.supabase, auth.user.id);
}

async function getStatusResponse(supabase: any, userId: string) {
  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", "fifa-world-cup-2026")
    .single();

  if (tournament.error || !tournament.data) {
    return jsonError("Tournament is not available.", 500);
  }

  const loaded = await loadResponsiblePlayStatus(supabase, userId, {
    tournamentId: tournament.data.id,
  });

  if ("error" in loaded) {
    return jsonError(loaded.error, 500);
  }

  return NextResponse.json({
    ...loaded.status,
    depositRestriction: getResponsiblePlayRestriction(loaded.status, "deposit"),
    ticketRestriction: getResponsiblePlayRestriction(loaded.status, "ticket"),
    entryRestriction: getResponsiblePlayRestriction(loaded.status, "entry"),
    supportResources: [
      { label: "WorldCup support", url: "https://wa.me/40750257337" },
    ],
  });
}
