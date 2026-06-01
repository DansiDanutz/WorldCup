import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculateNetPrizePool, formatPrizeAmount } from "../src/lib/prize-pool.ts";

describe("calculateNetPrizePool", () => {
  it("subtracts the configured fee percent from the gross amount", () => {
    assert.equal(calculateNetPrizePool(1000, 20), 800);
  });

  it("returns zero when the amount is not set", () => {
    assert.equal(calculateNetPrizePool(null), 0);
    assert.equal(calculateNetPrizePool(0), 0);
  });
});

describe("formatPrizeAmount", () => {
  it("formats prize amounts without decimals", () => {
    assert.equal(formatPrizeAmount(12500), "12,500");
  });
});
