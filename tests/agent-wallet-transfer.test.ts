import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260604213000_worldcup_agent_wallet_direct_transfers.sql",
  "utf8",
);
const transferRoute = readFileSync("src/app/api/agent/tickets/transfer/route.ts", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");
const myStanding = readFileSync("src/components/my-standing.tsx", "utf8");
const standingRoute = readFileSync("src/app/api/me/standing/route.ts", "utf8");
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

  it("surfaces the next available agent code with a copy-only action", () => {
    assert.match(walletScreen, /nextAgentCode = agent\?\.availableCodes\[0\]/);
    assert.match(walletScreen, /Next code to sell/);
    assert.match(walletScreen, /Copy code/);
    assert.doesNotMatch(walletScreen, /refreshAgentCodes/);
    assert.doesNotMatch(walletScreen, /onClick=\{refreshAgentCodes\}/);
    assert.match(walletScreen, /window\.setInterval\(loadAgent, 15_000\)/);
    assert.match(walletScreen, /visibilitychange/);
    assert.match(globalsCss, /\.next-agent-code-card/);
    assert.match(globalsCss, /\.next-agent-code-card__actions/);
  });

  it("shows the next available agent code on the dashboard standing card", () => {
    assert.match(standingRoute, /\.select\("code,kind,assigned_at", \{ count: "exact" \}\)/);
    assert.match(standingRoute, /function formatAgentCodeRecord/);
    assert.match(standingRoute, /nextAvailableCode/);
    assert.match(standingRoute, /lastAssignedCode/);
    assert.match(standingRoute, /lastPaidCode/);
    assert.match(standingRoute, /lastCommissionCode/);
    assert.match(standingRoute, /\.eq\("kind", "paid"\)/);
    assert.match(standingRoute, /\.eq\("kind", "commission"\)/);
    assert.match(standingRoute, /\.not\("assigned_at", "is", null\)/);
    assert.match(standingRoute, /topLeaderboard/);
    assert.match(standingRoute, /\.limit\(10\)/);
    assert.match(standingRoute, /leaderboardTop/);
    assert.match(myStanding, /nextAvailableCode: \{ code: string; kind: string \} \| null/);
    assert.match(myStanding, /lastAssignedCode: AgentCodeRecord \| null/);
    assert.match(myStanding, /lastPaidCode: AgentCodeRecord \| null/);
    assert.match(myStanding, /lastCommissionCode: AgentCodeRecord \| null/);
    assert.match(myStanding, /function formatAgentRecordDate/);
    assert.match(myStanding, /function AgentRecordTime/);
    assert.match(myStanding, /Last assigned/);
    assert.match(myStanding, /Last bought/);
    assert.match(myStanding, /Last bonus/);
    assert.match(myStanding, /agentCodeOpen, setAgentCodeOpen/);
    assert.match(myStanding, /agent-gift-trigger/);
    assert.match(myStanding, /aria-expanded=\{agentCodeOpen\}/);
    assert.match(myStanding, /standing-agent-code--revealed/);
    assert.match(myStanding, /Next code to sell/);
    assert.match(myStanding, /Copy code/);
    assert.doesNotMatch(myStanding, /RefreshCw/);
    assert.doesNotMatch(myStanding, /refreshAgentStanding/);
    assert.match(myStanding, /window\.setInterval\(refreshStanding, 15_000\)/);
    assert.match(myStanding, /visibilitychange/);
    assert.match(globalsCss, /\.agent-gift-trigger/);
    assert.match(globalsCss, /@keyframes wc-agent-gift-breathe/);
    assert.match(globalsCss, /@keyframes wc-agent-code-reveal/);
    assert.match(globalsCss, /\.standing-agent-code/);
    assert.match(globalsCss, /\.standing-agent-code__actions/);
  });

  it("keeps USDT deposit proof available in Agent Wallet", () => {
    assert.match(walletScreen, /Deposit USDT for agent tickets/);
    assert.match(walletScreen, /Submit agent deposit proof/);
    assert.match(walletScreen, /Admin uses it before assigning paid agent tickets/);
    assert.match(walletScreen, /Use the USDT sender wallets box above/);
    assert.match(walletScreen, /Prepare \{claimNetworkLabel\} sender wallet/);
    assert.doesNotMatch(walletScreen, /Lock \{claimNetworkLabel\} sender wallet/);
    assert.match(globalsCss, /\.agent-deposit-box/);
    assert.match(globalsCss, /\.sender-wallet-required/);
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
