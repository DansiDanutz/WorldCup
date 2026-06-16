#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const OPERATOR_ACCOUNT = "david2015bestai@gmail.com";
const VALID_WORKERS = new Set(["Dexter", "Sienna", "Memo", "Nano"]);

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const now = args.now ? new Date(args.now) : new Date();

if (args.help) {
  printHelp();
  process.exit(0);
}

const worker = requiredArg("worker");
if (!VALID_WORKERS.has(worker)) {
  throw new Error(`--worker must be one of ${[...VALID_WORKERS].join(", ")}`);
}

const proofUrl = requiredArg("proofUrl");
const target = requiredArg("target");
const query = args.query || "manual X football reply";
const timestamp = args.timestampEest || formatEestLogTime(now);

if (!isRealProofValue(proofUrl)) {
  throw new Error("--proof-url must be a public X reply URL or a private-reply-note/private proof note.");
}

const detail = [
  `Manual X reply from ${OPERATOR_ACCOUNT} at ${timestamp};`,
  `target=${target};`,
  `search='${query}';`,
  `code ${REFERRAL_CODE} and WorldCup26 link included`,
].join(" ");

const commandArgs = [
  "campaign-public-channel-attempts.mjs",
  "--add",
  "--owner",
  worker,
  "--platform",
  "X",
  "--channel",
  "football manual replies",
  "--status",
  "replied",
  "--attempt-url",
  proofUrl,
  "--detail",
  detail,
  "--next-action",
  "watch replies, then run campaign-referral-activity.mjs after 15 minutes",
  "--root",
  campaignDir,
  "--now",
  now.toISOString(),
];

const output = execFileSync(process.execPath, commandArgs, {
  cwd: campaignDir,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

process.stdout.write([
  `WorldCup26 X reply logged`,
  `worker=${worker}`,
  `proof=${proofUrl}`,
  `target=${target}`,
  `timestamp=${timestamp}`,
  "",
  output,
].join("\n"));

function isRealProofValue(value) {
  const text = String(value ?? "").trim();
  if (/^https:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/i.test(text)) return true;
  if (/^private-(reply-)?note:/i.test(text)) return true;
  if (/^private proof:/i.test(text)) return true;
  return false;
}

function requiredArg(key) {
  const value = args[key];
  if (!value) {
    throw new Error(`Missing --${toKebab(key)}. Run with --help for usage.`);
  }
  return value;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help") {
      parsed.help = true;
    } else if (arg === "--root") {
      parsed.root = argv[index + 1];
      index += 1;
    } else if (arg === "--now") {
      parsed.now = argv[index + 1];
      index += 1;
    } else if (arg === "--worker") {
      parsed.worker = argv[index + 1];
      index += 1;
    } else if (arg === "--proof-url" || arg === "--proof") {
      parsed.proofUrl = argv[index + 1];
      index += 1;
    } else if (arg === "--target") {
      parsed.target = argv[index + 1];
      index += 1;
    } else if (arg === "--query") {
      parsed.query = argv[index + 1];
      index += 1;
    } else if (arg === "--timestamp-eest") {
      parsed.timestampEest = argv[index + 1];
      index += 1;
    }
  }
  return parsed;
}

function printHelp() {
  process.stdout.write(`WorldCup26 X reply logger

Use only after a real manual X reply happened.

Usage:
  node campaign-x-reply-log.mjs --worker Dexter --proof-url "https://x.com/account/status/123" --target "@target" --query "world cup 2026 predictions"

Private proof note form:
  node campaign-x-reply-log.mjs --worker Sienna --proof "private-reply-note: replied to @target at 2026-06-07 21:10 EEST from david2015bestai@gmail.com" --target "@target"

Required:
  --worker       Dexter, Sienna, Memo, or Nano
  --proof-url    Public X reply URL, or private-reply-note/private proof note
  --target       @handle or source tweet URL
`);
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
  }).format(date).replace(",", "");
}

function toKebab(value) {
  return String(value).replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
