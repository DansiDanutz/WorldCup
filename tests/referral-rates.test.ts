import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getInviterReferralPercent,
  REFERRED_INVITER_PERCENT,
  STANDARD_INVITER_PERCENT,
} from "../src/lib/referral-rates.ts";

describe("getInviterReferralPercent", () => {
  it("returns 5% for inviters who joined through a referral", () => {
    assert.equal(getInviterReferralPercent(true), REFERRED_INVITER_PERCENT);
  });

  it("returns 5% for inviters who joined without a referral", () => {
    assert.equal(getInviterReferralPercent(false), STANDARD_INVITER_PERCENT);
  });
});
