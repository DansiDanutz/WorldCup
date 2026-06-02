import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  getWithdrawalLimitViolation,
  getWithdrawalRequestLimitConfig,
  isValidWithdrawalAddress,
  normalizeWithdrawalTxHash,
  sumActiveWithdrawalRequestAmounts,
} from "../src/lib/withdrawals.ts";

const migration = readFileSync(
  "supabase/migrations/20260602030000_worldcup_withdrawal_requests.sql",
  "utf8",
);
const userRoute = readFileSync("src/app/api/withdrawals/route.ts", "utf8");
const adminRoute = readFileSync("src/app/api/admin/withdrawals/route.ts", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");

describe("withdrawal helpers", () => {
  it("validates selected-network payout addresses", () => {
    assert.equal(isValidWithdrawalAddress("trc20", "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS"), true);
    assert.equal(isValidWithdrawalAddress("erc20", "0xb72b81cae7d1996114ae21b13b245e686b692ea5"), true);
    assert.equal(isValidWithdrawalAddress("trc20", "0xb72b81cae7d1996114ae21b13b245e686b692ea5"), false);
    assert.equal(isValidWithdrawalAddress("erc20", "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS"), false);
    assert.equal(isValidWithdrawalAddress("trc20", "T000000000000000000000000000000000"), false);
  });

  it("normalizes optional payout transaction hashes by network", () => {
    const hash = "C".repeat(64);

    assert.equal(normalizeWithdrawalTxHash("trc20", hash), hash.toLowerCase());
    assert.equal(normalizeWithdrawalTxHash("erc20", hash), `0x${hash.toLowerCase()}`);
    assert.equal(normalizeWithdrawalTxHash("erc20", `0x${hash}`), `0x${hash.toLowerCase()}`);
    assert.equal(normalizeWithdrawalTxHash("trc20", ""), null);
    assert.equal(normalizeWithdrawalTxHash("erc20", "not-a-hash"), null);
  });

  it("reads optional withdrawal request limits from the environment", () => {
    assert.deepEqual(getWithdrawalRequestLimitConfig({}), {
      maxPerRequestAmount: null,
      maxDailyRequestAmount: null,
    });
    assert.deepEqual(
      getWithdrawalRequestLimitConfig({
        WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT: "100.12345678",
        WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT: "250",
      }),
      {
        maxPerRequestAmount: 100.12345678,
        maxDailyRequestAmount: 250,
      },
    );
  });

  it("detects per-request and rolling daily withdrawal limit violations", () => {
    assert.equal(
      getWithdrawalLimitViolation(101, 0, {
        maxPerRequestAmount: 100,
        maxDailyRequestAmount: null,
      }),
      "Withdrawal requests are limited to 100.00 USDT each.",
    );
    assert.equal(
      getWithdrawalLimitViolation(60, 50, {
        maxPerRequestAmount: null,
        maxDailyRequestAmount: 100,
      }),
      "Withdrawal requests are limited to 100.00 USDT per 24 hours.",
    );
  });

  it("sums active withdrawal requests while excluding rejected requests", () => {
    assert.equal(
      sumActiveWithdrawalRequestAmounts([
        { amount: "10.12345678", status: "submitted" },
        { amount: "4", status: "approved" },
        { amount: "2", status: "paid" },
        { amount: "99", status: "rejected" },
        { amount: "0.100000001", status: "submitted" },
      ]),
      16.22345678,
    );
  });
});

describe("withdrawal workflow contract", () => {
  it("stores owner-readable requests and keeps writes server-admin only", () => {
    assert.match(migration, /worldcup_withdrawal_requests/);
    assert.match(migration, /user_id uuid not null/);
    assert.match(migration, /network text not null check \(network in \('trc20', 'erc20'\)\)/);
    assert.match(migration, /status text not null default 'submitted'/);
    assert.match(migration, /status in \('submitted', 'approved', 'rejected', 'paid'\)/);
    assert.match(migration, /external_tx_hash text/);
    assert.match(migration, /raw jsonb/);
    assert.match(migration, /wallet_transaction_id uuid references public\.worldcup_wallet_transactions/);
    assert.match(migration, /enable row level security/);
    assert.match(migration, /worldcup_withdrawal_requests_owner_read/);
    assert.match(migration, /auth\.uid\(\) = user_id/);
  });

  it("records approved withdrawals through a balance-checked RPC", () => {
    assert.match(migration, /create or replace function public\.worldcup_record_withdrawal/);
    assert.match(migration, /pg_advisory_xact_lock/);
    assert.match(migration, /raise exception 'INSUFFICIENT_FUNDS'/);
    assert.match(migration, /'withdrawal'/);
    assert.match(migration, /revoke execute on function public\.worldcup_record_withdrawal/);
    assert.match(migration, /grant execute on function public\.worldcup_record_withdrawal/);
    assert.match(migration, /to service_role/);
  });

  it("requires signed-in users, geo checks, balance checks, and limits before saving a request", () => {
    assert.match(userRoute, /enforceGeoEligibility/);
    assert.match(userRoute, /Only Google sign-in is allowed/);
    assert.match(userRoute, /loadResponsiblePlayStatus/);
    assert.match(userRoute, /calculateWalletBalance/);
    assert.match(userRoute, /Not enough wallet balance for this withdrawal request/);
    assert.match(userRoute, /loadOperatorPolicy/);
    assert.match(userRoute, /isPaidActionLaunchTestAdmin\(auth\.user\.email\)/);
    assert.match(userRoute, /getUserPaidActionGate\(auth\.supabase, "withdrawal"/);
    assert.match(userRoute, /launch approvals are complete/);
    assert.match(userRoute, /getWithdrawalLimitConfigFromPolicy\(operatorPolicy\)/);
    assert.match(userRoute, /sumActiveWithdrawalRequestAmounts/);
    assert.match(userRoute, /getResponsiblePlayRestriction/);
    assert.match(userRoute, /"withdrawal"/);
    assert.match(userRoute, /worldcup_withdrawal_requests/);
  });

  it("keeps admin approval, rejection, and paid marking state-specific and audited", () => {
    assert.match(adminRoute, /action = requireEnum\(body\.action, "Action", \["list", "approve", "reject", "mark_paid"\]/);
    assert.match(adminRoute, /Admin note is required before approving a withdrawal request/);
    assert.match(adminRoute, /Admin note is required before rejecting a withdrawal request/);
    assert.match(adminRoute, /External transaction hash does not match the withdrawal network/);
    assert.match(adminRoute, /launchEvidence = body\.launchEvidence === true/);
    assert.match(adminRoute, /payoutEvidence/);
    assert.match(adminRoute, /launchReady: launchEvidence/);
    assert.match(adminRoute, /withdrawalId: row\.id/);
    assert.match(adminRoute, /walletTransactionId: row\.wallet_transaction_id/);
    assert.match(adminRoute, /network: row\.network/);
    assert.match(adminRoute, /amount: row\.amount/);
    assert.match(adminRoute, /currency: row\.currency/);
    assert.match(adminRoute, /externalTxHash: normalizedTxHash/);
    assert.match(adminRoute, /\.eq\("status", "submitted"\)/);
    assert.match(adminRoute, /\.rpc\("worldcup_record_withdrawal"/);
    assert.match(adminRoute, /\.eq\("status", "approved"\)/);
    assert.match(adminRoute, /status: "paid"/);
    assert.match(adminRoute, /wallet_transaction_id: record\.data/);
    assert.match(adminRoute, /payoutEvidenceReady/);
  });

  it("surfaces withdrawal requests in the wallet and admin console", () => {
    assert.match(walletScreen, /Withdraw USDT/);
    assert.match(walletScreen, /\/api\/withdrawals/);
    assert.match(walletScreen, /Request Withdrawal/);
    assert.match(walletScreen, /View payout transaction/);
    assert.match(adminConsole, /Withdrawal requests/);
    assert.match(adminConsole, /Load Withdrawals/);
    assert.match(adminConsole, /Mark Paid/);
    assert.match(adminConsole, /\/api\/admin\/withdrawals/);
  });
});
