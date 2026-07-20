export const storyVoiceLanguage = "en-GB";
export const elevenLabsBrianVoiceName = "Brian";
export const elevenLabsDefaultModel = "eleven_multilingual_v2";
export const browserStoryVoiceFallbackEnabled =
  process.env.NEXT_PUBLIC_ALLOW_BROWSER_STORY_VOICE_FALLBACK === "true";
export const savedLegendCardVoicePublicDirectory = "/legend-cards/voices";

type StorySpeechVoiceBase = Pick<SpeechSynthesisVoice, "lang" | "name"> &
  Partial<Pick<SpeechSynthesisVoice, "default" | "voiceURI">>;

type ElevenLabsVoiceBase = {
  name?: string | null;
  voice_id?: string | null;
};

const brianVoicePattern = /\bbrian\b/i;
const premiumEnglishVoicePattern = /\b(natural|neural|enhanced|premium)\b/i;
const preferredEnglishFallbacks = [
  "google uk english male",
  "google us english",
  "microsoft",
  "daniel",
  "arthur",
  "oliver",
  "alex",
];

function getVoiceSearchText(voice: StorySpeechVoiceBase) {
  return `${voice.name} ${voice.voiceURI ?? ""}`.toLowerCase();
}

function isEnglishVoice(voice: StorySpeechVoiceBase) {
  return voice.lang.toLowerCase().startsWith("en");
}

function getElevenLabsVoiceName(voice: ElevenLabsVoiceBase) {
  return (voice.name ?? "").trim().toLowerCase();
}

function getElevenLabsVoiceLeadName(voice: ElevenLabsVoiceBase) {
  return getElevenLabsVoiceName(voice).split(/[\s(:-]+/)[0] ?? "";
}

function normalizeVoiceText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getCardKindLabel(kind: string | undefined) {
  if (kind === "did-you-know-short") {
    return "Did You Know short";
  }

  if (kind === "legend-bonus") {
    return "bonus legend";
  }

  return "episode artefact";
}

export function getSavedLegendCardVoiceFileName(cardId: string) {
  const safeId = cardId
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeId || "legend-card"}.mp3`;
}

export function getSavedLegendCardVoicePublicPath(cardId: string) {
  return `${savedLegendCardVoicePublicDirectory}/${getSavedLegendCardVoiceFileName(cardId)}`;
}

export function createLegendCardVoiceText(card: {
  id?: string;
  title: string;
  episode: number;
  episodeLabel?: string;
  kind?: string;
  teams: string;
  story: string;
  voiceStory?: string;
  youtube?: string | null;
}) {
  const kindLabel = getCardKindLabel(card.kind);
  const episodeLabel = card.episodeLabel ?? `Episode ${card.episode}`;
  const coreStory = normalizeVoiceText(card.voiceStory ?? card.story);
  const youtubeStep = card.youtube
    ? "When the voice ends, open the exact YouTube story that revealed this artefact. Return to the album and claim the same card you saw on screen."
    : "When the voice ends, collect this card inside the album and move to the next story.";
  const narration = [
    card.title,
    episodeLabel,
    card.teams,
    `This is a WorldCup26 ${kindLabel}, created as a unique collectible, not a reused reward.`,
    "Look closely at the image before you. The card is the proof of the story, the object the episode leaves behind.",
    coreStory,
    "Hold the name, the colors, and the mystery for a second. This is the moment where a video becomes part of your collection.",
    youtubeStep,
  ];

  return normalizeVoiceText(narration.join(". "));
}

export function selectElevenLabsBrianVoice<TVoice extends ElevenLabsVoiceBase>(voices: readonly TVoice[]) {
  return (
    voices.find((voice) => getElevenLabsVoiceLeadName(voice) === "brian" && Boolean(voice.voice_id)) ??
    voices.find((voice) => brianVoicePattern.test(getElevenLabsVoiceName(voice)) && Boolean(voice.voice_id)) ??
    null
  );
}

export function selectBrowserBrianStoryVoice<TVoice extends StorySpeechVoiceBase>(voices: readonly TVoice[]) {
  if (!browserStoryVoiceFallbackEnabled) {
    return null;
  }

  return voices.find((voice) => isEnglishVoice(voice) && brianVoicePattern.test(getVoiceSearchText(voice))) ?? null;
}

export function selectEnglishStoryVoice<TVoice extends StorySpeechVoiceBase>(
  voices: readonly TVoice[],
) {
  const englishVoices = voices.filter(isEnglishVoice);

  if (englishVoices.length === 0) {
    return null;
  }

  return (
    englishVoices.find((voice) => brianVoicePattern.test(getVoiceSearchText(voice))) ??
    englishVoices.find((voice) => premiumEnglishVoicePattern.test(getVoiceSearchText(voice))) ??
    preferredEnglishFallbacks
      .map((fallback) => englishVoices.find((voice) => getVoiceSearchText(voice).includes(fallback)))
      .find((voice): voice is TVoice => Boolean(voice)) ??
    englishVoices.find((voice) => voice.default) ??
    englishVoices[0] ??
    null
  );
}

export function getStoryVoiceDisplayName(voice: StorySpeechVoiceBase | null) {
  if (!voice) {
    return "English";
  }

  return brianVoicePattern.test(getVoiceSearchText(voice)) ? "Brian" : voice.name;
}
