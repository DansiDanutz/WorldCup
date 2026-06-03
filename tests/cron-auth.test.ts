import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { isAuthorizedCronRequest } from "../src/lib/cron-auth.ts";

const originalCronSecret = process.env.CRON_SECRET;

afterEach(() => {
  if (originalCronSecret === undefined) {
    delete process.env.CRON_SECRET;
  } else {
    process.env.CRON_SECRET = originalCronSecret;
  }
});

function cronRequest(authorization?: string) {
  return new Request("https://worldcup26.world/api/cron/results", {
    headers: authorization ? { authorization } : {},
  });
}

describe("isAuthorizedCronRequest", () => {
  it("accepts a request whose bearer token matches CRON_SECRET", () => {
    process.env.CRON_SECRET = "super-secret-cron-token";
    assert.equal(isAuthorizedCronRequest(cronRequest("Bearer super-secret-cron-token")), true);
  });

  it("rejects a wrong token", () => {
    process.env.CRON_SECRET = "super-secret-cron-token";
    assert.equal(isAuthorizedCronRequest(cronRequest("Bearer not-the-secret")), false);
  });

  it("rejects a token of a different length (constant-time compare still returns false)", () => {
    process.env.CRON_SECRET = "super-secret-cron-token";
    assert.equal(isAuthorizedCronRequest(cronRequest("Bearer short")), false);
  });

  it("rejects a request with no Authorization header before touching the secret", () => {
    process.env.CRON_SECRET = "super-secret-cron-token";
    assert.equal(isAuthorizedCronRequest(cronRequest()), false);
  });

  it("fails closed: a present token with no configured CRON_SECRET throws rather than allowing", () => {
    delete process.env.CRON_SECRET;
    assert.throws(() => isAuthorizedCronRequest(cronRequest("Bearer anything")));
  });

  it("returns false for a missing token even when CRON_SECRET is unset", () => {
    delete process.env.CRON_SECRET;
    assert.equal(isAuthorizedCronRequest(cronRequest()), false);
  });
});
