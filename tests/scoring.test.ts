import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatCoefficient,
  formatKickoff,
  formatPoints,
  getMatchScore,
  getTeamDisplayName,
  groupStagesById,
  groupTeamsById,
} from "../src/lib/scoring.ts";
import type { WorldCupMatch, WorldCupStage, WorldCupTeam } from "../src/lib/types.ts";

const teams: WorldCupTeam[] = [
  { id: "bra", name: "Brazil", confederation: "CONMEBOL", group_code: "A", winner_odds: "5.0", reward_coefficient: "1.20" },
  { id: "fra", name: "France", confederation: "UEFA", group_code: "B", winner_odds: "6.0", reward_coefficient: "1.30" },
];

const stages: WorldCupStage[] = [
  { id: "group_stage", name: "Group Stage", sort_order: 1, stage_coefficient: "1.00" },
  { id: "final", name: "Final", sort_order: 7, stage_coefficient: "2.00" },
];

const baseMatch: WorldCupMatch = {
  id: "m1",
  match_number: 1,
  stage_id: "group_stage",
  group_code: "A",
  match_date: "2026-06-11",
  local_kickoff_time: "16:00",
  kickoff_at: "2026-06-11T16:00:00Z",
  result_check_after: "2026-06-11T18:00:00Z",
  venue: "Estadio Azteca",
  city: "Mexico City",
  home_team_id: "bra",
  away_team_id: "fra",
  home_slot: "A1",
  away_slot: "A2",
  status: "scheduled",
  finish_method: null,
  home_goals_90: null,
  away_goals_90: null,
  home_goals_total: null,
  away_goals_total: null,
  home_penalties: null,
  away_penalties: null,
  winner_team_id: null,
  points_applied_at: null,
};

function match(overrides: Partial<WorldCupMatch>): WorldCupMatch {
  return { ...baseMatch, ...overrides };
}

describe("scoring display helpers", () => {
  it("indexes teams and stages by id", () => {
    const teamsById = groupTeamsById(teams);
    const stagesById = groupStagesById(stages);

    assert.equal(teamsById.size, 2);
    assert.equal(teamsById.get("bra")?.name, "Brazil");
    assert.equal(stagesById.get("final")?.stage_coefficient, "2.00");
    assert.equal(teamsById.get("missing"), undefined);
  });

  it("formats coefficients and points to two decimals from strings or numbers", () => {
    assert.equal(formatCoefficient("1.5"), "1.50");
    assert.equal(formatCoefficient(2), "2.00");
    assert.equal(formatPoints("3"), "3.00");
    assert.equal(formatPoints(0), "0.00");
  });

  it("formats kickoff as a stable UTC medium date + short time", () => {
    const formatted = formatKickoff("2026-06-11T16:00:00Z");

    assert.match(formatted, /Jun 11, 2026/);
    assert.match(formatted, /\b4:00/); // 16:00 UTC rendered in en short time
  });

  it("resolves team display names with a fallback", () => {
    const teamsById = groupTeamsById(teams);

    assert.equal(getTeamDisplayName("bra", "TBD", teamsById), "Brazil");
    assert.equal(getTeamDisplayName(null, "Winner Match 1", teamsById), "Winner Match 1");
    assert.equal(getTeamDisplayName("unknown", "TBD", teamsById), "TBD");
  });
});

describe("getMatchScore", () => {
  it("returns Scheduled until the match is completed", () => {
    assert.equal(getMatchScore(match({ status: "scheduled" })), "Scheduled");
  });

  it("uses full-time totals when present", () => {
    assert.equal(
      getMatchScore(match({ status: "completed", finish_method: "90", home_goals_total: 2, away_goals_total: 1 })),
      "2-1",
    );
  });

  it("falls back to 90-minute goals when totals are missing", () => {
    assert.equal(
      getMatchScore(match({ status: "completed", finish_method: "90", home_goals_90: 1, away_goals_90: 0 })),
      "1-0",
    );
  });

  it("treats missing totals and 90-minute goals as 0-0", () => {
    assert.equal(getMatchScore(match({ status: "completed", finish_method: "90" })), "0-0");
  });

  it("annotates penalty shootouts (and defaults null penalties to 0)", () => {
    assert.equal(
      getMatchScore(
        match({ status: "completed", finish_method: "penalties", home_goals_total: 1, away_goals_total: 1, home_penalties: 4, away_penalties: 3 }),
      ),
      "1-1 (4-3 pens)",
    );
    assert.equal(
      getMatchScore(match({ status: "completed", finish_method: "penalties", home_goals_total: 2, away_goals_total: 2 })),
      "2-2 (0-0 pens)",
    );
  });

  it("annotates extra-time finishes", () => {
    assert.equal(
      getMatchScore(match({ status: "completed", finish_method: "extra_time", home_goals_total: 3, away_goals_total: 2 })),
      "3-2 AET",
    );
  });
});
