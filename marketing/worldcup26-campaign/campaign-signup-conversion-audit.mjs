#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const TESTER_BATCH_LINK = `${REFERRAL_LINK}&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test`;
const PROOF_SCREENSHOT =
  "runtime/proofs/referral-mobile-accepted-google-enabled-20260607-1754.png";

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const paidAdTriage = await readJson(path.join(runtimeDir, "paid-ad-triage.json"), {});
const referralActivity = await readJson(path.join(runtimeDir, "referral-activity.json"), {});
const conversionGuard = await readJson(path.join(runtimeDir, "conversion-guard.json"), {});
const paidDashboard = await readJson(path.join(runtimeDir, "paid-dashboard-checks.json"), {});
const postAuthSaveProbe = await checkPostAuthSaveEndpoint();
const payload = buildPayload({
  paidAdTriage,
  referralActivity,
  conversionGuard,
  paidDashboard,
  postAuthSaveProbe,
});

await writeFile(
  path.join(runtimeDir, "signup-conversion-audit.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
);
await writeFile(path.join(runtimeDir, "signup-conversion-audit.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "signup-conversion-audit.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "signup-conversion-audit.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({
  paidAdTriage,
  referralActivity,
  conversionGuard,
  paidDashboard,
  postAuthSaveProbe,
}) {
  const counts = {
    appViews: numberFrom(
      paidAdTriage?.counts?.appViews,
      referralActivity?.counts?.appViews,
      referralActivity?.viewCounts?.appViews,
    ),
    referralViews: numberFrom(
      paidAdTriage?.counts?.referralViews,
      referralActivity?.counts?.referralViews,
      referralActivity?.viewCounts?.referralViews,
    ),
    paidViews: numberFrom(paidAdTriage?.paidViews),
    signupSaves: numberFrom(
      paidAdTriage?.counts?.signupSaves,
      referralActivity?.counts?.signupSaves,
      referralActivity?.counts?.signupReferralSaves,
    ),
    accepted: numberFrom(
      paidAdTriage?.counts?.accepted,
      referralActivity?.counts?.accepted,
      referralActivity?.counts?.acceptedReferrals,
    ),
    entries: numberFrom(referralActivity?.counts?.entries, referralActivity?.counts?.referredEntries),
    profiles: numberFrom(referralActivity?.accountCounts?.profiles),
    free: numberFrom(referralActivity?.accountCounts?.freeAccounts),
    paid: numberFrom(referralActivity?.accountCounts?.paidAccounts),
    signupReturned: numberFrom(referralActivity?.viewCounts?.signupReturned),
    signupMissingAcceptance: numberFrom(referralActivity?.viewCounts?.signupMissingAcceptance),
    signupAttempts: numberFrom(referralActivity?.viewCounts?.signupAttempts),
    signupSavedEvents: numberFrom(referralActivity?.viewCounts?.signupSavedEvents),
    signupFailedEvents: numberFrom(referralActivity?.viewCounts?.signupFailedEvents),
    signupErrorEvents: numberFrom(referralActivity?.viewCounts?.signupErrorEvents),
  };
  const dashboard = {
    state: String(paidAdTriage?.dashboard?.state ?? paidDashboard?.state ?? "missing"),
    checks: numberFrom(
      Array.isArray(paidAdTriage?.dashboard?.latestChecks)
        ? paidAdTriage.dashboard.latestChecks.length
        : paidDashboard?.checks?.length,
    ),
    impressions: numberFrom(
      paidAdTriage?.dashboard?.totalImpressions,
      paidDashboard?.totals?.impressions,
    ),
    clicks: numberFrom(paidAdTriage?.dashboard?.totalClicks, paidDashboard?.totals?.clicks),
    spend: numberFrom(paidAdTriage?.dashboard?.totalSpend, paidDashboard?.totals?.spend),
  };
  const pathProof = {
    firstPaint: Boolean(conversionGuard?.ok),
    browserVerified: Boolean(conversionGuard?.browserVerified ?? conversionGuard?.browser_verified),
    inviterFound: Boolean(referralActivity?.inviterFound ?? referralActivity?.inviter?.found),
    inviterName: String(
      referralActivity?.inviterName ??
        referralActivity?.inviter?.displayName ??
        conversionGuard?.inviter ??
        "David Ai",
    ),
    referralPercent: numberFrom(conversionGuard?.percent, 5),
    screenshot: PROOF_SCREENSHOT,
  };
  const state = determineState({ counts, dashboard, pathProof });
  const blockers = [];
  if (counts.signupSaves === 0) {
    blockers.push("No saved referral signup exists after Google auth.");
  }
  if (counts.signupReturned === 0) {
    blockers.push("No logged-in dashboard return event exists for the referral code yet.");
  }
  if (counts.signupReturned > 0 && counts.signupAttempts === 0) {
    blockers.push("A user returned from Google with the referral code, but no referral-save attempt event is visible.");
  }
  if (counts.signupAttempts > 0 && counts.signupSaves === 0) {
    blockers.push("Referral-save attempt events exist, but no saved referral row exists.");
  }
  if (counts.signupFailedEvents > 0 || counts.signupErrorEvents > 0) {
    blockers.push("Referral-save failure/error events exist and need browser or server-log inspection.");
  }
  if (counts.accepted === 0) {
    blockers.push("No accepted referral agreement row is visible in the campaign counts.");
  }
  if (dashboard.clicks > 0 && counts.signupSaves === 0) {
    blockers.push("Paid clicks are present, but none reached a completed signup-save event.");
  }
  if (!pathProof.browserVerified) {
    blockers.push("Browser proof for accepted invite and enabled Google button is missing or stale.");
  }
  return {
    schema: "worldcup26-signup-conversion-audit-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: counts.signupSaves > 0,
    state,
    counts,
    dashboard,
    pathProof,
    postAuthSaveProbe,
    blockers,
    firstAction:
      `Send the clean signup test to 3 trusted people with different Google accounts using ${TESTER_BATCH_LINK}. Ask each to accept the invite, continue with Google, pick 3 teams, and reply with either "joined + picked teams" or a screenshot of the exact blocking screen. After the real send is logged, rerun this audit and verify the dashboard POSTs /api/referrals/signup with a bearer token and that worldcup_referral_profiles stores signup_referral_code=26BC4B90CB.`,
    proofRule:
      "Do not claim signup conversion proof until there is a real new user/profile plus referral signup save row, or a clear private-channel tester note with account, timestamp, and screenshot.",
    noAdChangeRule:
      "Do not change paid creative again until the full Google-auth-to-referral-save path is proven or a concrete failing step is captured.",
    memoCommand:
      `node campaign-public-channel-attempts.mjs --add --owner "Memo" --platform "WhatsApp testers" --channel "clean signup test batch" --status "sent" --attempt-url "${TESTER_BATCH_LINK}" --detail "Sent clean signup test to <N> trusted testers from <account> at YYYY-MM-DD HH:mm EEST; asked each to accept invite, Google signup, pick 3 teams, and reply with success or blocking screenshot; code 26BC4B90CB included" --next-action "run campaign-signup-conversion-audit.mjs after tester replies or after 15 minutes"`,
  };
}

async function checkPostAuthSaveEndpoint() {
  const startedAt = Date.now();
  try {
    const response = await fetch("https://worldcup26.world/api/referrals/signup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "WorldCup26-signup-conversion-audit/1.0",
      },
      body: JSON.stringify({
        referralCode: REFERRAL_CODE,
        referralTermsAccepted: true,
      }),
      signal: AbortSignal.timeout(Number(args.timeoutMs || 15_000)),
    });
    const text = await response.text();
    const failures = [];
    if (response.status !== 401) {
      failures.push(`expected unauthenticated 401, got ${response.status}`);
    }
    if (!/Sign in with Google before saving a signup referral/i.test(text)) {
      failures.push("expected Google sign-in guard message missing");
    }
    return {
      ok: failures.length === 0,
      status: response.status,
      expected: "401 until Google bearer token is present",
      elapsedMs: Date.now() - startedAt,
      failures,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      expected: "401 until Google bearer token is present",
      elapsedMs: Date.now() - startedAt,
      failures: [error.message],
    };
  }
}

