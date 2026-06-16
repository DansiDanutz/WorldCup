#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const BASE_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const referralActivity = await readJson(path.join(runtimeDir, "referral-activity.json"), {});
const proofSla = await readJson(path.join(runtimeDir, "proof-sla.json"), {});
const proofRescue = await readJson(path.join(runtimeDir, "proof-rescue.json"), {});
const payload = buildPayload({ referralActivity, proofSla, proofRescue });

await writeFile(path.join(runtimeDir, "zero-signup-rescue.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "zero-signup-rescue.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "zero-signup-rescue.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "zero-signup-rescue.html"), renderHtml(payload));
await writeFile(path.join(runtimeDir, "zero-signup-rescue.csv"), renderCsv(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

function buildPayload({ referralActivity, proofSla, proofRescue }) {
  const counts = referralActivity.counts ?? {};
  const acceptedReferrals = Number(counts.acceptedReferrals ?? 0);
  const signupSaves = Number(counts.signupReferralSaves ?? 0);
  const entries = Number(counts.referredEntries ?? 0);
  const zeroSignup = acceptedReferrals === 0 && signupSaves === 0 && entries === 0;
  const staleExternalProof = Number(proofSla.counts?.urgentOpenRows ?? 0) > 0;
  const rescueActions = Array.isArray(proofRescue.actions) ? proofRescue.actions : [];

  const creativeVariants = [
    variant({
      priority: 1,
      owner: "Sienna",
      channel: "YouTube Shorts / TikTok / Reels",
      hook: "Most World Cup predictions are boring. Pick 3 teams free and see your private score.",
      beat: "Screen record: landing page opens with invite code applied, then three team cards selected fast.",
      caption: "Pick 3 teams free. If you want the paid leaderboard later, use a ticket. Code 26BC4B90CB.",
      cta: "Tap the link, Google signup, choose your three teams.",
      asset: "media/worldcup26-main-video-vertical.mp4",
      utmSource: "zero-signup-short",
      utmMedium: "organic-video",
      utmContent: "hook_private_score",
    }),
    variant({
      priority: 2,
      owner: "Dexter",
      channel: "X / football feed",
      hook: "Name your 3 World Cup teams before the hype starts.",
      beat: "Post a direct question, then add the link and referral code in the first reply.",
      caption: "I picked my WorldCup26 teams. You can pick yours free and track the private points preview. Code 26BC4B90CB",
      cta: "Reply with your three teams after joining.",
      asset: "media/worldcup26-referral-16x9.jpg",
      utmSource: "zero-signup-x",
      utmMedium: "organic-post",
      utmContent: "three_team_question",
    }),
    variant({
      priority: 3,
      owner: "Nano",
      channel: "WhatsApp personal",
      hook: "Quick football game: choose 3 teams now, free.",
      beat: "Send as a personal note, not a broadcast. Ask for their picks back.",
      caption: "I am testing WorldCup26. Pick 3 teams free, no payment needed to preview points. My invite code is 26BC4B90CB.",
      cta: "Send me your three teams after you join.",
      asset: "media/worldcup26-main-video.mp4",
      utmSource: "zero-signup-whatsapp",
      utmMedium: "personal-message",
      utmContent: "warm_contact_free_pick",
    }),
    variant({
      priority: 4,
      owner: "Sienna",
      channel: "WhatsApp Status / Instagram Story",
      hook: "48 teams are still open. Pick your 3 before everyone copies the favorites.",
      beat: "Story frame: code large, link sticker, short caption. No long rules.",
      caption: "Free first step: pick 3 teams and watch your preview. Code 26BC4B90CB.",
      cta: "Use the invite link today.",
      asset: "media/worldcup26-referral-story.jpg",
      utmSource: "zero-signup-story",
      utmMedium: "story",
      utmContent: "forty_eight_teams_open",
    }),
    variant({
      priority: 5,
      owner: "Dexter",
      channel: "Facebook profile / football groups",
      hook: "Who are your 3 teams for World Cup 2026?",
      beat: "Ask permission in groups first. In profile posts, lead with the question before the link.",
      caption: "I made my WorldCup26 invite. Pick 3 teams free, compare later, and use a ticket only if you want the paid leaderboard. Code 26BC4B90CB.",
      cta: "Comment your three teams or join from the link.",
      asset: "media/worldcup26-referral-square.jpg",
      utmSource: "zero-signup-facebook",
      utmMedium: "organic-post",
      utmContent: "comment_three_teams",
    }),
    variant({
      priority: 6,
      owner: "Sienna",
      channel: "YouTube Shorts",
      hook: "I would not pay first. I would pick 3 teams free first.",
      beat: "First 2 seconds show the free-team selection, then code applied, then Google button.",
      caption: "WorldCup26 lets you save free picks first. Paid leaderboard comes later only if you want it. Code 26BC4B90CB.",
      cta: "Open the link and pick before June 18.",
      asset: "media/worldcup26-main-video-vertical.mp4",
      utmSource: "zero-signup-youtube",
      utmMedium: "shorts",
      utmContent: "free_before_paid",
    }),
    variant({
      priority: 7,
      owner: "Nano",
      channel: "Telegram / Discord DM",
      hook: "Football prediction challenge, free first.",
      beat: "Short DM with no hard sell. Ask them to send screenshots of picks.",
      caption: "Pick 3 teams free on WorldCup26. If it looks fun, you can enter the paid leaderboard later. Invite code: 26BC4B90CB.",
      cta: "Try it and send me your picks.",
      asset: "media/worldcup26-referral-square.jpg",
      utmSource: "zero-signup-dm",
      utmMedium: "manual-outreach",
      utmContent: "try_and_send_picks",
    }),
    variant({
      priority: 8,
      owner: "Dexter",
      channel: "X / poll",
      hook: "Poll: favorite, underdog, or chaos pick?",
      beat: "Poll first, link second. Make the post about football opinions, not the product.",
      caption: "I am collecting WorldCup26 picks. Pick 3 teams free here, code 26BC4B90CB.",
      cta: "Vote, then join and send your picks.",
      asset: "media/worldcup26-referral-square.jpg",
      utmSource: "zero-signup-x-poll",
      utmMedium: "organic-post",
      utmContent: "favorites_underdogs_poll",
    }),
  ];

  return {
    schema: "worldcup26-zero-signup-rescue-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: BASE_LINK,
    ok: true,
    state: zeroSignup ? "critical-zero-signups" : "active-signups",
    counts: { acceptedReferrals, signupSaves, entries },
    zeroSignup,
    staleExternalProof,
    urgentOpenRows: Number(proofSla.counts?.urgentOpenRows ?? 0),
    nextProofAction: firstRescueAction(rescueActions),
    creativeVariants,
    rule:
      "This rescue board is for real distribution. Do not mark any variant done until it is actually posted or sent from an owned account.",
  };
}

function variant(input) {
  const link = trackedLink(input.utmSource, input.utmMedium, input.utmContent);
  const proofNote =
    `${input.channel}: posted/sent from <account> at YYYY-MM-DD HH:mm EEST; ` +
    `asset ${input.asset}; code ${REFERRAL_CODE}; link included; observed replies/signups <N>`;
  const copy = `${input.hook}\n\n${input.caption}\n\n${input.cta}\n${link}`;
  return {
    ...input,
    link,
    copy,
    proofNote,
    shareLinks: buildShareLinks({ link, copy }),
    attemptCommand: buildAttemptCommand(input, link, proofNote),
  };
}

function trackedLink(source, medium, content) {
  const url = new URL(BASE_LINK);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", "worldcup26_zero_signup_rescue");
  url.searchParams.set("utm_content", content);
  return url.toString();
}

function firstRescueAction(actions) {
  const first = actions[0] ?? null;
  if (!first) return null;
  return {
    priority: String(first.priority ?? ""),
    owner: String(first.owner ?? ""),
    channel: String(first.channel ?? ""),
    action: String(first.action ?? ""),
    asset: String(first.asset ?? ""),
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 zero signup rescue ${payload.generatedAtEest}`,
    `state=${payload.state} code=${payload.referralCode}`,
    `counts accepted=${payload.counts.acceptedReferrals} signup_saves=${payload.counts.signupSaves} entries=${payload.counts.entries}`,
    `urgent_external_actions=${payload.urgentOpenRows}`,
    "",
    "non-negotiable diagnosis:",
    "- Zero signups means we need real public distribution and warm-contact sends, not more internal proof.",
    "- Use native short-form hooks: first 1-3 seconds must show the free action and the football challenge.",
    "- Every post must say free picks first. Do not lead with USDT or ticket mechanics.",
    "",
    "post_now_variants:",
  ];
  for (const row of payload.creativeVariants) {
    lines.push(`#${row.priority} ${row.owner} / ${row.channel}`);
    lines.push(`hook=${row.hook}`);
    lines.push(`caption=${row.caption}`);
    lines.push(`asset=${row.asset}`);
    lines.push(`link=${row.link}`);
    lines.push(`proof_after_real_action=${row.attemptCommand}`);
    lines.push("");
  }
  if (payload.nextProofAction) {
    lines.push(`current_stale_proof_action=#${payload.nextProofAction.priority} ${payload.nextProofAction.owner} / ${payload.nextProofAction.channel}`);
    lines.push(`action=${payload.nextProofAction.action}`);
    lines.push("");
  }
  lines.push(`Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  const rows = payload.creativeVariants
    .map(
      (row) => `## ${row.priority}. ${row.owner} / ${row.channel}

**Hook:** ${row.hook}

**Beat:** ${row.beat}

**Caption:** ${row.caption}

**CTA:** ${row.cta}

**Asset:** \`${row.asset}\`

**Tracked link:** ${row.link}

**Copy block:**

\`\`\`text
${row.copy}
\`\`\`

**Log after real post/send:**

\`\`\`bash
${row.attemptCommand}
\`\`\`

**Proof note after real post:** ${row.proofNote}
`,
    )
    .join("\n");
  return `# WorldCup26 Zero Signup Rescue

Generated: ${payload.generatedAtEest}

- State: ${payload.state}
- Accepted referrals: ${payload.counts.acceptedReferrals}
- Signup saves: ${payload.counts.signupSaves}
- Referred entries: ${payload.counts.entries}
- Urgent external actions: ${payload.urgentOpenRows}

## Diagnosis

Zero signups means we need real public distribution and warm-contact sends, not more internal proof. Lead every creative with the free action: pick 3 teams first, track private points, paid leaderboard later.

${rows}

${payload.rule}
`;
}

function renderCsv(payload) {
  const header = [
    "priority",
    "owner",
    "channel",
    "hook",
    "caption",
    "asset",
    "tracked_link",
    "copy",
    "proof_note",
    "attempt_command",
  ];
  const rows = payload.creativeVariants.map((row) =>
    [row.priority, row.owner, row.channel, row.hook, row.caption, row.asset, row.link, row.copy, row.proofNote, row.attemptCommand].map(csvCell).join(","),
  );
  return `${header.join(",")}\n${rows.join("\n")}\n`;
}

function renderHtml(payload) {
  const cards = payload.creativeVariants
    .map(
      (row) => `<section class="card">
        <div class="meta">#${row.priority} ${escapeHtml(row.owner)} / ${escapeHtml(row.channel)}</div>
        <h2>${escapeHtml(row.hook)}</h2>
        <p>${escapeHtml(row.beat)}</p>
        <p><strong>Caption:</strong> ${escapeHtml(row.caption)}</p>
        <p><strong>CTA:</strong> ${escapeHtml(row.cta)}</p>
        <p><strong>Asset:</strong> <code>${escapeHtml(row.asset)}</code></p>
        <p><a href="${escapeHtml(row.link)}">${escapeHtml(row.link)}</a></p>
        <div class="actions">
          <button data-copy="${escapeAttr(row.copy)}">Copy caption</button>
          <button data-copy="${escapeAttr(row.link)}">Copy link</button>
          ${row.shareLinks.map((share) => `<a class="button" href="${escapeAttr(share.url)}" target="_blank" rel="noreferrer">${escapeHtml(share.label)}</a>`).join("")}
          <button class="secondary" data-copy="${escapeAttr(row.attemptCommand)}">Copy log command</button>
        </div>
        <pre>${escapeHtml(row.copy)}</pre>
        <pre>${escapeHtml(row.attemptCommand)}</pre>
      </section>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WorldCup26 Zero Signup Rescue</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #061711; color: #f8fff9; }
    main { max-width: 980px; margin: 0 auto; padding: 20px 12px 46px; }
    header, .card { border: 1px solid rgba(255,255,255,.16); border-radius: 8px; background: #0d2a20; padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    h2 { margin: 8px 0; font-size: 22px; color: #ffdc7a; }
    p { color: #d8e8e1; line-height: 1.45; overflow-wrap: anywhere; }
    a { color: #84f0bb; }
    code { color: #ffdc7a; }
    .meta { color: #84f0bb; font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 14px 0; }
    .stat { border: 1px solid rgba(255,255,255,.14); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.05); }
    .stat span { display:block; color:#aac8bd; font-size:12px; text-transform:uppercase; font-weight:800; }
    .stat strong { font-size:28px; color:#ffdc7a; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    button, .button { border: 1px solid rgba(132,240,187,.35); border-radius: 8px; color: #061711; background: linear-gradient(135deg, #ffdc7a, #84f0bb); padding: 9px 10px; min-height: 42px; font: inherit; font-weight: 900; text-decoration: none; cursor: pointer; }
    .secondary { color: #f8fff9; background: rgba(255,255,255,.08); }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Zero Signup Rescue</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="stats">
        ${stat("Accepted", payload.counts.acceptedReferrals)}
        ${stat("Signup saves", payload.counts.signupSaves)}
        ${stat("Entries", payload.counts.entries)}
        ${stat("Urgent", payload.urgentOpenRows)}
      </div>
    </header>
    ${cards}
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
</html>
`;
}

function buildShareLinks({ link, copy }) {
  return [
    { label: "WhatsApp", url: `whatsapp://send?text=${encodeURIComponent(copy)}` },
    { label: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(copy)}` },
    { label: "X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(copy)}` },
    { label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}` },
  ];
}

function buildAttemptCommand(row, link, proofNote) {
  return [
    "node campaign-public-channel-attempts.mjs --add",
    `--owner ${shellQuote(row.owner)}`,
    `--platform ${shellQuote(row.channel)}`,
    '--channel "zero signup rescue"',
    `--status ${shellQuote(statusForChannel(row.channel))}`,
    `--attempt-url ${shellQuote(link)}`,
    `--detail ${shellQuote(proofNote)}`,
    '--next-action "watch replies/signups; follow up with anyone who asks for help"',
  ].join(" ");
}

function statusForChannel(channel) {
  const value = String(channel ?? "").toLowerCase();
  if (value.includes("dm") || value.includes("personal") || value.includes("telegram") || value.includes("discord")) {
    return "sent";
  }
  if (value.includes("groups")) return "requested";
  return "posted";
}

function shellQuote(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function stat(label, value) {
  return `<div class="stat"><span>${escapeHtml(label)}</span><strong>${Number(value ?? 0)}</strong></div>`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\n/g, "&#10;");
}
