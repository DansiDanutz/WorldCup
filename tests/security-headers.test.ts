import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

type HeaderEntry = { key: string; value: string };

describe("security headers", () => {
  it("emits a locked-down Content-Security-Policy in production", async () => {
    // @types/node types NODE_ENV as read-only; assign through a mutable view.
    const env = process.env as Record<string, string | undefined>;
    const previousNodeEnv = env.NODE_ENV;
    env.NODE_ENV = "production";

    let csp: string | undefined;
    try {
      // First import in this process, so the production-gated header list is
      // built with NODE_ENV=production. next.config.ts only type-imports "next",
      // which --experimental-strip-types erases, so it loads without Next.
      const mod = await import("../next.config.ts");
      const groups = (await mod.default.headers!()) as Array<{ headers: HeaderEntry[] }>;
      csp = groups[0]?.headers.find((header) => header.key === "Content-Security-Policy")?.value;
    } finally {
      if (previousNodeEnv === undefined) {
        delete env.NODE_ENV;
      } else {
        env.NODE_ENV = previousNodeEnv;
      }
    }

    assert.ok(csp, "expected a Content-Security-Policy header in production");

    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.worldcup26.world wss://api.worldcup26.world",
      "img-src 'self' data: blob: https://flagcdn.com",
      "upgrade-insecure-requests",
    ]) {
      assert.ok(csp.includes(directive), `CSP is missing directive: ${directive}`);
    }
  });

  it("gates the CSP to production so dev-server HMR is unaffected", () => {
    const source = readFileSync("next.config.ts", "utf8");
    assert.match(source, /process\.env\.NODE_ENV === "production"/);
    assert.match(source, /Content-Security-Policy/);
  });
});
