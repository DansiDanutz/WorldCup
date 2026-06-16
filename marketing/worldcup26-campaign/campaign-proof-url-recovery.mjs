#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const X_HANDLE = "NervixAi";

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const proofRows = await readCsv(path.join(runtimeDir, "posting-log-live.csv"));
const recoveryRows = proofRows.map(normalizeProofRow).filter(needsPublicUrlRecovery);
const payload = buildPayload(recoveryRows);

await writeFile(path.join(runtimeDir, "proof-url-recovery.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "proof-url-recovery.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "proof-url-recovery.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "proof-url-recovery.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload(rows) {
  return {
    schema: "worldcup26-proof-url-recovery-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: true,
    referralCode: REFERRAL_CODE,
    pendingCount: rows.length,
    rows: rows.map((row) => ({
      ...row,
      xProfileUrl: `https://x.com/${X_HANDLE}`,
      xLiveSearchUrl: buildXSearchUrl(row),
      webSearchUrl: buildWebSearchUrl(row),
      upgradeCommand: buildUpgradeCommand(row),
    })),
    rule:
      "Use this board only to replace private proof with a public permalink after the public post URL is visible. Do not invent a URL.",
  };
}

function normalizeProofRow(row) {
  const proofUrl = String(row.proof_url ?? "").trim();
  const copy = String(row.copy_used ?? "").trim();
  const link = String(row.link ?? "").trim();
  return {
    timestampEest: String(row.timestamp_eest ?? "").trim(),
    scheduledAtEest: String(row.scheduled_at_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    asset: String(row.asset ?? "").trim(),
    link,
    status: String(row.status ?? "").trim(),
    proofUrl,
    copy,
    pulse: extractPulse(link),
    searchNeedle: extractSearchNeedle({ proofUrl, copy, link }),
  };
}

function needsPublicUrlRecovery(row) {
  const channel = row.channel.toLowerCase();
  const proof = row.proofUrl.toLowerCase();
  return (
    channel.includes("x /") &&
    proof.startsWith("private-x-note:") &&
    (proof.includes("public permalink pending") || !isHttpUrl(row.proofUrl))
  );
}

function extractPulse(link) {
  const match = String(link).match(/utm_content=([^&#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function extractSearchNeedle({ proofUrl, copy, link }) {
  const pulse = extractPulse(link);
  if (pulse) return pulse;
  if (proofUrl.includes(REFERRAL_CODE)) return REFERRAL_CODE;
  const firstLine = copy.split(/\n/).map((line) => line.trim()).find(Boolean);
  return firstLine || REFERRAL_CODE;
}

function buildXSearchUrl(row) {
  const query = `"${row.searchNeedle}" from:${X_HANDLE}`;
  return `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
}

function buildWebSearchUrl(row) {
  const query = `site:x.com/${X_HANDLE}/status "${row.searchNeedle}"`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildUpgradeCommand(row) {
  const selector = row.pulse
    ? `--pulse ${shellQuote(row.pulse)}`
    : `--priority ${shellQuote("REPLACE_WITH_PRIORITY")}`;
  return `node campaign-proof-log.mjs ${selector} --proof-url ${shellQuote("PUBLIC_X_STATUS_URL")} --status ${shellQuote(row.status || "posted")} --force`;
}

function renderText(payload) {
  const lines = [
    `WorldCup26 proof URL recovery ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} pending=${payload.pendingCount} code=${payload.referralCode}`,
    "",
  ];
  if (payload.rows.length === 0) {
    lines.push("No private X proof rows need public URL recovery.", "");
  } else {
    lines.push("pending_public_urls:");
    for (const row of payload.rows) {
      lines.push(`- ${row.timestampEest} ${row.owner} / ${row.channel}`);
      lines.push(`  pulse=${row.pulse || "-"}`);
      lines.push(`  search=${row.xLiveSearchUrl}`);
      lines.push(`  profile=${row.xProfileUrl}`);
      lines.push(`  upgrade_after_verified=${row.upgradeCommand}`);
    }
    lines.push("");
  }
  lines.push(`Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Proof URL Recovery

Generated: ${payload.generatedAtEest}

- Pending private X proof rows: ${payload.pendingCount}
- Referral code: \`${payload.referralCode}\`

${payload.rows.map(renderRowMarkdown).join("\n\n") || "No private X proof rows need public URL recovery."}

## Rule

${payload.rule}
`;
}

function renderRowMarkdown(row) {
  return `## ${row.timestampEest} ${row.owner} / ${row.channel}

- Pulse: \`${row.pulse || "-"}\`
- X profile: ${row.xProfileUrl}
- X live search: ${row.xLiveSearchUrl}
- Web search: ${row.webSearchUrl}

Current proof:

\`\`\`text
${row.proofUrl}
\`\`\`

After the public URL is visible:

\`\`\`bash
${row.upgradeCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Proof URL Recovery</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #09291f; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bfd4ca; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 10% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 90% 4%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(960px, 100%); margin: 0 auto; padding: 12px 10px 48px; }
    header, article, section { border: 1px solid var(--line); border-radius: 8px; background: rgba(9,41,31,.94); }
    header, section { padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(32px, 8vw, 60px); line-height: .94; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 20px; }
    p { margin: 0; color: var(--muted); line-height: 1.42; }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; overflow-wrap: anywhere; }
    .cards { display: grid; gap: 10px; }
    article { padding: 12px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button { min-height: 44px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; padding: 9px; font: inherit; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; overflow-wrap: anywhere; }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    @media (min-width: 780px) { .stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Proof URL Recovery</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="stats">
        <div class="stat"><span>Pending</span><strong>${payload.pendingCount}</strong></div>
        <div class="stat"><span>Code</span><strong>${escapeHtml(payload.referralCode)}</strong></div>
        <div class="stat"><span>Generated</span><strong>${escapeHtml(payload.generatedAtEest)}</strong></div>
      </div>
    </header>
    <section class="cards">${payload.rows.map(renderRowHtml).join("") || "<article><h2>All Clear</h2><p>No private X proof rows need public URL recovery.</p></article>"}</section>
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

function renderRowHtml(row) {
  return `<article>
    <h2>${escapeHtml(row.owner)} / ${escapeHtml(row.channel)}</h2>
    <p>${escapeHtml(row.timestampEest)} / pulse ${escapeHtml(row.pulse || "-")}</p>
    <pre>${escapeHtml(row.proofUrl)}</pre>
    <div class="buttons">
      <a class="button gold" href="${escapeAttr(row.xLiveSearchUrl)}" target="_blank" rel="noreferrer">X Search</a>
      <a class="button" href="${escapeAttr(row.xProfileUrl)}" target="_blank" rel="noreferrer">Profile</a>
      <a class="button" href="${escapeAttr(row.webSearchUrl)}" target="_blank" rel="noreferrer">Web Search</a>
      <button data-copy="${escapeAttr(row.upgradeCommand)}">Copy upgrade command</button>
    </div>
  </article>`;
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
  const parsed = { quiet: false, root: "", now: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
  }
  return parsed;
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

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function shellQuote(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
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
