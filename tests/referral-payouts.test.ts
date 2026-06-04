import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const settlementMigration = readFileSync(
  "supabase/migrations/20260604224000_worldcup_fee_pool_referral_tree.sql",
  "utf8",
);
const settleRoute = readFileSync("src/app/api/admin/settle-payouts/route.ts", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");

describe("referral payout settlement", () => {
  it("settles top 10 prizes from the already-net prize pool", () => {
    assert.match(settlementMigration, /p_payout_type not in \('prize', 'referral'\)/);
    assert.match(settlementMigration, /on conflict \(tournament_id, payout_type, entry_id, user_id\) do nothing/);
    assert.match(settlementMigration, /select status, prize_pool_amount/);
    assert.match(settlementMigration, /v_net_cents := round\(v_gross \* 100\)/);
    assert.match(settlementMigration, /v_paid_places := least\(10, array_length\(v_weights, 1\), v_participants\)/);
    assert.match(settlementMigration, /v_prize_cents := v_place_cents - v_direct_referral_cents/);
    assert.match(settlementMigration, /'prize_payout'/);
    assert.match(settlementMigration, /'Prize for rank '/);
    assert.match(settlementMigration, /on conflict \(tournament_id, payout_type, entry_id, user_id\) do nothing/);
  });

  it("cascades referral payouts upward with a 10 USDT minimum payout", () => {
    assert.match(settlementMigration, /v_min_referral_payout_cents bigint := 1000/);
    assert.match(settlementMigration, /select inviter_user_id, referral_fee_percent/);
    assert.match(settlementMigration, /v_direct_referral_cents := floor\(/);
    assert.match(settlementMigration, /coalesce\(nullif\(v_direct_fee_percent, 0\), 5\) \/ 100/);
    assert.match(settlementMigration, /v_pass_up_cents := floor\(v_current_referral_cents \* 5 \/ 100\)/);
    assert.match(settlementMigration, /if v_pass_up_cents < v_min_referral_payout_cents then/);
    assert.match(settlementMigration, /v_current_payout_cents := v_current_referral_cents - v_pass_up_cents/);
    assert.match(settlementMigration, /invited_user_id = v_current_user_id/);
    assert.match(settlementMigration, /v_level <= 20/);
    assert.match(settlementMigration, /'referral_payout'/);
    assert.match(settlementMigration, /'Referral level ' \|\| v_level \|\| ' share of rank '/);
  });

  it("returns settlement payout rows for admin audit", () => {
    assert.match(settleRoute, /requireAdmin/);
    assert.match(settleRoute, /worldcup_settle_payouts/);
    assert.match(settleRoute, /payout_type,rank,user_id,amount/);
    assert.match(settleRoute, /created: settle\.data \?\? 0/);
    assert.match(settleRoute, /payouts: payouts\.data \?\? \[\]/);
  });

  it("surfaces settled prize and referral rows in the admin console", () => {
    assert.match(adminConsole, /type SettlementPayoutRow/);
    assert.match(adminConsole, /settlementPayouts/);
    assert.match(adminConsole, /setSettlementPayouts\(result\.payouts \?\? \[\]\)/);
    assert.match(adminConsole, /Audit rows: \$\{/);
    assert.match(adminConsole, /Settlement payout audit rows/);
    assert.match(adminConsole, /Referral payout/);
    assert.match(adminConsole, /Prize payout/);
    assert.match(adminConsole, /USDT wallet credit/);
  });
});
