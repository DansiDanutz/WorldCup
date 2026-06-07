import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260602015500_worldcup_shared_deposit_claims.sql",
  "utf8",
);
const processingMigration = readFileSync(
  "supabase/migrations/20260602023000_worldcup_deposit_claim_processing.sql",
  "utf8",
);
const senderWalletMigration = readFileSync(
  "supabase/migrations/20260603083000_worldcup_manual_usdt_incoming_transfers.sql",
  "utf8",
);
const frozenSenderWalletMigration = readFileSync(
  "supabase/migrations/20260605043000_worldcup_frozen_usdt_sender_wallets.sql",
  "utf8",
);
const autoTicketMigration = readFileSync(
  "supabase/migrations/20260606003000_worldcup_auto_ticket_from_accepted_usdt.sql",
  "utf8",
);
const migrations = `${migration}\n${processingMigration}\n${senderWalletMigration}\n${frozenSenderWalletMigration}\n${autoTicketMigration}`;
const adminRoute = readFileSync("src/app/api/admin/deposit-claims/route.ts", "utf8");
const userClaimRoute = readFileSync("src/app/api/deposits/claims/route.ts", "utf8");
const userCheckRoute = readFileSync("src/app/api/deposits/check/route.ts", "utf8");
const senderWalletRoute = readFileSync("src/app/api/deposits/sender-wallet/route.ts", "utf8");
const depositsHelper = readFileSync("src/lib/deposits.ts", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");

describe("shared deposit claim migration", () => {
  it("stores the player identity snapshot needed for manual crediting", () => {
    assert.match(migration, /user_id uuid not null/);
    assert.match(migration, /user_email text/);
    assert.match(migration, /display_name text/);
    assert.match(migration, /address text not null/);
    assert.match(migration, /tx_hash text not null/);
    assert.match(migration, /unique \(network, tx_hash\)/);
    assert.match(senderWalletMigration, /add column if not exists sender_wallet_address text/);
    assert.match(senderWalletMigration, /usdt_sender_wallet_address text/);
    assert.match(senderWalletMigration, /usdt_sender_wallet_network text/);
    assert.match(senderWalletMigration, /worldcup_referral_profiles_usdt_sender_wallet_idx/);
    assert.match(frozenSenderWalletMigration, /usdt_sender_wallet_trc20_address text/);
    assert.match(frozenSenderWalletMigration, /usdt_sender_wallet_erc20_address text/);
    assert.match(frozenSenderWalletMigration, /worldcup_prevent_usdt_sender_wallet_change/);
    assert.match(frozenSenderWalletMigration, /USDT_TRC20_SENDER_WALLET_LOCKED/);
    assert.match(frozenSenderWalletMigration, /USDT_ERC20_SENDER_WALLET_LOCKED/);
  });

  it("shows users the exact receive wallet tied to each submitted claim", () => {
    assert.match(userClaimRoute, /select\("id,network,address,sender_wallet_address,amount,currency,tx_hash,status,admin_note,created_at,credited_at"\)/);
    assert.match(userClaimRoute, /address: row\.address/);
    assert.match(userClaimRoute, /senderWalletAddress: row\.sender_wallet_address/);
    assert.match(walletScreen, /type DepositClaim = \{[\s\S]*?address: string;/);
    assert.match(walletScreen, /senderWalletAddress: string \| null;/);
    assert.match(walletScreen, /getDepositExplorerAddressUrl\(claim\.network, claim\.address\)/);
    assert.match(walletScreen, /View receive wallet/);
  });

  it("requires and saves the sender wallet used for manual incoming transfers", () => {
    assert.match(userClaimRoute, /normalizeDepositAddress/);
    assert.match(userClaimRoute, /requireString\(body\.senderWalletAddress, "Sending wallet address"/);
    assert.match(userClaimRoute, /Sending wallet address must match the selected network/);
    assert.match(userClaimRoute, /getSavedSenderWalletForNetwork\(profile, network\)/);
    assert.match(userClaimRoute, /getSenderWalletLockMismatchMessage\(network\)/);
    assert.match(userClaimRoute, /buildFrozenSenderWalletUpdate/);
    assert.match(userClaimRoute, /sender_wallet_address: senderWalletAddress/);
    assert.match(senderWalletRoute, /deposit-sender-wallet/);
    assert.match(senderWalletRoute, /buildFrozenSenderWalletUpdate/);
    assert.match(senderWalletRoute, /getSavedSenderWalletForNetwork\(profile, network\)/);
    assert.match(senderWalletRoute, /getSenderWalletLockMismatchMessage\(network\)/);
    assert.match(depositsHelper, /Deposits from another wallet cannot be credited/);
    assert.match(walletScreen, /const \[claimSenderWalletAddress, setClaimSenderWalletAddress\]/);
    assert.match(walletScreen, /USDT sender wallets/);
    assert.match(walletScreen, /TRC20 and ERC20 are separate/);
    assert.match(walletScreen, /Once a wallet is saved, it cannot be changed/);
    assert.match(walletScreen, /pasteSenderWallet/);
    assert.match(walletScreen, /Save wallet/);
    assert.match(walletScreen, /Confirm locked wallet/);
    assert.match(walletScreen, /formatMaskedWalletAddress/);
    assert.match(walletScreen, /senderWalletAddress,/);
    assert.match(walletScreen, /!claimSenderWalletAddress/);
    assert.match(walletScreen, /View sending wallet/);
  });

  it("keeps receive QR codes hidden until the matching sender wallet is locked", () => {
    assert.match(walletScreen, /const lockedDepositAddresses = useMemo/);
    assert.match(walletScreen, /addresses\.filter\(\(entry\) =>/);
    assert.match(walletScreen, /return Boolean\(network && savedSenderWallets\[network\]\)/);
    assert.match(walletScreen, /lockedDepositAddresses\.map/);
    assert.match(walletScreen, /The matching QR and receive address appear here only\s+after your sender wallet is locked/);
    assert.match(walletScreen, /The deposit\s+QR and receive address stay hidden until your wallet is saved/);
    assert.match(walletScreen, /Agent deposit QR codes and\s+receive addresses stay hidden until the matching sender wallet is saved/);
    assert.match(walletScreen, /disabled=\{!lockedClaimSenderWallet \|\| isPending\}/);
    assert.doesNotMatch(walletScreen, /Deposits credit automatically after on-chain confirmation/);
  });

  it("lets users detect KuCoin deposits from a locked sender-wallet setup", () => {
    assert.match(userCheckRoute, /deposit-check/);
    assert.match(userCheckRoute, /getSavedSenderWalletForNetwork\(profile, network\)/);
    assert.match(userCheckRoute, /getSavedSenderWalletUpdatedAtForNetwork\(profile, network\)/);
    assert.match(userCheckRoute, /listMainAccountDeposits/);
    assert.match(userCheckRoute, /getKucoinMainDepositTxHash/);
    assert.match(userCheckRoute, /worldcup_deposit_claims/);
    assert.match(userCheckRoute, /sender_wallet_address: senderWalletAddress/);
    assert.match(userCheckRoute, /alreadySubmitted/);
    assert.match(userCheckRoute, /Deposit found\. Admin can now accept it from Incoming transfers/);
    assert.match(walletScreen, /fetch\("\/api\/deposits\/check"/);
    assert.match(walletScreen, /Check for deposit reads KuCoin and creates a review row for Admin/);
    assert.doesNotMatch(walletScreen, /<h3 className="panel-title">Submit transaction<\/h3>/);
  });

  it("keeps claims owner-readable and admin/server writable only", () => {
    assert.match(migration, /enable row level security/);
    assert.match(migration, /worldcup_deposit_claims_owner_read/);
    assert.match(migration, /auth\.uid\(\) = user_id/);
  });

  it("keeps admin review actions optimistic and state-specific", () => {
    assert.match(migrations, /status in \('submitted', 'processing', 'credited', 'rejected'\)/);
    assert.match(adminRoute, /\.eq\("status", "submitted"\)/);
    assert.match(adminRoute, /status: "processing"/);
    assert.match(adminRoute, /\.eq\("status", "processing"\)/);
    assert.match(adminRoute, /releaseProcessingClaim/);
    assert.match(adminRoute, /maybeSingle\(\)/);
    assert.match(adminRoute, /Deposit claim is already credited/);
    assert.match(adminRoute, /Deposit claim is already rejected/);
    assert.match(adminRoute, /Deposit claim is currently being credited/);
  });

  it("lets admins credit the verified USDT amount with an audit note", () => {
    assert.match(adminRoute, /parseDepositAmount\(body\.amount\)/);
    assert.match(adminRoute, /Admin note is required before crediting a deposit claim/);
    assert.match(adminRoute, /requireKucoinMatch = body\.requireKucoinMatch === true/);
    assert.match(adminRoute, /requireKucoinMatch && kucoinVerification\.status !== "matched"/);
    assert.match(adminRoute, /KuCoin matched verification is required before crediting this launch-evidence deposit claim/);
    assert.match(adminRoute, /manual non-launch credit/);
    assert.doesNotMatch(adminRoute, /normalizeMoneyAmount\(requirePositiveAmount\(body\.amount/);
    assert.match(adminRoute, /getClaimKucoinVerification\(row, amount\)/);
    assert.match(adminRoute, /kucoinMainVerification/);
    assert.match(adminRoute, /amountMatchesCredit/);
    assert.match(adminRoute, /worldcup_credit_deposit_and_auto_ticket/);
    assert.match(adminRoute, /p_auto_ticket: true/);
    assert.match(autoTicketMigration, /create or replace function public\.worldcup_credit_deposit_and_auto_ticket/);
    assert.match(autoTicketMigration, /public\.worldcup_credit_deposit\(/);
    assert.match(autoTicketMigration, /v_balance < v_ticket_price/);
    assert.match(autoTicketMigration, /worldcup_wallet_lock_key\(p_tournament_id, p_user_id\)/);
    assert.match(autoTicketMigration, /status = 'admin'/);
    assert.match(autoTicketMigration, /transaction_type,\s+note,\s+created_by[\s\S]*?'ticket_purchase'/);
    assert.match(autoTicketMigration, /movement_type,[\s\S]*?'admin_to_user'/);
    assert.match(adminRoute, /userId: reservedRow\.user_id/);
    assert.match(adminRoute, /network: reservedRow\.network/);
    assert.match(adminRoute, /address: reservedRow\.address/);
    assert.match(adminRoute, /senderWalletAddress: reservedRow\.sender_wallet_address/);
    assert.match(adminRoute, /txHash: reservedRow\.tx_hash/);
    assert.match(adminRoute, /currency: reservedRow\.currency/);
    assert.match(adminRoute, /creditedBy: actor/);
    assert.match(adminConsole, /Credit amount/);
    assert.match(adminConsole, /Admin note/);
    assert.match(adminConsole, /Claim ID: \{claim\.id\}/);
    assert.match(adminConsole, /Credit requires an admin note for the audit trail/);
    assert.match(adminConsole, /Require KuCoin match for launch evidence/);
    assert.match(adminConsole, /receive-wallet match/);
    assert.match(adminConsole, /self-reported sender wallet/);
    assert.match(adminConsole, /cross-check it against the public transaction before crediting/);
    assert.match(adminConsole, /Run Verify KuCoin first/);
    assert.match(adminConsole, /Manual non-launch credit is allowed/);
    assert.match(adminConsole, /requireKucoinMatch: claim\.status === "submitted"/);
    assert.match(adminConsole, /verification\?\.status === "matched"/);
    assert.match(adminConsole, /disabled=\{!canCredit\}/);
    assert.match(adminConsole, /adminNote: draft\?\.note/);
    assert.match(adminConsole, /amount: action === "credit" \? draft\?\.amount/);
    assert.match(adminConsole, /requireKucoinMatch:[\s\S]*action === "credit" \? draft\?\.requireKucoinMatch === true/);
    assert.match(adminConsole, /autoTicket/);
    assert.match(adminConsole, /generated automatically/);
  });

  it("shows incoming transfers with sender wallet and account role in admin", () => {
    assert.match(adminRoute, /worldcup_agents/);
    assert.match(adminRoute, /accountRole/);
    assert.match(adminConsole, /Incoming transfers/);
    assert.match(adminConsole, /Manual USDT payment history with sender wallet, amount, and agent\/user status/);
    assert.match(adminConsole, /Incoming from: \{claim\.senderWalletAddress\}/);
    assert.match(adminConsole, /WorldCup receive wallet: \{claim\.address\}/);
    assert.match(adminConsole, /claim\.accountRole === "agent" \? "Agent" : "User"/);
    assert.match(adminConsole, /No sender wallet captured on this older claim/);
  });

  it("lets admins verify shared-wallet claims against KuCoin before crediting", () => {
    assert.match(adminRoute, /action === "verify"/);
    assert.match(adminRoute, /getKucoinMainConfig/);
    assert.match(adminRoute, /listMainAccountDeposits/);
    assert.match(adminRoute, /findMatchingMainDeposit/);
    assert.match(adminRoute, /status: "matched"/);
    assert.match(adminRoute, /status: "missing"/);
    assert.match(adminRoute, /status: "unavailable"/);
    assert.match(adminRoute, /No matching successful KuCoin deposit was found for this transaction hash and credit amount/);
    assert.match(adminConsole, /Verify KuCoin/);
    assert.match(adminConsole, /KuCoin confirmed/);
    assert.match(adminConsole, /Sender wallet is self-reported/);
    assert.match(adminConsole, /Verify manually in KuCoin/);
  });

  it("enforces optional responsible deposit claim limits before saving a claim", () => {
    assert.match(userClaimRoute, /loadOperatorPolicy/);
    assert.match(userClaimRoute, /isPaidActionLaunchTestAdmin\(auth\.user\.email\)/);
    assert.match(userClaimRoute, /getUserPaidActionGate\(auth\.supabase, "deposit"/);
    assert.match(userClaimRoute, /USDT deposits are unavailable right now/);
    assert.match(userClaimRoute, /getDepositLimitConfigFromPolicy\(operatorPolicy\)/);
    assert.match(userClaimRoute, /sumActiveDepositClaimAmounts/);
    assert.match(userClaimRoute, /getDepositClaimLimitViolation/);
    assert.match(userClaimRoute, /Could not verify deposit limits/);
    assert.match(depositsHelper, /WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT/);
    assert.match(depositsHelper, /WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT/);
  });
});
