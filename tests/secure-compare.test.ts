import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { timingSafeEqualStrings } from "../src/lib/secure-compare.ts";

describe("timingSafeEqualStrings", () => {
  it("returns true for identical strings", () => {
    assert.equal(timingSafeEqualStrings("s3cret-token", "s3cret-token"), true);
  });

  it("returns false for same-length but different strings", () => {
    assert.equal(timingSafeEqualStrings("aaaaaaaa", "aaaaaaab"), false);
  });

  it("returns false for different-length strings without throwing", () => {
    assert.equal(timingSafeEqualStrings("short", "a-much-longer-secret"), false);
  });

  it("treats empty strings as equal to each other", () => {
    assert.equal(timingSafeEqualStrings("", ""), true);
  });
});
