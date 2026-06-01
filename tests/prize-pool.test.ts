import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateNetPrizePool,
  calculatePaidPlaces,
  formatPrizeAmount,
} from "../src/lib/prize-pool.ts";

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

describe("calculatePaidPlaces", () => {
  it("pays top 10 when there are at least 100 participants", () => {
    assert.equal(calculatePaidPlaces(100), 10);
    assert.equal(calculatePaidPlaces(250), 10);
  });

  it("pays the top 10 percent rounded up for smaller contests", () => {
    assert.equal(calculatePaidPlaces(1), 1);
    assert.equal(calculatePaidPlaces(9), 1);
    assert.equal(calculatePaidPlaces(10), 1);
    assert.equal(calculatePaidPlaces(11), 2);
    assert.equal(calculatePaidPlaces(99), 10);
  });

  it("returns zero before participants join", () => {
    assert.equal(calculatePaidPlaces(0), 0);
  });
});
