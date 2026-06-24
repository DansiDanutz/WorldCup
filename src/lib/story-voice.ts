export const storyVoiceLanguage = "en-GB";
export const elevenLabsBrianVoiceName = "Brian";
export const elevenLabsDefaultModel = "eleven_multilingual_v2";

type StorySpeechVoiceBase = Pick<SpeechSynthesisVoice, "lang" | "name"> &
  Partial<Pick<SpeechSynthesisVoice, "default" | "voiceURI">>;

type ElevenLabsVoiceBase = {
  name?: string | null;
  voice_id?: string | null;
};

type LegendCardVoiceTextSource = {
  title: string;
  episode?: number;
  episodeLabel?: string;
  teams: string;
  story: string;
};

const brianVoicePattern = /\bbrian\b/i;

function getVoiceSearchText(voice: StorySpeechVoiceBase) {
  return (voice.name + " " + (voice.voiceURI ?? "")).toLowerCase();
}

function isEnglishVoice(voice: StorySpeechVoiceBase) {
  return voice.lang.toLowerCase().startsWith("en");
}

function isBrianVoiceName(name: string | null | undefined) {
  return Boolean(name && brianVoicePattern.test(name));
}

export function selectElevenLabsBrianVoice<TVoice extends ElevenLabsVoiceBase>(voices: readonly TVoice[]) {
  return voices.find((voice) => isBrianVoiceName(voice.name)) ?? null;
}

export function selectBrowserBrianStoryVoice<TVoice extends StorySpeechVoiceBase>(voices: readonly TVoice[]) {
  return voices.filter(isEnglishVoice).find((voice) => brianVoicePattern.test(getVoiceSearchText(voice))) ?? null;
}

export function createLegendCardVoiceText(card: LegendCardVoiceTextSource) {
  const episodeLabel = card.episodeLabel ?? (typeof card.episode === "number" ? "Episode " + card.episode : "Legend card");

  return [card.title, episodeLabel, card.teams, card.story].join(". ");
}

export function getStoryVoiceDisplayName(voice: StorySpeechVoiceBase | null) {
  if (!voice) {
    return elevenLabsBrianVoiceName;
  }

  return brianVoicePattern.test(getVoiceSearchText(voice)) ? elevenLabsBrianVoiceName : voice.name;
}
