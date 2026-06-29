import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LEGEND_CARDS } from "@/lib/legend-cards";
import { LEGEND_CARD_DEFINITIONS } from "@/lib/legend-card-registry";
import { createLegendCardVoiceText, getSavedLegendCardVoicePublicPath } from "@/lib/story-voice";
import {
  YOUTUBE_DID_YOU_KNOW_SHORTS,
  YOUTUBE_LEGEND_BONUS_VIDEOS,
  YOUTUBE_LEGEND_EPISODES,
} from "@/lib/youtube-legend-episodes";

describe("Legend card registry", () => {
  it("creates collectible cards for every series video, Did You Know short, and the three bonus videos", () => {
    const episodeCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "episode-special");
    const didYouKnowCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "did-you-know-short");
    const bonusCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "legend-bonus");

    assert.equal(YOUTUBE_LEGEND_BONUS_VIDEOS.length, 4);
    assert.equal(YOUTUBE_LEGEND_BONUS_VIDEOS.filter((video) => video.kind === "series").length, 1);
    assert.equal(YOUTUBE_LEGEND_EPISODES.length, 82);
    assert.equal(YOUTUBE_DID_YOU_KNOW_SHORTS.length, 12);
    assert.equal(episodeCards.length, 83);
    assert.equal(didYouKnowCards.length, 12);
    assert.equal(bonusCards.length, 3);
    assert.equal(LEGEND_CARD_DEFINITIONS.length, 98);
    assert.equal(new Set(LEGEND_CARD_DEFINITIONS.map((card) => card.id)).size, LEGEND_CARD_DEFINITIONS.length);
    assert.equal(LEGEND_CARD_DEFINITIONS.some((card) => String(card.kind) === "supporter-card"), false);
    assert.equal(didYouKnowCards.every((card) => Boolean(card.youtube)), true);
    assert.deepEqual(
      didYouKnowCards.map((card) => card.id).sort(),
      [
        "short-carbajal-five-world-cups",
        "short-castro-one-armed-champion",
        "short-escobar-own-goal",
        "short-gaetjens-vanished",
        "short-garrincha-broken-magic",
        "short-laurent-first-goal",
        "short-milla-corner-flag",
        "short-monti-two-finals",
        "short-pak-secret-hero",
        "short-socrates-sunday",
        "short-tostao-eyes",
        "short-yashin-black-spider",
      ].sort(),
    );
    assert.deepEqual(
      bonusCards.find((card) => card.id === "bonus-world-cup-secrets")?.alternateYoutube,
      ["https://www.youtube.com/watch?v=0oHkstIXqjk"],
    );
    assert.deepEqual(
      bonusCards.map((card) => card.title).sort(),
      ["Luis Diaz", "Lukaku: The Promise", "World Cup Monopoly"].sort(),
    );
  });

  it("gives every collectible card a strong Brian script and saved voice path", () => {
    const voicePaths = new Set<string>();

    for (const card of LEGEND_CARD_DEFINITIONS) {
      const voiceText = createLegendCardVoiceText(card);
      const wordCount = voiceText.split(/\s+/).filter(Boolean).length;
      const voicePath = getSavedLegendCardVoicePublicPath(card.id);

      assert.ok(wordCount >= 75, `${card.id} Brian script is too short`);
      assert.ok(wordCount <= 145, `${card.id} Brian script is too long`);
      assert.match(voicePath, /^\/legend-cards\/voices\/[a-z0-9-]+\.mp3$/);
      voicePaths.add(voicePath);
    }

    assert.equal(voicePaths.size, LEGEND_CARD_DEFINITIONS.length);
  });

  it("does not reuse card art or YouTube unlock sources across collectible cards", () => {
    const youtubeCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.youtube);
    const episodeCards = LEGEND_CARDS.filter((card) => card.kind === "episode-special");
    const longEpisodeCards = episodeCards.filter((card) => (card.episode ?? 999) < 900);
    const didYouKnowCards = LEGEND_CARDS.filter((card) => card.kind === "did-you-know-short");
    const bonusCards = LEGEND_CARDS.filter((card) => card.kind === "legend-bonus");
    const appReadyEpisodeCards = longEpisodeCards.filter((card) =>
      card.image.startsWith("/legend-cards/youtube-rare/"),
    );

    assert.equal(new Set(youtubeCards.map((card) => card.youtube)).size, youtubeCards.length);
    assert.equal(new Set(LEGEND_CARDS.map((card) => card.image)).size, LEGEND_CARDS.length);
    assert.equal(longEpisodeCards.length, YOUTUBE_LEGEND_EPISODES.length);
    assert.equal(appReadyEpisodeCards.length, 82);
    assert.equal(appReadyEpisodeCards.filter((card) => card.image.includes("/cards/")).length, 25);
    assert.equal(appReadyEpisodeCards.filter((card) => card.image.includes("/reveal-frames/")).length, 57);
    assert.equal(longEpisodeCards.every((card) => card.image.startsWith("/legend-cards/youtube-rare/")), true);
    assert.equal(episodeCards.find((card) => card.episode === 83)?.image.includes("ep083-mexico-vs-ecuador"), true);
    assert.equal(episodeCards.find((card) => card.episode === 82)?.image.includes("ep082-france-vs-sweden"), true);
    assert.equal(episodeCards.find((card) => card.episode === 81)?.image.includes("ep081-ivory-coast-vs-norway"), true);
    assert.equal(episodeCards.find((card) => card.episode === 80)?.image.includes("ep080-netherlands-vs-morocco"), true);
    assert.equal(episodeCards.find((card) => card.episode === 1)?.image.includes("/reveal-frames/ep001-"), true);
    assert.equal(episodeCards.find((card) => card.episode === 2)?.image.includes("/reveal-frames/ep002-"), true);
    assert.equal(episodeCards.find((card) => card.episode === 44)?.image.includes("/reveal-frames/ep044-"), true);
    assert.equal(episodeCards.find((card) => card.episode === 36)?.image.includes("/reveal-frames/ep036-"), true);
    assert.equal(episodeCards.find((card) => card.episode === 68)?.image.includes("/reveal-frames/ep068-"), true);
    assert.equal(didYouKnowCards.every((card) => card.image.startsWith("/legend-cards/did-you-know/")), true);
    assert.deepEqual(
      bonusCards.map((card) => card.image).sort(),
      [
        "/legend-cards/bonus/luis-diaz.png",
        "/legend-cards/bonus/lukaku-the-promise.png",
        "/legend-cards/bonus/world-cup-monopoly.png",
      ].sort(),
    );
    assert.equal(LEGEND_CARDS.some((card) => card.image.startsWith("/supporter-cards/")), false);
  });
});
