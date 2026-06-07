#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = "https://worldcup26.world/login?ref=26BC4B90CB";
const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const dispatch = await readJson(path.join(runtimeDir, "dispatch-board.json"));
const postNowRows = await readCsv(path.join(runtimeDir, "post-now.csv"));
const payload = buildPayload(dispatch, postNowRows);

await writeFile(path.join(runtimeDir, "next-hour-handoff.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "next-hour-handoff.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "next-hour-handoff.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(
    [
      "WorldCup26 next-hour handoff ready",
      `Generated: ${payload.generatedAt}`,
      `Workers: ${payload.workers.length}`,
      `Urgent rows: ${payload.urgentRows}`,
      `Output: runtime/next-hour-handoff.html`,
      "",
    ].join("\n"),
  );
}

function buildPayload(dispatch, postNowRows) {
  const rowsByWorker = new Map();
  for (const row of postNowRows) {
    if (!rowsByWorker.has(row.owner)) rowsByWorker.set(row.owner, []);
    rowsByWorker.get(row.owner).push(row);
  }

  const dispatchWorkers = Array.isArray(dispatch?.workers) ? dispatch.workers : [];
  const workers = WORKERS.map((worker) => {
    const current = dispatchWorkers.find((row) => row.worker === worker);
    const urgentRows = rowsByWorker.get(worker) ?? [];
    const urgent =
      urgentRows.find((row) => row.priority === current?.current?.priority) ?? urgentRows[0] ?? null;
    const pulse = current?.currentPulse ?? null;
    return {
      worker,
      urgentCount: Number(current?.urgentCount ?? urgentRows.length ?? 0),
      urgent: urgent ? normalizeUrgentRow(urgent) : null,
      pulse: pulse ? normalizePulse(pulse) : null,
    };
  });

  return {
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: dispatch?.referralCode ?? REFERRAL_CODE,
    referralLink: dispatch?.referralLink ?? REFERRAL_LINK,
    liveProofRows: Number(dispatch?.liveProof?.loggedCount ?? 0),
    urgentRows: Number(dispatch?.urgentCount ?? postNowRows.length),
    pulseGeneratedAt: dispatch?.pulse?.generatedAt ?? null,
    workers,
  };
}

function normalizeUrgentRow(row) {
  const combinedCopy = [row.primary_copy, row.first_comment ? `Follow-up:\n${row.first_comment}` : ""]
    .filter(Boolean)
    .join("\n\n");
  const privateProofNote = proofNoteExample(row);
  return {
    priority: row.priority,
    scheduledAt: row.scheduled_at_eest,
    channel: row.channel,
    mode: row.mode,
    action: row.action,
    asset: row.asset,
    trackedLink: row.tracked_link,
    copy: row.primary_copy,
    firstComment: row.first_comment,
    combinedCopy,
    privateProofNote,
    privateProofCommand: proofCommand(row.priority, row.mode, privateProofNote),
    share: {
      whatsapp: row.whatsapp_share_url,
      telegram: row.telegram_share_url,
      x: row.x_share_url,
      facebook: row.facebook_share_url,
    },
  };
}

function normalizePulse(row) {
  const trackedLink = row.trackedLink ?? row.tracked_link ?? "";
  const copy = row.primaryCopy ?? row.primary_copy ?? "";
  const privateProofNote = proofNoteExample(row);
  return {
    pulse: row.pulse,
    scheduledAt: row.scheduledAtEest ?? row.scheduled_at_eest,
    channel: row.channel,
    mode: row.mode,
    action: row.action,
    asset: row.asset,
    trackedLink,
    copy,
    proofHint: row.proofHint ?? row.proof_hint ?? "",
    privateProofNote,
    privateProofCommand: pulseProofCommand(row.pulse, row.mode, privateProofNote),
    share: {
      whatsapp: shareUrl("whatsapp", copy, trackedLink),
      telegram: shareUrl("telegram", copy, trackedLink),
      x: shareUrl("x", copy, trackedLink),
      facebook: shareUrl("facebook", copy, trackedLink),
    },
  };
}

