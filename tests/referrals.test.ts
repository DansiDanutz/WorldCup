import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAuthProvider, normalizeReferralCode } from "../src/lib/referrals.ts";

describe("normalizeReferralCode", () => {
  it("keeps referral codes uppercase and alphanumeric", () => {
    assert.equal(normalizeReferralCode(" ab-12 cd "), "AB12CD");
  });

  it("returns an empty string for missing values", () => {
    assert.equal(normalizeReferralCode(null), "");
    assert.equal(normalizeReferralCode(undefined), "");
  });
});

describe("getAuthProvider", () => {
  it("reads the Supabase provider from user app metadata", () => {
    assert.equal(getAuthProvider({ app_metadata: { provider: "google" } } as never), "google");
  });

  it("returns null when the provider is not a string", () => {
    assert.equal(getAuthProvider({ app_metadata: { provider: ["google"] } } as never), null);
  });
});
