#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const rows = (await readCsv(path.join(runtimeDir, "post-now.csv")))
  .map(normalizeRow)
  .filter((row) => row.priority)
  .slice(0, args.limit);
const proofSla = await readJson(path.join(runtimeDir, "proof-sla.json"), {});
const payload = {
  schema: "worldcup26-proof-closeout-v1",
  generatedAt: now.toISOString(),
  generatedAtEest: formatEestLogTime(now),
  referralCode: REFERRAL_CODE,
  referralLink: REFERRAL_LINK,
  proofState: String(proofSla.proofState ?? "missing"),
  latestExternalProofAgeLabel: String(proofSla.latestExternalProofAgeLabel ?? "none"),
  ok: rows.length > 0 && rows.every((row) => row.command && !/[<>]|YYYY-MM-DD|HH:mm/i.test(row.command)),
  rows,
  rule:
    "Run one of these commands only after the matching real post, story, message batch, upload, reply, or approval request exists. Edit account/audience if the suggested value is not true.",
};

await writeFile(path.join(runtimeDir, "proof-closeout.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "proof-closeout.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "proof-closeout.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "proof-closeout.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

function normalizeRow(row) {
  const priority = String(row.priority ?? "").trim();
  const owner = String(row.owner ?? "").trim();
  const channel = String(row.channel ?? "").trim();
  const mode = String(row.mode ?? "").trim();
  const asset = String(row.asset ?? "").trim();
  const action = String(row.action ?? "").trim();
  const trackedLink = String(row.tracked_link ?? "").trim();
  const suggested = suggestionsFor({ channel, mode, action });
  const status = proofStatusFor({ channel, mode, action });
  const command = renderShellCommand("node", [
    "campaign-proof-intake.mjs",
    "--priority",
    priority,
    "--account",
    suggested.account,
    "--audience",
    suggested.audience,
    "--happened-at",
    formatEestLogTime(now),
    "--status",
    status,
  ]);
  return {
    priority,
    owner,
    channel,
    mode,
    action,
    asset,
    trackedLink,
    status,
    suggestedAccount: suggested.account,
    suggestedAudience: suggested.audience,
    command,
  };
}

function suggestionsFor(row) {
  const text = `${row.channel} ${row.mode} ${row.action}`.toLowerCase();
  if (text.includes("whatsapp") && text.includes("status")) {
    return { account: "personal phone", audience: "WhatsApp contacts" };
  }
  if (text.includes("whatsapp")) {
    return { account: "personal phone", audience: "warm contacts" };
  }
  if (text.includes("instagram") || text.includes("facebook story") || text.includes("meta story")) {
    return { account: "Meta account", audience: "story followers" };
  }
  if (text.includes("facebook")) {
    return { account: "Facebook account", audience: "football friends and contacts" };
  }
  if (text.includes("x ") || text.includes("twitter")) {
    return { account: "X account", audience: "public X followers" };
  }
  if (text.includes("tiktok")) {
    return { account: "TikTok account", audience: "public TikTok viewers" };
  }
  if (text.includes("youtube")) {
    return { account: "YouTube account", audience: "public Shorts viewers" };
  }
  if (text.includes("football") || text.includes("approval") || text.includes("permission")) {
    return { account: "posting account", audience: "football group admin or approved group" };
  }
  if (text.includes("dm") || text.includes("reply")) {
    return { account: "posting account", audience: "reply thread or contact initials" };
  }
  return { account: "posting account", audience: "destination or channel name" };
}

function proofStatusFor(row) {
  const text = `${row.channel} ${row.mode} ${row.action}`.toLowerCase();
  if (text.includes("approval") || text.includes("permission")) return "requested";
  if (text.includes("reply")) return "replied";
  if (text.includes("personal") || text.includes("outreach") || text.includes("dm")) return "sent";
  if (text.includes("upload") || text.includes("short") || text.includes("reel")) return "uploaded";
  return "posted";
}

function renderText(payload) {
  const lines = [
    `WorldCup26 proof closeout ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.proofState} latest_external=${payload.latestExternalProofAgeLabel} rows=${payload.rows.length}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `rule=${payload.rule}`,
    "",
    "ready_commands:",
  ];
  for (const row of payload.rows) {
    lines.push(`- #${row.priority} ${row.owner} / ${row.channel} status=${row.status}`);
    lines.push(`  action=${row.action}`);
    lines.push(`  account=${row.suggestedAccount}`);
    lines.push(`  audience=${row.suggestedAudience}`);
    lines.push(`  command=${row.command}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Proof Closeout

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ok" : "fail"}
- Proof state: ${payload.proofState}
- Latest external proof age: ${payload.latestExternalProofAgeLabel}
- Referral code: \`${payload.referralCode}\`

${payload.rule}

${payload.rows.map(renderRowMarkdown).join("\n\n") || "No urgent proof rows found."}
`;
}

function renderRowMarkdown(row) {
  return `## #${row.priority} ${row.owner} / ${row.channel}

- Action: ${row.action}
- Suggested account: ${row.suggestedAccount}
- Suggested audience: ${row.suggestedAudience}
- Status: ${row.status}

\`\`\`bash
${row.command}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WorldCup26 Proof Closeout</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #061711; color: #f8fff9; }
    main { max-width: 980px; margin: 0 auto; padding: 20px 12px 46px; }
    header, article { border: 1px solid rgba(255,255,255,.16); border-radius: 8px; background: #0d2a20; padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p { color: #cfe2d9; line-height: 1.45; }
    code, pre { color: #ffdc7a; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; }
    .pill { display: inline-flex; border-radius: 999px; padding: 4px 8px; background: #ffd974; color: #082117; font-weight: 900; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Proof Closeout</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <span class="pill">${payload.ok ? "ready" : "needs attention"}</span>
    </header>
    ${payload.rows.map(renderRowHtml).join("")}
  </main>
</body>
</html>
`;
}

function renderRowHtml(row) {
  return `<article>
    <h2>#${escapeHtml(row.priority)} ${escapeHtml(row.owner)} / ${escapeHtml(row.channel)}</h2>
    <p>${escapeHtml(row.action)}</p>
    <p>Account: ${escapeHtml(row.suggestedAccount)} · Audience: ${escapeHtml(row.suggestedAudience)} · Status: ${escapeHtml(row.status)}</p>
    <pre>${escapeHtml(row.command)}</pre>
  </article>`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readCsv(filePath) {
  const text = await readFile(filePath, "utf8");
  return parseCsv(text);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [header = [], ...body] = rows;
  return body
    .filter((entries) => entries.some((entry) => String(entry ?? "").trim()))
    .map((entries) => Object.fromEntries(header.map((key, index) => [key, entries[index] ?? ""])));
}

function renderShellCommand(bin, argsList) {
  return [bin, ...argsList].map(shellQuote).join(" ");
}

function shellQuote(value) {
  const text = String(value ?? "");
  if (/^[A-Za-z0-9_./:=@%+-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, "'\"'\"'")}'`;
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "", limit: 6 };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--limit") parsed.limit = Number(rawArgs[++index] ?? parsed.limit);
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
