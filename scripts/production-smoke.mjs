import { createHmac } from "node:crypto";

const DEFAULT_BASE_URL = "https://worldcup26.world";
const DEFAULT_SUPABASE_URL = "https://lxhjfdxowpxzrybxdasi.supabase.co";
const baseUrl = (process.env.SMOKE_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_SUPABASE_URL).replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminResultSecret = process.env.ADMIN_RESULT_SECRET;
const sharedTrc20Address = process.env.KUCOIN_MAIN_USDT_TRC20_ADDRESS;
const sharedErc20Address = process.env.KUCOIN_MAIN_USDT_ERC20_ADDRESS;
const sharedDepositNetworks = [
  { network: "trc20", envKey: "KUCOIN_MAIN_USDT_TRC20_ADDRESS", address: sharedTrc20Address },
  { network: "erc20", envKey: "KUCOIN_MAIN_USDT_ERC20_ADDRESS", address: sharedErc20Address },
];
const hasKucoinMainApi =
  Boolean(process.env.KUCOIN_MAIN_API_KEY ?? process.env.KUCOIN_API_KEY) &&
  Boolean(process.env.KUCOIN_MAIN_API_SECRET ?? process.env.KUCOIN_API_SECRET) &&
  Boolean(process.env.KUCOIN_MAIN_API_PASSPHRASE ?? process.env.KUCOIN_API_PASSPHRASE);
const runRateLimitProbe = process.argv.includes("--rate-limit");
const runDepositCreditProbe = process.argv.includes("--deposit-credit-probe");
const runAuthFlowProbe = process.argv.includes("--auth-flow-probe");
const runKucoinLiveProbe = process.argv.includes("--kucoin-live-probe");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchText(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();

  return { response, text };
}

function getVercelDeploymentIdFromHtml(text) {
  return text.match(/data-dpl-id="([^"]+)"/)?.[1] ?? text.match(/dpl_[A-Za-z0-9]+/)?.[0] ?? null;
}

function describeUnexpectedAdminRouteStatus(path, expectedStatus, response, text) {
  const deploymentId = getVercelDeploymentIdFromHtml(text);
  const contentType = response.headers.get("content-type") ?? "unknown content type";
  const looksLikeHtml = contentType.includes("text/html") || /<html\b/i.test(text);
  const staleAliasHint =
    response.status === 404 && looksLikeHtml && deploymentId
      ? ` ${baseUrl} is likely serving stale Vercel deployment ${deploymentId}; run: npx vercel alias set <latest-deployment-url> worldcup26.world; npx vercel alias set <latest-deployment-url> www.worldcup26.world.`
      : "";

  return `${path} expected ${expectedStatus}, got ${response.status} (${contentType}).${staleAliasHint}`;
}

function assertAdminRouteStatus(path, expectedStatus, result) {
  assert(
    result.response.status === expectedStatus,
    describeUnexpectedAdminRouteStatus(path, expectedStatus, result.response, result.text),
  );
}

