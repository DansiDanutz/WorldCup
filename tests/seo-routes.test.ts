import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { CANONICAL_ORIGIN } from "../src/lib/canonical-url.ts";
import robots from "../src/app/robots.ts";
import sitemap from "../src/app/sitemap.ts";

describe("SEO entrypoints", () => {
  it("pins the canonical home URL in shared metadata", () => {
    const source = readFileSync("src/app/layout.tsx", "utf8");

    assert.match(source, /alternates:\s*{\s*canonical:\s*"\/"/);
    assert.match(source, /openGraph:\s*{[\s\S]*url:\s*siteUrl/);
  });

  it("publishes robots rules with a sitemap pointer", () => {
    const result = robots();
    const disallow = Array.isArray(result.rules) ? result.rules.flatMap((rule) => rule.disallow ?? []) : result.rules.disallow;

    assert.equal(result.sitemap, `${CANONICAL_ORIGIN}/sitemap.xml`);
    assert.equal(result.host, CANONICAL_ORIGIN);
    assert.deepEqual(disallow, ["/admin", "/wallet", "/api/", "/preview"]);
  });

  it("lists the public marketing routes in the sitemap", () => {
    const routes = sitemap().map((entry) => entry.url);

    assert.deepEqual(routes, [
      `${CANONICAL_ORIGIN}/`,
      `${CANONICAL_ORIGIN}/coefficients`,
      `${CANONICAL_ORIGIN}/schema`,
      `${CANONICAL_ORIGIN}/login`,
      `${CANONICAL_ORIGIN}/privacy`,
      `${CANONICAL_ORIGIN}/terms`,
    ]);
  });
});
