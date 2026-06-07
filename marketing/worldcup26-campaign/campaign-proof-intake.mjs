#!/usr/bin/env node
import { spawn } from "node:child_process";
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

if (args.priority) {
  await logProofFromIntake();
} else {
  const payload = await buildPayload();
  await writeFile(path.join(runtimeDir, "proof-intake.json"), `${JSON.stringify(payload, null, 2)}\n`);
  await writeFile(path.join(runtimeDir, "proof-intake.md"), renderMarkdown(payload));
  await writeFile(path.join(runtimeDir, "proof-intake.txt"), renderText(payload));
  await writeFile(path.join(runtimeDir, "proof-intake.html"), renderHtml(payload));
  if (!args.quiet) process.stdout.write(renderText(payload));
}

async function buildPayload() {
  const postNowRows = await readCsv(path.join(runtimeDir, "post-now.csv"));
  const proofSla = await readJson(path.join(runtimeDir, "proof-sla.json"), {});
  const workerWake = await readJson(path.join(runtimeDir, "worker-wake-board.json"), {});
  const warmRows = normalizeWarmRows(workerWake);
  const rows = postNowRows
    .map(normalizePostNowRow)
    .filter((row) => row.priority)
    .slice(0, 8);
  const examples =
    warmRows.length > 0
      ? warmRows.slice(0, 4).map(exampleForWarmRow)
      : rows.slice(0, 4).map(exampleForRow);
  return {
    schema: "worldcup26-proof-intake-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    proofState: String(proofSla.proofState ?? "missing"),
    latestExternalProofAgeLabel: String(proofSla.latestExternalProofAgeLabel ?? "none"),
    intakeMode: warmRows.length > 0 ? "warm-contact-sprint" : "post-now",
    rows,
    warmRows,
    examples,
    proofRule:
      "Use this only after the real post, story, message, upload, reply, or approval request exists.",
  };
}

async function logProofFromIntake() {
  const postNowRows = await readCsv(path.join(runtimeDir, "post-now.csv"));
  const row = postNowRows
    .map(normalizePostNowRow)
    .find((candidate) => candidate.priority === String(args.priority));
  if (!row) {
    throw new Error(`No urgent row found for priority ${args.priority}. Run campaign-runner.mjs first.`);
  }

  const proofUrl = buildProofValue(row);
  const command = [
    path.join(campaignDir, "campaign-proof-log.mjs"),
    "--root",
    campaignDir,
    "--priority",
    row.priority,
    "--proof-url",
    proofUrl,
    "--status",
    args.status || row.proofStatus,
  ];
  if (args.replyCount) command.push("--reply-count", args.replyCount);
  if (args.signupNotes) command.push("--signup-notes", args.signupNotes);
  if (args.nextFollowup) command.push("--next-followup", args.nextFollowup);
  if (args.noRefresh) command.push("--no-refresh");
  if (args.force) command.push("--force");

  if (args.printCommand) {
    process.stdout.write(`${renderShellCommand("node", command)}\n`);
    return;
  }

  await spawnProofLogger(command);
}

