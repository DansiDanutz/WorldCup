import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isValidAdminSecret } from "../src/lib/admin-auth.ts";

describe("isValidAdminSecret", () => {
  it("accepts the configured admin secret", () => {
    process.env.ADMIN_RESULT_SECRET = "super-secret";

    assert.equal(isValidAdminSecret("super-secret"), true);
  });

  it("rejects missing, different, and different-length secrets", () => {
    process.env.ADMIN_RESULT_SECRET = "super-secret";

    assert.equal(isValidAdminSecret(undefined), false);
    assert.equal(isValidAdminSecret("wrong-secret"), false);
    assert.equal(isValidAdminSecret("super-secret-extra"), false);
  });
});
