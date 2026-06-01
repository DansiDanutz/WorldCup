import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkRateLimit } from "../src/lib/rate-limit.ts";

describe("checkRateLimit", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const key = `test-${Math.random()}`;

    assert.equal(checkRateLimit(key, 3, 60_000).allowed, true);
    assert.equal(checkRateLimit(key, 3, 60_000).allowed, true);
    assert.equal(checkRateLimit(key, 3, 60_000).allowed, true);

    const blocked = checkRateLimit(key, 3, 60_000);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.retryAfterSeconds > 0);
  });

  it("tracks separate keys independently", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;

    assert.equal(checkRateLimit(a, 1, 60_000).allowed, true);
    assert.equal(checkRateLimit(a, 1, 60_000).allowed, false);
    assert.equal(checkRateLimit(b, 1, 60_000).allowed, true);
  });

  it("frees capacity once the window elapses", () => {
    const key = `window-${Math.random()}`;

    assert.equal(checkRateLimit(key, 1, 5).allowed, true);
    assert.equal(checkRateLimit(key, 1, 5).allowed, false);

    const start = Date.now();
    while (Date.now() - start < 10) {
      // busy-wait past the 5ms window
    }

    assert.equal(checkRateLimit(key, 1, 5).allowed, true);
  });
});
