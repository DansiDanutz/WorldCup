import { NextResponse } from "next/server";

import { enforceRateLimit, jsonError } from "@/lib/http";
import { findLegendCardDefinition } from "@/lib/legend-card-registry";
import {
  createLegendCardVoiceText,
  elevenLabsBrianVoiceName,
  elevenLabsDefaultModel,
  selectElevenLabsBrianVoice,
} from "@/lib/story-voice";
import { requireObject, requireString, ValidationError } from "@/lib/validation";

export const runtime = "nodejs";

const elevenLabsApiBase = "https://api.elevenlabs.io";
const brianVoiceIdEnv = "ELEVENLABS_BRIAN_VOICE_ID";
const voiceIdEnv = "ELEVENLABS_VOICE_ID";
const apiKeyEnv = "ELEVENLABS_API_KEY";
const modelEnv = "ELEVENLABS_MODEL";

type ElevenLabsVoice = {
  name?: string | null;
  voice_id?: string | null;
};

let cachedBrianVoiceId: string | null = null;

function getConfiguredBrianVoiceId() {
  return process.env[brianVoiceIdEnv]?.trim() || process.env[voiceIdEnv]?.trim() || null;
}

function getElevenLabsApiKey() {
  return process.env[apiKeyEnv]?.trim() || null;
}

function getElevenLabsModel() {
  return process.env[modelEnv]?.trim() || elevenLabsDefaultModel;
}

async function resolveBrianVoiceId(apiKey: string) {
  const configuredVoiceId = getConfiguredBrianVoiceId();
  if (configuredVoiceId) {
    return configuredVoiceId;
  }

  if (cachedBrianVoiceId) {
    return cachedBrianVoiceId;
  }

  const response = await fetch(`${elevenLabsApiBase}/v1/voices`, {
    headers: {
      "xi-api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load ElevenLabs voices.");
  }

  const payload = (await response.json()) as { voices?: ElevenLabsVoice[] };
  const brianVoice = selectElevenLabsBrianVoice(payload.voices ?? []);

  if (!brianVoice?.voice_id) {
    throw new Error(`ElevenLabs ${elevenLabsBrianVoiceName} voice was not found for this account.`);
  }

  cachedBrianVoiceId = brianVoice.voice_id;
  return cachedBrianVoiceId;
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "legend-card-elevenlabs-voice", {
    limit: 20,
    windowMs: 60_000,
  });
  if (limited) {
    return limited;
  }

  const apiKey = getElevenLabsApiKey();
  if (!apiKey) {
    return jsonError(`ElevenLabs Brian voice is not configured. Set ${apiKeyEnv} on the server.`, 503);
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

  try {
    const voiceId = await resolveBrianVoiceId(apiKey);
    const response = await fetch(`${elevenLabsApiBase}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: createLegendCardVoiceText(card),
        model_id: getElevenLabsModel(),
        voice_settings: {
          stability: 0.42,
          similarity_boost: 0.85,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("ElevenLabs speech generation failed.");
    }

    const audio = await response.arrayBuffer();

    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "audio/mpeg",
        "X-WorldCup26-Voice": elevenLabsBrianVoiceName,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not play Brian voice.", 502);
  }
}
