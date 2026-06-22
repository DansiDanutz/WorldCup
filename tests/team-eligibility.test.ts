import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getLockedTeamIds, getTeamEligibility } from "../src/lib/team-eligibility.ts";

const firstKickoff = "2026-06-11T19:00:00.000Z";
const secondKickoff = "2026-06-18T19:00:00.000Z";

const groupMatches = [
  {
    stage_id: "group_stage",
    home_team_id: "spain",
    away_team_id: "cabo_verde",
    kickoff_at: firstKickoff,
  },
  {
    stage_id: "group_stage",
    home_team_id: "spain",
    away_team_id: "uruguay",
    kickoff_at: secondKickoff,
  },
  {
    stage_id: "round_of_32",
    home_team_id: "spain",
    away_team_id: "runner_up",
    kickoff_at: "2026-06-29T19:00:00.000Z",
  },
];

describe("team pick eligibility", () => {
  it("keeps a team available and exposes its first group match for scoring context", () => {
    const eligibility = getTeamEligibility(
      ["spain"],
      groupMatches,
    );

    assert.equal(eligibility.get("spain")?.available, true);
    assert.equal(eligibility.get("spain")?.firstKickoff, new Date(firstKickoff).getTime());
    assert.equal(eligibility.get("spain")?.lockAt, null);
  });

  it("does not lock a team after its first group match starts", () => {
    const lockedTeamIds = getLockedTeamIds(
      ["spain"],
      groupMatches,
    );

    assert.deepEqual(lockedTeamIds, []);
  });

  it("ignores knockout matches when surfacing the first group match", () => {
    const eligibility = getTeamEligibility(
      ["runner_up"],
      groupMatches,
    );

    assert.equal(eligibility.get("runner_up")?.available, true);
    assert.equal(eligibility.get("runner_up")?.firstKickoff, null);
    assert.equal(eligibility.get("runner_up")?.lockAt, null);
  });

  it("keeps multiple selected teams available after kickoff", () => {
    const lockedTeamIds = getLockedTeamIds(
      ["spain", "cabo_verde"],
      groupMatches,
    );

    assert.deepEqual(lockedTeamIds, []);
  });
});
