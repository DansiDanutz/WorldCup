#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];
const DEFAULT_HOT_MINUTES = 180;
const DEFAULT_CRITICAL_MINUTES = 720;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const postNowRows = await readCsv(path.join(runtimeDir, "post-now.csv"));
const proofStall = await readJson(path.join(runtimeDir, "proof-stall.json"), {});
const linkSentinel = await readJson(path.join(runtimeDir, "link-sentinel.json"), {});
const payload = buildPayload({ postNowRows, proofStall, linkSentinel });

await writeFile(path.join(runtimeDir, "escalation-board.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "escalation-board.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "escalation-board.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "escalation-board.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ postNowRows, proofStall, linkSentinel }) {
  const actions = postNowRows
    .map(normalizePostNowRow)
    .filter((row) => row.priority && isExternal(row))
    .sort((left, right) => Number(left.priority) - Number(right.priority));
  const byWorker = WORKERS.map((worker) => {
    const workerActions = actions.filter((row) => sameText(row.owner, worker));
    const stale = workerActions.filter((row) => row.escalation !== "watch");
    return {
      worker,
      totalOpen: workerActions.length,
      staleOpen: stale.length,
      first: workerActions[0] ?? null,
      mustDoNow: stale.slice(0, 2),
    };
  });
  const criticalActions = actions.filter((row) => row.escalation === "critical");
  const hotActions = actions.filter((row) => row.escalation === "hot");
  const watchActions = actions.filter((row) => row.escalation === "watch");

  return {
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    deployment: firstDeployment(linkSentinel),
    linkOk: Boolean(linkSentinel.ok),
    thresholds: {
      hotMinutes: args.hotMinutes,
      criticalMinutes: args.criticalMinutes,
    },
    proofActivityOk: Boolean(proofStall.ok),
    latestExternalProofAgeMinutes:
      proofStall.latestExternalProofAgeMinutes == null
        ? null
        : Number(proofStall.latestExternalProofAgeMinutes),
    counts: {
      externalOpen: actions.length,
      critical: criticalActions.length,
      hot: hotActions.length,
      watch: watchActions.length,
      workersWithStale: byWorker.filter((row) => row.staleOpen > 0).length,
    },
    criticalActions,
    hotActions,
    byWorker,
  };
}

function normalizePostNowRow(row) {
  const scheduledAtEest = String(row.scheduled_at_eest ?? "").trim();
  const scheduledAt = parseEestLogTime(scheduledAtEest);
  const ageMinutes = scheduledAt
    ? Math.max(0, Math.floor((now.getTime() - scheduledAt.getTime()) / 60_000))
    : 0;
  const channel = String(row.channel ?? "").trim();
  const mode = String(row.mode ?? "").trim();
  const priority = String(row.priority ?? "").trim();
  const owner = String(row.owner ?? "").trim();
  const asset = String(row.asset ?? "").trim();
  const copy = [row.primary_copy, row.first_comment ? `Follow-up:\n${row.first_comment}` : ""]
    .filter(Boolean)
    .join("\n\n");
  const proofNote = proofNoteFor(row);
  return {
    priority,
    owner,
    channel,
    mode,
    action: String(row.action ?? "").trim(),
    asset,
    trackedLink: String(row.tracked_link ?? "").trim(),
    copy,
    scheduledAtEest,
    ageMinutes,
    ageLabel: formatAge(ageMinutes),
    escalation: escalationFor(ageMinutes),
    proofStatus: proofStatusFor(mode),
    proofNote,
    proofCommand: `node campaign-proof-log.mjs --priority "${priority}" --proof-url ${shellQuote(proofNote)} --status "${proofStatusFor(mode)}"`,
    share: {
      whatsapp: String(row.whatsapp_share_url ?? "").trim(),
      telegram: String(row.telegram_share_url ?? "").trim(),
      x: String(row.x_share_url ?? "").trim(),
      facebook: String(row.facebook_share_url ?? "").trim(),
    },
  };
}

