export const storyVoiceLanguage = "en-GB";
export const elevenLabsBrianVoiceName = "Brian";
export const elevenLabsDefaultModel = "eleven_multilingual_v2";
export const browserStoryVoiceFallbackEnabled =
  process.env.NEXT_PUBLIC_ALLOW_BROWSER_STORY_VOICE_FALLBACK === "true";

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

export function createLegendCardVoiceText(card: {
  title: string;
  episode: number;
  episodeLabel?: string;
  kind?: string;
  teams: string;
  story: string;
  voiceStory?: string;
}) {
  const voiceStoryIntro =
    card.kind === "supporter-card"
      ? "This is a WorldCup26 supporter card story."
      : "This is a WorldCup26 card story.";
  const narration = card.voiceStory
    ? `${voiceStoryIntro} ${card.voiceStory}`
    : card.story;

  return `${card.title}. ${card.episodeLabel ?? `Episode ${card.episode}`}. ${card.teams}. ${narration}`;
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
