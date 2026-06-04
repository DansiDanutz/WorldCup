import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const adminAuthSource = readFileSync("src/lib/admin-auth.ts", "utf8");
const referralsSource = readFileSync("src/lib/referrals.ts", "utf8");
const ownerAgentMigration = readFileSync(
  "supabase/migrations/20260604101000_worldcup_owner_agent_bootstrap.sql",
  "utf8",
);
const ownerInventoryMigration = readFileSync(
  "supabase/migrations/20260604203000_worldcup_owner_agent_inventory_bootstrap.sql",
  "utf8",
);

describe("owner agent bootstrap", () => {
  it("keeps semebitcoin@gmail.com as the built-in owner admin", () => {
    assert.match(adminAuthSource, /OWNER_ADMIN_EMAIL\s*=\s*"semebitcoin@gmail\.com"/);
  });

  it("promotes the owner profile to an active agent during referral profile sync", () => {
    assert.match(referralsSource, /import \{ getOwnerAdminEmail \} from "@\/lib\/admin-auth"/);
    assert.doesNotMatch(referralsSource, /import \{ OWNER_ADMIN_EMAIL \} from "@\/lib\/admin-auth"/);
    assert.match(referralsSource, /async function ensureOwnerAgent/);
    assert.match(referralsSource, /const ownerAdminEmail = getOwnerAdminEmail\(\)/);
    assert.match(referralsSource, /\.from\("worldcup_agents"\)\s*\.upsert/);
    assert.match(referralsSource, /active:\s*true/);
    assert.match(referralsSource, /created_by:\s*"owner-bootstrap"/);
    assert.match(referralsSource, /onConflict:\s*"tournament_id,user_id"/);
    assert.match(referralsSource, /\.rpc\("worldcup_bootstrap_owner_agent_inventory"/);
    assert.match(referralsSource, /p_owner_email:\s*ownerAdminEmail/);
    assert.match(referralsSource, /p_quantity:\s*1000/);
    assert.match(referralsSource, /await ensureOwnerAgent\(supabase, profile\)/);
  });

  it("backfills an existing owner referral profile as an active agent", () => {
    assert.match(ownerAgentMigration, /insert into public\.worldcup_agents/);
    assert.match(ownerAgentMigration, /join public\.worldcup_referral_profiles p/);
    assert.match(ownerAgentMigration, /lower\(p\.email\)\s*=\s*'semebitcoin@gmail\.com'/);
    assert.match(ownerAgentMigration, /where t\.slug\s*=\s*'fifa-world-cup-2026'/);
    assert.match(ownerAgentMigration, /'owner-bootstrap'/);
    assert.match(ownerAgentMigration, /on conflict \(tournament_id, user_id\)/);
    assert.match(ownerAgentMigration, /active\s*=\s*true/);
  });

  it("bootstraps the owner agent inventory to 999 agent tickets and one user ticket", () => {
    assert.match(
      ownerInventoryMigration,
      /create or replace function public\.worldcup_bootstrap_owner_agent_inventory/,
    );
    assert.match(ownerInventoryMigration, /p_owner_email text default 'semebitcoin@gmail\.com'/);
    assert.match(ownerInventoryMigration, /add column if not exists registered_at timestamptz not null default now\(\)/);
    assert.match(ownerInventoryMigration, /add column if not exists activated_at timestamptz/);
    assert.match(ownerInventoryMigration, /lower\(email\)\s*=\s*lower\(trim\(p_owner_email\)\)/);
    assert.match(ownerInventoryMigration, /insert into public\.worldcup_agents/);
    assert.match(
      ownerInventoryMigration,
      /v_target_paid := case\s+when v_had_personal_ticket then p_quantity\s+else greatest\(p_quantity - 1, 0\)\s+end;/,
    );
    assert.match(
      ownerInventoryMigration,
      /insert into public\.worldcup_tickets \(\s+tournament_id,\s+user_id,\s+price_amount,\s+assigned_by\s+\)/,
    );
    assert.match(ownerInventoryMigration, /v_personal_ticket_assigned := 1;/);
    assert.match(ownerInventoryMigration, /if v_existing_paid > v_target_paid then/);
    assert.match(ownerInventoryMigration, /if v_final_commission > v_target_commission then/);
    assert.match(ownerInventoryMigration, /public\.worldcup_agent_assign_codes/);
    assert.match(
      ownerInventoryMigration,
      /select public\.worldcup_bootstrap_owner_agent_inventory\('semebitcoin@gmail\.com', 1000, 'owner-bootstrap'\);/,
    );
    assert.match(
      ownerInventoryMigration,
      /revoke execute on function public\.worldcup_bootstrap_owner_agent_inventory\(text, integer, text\)\s+from public, anon, authenticated;/,
    );
    assert.match(
      ownerInventoryMigration,
      /grant execute on function public\.worldcup_bootstrap_owner_agent_inventory\(text, integer, text\)\s+to service_role;/,
    );
  });
});