async function fetchJson(url, init, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    return { response, data, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkPage(path, expectedText) {
  const { response, text } = await fetchText(path);

  assert(response.status === 200, `${path} expected 200, got ${response.status}`);
  assert(text.includes(expectedText), `${path} did not include "${expectedText}"`);

  return response;
}

async function checkPublicPages() {
  const pages = [
    ["/login", "Login / Register"],
    ["/schema", "Tournament Schema"],
    ["/coefficients", "Team Coefficients"],
    ["/terms", "WorldCup26 Terms of Use"],
    ["/privacy", "WorldCup26 Privacy Policy"],
  ];

  for (const [path, expectedText] of pages) {
    await checkPage(path, expectedText);
  }
}

function extractStylesheetHrefs(html) {
  const hrefs = [];

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];

    if (!/\brel=["'][^"']*stylesheet[^"']*["']/i.test(tag)) {
      continue;
    }

    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (href) {
      hrefs.push(href);
    }
  }

  return hrefs;
}

async function fetchStylesheetsFromHtml(html, contextPath) {
  const hrefs = extractStylesheetHrefs(html);
  assert(hrefs.length > 0, `${contextPath} did not include a stylesheet link`);

  const stylesheets = await Promise.all(
    hrefs.map(async (href) => {
      const url = new URL(href, baseUrl);
      const response = await fetch(url);
      const text = await response.text();

      assert(response.status === 200, `${url.pathname} expected 200, got ${response.status}`);
      assert(text.trim().length > 0, `${url.pathname} stylesheet was empty`);

      return text;
    }),
  );

  return stylesheets.join("\n");
}

async function checkPublicUiShell() {
  const routeLandmarks = [
    ["/", ["Choose 3 Teams", "Pick Teams", "Rules", "Schema", "Leaderboard", "Wallet", "Matches"]],
    ["/login", ["Login / Register", "Predict the Game", "Continue with Google"]],
    ["/wallet", ["WorldCup Wallet", "Wallet", "Sign in with Google", "USDT"]],
    [
      "/admin",
      [
        "Admin access",
        "Production readiness",
        "Operator policy",
        "Paid-action gates",
        "Launch sign-offs",
        "Evidence Snapshot",
      ],
    ],
    ["/schema", ["Tournament Schema"]],
    ["/coefficients", ["Team Coefficients"]],
    ["/terms", ["WorldCup26 Terms of Use"]],
    ["/privacy", ["WorldCup26 Privacy Policy"]],
  ];
  let homeHtml = "";

  for (const [path, landmarks] of routeLandmarks) {
    const { response, text } = await fetchText(path);

    assert(response.status === 200, `${path} UI shell expected 200, got ${response.status}`);
    assert(
      text.includes('name="viewport" content="width=device-width, initial-scale=1"'),
      `${path} is missing mobile viewport metadata`,
    );
    assert(
      text.includes('name="theme-color" content="#106b4f"'),
      `${path} is missing the WorldCup theme color metadata`,
    );

    for (const landmark of landmarks) {
      assert(text.includes(landmark), `${path} UI shell did not include "${landmark}"`);
    }

    if (path === "/" || path === "/wallet") {
      assert(
        text.includes("launch approvals are complete"),
        `${path} public launch copy did not mention launch approvals`,
      );
      assert(
        !text.includes("Operator policy is configured"),
        `${path} leaked internal Operator policy setup copy to public users`,
      );
    }

    if (path === "/") {
      homeHtml = text;
    }
  }

  const css = await fetchStylesheetsFromHtml(homeHtml, "/");
  const requiredCssTokens = [
    "--green:#106b4f",
    "--green-soft:#e5f3ee",
    "--gold:#c9942e",
    "--red:#b84a45",
    "--text:#0c1d1a",
    "--muted:#5d6f69",
    "--border:#d8e3df",
    "--pick-one-accent:#106b4f",
    "--pick-two-accent:#2f5fbd",
    "--pick-three-accent:#b66b16",
    ".flag-wall",
    ".launch-notice",
    ".admin-referral-row",
    "overflow-wrap:anywhere",
    "@media (max-width:760px)",
    "grid-template-columns:repeat(auto-fit,minmax(82px,1fr))",
    "@media (max-width:420px)",
    "grid-template-columns:repeat(3,minmax(0,1fr))",
    "width:100%",
  ];

  for (const token of requiredCssTokens) {
    assert(css.includes(token), `Production stylesheet is missing "${token}"`);
  }

  for (const asset of ["/brand-mark.svg", "/logo-lockup.svg"]) {
    const { response, text } = await fetchText(asset);

    assert(response.status === 200, `${asset} expected 200, got ${response.status}`);
    assert(text.includes("<svg"), `${asset} did not look like an SVG`);
    assert(text.includes("#106b4f"), `${asset} is missing the WorldCup green brand color`);
    assert(text.includes("WorldCup"), `${asset} is missing WorldCup brand text`);
  }
}

async function checkHealth() {
  const { response, text } = await fetchText("/api/health");

  assert(response.status === 200, `/api/health expected 200, got ${response.status}`);

  const data = JSON.parse(text);
  assert(data.ok === true, "/api/health did not report ok=true");
  assert(data.database === "available", "/api/health did not report database=available");
}

async function checkAdminRejection() {
  const me = await fetchText("/api/admin/me");

  assertAdminRouteStatus("/api/admin/me", 401, me);
  assert(me.text.includes("Admin authorization required"), "Admin status rejection body changed unexpectedly");

  const { response, text } = await fetchText("/api/admin/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });

  assertAdminRouteStatus("/api/admin/accounts", 401, { response, text });
  assert(text.includes("Admin authorization required"), "Admin rejection body changed unexpectedly");
}

async function checkAdminAuthorized() {
  if (!adminResultSecret) {
    return;
  }

  const me = await fetchText("/api/admin/me", {
    headers: {
      "x-admin-secret": adminResultSecret,
    },
  });

  assertAdminRouteStatus("/api/admin/me authorized check", 200, me);

  const adminStatus = JSON.parse(me.text);
  assert(adminStatus.admin === true, "/api/admin/me did not return admin=true");

  const checks = [
    ["/api/admin/accounts", "accounts", {}],
    ["/api/admin/deposit-claims", "claims", { action: "list" }],
    ["/api/admin/withdrawals", "withdrawals", { action: "list" }],
    ["/api/admin/referrals", "referrals", {}],
  ];

  for (const [path, key, body] of checks) {
    const { response, text } = await fetchText(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminResultSecret,
      },
      body: JSON.stringify(body),
    });

    assertAdminRouteStatus(`${path} authorized check`, 200, { response, text });

    const data = JSON.parse(text);
    assert(Array.isArray(data[key]), `${path} did not return a ${key} array`);
  }

  const readiness = await fetchText("/api/admin/readiness", {
    headers: {
      "x-admin-secret": adminResultSecret,
    },
  });
  assertAdminRouteStatus("/api/admin/readiness authorized check", 200, readiness);
  const readinessData = JSON.parse(readiness.text);
  assert(Array.isArray(readinessData.checks), "/api/admin/readiness did not return checks");
  assert(
    readinessData.checks.filter((check) => String(check.id).startsWith("launch-signoff-")).length === 5,
    "/api/admin/readiness did not include all launch sign-off checks",
  );
  assert(
    readinessData.summary?.fail === 0,
    `/api/admin/readiness reported ${readinessData.summary?.fail ?? "unknown"} launch blockers`,
  );

  const launchSignoffs = await fetchText("/api/admin/launch-signoffs", {
    headers: {
      "x-admin-secret": adminResultSecret,
    },
  });
  assertAdminRouteStatus("/api/admin/launch-signoffs authorized check", 200, launchSignoffs);
  const launchSignoffData = JSON.parse(launchSignoffs.text);
  const launchSignoffKeys = new Set((launchSignoffData.signoffs ?? []).map((row) => row.key));
  for (const key of [
    "real_usdt_trc20_deposit_test",
    "real_usdt_erc20_deposit_test",
    "real_usdt_withdrawal_payout_test",
    "operator_policy_review",
    "legal_compliance_review",
  ]) {
    assert(launchSignoffKeys.has(key), `/api/admin/launch-signoffs missing ${key}`);
  }

  const launchEvidence = await fetchText("/api/admin/launch-evidence", {
    headers: {
      "x-admin-secret": adminResultSecret,
    },
  });
  assertAdminRouteStatus("/api/admin/launch-evidence authorized check", 200, launchEvidence);
  const launchEvidenceData = JSON.parse(launchEvidence.text);
  assert(
    launchEvidenceData.readiness?.summary?.fail === 0,
    `/api/admin/launch-evidence reported ${launchEvidenceData.readiness?.summary?.fail ?? "unknown"} launch blockers`,
  );
  assert(launchEvidenceData.operatorPolicy, "/api/admin/launch-evidence did not return operator policy");
  assert(
    launchEvidenceData.paidActionEvidence?.publicPaidActionsPaused === true,
    "/api/admin/launch-evidence did not prove public paid actions are paused",
  );
  assert(
    launchEvidenceData.paidActionEvidence?.adminEvidenceEmailConfigured === true,
    "/api/admin/launch-evidence did not detect an admin evidence email",
  );
  assert(
    launchEvidenceData.paidActionEvidence?.adminEvidenceActionsAllowed === true,
    "/api/admin/launch-evidence did not prove the admin evidence lane is open",
  );
  assert(
    launchEvidenceData.deployment?.canonicalOrigin === "https://worldcup26.world",
    "/api/admin/launch-evidence did not return canonical deployment evidence",
  );
  assert(
    launchEvidenceData.deployment?.deploymentUrl === null ||
      /^https:\/\/[^/]+\.vercel\.app$/.test(launchEvidenceData.deployment.deploymentUrl),
    "/api/admin/launch-evidence returned an unexpected deployment URL",
  );
  assert(
    launchEvidenceData.legal?.currentTermsVersion,
    "/api/admin/launch-evidence did not return the current legal version",
  );
  assert(
    Array.isArray(launchEvidenceData.signoffs) && launchEvidenceData.signoffs.length === 5,
    "/api/admin/launch-evidence did not return all launch sign-offs",
  );
  assert(
    launchEvidenceData.signoffs.every((row) => typeof row.evidenceRequirement === "string"),
    "/api/admin/launch-evidence sign-offs are missing evidence requirements",
  );
  assert(
    !/(SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY|ADMIN_RESULT_SECRET|CRON_SECRET|KUCOIN_(MAIN_)?API_(KEY|SECRET|PASSPHRASE)|KUCOIN_API_(KEY|SECRET|PASSPHRASE)|KUCOIN_BROKER_KEY)/i.test(launchEvidence.text),
    "/api/admin/launch-evidence leaked secret-looking configuration keys",
  );

  const operatorPolicy = await fetchText("/api/admin/operator-policy", {
    headers: {
      "x-admin-secret": adminResultSecret,
    },
  });
  assertAdminRouteStatus("/api/admin/operator-policy authorized check", 200, operatorPolicy);
  const operatorPolicyData = JSON.parse(operatorPolicy.text);
  assert(operatorPolicyData.policy, "/api/admin/operator-policy did not return policy");

  await checkLaunchSignoffNegativeControls();
}

