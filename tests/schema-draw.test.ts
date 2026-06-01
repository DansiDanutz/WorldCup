import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildGroupDraw,
  formatGoalDifference,
  getGroupPaths,
  thirdPlaceSlotIncludesGroup,
} from "../src/lib/schema-draw.ts";
import type { WorldCupMatch, WorldCupTeam } from "../src/lib/types.ts";

const teams: WorldCupTeam[] = [
  team("argentina", "Argentina", "A"),
  team("mexico", "Mexico", "A"),
  team("canada", "Canada", "A"),
  team("curacao", "Curacao", "A"),
];

describe("schema draw helpers", () => {
  it("ranks group standings by points, goal difference, goals for, then team name", () => {
    const draw = buildGroupDraw(teams, [
      match(1, "group_stage", "argentina", "mexico", "Argentina", "Mexico", {
        status: "completed",
        homeGoals90: 2,
        awayGoals90: 0,
      }),
      match(2, "group_stage", "canada", "curacao", "Canada", "Curacao", {
        status: "completed",
        homeGoals90: 1,
        awayGoals90: 0,
      }),
      match(3, "group_stage", "argentina", "canada", "Argentina", "Canada", {
        status: "completed",
        homeGoals90: 1,
        awayGoals90: 1,
      }),
      match(4, "group_stage", "mexico", "curacao", "Mexico", "Curacao", {
        status: "completed",
        homeGoals90: 3,
        awayGoals90: 0,
      }),
    ]);

    assert.deepEqual(
      draw[0].teams.map((standing) => standing.team.name),
      ["Argentina", "Canada", "Mexico", "Curacao"],
    );
    assert.deepEqual(
      draw[0].teams.map((standing) => ({
        played: standing.played,
        goalDifference: standing.goalDifference,
        points: standing.points,
      })),
      [
        { played: 2, goalDifference: 2, points: 4 },
        { played: 2, goalDifference: 1, points: 4 },
        { played: 2, goalDifference: 1, points: 3 },
        { played: 2, goalDifference: -4, points: 0 },
      ],
    );
  });

  it("uses goals for and then team name when standings are tied", () => {
    const draw = buildGroupDraw(teams, [
      match(1, "group_stage", "argentina", "mexico", "Argentina", "Mexico", {
        status: "completed",
        homeGoals90: 2,
        awayGoals90: 0,
      }),
      match(2, "group_stage", "canada", "curacao", "Canada", "Curacao", {
        status: "completed",
        homeGoals90: 3,
        awayGoals90: 1,
      }),
    ]);

    assert.deepEqual(
      draw[0].teams.map((standing) => standing.team.name),
      ["Canada", "Argentina", "Curacao", "Mexico"],
    );
  });

  it("falls back to team name when every standing value is tied", () => {
    const draw = buildGroupDraw(teams, []);

    assert.deepEqual(
      draw[0].teams.map((standing) => standing.team.name),
      ["Argentina", "Canada", "Curacao", "Mexico"],
    );
  });

  it("describes winner, runner-up, and third-place knockout paths", () => {
    const paths = getGroupPaths("A", [
      match(73, "round_of_32", null, null, "Group A runners-up", "Group B runners-up"),
      match(
        74,
        "round_of_32",
        null,
        null,
        "Group E winners",
        "Group A/B/C/D/F third place",
      ),
      match(
        79,
        "round_of_32",
        null,
        null,
        "Group A winners",
        "Group C/E/F/H/I third place",
      ),
    ]);

    assert.equal(paths.winner, "Match #79 vs Group C/E/F/H/I third place");
    assert.equal(paths.runnerUp, "Match #73 vs Group B runners-up");
    assert.equal(paths.thirdPlace, "Match #74 vs Group E winners");
  });

  it("detects every group named in combined third-place slots", () => {
    assert.equal(thirdPlaceSlotIncludesGroup("Group A/B/C/D/F third place", "A"), true);
    assert.equal(thirdPlaceSlotIncludesGroup("Group A/B/C/D/F third place", "C"), true);
    assert.equal(thirdPlaceSlotIncludesGroup("Group A/B/C/D/F third place", "F"), true);
    assert.equal(thirdPlaceSlotIncludesGroup("Group A/B/C/D/F third place", "E"), false);
    assert.equal(thirdPlaceSlotIncludesGroup("Group A runners-up", "A"), false);
  });

  it("formats goal difference for the standings table", () => {
    assert.equal(formatGoalDifference(2), "+2");
    assert.equal(formatGoalDifference(0), "0");
    assert.equal(formatGoalDifference(-1), "-1");
  });
});

function team(id: string, name: string, groupCode: string): WorldCupTeam {
  return {
    id,
    name,
    confederation: "UEFA",
    group_code: groupCode,
    winner_odds: null,
    reward_coefficient: "1.00",
  };
}

function match(
  matchNumber: number,
  stageId: string,
  homeTeamId: string | null,
  awayTeamId: string | null,
  homeSlot: string,
  awaySlot: string,
  overrides: {
    status?: WorldCupMatch["status"];
    homeGoals90?: number | null;
    awayGoals90?: number | null;
  } = {},
): WorldCupMatch {
  return {
    id: `match-${matchNumber}`,
    match_number: matchNumber,
    stage_id: stageId,
    group_code: stageId === "group_stage" ? "A" : null,
    match_date: "2026-06-11",
    local_kickoff_time: "19:00",
    kickoff_at: "2026-06-11T19:00:00.000Z",
    result_check_after: "2026-06-11T21:00:00.000Z",
    venue: "Test Stadium",
    city: "Test City",
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    home_slot: homeSlot,
    away_slot: awaySlot,
    status: overrides.status ?? "scheduled",
    finish_method: null,
    home_goals_90: overrides.homeGoals90 ?? null,
    away_goals_90: overrides.awayGoals90 ?? null,
    home_goals_total: null,
    away_goals_total: null,
    home_penalties: null,
    away_penalties: null,
    winner_team_id: null,
    points_applied_at: null,
  };
}
