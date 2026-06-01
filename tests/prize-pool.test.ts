import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateNetPrizePool,
  calculatePaidPlaces,
  calculatePayoutPlan,
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

describe("calculatePayoutPlan", () => {
  it("splits a large contest prize pool across the weighted top 10", () => {
    const plan = calculatePayoutPlan(1000, 10);

    assert.equal(plan.length, 10);
    assert.equal(plan[0]?.rank, 1);
    assert.equal(plan[0]?.percent, 35);
    assert.equal(plan[0]?.amount, 350);
    assert.equal(plan[9]?.amount, 20);
    assert.equal(plan.reduce((sum, row) => sum + row.amount, 0), 1000);
  });

  it("normalizes the same weighting curve for smaller paid-place counts", () => {
    const plan = calculatePayoutPlan(1000, 2);

    assert.equal(plan.length, 2);
    assert.equal(Number(plan[0]?.percent.toFixed(2)), 63.64);
    assert.equal(Number(plan[1]?.percent.toFixed(2)), 36.36);
    assert.equal(plan.reduce((sum, row) => sum + row.amount, 0), 1000);
  });

  it("returns no payout rows before a prize pool and paid places exist", () => {
    assert.deepEqual(calculatePayoutPlan(0, 10), []);
    assert.deepEqual(calculatePayoutPlan(1000, 0), []);
  });
});
