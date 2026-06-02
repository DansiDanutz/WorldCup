import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const settlementMigration = readFileSync(
  "supabase/migrations/20260602011000_worldcup_payout_settlement.sql",
  "utf8",
);
const settleRoute = readFileSync("src/app/api/admin/settle-payouts/route.ts", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");

describe("referral payout settlement", () => {
  it("splits winning prizes into winner and inviter wallet credits", () => {
    assert.match(settlementMigration, /payout_type in \('prize', 'referral'\)/);
    assert.match(settlementMigration, /unique \(tournament_id, payout_type, entry_id, user_id\)/);
    assert.match(settlementMigration, /select inviter_user_id, referral_fee_percent/);
    assert.match(settlementMigration, /v_referral_cents := floor\(v_place_cents \* v_fee_percent \/ 100\)/);
    assert.match(settlementMigration, /v_prize_cents := v_place_cents - v_referral_cents/);
    assert.match(settlementMigration, /'referral_payout'/);
    assert.match(settlementMigration, /'Referral share of rank '/);
    assert.match(settlementMigration, /'prize_payout'/);
    assert.match(settlementMigration, /'Prize for rank '/);
    assert.match(settlementMigration, /on conflict \(tournament_id, payout_type, entry_id, user_id\) do nothing/);
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
