import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getYoutubeEpisodeForMatch } from "@/lib/match-youtube";

describe("match YouTube episode lookup", () => {
  it("matches channel episodes across team aliases and reversed title order", () => {
    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "brazil",
        awayTeamId: "norway",
        homeName: "Brazil",
        awayName: "Norway",
      })?.youtube,
      "https://www.youtube.com/watch?v=4hufXmyJzn0",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "united_states",
        awayTeamId: "bosnia_herzegovina",
        homeName: "United States",
        awayName: "Bosnia and Herzegovina",
      })?.youtube,
      "https://www.youtube.com/watch?v=DJX6iFxc_8g",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "england",
        awayTeamId: "congo_dr",
        homeName: "England",
        awayName: "Congo DR",
      })?.youtube,
      "https://www.youtube.com/watch?v=qND33AsNhr0",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "argentina",
        awayTeamId: "cabo_verde",
        homeName: "Argentina",
        awayName: "Cabo Verde",
      })?.youtube,
      "https://www.youtube.com/watch?v=g7P084bvJHQ",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "mexico",
        awayTeamId: "england",
        homeName: "Mexico",
        awayName: "England",
      })?.youtube,
      "https://www.youtube.com/watch?v=cbbX6EJ6S_w",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "united_states",
        awayTeamId: "belgium",
        homeName: "United States",
        awayName: "Belgium",
      })?.youtube,
      "https://www.youtube.com/watch?v=MuGCI3AI7Rs",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "switzerland",
        awayTeamId: "colombia",
        homeName: "Switzerland",
        awayName: "Colombia",
      })?.youtube,
      "https://www.youtube.com/watch?v=wzCu-vitgeM",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "spain",
        awayTeamId: "belgium",
        homeName: "Spain",
        awayName: "Belgium",
      })?.youtube,
      "https://www.youtube.com/watch?v=rcDLZV_hhWs",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "france",
        awayTeamId: "morocco",
        homeName: "France",
        awayName: "Morocco",
      })?.youtube,
      "https://www.youtube.com/watch?v=w1GZnvQgw_0",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "norway",
        awayTeamId: "england",
        homeName: "Norway",
        awayName: "England",
      })?.youtube,
      "https://www.youtube.com/watch?v=04MKt0r5UXw",
    );

    assert.equal(
      getYoutubeEpisodeForMatch({
        homeTeamId: "argentina",
        awayTeamId: "switzerland",
        homeName: "Argentina",
        awayName: "Switzerland",
      })?.youtube,
      "https://www.youtube.com/watch?v=QXIKEV5qxYo",
    );
  });
});