async function checkLaunchSignoffNegativeControls() {
  const cases = [
    {
      label: "TRC20 payment waiver",
      body: {
        key: "real_usdt_trc20_deposit_test",
        status: "waived",
        evidenceNote: "Codex negative control: real payment sign-offs are non-waivable",
      },
      expectedStatus: 400,
      expectedText: "Real USDT payment test sign-offs cannot be waived",
    },
    {
      label: "operator policy waiver",
      body: {
        key: "operator_policy_review",
        status: "waived",
        evidenceNote: "Codex negative control: operator policy sign-off is non-waivable",
      },
      expectedStatus: 400,
      expectedText: "Operator policy review cannot be waived",
    },
    {
      label: "legal compliance waiver",
      body: {
        key: "legal_compliance_review",
        status: "waived",
        evidenceNote: "Codex negative control: legal sign-off is non-waivable",
      },
      expectedStatus: 400,
      expectedText: "Legal and compliance review cannot be waived",
    },
    {
      label: "completed sign-off without evidence note",
      body: {
        key: "legal_compliance_review",
        status: "completed",
      },
      expectedStatus: 400,
      expectedText: "Evidence note is required",
    },
    {
      label: "completed legal sign-off without evidence URL",
      body: {
        key: "legal_compliance_review",
        status: "completed",
        evidenceNote: "Codex negative control: completed legal approval needs a review URL",
      },
      expectedStatus: 400,
      expectedText: "Evidence URL is required for completed operator, legal, and compliance approval sign-offs.",
    },
    {
      label: "invalid evidence URL",
      body: {
        key: "legal_compliance_review",
        status: "pending",
        evidenceUrl: "not-a-url",
      },
      expectedStatus: 400,
      expectedText: "Evidence URL must be a valid https:// URL.",
    },
    {
      label: "plain HTTP evidence URL",
      body: {
        key: "legal_compliance_review",
        status: "pending",
        evidenceUrl: "http://example.com/legal-review",
      },
      expectedStatus: 400,
      expectedText: "Evidence URL must be a valid https:// URL.",
    },
    {
      label: "unknown launch sign-off key",
      body: {
        key: "made_up_launch_key",
        status: "completed",
        evidenceNote: "Codex negative control",
      },
      expectedStatus: 400,
      expectedText: "Unknown launch sign-off key.",
    },
  ];

  for (const testCase of cases) {
    const { response, text } = await fetchText("/api/admin/launch-signoffs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminResultSecret,
      },
      body: JSON.stringify(testCase.body),
    });

    assertAdminRouteStatus(
      `${testCase.label} /api/admin/launch-signoffs`,
      testCase.expectedStatus,
      { response, text },
    );
    assert(
      text.includes(testCase.expectedText),
      `${testCase.label} rejection body changed unexpectedly`,
    );
  }
}

async function checkApiRejection(path, init, expectedText) {
  const { response, text } = await fetchText(path, init);

  assert(response.status === 401, `${path} expected 401, got ${response.status}`);
  assert(text.includes(expectedText), `${path} rejection body changed unexpectedly`);
}

async function checkSecurityHeaders(response) {
  const requiredHeaders = [
    "permissions-policy",
    "referrer-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
  ];

  for (const header of requiredHeaders) {
    assert(response.headers.has(header), `Missing security header: ${header}`);
  }
}

