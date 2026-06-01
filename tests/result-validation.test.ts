import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeResultPayload, type ResultMatchContext } from "../src/lib/result-validation.ts";

const context: ResultMatchContext = {
  matchNumber: 1,
  homeTeamId: "home-team",
  awayTeamId: "away-team",
};

describe("normalizeResultPayload", () => {
  it("maps a home winner to the assigned home team", () => {
    const result = normalizeResultPayload(
      {
        finishMethod: "90",
        homeGoals90: 2,
        awayGoals90: 1,
        homeGoalsTotal: 2,
        awayGoalsTotal: 1,
        winner: "home",
      },
      context,
    );

    assert.equal(result.winnerTeamId, "home-team");
    assert.equal(result.homePenalties, null);
    assert.equal(result.awayPenalties, null);
  });

  it("keeps group-stage draws without a winner", () => {
    const result = normalizeResultPayload(
      {
        finishMethod: "90",
        homeGoals90: 1,
        awayGoals90: 1,
        homeGoalsTotal: 1,
        awayGoalsTotal: 1,
        winner: "draw",
      },
      context,
    );

    assert.equal(result.winnerTeamId, null);
  });

  it("uses penalty scores to resolve the winner", () => {
    const result = normalizeResultPayload(
      {
        finishMethod: "penalties",
        homeGoals90: 1,
        awayGoals90: 1,
        homeGoalsTotal: 1,
        awayGoalsTotal: 1,
        homePenalties: 4,
        awayPenalties: 5,
      },
      context,
    );

    assert.equal(result.winnerTeamId, "away-team");
  });

  it("accepts an explicit winnerTeamId when it belongs to the match", () => {
    const result = normalizeResultPayload(
      {
        finishMethod: "extra_time",
        homeGoals90: 1,
        awayGoals90: 1,
        homeGoalsTotal: 2,
        awayGoalsTotal: 1,
        winnerTeamId: "home-team",
      },
      context,
    );

    assert.equal(result.winnerTeamId, "home-team");
  });

  it("rejects a provider winner that conflicts with the score", () => {
    assert.throws(
      () =>
        normalizeResultPayload(
          {
            finishMethod: "90",
            homeGoals90: 2,
            awayGoals90: 0,
            homeGoalsTotal: 2,
            awayGoalsTotal: 0,
            winner: "away",
          },
          context,
        ),
      /winner conflicts with the score/,
    );
  });

  it("rejects penalty results without a shootout winner", () => {
    assert.throws(
      () =>
        normalizeResultPayload(
          {
            finishMethod: "penalties",
            homeGoals90: 1,
            awayGoals90: 1,
            homeGoalsTotal: 1,
            awayGoalsTotal: 1,
            homePenalties: 4,
            awayPenalties: 4,
          },
          context,
        ),
      /Penalty results must include a shootout winner/,
    );
  });

  it("rejects internal winner IDs from outside the match", () => {
    assert.throws(
      () =>
        normalizeResultPayload(
          {
            finishMethod: "90",
            homeGoals90: 0,
            awayGoals90: 1,
            homeGoalsTotal: 0,
            awayGoalsTotal: 1,
            winnerTeamId: "other-team",
          },
          context,
        ),
      /winnerTeamId is not one of the match teams/,
    );
  });

  it("rejects home or away winners before knockout teams are assigned", () => {
    assert.throws(
      () =>
        normalizeResultPayload(
          {
            finishMethod: "90",
            homeGoals90: 2,
            awayGoals90: 1,
            homeGoalsTotal: 2,
            awayGoalsTotal: 1,
            winner: "home",
          },
          { ...context, homeTeamId: null },
        ),
      /Cannot resolve home winner/,
    );
  });
});
