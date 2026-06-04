import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { filterAndSortTeamsBySearch } from "@/lib/team-search";
import type { WorldCupTeam } from "@/lib/types";

const teams: WorldCupTeam[] = [
  {
    id: "morocco",
    name: "Morocco",
    confederation: "CAF",
    group_code: "C",
    winner_odds: "70/1",
    reward_coefficient: "2.00",
  },
  {
    id: "united-states",
    name: "United States",
    confederation: "Concacaf",
    group_code: "D",
    winner_odds: "45/1",
    reward_coefficient: "1.90",
  },
  {
    id: "canada",
    name: "Canada",
    confederation: "Concacaf",
    group_code: "B",
    winner_odds: "100/1",
    reward_coefficient: "2.10",
  },
  {
    id: "curacao",
    name: "Curacao",
    confederation: "Concacaf",
    group_code: "F",
    winner_odds: "500/1",
    reward_coefficient: "2.50",
  },
  {
    id: "cameroon",
    name: "Cameroon",
    confederation: "CAF",
    group_code: "G",
    winner_odds: "150/1",
    reward_coefficient: "2.30",
  },
];

describe("team search", () => {
  it("treats short searches as country-name searches before confederation matches", () => {
    const result = filterAndSortTeamsBySearch(teams, "Ca").map((team) => team.name);

    assert.deepEqual(result, ["Cameroon", "Canada", "Curacao"]);
    assert.ok(!result.includes("Morocco"));
    assert.ok(!result.includes("United States"));
  });

  it("still supports deliberate confederation and group searches", () => {
    assert.deepEqual(
      filterAndSortTeamsBySearch(teams, "CAF").map((team) => team.name),
      ["Cameroon", "Morocco"],
    );
    assert.deepEqual(
      filterAndSortTeamsBySearch(teams, "Group C").map((team) => team.name),
      ["Morocco"],
    );
  });
});
