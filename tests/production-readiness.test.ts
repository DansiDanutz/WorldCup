import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  buildEnvironmentReadinessChecks,
  buildReadinessNextActions,
  type ReadinessCheck,
} from "../src/lib/production-readiness.ts";

const adminReadinessRoute = readFileSync("src/app/api/admin/readiness/route.ts", "utf8");
const adminEvidenceRoute = readFileSync("src/app/api/admin/launch-evidence/route.ts", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");
const readinessHelper = readFileSync("src/lib/production-readiness.ts", "utf8");

const completeEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://your-project-ref.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  ADMIN_EMAILS: "semebitcoin@gmail.com,seme@kryptostack.com",
  ADMIN_RESULT_SECRET: "admin-secret",
  CRON_SECRET: "cron-secret",
  KUCOIN_MAIN_API_KEY: "main-key",
  KUCOIN_MAIN_API_SECRET: "main-secret",
  KUCOIN_MAIN_API_PASSPHRASE: "main-passphrase",
  KUCOIN_MAIN_USDT_TRC20_ADDRESS: "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS",
  KUCOIN_MAIN_USDT_ERC20_ADDRESS: "0xb72b81cae7d1996114ae21b13b245e686b692ea5",
  WORLDCUP_ALLOWED_COUNTRIES: "US,RO",
  WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT: "100",
  WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT: "250",
  WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT: "100",
  WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT: "250",
};

