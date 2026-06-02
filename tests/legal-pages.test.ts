import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const termsPage = readFileSync("src/app/terms/page.tsx", "utf8");
const privacyPage = readFileSync("src/app/privacy/page.tsx", "utf8");
const consentPolicy = readFileSync("src/lib/consent.ts", "utf8");
const productionSmoke = readFileSync("scripts/production-smoke.mjs", "utf8");

describe("public legal pages", () => {
  it("ships production-facing terms and privacy copy instead of placeholders", () => {
    const publicLegalCopy = `${termsPage}\n${privacyPage}\n${consentPolicy}`;

    assert.doesNotMatch(publicLegalCopy, /Placeholder pending legal review/i);
    assert.doesNotMatch(publicLegalCopy, /Do not treat this as/i);
    assert.doesNotMatch(publicLegalCopy, /must be completed with qualified legal counsel/i);
    assert.match(termsPage, /WorldCup26 Terms of Use/);
    assert.match(privacyPage, /WorldCup26 Privacy Policy/);
  });

  it("requires fresh consent for the current public terms version", () => {
    assert.match(consentPolicy, /CURRENT_TERMS_VERSION = "2026-06-02"/);
  });

  it("keeps production smoke anchored to the published legal pages", () => {
    assert.match(productionSmoke, /\["\/terms", "WorldCup26 Terms of Use"\]/);
    assert.match(productionSmoke, /\["\/privacy", "WorldCup26 Privacy Policy"\]/);
  });
});
