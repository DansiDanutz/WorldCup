import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  getLaunchSignoffEvidenceStatus,
  getVerifiedDepositEvidenceStatus,
  getVerifiedWithdrawalEvidenceStatus,
} from "../src/lib/launch-signoff-evidence.ts";
import {
  buildLaunchSignoffAuditContext,
  getCurrentLegalApprovalEvidenceNoteRequirement,
  getLaunchSignoffEvidenceGuidance,
  getLaunchSignoffEvidenceNoteRequirement,
  getLaunchSignoffEvidenceUrlRequirement,
  isCurrentLegalApprovalEvidenceNote,
  isLaunchSignoffEvidenceUrl,
  requiresLaunchSignoffEvidenceNote,
} from "../src/lib/launch-signoffs.ts";

const migration = readFileSync(
  "supabase/migrations/20260602033000_worldcup_launch_signoffs.sql",
  "utf8",
);
const helper = readFileSync("src/lib/launch-signoffs.ts", "utf8");
const evidenceHelper = readFileSync("src/lib/launch-signoff-evidence.ts", "utf8");
const adminRoute = readFileSync("src/app/api/admin/launch-signoffs/route.ts", "utf8");
const adminEvidenceRoute = readFileSync("src/app/api/admin/launch-evidence/route.ts", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");

describe("launch sign-offs", () => {
  it("creates a private launch sign-off table with required evidence keys", () => {
    assert.match(migration, /create table if not exists public\.worldcup_launch_signoffs/);
    assert.match(migration, /alter table public\.worldcup_launch_signoffs enable row level security/);
    assert.match(migration, /revoke all on table public\.worldcup_launch_signoffs from anon/);
    assert.match(migration, /real_usdt_trc20_deposit_test/);
    assert.match(migration, /real_usdt_erc20_deposit_test/);
    assert.match(migration, /real_usdt_withdrawal_payout_test/);
    assert.match(migration, /operator_policy_review/);
    assert.match(migration, /legal_compliance_review/);
  });

  it("keeps required sign-offs centralized in the typed helper", () => {
    assert.match(helper, /REQUIRED_LAUNCH_SIGNOFFS/);
    assert.match(helper, /PAYMENT_LAUNCH_SIGNOFF_KEYS/);
    assert.match(helper, /NON_WAIVABLE_LAUNCH_SIGNOFF_KEYS/);
    assert.match(helper, /APPROVAL_EVIDENCE_URL_REQUIRED_LAUNCH_SIGNOFF_KEYS/);
    assert.match(helper, /"operator_policy_review"/);
    assert.match(helper, /isPaymentLaunchSignoffKey/);
    assert.match(helper, /isNonWaivableLaunchSignoffKey/);
    assert.match(helper, /isApprovalEvidenceUrlRequiredLaunchSignoffKey/);
    assert.match(helper, /loadLaunchSignoffs/);
    assert.match(helper, /normalizeLaunchSignoffStatus/);
    assert.match(helper, /isCurrentLegalApprovalEvidenceNote/);
    assert.match(helper, /getCurrentLegalApprovalEvidenceNoteRequirement/);
    assert.match(helper, /requiresLaunchSignoffEvidenceNote/);
    assert.match(helper, /getLaunchSignoffEvidenceNoteRequirement/);
    assert.match(helper, /getLaunchSignoffEvidenceGuidance/);
    assert.match(helper, /evidenceTarget/);
    assert.match(helper, /evidenceActionLabel/);
    assert.match(helper, /evidenceRequirement/);
    assert.match(helper, /buildLaunchSignoffAuditContext/);
    assert.match(helper, /kind: "payment"/);
    assert.match(helper, /kind: "operator_policy"/);
    assert.match(helper, /kind: "legal_compliance"/);
    assert.match(helper, /evidenceReady\?: boolean/);
    assert.match(helper, /evidenceStatus\?: string/);
    assert.match(helper, /"pending"/);
    assert.match(helper, /category:\s*"payments"/);
    assert.match(helper, /category:\s*"compliance"/);
  });

  it("keeps backend evidence availability centralized for launch sign-offs", () => {
    assert.match(evidenceHelper, /attachLaunchSignoffEvidenceStatuses/);
    assert.match(evidenceHelper, /getLaunchSignoffEvidenceStatus/);
    assert.match(evidenceHelper, /getVerifiedDepositEvidenceStatus/);
    assert.match(evidenceHelper, /worldcup_deposit_claims/);
    assert.match(evidenceHelper, /\.eq\("status", "credited"\)/);
    assert.match(evidenceHelper, /worldcup_deposit_id/);
    assert.match(evidenceHelper, /worldcup_deposits/);
    assert.match(evidenceHelper, /raw->kucoinMainVerification->>status/);
    assert.match(evidenceHelper, /server-side KuCoin verification/);
    assert.match(evidenceHelper, /manual_shared_address_claim/);
    assert.match(evidenceHelper, /amountsMatch/);
    assert.match(evidenceHelper, /deposit claim audit link/);
    assert.match(evidenceHelper, /credited claim transaction hash/);
    assert.match(evidenceHelper, /must be denominated in USDT/);
    assert.match(evidenceHelper, /Credited \$\{network\.toUpperCase\(\)\} deposit proof ready/);
    assert.match(evidenceHelper, /claim \$\{proofClaim\.id\}/);
    assert.match(evidenceHelper, /deposit \$\{proofDeposit\.id\}/);
    assert.match(evidenceHelper, /tx \$\{txHash\}/);
    assert.match(evidenceHelper, /worldcup_withdrawal_requests/);
    assert.match(evidenceHelper, /\.eq\("status", "paid"\)/);
    assert.match(evidenceHelper, /external_tx_hash/);
    assert.match(evidenceHelper, /raw->payoutEvidence->>launchReady/);
    assert.match(evidenceHelper, /raw->payoutEvidence->>source/);
    assert.match(evidenceHelper, /normalizeWithdrawalTxHash/);
    assert.match(evidenceHelper, /parseWithdrawalAmount/);
    assert.match(evidenceHelper, /payoutEvidenceMatchesWithdrawal/);
    assert.match(evidenceHelper, /paid withdrawal audit fields/);
    assert.match(evidenceHelper, /must include a normalized network-valid transaction hash/);
    assert.match(evidenceHelper, /payout audit link/);
    assert.match(evidenceHelper, /real launch payout evidence/);
    assert.match(evidenceHelper, /Paid \$\{network\.toUpperCase\(\)\} withdrawal proof ready/);
    assert.match(evidenceHelper, /wallet debit \$\{withdrawal\.wallet_transaction_id\}/);
    assert.match(evidenceHelper, /tx \$\{withdrawal\.external_tx_hash\}/);
    assert.match(evidenceHelper, /getOperatorPolicyLaunchReadiness/);
    assert.match(evidenceHelper, /CURRENT_TERMS_VERSION/);
    assert.match(evidenceHelper, /requiresLaunchSignoffEvidenceNote/);
    assert.match(evidenceHelper, /getLaunchSignoffEvidenceNoteRequirement/);
    assert.match(evidenceHelper, /getMissingEvidenceNoteStatus/);
    assert.match(evidenceHelper, /isCurrentLegalApprovalEvidenceNote/);
    assert.match(evidenceHelper, /getCurrentLegalApprovalEvidenceNoteRequirement/);
    assert.match(evidenceHelper, /Terms\/Privacy version/);
    assert.match(evidenceHelper, /Manual legal approval evidence note and URL are recorded/);
    assert.match(evidenceHelper, /approval evidence URL/);
    assert.match(evidenceHelper, /isLaunchSignoffEvidenceUrl/);
    assert.match(evidenceHelper, /getLaunchSignoffEvidenceUrlRequirement/);
    assert.match(evidenceHelper, /Manual approval evidence must be recorded/);
  });

  it("keeps sign-off updates admin-only and evidence-backed", () => {
    assert.match(adminRoute, /requireAdmin/);
    assert.match(adminRoute, /enforceRateLimit\(request, "admin"/);
    assert.match(adminRoute, /loadLaunchSignoffs/);
    assert.match(adminRoute, /attachLaunchSignoffEvidenceStatuses/);
    assert.match(adminRoute, /requiresLaunchSignoffEvidenceNote/);
    assert.match(adminRoute, /getLaunchSignoffEvidenceNoteRequirement/);
    assert.match(adminRoute, /isNonWaivableLaunchSignoffKey/);
    assert.match(adminRoute, /isPaymentLaunchSignoffKey/);
    assert.match(adminRoute, /isApprovalEvidenceUrlRequiredLaunchSignoffKey/);
    assert.match(adminRoute, /isCurrentLegalApprovalEvidenceNote/);
    assert.match(adminRoute, /getCurrentLegalApprovalEvidenceNoteRequirement/);
    assert.match(adminRoute, /isLaunchSignoffEvidenceUrl/);
    assert.match(adminRoute, /getLaunchSignoffEvidenceUrlRequirement/);
    assert.match(helper, /Evidence URL must be a valid https:\/\/ URL/);
    assert.match(adminRoute, /Evidence URL is required for completed operator, legal, and compliance approval sign-offs/);
    assert.match(adminRoute, /getVerifiedDepositEvidenceStatus/);
    assert.match(adminRoute, /getVerifiedWithdrawalEvidenceStatus/);
    assert.match(adminRoute, /Real USDT payment test sign-offs cannot be waived/);
    assert.match(adminRoute, /Operator policy review cannot be waived/);
    assert.match(adminRoute, /Legal and compliance review cannot be waived/);
    assert.match(adminRoute, /getOperatorPolicyLaunchReadiness/);
    assert.match(adminRoute, /Operator policy review cannot be completed/);
    assert.match(adminRoute, /getPaymentSignoffEvidenceStatus/);
    assert.match(adminRoute, /paymentEvidenceStatus\.evidenceReady/);
    assert.match(adminRoute, /buildLaunchSignoffAuditContext/);
    assert.match(adminRoute, /paymentEvidenceStatus/);
    assert.match(adminRoute, /operatorPolicy/);
    assert.match(adminRoute, /capturedAt: updatedAt/);
    assert.match(adminRoute, /\.upsert\(/);
    assert.match(adminRoute, /updated_by:\s*auth\.adminEmail/);
    assert.match(adminEvidenceRoute, /requireAdmin/);
    assert.match(adminEvidenceRoute, /enforceRateLimit\(request, "admin"/);
    assert.match(adminEvidenceRoute, /buildProductionReadinessReport/);
    assert.match(adminEvidenceRoute, /loadOperatorPolicy/);
    assert.match(adminEvidenceRoute, /formatOperatorPolicy/);
    assert.match(adminEvidenceRoute, /loadLaunchSignoffs/);
    assert.match(adminEvidenceRoute, /attachLaunchSignoffEvidenceStatuses/);
    assert.match(adminEvidenceRoute, /getPaidActionLaunchEvidenceProbe/);
    assert.match(adminEvidenceRoute, /paidActionEvidence/);
    assert.match(adminEvidenceRoute, /CURRENT_TERMS_VERSION/);
    assert.match(adminEvidenceRoute, /CANONICAL_ORIGIN/);
    assert.match(adminEvidenceRoute, /getDeploymentEvidence/);
    assert.match(adminEvidenceRoute, /deployment:\s*getDeploymentEvidence\(\)/);
    assert.match(adminEvidenceRoute, /evidenceNotePresent/);
    assert.match(adminEvidenceRoute, /evidenceUrlPresent/);
    assert.doesNotMatch(adminEvidenceRoute, /process\.env/);
    assert.match(adminConsole, /isPaymentLaunchSignoffKey/);
    assert.match(adminConsole, /isNonWaivableLaunchSignoffKey/);
    assert.match(adminConsole, /isLaunchSignoffEvidenceUrl/);
    assert.match(adminConsole, /isApprovalEvidenceUrlRequiredLaunchSignoffKey/);
    assert.match(adminConsole, /approvalEvidenceUrlRequired/);
    assert.match(adminConsole, /evidenceUrlInvalid/);
    assert.match(adminConsole, /getLaunchSignoffEvidenceNoteRequirement/);
    assert.match(adminConsole, /legalVersionEvidenceBlocked/);
    assert.match(adminConsole, /getCurrentLegalApprovalEvidenceNoteRequirement/);
    assert.match(adminConsole, /operatorPolicyEvidenceBlocked/);
    assert.match(adminConsole, /signoff\.key === "operator_policy_review"/);
    assert.match(adminConsole, /signoff\.evidenceReady === false/);
    assert.match(adminConsole, /paymentWaiverBlocked/);
    assert.match(adminConsole, /paymentEvidenceBlocked/);
    assert.match(adminConsole, /Real USDT payment tests cannot be waived/);
    assert.match(adminConsole, /This launch sign-off cannot be waived for production/);
    assert.match(adminConsole, /Completed operator, legal, and compliance approvals require an HTTPS evidence URL/);
    assert.match(adminConsole, /Required HTTPS URL for completed approval/);
    assert.match(adminConsole, /type="url"/);
    assert.match(adminConsole, /getLaunchSignoffEvidenceUrlRequirement/);
    assert.match(adminConsole, /matching live payment evidence is ready/);
    assert.match(adminConsole, /signoff-evidence/);
    assert.match(adminConsole, /signoff-requirement/);
    assert.match(adminConsole, /Evidence: \{signoff\.evidenceStatus\}/);
    assert.match(adminConsole, /Requirement: \{signoff\.evidenceRequirement\}/);
    assert.match(adminConsole, /runLaunchSignoffEvidenceAction/);
    assert.match(adminConsole, /signoff\.evidenceActionLabel/);
    assert.match(adminConsole, /getLaunchSignoffEvidenceNotePlaceholder/);
    assert.match(adminConsole, /getSuggestedLaunchSignoffEvidenceNote/);
    assert.match(adminConsole, /Use Suggested Note/);
    assert.match(adminConsole, /signoff-note-actions/);
    assert.match(adminConsole, /formatOperatorPolicyEvidenceNote/);
    assert.match(adminConsole, /Legal and compliance approval recorded for Terms\/Privacy version/);
    assert.doesNotMatch(adminConsole, /function getLaunchSignoffEvidenceActionLabel/);
    assert.match(helper, /Open Deposit Claims/);
    assert.match(helper, /Open Withdrawal Requests/);
    assert.match(helper, /Open Operator Policy/);
    assert.match(adminConsole, /TRC20 tx hash, claim id, credited amount, KuCoin verification time/);
    assert.match(adminConsole, /ERC20 tx hash, claim id, credited amount, KuCoin verification time/);
    assert.match(adminConsole, /Payout tx hash, withdrawal id, amount, paid time/);
    assert.match(adminConsole, /Approved countries, blocked countries, deposit cap, withdrawal cap, reviewer/);
    assert.match(adminConsole, /CURRENT_TERMS_VERSION/);
    assert.match(adminConsole, /Current Terms\/Privacy consent version/);
    assert.match(adminConsole, /Reviewer, approval record, Terms\/Privacy version/);
    assert.match(adminConsole, /scrollToAdminSection\("admin-deposit-claims-panel"\)/);
    assert.match(adminConsole, /scrollToAdminSection\("admin-withdrawal-requests-panel"\)/);
    assert.match(adminConsole, /scrollToAdminSection\("admin-operator-policy-panel"\)/);
    assert.match(adminConsole, /loadDepositClaims/);
    assert.match(adminConsole, /loadWithdrawals/);
    assert.match(adminConsole, /loadOperatorPolicySettings/);
    assert.match(adminConsole, /href="\/terms"/);
    assert.match(adminConsole, /href="\/privacy"/);
    assert.match(adminConsole, /signoff-evidence-actions/);
    assert.match(adminConsole, /loadLaunchEvidenceSnapshot/);
    assert.match(adminConsole, /\/api\/admin\/launch-evidence/);
    assert.match(adminConsole, /Evidence Snapshot/);
    assert.match(adminConsole, /paidActionEvidence/);
    assert.match(adminConsole, /Admin evidence lane/);
    assert.match(adminConsole, /publicPaidActionsPaused/);
    assert.match(adminConsole, /adminEvidenceActionsAllowed/);
    assert.match(adminConsole, /Admin test actions/);
    assert.match(adminConsole, /launchEvidenceSnapshot/);
    assert.match(adminConsole, /deployment:\s*{/);
    assert.match(adminConsole, /launchEvidenceSnapshot\.deployment\.canonicalOrigin/);
    assert.match(adminConsole, /launchEvidenceSnapshot\.deployment\.deploymentUrl/);
    assert.match(adminConsole, /Commit \{launchEvidenceSnapshot\.deployment\.gitCommitSha\.slice\(0, 12\)\}/);
    assert.match(adminConsole, /launch-evidence-snapshot/);
    assert.match(adminConsole, /evidence-snapshot-grid/);
    assert.match(adminConsole, /fetchLaunchEvidenceSnapshot/);
    assert.match(adminConsole, /launchEvidenceSnapshot \? fetchLaunchEvidenceSnapshot\(\) : Promise\.resolve\(null\)/);
    assert.match(adminConsole, /tryRefreshReadinessReport/);
    assert.match(adminConsole, /Launch sign-off saved\. Production readiness and launch evidence refreshed\./);
    assert.match(adminConsole, /Deposit claim credited\. Production readiness and launch sign-offs refreshed\./);
    assert.match(adminConsole, /Withdrawal marked as paid\. Production readiness and launch sign-offs refreshed\./);
    assert.match(adminConsole, /Real USDT deposit launch evidence/);
    assert.match(adminConsole, /server-side KuCoin\s+receive-wallet match/);
    assert.match(adminConsole, /self-reported sender wallet/);
    assert.match(adminConsole, /Manual non-launch credit will\s+not complete these sign-offs/);
    assert.match(adminConsole, /Real USDT withdrawal launch evidence/);
    assert.match(adminConsole, /send the USDT payout manually/);
    assert.match(adminConsole, /Keep Count this paid payout as real launch evidence checked/);
    assert.match(adminConsole, /Operator approval evidence/);
    assert.match(adminConsole, /Save country rules plus deposit and withdrawal caps before selecting Completed/);
    assert.match(adminConsole, /include reviewer, policy values, and approval time in the note/);
    assert.match(adminConsole, /Legal approval evidence/);
    assert.match(adminConsole, /Review Terms and Privacy for version/);
    assert.match(adminConsole, /include Terms\/Privacy version \{CURRENT_TERMS_VERSION\} in the note/);
  });

  it("gives each launch sign-off exact operator evidence guidance", () => {
    assert.deepEqual(getLaunchSignoffEvidenceGuidance("real_usdt_trc20_deposit_test"), {
      evidenceTarget: "deposit_claims",
      evidenceActionLabel: "Open Deposit Claims",
      evidenceRequirement:
        "A credited TRC20 deposit claim linked to a KuCoin-verified wallet deposit, with claim id, deposit id, tx hash, credited amount, and credited time.",
    });
    assert.deepEqual(getLaunchSignoffEvidenceGuidance("real_usdt_erc20_deposit_test"), {
      evidenceTarget: "deposit_claims",
      evidenceActionLabel: "Open Deposit Claims",
      evidenceRequirement:
        "A credited ERC20 deposit claim linked to a KuCoin-verified wallet deposit, with claim id, deposit id, tx hash, credited amount, and credited time.",
    });
    assert.deepEqual(getLaunchSignoffEvidenceGuidance("real_usdt_withdrawal_payout_test"), {
      evidenceTarget: "withdrawal_requests",
      evidenceActionLabel: "Open Withdrawal Requests",
      evidenceRequirement:
        "A paid withdrawal request marked as real launch payout evidence, with withdrawal id, wallet debit id, payout tx hash, amount, and paid time.",
    });
    assert.deepEqual(getLaunchSignoffEvidenceGuidance("operator_policy_review"), {
      evidenceTarget: "operator_policy",
      evidenceActionLabel: "Open Operator Policy",
      evidenceRequirement:
        "Saved operator policy with country rules, deposit cap, withdrawal cap, reviewer note, and HTTPS approval evidence URL.",
    });
    assert.deepEqual(getLaunchSignoffEvidenceGuidance("legal_compliance_review"), {
      evidenceTarget: "legal_review",
      evidenceActionLabel: "Open Legal Evidence",
      evidenceRequirement:
        "Manual legal/compliance approval for Terms/Privacy version 2026-06-02, with HTTPS evidence URL and a note that includes that version.",
    });
  });

  it("ties legal sign-off evidence to the current Terms and Privacy version", async () => {
    const pending = await getLaunchSignoffEvidenceStatus(fakeSupabase({}), legalSignoff());

    assert.equal(pending.evidenceReady, false);
    assert.match(pending.evidenceStatus, /Manual legal approval evidence must be recorded/);
    assert.match(pending.evidenceStatus, /Terms\/Privacy version 2026-06-02/);

    const completedMissingUrl = await getLaunchSignoffEvidenceStatus(
      fakeSupabase({}),
      legalSignoff({ status: "completed" }),
    );

    assert.equal(completedMissingUrl.evidenceReady, false);
    assert.match(completedMissingUrl.evidenceStatus, /Approval evidence URL must be recorded/);
    assert.match(completedMissingUrl.evidenceStatus, /Terms\/Privacy version 2026-06-02/);

    const completed = await getLaunchSignoffEvidenceStatus(
      fakeSupabase({}),
      legalSignoff({
        status: "completed",
        evidenceNote: "Legal approved Terms/Privacy version 2026-06-02.",
        evidenceUrl: "https://worldcup26.world/legal-approval/2026-06-02",
      }),
    );

    assert.equal(completed.evidenceReady, true);
    assert.match(completed.evidenceStatus, /Manual legal approval evidence note and URL are recorded/);
    assert.match(completed.evidenceStatus, /Terms\/Privacy version 2026-06-02/);

    const completedHttpUrl = await getLaunchSignoffEvidenceStatus(
      fakeSupabase({}),
      legalSignoff({
        status: "completed",
        evidenceNote: "Legal approved Terms/Privacy version 2026-06-02.",
        evidenceUrl: "http://worldcup26.world/legal-approval/2026-06-02",
      }),
    );

    assert.equal(completedHttpUrl.evidenceReady, false);
    assert.equal(completedHttpUrl.evidenceStatus, "Evidence URL must be a valid https:// URL.");

    const completedStaleNote = await getLaunchSignoffEvidenceStatus(
      fakeSupabase({}),
      legalSignoff({
        status: "completed",
        evidenceNote: "Legal approved an old Terms and Privacy review.",
        evidenceUrl: "https://worldcup26.world/legal-approval/old",
      }),
    );

    assert.equal(completedStaleNote.evidenceReady, false);
    assert.equal(
      completedStaleNote.evidenceStatus,
      "Evidence note must include Terms/Privacy version 2026-06-02.",
    );
  });

  it("requires completed legal approval notes to reference the current public terms version", () => {
    assert.equal(requiresLaunchSignoffEvidenceNote("completed"), true);
    assert.equal(requiresLaunchSignoffEvidenceNote("waived"), true);
    assert.equal(requiresLaunchSignoffEvidenceNote("pending"), false);
    assert.equal(
      getLaunchSignoffEvidenceNoteRequirement(),
      "Evidence note is required for completed or waived launch sign-offs.",
    );
    assert.equal(isCurrentLegalApprovalEvidenceNote("Legal approved Terms/Privacy version 2026-06-02."), true);
    assert.equal(isCurrentLegalApprovalEvidenceNote("Legal approved old public terms."), false);
    assert.equal(
      getCurrentLegalApprovalEvidenceNoteRequirement(),
      "Evidence note must include Terms/Privacy version 2026-06-02.",
    );
  });

  it("requires launch sign-off evidence URLs to use HTTPS", () => {
    assert.equal(isLaunchSignoffEvidenceUrl("https://docs.example.com/approval"), true);
    assert.equal(isLaunchSignoffEvidenceUrl("http://docs.example.com/approval"), false);
    assert.equal(isLaunchSignoffEvidenceUrl("not-a-url"), false);
    assert.equal(isLaunchSignoffEvidenceUrl("ftp://docs.example.com/approval"), false);
    assert.equal(getLaunchSignoffEvidenceUrlRequirement(), "Evidence URL must be a valid https:// URL.");
  });

  it("does not mark completed launch sign-offs evidence-ready without an evidence note", async () => {
    const payment = await getLaunchSignoffEvidenceStatus(
      fakeSupabase({}),
      paymentSignoff({ status: "completed" }),
    );

    assert.equal(payment.evidenceReady, false);
    assert.equal(
      payment.evidenceStatus,
      "Evidence note is required for completed or waived launch sign-offs.",
    );

    const generic = await getLaunchSignoffEvidenceStatus(
      fakeSupabase({}),
      genericSignoff({ status: "waived" }),
    );

    assert.equal(generic.evidenceReady, false);
    assert.equal(
      generic.evidenceStatus,
      "Evidence note is required for completed or waived launch sign-offs.",
    );
  });

  it("builds launch sign-off audit context without storing secrets", () => {
    const pending = buildLaunchSignoffAuditContext({
      key: "legal_compliance_review",
      status: "pending",
      via: "break-glass",
      capturedAt: "2026-06-02T12:00:00.000Z",
    });

    assert.deepEqual(pending, {
      via: "break-glass",
      capturedAt: "2026-06-02T12:00:00.000Z",
    });

    const legal = buildLaunchSignoffAuditContext({
      key: "legal_compliance_review",
      status: "completed",
      via: "email",
      capturedAt: "2026-06-02T12:00:00.000Z",
    });

    assert.deepEqual(legal.launchEvidence, {
      kind: "legal_compliance",
      termsVersion: "2026-06-02",
    });

    const payment = buildLaunchSignoffAuditContext({
      key: "real_usdt_trc20_deposit_test",
      status: "completed",
      via: "email",
      capturedAt: "2026-06-02T12:00:00.000Z",
      paymentEvidenceStatus: {
        evidenceReady: true,
        evidenceStatus: "Credited TRC20 deposit proof ready: claim claim-123.",
      },
    });

    assert.deepEqual(payment.launchEvidence, {
      kind: "payment",
      status: "Credited TRC20 deposit proof ready: claim claim-123.",
    });

    const operator = buildLaunchSignoffAuditContext({
      key: "operator_policy_review",
      status: "completed",
      via: "email",
      capturedAt: "2026-06-02T12:00:00.000Z",
      operatorPolicy: {
        allowedCountries: ["RO", "US"],
        blockedCountries: ["GB"],
        maxDepositClaimAmount: 100,
        maxDailyDepositClaimAmount: 250,
        maxWithdrawalRequestAmount: 100,
        maxDailyWithdrawalRequestAmount: 250,
        updatedAt: "2026-06-02T11:00:00.000Z",
        updatedBy: "semebitcoin@gmail.com",
        source: "database",
      },
    });

    assert.deepEqual(operator.launchEvidence, {
      kind: "operator_policy",
      policy: {
        allowedCountries: ["RO", "US"],
        blockedCountries: ["GB"],
        maxDepositClaimAmount: 100,
        maxDailyDepositClaimAmount: 250,
        maxWithdrawalRequestAmount: 100,
        maxDailyWithdrawalRequestAmount: 250,
        source: "database",
        updatedAt: "2026-06-02T11:00:00.000Z",
        updatedBy: "semebitcoin@gmail.com",
      },
    });
    assert.doesNotMatch(JSON.stringify(operator), /KUCOIN|SUPABASE|SECRET|PASSPHRASE/);
  });

  it("returns concrete proof details for launch-ready deposit evidence", async () => {
    const status = await getVerifiedDepositEvidenceStatus(
      fakeSupabase({
        worldcup_deposit_claims: {
          data: [
            {
              id: "claim-123",
              amount: "12.34000000",
              currency: "USDT",
              tx_hash: "trc20-proof-hash",
              credited_at: "2026-06-02T10:00:00.000Z",
              worldcup_deposit_id: "deposit-123",
            },
          ],
          error: null,
        },
        worldcup_deposits: {
          data: {
            id: "deposit-123",
            amount: "12.34000000",
            currency: "USDT",
            credited_at: "2026-06-02T10:00:00.000Z",
            external_id: "trc20-proof-hash",
            raw: {
              source: "manual_shared_address_claim",
              claimId: "claim-123",
              amountCredited: "12.34000000",
            },
          },
          error: null,
        },
      }),
      "trc20",
      "TRC20 deposit",
    );

    assert.equal(status.evidenceReady, true);
    assert.match(status.evidenceStatus, /Credited TRC20 deposit proof ready/);
    assert.match(status.evidenceStatus, /claim claim-123/);
    assert.match(status.evidenceStatus, /deposit deposit-123/);
    assert.match(status.evidenceStatus, /12\.34000000 USDT/);
    assert.match(status.evidenceStatus, /tx trc20-proof-hash/);
    assert.match(status.evidenceStatus, /credited 2026-06-02T10:00:00\.000Z/);
  });

  it("rejects launch-ready deposit evidence when the wallet deposit proof does not match the claim", async () => {
    const mismatchedTx = await getVerifiedDepositEvidenceStatus(
      fakeSupabase({
        worldcup_deposit_claims: {
          data: [
            {
              id: "claim-123",
              amount: "12.34000000",
              currency: "USDT",
              tx_hash: "trc20-proof-hash",
              credited_at: "2026-06-02T10:00:00.000Z",
              worldcup_deposit_id: "deposit-123",
            },
          ],
          error: null,
        },
        worldcup_deposits: {
          data: {
            id: "deposit-123",
            amount: "12.34000000",
            currency: "USDT",
            credited_at: "2026-06-02T10:00:00.000Z",
            external_id: "different-kucoin-record",
            raw: {
              source: "manual_shared_address_claim",
              claimId: "claim-123",
              amountCredited: "12.34000000",
            },
          },
          error: null,
        },
      }),
      "trc20",
      "TRC20 deposit",
    );

    assert.equal(mismatchedTx.evidenceReady, false);
    assert.match(mismatchedTx.evidenceStatus, /does not match the credited claim transaction hash/);

    const missingAuditLink = await getVerifiedDepositEvidenceStatus(
      fakeSupabase({
        worldcup_deposit_claims: {
          data: [
            {
              id: "claim-123",
              amount: "12.34000000",
              currency: "USDT",
              tx_hash: "trc20-proof-hash",
              credited_at: "2026-06-02T10:00:00.000Z",
              worldcup_deposit_id: "deposit-123",
            },
          ],
          error: null,
        },
        worldcup_deposits: {
          data: {
            id: "deposit-123",
            amount: "12.34000000",
            currency: "USDT",
            credited_at: "2026-06-02T10:00:00.000Z",
            external_id: "trc20-proof-hash",
            raw: {
              source: "manual_shared_address_claim",
              claimId: "claim-999",
              amountCredited: "12.34000000",
            },
          },
          error: null,
        },
      }),
      "trc20",
      "TRC20 deposit",
    );

    assert.equal(missingAuditLink.evidenceReady, false);
    assert.match(missingAuditLink.evidenceStatus, /missing the deposit claim audit link/);
  });

  it("returns concrete proof details for launch-ready withdrawal evidence", async () => {
    const payoutTxHash = `0x${"a".repeat(64)}`;
    const status = await getVerifiedWithdrawalEvidenceStatus(
      fakeSupabase({
        worldcup_withdrawal_requests: {
          data: {
            id: "withdrawal-123",
            network: "erc20",
            amount: "3.21000000",
            currency: "USDT",
            paid_at: "2026-06-02T11:00:00.000Z",
            external_tx_hash: payoutTxHash,
            wallet_transaction_id: "wallet-tx-123",
            raw: {
              payoutEvidence: {
                launchReady: true,
                source: "manual_external_transfer",
                withdrawalId: "withdrawal-123",
                walletTransactionId: "wallet-tx-123",
                network: "erc20",
                amount: "3.21000000",
                currency: "USDT",
                externalTxHash: payoutTxHash,
                recordedAt: "2026-06-02T11:00:00.000Z",
                recordedBy: "semebitcoin@gmail.com",
              },
            },
          },
          error: null,
        },
      }),
    );

    assert.equal(status.evidenceReady, true);
    assert.match(status.evidenceStatus, /Paid ERC20 withdrawal proof ready/);
    assert.match(status.evidenceStatus, /withdrawal withdrawal-123/);
    assert.match(status.evidenceStatus, /wallet debit wallet-tx-123/);
    assert.match(status.evidenceStatus, /3\.21000000 USDT/);
    assert.match(status.evidenceStatus, new RegExp(`tx ${payoutTxHash}`));
    assert.match(status.evidenceStatus, /paid 2026-06-02T11:00:00\.000Z/);
  });

  it("rejects launch-ready withdrawal evidence when payout proof is malformed", async () => {
    const invalidTx = await getVerifiedWithdrawalEvidenceStatus(
      fakeSupabase({
        worldcup_withdrawal_requests: {
          data: {
            id: "withdrawal-123",
            network: "erc20",
            amount: "3.21000000",
            currency: "USDT",
            paid_at: "2026-06-02T11:00:00.000Z",
            external_tx_hash: "not-a-real-erc20-hash",
            wallet_transaction_id: "wallet-tx-123",
            raw: {
              payoutEvidence: {
                launchReady: true,
                source: "manual_external_transfer",
                withdrawalId: "withdrawal-123",
                walletTransactionId: "wallet-tx-123",
                network: "erc20",
                amount: "3.21000000",
                currency: "USDT",
                externalTxHash: "not-a-real-erc20-hash",
                recordedAt: "2026-06-02T11:00:00.000Z",
                recordedBy: "semebitcoin@gmail.com",
              },
            },
          },
          error: null,
        },
      }),
    );

    assert.equal(invalidTx.evidenceReady, false);
    assert.match(invalidTx.evidenceStatus, /normalized network-valid transaction hash/);

    const missingAuditLink = await getVerifiedWithdrawalEvidenceStatus(
      fakeSupabase({
        worldcup_withdrawal_requests: {
          data: {
            id: "withdrawal-123",
            network: "trc20",
            amount: "3.21000000",
            currency: "USDT",
            paid_at: "2026-06-02T11:00:00.000Z",
            external_tx_hash: "b".repeat(64),
            wallet_transaction_id: "wallet-tx-123",
            raw: {
              payoutEvidence: {
                launchReady: true,
                source: "manual_external_transfer",
              },
            },
          },
          error: null,
        },
      }),
    );

    assert.equal(missingAuditLink.evidenceReady, false);
    assert.match(missingAuditLink.evidenceStatus, /missing the admin payout audit link/);

    const nonUsdt = await getVerifiedWithdrawalEvidenceStatus(
      fakeSupabase({
        worldcup_withdrawal_requests: {
          data: {
            id: "withdrawal-123",
            network: "trc20",
            amount: "3.21000000",
            currency: "EUR",
            paid_at: "2026-06-02T11:00:00.000Z",
            external_tx_hash: "b".repeat(64),
            wallet_transaction_id: "wallet-tx-123",
            raw: {
              payoutEvidence: {
                launchReady: true,
                source: "manual_external_transfer",
                withdrawalId: "withdrawal-123",
                walletTransactionId: "wallet-tx-123",
                network: "trc20",
                amount: "3.21000000",
                currency: "EUR",
                externalTxHash: "b".repeat(64),
                recordedAt: "2026-06-02T11:00:00.000Z",
                recordedBy: "semebitcoin@gmail.com",
              },
            },
          },
          error: null,
        },
      }),
    );

    assert.equal(nonUsdt.evidenceReady, false);
    assert.match(nonUsdt.evidenceStatus, /must be denominated in USDT/);

    const mismatchedAuditFields = await getVerifiedWithdrawalEvidenceStatus(
      fakeSupabase({
        worldcup_withdrawal_requests: {
          data: {
            id: "withdrawal-123",
            network: "trc20",
            amount: "3.21000000",
            currency: "USDT",
            paid_at: "2026-06-02T11:00:00.000Z",
            external_tx_hash: "b".repeat(64),
            wallet_transaction_id: "wallet-tx-123",
            raw: {
              payoutEvidence: {
                launchReady: true,
                source: "manual_external_transfer",
                withdrawalId: "withdrawal-123",
                walletTransactionId: "wallet-tx-123",
                network: "trc20",
                amount: "2.00000000",
                currency: "USDT",
                externalTxHash: "b".repeat(64),
                recordedAt: "2026-06-02T11:00:00.000Z",
                recordedBy: "semebitcoin@gmail.com",
              },
            },
          },
          error: null,
        },
      }),
    );

    assert.equal(mismatchedAuditFields.evidenceReady, false);
    assert.match(mismatchedAuditFields.evidenceStatus, /does not match the paid withdrawal audit fields/);
  });
});

function legalSignoff(overrides: Record<string, unknown> = {}) {
  return {
    key: "legal_compliance_review",
    label: "Legal and compliance review",
    category: "compliance",
    detail: "Confirm Terms, Privacy, eligibility, and operational compliance are approved.",
    status: "pending",
    evidenceNote: null,
    evidenceUrl: null,
    updatedAt: null,
    updatedBy: "system",
    raw: {},
    ...overrides,
  } as any;
}

function paymentSignoff(overrides: Record<string, unknown> = {}) {
  return {
    key: "real_usdt_trc20_deposit_test",
    label: "Real USDT TRC20 deposit test",
    category: "payments",
    detail: "Send a small real TRC20 USDT deposit, submit the claim, verify it, and credit the wallet.",
    status: "pending",
    evidenceNote: null,
    evidenceUrl: null,
    updatedAt: null,
    updatedBy: "system",
    raw: {},
    ...overrides,
  } as any;
}

function genericSignoff(overrides: Record<string, unknown> = {}) {
  return {
    key: "legacy_manual_review",
    label: "Legacy manual review",
    category: "operations",
    detail: "Manual review.",
    status: "pending",
    evidenceNote: null,
    evidenceUrl: null,
    updatedAt: null,
    updatedBy: "system",
    raw: {},
    ...overrides,
  } as any;
}

function fakeSupabase(resultsByTable: Record<string, unknown>) {
  return {
    from(table: string) {
      const result = resultsByTable[table];

      if (!result) {
        throw new Error(`Missing fake Supabase result for ${table}`);
      }

      return fakeQuery(result);
    },
  } as any;
}

function fakeQuery(result: unknown) {
  const query = {
    select: () => query,
    eq: () => query,
    not: () => query,
    neq: () => query,
    in: () => query,
    order: () => query,
    limit: () => query,
    maybeSingle: async () => result,
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };

  return query;
}
