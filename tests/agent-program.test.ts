import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync("supabase/migrations/20260602015000_worldcup_agents.sql", "utf8");

describe("agent program migration", () => {
  it("creates the agent and ticket-code tables with RLS enabled", () => {
    assert.match(migration, /create table if not exists public\.worldcup_agents/);
    assert.match(migration, /create table if not exists public\.worldcup_ticket_codes/);
    assert.match(migration, /alter table public\.worldcup_agents enable row level security/);
    assert.match(migration, /alter table public\.worldcup_ticket_codes enable row level security/);
  });

  it("pre-generates a pool of 10,000 ticket codes", () => {
    assert.match(migration, /10000/);
    assert.match(migration, /generate_series/);
  });

  it("awards one free commission code per ten paid codes", () => {
    assert.match(migration, /floor\(v_paid \/ 10\)/);
    assert.match(migration, /kind\s*=\s*'commission'/);
  });

  it("keeps the agent RPCs callable only by the service role", () => {
    const signatures = [
      "public.worldcup_agent_assign_codes(uuid, uuid, integer, text)",
      "public.worldcup_redeem_ticket_code(text, uuid)",
    ];

    for (const signature of signatures) {
      const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(
        migration,
        new RegExp(`revoke execute on function ${escaped}\\s+from public, anon, authenticated;`),
      );
      assert.match(
        migration,
        new RegExp(`grant execute on function ${escaped}\\s+to service_role;`),
      );
    }
  });
});
