#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const SHARE_ORDER = ["whatsapp", "telegram", "x", "facebook"];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const proofRescue = await readJson(path.join(runtimeDir, "proof-rescue.json"), {});
const payload = buildPayload(proofRescue);
const workerPages = workerPagesFor(payload);
payload.workerPages = workerPages.map((page) => ({
  owner: page.owner,
  fileName: page.fileName,
  actionCount: page.actions.length,
}));
payload.workerPageCount = payload.workerPages.length;
payload.ok =
  payload.ok &&
  payload.workerPageCount >= 3 &&
  payload.workerPages.every((page) => page.owner && page.fileName.endsWith(".html") && page.actionCount > 0);

await writeFile(path.join(runtimeDir, "social-rescue-pack.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "social-rescue-pack.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "social-rescue-pack.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "social-rescue-pack.html"), renderHtml(payload));
for (const workerPage of workerPages) {
  await writeFile(path.join(runtimeDir, workerPage.fileName), workerPage.html);
}

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

function buildPayload(proofRescue) {
  const actions = Array.isArray(proofRescue.actions)
    ? proofRescue.actions.slice(0, args.limit).map(normalizeAction)
    : [];
  return {
    schema: "worldcup26-social-rescue-pack-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    proofState: String(proofRescue.proofState ?? "missing"),
    latestExternalProofAgeLabel: String(proofRescue.latestExternalProofAgeLabel ?? "none"),
    liveAdQaOk: Boolean(proofRescue.liveAdQaOk),
    actionCount: actions.length,
    ok:
      Boolean(proofRescue.ok) &&
      Boolean(proofRescue.liveAdQaOk) &&
      actions.length >= 4 &&
      actions.every((action) => action.shareLinks.length > 0 && action.copy && action.proofCommand),
    actions,
    copyAll: renderCopyAll(actions),
    rule:
      "Tap a social/share button to perform the real action. Use proof commands only after the real post, story, message, or permission request exists.",
  };
}

function normalizeAction(action) {
  const shareLinks = SHARE_ORDER.map((key) => ({
    key,
    label: labelForShare(key),
    url: String(action.share?.[key] ?? "").trim(),
  })).filter((link) => link.url);

  return {
    priority: String(action.priority ?? "").trim(),
    owner: String(action.owner ?? "").trim(),
    channel: String(action.channel ?? "").trim(),
    action: String(action.action ?? "").trim(),
    asset: String(action.asset ?? "").trim(),
    assetHref: assetHrefFor(action.asset),
    ageLabel: String(action.ageLabel ?? "").trim(),
    trackedLink: String(action.trackedLink ?? "").trim(),
    trackedQr: qrUrlFor(action.trackedLink),
    copy: String(action.copy ?? "").trim(),
    phoneInstruction: String(action.phoneInstruction ?? "").trim(),
    proofCommand: String(action.proofCommand ?? "").trim(),
    shareLinks,
  };
}

function assetHrefFor(asset) {
  const value = String(asset ?? "").trim();
  if (!value || value.includes("..")) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("campaign/")) return `../${value.slice("campaign/".length)}`;
  return `../${value.replace(/^\/+/, "")}`;
}

function qrUrlFor(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return `https://quickchart.io/qr?text=${encodeURIComponent(text)}&size=420&margin=2&ecLevel=M&format=png`;
}

function renderCopyAll(actions) {
  return actions
    .map((action) => `#${action.priority} ${action.owner} / ${action.channel}\n${action.copy}`)
    .join("\n\n---\n\n");
}

function labelForShare(key) {
  if (key === "whatsapp") return "WhatsApp";
  if (key === "telegram") return "Telegram";
  if (key === "x") return "X";
  if (key === "facebook") return "Facebook";
  return key;
}

function renderText(payload) {
  const lines = [
    `WorldCup26 social rescue pack ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.proofState} latest_external=${payload.latestExternalProofAgeLabel} live_ad=${payload.liveAdQaOk ? "ok" : "fail"} actions=${payload.actionCount}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    "",
    "tap_now:",
  ];
  for (const action of payload.actions) {
    lines.push(`- #${action.priority} ${action.owner} / ${action.channel} age=${action.ageLabel || "-"}`);
    lines.push(`  asset=${action.asset}`);
    lines.push(`  phone=${action.phoneInstruction}`);
    for (const shareLink of action.shareLinks) {
      lines.push(`  ${shareLink.key}=${shareLink.url}`);
    }
    lines.push(`  proof_after_action=${action.proofCommand}`);
  }
  lines.push("", `Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Social Rescue Pack

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ready" : "not ready"}
- Proof state: ${payload.proofState}
- Latest external proof age: ${payload.latestExternalProofAgeLabel}
- Live ad QA: ${payload.liveAdQaOk ? "ok" : "fail"}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

${payload.rule}

## Copy All Captions

\`\`\`text
${payload.copyAll}
\`\`\`

## Actions

${payload.actions.map(renderActionMarkdown).join("\n\n")}
`;
}

function renderActionMarkdown(action) {
  return `### #${action.priority} ${action.owner} / ${action.channel}

- Age: ${action.ageLabel || "-"}
- Asset: ${action.assetHref ? `[${action.asset}](${action.assetHref})` : `\`${action.asset}\``}
- Phone: ${action.phoneInstruction}
- Link: ${action.trackedLink}

${action.shareLinks.map((shareLink) => `- ${shareLink.label}: ${shareLink.url}`).join("\n")}

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
  <title>WorldCup26 Social Rescue Pack</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a2b21; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 92% 4%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 12px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 8px; background: rgba(10,43,33,.94); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(36px, 10vw, 72px); line-height: .9; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0 0 8px; color: var(--muted); line-height: 1.4; }
    .status { display: inline-flex; margin: 4px 0 12px; padding: 7px 10px; border-radius: 999px; color: #03140f; background: var(--mint); font-weight: 950; text-transform: uppercase; }
    .status.critical, .status.missing { background: var(--danger); }
    .meta { color: var(--gold); font-weight: 900; overflow-wrap: anywhere; }
    .grid { display: grid; gap: 10px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button { min-height: 46px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; padding: 9px; font: inherit; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    .secondary { background: rgba(255,255,255,.08); }
    .asset { display: grid; gap: 8px; margin: 10px 0; }
    .asset-preview { display: block; width: 100%; max-height: 320px; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); object-fit: cover; }
    .asset-path { color: var(--gold); font-size: 13px; font-weight: 900; overflow-wrap: anywhere; }
    .qr { display: grid; gap: 8px; margin: 10px 0; padding: 10px; border: 1px solid var(--line); border-radius: 8px; background: rgba(255,255,255,.06); }
    .qr img { width: min(210px, 100%); border: 8px solid #fff; border-radius: 8px; background: #fff; }
    .qr a { color: var(--gold); font-size: 13px; font-weight: 900; overflow-wrap: anywhere; }
    @media (min-width: 760px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Social Rescue</h1>
      <span class="status ${escapeAttr(payload.proofState)}">${escapeHtml(payload.proofState)}</span>
      <p class="meta">Latest proof: ${escapeHtml(payload.latestExternalProofAgeLabel)} / live ads ${payload.liveAdQaOk ? "ok" : "fail"}</p>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="buttons">
        <button data-copy="${escapeAttr(payload.copyAll)}">Copy all captions</button>
        <a class="button gold" href="${escapeAttr(payload.referralLink)}" target="_blank" rel="noreferrer">Open referral</a>
      </div>
      ${renderWorkerLinks(payload)}
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

function renderWorkerLinks(payload) {
  const links = workerPagesFor(payload)
    .map((page) => `<a class="button secondary" href="${escapeAttr(page.fileName)}">${escapeHtml(page.owner)}</a>`)
    .join("");
  if (!links) return "";
  return `<div class="buttons">${links}</div>`;
}

function workerPagesFor(payload) {
  const pages = new Map();
  for (const action of payload.actions) {
    const owner = action.owner || "Unassigned";
    const slug = slugify(owner);
    const page = pages.get(slug) ?? { owner, slug, actions: [] };
    page.actions.push(action);
    pages.set(slug, page);
  }
  return Array.from(pages.values()).map((page) => ({
    owner: page.owner,
    fileName: `social-rescue-${page.slug}.html`,
    actions: page.actions,
    html: renderWorkerHtml(payload, page.owner, page.actions),
  }));
}

function renderWorkerHtml(payload, owner, actions) {
  const scopedPayload = {
    ...payload,
    actions,
    copyAll: renderCopyAll(actions),
  };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(owner)} Social Rescue</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a2b21; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 92% 4%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(740px, 100%); margin: 0 auto; padding: 12px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 8px; background: rgba(10,43,33,.94); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 10vw, 64px); line-height: .92; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0 0 8px; color: var(--muted); line-height: 1.4; }
    .status { display: inline-flex; margin: 4px 0 12px; padding: 7px 10px; border-radius: 999px; color: #03140f; background: var(--mint); font-weight: 950; text-transform: uppercase; }
    .meta { color: var(--gold); font-weight: 900; overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button { min-height: 46px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; padding: 9px; font: inherit; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    .secondary { background: rgba(255,255,255,.08); }
    .asset { display: grid; gap: 8px; margin: 10px 0; }
    .asset-preview { display: block; width: 100%; max-height: 320px; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); object-fit: cover; }
    .asset-path { color: var(--gold); font-size: 13px; font-weight: 900; overflow-wrap: anywhere; }
    .qr { display: grid; gap: 8px; margin: 10px 0; padding: 10px; border: 1px solid var(--line); border-radius: 8px; background: rgba(255,255,255,.06); }
    .qr img { width: min(210px, 100%); border: 8px solid #fff; border-radius: 8px; background: #fff; }
    .qr a { color: var(--gold); font-size: 13px; font-weight: 900; overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(owner)} Rescue</h1>
      <span class="status">${escapeHtml(payload.proofState)}</span>
      <p class="meta">Latest proof: ${escapeHtml(payload.latestExternalProofAgeLabel)} / live ads ${payload.liveAdQaOk ? "ok" : "fail"}</p>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="buttons">
        <button data-copy="${escapeAttr(scopedPayload.copyAll)}">Copy my captions</button>
        <a class="button gold" href="social-rescue-pack.html">All workers</a>
      </div>
    </header>
    ${actions.map(renderActionCard).join("")}
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
  return `<article>
    <h2>#${escapeHtml(action.priority)} ${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</h2>
    <p>${escapeHtml(action.action)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(action.phoneInstruction)}</p>
    ${renderAssetBlock(action)}
    ${renderTrackedLinkBlock(action)}
    <pre>${escapeHtml(action.copy)}</pre>
    <div class="buttons">
      ${action.trackedLink ? `<a class="button" href="${escapeAttr(action.trackedLink)}" target="_blank" rel="noreferrer">Open tracked link</a><button class="secondary" data-copy="${escapeAttr(action.trackedLink)}">Copy tracked link</button>` : ""}
      ${action.assetHref ? `<a class="button" href="${escapeAttr(action.assetHref)}" target="_blank" rel="noreferrer">Open asset</a><a class="button secondary" href="${escapeAttr(action.assetHref)}" download>Download asset</a>` : ""}
      ${action.shareLinks.map((shareLink) => `<a class="button gold" href="${escapeAttr(shareLink.url)}" target="_blank" rel="noreferrer">${escapeHtml(shareLink.label)}</a>`).join("")}
      <button data-copy="${escapeAttr(action.copy)}">Copy caption</button>
      <button class="secondary" data-copy="${escapeAttr(action.proofCommand)}">Copy proof command</button>
    </div>
  </article>`;
}

function renderTrackedLinkBlock(action) {
  if (!action.trackedLink) return "";
  return `<div class="qr">
    <strong>Scan on phone</strong>
    ${action.trackedQr ? `<img src="${escapeAttr(action.trackedQr)}" alt="QR for ${escapeAttr(action.trackedLink)}" loading="lazy" />` : ""}
    <a href="${escapeAttr(action.trackedLink)}" target="_blank" rel="noreferrer">${escapeHtml(action.trackedLink)}</a>
  </div>`;
}

function renderAssetBlock(action) {
  const asset = action.asset;
  const href = action.assetHref;
  if (!asset) return "";
  const preview = renderAssetPreview(asset, href);
  const link = href
    ? `<a class="asset-path" href="${escapeAttr(href)}" target="_blank" rel="noreferrer">${escapeHtml(asset)}</a>`
    : `<span class="asset-path">${escapeHtml(asset)}</span>`;
  return `<div class="asset"><strong>Asset</strong>${preview}${link}</div>`;
}

function renderAssetPreview(asset, href) {
  if (!href) return "";
  if (/\.(png|jpe?g|webp|gif)$/i.test(asset)) {
    return `<img class="asset-preview" src="${escapeAttr(href)}" alt="${escapeAttr(asset)}" loading="lazy" />`;
  }
  if (/\.(mp4|webm|mov)$/i.test(asset)) {
    return `<video class="asset-preview" controls preload="metadata" src="${escapeAttr(href)}"></video>`;
  }
  return "";
}

function slugify(value) {
  return String(value ?? "worker")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "worker";
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