function buildProofValue(row) {
  if (args.publicUrl) {
    validatePublicUrl(args.publicUrl);
    return args.publicUrl;
  }
  if (args.privateNote) {
    validateSpecificNote(args.privateNote);
    return args.privateNote;
  }

  const account = requiredArg("account");
  const audience = requiredArg("audience");
  const happenedAt = args.happenedAt || formatEestLogTime(now);
  const extra = args.extra ? `; ${args.extra}` : "";
  const channel = row.channel.toLowerCase();
  const asset = row.asset || "asset";

  if (channel.includes("whatsapp") && channel.includes("status")) {
    return `private-whatsapp-status: posted status from ${account} at ${happenedAt}; visible to ${audience}; asset ${asset}; code ${REFERRAL_CODE} and link included${extra}`;
  }
  if (channel.includes("whatsapp")) {
    return `private-whatsapp: sent to ${audience} from ${account} at ${happenedAt}; asset ${asset}; code ${REFERRAL_CODE} and link included${extra}`;
  }
  if (channel.includes("instagram") || channel.includes("facebook story") || channel.includes("meta story")) {
    return `private-meta-story: story posted from ${account} at ${happenedAt}; visible to ${audience}; asset ${asset}; code/link sticker or caption included${extra}`;
  }
  if (channel.includes("short") || channel.includes("reel") || channel.includes("tiktok") || channel.includes("youtube")) {
    return `private-video-note: uploaded from ${account} at ${happenedAt}; destination ${audience}; asset ${asset}; code ${REFERRAL_CODE} and link included${extra}`;
  }
  if (channel.includes("football") || row.mode.toLowerCase().includes("approval") || row.action.toLowerCase().includes("permission")) {
    return `approval-request: asked admin ${audience} from ${account} at ${happenedAt}; asset ${asset}; code ${REFERRAL_CODE} and link included; post only after allowed${extra}`;
  }
  if (channel.includes("dm") || channel.includes("reply") || row.mode.toLowerCase().includes("reply")) {
    return `private-reply-note: replied from ${account} to ${audience} at ${happenedAt}; code ${REFERRAL_CODE} and link included${extra}`;
  }
  return `manual-post-note: posted from ${account} to ${audience} at ${happenedAt}; asset ${asset}; code ${REFERRAL_CODE} and link included${extra}`;
}

function normalizePostNowRow(row) {
  const priority = String(row.priority ?? "").trim();
  const mode = String(row.mode ?? "").trim();
  const channel = String(row.channel ?? "").trim();
  return {
    priority,
    scheduledAtEest: String(row.scheduled_at_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel,
    mode,
    action: String(row.action ?? "").trim(),
    asset: String(row.asset ?? "").trim(),
    trackedLink: String(row.tracked_link ?? "").trim(),
    copy: String(row.primary_copy ?? "").trim(),
    proofStatus: proofStatusFor(mode),
  };
}

function exampleForRow(row) {
  const base = [
    "node",
    "campaign-proof-intake.mjs",
    "--priority",
    row.priority,
    "--account",
    accountExample(row),
    "--audience",
    audienceExample(row),
    "--happened-at",
    "YYYY-MM-DD HH:mm +0300",
    "--status",
    row.proofStatus,
  ];
  return {
    priority: row.priority,
    owner: row.owner,
    channel: row.channel,
    action: row.action,
    privateCommand: renderShellCommand(base[0], base.slice(1)),
    publicCommand: renderShellCommand("node", [
      "campaign-proof-intake.mjs",
      "--priority",
      row.priority,
      "--public-url",
      "PASTE_PUBLIC_POST_URL",
      "--status",
      row.proofStatus,
    ]),
  };
}

function normalizeWarmRows(workerWake) {
  const rows = Array.isArray(workerWake.workers)
    ? workerWake.workers.map((worker) => worker.current).filter(Boolean)
    : [];
  return rows
    .filter((row) => String(row.priority ?? "").startsWith("warm-"))
    .sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority))
    .map((row) => ({
      priority: String(row.priority ?? ""),
      owner: String(row.owner ?? ""),
      channel: String(row.channel ?? ""),
      action: String(row.action ?? ""),
      proofCommand: String(row.proofIntakeCommand ?? ""),
    }))
    .filter((row) => row.priority && row.proofCommand);
}

function exampleForWarmRow(row) {
  return {
    priority: row.priority,
    owner: row.owner,
    channel: row.channel,
    action: row.action,
    privateCommand: row.proofCommand,
    publicCommand: "Use the private warm-contact command after the real send/request exists. Do not log a public URL for private WhatsApp messages.",
  };
}

