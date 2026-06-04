import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604190000_worldcup_agent_personal_ticket_reserve.sql",
  "utf8",
);
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");

describe("agent personal ticket reserve", () => {
  it("reserves one personal user ticket before assigning sellable agent codes", () => {
    assert.match(migration, /create or replace function public\.worldcup_agent_assign_codes/);
    assert.match(migration, /v_personal_ticket_assigned integer := 0/);
    assert.match(migration, /from public\.worldcup_tickets/);
    assert.match(migration, /from public\.worldcup_entries/);
    assert.match(migration, /v_agent_code_quantity := case[\s\S]*?when v_has_personal_ticket then p_quantity[\s\S]*?else p_quantity - 1/);
    assert.match(migration, /insert into public\.worldcup_tickets/);
    assert.match(migration, /agent_personal_reserve/);
    assert.match(migration, /limit v_agent_code_quantity/);
  });

  it("returns explicit split counts to the admin route", () => {
    assert.match(migration, /'agentCodesAssigned', v_assigned/);
    assert.match(migration, /'personalTicketAssigned', v_personal_ticket_assigned/);
    assert.match(migration, /'commissionAwarded', v_new_free/);
  });

  it("keeps the RPC service-role only", () => {
    assert.match(
      migration,
      /revoke execute on function public\.worldcup_agent_assign_codes\(uuid, uuid, integer, text\)\s+from public, anon, authenticated;/,
    );
    assert.match(
      migration,
      /grant execute on function public\.worldcup_agent_assign_codes\(uuid, uuid, integer, text\)\s+to service_role;/,
    );
  });

  it("shows admins whether an assignment reserved the personal user ticket", () => {
    assert.match(adminConsole, /agentCodesAssigned\?: number/);
    assert.match(adminConsole, /personalTicketAssigned\?: number/);
    assert.match(adminConsole, /personal user ticket/);
    assert.match(adminConsole, /Assigned \$\{agentCodesAssigned\} agent codes/);
  });
});
