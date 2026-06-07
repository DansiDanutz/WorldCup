import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const productionSmoke = readFileSync("scripts/production-smoke.mjs", "utf8");
const productionPreflight = readFileSync("scripts/production-preflight.mjs", "utf8");
const vercelDomainGuard = readFileSync("scripts/vercel-domain-guard.mjs", "utf8");
const packageJson = readFileSync("package.json", "utf8");
const deploymentDocs = readFileSync("docs/DEPLOYMENT.md", "utf8");

describe("production smoke coverage", () => {
  it("ships one launch smoke command for the full production probe set", () => {
    assert.match(packageJson, /"preflight:prod"/);
    assert.match(packageJson, /"preflight:prod:launch"/);
    assert.match(packageJson, /"smoke:prod:launch"/);
    assert.match(packageJson, /--auth-flow-probe/);
    assert.match(packageJson, /--deposit-credit-probe/);
    assert.match(packageJson, /--kucoin-live-probe/);
    assert.match(deploymentDocs, /npm run preflight:prod/);
    assert.match(deploymentDocs, /npm run preflight:prod:launch/);
    assert.match(deploymentDocs, /npm run smoke:prod:launch/);
    assert.match(deploymentDocs, /Production readiness summary/);
    assert.match(deploymentDocs, /full launch smoke/);
    assert.match(deploymentDocs, /authenticated user flow/);
    assert.match(deploymentDocs, /KuCoin read-only verification/);
  });

  it("runs the complete production preflight from one script", () => {
    assert.match(productionPreflight, /loadPreflightEnv/);
    assert.match(productionPreflight, /loadedEnvFiles/);
    assert.match(productionPreflight, /scripts\/vercel-domain-guard\.mjs/);
    assert.match(productionPreflight, /scripts\/production-smoke\.mjs/);
    assert.match(productionPreflight, /--auth-flow-probe/);
    assert.match(productionPreflight, /--deposit-credit-probe/);
    assert.match(productionPreflight, /--kucoin-live-probe/);
    assert.match(productionPreflight, /\/api\/admin\/readiness/);
    assert.match(productionPreflight, /data\.summary\?\.fail === 0/);
    assert.match(productionPreflight, /strictLaunchReady/);
    assert.match(productionPreflight, /--require-ready/);
    assert.match(productionPreflight, /data\.summary\?\.warning === 0/);
    assert.match(productionPreflight, /Production preflight passed/);
    assert.match(productionPreflight, /Production launch preflight passed/);
  });

  it("keeps scheduled cron endpoints present and protected in production smoke", () => {
    assert.match(productionSmoke, /\/api\/cron\/results/);
    assert.match(productionSmoke, /\/api\/cron\/apply/);
    assert.doesNotMatch(productionSmoke, /\/api\/deposits\/reconcile/);
    assert.match(productionSmoke, /\/api\/deposits\/check/);
    assert.match(productionSmoke, /Unauthorized\./);
  });

  it("keeps USDT deposit probes covering both shared networks", () => {
    assert.match(productionSmoke, /KUCOIN_MAIN_USDT_TRC20_ADDRESS/);
    assert.match(productionSmoke, /KUCOIN_MAIN_USDT_ERC20_ADDRESS/);
    assert.match(productionSmoke, /network: "trc20"/);
    assert.match(productionSmoke, /network: "erc20"/);
    assert.match(productionSmoke, /requireSharedDepositNetworks\("deposit credit probe"\)/);
    assert.match(productionSmoke, /requireSharedDepositNetworks\("auth flow probe"\)/);
    assert.match(productionSmoke, /claimExpectations/);
    assert.match(productionSmoke, /row\.address === expected\.address/);
    assert.match(productionSmoke, /row\.txHash === expected\.txHash/);
    assert.match(productionSmoke, /kucoinMainVerification/);
    assert.match(productionSmoke, /fake credit unexpectedly looked like launch-ready KuCoin evidence/);
  });

  it("keeps responsible play covered in the authenticated smoke probe", () => {
    assert.match(productionSmoke, /worldcup_responsible_play_settings/);
    assert.match(productionSmoke, /\/api\/responsible-play/);
    assert.match(productionSmoke, /maxEntries: 2/);
    assert.match(productionSmoke, /depositRestriction/);
    assert.match(productionSmoke, /ticketRestriction/);
    assert.match(productionSmoke, /entryRestriction/);
  });

  it("keeps withdrawal request/admin review covered in production smoke", () => {
    assert.match(productionSmoke, /worldcup_withdrawal_requests/);
    assert.match(productionSmoke, /\/api\/withdrawals/);
    assert.match(productionSmoke, /\/api\/admin\/withdrawals/);
    assert.match(productionSmoke, /buildProbeWithdrawalAddress/);
    assert.match(productionSmoke, /Admin note is required before approving a withdrawal request/);
    assert.match(productionSmoke, /walletTransactionId/);
    assert.match(productionSmoke, /External transaction hash does not match the withdrawal network/);
    assert.match(productionSmoke, /status === "paid"/);
    assert.match(productionSmoke, /payoutEvidenceReady === false/);
    assert.match(productionSmoke, /fake withdrawal unexpectedly looked like launch-ready payout evidence/);
  });

  it("keeps paid-action launch gates covered in production smoke", () => {
    assert.match(productionSmoke, /getAllowedProfileGates/);
    assert.match(productionSmoke, /assertPaidActionPaused/);
    assert.match(productionSmoke, /depositAllowed/);
    assert.match(productionSmoke, /withdrawalAllowed/);
    assert.match(productionSmoke, /entryAllowed/);
    assert.match(productionSmoke, /assertPaidActionGates/);
    assert.match(productionSmoke, /\/api\/deposits\/sender-wallet/);
    assert.match(productionSmoke, /usdt_sender_wallet_trc20_address/);
    assert.match(productionSmoke, /action: "save-draft"/);
    assert.match(productionSmoke, /status === "draft"/);
    assert.match(productionSmoke, /Operator policy/);
    assert.match(productionSmoke, /launch sign-offs/);
  });

  it("keeps public referral resolution covered in production smoke", () => {
    assert.match(productionSmoke, /checkPublicReferralResolve/);
    assert.match(productionSmoke, /\/api\/referrals\/resolve/);
    assert.match(productionSmoke, /zz-zz zz/);
    assert.match(productionSmoke, /referralCode === "ZZZZZZ"/);
    assert.match(productionSmoke, /referralPercent === 0/);
  });

  it("keeps app-view analytics covered in production smoke", () => {
    assert.match(productionSmoke, /checkAnalyticsViewRoute/);
    assert.match(productionSmoke, /\/api\/analytics\/view/);
    assert.match(productionSmoke, /stored=true/);
    assert.match(productionSmoke, /WorldCup26-production-smoke/);
    assert.match(productionSmoke, /worldcup_app_views/);
    assert.match(productionSmoke, /utmSource:\s*"production-smoke"/);
    assert.match(productionSmoke, /utmCampaign:\s*"worldcup26_referral_72h"/);
  });

  it("keeps production readiness covered under admin auth", () => {
    assert.match(productionSmoke, /\/api\/admin\/readiness/);
    assert.match(productionSmoke, /\/api\/admin\/launch-signoffs/);
    assert.match(productionSmoke, /\/api\/admin\/launch-evidence/);
    assert.match(productionSmoke, /paidActionEvidence/);
    assert.match(productionSmoke, /USDT deposits are open during account setup/);
    assert.match(productionSmoke, /ticket assignment actions are open during account setup/);
    assert.match(productionSmoke, /entry actions are open during account setup/);
    assert.match(productionSmoke, /withdrawals remain deferred until final settlement/);
    assert.match(productionSmoke, /admin evidence email/);
    assert.match(productionSmoke, /launchEvidenceData\.deployment\?\.canonicalOrigin === "https:\/\/worldcup26\.world"/);
    assert.match(productionSmoke, /deployment URL/);
    assert.match(productionSmoke, /\/api\/admin\/operator-policy/);
    assert.match(productionSmoke, /assertAdminRouteStatus/);
    assert.match(productionSmoke, /checkLaunchSignoffNegativeControls/);
    assert.match(productionSmoke, /launch-signoff-/);
    assert.match(productionSmoke, /real_usdt_trc20_deposit_test/);
    assert.match(productionSmoke, /real_usdt_erc20_deposit_test/);
    assert.match(productionSmoke, /real_usdt_withdrawal_payout_test/);
    assert.match(productionSmoke, /Real USDT payment test sign-offs cannot be waived/);
    assert.match(productionSmoke, /Operator policy review cannot be waived/);
    assert.match(productionSmoke, /Legal and compliance review cannot be waived/);
    assert.match(productionSmoke, /Evidence note is required/);
    assert.match(productionSmoke, /completed legal sign-off without evidence URL/);
    assert.match(productionSmoke, /Evidence URL is required for completed operator, legal, and compliance approval sign-offs/);
    assert.match(productionSmoke, /Evidence URL must be a valid https:\/\/ URL/);
    assert.match(productionSmoke, /plain HTTP evidence URL/);
    assert.match(productionSmoke, /Unknown launch sign-off key/);
    assert.match(productionSmoke, /readinessData\.summary\?\.fail === 0/);
    assert.match(productionSmoke, /launchEvidenceData\.readiness\?\.summary\?\.fail === 0/);
    assert.match(productionSmoke, /secret-looking configuration keys/);
    assert.match(productionSmoke, /launch blockers/);
  });

  it("diagnoses stale Vercel custom-domain aliases on admin route 404s", () => {
    assert.match(productionSmoke, /getVercelDeploymentIdFromHtml/);
    assert.match(productionSmoke, /data-dpl-id/);
    assert.match(productionSmoke, /stale Vercel deployment/);
    assert.match(productionSmoke, /npx vercel alias set <latest-deployment-url> worldcup26\.world/);
    assert.match(productionSmoke, /npx vercel alias set <latest-deployment-url> www\.worldcup26\.world/);
  });

  it("documents the Vercel custom-domain assignment guard", () => {
    assert.match(packageJson, /"vercel:domain-guard"/);
    assert.match(packageJson, /"vercel:domain-guard:fix"/);
    assert.match(vercelDomainGuard, /autoAssignCustomDomains/);
    assert.match(vercelDomainGuard, /worldcup26\.world/);
    assert.match(vercelDomainGuard, /www\.worldcup26\.world/);
    assert.match(vercelDomainGuard, /loadServedDeploymentId/);
    assert.match(vercelDomainGuard, /servedDeploymentId/);
    assert.match(vercelDomainGuard, /servesAliasDeployment/);
    assert.match(vercelDomainGuard, /missingAliases/);
    assert.match(vercelDomainGuard, /--fix/);
    assert.match(deploymentDocs, /Custom-domain assignment guard/);
    assert.match(deploymentDocs, /automatic custom-domain assignment disabled/);
    assert.match(deploymentDocs, /npm run vercel:domain-guard/);
    assert.match(deploymentDocs, /npm run vercel:domain-guard:fix/);
    assert.match(deploymentDocs, /stale Git production\s+deployment cannot take over `worldcup26\.world`/);
    assert.match(deploymentDocs, /npx vercel alias set <latest-deployment-url> worldcup26\.world/);
    assert.match(deploymentDocs, /npx vercel alias set <latest-deployment-url> www\.worldcup26\.world/);
  });

  it("keeps public UI and mobile design smoke coverage", () => {
    assert.match(productionSmoke, /loadSmokeEnv/);
    assert.match(productionSmoke, /SMOKE_ENV_FILE/);
    assert.match(productionSmoke, /checkPublicUiShell/);
    assert.match(productionSmoke, /extractStylesheetHrefs/);
    assert.match(productionSmoke, /fetchStylesheetsFromHtml/);
    assert.match(productionSmoke, /name="viewport" content="width=device-width, initial-scale=1"/);
    assert.match(productionSmoke, /name="theme-color" content="#106b4f"/);
    assert.match(productionSmoke, /WorldCup Wallet/);
    assert.match(productionSmoke, /Sign in with Google/);
    assert.match(productionSmoke, /launch approvals are complete/);
    assert.match(productionSmoke, /leaked internal launch approval copy to public users/);
    assert.match(productionSmoke, /Choose 3 Teams/);
    assert.match(productionSmoke, /Agent Deal/);
    assert.match(productionSmoke, /public launch copy did not include the campaign CTA/);
    assert.match(productionSmoke, /public launch copy did not include the agent offer/);
    assert.match(productionSmoke, /leaked internal Operator policy setup copy to public users/);
    assert.match(productionSmoke, /Production readiness/);
    assert.match(productionSmoke, /Operator policy/);
    assert.match(productionSmoke, /Paid-action gates/);
    assert.match(productionSmoke, /Launch sign-offs/);
    assert.match(productionSmoke, /Evidence Snapshot/);
    assert.match(productionSmoke, /--green:#106b4f/);
    assert.match(productionSmoke, /--pick-two-accent:#2f5fbd/);
    assert.match(productionSmoke, /\.flag-wall/);
    assert.match(productionSmoke, /\.launch-notice/);
    assert.match(productionSmoke, /\.admin-referral-row/);
    assert.match(productionSmoke, /overflow-wrap:anywhere/);
    assert.match(productionSmoke, /@media \(max-width:760px\)/);
    assert.match(productionSmoke, /grid-template-columns:repeat\(auto-fit,minmax\(92px,1fr\)\)/);
    assert.match(productionSmoke, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
    assert.match(productionSmoke, /\/brand-mark\.svg/);
    assert.match(productionSmoke, /\/logo-lockup\.svg/);
  });
});
