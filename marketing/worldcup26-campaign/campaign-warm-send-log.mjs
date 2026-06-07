#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

if (args.help) {
  printHelp();
  process.exit(0);
}

const sprint = await readJson(path.join(runtimeDir, "warm-contact-sprint.json"), {});
const batch = selectBatch(sprint);

if (!batch) {
  throw new Error("No warm-contact batch found. Run campaign-warm-contact-sprint.mjs first.");
}

const count = positiveNumber("count");
const account = requiredArg("account");
const replies = numberArg("replies", 0);
const happenedAt = String(args.happenedAt || args.timestampEest || formatEestLogTime(now)).trim();
const status = normalizeStatus(args.status || batch.status || "sent");
const note = String(args.note || "").trim();
const owner = String(args.owner || batch.owner || "").trim();
const platform = String(args.platform || batch.platform || batch.channel || "").trim();
const link = String(batch.link || batch.trackedLink || "").trim();
const detail = [
  `${platform}: ${status} to ${count} ${batch.audience} from ${account} at ${happenedAt}`,
  `asset ${batch.asset}`,
  `code ${REFERRAL_CODE}`,
  "link included",
  `replies/signups ${replies}`,
  note,
].filter(Boolean).join("; ");

execFileSync(process.execPath, [
  path.join(campaignDir, "campaign-public-channel-attempts.mjs"),
  "--add",
  "--owner",
  owner,
  "--platform",
  platform,
  "--channel",
  "warm-contact sprint",
  "--status",
  status,
  "--attempt-url",
  link,
  "--detail",
  detail,
  "--next-action",
  "watch replies/signups; help anyone who asks; run referral activity after 15 minutes",
  "--timestamp-eest",
  happenedAt,
  "--quiet",
], { cwd: campaignDir, stdio: "inherit" });

for (const script of [
  "campaign-referral-activity.mjs",
  "campaign-signup-conversion-audit.mjs",
  "campaign-warm-followup-monitor.mjs",
  "campaign-response-kit.mjs",
  "campaign-objective-audit.mjs",
  "campaign-evidence-board.mjs",
]) {
  execFileSync(process.execPath, [path.join(campaignDir, script), "--quiet"], {
    cwd: campaignDir,
    stdio: "inherit",
  });
}

const payload = {
  schema: "worldcup26-warm-send-log-last-v1",
  generatedAt: now.toISOString(),
  generatedAtEest: formatEestLogTime(now),
  ok: true,
  priority: String(batch.priority ?? ""),
  owner,
  platform,
  audience: String(batch.audience ?? ""),
  count,
  replies,
  status,
  happenedAt,
  link,
  detail,
  nextCheck: "Check referral activity and signup conversion again after 15 minutes.",
  rule: "This row is valid only if the warm-contact message/admin request was actually sent. Do not use it for planned sends.",
};

await writeFile(path.join(runtimeDir, "warm-send-log-last.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "warm-send-log-last.txt"), renderText(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function selectBatch(sprint) {
  const batches = Array.isArray(sprint.batches) ? sprint.batches : [];
  if (args.priority) {
    const exact = batches.find((row) => String(row.priority ?? "") === String(args.priority));
    if (exact) return exact;
  }
  if (args.owner) {
    const byOwner = batches.find((row) => sameText(row.owner, args.owner));
    if (byOwner) return byOwner;
  }
  return sprint.firstAction ?? batches[0] ?? null;
}

function renderText(payload) {
  return [
    `WorldCup26 warm send logged ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} priority=${payload.priority} owner=${payload.owner} platform=${payload.platform} count=${payload.count} replies=${payload.replies}`,
    `detail=${payload.detail}`,
    `link=${payload.link}`,
    `next=${payload.nextCheck}`,
    `rule=${payload.rule}`,
    "",
  ].join("\n");
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function parseArgs(rawArgs) {
  const parsed = {
    root: "",
    now: "",
    priority: "",
    owner: "",
    platform: "",
    status: "",
    account: "",
    count: "",
    replies: "",
    happenedAt: "",
    timestampEest: "",
    note: "",
    quiet: false,
    help: false,
  };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--priority") parsed.priority = rawArgs[++index] ?? "";
    else if (arg === "--owner") parsed.owner = rawArgs[++index] ?? "";
    else if (arg === "--platform") parsed.platform = rawArgs[++index] ?? "";
    else if (arg === "--status") parsed.status = rawArgs[++index] ?? "";
    else if (arg === "--account") parsed.account = rawArgs[++index] ?? "";
    else if (arg === "--count") parsed.count = rawArgs[++index] ?? "";
    else if (arg === "--replies") parsed.replies = rawArgs[++index] ?? "";
    else if (arg === "--happened-at") parsed.happenedAt = rawArgs[++index] ?? "";
    else if (arg === "--timestamp-eest") parsed.timestampEest = rawArgs[++index] ?? "";
    else if (arg === "--note") parsed.note = rawArgs[++index] ?? "";
  }
  return parsed;
}

function printHelp() {
  process.stdout.write(`WorldCup26 warm send logger

Use only after the private warm-contact message/admin request was really sent.

Examples:
  node campaign-warm-send-log.mjs --priority warm-1 --count 10 --account "personal WhatsApp" --replies 0
  node campaign-warm-send-log.mjs --priority warm-4 --count 2 --account "group admin DM" --status requested --note "asked two admins for permission"

Required:
  --count N
  --account "where it was sent from"

Optional:
  --priority warm-1
  --replies N
  --status sent|requested
  --happened-at "2026-06-07 17:58 +0300"
  --note "short private proof note, no raw phone numbers"
`);
}

function requiredArg(name) {
  const value = String(args[name] ?? "").trim();
  if (!value) throw new Error(`--${name} is required`);
  return value;
}

function positiveNumber(name) {
  const value = Number(args[name]);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`--${name} must be a positive number`);
  return value;
}

function numberArg(name, fallback) {
  const raw = String(args[name] ?? "").trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new Error(`--${name} must be zero or a positive number`);
  return value;
}

function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

function sameText(left, right) {
  return String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();
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
