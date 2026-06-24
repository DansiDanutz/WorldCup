import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LEGEND_CARD_DEFINITIONS } from "@/lib/legend-card-registry";
import { YOUTUBE_LEGEND_EPISODES } from "@/lib/youtube-legend-episodes";

describe("Legend card registry", () => {
  it("creates collectible cards for every episode, bonus video, and team supporter prompt", () => {
    const episodeCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "episode-special");
    const supporterCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "supporter-card");
    const bonusCards = LEGEND_CARD_DEFINITIONS.filter((card) => card.kind === "legend-bonus");
    const uniqueEpisodeTeams = new Set(
      YOUTUBE_LEGEND_EPISODES.flatMap((episode) => [episode.home, episode.away]),
    );

    assert.equal(episodeCards.length, 39);
    assert.equal(supporterCards.length, uniqueEpisodeTeams.size * 2);
    assert.equal(supporterCards.length, 96);
    assert.equal(bonusCards.length, 9);
    assert.equal(LEGEND_CARD_DEFINITIONS.length, 144);
    assert.equal(new Set(LEGEND_CARD_DEFINITIONS.map((card) => card.id)).size, LEGEND_CARD_DEFINITIONS.length);
    assert.equal(supporterCards.every((card) => Boolean(card.youtube)), true);
  });
});