function escalationFor(ageMinutes) {
  if (ageMinutes >= args.criticalMinutes) return "critical";
  if (ageMinutes >= args.hotMinutes) return "hot";
  return "watch";
}

function isExternal(row) {
  const channel = String(row.channel ?? "").toLowerCase();
  return !channel.includes("internal") && !channel.includes("audit") && !channel.includes("ops");
}

function proofStatusFor(mode) {
  const value = String(mode ?? "").toLowerCase();
  if (value.includes("approval")) return "requested";
  if (value.includes("reply") || value.includes("repl")) return "replied";
  if (value.includes("outreach")) return "sent";
  if (value.includes("internal")) return "logged";
  return "posted";
}

function proofNoteFor(row) {
  const channel = String(row.channel ?? "").toLowerCase();
  const mode = String(row.mode ?? "").toLowerCase();
  const action = String(row.action ?? "").toLowerCase();
  const asset = String(row.asset ?? "").trim() || "asset";
  const codePart = `code ${REFERRAL_CODE} and link included`;

  if (channel.includes("whatsapp") && channel.includes("status")) {
    return `private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset ${asset}; ${codePart}`;
  }
  if (channel.includes("whatsapp")) {
    return `private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; replies <N>`;
  }
  if (channel.includes("instagram") || channel.includes("facebook story") || channel.includes("meta story")) {
    return `private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset ${asset}; code/link sticker or caption included`;
  }
  if (channel.includes("short") || channel.includes("reel") || channel.includes("tiktok") || channel.includes("youtube")) {
    return `public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}`;
  }
  if (channel.includes("football") || mode.includes("approval") || action.includes("permission")) {
    return `approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; post only after allowed`;
  }
  if (channel.includes("dm") || channel.includes("reply") || mode.includes("reply")) {
    return `private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; ${codePart}; next follow-up <date/action>`;
  }
  return `manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; replace with public URL when available`;
}

function firstDeployment(linkSentinel) {
  const checks = Array.isArray(linkSentinel.checks) ? linkSentinel.checks : [];
  return checks.find((check) => check?.dplId)?.dplId ?? "";
}