function determineState({ counts, dashboard, pathProof }) {
  if (counts.signupSaves > 0) return "signup-save-proven";
  if (!pathProof.firstPaint || !pathProof.browserVerified) return "needs-live-referral-browser-proof";
  if (counts.signupFailedEvents > 0 || counts.signupErrorEvents > 0) return "critical-referral-save-failing";
  if (counts.signupAttempts > 0) return "critical-save-attempt-without-row";
  if (counts.signupReturned > 0) return "critical-returned-without-save-attempt";
  if (dashboard.clicks > 0 || counts.paidViews > 0 || counts.referralViews > 0) {
    return "critical-auth-to-signup-save-unproven";
  }
  return "needs-paid-traffic-or-real-tester";
}

function renderText(payload) {
  return [
    `WorldCup26 signup conversion audit ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} code=${payload.referralCode}`,
    `app_views=${payload.counts.appViews} referral_views=${payload.counts.referralViews} paid_views=${payload.counts.paidViews}`,
    `dashboard_state=${payload.dashboard.state} dashboard_clicks=${payload.dashboard.clicks} dashboard_spend=${payload.dashboard.spend}`,
    `profiles=${payload.counts.profiles} free=${payload.counts.free} paid=${payload.counts.paid} accepted=${payload.counts.accepted} signup_saves=${payload.counts.signupSaves} entries=${payload.counts.entries}`,
    `signup_funnel=returned:${payload.counts.signupReturned} missing_acceptance:${payload.counts.signupMissingAcceptance} attempts:${payload.counts.signupAttempts} saved_events:${payload.counts.signupSavedEvents} failed:${payload.counts.signupFailedEvents} errors:${payload.counts.signupErrorEvents}`,
    `path_first_paint=${payload.pathProof.firstPaint ? "yes" : "no"} browser_verified=${payload.pathProof.browserVerified ? "yes" : "no"} inviter_found=${payload.pathProof.inviterFound ? "yes" : "no"} inviter="${payload.pathProof.inviterName}" percent=${payload.pathProof.referralPercent}`,
    `post_auth_save_endpoint=${payload.postAuthSaveProbe.ok ? "ok" : "fail"} unauth_status=${payload.postAuthSaveProbe.status} expected="${payload.postAuthSaveProbe.expected}" elapsed_ms=${payload.postAuthSaveProbe.elapsedMs}`,
    `browser_proof=${payload.pathProof.screenshot}`,
    "",
    "blockers:",
    ...(payload.blockers.length ? payload.blockers.map((line) => `- ${line}`) : ["- none"]),
    "",
    `first_action=${payload.firstAction}`,
    `proof_rule=${payload.proofRule}`,
    `no_ad_change_rule=${payload.noAdChangeRule}`,
    `memo_command=${payload.memoCommand}`,
    "",
  ].join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Signup Conversion Audit

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}
- App views: ${payload.counts.appViews}
- Referral views: ${payload.counts.referralViews}
- Paid-source views: ${payload.counts.paidViews}
- Dashboard clicks: ${payload.dashboard.clicks}
- Signup saves: ${payload.counts.signupSaves}
- Accepted referral rows: ${payload.counts.accepted}
- Signup returned events: ${payload.counts.signupReturned}
- Signup save attempts: ${payload.counts.signupAttempts}
- Signup saved events: ${payload.counts.signupSavedEvents}
- Signup failed/error events: ${payload.counts.signupFailedEvents + payload.counts.signupErrorEvents}
- Browser proof: \`${payload.pathProof.screenshot}\`
- Post-auth save endpoint: ${payload.postAuthSaveProbe.ok ? "ok" : "fail"} unauthenticated HTTP ${payload.postAuthSaveProbe.status}

## Diagnosis

The invite landing path is visible and the accepted Google button has browser proof, but the full Google-auth-to-referral-save path is not proven yet.

The \`/api/referrals/signup\` endpoint exists and correctly requires a Google bearer token. The remaining test must happen after a real Google account returns to the app.

## Blockers

${payload.blockers.map((line) => `- ${line}`).join("\n")}

## First Action

${payload.firstAction}

## Proof Rule

${payload.proofRule}

## Memo Command

\`\`\`bash
${payload.memoCommand}
\`\`\`
`;
}