async function checkDepositReadiness() {
  await checkPage("/wallet", "Wallet");
  await checkApiRejection("/api/deposits/address", undefined, "Sign in with Google first.");
  await checkApiRejection("/api/deposits/claims", undefined, "Sign in with Google first.");
  await checkApiRejection("/api/withdrawals", undefined, "Sign in with Google first.");
  await checkApiRejection(
    "/api/deposits/reconcile",
    undefined,
    "Unauthorized.",
  );
  await checkApiRejection(
    "/api/cron/results",
    undefined,
    "Unauthorized.",
  );
  await checkApiRejection(
    "/api/cron/apply",
    undefined,
    "Unauthorized.",
  );
  await checkApiRejection(
    "/api/tickets/purchase",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
    "Sign in with Google first.",
  );

  for (const asset of ["/usdt-trc20-address-qr.svg", "/usdt-erc20-address-qr.svg"]) {
    const { response, text } = await fetchText(asset);

    assert(response.status === 200, `${asset} expected 200, got ${response.status}`);
    assert(text.includes("<svg"), `${asset} did not look like an SVG`);
  }

  if (!supabaseServiceRoleKey) {
    return;
  }

  const depositTables = [
    ["worldcup_deposit_addresses", "id"],
    ["worldcup_deposits", "id"],
    ["worldcup_deposit_claims", "id"],
    ["worldcup_withdrawal_requests", "id"],
    ["worldcup_responsible_play_settings", "user_id"],
  ];

  for (const [table, keyColumn] of depositTables) {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${keyColumn}&limit=1`, {
      headers: {
        apikey: supabaseServiceRoleKey,
        authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
    });

    assert(response.status === 200, `${table} REST check expected 200, got ${response.status}`);
  }
}

async function checkPublicReferralResolve() {
  const empty = await fetchJson(`${baseUrl}/api/referrals/resolve`, undefined, 10_000);
  assert(
    empty.response.status === 200 && empty.data?.valid === false,
    `Referral resolve empty-code check expected valid=false, got ${empty.response.status}`,
  );

  const invalid = await fetchJson(`${baseUrl}/api/referrals/resolve?code=zz-zz zz`, undefined, 10_000);
  assert(
    invalid.response.status === 200 &&
      invalid.data?.valid === false &&
      invalid.data?.referralCode === "ZZZZZZ" &&
      invalid.data?.referralPercent === 3,
    `Referral resolve invalid-code check changed unexpectedly: ${invalid.response.status}`,
  );
}

async function checkRateLimit() {
  const statuses = [];

  for (let index = 0; index < 35; index += 1) {
    const response = await fetch(`${baseUrl}/api/referrals/resolve?code=ZZZZZZ`);
    statuses.push(response.status);
  }

  assert(statuses.includes(429), `Expected at least one 429 from rate limiter, got ${statuses.join(",")}`);
}

function serviceHeaders() {
  assert(supabaseServiceRoleKey, "Missing SUPABASE_SERVICE_ROLE_KEY for deposit credit probe");

  return {
    apikey: supabaseServiceRoleKey,
    authorization: `Bearer ${supabaseServiceRoleKey}`,
    "content-type": "application/json",
  };
}

async function restGet(table, query) {
  return fetchJson(`${supabaseUrl}/rest/v1/${table}?${query}`, { headers: serviceHeaders() });
}

async function restPost(table, body) {
  return fetchJson(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...serviceHeaders(), prefer: "return=representation" },
    body: JSON.stringify(body),
  });
}

async function restDelete(table, query) {
  await fetchJson(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: { ...serviceHeaders(), prefer: "return=minimal" },
  }).catch(() => null);
}

function requireSharedDepositNetworks(context) {
  for (const config of sharedDepositNetworks) {
    assert(config.address, `Missing ${config.envKey} for ${context}`);
  }

  return sharedDepositNetworks;
}

function buildProbeTxHash(network, stamp, marker) {
  const hash = `${stamp.toString(16).padStart(16, "0")}${marker.repeat(64)}`.slice(0, 64);

  return network === "erc20" ? `0x${hash}` : hash;
}

function buildProbeWithdrawalAddress(network) {
  return network === "erc20"
    ? "0xb72b81cae7d1996114ae21b13b245e686b692ea5"
    : "TSx75s3v5SW4a2VabNZh6kaS2EHRWsXtdS";
}

async function checkDepositCreditProbe() {
  assert(adminResultSecret, "Missing ADMIN_RESULT_SECRET for deposit credit probe");
  const networks = requireSharedDepositNetworks("deposit credit probe");

  const stamp = Date.now();
  const email = `codex-deposit-credit-${stamp}@worldcup26.test`;
  const claimedAmount = "0.02";
  let userId = null;
  const claimIds = [];
  const depositIds = [];
  const walletTransactionIds = [];

  try {
    const created = await fetchJson(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: serviceHeaders(),
      body: JSON.stringify({
        email,
        email_confirm: true,
        app_metadata: { provider: "google", providers: ["google"] },
        user_metadata: { name: "Codex Deposit Credit Probe" },
      }),
    });
    assert(
      created.response.ok && created.data?.id,
      `Deposit probe could not create temp user: ${created.response.status}`,
    );
    userId = created.data.id;

    const tournament = await restGet(
      "worldcup_tournaments",
      "select=id&slug=eq.fifa-world-cup-2026&limit=1",
    );
    assert(
      tournament.response.ok && tournament.data?.[0]?.id,
      `Deposit probe could not load tournament: ${tournament.response.status}`,
    );

    for (const [index, config] of networks.entries()) {
      const txHash = buildProbeTxHash(config.network, stamp + index, "a");
      const verifiedAmount = `0.0100012${index + 3}`;
      const adminNote = `Codex production ${config.network.toUpperCase()} deposit-credit probe - verified override, no real funds`;
      const claim = await restPost("worldcup_deposit_claims", {
        tournament_id: tournament.data[0].id,
        user_id: userId,
        user_email: email,
        display_name: "Codex Deposit Credit Probe",
        network: config.network,
        address: config.address,
        amount: claimedAmount,
        currency: "USDT",
        tx_hash: txHash,
      });
      assert(
        claim.response.ok && claim.data?.[0]?.id,
        `Deposit probe could not create ${config.network} claim: ${claim.response.status}`,
      );
      const claimId = claim.data[0].id;
      claimIds.push(claimId);

      if (hasKucoinMainApi) {
        const verification = await fetchJson(
          `${baseUrl}/api/admin/deposit-claims`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-secret": adminResultSecret,
            },
            body: JSON.stringify({
              action: "verify",
              claimId,
            }),
          },
          20_000,
        );

        assert(
          verification.response.status === 200 &&
            ["missing", "unavailable"].includes(verification.data?.verification?.status),
          `Deposit probe ${config.network} KuCoin verification expected missing or unavailable fake tx, got ${verification.response.status}`,
        );
      }

      const missingNoteCredit = await fetchJson(
        `${baseUrl}/api/admin/deposit-claims`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": adminResultSecret,
          },
          body: JSON.stringify({
            action: "credit",
            claimId,
            amount: verifiedAmount,
          }),
        },
        20_000,
      );

      assert(
        missingNoteCredit.response.status === 400 &&
          missingNoteCredit.data?.error === "Admin note is required before crediting a deposit claim.",
        `Deposit probe ${config.network} missing-note credit expected 400, got ${missingNoteCredit.response.status}`,
      );

      const credit = await fetchJson(
        `${baseUrl}/api/admin/deposit-claims`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": adminResultSecret,
          },
          body: JSON.stringify({
            action: "credit",
            claimId,
            amount: verifiedAmount,
            adminNote,
          }),
        },
        20_000,
      );

      assert(
        credit.response.status === 200 && credit.data?.claim?.status === "credited",
        `Deposit probe ${config.network} admin credit failed: ${credit.response.status}`,
      );
      assert(
        credit.data.claim.adminNote === adminNote,
        `Deposit probe ${config.network} credit response did not preserve the admin note`,
      );
      const depositId = credit.data.claim.worldcupDepositId;
      assert(depositId, `Deposit probe ${config.network} credit response did not include a deposit id`);
      depositIds.push(depositId);

      const deposit = await restGet(
        "worldcup_deposits",
        `select=id,wallet_transaction_id,user_id,network,amount,external_id,raw&external_id=eq.${encodeURIComponent(txHash)}&limit=1`,
      );
      assert(
        deposit.response.ok && deposit.data?.[0]?.wallet_transaction_id,
        `Deposit probe could not verify ${config.network} deposit: ${deposit.response.status}`,
      );
      assert(
        deposit.data[0].network === config.network,
        `Deposit probe expected ${config.network} deposit network, got ${deposit.data[0].network}`,
      );
      assert(
        String(deposit.data[0].amount) === verifiedAmount,
        `Deposit probe ${config.network} expected deposit amount ${verifiedAmount}, got ${deposit.data[0].amount}`,
      );
      assert(
        String(deposit.data[0].raw?.amountClaimed) === claimedAmount &&
          String(deposit.data[0].raw?.amountCredited) === verifiedAmount &&
          deposit.data[0].raw?.adminNote === adminNote,
        `Deposit probe could not verify ${config.network} deposit raw audit fields`,
      );
      assert(
        deposit.data[0].raw?.kucoinMainVerification &&
          ["missing", "unavailable"].includes(deposit.data[0].raw.kucoinMainVerification.status),
        `Deposit probe ${config.network} fake credit unexpectedly looked like launch-ready KuCoin evidence`,
      );
      const walletTransactionId = deposit.data[0].wallet_transaction_id;
      walletTransactionIds.push(walletTransactionId);

      const walletTransaction = await restGet(
        "worldcup_wallet_transactions",
        `select=id,to_user_id,amount,transaction_type&id=eq.${walletTransactionId}&limit=1`,
      );
      assert(
        walletTransaction.response.ok &&
          walletTransaction.data?.[0]?.transaction_type === "deposit" &&
          walletTransaction.data?.[0]?.to_user_id === userId &&
          String(walletTransaction.data?.[0]?.amount) === verifiedAmount,
        `Deposit probe could not verify ${config.network} wallet transaction: ${walletTransaction.response.status}`,
      );

      const duplicateCredit = await fetchJson(
        `${baseUrl}/api/admin/deposit-claims`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": adminResultSecret,
          },
          body: JSON.stringify({
            action: "credit",
            claimId,
            amount: verifiedAmount,
          }),
        },
        20_000,
      );

      assert(
        duplicateCredit.response.status === 409 &&
          duplicateCredit.data?.error === "Deposit claim is already credited.",
        `Deposit probe ${config.network} duplicate credit expected 409, got ${duplicateCredit.response.status}`,
      );
    }
  } finally {
    for (const claimId of claimIds) {
      await restDelete("worldcup_deposit_claims", `id=eq.${claimId}`);
    }
    for (const depositId of depositIds) {
      await restDelete("worldcup_deposits", `id=eq.${depositId}`);
    }
    for (const walletTransactionId of walletTransactionIds) {
      await restDelete("worldcup_wallet_transactions", `id=eq.${walletTransactionId}`);
    }
    if (userId) {
      await restDelete("worldcup_referral_profiles", `user_id=eq.${userId}`);
      await fetchJson(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: serviceHeaders(),
      }).catch(() => null);
    }
  }
}

async function createTempGoogleSession(prefix, displayName) {
  assert(supabaseAnonKey, "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY for auth flow probe");
  assert(supabaseServiceRoleKey, "Missing SUPABASE_SERVICE_ROLE_KEY for auth flow probe");

  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `${prefix}-${stamp}@worldcup26.test`;
  const created = await fetchJson(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: serviceHeaders(),
    body: JSON.stringify({
      email,
      email_confirm: true,
      app_metadata: { provider: "google", providers: ["google"] },
      user_metadata: { name: displayName, full_name: displayName },
    }),
  });

  assert(
    created.response.ok && created.data?.id,
    `Auth flow probe could not create ${prefix} user: ${created.response.status}`,
  );

  try {
    const link = await fetchJson(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: serviceHeaders(),
      body: JSON.stringify({ type: "magiclink", email }),
    });

    const tokenHash = link.data?.hashed_token ?? link.data?.properties?.hashed_token;
    assert(
      link.response.ok && tokenHash,
      `Auth flow probe could not generate ${prefix} session link: ${link.response.status}`,
    );

    const verified = await fetchJson(`${supabaseUrl}/auth/v1/verify`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ type: "magiclink", token_hash: tokenHash }),
    });

    assert(
      verified.response.ok && verified.data?.access_token,
      `Auth flow probe could not verify ${prefix} session: ${verified.response.status}`,
    );

    // Supabase magic-link verification marks the session as an email provider
    // even when email sign-in is disabled. Reset the temporary auth user to the
    // production-required Google provider before exercising app APIs.
    const restoredProvider = await fetchJson(`${supabaseUrl}/auth/v1/admin/users/${created.data.id}`, {
      method: "PUT",
      headers: serviceHeaders(),
      body: JSON.stringify({
        app_metadata: { provider: "google", providers: ["google"] },
      }),
    });
    assert(
      restoredProvider.response.ok,
      `Auth flow probe could not restore ${prefix} Google provider metadata: ${restoredProvider.response.status}`,
    );

    return {
      userId: created.data.id,
      email,
      accessToken: verified.data.access_token,
    };
  } catch (error) {
    await fetchJson(`${supabaseUrl}/auth/v1/admin/users/${created.data.id}`, {
      method: "DELETE",
      headers: serviceHeaders(),
    }).catch(() => null);
    throw error;
  }
}

async function fetchUserJson(path, token, init = {}, timeoutMs = 15_000) {
  return fetchJson(
    `${baseUrl}${path}`,
    {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        authorization: `Bearer ${token}`,
      },
    },
    timeoutMs,
  );
}

async function adminPost(path, body, timeoutMs = 15_000) {
  assert(adminResultSecret, `Missing ADMIN_RESULT_SECRET for ${path}`);

  return fetchJson(
    `${baseUrl}${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminResultSecret,
      },
      body: JSON.stringify(body),
    },
    timeoutMs,
  );
}

