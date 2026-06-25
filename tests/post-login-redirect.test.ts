import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizePostLoginRedirect } from "../src/lib/post-login-redirect.ts";

describe("post-login redirects", () => {
  it("keeps safe app-relative return paths", () => {
    assert.equal(normalizePostLoginRedirect("/predictions#legend-cards"), "/predictions#legend-cards");
    assert.equal(normalizePostLoginRedirect("/wallet?tab=agent"), "/wallet?tab=agent");
  });

  it("rejects external, protocol-relative, auth-loop, and API return paths", () => {
    assert.equal(normalizePostLoginRedirect("https://example.com/predictions"), null);
    assert.equal(normalizePostLoginRedirect("//example.com/predictions"), null);
    assert.equal(normalizePostLoginRedirect("/login"), null);
    assert.equal(normalizePostLoginRedirect("/api/legend-cards"), null);
  });
});
