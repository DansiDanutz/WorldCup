import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CURRENT_TERMS_VERSION, isConsentCurrent, MINIMUM_AGE } from "../src/lib/consent.ts";

describe("isConsentCurrent", () => {
  it("is true only when age is confirmed and the terms version matches", () => {
    assert.equal(
      isConsentCurrent({ age_confirmed: true, terms_version: CURRENT_TERMS_VERSION }),
      true,
    );
  });

  it("is false when age is not confirmed", () => {
    assert.equal(
      isConsentCurrent({ age_confirmed: false, terms_version: CURRENT_TERMS_VERSION }),
      false,
    );
  });

  it("is false for a stale terms version", () => {
    assert.equal(isConsentCurrent({ age_confirmed: true, terms_version: "1999-01-01" }), false);
  });

  it("is false for missing or null consent", () => {
    assert.equal(isConsentCurrent(null), false);
    assert.equal(isConsentCurrent(undefined), false);
    assert.equal(isConsentCurrent({}), false);
  });

  it("enforces an adult minimum age", () => {
    assert.ok(MINIMUM_AGE >= 18);
  });
});
