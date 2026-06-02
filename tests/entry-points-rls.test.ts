import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260602014500_worldcup_entry_points_owner_read.sql",
  "utf8",
);

describe("entry match points owner-read migration", () => {
  it("removes the world-readable select policy", () => {
    assert.match(
      migration,
      /drop policy if exists "worldcup_entry_match_points_read" on public\.worldcup_entry_match_points;/,
    );
    assert.doesNotMatch(migration, /for select\s+to public using \(true\)/);
  });

  it("scopes reads to the owning player via auth.uid()", () => {
    assert.match(migration, /to authenticated/);
    assert.match(migration, /e\.user_id = auth\.uid\(\)/);
  });
});
