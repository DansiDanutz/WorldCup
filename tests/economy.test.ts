import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateWalletBalance,
  formatLedgerAmount,
  formatMoneyAmount,
  normalizeLedgerAmount,
  normalizeMoneyAmount,
} from "../src/lib/economy.ts";

describe("normalizeMoneyAmount", () => {
  it("rounds amounts to two decimals", () => {
    assert.equal(normalizeMoneyAmount(10.129), 10.13);
  });
});

describe("normalizeLedgerAmount", () => {
  it("rounds ledger amounts to eight decimals", () => {
    assert.equal(normalizeLedgerAmount(10.123456789), 10.12345679);
  });
});

describe("formatMoneyAmount", () => {
  it("formats money amounts with two decimals", () => {
    assert.equal(formatMoneyAmount(250), "250.00");
  });
});

describe("formatLedgerAmount", () => {
  it("keeps meaningful USDT precision without dropping whole-dollar decimals", () => {
    assert.equal(formatLedgerAmount(250), "250.00");
    assert.equal(formatLedgerAmount("0.01000123"), "0.01000123");
  });
});

describe("calculateWalletBalance", () => {
  it("adds incoming amounts and subtracts outgoing amounts", () => {
    assert.equal(
      calculateWalletBalance("user-a", [
        { from_user_id: null, to_user_id: "user-a", amount: 100.12345678 },
        { from_user_id: "user-a", to_user_id: "user-b", amount: 35.5 },
        { from_user_id: "user-c", to_user_id: "user-a", amount: 10 },
      ]),
      74.62345678,
    );
  });
});
