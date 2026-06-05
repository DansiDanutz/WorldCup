import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604112000_worldcup_agent_self_registration.sql",
  "utf8",
);
const agentMeRoute = readFileSync("src/app/api/agent/me/route.ts", "utf8");
const adminAgentsRoute = readFileSync("src/app/api/admin/agents/route.ts", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");

describe("agent self-registration", () => {
  it("stores agent name and WhatsApp on the agent account", () => {
    assert.match(migration, /add column if not exists contact_name text/);
    assert.match(migration, /add column if not exists whatsapp_number text/);
    assert.match(migration, /add column if not exists registered_at timestamptz/);
    assert.match(agentMeRoute, /requireString\(body\.name, "Agent name"/);
    assert.match(agentMeRoute, /requireString\(body\.whatsapp, "WhatsApp number"/);
    assert.match(agentMeRoute, /created_by: shouldActivate \? "self-registered:ticket_active" : "self-registered"/);
    assert.match(agentMeRoute, /active: shouldActivate/);
  });

  it("activates registered agents after the first personal ticket exists", () => {
    assert.match(migration, /where user_id = p_agent_user_id and tournament_id = p_tournament_id;/);
    assert.doesNotMatch(migration, /and tournament_id = p_tournament_id and active;/);
    assert.match(migration, /active = true/);
    assert.match(migration, /activated_at = coalesce\(activated_at, now\(\)\)/);
    assert.match(adminAgentsRoute, /worldcup_admin_assign_agent_tickets/);
    assert.match(agentMeRoute, /hasPersonalTicket/);
    assert.match(agentMeRoute, /active: shouldActivate/);
    assert.match(agentMeRoute, /self-registered:ticket_active/);
  });

  it("shows users registration, pending activation, and active agent tools in the wallet", () => {
    assert.match(walletScreen, /Agent Wallet/);
    assert.match(walletScreen, /Be an Agent/);
    assert.match(walletScreen, /WhatsApp number/);
    assert.match(walletScreen, /applicationStatus === "pending"/);
    assert.match(walletScreen, /first personal ticket is assigned/);
    assert.match(walletScreen, /Transfer ticket to users is locked until admin activates your agent wallet/);
  });

  it("shows pending applicant contact details in the admin agent table", () => {
    assert.match(adminAgentsRoute, /contact_name,whatsapp_number/);
    assert.match(adminConsole, /contactName: string \| null/);
    assert.match(adminConsole, /whatsappNumber: string \| null/);
    assert.match(adminConsole, /agent\.active \? "Active" : "Pending"/);
    assert.match(adminConsole, /WhatsApp \$\{agent\.whatsappNumber\}/);
  });
});
