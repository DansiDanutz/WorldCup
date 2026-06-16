#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const ACTIONS = [
  {
    priority: "1",
    owner: "Sienna",
    channel: "WhatsApp Status",
    action: "Post story asset with video caption 1",
    asset: "media/worldcup26-main-video.mp4",
    trackedLink:
      "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-status&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h0",
    copy:
      "I invited you to WorldCup26.\n\nPick 3 teams for free, see your private points preview, and use a ticket only if you want to enter the paid leaderboard.\n\nUse my referral code 26BC4B90CB when you join:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-status&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h0\n\nThe event has not started yet, so all teams are still available right now.",
    instruction:
      "Open WhatsApp Status, select media/worldcup26-main-video.mp4, paste this copy, publish, then log the private status proof note.",
    proofCommand:
      'node campaign-proof-log.mjs --priority "1" --proof-url "private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"',
  },
  {
    priority: "2",
    owner: "Nano",
    channel: "WhatsApp personal",
    action: "Send personal invite to warm contacts",
    asset: "media/worldcup26-main-video.mp4",
    trackedLink:
      "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_h2",
    copy:
      "I invited you to WorldCup26.\n\nPick 3 teams for free, see your private points preview, and use a ticket only if you want to enter the paid leaderboard.\n\nUse my referral code 26BC4B90CB when you join:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_h2\n\nThe event has not started yet, so all teams are still available right now.",
    instruction:
      "Open WhatsApp, send this to warm football contacts, count recipients and replies, then log that count.",
    proofCommand:
      'node campaign-proof-log.mjs --priority "2" --proof-url "private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>" --status "sent"',
  },
  {
    priority: "3",
    owner: "Sienna",
    channel: "Instagram/Facebook story",
    action: "Story: Code 26BC4B90CB + link sticker",
    asset: "media/worldcup26-referral-story.jpg",
    trackedLink:
      "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=instagram-facebook-story&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h3",
    copy:
      "Pick 3 teams before they lock.\n\nWatch your private points preview move with every match.\n\nPaid leaderboard entry happens only when you use a ticket.\n\nCode: 26BC4B90CB\nJoin:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=instagram-facebook-story&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h3",
    instruction:
      "Open Instagram or Facebook Story, upload the story asset, add the code/link sticker, publish, then log the account or screenshot note.",
    proofCommand:
      'node campaign-proof-log.mjs --priority "3" --proof-url "private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset media/worldcup26-referral-story.jpg; code/link sticker or caption included" --status "posted"',
  },
  {
    priority: "4",
    owner: "Dexter",
    channel: "Football groups",
    action: "Ask approved group admin for permission; post group variant only if allowed",
    asset: "campaign/first-wave-posts.md",
    trackedLink:
      "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=football-groups&utm_medium=approval-first&utm_campaign=worldcup26_referral_72h&utm_content=dexter_h4",
    copy:
      "For football fans here:\n\nWorldCup26 is a prediction game where you pick 3 teams free first and see your private points preview.\n\nPaid leaderboard entry happens only when you use a ticket.\n\nMy invite code: 26BC4B90CB\nJoin here:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=football-groups&utm_medium=approval-first&utm_campaign=worldcup26_referral_72h&utm_content=dexter_h4\n\nUse only where group rules allow promo links. If unsure, ask the group admin before posting.",
    instruction:
      "Ask the group admin first. If approved, post the group copy. If only permission was requested, log the approval-request proof note.",
    proofCommand:
      'node campaign-proof-log.mjs --priority "4" --proof-url "approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset campaign/first-wave-posts.md; code 26BC4B90CB and link included; post only after allowed" --status "requested"',
  },
];

