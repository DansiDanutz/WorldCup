import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const adminAuthSource = readFileSync("src/lib/admin-auth.ts", "utf8");
const referralsSource = readFileSync("src/lib/referrals.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/20260604101000_worldcup_owner_agent_bootstrap.sql",
  "utf8",
);

describe("owner agent bootstrap", () => {
  it("keeps semebitcoin@gmail.com as the built-in owner admin", () => {
    assert.match(adminAuthSource, /OWNER_ADMIN_EMAIL\s*=\s*"semebitcoin@gmail\.com"/);
  });

  it("promotes the owner profile to an active agent during referral profile sync", () => {
    assert.match(referralsSource, /import \{ OWNER_ADMIN_EMAIL \} from "@\/lib\/admin-auth"/);
    assert.match(referralsSource, /async function ensureOwnerAgent/);
    assert.match(referralsSource, /\.from\("worldcup_agents"\)\s*\.upsert/);
    assert.match(referralsSource, /active:\s*true/);
    assert.match(referralsSource, /created_by:\s*"owner-bootstrap"/);
    assert.match(referralsSource, /onConflict:\s*"tournament_id,user_id"/);
    assert.match(referralsSource, /await ensureOwnerAgent\(supabase, profile\)/);
  });

  it("backfills an existing owner referral profile as an active agent", () => {
    assert.match(migration, /insert into public\.worldcup_agents/);
    assert.match(migration, /join public\.worldcup_referral_profiles p/);
    assert.match(migration, /lower\(p\.email\)\s*=\s*'semebitcoin@gmail\.com'/);
    assert.match(migration, /where t\.slug\s*=\s*'fifa-world-cup-2026'/);
    assert.match(migration, /'owner-bootstrap'/);
    assert.match(migration, /on conflict \(tournament_id, user_id\)/);
    assert.match(migration, /active\s*=\s*true/);
  });
});
