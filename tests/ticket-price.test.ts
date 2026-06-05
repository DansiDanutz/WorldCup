import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { normalizeWorldCupTicketPriceAmount } from "../src/lib/worldcup-ticket-price.ts";

const migration = readFileSync(
  "supabase/migrations/20260605033000_worldcup_ticket_price_default_50.sql",
  "utf8",
);
const salePriceGuardMigration = readFileSync(
  "supabase/migrations/20260605070000_worldcup_admin_ticket_sale_price_guard.sql",
  "utf8",
);
const adminAgentsRoute = readFileSync("src/app/api/admin/agents/route.ts", "utf8");
const adminTicketsRoute = readFileSync("src/app/api/admin/tickets/route.ts", "utf8");
const adminPrizePoolRoute = readFileSync("src/app/api/admin/prize-pool/route.ts", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");
const worldcupData = readFileSync("src/lib/worldcup-data.ts", "utf8");
const dashboard = readFileSync("src/components/dashboard.tsx", "utf8");
const wallet = readFileSync("src/components/wallet-screen.tsx", "utf8");
const ticketPriceHelper = readFileSync("src/lib/worldcup-ticket-price.ts", "utf8");

describe("WorldCup ticket price", () => {
  it("defaults ticket price storage to 50 without hard-locking admin changes", () => {
    assert.match(migration, /alter column ticket_price_amount set default 50\.00/);
    assert.match(migration, /set ticket_price_amount = 50\.00/);
    assert.match(migration, /where coalesce\(ticket_price_amount, 0\) <= 0/);
    assert.doesNotMatch(migration, /check \(ticket_price_amount = 50\.00\)/);
  });

  it("repairs zero-priced tickets and financial movements", () => {
    assert.match(migration, /set price_amount = tour\.ticket_price_amount/);
    assert.match(migration, /set ticket_price_amount = tour\.ticket_price_amount/);
    assert.match(migration, /total_amount = round\(\(tour\.ticket_price_amount \* m\.quantity\)::numeric, 2\)/);
    assert.match(migration, /ticket_price_default_50_repair/);
    assert.match(migration, /source_type = 'admin_ticket_movement'/);
  });

  it("uses the current tournament price when agent inventory creates user tickets", () => {
    assert.match(migration, /v_ticket_price numeric\(12,2\)/);
    assert.match(migration, /select ticket_price_amount into v_ticket_price/);
    assert.match(migration, /'agent_code'[\s\S]*?v_code\.agent_user_id/);
    assert.match(migration, /'agent_call'[\s\S]*?p_agent_user_id/);
    assert.match(migration, /'agent_transfer'[\s\S]*?p_agent_user_id/);
    assert.doesNotMatch(migration, /p_user_id,\s+0,\s+'agent_code'/);
    assert.doesNotMatch(migration, /requester_user_id,\s+0,\s+'agent_call'/);
    assert.doesNotMatch(migration, /p_to_user_id,\s+0,\s+'agent_transfer'/);
  });

  it("keeps admin price editing positive and preserves a 50 fallback in UI/API reads", () => {
    assert.match(ticketPriceHelper, /DEFAULT_WORLDCUP_TICKET_PRICE_AMOUNT = "50\.00"/);
    assert.match(ticketPriceHelper, /parsed <= 0/);
    assert.match(adminTicketsRoute, /requirePositiveAmount\(body\.ticketPriceAmount, "Ticket price"\)/);
    assert.match(worldcupData, /normalizeWorldCupTicketPriceAmount\(tournament\.ticket_price_amount\)/);
    assert.match(dashboard, /normalizeWorldCupTicketPriceAmount\(result\.ticketPriceAmount\)/);
    assert.match(wallet, /normalizeWorldCupTicketPriceAmount\(me\.ticketPriceAmount\)/);
    assert.match(dashboard, /const ticketPriceAmount = normalizeWorldCupTicketPriceNumber\(myAccountStatus\?\.ticketPriceAmount\)/);
    assert.match(wallet, /const ticketPrice = normalizeWorldCupTicketPriceNumber\(status\?\.ticketPriceAmount\)/);
    assert.equal(normalizeWorldCupTicketPriceAmount("0.00"), "50.00");
  });

  it("blocks zero-price admin ticket sales before they can skip prize-pool funding", () => {
    assert.match(salePriceGuardMigration, /worldcup_tournaments_ticket_price_positive/);
    assert.match(salePriceGuardMigration, /check \(ticket_price_amount > 0\)/);
    assert.match(salePriceGuardMigration, /create or replace function public\.worldcup_guard_admin_ticket_sale_price/);
    assert.match(salePriceGuardMigration, /new\.movement_type not in \('admin_to_agent', 'admin_to_user'\)/);
    assert.match(salePriceGuardMigration, /coalesce\(new\.ticket_price_amount, 0\) <= 0/);
    assert.match(salePriceGuardMigration, /raise exception 'INVALID_TICKET_PRICE'/);
    assert.match(salePriceGuardMigration, /before insert or update/);
    assert.match(adminTicketsRoute, /INVALID_TICKET_PRICE/);
    assert.match(adminAgentsRoute, /INVALID_TICKET_PRICE/);
  });

  it("makes prize-pool accounting ledger-managed instead of manually editable", () => {
    assert.doesNotMatch(adminPrizePoolRoute, /\.update\(\{[\s\S]*?prize_pool_amount/);
    assert.match(adminPrizePoolRoute, /Prize pool is ledger-managed/);
    assert.match(adminPrizePoolRoute, /Assign user or agent tickets from admin inventory/);
    assert.match(adminConsole, /Prize pool is ledger-managed/);
    assert.match(adminConsole, /No direct override is\s+available/);
    assert.doesNotMatch(adminConsole, /Save Override/);
    assert.doesNotMatch(adminConsole, /Manual prize pool override/);
  });
});
