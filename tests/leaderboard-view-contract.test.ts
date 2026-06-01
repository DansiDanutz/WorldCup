import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migrationSql = readFileSync(
  "supabase/migrations/20260601233000_worldcup_leaderboard_pick_totals.sql",
  "utf8",
);

describe("worldcup_awarded_leaderboard contract", () => {
  it("returns selected teams in pick-slot order for stable pick colors", () => {
    assert.match(migrationSql, /jsonb_agg\([\s\S]*order by etp\.pick_slot/);
  });

  it("includes each selected team's awarded point contribution", () => {
    assert.match(migrationSql, /'total_points', etp\.total_points/);
    assert.match(migrationSql, /round\(coalesce\(sum\(emp\.final_points\), 0\), 2\)/);
  });

  it("does not use distinct aggregation that can discard pick ordering", () => {
    assert.doesNotMatch(migrationSql, /jsonb_agg\(\s*distinct/i);
  });
});
