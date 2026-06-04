import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604100000_worldcup_agent_ticket_requests.sql",
  "utf8",
);
const requestRoute = readFileSync("src/app/api/agent-ticket-requests/route.ts", "utf8");
const acceptRoute = readFileSync("src/app/api/agent-ticket-requests/[requestId]/accept/route.ts", "utf8");
const agentMeRoute = readFileSync("src/app/api/agent/me/route.ts", "utf8");

describe("agent ticket requests", () => {
  it("stores pending Agent Call requests with a 24 hour expiry", () => {
    assert.match(migration, /create table if not exists public\.worldcup_agent_ticket_requests/);
    assert.match(migration, /requester_email text/);
    assert.match(migration, /requester_display_name text not null/);
    assert.match(migration, /agent_user_id uuid not null/);
    assert.match(migration, /status text not null default 'pending'/);
    assert.match(migration, /expires_at timestamptz not null default \(now\(\) \+ interval '24 hours'\)/);
    assert.match(migration, /where status = 'pending'/);
    assert.match(migration, /alter table public\.worldcup_agent_ticket_requests enable row level security/);
  });

  it("accepts requests by consuming one available agent code atomically", () => {
    assert.match(migration, /worldcup_accept_agent_ticket_request/);
    assert.match(migration, /for update skip locked/);
    assert.match(migration, /status = 'assigned'/);
    assert.match(migration, /raise exception 'AGENT_NO_TICKETS'/);
    assert.match(migration, /assigned_by,\s+source_agent_id/);
    assert.match(migration, /'agent_call'/);
    assert.match(migration, /set status = 'redeemed'/);
    assert.match(migration, /set status = 'accepted'/);
    assert.match(migration, /revoke execute on function public\.worldcup_accept_agent_ticket_request/);
    assert.match(migration, /grant execute on function public\.worldcup_accept_agent_ticket_request\(uuid, uuid\)\s+to service_role/);
  });

  it("lets players create requests by agent code or email", () => {
    assert.match(requestRoute, /requireString\(body\.agentId, "Agent ID"/);
    assert.match(requestRoute, /\.eq\("referral_code", normalizedAgentCode\)/);
    assert.match(requestRoute, /\.eq\("email", normalizedAgentEmail\)/);
    assert.match(requestRoute, /That account is not an active agent/);
    assert.match(requestRoute, /You already have a pending Agent Call request/);
    assert.match(requestRoute, /worldcup_agent_ticket_requests/);
    assert.match(requestRoute, /requester_email/);
    assert.match(requestRoute, /requester_display_name/);
  });

  it("lets agents list and accept their pending requests", () => {
    assert.match(agentMeRoute, /ticketRequests/);
    assert.match(agentMeRoute, /worldcup_agent_ticket_requests/);
    assert.match(agentMeRoute, /requester_email/);
    assert.match(acceptRoute, /worldcup_accept_agent_ticket_request/);
    assert.match(acceptRoute, /AGENT_NO_TICKETS/);
    assert.match(acceptRoute, /request stays pending until it expires/);
  });
});