async function loadPaidActionGateState() {
  assert(adminResultSecret, "Missing ADMIN_RESULT_SECRET for paid action gate check");

  const readiness = await fetchJson(`${baseUrl}/api/admin/readiness`, {
    headers: { "x-admin-secret": adminResultSecret },
  });
  assert(
    readiness.response.status === 200 && Array.isArray(readiness.data?.checks),
    `Paid action gate check could not load readiness: ${readiness.response.status}`,
  );

  const checksById = new Map(readiness.data.checks.map((check) => [check.id, check]));
  const countryReady = checksById.get("geo-policy")?.status === "pass";
  const depositReady = checksById.get("deposit-limits")?.status === "pass";
  const withdrawalReady = checksById.get("withdrawal-limits")?.status === "pass";
  const launchSignoffsReady = readiness.data.checks
    .filter((check) => String(check.id).startsWith("launch-signoff-"))
    .every((check) => check.status === "pass");

  return {
    depositAllowed: countryReady && depositReady && launchSignoffsReady,
    withdrawalAllowed: countryReady && withdrawalReady && launchSignoffsReady,
    ticketAllowed: countryReady && launchSignoffsReady,
    entryAllowed: countryReady && launchSignoffsReady,
  };
}

function assertPaidActionPaused(result, label) {
  assert(
    result.response.status === 403 &&
      /(Operator policy|launch sign-offs)/.test(result.data?.error ?? ""),
    `${label} expected paid-action launch pause, got ${result.response.status}: ${result.data?.error ?? ""}`,
  );
}

function assertPaidActionGates(profile, label) {
  const gates = profile.data?.paidActionGates;
  assert(gates && typeof gates === "object", `${label} missing paidActionGates`);

  for (const action of ["deposit", "ticket", "entry", "withdrawal"]) {
    const gate = gates[action];
    assert(
      gate &&
        typeof gate.allowed === "boolean" &&
        Array.isArray(gate.missing) &&
        (gate.message === null || typeof gate.message === "string"),
      `${label} missing ${action} paid action gate`,
    );
  }
}

async function loadProbeTeamIds() {
  const teams = await restGet(
    "worldcup_teams",
    "select=id,name&order=name.asc&limit=3",
  );

  assert(
    teams.response.ok && (teams.data ?? []).length === 3,
    `Auth flow probe could not load teams: ${teams.response.status}`,
  );

  return teams.data.map((team) => team.id);
}

