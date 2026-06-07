#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROOF_HEADER = [
  "timestamp_eest",
  "scheduled_at_eest",
  "owner",
  "channel",
  "asset",
  "copy_used",
  "link",
  "status",
  "proof_url",
  "reply_count",
  "signup_notes",
  "next_followup",
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const postNowPath = path.join(runtimeDir, "post-now.csv");
const pulsePath = path.join(runtimeDir, "nonstop-pulse.csv");
const proofLogPath = path.join(runtimeDir, "posting-log-live.csv");
const runnerPath = path.join(campaignDir, "campaign-runner.mjs");

if (args.help || (!args.list && !args.priority && !args.pulse)) {
  printHelp();
  process.exit(args.help ? 0 : 2);
}

await mkdir(runtimeDir, { recursive: true });

if (args.list) {
  const rows = await readPostNowRows();
  process.stdout.write(renderPostNowList(rows));
  process.exit(0);
}

const proofRow = args.pulse ? await buildPulseProofRow(args.pulse) : await buildPriorityProofRow(args.priority);

const proofUrl = args.proofUrl ?? proofRow.proof_url ?? "";
validateProofUrl(proofUrl);

proofRow.timestamp_eest = formatEestLogTime(args.now ? new Date(args.now) : new Date());
proofRow.status = args.status ?? proofRow.status ?? "posted";
proofRow.proof_url = proofUrl;
proofRow.reply_count = args.replyCount ?? proofRow.reply_count ?? "0";
proofRow.signup_notes = args.signupNotes ?? proofRow.signup_notes ?? "";
proofRow.next_followup = args.nextFollowup ?? proofRow.next_followup ?? "";

const existing = await readProofLog();
const duplicate = existing.some((entry) => proofKey(entry) === proofKey(proofRow));
if (duplicate && !args.force) {
  throw new Error(
    "This owner/channel/asset/link is already logged. Use --force only if you intentionally need a duplicate proof row.",
  );
}

const nextLogText = renderProofLog([...existing, proofRow]);
await writeFile(proofLogPath, nextLogText);

if (!args.noRefresh) {
  const { spawn } = await import("node:child_process");
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [runnerPath, "--root", campaignDir, "--window-hours", args.windowHours ?? "72"], {
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`campaign-runner.mjs exited with code ${code}`));
    });
  });
}

process.stdout.write(
  [
    "Proof row logged.",
    args.pulse ? `Pulse: ${args.pulse}` : `Priority: ${args.priority}`,
    `Owner: ${proofRow.owner}`,
    `Channel: ${proofRow.channel}`,
    `Asset: ${proofRow.asset}`,
    `Proof: ${proofRow.proof_url}`,
    "",
  ].join("\n"),
);

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") result.help = true;
    else if (arg === "--list") result.list = true;
    else if (arg === "--force") result.force = true;
    else if (arg === "--no-refresh") result.noRefresh = true;
    else if (arg === "--priority") result.priority = argv[++index];
    else if (arg === "--pulse") result.pulse = argv[++index];
    else if (arg === "--proof-url") result.proofUrl = argv[++index];
    else if (arg === "--status") result.status = argv[++index];
    else if (arg === "--reply-count") result.replyCount = argv[++index];
    else if (arg === "--signup-notes") result.signupNotes = argv[++index];
    else if (arg === "--next-followup") result.nextFollowup = argv[++index];
    else if (arg === "--window-hours") result.windowHours = argv[++index];
    else if (arg === "--root") result.root = argv[++index];
    else if (arg === "--now") result.now = argv[++index];
  }
  return result;
}

function printHelp() {
  process.stdout.write(`WorldCup26 proof logger

Usage:
  node campaign-proof-log.mjs --list
  node campaign-proof-log.mjs --priority 2 --proof-url "https://..."
  node campaign-proof-log.mjs --priority 4 --proof-url "private-whatsapp: warm contacts batch 1" --status sent
  node campaign-proof-log.mjs --pulse 1 --proof-url "https://..." --status posted

Options:
  --root PATH          Campaign folder. Defaults to this script folder.
  --priority N        Priority number from runtime/post-now.csv.
  --pulse N           Pulse number from runtime/nonstop-pulse.csv for supplemental proof.
  --proof-url VALUE   Public post URL or clear private-channel proof note.
  --status VALUE      posted, sent, published, replied, logged, etc.
  --reply-count N     Reply count observed at logging time.
  --signup-notes TXT  Signup/click notes.
  --next-followup TXT Next follow-up action.
  --no-refresh        Append proof without rerunning campaign-runner.mjs.
  --force             Allow duplicate owner/channel/asset/link proof.
`);
}

