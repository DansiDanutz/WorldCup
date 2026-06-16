#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const SITE_ORIGIN = "https://worldcup26.world";
const REFERRAL_LINK = `${SITE_ORIGIN}/login?ref=${REFERRAL_CODE}`;
const EXPECTED_INVITER = "David Ai";
const EXPECTED_PERCENT = 5;
const DEFAULT_TIMEOUT_MS = 15_000;

const AD_LINKS = [
  adLink("meta-campaign", "meta", "paid_social", "meta_campaign"),
  adLink("facebook-feed", "facebook", "paid_social", "facebook_feed"),
  adLink("instagram-story", "instagram", "story", "instagram_story"),
  adLink("x-campaign", "x", "paid_social", "x_campaign"),
];

const BOT_PROFILES = {
  browser: "WorldCup26-ad-platform-audit/1.0",
  meta: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  x: "Twitterbot/1.0",
  whatsapp: "WhatsApp/2.23.20 A",
};

const PROFILE_BY_LINK = {
  "meta-campaign": ["browser", "meta", "whatsapp"],
  "facebook-feed": ["browser", "meta"],
  "instagram-story": ["browser", "meta"],
  "x-campaign": ["browser", "x"],
};

const REQUIRED_COPY = [
  /Code applied/i,
  /Referral agreement/i,
  /5% of my winnings/i,
  /All 48 teams/i,
  /Account setup is open until June 18, 2026/i,
  /Continue with Google/i,
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
for (const link of AD_LINKS) {
  for (const profile of PROFILE_BY_LINK[link.name] ?? ["browser"]) {
    pageChecks.push(await checkAdLanding(link, profile));
  }
}

const socialImageUrls = [
  ...new Set(
    pageChecks
      .flatMap((check) => [check.metadata.ogImage, check.metadata.twitterImage])
      .filter(Boolean),
  ),
];
const imageChecks = [];
for (const imageUrl of socialImageUrls) {
  imageChecks.push(await checkImage(imageUrl));
}

const resolverCheck = await checkReferralResolver();
const healthCheck = await checkHealth();
const deploymentIds = [...new Set(pageChecks.map((check) => check.dplId).filter(Boolean))];
const payload = {
  schema: "worldcup26-ad-platform-audit-v1",
  generatedAt: now.toISOString(),
  generatedAtEest: formatEestLogTime(now),
  referralCode: REFERRAL_CODE,
  referralLink: REFERRAL_LINK,
  expectedInviter: EXPECTED_INVITER,
  expectedPercent: EXPECTED_PERCENT,
  ok:
    pageChecks.every((check) => check.ok) &&
    imageChecks.every((check) => check.ok) &&
    resolverCheck.ok &&
    healthCheck.ok &&
    deploymentIds.length === 1,
  deploymentIds,
  checks: {
    pages: pageChecks,
    socialImages: imageChecks,
    resolver: resolverCheck,
    health: healthCheck,
  },
  rule: "This proves Meta/X ad URLs, crawler previews, referral resolver, social images, and production health are safe. It does not prove the ads are approved or spending inside Meta/X.",
};

await writeFile(path.join(runtimeDir, "ad-platform-audit.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "ad-platform-audit.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "ad-platform-audit.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "ad-platform-audit.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

function adLink(name, source, medium, content) {
  return {
    name,
    source,
    medium,
    url: `${REFERRAL_LINK}&utm_source=${source}&utm_medium=${medium}&utm_campaign=worldcup26_referral_72h&utm_content=${content}`,
  };
}

async function checkAdLanding(link, profile) {
  const startedAt = Date.now();
  try {
    const response = await fetch(link.url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": BOT_PROFILES[profile] ?? BOT_PROFILES.browser,
      },
      redirect: "follow",
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const html = await response.text();
    const headers = Object.fromEntries(response.headers.entries());
    const metadata = extractMetadata(html);
    const finalHost = safeHost(response.url);
    const failures = [];
    const sourceUrl = new URL(link.url);

    if (!response.ok) failures.push(`http ${response.status}`);
    if (finalHost !== "worldcup26.world") failures.push(`unexpected host ${finalHost || "unknown"}`);
    if (sourceUrl.searchParams.get("ref") !== REFERRAL_CODE) failures.push("ref query missing or wrong");
    if (!sourceUrl.searchParams.get("utm_source")) failures.push("utm_source missing");
    if (!sourceUrl.searchParams.get("utm_medium")) failures.push("utm_medium missing");
    if (sourceUrl.searchParams.get("utm_campaign") !== "worldcup26_referral_72h") {
      failures.push("utm_campaign missing or wrong");
    }
    if (!html.includes(REFERRAL_CODE)) failures.push("referral code missing in landing page");
    for (const pattern of REQUIRED_COPY) {
      if (!pattern.test(html)) failures.push(`missing copy: ${pattern.source}`);
    }
    for (const pattern of BAD_PATTERNS) {
      if (pattern.test(html)) failures.push(`bad copy: ${pattern.source}`);
    }
    if (!metadata.ogTitle || !/WorldCup/i.test(metadata.ogTitle)) failures.push("og:title missing WorldCup");
    if (!metadata.ogDescription) failures.push("og:description missing");
    if (!metadata.ogImage) failures.push("og:image missing");
    if (metadata.ogImage && safeHost(metadata.ogImage) !== "worldcup26.world") {
      failures.push("og:image is not on worldcup26.world");
    }
    if (metadata.ogUrl && safeHost(metadata.ogUrl) !== "worldcup26.world") {
      failures.push("og:url is not on worldcup26.world");
    }
    if (!metadata.twitterCard || metadata.twitterCard !== "summary_large_image") {
      failures.push("twitter card missing summary_large_image");
    }
    if (!metadata.twitterTitle || !/WorldCup/i.test(metadata.twitterTitle)) {
      failures.push("twitter:title missing WorldCup");
    }
    if (!metadata.twitterImage) failures.push("twitter:image missing");
    if (metadata.twitterImage && safeHost(metadata.twitterImage) !== "worldcup26.world") {
      failures.push("twitter:image is not on worldcup26.world");
    }
    const csp = headers["content-security-policy"] ?? "";
    if (csp.includes("lxhjfdxowpxzrybxdasi.supabase.co")) {
      failures.push("CSP exposes Supabase project host");
    }

    return {
      name: link.name,
      profile,
      url: link.url,
      finalUrl: response.url,
      status: response.status,
      ok: failures.length === 0,
      failures,
      dplId: html.match(/data-dpl-id="([^"]+)"/)?.[1] ?? "",
      bytes: html.length,
      metadata,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      name: link.name,
      profile,
      url: link.url,
      finalUrl: "",
      status: 0,
      ok: false,
      failures: [error.message],
      dplId: "",
      bytes: 0,
      metadata: {},
      elapsedMs: Date.now() - startedAt,
    };
  }
}

async function checkImage(imageUrl) {
  const startedAt = Date.now();
  try {
    const response = await fetch(imageUrl, {
      headers: {
        accept: "image/*,*/*;q=0.8",
        "user-agent": BOT_PROFILES.meta,
      },
      redirect: "follow",
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") ?? "";
    const failures = [];
    if (!response.ok) failures.push(`http ${response.status}`);
    if (!contentType.startsWith("image/")) failures.push(`not image content-type ${contentType || "-"}`);
    if (arrayBuffer.byteLength < 10_000) failures.push(`image too small ${arrayBuffer.byteLength}`);
    return {
      url: imageUrl,
      status: response.status,
      contentType,
      bytes: arrayBuffer.byteLength,
      ok: failures.length === 0,
      failures,
      elapsedMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      url: imageUrl,
      status: 0,
      contentType: "",
      bytes: 0,
      ok: false,
      failures: [error.message],
      elapsedMs: Date.now() - startedAt,
    };
  }
}

async function checkReferralResolver() {
  const startedAt = Date.now();
  try {
    const resolverUrl = new URL("/api/referrals/resolve", SITE_ORIGIN);
    resolverUrl.searchParams.set("code", REFERRAL_CODE);
    const response = await fetch(resolverUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "WorldCup26-ad-platform-audit/1.0",
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
    const response = await fetch(new URL("/api/health", SITE_ORIGIN), {
      headers: {
        accept: "application/json",
        "user-agent": "WorldCup26-ad-platform-audit/1.0",
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

function extractMetadata(html) {
  const meta = {};
  for (const tagMatch of String(html ?? "").matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = parseAttrs(tagMatch[0]);
    const key = attrs.property || attrs.name;
    if (!key || attrs.content === undefined) continue;
    meta[key.toLowerCase()] = attrs.content;
  }
  return {
    title: String(html.match(/<title>(.*?)<\/title>/is)?.[1] ?? "").trim(),
    description: meta.description || "",
    ogTitle: meta["og:title"] || "",
    ogDescription: meta["og:description"] || "",
    ogImage: absolutizeUrl(meta["og:image"] || ""),
    ogUrl: absolutizeUrl(meta["og:url"] || ""),
    twitterCard: meta["twitter:card"] || "",
    twitterTitle: meta["twitter:title"] || "",
    twitterImage: absolutizeUrl(meta["twitter:image"] || ""),
  };
}

function parseAttrs(tag) {
  const attrs = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    attrs[match[1].toLowerCase()] = decodeHtml(match[3] ?? match[4] ?? match[5] ?? "");
  }
  return attrs;
}

function absolutizeUrl(value) {
  if (!value) return "";
  try {
    return new URL(value, SITE_ORIGIN).toString();
  } catch {
    return "";
  }
}

function decodeHtml(value) {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function renderText(payload) {
  const lines = [
    `WorldCup26 ad platform audit ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} pages=${payload.checks.pages.length} social_images=${payload.checks.socialImages.length} code=${payload.referralCode} inviter="${payload.expectedInviter}" percent=${payload.expectedPercent} dpl=${payload.deploymentIds.join(",") || "-"}`,
    `resolver=${payload.checks.resolver.ok ? "ok" : "fail"} health=${payload.checks.health.ok ? "ok" : "fail"}`,
    "",
    "ad_clicks_and_previews:",
  ];
  for (const check of payload.checks.pages) {
    lines.push(`- ${check.name}/${check.profile}: ${check.ok ? "ok" : "fail"} status=${check.status} dpl=${check.dplId || "-"} og=${check.metadata.ogImage ? "yes" : "no"} twitter=${check.metadata.twitterImage ? "yes" : "no"} elapsed_ms=${check.elapsedMs}`);
    if (!check.ok) lines.push(`  failures=${check.failures.join("; ")}`);
  }
  lines.push("", "social_images:");
  for (const check of payload.checks.socialImages) {
    lines.push(`- ${check.ok ? "ok" : "fail"} ${check.status} bytes=${check.bytes} ${check.url}`);
    if (!check.ok) lines.push(`  failures=${check.failures.join("; ")}`);
  }
  lines.push("", `Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Ad Platform Audit

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ok" : "fail"}
- Referral code: \`${payload.referralCode}\`
- Inviter: ${payload.expectedInviter}
- Referral percent: ${payload.expectedPercent}
- Deployment: ${payload.deploymentIds.join(", ") || "-"}
- Resolver: ${payload.checks.resolver.ok ? "ok" : "fail"}
- Health: ${payload.checks.health.ok ? "ok" : "fail"}

${payload.rule}

## Ad Clicks And Previews

${payload.checks.pages.map(renderPageMarkdown).join("\n\n")}

## Social Images

${payload.checks.socialImages.map((check) => `- ${check.ok ? "ok" : "fail"} ${check.status} ${check.bytes} bytes - ${check.url}${check.ok ? "" : ` - ${check.failures.join("; ")}`}`).join("\n")}
`;
}

function renderPageMarkdown(check) {
  return `### ${check.name} / ${check.profile}

- Status: ${check.ok ? "ok" : "fail"}
- HTTP: ${check.status}
- Deployment: ${check.dplId || "-"}
- Elapsed: ${check.elapsedMs} ms
- OG image: ${check.metadata.ogImage || "-"}
- Twitter image: ${check.metadata.twitterImage || "-"}
- URL: ${check.url}
${check.ok ? "" : `- Failures: ${check.failures.join("; ")}`}`;
}

function renderHtml(payload) {
  const cards = payload.checks.pages.map((check) => card(`${check.name} / ${check.profile}`, check.ok, [
    `HTTP ${check.status}`,
    `dpl ${check.dplId || "-"}`,
    check.metadata.ogImage ? "og:image ready" : "og:image missing",
    check.metadata.twitterImage ? "twitter:image ready" : "twitter:image missing",
    ...(check.failures ?? []),
  ])).join("");
  const imageCards = payload.checks.socialImages.map((check) => card("Social image", check.ok, [
    `HTTP ${check.status}`,
    `${check.bytes} bytes`,
    check.url,
    ...(check.failures ?? []),
  ])).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WorldCup26 Ad Platform Audit</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #061711; color: #f5fff8; }
    main { max-width: 1040px; margin: 0 auto; padding: 28px 16px 44px; }
    h1 { margin: 0 0 6px; font-size: 30px; }
    .summary { border: 1px solid #2d6d57; background: linear-gradient(135deg, #0d3b2b, #10241d); border-radius: 8px; padding: 16px; margin: 18px 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
    .card { border: 1px solid #315d4e; background: #0d231b; border-radius: 8px; padding: 14px; min-height: 122px; overflow-wrap: anywhere; }
    .ok { border-color: #56d89c; }
    .fail { border-color: #ff8f7d; }
    .status { display: inline-flex; border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 800; background: #164332; color: #9ff0c1; }
    .fail .status { background: #4a211b; color: #ffd5cc; }
    p, li { color: #cfe2d9; line-height: 1.45; }
    code { color: #ffdc7a; }
  </style>
</head>
<body>
  <main>
    <h1>WorldCup26 Ad Platform Audit</h1>
    <p>${escapeHtml(payload.generatedAtEest)} · code <code>${payload.referralCode}</code> · ${payload.ok ? "ok" : "fail"}</p>
    <section class="summary">
      <p>${escapeHtml(payload.rule)}</p>
      <p>Resolver: ${payload.checks.resolver.ok ? "ok" : "fail"} · Health: ${payload.checks.health.ok ? "ok" : "fail"} · Deployment: ${escapeHtml(payload.deploymentIds.join(", ") || "-")}</p>
    </section>
    <h2>Ad Clicks And Previews</h2>
    <section class="grid">${cards}</section>
    <h2>Social Images</h2>
    <section class="grid">${imageCards}</section>
  </main>
</body>
</html>
`;
}

function card(title, ok, rows) {
  return `<article class="card ${ok ? "ok" : "fail"}"><div class="status">${ok ? "ok" : "fail"}</div><h3>${escapeHtml(title)}</h3>${rows.map((row) => `<p>${escapeHtml(row)}</p>`).join("")}</article>`;
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

function safeHost(value) {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
