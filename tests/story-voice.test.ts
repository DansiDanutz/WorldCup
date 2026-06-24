import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createLegendCardVoiceText,
  elevenLabsBrianVoiceName,
  selectBrowserBrianStoryVoice,
  selectElevenLabsBrianVoice,
  storyVoiceLanguage,
} from "@/lib/story-voice";

type MockVoice = {
  name: string;
  lang: string;
  voiceURI?: string;
  default?: boolean;
};

describe("story voice selection", () => {
  it("uses Brian as the canonical ElevenLabs card voice", () => {
    const brianVoice = {
      name: "Brian - Deep, Resonant and Comforting",
      voice_id: "brian-voice-id",
    };

    const selectedVoice = selectElevenLabsBrianVoice([
      { name: "Daniel", voice_id: "daniel-voice-id" },
      brianVoice,
    ]);

    assert.equal(elevenLabsBrianVoiceName, "Brian");
    assert.equal(selectedVoice, brianVoice);
  });

  it("only allows an English browser voice when it is actually named Brian", () => {
    const brianVoice: MockVoice = {
      name: "Microsoft Brian Online (Natural) - English (United Kingdom)",
      lang: "en-GB",
      voiceURI: "Microsoft Brian Online",
    };

    const selectedVoice = selectBrowserBrianStoryVoice([
      { name: "Google US English", lang: "en-US" },
      { name: "Microsoft Pavel", lang: "ru-RU" },
      brianVoice,
    ]);

    assert.equal(storyVoiceLanguage, "en-GB");
    assert.equal(selectedVoice, brianVoice);
  });

  it("does not substitute random premium English or non-English Brian voices", () => {
    assert.equal(
      selectBrowserBrianStoryVoice([
        { name: "Brian Spanish Test Voice", lang: "es-ES" },
        { name: "Google UK English Male", lang: "en-GB", default: true },
        { name: "Enhanced English Premium", lang: "en-US" },
      ]),
      null,
    );
  });

  it("builds the card narration text shared by ElevenLabs and the Brian fallback", () => {
    assert.equal(
      createLegendCardVoiceText({
        title: "Falconer",
        episode: 9,
        teams: "Qatar vs Ecuador",
        story: "A supporter carries the story through the stadium.",
      }),
      "Falconer. Episode 9. Qatar vs Ecuador. A supporter carries the story through the stadium.",
    );
  });
});
