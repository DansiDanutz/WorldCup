import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

// M-5 regression: admin routes must never hand a raw Supabase/Postgres
// error.message back to the client (it leaks schema/constraint detail). The
// allowed pattern is to map a business error CODE to a generic message, e.g.
// `code.error.message?.match(/[A-Z_]{4,}/)` — that extracts a code and never
// returns the raw text, so it does not trip the guards below.
const ADMIN_API_DIR = "src/app/api/admin";

function adminRouteFiles(): string[] {
  return readdirSync(ADMIN_API_DIR, { recursive: true })
    .map((entry) => String(entry))
    .filter((entry) => entry.endsWith("route.ts"))
    .map((entry) => `${ADMIN_API_DIR}/${entry}`);
}

describe("admin route error hygiene (M-5)", () => {
  const files = adminRouteFiles();

  it("discovers the admin route handlers", () => {
    assert.ok(files.length >= 10, `expected to find admin routes, found ${files.length}`);
  });

  it("never returns a raw Supabase/Postgres error message to the client", () => {
    // `jsonError(<result>.error.message ...)` or `{ error: <result>.error.message }`.
    const rawErrorViaJsonError = /jsonError\(\s*[\w.]*\.error\.message/;
    const rawErrorViaJson = /error:\s*[\w.]*\.error\.message/;

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      assert.doesNotMatch(
        source,
        rawErrorViaJsonError,
        `${file} returns a raw DB error via jsonError(); map a code or use a generic message`,
      );
      assert.doesNotMatch(
        source,
        rawErrorViaJson,
        `${file} returns a raw DB error via NextResponse.json(); map a code or use a generic message`,
      );
    }
  });
});
