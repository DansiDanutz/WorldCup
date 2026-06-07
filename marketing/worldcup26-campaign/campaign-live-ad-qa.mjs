#!/usr/bin/env node
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const EXPECTED_INVITER = "David Ai";
const EXPECTED_PERCENT = 5;
const AUTH_DOMAIN = "https://api.worldcup26.world";
const SITE_ORIGIN = "https://worldcup26.world";
const AUTH_CODE_CHALLENGE = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~abc";

const PAGE_VARIANTS = [
  variant("meta-campaign", "meta", "paid_social"),
  variant("facebook-feed", "facebook", "paid_social"),
  variant("instagram-story", "instagram", "story"),
  variant("x-campaign", "x", "paid_social"),
  variant("tiktok-video", "tiktok", "video"),
  variant("youtube-shorts", "youtube", "shorts"),
  variant("whatsapp-status", "whatsapp", "status"),
];

const REQUIRED_TEXT = [
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
  /placeholder="Age"/i,
  /I confirm I am at least 18 years old/i,
  /lxhjfdxowpxzrybxdasi\.supabase\.co/i,
  /Sign in\s+to continue to\s+lxhjfdxowpxzrybxdasi\.supabase\.co/i,
  /â[A-Za-z0-9™œ†€]+/i,
];

const REQUIRED_LOCAL_ASSETS = [
  { path: "media/worldcup26-main-video.mp4", minBytes: 100_000 },
  { path: "media/worldcup26-referral-story.jpg", minBytes: 10_000 },
  { path: "media/worldcup26-referral-square.jpg", minBytes: 10_000 },
  { path: "media/worldcup26-qr-story.jpg", minBytes: 5_000 },
  { path: "media/worldcup26-referral-qr.png", minBytes: 1_000 },
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const pageChecks = [];
for (const pageVariant of PAGE_VARIANTS) {
  pageChecks.push(await checkLandingPage(pageVariant));
}

const firstGoodPage = pageChecks.find((check) => check.html);
const assetChecks = firstGoodPage ? await checkRenderedAssets(firstGoodPage) : [];
const resolverCheck = await checkReferralResolver();
const healthCheck = await checkHealth();
const authCheck = await checkAuthDomain();
const socialChecks = await checkSocialMetadata();
const localAssetChecks = await checkLocalAssets();
const deploymentIds = [...new Set(pageChecks.map((check) => check.dplId).filter(Boolean))];

const payload = {
  schema: "worldcup26-live-ad-qa-v1",
  generatedAt: now.toISOString(),
  generatedAtEest: formatEestLogTime(now),
  referralCode: REFERRAL_CODE,
  referralLink: REFERRAL_LINK,
  expectedInviter: EXPECTED_INVITER,
  expectedPercent: EXPECTED_PERCENT,
  ok:
    pageChecks.every((check) => check.ok) &&
    assetChecks.every((check) => check.ok) &&
    resolverCheck.ok &&
    healthCheck.ok &&
    authCheck.ok &&
    socialChecks.every((check) => check.ok) &&
    localAssetChecks.every((check) => check.ok) &&
    deploymentIds.length === 1,
  deploymentIds,
  checks: {
    pages: pageChecks.map(({ html, ...check }) => check),
    renderedAssets: assetChecks,
    resolver: resolverCheck,
    health: healthCheck,
    auth: authCheck,
    social: socialChecks,
    localAssets: localAssetChecks,
  },
  rule: "This proves ad clicks can land, render, resolve the inviter, and start Google auth from the custom domain. It does not prove ads or social posts are live.",
};

await writeFile(path.join(runtimeDir, "live-ad-qa.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "live-ad-qa.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "live-ad-qa.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "live-ad-qa.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

function variant(name, source, medium) {
  return {
    name,
    url: `${REFERRAL_LINK}&utm_source=${source}&utm_medium=${medium}&utm_campaign=worldcup26_referral_72h&utm_content=live_ad_qa`,
  };
}

async function checkLandingPage(pageVariant) {
  const startedAt = Date.now();
  try {
    const { response, text } = await fetchText(pageVariant.url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "WorldCup26-live-ad-qa/1.0",
      },
      redirect: "follow",
    });
    const failures = [];
    const finalUrl = response.url;
    const finalHost = safeHost(finalUrl);
    const headers = Object.fromEntries(response.headers.entries());

    if (!response.ok) failures.push(`http ${response.status}`);
    if (finalHost !== "worldcup26.world") failures.push(`unexpected host ${finalHost || "unknown"}`);
    if (!text.includes(REFERRAL_CODE)) failures.push("referral code missing");
    for (const pattern of REQUIRED_TEXT) {
      if (!pattern.test(text)) failures.push(`missing text: ${pattern.source}`);
    }
    if (!/auth-google-button" disabled=""/i.test(text)) {
      failures.push("google CTA should be disabled before agreement on first paint");
    }
    if (/Need help\?[^<]*\+?\d{6,}/i.test(stripTags(text))) {
      failures.push("visible help phone number leaked into page text");
    }
    for (const pattern of BAD_PATTERNS) {
      if (pattern.test(text)) failures.push(`bad copy: ${pattern.source}`);
    }

    const csp = headers["content-security-policy"] ?? "";
    if (!csp.includes(AUTH_DOMAIN)) failures.push("CSP missing custom auth domain");
    if (csp.includes("lxhjfdxowpxzrybxdasi.supabase.co")) failures.push("CSP exposes Supabase project host");

    const dplId = text.match(/data-dpl-id="([^"]+)"/)?.[1] ?? "";
    return {
      name: pageVariant.name,
      url: pageVariant.url,
      finalUrl,
      status: response.status,
      ok: failures.length === 0,
      failures,
      dplId,
      bytes: text.length,
      elapsedMs: Date.now() - startedAt,
      html: text,
    };
  } catch (error) {
    return {
      name: pageVariant.name,
      url: pageVariant.url,
      finalUrl: "",
      status: 0,
      ok: false,
      failures: [error.message],
      dplId: "",
      bytes: 0,
      elapsedMs: Date.now() - startedAt,
      html: "",
    };
  }
}

