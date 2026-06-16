#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");

await mkdir(runtimeDir, { recursive: true });

const nextHour = await readJson(path.join(runtimeDir, "next-hour-handoff.json"));
const linkSentinel = await readJson(path.join(runtimeDir, "link-sentinel.json"), { ok: false, checks: [] });
const cards = buildCards(nextHour);
const payload = {
  generatedAt: nextHour.generatedAt ?? new Date().toISOString(),
  generatedAtEest: nextHour.generatedAtEest ?? "",
  referralCode: nextHour.referralCode ?? "26BC4B90CB",
  referralLink: nextHour.referralLink ?? "https://worldcup26.world/login?ref=26BC4B90CB",
  liveProofRows: Number(nextHour.liveProofRows ?? 0),
  urgentRows: Number(nextHour.urgentRows ?? 0),
  linkOk: Boolean(linkSentinel.ok),
  deployment: firstDeployment(linkSentinel),
  cards,
};

await writeFile(path.join(runtimeDir, "posting-sprint.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "posting-sprint.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "posting-sprint.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "posting-sprint.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildCards(nextHour) {
  const workers = Array.isArray(nextHour.workers) ? nextHour.workers : [];
  return WORKERS.map((worker) => {
    const row = workers.find((candidate) => sameText(candidate.worker, worker)) ?? {};
    const source = row.urgent?.channel ? "urgent" : row.pulse?.channel ? "pulse" : "idle";
    const action = source === "urgent" ? row.urgent : source === "pulse" ? row.pulse : null;
    return normalizeCard(worker, source, action, row);
  });
}

function normalizeCard(worker, source, action, row) {
  if (!action) {
    return {
      worker,
      source,
      label: "No action",
      channel: "",
      action: "No action is assigned right now.",
      asset: "",
      scheduledAt: "",
      trackedLink: "",
      copy: "",
      proofNote: "",
      proofCommand: "",
      share: {},
      urgentCount: Number(row.urgentCount ?? 0),
    };
  }
  const label = source === "urgent" ? `Priority ${action.priority}` : `Pulse ${action.pulse}`;
  return {
    worker,
    source,
    label,
    channel: String(action.channel ?? ""),
    action: String(action.action ?? ""),
    asset: String(action.asset ?? ""),
    scheduledAt: String(action.scheduledAt ?? action.scheduledAtEest ?? ""),
    trackedLink: String(action.trackedLink ?? ""),
    copy: String(action.combinedCopy ?? action.copy ?? ""),
    proofNote: String(action.privateProofNote ?? ""),
    proofCommand: String(action.privateProofCommand ?? ""),
    share: action.share && typeof action.share === "object" ? action.share : {},
    urgentCount: Number(row.urgentCount ?? 0),
  };
}

function firstDeployment(linkSentinel) {
  const checks = Array.isArray(linkSentinel.checks) ? linkSentinel.checks : [];
  return checks.find((check) => check?.dplId)?.dplId ?? "";
}

function renderText(payload) {
  const lines = [
    `WorldCup26 posting sprint ${payload.generatedAtEest || payload.generatedAt}`,
    `proof=${payload.liveProofRows} urgent=${payload.urgentRows} link=${payload.linkOk ? "ok" : "fail"} dpl=${payload.deployment || "-"}`,
    "",
  ];
  for (const card of payload.cards) {
    lines.push(`${card.worker}: ${card.label} / ${card.channel || "idle"}`);
    lines.push(`  action=${card.action}`);
    if (card.asset) lines.push(`  asset=${card.asset}`);
    if (card.trackedLink) lines.push(`  link=${card.trackedLink}`);
    if (card.proofCommand) lines.push(`  proof_after_action=${card.proofCommand}`);
  }
  lines.push("", "Do the real post/message/story first. Then log proof with the provided command after replacing placeholders.", "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Posting Sprint

Generated: ${payload.generatedAtEest || payload.generatedAt}

- Live proof rows: ${payload.liveProofRows}
- Urgent rows still needing real proof: ${payload.urgentRows}
- Link sentinel: ${payload.linkOk ? "ok" : "fail"}
- Deployment: ${payload.deployment || "-"}

This is the tiny action board for the next push. Open the asset, copy the caption, post/send from the real account, then log proof only after the action happened.

${payload.cards.map(renderCardMarkdown).join("\n\n")}
`;
}

function renderCardMarkdown(card) {
  return `## ${card.worker} - ${card.label}

- Channel: ${card.channel || "-"}
- Scheduled: ${card.scheduledAt || "-"}
- Action: ${card.action}
- Asset: ${card.asset ? `\`${card.asset}\`` : "-"}
- Link: ${card.trackedLink || "-"}

${card.copy ? `Copy:\n\n\`\`\`text\n${card.copy}\n\`\`\`\n` : ""}
${card.proofNote ? `Proof note after real action:\n\n\`\`\`text\n${card.proofNote}\n\`\`\`\n` : ""}
${card.proofCommand ? `Proof command after real action:\n\n\`\`\`bash\n${card.proofCommand}\n\`\`\`` : ""}`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Posting Sprint</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #08271f; --line: rgba(255,255,255,.15); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd56f; --mint: #78efb4; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 5% 0%, rgba(120,239,180,.16), transparent 26rem), radial-gradient(circle at 90% 8%, rgba(255,213,111,.18), transparent 26rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 14px 10px 38px; }
    header, article { border: 1px solid var(--line); border-radius: 8px; background: rgba(8,39,31,.93); box-shadow: 0 20px 70px rgba(0,0,0,.28); }
    header { padding: 18px; margin-bottom: 12px; }
    h1 { margin: 0 0 8px; font-size: clamp(28px, 8vw, 54px); line-height: .95; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); line-height: 1.45; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; overflow-wrap: anywhere; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    article { padding: 14px; display: grid; gap: 10px; }
    .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
    h2 { margin: 0; font-size: 22px; }
    .tag { color: #03140f; background: linear-gradient(135deg, var(--gold), var(--mint)); border-radius: 999px; padding: 6px 9px; font-size: 12px; font-weight: 950; white-space: nowrap; }
    .asset { color: var(--gold); font-weight: 900; }
    pre { margin: 0; white-space: pre-wrap; word-break: break-word; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.28); padding: 12px; max-height: 260px; overflow: auto; }
    .actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    button, a { min-height: 42px; border: 1px solid rgba(120,239,180,.48); border-radius: 8px; color: white; background: #107455; display: inline-flex; align-items: center; justify-content: center; text-align: center; font-weight: 900; text-decoration: none; cursor: pointer; padding: 9px 10px; }
    .secondary { background: rgba(255,255,255,.07); color: var(--mint); }
    .warn { color: var(--gold); font-weight: 900; }
    @media (max-width: 760px) { .grid, .stats, .actions { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Posting Sprint</h1>
      <p>Four live actions. Post from the real account, then log proof. Do not log placeholders.</p>
      <div class="stats">
        <div class="stat"><span>Generated</span><strong>${escapeHtml(payload.generatedAtEest || payload.generatedAt)}</strong></div>
        <div class="stat"><span>Proof rows</span><strong>${payload.liveProofRows}</strong></div>
        <div class="stat"><span>Need proof</span><strong>${payload.urgentRows}</strong></div>
        <div class="stat"><span>Link</span><strong>${payload.linkOk ? "ok" : "fail"}</strong></div>
      </div>
    </header>
    <section class="grid" aria-label="Posting sprint actions">
      ${payload.cards.map(renderCardHtml).join("\n")}
    </section>
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

function renderCardHtml(card) {
  const shareLinks = card.share || {};
  return `<article>
    <div class="head">
      <div>
        <h2>${escapeHtml(card.worker)}</h2>
        <p><strong>${escapeHtml(card.label)}</strong> / ${escapeHtml(card.channel || "idle")}</p>
      </div>
      <span class="tag">${escapeHtml(card.source)}</span>
    </div>
    <p>${escapeHtml(card.action)}</p>
    ${card.asset ? `<p class="asset">${escapeHtml(card.asset)}</p>` : ""}
    ${card.copy ? `<pre>${escapeHtml(card.copy)}</pre>` : ""}
    <div class="actions">
      ${card.copy ? `<button data-copy="${escapeAttr(card.copy)}">Copy caption</button>` : ""}
      ${card.trackedLink ? `<button class="secondary" data-copy="${escapeAttr(card.trackedLink)}">Copy link</button>` : ""}
      ${shareLinks.whatsapp ? `<a class="secondary" href="${escapeAttr(shareLinks.whatsapp)}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
      ${shareLinks.telegram ? `<a class="secondary" href="${escapeAttr(shareLinks.telegram)}" target="_blank" rel="noreferrer">Telegram</a>` : ""}
      ${shareLinks.x ? `<a class="secondary" href="${escapeAttr(shareLinks.x)}" target="_blank" rel="noreferrer">X</a>` : ""}
      ${shareLinks.facebook ? `<a class="secondary" href="${escapeAttr(shareLinks.facebook)}" target="_blank" rel="noreferrer">Facebook</a>` : ""}
      ${card.proofNote ? `<button class="secondary" data-copy="${escapeAttr(card.proofNote)}">Copy proof note</button>` : ""}
      ${card.proofCommand ? `<button class="secondary" data-copy="${escapeAttr(card.proofCommand)}">Copy proof command</button>` : ""}
    </div>
    ${card.proofCommand ? `<p class="warn">Run proof command only after the real action happened and placeholders are replaced.</p>` : ""}
  </article>`;
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (fallback !== null) return fallback;
    throw new Error(`Could not read ${path.relative(campaignDir, filePath)}: ${error.message}`);
  }
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
  }
  return parsed;
}

function sameText(left, right) {
  return String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();
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
