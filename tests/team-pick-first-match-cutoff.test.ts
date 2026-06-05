import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604170000_worldcup_team_pick_first_match_cutoff.sql",
  "utf8",
);
const lateEntryMigration = readFileSync(
  "supabase/migrations/20260605023000_worldcup_late_entry_in_progress.sql",
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

  it("keeps assigned-ticket entries open while the tournament is in progress", () => {
    assert.match(lateEntryMigration, /create or replace function public\.worldcup_create_entry/);
    assert.match(lateEntryMigration, /v_status not in \('setup', 'open', 'in_progress'\)/);
    assert.match(lateEntryMigration, /v_effective_referral_code := nullif\(p_referral_code, ''\)/);
    assert.match(lateEntryMigration, /source_referrer_user_id/);
    assert.match(lateEntryMigration, /grant execute on function public\.worldcup_create_entry/);
  });
});
