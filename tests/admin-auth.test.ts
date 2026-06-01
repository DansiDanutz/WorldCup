import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { getAdminEmailAllowlist, isAllowlistedAdminEmail } from "../src/lib/admin-auth.ts";

const originalAdminEmails = process.env.ADMIN_EMAILS;

afterEach(() => {
  if (originalAdminEmails === undefined) {
    delete process.env.ADMIN_EMAILS;
  } else {
    process.env.ADMIN_EMAILS = originalAdminEmails;
  }
});

describe("admin email allowlist", () => {
  it("parses and normalizes the allowlist", () => {
    process.env.ADMIN_EMAILS = " Admin@Example.com , ops@example.com ,";
    assert.deepEqual(getAdminEmailAllowlist(), ["admin@example.com", "ops@example.com"]);
  });

  it("matches allowlisted emails case-insensitively", () => {
    process.env.ADMIN_EMAILS = "admin@example.com";
    assert.equal(isAllowlistedAdminEmail("ADMIN@example.com"), true);
    assert.equal(isAllowlistedAdminEmail("admin@example.com"), true);
  });

  it("rejects emails that are not on the allowlist", () => {
    process.env.ADMIN_EMAILS = "admin@example.com";
    assert.equal(isAllowlistedAdminEmail("intruder@example.com"), false);
    assert.equal(isAllowlistedAdminEmail(null), false);
    assert.equal(isAllowlistedAdminEmail(""), false);
  });

  it("treats an empty allowlist as no admins", () => {
    process.env.ADMIN_EMAILS = "";
    assert.deepEqual(getAdminEmailAllowlist(), []);
    assert.equal(isAllowlistedAdminEmail("anyone@example.com"), false);
  });
});