async function cleanupAuthFlowProbe(state) {
  const { inviterUserId, playerUserId, entryId, claimIds, withdrawalIds } = state;

  if (entryId) {
    await restDelete("worldcup_entries", `id=eq.${entryId}`);
  }

  for (const userId of [playerUserId, inviterUserId].filter(Boolean)) {
    await restDelete("worldcup_entries", `user_id=eq.${userId}`);
    await restDelete("worldcup_tickets", `user_id=eq.${userId}`);
    await restDelete("worldcup_withdrawal_requests", `user_id=eq.${userId}`);
    await restDelete("worldcup_wallet_transactions", `or=(from_user_id.eq.${userId},to_user_id.eq.${userId})`);
    await restDelete("worldcup_deposit_claims", `user_id=eq.${userId}`);
    await restDelete("worldcup_deposit_addresses", `user_id=eq.${userId}`);
    await restDelete("worldcup_consent", `user_id=eq.${userId}`);
    await restDelete("worldcup_responsible_play_settings", `user_id=eq.${userId}`);
    await restDelete("worldcup_referrals", `or=(inviter_user_id.eq.${userId},invited_user_id.eq.${userId})`);
    await restDelete("worldcup_referral_profiles", `user_id=eq.${userId}`);
  }

  for (const claimId of claimIds ?? []) {
    await restDelete("worldcup_deposit_claims", `id=eq.${claimId}`);
  }

  for (const withdrawalId of withdrawalIds ?? []) {
    await restDelete("worldcup_withdrawal_requests", `id=eq.${withdrawalId}`);
  }

  for (const userId of [playerUserId, inviterUserId].filter(Boolean)) {
    await fetchJson(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders(),
    }).catch(() => null);
  }
}