describe("production readiness checks", () => {
  it("passes launch-critical environment checks when production config is present", () => {
    const checks = buildEnvironmentReadinessChecks(completeEnv);

    assert.equal(checks.filter((check) => check.status === "fail").length, 0);
    assert.equal(checks.find((check) => check.id === "usdt-addressing")?.status, "pass");
    assert.equal(checks.find((check) => check.id === "kucoin-main-readonly")?.status, "pass");
    assert.equal(checks.find((check) => check.id === "geo-policy")?.status, "pass");
    assert.equal(checks.find((check) => check.id === "withdrawal-limits")?.status, "pass");
    assert.equal(checks.find((check) => check.id === "geo-policy")?.action, undefined);
  });

  it("marks missing launch blockers as failures and policy gaps as warnings", () => {
    const checks = buildEnvironmentReadinessChecks({
      NEXT_PUBLIC_SUPABASE_URL: "https://your-project-ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });

    assert.equal(checks.find((check) => check.id === "supabase-public-env")?.status, "pass");
    assert.equal(checks.find((check) => check.id === "supabase-service-env")?.status, "fail");
    assert.equal(checks.find((check) => check.id === "admin-allowlist")?.status, "pass");
    assert.match(checks.find((check) => check.id === "admin-allowlist")?.detail ?? "", /1 allowlisted admin email/);
    assert.equal(checks.find((check) => check.id === "usdt-addressing")?.status, "fail");
    assert.equal(checks.find((check) => check.id === "geo-policy")?.status, "warning");
    assert.equal(checks.find((check) => check.id === "deposit-limits")?.status, "warning");
    assert.match(checks.find((check) => check.id === "geo-policy")?.detail ?? "", /paid actions remain paused/);
    assert.match(checks.find((check) => check.id === "deposit-limits")?.detail ?? "", /USDT deposits remain paused/);
    assert.match(checks.find((check) => check.id === "withdrawal-limits")?.detail ?? "", /withdrawal requests remain paused/);
    assert.match(checks.find((check) => check.id === "supabase-service-env")?.action ?? "", /SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(checks.find((check) => check.id === "geo-policy")?.action ?? "", /Operator policy/);
    assert.match(checks.find((check) => check.id === "deposit-limits")?.action ?? "", /deposit cap/);
    assert.match(checks.find((check) => check.id === "withdrawal-limits")?.action ?? "", /withdrawal/);
    assert.doesNotMatch(checks.find((check) => check.id === "geo-policy")?.detail ?? "", /globally available/);
    assert.doesNotMatch(checks.find((check) => check.id === "deposit-limits")?.detail ?? "", /Optional/);
  });

  it("keeps readiness report behind admin auth and visible in the admin console", () => {
    assert.match(adminReadinessRoute, /requireAdmin/);
    assert.match(adminReadinessRoute, /buildProductionReadinessReport/);
    assert.match(adminReadinessRoute, /enforceRateLimit/);
    assert.match(adminEvidenceRoute, /buildProductionReadinessReport/);
    assert.match(adminEvidenceRoute, /formatOperatorPolicy/);
    assert.match(adminEvidenceRoute, /CURRENT_TERMS_VERSION/);
    assert.match(adminEvidenceRoute, /signoffs: signoffs\.map/);
    assert.match(readinessHelper, /nextActions:\s*buildReadinessNextActions/);
    assert.match(readinessHelper, /export function buildReadinessNextActions/);
    assert.match(readinessHelper, /type ReadinessActionTarget/);
    assert.match(readinessHelper, /loadLaunchSignoffs/);
    assert.match(readinessHelper, /getLaunchSignoffEvidenceStatus/);
    assert.match(readinessHelper, /evidenceStatus\.evidenceReady/);
    assert.match(readinessHelper, /Saved sign-off needs attention/);
    assert.match(readinessHelper, /isPaymentLaunchSignoffKey/);
    assert.match(readinessHelper, /isNonWaivableLaunchSignoffKey/);
    assert.match(readinessHelper, /Real USDT payment tests cannot be waived/);
    assert.match(readinessHelper, /This launch sign-off cannot be waived for production launch/);
    assert.match(readinessHelper, /worldcup_launch_signoffs/);
    assert.match(adminConsole, /Production readiness/);
    assert.match(adminConsole, /Operator policy/);
    assert.match(adminConsole, /Launch sign-offs/);
    assert.match(adminConsole, /\/api\/admin\/launch-signoffs/);
    assert.match(adminConsole, /Load Sign-offs/);
    assert.match(adminConsole, /\/api\/admin\/readiness/);
    assert.match(adminConsole, /\/api\/admin\/launch-evidence/);
    assert.match(adminConsole, /readiness-badge/);
    assert.match(adminConsole, /readiness-action/);
    assert.match(adminConsole, /Next: \{check\.action\}/);
    assert.match(adminConsole, /Launch action plan/);
    assert.match(adminConsole, /readinessReport\?\.nextActions \?\? \[\]/);
    assert.doesNotMatch(adminConsole, /function getReadinessLaunchActions/);
    assert.match(adminConsole, /runReadinessAction/);
    assert.match(adminConsole, /scrollToAdminSection/);
    assert.match(adminConsole, /loadPaymentQueues/);
    assert.match(adminConsole, /id="admin-operator-policy-panel"/);
    assert.match(adminConsole, /id="admin-launch-signoffs-panel"/);
    assert.match(
      adminConsole,
      /id="admin-deposit-claims-panel"[\s\S]{0,300}<h2 className="panel-title">Incoming transfers<\/h2>/,
    );
    assert.match(
      adminConsole,
      /id="admin-withdrawal-requests-panel"[\s\S]{0,300}<h2 className="panel-title">Withdrawal requests<\/h2>/,
    );
    assert.doesNotMatch(
      adminConsole,
      /id="admin-deposit-claims-panel"[\s\S]{0,300}<h2 className="panel-title">Bracket & payouts<\/h2>/,
    );
    assert.doesNotMatch(
      adminConsole,
      /id="admin-withdrawal-requests-panel"[\s\S]{0,300}<h2 className="panel-title">Tickets & wallets<\/h2>/,
    );
    assert.match(adminConsole, /readiness-step-actions/);
    assert.match(adminConsole, /\{action\.label\}/);
    assert.match(adminConsole, /\{action\.ctaLabel\}/);
    assert.match(readinessHelper, /Complete Operator policy/);
    assert.match(readinessHelper, /Load Policy/);
    assert.match(readinessHelper, /Run real USDT tests/);
    assert.match(readinessHelper, /Load Payment Queues/);
    assert.match(readinessHelper, /Record legal approval/);
    assert.match(readinessHelper, /CURRENT_TERMS_VERSION/);
    assert.match(readinessHelper, /Terms\/Privacy version \$\{CURRENT_TERMS_VERSION\}/);
    assert.match(readinessHelper, /isApprovalEvidenceUrlRequiredLaunchSignoffKey/);
    assert.match(readinessHelper, /approval evidence note and URL/);
    assert.match(readinessHelper, /Legal and compliance review with an evidence note and URL/);
    assert.match(adminConsole, /ctaLabel/);
    assert.match(adminConsole, /Set this or blocked countries before launch/);
    assert.match(adminConsole, /Required HTTPS URL for completed approval/);
  });

  it("groups launch next-actions from readiness checks in the shared report helper", () => {
    const checks: ReadinessCheck[] = [
      {
        id: "supabase-service-env",
        label: "Supabase service role",
        category: "database",
        status: "fail",
        detail: "Missing service role.",
      },
      {
        id: "geo-policy",
        label: "Paid-action country policy",
        category: "compliance",
        status: "warning",
        detail: "Missing country policy.",
      },
      {
        id: "launch-signoff-real_usdt_trc20_deposit_test",
        label: "Real USDT TRC20 deposit test",
        category: "payments",
        status: "warning",
        detail: "Missing evidence.",
      },
      {
        id: "launch-signoff-legal_compliance_review",
        label: "Legal and compliance review",
        category: "compliance",
        status: "warning",
        detail: "Missing approval.",
      },
    ];

    const actions = buildReadinessNextActions(checks);

    assert.deepEqual(
      actions.map((action) => [action.label, action.target, action.ctaLabel, action.status]),
      [
        ["Fix launch blockers", "readiness", "Run Check", "fail"],
        ["Complete Operator policy", "policy", "Load Policy", "warning"],
        ["Run real USDT tests", "payments", "Load Payment Queues", "warning"],
        ["Record legal approval", "signoffs", "Load Sign-offs", "warning"],
      ],
    );
    assert.match(actions[0].detail, /1 blocker/);
    assert.match(actions[2].action, /Incoming transfers and Withdrawal requests/);
    assert.match(actions[3].detail, /Terms\/Privacy version 2026-06-04/);
    assert.match(actions[3].action, /Terms\/Privacy version 2026-06-04/);
    assert.match(actions[3].action, /evidence note and URL/);
  });
});
