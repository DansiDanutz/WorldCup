#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const EXPECTED_INVITER = "David Ai";
const EXPECTED_PERCENT = 5;
const SITE_ORIGIN = "https://worldcup26.world";
const AUTH_DOMAIN = "https://api.worldcup26.world";
const AUTH_CODE_CHALLENGE = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~abc";

const CONVERSION_LINKS = [
  link("meta-campaign", "meta", "paid_social"),
  link("facebook-feed", "facebook", "paid_social"),
  link("instagram-story", "instagram", "story"),
  link("x-campaign", "x", "paid_social"),
];

const REQUIRED_FIRST_PAINT = [
  /Register first/i,
  /Create your account/i,
  /Code applied/i,
  /Referral agreement/i,
  /5% of my winnings/i,
  /All 48 teams/i,
  /Account setup is open until June 18, 2026/i,
  /Continue with Google/i,
  /Need help\?/i,
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
  /Sign in\s+to continue to\s+lxhjfdxowpxzrybxdasi\.supabase\.co/i,
  /[\u00c2\u00e2]/i,
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const pageChecks = [];
for (const target of CONVERSION_LINKS) {
  pageChecks.push(await checkFirstPaint(target));
}

const resolverCheck = await checkReferralResolver();
const authCheck = await checkAuthRedirect();
const browserSnapshotPath = args.browserSnapshot || await defaultBrowserSnapshotPath();
const browserProof = await effectiveBrowserProof(await checkBrowserSnapshot(browserSnapshotPath));
const deploymentIds = [...new Set(pageChecks.map((check) => check.dplId).filter(Boolean))];

const payload = {
  schema: "worldcup26-conversion-guard-v1",
  generatedAt: now.toISOString(),
  generatedAtEest: formatEestLogTime(now),
  referralCode: REFERRAL_CODE,
  referralLink: REFERRAL_LINK,
  expectedInviter: EXPECTED_INVITER,
  expectedPercent: EXPECTED_PERCENT,
  ok:
    pageChecks.every((check) => check.ok) &&
    resolverCheck.ok &&
    authCheck.ok &&
    deploymentIds.length === 1,
  browserVerified: browserProof.status === "provided" && browserProof.ok,
  deploymentIds,
  checks: {
    firstPaint: pageChecks,
    resolver: resolverCheck,
    auth: authCheck,
    browserProof,
  },
  rule:
    "This proves paid-ad referral pages render a safe first paint, resolve the inviter, and can start Google auth. Browser proof is included only when a Playwright MCP snapshot is provided.",
};

await writeFile(path.join(runtimeDir, "conversion-guard.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "conversion-guard.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "conversion-guard.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "conversion-guard.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok || (args.requireBrowserProof && !payload.browserVerified)) {
  process.exitCode = 1;
}

function link(name, source, medium) {
  return {
    name,
    url: `${REFERRAL_LINK}&utm_source=${source}&utm_medium=${medium}&utm_campaign=worldcup26_referral_72h&utm_content=conversion_guard`,
  };
}

async function checkFirstPaint(target) {
  const startedAt = Date.now();
  try {
    const response = await fetch(target.url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "WorldCup26-conversion-guard/1.0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const html = await response.text();
    const failures = [];
    if (!response.ok) failures.push(`http ${response.status}`);
    if (safeHost(response.url) !== "worldcup26.world") failures.push(`unexpected host ${safeHost(response.url) || "-"}`);
    if (!html.includes(REFERRAL_CODE)) failures.push("referral code missing");
    for (const pattern of REQUIRED_FIRST_PAINT) {
      if (!pattern.test(html)) failures.push(`missing first-paint copy: ${pattern.source}`);
    }
    if (!/auth-google-button" disabled=""/i.test(html)) {
      failures.push("google auth should be disabled until agreement is accepted");
    }
    for (const pattern of BAD_PATTERNS) {
      if (pattern.test(html)) failures.push(`bad copy: ${pattern.source}`);
    }
    const plain = stripTags(html);
    if (/Need help\?[^a-zA-Z]*\+?\d{6,}/i.test(plain)) {
      failures.push("visible phone number leaked in help area");
    }
    const dplId = html.match(/data-dpl-id="([^"]+)"/)?.[1] ?? "";
    return {
      name: target.name,
      url: target.url,
      finalUrl: response.url,
      status: response.status,
      ok: failures.length === 0,
      failures,
      dplId,
      bytes: html.length,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      name: target.name,
      url: target.url,
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
    const url = new URL("/api/referrals/resolve", SITE_ORIGIN);
    url.searchParams.set("code", REFERRAL_CODE);
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "WorldCup26-conversion-guard/1.0",
      },
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const result = await response.json();
    const failures = [];
    if (!response.ok) failures.push(`http ${response.status}`);
    if (!result.valid) failures.push("referral code invalid");
    if (String(result.referralCode ?? "") !== REFERRAL_CODE) failures.push("referral code mismatch");
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
    return failedCheck(error, startedAt);
  }
}

async function checkAuthRedirect() {
  const startedAt = Date.now();
  try {
    const url = new URL("/auth/v1/authorize", AUTH_DOMAIN);
    url.searchParams.set("provider", "google");
    url.searchParams.set("redirect_to", SITE_ORIGIN);
    url.searchParams.set("code_challenge", AUTH_CODE_CHALLENGE);
    url.searchParams.set("code_challenge_method", "s256");
    const response = await fetch(url, {
      headers: { "user-agent": "WorldCup26-conversion-guard/1.0" },
      redirect: "manual",
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const location = response.headers.get("location") ?? "";
    const failures = [];
    if (response.status !== 302) failures.push(`expected 302, got ${response.status}`);
    if (!location.includes("accounts.google.com")) failures.push("google redirect missing");
    if (!location.includes("redirect_uri=https%3A%2F%2Fapi.worldcup26.world%2Fauth%2Fv1%2Fcallback")) {
      failures.push("custom auth callback missing");
    }
    if (location.includes("lxhjfdxowpxzrybxdasi.supabase.co")) {
      failures.push("Supabase project host leaked in auth redirect");
    }
    return {
      ok: failures.length === 0,
      status: response.status,
      location,
      failures,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    return failedCheck(error, startedAt);
  }
}

async function checkBrowserSnapshot(snapshotPath) {
  if (!snapshotPath) {
    return {
      status: "missing",
      ok: false,
      path: "",
      failures: ["no browser snapshot provided"],
    };
  }
  const resolved = path.resolve(snapshotPath);
  try {
    const text = normalizeSnapshotText(await readFile(resolved, "utf8"));
    const failures = [];
    if (!text.includes("Code applied")) failures.push("code applied missing");
    if (!text.includes(REFERRAL_CODE)) failures.push("referral code missing");
    if (!/Referral recognized from David Ai/i.test(text)) failures.push("David Ai recognition missing");
    if (!/Referral accepted/i.test(text)) failures.push("accepted state missing");
    if (!/5% of my winnings/i.test(text)) failures.push("5 percent agreement missing");
    if (!/button "Continue with Google"(?! \\[disabled\\])/i.test(text)) {
      failures.push("enabled Google button not found after acceptance");
    }
    if (/button "Continue with Google" \[disabled\]/i.test(text)) {
      failures.push("Google button is still disabled after acceptance");
    }
    for (const pattern of BAD_PATTERNS) {
      if (pattern.test(text)) failures.push(`bad copy: ${pattern.source}`);
    }
    return {
      status: "provided",
      ok: failures.length === 0,
      path: resolved,
      failures,
      bytes: text.length,
    };
  } catch (error) {
    return {
      status: "error",
      ok: false,
      path: resolved,
      failures: [error.message],
    };
  }
}

function normalizeSnapshotText(value) {
  const text = String(value ?? "");
  const trimmed = text.trim();
  if (!trimmed.startsWith('"')) return text;
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "string") return parsed;
  } catch {
    // Fall through to the original text when this is not a JSON-encoded string.
  }
  return text;
}

async function defaultBrowserSnapshotPath() {
  const candidate = path.join(runtimeDir, "conversion-browser-snapshot.yml");
  try {
    const candidateStat = await stat(candidate);
    if (candidateStat.isFile() && candidateStat.size > 0) return candidate;
  } catch {
    // Missing default browser proof is expected on fresh campaign installs.
  }
  return "";
}

async function effectiveBrowserProof(currentProof) {
  if (currentProof.status !== "missing") return currentProof;
  try {
    const previous = JSON.parse(await readFile(path.join(runtimeDir, "conversion-guard.json"), "utf8"));
    const previousProof = previous.checks?.browserProof;
    if (previousProof?.ok && previousProof?.status === "provided") {
      return {
        ...previousProof,
        preserved: true,
      };
    }
  } catch {
    // No previous browser proof is fine; remote loops normally run without one.
  }
  return currentProof;
}

function failedCheck(error, startedAt) {
  return {
    ok: false,
    status: 0,
    failures: [error.message],
    elapsedMs: Date.now() - startedAt,
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 conversion guard ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} browser_verified=${payload.browserVerified ? "yes" : "no"} pages=${payload.checks.firstPaint.length} code=${payload.referralCode} inviter="${payload.expectedInviter}" percent=${payload.expectedPercent} dpl=${payload.deploymentIds.join(",") || "-"}`,
    `resolver=${payload.checks.resolver.ok ? "ok" : "fail"} auth=${payload.checks.auth.ok ? "ok" : "fail"} browser_proof=${payload.checks.browserProof.status}`,
    "",
    "first_paint:",
  ];
  for (const check of payload.checks.firstPaint) {
    lines.push(`- ${check.name}: ${check.ok ? "ok" : "fail"} status=${check.status} dpl=${check.dplId || "-"} elapsed_ms=${check.elapsedMs}`);
    if (!check.ok) lines.push(`  failures=${check.failures.join("; ")}`);
  }
  lines.push("", "browser_snapshot:");
  lines.push(`- ${payload.checks.browserProof.ok ? "ok" : "not-ok"} status=${payload.checks.browserProof.status} ${payload.checks.browserProof.path || "-"}`);
  if (payload.checks.browserProof.failures?.length) {
    lines.push(`  failures=${payload.checks.browserProof.failures.join("; ")}`);
  }
  lines.push("", `Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Conversion Guard

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ok" : "fail"}
- Browser verified: ${payload.browserVerified ? "yes" : "no"}
- Referral code: \`${payload.referralCode}\`
- Inviter: ${payload.expectedInviter}
- Referral percent: ${payload.expectedPercent}
- Deployment: ${payload.deploymentIds.join(", ") || "-"}
- Resolver: ${payload.checks.resolver.ok ? "ok" : "fail"}
- Auth redirect: ${payload.checks.auth.ok ? "ok" : "fail"}
- Browser proof: ${payload.checks.browserProof.status}

${payload.rule}

## First Paint

${payload.checks.firstPaint.map((check) => `- ${check.ok ? "ok" : "fail"} ${check.name} HTTP ${check.status} dpl ${check.dplId || "-"}${check.ok ? "" : ` - ${check.failures.join("; ")}`}`).join("\n")}
`;
}

function renderHtml(payload) {
  const cards = payload.checks.firstPaint.map((check) => card(check.name, check.ok, [
    `HTTP ${check.status}`,
    `dpl ${check.dplId || "-"}`,
    `${check.elapsedMs} ms`,
    ...(check.failures ?? []),
  ])).join("");
  const browser = payload.checks.browserProof;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WorldCup26 Conversion Guard</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #061711; color: #f5fff8; }
    main { max-width: 980px; margin: 0 auto; padding: 28px 16px 44px; }
    h1 { margin: 0 0 6px; font-size: 30px; }
    .summary { border: 1px solid #2d6d57; background: #0d2c22; border-radius: 8px; padding: 16px; margin: 18px 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
    .card { border: 1px solid #315d4e; background: #0d231b; border-radius: 8px; padding: 14px; overflow-wrap: anywhere; }
    .ok { border-color: #56d89c; }
    .fail { border-color: #ff8f7d; }
    .status { display: inline-flex; border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 800; background: #164332; color: #9ff0c1; }
    .fail .status { background: #4a211b; color: #ffd5cc; }
    p { color: #cfe2d9; line-height: 1.45; }
    code { color: #ffdc7a; }
  </style>
</head>
<body>
  <main>
    <h1>WorldCup26 Conversion Guard</h1>
    <p>${escapeHtml(payload.generatedAtEest)} · code <code>${payload.referralCode}</code> · ${payload.ok ? "ok" : "fail"}</p>
    <section class="summary">
      <p>${escapeHtml(payload.rule)}</p>
      <p>Browser verified: ${payload.browserVerified ? "yes" : "no"} · Resolver: ${payload.checks.resolver.ok ? "ok" : "fail"} · Auth: ${payload.checks.auth.ok ? "ok" : "fail"}</p>
    </section>
    <section class="grid">${cards}${card("Browser snapshot", browser.ok, [browser.status, browser.path || "-", ...(browser.failures ?? [])])}</section>
  </main>
</body>
</html>
`;
}

function card(title, ok, rows) {
  return `<article class="card ${ok ? "ok" : "fail"}"><div class="status">${ok ? "ok" : "not ok"}</div><h3>${escapeHtml(title)}</h3>${rows.map((row) => `<p>${escapeHtml(row)}</p>`).join("")}</article>`;
}

function parseArgs(rawArgs) {
  const parsed = {
    quiet: false,
    requireBrowserProof: false,
    root: "",
    now: "",
    browserSnapshot: "",
    timeoutMs: 15_000,
  };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--require-browser-proof") parsed.requireBrowserProof = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--browser-snapshot") parsed.browserSnapshot = rawArgs[++index] ?? "";
    else if (arg === "--timeout-ms") parsed.timeoutMs = Number(rawArgs[++index] ?? parsed.timeoutMs);
  }
  return parsed;
}

function stripTags(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

function safeHost(value) {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
