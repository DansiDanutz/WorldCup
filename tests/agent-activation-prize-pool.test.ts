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
const adminOutgoingPoolMigration = readFileSync(
  "supabase/migrations/20260605030000_worldcup_admin_outgoing_bonus_pool_accounting.sql",
  "utf8",
);
const adminOnlyTicketingMigration = readFileSync(
  "supabase/migrations/20260605052000_worldcup_admin_only_money_ticketing.sql",
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

  it("keeps personal tickets eligible for automatic agent activation", () => {
    assert.match(agentRoute, /from\("worldcup_tickets"\)/);
    assert.match(agentRoute, /from\("worldcup_entries"\)/);
    assert.match(agentRoute, /hasPersonalTicket/);
    assert.match(agentRoute, /active: shouldActivate/);
    assert.match(walletScreen, /first personal ticket is assigned/);
  });

  it("adds 80 percent of every admin-outgoing ticket value to the prize pool", () => {
    assert.match(adminOutgoingPoolMigration, /create or replace function public\.worldcup_admin_ticket_movement_value/);
    assert.match(adminOutgoingPoolMigration, /v_commission_text text := coalesce\(v_metadata ->> 'commissionAwarded', ''\)/);
    assert.match(adminOutgoingPoolMigration, /'bonusQuantity', v_bonus_quantity/);
    assert.match(adminOutgoingPoolMigration, /'accountedQuantity', v_paid_quantity \+ v_bonus_quantity/);
    assert.match(adminOutgoingPoolMigration, /'accountedGrossAmount', v_accounted_gross_amount/);
    assert.match(adminOutgoingPoolMigration, /v_gross_amount := \(v_accounting ->> 'accountedGrossAmount'\)::numeric/);
    assert.match(adminOutgoingPoolMigration, /v_prize_contribution := round\(\(v_gross_amount \* 0\.80\)::numeric, 2\)/);
    assert.match(adminOutgoingPoolMigration, /'accountingPolicy', 'all_admin_outgoing_codes'/);
  });

  it("does not fund the prize pool from direct wallet ticket purchases", () => {
    assert.match(adminOnlyTicketingMigration, /create or replace function public\.worldcup_activate_agent_on_personal_ticket/);
    assert.match(adminOnlyTicketingMigration, /worldcup_ensure_active_agent_for_user/);
    assert.doesNotMatch(adminOnlyTicketingMigration, /new\.assigned_by = 'wallet'/);
    assert.doesNotMatch(adminOnlyTicketingMigration, /wallet_ticket/);
  });

  it("splits money-bearing tickets into separate prize-pool and fee-pool ledgers", () => {
    assert.match(feePoolMigration, /add column if not exists fee_pool_amount/);
    assert.match(feePoolMigration, /create table if not exists public\.worldcup_prize_pool_contributions/);
    assert.match(feePoolMigration, /create table if not exists public\.worldcup_fee_pool_contributions/);
    assert.match(feePoolMigration, /create table if not exists public\.worldcup_prize_pool_contributions/);
    assert.match(feePoolMigration, /v_prize_contribution := round\(\(v_gross_amount \* 0\.80\)::numeric, 2\)/);
    assert.match(feePoolMigration, /v_fee_contribution := round\(\(v_gross_amount - v_prize_contribution\)::numeric, 2\)/);
    assert.match(feePoolMigration, /fee_pool_amount = fee_pool_amount \+ v_fee_contribution/);
    assert.match(feePoolMigration, /'feePoolContribution', v_fee_contribution/);
    assert.match(adminOutgoingPoolMigration, /insert into public\.worldcup_fee_pool_contributions/);
    assert.match(adminOutgoingPoolMigration, /'feePoolContribution', v_fee_contribution/);
  });

  it("keeps helper and trigger functions service-role only", () => {
    const signatures = [
      "public.worldcup_ensure_active_agent_for_user(uuid, uuid, text)",
      "public.worldcup_activate_agent_on_personal_ticket()",
      "public.worldcup_apply_admin_ticket_prize_pool()",
      "public.worldcup_admin_ticket_movement_value(integer, numeric, numeric, jsonb)",
    ];

    for (const signature of signatures) {
      const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const source = signature.includes("worldcup_admin_ticket_movement_value")
        ? adminOutgoingPoolMigration
        : `${migration}\n${adminOutgoingPoolMigration}`;
      assert.match(source, new RegExp(`revoke execute on function ${escaped}\\s+from public, anon, authenticated;`));
      assert.match(source, new RegExp(`grant execute on function ${escaped}\\s+to service_role;`));
    }
  });
});
