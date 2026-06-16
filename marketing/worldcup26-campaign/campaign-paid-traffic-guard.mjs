#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const EXPECTED_INVITER = "David Ai";
const EXPECTED_PERCENT = 5;
const DEFAULT_TIMEOUT_MS = 15_000;

const PAGE_VARIANTS = [
  {
    name: "meta-campaign",
    url: `${REFERRAL_LINK}&utm_source=meta&utm_medium=paid_social&utm_campaign=worldcup26_referral_72h`,
  },
  {
    name: "facebook-feed",
    url: `${REFERRAL_LINK}&utm_source=facebook&utm_medium=paid_social&utm_campaign=worldcup26_referral_72h`,
  },
  {
    name: "instagram-story",
    url: `${REFERRAL_LINK}&utm_source=instagram&utm_medium=story&utm_campaign=worldcup26_referral_72h`,
  },
  {
    name: "x-campaign",
    url: `${REFERRAL_LINK}&utm_source=x&utm_medium=paid_social&utm_campaign=worldcup26_referral_72h`,
  },
  {
    name: "tiktok-video",
    url: `${REFERRAL_LINK}&utm_source=tiktok&utm_medium=video&utm_campaign=worldcup26_referral_72h`,
  },
  {
    name: "youtube-shorts",
    url: `${REFERRAL_LINK}&utm_source=youtube&utm_medium=shorts&utm_campaign=worldcup26_referral_72h`,
  },
  {
    name: "whatsapp-status",
    url: `${REFERRAL_LINK}&utm_source=whatsapp&utm_medium=status&utm_campaign=worldcup26_referral_72h`,
  },
];

