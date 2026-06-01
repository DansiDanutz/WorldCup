import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldRedirectToCanonicalHost } from "../src/lib/canonical-url.ts";

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
});