function priorityRank(value) {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function accountExample(row) {
  const channel = row.channel.toLowerCase();
  if (channel.includes("whatsapp")) return "personal phone";
  if (channel.includes("instagram")) return "Instagram account";
  if (channel.includes("facebook")) return "Facebook account";
  if (channel.includes("tiktok")) return "TikTok account";
  if (channel.includes("youtube")) return "YouTube account";
  return "posting account";
}

function audienceExample(row) {
  const channel = row.channel.toLowerCase();
  if (channel.includes("status")) return "WhatsApp contacts";
  if (channel.includes("personal")) return "12 warm contacts";
  if (channel.includes("story")) return "story followers";
  if (channel.includes("football")) return "group admin <group name>";
  if (channel.includes("dm")) return "reply thread/contact initials";
  return "destination/channel name";
}

function proofStatusFor(mode) {
  const value = String(mode ?? "").toLowerCase();
  if (value.includes("approval")) return "requested";
  if (value.includes("reply") || value.includes("repl")) return "replied";
  if (value.includes("outreach")) return "sent";
  if (value.includes("internal")) return "logged";
  return "posted";
}

function renderText(payload) {
  const lines = [
    `WorldCup26 proof intake ${payload.generatedAtEest}`,
    `state=${payload.proofState} mode=${payload.intakeMode} latest_external=${payload.latestExternalProofAgeLabel} rows=${payload.rows.length} warm_rows=${payload.warmRows.length}`,
    `rule=${payload.proofRule}`,
    "",
    "quick_examples:",
  ];
  for (const example of payload.examples) {
    lines.push(`- #${example.priority} ${example.owner} / ${example.channel}`);
    lines.push(`  private=${example.privateCommand}`);
    lines.push(`  public=${example.publicCommand}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Proof Intake

Generated: ${payload.generatedAtEest}

- Proof state: ${payload.proofState}
- Latest external proof age: ${payload.latestExternalProofAgeLabel}
- Rows ready for intake: ${payload.rows.length}

${payload.proofRule}

## Quick Examples

${payload.examples.map(renderExampleMarkdown).join("\n\n") || "No urgent rows are ready for proof intake."}
`;
}

function renderExampleMarkdown(example) {
  return `### #${example.priority} ${example.owner} / ${example.channel}

${example.action}

Private proof:

\`\`\`bash
${example.privateCommand}
\`\`\`

Public URL proof:

\`\`\`bash
${example.publicCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Proof Intake</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a2b21; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; --warn: #ffcc6a; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(255,217,116,.18), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 12px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 8px; background: rgba(10,43,33,.94); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 9vw, 66px); line-height: .9; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0; color: var(--muted); line-height: 1.4; }
    .state { display: inline-flex; margin: 4px 0 12px; padding: 7px 10px; border-radius: 999px; color: #03140f; background: var(--warn); font-weight: 950; text-transform: uppercase; }
    .grid { display: grid; gap: 10px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    button { min-height: 44px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #03140f; background: var(--gold); padding: 9px; font: inherit; font-weight: 900; cursor: pointer; }
    @media (min-width: 760px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Proof Intake</h1>
      <span class="state">${escapeHtml(payload.proofState)}</span>
      <p>${escapeHtml(payload.proofRule)}</p>
    </header>
    <section class="grid">${payload.examples.map(renderExampleHtml).join("") || "<article><h2>No rows</h2><p>No urgent rows are ready for proof intake.</p></article>"}</section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      event.preventDefault();
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = old; }, 1200);
      } catch {
        window.prompt("Copy this text", value);
      }
    });
  </script>
</body>
</html>`;
}

function renderExampleHtml(example) {
  return `<article>
    <h2>#${escapeHtml(example.priority)} ${escapeHtml(example.owner)} / ${escapeHtml(example.channel)}</h2>
    <p>${escapeHtml(example.action)}</p>
    <pre>${escapeHtml(example.privateCommand)}</pre>
    <button data-copy="${escapeAttr(example.privateCommand)}">Copy private command</button>
    <pre>${escapeHtml(example.publicCommand)}</pre>
    <button data-copy="${escapeAttr(example.publicCommand)}">Copy public command</button>
  </article>`;
}

async function spawnProofLogger(command) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, command, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`campaign-proof-log.mjs exited with code ${code}`));
    });
  });
}