const BAD_PATTERNS = [
  /Wallet paid actions paused/i,
  /Deposit \/ withdraw/i,
  /USDT deposits are paused/i,
  /3% of my winnings/i,
  /Agent code or email/i,
  /placeholder="Age"/i,
  /I confirm I am at least 18 years old/i,
  /lxhjfdxowpxzrybxdasi\.supabase\.co/i,
  /[A-Za-z]*â[A-Za-z]*/i,
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const pageChecks = [];
for (const variant of PAGE_VARIANTS) {
  pageChecks.push(await checkLandingPage(variant));
}

const resolverCheck = await checkReferralResolver();
const healthCheck = await checkHealth();
const deploymentIds = [...new Set(pageChecks.map((check) => check.dplId).filter(Boolean))];
const payload = {
  generatedAt: now.toISOString(),
  generatedAtEest: formatEestLogTime(now),
  referralCode: REFERRAL_CODE,
  referralLink: REFERRAL_LINK,
  expectedInviter: EXPECTED_INVITER,
  expectedPercent: EXPECTED_PERCENT,
  ok:
    pageChecks.every((check) => check.ok) &&
    resolverCheck.ok &&
    healthCheck.ok &&
    deploymentIds.length === 1,
  deploymentIds,
  checks: {
    pages: pageChecks,
    resolver: resolverCheck,
    health: healthCheck,
  },
};

await writeFile(path.join(runtimeDir, "paid-traffic-guard.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "paid-traffic-guard.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "paid-traffic-guard.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "paid-traffic-guard.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

async function checkLandingPage(variant) {
  const startedAt = Date.now();
  try {
    const response = await fetch(variant.url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "WorldCup26-paid-traffic-guard/1.0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const body = await response.text();
    const headers = Object.fromEntries(response.headers.entries());
    const failures = [];
    if (!response.ok) failures.push(`http ${response.status}`);
    if (!body.includes(REFERRAL_CODE)) failures.push("referral code missing");
    if (!/Continue with Google/i.test(body)) failures.push("google CTA missing");
    if (!/Referral agreement/i.test(body)) failures.push("referral agreement missing");
    if (!/5% of my winnings/i.test(body)) failures.push("5 percent agreement missing");
    if (!/All 48 teams/i.test(body)) failures.push("48-team availability copy missing");
    if (!/Account setup is open until June 18, 2026/i.test(body)) {
      failures.push("June 18 account setup copy missing");
    }
    if (!/Code applied/i.test(body)) failures.push("code applied fallback copy missing");
    if (!/auth-google-button" disabled=""/i.test(body)) {
      failures.push("google CTA should be disabled before agreement on first paint");
    }
    const csp = headers["content-security-policy"] ?? "";
    if (!csp.includes("https://api.worldcup26.world")) failures.push("CSP missing custom auth domain");
    for (const pattern of BAD_PATTERNS) {
      if (pattern.test(body)) failures.push(`bad copy: ${pattern.source}`);
    }
    const dplId = body.match(/data-dpl-id="([^"]+)"/)?.[1] ?? "";
    return {
      name: variant.name,
      url: variant.url,
      finalUrl: response.url,
      status: response.status,
      ok: failures.length === 0,
      failures,
      dplId,
      bytes: body.length,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      name: variant.name,
      url: variant.url,
      finalUrl: "",
      status: 0,
      ok: false,
      failures: [error.message],
      dplId: "",
      bytes: 0,
      elapsedMs: Date.now() - startedAt,
    };
  }
}

async function checkReferralResolver() {
  const startedAt = Date.now();
  try {
    const resolverUrl = new URL("/api/referrals/resolve", REFERRAL_LINK);
    resolverUrl.searchParams.set("code", REFERRAL_CODE);
    const response = await fetch(resolverUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "WorldCup26-paid-traffic-guard/1.0",
      },
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const result = await response.json();
    const failures = [];
    if (!response.ok) failures.push(`http ${response.status}`);
    if (!result.valid) failures.push("referral code invalid");
    if (result.referralCode !== REFERRAL_CODE) failures.push("referral code mismatch");
    if (String(result.inviterName ?? "") !== EXPECTED_INVITER) failures.push("inviter mismatch");
    if (Number(result.referralPercent ?? 0) !== EXPECTED_PERCENT) failures.push("referral percent mismatch");
    return {
      ok: failures.length === 0,
      status: response.status,
      valid: Boolean(result.valid),
      referralCode: String(result.referralCode ?? ""),
      inviterName: String(result.inviterName ?? ""),
      referralPercent: Number(result.referralPercent ?? 0),
      failures,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      valid: false,
      referralCode: "",
      inviterName: "",
      referralPercent: 0,
      failures: [error.message],
      elapsedMs: Date.now() - startedAt,
    };
  }
}

async function checkHealth() {
  const startedAt = Date.now();
  try {
    const response = await fetch("https://worldcup26.world/api/health", {
      headers: {
        accept: "application/json",
        "user-agent": "WorldCup26-paid-traffic-guard/1.0",
      },
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const result = await response.json();
    const failures = [];
    if (!response.ok) failures.push(`http ${response.status}`);
    if (!result.ok) failures.push("health not ok");
    if (result.database !== "available") failures.push("database not available");
    if (result.tournament?.status !== "open") failures.push("tournament not open");
    return {
      ok: failures.length === 0,
      status: response.status,
      service: String(result.service ?? ""),
      database: String(result.database ?? ""),
      tournamentStatus: String(result.tournament?.status ?? ""),
      failures,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      service: "",
      database: "",
      tournamentStatus: "",
      failures: [error.message],
      elapsedMs: Date.now() - startedAt,
    };
  }
}

function renderText(payload) {
  const lines = [
    `WorldCup26 paid traffic guard ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} pages=${payload.checks.pages.length} code=${payload.referralCode} inviter="${payload.expectedInviter}" percent=${payload.expectedPercent} dpl=${payload.deploymentIds.join(",") || "-"}`,
    `resolver=${payload.checks.resolver.ok ? "ok" : "fail"} health=${payload.checks.health.ok ? "ok" : "fail"}`,
    "",
  ];
  for (const check of payload.checks.pages) {
    lines.push(`${check.name}: ${check.ok ? "ok" : "fail"} status=${check.status} dpl=${check.dplId || "-"} elapsed_ms=${check.elapsedMs}`);
    if (!check.ok) lines.push(`  failures=${check.failures.join("; ")}`);
  }
  if (!payload.checks.resolver.ok) {
    lines.push(`resolver_failures=${payload.checks.resolver.failures.join("; ")}`);
  }
  if (!payload.checks.health.ok) {
    lines.push(`health_failures=${payload.checks.health.failures.join("; ")}`);
  }
  lines.push("", "Guard rule: this proves paid clicks can land safely. It does not prove external posts were made.", "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Paid Traffic Guard

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ok" : "fail"}
- Referral code: \`${payload.referralCode}\`
- Inviter: ${payload.expectedInviter}
- Referral percent: ${payload.expectedPercent}
- Deployment: ${payload.deploymentIds.join(", ") || "-"}
- Resolver: ${payload.checks.resolver.ok ? "ok" : "fail"}
- Health: ${payload.checks.health.ok ? "ok" : "fail"}

## Landing Pages

${payload.checks.pages.map(renderPageMarkdown).join("\n\n")}

## Rule

This guard proves paid ad clicks can land safely on WorldCup26. It does not prove any external post, story, message, upload, or ad edit happened.
`;
}

function renderPageMarkdown(check) {
  return `### ${check.name}

- Status: ${check.ok ? "ok" : "fail"}
- HTTP: ${check.status}
- Deployment: ${check.dplId || "-"}
- Elapsed: ${check.elapsedMs} ms
- URL: ${check.url}
${check.ok ? "" : `- Failures: ${check.failures.join("; ")}`}`;
}

function renderHtml(payload) {
  const pageCards = payload.checks.pages.map(renderPageHtml).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Paid Traffic Guard</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #08271f; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd56f; --mint: #78efb4; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(120,239,180,.16), transparent 24rem), radial-gradient(circle at 90% 4%, rgba(255,213,111,.18), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 14px 10px 42px; }
    header, article, section { border: 1px solid var(--line); border-radius: 8px; background: rgba(8,39,31,.94); box-shadow: 0 20px 60px rgba(0,0,0,.28); }
    header { padding: 18px; margin-bottom: 12px; }
    h1 { margin: 0 0 8px; font-size: clamp(30px, 7vw, 56px); line-height: .95; letter-spacing: 0; }
    p { color: var(--muted); line-height: 1.45; }
    .status { color: ${payload.ok ? "var(--mint)" : "var(--danger)"}; font-weight: 950; text-transform: uppercase; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; overflow-wrap: anywhere; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    article { padding: 14px; }
    article.is-bad { border-color: rgba(255,159,159,.55); }
    h2 { margin: 0 0 6px; }
    code { color: var(--gold); overflow-wrap: anywhere; }
    .rule { margin-top: 12px; padding: 14px; }
    @media (max-width: 720px) { .stats, .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="status">${payload.ok ? "ok" : "fail"}</p>
      <h1>Paid Traffic Guard</h1>
      <p>Checks paid/social click variants before the campaign spends attention on a broken route.</p>
      <div class="stats">
        <div class="stat"><span>Code</span><strong>${escapeHtml(payload.referralCode)}</strong></div>
        <div class="stat"><span>Inviter</span><strong>${escapeHtml(payload.expectedInviter)}</strong></div>
        <div class="stat"><span>Percent</span><strong>${payload.expectedPercent}</strong></div>
        <div class="stat"><span>Deployment</span><strong>${escapeHtml(payload.deploymentIds.join(",") || "-")}</strong></div>
      </div>
    </header>
    <section class="grid">${pageCards}</section>
    <section class="rule"><strong>Rule:</strong> this proves click safety only. Log external proof only after real posts, ads, messages, stories, replies, uploads, or approval requests happen.</section>
  </main>
</body>
</html>`;
}

function renderPageHtml(check) {
  return `<article class="${check.ok ? "" : "is-bad"}">
    <h2>${escapeHtml(check.name)}</h2>
    <p>Status: <strong>${check.ok ? "ok" : "fail"}</strong> / HTTP ${check.status} / ${check.elapsedMs} ms</p>
    <p>Deployment: <code>${escapeHtml(check.dplId || "-")}</code></p>
    <p><code>${escapeHtml(check.url)}</code></p>
    ${check.ok ? "" : `<p>Failures: ${escapeHtml(check.failures.join("; "))}</p>`}
  </article>`;
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "", timeoutMs: DEFAULT_TIMEOUT_MS };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--timeout-ms") parsed.timeoutMs = Number(rawArgs[++index] ?? parsed.timeoutMs);
  }
  return parsed;
}

function formatEestLogTime(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const part = (type) => parts.find((entry) => entry.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")} +0300`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
