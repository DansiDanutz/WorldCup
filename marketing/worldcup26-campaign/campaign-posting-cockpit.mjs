#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const TRACKED_FALLBACK_LINK = `${REFERRAL_LINK}&utm_source=posting-cockpit&utm_medium=operator-copy&utm_campaign=worldcup26_referral_72h&utm_content=fallback`;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const proofSla = await readJson(path.join(runtimeDir, "proof-sla.json"), {});
const topSix = await readJson(path.join(runtimeDir, "top-six-mobile.json"), {});
const paidTraffic = await readJson(path.join(runtimeDir, "paid-traffic-guard.json"), {});
const payload = buildPayload({ proofSla, topSix, paidTraffic });

await writeFile(path.join(runtimeDir, "posting-cockpit.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "posting-cockpit.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "posting-cockpit.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "posting-cockpit.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ proofSla, topSix, paidTraffic }) {
  const proofState = String(proofSla.proofState ?? "missing");
  const doNow = Array.isArray(proofSla.doNow) ? proofSla.doNow.map(normalizeAction) : [];
  const topSixActions = Array.isArray(topSix.actions) ? topSix.actions.map(normalizeAction) : [];
  const fallbackActions = Array.isArray(proofSla.recoveryActions)
    ? proofSla.recoveryActions.map(normalizeFallbackAction)
    : [];
  const pages = [
    pageLink("Proof SLA", "proof-sla.html", "Freshness, oldest actions, proof commands"),
    pageLink("Proof Audit", "proof-audit.html", "Truth report for latest real external proof and invalid proof rows"),
    pageLink("Proof URL Recovery", "proof-url-recovery.html", "Recover public permalinks for private X proof notes"),
    pageLink("Proof Rescue", "proof-rescue.html", "One-screen phone checklist for the oldest real-world proof gaps"),
    pageLink("Social Rescue", "social-rescue-pack.html", "One-tap social/share buttons for the oldest proof gaps"),
    pageLink("One-Click Share", "one-click-share.html", "Fastest owned-account share actions with copy and proof buttons"),
    pageLink("Public Outreach Targets", "public-outreach-targets.html", "Search/social/community targets across all four workers"),
    pageLink("Login Unlock Board", "login-unlock-board.html", "Login and verification blockers that must be cleared before public posting"),
    pageLink("Proof Intake", "proof-intake.html", "Fast proof logging after a real action exists"),
    pageLink("Top Six Mobile", "top-six-mobile.html", "Fastest phone-first six actions"),
    pageLink("Phone Action Center", "phone-action-center.html", "Full urgent queue with copy buttons"),
    pageLink("Share Command Center", "share-command-center.html", "All tracked share links"),
    pageLink("Paid Traffic Guard", "paid-traffic-guard.html", "Ad landing click safety"),
    pageLink("Paid Dashboard Checks", "paid-dashboard-checks.html", "Structured Meta and X delivery numbers"),
    pageLink("Paid Ad Triage", "paid-ad-triage.html", "Meta and X dashboard proof plus zero-click decision rules"),
    pageLink("Paid No-Click Rescue", "paid-no-click-rescue.html", "Compliant free-first creative variants for zero-click ads"),
    pageLink("Ad Ops Links", "ad-ops-links.html", "Meta and X Ads Manager links plus dashboard check commands"),
    pageLink("Escalation Board", "escalation-board.html", "Stale-worker pressure board"),
  ];

  return {
    schema: "worldcup26-posting-cockpit-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    trackedFallbackLink: TRACKED_FALLBACK_LINK,
    ok: doNow.length > 0 && ["fresh", "warning", "critical"].includes(proofState),
    proofState,
    latestExternalProofAgeLabel: String(proofSla.latestExternalProofAgeLabel ?? "none"),
    urgentOpenRows: Number(proofSla.counts?.urgentOpenRows ?? topSix.urgentRows ?? 0),
    paidTrafficOk: Boolean(proofSla.paidTrafficOk ?? paidTraffic.ok),
    deployment: String(proofSla.deployment ?? firstDeployment(paidTraffic) ?? ""),
    pages,
    doNow,
    topSixActions,
    fallbackActions,
    assets: [
      { label: "Main video", href: "../media/worldcup26-main-video.mp4" },
      { label: "QR story", href: "../media/worldcup26-qr-story.jpg" },
      { label: "QR square", href: "../media/worldcup26-qr-square.jpg" },
      { label: "Referral QR", href: "../media/worldcup26-referral-qr.png" },
    ],
    proofRule:
      "Open the share/action link, do the real post/message/story/upload/reply/request, then log proof with the matching command.",
  };
}

