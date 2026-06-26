import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createLegendCardVoiceText,
  elevenLabsBrianVoiceName,
  getStoryVoiceDisplayName,
  selectElevenLabsBrianVoice,
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

  it("resolves the ElevenLabs Brian voice by leading display name", () => {
    const brianVoice = {
      name: "Brian - Deep, Resonant and Comforting",
      voice_id: "brian-voice-id",
    };
    const selectedVoice = selectElevenLabsBrianVoice([
      { name: "Adam", voice_id: "adam-voice-id" },
      brianVoice,
    ]);

    assert.equal(elevenLabsBrianVoiceName, "Brian");
    assert.equal(selectedVoice, brianVoice);
  });

  it("builds the exact short card text sent to Brian", () => {
    assert.equal(
      createLegendCardVoiceText({
        title: "The Falconer of the Desert",
        episode: 9,
        teams: "Qatar vs Switzerland",
        story: "Above the desert trap, the Falconer reads the wind.",
      }),
      "The Falconer of the Desert. Episode 9. Qatar vs Switzerland. Above the desert trap, the Falconer reads the wind.",
    );
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
