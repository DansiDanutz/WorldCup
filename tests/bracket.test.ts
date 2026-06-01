import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeBracketAssignments,
  isGroupStageComplete,
  matchThirdPlaceSlots,
  parseSlot,
} from "../src/lib/bracket.ts";
import type { WorldCupMatch, WorldCupTeam } from "../src/lib/types.ts";

let matchCounter = 0;

function team(id: string, groupCode: string | null): WorldCupTeam {
  return {
    id,
    name: id,
    confederation: "UEFA",
    group_code: groupCode,
    winner_odds: null,
    reward_coefficient: "1.00",
  };
}

function match(overrides: Partial<WorldCupMatch> & Pick<WorldCupMatch, "stage_id" | "home_slot" | "away_slot">): WorldCupMatch {
  matchCounter += 1;

  return {
    id: `m-${overrides.match_number ?? matchCounter}`,
    match_number: overrides.match_number ?? matchCounter,
    stage_id: overrides.stage_id,
    group_code: overrides.group_code ?? null,
    match_date: "2026-06-11",
    local_kickoff_time: "19:00",
    kickoff_at: "2026-06-11T19:00:00.000Z",
    result_check_after: "2026-06-11T21:00:00.000Z",
    venue: "Test Stadium",
    city: "Test City",
    home_team_id: overrides.home_team_id ?? null,
    away_team_id: overrides.away_team_id ?? null,
    home_slot: overrides.home_slot,
    away_slot: overrides.away_slot,
    status: overrides.status ?? "scheduled",
    finish_method: overrides.finish_method ?? null,
    home_goals_90: overrides.home_goals_90 ?? null,
    away_goals_90: overrides.away_goals_90 ?? null,
    home_goals_total: overrides.home_goals_total ?? null,
    away_goals_total: overrides.away_goals_total ?? null,
    home_penalties: overrides.home_penalties ?? null,
    away_penalties: overrides.away_penalties ?? null,
    winner_team_id: overrides.winner_team_id ?? null,
    points_applied_at: null,
  };
}

// Builds a completed round-robin where earlier teams beat later teams, so the
// final standings equal the supplied order (winner, runner-up, third, fourth).
function roundRobin(group: string, ordered: string[]): WorldCupMatch[] {
  const matches: WorldCupMatch[] = [];

  for (let i = 0; i < ordered.length; i += 1) {
    for (let j = i + 1; j < ordered.length; j += 1) {
      matches.push(
        match({
          stage_id: "group_stage",
          group_code: group,
          home_slot: ordered[i],
          away_slot: ordered[j],
          home_team_id: ordered[i],
          away_team_id: ordered[j],
          status: "completed",
          home_goals_90: 1,
          away_goals_90: 0,
        }),
      );
    }
  }

  return matches;
}

describe("parseSlot", () => {
  it("parses every knockout slot shape", () => {
    assert.deepEqual(parseSlot("Group A winners"), { kind: "group_winner", group: "A" });
    assert.deepEqual(parseSlot("Group H runners-up"), { kind: "group_runner_up", group: "H" });
    assert.deepEqual(parseSlot("Group A/B/C/D/F third place"), {
      kind: "group_third",
      groups: ["A", "B", "C", "D", "F"],
    });
    assert.deepEqual(parseSlot("Winner Match 74"), { kind: "match_winner", matchNumber: 74 });
    assert.deepEqual(parseSlot("Loser Match 101"), { kind: "match_loser", matchNumber: 101 });
    assert.deepEqual(parseSlot("Some other team"), { kind: "unknown" });
  });
});

describe("matchThirdPlaceSlots", () => {
  it("finds a perfect matching honoring each slot's candidate groups", () => {
    const assignment = matchThirdPlaceSlots(
      [
        { key: "s1", groups: ["A", "B", "C"] },
        { key: "s2", groups: ["B", "C"] },
        { key: "s3", groups: ["A"] },
      ],
      ["A", "B", "C"],
    );

    assert.ok(assignment);
    assert.equal(assignment.size, 3);
    assert.equal(assignment.get("s3"), "A");
    // Every assigned group is distinct and within the slot candidate set.
    const used = new Set(assignment.values());
    assert.equal(used.size, 3);
    assert.deepEqual([...used].sort(), ["A", "B", "C"]);
  });

  it("returns null when no valid assignment exists", () => {
    const assignment = matchThirdPlaceSlots(
      [
        { key: "s1", groups: ["A"] },
        { key: "s2", groups: ["A"] },
      ],
      ["A", "B"],
    );

    assert.equal(assignment, null);
  });
});

