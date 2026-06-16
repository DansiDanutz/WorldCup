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

const postNowRows = await readCsv(path.join(runtimeDir, "post-now.csv"));
const pulseRows = await readCsv(path.join(runtimeDir, "nonstop-pulse.csv"));
const proofRows = await readCsv(path.join(runtimeDir, "posting-log-live.csv"));
const status = await readJson(path.join(runtimeDir, "campaign-status.json"), {});
const operatorPush = await readJson(path.join(runtimeDir, "operator-push-packet.json"), {});

const payload = buildPayload({ postNowRows, pulseRows, proofRows, status, operatorPush });

await writeFile(path.join(runtimeDir, "session-recovery.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "session-recovery.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "session-recovery.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "session-recovery.html"), renderHtml(payload));

if (!args.quiet) process.stdout.write(renderText(payload));

function buildPayload({ postNowRows, pulseRows, proofRows, status, operatorPush }) {
  const urgent = postNowRows.map(normalizePostNowRow).filter((row) => row.priority);
  const pulses = pulseRows.map(normalizePulseRow).filter((row) => row.pulse);
  const proofs = proofRows.map(normalizeProofRow).filter((row) => row.timestampEest);
  const operatorActions = selectOperatorActions(operatorPush);
  const latestProofs = proofs.slice(-12).reverse();
  const blockers = latestProofs.filter((row) =>
    /not logged in|login needed|logged out|fresh browser sessions checked/i.test(
      `${row.proofUrl} ${row.signupNotes} ${row.nextFollowup}`,
    ),
  );

  const xPulse =
    firstUnloggedPulse(pulses, proofs, (row) => /x \/ public fallback/i.test(row.channel)) ??
    pulses.find((row) => /x \/ public fallback/i.test(row.channel)) ??
    null;
  const facebookPulse =
    firstUnloggedPulse(pulses, proofs, (row) => /facebook\/feed fallback/i.test(row.channel)) ??
    pulses.find((row) => /facebook\/feed fallback/i.test(row.channel)) ??
    null;

  const phoneActions = operatorActions.length >= 4 ? operatorActions : urgent.slice(0, 6);
  const recoveryActions = operatorActions.length >= 4
    ? operatorRecoveryActions(operatorActions)
    : [
        xPulse
          ? publicRecoveryAction({
              key: "x",
              label: "X public fallback",
              loginUrl: "https://x.com/i/flow/login",
              shareUrl: shareUrl("x", xPulse.copy, xPulse.trackedLink),
              pulse: xPulse,
              proofCommand: pulseProofCommand(xPulse.pulse, "manual post", "PUBLIC_X_POST_URL"),
            })
          : null,
        facebookPulse
          ? publicRecoveryAction({
              key: "facebook",
              label: "Facebook feed fallback",
              loginUrl: "https://www.facebook.com/login/",
              shareUrl: shareUrl("facebook", facebookPulse.copy, facebookPulse.trackedLink),
              pulse: facebookPulse,
              proofCommand: pulseProofCommand(facebookPulse.pulse, "manual post", "PUBLIC_FACEBOOK_POST_URL_OR_ACCOUNT_NOTE"),
            })
          : null,
      ].filter(Boolean);

  return {
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    proofRows: Number(status?.postingProof?.loggedCount ?? proofs.length),
    urgentRows: Number(operatorPush?.urgentOpenRows ?? status?.postingProof?.unloggedDueCount ?? urgent.length),
    blockerCount: blockers.length,
    blockers: blockers.slice(0, 4),
    phoneActions,
    recoveryActions,
  };
}

function operatorRecoveryActions(operatorActions) {
  const xAction = operatorActions.find((row) => /x|football feed/i.test(row.channel)) ?? operatorActions[0];
  const facebookAction = operatorActions.find((row) => /story|facebook|whatsapp status/i.test(row.channel)) ?? operatorActions[0];
  return [
    xAction ? publicFallbackAction("x", "X rescue share", "https://x.com/i/flow/login", xAction) : null,
    facebookAction
      ? publicFallbackAction("facebook", "Facebook rescue share", "https://www.facebook.com/login/", facebookAction)
      : null,
  ].filter(Boolean);
}

function selectOperatorActions(operatorPush) {
  const actions = Array.isArray(operatorPush?.actions) ? operatorPush.actions : [];
  if (operatorPush?.actionMode !== "zero-signup-rescue" || actions.length < 4) return [];
  return actions.map((action) => ({
    priority: String(action.priority ?? ""),
    scheduledAtEest: String(action.ageLabel || "now"),
    owner: String(action.owner ?? ""),
    channel: String(action.channel ?? ""),
    mode: "zero-signup rescue",
    action: String(action.action ?? ""),
    asset: String(action.asset ?? ""),
    trackedLink: String(action.trackedLink || action.link || REFERRAL_LINK),
    copy: String(action.copy ?? ""),
    proofCommand: String(action.proofCommand || action.attemptCommand || ""),
    shareLinks: Array.isArray(action.shareLinks) ? action.shareLinks : [],
  }));
}

function publicFallbackAction(key, label, loginUrl, action) {
  return {
    key,
    label,
    scheduledAtEest: action.scheduledAtEest,
    action: action.action,
    asset: action.asset,
    trackedLink: action.trackedLink,
    copy: action.copy,
    loginUrl,
    shareUrl: findShareUrl(action, key) || shareUrl(key, action.copy, action.trackedLink),
    proofCommand: action.proofCommand,
  };
}

function findShareUrl(action, key) {
  const links = Array.isArray(action.shareLinks) ? action.shareLinks : [];
  const match = links.find((link) => String(link.key || link.label || "").toLowerCase().includes(key));
  return match ? String(match.url || "") : "";
}

function publicRecoveryAction({ key, label, loginUrl, shareUrl, pulse, proofCommand }) {
  return {
    key,
    label,
    scheduledAtEest: pulse.scheduledAtEest,
    action: pulse.action,
    asset: pulse.asset,
    trackedLink: pulse.trackedLink,
    copy: pulse.copy,
    loginUrl,
    shareUrl,
    proofCommand,
  };
}

function firstUnloggedPulse(pulses, proofRows, predicate) {
  const provenLinks = new Set(proofRows.map((row) => row.link).filter(Boolean));
  const candidates = pulses.filter((row) => predicate(row) && !provenLinks.has(row.trackedLink));
  const due = candidates
    .filter((row) => {
      const scheduledAt = parseEestLogTime(row.scheduledAtEest);
      return scheduledAt && scheduledAt.getTime() <= now.getTime();
    })
    .sort((left, right) => {
      const leftDate = parseEestLogTime(left.scheduledAtEest);
      const rightDate = parseEestLogTime(right.scheduledAtEest);
      return (rightDate?.getTime() ?? 0) - (leftDate?.getTime() ?? 0);
    });
  if (due[0]) return due[0];
  return candidates
    .sort((left, right) => {
      const leftDate = parseEestLogTime(left.scheduledAtEest);
      const rightDate = parseEestLogTime(right.scheduledAtEest);
      return (leftDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (rightDate?.getTime() ?? Number.MAX_SAFE_INTEGER);
    })
    .at(0) ?? null;
}

function normalizePostNowRow(row) {
  return {
    priority: String(row.priority ?? "").trim(),
    scheduledAtEest: String(row.scheduled_at_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    mode: String(row.mode ?? "").trim(),
    action: String(row.action ?? "").trim(),
    asset: String(row.asset ?? "").trim(),
    trackedLink: String(row.tracked_link ?? "").trim(),
    copy: String(row.primary_copy ?? "").trim(),
    proofCommand: priorityProofCommand(
      row.priority,
      row.mode,
      proofNoteExample(row),
    ),
  };
}

function normalizePulseRow(row) {
  return {
    pulse: String(row.pulse ?? "").trim(),
    scheduledAtEest: String(row.scheduled_at_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    mode: String(row.mode ?? "").trim(),
    action: String(row.action ?? "").trim(),
    asset: String(row.asset ?? "").trim(),
    trackedLink: String(row.tracked_link ?? "").trim(),
    copy: String(row.primary_copy ?? "").trim(),
  };
}

function normalizeProofRow(row) {
  return {
    timestampEest: String(row.timestamp_eest ?? "").trim(),
    scheduledAtEest: String(row.scheduled_at_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    asset: String(row.asset ?? "").trim(),
    link: String(row.link ?? "").trim(),
    status: String(row.status ?? "").trim(),
    proofUrl: String(row.proof_url ?? "").trim(),
    signupNotes: String(row.signup_notes ?? "").trim(),
    nextFollowup: String(row.next_followup ?? "").trim(),
  };
}

function priorityProofCommand(priority, mode, proofUrl) {
  return `node campaign-proof-log.mjs --priority "${priority}" --proof-url ${shellQuote(proofUrl)} --status "${proofStatusFor(mode)}"`;
}

function pulseProofCommand(pulse, mode, proofUrl) {
  return `node campaign-proof-log.mjs --pulse "${pulse}" --proof-url ${shellQuote(proofUrl)} --status "${proofStatusFor(mode)}"`;
}

function proofStatusFor(mode) {
  const value = String(mode ?? "").toLowerCase();
  if (value.includes("approval")) return "requested";
  if (value.includes("reply") || value.includes("repl")) return "replied";
  if (value.includes("outreach")) return "sent";
  if (value.includes("internal")) return "logged";
  return "posted";
}

function proofNoteExample(row) {
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
  if (channel.includes("instagram") || channel.includes("facebook story")) {
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

function shareUrl(kind, copy, trackedLink) {
  const text = String(copy || trackedLink || REFERRAL_LINK).trim();
  const url = String(trackedLink || REFERRAL_LINK).trim();
  if (kind === "x") return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  if (kind === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  if (kind === "whatsapp") return `https://wa.me/?text=${encodeURIComponent(text)}`;
  if (kind === "telegram") {
    return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  }
  return url;
}

function renderText(payload) {
  const lines = [
    `WorldCup26 session recovery ${payload.generatedAtEest}`,
    `proof=${payload.proofRows} urgent=${payload.urgentRows} blockers=${payload.blockerCount}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    "",
    "public_recovery:",
  ];
  for (const action of payload.recoveryActions) {
    lines.push(`- ${action.label}: login=${action.loginUrl}`);
    lines.push(`  share=${action.shareUrl}`);
    lines.push(`  proof_after_action=${action.proofCommand}`);
  }
  lines.push("", "phone_first:");
  for (const action of payload.phoneActions.slice(0, 4)) {
    lines.push(`- #${action.priority} ${action.owner} / ${action.channel}: ${action.action}`);
    lines.push(`  proof_after_action=${action.proofCommand}`);
  }
  lines.push("", "Proof rule: use these links to perform the real action first; log proof only after the post/message/story/request exists.", "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Session Recovery

Generated: ${payload.generatedAtEest}

- Proof rows: ${payload.proofRows}
- Urgent rows still needing real proof: ${payload.urgentRows}
- Recent login/session blockers: ${payload.blockerCount}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

Use this when a browser or app is logged out. Log proof only after the real post, story, message, reply, upload, or approval request happened.

## Public Session Recovery

${payload.recoveryActions.map(renderRecoveryMarkdown).join("\n\n") || "No public recovery action is available right now."}

## Phone-First Actions

${payload.phoneActions.slice(0, 6).map(renderPhoneMarkdown).join("\n\n") || "No urgent phone actions are open."}
`;
}

function renderRecoveryMarkdown(action) {
  return `### ${action.label}

- Scheduled: ${action.scheduledAtEest}
- Action: ${action.action}
- Asset: \`${action.asset}\`
- Login: ${action.loginUrl}
- Share: ${action.shareUrl}
- Link: ${action.trackedLink}

Copy:

\`\`\`text
${action.copy}
\`\`\`

Proof after real action:

\`\`\`bash
${action.proofCommand}
\`\`\``;
}

function renderPhoneMarkdown(action) {
  return `### #${action.priority} ${action.owner} / ${action.channel}

- Action: ${action.action}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}

Proof after real action:

\`\`\`bash
${action.proofCommand}
\`\`\``;
}

function renderHtml(payload) {
  const recoveryCards = payload.recoveryActions.map(renderRecoveryHtml).join("");
  const phoneCards = payload.phoneActions.slice(0, 6).map(renderPhoneHtml).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Session Recovery</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #092a21; --line: rgba(255,255,255,.15); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd56f; --mint: #78efb4; --green: #107455; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 10% 0%, rgba(120,239,180,.16), transparent 26rem), radial-gradient(circle at 90% 5%, rgba(255,213,111,.16), transparent 22rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 14px 10px 42px; }
    header, section, article { border: 1px solid var(--line); border-radius: 8px; background: rgba(9,42,33,.94); }
    header, section { padding: 16px; margin-bottom: 12px; }
    h1 { margin: 0 0 8px; font-size: clamp(30px, 8vw, 56px); line-height: .95; letter-spacing: 0; }
    h2 { margin: 0 0 10px; }
    h3, p { margin: 0; }
    p { color: var(--muted); line-height: 1.45; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
    .stat, article { border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; overflow-wrap: anywhere; }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    article { display: grid; gap: 10px; }
    pre { margin: 0; border: 1px solid var(--line); border-radius: 8px; padding: 11px; background: rgba(0,0,0,.28); white-space: pre-wrap; word-break: break-word; max-height: 230px; overflow: auto; }
    .actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    a, button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid rgba(120,239,180,.46); border-radius: 8px; padding: 9px 10px; background: var(--green); color: white; text-decoration: none; font: inherit; font-weight: 900; text-align: center; cursor: pointer; }
    button.secondary, a.secondary { background: rgba(255,255,255,.07); color: var(--mint); }
    .warn { color: var(--gold); font-weight: 900; }
    @media (max-width: 760px) { .stats, .grid, .actions { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Session Recovery</h1>
      <p>Login, share, then log proof. This page does not mark anything posted by itself.</p>
      <div class="stats">
        <div class="stat"><span>Generated</span><strong>${escapeHtml(payload.generatedAtEest)}</strong></div>
        <div class="stat"><span>Proof</span><strong>${payload.proofRows}</strong></div>
        <div class="stat"><span>Urgent</span><strong>${payload.urgentRows}</strong></div>
        <div class="stat"><span>Code</span><strong>${escapeHtml(payload.referralCode)}</strong></div>
      </div>
    </header>
    <section>
      <h2>Public Session Recovery</h2>
      <div class="grid">${recoveryCards || "<p>No public recovery action is available right now.</p>"}</div>
    </section>
    <section>
      <h2>Phone-First Actions</h2>
      <div class="grid">${phoneCards || "<p>No urgent phone actions are open.</p>"}</div>
    </section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      event.preventDefault();
      await navigator.clipboard.writeText(button.dataset.copy || "");
      const text = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = text; }, 1100);
    });
  </script>
</body>
</html>
`;
}

function renderRecoveryHtml(action) {
  return `<article>
    <h3>${escapeHtml(action.label)}</h3>
    <p>${escapeHtml(action.action)}</p>
    <p class="warn">${escapeHtml(action.asset)}</p>
    <pre>${escapeHtml(action.copy)}</pre>
    <div class="actions">
      <a href="${escapeAttr(action.loginUrl)}" target="_blank" rel="noreferrer">Login</a>
      <a class="secondary" href="${escapeAttr(action.shareUrl)}" target="_blank" rel="noreferrer">Open share</a>
      <button class="secondary" data-copy="${escapeAttr(action.copy)}">Copy copy</button>
      <button class="secondary" data-copy="${escapeAttr(action.proofCommand)}">Copy proof</button>
    </div>
  </article>`;
}

function renderPhoneHtml(action) {
  return `<article>
    <h3>#${escapeHtml(action.priority)} ${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</h3>
    <p>${escapeHtml(action.action)}</p>
    <p class="warn">${escapeHtml(action.asset)}</p>
    <div class="actions">
      <a href="${escapeAttr(shareUrl("whatsapp", action.copy, action.trackedLink))}" target="_blank" rel="noreferrer">WhatsApp</a>
      <a class="secondary" href="${escapeAttr(shareUrl("telegram", action.copy, action.trackedLink))}" target="_blank" rel="noreferrer">Telegram</a>
      <button class="secondary" data-copy="${escapeAttr(action.copy)}">Copy copy</button>
      <button class="secondary" data-copy="${escapeAttr(action.proofCommand)}">Copy proof</button>
    </div>
  </article>`;
}

async function readJson(filePath, fallback = null) {
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
  const recordRows = [];
  let row = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(current);
      if (row.some((value) => value !== "")) recordRows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  if (current || row.length) {
    row.push(current);
    if (row.some((value) => value !== "")) recordRows.push(row);
  }
  const [header, ...body] = recordRows;
  if (!header) return rows;
  for (const record of body) {
    rows.push(Object.fromEntries(header.map((key, index) => [key, record[index] ?? ""])));
  }
  return rows;
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
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute} +0300`;
}

function parseEestLogTime(value) {
  const match = String(value ?? "").match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})\s+\+0300$/,
  );
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour) - 3, Number(minute)));
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