function proofCommand(priority, mode, proofUrl = "POST_URL_OR_PRIVATE_NOTE") {
  const status = proofStatusFor(mode);
  return `node campaign-proof-log.mjs --priority "${priority}" --proof-url ${shellQuote(proofUrl)} --status "${status}"`;
}

function pulseProofCommand(pulse, mode, proofUrl = "POST_URL_OR_PRIVATE_NOTE") {
  const status = proofStatusFor(mode);
  return `node campaign-proof-log.mjs --pulse "${pulse}" --proof-url ${shellQuote(proofUrl)} --status "${status}"`;
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
  if (channel.includes("telegram")) {
    return `private-telegram: posted/sent in <group/contact> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; admin-approved yes/no`;
  }
  if (channel.includes("instagram") || channel.includes("facebook story") || channel.includes("meta story")) {
    return `private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset ${asset}; code/link sticker or caption included`;
  }
  if (channel.includes("short") || channel.includes("reel") || channel.includes("tiktok") || channel.includes("youtube")) {
    return `public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}`;
  }
  if (channel.includes("football") || mode.includes("approval") || action.includes("permission")) {
    return `approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset/copy ready; ${codePart}; post only after allowed`;
  }
  if (channel.includes("discord")) {
    return `private-discord: posted in approved <server/channel> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}`;
  }
  if (channel.includes("dm") || channel.includes("reply") || mode.includes("reply")) {
    return `private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; ${codePart}; next follow-up <date/action>`;
  }
  if (channel.includes("copy") || mode.includes("internal")) {
    return `internal-log: prepared copy/asset handoff at YYYY-MM-DD HH:mm EEST; no public proof claimed; ${codePart}`;
  }
  return `manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset ${asset}; ${codePart}; replace with public URL when available`;
}

