import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";

import { encryptPassphrase, signBrokerPartner, signKucoinPayload } from "../src/lib/kucoin.ts";

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
