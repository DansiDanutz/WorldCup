import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isSupportedNetwork,
  normalizeNetwork,
  parseDepositAmount,
  subAccountName,
} from "../src/lib/deposits.ts";

describe("deposit helpers", () => {
  it("recognizes supported networks", () => {
    assert.equal(isSupportedNetwork("trc20"), true);
    assert.equal(isSupportedNetwork("erc20"), true);
    assert.equal(isSupportedNetwork("btc"), false);
    assert.equal(isSupportedNetwork(123), false);
  });

  it("normalizes network aliases", () => {
    assert.equal(normalizeNetwork("TRC20"), "trc20");
    assert.equal(normalizeNetwork("tron"), "trc20");
    assert.equal(normalizeNetwork("ethereum"), "erc20");
    assert.equal(normalizeNetwork("eth"), "erc20");
    assert.equal(normalizeNetwork("solana"), null);
  });

  it("parses positive USDT amounts to 8 decimals", () => {
    assert.equal(parseDepositAmount("12.5"), 12.5);
    assert.equal(parseDepositAmount(0.123456789), 0.12345679);
    assert.equal(parseDepositAmount(0), null);
    assert.equal(parseDepositAmount(-5), null);
    assert.equal(parseDepositAmount("abc"), null);
    assert.equal(parseDepositAmount(null), null);
  });

  it("builds a stable, processor-safe sub-account name", () => {
    const name = subAccountName("0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9");
    assert.match(name, /^wc_[a-z0-9]+$/);
    assert.ok(name.length <= 23);
    // Deterministic for the same user.
    assert.equal(name, subAccountName("0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9"));
  });
});
