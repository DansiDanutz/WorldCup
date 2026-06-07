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

const operatorPush = await readJson(path.join(runtimeDir, "operator-push-packet.json"), {});
const zeroSignupRescue = await readJson(path.join(runtimeDir, "zero-signup-rescue.json"), {});
const phoneActionCenter = await readJson(path.join(runtimeDir, "phone-action-center.json"), {});
const referralActivity = await readJson(path.join(runtimeDir, "referral-activity.json"), {});
const payload = buildPayload({
  operatorPush,
  zeroSignupRescue,
  phoneActionCenter,
  referralActivity,
});

await writeFile(path.join(runtimeDir, "real-action-bridge.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "real-action-bridge.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "real-action-bridge.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "real-action-bridge.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ operatorPush, zeroSignupRescue, phoneActionCenter, referralActivity }) {
  const actions = (Array.isArray(operatorPush.actions) ? operatorPush.actions : [])
    .map(normalizeAction)
    .filter((action) => action.priority && action.copy && action.proofCommand)
    .slice(0, args.limit);
  const counts = referralActivity.counts ?? zeroSignupRescue.counts ?? {};
  const acceptedReferrals = Number(counts.acceptedReferrals ?? 0);
  const signupSaves = Number(counts.signupReferralSaves ?? counts.signupSaves ?? 0);
  const entries = Number(counts.referredEntries ?? counts.entries ?? 0);
  const zeroSignup = acceptedReferrals === 0 && signupSaves === 0 && entries === 0;
  const rescueVariants = Array.isArray(zeroSignupRescue.creativeVariants)
    ? zeroSignupRescue.creativeVariants.map(normalizeVariant).slice(0, 4)
    : [];
  const failures = [
    actions.length === 0 ? "No real actions are available from operator-push-packet.json." : "",
    zeroSignup && rescueVariants.length === 0 ? "Zero-signup state has no rescue variants." : "",
    !phoneActionCenter.ok ? "Phone action center health is not OK." : "",
    actions.some((action) => !action.shareLinks.length)
      ? "At least one action is missing share links."
      : "",
  ].filter(Boolean);

  return {
    schema: "worldcup26-real-action-bridge-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: failures.length === 0,
    failures,
    state: zeroSignup ? "critical-zero-signups" : "active",
    counts: { acceptedReferrals, signupSaves, entries },
    sourceGeneratedAtEest: {
      operatorPush: String(operatorPush.generatedAtEest ?? ""),
      zeroSignupRescue: String(zeroSignupRescue.generatedAtEest ?? ""),
      phoneActionCenter: String(phoneActionCenter.generatedAtEest ?? ""),
      referralActivity: String(referralActivity.generatedAtEest ?? ""),
    },
    actionCount: actions.length,
    rescueVariantCount: rescueVariants.length,
    firstAction: actions[0] ?? null,
    actions,
    rescueVariants,
    ownerRule:
      "Do the real post, status, message batch, story, or approval request from an owned account first. This bridge is not proof.",
    proofRule:
      "After the real action exists, run the matching proof command with real account, time, audience, and URL/note details.",
  };
}

function normalizeAction(row) {
  const shareLinks = Array.isArray(row.shareLinks) ? row.shareLinks : [];
  return {
    priority: String(row.priority ?? ""),
    owner: String(row.owner ?? ""),
    channel: String(row.channel ?? ""),
    action: String(row.action ?? ""),
    asset: String(row.asset ?? ""),
    ageLabel: String(row.ageLabel ?? ""),
    trackedLink: String(row.trackedLink ?? ""),
    trackedQr: String(row.trackedQr ?? ""),
    copy: String(row.copy ?? "").trim(),
    phoneInstruction: String(row.phoneInstruction ?? "").trim(),
    quickLogCommand: String(row.quickLogCommand ?? "").trim(),
    proofCommand: String(row.proofCommand ?? "").trim(),
    shareLinks: shareLinks.map((link) => ({
      key: String(link.key ?? ""),
      label: String(link.label ?? link.key ?? "Share"),
      url: String(link.url ?? ""),
    })),
  };
}

