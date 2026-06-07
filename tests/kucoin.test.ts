import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";

import {
  encryptPassphrase,
  findMatchingMainDeposit,
  getKucoinConfig,
  getKucoinDepositExternalId,
  getKucoinMainDepositExternalId,
  getKucoinMainDepositTxHash,
  getKucoinMainConfig,
  listBrokerDeposits,
  listMainAccountDeposits,
  signBrokerPartner,
  signKucoinPayload,
  type KucoinConfig,
} from "../src/lib/kucoin.ts";

const REQUIRED_ENV = {
  KUCOIN_API_KEY: "api-key",
  KUCOIN_API_SECRET: "api-secret",
  KUCOIN_API_PASSPHRASE: "passphrase",
  KUCOIN_BROKER_NAME: "broker-name",
  KUCOIN_BROKER_KEY: "broker-key",
};

const ENV_KEYS = [
  ...Object.keys(REQUIRED_ENV),
  "KUCOIN_BROKER_API_BASE",
  "KUCOIN_MAIN_API_BASE",
  "KUCOIN_MAIN_API_KEY",
  "KUCOIN_MAIN_API_SECRET",
  "KUCOIN_MAIN_API_PASSPHRASE",
  "KUCOIN_API_BASE",
] as const;

function withKucoinEnv<T>(env: Record<string, string | undefined>, run: () => T): T {
  const previous = new Map<string, string | undefined>();
  for (const key of ENV_KEYS) {
    previous.set(key, process.env[key]);
    delete process.env[key];
  }

  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }

  try {
    return run();
  } finally {
    for (const key of ENV_KEYS) {
      const value = previous.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function kucoinConfig(overrides: Partial<KucoinConfig> = {}): KucoinConfig {
  return {
    baseUrl: "https://api-broker.kucoin.com",
    apiKey: "api-key",
    apiSecret: "api-secret",
    apiPassphrase: "passphrase",
    brokerName: "broker-name",
    brokerKey: "broker-key",
    ...overrides,
  };
}

describe("KuCoin request signing", () => {
  it("signs the documented prehash: timestamp + METHOD + endpoint + body", () => {
    const secret = "test-secret";
    const ts = "1700000000000";
    const endpoint = "/api/v1/broker/nd/deposit/address?currency=USDT&chain=trc20";
    const expected = createHmac("sha256", secret).update(`${ts}GET${endpoint}`).digest("base64");

    assert.equal(signKucoinPayload(secret, ts, "GET", endpoint, ""), expected);
  });

  it("includes the body in the POST signature", () => {
    const secret = "s";
    const ts = "123";
    const body = JSON.stringify({ accountName: "wc_abc" });
    const expected = createHmac("sha256", secret)
      .update(`${ts}POST/api/v1/broker/nd/account${body}`)
      .digest("base64");

    assert.equal(signKucoinPayload(secret, ts, "POST", "/api/v1/broker/nd/account", body), expected);
  });

  it("uppercases the method", () => {
    const secret = "s";
    assert.equal(
      signKucoinPayload(secret, "1", "get", "/x", ""),
      signKucoinPayload(secret, "1", "GET", "/x", ""),
    );
  });

  it("encrypts the passphrase with the api secret", () => {
    const secret = "s";
    const passphrase = "pass";
    const expected = createHmac("sha256", secret).update(passphrase).digest("base64");

    assert.equal(encryptPassphrase(secret, passphrase), expected);
  });

  it("signs the broker partner header: timestamp + brokerName + apiKey", () => {
    const brokerKey = "broker-key";
    const ts = "1700000000000";
    const expected = createHmac("sha256", brokerKey).update(`${ts}WCBrokerapikey`).digest("base64");

    assert.equal(signBrokerPartner(brokerKey, ts, "WCBroker", "apikey"), expected);
  });
});

describe("KuCoin config", () => {
  it("uses the broker REST host by default", () => {
    const config = withKucoinEnv(REQUIRED_ENV, () => getKucoinConfig());

    assert.equal(config?.baseUrl, "https://api-broker.kucoin.com");
  });

  it("does not treat placeholder credentials as configured", () => {
    const config = withKucoinEnv(
      {
        KUCOIN_API_KEY: "replace-with-kucoin-api-key",
        KUCOIN_API_SECRET: "replace-with-kucoin-api-secret",
        KUCOIN_API_PASSPHRASE: "replace-with-kucoin-api-passphrase",
        KUCOIN_BROKER_NAME: "replace-with-kucoin-broker-name",
        KUCOIN_BROKER_KEY: "replace-with-kucoin-broker-key",
      },
      () => getKucoinConfig(),
    );

    assert.equal(config, null);
  });

  it("trims required credential values", () => {
    const config = withKucoinEnv(
      {
        KUCOIN_API_KEY: " api-key ",
        KUCOIN_API_SECRET: " api-secret ",
        KUCOIN_API_PASSPHRASE: " passphrase ",
        KUCOIN_BROKER_NAME: " broker-name ",
        KUCOIN_BROKER_KEY: " broker-key ",
      },
      () => getKucoinConfig(),
    );

    assert.equal(config?.apiKey, "api-key");
    assert.equal(config?.apiSecret, "api-secret");
    assert.equal(config?.apiPassphrase, "passphrase");
    assert.equal(config?.brokerName, "broker-name");
    assert.equal(config?.brokerKey, "broker-key");
  });

  it("maps the old spot API default to the broker host", () => {
    const config = withKucoinEnv(
      { ...REQUIRED_ENV, KUCOIN_API_BASE: "https://api.kucoin.com" },
      () => getKucoinConfig(),
    );

    assert.equal(config?.baseUrl, "https://api-broker.kucoin.com");
  });

  it("honors an explicit broker API base and trims trailing slashes", () => {
    const config = withKucoinEnv(
      { ...REQUIRED_ENV, KUCOIN_BROKER_API_BASE: "https://broker-gateway.example.test/" },
      () => getKucoinConfig(),
    );

    assert.equal(config?.baseUrl, "https://broker-gateway.example.test");
  });

  it("builds a main-account config without broker-only credentials", () => {
    const config = withKucoinEnv(
      {
        KUCOIN_API_KEY: " api-key ",
        KUCOIN_API_SECRET: " api-secret ",
        KUCOIN_API_PASSPHRASE: " passphrase ",
      },
      () => getKucoinMainConfig(),
    );

    assert.equal(config?.baseUrl, "https://api.kucoin.com");
    assert.equal(config?.apiKey, "api-key");
    assert.equal(config?.apiSecret, "api-secret");
    assert.equal(config?.apiPassphrase, "passphrase");
  });

  it("keeps broker API base out of the main-account config", () => {
    const config = withKucoinEnv(
      {
        KUCOIN_API_KEY: "api-key",
        KUCOIN_API_SECRET: "api-secret",
        KUCOIN_API_PASSPHRASE: "passphrase",
        KUCOIN_API_BASE: "https://api-broker.kucoin.com",
      },
      () => getKucoinMainConfig(),
    );

    assert.equal(config?.baseUrl, "https://api.kucoin.com");
  });

  it("prefers dedicated main-account credentials when present", () => {
    const config = withKucoinEnv(
      {
        KUCOIN_API_KEY: "broker-api-key",
        KUCOIN_API_SECRET: "broker-api-secret",
        KUCOIN_API_PASSPHRASE: "broker-passphrase",
        KUCOIN_MAIN_API_BASE: "https://main-gateway.example.test/",
        KUCOIN_MAIN_API_KEY: "main-api-key",
        KUCOIN_MAIN_API_SECRET: "main-api-secret",
        KUCOIN_MAIN_API_PASSPHRASE: "main-passphrase",
      },
      () => getKucoinMainConfig(),
    );

    assert.equal(config?.baseUrl, "https://main-gateway.example.test");
    assert.equal(config?.apiKey, "main-api-key");
    assert.equal(config?.apiSecret, "main-api-secret");
    assert.equal(config?.apiPassphrase, "main-passphrase");
  });
});

describe("KuCoin broker deposits", () => {
  it("requests successful USDT deposits with current broker query params", async () => {
    const originalFetch = globalThis.fetch;
    const originalNow = Date.now;
    const timestamp = "1700000000000";
    let requestedUrl = "";
    let requestedHeaders: Record<string, string> = {};

    Date.now = () => Number(timestamp);
    globalThis.fetch = async (url, init) => {
      requestedUrl = String(url);
      requestedHeaders = init?.headers as Record<string, string>;

      return new Response(
        JSON.stringify({
          code: "200000",
          data: [
            {
              uid: 226383154,
              hash: "6724e363a492800007ec602b",
              address: "TExample",
              amount: "3.0",
              currency: "USDT",
              chain: "trx",
              walletTxId: "txid",
              status: "SUCCESS",
              createdAt: 1730470760000,
            },
          ],
        }),
      );
    };

    try {
      const deposits = await listBrokerDeposits(kucoinConfig(), {
        startAt: 111,
        endAt: 222,
      });

      const endpoint =
        "/api/v1/asset/ndbroker/deposit/list?currency=USDT&status=SUCCESS&startTimestamp=111&endTimestamp=222&limit=100";

      assert.equal(requestedUrl, `https://api-broker.kucoin.com${endpoint}`);
      assert.equal(requestedHeaders["KC-API-KEY"], "api-key");
      assert.equal(requestedHeaders["KC-API-KEY-VERSION"], "2");
      assert.equal(
        requestedHeaders["KC-API-SIGN"],
        signKucoinPayload("api-secret", timestamp, "GET", endpoint, ""),
      );
      assert.equal(deposits[0].hash, "6724e363a492800007ec602b");
    } finally {
      globalThis.fetch = originalFetch;
      Date.now = originalNow;
    }
  });

  it("prefers KuCoin's broker deposit hash for idempotency", () => {
    const deposit = {
      uid: 226383154,
      hash: "provider-record-id",
      id: "account-history-id",
      walletTxId: "chain-tx-id",
      address: "TExample",
      amount: "3.0",
      currency: "USDT",
      chain: "trx",
      status: "SUCCESS",
      createdAt: 1730470760000,
    };

    assert.equal(getKucoinDepositExternalId(deposit), "provider-record-id");
    assert.equal(getKucoinDepositExternalId({ ...deposit, hash: undefined }), "account-history-id");
    assert.equal(
      getKucoinDepositExternalId({ ...deposit, hash: undefined, id: undefined }),
      "chain-tx-id",
    );
    assert.equal(
      getKucoinDepositExternalId({
        ...deposit,
        hash: undefined,
        id: undefined,
        walletTxId: null,
      }),
      "226383154:TExample:1730470760000",
    );
  });
});

describe("KuCoin main-account deposits", () => {
  it("requests successful USDT deposits with current main-account query params", async () => {
    const originalFetch = globalThis.fetch;
    const originalNow = Date.now;
    const timestamp = "1700000000000";
    let requestedUrl = "";
    let requestedHeaders: Record<string, string> = {};

    Date.now = () => Number(timestamp);
    globalThis.fetch = async (url, init) => {
      requestedUrl = String(url);
      requestedHeaders = init?.headers as Record<string, string>;

      return new Response(
        JSON.stringify({
          code: "200000",
          data: {
            currentPage: 1,
            pageSize: 50,
            totalNum: 1,
            totalPage: 1,
            items: [
              {
                walletTxId: `0x${"a".repeat(64)}`,
                address: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
                amount: "0.01000123",
                currency: "USDT",
                chain: "eth",
                status: "SUCCESS",
                createdAt: 1730470760000,
              },
            ],
          },
        }),
      );
    };

    try {
      const deposits = await listMainAccountDeposits(
        {
          baseUrl: "https://api.kucoin.com",
          apiKey: "api-key",
          apiSecret: "api-secret",
          apiPassphrase: "passphrase",
        },
        {
          startAt: 111,
          endAt: 222,
          pageSize: 100,
        },
      );

      const endpoint =
        "/api/v1/deposits?currency=USDT&status=SUCCESS&startAt=111&endAt=222&currentPage=1&pageSize=100";

      assert.equal(requestedUrl, `https://api.kucoin.com${endpoint}`);
      assert.equal(requestedHeaders["KC-API-KEY"], "api-key");
      assert.equal(requestedHeaders["KC-API-KEY-VERSION"], "2");
      assert.equal(
        requestedHeaders["KC-API-SIGN"],
        signKucoinPayload("api-secret", timestamp, "GET", endpoint, ""),
      );
      assert.equal(deposits[0].amount, "0.01000123");
    } finally {
      globalThis.fetch = originalFetch;
      Date.now = originalNow;
    }
  });

  it("matches a main-account deposit by normalized network, address, and tx hash", () => {
    const txHash = `0x${"b".repeat(64)}`;

    const match = findMatchingMainDeposit(
      [
        {
          walletTxId: txHash.toUpperCase(),
          address: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
          amount: "0.01000123",
          currency: "USDT",
          chain: "eth",
          status: "SUCCESS",
          createdAt: 1730470760000,
        },
      ],
      {
        network: "erc20",
        address: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
        txHash,
      },
    );

    assert.equal(match?.amount, "0.01000123");
  });

  it("uses the main-account wallet transaction id for shared-wallet claim creation", () => {
    const walletTxId = `0x${"c".repeat(64)}`;
    const deposit = {
      id: "deposit-record-id",
      walletTxId,
      address: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
      amount: "50.00",
      currency: "USDT",
      chain: "eth",
      status: "SUCCESS",
      createdAt: 1730470760000,
    };

    assert.equal(getKucoinMainDepositTxHash(deposit, "erc20"), walletTxId);
    assert.equal(getKucoinMainDepositExternalId(deposit), walletTxId);
    assert.equal(
      getKucoinMainDepositExternalId({ ...deposit, walletTxId: null }),
      "deposit-record-id",
    );
  });
});
