#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const HEADER = [
  "timestamp_eest",
  "owner",
  "platform",
  "channel",
  "status",
  "attempt_url",
  "detail",
  "next_action",
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const attemptsPath = path.join(runtimeDir, "public-channel-attempts.csv");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.add) {
  await appendAttempt();
}

const attempts = await readAttempts();
const socialRescue = await readJson(path.join(runtimeDir, "social-rescue-pack.json"), {});
const payload = buildPayload({ attempts, socialRescue });

await writeFile(path.join(runtimeDir, "public-channel-attempts.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "public-channel-attempts.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "public-channel-attempts.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "public-channel-attempts.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ attempts, socialRescue }) {
  const normalized = attempts.map(normalizeAttempt).filter((row) => row.timestampEest);
  const latestAttempts = latestBy(normalized, (row) => `${row.platform}:${row.channel}`);
  const socialActions = Array.isArray(socialRescue.actions)
    ? socialRescue.actions.slice(0, 6).map(normalizeSocialAction)
    : [];
  const loginRequired = normalized.filter((row) => row.status === "login_required");
  const approvalRequired = normalized.filter((row) => row.status === "approval_required");
  const posted = normalized.filter((row) => ["posted", "sent", "published", "requested"].includes(row.status));
  const blocked = normalized.filter((row) => ["login_required", "blocked", "approval_required"].includes(row.status));
  const failures = [
    normalized.some((row) => row.hasWrongCode) ? "One or more attempts did not include the expected referral code." : "",
    normalized.some((row) => row.hasWrongLink) ? "One or more attempts did not include the expected referral link/domain." : "",
    socialActions.length === 0 ? "No social rescue actions are available." : "",
  ].filter(Boolean);

  return {
    schema: "worldcup26-public-channel-attempts-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: failures.length === 0,
    failures,
    counts: {
      attempts: normalized.length,
      latestTargets: latestAttempts.length,
      posted: posted.length,
      blocked: blocked.length,
      loginRequired: loginRequired.length,
      approvalRequired: approvalRequired.length,
      socialActions: socialActions.length,
    },
    latestAttempts,
    socialActions,
    firstBlocked: blocked[0] ?? null,
    firstAction: socialActions[0] ?? null,
    rule:
      "This tracks channel access attempts only. It is not proof of external posting unless a public URL or specific private-channel proof is logged separately.",
  };
}

async function appendAttempt() {
  const row = {
    timestamp_eest: args.timestampEest || formatEestLogTime(now),
    owner: requiredArg("owner"),
    platform: requiredArg("platform"),
    channel: requiredArg("channel"),
    status: normalizeStatus(requiredArg("status")),
    attempt_url: args.attemptUrl || "",
    detail: requiredArg("detail"),
    next_action: args.nextAction || "",
  };
  const existing = await readCsv(attemptsPath).catch(() => []);
  await writeFile(attemptsPath, renderCsv([...existing, row]));
}

