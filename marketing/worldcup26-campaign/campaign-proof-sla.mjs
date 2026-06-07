#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const DEFAULT_WARNING_MINUTES = 60;
const DEFAULT_CRITICAL_MINUTES = 90;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const proofStall = await readJson(path.join(runtimeDir, "proof-stall.json"), {});
const paidTraffic = await readJson(path.join(runtimeDir, "paid-traffic-guard.json"), {});
const sessionRecovery = await readJson(path.join(runtimeDir, "session-recovery.json"), {});
const postNowRows = await readCsv(path.join(runtimeDir, "post-now.csv"));
const operatorPush = await readJson(path.join(runtimeDir, "operator-push-packet.json"), {});
const workerWake = await readJson(path.join(runtimeDir, "worker-wake-board.json"), {});
const payload = buildPayload({ proofStall, paidTraffic, sessionRecovery, postNowRows, operatorPush, workerWake });

await writeFile(path.join(runtimeDir, "proof-sla.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "proof-sla.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "proof-sla.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "proof-sla.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ proofStall, paidTraffic, sessionRecovery, postNowRows, operatorPush, workerWake }) {
  const latestExternalAgeMinutes =
    proofStall.latestExternalProofAgeMinutes == null
      ? null
      : Number(proofStall.latestExternalProofAgeMinutes);
  const proofState = proofStateFor(latestExternalAgeMinutes);
  const warmContactActions = selectWarmContactActions(workerWake);
  const operatorActions = selectOperatorActions(operatorPush);
  const actions = warmContactActions.length >= 4
    ? warmContactActions
    : operatorActions.length >= 4
    ? operatorActions
    : postNowRows
        .map(normalizePostNowRow)
        .filter((row) => row.priority && isExternal(row))
        .sort((left, right) => {
          const ageDelta = right.ageMinutes - left.ageMinutes;
          if (ageDelta !== 0) return ageDelta;
          return Number(left.priority) - Number(right.priority);
        });
  const doNow = actions.slice(0, 4);
  const recoveryActions = Array.isArray(sessionRecovery.recoveryActions)
    ? sessionRecovery.recoveryActions.map(normalizeRecoveryAction)
    : [];

  return {
    schema: "worldcup26-proof-sla-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: proofState !== "missing" && (doNow.length > 0 || proofState === "fresh"),
    proofState,
    thresholds: {
      warningMinutes: args.warningMinutes,
      criticalMinutes: args.criticalMinutes,
    },
    counts: {
      urgentOpenRows: Number(operatorPush?.urgentOpenRows ?? actions.length),
      doNowRows: doNow.length,
      proofRows: Number(proofStall.counts?.proofRows ?? 0),
      externalProofRows: Number(proofStall.counts?.externalProofRows ?? 0),
    },
    latestExternalProofAgeMinutes: latestExternalAgeMinutes,
    latestExternalProofAgeLabel: formatAge(latestExternalAgeMinutes),
    latestExternalProof: proofStall.latestExternalProof ?? null,
    paidTrafficOk: Boolean(paidTraffic.ok),
    deployment: Array.isArray(paidTraffic.deploymentIds) ? paidTraffic.deploymentIds[0] ?? "" : "",
    doNow,
    recoveryActions,
    proofRule:
      "Do the real post, story, message, upload, reply, or approval request first. Log proof only after it exists.",
  };
}

function selectOperatorActions(operatorPush) {
  const actions = Array.isArray(operatorPush?.actions) ? operatorPush.actions : [];
  if (operatorPush?.actionMode !== "zero-signup-rescue" || actions.length < 4) return [];
  return actions.map((action) => {
    const share = shareMapFrom(action.shareLinks);
    return {
      priority: String(action.priority ?? ""),
      owner: String(action.owner ?? ""),
      channel: String(action.channel ?? ""),
      mode: "zero-signup rescue",
      action: String(action.action ?? ""),
      asset: String(action.asset ?? ""),
      scheduledAtEest: String(action.ageLabel || "now"),
      ageMinutes: 0,
      ageLabel: String(action.ageLabel || "now"),
      trackedLink: String(action.trackedLink || action.link || REFERRAL_LINK),
      copy: String(action.copy ?? ""),
      combinedCopy: String(action.copy ?? ""),
      share,
      proofStatus: String(action.status || "posted"),
      proofNote: String(action.proofNote || `${action.channel || "Channel"} proof note`),
      proofCommand: String(action.proofCommand || action.attemptCommand || ""),
    };
  });
}

