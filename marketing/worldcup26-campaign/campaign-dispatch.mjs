#!/usr/bin/env node
import { renameSync, writeFileSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];
const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = "https://worldcup26.world/login?ref=26BC4B90CB";

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const postNowPath = path.join(runtimeDir, "post-now.csv");
const statusPath = path.join(runtimeDir, "campaign-status.json");
const pulsePath = path.join(runtimeDir, "nonstop-pulse.json");
const proofLogPath = path.join(runtimeDir, "posting-log-live.csv");
const generatedAt = (args.now ? new Date(args.now) : new Date()).toISOString();
const debugDispatch = process.env.CAMPAIGN_DISPATCH_DEBUG === "1";

if (args.help) {
  printHelp();
  process.exit(0);
}

debug("mkdir runtime");
await mkdir(runtimeDir, { recursive: true });

debug("read post-now");
const rows = await readPostNowRows();
debug("read status");
const status = await readStatus();
debug("read pulse");
const pulse = await readPulse();
debug("read proof rows");
const proofRows = await readProofRows();
const ownerRows = Object.fromEntries(
  WORKERS.map((worker) => [worker, rows.filter((row) => sameWorker(row.owner, worker))]),
);
const pulseOverlay = summarizePulse(pulse, generatedAt, proofRows);
const dispatch = {
  generatedAt,
  referralCode: REFERRAL_CODE,
  referralLink: REFERRAL_LINK,
  liveProof: status?.postingProof ?? null,
  urgentCount: rows.length,
  pulse: pulseOverlay,
  workers: WORKERS.map((worker) => ({
    worker,
    urgentCount: ownerRows[worker].length,
    current: ownerRows[worker][0] ? summarizeDispatchRow(ownerRows[worker][0]) : null,
    currentPulse: pulseOverlay.byWorker[worker]?.current ?? null,
  })),
};
const pulseShareRows = buildPulseShareRows(pulseOverlay);
const proofSprint = buildProofSprint(dispatch, rows);

debug("write dispatch-board.json");
writeOutput(path.join(runtimeDir, "dispatch-board.json"), `${JSON.stringify(dispatch, null, 2)}\n`);
debug("write dispatch-board.md");
writeOutput(path.join(runtimeDir, "dispatch-board.md"), renderDispatchBoard(dispatch, ownerRows, pulseOverlay));
debug("write proof-sprint.json");
writeOutput(path.join(runtimeDir, "proof-sprint.json"), `${JSON.stringify(proofSprint, null, 2)}\n`);
debug("write proof-sprint.md");
writeOutput(path.join(runtimeDir, "proof-sprint.md"), renderProofSprintMarkdown(proofSprint));
debug("write proof-sprint.html");
writeOutput(path.join(runtimeDir, "proof-sprint.html"), renderProofSprintHtml(proofSprint));
debug("write pulse-share-links.csv");
writeOutput(path.join(runtimeDir, "pulse-share-links.csv"), renderPulseShareLinksCsv(pulseShareRows));
debug("write proof-handoff.html");
writeOutput(path.join(runtimeDir, "proof-handoff.html"), renderProofHandoff(dispatch, rows));
debug("write pulse-command-center.html");
writeOutput(
  path.join(runtimeDir, "pulse-command-center.html"),
  renderPulseCommandCenter(dispatch, pulseShareRows),
);

for (const worker of WORKERS) {
  debug(`write worker-inbox-${worker.toLowerCase()}.md`);
  writeOutput(
    path.join(runtimeDir, `worker-inbox-${worker.toLowerCase()}.md`),
    renderWorkerInbox(worker, ownerRows[worker], pulseOverlay.byWorker[worker]),
  );
}

if (!args.quiet) {
  debug("write console");
  await new Promise((resolve) => {
    process.stdout.write(renderConsole(dispatch), resolve);
  });
}

debug("exit");
process.exit(0);

function debug(message) {
  if (debugDispatch) {
    process.stderr.write(`[campaign-dispatch] ${message}\n`);
  }
}

function writeOutput(filePath, content) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  writeFileSync(tempPath, content);
  renameSync(tempPath, filePath);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") result.help = true;
    else if (arg === "--quiet") result.quiet = true;
    else if (arg === "--root") result.root = argv[++index];
    else if (arg === "--now") result.now = argv[++index];
  }
  return result;
}

function printHelp() {
  process.stdout.write(`WorldCup26 campaign dispatch

Usage:
  node campaign-dispatch.mjs
  node campaign-dispatch.mjs --root /path/to/campaign

Reads runtime/post-now.csv and writes:
  runtime/dispatch-board.md
  runtime/dispatch-board.json
  runtime/worker-inbox-dexter.md
  runtime/worker-inbox-sienna.md
  runtime/worker-inbox-memo.md
  runtime/worker-inbox-nano.md
  runtime/proof-handoff.html
  runtime/pulse-share-links.csv
  runtime/pulse-command-center.html
`);
}

async function readPostNowRows() {
  try {
    return parseCsv(await readFile(postNowPath, "utf8"))
      .filter((row) => String(row.priority ?? "").trim())
      .sort((left, right) => Number(left.priority) - Number(right.priority));
  } catch {
    return [];
  }
}

async function readStatus() {
  try {
    return JSON.parse(await readFile(statusPath, "utf8"));
  } catch {
    return null;
  }
}

async function readPulse() {
  try {
    return JSON.parse(await readFile(pulsePath, "utf8"));
  } catch {
    return null;
  }
}

async function readProofRows() {
  try {
    return parseCsv(await readFile(proofLogPath, "utf8"));
  } catch {
    return [];
  }
}

