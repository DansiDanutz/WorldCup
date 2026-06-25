import { NextResponse } from "next/server";

import { enforceRateLimit, getBearerToken, jsonError } from "@/lib/http";
import { findLegendCardDefinition, type LegendCardDefinition } from "@/lib/legend-card-registry";
import { getAuthProvider } from "@/lib/referrals";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { requireObject, requireString, ValidationError } from "@/lib/validation";

type LegendCardEvent = "pulse_read" | "listened" | "youtube_opened" | "unlocked";

type SignedInUserResult =
  | { error: NextResponse }
  | {
      supabase: ReturnType<typeof createServiceSupabaseClient>;
      user: { id: string };
    };

const progressColumnByEvent = {
  pulse_read: "pulse_read_at",
  listened: "listened_at",
  youtube_opened: "youtube_opened_at",
} as const satisfies Record<Exclude<LegendCardEvent, "unlocked">, string>;

function readLegendCardEvent(value: unknown): LegendCardEvent {
  if (value === undefined || value === null || value === "") {
    return "unlocked";
  }

  if (
    value === "pulse_read" ||
    value === "listened" ||
    value === "youtube_opened" ||
    value === "unlocked"
  ) {
    return value;
  }

  throw new ValidationError("Unsupported Legend card event.");
}

function isMissingProgressTableError(error: { code?: string; message?: string } | null) {
  return Boolean(
    error &&
      (error.code === "42P01" ||
        error.code === "PGRST205" ||
        /worldcup_legend_card_progress|could not find the table/i.test(error.message ?? "")),
  );
}

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
    limit: 120,
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
  let event: LegendCardEvent;

  try {
    const body = requireObject(await request.json());
    cardId = requireString(body.cardId, "Card", { max: 96 });
    event = readLegendCardEvent(body.event);
  } catch (error) {
    return jsonError(error instanceof ValidationError ? error.message : "Invalid request body.", 400);
  }

  const card = findLegendCardDefinition(cardId);

  if (!card) {
    return jsonError("Unknown Legend card.", 404);
  }

  if ((event === "unlocked" || event === "youtube_opened" || event === "pulse_read") && !card.youtube) {
    return jsonError("This Legend card unlocks when its YouTube episode is live.", 409);
  }

  if (event === "pulse_read" && card.kind !== "episode-special") {
    return jsonError("Pulse reads are available for episode story cards.", 409);
  }

  if (event !== "unlocked") {
    const savedProgress = await saveLegendCardProgress(auth.supabase, auth.user.id, card, event);

    if (savedProgress === "error") {
      return jsonError("Could not save Legend card progress.", 500);
    }

    return getLegendCardsResponse(auth.supabase, auth.user.id);
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

  await saveLegendCardProgress(auth.supabase, auth.user.id, card, "youtube_opened");

  return getLegendCardsResponse(auth.supabase, auth.user.id);
}

async function saveLegendCardProgress(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  userId: string,
  card: LegendCardDefinition,
  event: Exclude<LegendCardEvent, "unlocked">,
) {
  const now = new Date().toISOString();
  const saved = await supabase.from("worldcup_legend_card_progress").upsert(
    {
      user_id: userId,
      card_id: card.id,
      episode: card.episode,
      video_url: card.youtube ?? null,
      updated_at: now,
      [progressColumnByEvent[event]]: now,
    },
    { onConflict: "user_id,card_id" },
  );

  if (!saved.error) {
    return "ok";
  }

  return isMissingProgressTableError(saved.error) ? "missing-table" : "error";
}

async function getLegendCardsResponse(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  userId: string,
) {
  const [unlockRows, progressRows] = await Promise.all([
    supabase
      .from("worldcup_legend_card_unlocks")
      .select("card_id,unlocked_at")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: true }),
    supabase
      .from("worldcup_legend_card_progress")
      .select("card_id,pulse_read_at,listened_at,youtube_opened_at")
      .eq("user_id", userId),
  ]);

  if (unlockRows.error) {
    return jsonError("Could not load Legend cards.", 500);
  }

  if (progressRows.error && !isMissingProgressTableError(progressRows.error)) {
    return jsonError("Could not load Legend card progress.", 500);
  }

  const progressData = progressRows.error ? [] : progressRows.data ?? [];

  return NextResponse.json({
    progressSyncAvailable: !progressRows.error,
    unlockedCardIds: (unlockRows.data ?? [])
      .map((row) => row.card_id)
      .filter((cardId) => Boolean(findLegendCardDefinition(cardId))),
    listenedCardIds: progressData
      .filter((row) => row.listened_at)
      .map((row) => row.card_id)
      .filter((cardId) => Boolean(findLegendCardDefinition(cardId))),
    watchedCardIds: progressData
      .filter((row) => row.youtube_opened_at)
      .map((row) => row.card_id)
      .filter((cardId) => Boolean(findLegendCardDefinition(cardId))),
    pulseReadCardIds: progressData
      .filter((row) => row.pulse_read_at)
      .map((row) => row.card_id)
      .filter((cardId) => Boolean(findLegendCardDefinition(cardId))),
  });
}
