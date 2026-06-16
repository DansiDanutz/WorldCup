#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const proofSprint = await readJson(path.join(runtimeDir, "proof-sprint.json"));
const firstHumanActions = await readJson(path.join(runtimeDir, "first-human-actions.json"));
const payload = buildPayload(proofSprint, firstHumanActions);

await writeFile(path.join(runtimeDir, "hot-proof-ping.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "hot-proof-ping.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "hot-proof-ping.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "hot-proof-ping.html"), renderHtml(payload));

for (const worker of payload.workers) {
  const slug = worker.worker.toLowerCase();
  await writeFile(path.join(runtimeDir, `hot-proof-ping-${slug}.md`), renderWorkerMarkdown(payload, worker));
  await writeFile(path.join(runtimeDir, `hot-proof-ping-${slug}.html`), renderWorkerHtmlPage(payload, worker));
}

if (!args.quiet) {
  process.stdout.write(
    [
      "WorldCup26 hot proof ping ready",
      `Generated: ${payload.generatedAt}`,
      `Proof rows: ${payload.liveProofRows}`,
      `Urgent gaps: ${payload.urgentProofGaps}`,
      `Hot workers: ${payload.hotWorkers}`,
      "Output: runtime/hot-proof-ping.html",
      "",
    ].join("\n"),
  );
}

function buildPayload(proofSprint, firstHumanActions) {
  const rows = Array.isArray(proofSprint?.rows) ? proofSprint.rows : [];
  const board = Array.isArray(proofSprint?.escalationBoard) ? proofSprint.escalationBoard : [];
  const rowsByWorker = new Map();
  for (const row of rows) {
    const owner = normalizeText(row.owner) || "Unassigned";
    const bucket = rowsByWorker.get(owner) ?? [];
    bucket.push(row);
    rowsByWorker.set(owner, bucket);
  }

  const workers = WORKERS.map((worker) => {
    const boardRow = board.find((row) => row.worker === worker) ?? null;
    const workerRows = rowsByWorker.get(worker) ?? [];
    const nextPriority = normalizeText(boardRow?.nextPriority);
    const nextRow =
      workerRows.find((row) => normalizeText(row.priority) === nextPriority) ??
      workerRows[0] ??
      null;

    return {
      worker,
      openRows: Number(boardRow?.openRows ?? workerRows.length ?? 0),
      escalation: normalizeText(boardRow?.escalation) || (workerRows.length > 0 ? "hot" : "clear"),
      oldestScheduledAtEest: boardRow?.oldestScheduledAtEest ?? null,
      oldestAgeLabel: boardRow?.oldestAgeLabel ?? null,
      nextPriority: nextPriority || null,
      nextChannel: normalizeText(boardRow?.nextChannel) || normalizeText(nextRow?.channel) || null,
      nextCommand: normalizeText(boardRow?.nextCommand) || normalizeText(nextRow?.privateProofCommand) || null,
      nextAction: nextRow ? normalizeAction(nextRow) : null,
    };
  });

  return {
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: normalizeText(proofSprint?.referralCode) || REFERRAL_CODE,
    referralLink: normalizeText(proofSprint?.referralLink) || REFERRAL_LINK,
    liveProofRows: Number(proofSprint?.liveProofRows ?? 0),
    urgentProofGaps: Number(proofSprint?.urgentProofGaps ?? rows.length),
    hotWorkers: workers.filter((worker) => worker.escalation !== "clear" && worker.openRows > 0).length,
    firstHotWorker:
      workers.find((worker) => worker.escalation !== "clear" && worker.openRows > 0) ??
      workers.find((worker) => worker.openRows > 0) ??
      null,
    firstHuman: normalizeFirstHuman(firstHumanActions),
    workers,
  };
}

function normalizeFirstHuman(firstHumanActions) {
  const counts = firstHumanActions?.counts ?? {};
  const first = firstHumanActions?.firstAction ?? null;
  return {
    ok: Boolean(firstHumanActions?.ok),
    state: normalizeText(firstHumanActions?.state),
    warmAttempts: Number(counts.warmAttempts ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    referralViews: Number(counts.referralViews ?? 0),
    dashboardClicks: Number(counts.dashboardClicks ?? 0),
    firstAction: first
      ? {
          id: normalizeText(first.id),
          owner: normalizeText(first.owner),
          channel: normalizeText(first.channel),
          title: normalizeText(first.title),
          link: normalizeText(first.link),
          whatsapp: normalizeText(first.share?.whatsapp),
          telegram: normalizeText(first.share?.telegram),
          sms: normalizeText(first.share?.sms),
          command: normalizeText(first.command),
          copy: normalizeText(first.copy),
          doneWhen: normalizeText(first.doneWhen),
        }
      : null,
  };
}

function normalizeAction(row) {
  return {
    priority: normalizeText(row.priority),
    channel: normalizeText(row.channel),
    mode: normalizeText(row.mode),
    action: normalizeText(row.action),
    asset: normalizeText(row.asset),
    scheduledAtEest: normalizeText(row.scheduledAtEest),
    ageLabel: normalizeText(row.ageLabel),
    trackedLink: normalizeText(row.trackedLink),
    copy: normalizeText(row.primaryCopy ?? row.primary_copy ?? row.copy),
    firstComment: normalizeText(row.firstComment ?? row.first_comment),
    proofCommand: normalizeText(row.privateProofCommand ?? row.proofCommand),
  };
}

function renderMarkdown(payload) {
  const workerRows = payload.workers.map((worker) => renderWorkerBlock(worker)).join("\n\n");
  const first = payload.firstHotWorker;
  return `# WorldCup26 Hot Proof Ping

Generated: ${payload.generatedAtEest}
Referral code: \`${payload.referralCode}\`
Referral link: ${payload.referralLink}

Proof rows logged: ${payload.liveProofRows}
Urgent proof gaps: ${payload.urgentProofGaps}
Hot workers: ${payload.hotWorkers}

## First Human Gate

${renderFirstHumanBlock(payload)}

## First Action

${first ? renderWorkerBlock(first) : "No urgent proof gaps are open right now."}

## Worker Board

${workerRows}

## Proof Rule

Do not run a proof command until the real post, message, story, reply, upload, or approval request happened. Public posts need a URL. Private channels need a clear account/channel note with time, audience, code, and link included.
`;
}

function renderWorkerMarkdown(payload, worker) {
  return `# ${worker.worker} Hot Proof Ping

Generated: ${payload.generatedAtEest}
Referral code: \`${payload.referralCode}\`
Referral link: ${payload.referralLink}

${renderFirstHumanBlock(payload)}

${renderWorkerBlock(worker)}

## Proof Rule

Do not run the proof command until the real action happened. Replace placeholders with the real channel/account, time, and proof detail.
`;
}

function renderWorkerBlock(worker) {
  if (!worker.nextAction) {
    return `### ${worker.worker}

- Status: ${worker.escalation}
- Open proof rows: ${worker.openRows}
- Next action: clear`;
  }

  const action = worker.nextAction;
  return `### ${worker.worker}

- Status: ${worker.escalation}
- Open proof rows: ${worker.openRows}
- Oldest gap: ${worker.oldestAgeLabel ?? "not aged"}
- Priority: ${action.priority}
- Channel: ${action.channel}
- Mode: ${action.mode}
- Action: ${action.action}
- Asset: \`${action.asset}\`
- Scheduled: ${action.scheduledAtEest}
- Link: ${action.trackedLink}
- Proof command:

\`\`\`bash
${worker.nextCommand ?? action.proofCommand}
\`\`\`

- Opening copy:

\`\`\`text
${action.copy}
\`\`\``;
}

function renderText(payload) {
  const lines = [
    `WorldCup26 hot proof ping ${payload.generatedAtEest}`,
    `proof=${payload.liveProofRows} urgent=${payload.urgentProofGaps} hot_workers=${payload.hotWorkers}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `first_human=${payload.firstHuman.ok ? payload.firstHuman.state : "missing"} warm_attempts=${payload.firstHuman.warmAttempts} signup_saves=${payload.firstHuman.signupSaves} referral_views=${payload.firstHuman.referralViews} ad_clicks=${payload.firstHuman.dashboardClicks}`,
    payload.firstHuman.firstAction
      ? `first_human_action=${payload.firstHuman.firstAction.owner}/${payload.firstHuman.firstAction.channel}/${payload.firstHuman.firstAction.id}`
      : "first_human_action=-",
    payload.firstHuman.firstAction?.command
      ? `first_human_command=${payload.firstHuman.firstAction.command}`
      : "first_human_command=-",
    payload.firstHuman.firstAction?.whatsapp
      ? `first_human_whatsapp=${payload.firstHuman.firstAction.whatsapp}`
      : "first_human_whatsapp=-",
    "",
  ];
  for (const worker of payload.workers) {
    const action = worker.nextAction;
    lines.push(
      `${worker.worker}: ${worker.escalation} open=${worker.openRows} next=${worker.nextPriority ?? "-"} channel=${worker.nextChannel ?? "-"}`,
    );
    if (action) {
      lines.push(`  action=${action.action}`);
      lines.push(`  asset=${action.asset}`);
      lines.push(`  command=${worker.nextCommand ?? action.proofCommand}`);
    }
  }
  lines.push("", "Proof rule: log proof only after the real action happened.", "");
  return lines.join("\n");
}

function renderHtml(payload) {
  const workerCards = payload.workers.map((worker) => renderWorkerHtmlCard(worker)).join("\n");
  return renderHtmlShell(
    "WorldCup26 Hot Proof Ping",
    `Proof ${payload.liveProofRows} / urgent ${payload.urgentProofGaps} / hot workers ${payload.hotWorkers}`,
    `<section class="hero">
      <p class="eyebrow">Generated ${escapeHtml(payload.generatedAtEest)}</p>
      <h1>WorldCup26 Hot Proof Ping</h1>
      <p>Open the next action, copy the caption, share from a phone account, then log proof only after the real action happened.</p>
      <div class="meta">
        <span>Code <strong>${escapeHtml(payload.referralCode)}</strong></span>
        <a href="${escapeAttr(payload.referralLink)}" target="_blank" rel="noreferrer">Referral link</a>
      </div>
    </section>
    ${renderFirstHumanHtml(payload)}
    <section class="grid">${workerCards}</section>
    <section class="rule">
      <strong>Proof rule</strong>
      <p>Public posts need a URL. Private channels need a clear account/channel note with time, audience, code, and link included. Do not run proof commands before the real post, message, story, reply, upload, or approval request happened.</p>
    </section>`,
  );
}

function renderWorkerHtmlPage(payload, worker) {
  return renderHtmlShell(
    `${worker.worker} Hot Proof Ping`,
    `${worker.worker} next action`,
    `<section class="hero">
      <p class="eyebrow">Generated ${escapeHtml(payload.generatedAtEest)}</p>
      <h1>${escapeHtml(worker.worker)} Hot Proof Ping</h1>
      <p>Use this on the phone or desktop account assigned to ${escapeHtml(worker.worker)}.</p>
      <div class="meta">
        <span>Code <strong>${escapeHtml(payload.referralCode)}</strong></span>
        <a href="${escapeAttr(payload.referralLink)}" target="_blank" rel="noreferrer">Referral link</a>
      </div>
    </section>
    ${renderFirstHumanHtml(payload)}
    <section class="grid grid--single">${renderWorkerHtmlCard(worker)}</section>
    <section class="rule">
      <strong>Proof rule</strong>
      <p>Do the action first. Then copy and run the proof command with real channel/account/time details.</p>
    </section>`,
  );
}

function renderFirstHumanBlock(payload) {
  const first = payload.firstHuman.firstAction;
  if (!payload.firstHuman.ok || !first) {
    return "No first-human action board is available. Regenerate `campaign-first-human-actions.mjs`.";
  }
  return `State: ${payload.firstHuman.state}
Warm attempts: ${payload.firstHuman.warmAttempts}
Signup saves: ${payload.firstHuman.signupSaves}
Referral views: ${payload.firstHuman.referralViews}
Ad clicks: ${payload.firstHuman.dashboardClicks}

First required action: ${first.owner} / ${first.channel} - ${first.title}
Link: ${first.link}
WhatsApp: ${first.whatsapp || "-"}
Telegram: ${first.telegram || "-"}
SMS: ${first.sms || "-"}
Done when: ${first.doneWhen}

\`\`\`bash
${first.command}
\`\`\`

\`\`\`text
${first.copy}
\`\`\``;
}

function renderFirstHumanHtml(payload) {
  const first = payload.firstHuman.firstAction;
  if (!payload.firstHuman.ok || !first) return "";
  return `<section class="first-human">
    <h2>First Human Gate</h2>
    <p><strong>${escapeHtml(payload.firstHuman.state)}</strong> / warm attempts ${payload.firstHuman.warmAttempts} / signup saves ${payload.firstHuman.signupSaves} / ad clicks ${payload.firstHuman.dashboardClicks}</p>
    <p>${escapeHtml(first.owner)} / ${escapeHtml(first.channel)} - ${escapeHtml(first.title)}</p>
    <p><a href="${escapeAttr(first.link)}" target="_blank" rel="noreferrer">${escapeHtml(first.link)}</a></p>
    <div class="actions">
      ${first.whatsapp ? `<a class="button" href="${escapeAttr(first.whatsapp)}" target="_blank" rel="noreferrer">Open WhatsApp</a>` : ""}
      ${first.telegram ? `<a class="button secondary" href="${escapeAttr(first.telegram)}" target="_blank" rel="noreferrer">Open Telegram</a>` : ""}
      ${first.sms ? `<a class="button secondary" href="${escapeAttr(first.sms)}" target="_blank" rel="noreferrer">Open SMS</a>` : ""}
    </div>
    <pre>${escapeHtml(first.command)}</pre>
    <pre>${escapeHtml(first.copy)}</pre>
  </section>`;
}

function renderWorkerHtmlCard(worker) {
  const action = worker.nextAction;
  const statusClass = worker.escalation === "clear" ? "is-clear" : "is-hot";
  if (!action) {
    return `<article class="card ${statusClass}">
      <div class="card-head">
        <div>
          <p class="eyebrow">${escapeHtml(worker.escalation)}</p>
          <h2>${escapeHtml(worker.worker)}</h2>
        </div>
        <strong>${worker.openRows}</strong>
      </div>
      <p>No urgent proof rows are assigned right now.</p>
    </article>`;
  }

  const fullCopy = [action.copy, action.firstComment ? `Follow-up:\n${action.firstComment}` : ""]
    .filter(Boolean)
    .join("\n\n");
  const proofCommand = worker.nextCommand ?? action.proofCommand;
  const share = buildShareLinks(fullCopy, action.trackedLink);

  return `<article class="card ${statusClass}">
    <div class="card-head">
      <div>
        <p class="eyebrow">${escapeHtml(worker.escalation)} / ${escapeHtml(worker.oldestAgeLabel ?? "fresh")}</p>
        <h2>${escapeHtml(worker.worker)} -> #${escapeHtml(action.priority)}</h2>
      </div>
      <strong>${worker.openRows}</strong>
    </div>
    <dl>
      <div><dt>Channel</dt><dd>${escapeHtml(action.channel)}</dd></div>
      <div><dt>Mode</dt><dd>${escapeHtml(action.mode)}</dd></div>
      <div><dt>Asset</dt><dd><code>${escapeHtml(action.asset)}</code></dd></div>
      <div><dt>Action</dt><dd>${escapeHtml(action.action)}</dd></div>
    </dl>
    <div class="actions">
      <a class="button" href="${escapeAttr(action.trackedLink)}" target="_blank" rel="noreferrer">Open link</a>
      <a class="button secondary" href="${escapeAttr(share.whatsapp)}" target="_blank" rel="noreferrer">WhatsApp</a>
      <a class="button secondary" href="${escapeAttr(share.telegram)}" target="_blank" rel="noreferrer">Telegram</a>
      <a class="button secondary" href="${escapeAttr(share.x)}" target="_blank" rel="noreferrer">X</a>
      <a class="button secondary" href="${escapeAttr(share.facebook)}" target="_blank" rel="noreferrer">Facebook</a>
      <button class="button copy" data-copy="${escapeAttr(fullCopy)}" type="button">Copy caption</button>
      <button class="button copy" data-copy="${escapeAttr(proofCommand)}" type="button">Copy proof command</button>
    </div>
    <label>Caption</label>
    <pre>${escapeHtml(fullCopy)}</pre>
    <label>Proof command after real action</label>
    <pre>${escapeHtml(proofCommand)}</pre>
  </article>`;
}

function renderHtmlShell(title, subtitle, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2a20; --panel2: #12382d; --line: rgba(255,255,255,.16); --text: #f7fff9; --muted: #b8c9c2; --gold: #ffd974; --mint: #78f0b5; --green: #0f7b5d; --danger: #ffbc8f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 12% 0%, rgba(120,240,181,.16), transparent 26rem), radial-gradient(circle at 90% 6%, rgba(255,217,116,.17), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1120px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    .hero, .rule, .card { border: 1px solid var(--line); background: rgba(11,42,32,.92); border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.26); }
    .hero { padding: 18px; margin-bottom: 12px; }
    .hero h1 { margin: 4px 0 8px; font-size: clamp(28px, 6vw, 52px); line-height: .95; }
    .hero p { max-width: 760px; color: var(--muted); margin: 0; }
    .eyebrow { margin: 0 0 6px; color: var(--gold); text-transform: uppercase; letter-spacing: .08em; font-size: 12px; font-weight: 800; }
    .meta, .actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 14px; }
    .meta span, .meta a { border: 1px solid var(--line); background: rgba(255,255,255,.06); border-radius: 999px; padding: 8px 10px; color: var(--text); text-decoration: none; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .grid--single { grid-template-columns: 1fr; }
    .card { padding: 14px; }
    .card.is-hot { border-color: rgba(255,217,116,.72); }
    .card.is-clear { opacity: .72; }
    .card-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
    .card h2 { margin: 0; font-size: 24px; }
    .card-head > strong { display: grid; place-items: center; min-width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, var(--gold), var(--mint)); color: #062016; font-size: 22px; }
    dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
    dt { color: var(--muted); text-transform: uppercase; font-size: 11px; font-weight: 800; }
    dd { margin: 2px 0 0; font-weight: 700; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    pre { white-space: pre-wrap; word-break: break-word; border: 1px solid var(--line); border-radius: 12px; background: rgba(0,0,0,.24); color: var(--text); padding: 12px; max-height: 260px; overflow: auto; }
    label { display: block; margin-top: 12px; color: var(--gold); font-weight: 800; text-transform: uppercase; font-size: 12px; }
    .button { appearance: none; border: 1px solid rgba(255,217,116,.3); background: linear-gradient(135deg, var(--gold), var(--mint)); color: #062016; border-radius: 10px; padding: 10px 12px; font-weight: 900; text-decoration: none; cursor: pointer; }
    .button.secondary { background: rgba(255,255,255,.08); color: var(--text); border-color: var(--line); }
    .rule { margin-top: 12px; padding: 14px; }
    .rule p { color: var(--muted); margin-bottom: 0; }
    @media (max-width: 760px) { main { padding: 10px 8px 32px; } .grid, dl { grid-template-columns: 1fr; } .hero h1 { font-size: 34px; } .button { width: 100%; text-align: center; } }
  </style>
</head>
<body>
  <main>
    ${body}
  </main>
  <script>
    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(button.dataset.copy || "");
          const oldText = button.textContent;
          button.textContent = "Copied";
          setTimeout(() => { button.textContent = oldText; }, 1400);
        } catch {
          button.textContent = "Copy failed";
        }
      });
    });
  </script>
</body>
</html>
`;
}

function buildShareLinks(copy, link) {
  const text = copy.includes(link) ? copy : `${copy}\n\n${link}`;
  const encodedText = encodeURIComponent(text);
  const encodedLink = encodeURIComponent(link);
  return {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`,
    x: `https://twitter.com/intent/tweet?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
  };
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

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${path.relative(campaignDir, filePath)}: ${error.message}`);
  }
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

function normalizeText(value) {
  return String(value ?? "").trim();
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
