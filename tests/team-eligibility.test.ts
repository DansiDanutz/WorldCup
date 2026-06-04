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
  it("keeps a team available until one minute before its first group match starts", () => {
    const eligibility = getTeamEligibility(
      ["spain"],
      groupMatches,
      new Date("2026-06-11T18:58:59.000Z").getTime(),
    );

    assert.equal(eligibility.get("spain")?.available, true);
    assert.equal(eligibility.get("spain")?.firstKickoff, new Date(firstKickoff).getTime());
    assert.equal(eligibility.get("spain")?.lockAt, new Date(firstKickoff).getTime() - 60_000);
  });

  it("locks a team exactly one minute before its first group match starts", () => {
    const lockedTeamIds = getLockedTeamIds(
      ["spain"],
      groupMatches,
      new Date(firstKickoff).getTime() - 60_000,
    );

    assert.deepEqual(lockedTeamIds, ["spain"]);
  });

  it("ignores knockout matches when deciding late-pick availability", () => {
    const eligibility = getTeamEligibility(
      ["runner_up"],
      groupMatches,
      new Date("2026-07-01T00:00:00.000Z").getTime(),
    );

    assert.equal(eligibility.get("runner_up")?.available, true);
    assert.equal(eligibility.get("runner_up")?.lockAt, null);
  });

  it("can evaluate multiple selected teams together", () => {
    const lockedTeamIds = getLockedTeamIds(
      ["spain", "cabo_verde"],
      groupMatches,
      new Date("2026-06-11T18:59:00.000Z").getTime(),
    );

    assert.deepEqual(lockedTeamIds, ["spain", "cabo_verde"]);
  });
});
