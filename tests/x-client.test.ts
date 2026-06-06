import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSignatureBaseString,
  loadCredentials,
  rfc3986Encode,
  signOAuth1,
} from "../scripts/lib/x-client.mjs";

// Reference vector published by X (Twitter) in "Creating a signature".
// https://developer.x.com/en/docs/authentication/oauth-1-0a/creating-a-signature
const REFERENCE = {
  method: "POST",
  url: "https://api.twitter.com/1.1/statuses/update.json",
  query: {
    include_entities: "true",
    status: "Hello Ladies + Gentlemen, a signed OAuth request!",
  },
  oauth: {
    oauth_consumer_key: "xvz1evFS4wEEPTGEFPHBog",
    oauth_nonce: "kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: "1318622958",
    oauth_token: "370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
    oauth_version: "1.0",
  },
  consumerSecret: "kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Y7",
  tokenSecret: "LswwdoUaIVS25NIkXLBeWuUE6MqcSRdtO8X5xJgQ3M2J1QyXh",
  expectedBaseString:
    "POST&https%3A%2F%2Fapi.twitter.com%2F1.1%2Fstatuses%2Fupdate.json&include_entities%3Dtrue%26oauth_consumer_key%3Dxvz1evFS4wEEPTGEFPHBog%26oauth_nonce%3DkYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1318622958%26oauth_token%3D370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb%26oauth_version%3D1.0%26status%3DHello%2520Ladies%2520%252B%2520Gentlemen%252C%2520a%2520signed%2520OAuth%2520request%2521",
  expectedSignature: "jvK3823a5FbwOfatJeTdMoOVkk8=",
};

describe("rfc3986Encode", () => {
  it("encodes characters that encodeURIComponent leaves untouched", () => {
    assert.equal(rfc3986Encode("Ladies + Gentlemen!"), "Ladies%20%2B%20Gentlemen%21");
    assert.equal(rfc3986Encode("a*b'c(d)"), "a%2Ab%27c%28d%29");
    // ~ is unreserved and must stay literal.
    assert.equal(rfc3986Encode("a~b"), "a~b");
  });
});

describe("buildSignatureBaseString", () => {
  it("matches X's documented base string", () => {
    const baseString = buildSignatureBaseString({
      method: REFERENCE.method,
      url: REFERENCE.url,
      params: { ...REFERENCE.oauth, ...REFERENCE.query },
    });
    assert.equal(baseString, REFERENCE.expectedBaseString);
  });
});

describe("signOAuth1", () => {
  it("produces an Authorization header with the documented signature", () => {
    const header = signOAuth1({
      method: REFERENCE.method,
      url: REFERENCE.url,
      query: REFERENCE.query,
      creds: {
        apiKey: REFERENCE.oauth.oauth_consumer_key,
        apiSecret: REFERENCE.consumerSecret,
        accessToken: REFERENCE.oauth.oauth_token,
        accessTokenSecret: REFERENCE.tokenSecret,
      },
      nonce: REFERENCE.oauth.oauth_nonce,
      timestamp: REFERENCE.oauth.oauth_timestamp,
    });

    assert.match(header, /^OAuth /);
    const encodedSig = rfc3986Encode(REFERENCE.expectedSignature);
    assert.ok(
      header.includes(`oauth_signature="${encodedSig}"`),
      `signature mismatch in header: ${header}`,
    );
  });
});

describe("loadCredentials", () => {
  it("flags user-context vs bearer-only auth from env", () => {
    const userCtx = loadCredentials({
      X_API_KEY: "k",
      X_API_SECRET: "s",
      X_ACCESS_TOKEN: "t",
      X_ACCESS_TOKEN_SECRET: "ts",
    });
    assert.equal(userCtx.hasUserContext, true);

    const bearerOnly = loadCredentials({ X_BEARER_TOKEN: "b" });
    assert.equal(bearerOnly.hasUserContext, false);
    assert.equal(bearerOnly.hasBearer, true);

    const none = loadCredentials({});
    assert.equal(none.hasUserContext, false);
    assert.equal(none.hasBearer, false);
  });
});
