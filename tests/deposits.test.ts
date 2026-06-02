import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getDepositClaimLimitConfig,
  getDepositClaimLimitViolation,
  getConfiguredMainDepositAddresses,
  normalizeDepositAddress,
  getDepositExplorerAddressUrl,
  getDepositExplorerTxUrl,
  isSupportedNetwork,
  normalizeNetwork,
  normalizeDepositTxHash,
  parseDepositAmount,
  subAccountName,
  sumActiveDepositClaimAmounts,
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
    assert.equal(parseDepositAmount(" 0.01000123 "), 0.01000123);
    assert.equal(parseDepositAmount(".5"), 0.5);
    assert.equal(parseDepositAmount(0.123456789), 0.12345679);
    assert.equal(parseDepositAmount(0), null);
    assert.equal(parseDepositAmount(-5), null);
    assert.equal(parseDepositAmount("abc"), null);
    assert.equal(parseDepositAmount(null), null);
  });

  it("rejects ambiguous or over-precise USDT amount strings", () => {
    assert.equal(parseDepositAmount("1e2"), null);
    assert.equal(parseDepositAmount("0x10"), null);
    assert.equal(parseDepositAmount("0.123456789"), null);
    assert.equal(parseDepositAmount("0.000000001"), null);
    assert.equal(parseDepositAmount("12."), null);
  });

  it("builds a stable, processor-safe sub-account name", () => {
    const name = subAccountName("0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9");
    assert.match(name, /^wc_[a-z0-9]+$/);
    assert.ok(name.length <= 23);
    // Deterministic for the same user.
    assert.equal(name, subAccountName("0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9"));
  });

  it("reads optional deposit claim limits from the environment", () => {
    assert.deepEqual(getDepositClaimLimitConfig({}), {
      maxPerClaimAmount: null,
      maxDailyClaimAmount: null,
    });
    assert.deepEqual(
      getDepositClaimLimitConfig({
        WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT: "100.12345678",
        WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT: "250",
      }),
      {
        maxPerClaimAmount: 100.12345678,
        maxDailyClaimAmount: 250,
      },
    );
    assert.deepEqual(
      getDepositClaimLimitConfig({
        WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT: "1e4",
        WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT: "abc",
      }),
      {
        maxPerClaimAmount: null,
        maxDailyClaimAmount: null,
      },
    );
  });

  it("detects per-claim and daily deposit claim limit violations", () => {
    assert.equal(
      getDepositClaimLimitViolation(101, 0, {
        maxPerClaimAmount: 100,
        maxDailyClaimAmount: null,
      }),
      "Deposit claim exceeds the per-claim limit of 100.00 USDT.",
    );
    assert.equal(
      getDepositClaimLimitViolation(60, 50, {
        maxPerClaimAmount: null,
        maxDailyClaimAmount: 100,
      }),
      "Deposit claim exceeds the 24-hour limit of 100.00 USDT.",
    );
    assert.equal(
      getDepositClaimLimitViolation(40, 50, {
        maxPerClaimAmount: 100,
        maxDailyClaimAmount: 100,
      }),
      null,
    );
  });

  it("sums active deposit claims while excluding rejected claims", () => {
    assert.equal(
      sumActiveDepositClaimAmounts([
        { amount: "10.12345678", status: "submitted" },
        { amount: "4", status: "processing" },
        { amount: "99", status: "rejected" },
        { amount: "0.100000001", status: "credited" },
        { amount: "bad", status: "submitted" },
      ]),
      14.22345678,
    );
  });

  it("returns shared main receive addresses only when both networks are configured", () => {
    const addresses = getConfiguredMainDepositAddresses({
      KUCOIN_MAIN_USDT_TRC20_ADDRESS: "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS",
      KUCOIN_MAIN_USDT_ERC20_ADDRESS: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
    });

    assert.deepEqual(
      addresses.map((address) => ({
        network: address.network,
        address: address.address,
        qrCodePath: address.qrCodePath,
        shared: address.shared,
      })),
      [
        {
          network: "trc20",
          address: "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS",
          qrCodePath: "/usdt-trc20-address-qr.svg",
          shared: true,
        },
        {
          network: "erc20",
          address: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
          qrCodePath: "/usdt-erc20-address-qr.svg",
          shared: true,
        },
      ],
    );
  });

  it("does not expose partial or placeholder main receive addresses", () => {
    assert.deepEqual(
      getConfiguredMainDepositAddresses({
        KUCOIN_MAIN_USDT_TRC20_ADDRESS: "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS",
      }),
      [],
    );
    assert.deepEqual(
      getConfiguredMainDepositAddresses({
        KUCOIN_MAIN_USDT_TRC20_ADDRESS: "replace-with-trc20-address",
        KUCOIN_MAIN_USDT_ERC20_ADDRESS: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
      }),
      [],
    );
  });

  it("validates network-specific receive addresses", () => {
    assert.equal(
      normalizeDepositAddress("trc20", "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS"),
      "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS",
    );
    assert.equal(
      normalizeDepositAddress("erc20", "0xb72b81cae7d1996114ae21b13b245e686b692ea5"),
      "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
    );
    assert.equal(normalizeDepositAddress("trc20", "0xb72b81cae7d1996114ae21b13b245e686b692ea5"), null);
    assert.equal(normalizeDepositAddress("erc20", "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS"), null);
    assert.equal(normalizeDepositAddress("trc20", "T000000000000000000000000000000000"), null);
    assert.equal(normalizeDepositAddress("erc20", "0xnot-an-address"), null);
  });

  it("does not expose malformed shared main receive addresses", () => {
    assert.deepEqual(
      getConfiguredMainDepositAddresses({
        KUCOIN_MAIN_USDT_TRC20_ADDRESS: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
        KUCOIN_MAIN_USDT_ERC20_ADDRESS: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
      }),
      [],
    );
  });

  it("normalizes network-specific transaction hashes", () => {
    const hash = "A".repeat(64);

    assert.equal(normalizeDepositTxHash("trc20", hash), hash.toLowerCase());
    assert.equal(normalizeDepositTxHash("trc20", `0x${hash}`), hash.toLowerCase());
    assert.equal(normalizeDepositTxHash("erc20", hash), `0x${hash.toLowerCase()}`);
    assert.equal(normalizeDepositTxHash("erc20", `0x${hash}`), `0x${hash.toLowerCase()}`);
    assert.equal(normalizeDepositTxHash("trc20", "not-a-hash"), null);
    assert.equal(normalizeDepositTxHash("erc20", "not-a-hash"), null);
  });

  it("builds network-specific explorer links", () => {
    const hash = "a".repeat(64);

    assert.equal(
      getDepositExplorerTxUrl("trc20", hash),
      `https://tronscan.org/#/transaction/${hash}`,
    );
    assert.equal(
      getDepositExplorerTxUrl("erc20", hash),
      `https://etherscan.io/tx/0x${hash}`,
    );
    assert.equal(
      getDepositExplorerAddressUrl("trc20", "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS"),
      "https://tronscan.org/#/address/TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS",
    );
    assert.equal(
      getDepositExplorerAddressUrl("erc20", "0xb72b81cae7d1996114ae21b13b245e686b692ea5"),
      "https://etherscan.io/address/0xb72b81cae7d1996114ae21b13b245e686b692ea5",
    );
    assert.equal(getDepositExplorerTxUrl("solana", hash), null);
    assert.equal(getDepositExplorerTxUrl("erc20", "not-a-hash"), null);
  });
});
