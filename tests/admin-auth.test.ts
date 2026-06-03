import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  getAdminEmailAllowlist,
  getOwnerAdminEmail,
  isAllowlistedAdminEmail,
} from "../src/lib/admin-auth.ts";

const originalAdminEmails = process.env.ADMIN_EMAILS;
const originalOwnerAdminEmail = process.env.OWNER_ADMIN_EMAIL;

afterEach(() => {
  if (originalAdminEmails === undefined) {
    delete process.env.ADMIN_EMAILS;
  } else {
    process.env.ADMIN_EMAILS = originalAdminEmails;
  }

  if (originalOwnerAdminEmail === undefined) {
    delete process.env.OWNER_ADMIN_EMAIL;
  } else {
    process.env.OWNER_ADMIN_EMAIL = originalOwnerAdminEmail;
  }
});

describe("admin email allowlist", () => {
  it("parses and normalizes the allowlist", () => {
    process.env.ADMIN_EMAILS = " Admin@Example.com , ops@example.com ,";
    assert.deepEqual(getAdminEmailAllowlist(), [
      "admin@example.com",
      "ops@example.com",
      "semebitcoin@gmail.com",
    ]);
  });

  it("matches allowlisted emails case-insensitively", () => {
    process.env.ADMIN_EMAILS = "admin@example.com";
    assert.equal(isAllowlistedAdminEmail("ADMIN@example.com"), true);
    assert.equal(isAllowlistedAdminEmail("admin@example.com"), true);
  });

  it("always keeps the owner Google account admin-enabled", () => {
    process.env.ADMIN_EMAILS = "";
    assert.deepEqual(getAdminEmailAllowlist(), ["semebitcoin@gmail.com"]);
    assert.equal(isAllowlistedAdminEmail("SEMEBITCOIN@gmail.com"), true);
  });

  it("rejects emails that are not on the allowlist", () => {
    process.env.ADMIN_EMAILS = "admin@example.com";
    assert.equal(isAllowlistedAdminEmail("intruder@example.com"), false);
    assert.equal(isAllowlistedAdminEmail(null), false);
    assert.equal(isAllowlistedAdminEmail(""), false);
  });

  it("treats an empty configured allowlist as owner-only", () => {
    process.env.ADMIN_EMAILS = "";
    assert.equal(isAllowlistedAdminEmail("anyone@example.com"), false);
  });

  it("defaults the owner to the built-in account when OWNER_ADMIN_EMAIL is unset", () => {
    delete process.env.OWNER_ADMIN_EMAIL;
    assert.equal(getOwnerAdminEmail(), "semebitcoin@gmail.com");
  });

  it("lets OWNER_ADMIN_EMAIL rotate the built-in owner", () => {
    process.env.ADMIN_EMAILS = "";
    process.env.OWNER_ADMIN_EMAIL = "Owner2@Example.com";

    assert.equal(getOwnerAdminEmail(), "owner2@example.com");
    assert.deepEqual(getAdminEmailAllowlist(), ["owner2@example.com"]);
    assert.equal(isAllowlistedAdminEmail("owner2@example.com"), true);
    assert.equal(isAllowlistedAdminEmail("semebitcoin@gmail.com"), false);
  });

  it("lets OWNER_ADMIN_EMAIL=none revoke the built-in owner", () => {
    process.env.ADMIN_EMAILS = "admin@example.com";
    process.env.OWNER_ADMIN_EMAIL = "none";

    assert.equal(getOwnerAdminEmail(), null);
    assert.deepEqual(getAdminEmailAllowlist(), ["admin@example.com"]);
    assert.equal(isAllowlistedAdminEmail("semebitcoin@gmail.com"), false);
  });
});
