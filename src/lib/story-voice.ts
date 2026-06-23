export const storyVoiceLanguage = "en-GB";

type StorySpeechVoiceBase = Pick<SpeechSynthesisVoice, "lang" | "name"> &
  Partial<Pick<SpeechSynthesisVoice, "default" | "voiceURI">>;

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
