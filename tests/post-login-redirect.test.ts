import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

describe("post-login redirect handler", () => {
  const handler = readFileSync("src/components/post-login-redirect-handler.tsx", "utf8");

  it("consumes the stored redirect on load and on sign-in", () => {
    assert.match(handler, /consumePostLoginRedirect\(window\.localStorage\)/);
    assert.match(handler, /getSession\(\)/);
    assert.match(handler, /onAuthStateChange/);
    assert.match(handler, /nextPath !== currentPath/); // never loops on the page it is already on
  });
});
