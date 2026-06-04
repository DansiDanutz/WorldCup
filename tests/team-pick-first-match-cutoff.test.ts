import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604170000_worldcup_team_pick_first_match_cutoff.sql",
  "utf8",
);

describe("team pick first-match cutoff migration", () => {
  it("recreates the pick trigger for the first group match minus one minute", () => {
    assert.match(migration, /create or replace function public\.worldcup_assert_team_pick_is_open\(\)/);
    assert.match(migration, /order by m\.kickoff_at\s+limit 1;/);
    assert.match(migration, /pick_lock_at := first_group_kickoff - interval '1 minute';/);
    assert.match(migration, /now\(\) >= pick_lock_at/);
    assert.match(migration, /first match starts in less than one minute or already started/);
  });

  it("keeps the trigger function search path pinned", () => {
    assert.match(
      migration,
      /alter function public\.worldcup_assert_team_pick_is_open\(\)\s+set search_path = public;/,
    );
  });
});
