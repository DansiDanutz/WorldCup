#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_EXTERNAL_STALL_MINUTES = 90;
const DEFAULT_ANY_PROOF_STALL_MINUTES = 180;
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
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const proofRows = await readCsv(path.join(runtimeDir, "posting-log-live.csv"));
const postNowRows = await readCsv(path.join(runtimeDir, "post-now.csv"));
const payload = buildPayload(proofRows, postNowRows);

await writeFile(path.join(runtimeDir, "proof-stall.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "proof-stall.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "proof-stall.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "proof-stall.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload(proofRows, postNowRows) {
  const normalizedProofs = proofRows
    .map(normalizeProofRow)
    .filter((row) => row.timestamp)
    .sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime());
  const externalProofs = normalizedProofs.filter(isExternalProof);
  const latestAny = normalizedProofs.at(-1) ?? null;
  const latestExternal = externalProofs.at(-1) ?? null;
  const openRows = postNowRows.map(normalizePostNowRow).filter((row) => row.priority);
  const oldestOpen = [...openRows].sort((left, right) => right.ageMinutes - left.ageMinutes).at(0) ?? null;
  const externalAgeMinutes = ageMinutes(latestExternal?.timestamp);
  const anyAgeMinutes = ageMinutes(latestAny?.timestamp);
  const externalStalled =
    externalAgeMinutes == null || externalAgeMinutes > args.externalStallMinutes;
  const proofStalled = anyAgeMinutes == null || anyAgeMinutes > args.anyProofStallMinutes;
  return {
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: !externalStalled && !proofStalled,
    externalStalled,
    proofStalled,
    thresholds: {
      externalStallMinutes: args.externalStallMinutes,
      anyProofStallMinutes: args.anyProofStallMinutes,
    },
    counts: {
      proofRows: normalizedProofs.length,
      externalProofRows: externalProofs.length,
      urgentOpenRows: openRows.length,
    },
    latestAnyProof: latestAny ? summarizeProof(latestAny) : null,
    latestExternalProof: latestExternal ? summarizeProof(latestExternal) : null,
    latestAnyProofAgeMinutes: anyAgeMinutes,
    latestExternalProofAgeMinutes: externalAgeMinutes,
    oldestOpenRow: oldestOpen,
    nextExternalActions: openRows.filter(isLikelyExternalPost).slice(0, 6),
  };
}

function normalizeProofRow(row) {
  const timestamp = parseEestLogTime(row.timestamp_eest);
  return {
    timestamp,
    timestampEest: String(row.timestamp_eest ?? ""),
    scheduledAtEest: String(row.scheduled_at_eest ?? ""),
    owner: String(row.owner ?? ""),
    channel: String(row.channel ?? ""),
    asset: String(row.asset ?? ""),
    link: String(row.link ?? ""),
    status: String(row.status ?? ""),
    proofUrl: String(row.proof_url ?? ""),
    signupNotes: String(row.signup_notes ?? ""),
  };
}

function normalizePostNowRow(row) {
  const scheduledAt = parseEestLogTime(row.scheduled_at_eest);
  return {
    priority: String(row.priority ?? ""),
    owner: String(row.owner ?? ""),
    channel: String(row.channel ?? ""),
    action: String(row.action ?? ""),
    asset: String(row.asset ?? ""),
    scheduledAtEest: String(row.scheduled_at_eest ?? ""),
    trackedLink: String(row.tracked_link ?? ""),
    ageMinutes: scheduledAt ? Math.max(0, Math.floor((now.getTime() - scheduledAt.getTime()) / 60_000)) : 0,
  };
}

function isExternalProof(row) {
  const proof = row.proofUrl.trim();
  const channel = row.channel.toLowerCase();
  const status = row.status.toLowerCase();
  if (!proof || proof.startsWith("internal-log:")) return false;
  if (/^https?:\/\//i.test(proof) && !proof.includes("worldcup26.world/login")) return true;
  if (/^(private-|public-|approval-|manual-post-note:|public-video-url|private-video-note:)/i.test(proof)) {
    return true;
  }
  return (
    ["posted", "sent", "published", "replied", "requested", "uploaded"].some((value) => status.includes(value)) &&
    !channel.includes("ops") &&
    !channel.includes("audit") &&
    !channel.includes("watchdog")
  );
}

function isLikelyExternalPost(row) {
  const channel = row.channel.toLowerCase();
  return !channel.includes("ops") && !channel.includes("audit") && !channel.includes("internal");
}

function summarizeProof(row) {
  return {
    timestampEest: row.timestampEest,
    ageLabel: formatAge(ageMinutes(row.timestamp)),
    owner: row.owner,
    channel: row.channel,
    status: row.status,
    asset: row.asset,
    proofUrl: row.proofUrl,
  };
}

function ageMinutes(date) {
  if (!date) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
}

function renderText(payload) {
  const lines = [
    `WorldCup26 proof stall ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} external_stalled=${payload.externalStalled ? "yes" : "no"} proof_stalled=${payload.proofStalled ? "yes" : "no"} proofs=${payload.counts.proofRows} external=${payload.counts.externalProofRows} urgent=${payload.counts.urgentOpenRows}`,
    `latest_external=${payload.latestExternalProof?.timestampEest ?? "none"} age=${formatAge(payload.latestExternalProofAgeMinutes)}`,
    `latest_any=${payload.latestAnyProof?.timestampEest ?? "none"} age=${formatAge(payload.latestAnyProofAgeMinutes)}`,
    "",
  ];
  if (payload.oldestOpenRow) {
    lines.push(`oldest_open=#${payload.oldestOpenRow.priority} ${payload.oldestOpenRow.owner} / ${payload.oldestOpenRow.channel} age=${formatAge(payload.oldestOpenRow.ageMinutes)}`);
  }
  lines.push("next_external_actions:");
  for (const row of payload.nextExternalActions) {
    lines.push(`- #${row.priority} ${row.owner} / ${row.channel}: ${row.action}`);
  }
  lines.push("", "This is a campaign execution signal: a stalled proof state means do a real post/message/story/approval request and log real proof.", "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Proof Stall

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ok" : "stalled"}
- External proof stalled: ${payload.externalStalled ? "yes" : "no"}
- Any proof stalled: ${payload.proofStalled ? "yes" : "no"}
- Proof rows: ${payload.counts.proofRows}
- External proof rows: ${payload.counts.externalProofRows}
- Urgent open rows: ${payload.counts.urgentOpenRows}
- Latest external proof: ${payload.latestExternalProof?.timestampEest ?? "none"} (${formatAge(payload.latestExternalProofAgeMinutes)})
- Latest any proof: ${payload.latestAnyProof?.timestampEest ?? "none"} (${formatAge(payload.latestAnyProofAgeMinutes)})

## Next External Actions

${payload.nextExternalActions.map((row) => `- #${row.priority} ${row.owner} / ${row.channel}: ${row.action}`).join("\n") || "No external actions are open."}
`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Proof Stall</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a281f; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd56f; --danger: #ff9f9f; --mint: #78efb4; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(255,213,111,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(900px, 100%); margin: 0 auto; padding: 14px 10px 42px; }
    header, article { border: 1px solid var(--line); border-radius: 8px; background: rgba(10,40,31,.94); padding: 16px; }
    h1 { margin: 0 0 8px; font-size: clamp(30px, 7vw, 56px); line-height: .95; }
    .status { color: ${payload.ok ? "var(--mint)" : "var(--danger)"}; font-weight: 950; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .metric { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .metric span { display: block; color: var(--muted); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .metric strong { display: block; color: var(--gold); font-size: 22px; }
    article { margin-top: 12px; }
    li { margin: 8px 0; }
    @media (max-width: 680px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Proof Stall</h1>
      <p class="status">${payload.ok ? "ok" : "stalled"}</p>
      <div class="grid">
        <div class="metric"><span>External age</span><strong>${formatAge(payload.latestExternalProofAgeMinutes)}</strong></div>
        <div class="metric"><span>Any proof age</span><strong>${formatAge(payload.latestAnyProofAgeMinutes)}</strong></div>
        <div class="metric"><span>Urgent open</span><strong>${payload.counts.urgentOpenRows}</strong></div>
      </div>
    </header>
    <article>
      <h2>Next External Actions</h2>
      <ul>${payload.nextExternalActions.map((row) => `<li><strong>#${escapeHtml(row.priority)} ${escapeHtml(row.owner)} / ${escapeHtml(row.channel)}</strong>: ${escapeHtml(row.action)}</li>`).join("")}</ul>
    </article>
  </main>
</body>
</html>`;
}

async function readCsv(filePath) {
  try {
    return parseCsv(await readFile(filePath, "utf8"));
  } catch {
    return [];
  }
}

function parseArgs(rawArgs) {
  const parsed = {
    quiet: false,
    root: "",
    now: "",
    externalStallMinutes: DEFAULT_EXTERNAL_STALL_MINUTES,
    anyProofStallMinutes: DEFAULT_ANY_PROOF_STALL_MINUTES,
  };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--external-stall-minutes") parsed.externalStallMinutes = Number(rawArgs[++index] ?? parsed.externalStallMinutes);
    else if (arg === "--any-proof-stall-minutes") parsed.anyProofStallMinutes = Number(rawArgs[++index] ?? parsed.anyProofStallMinutes);
  }
  return parsed;
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

  const [header = PROOF_HEADER, ...data] = rows;
  return data
    .filter((values) => values.some((value) => String(value ?? "").trim().length > 0))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function parseEestLogTime(value) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) \+0300$/);
  if (!match) return null;
  const parsed = new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00+03:00`);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
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

function formatAge(minutes) {
  if (minutes == null) return "none";
  if (minutes < 60) return `${minutes}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