function requiredArg(name) {
  const value = String(args[name] ?? "").trim();
  if (!value) throw new Error(`--${kebab(name)} is required unless --public-url or --private-note is provided.`);
  if (/<[^>]+>|YYYY-MM-DD|HH:mm|PUBLIC_POST_URL/i.test(value)) {
    throw new Error(`--${kebab(name)} still contains placeholder text.`);
  }
  return value;
}

function validatePublicUrl(value) {
  const text = String(value ?? "").trim();
  if (/PUBLIC_POST_URL|PASTE_|<[^>]+>|YYYY-MM-DD|HH:mm/i.test(text)) {
    throw new Error("--public-url still contains placeholder text.");
  }
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("bad protocol");
  } catch {
    throw new Error("--public-url must be a real http(s) URL.");
  }
}

function validateSpecificNote(value) {
  const text = String(value ?? "").trim();
  if (text.length < 32 || /<[^>]+>|YYYY-MM-DD|HH:mm|PUBLIC_POST_URL/i.test(text)) {
    throw new Error("--private-note must be specific and cannot contain placeholders.");
  }
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readCsv(filePath) {
  try {
    return parseCsv(await readFile(filePath, "utf8"));
  } catch {
    return [];
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

  const [header = [], ...data] = rows;
  return data
    .filter((values) => values.some((value) => String(value ?? "").trim().length > 0))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function parseArgs(rawArgs) {
  const parsed = {
    quiet: false,
    root: "",
    now: "",
    priority: "",
    publicUrl: "",
    privateNote: "",
    account: "",
    audience: "",
    happenedAt: "",
    status: "",
    replyCount: "",
    signupNotes: "",
    nextFollowup: "",
    extra: "",
    printCommand: false,
    noRefresh: false,
    force: false,
    help: false,
  };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--priority") parsed.priority = rawArgs[++index] ?? "";
    else if (arg === "--public-url") parsed.publicUrl = rawArgs[++index] ?? "";
    else if (arg === "--private-note") parsed.privateNote = rawArgs[++index] ?? "";
    else if (arg === "--account") parsed.account = rawArgs[++index] ?? "";
    else if (arg === "--audience") parsed.audience = rawArgs[++index] ?? "";
    else if (arg === "--happened-at") parsed.happenedAt = rawArgs[++index] ?? "";
    else if (arg === "--status") parsed.status = rawArgs[++index] ?? "";
    else if (arg === "--reply-count") parsed.replyCount = rawArgs[++index] ?? "";
    else if (arg === "--signup-notes") parsed.signupNotes = rawArgs[++index] ?? "";
    else if (arg === "--next-followup") parsed.nextFollowup = rawArgs[++index] ?? "";
    else if (arg === "--extra") parsed.extra = rawArgs[++index] ?? "";
    else if (arg === "--print-command") parsed.printCommand = true;
    else if (arg === "--no-refresh") parsed.noRefresh = true;
    else if (arg === "--force") parsed.force = true;
  }
  return parsed;
}

function printHelp() {
  process.stdout.write(`WorldCup26 proof intake

Generate helper:
  node campaign-proof-intake.mjs

Log a private-channel proof after the real action:
  node campaign-proof-intake.mjs --priority 1 --account "personal phone" --audience "WhatsApp contacts" --happened-at "2026-06-07 00:55 +0300"

Log a public URL proof:
  node campaign-proof-intake.mjs --priority 5 --public-url "https://..."

Preview the proof-log command without writing:
  node campaign-proof-intake.mjs --priority 1 --account "personal phone" --audience "WhatsApp contacts" --print-command
`);
}

function renderShellCommand(command, argv) {
  return [command, ...argv].map(shellQuote).join(" ");
}

function shellQuote(value) {
  const text = String(value ?? "");
  if (/^[A-Za-z0-9_./:=+-]+$/.test(text)) return text;
  return `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function kebab(value) {
  return String(value).replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
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