function selectWarmContactActions(workerWake) {
  const rows = Array.isArray(workerWake?.workers) ? workerWake.workers : [];
  const actions = rows
    .map((row) => row.current)
    .filter((row) => String(row?.priority ?? "").startsWith("warm-"))
    .map((action) => ({
      priority: String(action.priority ?? ""),
      owner: String(action.owner ?? ""),
      channel: String(action.channel ?? ""),
      mode: String(action.mode || "warm contact sprint"),
      action: String(action.action ?? ""),
      asset: String(action.asset ?? ""),
      scheduledAtEest: String(action.scheduledAtEest || "now"),
      ageMinutes: 0,
      ageLabel: "now",
      trackedLink: String(action.trackedLink || REFERRAL_LINK),
      copy: String(action.copy ?? ""),
      combinedCopy: [String(action.copy ?? ""), String(action.firstComment ?? "")]
        .filter(Boolean)
        .join("\n\n"),
      share: {
        whatsapp: String(action.share?.whatsapp ?? ""),
        telegram: String(action.share?.telegram ?? ""),
        x: "",
        facebook: "",
      },
      proofStatus: String(action.proofStatus || "sent"),
      proofNote: String(action.firstComment || "Warm-contact proof note"),
      proofCommand: String(action.proofIntakeCommand || ""),
    }));
  return actions.sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority));
}

function priorityRank(value) {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function shareMapFrom(shareLinks) {
  const share = { whatsapp: "", telegram: "", x: "", facebook: "" };
  if (!Array.isArray(shareLinks)) return share;
  for (const link of shareLinks) {
    const key = String(link.key || link.label || "").toLowerCase();
    const url = String(link.url || "");
    if (key.includes("whatsapp")) share.whatsapp ||= url;
    else if (key.includes("telegram")) share.telegram ||= url;
    else if (key === "x" || key.includes("twitter")) share.x ||= url;
    else if (key.includes("facebook")) share.facebook ||= url;
  }
  return share;
}

function proofStateFor(latestExternalAgeMinutes) {
  if (latestExternalAgeMinutes == null) return "missing";
  if (latestExternalAgeMinutes >= args.criticalMinutes) return "critical";
  if (latestExternalAgeMinutes >= args.warningMinutes) return "warning";
  return "fresh";
}

function normalizePostNowRow(row) {
  const scheduledAtEest = String(row.scheduled_at_eest ?? "").trim();
  const scheduledAt = parseEestLogTime(scheduledAtEest);
  const priority = String(row.priority ?? "").trim();
  const owner = String(row.owner ?? "").trim();
  const channel = String(row.channel ?? "").trim();
  const mode = String(row.mode ?? "").trim();
  const asset = String(row.asset ?? "").trim();
  const trackedLink = String(row.tracked_link ?? "").trim();
  const copy = String(row.primary_copy ?? "").trim();
  const firstComment = String(row.first_comment ?? "").trim();
  const combinedCopy = [copy, firstComment ? `Follow-up:\n${firstComment}` : ""]
    .filter(Boolean)
    .join("\n\n");
  const ageMinutes = scheduledAt
    ? Math.max(0, Math.floor((now.getTime() - scheduledAt.getTime()) / 60_000))
    : 0;
  const proofStatus = proofStatusFor(mode);
  const proofNote = proofNoteFor(row);
  return {
    priority,
    owner,
    channel,
    mode,
    action: String(row.action ?? "").trim(),
    asset,
    scheduledAtEest,
    ageMinutes,
    ageLabel: formatAge(ageMinutes),
    trackedLink,
    copy,
    combinedCopy,
    share: {
      whatsapp: String(row.whatsapp_share_url ?? "").trim(),
      telegram: String(row.telegram_share_url ?? "").trim(),
      x: String(row.x_share_url ?? "").trim(),
      facebook: String(row.facebook_share_url ?? "").trim(),
    },
    proofStatus,
    proofNote,
    proofCommand: `node campaign-proof-log.mjs --priority ${shellQuote(priority)} --proof-url ${shellQuote(proofNote)} --status ${shellQuote(proofStatus)}`,
  };
}

function normalizeRecoveryAction(row) {
  return {
    key: String(row.key ?? "").trim(),
    label: String(row.label ?? "").trim(),
    loginUrl: String(row.loginUrl ?? "").trim(),
    shareUrl: String(row.shareUrl ?? "").trim(),
    proofCommand: String(row.proofCommand ?? "").trim(),
  };
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
    return `public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}`;
  }
  if (channel.includes("football") || mode.includes("approval") || action.includes("permission")) {
    return `approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; post only after allowed`;
  }
  if (channel.includes("dm") || channel.includes("reply") || mode.includes("reply")) {
    return `private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; ${codePart}; next follow-up <date/action>`;
  }
  return `manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; replace with public URL when available`;
}

