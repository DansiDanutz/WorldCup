import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readFileSync } from "node:fs";

import { CANONICAL_ORIGIN, shouldRedirectToCanonicalHost } from "../src/lib/canonical-url.ts";

const rootLayout = readFileSync("src/app/layout.tsx", "utf8");

describe("shouldRedirectToCanonicalHost", () => {
  it("redirects Vercel hosts to the canonical domain", () => {
    assert.equal(shouldRedirectToCanonicalHost("worldcup-ten-eta.vercel.app"), true);
    assert.equal(shouldRedirectToCanonicalHost("worldcup-git-main-irises-projects-ce549f63.vercel.app"), true);
  });

  it("redirects www to the apex domain", () => {
    assert.equal(shouldRedirectToCanonicalHost("www.worldcup26.world"), true);
  });

  it("keeps the canonical host and local development hosts", () => {
    assert.equal(shouldRedirectToCanonicalHost("worldcup26.world"), false);
    assert.equal(shouldRedirectToCanonicalHost("localhost:3000"), false);
    assert.equal(shouldRedirectToCanonicalHost("127.0.0.1:3000"), false);
    assert.equal(shouldRedirectToCanonicalHost(null), false);
  });

  it("does not redirect preview or development deployments", () => {
    const previous = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "preview";
    try {
      assert.equal(
        shouldRedirectToCanonicalHost(
          "worldcup-git-claude-busy-cerf-kgyhj-irises-projects-ce549f63.vercel.app",
        ),
        false,
      );
    } finally {
      if (previous === undefined) {
        delete process.env.VERCEL_ENV;
      } else {
        process.env.VERCEL_ENV = previous;
      }
    }
  });

  it("still funnels bare Vercel aliases to canonical in production", () => {
    const previous = process.env.VERCEL_ENV;
    process.env.VERCEL_ENV = "production";
    try {
      assert.equal(shouldRedirectToCanonicalHost("worldcup-ten-eta.vercel.app"), true);
      assert.equal(shouldRedirectToCanonicalHost("www.worldcup26.world"), true);
    } finally {
      if (previous === undefined) {
        delete process.env.VERCEL_ENV;
      } else {
        process.env.VERCEL_ENV = previous;
      }
    }
  });
});

describe("canonical metadata", () => {
  it("uses the canonical domain as metadata fallback", () => {
    assert.equal(CANONICAL_ORIGIN, "https://worldcup26.world");
    assert.match(rootLayout, /process\.env\.NEXT_PUBLIC_SITE_URL \|\| CANONICAL_ORIGIN/);
    assert.doesNotMatch(rootLayout, /VERCEL_PROJECT_PRODUCTION_URL/);
    assert.doesNotMatch(rootLayout, /worldcup\.example\.com/);
  });
});