function renderDispatchBoard(dispatch, groupedRows, pulseOverlay) {
  return `# WorldCup26 Worker Dispatch Board

Generated: ${dispatch.generatedAt}

Referral code: \`${dispatch.referralCode}\`
Referral link: ${dispatch.referralLink}

Live proof rows: ${dispatch.liveProof?.loggedCount ?? 0}
Urgent rows still needing proof: ${dispatch.urgentCount}

## Worker Current Orders

${WORKERS.map((worker) => renderWorkerSummary(worker, groupedRows[worker])).join("\n\n")}

## Non-Stop Pulse Overlay

Pulse generated: ${pulseOverlay.generatedAt ?? "not generated yet"}
Pulse actions available: ${pulseOverlay.totalCount}
Pulse actions already proofed: ${pulseOverlay.proofedCount ?? 0}
Pulse command center: \`runtime/pulse-command-center.html\`
Phone proof handoff: \`runtime/proof-handoff.html\`

These are the next live cadence actions. They keep every worker moving between formal queue rows. They do not close the urgent proof queue by themselves.

${WORKERS.map((worker) => renderWorkerPulseSummary(worker, pulseOverlay.byWorker[worker])).join("\n\n")}

## Rule For This Board

Post from owned accounts or places where the invite is welcome. After the real post, story, reply, or private outreach batch is done, run the proof command from that worker inbox so the monitor stops counting it as unproven.
`;
}

function renderWorkerSummary(worker, rows) {
  const first = rows[0];
  if (!first) {
    return `### ${worker}\n\nNo urgent row is assigned right now. Keep monitoring \`runtime/next-actions-${worker.toLowerCase()}.md\`.`;
  }
  const privateProofCommand = proofCommand(first, proofNoteExample(first));

  return `### ${worker}

- Priority: ${first.priority}
- Channel: ${first.channel}
- Action: ${first.action}
- Asset: \`${first.asset}\`
- Link: ${first.tracked_link}
- Inbox: \`runtime/worker-inbox-${worker.toLowerCase()}.md\`
- Private proof command template: \`${privateProofCommand}\``;
}

function renderWorkerPulseSummary(worker, pulseGroup) {
  const current = pulseGroup?.current;
  if (!current) {
    return `### ${worker}\n\nNo pulse action is available yet. Run \`node campaign-pulse.mjs --window-hours 72 --interval-minutes 15\`.`;
  }

  return `### ${worker}

- Pulse: ${current.pulse}
- Scheduled: ${current.scheduledAtEest}
- Channel: ${current.channel}
- Action: ${current.action}
- Asset: \`${current.asset}\`
- Link: ${current.trackedLink}`;
}

function renderWorkerInbox(worker, rows, pulseGroup) {
  const current = rows[0];
  return `# ${worker} Live Posting Inbox

Generated: ${generatedAt}

Goal: push WorldCup26 for the next 72 hours.

Referral code: \`${REFERRAL_CODE}\`
Referral link: ${REFERRAL_LINK}

${current ? renderCurrentOrder(current) : renderNoOrder(worker)}

${renderPulseOrder(worker, pulseGroup)}

${rows.length > 1 ? `## Backup Urgent Rows\n\n${rows.slice(1).map(renderBackupRow).join("\n\n")}` : ""}

## After Posting

Use the formal proof command only after the urgent queue action really happened. Use a public post URL when one exists. For private WhatsApp, Telegram, Discord, or DM batches, use a clear note such as \`private-whatsapp: 12 warm contacts, 2 replies\`.

Pulse actions are the non-stop cadence. If a pulse action is the same real post as the current urgent row, use the urgent proof command above. If it is an extra post, keep its public URL or private note ready for Memo's next proof audit; do not pretend it closes a priority row.
`;
}

function renderCurrentOrder(row) {
  return `## Current Order

- Priority: ${row.priority}
- Scheduled: ${row.scheduled_at_eest}
- Channel: ${row.channel}
- Mode: ${row.mode}
- Action: ${row.action}
- Asset: \`${row.asset}\`
- Tracked link: ${row.tracked_link}

## Post Copy

\`\`\`text
${row.primary_copy}
\`\`\`

${row.first_comment ? `## First Comment / Follow-Up\n\n\`\`\`text\n${row.first_comment}\n\`\`\`\n` : ""}
## Share Links

- WhatsApp: ${row.whatsapp_share_url}
- Telegram: ${row.telegram_share_url}
- X: ${row.x_share_url}
- Facebook: ${row.facebook_share_url}

## Private Proof Command Template

\`\`\`bash
${proofCommand(row, proofNoteExample(row))}
\`\`\``;
}

function renderBackupRow(row) {
  return `- ${row.priority}. ${row.channel} / ${row.action}
  - Asset: \`${row.asset}\`
  - Link: ${row.tracked_link}
  - Private proof template: \`${proofCommand(row, proofNoteExample(row))}\``;
}

function renderNoOrder(worker) {
  return `## Current Order

No urgent proof-missing row is assigned to ${worker} right now.

Check:

\`\`\`bash
sed -n '1,140p' runtime/next-actions-${worker.toLowerCase()}.md
\`\`\``;
}

function renderPulseOrder(worker, pulseGroup) {
  const current = pulseGroup?.current;
  if (!current) {
    return `## Current 15-Minute Pulse

No pulse action is available for ${worker} yet. Run:

\`\`\`bash
node campaign-pulse.mjs --window-hours 72 --interval-minutes 15
\`\`\``;
  }

  const nextRows = (pulseGroup?.next ?? []).filter((row) => row.pulse !== current.pulse).slice(0, 3);
  return `## Current 15-Minute Pulse

- Pulse: ${current.pulse}
- Scheduled: ${current.scheduledAtEest}
- Lane: ${current.lane}
- Channel: ${current.channel}
- Mode: ${current.mode}
- Action: ${current.action}
- Asset: \`${current.asset}\`
- Tracked link: ${current.trackedLink}
- Proof hint: ${current.proofHint}

## Pulse Copy

\`\`\`text
${current.primaryCopy}
\`\`\`

${nextRows.length ? `## Next Pulse Backups\n\n${nextRows.map(renderPulseBackupRow).join("\n")}` : ""}`;
}

function renderPulseBackupRow(row) {
  return `- ${row.scheduledAtEest}: ${row.channel} - ${row.action}`;
}