async function checkAuthenticatedUserFlowProbe() {
  assert(adminResultSecret, "Missing ADMIN_RESULT_SECRET for auth flow probe");
  const networks = requireSharedDepositNetworks("auth flow probe");

  const state = {
    inviterUserId: null,
    playerUserId: null,
    entryId: null,
    claimIds: [],
    claimExpectations: [],
    withdrawalIds: [],
  };

  try {
    const inviter = await createTempGoogleSession(
      "codex-inviter",
      "Codex Inviter Probe",
    );
    state.inviterUserId = inviter.userId;

    const inviterProfile = await fetchUserJson("/api/referrals/me", inviter.accessToken);
    assert(
      inviterProfile.response.status === 200 && inviterProfile.data?.referralCode,
      `Auth flow probe could not load inviter referral profile: ${inviterProfile.response.status}`,
    );
    assertPaidActionGates(inviterProfile, "Auth flow inviter profile");

    const referralCode = inviterProfile.data.referralCode;
    const resolved = await fetchJson(
      `${baseUrl}/api/referrals/resolve?code=${encodeURIComponent(referralCode)}`,
    );
    assert(
      resolved.response.status === 200 && resolved.data?.valid === true,
      `Auth flow probe could not resolve referral code: ${resolved.response.status}`,
    );

    const player = await createTempGoogleSession("codex-player", "Codex Player Probe");
    state.playerUserId = player.userId;

    const playerProfile = await fetchUserJson("/api/referrals/me", player.accessToken);
    assert(
      playerProfile.response.status === 200 && playerProfile.data?.referralCode,
      `Auth flow probe could not load player referral profile: ${playerProfile.response.status}`,
    );
    assertPaidActionGates(playerProfile, "Auth flow player profile");

    const tournament = await restGet(
      "worldcup_tournaments",
      "select=id&slug=eq.fifa-world-cup-2026&limit=1",
    );
    assert(
      tournament.response.ok && tournament.data?.[0]?.id,
      `Auth flow probe could not load tournament: ${tournament.response.status}`,
    );
    const tournamentId = tournament.data[0].id;
    const paidActionGate = await loadPaidActionGateState();

    const playerAdminStatus = await fetchUserJson("/api/admin/me", player.accessToken);
    assert(
      playerAdminStatus.response.status === 401 &&
        playerAdminStatus.data?.error === "Admin authorization required.",
      `Auth flow probe expected non-admin user to be rejected from /api/admin/me, got ${playerAdminStatus.response.status}`,
    );

    const responsibleGet = await fetchUserJson("/api/responsible-play", player.accessToken);
    assert(
      responsibleGet.response.status === 200 &&
        responsibleGet.data?.selfExcluded === false &&
        responsibleGet.data?.depositRestriction === null &&
        responsibleGet.data?.ticketRestriction === null &&
        responsibleGet.data?.entryRestriction === null,
      `Auth flow probe could not read responsible play settings: ${responsibleGet.response.status}`,
    );

    const responsiblePost = await fetchUserJson(
      "/api/responsible-play",
      player.accessToken,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxEntries: 2 }),
      },
    );
    assert(
      responsiblePost.response.status === 200 &&
        responsiblePost.data?.maxEntries === 2 &&
        responsiblePost.data?.ticketRestriction === null &&
        responsiblePost.data?.entryRestriction === null,
      `Auth flow probe could not save responsible play entry limit: ${responsiblePost.response.status}`,
    );

    const addresses = await fetchUserJson("/api/deposits/address", player.accessToken);
    if (paidActionGate.depositAllowed) {
      assert(
        addresses.response.status === 200 &&
          addresses.data?.configured === true &&
          Array.isArray(addresses.data.addresses) &&
          networks.every((config) =>
            addresses.data.addresses.some(
              (address) =>
                address.network === config.network &&
                address.address === config.address &&
                address.shared === true,
            ),
          ),
        `Auth flow probe could not load deposit addresses: ${addresses.response.status}`,
      );

      const claimStamp = Date.now();
      for (const [index, config] of networks.entries()) {
        const txHash = buildProbeTxHash(config.network, claimStamp + index, "b");
        const claim = await fetchUserJson(
          "/api/deposits/claims",
          player.accessToken,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              network: config.network,
              amount: "0.01",
              txHash,
            }),
          },
        );
        assert(
          claim.response.status === 200 &&
            claim.data?.claim?.status === "submitted" &&
            claim.data.claim.network === config.network &&
            claim.data.claim.address === config.address,
          `Auth flow probe could not submit ${config.network} deposit claim: ${claim.response.status}`,
        );
        state.claimIds.push(claim.data.claim.id);
        state.claimExpectations.push({
          id: claim.data.claim.id,
          network: config.network,
          address: config.address,
          amount: "0.01",
          txHash: claim.data.claim.txHash ?? txHash,
        });
      }
    } else {
      assertPaidActionPaused(addresses, "Auth flow deposit address");
      const blockedClaim = await fetchUserJson(
        "/api/deposits/claims",
        player.accessToken,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            network: networks[0].network,
            amount: "0.01",
            txHash: buildProbeTxHash(networks[0].network, Date.now(), "b"),
          }),
        },
      );
      assertPaidActionPaused(blockedClaim, "Auth flow deposit claim");
    }

    const claims = await fetchUserJson("/api/deposits/claims", player.accessToken);
    assert(
      claims.response.status === 200 &&
        Array.isArray(claims.data?.claims) &&
        state.claimExpectations.every((expected) =>
          claims.data.claims.some(
            (row) =>
              row.id === expected.id &&
              row.network === expected.network &&
              row.address === expected.address &&
              row.amount === expected.amount &&
              row.txHash === expected.txHash,
          ),
        ),
      `Auth flow probe could not list deposit claim: ${claims.response.status}`,
    );

    const seededWalletCredit = await restPost("worldcup_wallet_transactions", {
      tournament_id: tournamentId,
      to_user_id: player.userId,
      amount: "0.05",
      transaction_type: "admin_credit",
      note: "Codex authenticated withdrawal probe credit; no external funds",
      created_by: "codex-smoke",
    });
    assert(
      seededWalletCredit.response.ok && seededWalletCredit.data?.[0]?.id,
      `Auth flow probe could not seed wallet credit: ${seededWalletCredit.response.status}`,
    );

    const initialWithdrawals = await fetchUserJson("/api/withdrawals", player.accessToken);
    assert(
      initialWithdrawals.response.status === 200 && Array.isArray(initialWithdrawals.data?.withdrawals),
      `Auth flow probe could not list withdrawals before request: ${initialWithdrawals.response.status}`,
    );

    const withdrawalNetwork = "trc20";
    const withdrawalRequest = await fetchUserJson(
      "/api/withdrawals",
      player.accessToken,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          network: withdrawalNetwork,
          address: buildProbeWithdrawalAddress(withdrawalNetwork),
          amount: "0.02",
        }),
      },
      20_000,
    );
    if (paidActionGate.withdrawalAllowed) {
      assert(
        withdrawalRequest.response.status === 200 &&
          withdrawalRequest.data?.withdrawal?.status === "submitted" &&
          withdrawalRequest.data.withdrawal.network === withdrawalNetwork,
        `Auth flow probe could not submit withdrawal request: ${withdrawalRequest.response.status}`,
      );
      const withdrawalId = withdrawalRequest.data.withdrawal.id;
      state.withdrawalIds.push(withdrawalId);

      const withdrawals = await fetchUserJson("/api/withdrawals", player.accessToken);
      assert(
        withdrawals.response.status === 200 &&
          Array.isArray(withdrawals.data?.withdrawals) &&
          withdrawals.data.withdrawals.some((row) => row.id === withdrawalId),
        `Auth flow probe could not list submitted withdrawal: ${withdrawals.response.status}`,
      );

      const adminWithdrawals = await adminPost("/api/admin/withdrawals", { action: "list" });
      assert(
        adminWithdrawals.response.status === 200 &&
          Array.isArray(adminWithdrawals.data?.withdrawals) &&
          adminWithdrawals.data.withdrawals.some((row) => row.id === withdrawalId),
        `Auth flow probe could not list withdrawal in admin queue: ${adminWithdrawals.response.status}`,
      );

      const missingNoteApprove = await adminPost("/api/admin/withdrawals", {
        action: "approve",
        withdrawalId,
      });
      assert(
        missingNoteApprove.response.status === 400 &&
          missingNoteApprove.data?.error === "Admin note is required before approving a withdrawal request.",
        `Auth flow probe withdrawal missing-note approve expected 400, got ${missingNoteApprove.response.status}`,
      );

      const approvedWithdrawal = await adminPost(
        "/api/admin/withdrawals",
        {
          action: "approve",
          withdrawalId,
          adminNote: "Codex smoke approved after internal balance check; no external payout yet",
        },
        20_000,
      );
      assert(
        approvedWithdrawal.response.status === 200 &&
          approvedWithdrawal.data?.withdrawal?.status === "approved" &&
          approvedWithdrawal.data.withdrawal.walletTransactionId,
        `Auth flow probe could not approve withdrawal: ${approvedWithdrawal.response.status}`,
      );

      const debit = await restGet(
        "worldcup_wallet_transactions",
        `select=id,from_user_id,amount,transaction_type&id=eq.${approvedWithdrawal.data.withdrawal.walletTransactionId}&limit=1`,
      );
      assert(
        debit.response.ok &&
          debit.data?.[0]?.transaction_type === "withdrawal" &&
          debit.data[0].from_user_id === player.userId &&
          Number(debit.data[0].amount) === 0.02,
        `Auth flow probe could not verify withdrawal wallet debit: ${debit.response.status}`,
      );

      const missingPayoutHash = await adminPost("/api/admin/withdrawals", {
        action: "mark_paid",
        withdrawalId,
        adminNote: "Codex smoke payout hash required",
      });
      assert(
        missingPayoutHash.response.status === 400 &&
          missingPayoutHash.data?.error === "External transaction hash does not match the withdrawal network.",
        `Auth flow probe withdrawal missing payout hash expected 400, got ${missingPayoutHash.response.status}`,
      );

      const payoutTxHash = buildProbeTxHash(withdrawalNetwork, Date.now(), "c");
      const paidWithdrawal = await adminPost(
        "/api/admin/withdrawals",
        {
          action: "mark_paid",
          withdrawalId,
          adminNote: "Codex smoke marked paid with fake network-valid tx hash; no external funds",
          externalTxHash: payoutTxHash,
        },
        20_000,
      );
      assert(
        paidWithdrawal.response.status === 200 &&
          paidWithdrawal.data?.withdrawal?.status === "paid" &&
          paidWithdrawal.data.withdrawal.externalTxHash === payoutTxHash &&
          paidWithdrawal.data.withdrawal.payoutEvidenceReady === false,
        `Auth flow probe could not mark withdrawal paid: ${paidWithdrawal.response.status}`,
      );
      const paidWithdrawalRow = await restGet(
        "worldcup_withdrawal_requests",
        `select=id,raw&id=eq.${withdrawalId}&limit=1`,
      );
      assert(
        paidWithdrawalRow.response.ok &&
          paidWithdrawalRow.data?.[0]?.raw?.payoutEvidence?.launchReady === false,
        `Auth flow probe fake withdrawal unexpectedly looked like launch-ready payout evidence`,
      );
    } else {
      assertPaidActionPaused(withdrawalRequest, "Auth flow withdrawal request");
    }

    const consentPost = await fetchUserJson(
      "/api/consent",
      player.accessToken,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ageConfirmed: true, termsAccepted: true }),
      },
    );
    assert(
      consentPost.response.status === 200 && consentPost.data?.consented === true,
      `Auth flow probe could not save consent: ${consentPost.response.status}`,
    );

    const consentGet = await fetchUserJson("/api/consent", player.accessToken);
    assert(
      consentGet.response.status === 200 && consentGet.data?.consented === true,
      `Auth flow probe could not read consent: ${consentGet.response.status}`,
    );

    const assignTicket = await adminPost(
      "/api/admin/tickets",
      {
        action: "assign",
        userId: player.userId,
        quantity: 1,
      },
      20_000,
    );
    assert(
      assignTicket.response.status === 200 && assignTicket.data?.assignedTickets === 1,
      `Auth flow probe could not assign ticket: ${assignTicket.response.status}`,
    );

    const teamIds = await loadProbeTeamIds();
    const entry = await fetchUserJson(
      "/api/entries",
      player.accessToken,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: "Codex Player Probe",
          teamIds,
          referralCode,
          referralTermsAccepted: true,
        }),
      },
      20_000,
    );
    if (paidActionGate.entryAllowed) {
      assert(
        entry.response.status === 200 && entry.data?.entryId,
        `Auth flow probe could not create referred entry: ${entry.response.status}`,
      );
      state.entryId = entry.data.entryId;

      const inviterAfterEntry = await fetchUserJson("/api/referrals/me", inviter.accessToken);
      assert(
        inviterAfterEntry.response.status === 200 &&
          Array.isArray(inviterAfterEntry.data?.referrals) &&
          inviterAfterEntry.data.referrals.some((row) => row.entryId === state.entryId),
        `Auth flow probe could not verify referral activity: ${inviterAfterEntry.response.status}`,
      );
    } else {
      assertPaidActionPaused(entry, "Auth flow entry locking");
    }
  } finally {
    await cleanupAuthFlowProbe(state);
  }
}

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();
  assert(value && value !== "..." && !value.toLowerCase().startsWith("replace-with-"), `Missing ${name}`);

  return value;
}

