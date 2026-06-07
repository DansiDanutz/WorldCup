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
const status = await readJson(path.join(runtimeDir, "campaign-status.json"), {});
const paidTraffic = await readJson(path.join(runtimeDir, "paid-traffic-guard.json"), {});
const actions = postNowRows
  .map(normalizePostNowRow)
  .filter((row) => row.priority)
  .slice(0, 6);
const payload = {
  generatedAt: now.toISOString(),
  generatedAtEest: formatEestLogTime(now),
  referralCode: REFERRAL_CODE,
  referralLink: REFERRAL_LINK,
  proofRows: Number(status?.postingProof?.loggedCount ?? 0),
  urgentRows: postNowRows.length,
  paidTrafficOk: Boolean(paidTraffic.ok),
  deployment: Array.isArray(paidTraffic.deploymentIds) ? paidTraffic.deploymentIds[0] ?? "" : "",
  actions,
};

await writeFile(path.join(runtimeDir, "top-six-mobile.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "top-six-mobile.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "top-six-mobile.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "top-six-mobile.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function normalizePostNowRow(row) {
  const priority = String(row.priority ?? "").trim();
  const owner = String(row.owner ?? "").trim();
  const channel = String(row.channel ?? "").trim();
  const mode = String(row.mode ?? "").trim();
  const asset = String(row.asset ?? "").trim();
  const copy = String(row.primary_copy ?? "").trim();
  const firstComment = String(row.first_comment ?? "").trim();
  const combinedCopy = [copy, firstComment ? `Follow-up:\n${firstComment}` : ""]
    .filter(Boolean)
    .join("\n\n");
  const proofStatus = proofStatusFor(mode);
  const proofNote = proofNoteFor(row);
  return {
    priority,
    owner,
    channel,
    mode,
    action: String(row.action ?? "").trim(),
    asset,
    assetHref: assetHref(asset),
    scheduledAtEest: String(row.scheduled_at_eest ?? "").trim(),
    trackedLink: String(row.tracked_link ?? "").trim(),
    copy,
    combinedCopy,
    proofStatus,
    proofNote,
    proofCommand: `node campaign-proof-log.mjs --priority ${shellQuote(priority)} --proof-url ${shellQuote(proofNote)} --status ${shellQuote(proofStatus)}`,
    share: {
      whatsapp: String(row.whatsapp_share_url ?? "").trim(),
      telegram: String(row.telegram_share_url ?? "").trim(),
      x: String(row.x_share_url ?? "").trim(),
      facebook: String(row.facebook_share_url ?? "").trim(),
    },
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 top-six mobile ${payload.generatedAtEest}`,
    `paid=${payload.paidTrafficOk ? "ok" : "fail"} proof=${payload.proofRows} urgent=${payload.urgentRows} dpl=${payload.deployment || "-"}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    "",
  ];
  for (const action of payload.actions) {
    lines.push(`#${action.priority} ${action.owner} / ${action.channel}`);
    lines.push(`  action=${action.action}`);
    lines.push(`  asset=${action.asset}`);
    lines.push(`  link=${action.trackedLink}`);
    lines.push(`  proof_template=${action.proofNote}`);
  }
  lines.push("", "Open runtime/top-six-mobile.html on a phone. Do the real action first, then log proof.", "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Top Six Mobile

Generated: ${payload.generatedAtEest}

- Paid traffic guard: ${payload.paidTrafficOk ? "ok" : "fail"}
- Deployment: ${payload.deployment || "-"}
- Proof rows: ${payload.proofRows}
- Urgent rows: ${payload.urgentRows}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

Open \`runtime/top-six-mobile.html\` on a phone. Start with these six actions, because they are the oldest external rows still missing real proof.

${payload.actions.map(renderActionMarkdown).join("\n\n") || "No urgent rows currently need proof."}
`;
}

function renderActionMarkdown(action) {
  return `## #${action.priority} ${action.owner} / ${action.channel}

- Action: ${action.action}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}
- Proof template: ${action.proofNote}

\`\`\`text
${action.copy}
\`\`\``;
}

function renderHtml(payload) {
  const cards = payload.actions.map(renderActionHtml).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Top Six Mobile</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a2b21; --line: rgba(255,255,255,.15); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(116,240,178,.16), transparent 24rem), radial-gradient(circle at 92% 8%, rgba(255,217,116,.18), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(900px, 100%); margin: 0 auto; padding: 12px 10px 44px; }
    header, article, section { border: 1px solid var(--line); border-radius: 8px; background: rgba(10,43,33,.94); }
    header { padding: 16px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(32px, 10vw, 58px); line-height: .92; letter-spacing: 0; }
    h2 { margin: 0; font-size: 22px; }
    p { margin: 0; color: var(--muted); line-height: 1.4; }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 21px; overflow-wrap: anywhere; }
    article { padding: 14px; margin-bottom: 10px; }
    .tag { display: inline-grid; place-items: center; min-width: 38px; height: 34px; margin-bottom: 8px; color: #041a13; background: var(--gold); border-radius: 8px; font-weight: 950; }
    .meta { display: grid; gap: 4px; margin: 9px 0; color: var(--muted); font-size: 13px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button { min-height: 44px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; padding: 9px; font: inherit; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; }
    .secondary { background: rgba(255,255,255,.07); color: var(--mint); }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    .warn { color: var(--danger); font-weight: 850; }
    @media (min-width: 760px) { .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } .cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } article { margin-bottom: 0; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Top Six Mobile</h1>
      <p>Open this on a phone. Do these first. Log proof only after the real post, story, message, upload, reply, or approval request exists.</p>
      <div class="stats">
        <div class="stat"><span>Code</span><strong>${escapeHtml(payload.referralCode)}</strong></div>
        <div class="stat"><span>Paid guard</span><strong>${payload.paidTrafficOk ? "ok" : "fail"}</strong></div>
        <div class="stat"><span>Proof rows</span><strong>${payload.proofRows}</strong></div>
        <div class="stat"><span>Urgent</span><strong>${payload.urgentRows}</strong></div>
      </div>
      <div class="buttons">
        <button class="gold" data-copy="${escapeAttr(payload.referralLink)}">Copy referral link</button>
        <button data-copy="${escapeAttr(`Code: ${payload.referralCode}\n${payload.referralLink}`)}">Copy code + link</button>
        <a class="button secondary" href="../media/worldcup26-main-video.mp4" target="_blank" rel="noreferrer">Open video</a>
        <a class="button secondary" href="../media/worldcup26-qr-story.jpg" target="_blank" rel="noreferrer">Open QR story</a>
      </div>
    </header>
    <section class="cards">${cards || "<article><h2>No urgent rows</h2><p>No urgent rows currently need proof.</p></article>"}</section>
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

function renderActionHtml(action) {
  const proofHelp = `After real action: ${action.proofNote}`;
  return `<article>
    <span class="tag">#${escapeHtml(action.priority)}</span>
    <h2>${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</h2>
    <div class="meta">
      <div><strong>Action:</strong> ${escapeHtml(action.action)}</div>
      <div><strong>Asset:</strong> ${escapeHtml(action.asset)}</div>
      <div><strong>Scheduled:</strong> ${escapeHtml(action.scheduledAtEest)}</div>
    </div>
    <pre>${escapeHtml(action.copy)}</pre>
    <div class="buttons">
      <button class="gold" data-copy="${escapeAttr(action.copy)}">Copy caption</button>
      <button data-copy="${escapeAttr(action.trackedLink)}">Copy link</button>
      ${action.assetHref ? `<a class="button secondary" href="${escapeAttr(action.assetHref)}" target="_blank" rel="noreferrer">Open asset</a>` : ""}
      ${action.share.whatsapp ? `<a class="button secondary" href="${escapeAttr(action.share.whatsapp)}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
      ${action.share.telegram ? `<a class="button secondary" href="${escapeAttr(action.share.telegram)}" target="_blank" rel="noreferrer">Telegram</a>` : ""}
      ${action.share.x ? `<a class="button secondary" href="${escapeAttr(action.share.x)}" target="_blank" rel="noreferrer">X</a>` : ""}
      ${action.share.facebook ? `<a class="button secondary" href="${escapeAttr(action.share.facebook)}" target="_blank" rel="noreferrer">Facebook</a>` : ""}
      <button data-copy="${escapeAttr(proofHelp)}">Copy proof help</button>
      <button class="secondary" data-copy="${escapeAttr(action.proofCommand)}">Copy proof command</button>
    </div>
    <p class="warn">Do not log proof before the real action happened.</p>
  </article>`;
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
    return `approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset/copy ready; ${codePart}; post only after allowed`;
  }
  if (channel.includes("dm") || channel.includes("reply") || mode.includes("reply")) {
    return `private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; ${codePart}; next follow-up <date/action>`;
  }
  return `manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; replace with public URL when available`;
}

function assetHref(asset) {
  const value = String(asset ?? "").trim();
  if (!value) return "";
  if (value.startsWith("media/")) return `../${value}`;
  if (value.startsWith("assets/")) return `../${value}`;
  if (value.startsWith("campaign/")) return `../${value.slice("campaign/".length)}`;
  return "";
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
    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
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
  const part = (type) => parts.find((entry) => entry.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")} +0300`;
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