function buildPulseShareRows(pulseOverlay) {
  const seen = new Set();
  return WORKERS.flatMap((worker) =>
    (pulseOverlay.byWorker[worker]?.next ?? []).map((row) => ({ ...row, owner: row.owner || worker })),
  )
    .sort(comparePulseRows)
    .filter((row) => {
      const key = String(row.pulse ?? `${row.owner}-${row.scheduledAtEest}-${row.channel}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 24);
}

function renderProofHandoff(dispatch, urgentRows) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Proof Handoff</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #001812;
      --panel: #07271f;
      --line: rgba(255, 255, 255, 0.14);
      --gold: #ffd36a;
      --mint: #70f0b3;
      --text: #f7fff9;
      --muted: #b9cec4;
      --warn: #ffb370;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 0 0, rgba(255, 211, 106, 0.18), transparent 30rem),
        radial-gradient(circle at 90% 12%, rgba(112, 240, 179, 0.12), transparent 28rem),
        var(--bg);
    }
    main { width: min(920px, 100%); margin: 0 auto; padding: 20px 12px 44px; }
    header, .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(7, 39, 31, 0.96), rgba(11, 53, 42, 0.9));
      box-shadow: 0 22px 70px rgba(0, 0, 0, 0.24);
    }
    header { display: grid; gap: 14px; padding: 18px; }
    h1 { margin: 0; font-size: clamp(1.7rem, 8vw, 3.2rem); line-height: 0.98; letter-spacing: 0; }
    h2, h3, p { margin: 0; }
    p { color: var(--muted); line-height: 1.45; }
    .metrics { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); }
    .metric { border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: rgba(255,255,255,0.05); }
    .metric span { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 900; text-transform: uppercase; }
    .metric strong { display: block; margin-top: 3px; color: var(--gold); overflow-wrap: anywhere; }
    .cards { display: grid; gap: 14px; margin-top: 16px; }
    .card { display: grid; gap: 12px; padding: 16px; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .tag { padding: 5px 9px; border-radius: 999px; background: var(--gold); color: #062318; font-weight: 900; font-size: 0.73rem; white-space: nowrap; }
    .tag.warn { background: var(--warn); }
    .copy, pre {
      margin: 0;
      padding: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      border-radius: 8px;
      color: var(--text);
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid var(--line);
      font: 0.9rem/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    button, a.action {
      appearance: none;
      min-height: 42px;
      border: 1px solid rgba(112, 240, 179, 0.48);
      border-radius: 8px;
      background: #0f7657;
      color: white;
      padding: 9px 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      text-decoration: none;
      cursor: pointer;
    }
    button.secondary, a.secondary { background: rgba(255, 255, 255, 0.06); color: var(--mint); }
    .blocked { color: var(--warn); font-weight: 900; }
    .asset { color: var(--gold); overflow-wrap: anywhere; font-weight: 800; }
    .media-card {
      display: grid;
      gap: 10px;
      padding: 10px;
      border: 1px solid rgba(255, 211, 106, 0.24);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.18);
    }
    .media-card video,
    .media-card img {
      display: block;
      width: 100%;
      max-height: 320px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: rgba(0, 0, 0, 0.25);
      object-fit: contain;
    }
    .media-card__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
    }
    .footer { margin-top: 16px; font-size: 0.9rem; }
    @media (max-width: 640px) {
      .head { display: grid; }
      button, a.action { width: 100%; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>WorldCup26 Proof Handoff</h1>
        <p>Use this from the phone or account that owns WhatsApp, Instagram/Facebook, Telegram, or community groups. Post first, then copy the exact proof command or private note. Do not run proof commands until the post, status, DM, or approval request actually happened.</p>
      </div>
      <div class="metrics">
        <div class="metric"><span>Generated</span><strong>${escapeHtml(formatDisplayTime(dispatch.generatedAt))}</strong></div>
        <div class="metric"><span>Referral code</span><strong>${escapeHtml(dispatch.referralCode)}</strong></div>
        <div class="metric"><span>Live proof rows</span><strong>${escapeHtml(dispatch.liveProof?.loggedCount ?? 0)}</strong></div>
        <div class="metric"><span>Urgent unproven</span><strong>${escapeHtml(urgentRows.length)}</strong></div>
      </div>
      <div class="actions">
        <button data-copy="${escapeAttr(REFERRAL_LINK)}">Copy referral link</button>
        <button class="secondary" data-copy="${escapeAttr(`Code: ${REFERRAL_CODE}\n${REFERRAL_LINK}`)}">Copy code + link</button>
        <a class="action secondary" href="pulse-command-center.html">Pulse center</a>
        <a class="action secondary" href="share-command-center.html">Urgent center</a>
      </div>
    </header>

    <section class="cards" aria-label="Urgent proof handoff rows">
      ${urgentRows.length ? urgentRows.map(renderProofHandoffCard).join("\n") : '<article class="card"><p>No urgent proof rows are open right now.</p></article>'}
    </section>

    <p class="footer">Browser channel audit: Facebook sharer was not logged in; WhatsApp Web and Telegram Web showed QR login screens. These rows need the owning phone/account or a public URL from the actual destination.</p>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      try {
        await navigator.clipboard.writeText(button.getAttribute("data-copy"));
        const previous = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = previous; }, 1200);
      } catch {
        window.prompt("Copy this text", button.getAttribute("data-copy"));
      }
    });
  </script>
</body>
</html>
`;
}

function buildProofSprint(dispatch, urgentRows) {
  const byWorker = Object.fromEntries(WORKERS.map((worker) => [worker, []]));
  for (const row of urgentRows) {
    const owner = WORKERS.find((worker) => sameWorker(row.owner, worker)) ?? "Memo";
    byWorker[owner].push(row);
  }

  const rows = urgentRows.map((row) => ({
    priority: row.priority,
    owner: row.owner,
    channel: row.channel,
    mode: row.mode,
    action: row.action,
    asset: row.asset,
    scheduledAtEest: row.scheduled_at_eest,
    ageHours: ageHoursSince(row.scheduled_at_eest),
    ageLabel: ageLabel(row.scheduled_at_eest),
    trackedLink: row.tracked_link,
    status: suggestStatus(row),
    proofNote: proofNoteExample(row),
    proofCommand: proofCommand(row, proofNoteExample(row)),
    privateProofCommand: proofCommand(row, proofNoteExample(row)),
  }));

  return {
    generatedAt,
    referralCode: dispatch.referralCode,
    referralLink: dispatch.referralLink,
    liveProofRows: dispatch.liveProof?.loggedCount ?? 0,
    urgentProofGaps: rows.length,
    workerFocus: WORKERS.map((worker) => {
      const focus = byWorker[worker][0] ?? null;
      const oldest = oldestRow(byWorker[worker]);
      return {
        worker,
        openRows: byWorker[worker].length,
        priority: focus?.priority ?? null,
        channel: focus?.channel ?? null,
        status: focus ? suggestStatus(focus) : "monitor",
        oldestAgeLabel: oldest ? ageLabel(oldest.scheduled_at_eest) : null,
        escalation: escalationLevel(oldest),
        command: focus ? proofCommand(focus, proofNoteExample(focus)) : null,
      };
    }),
    escalationBoard: WORKERS.map((worker) => {
      const workerRows = byWorker[worker];
      const focus = workerRows[0] ?? null;
      const oldest = oldestRow(workerRows);
      return {
        worker,
        openRows: workerRows.length,
        escalation: escalationLevel(oldest),
        oldestScheduledAtEest: oldest?.scheduled_at_eest ?? null,
        oldestAgeLabel: oldest ? ageLabel(oldest.scheduled_at_eest) : null,
        nextPriority: focus?.priority ?? null,
        nextChannel: focus?.channel ?? null,
        nextCommand: focus ? proofCommand(focus, proofNoteExample(focus)) : null,
      };
    }),
    rows,
  };
}

function renderProofSprintMarkdown(sprint) {
  return `# WorldCup26 Proof Sprint

Generated: ${sprint.generatedAt}
Referral code: \`${sprint.referralCode}\`
Referral link: ${sprint.referralLink}

Live proof rows: ${sprint.liveProofRows}
Urgent proof gaps: ${sprint.urgentProofGaps}

This is the short execution sheet. Do the real action first. Then run the matching proof command with a public URL or a precise private note.

## Escalation Board

${sprint.escalationBoard.map(renderProofEscalationRow).join("\n")}

## Worker Focus

${sprint.workerFocus.map(renderProofSprintWorker).join("\n")}

## All Open Proof Gaps

${sprint.rows.map(renderProofSprintRow).join("\n\n")}
`;
}

function renderProofSprintWorker(row) {
  if (!row.priority) {
    return `- ${row.worker}: no urgent proof row. Keep pulse/audit moving.`;
  }
  return `- ${row.worker}: priority ${row.priority} / ${row.channel} / status ${row.status} / oldest ${row.oldestAgeLabel}`;
}

function renderProofEscalationRow(row) {
  if (!row.openRows) {
    return `- ${row.worker}: clear. Keep monitoring pulse actions and replies.`;
  }
  return `- ${row.worker}: ${row.openRows} open / ${row.escalation} / oldest ${row.oldestAgeLabel} / next #${row.nextPriority} ${row.nextChannel}\n  - Command: \`${row.nextCommand}\``;
}

function renderProofSprintRow(row) {
  return `### ${row.priority}. ${row.owner} - ${row.channel}

- Status to log: \`${row.status}\`
- Action: ${row.action}
- Asset: \`${row.asset}\`
- Link: ${row.trackedLink}
- Proof note template: ${row.proofNote}

\`\`\`bash
${row.privateProofCommand}
\`\`\``;
}

function renderProofSprintHtml(sprint) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Proof Sprint</title>
  <style>
    :root { color-scheme: dark; --bg:#03140f; --panel:#0b2b21; --line:rgba(255,255,255,.14); --text:#f7fff9; --muted:#b8cec5; --gold:#ffd974; --mint:#74f0b2; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at 0 0, rgba(255,217,116,.16), transparent 24rem), var(--bg); color:var(--text); }
    main { width:min(900px,100%); margin:0 auto; padding:14px 10px 44px; }
    header, section, article { border:1px solid var(--line); border-radius:10px; background:rgba(11,43,33,.94); padding:14px; margin-bottom:10px; }
    h1,h2,h3,p { margin:0; }
    h1 { font-size:clamp(30px,9vw,54px); line-height:.96; letter-spacing:0; }
    h2 { font-size:20px; margin-bottom:10px; }
    h3 { font-size:17px; margin-bottom:8px; }
    p, li { color:var(--muted); line-height:1.4; }
    .metrics,.focus { display:grid; gap:8px; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); margin-top:12px; }
    .metric,.focus-card { border:1px solid var(--line); border-radius:8px; padding:10px; background:rgba(255,255,255,.055); }
    .metric span,.focus-card span,.label { display:block; color:var(--muted); font-size:11px; font-weight:900; text-transform:uppercase; }
    .metric strong,.focus-card strong { display:block; color:var(--gold); margin-top:4px; overflow-wrap:anywhere; }
    .rows { display:grid; gap:10px; }
    .row-head { display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
    .tag { background:var(--gold); color:#03140f; border-radius:999px; padding:5px 8px; font-weight:950; font-size:12px; white-space:nowrap; }
    .command { white-space:pre-wrap; overflow-wrap:anywhere; margin-top:10px; border:1px solid var(--line); border-radius:8px; background:#02110d; color:var(--gold); padding:10px; font:12px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
    button { min-height:42px; margin-top:8px; border:1px solid rgba(116,240,178,.42); border-radius:8px; background:#0f7657; color:white; padding:9px 11px; font:inherit; font-weight:900; cursor:pointer; }
    a { color:var(--mint); overflow-wrap:anywhere; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Proof Sprint</h1>
      <p>Do the real action first. Then copy the matching proof command with a public URL or precise private note.</p>
      <div class="metrics">
        <div class="metric"><span>Generated</span><strong>${escapeHtml(formatDisplayTime(sprint.generatedAt))}</strong></div>
        <div class="metric"><span>Proof rows</span><strong>${escapeHtml(sprint.liveProofRows)}</strong></div>
        <div class="metric"><span>Open gaps</span><strong>${escapeHtml(sprint.urgentProofGaps)}</strong></div>
        <div class="metric"><span>Code</span><strong>${escapeHtml(sprint.referralCode)}</strong></div>
      </div>
    </header>
    <section>
      <h2>Escalation Board</h2>
      <div class="focus">${sprint.escalationBoard.map(renderProofEscalationHtml).join("")}</div>
    </section>
    <section>
      <h2>Worker Focus</h2>
      <div class="focus">${sprint.workerFocus.map(renderProofSprintWorkerHtml).join("")}</div>
    </section>
    <section>
      <h2>All Open Proof Gaps</h2>
      <div class="rows">${sprint.rows.map(renderProofSprintRowHtml).join("")}</div>
    </section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const value = button.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(value);
        const previous = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = previous; }, 1200);
      } catch {
        window.prompt("Copy this text", value);
      }
    });
  </script>
</body>
</html>`;
}

function renderProofSprintWorkerHtml(row) {
  return `<div class="focus-card"><span>${escapeHtml(row.worker)}</span><strong>${row.priority ? `#${escapeHtml(row.priority)} ${escapeHtml(row.channel)}` : "Pulse / audit"}</strong><p>${escapeHtml(row.status)}${row.oldestAgeLabel ? ` / oldest ${escapeHtml(row.oldestAgeLabel)}` : ""}</p></div>`;
}

function renderProofEscalationHtml(row) {
  return `<div class="focus-card">
    <span>${escapeHtml(row.worker)} / ${escapeHtml(row.escalation)}</span>
    <strong>${row.openRows ? `${escapeHtml(row.openRows)} open` : "Clear"}</strong>
    <p>${row.openRows ? `Oldest ${escapeHtml(row.oldestAgeLabel)} / next #${escapeHtml(row.nextPriority)} ${escapeHtml(row.nextChannel)}` : "Keep pulse and reply monitoring moving."}</p>
    ${row.nextCommand ? `<button data-copy="${escapeAttr(row.nextCommand)}">Copy next command</button>` : ""}
  </div>`;
}

function renderProofSprintRowHtml(row) {
  return `<article>
    <div class="row-head">
      <div>
        <h3>${escapeHtml(row.priority)}. ${escapeHtml(row.owner)} - ${escapeHtml(row.channel)}</h3>
        <p>${escapeHtml(row.action)}</p>
      </div>
      <span class="tag">${escapeHtml(row.status)}</span>
    </div>
    <p><span class="label">Asset</span>${escapeHtml(row.asset)}</p>
    <p><span class="label">Link</span><a href="${escapeAttr(row.trackedLink)}">${escapeHtml(row.trackedLink)}</a></p>
    <p><span class="label">Proof note</span>${escapeHtml(row.proofNote)}</p>
    <div class="command">${escapeHtml(row.privateProofCommand)}</div>
    <button data-copy="${escapeAttr(row.privateProofCommand)}">Copy proof command</button>
  </article>`;
}

function renderProofHandoffCard(row) {
  const privateNote = proofNoteExample(row);
  const postText = String(row.primary_copy ?? "");
  const link = row.tracked_link ?? REFERRAL_LINK;
  const combined = postText.includes(link) ? postText : `${postText}\n\n${link}`.trim();
  return `<article class="card">
  <div class="head">
    <div>
      <h2>${escapeHtml(row.priority)}. ${escapeHtml(row.owner)} - ${escapeHtml(row.channel)}</h2>
      <p>${escapeHtml(row.scheduled_at_eest)} / ${escapeHtml(row.mode)} / <span class="asset">${escapeHtml(row.asset)}</span></p>
    </div>
    <span class="tag ${String(row.mode ?? "").includes("approval") ? "warn" : ""}">${escapeHtml(row.mode)}</span>
  </div>
  <p>${escapeHtml(row.action)}</p>
  ${renderAssetPreview(row.asset)}
  <pre>${escapeHtml(postText)}</pre>
  <p>Tracked link: <a class="asset" href="${escapeAttr(link)}" target="_blank" rel="noreferrer">${escapeHtml(link)}</a></p>
  <div class="actions">
    <button data-copy="${escapeAttr(combined)}">Copy post</button>
    <button class="secondary" data-copy="${escapeAttr(link)}">Copy link</button>
    <a class="action secondary" href="${escapeAttr(row.whatsapp_share_url)}" target="_blank" rel="noreferrer">WhatsApp</a>
    <a class="action secondary" href="${escapeAttr(row.telegram_share_url)}" target="_blank" rel="noreferrer">Telegram</a>
    <a class="action secondary" href="${escapeAttr(row.x_share_url)}" target="_blank" rel="noreferrer">X</a>
    <a class="action secondary" href="${escapeAttr(row.facebook_share_url)}" target="_blank" rel="noreferrer">Facebook</a>
  </div>
  <h3>After real posting</h3>
  <p>Public proof: after the post is live, paste the real public URL into the proof logger. The placeholder guard rejects empty or fake URLs.</p>
  <p>Private proof command template:</p>
  <div class="copy">${escapeHtml(proofCommand(row, privateNote))}</div>
  <button class="secondary" data-copy="${escapeAttr(proofCommand(row, privateNote))}">Copy private proof command</button>
  <p class="blocked">Do not run proof commands until the post, status, DM, or approval request actually happened.</p>
</article>`;
}

function renderPulseCommandCenter(dispatch, pulseRows) {
  const currentByWorker = Object.fromEntries(
    WORKERS.map((worker) => [worker, dispatch.pulse?.byWorker?.[worker]?.current ?? null]),
  );
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Pulse Command Center</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #001812;
      --panel: #07271f;
      --panel-strong: #0b352a;
      --gold: #ffd36a;
      --mint: #70f0b3;
      --text: #f7fff9;
      --muted: #b9cec4;
      --line: rgba(255, 255, 255, 0.14);
      --danger: #ff9a76;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at 18% 0%, rgba(255, 211, 106, 0.18), transparent 34rem),
        radial-gradient(circle at 92% 16%, rgba(112, 240, 179, 0.14), transparent 30rem),
        var(--bg);
    }
    main { width: min(1180px, 100%); margin: 0 auto; padding: 28px 14px 48px; }
    header, .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(7, 39, 31, 0.96), rgba(11, 53, 42, 0.9));
      box-shadow: 0 22px 80px rgba(0, 0, 0, 0.24);
    }
    header { display: grid; gap: 16px; padding: 20px; }
    h1 { margin: 0; font-size: clamp(1.7rem, 5vw, 3.3rem); line-height: 0.98; letter-spacing: 0; }
    h2, h3, p { margin: 0; }
    p { color: var(--muted); line-height: 1.45; }
    .hero-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.05);
    }
    .metric span { display: block; color: var(--muted); font-size: 0.76rem; font-weight: 900; text-transform: uppercase; }
    .metric strong { display: block; margin-top: 4px; color: var(--gold); font-size: 1.18rem; overflow-wrap: anywhere; }
    .section-title { margin: 22px 0 0; color: var(--gold); font-size: 1rem; text-transform: uppercase; letter-spacing: 0; }
    .cards { display: grid; gap: 14px; margin-top: 16px; }
    .worker-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); margin-top: 16px; }
    .card { display: grid; gap: 12px; padding: 16px; }
    .card.current {
      border-color: rgba(255, 211, 106, 0.46);
      background:
        linear-gradient(135deg, rgba(255, 211, 106, 0.15), rgba(112, 240, 179, 0.07)),
        rgba(7, 39, 31, 0.94);
    }
    .card.internal { border-color: rgba(255, 255, 255, 0.2); }
    .card-head { display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; }
    .card h2 { font-size: 1.05rem; line-height: 1.2; }
    .tag {
      color: #022015;
      background: var(--gold);
      border-radius: 999px;
      padding: 5px 9px;
      font-size: 0.74rem;
      font-weight: 900;
      white-space: nowrap;
    }
    .tag.mint { background: var(--mint); }
    .tag.danger { background: var(--danger); }
    pre {
      margin: 0;
      padding: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      border-radius: 8px;
      color: var(--text);
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid var(--line);
      font: 0.92rem/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    button, a.action {
      appearance: none;
      border: 1px solid rgba(112, 240, 179, 0.46);
      border-radius: 8px;
      background: #0f7657;
      color: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
      padding: 9px 12px;
      font-weight: 900;
      text-decoration: none;
    }
    a.action.secondary, button.secondary { background: rgba(255, 255, 255, 0.06); color: var(--mint); }
    .asset { color: var(--gold); font-weight: 800; overflow-wrap: anywhere; }
    .note { color: var(--muted); font-size: 0.9rem; }
    .media-card {
      display: grid;
      gap: 10px;
      padding: 10px;
      border: 1px solid rgba(255, 211, 106, 0.24);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.18);
    }
    .media-card video,
    .media-card img {
      display: block;
      width: 100%;
      max-height: 320px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: rgba(0, 0, 0, 0.25);
      object-fit: contain;
    }
    .media-card__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
    }
    .footer { margin-top: 20px; color: var(--muted); font-size: 0.9rem; }
    @media (max-width: 640px) {
      .card-head { display: grid; }
      button, a.action { width: 100%; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>WorldCup26 Pulse Command Center</h1>
        <p>Referral code <strong>${escapeHtml(dispatch.referralCode)}</strong>. Copy, share, then keep real proof for Memo. Pulse actions do not close urgent rows by themselves.</p>
      </div>
      <div class="hero-grid">
        <div class="metric"><span>Generated</span><strong>${escapeHtml(formatDisplayTime(dispatch.generatedAt))}</strong></div>
        <div class="metric"><span>Pulse board</span><strong>${escapeHtml(formatDisplayTime(dispatch.pulse?.generatedAt ?? ""))}</strong></div>
        <div class="metric"><span>Total pulses</span><strong>${escapeHtml(dispatch.pulse?.totalCount ?? 0)}</strong></div>
        <div class="metric"><span>Proofed pulses</span><strong>${escapeHtml(dispatch.pulse?.proofedCount ?? 0)}</strong></div>
        <div class="metric"><span>Current workers</span><strong>${WORKERS.filter((worker) => currentByWorker[worker]).length}/4</strong></div>
        <div class="metric"><span>Urgent rows</span><strong>${escapeHtml(dispatch.urgentCount)}</strong></div>
      </div>
      <div class="actions">
        <button data-copy="${escapeAttr(REFERRAL_LINK)}">Copy referral link</button>
        <button class="secondary" data-copy="${escapeAttr(`Code: ${REFERRAL_CODE}\n${REFERRAL_LINK}`)}">Copy code + link</button>
        <a class="action secondary" href="share-command-center.html">Urgent command center</a>
        <a class="action secondary" href="dispatch-board.md">Dispatch board</a>
      </div>
    </header>

    <h2 class="section-title">Current Worker Pulses</h2>
    <section class="worker-grid" aria-label="Current worker pulses">
      ${WORKERS.map((worker) => renderCurrentPulseCard(worker, currentByWorker[worker])).join("\n")}
    </section>

    <h2 class="section-title">Next Pulse Share Cards</h2>
    <section class="cards" aria-label="Next pulse share cards">
      ${pulseRows.length ? pulseRows.map(renderPulseShareCard).join("\n") : '<article class="card"><p>No pulse rows are available yet.</p></article>'}
    </section>

    <p class="footer">This page prepares pulse actions only. After a real post, story, reply, or private outreach batch happens, keep the public URL or a clear private-channel note. If it matches an urgent priority row, use that row's proof command from the worker inbox.</p>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      try {
        await navigator.clipboard.writeText(button.getAttribute("data-copy"));
        const previous = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = previous; }, 1200);
      } catch {
        window.prompt("Copy this text", button.getAttribute("data-copy"));
      }
    });
  </script>
</body>
</html>
`;
}

function renderCurrentPulseCard(worker, row) {
  if (!row) {
    return `<article class="card"><div class="card-head"><h2>${escapeHtml(worker)}</h2><span class="tag danger">missing</span></div><p>No current pulse row. Regenerate <code>runtime/nonstop-pulse.json</code>.</p></article>`;
  }
  return renderPulseShareCard(row, { compact: true, currentWorker: worker });
}

function renderPulseShareCard(row, options = {}) {
  const compact = Boolean(options.compact);
  const internal = isInternalPulse(row);
  const postText = String(row.primaryCopy ?? "");
  const trackedLink = row.trackedLink ?? REFERRAL_LINK;
  const combined = postText.includes(trackedLink) ? postText : `${postText}\n\n${trackedLink}`.trim();
  const titlePrefix = compact ? escapeHtml(options.currentWorker ?? row.owner) : `${escapeHtml(row.pulse)}. ${escapeHtml(row.owner)}`;
  return `<article class="card ${compact ? "current" : ""} ${internal ? "internal" : ""}">
  <div class="card-head">
    <div>
      <h2>${titlePrefix} - ${escapeHtml(row.channel)}</h2>
      <p>${escapeHtml(row.scheduledAtEest)} / ${escapeHtml(row.mode)} / <span class="asset">${escapeHtml(row.asset)}</span></p>
    </div>
    <span class="tag ${internal ? "mint" : ""}">${internal ? "internal" : "share"}</span>
  </div>
  <p>${escapeHtml(row.action)}</p>
  ${renderAssetPreview(row.asset)}
  <pre>${escapeHtml(postText)}</pre>
  <p>Tracked link: <a class="asset" href="${escapeAttr(trackedLink)}" target="_blank" rel="noreferrer">${escapeHtml(trackedLink)}</a></p>
  <p class="note">Proof hint: ${escapeHtml(row.proofHint ?? "public-url-or-private-note")}. Pulse evidence waits for Memo unless this is the same action as an urgent priority row.</p>
  <div class="actions">
    <button data-copy="${escapeAttr(combined)}">Copy pulse</button>
    <button class="secondary" data-copy="${escapeAttr(trackedLink)}">Copy link</button>
    ${internal ? "" : renderPulsePlatformLinks(row, postText)}
  </div>
</article>`;
}

function renderPulsePlatformLinks(row, postText) {
  const trackedLink = row.trackedLink ?? REFERRAL_LINK;
  return `<a class="action secondary" href="${shareUrl("whatsapp", postText, trackedLink)}" target="_blank" rel="noreferrer">WhatsApp</a>
    <a class="action secondary" href="${shareUrl("telegram", postText, trackedLink)}" target="_blank" rel="noreferrer">Telegram</a>
    <a class="action secondary" href="${shareUrl("x", postText, trackedLink)}" target="_blank" rel="noreferrer">X</a>
    <a class="action secondary" href="${shareUrl("facebook", postText, trackedLink)}" target="_blank" rel="noreferrer">Facebook</a>`;
}

function renderAssetPreview(assetValue) {
  const asset = String(assetValue ?? "").trim();
  const href = assetRuntimeHref(asset);
  if (!href) return "";

  const extension = asset.split("?")[0].toLowerCase().split(".").pop() ?? "";
  const label = escapeHtml(asset);
  const escapedHref = escapeAttr(href);
  const media =
    extension === "mp4" || extension === "mov" || extension === "webm"
      ? `<video controls preload="metadata" src="${escapedHref}"></video>`
      : ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
        ? `<img src="${escapedHref}" alt="${label}" loading="lazy" />`
        : "";

  return `<div class="media-card">
  ${media}
  <div class="media-card__meta">
    <span class="asset">${label}</span>
    <a class="action secondary" href="${escapedHref}" download>Open / download asset</a>
  </div>
</div>`;
}

function assetRuntimeHref(asset) {
  if (!asset || asset.startsWith("http://") || asset.startsWith("https://")) return "";
  if (asset.startsWith("media/")) return `../${asset}`;
  if (asset.startsWith("assets/")) return `../${asset}`;
  if (asset.startsWith("campaign/")) return `../${asset.slice("campaign/".length)}`;
  if (asset.startsWith("runtime/")) return asset.slice("runtime/".length);
  if (asset.includes("/")) return "";
  return `../${asset}`;
}

function renderPulseShareLinksCsv(rows) {
  const header = [
    "pulse",
    "scheduled_at_eest",
    "owner",
    "channel",
    "mode",
    "action",
    "asset",
    "tracked_link",
    "primary_copy",
    "proof_hint",
    "whatsapp_share_url",
    "telegram_share_url",
    "x_share_url",
    "facebook_share_url",
    "proof_instruction",
  ];
  return `${header.join(",")}\n${rows.map((row) => header.map((key) => csvEscape(toPulseShareCsvRow(row)[key])).join(",")).join("\n")}\n`;
}

function toPulseShareCsvRow(row) {
  const internal = isInternalPulse(row);
  const text = String(row.primaryCopy ?? "");
  const link = row.trackedLink ?? REFERRAL_LINK;
  return {
    pulse: row.pulse,
    scheduled_at_eest: row.scheduledAtEest,
    owner: row.owner,
    channel: row.channel,
    mode: row.mode,
    action: row.action,
    asset: row.asset,
    tracked_link: link,
    primary_copy: text,
    proof_hint: row.proofHint,
    whatsapp_share_url: internal ? "" : shareUrl("whatsapp", text, link),
    telegram_share_url: internal ? "" : shareUrl("telegram", text, link),
    x_share_url: internal ? "" : shareUrl("x", text, link),
    facebook_share_url: internal ? "" : shareUrl("facebook", text, link),
    proof_instruction:
      row.proofInstruction ??
      "If this pulse matches an urgent priority row, use that row's proof command. Otherwise keep public URL or private note for Memo.",
  };
}

function isInternalPulse(row) {
  const mode = String(row.mode ?? "").toLowerCase();
  const channel = String(row.channel ?? "").toLowerCase();
  return mode.includes("internal") || channel.includes("proof audit") || channel.includes("asset audit");
}

function shareUrl(platform, text, link = REFERRAL_LINK) {
  const encodedText = encodeURIComponent(text);
  const encodedLink = encodeURIComponent(link);
  if (platform === "whatsapp") return `https://wa.me/?text=${encodedText}`;
  if (platform === "telegram") return `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
  if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
  return `https://twitter.com/intent/tweet?text=${encodedText}`;
}

function formatDisplayTime(value) {
  const text = String(value ?? "");
  return text.replace("T", " ").replace(/\.\d{3}Z$/, "Z");
}

function renderConsole(dispatch) {
  return [
    "WorldCup26 dispatch ready",
    `Generated: ${dispatch.generatedAt}`,
    `Urgent rows: ${dispatch.urgentCount}`,
    `Live proof rows: ${dispatch.liveProof?.loggedCount ?? 0}`,
    `Pulse actions: ${dispatch.pulse?.totalCount ?? 0}`,
    `Proofed pulse actions: ${dispatch.pulse?.proofedCount ?? 0}`,
    "Pulse command center: runtime/pulse-command-center.html",
    ...dispatch.workers.map((worker) =>
      worker.current
        ? `${worker.worker}: priority ${worker.current.priority} / ${worker.current.channel}`
        : `${worker.worker}: no urgent row`,
    ),
    "",
  ].join("\n");
}

function summarizeDispatchRow(row) {
  return {
    priority: row.priority,
    scheduledAt: row.scheduled_at_eest,
    channel: row.channel,
    action: row.action,
    asset: row.asset,
    trackedLink: row.tracked_link,
    proofCommand: proofCommand(row, proofNoteExample(row)),
  };
}

function summarizePulse(pulse, nowIso, proofRows = []) {
  const pulses = Array.isArray(pulse?.pulses) ? pulse.pulses : [];
  const proofedLinks = new Set(
    proofRows
      .filter((row) => String(row.proof_url ?? "").trim())
      .map((row) => normalizeLink(row.link))
      .filter(Boolean),
  );
  const now = new Date(nowIso);
  const byWorker = Object.fromEntries(
    WORKERS.map((worker) => {
      const workerRows = pulses
        .filter((row) => sameWorker(row.owner, worker))
        .sort(comparePulseRows);
      const unproofedRows = workerRows.filter((row) => !proofedLinks.has(normalizeLink(row.trackedLink)));
      const current =
        unproofedRows.find((row) => {
          const scheduledAt = parseEestDate(row.scheduledAtEest);
          return scheduledAt && scheduledAt >= now;
        }) ??
        unproofedRows[unproofedRows.length - 1] ??
        null;
      const currentIndex = current ? unproofedRows.findIndex((row) => row.pulse === current.pulse) : -1;
      const next =
        currentIndex >= 0 ? unproofedRows.slice(currentIndex, currentIndex + 5) : unproofedRows.slice(0, 5);
      return [worker, { current, next }];
    }),
  );

  return {
    generatedAt: pulse?.generatedAt ?? null,
    windowHours: pulse?.windowHours ?? null,
    intervalMinutes: pulse?.intervalMinutes ?? null,
    totalCount: pulses.length,
    proofedCount: pulses.filter((row) => proofedLinks.has(normalizeLink(row.trackedLink))).length,
    byWorker,
  };
}

function comparePulseRows(left, right) {
  const leftDate = parseEestDate(left.scheduledAtEest);
  const rightDate = parseEestDate(right.scheduledAtEest);
  if (leftDate && rightDate) return leftDate.getTime() - rightDate.getTime();
  return Number(left.pulse ?? 0) - Number(right.pulse ?? 0);
}

function parseEestDate(value) {
  const match = String(value ?? "").match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) ([+-])(\d{2})(\d{2})$/,
  );
  if (!match) return null;
  const [, year, month, day, hour, minute, sign, offsetHour, offsetMinute] = match;
  const offsetMinutes = (Number(offsetHour) * 60 + Number(offsetMinute)) * (sign === "-" ? -1 : 1);
  const utc = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  return new Date(utc - offsetMinutes * 60_000);
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

function proofCommand(row, proofUrl = "POST_URL_OR_PRIVATE_NOTE") {
  return [
    "node campaign-proof-log.mjs",
    `--priority ${shellQuote(row.priority)}`,
    `--proof-url ${shellQuote(proofUrl)}`,
    `--status ${shellQuote(suggestStatus(row))}`,
  ].join(" ");
}

function proofNoteExample(row) {
  const channel = String(row.channel ?? "").toLowerCase();
  const mode = String(row.mode ?? "").toLowerCase();
  const asset = String(row.asset ?? "").trim() || "asset";
  const codePart = "code 26BC4B90CB and link included";
  if (mode.includes("approval") || channel.includes("football")) {
    return `approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; post only after allowed`;
  }
  if (channel.includes("whatsapp") && channel.includes("status")) {
    return `private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset ${asset}; ${codePart}`;
  }
  if (channel.includes("whatsapp")) {
    return `private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; replies <N>`;
  }
  if (channel.includes("telegram")) {
    return `private-telegram: posted/sent in <group/contact> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; admin-approved yes/no`;
  }
  if (channel.includes("discord")) {
    return `private-discord: posted in approved <server/channel> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}`;
  }
  if (channel.includes("instagram") || channel.includes("facebook story") || channel.includes("meta story")) {
    return `private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset ${asset}; code/link sticker or caption included`;
  }
  if (channel.includes("short") || channel.includes("reel") || channel.includes("tiktok") || channel.includes("youtube")) {
    return `public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}`;
  }
  if (mode.includes("reply") || mode.includes("repl") || channel.includes("repl")) {
    return `private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; ${codePart}; next follow-up <date/action>`;
  }
  if (channel.includes("ops")) return "internal-log: assets checked and log opened";
  return `manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; replace with public URL when available`;
}

function suggestStatus(row) {
  const channel = String(row.channel ?? "").toLowerCase();
  const mode = String(row.mode ?? "").toLowerCase();
  if (mode.includes("approval")) return "requested";
  if (mode.includes("reply") || mode.includes("repl") || channel.includes("repl")) return "replied";
  if (mode.includes("internal") || channel.includes("ops")) return "logged";
  if (mode.includes("outreach") || channel.includes("personal") || channel.includes("dm")) return "sent";
  return "posted";
}

function sameWorker(value, worker) {
  return String(value ?? "").trim().toLowerCase() === worker.toLowerCase();
}

function oldestRow(rows) {
  return [...rows].sort((left, right) => {
    const leftAge = ageHoursSince(left.scheduled_at_eest);
    const rightAge = ageHoursSince(right.scheduled_at_eest);
    return rightAge - leftAge;
  })[0] ?? null;
}

function escalationLevel(row) {
  if (!row) return "clear";
  const hours = ageHoursSince(row.scheduled_at_eest);
  if (hours >= 6) return "hot";
  if (hours >= 2) return "urgent";
  if (hours >= 0.5) return "due now";
  return "active";
}

function ageLabel(value) {
  const hours = ageHoursSince(value);
  if (!Number.isFinite(hours)) return "unknown age";
  if (hours < 0) return `due in ${Math.abs(hours).toFixed(1)}h`;
  return `${hours.toFixed(1)}h open`;
}

function ageHoursSince(value) {
  const scheduledAt = parseEestTimestamp(value);
  if (!scheduledAt) return Number.NaN;
  return Math.max(-999, (new Date(generatedAt).getTime() - scheduledAt.getTime()) / 3_600_000);
}

function parseEestTimestamp(value) {
  const match = String(value ?? "").match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) ([+-]\d{2})(\d{2})$/);
  if (!match) return null;
  const [, date, time, offsetHour, offsetMinute] = match;
  const parsed = new Date(`${date}T${time}:00${offsetHour}:${offsetMinute}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function shellQuote(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
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
  if (!header) return [];
  return data
    .filter((values) => values.some((value) => String(value ?? "").trim().length > 0))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}
