import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604213000_worldcup_agent_wallet_direct_transfers.sql",
  "utf8",
);
const transferRoute = readFileSync("src/app/api/agent/tickets/transfer/route.ts", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");
const globalsCss = readFileSync("src/app/globals.css", "utf8");

describe("agent wallet direct transfers", () => {
  it("keeps User Wallet and Agent Wallet as explicit wallet modes", () => {
    assert.match(walletScreen, /walletView, setWalletView/);
    assert.match(walletScreen, /User Wallet/);
    assert.match(walletScreen, /Agent Wallet/);
    assert.match(walletScreen, /wallet-view-switch/);
    assert.match(walletScreen, /wallet-grid--\$\{walletView\}/);
    assert.match(globalsCss, /\.wallet-view-switch/);
    assert.match(globalsCss, /\.wallet-view-tab\.active/);
  });

  it("shows an active agent email transfer workflow in the Agent Wallet", () => {
    assert.match(walletScreen, /agentTransferEmail/);
    assert.match(walletScreen, /Transfer ticket to a user/);
    assert.match(walletScreen, /Send 1 agent ticket/);
    assert.match(walletScreen, /\/api\/agent\/tickets\/transfer/);
    assert.match(walletScreen, /Existing inviter referrals are not overwritten/);
    assert.match(globalsCss, /\.agent-transfer-box/);
  });

  it("adds a server route that verifies an email before consuming agent inventory", () => {
    assert.match(transferRoute, /agent-ticket-transfer/);
    assert.match(transferRoute, /requireString\(body\.email, "User email"/);
    assert.match(transferRoute, /\.from\("worldcup_referral_profiles"\)/);
    assert.match(transferRoute, /\.eq\("email", recipientEmail\)/);
    assert.match(transferRoute, /requiresConfirmation: true/);
    assert.match(transferRoute, /worldcup_agent_transfer_ticket/);
    assert.match(transferRoute, /AGENT_NO_TICKETS/);
  });

  it("mints agent tickets with fallback referral attribution without replacing explicit referrals", () => {
    assert.match(migration, /create or replace function public\.worldcup_agent_transfer_ticket/);
    assert.match(migration, /assigned_by,\s+source_agent_id,\s+source_referrer_user_id,\s+source_referral_code/);
    assert.match(migration, /'agent_transfer'/);
    assert.match(migration, /'agent_call'/);
    assert.match(migration, /'agent_code'/);
    assert.match(migration, /only becomes the inviter when the player had no referral/);
    assert.match(migration, /select referral_code into v_agent_referral_code/);
    assert.match(migration, /for update skip locked/);
    assert.match(migration, /revoke execute on function public\.worldcup_agent_transfer_ticket/);
    assert.match(migration, /grant execute on function public\.worldcup_agent_transfer_ticket\(uuid, uuid, uuid\)\s+to service_role/);
  });
});