async function checkRenderedAssets(pageCheck) {
  const assets = extractRenderAssets(pageCheck.html, pageCheck.finalUrl).slice(0, args.maxAssets);
  const checks = [];
  for (const assetUrl of assets) {
    const startedAt = Date.now();
    try {
      const response = await fetch(assetUrl, {
        headers: { "user-agent": "WorldCup26-live-ad-qa/1.0" },
        signal: AbortSignal.timeout(args.timeoutMs),
      });
      const arrayBuffer = await response.arrayBuffer();
      const failures = [];
      if (!response.ok) failures.push(`http ${response.status}`);
      if (arrayBuffer.byteLength === 0) failures.push("empty asset");
      checks.push({
        url: assetUrl,
        status: response.status,
        ok: failures.length === 0,
        failures,
        bytes: arrayBuffer.byteLength,
        elapsedMs: Date.now() - startedAt,
      });
    } catch (error) {
      checks.push({
        url: assetUrl,
        status: 0,
        ok: false,
        failures: [error.message],
        bytes: 0,
        elapsedMs: Date.now() - startedAt,
      });
    }
  }
  return checks;
}

async function checkReferralResolver() {
  const startedAt = Date.now();
  try {
    const resolverUrl = new URL("/api/referrals/resolve", SITE_ORIGIN);
    resolverUrl.searchParams.set("code", REFERRAL_CODE);
    const { response, data } = await fetchJson(resolverUrl);
    const failures = [];
    if (!response.ok) failures.push(`http ${response.status}`);
    if (!data.valid) failures.push("referral code invalid");
    if (String(data.referralCode ?? "") !== REFERRAL_CODE) failures.push("referral code mismatch");
    if (String(data.inviterName ?? "") !== EXPECTED_INVITER) failures.push("inviter mismatch");
    if (Number(data.referralPercent ?? 0) !== EXPECTED_PERCENT) failures.push("referral percent mismatch");
    return {
      ok: failures.length === 0,
      status: response.status,
      valid: Boolean(data.valid),
      referralCode: String(data.referralCode ?? ""),
      inviterName: String(data.inviterName ?? ""),
      referralPercent: Number(data.referralPercent ?? 0),
      failures,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    return failedCheck(error, startedAt);
  }
}

async function checkHealth() {
  const startedAt = Date.now();
  try {
    const { response, data } = await fetchJson(new URL("/api/health", SITE_ORIGIN));
    const failures = [];
    if (!response.ok) failures.push(`http ${response.status}`);
    if (!data.ok) failures.push("health not ok");
    if (data.database !== "available") failures.push("database not available");
    if (data.tournament?.status !== "open") failures.push("tournament not open");
    return {
      ok: failures.length === 0,
      status: response.status,
      service: String(data.service ?? ""),
      database: String(data.database ?? ""),
      tournamentStatus: String(data.tournament?.status ?? ""),
      failures,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    return failedCheck(error, startedAt);
  }
}

async function checkAuthDomain() {
  const startedAt = Date.now();
  try {
    const authUrl = new URL("/auth/v1/authorize", AUTH_DOMAIN);
    authUrl.searchParams.set("provider", "google");
    authUrl.searchParams.set("redirect_to", SITE_ORIGIN);
    authUrl.searchParams.set("code_challenge", AUTH_CODE_CHALLENGE);
    authUrl.searchParams.set("code_challenge_method", "s256");
    const response = await fetch(authUrl, {
      headers: { "user-agent": "WorldCup26-live-ad-qa/1.0" },
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
    if (location.includes("lxhjfdxowpxzrybxdasi.supabase.co")) failures.push("Supabase project host leaked in auth redirect");
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

async function checkSocialMetadata() {
  const paths = ["/", `/login?ref=${REFERRAL_CODE}`];
  const checks = [];
  for (const routePath of paths) {
    const startedAt = Date.now();
    try {
      const url = new URL(routePath, SITE_ORIGIN);
      const { response, text } = await fetchText(url, {
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": "WorldCup26-live-ad-qa/1.0",
        },
      });
      const failures = [];
      if (!response.ok) failures.push(`http ${response.status}`);
      if (!/<meta[^>]+property="og:title"[^>]+content="[^"]*WorldCup/i.test(text)) {
        failures.push("og:title missing WorldCup");
      }
      if (!/<meta[^>]+property="og:image"[^>]+content="https:\/\/worldcup26\.world/i.test(text)) {
        failures.push("og:image not on canonical domain");
      }
      if (!/<meta[^>]+name="twitter:card"[^>]+content="summary_large_image"/i.test(text)) {
        failures.push("twitter summary_large_image missing");
      }
      if (text.includes("lxhjfdxowpxzrybxdasi.supabase.co")) failures.push("Supabase project host leaked in metadata");
      checks.push({
        path: routePath,
        status: response.status,
        ok: failures.length === 0,
        failures,
        elapsedMs: Date.now() - startedAt,
      });
    } catch (error) {
      checks.push({ path: routePath, ...failedCheck(error, startedAt) });
    }
  }
  return checks;
}

async function checkLocalAssets() {
  const checks = [];
  for (const asset of REQUIRED_LOCAL_ASSETS) {
    try {
      const info = await stat(path.join(campaignDir, asset.path));
      const failures = [];
      if (!info.isFile()) failures.push("not a file");
      if (info.size < asset.minBytes) failures.push(`too small: ${info.size}`);
      checks.push({
        path: asset.path,
        ok: failures.length === 0,
        failures,
        bytes: info.size,
      });
    } catch (error) {
      checks.push({
        path: asset.path,
        ok: false,
        failures: [error.message],
        bytes: 0,
      });
    }
  }
  return checks;
}

async function fetchText(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(args.timeoutMs),
  });
  const text = await response.text();
  return { response, text };
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/json",
      "user-agent": "WorldCup26-live-ad-qa/1.0",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(args.timeoutMs),
  });
  const text = await response.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { response, data, text };
}

