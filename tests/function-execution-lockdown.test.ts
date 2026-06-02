import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260602014000_worldcup_function_execution_lockdown.sql",
  "utf8",
);

describe("function execution lockdown migration", () => {
  it("revokes public/anon/authenticated EXECUTE on schema functions", () => {
    assert.match(migration, /revoke execute on all functions in schema public from public;/);
    assert.match(migration, /revoke execute on all functions in schema public from anon, authenticated;/);
  });

  it("keeps the trusted service role able to execute", () => {
    assert.match(migration, /grant execute on all functions in schema public to service_role;/);
  });

  it("prevents future functions from defaulting to PUBLIC execute", () => {
    assert.match(
      migration,
      /alter default privileges in schema public revoke execute on functions from public;/,
    );
  });

  it("drops the unguarded worldcup_finalize_entry escalation function", () => {
    assert.match(migration, /drop function if exists public\.worldcup_finalize_entry\(uuid\);/);
  });
});
