#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const DEFAULT_VARIANTS = [
  { name: "base", url: REFERRAL_LINK },
  {
    name: "meta-paid",
    url: `${REFERRAL_LINK}&utm_source=meta&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h`,
  },
  {
    name: "x-paid",
    url: `${REFERRAL_LINK}&utm_source=x&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h`,
  },
  {
    name: "story",
    url: `${REFERRAL_LINK}&utm_source=instagram-facebook-story&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h`,
  },
];
const BAD_PATTERNS = [
  /USDT deposits are paused/i,
  /Wallet paid actions paused/i,
  /launch approvals/i,
  /country policy/i,
  /3% of my winnings/i,
  /lxhjfdxowpxzrybxdasi\.supabase\.co/i,
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const generatedAt = args.now ? new Date(args.now) : new Date();
const variants = args.url.length
  ? args.url.map((url, index) => ({ name: `custom-${index + 1}`, url }))
  : DEFAULT_VARIANTS;

await mkdir(runtimeDir, { recursive: true });

const checks = [];
for (const variant of variants) {
  checks.push(await checkVariant(variant));
}

const payload = {
  generatedAt: generatedAt.toISOString(),
  generatedAtEest: formatEestLogTime(generatedAt),
  referralCode: REFERRAL_CODE,
  ok: checks.every((check) => check.ok),
  checks,
};

await writeFile(path.join(runtimeDir, "link-sentinel.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "link-sentinel.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "link-sentinel.txt"), renderText(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

async function checkVariant(variant) {
  const startedAt = Date.now();
  try {
    const response = await fetch(variant.url, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "WorldCup26-campaign-link-sentinel/1.0",
      },
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const body = await response.text();
    const failures = [];
    if (!response.ok) failures.push(`http ${response.status}`);
    if (!body.includes(REFERRAL_CODE)) failures.push("referral code missing");
    if (!/Code applied/i.test(body)) failures.push("code-applied copy missing");
    if (!/5% of my winnings/i.test(body)) failures.push("5 percent referral copy missing");
    if (!/Referral agreement/i.test(body)) failures.push("referral agreement card missing");
    if (!/Checking referral code/i.test(body)) failures.push("initial referral check copy missing");
    if (!/Continue with Google/i.test(body)) failures.push("google CTA missing");
    if (!/auth-google-button" disabled=""/i.test(body)) {
      failures.push("google CTA should be disabled on first paint");
    }
    const resolver = await checkReferralResolver(variant.url);
    if (!resolver.ok) failures.push(...resolver.failures);
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
      referralResolver: resolver,
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

async function checkReferralResolver(sourceUrl) {
  const resolverUrl = new URL("/api/referrals/resolve", sourceUrl);
  resolverUrl.searchParams.set("code", REFERRAL_CODE);
  try {
    const response = await fetch(resolverUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "WorldCup26-campaign-link-sentinel/1.0",
      },
      signal: AbortSignal.timeout(args.timeoutMs),
    });
    const result = await response.json();
    const failures = [];
    if (!response.ok) failures.push(`resolver http ${response.status}`);
    if (!result.valid) failures.push("resolver code invalid");
    if (result.referralCode !== REFERRAL_CODE) failures.push("resolver code mismatch");
    if (!result.inviterName) failures.push("resolver inviter missing");
    if (Number(result.referralPercent ?? 0) !== 5) failures.push("resolver referral percent is not 5");
    return {
      ok: failures.length === 0,
      status: response.status,
      valid: Boolean(result.valid),
      inviterName: result.inviterName ? String(result.inviterName) : "",
      referralPercent: Number(result.referralPercent ?? 0),
      failures,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      valid: false,
      inviterName: "",
      referralPercent: 0,
      failures: [`resolver ${error.message}`],
    };
  }
}

function renderText(payload) {
  const lines = [
    `WorldCup26 link sentinel ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} variants=${payload.checks.length} code=${payload.referralCode}`,
    "",
  ];
  for (const check of payload.checks) {
    const resolver = check.referralResolver?.ok
      ? `resolver=ok inviter=${check.referralResolver.inviterName || "-"} api_percent=${check.referralResolver.referralPercent || "-"}`
      : "resolver=fail";
    lines.push(`${check.name}: ${check.ok ? "ok" : "fail"} status=${check.status} dpl=${check.dplId || "-"} ${resolver} elapsed_ms=${check.elapsedMs}`);
    if (!check.ok) lines.push(`  failures=${check.failures.join("; ")}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Link Sentinel

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ok" : "fail"}
- Referral code: \`${payload.referralCode}\`
- Variants checked: ${payload.checks.length}

${payload.checks.map(renderCheckMarkdown).join("\n\n")}
`;
}

function renderCheckMarkdown(check) {
  return `## ${check.name}

- Status: ${check.ok ? "ok" : "fail"}
- HTTP: ${check.status}
- Deployment: ${check.dplId || "-"}
- Resolver: ${check.referralResolver?.ok ? `ok (${check.referralResolver.inviterName || "inviter"})` : "fail"}
- Elapsed: ${check.elapsedMs} ms
- URL: ${check.url}
${check.ok ? "" : `- Failures: ${check.failures.join("; ")}`}`;
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "", timeoutMs: 15_000, url: [] };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--timeout-ms") parsed.timeoutMs = Number(rawArgs[++index] ?? parsed.timeoutMs);
    else if (arg === "--url") parsed.url.push(rawArgs[++index] ?? "");
  }
  parsed.url = parsed.url.map((url) => String(url).trim()).filter(Boolean);
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
