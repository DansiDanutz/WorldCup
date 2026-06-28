import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LEGEND_CARDS } from "@/lib/legend-cards";
import { LEGEND_CARD_DEFINITIONS } from "@/lib/legend-card-registry";
import {
  YOUTUBE_DID_YOU_KNOW_SHORTS,
  YOUTUBE_LEGEND_BONUS_VIDEOS,
  YOUTUBE_LEGEND_EPISODES,
} from "@/lib/youtube-legend-episodes";

describe("Legend card registry", () => {
  it("creates collectible cards for every series video, Did You Know short, the three bonus videos, and team supporter prompt", () => {
    const episodeCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "episode-special");
    const supporterCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "supporter-card");
    const didYouKnowCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "did-you-know-short");
    const bonusCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "legend-bonus");
    const uniqueEpisodeTeams = new Set(
      YOUTUBE_LEGEND_EPISODES.flatMap((episode) => [episode.home, episode.away]),
    );

    assert.equal(YOUTUBE_LEGEND_BONUS_VIDEOS.length, 4);
    assert.equal(YOUTUBE_LEGEND_BONUS_VIDEOS.filter((video) => video.kind === "series").length, 1);
    assert.equal(YOUTUBE_LEGEND_EPISODES.length, 68);
    assert.equal(YOUTUBE_DID_YOU_KNOW_SHORTS.length, 4);
    assert.equal(episodeCards.length, 69);
    assert.equal(supporterCards.length, uniqueEpisodeTeams.size);
    assert.equal(supporterCards.length, 48);
    assert.equal(didYouKnowCards.length, 4);
    assert.equal(bonusCards.length, 3);
    assert.equal(LEGEND_CARD_DEFINITIONS.length, 124);
    assert.equal(new Set(LEGEND_CARD_DEFINITIONS.map((card) => card.id)).size, LEGEND_CARD_DEFINITIONS.length);
    assert.equal(supporterCards.every((card) => card.youtube === null), true);
    assert.equal(didYouKnowCards.every((card) => Boolean(card.youtube)), true);
    assert.deepEqual(
      didYouKnowCards.map((card) => card.id).sort(),
      [
        "short-carbajal-five-world-cups",
        "short-gaetjens-vanished",
        "short-garrincha-broken-magic",
        "short-socrates-sunday",
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

  it("does not reuse card art or YouTube unlock sources across collectible cards", () => {
    const youtubeCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.youtube);

    assert.equal(new Set(youtubeCards.map((card) => card.youtube)).size, youtubeCards.length);
    assert.equal(new Set(LEGEND_CARDS.map((card) => card.image)).size, LEGEND_CARDS.length);

    const supporterImages = LEGEND_CARDS.filter((card) => card.kind === "supporter-card").map((card) => card.image);

    assert.equal(supporterImages.length, 48);
    assert.equal(new Set(supporterImages).size, supporterImages.length);
  });
});