const RESCUE_HOOKS = [
  "Most World Cup predictions are boring. Pick 3 teams free and see your private score.",
  "Name your 3 World Cup teams before the hype starts.",
  "Quick football game: choose 3 teams now, free.",
  "48 teams are still open. Pick your 3 before everyone copies the favorites.",
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const operatorPush = await readJson(path.join(runtimeDir, "operator-push-packet.json"), {});
const zeroSignupRescue = await readJson(path.join(runtimeDir, "zero-signup-rescue.json"), {});
const payload = buildPayload(now, { operatorPush, zeroSignupRescue });

await writeFile(path.join(runtimeDir, "one-click-share.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "one-click-share.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "one-click-share.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "one-click-share.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload(nowValue, sources) {
  const actions = selectActions(sources).map((action) => {
    const normalized = normalizeAction(action);
    return {
      ...normalized,
      shareLinks: normalized.shareLinks.length > 0 ? normalized.shareLinks : buildShareLinks(normalized),
    };
  });
  const rescueHooks = selectRescueHooks(sources);
  return {
    schema: "worldcup26-one-click-share-v1",
    generatedAt: nowValue.toISOString(),
    generatedAtEest: formatEestLogTime(nowValue),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: actions.length >= 4 && actions.every((action) => action.copy && action.proofCommand && action.shareLinks.length >= 1),
    state: sources.operatorPush.actionMode || sources.zeroSignupRescue.state || "critical-zero-signups",
    actionCount: actions.length,
    actions,
    rescueHooks,
    proofRule:
      "This page prepares real-account actions only. Log proof only after the post, story, message, or approval request actually exists.",
  };
}

function selectActions({ operatorPush }) {
  const operatorActions = Array.isArray(operatorPush.actions) ? operatorPush.actions : [];
  if (
    ["warm-contact-sprint", "zero-signup-rescue"].includes(String(operatorPush.actionMode ?? "")) &&
    operatorActions.length >= 4
  ) {
    return operatorActions.slice(0, 4);
  }
  return ACTIONS;
}

function normalizeAction(action) {
  const normalized = {
    priority: String(action.priority ?? ""),
    owner: String(action.owner ?? ""),
    channel: String(action.channel ?? ""),
    action: String(action.action ?? ""),
    asset: String(action.asset ?? ""),
    trackedLink: String(action.trackedLink || action.link || REFERRAL_LINK),
    copy: String(action.copy ?? ""),
    instruction: String(
      action.instruction ||
        action.phoneInstruction ||
        "Use a real logged-in account for this action, then log proof only after the post or message exists.",
    ),
    proofCommand: String(action.proofCommand || action.attemptCommand || ""),
    shareLinks: normalizeShareLinks(action.shareLinks),
  };
  return {
    ...normalized,
    publishLinks: buildPublishLinks(normalized),
  };
}

function normalizeShareLinks(shareLinks) {
  if (!Array.isArray(shareLinks)) return [];
  return shareLinks
    .map((link) => ({
      key: String(link.key || link.label || ""),
      label: String(link.label || link.key || "Share"),
      url: String(link.url || ""),
    }))
    .filter((link) => link.label && link.url);
}

function selectRescueHooks({ zeroSignupRescue }) {
  const hooks = Array.isArray(zeroSignupRescue.creativeVariants)
    ? zeroSignupRescue.creativeVariants.map((variant) => String(variant.hook || "")).filter(Boolean)
    : [];
  return hooks.length > 0 ? hooks.slice(0, 4) : RESCUE_HOOKS;
}

function buildShareLinks(action) {
  const text = action.copy;
  return [
    {
      key: "whatsapp-mobile",
      label: "WhatsApp mobile",
      url: `whatsapp://send?text=${encodeURIComponent(text)}`,
    },
    {
      key: "whatsapp-web",
      label: "WhatsApp web",
      url: `https://wa.me/?text=${encodeURIComponent(text)}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(action.trackedLink)}&text=${encodeURIComponent(text)}`,
    },
    {
      key: "x",
      label: "X",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(action.trackedLink)}`,
    },
  ];
}

function buildPublishLinks(action) {
  const channel = String(action.channel ?? "").toLowerCase();
  const links = [];
  if (channel.includes("youtube") || channel.includes("short")) {
    links.push({
      key: "youtube-studio-upload",
      label: "YouTube upload",
      url: "https://studio.youtube.com/channel/UC7j29XhArv5tlRqQj2qAb4Q/videos/upload",
    });
  }
  if (channel.includes("tiktok")) {
    links.push({
      key: "tiktok-upload",
      label: "TikTok upload",
      url: "https://www.tiktok.com/upload",
    });
  }
  if (channel.includes("reel") || channel.includes("instagram")) {
    links.push({
      key: "instagram-create",
      label: "Instagram create",
      url: "https://www.instagram.com/create/select/",
    });
  }
  if (channel.includes("facebook") || channel.includes("reel")) {
    links.push({
      key: "facebook-reel",
      label: "Facebook Reel",
      url: "https://www.facebook.com/reels/create/",
    });
  }
  if (channel.includes("x") || channel.includes("twitter")) {
    links.push({
      key: "x-compose",
      label: "X compose",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(action.copy)}`,
    });
  }
  if (channel.includes("whatsapp")) {
    links.push({
      key: "whatsapp-web",
      label: "WhatsApp web",
      url: `https://wa.me/?text=${encodeURIComponent(action.copy)}`,
    });
  }
  return links;
}

function renderText(payload) {
  const lines = [
    `WorldCup26 one-click share ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} code=${payload.referralCode} actions=${payload.actionCount}`,
    `rule=${payload.proofRule}`,
    "",
  ];
  for (const action of payload.actions) {
    lines.push(
      `#${action.priority} ${action.owner} / ${action.channel}`,
      `asset=${action.asset}`,
      `link=${action.trackedLink}`,
      `instruction=${action.instruction}`,
      "publish:",
      ...(action.publishLinks.length > 0
        ? action.publishLinks.map((link) => `- ${link.label}: ${link.url}`)
        : ["- no direct publish target; use the native app/account for this channel"]),
      "share:",
      ...action.shareLinks.map((link) => `- ${link.label}: ${link.url}`),
      "copy:",
      indent(action.copy, "  "),
      "proof:",
      action.proofCommand,
      "",
    );
  }
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 One-Click Share

Generated: ${payload.generatedAtEest}

- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}
- State: ${payload.state}

${payload.proofRule}

## Rescue Hooks

${payload.rescueHooks.map((hook) => `- ${hook}`).join("\n")}

## Do Now

${payload.actions.map(renderActionMarkdown).join("\n\n")}
`;
}

function renderActionMarkdown(action) {
  return `### #${action.priority} ${action.owner} / ${action.channel}

- Action: ${action.action}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}
- Instruction: ${action.instruction}