function readOptionalEnv(name) {
  const value = process.env[name]?.trim();

  if (!value || value === "..." || value.toLowerCase().startsWith("replace-with-")) {
    return null;
  }

  return value;
}

function signHmacBase64(secret, value) {
  return createHmac("sha256", secret).update(value).digest("base64");
}

function buildQuery(query) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

async function kucoinSignedRequest(config, method, path, query) {
  const timestamp = Date.now().toString();
  const endpoint = `${path}${method === "GET" ? buildQuery(query) : ""}`;
  const body = "";

  const headers = {
    "Content-Type": "application/json",
    "KC-API-KEY": config.apiKey,
    "KC-API-SIGN": signHmacBase64(config.apiSecret, `${timestamp}${method}${endpoint}${body}`),
    "KC-API-TIMESTAMP": timestamp,
    "KC-API-PASSPHRASE": signHmacBase64(config.apiSecret, config.apiPassphrase),
    "KC-API-KEY-VERSION": "2",
  };

  if (config.brokerName && config.brokerKey) {
    headers["KC-API-PARTNER"] = config.brokerName;
    headers["KC-BROKER-NAME"] = config.brokerName;
    headers["KC-API-PARTNER-VERIFY"] = "true";
    headers["KC-API-PARTNER-SIGN"] = signHmacBase64(
      config.brokerKey,
      `${timestamp}${config.brokerName}${config.apiKey}`,
    );
  }

  const result = await fetchJson(
    `${config.baseUrl}${endpoint}`,
    {
      method,
      headers,
    },
    12_000,
  );

  assert(
    result.response.ok && result.data?.code === "200000",
    `KuCoin ${path} expected success, got ${result.data?.code ?? result.response.status}: ${result.data?.msg ?? ""}`,
  );

  return result.data.data;
}

async function checkKucoinLiveProbe() {
  const mainConfig = {
    baseUrl: "https://api.kucoin.com",
    apiKey: readRequiredEnv("KUCOIN_MAIN_API_KEY"),
    apiSecret: readRequiredEnv("KUCOIN_MAIN_API_SECRET"),
    apiPassphrase: readRequiredEnv("KUCOIN_MAIN_API_PASSPHRASE"),
  };
  const brokerApiKey = readOptionalEnv("KUCOIN_API_KEY");
  const brokerApiSecret = readOptionalEnv("KUCOIN_API_SECRET");
  const brokerApiPassphrase = readOptionalEnv("KUCOIN_API_PASSPHRASE");
  const brokerName = readOptionalEnv("KUCOIN_BROKER_NAME");
  const brokerKey = readOptionalEnv("KUCOIN_BROKER_KEY");

  if (brokerApiKey && brokerApiSecret && brokerApiPassphrase && brokerName && brokerKey) {
    const brokerDeposits = await kucoinSignedRequest(
      {
        baseUrl: (process.env.KUCOIN_BROKER_API_BASE ?? "https://api-broker.kucoin.com").replace(/\/+$/, ""),
        apiKey: brokerApiKey,
        apiSecret: brokerApiSecret,
        apiPassphrase: brokerApiPassphrase,
        brokerName,
        brokerKey,
      },
      "GET",
      "/api/v1/asset/ndbroker/deposit/list",
      {
        currency: "USDT",
        status: "SUCCESS",
        limit: 5,
      },
    );
    assert(
      Array.isArray(brokerDeposits) || Array.isArray(brokerDeposits?.items),
      "KuCoin broker deposit list response shape changed",
    );
  }

  const mainAccounts = await kucoinSignedRequest(mainConfig, "GET", "/api/v1/accounts", {
    currency: "USDT",
    type: "main",
  });
  assert(Array.isArray(mainAccounts), "KuCoin main account list response shape changed");

  const mainDeposits = await kucoinSignedRequest(mainConfig, "GET", "/api/v1/deposits", {
    currency: "USDT",
    status: "SUCCESS",
    currentPage: 1,
    pageSize: 10,
  });
  assert(
    Array.isArray(mainDeposits?.items) || Array.isArray(mainDeposits),
    "KuCoin main deposit history response shape changed",
  );
}

async function checkSupabaseAuth() {
  assert(supabaseAnonKey, "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase Auth smoke check");

  const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: supabaseAnonKey },
  });
  const settingsText = await settingsResponse.text();

  assert(settingsResponse.status === 200, `Supabase auth settings expected 200, got ${settingsResponse.status}`);

  const settings = JSON.parse(settingsText);
  assert(settings.external?.google === true, "Supabase Google provider is not enabled");
  assert(settings.external?.email === false, "Supabase email provider should be disabled for Google-only signup");

  const authorizeUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", baseUrl);

  const authorizeResponse = await fetch(authorizeUrl, {
    headers: { apikey: supabaseAnonKey },
    redirect: "manual",
  });

  const location = authorizeResponse.headers.get("location") ?? "";
  assert(
    authorizeResponse.status === 302 && location.includes("accounts.google.com"),
    "Supabase Google authorize did not redirect to Google",
  );
}

async function main() {
  console.log(`Smoke testing ${baseUrl}`);

  const homeResponse = await checkPage("/", "Choose 3 Teams");
  await checkPage("/admin", "WorldCup");
  await checkPublicPages();
  await checkPublicUiShell();
  await checkHealth();
  await checkAdminRejection();
  await checkAdminAuthorized();
  await checkSecurityHeaders(homeResponse);
  await checkSupabaseAuth();
  await checkPublicReferralResolve();
  await checkDepositReadiness();

  if (runRateLimitProbe) {
    await checkRateLimit();
  }

  if (runDepositCreditProbe) {
    await checkDepositCreditProbe();
  }

  if (runAuthFlowProbe) {
    await checkAuthenticatedUserFlowProbe();
  }

  if (runKucoinLiveProbe) {
    await checkKucoinLiveProbe();
  }

  console.log("Production smoke checks passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
