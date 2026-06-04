import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  DEFAULT_BLOCKED_COUNTRIES,
  getGeoEligibility,
  getRequestCountry,
  parseCountryList,
} from "../src/lib/geo-eligibility.ts";

function requestWithCountry(country?: string) {
  return new Request("https://worldcup26.world/api/entries", {
    headers: country ? { "x-vercel-ip-country": country } : undefined,
  });
}

describe("geo eligibility", () => {
  it("normalizes country headers from the hosting provider", () => {
    assert.equal(getRequestCountry(requestWithCountry("ro")), "RO");
    assert.equal(getRequestCountry(requestWithCountry("USA")), null);
    assert.equal(getRequestCountry(requestWithCountry()), null);
  });

  it("allows all countries when no policy is configured", () => {
    assert.deepEqual(getGeoEligibility(requestWithCountry(), {}), {
      allowed: true,
      country: null,
      reason: "not-configured",
    });
    assert.deepEqual(getGeoEligibility(requestWithCountry("US"), {}), {
      allowed: true,
      country: "US",
      reason: "not-configured",
    });
  });

  it("supports allowlists, blocklists, and blocklist precedence", () => {
    assert.deepEqual(
      getGeoEligibility(requestWithCountry("US"), { WORLDCUP_ALLOWED_COUNTRIES: "US,RO" }),
      { allowed: true, country: "US", reason: "allowed" },
    );
    assert.deepEqual(
      getGeoEligibility(requestWithCountry("GB"), { WORLDCUP_ALLOWED_COUNTRIES: "US,RO" }),
      { allowed: false, country: "GB", reason: "not-allowed" },
    );
    assert.deepEqual(
      getGeoEligibility(requestWithCountry("US"), {
        WORLDCUP_ALLOWED_COUNTRIES: "US,RO",
        WORLDCUP_BLOCKED_COUNTRIES: "US",
      }),
      { allowed: false, country: "US", reason: "blocked" },
    );
  });

  it("requires a detectable country once a policy is configured", () => {
    assert.deepEqual(
      getGeoEligibility(requestWithCountry(), { WORLDCUP_BLOCKED_COUNTRIES: "GB" }),
      { allowed: false, country: null, reason: "unknown" },
    );
  });

  it("always blocks comprehensively sanctioned territories, even with no policy", () => {
    assert.deepEqual([...DEFAULT_BLOCKED_COUNTRIES].sort(), ["CU", "IR", "KP", "SY"]);

    for (const country of DEFAULT_BLOCKED_COUNTRIES) {
      assert.deepEqual(getGeoEligibility(requestWithCountry(country), {}), {
        allowed: false,
        country,
        reason: "blocked",
      });
    }
  });

  it("does not let an allow-list re-enable a sanctioned territory", () => {
    assert.deepEqual(
      getGeoEligibility(requestWithCountry("IR"), { WORLDCUP_ALLOWED_COUNTRIES: "IR,US" }),
      { allowed: false, country: "IR", reason: "blocked" },
    );
  });

  it("still allows non-sanctioned countries when no policy is configured", () => {
    assert.deepEqual(getGeoEligibility(requestWithCountry("US"), {}), {
      allowed: true,
      country: "US",
      reason: "not-configured",
    });
  });

  it("parses only ISO alpha-2 country codes", () => {
    assert.deepEqual([...parseCountryList("us, ro, usa, 1, gb")].sort(), ["GB", "RO", "US"]);
  });

  it("keeps paid-action API routes behind the shared geo gate", () => {
    const protectedRoutes = [
      "src/app/api/deposits/address/route.ts",
      "src/app/api/deposits/claims/route.ts",
      "src/app/api/tickets/purchase/route.ts",
      "src/app/api/entries/route.ts",
      "src/app/api/withdrawals/route.ts",
    ];

    for (const route of protectedRoutes) {
      const source = readFileSync(route, "utf8");

      assert.match(source, /enforceGeoEligibility/);
      assert.match(source, /loadOperatorPolicy/);
      assert.match(source, /getPolicyGeoEnv\(operatorPolicy\)/);
    }
  });
});