function normalizeAction(row) {
  return {
    priority: String(row.priority ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    action: String(row.action ?? "").trim(),
    asset: String(row.asset ?? "").trim(),
    ageLabel: String(row.ageLabel ?? "").trim(),
    trackedLink: String(row.trackedLink ?? "").trim(),
    copy: String(row.copy ?? row.combinedCopy ?? "").trim(),
    proofCommand: String(row.proofCommand ?? "").trim(),
    proofNote: String(row.proofNote ?? "").trim(),
    share: {
      whatsapp: String(row.share?.whatsapp ?? "").trim(),
      telegram: String(row.share?.telegram ?? "").trim(),
      x: String(row.share?.x ?? "").trim(),
      facebook: String(row.share?.facebook ?? "").trim(),
    },
  };
}

function normalizeFallbackAction(row) {
  return {
    key: String(row.key ?? "").trim(),
    label: String(row.label ?? "").trim(),
    loginUrl: String(row.loginUrl ?? "").trim(),
    shareUrl: String(row.shareUrl ?? "").trim(),
    proofCommand: String(row.proofCommand ?? "").trim(),
  };
}

function pageLink(label, href, description) {
  return { label, href, description };
}

function firstDeployment(paidTraffic) {
  return Array.isArray(paidTraffic.deploymentIds) ? paidTraffic.deploymentIds[0] ?? "" : "";
}

function renderText(payload) {
  const lines = [
    `WorldCup26 posting cockpit ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.proofState} latest_external=${payload.latestExternalProofAgeLabel} urgent=${payload.urgentOpenRows} paid=${payload.paidTrafficOk ? "ok" : "fail"} dpl=${payload.deployment || "-"}`,
    `code=${payload.referralCode}`,
    `tracked_fallback=${payload.trackedFallbackLink}`,
    "",
    "open_first:",
    "- runtime/posting-cockpit.html",
    "- runtime/proof-sla.html",
    "- runtime/proof-audit.html",
    "- runtime/proof-url-recovery.html",
    "- runtime/proof-rescue.html",
    "- runtime/social-rescue-pack.html",
    "- runtime/one-click-share.html",
    "- runtime/public-outreach-targets.html",
    "- runtime/login-unlock-board.html",
    "- runtime/proof-intake.html",
    "- runtime/top-six-mobile.html",
    "- runtime/paid-ad-triage.html",
    "- runtime/paid-no-click-rescue.html",
    "- runtime/ad-ops-links.html",
    "",
    "do_now:",
  ];
  for (const action of payload.doNow.slice(0, 6)) {
    lines.push(`- #${action.priority} ${action.owner} / ${action.channel}${action.ageLabel ? ` age=${action.ageLabel}` : ""}`);
    lines.push(`  action=${action.action}`);
    lines.push(`  link=${action.trackedLink}`);
    lines.push(`  proof_after_action=${action.proofCommand || action.proofNote || "-"}`);
  }
  lines.push("", `Rule: ${payload.proofRule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Posting Cockpit

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ready" : "not ready"}
- Proof state: ${payload.proofState}
- Latest external proof age: ${payload.latestExternalProofAgeLabel}
- Urgent rows: ${payload.urgentOpenRows}
- Paid traffic guard: ${payload.paidTrafficOk ? "ok" : "fail"}
- Referral code: \`${payload.referralCode}\`
- Referral link fallback: ${payload.trackedFallbackLink}

This is the operator start page. It opens the right handoff pages and keeps the proof rule visible.

## Open First

${payload.pages.map((page) => `- [${page.label}](${page.href}) - ${page.description}`).join("\n")}

## Do Now

${payload.doNow.map(renderActionMarkdown).join("\n\n") || "No immediate posting actions are open."}

## Fallbacks

${payload.fallbackActions.map(renderFallbackMarkdown).join("\n\n") || "No public fallback links are available."}

## Proof Rule

${payload.proofRule}
`;
}

function renderActionMarkdown(action) {
  return `### #${action.priority} ${action.owner} / ${action.channel}

- Age: ${action.ageLabel || "-"}
- Action: ${action.action}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}

\`\`\`text
${action.copy}
\`\`\`

\`\`\`bash
${action.proofCommand || `node campaign-proof-log.mjs --priority "${action.priority}" --proof-url "REAL_POST_URL_OR_PRIVATE_NOTE" --status posted`}
\`\`\``;
}

function renderFallbackMarkdown(action) {
  return `### ${action.label}

- Login: ${action.loginUrl || "-"}
- Share: ${action.shareUrl || "-"}

\`\`\`bash
${action.proofCommand || "Log proof after the fallback post exists."}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Posting Cockpit</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a2b21; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; --danger: #ff9f9f; --warn: #ffcc6a; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 92% 4%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1080px, 100%); margin: 0 auto; padding: 12px 10px 48px; }
    header, article, section { border: 1px solid var(--line); border-radius: 8px; background: rgba(10,43,33,.94); }
    header { padding: 16px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(36px, 9vw, 72px); line-height: .9; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    h3 { margin: 0; font-size: 19px; }
    p { margin: 0; color: var(--muted); line-height: 1.4; }
    .state { display: inline-flex; margin: 4px 0 12px; padding: 7px 10px; border-radius: 999px; color: #03140f; background: var(--mint); font-weight: 950; text-transform: uppercase; }
    .state.warning { background: var(--warn); }
    .state.critical, .state.missing { background: var(--danger); }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; overflow-wrap: anywhere; }
    .links, .assets, .actions, .fallbacks { display: grid; gap: 10px; margin-bottom: 10px; }
    article, section { padding: 14px; }
    .button-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button { min-height: 44px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; padding: 9px; font: inherit; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; }
    .secondary { background: rgba(255,255,255,.07); color: var(--mint); }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    .tag { display: inline-grid; place-items: center; min-width: 38px; height: 34px; margin-bottom: 8px; color: #041a13; background: var(--gold); border-radius: 8px; font-weight: 950; }
    .meta { color: var(--muted); display: grid; gap: 4px; margin: 8px 0; font-size: 13px; }
    .rule { color: var(--gold); font-weight: 900; }
    @media (min-width: 760px) { .stats { grid-template-columns: repeat(5, minmax(0, 1fr)); } .links, .actions { grid-template-columns: repeat(2, minmax(0, 1fr)); } .assets, .fallbacks { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Posting Cockpit</h1>
      <span class="state ${escapeAttr(payload.proofState)}">${escapeHtml(payload.proofState)}</span>
      <p>Start here on a logged-in phone or social browser. This page opens the live handoffs; it does not mark anything posted.</p>
      <div class="stats">
        <div class="stat"><span>Code</span><strong>${escapeHtml(payload.referralCode)}</strong></div>
        <div class="stat"><span>External age</span><strong>${escapeHtml(payload.latestExternalProofAgeLabel)}</strong></div>
        <div class="stat"><span>Urgent</span><strong>${payload.urgentOpenRows}</strong></div>
        <div class="stat"><span>Paid guard</span><strong>${payload.paidTrafficOk ? "ok" : "fail"}</strong></div>
        <div class="stat"><span>Deployment</span><strong>${escapeHtml(payload.deployment || "-")}</strong></div>
      </div>
      <div class="button-grid">
        <button class="gold" data-copy="${escapeAttr(payload.trackedFallbackLink)}">Copy tracked link</button>
        <button data-copy="${escapeAttr(`Code: ${payload.referralCode}\n${payload.trackedFallbackLink}`)}">Copy code + link</button>
      </div>
    </header>
    <section>
      <h2>Open First</h2>
      <div class="links">${payload.pages.map(renderPageLinkHtml).join("")}</div>
    </section>
    <section>
      <h2>Assets</h2>
      <div class="assets">${payload.assets.map(renderAssetHtml).join("")}</div>
    </section>
    <section>
      <h2>Do Now</h2>
      <div class="actions">${payload.doNow.map(renderActionHtml).join("") || "<article><h3>No immediate actions</h3><p>No immediate posting actions are open.</p></article>"}</div>
    </section>
    <section>
      <h2>Public Fallbacks</h2>
      <div class="fallbacks">${payload.fallbackActions.map(renderFallbackHtml).join("") || "<article><h3>No fallbacks</h3><p>No public fallback links are available.</p></article>"}</div>
    </section>
    <section><p class="rule">${escapeHtml(payload.proofRule)}</p></section>
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

function renderPageLinkHtml(page) {
  return `<article><h3>${escapeHtml(page.label)}</h3><p>${escapeHtml(page.description)}</p><div class="button-grid"><a class="button gold" href="${escapeAttr(page.href)}">Open</a><button class="secondary" data-copy="${escapeAttr(page.href)}">Copy path</button></div></article>`;
}

function renderAssetHtml(asset) {
  return `<article><h3>${escapeHtml(asset.label)}</h3><div class="button-grid"><a class="button gold" href="${escapeAttr(asset.href)}" target="_blank" rel="noreferrer">Open</a><button class="secondary" data-copy="${escapeAttr(asset.href)}">Copy path</button></div></article>`;
}

function renderActionHtml(action) {
  const proofText = action.proofCommand || action.proofNote || "";
  return `<article>
    <span class="tag">#${escapeHtml(action.priority)}</span>
    <h3>${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</h3>
    <div class="meta">
      <div><strong>Age:</strong> ${escapeHtml(action.ageLabel || "-")}</div>
      <div><strong>Action:</strong> ${escapeHtml(action.action)}</div>
      <div><strong>Asset:</strong> ${escapeHtml(action.asset)}</div>
    </div>
    <pre>${escapeHtml(action.copy)}</pre>
    <div class="button-grid">
      <button class="gold" data-copy="${escapeAttr(action.copy)}">Copy caption</button>
      <button data-copy="${escapeAttr(action.trackedLink)}">Copy link</button>
      ${action.share.whatsapp ? `<a class="button secondary" href="${escapeAttr(action.share.whatsapp)}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
      ${action.share.telegram ? `<a class="button secondary" href="${escapeAttr(action.share.telegram)}" target="_blank" rel="noreferrer">Telegram</a>` : ""}
      ${action.share.x ? `<a class="button secondary" href="${escapeAttr(action.share.x)}" target="_blank" rel="noreferrer">X</a>` : ""}
      ${action.share.facebook ? `<a class="button secondary" href="${escapeAttr(action.share.facebook)}" target="_blank" rel="noreferrer">Facebook</a>` : ""}
      <button data-copy="${escapeAttr(action.proofNote || proofText)}">Copy proof help</button>
      <button class="secondary" data-copy="${escapeAttr(proofText)}">Copy proof command</button>
    </div>
  </article>`;
}

function renderFallbackHtml(action) {
  return `<article>
    <h3>${escapeHtml(action.label)}</h3>
    <div class="button-grid">
      ${action.loginUrl ? `<a class="button secondary" href="${escapeAttr(action.loginUrl)}" target="_blank" rel="noreferrer">Login</a>` : ""}
      ${action.shareUrl ? `<a class="button gold" href="${escapeAttr(action.shareUrl)}" target="_blank" rel="noreferrer">Open share</a>` : ""}
      <button data-copy="${escapeAttr(action.shareUrl)}">Copy share</button>
      <button class="secondary" data-copy="${escapeAttr(action.proofCommand)}">Copy proof command</button>
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
  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const hour = String(shifted.getUTCHours()).padStart(2, "0");
  const minute = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute} +0300`;
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