function extractRenderAssets(html, baseUrl) {
  const urls = new Set();
  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)) {
    urls.add(new URL(match[1], baseUrl).toString());
  }
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\brel="[^"]*(stylesheet|preload|modulepreload)[^"]*"/i.test(tag)) continue;
    const href = tag.match(/\bhref="([^"]+)"/i)?.[1];
    if (href) urls.add(new URL(href, baseUrl).toString());
  }
  return [...urls].filter((url) => safeHost(url) === "worldcup26.world");
}

function failedCheck(error, startedAt) {
  return {
    ok: false,
    status: 0,
    failures: [error.message],
    elapsedMs: Date.now() - startedAt,
  };
}

function safeHost(value) {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}

function stripTags(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

function renderText(payload) {
  const lines = [
    `WorldCup26 live ad QA ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} pages=${payload.checks.pages.length} assets=${payload.checks.renderedAssets.length} code=${payload.referralCode} inviter="${payload.expectedInviter}" percent=${payload.expectedPercent} dpl=${payload.deploymentIds.join(",") || "-"}`,
    `resolver=${payload.checks.resolver.ok ? "ok" : "fail"} health=${payload.checks.health.ok ? "ok" : "fail"} auth=${payload.checks.auth.ok ? "ok" : "fail"} social=${countOk(payload.checks.social)} local_assets=${countOk(payload.checks.localAssets)}`,
    "",
    "landing_pages:",
  ];
  for (const check of payload.checks.pages) {
    lines.push(`- ${check.name}: ${check.ok ? "ok" : "fail"} status=${check.status} dpl=${check.dplId || "-"} elapsed_ms=${check.elapsedMs}`);
    if (!check.ok) lines.push(`  failures=${check.failures.join("; ")}`);
  }
  lines.push("", "rendered_assets:");
  for (const check of payload.checks.renderedAssets.slice(0, 12)) {
    lines.push(`- ${check.ok ? "ok" : "fail"} ${check.status} ${check.url}`);
    if (!check.ok) lines.push(`  failures=${check.failures.join("; ")}`);
  }
  lines.push("", "local_assets:");
  for (const check of payload.checks.localAssets) {
    lines.push(`- ${check.ok ? "ok" : "fail"} ${check.path} bytes=${check.bytes}`);
    if (!check.ok) lines.push(`  failures=${check.failures.join("; ")}`);
  }
  if (!payload.checks.auth.ok) lines.push(`auth_failures=${payload.checks.auth.failures.join("; ")}`);
  lines.push("", `Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Live Ad QA

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ok" : "fail"}
- Referral code: \`${payload.referralCode}\`
- Inviter: ${payload.expectedInviter}
- Referral percent: ${payload.expectedPercent}
- Deployment: ${payload.deploymentIds.join(", ") || "-"}
- Resolver: ${payload.checks.resolver.ok ? "ok" : "fail"}
- Health: ${payload.checks.health.ok ? "ok" : "fail"}
- Custom auth domain: ${payload.checks.auth.ok ? "ok" : "fail"}
- Social metadata: ${countOk(payload.checks.social)}
- Local campaign assets: ${countOk(payload.checks.localAssets)}

${payload.rule}

## Landing Pages

${payload.checks.pages.map(renderPageMarkdown).join("\n\n")}

## Local Assets

${payload.checks.localAssets.map((check) => `- ${check.ok ? "ok" : "fail"} \`${check.path}\` (${check.bytes} bytes)${check.ok ? "" : ` - ${check.failures.join("; ")}`}`).join("\n")}
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
  const pageCards = payload.checks.pages.map((check) => statusCard(check.name, check.ok, [
    `HTTP ${check.status}`,
    `dpl ${check.dplId || "-"}`,
    `${check.elapsedMs} ms`,
    ...(check.failures ?? []),
  ])).join("");
  const miscCards = [
    statusCard("Resolver", payload.checks.resolver.ok, [
      payload.checks.resolver.inviterName || "-",
      `${payload.checks.resolver.referralPercent || 0}%`,
      ...(payload.checks.resolver.failures ?? []),
    ]),
    statusCard("Health", payload.checks.health.ok, [
      payload.checks.health.database || "-",
      payload.checks.health.tournamentStatus || "-",
      ...(payload.checks.health.failures ?? []),
    ]),
    statusCard("Custom Auth", payload.checks.auth.ok, [
      `HTTP ${payload.checks.auth.status}`,
      ...(payload.checks.auth.failures ?? []),
    ]),
    statusCard("Social Metadata", payload.checks.social.every((check) => check.ok), [
      countOk(payload.checks.social),
      ...payload.checks.social.flatMap((check) => check.failures ?? []),
    ]),
    statusCard("Local Assets", payload.checks.localAssets.every((check) => check.ok), [
      countOk(payload.checks.localAssets),
      ...payload.checks.localAssets.flatMap((check) => check.failures ?? []),
    ]),
  ].join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Live Ad QA</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2a20; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --danger: #ff9f9f; --green: #0b7a59; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 92% 4%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1120px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 8px; background: rgba(11,42,32,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 9vw, 68px); line-height: .9; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 21px; }
    p { margin: 0 0 8px; color: var(--muted); line-height: 1.4; }
    .status { display: inline-flex; padding: 7px 10px; border-radius: 999px; background: var(--mint); color: #03140f; font-weight: 950; text-transform: uppercase; }
    .status.fail { background: var(--danger); }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .meta { color: var(--gold); font-weight: 900; overflow-wrap: anywhere; }
    ul { margin: 8px 0 0; padding-left: 18px; color: var(--muted); }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Live Ad QA</h1>
      <span class="status ${payload.ok ? "" : "fail"}">${payload.ok ? "ok" : "fail"}</span>
      <p class="meta">${escapeHtml(payload.referralLink)}</p>
      <p>${escapeHtml(payload.rule)}</p>
    </header>
    <section class="grid">${pageCards}${miscCards}</section>
  </main>
</body>
</html>`;
}

function statusCard(title, ok, rows) {
  return `<article>
    <h2>${escapeHtml(title)}</h2>
    <span class="status ${ok ? "" : "fail"}">${ok ? "ok" : "fail"}</span>
    <ul>${rows.filter(Boolean).map((row) => `<li>${escapeHtml(row)}</li>`).join("")}</ul>
  </article>`;
}

function countOk(rows) {
  const ok = rows.filter((row) => row.ok).length;
  return `${ok}/${rows.length}`;
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "", timeoutMs: 15_000, maxAssets: 24 };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--timeout-ms") parsed.timeoutMs = Number(rawArgs[++index] ?? parsed.timeoutMs);
    else if (arg === "--max-assets") parsed.maxAssets = Number(rawArgs[++index] ?? parsed.maxAssets);
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