function renderText(payload) {
  const lines = [
    `WorldCup26 escalation board ${payload.generatedAtEest}`,
    `link=${payload.linkOk ? "ok" : "fail"} dpl=${payload.deployment || "-"} proof_activity=${payload.proofActivityOk ? "ok" : "stale"} latest_external=${formatAge(payload.latestExternalProofAgeMinutes)}`,
    `external_open=${payload.counts.externalOpen} critical=${payload.counts.critical} hot=${payload.counts.hot} workers_with_stale=${payload.counts.workersWithStale}`,
    "",
    "do_now:",
  ];
  for (const row of [...payload.criticalActions, ...payload.hotActions].slice(0, 8)) {
    lines.push(`- ${row.escalation.toUpperCase()} #${row.priority} ${row.owner} / ${row.channel} age=${row.ageLabel}`);
    lines.push(`  action=${row.action}`);
    lines.push(`  asset=${row.asset}`);
    lines.push(`  link=${row.trackedLink}`);
    lines.push(`  proof_after_action=${row.proofCommand}`);
  }
  lines.push("", "by_worker:");
  for (const worker of payload.byWorker) {
    const first = worker.first;
    lines.push(`- ${worker.worker}: open=${worker.totalOpen} stale=${worker.staleOpen}${first ? ` next=#${first.priority} ${first.channel} age=${first.ageLabel}` : ""}`);
  }
  lines.push("", "Rule: do the real post/message/story/request first. Replace placeholders before logging proof.", "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Escalation Board

Generated: ${payload.generatedAtEest}

- Link sentinel: ${payload.linkOk ? "ok" : "fail"}
- Deployment: ${payload.deployment || "-"}
- Latest external proof age: ${formatAge(payload.latestExternalProofAgeMinutes)}
- External open actions: ${payload.counts.externalOpen}
- Critical stale actions: ${payload.counts.critical}
- Hot stale actions: ${payload.counts.hot}
- Workers with stale actions: ${payload.counts.workersWithStale}

Use this as the "wake up now" board. It does not prove posting. It only says which real-world actions are old enough to push immediately.

## Do Now

${[...payload.criticalActions, ...payload.hotActions].slice(0, 10).map(renderActionMarkdown).join("\n\n") || "No stale external actions right now."}

## Worker Split

${payload.byWorker.map(renderWorkerMarkdown).join("\n\n")}
`;
}

function renderActionMarkdown(row) {
  return `### ${row.escalation.toUpperCase()} #${row.priority} ${row.owner} / ${row.channel}

- Age: ${row.ageLabel}
- Scheduled: ${row.scheduledAtEest}
- Action: ${row.action}
- Asset: \`${row.asset}\`
- Link: ${row.trackedLink}

Copy:

\`\`\`text
${row.copy}
\`\`\`

Proof after real action:

\`\`\`bash
${row.proofCommand}
\`\`\``;
}

function renderWorkerMarkdown(worker) {
  const lines = [
    `### ${worker.worker}`,
    "",
    `- Open external actions: ${worker.totalOpen}`,
    `- Stale actions: ${worker.staleOpen}`,
  ];
  if (worker.first) {
    lines.push(`- Next: #${worker.first.priority} ${worker.first.channel} (${worker.first.ageLabel})`);
  }
  if (worker.mustDoNow.length > 0) {
    lines.push("", "Must do now:");
    for (const row of worker.mustDoNow) {
      lines.push(`- #${row.priority} ${row.channel}: ${row.action}`);
    }
  }
  return lines.join("\n");
}

function renderHtml(payload) {
  const doNow = [...payload.criticalActions, ...payload.hotActions].slice(0, 10);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Escalation Board</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a2b21; --line: rgba(255,255,255,.15); --text: #f8fff9; --muted: #b9cec6; --gold: #ffd974; --mint: #74f0b2; --danger: #ff9f9f; --green: #0f7658; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 10% 0%, rgba(255,217,116,.18), transparent 26rem), radial-gradient(circle at 90% 8%, rgba(116,240,178,.14), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1040px, 100%); margin: 0 auto; padding: 14px 10px 46px; }
    header, article, section { border: 1px solid var(--line); border-radius: 10px; background: rgba(10,43,33,.92); }
    header { padding: 18px; margin-bottom: 12px; }
    h1 { margin: 0 0 8px; font-size: clamp(30px, 8vw, 56px); line-height: .92; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); line-height: 1.42; }
    .stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; overflow-wrap: anywhere; }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    article, section { padding: 14px; }
    h2 { margin: 0 0 8px; font-size: 21px; }
    .tag { display: inline-flex; width: fit-content; margin-bottom: 9px; padding: 6px 8px; border-radius: 999px; color: #03140f; background: var(--gold); font-size: 12px; font-weight: 950; }
    .tag.hot { background: var(--mint); }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.25); padding: 10px; max-height: 230px; overflow: auto; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a { min-height: 42px; border: 1px solid rgba(116,240,178,.4); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; text-align: center; padding: 9px; font: inherit; font-weight: 900; text-decoration: none; cursor: pointer; }
    button.secondary, a.secondary { background: rgba(255,255,255,.07); color: var(--mint); }
    ul { margin: 8px 0 0; padding-left: 18px; color: var(--muted); }
    @media (max-width: 760px) { .stats, .grid, .buttons { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Escalation Board</h1>
      <p>Wake up stale campaign actions. Do the real post first, then log proof.</p>
      <div class="stats">
        <div class="stat"><span>Generated</span><strong>${escapeHtml(payload.generatedAtEest)}</strong></div>
        <div class="stat"><span>Deployment</span><strong>${escapeHtml(payload.deployment || "-")}</strong></div>
        <div class="stat"><span>Critical</span><strong>${payload.counts.critical}</strong></div>
        <div class="stat"><span>Hot</span><strong>${payload.counts.hot}</strong></div>
        <div class="stat"><span>External age</span><strong>${escapeHtml(formatAge(payload.latestExternalProofAgeMinutes))}</strong></div>
      </div>
    </header>
    <section>
      <h2>Worker Split</h2>
      <ul>${payload.byWorker.map((worker) => `<li><strong>${escapeHtml(worker.worker)}</strong>: open ${worker.totalOpen}, stale ${worker.staleOpen}${worker.first ? `, next #${escapeHtml(worker.first.priority)} ${escapeHtml(worker.first.channel)} (${escapeHtml(worker.first.ageLabel)})` : ""}</li>`).join("")}</ul>
    </section>
    <div class="grid">${doNow.map(renderActionHtml).join("\n") || "<article><h2>No stale actions</h2><p>No stale external actions right now.</p></article>"}</div>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      event.preventDefault();
      await navigator.clipboard.writeText(button.dataset.copy || "");
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = original; }, 1100);
    });
  </script>
</body>
</html>
`;
}

function renderActionHtml(row) {
  return `<article>
    <span class="tag ${row.escalation === "hot" ? "hot" : ""}">${escapeHtml(row.escalation.toUpperCase())} ${escapeHtml(row.ageLabel)}</span>
    <h2>#${escapeHtml(row.priority)} ${escapeHtml(row.owner)} / ${escapeHtml(row.channel)}</h2>
    <p>${escapeHtml(row.action)}</p>
    <p><strong>Asset:</strong> ${escapeHtml(row.asset)}</p>
    <pre>${escapeHtml(row.copy)}</pre>
    <div class="buttons">
      <button data-copy="${escapeAttr(row.copy)}">Copy caption</button>
      <button class="secondary" data-copy="${escapeAttr(row.trackedLink)}">Copy link</button>
      ${row.share.whatsapp ? `<a class="secondary" href="${escapeAttr(row.share.whatsapp)}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
      ${row.share.telegram ? `<a class="secondary" href="${escapeAttr(row.share.telegram)}" target="_blank" rel="noreferrer">Telegram</a>` : ""}
      ${row.share.x ? `<a class="secondary" href="${escapeAttr(row.share.x)}" target="_blank" rel="noreferrer">X</a>` : ""}
      ${row.share.facebook ? `<a class="secondary" href="${escapeAttr(row.share.facebook)}" target="_blank" rel="noreferrer">Facebook</a>` : ""}
      <button class="secondary" data-copy="${escapeAttr(row.proofCommand)}">Copy proof command</button>
    </div>
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
  try {
    return parseCsv(await readFile(filePath, "utf8"));
  } catch {
    return [];
  }
}

function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift()?.map((value) => value.trim()) ?? [];
  return rows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function parseEestLogTime(value) {
  const match = String(value ?? "").match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})\s+\+0300$/,
  );
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour) - 3, Number(minute)));
  return Number.isFinite(date.getTime()) ? date : null;
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

function formatAge(minutes) {
  if (minutes == null) return "none";
  if (minutes < 60) return `${minutes}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}

function parseArgs(rawArgs) {
  const parsed = {
    quiet: false,
    root: "",
    now: "",
    hotMinutes: DEFAULT_HOT_MINUTES,
    criticalMinutes: DEFAULT_CRITICAL_MINUTES,
  };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--hot-minutes") parsed.hotMinutes = Number(rawArgs[++index] ?? parsed.hotMinutes);
    else if (arg === "--critical-minutes") parsed.criticalMinutes = Number(rawArgs[++index] ?? parsed.criticalMinutes);
  }
  return parsed;
}

function sameText(left, right) {
  return String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();
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
