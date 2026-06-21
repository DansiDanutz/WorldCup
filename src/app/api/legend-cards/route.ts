import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { findLegendCardDefinition } from "@/lib/legend-card-registry";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, requireString, ValidationError } from "@/lib/validation";

type SignedInUserResult =
  | { error: NextResponse }
  | {
      supabase: ReturnType<typeof createServiceSupabaseClient>;
      user: { id: string };
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

  if (getAuthProvider(userResult.data.user) !== "google") {
    return { error: jsonError("Only Google sign-in is allowed.", 403) };
  }

  return { supabase, user: { id: userResult.data.user.id } };
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "legend-cards", {
    limit: 40,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const auth = await getSignedInGoogleUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  return getLegendCardsResponse(auth.supabase, auth.user.id);
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "legend-cards-unlock", {
    limit: 20,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const auth = await getSignedInGoogleUser(request);
  if ("error" in auth) {
    return auth.error;
  }

  let cardId: string;

  try {
    const body = requireObject(await request.json());
    cardId = requireString(body.cardId, "Card", { max: 96 });
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  const card = findLegendCardDefinition(cardId);

  if (!card) {
    return jsonError("Unknown Legend card.", 404);
  }

  if (!card.youtube) {
    return jsonError("This Legend card unlocks when its YouTube episode is live.", 409);
  }

  const now = new Date().toISOString();
  const saved = await auth.supabase.from("worldcup_legend_card_unlocks").upsert(
    {
      user_id: auth.user.id,
      card_id: card.id,
      episode: card.episode,
      unlock_source: "youtube",
      video_url: card.youtube,
      unlocked_at: now,
      updated_at: now,
    },
    { ignoreDuplicates: true, onConflict: "user_id,card_id" },
  );

  if (saved.error) {
    return jsonError("Could not save Legend card.", 500);
  }

  return getLegendCardsResponse(auth.supabase, auth.user.id);
}

async function getLegendCardsResponse(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  userId: string,
) {
  const rows = await supabase
    .from("worldcup_legend_card_unlocks")
    .select("card_id,unlocked_at")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: true });

  if (rows.error) {
    return jsonError("Could not load Legend cards.", 500);
  }

  return NextResponse.json({
    unlockedCardIds: (rows.data ?? [])
      .map((row) => row.card_id)
      .filter((cardId) => Boolean(findLegendCardDefinition(cardId))),
  });
}
