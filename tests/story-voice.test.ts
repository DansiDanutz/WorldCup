import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getStoryVoiceDisplayName,
  selectEnglishStoryVoice,
  storyVoiceLanguage,
} from "@/lib/story-voice";

type MockVoice = {
  name: string;
  lang: string;
  voiceURI?: string;
  default?: boolean;
};

describe("story voice selection", () => {
  it("requests English playback and prefers Brian for every story card", () => {
    const brianVoice: MockVoice = {
      name: "Microsoft Brian Online (Natural) - English (United Kingdom)",
      lang: "en-GB",
      voiceURI: "Microsoft Brian Online",
    };
    const selectedVoice = selectEnglishStoryVoice([
      { name: "Google US English", lang: "en-US" },
      { name: "Microsoft Pavel", lang: "ru-RU" },
      brianVoice,
    ]);

    assert.equal(storyVoiceLanguage, "en-GB");
    assert.equal(selectedVoice, brianVoice);
    assert.equal(getStoryVoiceDisplayName(selectedVoice), "Brian");
  });

  it("never selects a non-English voice when matching by name", () => {
    const englishFallback: MockVoice = {
      name: "Google UK English Male",
      lang: "en-GB",
      default: true,
    };
    const selectedVoice = selectEnglishStoryVoice([
      { name: "Brian Spanish Test Voice", lang: "es-ES" },
      englishFallback,
    ]);

    assert.equal(selectedVoice, englishFallback);
    assert.equal(selectedVoice?.lang, "en-GB");
  });

  it("falls back to the browser language request when no English voice is installed", () => {
    assert.equal(
      selectEnglishStoryVoice([
        { name: "Amelie", lang: "fr-FR" },
        { name: "Pavel", lang: "ru-RU" },
      ]),
      null,
    );
    assert.equal(getStoryVoiceDisplayName(null), "English");
  });
});