function normalizeVariant(row) {
  return {
    priority: String(row.priority ?? ""),
    owner: String(row.owner ?? ""),
    channel: String(row.channel ?? ""),
    hook: String(row.hook ?? ""),
    caption: String(row.caption ?? ""),
    asset: String(row.asset ?? ""),
    link: String(row.link ?? ""),
    proofNote: String(row.proofNote ?? ""),
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 real action bridge ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} code=${payload.referralCode}`,
    `counts accepted=${payload.counts.acceptedReferrals} signup_saves=${payload.counts.signupSaves} entries=${payload.counts.entries}`,
    `actions=${payload.actionCount} rescue_variants=${payload.rescueVariantCount}`,
    `rule=${payload.ownerRule}`,
    "",
    "do_now:",
  ];
  for (const action of payload.actions) {
    lines.push(
      `- #${action.priority} ${action.owner} / ${action.channel}`,
      `  action=${action.action}`,
      `  asset=${action.asset}`,
      `  link=${action.trackedLink}`,
      `  instruction=${action.phoneInstruction}`,
      ...(action.quickLogCommand ? [`  quick_log=${action.quickLogCommand}`] : []),
      `  proof=${action.proofCommand}`,
    );
  }
  lines.push("", "zero_signup_rescue:");
  for (const variant of payload.rescueVariants) {
    lines.push(
      `- #${variant.priority} ${variant.owner} / ${variant.channel}`,
      `  hook=${variant.hook}`,
      `  caption=${variant.caption}`,
      `  link=${variant.link}`,
    );
  }
  lines.push("", `Proof rule: ${payload.proofRule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Real Action Bridge

Generated: ${payload.generatedAtEest}

- State: ${payload.state}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}
- Accepted referrals: ${payload.counts.acceptedReferrals}
- Signup saves: ${payload.counts.signupSaves}
- Entries: ${payload.counts.entries}

${payload.ownerRule}

## Do Now

${payload.actions.map(renderActionMarkdown).join("\n\n") || "No actions are available."}

## Zero-Signup Hooks

${payload.rescueVariants.map(renderVariantMarkdown).join("\n\n") || "No rescue variants are available."}

## Proof Rule

${payload.proofRule}
`;
}

function renderActionMarkdown(action) {
  return `### #${action.priority} ${action.owner} / ${action.channel}

- Action: ${action.action}
- Age: ${action.ageLabel || "-"}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}
- Instruction: ${action.phoneInstruction}

\`\`\`text
${action.copy}
\`\`\`

Proof command after real action:

${action.quickLogCommand ? `\`\`\`bash\n${action.quickLogCommand}\n\`\`\`\n\nFull audit command:\n\n` : ""}

\`\`\`bash
${action.proofCommand}
\`\`\``;
}

function renderVariantMarkdown(variant) {
  return `### #${variant.priority} ${variant.owner} / ${variant.channel}

- Hook: ${variant.hook}
- Caption: ${variant.caption}
- Asset: \`${variant.asset}\`
- Link: ${variant.link}`;
}

