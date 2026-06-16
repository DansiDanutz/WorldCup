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

const proofSla = await readJson(path.join(runtimeDir, "proof-sla.json"), {});
const liveAdQa = await readJson(path.join(runtimeDir, "live-ad-qa.json"), {});
const workerWake = await readJson(path.join(runtimeDir, "worker-wake-board.json"), {});
const operatorPush = await readJson(path.join(runtimeDir, "operator-push-packet.json"), {});
const payload = buildPayload({ proofSla, liveAdQa, workerWake, operatorPush });

await writeFile(path.join(runtimeDir, "proof-rescue.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "proof-rescue.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "proof-rescue.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "proof-rescue.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

function buildPayload({ proofSla, liveAdQa, workerWake, operatorPush }) {
  const operatorActions = selectOperatorActions(operatorPush);
  const actions = operatorActions.length >= 4
    ? operatorActions.map(normalizeAction)
    : Array.isArray(proofSla.doNow)
      ? proofSla.doNow.map(normalizeAction)
      : [];
  const firstActions = actions.slice(0, args.limit);
  const proofState = String(operatorPush.state ?? proofSla.proofState ?? workerWake.proofState ?? "missing");

  return {
    schema: "worldcup26-proof-rescue-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: firstActions.length > 0 && ["warning", "critical", "fresh"].includes(proofState),
    proofState,
    latestExternalProofAgeLabel: String(
      operatorPush.latestExternalProofAge ?? proofSla.latestExternalProofAgeLabel ?? workerWake.latestExternalProofAgeLabel ?? "none",
    ),
    urgentOpenRows: Number(operatorPush.urgentOpenRows ?? proofSla.counts?.urgentOpenRows ?? workerWake.urgentOpenRows ?? firstActions.length),
    liveAdQaOk: Boolean(liveAdQa.ok),
    actionCount: firstActions.length,
    actions: firstActions,
    operatorText: operatorText(firstActions),
    rule:
      "Use this to do real posts/messages now. Log proof only after the post, story, message, upload, reply, or approval request actually exists.",
  };
}

function selectOperatorActions(operatorPush) {
  const actions = Array.isArray(operatorPush?.actions) ? operatorPush.actions : [];
  if (operatorPush?.actionMode !== "zero-signup-rescue" || actions.length < 4) return [];
  return actions.map((action) => ({
    priority: String(action.priority ?? ""),
    owner: String(action.owner ?? ""),
    channel: String(action.channel ?? ""),
    mode: "zero-signup rescue",
    action: String(action.action ?? ""),
    asset: String(action.asset ?? ""),
    ageLabel: String(action.ageLabel || "now"),
    trackedLink: String(action.trackedLink || action.link || REFERRAL_LINK),
    copy: String(action.copy ?? ""),
    phoneInstruction: String(action.phoneInstruction || action.instruction || ""),
    proofCommand: String(action.proofCommand || action.attemptCommand || ""),
    shareLinks: Array.isArray(action.shareLinks) ? action.shareLinks : [],
  }));
}

function normalizeAction(row) {
  const priority = String(row.priority ?? "").trim();
  const channel = String(row.channel ?? "").trim();
  const mode = String(row.mode ?? "").trim();
  const proofStatus = String(row.proofStatus ?? proofStatusFor(mode)).trim();
  const share = normalizeShare(row);
  return {
    priority,
    owner: String(row.owner ?? "").trim(),
    channel,
    mode,
    action: String(row.action ?? "").trim(),
    asset: String(row.asset ?? "").trim(),
    ageLabel: String(row.ageLabel ?? "").trim(),
    trackedLink: String(row.trackedLink ?? "").trim(),
    copy: String(row.combinedCopy ?? row.copy ?? "").trim(),
    proofStatus,
    proofNote: String(row.proofNote ?? "").trim(),
    proofCommand: String(row.proofCommand ?? proofCommandFor(priority, proofStatus)).trim(),
    share,
    phoneInstruction: String(row.phoneInstruction || phoneInstructionFor(channel, row.asset)),
  };
}

function normalizeShare(row) {
  const fromObject = {
    whatsapp: String(row.share?.whatsapp ?? "").trim(),
    telegram: String(row.share?.telegram ?? "").trim(),
    x: String(row.share?.x ?? "").trim(),
    facebook: String(row.share?.facebook ?? "").trim(),
  };
  if (Object.values(fromObject).some(Boolean)) return fromObject;
  const links = Array.isArray(row.shareLinks) ? row.shareLinks : [];
  const share = { whatsapp: "", telegram: "", x: "", facebook: "" };
  for (const link of links) {
    const key = String(link.key || link.label || "").toLowerCase();
    const url = String(link.url || "");
    if (key.includes("whatsapp")) share.whatsapp ||= url;
    else if (key.includes("telegram")) share.telegram ||= url;
    else if (key === "x" || key.includes("twitter")) share.x ||= url;
    else if (key.includes("facebook")) share.facebook ||= url;
  }
  return share;
}

function phoneInstructionFor(channel, asset) {
  const value = String(channel ?? "").toLowerCase();
  if (value.includes("whatsapp") && value.includes("status")) {
    return `Open WhatsApp Status, select ${asset || "the video"}, paste the caption, publish, then log a private status proof note.`;
  }
  if (value.includes("whatsapp")) {
    return "Open WhatsApp, send the invite to warm contacts, count how many people received it, then log that count.";
  }
  if (value.includes("instagram") || value.includes("facebook story")) {
    return "Open Instagram or Facebook Story, upload the image/video, add the link/code, publish, then log the account note or screenshot note.";
  }
  if (value.includes("tiktok") || value.includes("short") || value.includes("reel")) {
    return "Upload the video, put the code/link in the first caption line, publish or save processing note, then log the URL or private note.";
  }
  if (value.includes("football")) {
    return "Ask the group admin first. If approved, post. If only permission was requested, log the approval-request proof note.";
  }
  return "Do the real action in the named channel first, then log proof.";
}

function operatorText(actions) {
  const lines = [
    "WorldCup26 proof rescue",
    "",
    "Do these now, in order:",
  ];
  for (const action of actions) {
    lines.push(`${action.priority}. ${action.owner} / ${action.channel}: ${action.action}`);
  }
  lines.push("", `Code: ${REFERRAL_CODE}`, `Link: ${REFERRAL_LINK}`);
  return lines.join("\n");
}

function proofStatusFor(mode) {
  const value = String(mode ?? "").toLowerCase();
  if (value.includes("approval")) return "requested";
  if (value.includes("reply")) return "replied";
  if (value.includes("outreach")) return "sent";
  return "posted";
}

function proofCommandFor(priority, status) {
  return `node campaign-proof-intake.mjs --priority ${shellQuote(priority)} --account "ACCOUNT_OR_PHONE" --audience "AUDIENCE" --happened-at ${shellQuote(formatEestLogTime(now))} --status ${shellQuote(status)}`;
}

function renderText(payload) {
  const lines = [
    `WorldCup26 proof rescue ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.proofState} latest_external=${payload.latestExternalProofAgeLabel} urgent=${payload.urgentOpenRows} live_ad=${payload.liveAdQaOk ? "ok" : "fail"}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    "",
    "do_now:",
  ];
  for (const action of payload.actions) {
    lines.push(`- #${action.priority} ${action.owner} / ${action.channel} age=${action.ageLabel || "-"}`);
    lines.push(`  phone=${action.phoneInstruction}`);
    lines.push(`  asset=${action.asset}`);
    lines.push(`  link=${action.trackedLink}`);
    lines.push(`  proof_after_action=${action.proofCommand}`);
  }
  lines.push("", `Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Proof Rescue

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ready" : "not ready"}
- Proof state: ${payload.proofState}
- Latest external proof age: ${payload.latestExternalProofAgeLabel}
- Urgent rows: ${payload.urgentOpenRows}
- Live ad QA: ${payload.liveAdQaOk ? "ok" : "fail"}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

${payload.rule}

## Operator Text

\`\`\`text
${payload.operatorText}
\`\`\`

## Do Now

${payload.actions.map(renderActionMarkdown).join("\n\n")}
`;
}

function renderActionMarkdown(action) {
  return `### #${action.priority} ${action.owner} / ${action.channel}

- Age: ${action.ageLabel || "-"}
- Phone: ${action.phoneInstruction}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}

\`\`\`text
${action.copy}
\`\`\`

\`\`\`bash
${action.proofCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Proof Rescue</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a2b21; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 12% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 92% 4%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 12px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 8px; background: rgba(10,43,33,.94); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(38px, 11vw, 76px); line-height: .88; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0 0 8px; color: var(--muted); line-height: 1.4; }
    .status { display: inline-flex; margin: 4px 0 12px; padding: 7px 10px; border-radius: 999px; color: #03140f; background: var(--mint); font-weight: 950; text-transform: uppercase; }
    .status.critical, .status.missing { background: var(--danger); }
    .meta { color: var(--gold); font-weight: 900; overflow-wrap: anywhere; }
    .grid { display: grid; gap: 10px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button { min-height: 44px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; padding: 9px; font: inherit; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    @media (min-width: 760px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Proof Rescue</h1>
      <span class="status ${escapeAttr(payload.proofState)}">${escapeHtml(payload.proofState)}</span>
      <p class="meta">Latest external proof: ${escapeHtml(payload.latestExternalProofAgeLabel)} / urgent ${payload.urgentOpenRows}</p>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="buttons">
        <button data-copy="${escapeAttr(payload.operatorText)}">Copy rescue list</button>
        <a class="button gold" href="${escapeAttr(payload.referralLink)}" target="_blank" rel="noreferrer">Open referral link</a>
      </div>
    </header>
    <section class="grid">${payload.actions.map(renderActionCard).join("")}</section>
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

function renderActionCard(action) {
  const buttons = [
    action.trackedLink ? `<a class="button gold" href="${escapeAttr(action.trackedLink)}" target="_blank" rel="noreferrer">Open link</a>` : "",
    action.share.whatsapp ? `<a class="button" href="${escapeAttr(action.share.whatsapp)}" target="_blank" rel="noreferrer">WhatsApp</a>` : "",
    action.share.telegram ? `<a class="button" href="${escapeAttr(action.share.telegram)}" target="_blank" rel="noreferrer">Telegram</a>` : "",
    action.share.x ? `<a class="button" href="${escapeAttr(action.share.x)}" target="_blank" rel="noreferrer">X</a>` : "",
    action.share.facebook ? `<a class="button" href="${escapeAttr(action.share.facebook)}" target="_blank" rel="noreferrer">Facebook</a>` : "",
    `<button data-copy="${escapeAttr(action.copy)}">Copy caption</button>`,
    `<button data-copy="${escapeAttr(action.proofCommand)}">Copy proof command</button>`,
  ].filter(Boolean).join("");
  return `<article>
    <h2>#${escapeHtml(action.priority)} ${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</h2>
    <p>${escapeHtml(action.action)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(action.phoneInstruction)}</p>
    <p><strong>Asset:</strong> ${escapeHtml(action.asset)}</p>
    <pre>${escapeHtml(action.copy)}</pre>
    <div class="buttons">${buttons}</div>
  </article>`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "", limit: 4 };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--limit") parsed.limit = Number(rawArgs[++index] ?? parsed.limit);
  }
  return parsed;
}

function shellQuote(value) {
  const text = String(value ?? "");
  if (/^[A-Za-z0-9_./:=+-]+$/.test(text)) return text;
  return `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
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
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}
