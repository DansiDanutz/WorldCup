import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604223000_worldcup_agent_activation_prize_pool.sql",
  "utf8",
);
const feePoolMigration = readFileSync(
  "supabase/migrations/20260604224000_worldcup_fee_pool_referral_tree.sql",
  "utf8",
);
const agentRoute = readFileSync("src/app/api/agent/me/route.ts", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");

describe("agent activation and prize pool funding", () => {
  it("activates an agent account whenever a user receives a personal ticket", () => {
    assert.match(migration, /create or replace function public\.worldcup_ensure_active_agent_for_user/);
    assert.match(migration, /active,\s+activated_at/);
    assert.match(migration, /on conflict \(tournament_id, user_id\)/);
    assert.match(migration, /create trigger worldcup_activate_agent_on_personal_ticket_trg/);
    assert.match(migration, /after insert on public\.worldcup_tickets/);
    assert.match(migration, /ticket_activation_backfill/);
  });

  it("keeps direct wallet purchases eligible for automatic agent activation", () => {
    assert.match(agentRoute, /from\("worldcup_tickets"\)/);
    assert.match(agentRoute, /from\("worldcup_entries"\)/);
    assert.match(agentRoute, /hasPersonalTicket/);
    assert.match(agentRoute, /active: shouldActivate/);
    assert.match(walletScreen, /first personal ticket is bought or assigned/);
  });

  it("adds 80 percent of paid admin-outgoing ticket value to the prize pool", () => {
    assert.match(migration, /create or replace function public\.worldcup_apply_admin_ticket_prize_pool/);
    assert.match(migration, /new\.movement_type not in \('admin_to_agent', 'admin_to_user'\)/);
    assert.match(migration, /coalesce\(new\.total_amount, 0\) \* 0\.80/);
    assert.match(migration, /prize_pool_amount = prize_pool_amount \+ v_prize_contribution/);
    assert.match(migration, /'prizePoolContribution', v_prize_contribution/);
    assert.match(migration, /create trigger worldcup_apply_admin_ticket_prize_pool_trg/);
  });

  it("adds 80 percent of direct wallet ticket purchases to the prize pool", () => {
    assert.match(migration, /new\.assigned_by = 'wallet'/);
    assert.match(migration, /new\.price_amount \* 0\.80/);
  });

  it("splits money-bearing tickets into separate prize-pool and fee-pool ledgers", () => {
    assert.match(feePoolMigration, /add column if not exists fee_pool_amount/);
    assert.match(feePoolMigration, /create table if not exists public\.worldcup_prize_pool_contributions/);
    assert.match(feePoolMigration, /create table if not exists public\.worldcup_fee_pool_contributions/);
    assert.match(feePoolMigration, /source_type in \('wallet_ticket', 'admin_ticket_movement', 'manual'\)/);
    assert.match(feePoolMigration, /v_prize_contribution := round\(\(v_gross_amount \* 0\.80\)::numeric, 2\)/);
    assert.match(feePoolMigration, /v_fee_contribution := round\(\(v_gross_amount - v_prize_contribution\)::numeric, 2\)/);
    assert.match(feePoolMigration, /fee_pool_amount = fee_pool_amount \+ v_fee_contribution/);
    assert.match(feePoolMigration, /'feePoolContribution', v_fee_contribution/);
  });

  it("keeps helper and trigger functions service-role only", () => {
    const signatures = [
      "public.worldcup_ensure_active_agent_for_user(uuid, uuid, text)",
      "public.worldcup_activate_agent_on_personal_ticket()",
      "public.worldcup_apply_admin_ticket_prize_pool()",
    ];

    for (const signature of signatures) {
      const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(migration, new RegExp(`revoke execute on function ${escaped}\\s+from public, anon, authenticated;`));
      assert.match(migration, new RegExp(`grant execute on function ${escaped}\\s+to service_role;`));
    }
  });
});