${action.publishLinks.map((link) => `- Publish ${link.label}: ${link.url}`).join("\n")}
${action.shareLinks.map((link) => `- ${link.label}: ${link.url}`).join("\n")}

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
  <title>WorldCup26 One-Click Share</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2c22; --panel2: #11382c; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bed3ca; --gold: #ffd974; --mint: #74f0b2; --red: #ffb4a8; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: radial-gradient(circle at 8% 0%, rgba(255,217,116,.22), transparent 22rem), radial-gradient(circle at 100% 5%, rgba(116,240,178,.16), transparent 24rem), var(--bg); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(960px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, section { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,44,34,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(32px, 7vw, 62px); line-height: .92; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    h3 { margin: 0 0 4px; font-size: 18px; }
    p { color: var(--muted); line-height: 1.4; margin: 0 0 8px; }
    a { color: var(--gold); overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.28); padding: 10px; margin: 8px 0 0; }
    button, .share { border: 1px solid var(--line); border-radius: 8px; color: #03140f; background: linear-gradient(135deg, var(--gold), var(--mint)); font-weight: 950; padding: 10px 12px; text-decoration: none; cursor: pointer; min-height: 42px; display: inline-flex; align-items: center; justify-content: center; }
    .meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .pill { border-radius: 999px; padding: 6px 9px; background: rgba(255,255,255,.08); color: var(--muted); font-weight: 800; }
    .urgent { color: #03140f; background: linear-gradient(135deg, var(--red), var(--gold)); }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .publish { border-color: rgba(255,217,116,.7); background: linear-gradient(135deg, #fff0a8, var(--gold)); }
    .card { background: linear-gradient(145deg, rgba(255,217,116,.10), rgba(116,240,178,.08)); }
    .copy-state { color: var(--mint); font-size: 13px; min-height: 18px; margin-top: 6px; }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>One-Click Share</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
      <div class="meta">
        <span class="pill urgent">zero signups rescue</span>
        <span class="pill">code ${escapeHtml(payload.referralCode)}</span>
        <span class="pill">${escapeHtml(payload.generatedAtEest)}</span>
      </div>
    </header>
    <section>
      <h2>Hooks To Lead With</h2>
      ${payload.rescueHooks.map((hook) => `<p>${escapeHtml(hook)}</p>`).join("")}
    </section>
    <div class="grid">
      ${payload.actions.map(renderActionHtml).join("\n")}
    </div>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const target = document.querySelector(button.getAttribute("data-copy"));
      if (!target) return;
      await navigator.clipboard.writeText(target.textContent.trim());
      const state = button.parentElement.querySelector(".copy-state");
      if (state) state.textContent = "Copied";
      setTimeout(() => { if (state) state.textContent = ""; }, 1600);
    });
  </script>
</body>
</html>`;
}

function renderActionHtml(action) {
  const copyId = `copy-${action.priority}`;
  const proofId = `proof-${action.priority}`;
  return `<section class="card">
    <h3>#${escapeHtml(action.priority)} ${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</h3>
    <p><strong>${escapeHtml(action.action)}</strong></p>
    <p>Asset: ${escapeHtml(action.asset)}</p>
    <p><a href="${escapeAttr(action.trackedLink)}">${escapeHtml(action.trackedLink)}</a></p>
    <p>${escapeHtml(action.instruction)}</p>
    <div class="actions">
      ${action.publishLinks.map((link) => `<a class="share publish" href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}
      ${action.shareLinks.map((link) => `<a class="share" href="${escapeAttr(link.url)}">${escapeHtml(link.label)}</a>`).join("")}
      <button type="button" data-copy="#${copyId}">Copy copy</button>
      <button type="button" data-copy="#${proofId}">Copy proof</button>
    </div>
    <div class="copy-state"></div>
    <pre id="${copyId}">${escapeHtml(action.copy)}</pre>
    <pre id="${proofId}">${escapeHtml(action.proofCommand)}</pre>
  </section>`;
}

function formatEestLogTime(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} +0300`;
}

function indent(value, prefix) {
  return String(value ?? "").split("\n").map((line) => `${prefix}${line}`).join("\n");
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = String(rawArgs[++index] ?? "");
    else if (arg === "--now") parsed.now = String(rawArgs[++index] ?? "");
  }
  return parsed;
}