function shellQuote(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function renderMarkdown(payload) {
  return `# WorldCup26 Next-Hour Handoff

Generated: ${payload.generatedAtEest}

Referral code: \`${payload.referralCode}\`
Referral link: ${payload.referralLink}

Live proof rows: ${payload.liveProofRows}
Urgent rows still needing real proof: ${payload.urgentRows}

Use this page for the next manual push. Do not run proof commands until the post, story, message, reply, or approval request really happened.

${payload.workers.map(renderWorkerMarkdown).join("\n\n")}
`;
}

function renderWorkerMarkdown(worker) {
  const urgent = worker.urgent
    ? `## ${worker.worker} - Urgent ${worker.urgent.priority}

- Channel: ${worker.urgent.channel}
- Action: ${worker.urgent.action}
- Asset: \`${worker.urgent.asset}\`
- Link: ${worker.urgent.trackedLink}

\`\`\`text
${worker.urgent.combinedCopy}
\`\`\`

Private proof note template:

\`\`\`text
${worker.urgent.privateProofNote}
\`\`\`

Private proof command after real action:

\`\`\`bash
${worker.urgent.privateProofCommand}
\`\`\``
    : `## ${worker.worker} - No urgent row`;

  const pulse = worker.pulse
    ? `### Current Pulse

- Pulse: ${worker.pulse.pulse}
- Scheduled: ${worker.pulse.scheduledAt}
- Channel: ${worker.pulse.channel}
- Action: ${worker.pulse.action}
- Asset: \`${worker.pulse.asset}\`
- Link: ${worker.pulse.trackedLink}

\`\`\`text
${worker.pulse.copy}
\`\`\`

Pulse private proof note template:

\`\`\`text
${worker.pulse.privateProofNote}
\`\`\`

Pulse proof command after extra real action:

\`\`\`bash
${worker.pulse.privateProofCommand}
\`\`\``
    : "### Current Pulse\n\nNo current pulse.";

  return `${urgent}\n\n${pulse}`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Next-Hour Handoff</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #001a12;
      --panel: #06281f;
      --panel-2: #10372c;
      --gold: #ffd76d;
      --mint: #75f0b3;
      --text: #f7fff9;
      --muted: #bfd2ca;
      --line: rgba(255, 255, 255, 0.14);
      --danger: #ff8a8a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at 12% 0%, rgba(117, 240, 179, 0.2), transparent 28rem),
        radial-gradient(circle at 86% 10%, rgba(255, 215, 109, 0.18), transparent 26rem),
        var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main { width: min(980px, 100%); margin: 0 auto; padding: 18px 12px 40px; }
    header, article {
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--panel) 84%, transparent);
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(26px, 7vw, 44px); line-height: 0.95; }
    h2 { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 24px; }
    h3 { color: var(--mint); font-size: 15px; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.08em; }
    .sub { margin-top: 8px; color: var(--muted); font-size: 14px; line-height: 1.35; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
    .metric { background: rgba(255, 255, 255, 0.08); border: 1px solid var(--line); border-radius: 12px; padding: 10px; }
    .metric span { display: block; color: var(--muted); font-size: 11px; text-transform: uppercase; font-weight: 800; }
    .metric strong { display: block; margin-top: 4px; color: var(--gold); font-size: 20px; }
    .tag { font-size: 12px; font-weight: 900; padding: 6px 10px; border-radius: 999px; color: #092018; background: var(--gold); white-space: nowrap; }
    .tag.soft { background: rgba(117, 240, 179, 0.18); color: var(--mint); border: 1px solid rgba(117, 240, 179, 0.36); }
    .copy {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      background: #02140f;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px;
      margin-top: 10px;
      font-size: 14px;
      line-height: 1.35;
    }
    .row { display: grid; gap: 8px; margin-top: 12px; color: var(--muted); font-size: 13px; }
    .asset { color: var(--gold); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    a.button, button {
      appearance: none;
      border: 1px solid rgba(117, 240, 179, 0.42);
      border-radius: 12px;
      background: rgba(117, 240, 179, 0.13);
      color: var(--text);
      min-height: 44px;
      padding: 10px 12px;
      font: inherit;
      font-weight: 850;
      text-decoration: none;
      text-align: center;
      cursor: pointer;
    }
    a.button.primary, button.primary { background: #0c7b5b; border-color: #0c7b5b; }
    .pulse { background: rgba(255, 255, 255, 0.045); border-radius: 14px; padding: 12px; margin-top: 12px; border: 1px solid var(--line); }
    .warn { color: var(--danger); font-weight: 850; }
    @media (min-width: 760px) {
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Next-Hour Handoff</h1>
      <p class="sub">Post from owned accounts or approved communities. Log proof only after a real post, status, DM, reply, or approval request happens.</p>
      <div class="metrics">
        <div class="metric"><span>Code</span><strong>${escapeHtml(payload.referralCode)}</strong></div>
        <div class="metric"><span>Proof rows</span><strong>${payload.liveProofRows}</strong></div>
        <div class="metric"><span>Need proof</span><strong>${payload.urgentRows}</strong></div>
      </div>
      <div class="buttons">
        <button class="primary" data-copy="${escapeAttr(payload.referralLink)}">Copy referral link</button>
        <button data-copy="${escapeAttr(`Code: ${payload.referralCode}\n${payload.referralLink}`)}">Copy code + link</button>
      </div>
    </header>
    <section class="grid">
      ${payload.workers.map(renderWorkerHtml).join("\n")}
    </section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const value = button.getAttribute("data-copy");
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

function renderWorkerHtml(worker) {
  const urgent = worker.urgent
    ? `
      <div class="row">
        <div><strong>Channel:</strong> ${escapeHtml(worker.urgent.channel)}</div>
        <div><strong>Action:</strong> ${escapeHtml(worker.urgent.action)}</div>
        <div><strong>Asset:</strong> <span class="asset">${escapeHtml(worker.urgent.asset)}</span></div>
        <div><strong>Link:</strong> ${escapeHtml(worker.urgent.trackedLink)}</div>
      </div>
      <div class="copy">${escapeHtml(worker.urgent.combinedCopy)}</div>
      <div class="buttons">
        <button class="primary" data-copy="${escapeAttr(worker.urgent.combinedCopy)}">Copy urgent copy</button>
        <button data-copy="${escapeAttr(worker.urgent.privateProofNote)}">Copy proof note</button>
        <button data-copy="${escapeAttr(worker.urgent.privateProofCommand)}">Copy private proof command</button>
        ${shareButton("WhatsApp", worker.urgent.share.whatsapp)}
        ${shareButton("Telegram", worker.urgent.share.telegram)}
        ${shareButton("X", worker.urgent.share.x)}
        ${shareButton("Facebook", worker.urgent.share.facebook)}
      </div>
      <h3>Private proof note template</h3>
      <div class="copy">${escapeHtml(worker.urgent.privateProofNote)}</div>
      <p class="sub warn">Run the proof command only after the action really happened.</p>`
    : `<p class="sub">No urgent row. Use the current pulse below.</p>`;

  const pulse = worker.pulse
    ? `<div class="pulse">
        <h3>Current Pulse ${escapeHtml(worker.pulse.pulse)}</h3>
        <div class="row">
          <div><strong>Scheduled:</strong> ${escapeHtml(worker.pulse.scheduledAt)}</div>
          <div><strong>Channel:</strong> ${escapeHtml(worker.pulse.channel)}</div>
          <div><strong>Action:</strong> ${escapeHtml(worker.pulse.action)}</div>
          <div><strong>Asset:</strong> <span class="asset">${escapeHtml(worker.pulse.asset)}</span></div>
        </div>
        <div class="copy">${escapeHtml(worker.pulse.copy)}</div>
        <div class="buttons">
          <button data-copy="${escapeAttr(worker.pulse.copy)}">Copy pulse copy</button>
          <button data-copy="${escapeAttr(worker.pulse.trackedLink)}">Copy pulse link</button>
          <button data-copy="${escapeAttr(worker.pulse.privateProofNote)}">Copy pulse proof note</button>
          <button data-copy="${escapeAttr(worker.pulse.privateProofCommand)}">Copy pulse proof command</button>
          ${shareButton("WhatsApp", worker.pulse.share.whatsapp)}
          ${shareButton("Telegram", worker.pulse.share.telegram)}
        </div>
        <h3>Pulse proof note</h3>
        <div class="copy">${escapeHtml(worker.pulse.privateProofNote)}</div>
      </div>`
    : "";

  return `<article>
    <h2>${escapeHtml(worker.worker)} <span class="tag ${worker.urgent ? "" : "soft"}">${worker.urgent ? `P${escapeHtml(worker.urgent.priority)}` : "pulse"}</span></h2>
    ${urgent}
    ${pulse}
  </article>`;
}

function shareButton(label, href) {
  if (!href) return "";
  return `<a class="button" href="${escapeAttr(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readCsv(filePath) {
  return parseCsv(await readFile(filePath, "utf8"));
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

  const [header, ...data] = rows.filter((candidate) => candidate.some((value) => value !== ""));
  if (!header) return [];
  return data.map((values) =>
    Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])),
  );
}

function shareUrl(platform, text, link) {
  const encodedText = encodeURIComponent(text);
  const encodedLink = encodeURIComponent(link);
  if (platform === "whatsapp") return `https://wa.me/?text=${encodedText}`;
  if (platform === "telegram") return `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
  if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
  return `https://twitter.com/intent/tweet?text=${encodedText}`;
}

function formatEestLogTime(date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(" ", " ")
    .concat(" +0300");
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--root") result.root = argv[++index];
    else if (arg === "--now") result.now = argv[++index];
    else if (arg === "--quiet") result.quiet = true;
  }
  return result;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}
