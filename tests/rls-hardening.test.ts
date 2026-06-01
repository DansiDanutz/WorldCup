import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260602011500_worldcup_phase0_rls_hardening.sql",
  "utf8",
);

describe("phase 0 RLS hardening migration", () => {
  it("removes direct public entry and referral table access", () => {
    for (const policyName of [
      "worldcup_entries_create",
      "worldcup_entry_teams_create",
      "worldcup_entries_read",
      "worldcup_entry_teams_read",
      "worldcup_referral_profiles_read",
      "worldcup_referrals_read",
    ]) {
      assert.match(migration, new RegExp(`drop policy if exists "${policyName}"`));
    }
  });

  it("limits referral profile access to the authenticated owner", () => {
    assert.match(migration, /to authenticated/);
    assert.match(migration, /auth\.uid\(\) = user_id/);
    assert.doesNotMatch(migration, /using \(true\)/);
    assert.doesNotMatch(migration, /with check \(true\)/);
  });
});
