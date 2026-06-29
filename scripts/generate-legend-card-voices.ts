import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { LEGEND_CARD_DEFINITIONS } from "@/lib/legend-card-registry";
import {
  createLegendCardVoiceText,
  elevenLabsDefaultModel,
  getSavedLegendCardVoiceFileName,
  selectElevenLabsBrianVoice,
} from "@/lib/story-voice";

const elevenLabsApiBase = "https://api.elevenlabs.io";
const outputDirectory = path.join(process.cwd(), "public", "legend-cards", "voices");

type ElevenLabsVoice = {
  name?: string | null;
  voice_id?: string | null;
};

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  const getValue = (flag: string) => {
    const index = process.argv.indexOf(flag);
    return index >= 0 ? process.argv[index + 1] : undefined;
  };

  return {
    force: args.has("--force"),
    dryRun: args.has("--dry-run"),
    cardId: getValue("--card"),
    limit: Number.parseInt(getValue("--limit") ?? "", 10),
  };
}

function getElevenLabsApiKey() {
  return process.env.ELEVENLABS_API_KEY?.trim() || null;
}

function getConfiguredBrianVoiceId() {
  return process.env.ELEVENLABS_BRIAN_VOICE_ID?.trim() || process.env.ELEVENLABS_VOICE_ID?.trim() || null;
}

function getElevenLabsModel() {
  return process.env.ELEVENLABS_MODEL?.trim() || elevenLabsDefaultModel;
}

async function resolveBrianVoiceId(apiKey: string) {
  const configuredVoiceId = getConfiguredBrianVoiceId();

  if (configuredVoiceId) {
    return configuredVoiceId;
  }

  const response = await fetch(`${elevenLabsApiBase}/v1/voices`, {
    headers: {
      "xi-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Could not load ElevenLabs voices: ${response.status}`);
  }

  const payload = (await response.json()) as { voices?: ElevenLabsVoice[] };
  const brianVoice = selectElevenLabsBrianVoice(payload.voices ?? []);

  if (!brianVoice?.voice_id) {
    throw new Error("ElevenLabs Brian voice was not found for this account.");
  }

  return brianVoice.voice_id;
}

async function fileExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function generateVoice(apiKey: string, voiceId: string, text: string) {
  const response = await fetch(`${elevenLabsApiBase}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
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
    const message = await response.text().catch(() => "");
    throw new Error(`ElevenLabs generation failed: ${response.status} ${message}`.trim());
  }

  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const options = parseArgs();
  const apiKey = getElevenLabsApiKey();

  if (!apiKey && !options.dryRun) {
    throw new Error("Set ELEVENLABS_API_KEY before generating saved Legend card voices.");
  }

  const cards = LEGEND_CARD_DEFINITIONS.filter((card) => !options.cardId || card.id === options.cardId).slice(
    0,
    Number.isFinite(options.limit) ? options.limit : undefined,
  );

  if (cards.length === 0) {
    throw new Error(options.cardId ? `Unknown card id: ${options.cardId}` : "No Legend cards found.");
  }

  await mkdir(outputDirectory, { recursive: true });
  const voiceId = apiKey && !options.dryRun ? await resolveBrianVoiceId(apiKey) : "dry-run";

  for (const card of cards) {
    const fileName = getSavedLegendCardVoiceFileName(card.id);
    const filePath = path.join(outputDirectory, fileName);
    const text = createLegendCardVoiceText(card);
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (!options.force && (await fileExists(filePath))) {
      console.log(`skip ${card.id} (${wordCount} words)`);
      continue;
    }

    if (options.dryRun) {
      console.log(`dry-run ${card.id} -> ${fileName} (${wordCount} words)`);
      continue;
    }

    const audio = await generateVoice(apiKey!, voiceId, text);
    await writeFile(filePath, audio);
    console.log(`wrote ${fileName} (${wordCount} words, ${audio.byteLength} bytes)`);
  }
}

await main();
