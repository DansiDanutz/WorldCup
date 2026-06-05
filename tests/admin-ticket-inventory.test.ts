import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604220000_worldcup_admin_ticket_inventory.sql",
  "utf8",
);
const adminAgentsRoute = readFileSync("src/app/api/admin/agents/route.ts", "utf8");
const adminTicketsRoute = readFileSync("src/app/api/admin/tickets/route.ts", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");

describe("admin ticket inventory", () => {
  it("adds numbered admin inventory and a financial movement ledger", () => {
    assert.match(migration, /add column if not exists ticket_number integer/);
    assert.match(migration, /row_number\(\) over \(partition by tournament_id order by created_at asc, code asc, id asc\)/);
    assert.match(migration, /status in \('available', 'admin', 'assigned', 'redeemed', 'void'\)/);
    assert.match(migration, /create table if not exists public\.worldcup_ticket_financial_movements/);
    assert.match(migration, /create table if not exists public\.worldcup_ticket_financial_movement_codes/);
    assert.match(migration, /movement_role in \('admin_inventory', 'paid_agent', 'commission_agent', 'personal_user', 'user_ticket'\)/);
  });

  it("moves generated tickets to admin before assigning users or agents", () => {
    assert.match(migration, /create or replace function public\.worldcup_admin_request_ticket_inventory/);
    assert.match(migration, /set status = 'admin'/);
    assert.match(migration, /order by ticket_number asc/);
    assert.match(migration, /'admin_request'/);
    assert.match(migration, /'admin_inventory'/);
  });

  it("assigns users and agents only from admin inventory with payment records", () => {
    assert.match(migration, /create or replace function public\.worldcup_admin_assign_user_ticket/);
    assert.match(migration, /create or replace function public\.worldcup_admin_assign_agent_tickets/);
    assert.match(migration, /status = 'admin'[\s\S]*?admin_user_id = p_admin_user_id/);
    assert.match(migration, /'admin_to_user'/);
    assert.match(migration, /'admin_to_agent'/);
    assert.match(migration, /v_payment_method not in \('cash', 'usdt'\)/);
    assert.match(migration, /'personalTicketAssigned', v_personal_ticket_assigned/);
    assert.match(migration, /'commissionTicketNumbers', v_commission_ticket_numbers/);
  });

  it("keeps inventory mutation RPCs service-role only", () => {
    const signatures = [
      "public.worldcup_admin_request_ticket_inventory(uuid, uuid, integer, text)",
      "public.worldcup_admin_assign_user_ticket(uuid, uuid, uuid, integer, text, text, text)",
      "public.worldcup_admin_assign_agent_tickets(uuid, uuid, uuid, integer, text, text, text)",
    ];

    for (const signature of signatures) {
      const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(migration, new RegExp(`revoke execute on function ${escaped}\\s+from public, anon, authenticated;`));
      assert.match(migration, new RegExp(`grant execute on function ${escaped}\\s+to service_role;`));
    }
  });

  it("routes admin requests through inventory RPCs", () => {
    assert.match(adminAgentsRoute, /request_inventory/);
    assert.match(adminAgentsRoute, /worldcup_admin_request_ticket_inventory/);
    assert.match(adminAgentsRoute, /worldcup_admin_assign_agent_tickets/);
    assert.match(adminAgentsRoute, /paymentMethod/);
    assert.match(adminAgentsRoute, /accounting/);
    assert.match(adminAgentsRoute, /prizePoolAmount/);
    assert.match(adminAgentsRoute, /feePoolAmount/);
    assert.match(adminAgentsRoute, /financialMovements/);
    assert.match(adminTicketsRoute, /worldcup_admin_assign_user_ticket/);
    assert.match(adminTicketsRoute, /paymentMethod/);
    assert.doesNotMatch(adminTicketsRoute, /from\("worldcup_tickets"\)\.insert/);
  });

  it("shows the admin workflow and financial statement in the console", () => {
    assert.match(adminConsole, /Request Tickets/);
    assert.match(adminConsole, /Request 2,000/);
    assert.match(adminConsole, /requestAdminTickets\(2000\)/);
    assert.match(adminConsole, /agentPool\.admin/);
    assert.match(adminConsole, /Assign user ticket/);
    assert.match(adminConsole, /Assign Tickets for Agents/);
    assert.match(adminConsole, /Payment method/);
    assert.match(adminConsole, /Financial statement/);
    assert.match(adminConsole, /Prize pool \(net\)/);
    assert.match(adminConsole, /Fee pool/);
    assert.match(adminConsole, /Paid value/);
    assert.match(adminConsole, /bonus value/);
    assert.match(adminConsole, /accountedGross/);
    assert.match(adminConsole, /getMovementTicketSummary/);
  });
});
