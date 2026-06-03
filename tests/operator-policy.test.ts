import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";

import {
  formatOperatorPolicy,
  getDepositLimitConfigFromPolicy,
  getEnvironmentOperatorPolicy,
  getOperatorPolicyLaunchReadiness,
  getOperatorPolicyPaidActionGate,
  getPolicyGeoEnv,
  getWithdrawalLimitConfigFromPolicy,
  normalizeOperatorPolicyInput,
  validateOperatorPolicyInput,
} from "../src/lib/operator-policy.ts";
import {
  getLaunchSignoffPaidActionGate,
  getPublicPaidActionGates,
  getUserPaidActionGate,
  getUserPaidActionGates,
  isPaidActionLaunchTestAdmin,
} from "../src/lib/paid-action-gates.ts";

const migration = readFileSync(
  "supabase/migrations/20260602031500_worldcup_operator_policy.sql",
  "utf8",
);
const adminRoute = readFileSync("src/app/api/admin/operator-policy/route.ts", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");
const readinessHelper = readFileSync("src/lib/production-readiness.ts", "utf8");
const stylesheet = readFileSync("src/app/globals.css", "utf8");
const depositAddressRoute = readFileSync("src/app/api/deposits/address/route.ts", "utf8");
const depositClaimRoute = readFileSync("src/app/api/deposits/claims/route.ts", "utf8");
const ticketPurchaseRoute = readFileSync("src/app/api/tickets/purchase/route.ts", "utf8");
const entryRoute = readFileSync("src/app/api/entries/route.ts", "utf8");
const withdrawalRoute = readFileSync("src/app/api/withdrawals/route.ts", "utf8");
const referralsMeRoute = readFileSync("src/app/api/referrals/me/route.ts", "utf8");

const originalPaidActionBypass = process.env.PAID_ACTION_LAUNCH_TEST_BYPASS;

afterEach(() => {
  if (originalPaidActionBypass === undefined) {
    delete process.env.PAID_ACTION_LAUNCH_TEST_BYPASS;
  } else {
    process.env.PAID_ACTION_LAUNCH_TEST_BYPASS = originalPaidActionBypass;
  }
});

describe("operator policy", () => {
  it("creates a private singleton operator policy table", () => {
    assert.match(migration, /worldcup_operator_policy/);
    assert.match(migration, /singleton_id boolean primary key/);
    assert.match(migration, /allowed_countries text\[\]/);
    assert.match(migration, /blocked_countries text\[\]/);
    assert.match(migration, /max_deposit_claim_amount numeric\(20, 8\)/);
    assert.match(migration, /max_withdrawal_request_amount numeric\(20, 8\)/);
    assert.match(migration, /enable row level security/);
    assert.match(migration, /on conflict \(singleton_id\) do nothing/);
  });

  it("normalizes admin policy input into country codes and 8-decimal caps", () => {
    const policy = normalizeOperatorPolicyInput({
      allowedCountries: "ro, US, usa, GB, RO",
      blockedCountries: ["ca", "bad", "DE"],
      maxDepositClaimAmount: "100.123456789",
      maxDailyDepositClaimAmount: "250.12345678",
      maxWithdrawalRequestAmount: ".5",
      maxDailyWithdrawalRequestAmount: "",
    });

    assert.deepEqual(policy.allowedCountries, ["GB", "RO", "US"]);
    assert.deepEqual(policy.blockedCountries, ["CA", "DE"]);
    assert.equal(policy.maxDepositClaimAmount, null);
    assert.equal(policy.maxDailyDepositClaimAmount, 250.12345678);
    assert.equal(policy.maxWithdrawalRequestAmount, 0.5);
    assert.equal(policy.maxDailyWithdrawalRequestAmount, null);
  });

  it("rejects invalid admin policy values before saving", () => {
    assert.throws(
      () => validateOperatorPolicyInput({ allowedCountries: "US, USA" }),
      /Allowed countries must use two-letter ISO country codes\. Invalid: USA/,
    );
    assert.throws(
      () => validateOperatorPolicyInput({ allowedCountries: "US", blockedCountries: "US" }),
      /Allowed and blocked countries cannot overlap: US/,
    );
    assert.throws(
      () => validateOperatorPolicyInput({ maxDepositClaimAmount: "100.123456789" }),
      /Max deposit claim must be a USDT amount with up to 8 decimal places/,
    );
    assert.throws(
      () => validateOperatorPolicyInput({ maxWithdrawalRequestAmount: "0" }),
      /Max withdrawal request must be greater than zero/,
    );

    const valid = validateOperatorPolicyInput({
      allowedCountries: "ro, US",
      blockedCountries: ["ca"],
      maxDepositClaimAmount: "100.12345678",
      maxDailyDepositClaimAmount: "",
      maxWithdrawalRequestAmount: ".5",
      maxDailyWithdrawalRequestAmount: null,
    });

    assert.deepEqual(valid.allowedCountries, ["RO", "US"]);
    assert.deepEqual(valid.blockedCountries, ["CA"]);
    assert.equal(valid.maxDepositClaimAmount, 100.12345678);
    assert.equal(valid.maxDailyDepositClaimAmount, null);
    assert.equal(valid.maxWithdrawalRequestAmount, 0.5);
    assert.equal(valid.maxDailyWithdrawalRequestAmount, null);
  });

  it("converts effective policy into route-level geo and amount limit config", () => {
    const policy = getEnvironmentOperatorPolicy({
      WORLDCUP_ALLOWED_COUNTRIES: "US,RO",
      WORLDCUP_BLOCKED_COUNTRIES: "GB",
      WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT: "100",
      WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT: "250",
      WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT: "40",
      WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT: "80",
    });

    assert.deepEqual(getPolicyGeoEnv(policy), {
      WORLDCUP_ALLOWED_COUNTRIES: "RO,US",
      WORLDCUP_BLOCKED_COUNTRIES: "GB",
    });
    assert.deepEqual(getDepositLimitConfigFromPolicy(policy), {
      maxPerClaimAmount: 100,
      maxDailyClaimAmount: 250,
    });
    assert.deepEqual(getWithdrawalLimitConfigFromPolicy(policy), {
      maxPerRequestAmount: 40,
      maxDailyRequestAmount: 80,
    });
    assert.deepEqual(formatOperatorPolicy(policy).allowedCountries, ["RO", "US"]);
  });

  it("requires country policy and money guardrails before operator launch sign-off", () => {
    const emptyPolicy = getEnvironmentOperatorPolicy({});
    assert.deepEqual(getOperatorPolicyLaunchReadiness(emptyPolicy), {
      ready: false,
      missing: ["paid-action country policy", "deposit claim cap", "withdrawal request cap"],
    });

    const launchPolicy = getEnvironmentOperatorPolicy({
      WORLDCUP_ALLOWED_COUNTRIES: "US,RO",
      WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT: "250",
      WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT: "250",
    });
    assert.deepEqual(getOperatorPolicyLaunchReadiness(launchPolicy), {
      ready: true,
      missing: [],
    });
  });

  it("gates new paid actions on their required operator settings", () => {
    const emptyPolicy = getEnvironmentOperatorPolicy({});
    assert.deepEqual(getOperatorPolicyPaidActionGate(emptyPolicy, "deposit"), {
      allowed: false,
      missing: ["paid-action country policy", "deposit claim cap"],
      message:
        "USDT deposits are paused until paid-action country policy and deposit claim cap are configured in Operator policy.",
    });
    assert.deepEqual(getOperatorPolicyPaidActionGate(emptyPolicy, "withdrawal"), {
      allowed: false,
      missing: ["paid-action country policy", "withdrawal request cap"],
      message:
        "Withdrawal requests are paused until paid-action country policy and withdrawal request cap are configured in Operator policy.",
    });
    assert.deepEqual(getOperatorPolicyPaidActionGate(emptyPolicy, "ticket"), {
      allowed: false,
      missing: ["paid-action country policy"],
      message:
        "Ticket purchases are paused until paid-action country policy is configured in Operator policy.",
    });

    const countryOnlyPolicy = getEnvironmentOperatorPolicy({
      WORLDCUP_BLOCKED_COUNTRIES: "AQ",
    });
    assert.equal(getOperatorPolicyPaidActionGate(countryOnlyPolicy, "entry").allowed, true);
    assert.deepEqual(getOperatorPolicyPaidActionGate(countryOnlyPolicy, "deposit").missing, [
      "deposit claim cap",
    ]);

    const launchPolicy = getEnvironmentOperatorPolicy({
      WORLDCUP_ALLOWED_COUNTRIES: "US,RO",
      WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT: "250",
      WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT: "250",
    });
    assert.equal(getOperatorPolicyPaidActionGate(launchPolicy, "deposit").allowed, true);
    assert.equal(getOperatorPolicyPaidActionGate(launchPolicy, "withdrawal").allowed, true);
  });

  it("enforces the operator launch gate on new paid-action routes", () => {
    for (const [route, action] of [
      [depositAddressRoute, "deposit"],
      [depositClaimRoute, "deposit"],
      [ticketPurchaseRoute, "ticket"],
      [entryRoute, "entry"],
      [withdrawalRoute, "withdrawal"],
    ] as const) {
      assert.match(route, /getUserPaidActionGate/);
      assert.match(route, /isPaidActionLaunchTestAdmin/);
      assert.match(route, new RegExp(`"${action}"`));
      assert.match(route, /launch approvals are complete/);
    }
  });

  it("exposes combined paid-action launch gates in authenticated account status", () => {
    assert.match(referralsMeRoute, /getUserPaidActionGates/);
    assert.match(referralsMeRoute, /paidActionGates/);
    assert.match(referralsMeRoute, /userEmail: user\.email/);
  });

  it("keeps public paid actions paused on launch sign-off gaps while allowing admin evidence tests", async () => {
    // The admin bypass is OFF by default so it can never silently skip the
    // launch gate or geo checks in production.
    delete process.env.PAID_ACTION_LAUNCH_TEST_BYPASS;
    assert.equal(isPaidActionLaunchTestAdmin("semebitcoin@gmail.com"), false);

    // It activates only for allowlisted admins when explicitly enabled.
    process.env.PAID_ACTION_LAUNCH_TEST_BYPASS = "1";
    assert.equal(isPaidActionLaunchTestAdmin("semebitcoin@gmail.com"), true);
    assert.equal(isPaidActionLaunchTestAdmin("player@example.com"), false);

    const adminGate = await getLaunchSignoffPaidActionGate({} as any, {
      userEmail: "semebitcoin@gmail.com",
    });
    assert.deepEqual(adminGate, { allowed: true, missing: [], message: null });

    const adminPaidActionGate = await getUserPaidActionGate({} as any, "deposit", {
      userEmail: "semebitcoin@gmail.com",
    });
    assert.deepEqual(adminPaidActionGate, { allowed: true, missing: [], message: null });

    const adminPaidActionGates = await getUserPaidActionGates({} as any, {
      userEmail: "semebitcoin@gmail.com",
    });
    assert.deepEqual(adminPaidActionGates, {
      deposit: { allowed: true, missing: [], message: null },
      ticket: { allowed: true, missing: [], message: null },
      entry: { allowed: true, missing: [], message: null },
      withdrawal: { allowed: true, missing: [], message: null },
    });

    const unavailableGate = await getLaunchSignoffPaidActionGate({
      from() {
        throw new Error("unavailable");
      },
    } as any);
    assert.equal(unavailableGate.allowed, false);
    assert.deepEqual(unavailableGate.missing, ["launch sign-off verification"]);
    assert.match(unavailableGate.message ?? "", /launch sign-offs can be verified/);

    assert.equal(typeof getPublicPaidActionGates, "function");
  });

  it("keeps operator policy admin-only and visible in the console", () => {
    assert.match(adminRoute, /requireAdmin/);
    assert.match(adminRoute, /loadOperatorPolicy/);
    assert.match(adminRoute, /validateOperatorPolicyInput/);
    assert.match(adminRoute, /ValidationError/);
    assert.match(adminRoute, /worldcup_operator_policy/);
    assert.match(adminConsole, /Operator policy/);
    assert.match(adminConsole, /Operator policy launch gate/);
    assert.match(adminConsole, /getOperatorPolicyDraftMissing/);
    assert.match(adminConsole, /getOperatorPolicyDraftActionGates/);
    assert.match(adminConsole, /getOperatorPolicyLaunchChecklist/);
    assert.match(adminConsole, /Complete the operator policy launch gate/);
    assert.match(adminConsole, /\/api\/admin\/operator-policy/);
    assert.match(adminConsole, /Save Operator Policy/);
    assert.match(adminConsole, /Policy presets/);
    assert.match(adminConsole, /operatorPolicyPresets/);
    assert.match(adminConsole, /applyOperatorPolicyPreset/);
    assert.match(adminConsole, /Fill the draft only/);
    assert.match(adminConsole, /Review jurisdictions and caps before saving/);
    assert.match(adminConsole, /Caps only/);
    assert.match(adminConsole, /RO pilot draft/);
    assert.match(adminConsole, /RO \+ US pilot draft/);
    assert.match(adminConsole, /preset draft/);
    assert.match(adminConsole, /Review it, then save Operator Policy/);
    assert.match(adminConsole, /Paid-action gates/);
    assert.match(adminConsole, /Launch policy checklist/);
    assert.match(adminConsole, /Operator policy launch checklist/);
    assert.match(adminConsole, /USDT deposits/);
    assert.match(adminConsole, /Ticket purchases/);
    assert.match(adminConsole, /Entry locking/);
    assert.match(adminConsole, /Withdrawal requests/);
    assert.match(adminConsole, /Country policy/);
    assert.match(adminConsole, /Deposit cap/);
    assert.match(adminConsole, /Withdrawal cap/);
    assert.match(adminConsole, /Required before operator sign-off/);
    assert.match(adminConsole, /Add allowed or blocked ISO country codes before launch/);
    assert.match(adminConsole, /Set a per-claim or rolling 24-hour deposit cap/);
    assert.match(adminConsole, /Set a per-request or rolling 24-hour withdrawal cap/);
    assert.match(adminConsole, /Paused until/);
    assert.match(adminConsole, /Operator policy gate will allow this action once saved/);
    assert.match(adminConsole, /ISO alpha-2 country codes such as US or RO/);
    assert.match(adminConsole, /cannot overlap allowed countries/);
    assert.match(adminConsole, /Optional per-claim cap in USDT/);
    assert.match(adminConsole, /rolling 24-hour cap in USDT/);
    assert.match(adminConsole, /Optional per-request cap in USDT/);
    assert.match(adminConsole, /inputMode="decimal"/);
    assert.match(adminConsole, /step="0\.00000001"/);
    assert.match(adminConsole, /tryRefreshLaunchEvidenceState/);
    assert.match(adminConsole, /Operator policy saved\. Production readiness and launch sign-offs refreshed\./);
    assert.match(
      adminConsole,
      /Operator policy saved\. Reload Production readiness and Launch sign-offs to update launch evidence\./,
    );
    assert.match(stylesheet, /policy-gate-preview/);
    assert.match(stylesheet, /policy-gate-grid/);
    assert.match(stylesheet, /policy-preset-grid/);
    assert.match(stylesheet, /policy-preset-button/);
    assert.match(stylesheet, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.policy-preset-grid\s*{[\s\S]*?grid-template-columns:\s*1fr;/);
    assert.match(stylesheet, /policy-gate-card/);
    assert.match(stylesheet, /policy-launch-checklist/);
    assert.match(stylesheet, /policy-checklist-row/);
  });

  it("feeds operator policy into production readiness", () => {
    assert.match(readinessHelper, /loadOperatorPolicy/);
    assert.match(readinessHelper, /worldcup_operator_policy/);
    assert.match(readinessHelper, /policy\.source/);
  });
});
