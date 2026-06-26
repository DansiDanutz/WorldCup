import assert from "node:assert/strict";
import { describe, it } from "node:test";

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
    assert.equal(YOUTUBE_DID_YOU_KNOW_SHORTS.length, 7);
    assert.equal(episodeCards.length, 71);
    assert.equal(supporterCards.length, uniqueEpisodeTeams.size * 2);
    assert.equal(supporterCards.length, 96);
    assert.equal(didYouKnowCards.length, 7);
    assert.equal(bonusCards.length, 3);
    assert.equal(LEGEND_CARD_DEFINITIONS.length, 177);
    assert.equal(new Set(LEGEND_CARD_DEFINITIONS.map((card) => card.id)).size, LEGEND_CARD_DEFINITIONS.length);
    assert.equal(supporterCards.every((card) => Boolean(card.youtube)), true);
    assert.equal(didYouKnowCards.filter((card) => Boolean(card.youtube)).length, 1);
    assert.deepEqual(
      bonusCards.find((card) => card.id === "bonus-world-cup-secrets")?.alternateYoutube,
      ["https://www.youtube.com/watch?v=0oHkstIXqjk"],
    );
    assert.deepEqual(
      bonusCards.map((card) => card.title).sort(),
      ["Luis Diaz", "Lukaku: The Promise", "World Cup Monopoly"].sort(),
    );
  });
});