function renderHtml(payload) {
  const blockers = payload.blockers.length
    ? payload.blockers.map((line) => `<li>${escapeHtml(line)}</li>`).join("")
    : "<li>none</li>";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Signup Conversion Audit</title>
  <style>
    body{margin:0;background:#06140f;color:#edf8f1;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{max-width:980px;margin:0 auto;padding:24px}
    header,.card{border:1px solid rgba(255,220,124,.28);background:linear-gradient(135deg,rgba(9,74,53,.94),rgba(19,31,26,.96));border-radius:14px;padding:18px;margin-bottom:16px;box-shadow:0 18px 50px rgba(0,0,0,.28)}
    h1{margin:0 0 6px;font-size:28px} h2{margin:0 0 10px;font-size:18px}
    p{color:#c9d8d0;line-height:1.45}.state{display:inline-block;padding:6px 10px;border-radius:999px;background:#ffd66d;color:#092016;font-weight:900}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.metric{border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:12px;background:rgba(255,255,255,.06)}
    .metric span{display:block;color:#b8c8c0;font-size:12px;text-transform:uppercase;font-weight:800}.metric strong{font-size:25px;color:#ffdc7c}
    code{background:rgba(255,255,255,.08);padding:2px 6px;border-radius:6px} a{color:#79edbe}
    ul{padding-left:20px}.danger{border-color:rgba(255,112,112,.45);background:linear-gradient(135deg,rgba(89,24,24,.72),rgba(23,33,29,.95))}
  </style>
</head>
<body>
  <main>
    <header>
      <span class="state">${escapeHtml(payload.state)}</span>
      <h1>Signup Conversion Audit</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
    </header>
    <section class="card">
      <h2>Traffic And Signup Counts</h2>
      <div class="grid">
        ${metric("App views", payload.counts.appViews)}
        ${metric("Referral views", payload.counts.referralViews)}
        ${metric("Paid views", payload.counts.paidViews)}
        ${metric("Dashboard clicks", payload.dashboard.clicks)}
        ${metric("Signup saves", payload.counts.signupSaves)}
        ${metric("Accepted", payload.counts.accepted)}
        ${metric("Signup returned", payload.counts.signupReturned)}
        ${metric("Save attempts", payload.counts.signupAttempts)}
        ${metric("Saved events", payload.counts.signupSavedEvents)}
        ${metric("Failed/errors", payload.counts.signupFailedEvents + payload.counts.signupErrorEvents)}
        ${metric("Save endpoint", payload.postAuthSaveProbe.status)}
      </div>
    </section>
    <section class="card">
      <h2>Verified Path</h2>
      <p>First paint: <strong>${payload.pathProof.firstPaint ? "yes" : "no"}</strong>. Browser proof: <strong>${payload.pathProof.browserVerified ? "yes" : "no"}</strong>. Inviter: <strong>${escapeHtml(payload.pathProof.inviterName)}</strong>. Referral percent: <strong>${payload.pathProof.referralPercent}%</strong>.</p>
      <p>Post-auth save endpoint: <strong>${payload.postAuthSaveProbe.ok ? "ok" : "fail"}</strong>. Unauthenticated probe returned HTTP <strong>${payload.postAuthSaveProbe.status}</strong>, expected ${escapeHtml(payload.postAuthSaveProbe.expected)}.</p>
      <p>Screenshot: <code>${escapeHtml(payload.pathProof.screenshot)}</code></p>
    </section>
    <section class="card danger">
      <h2>Blockers</h2>
      <ul>${blockers}</ul>
      <p><strong>First action:</strong> ${escapeHtml(payload.firstAction)}</p>
      <p>${escapeHtml(payload.noAdChangeRule)}</p>
    </section>
  </main>
</body>
</html>
`;
}

function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function numberFrom(...values) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return 0;
}

function formatEestLogTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--quiet") parsed.quiet = true;
    else if (token === "--root") parsed.root = argv[++index];
    else if (token === "--now") parsed.now = argv[++index];
  }
  return parsed;
}
