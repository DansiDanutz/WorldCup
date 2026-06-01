import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculateWalletBalance, formatMoneyAmount, normalizeMoneyAmount } from "../src/lib/economy.ts";

describe("normalizeMoneyAmount", () => {
  it("rounds amounts to two decimals", () => {
    assert.equal(normalizeMoneyAmount(10.129), 10.13);
  });
});

describe("formatMoneyAmount", () => {
  it("formats money amounts with two decimals", () => {
    assert.equal(formatMoneyAmount(250), "250.00");
  });
});

describe("calculateWalletBalance", () => {
  it("adds incoming amounts and subtracts outgoing amounts", () => {
    assert.equal(
      calculateWalletBalance("user-a", [
        { from_user_id: null, to_user_id: "user-a", amount: 100 },
        { from_user_id: "user-a", to_user_id: "user-b", amount: 35.5 },
        { from_user_id: "user-c", to_user_id: "user-a", amount: 10 },
      ]),
      74.5,
    );
  });
});
