import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604154000_worldcup_user_ticket_transfers.sql",
  "utf8",
);
const adminOnlyTicketingMigration = readFileSync(
  "supabase/migrations/20260605052000_worldcup_admin_only_money_ticketing.sql",
  "utf8",
);
const autoTicketMigration = readFileSync(
  "supabase/migrations/20260606003000_worldcup_auto_ticket_from_accepted_usdt.sql",
  "utf8",
);
const transferRoute = readFileSync("src/app/api/tickets/transfer/route.ts", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");

describe("user ticket transfers", () => {
  it("moves one available ticket atomically and stores referral attribution", () => {
    assert.match(migration, /create or replace function public\.worldcup_transfer_ticket/);
    assert.match(migration, /transferred_from_user_id uuid/);
    assert.match(migration, /source_referrer_user_id uuid/);
    assert.match(migration, /source_referral_code text/);
    assert.match(migration, /for update skip locked/);
    assert.match(migration, /raise exception 'NO_AVAILABLE_TICKET'/);
    assert.match(migration, /source_referrer_user_id = p_from_user_id/);
    assert.match(migration, /source_referral_code = v_sender_referral_code/);
  });

  it("keeps public wallet buying disabled while accepted USDT can issue the first ticket", () => {
    assert.match(adminOnlyTicketingMigration, /create or replace function public\.worldcup_credit_deposit/);
    assert.doesNotMatch(adminOnlyTicketingMigration, /perform public\.worldcup_purchase_ticket/);
    assert.match(adminOnlyTicketingMigration, /manual admin ticket assignment/);
    assert.match(adminOnlyTicketingMigration, /ADMIN_TICKET_ASSIGNMENT_REQUIRED/);
    assert.match(autoTicketMigration, /worldcup_credit_deposit_and_auto_ticket/);
    assert.match(autoTicketMigration, /Entry ticket automatically issued from accepted USDT deposit/);
    assert.match(autoTicketMigration, /status = 'admin'/);
    assert.match(walletScreen, /Accepted USDT turns the first 50 USDT into one ticket/);
    assert.match(walletScreen, /Admin accepts the matching transfer before balance is credited/);
  });

  it("lets transferred tickets create the sender referral when the entry is locked", () => {
    assert.match(migration, /v_ticket\.source_referrer_user_id/);
    assert.match(migration, /v_effective_referrer_user_id := v_ticket\.source_referrer_user_id/);
    assert.match(migration, /v_effective_referral_code := v_ticket\.source_referral_code/);
    assert.match(migration, /insert into public\.worldcup_referrals/);
    assert.match(migration, /inviter_user_id = excluded\.inviter_user_id/);
  });

  it("keeps transfer callable only by the service role through the server route", () => {
    assert.match(migration, /revoke execute on function public\.worldcup_transfer_ticket\(uuid, uuid, uuid\)/);
    assert.match(migration, /grant execute on function public\.worldcup_transfer_ticket\(uuid, uuid, uuid\)\s+to service_role/);
    assert.match(transferRoute, /requireString\(body\.email, "Friend email"/);
    assert.match(transferRoute, /\.eq\("email", recipientEmail\)/);
    assert.match(transferRoute, /requiresConfirmation: true/);
    assert.match(transferRoute, /worldcup_transfer_ticket/);
  });

  it("surfaces the two-step transfer workflow in the User Wallet", () => {
    assert.match(walletScreen, /User Wallet/);
    assert.match(walletScreen, /Transfer ticket to a friend/);
    assert.match(walletScreen, /Friend email/);
    assert.match(walletScreen, /Find/);
    assert.match(walletScreen, /Send 1 ticket/);
  });

  it("hides user deposit and ticket purchase prompts after a user ticket is available", () => {
    assert.match(walletScreen, /const accountStatusLoaded = status !== null/);
    assert.match(walletScreen, /const userTicketsAvailable = status\?\.ticketsAvailable \?\? 0/);
    assert.match(walletScreen, /const userTicketsAssigned = status\?\.ticketsAssigned \?\? 0/);
    assert.match(walletScreen, /const userEntryStatus = status\?\.entry\?\.status \?\? null/);
    assert.match(walletScreen, /const userHasAvailableEntryTicket = userTicketsAvailable > 0/);
    assert.match(walletScreen, /const userHasPersonalTicketRecord =/);
    assert.match(walletScreen, /userTicketsAssigned > 0 \|\| userHasAvailableEntryTicket \|\| Boolean\(userEntryStatus\)/);
    assert.match(walletScreen, /const userNeedsEntryTicket = accountStatusLoaded && !userHasPersonalTicketRecord/);
    assert.match(walletScreen, /entry: me\.entry \?\? null/);
    assert.match(walletScreen, /User Wallet ticket covered/);
    assert.match(walletScreen, /User Wallet deposits are hidden once your entry ticket is assigned or used/);
    assert.match(walletScreen, /aria-label="User wallet ticket covered"/);
    assert.match(walletScreen, /User Wallet\s+USDT deposit actions are hidden/);
    assert.match(walletScreen, /userNeedsEntryTicket\s*\?\s*\(/);
    assert.match(walletScreen, /Deposit actions stay hidden until your wallet status is loaded/);
    assert.match(walletScreen, /Deposit USDT for agent tickets/);
  });
});
