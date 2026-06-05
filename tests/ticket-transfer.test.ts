import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604154000_worldcup_user_ticket_transfers.sql",
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

  it("auto-converts credited deposits into full tickets and leaves only the USDT remainder", () => {
    assert.match(migration, /create or replace function public\.worldcup_credit_deposit/);
    assert.match(migration, /select ticket_price_amount into v_price/);
    assert.match(migration, /v_tickets_to_purchase := floor\(v_balance \/ v_price\)::integer/);
    assert.match(migration, /perform public\.worldcup_purchase_ticket\(p_user_id, p_tournament_id\)/);
    assert.match(walletScreen, /Full ticket-price chunks convert into tickets automatically/);
    assert.match(walletScreen, /100 USDT becomes 2 tickets at 50 USDT each/);
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
    assert.match(walletScreen, /const userHasEntryTicket =/);
    assert.match(walletScreen, /const userNeedsEntryTicket = accountStatusLoaded && !userHasEntryTicket/);
    assert.match(walletScreen, /User Wallet ticket ready/);
    assert.match(walletScreen, /User Wallet deposits are hidden once your entry ticket is available/);
    assert.match(walletScreen, /User Wallet USDT deposit and ticket-buy\s+actions are hidden/);
    assert.match(walletScreen, /userNeedsEntryTicket\s*\?\s*\(/);
    assert.match(walletScreen, /Deposit actions stay hidden until your wallet status is loaded/);
    assert.match(walletScreen, /Deposit USDT for agent tickets/);
  });
});