function renderText(payload) {
  const lines = [
    `WorldCup26 proof SLA ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.proofState} latest_external=${payload.latestExternalProofAgeLabel} urgent=${payload.counts.urgentOpenRows} do_now=${payload.counts.doNowRows} paid=${payload.paidTrafficOk ? "ok" : "fail"} dpl=${payload.deployment || "-"}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    "",
    "do_now:",
  ];
  for (const row of payload.doNow) {
    lines.push(`- #${row.priority} ${row.owner} / ${row.channel} age=${row.ageLabel}`);
    lines.push(`  action=${row.action}`);
    lines.push(`  asset=${row.asset}`);
    lines.push(`  link=${row.trackedLink}`);
    lines.push(`  proof_after_action=${row.proofCommand}`);
  }
  if (payload.recoveryActions.length > 0) {
    lines.push("", "public_fallbacks:");
    for (const action of payload.recoveryActions) {
      lines.push(`- ${action.label}: ${action.shareUrl}`);
      if (action.proofCommand) lines.push(`  proof_after_action=${action.proofCommand}`);
    }
  }
  lines.push("", `Rule: ${payload.proofRule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Proof SLA

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ready" : "not ready"}
- Proof state: ${payload.proofState}
- Latest external proof age: ${payload.latestExternalProofAgeLabel}
- Warning threshold: ${payload.thresholds.warningMinutes}m
- Critical threshold: ${payload.thresholds.criticalMinutes}m
- Urgent external rows: ${payload.counts.urgentOpenRows}
- Paid traffic guard: ${payload.paidTrafficOk ? "ok" : "fail"}
- Deployment: ${payload.deployment || "-"}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

This board is a recovery handoff. It does not prove posting. It tells the phone/social operator exactly what to do next when proof freshness is aging.

## Do Now

${payload.doNow.map(renderActionMarkdown).join("\n\n") || "No external proof actions are open right now."}

## Public Fallbacks

${payload.recoveryActions.map(renderRecoveryMarkdown).join("\n\n") || "No public fallback share links are available."}

## Proof Rule

${payload.proofRule}
`;
}

function renderActionMarkdown(row) {
  return `### #${row.priority} ${row.owner} / ${row.channel}

- Age: ${row.ageLabel}
- Scheduled: ${row.scheduledAtEest}
- Action: ${row.action}
- Asset: \`${row.asset}\`
- Link: ${row.trackedLink}

Copy:

\`\`\`text
${row.combinedCopy || row.copy}
\`\`\`

Proof after real action:

\`\`\`bash
${row.proofCommand}
\`\`\``;
}

function renderRecoveryMarkdown(action) {
  return `### ${action.label}

- Login: ${action.loginUrl || "-"}
- Share: ${action.shareUrl || "-"}

\`\`\`bash
${action.proofCommand || "Log proof after the real public fallback exists."}
\`\`\``;
}

function renderHtml(payload) {
  const stateClass = payload.proofState === "critical" || payload.proofState === "missing" ? "critical" : payload.proofState;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Proof SLA</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a2b21; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; --danger: #ff9f9f; --warn: #ffcc6a; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 12% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 88% 8%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(960px, 100%); margin: 0 auto; padding: 12px 10px 44px; }
    header, article, section { border: 1px solid var(--line); border-radius: 8px; background: rgba(10,43,33,.94); }
    header { padding: 16px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 9vw, 64px); line-height: .9; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0; color: var(--muted); line-height: 1.4; }
    .state { display: inline-flex; margin: 4px 0 12px; padding: 7px 10px; border-radius: 999px; color: #03140f; background: var(--mint); font-weight: 950; text-transform: uppercase; }
    .state.warning { background: var(--warn); }
    .state.critical { background: var(--danger); }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; overflow-wrap: anywhere; }
    .cards { display: grid; gap: 10px; }
    article { padding: 14px; }
    .tag { display: inline-grid; place-items: center; min-width: 38px; height: 34px; margin-bottom: 8px; color: #041a13; background: var(--gold); border-radius: 8px; font-weight: 950; }
    .meta { display: grid; gap: 4px; margin: 8px 0; color: var(--muted); font-size: 13px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button { min-height: 44px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; padding: 9px; font: inherit; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; }
    .secondary { background: rgba(255,255,255,.07); color: var(--mint); }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    .rule { margin-top: 10px; padding: 12px; }
    @media (min-width: 760px) { .stats { grid-template-columns: repeat(5, minmax(0, 1fr)); } .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Proof SLA</h1>
      <span class="state ${escapeAttr(stateClass)}">${escapeHtml(payload.proofState)}</span>
      <p>When this turns warning or critical, use the buttons below on a logged-in phone/social account. Log proof only after the real action happened.</p>
      <div class="stats">
        <div class="stat"><span>External proof age</span><strong>${escapeHtml(payload.latestExternalProofAgeLabel)}</strong></div>
        <div class="stat"><span>Urgent rows</span><strong>${payload.counts.urgentOpenRows}</strong></div>
        <div class="stat"><span>Do now</span><strong>${payload.counts.doNowRows}</strong></div>
        <div class="stat"><span>Code</span><strong>${escapeHtml(payload.referralCode)}</strong></div>
        <div class="stat"><span>Paid guard</span><strong>${payload.paidTrafficOk ? "ok" : "fail"}</strong></div>
      </div>
      <div class="buttons">
        <button class="gold" data-copy="${escapeAttr(payload.referralLink)}">Copy referral link</button>
        <button data-copy="${escapeAttr(`Code: ${payload.referralCode}\n${payload.referralLink}`)}">Copy code + link</button>
      </div>
    </header>
    <section class="cards">${payload.doNow.map(renderActionHtml).join("\n") || "<article><h2>No urgent rows</h2><p>No external proof actions are open right now.</p></article>"}</section>
    <section class="rule"><strong>Rule:</strong> ${escapeHtml(payload.proofRule)}</section>
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

function renderActionHtml(row) {
  return `<article>
    <span class="tag">#${escapeHtml(row.priority)}</span>
    <h2>${escapeHtml(row.owner)} / ${escapeHtml(row.channel)}</h2>
    <div class="meta">
      <div><strong>Age:</strong> ${escapeHtml(row.ageLabel)}</div>
      <div><strong>Action:</strong> ${escapeHtml(row.action)}</div>
      <div><strong>Asset:</strong> ${escapeHtml(row.asset)}</div>
    </div>
    <pre>${escapeHtml(row.combinedCopy || row.copy)}</pre>
    <div class="buttons">
      <button class="gold" data-copy="${escapeAttr(row.copy)}">Copy caption</button>
      <button data-copy="${escapeAttr(row.trackedLink)}">Copy link</button>
      ${row.share.whatsapp ? `<a class="button secondary" href="${escapeAttr(row.share.whatsapp)}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
      ${row.share.telegram ? `<a class="button secondary" href="${escapeAttr(row.share.telegram)}" target="_blank" rel="noreferrer">Telegram</a>` : ""}
      ${row.share.x ? `<a class="button secondary" href="${escapeAttr(row.share.x)}" target="_blank" rel="noreferrer">X</a>` : ""}
      ${row.share.facebook ? `<a class="button secondary" href="${escapeAttr(row.share.facebook)}" target="_blank" rel="noreferrer">Facebook</a>` : ""}
      <button data-copy="${escapeAttr(row.proofNote)}">Copy proof help</button>
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
    warningMinutes: DEFAULT_WARNING_MINUTES,
    criticalMinutes: DEFAULT_CRITICAL_MINUTES,
  };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--warning-minutes") parsed.warningMinutes = Number(rawArgs[++index] ?? parsed.warningMinutes);
    else if (arg === "--critical-minutes") parsed.criticalMinutes = Number(rawArgs[++index] ?? parsed.criticalMinutes);
  }
  return parsed;
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