function validateProofUrl(value) {
  const proof = String(value ?? "").trim();
  if (!proof) {
    throw new Error("--proof-url is required. Use a public post URL or a clear private-channel note.");
  }

  const upper = proof.toUpperCase();
  const placeholderPatterns = [
    "ADD_POST_URL_OR_ACCOUNT_NOTE",
    "POST_URL_OR_PRIVATE_NOTE",
    "POST_URL",
    "PRIVATE_NOTE",
    "YYYY-MM-DD",
    "HH:MM",
    "<GROUP/CHANNEL>",
    "<PHONE/ACCOUNT>",
    "<ACCOUNT>",
    "<N>",
    "HTTPS://...",
    "HTTP://...",
  ];
  const hasAnglePlaceholder = /<[^>]+>/.test(proof);
  const hasPlaceholderToken = placeholderPatterns.some((pattern) => upper.includes(pattern));

  if (hasAnglePlaceholder || hasPlaceholderToken) {
    throw new Error(
      "--proof-url still contains placeholder text. Replace it with a real public URL or a precise private-channel note before logging proof.",
    );
  }

  if (isHttpUrl(proof)) return;

  const privateNoteLooksSpecific =
    proof.length >= 32 &&
    proof.includes(":") &&
    /\b(20\d{2}-\d{2}-\d{2}|\d{1,2}:\d{2}|EEST|UTC|account|channel|group|contacts|status|story|dm|reply|admin|approval|posted|sent|uploaded|published)\b/i.test(proof);

  if (!privateNoteLooksSpecific) {
    throw new Error(
      "--proof-url private notes must be specific: include channel/account/audience detail and time, or use a public post URL.",
    );
  }
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function buildPriorityProofRow(priorityValue) {
  const rows = await readPostNowRows();
  const priority = Number(priorityValue);
  if (!Number.isInteger(priority) || priority < 1) {
    throw new Error("--priority must be a positive integer from runtime/post-now.csv");
  }

  const row = rows.find((candidate) => Number(candidate.priority) === priority);
  if (!row) {
    throw new Error(`No post-now row found for priority ${priority}. Run campaign-runner.mjs first.`);
  }

  const proofRow = parseSingleCsvRow(row.proof_log_row);
  if (!proofRow) {
    throw new Error(`Post-now row ${priority} does not contain a valid proof_log_row.`);
  }
  return proofRow;
}

async function buildPulseProofRow(pulseValue) {
  const rows = await readPulseRows();
  const pulse = Number(pulseValue);
  if (!Number.isInteger(pulse) || pulse < 1) {
    throw new Error("--pulse must be a positive integer from runtime/nonstop-pulse.csv");
  }

  const row = rows.find((candidate) => Number(candidate.pulse) === pulse);
  if (!row) {
    throw new Error(`No pulse row found for pulse ${pulse}. Run campaign-pulse.mjs first.`);
  }

  return {
    timestamp_eest: "",
    scheduled_at_eest: row.scheduled_at_eest,
    owner: row.owner,
    channel: row.channel,
    asset: row.asset,
    copy_used: row.primary_copy,
    link: row.tracked_link,
    status: "posted",
    proof_url: "",
    reply_count: "0",
    signup_notes: `supplemental pulse ${row.pulse}; ${row.lane}; ${row.action}`,
    next_followup: "",
  };
}

async function readPostNowRows() {
  try {
    return parseCsv(await readFile(postNowPath, "utf8"));
  } catch {
    return [];
  }
}

async function readProofLog() {
  try {
    return parseCsv(await readFile(proofLogPath, "utf8"));
  } catch {
    return [];
  }
}

async function readPulseRows() {
  try {
    return parseCsv(await readFile(pulsePath, "utf8"));
  } catch {
    return [];
  }
}

function parseSingleCsvRow(text) {
  const parsed = parseCsv(`${PROOF_HEADER.join(",")}\n${text}\n`);
  return parsed[0] ?? null;
}

function renderPostNowList(rows) {
  if (!rows.length) return "No urgent post-now rows. Run campaign-runner.mjs first.\n";
  return `${rows
    .map(
      (row) =>
        `${row.priority}. ${row.owner} / ${row.channel} / ${row.scheduled_at_eest}\n   ${row.action}\n   ${row.tracked_link}`,
    )
    .join("\n\n")}\n`;
}

function renderProofLog(rows) {
  return `${PROOF_HEADER.join(",")}\n${rows
    .map((row) => PROOF_HEADER.map((key) => csvEscape(row[key])).join(","))
    .join("\n")}\n`;
}

function proofKey(row) {
  return [row.scheduled_at_eest, row.owner, row.channel, row.asset, normalizeLink(row.link)]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .join("|");
}

function normalizeLink(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return text;
  }
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

  const [header, ...data] = rows;
  return data
    .filter((values) => values.some((value) => String(value ?? "").trim().length > 0))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function formatEestLogTime(date) {
  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const hour = String(shifted.getUTCHours()).padStart(2, "0");
  const minute = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute} +0300`;
}