function normalizeAttempt(row) {
  const blob = [
    row.attempt_url,
    row.detail,
    row.next_action,
  ].join(" ");
  const includesLink = blob.includes("worldcup26.world/login") || blob.includes(REFERRAL_LINK);
  return {
    timestampEest: String(row.timestamp_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    platform: String(row.platform ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    status: normalizeStatus(row.status),
    attemptUrl: String(row.attempt_url ?? "").trim(),
    detail: String(row.detail ?? "").trim(),
    nextAction: String(row.next_action ?? "").trim(),
    includesCode: blob.includes(REFERRAL_CODE),
    includesLink,
    hasWrongCode: blob.includes("WorldCup26") && !blob.includes(REFERRAL_CODE),
    hasWrongLink: blob.includes("WorldCup26") && !blob.includes("worldcup26.world"),
  };
}

function normalizeSocialAction(row) {
  const shareLinks = Array.isArray(row.shareLinks) ? row.shareLinks : [];
  return {
    priority: String(row.priority ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    action: String(row.action ?? "").trim(),
    asset: String(row.asset ?? "").trim(),
    ageLabel: String(row.ageLabel ?? "").trim(),
    trackedLink: String(row.trackedLink ?? "").trim(),
    shareLinks: shareLinks.map((link) => ({
      key: String(link.key ?? "").trim(),
      label: String(link.label ?? "").trim(),
      url: String(link.url ?? "").trim(),
    })),
    proofCommand: String(row.proofCommand ?? "").trim(),
  };
}

function latestBy(rows, keyFor) {
  const byKey = new Map();
  for (const row of rows) {
    const key = keyFor(row);
    byKey.set(key, row);
  }
  return [...byKey.values()];
}

function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

function renderText(payload) {
  const lines = [
    `WorldCup26 public channel attempts ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} attempts=${payload.counts.attempts} posted=${payload.counts.posted} blocked=${payload.counts.blocked} login_required=${payload.counts.loginRequired} approval_required=${payload.counts.approvalRequired}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    "",
    "latest_attempts:",
  ];
  for (const row of payload.latestAttempts) {
    lines.push(`- ${row.status} ${row.owner} / ${row.platform} / ${row.channel}`);
    lines.push(`  detail=${row.detail}`);
    if (row.nextAction) lines.push(`  next=${row.nextAction}`);
  }
  lines.push("", "next_social_actions:");
  for (const action of payload.socialActions.slice(0, 4)) {
    lines.push(`- #${action.priority} ${action.owner} / ${action.channel} age=${action.ageLabel}`);
    lines.push(`  asset=${action.asset}`);
    lines.push(`  link=${action.trackedLink}`);
  }
  lines.push("", `Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Public Channel Attempts

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ok" : "not ok"}
- Attempts: ${payload.counts.attempts}
- Posted/requested/sent: ${payload.counts.posted}
- Blocked: ${payload.counts.blocked}
- Login required: ${payload.counts.loginRequired}
- Approval required: ${payload.counts.approvalRequired}

${payload.rule}

## Latest Attempts

${payload.latestAttempts.map(renderAttemptMarkdown).join("\n\n") || "No public channel attempts logged yet."}

## Next Social Actions

${payload.socialActions.slice(0, 6).map(renderSocialMarkdown).join("\n\n") || "No social actions available."}
`;
}

function renderAttemptMarkdown(row) {
  return `### ${row.status} - ${row.owner} / ${row.platform} / ${row.channel}

- Time: ${row.timestampEest}
- URL: ${row.attemptUrl || "-"}
- Detail: ${row.detail}
- Next: ${row.nextAction || "-"}`;
}

function renderSocialMarkdown(action) {
  return `### #${action.priority} ${action.owner} / ${action.channel}

- Age: ${action.ageLabel || "-"}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}
- Shares: ${action.shareLinks.map((link) => link.label).join(", ") || "-"}`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Public Channel Attempts</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2a20; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 12% 0%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,42,32,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 8vw, 64px); line-height: .92; }
    h2 { margin: 0 0 8px; font-size: 20px; }
    p { color: var(--muted); line-height: 1.4; margin: 0 0 8px; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; text-transform: uppercase; font-weight: 900; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    a { color: var(--gold); overflow-wrap: anywhere; }
    .status { color: #03140f; display: inline-flex; padding: 6px 9px; border-radius: 999px; background: var(--mint); font-weight: 950; text-transform: uppercase; }
    .status.login_required, .status.blocked, .status.approval_required { background: var(--danger); }
    @media (max-width: 760px) { .stats, .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Public Channel Attempts</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="stats">
        <div class="stat"><span>Attempts</span><strong>${payload.counts.attempts}</strong></div>
        <div class="stat"><span>Blocked</span><strong>${payload.counts.blocked}</strong></div>
        <div class="stat"><span>Login</span><strong>${payload.counts.loginRequired}</strong></div>
        <div class="stat"><span>Approval</span><strong>${payload.counts.approvalRequired}</strong></div>
      </div>
    </header>
    <section class="grid">
      ${payload.latestAttempts.map(renderAttemptCard).join("") || "<article><h2>No attempts yet</h2><p>No public channel attempts logged.</p></article>"}
    </section>
  </main>
</body>
</html>`;
}

function renderAttemptCard(row) {
  return `<article>
    <span class="status ${escapeAttr(row.status)}">${escapeHtml(row.status)}</span>
    <h2>${escapeHtml(row.owner)} / ${escapeHtml(row.platform)}</h2>
    <p><strong>${escapeHtml(row.channel)}</strong></p>
    <p>${escapeHtml(row.detail)}</p>
    ${row.attemptUrl ? `<p><a href="${escapeAttr(row.attemptUrl)}">${escapeHtml(row.attemptUrl)}</a></p>` : ""}
    ${row.nextAction ? `<p>Next: ${escapeHtml(row.nextAction)}</p>` : ""}
  </article>`;
}

async function readAttempts() {
  return readCsv(attemptsPath).catch(() => []);
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readCsv(filePath) {
  return parseCsv(await readFile(filePath, "utf8"));
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") result.help = true;
    else if (arg === "--quiet") result.quiet = true;
    else if (arg === "--add") result.add = true;
    else if (arg === "--root") result.root = argv[++index];
    else if (arg === "--now") result.now = argv[++index];
    else if (arg === "--timestamp-eest") result.timestampEest = argv[++index];
    else if (arg === "--owner") result.owner = argv[++index];
    else if (arg === "--platform") result.platform = argv[++index];
    else if (arg === "--channel") result.channel = argv[++index];
    else if (arg === "--status") result.status = argv[++index];
    else if (arg === "--attempt-url") result.attemptUrl = argv[++index];
    else if (arg === "--detail") result.detail = argv[++index];
    else if (arg === "--next-action") result.nextAction = argv[++index];
  }
  return result;
}

function printHelp() {
  process.stdout.write(`WorldCup26 public channel attempts

Usage:
  node campaign-public-channel-attempts.mjs
  node campaign-public-channel-attempts.mjs --add --owner Dexter --platform X --channel "public fallback" --status login_required --detail "X redirected to login"

Statuses:
  posted, sent, requested, login_required, approval_required, blocked, ready
`);
}

function requiredArg(name) {
  const value = args[toCamel(name)];
  if (!String(value ?? "").trim()) {
    throw new Error(`--${name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)} is required`);
  }
  return String(value).trim();
}

function toCamel(value) {
  return String(value).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header = [], ...data] = rows;
  return data
    .filter((values) => values.some((value) => String(value ?? "").trim()))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function renderCsv(rows) {
  return `${HEADER.join(",")}\n${rows
    .map((row) => HEADER.map((key) => csvCell(row[key])).join(","))
    .join("\n")}\n`;
}

function csvCell(value) {
  const text = String(value ?? "");
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
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