describe("computeBracketAssignments", () => {
  it("does not resolve group slots until the group is complete", () => {
    const teams = [team("A1", "A"), team("A2", "A"), team("A3", "A"), team("A4", "A")];
    const matches = [
      match({ stage_id: "round_of_32", home_slot: "Group A winners", away_slot: "Group A runners-up" }),
    ];

    assert.deepEqual(computeBracketAssignments(teams, matches), []);
  });

  it("resolves group winners and runners-up once the group finishes", () => {
    const teams = [team("A1", "A"), team("A2", "A"), team("A3", "A"), team("A4", "A")];
    const knockout = match({
      match_number: 200,
      stage_id: "round_of_32",
      home_slot: "Group A winners",
      away_slot: "Group A runners-up",
    });
    const matches = [...roundRobin("A", ["A1", "A2", "A3", "A4"]), knockout];

    const assignments = computeBracketAssignments(teams, matches);

    assert.equal(assignments.length, 1);
    assert.equal(assignments[0].matchId, knockout.id);
    assert.equal(assignments[0].homeTeamId, "A1");
    assert.equal(assignments[0].awayTeamId, "A2");
  });

  it("resolves winner and loser of a completed knockout match", () => {
    const teams = [team("X", null), team("Y", null)];
    const feeder = match({
      match_number: 300,
      stage_id: "round_of_32",
      home_slot: "X",
      away_slot: "Y",
      home_team_id: "X",
      away_team_id: "Y",
      status: "completed",
      winner_team_id: "X",
    });
    const downstream = match({
      match_number: 301,
      stage_id: "round_of_16",
      home_slot: "Winner Match 300",
      away_slot: "Loser Match 300",
    });

    const assignments = computeBracketAssignments(teams, [feeder, downstream]);
    const update = assignments.find((entry) => entry.matchId === downstream.id);

    assert.ok(update);
    assert.equal(update.homeTeamId, "X");
    assert.equal(update.awayTeamId, "Y");
  });

  it("never overwrites a side that is already assigned", () => {
    const teams = [team("A1", "A"), team("A2", "A"), team("A3", "A"), team("A4", "A")];
    const knockout = match({
      match_number: 200,
      stage_id: "round_of_32",
      home_slot: "Group A winners",
      away_slot: "Group A runners-up",
      home_team_id: "A1", // already filled
    });
    const matches = [...roundRobin("A", ["A1", "A2", "A3", "A4"]), knockout];

    const assignments = computeBracketAssignments(teams, matches);

    assert.equal(assignments.length, 1);
    assert.equal(assignments[0].homeTeamId, undefined);
    assert.equal(assignments[0].awayTeamId, "A2");
  });

  it("allocates best third-placed teams across candidate slots once all groups finish", () => {
    const teams = ["A", "B", "C"].flatMap((group) =>
      [1, 2, 3, 4].map((n) => team(`${group}${n}`, group)),
    );
    const groupMatches = [
      ...roundRobin("A", ["A1", "A2", "A3", "A4"]),
      ...roundRobin("B", ["B1", "B2", "B3", "B4"]),
      ...roundRobin("C", ["C1", "C2", "C3", "C4"]),
    ];
    const thirdMatches = [
      match({ match_number: 400, stage_id: "round_of_32", home_slot: "Group A winners", away_slot: "Group A/B/C third place" }),
      match({ match_number: 401, stage_id: "round_of_32", home_slot: "Group B winners", away_slot: "Group B/C third place" }),
      match({ match_number: 402, stage_id: "round_of_32", home_slot: "Group C winners", away_slot: "Group A third place" }),
    ];
    const matches = [...groupMatches, ...thirdMatches];

    assert.equal(isGroupStageComplete(teams, matches), true);

    const assignments = computeBracketAssignments(teams, matches);
    const byMatch = new Map(assignments.map((entry) => [entry.matchId, entry]));

    // The single-candidate slot must take group A's third-placed team (A3).
    assert.equal(byMatch.get("m-402")?.awayTeamId, "A3");

    // Every third-place award is one of the qualifying third-placed teams and
    // all three are distinct.
    const thirds = [
      byMatch.get("m-400")?.awayTeamId,
      byMatch.get("m-401")?.awayTeamId,
      byMatch.get("m-402")?.awayTeamId,
    ];
    assert.deepEqual([...thirds].sort(), ["A3", "B3", "C3"]);
  });
});