function renderHtml(payload) {
  const actionCards = payload.actions.map(renderActionCard).join("\n");
  const variantCards = payload.rescueVariants.map(renderVariantCard).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Real Action Bridge</title>
  <style>
    :root { color-scheme: dark; --bg:#03140f; --panel:#0a2b21; --line:rgba(255,255,255,.15); --text:#f7fff9; --muted:#bdd1c9; --gold:#ffd974; --mint:#74f0b2; --green:#0b7a59; --danger:#ff9f9f; }
    * { box-sizing: border-box; }
    body { margin:0; background: radial-gradient(circle at 10% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 85% 5%, rgba(116,240,178,.14), transparent 24rem), var(--bg); color:var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width:min(980px,100%); margin:0 auto; padding:14px 10px 56px; }
    header, section, article { border:1px solid var(--line); border-radius:12px; background:rgba(10,43,33,.92); padding:14px; margin-bottom:10px; }
    h1,h2,h3,p { margin:0; }
    h1 { font-size:clamp(32px,9vw,64px); line-height:.92; letter-spacing:0; }
    h2 { margin-bottom:10px; font-size:22px; }
    h3 { font-size:18px; }
    p { color:var(--muted); line-height:1.4; }
    a { color:var(--gold); overflow-wrap:anywhere; }
    .alert { border-color:rgba(255,217,116,.52); background:linear-gradient(135deg, rgba(255,217,116,.18), rgba(116,240,178,.1)), rgba(10,43,33,.96); }
    .metrics { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:14px; }
    .metric { border:1px solid var(--line); border-radius:10px; padding:10px; background:rgba(255,255,255,.06); }
    .metric span { display:block; color:var(--muted); font-size:11px; font-weight:900; text-transform:uppercase; }
    .metric strong { display:block; color:var(--gold); font-size:22px; overflow-wrap:anywhere; }
    .grid { display:grid; gap:10px; }
    .copy, pre { white-space:pre-wrap; overflow-wrap:anywhere; border:1px solid var(--line); border-radius:10px; background:#03140f; padding:10px; color:var(--text); line-height:1.35; }
    .buttons { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:10px; }
    button, .button { min-height:42px; border:1px solid rgba(116,240,178,.38); border-radius:10px; background:rgba(116,240,178,.13); color:var(--text); padding:10px; font:inherit; font-weight:850; text-align:center; text-decoration:none; cursor:pointer; }
    .primary { background:var(--green); border-color:var(--green); }
    .gold { color:#03140f; background:var(--gold); border-color:var(--gold); }
    .warn { color:var(--danger); font-weight:900; }
    .meta { display:grid; gap:5px; color:var(--muted); font-size:13px; margin:8px 0; }
    @media (min-width:760px) { .metrics { grid-template-columns:repeat(4,1fr); } .grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
  </style>
</head>
<body>
  <main>
    <header class="alert">
      <h1>Real Action Bridge</h1>
      <p>ZERO SIGNUPS means the next win is a real post, status, message batch, story, or approval request from an owned account. Lead with free picks first.</p>
      <div class="metrics">
        <div class="metric"><span>Code</span><strong>${escapeHtml(payload.referralCode)}</strong></div>
        <div class="metric"><span>Accepted</span><strong>${payload.counts.acceptedReferrals}</strong></div>
        <div class="metric"><span>Signup saves</span><strong>${payload.counts.signupSaves}</strong></div>
        <div class="metric"><span>Entries</span><strong>${payload.counts.entries}</strong></div>
      </div>
      <div class="buttons">
        <button class="primary" data-copy="${escapeAttr(payload.referralLink)}">Copy referral link</button>
        <button data-copy="${escapeAttr(`Code: ${payload.referralCode}\n${payload.referralLink}`)}">Copy code + link</button>
        <a class="button gold" href="phone-action-center.html">Open Phone Center</a>
        <a class="button" href="proof-intake.html">Open Proof Intake</a>
      </div>
    </header>
    <section>
      <h2>Do These First</h2>
      <div class="grid">${actionCards || "<article><h3>No actions</h3><p>No operator actions are available.</p></article>"}</div>
    </section>
    <section>
      <h2>Zero-Signup Hooks</h2>
      <div class="grid">${variantCards || "<article><h3>No hooks</h3><p>No rescue variants are available.</p></article>"}</div>
    </section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      try {
        await navigator.clipboard.writeText(button.getAttribute("data-copy") || "");
        const original = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = original; }, 1400);
      } catch {
        alert("Copy failed. Select and copy manually.");
      }
    });
  </script>
</body>
</html>
`;
}

function renderActionCard(action) {
  const shareButtons = action.shareLinks
    .filter((link) => link.url)
    .map((link) => `<a class="button" href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`)
    .join("");
  return `<article>
    <h3>#${escapeHtml(action.priority)} ${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</h3>
    <div class="meta">
      <span>${escapeHtml(action.action)}</span>
      <span>Asset: ${escapeHtml(action.asset)}</span>
      <span>Age: ${escapeHtml(action.ageLabel || "-")}</span>
      <a href="${escapeAttr(action.trackedLink)}" target="_blank" rel="noreferrer">${escapeHtml(action.trackedLink)}</a>
    </div>
    <p>${escapeHtml(action.phoneInstruction)}</p>
    <div class="copy">${escapeHtml(action.copy)}</div>
    <div class="buttons">
      <button class="primary" data-copy="${escapeAttr(action.copy)}">Copy caption</button>
      ${action.quickLogCommand ? `<button class="gold" data-copy="${escapeAttr(action.quickLogCommand)}">Copy quick proof</button>` : ""}
      <button data-copy="${escapeAttr(action.proofCommand)}">Copy proof command</button>
      ${shareButtons}
    </div>
    <p class="warn">Run proof only after the real action exists.</p>
  </article>`;
}

function renderVariantCard(variant) {
  return `<article>
    <h3>#${escapeHtml(variant.priority)} ${escapeHtml(variant.owner)} / ${escapeHtml(variant.channel)}</h3>
    <div class="meta">
      <span>Asset: ${escapeHtml(variant.asset)}</span>
      <a href="${escapeAttr(variant.link)}" target="_blank" rel="noreferrer">${escapeHtml(variant.link)}</a>
    </div>
    <p><strong>Hook:</strong> ${escapeHtml(variant.hook)}</p>
    <div class="copy">${escapeHtml(variant.caption)}</div>
    <div class="buttons">
      <button class="primary" data-copy="${escapeAttr(variant.caption)}">Copy caption</button>
      <button data-copy="${escapeAttr(variant.link)}">Copy link</button>
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
  const parsed = { limit: 4, now: "", quiet: false, root: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--limit") parsed.limit = Number(rawArgs[++index] ?? parsed.limit);
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
  }
  if (!Number.isFinite(parsed.limit) || parsed.limit < 1) parsed.limit = 4;
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
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
