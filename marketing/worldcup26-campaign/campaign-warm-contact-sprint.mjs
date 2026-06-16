#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const BATCHES = [
  {
    id: "wc26-football-friends",
    owner: "Nano",
    platform: "WhatsApp personal",
    audience: "10 football friends",
    asset: "media/worldcup26-main-video.mp4",
    utmContent: "football_friends_batch",
    copy:
      "Quick football question: pick 3 teams for WorldCup26.\n\nIt is free to choose teams and see your private points preview. Paid leaderboard is optional later.\n\nUse my code 26BC4B90CB:\n{{LINK}}\n\nSend me your 3 teams after you join.",
  },
  {
    id: "wc26-poker-club",
    owner: "Nano",
    platform: "WhatsApp group",
    audience: "Player/Poker Club warm group",
    asset: "media/worldcup26-referral-square.jpg",
    utmContent: "poker_club_batch",
    copy:
      "Football side game for the group: pick 3 teams for WorldCup26.\n\nFree first step: choose teams and watch your private points preview. Ticket only matters if you want paid leaderboard entry.\n\nInvite code 26BC4B90CB:\n{{LINK}}",
  },
  {
    id: "wc26-family-close",
    owner: "Sienna",
    platform: "WhatsApp personal",
    audience: "10 close contacts",
    asset: "media/worldcup26-referral-story.jpg",
    utmContent: "close_contacts_batch",
    copy:
      "Can you test my WorldCup26 invite?\n\nOpen this, accept the invite, sign in with Google, and pick 3 teams. It is free to preview points.\n\nCode 26BC4B90CB:\n{{LINK}}\n\nPlease tell me if anything feels confusing.",
  },
  {
    id: "wc26-football-group-admins",
    owner: "Dexter",
    platform: "WhatsApp admins",
    audience: "football group admins",
    asset: "media/worldcup26-referral-16x9.jpg",
    utmContent: "football_admin_permission",
    copy:
      "Can I share a small World Cup prediction game in the group?\n\nIt lets people pick 3 teams free and see a private score preview. If allowed, I will post this invite code: 26BC4B90CB\n{{LINK}}",
    status: "requested",
  },
  {
    id: "wc26-conversion-testers",
    owner: "Memo",
    platform: "WhatsApp testers",
    audience: "3 trusted testers",
    asset: "runtime/signup-conversion-audit.html",
    utmContent: "trusted_tester_signup",
    copy:
      "I need one clean signup test for WorldCup26.\n\nPlease open this link, accept the invite, continue with Google, and pick 3 teams. Do not pay. Tell me the exact step where it stops if anything breaks.\n\nCode 26BC4B90CB:\n{{LINK}}",
  },
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const signupAudit = await readJson(path.join(runtimeDir, "signup-conversion-audit.json"), {});
const publicAttempts = await readJson(path.join(runtimeDir, "public-channel-attempts.json"), {});
const payload = buildPayload({ signupAudit, publicAttempts });

await writeFile(path.join(runtimeDir, "warm-contact-sprint.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "warm-contact-sprint.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "warm-contact-sprint.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "warm-contact-sprint.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ signupAudit, publicAttempts }) {
  const batches = BATCHES.map((batch, index) => normalizeBatch(batch, index + 1));
  const posted = Number(publicAttempts?.counts?.posted ?? 0);
  const blocked = Number(publicAttempts?.counts?.blocked ?? 0);
  const signupSaves = Number(signupAudit?.counts?.signupSaves ?? 0);
  return {
    schema: "worldcup26-warm-contact-sprint-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: batches.length >= 5 && batches.every((batch) => batch.copy.includes(REFERRAL_CODE) && batch.copy.includes("worldcup26.world/login")),
    state: signupSaves > 0 ? "signup-save-detected" : "warm-contact-sprint-needed",
    reason:
      "Public channels are blocked by login/verification gates, so warm private contacts are the fastest proof-safe path to real signups.",
    counts: {
      batches: batches.length,
      postedAttempts: posted,
      blockedAttempts: blocked,
      signupSaves,
    },
    batches,
    firstAction: batches[0],
    proofRule:
      "Do not log these as proof until the exact private message/status/admin request was actually sent. Use recipient count or initials, never raw phone numbers.",
  };
}

function normalizeBatch(batch, priority) {
  const link = `${REFERRAL_LINK}&utm_source=${encodeURIComponent(batch.platform.toLowerCase().replaceAll(" ", "-"))}&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=${encodeURIComponent(batch.utmContent)}`;
  const copy = batch.copy.replaceAll("{{LINK}}", link);
  const status = batch.status ?? "sent";
  const detail =
    `${batch.platform}: ${status} to <N> ${batch.audience} from <account> at YYYY-MM-DD HH:mm EEST; asset ${batch.asset}; code ${REFERRAL_CODE}; link included; replies/signups <N>`;
  return {
    priority: `warm-${priority}`,
    ...batch,
    status,
    link,
    copy,
    whatsappMobile: `whatsapp://send?text=${encodeURIComponent(copy)}`,
    whatsappWeb: `https://wa.me/?text=${encodeURIComponent(copy)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(copy)}`,
    quickLogCommand:
      `node campaign-warm-send-log.mjs --priority warm-${priority} --count <N> --account "<account>" --replies 0`,
    proofCommand:
      `node campaign-public-channel-attempts.mjs --add --owner ${shellQuote(batch.owner)} --platform ${shellQuote(batch.platform)} --channel "warm-contact sprint" --status ${shellQuote(status)} --attempt-url ${shellQuote(link)} --detail ${shellQuote(detail)} --next-action "watch replies/signups; help anyone who asks; run referral activity after 15 minutes"`,
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 warm contact sprint ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} batches=${payload.counts.batches} blocked_public=${payload.counts.blockedAttempts} signup_saves=${payload.counts.signupSaves}`,
    `code=${payload.referralCode}`,
    `rule=${payload.proofRule}`,
    "",
  ];
  for (const batch of payload.batches) {
    lines.push(
      `#${batch.priority} ${batch.owner} / ${batch.platform} / ${batch.audience}`,
      `asset=${batch.asset}`,
      `link=${batch.link}`,
      "copy:",
      indent(batch.copy),
      `whatsapp=${batch.whatsappWeb}`,
      `telegram=${batch.telegram}`,
      "quick_log_after_real_send:",
      batch.quickLogCommand,
      "proof_after_real_send:",
      batch.proofCommand,
      "",
    );
  }
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Warm Contact Sprint

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Referral code: \`${payload.referralCode}\`
- Batches: ${payload.counts.batches}
- Public blocked attempts: ${payload.counts.blockedAttempts}
- Signup saves: ${payload.counts.signupSaves}

${payload.reason}

${payload.proofRule}

${payload.batches.map(renderBatchMarkdown).join("\n\n")}
`;
}

function renderBatchMarkdown(batch) {
  return `## ${batch.priority} ${batch.owner} / ${batch.platform}

- Audience: ${batch.audience}
- Asset: \`${batch.asset}\`
- Link: ${batch.link}
- WhatsApp: ${batch.whatsappWeb}
- Telegram: ${batch.telegram}

\`\`\`text
${batch.copy}
\`\`\`

Quick log after the real send:

\`\`\`bash
${batch.quickLogCommand}
\`\`\`

Full proof command:

\`\`\`bash
${batch.proofCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Warm Contact Sprint</title>
  <style>
    body{margin:0;background:#06120e;color:#edf8f1;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{max-width:1040px;margin:0 auto;padding:24px}
    header,.card{border:1px solid rgba(255,215,112,.28);background:linear-gradient(135deg,rgba(5,74,51,.95),rgba(20,32,27,.96));border-radius:14px;padding:18px;margin-bottom:14px;box-shadow:0 16px 48px rgba(0,0,0,.28)}
    h1{margin:0 0 8px;font-size:28px} h2{margin:0 0 8px;font-size:18px}
    p{color:#ccdad3;line-height:1.45}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px}
    .metric{border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:12px;background:rgba(255,255,255,.06)}
    .metric span{display:block;color:#b9c8c0;font-size:12px;text-transform:uppercase;font-weight:800}.metric strong{font-size:25px;color:#ffdc7c}
    .links{display:flex;flex-wrap:wrap;gap:8px}.button{display:inline-block;padding:10px 12px;border-radius:8px;background:#0f7f5c;color:#fff;text-decoration:none;font-weight:850}
    .button.alt{background:#f7c75b;color:#102218} pre{white-space:pre-wrap;background:rgba(0,0,0,.24);padding:12px;border-radius:10px;overflow:auto} code{color:#ffdc7c}
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Warm Contact Sprint</h1>
      <p>${escapeHtml(payload.reason)}</p>
      <p>${escapeHtml(payload.proofRule)}</p>
      <div class="metrics">
        ${metric("Batches", payload.counts.batches)}
        ${metric("Blocked public", payload.counts.blockedAttempts)}
        ${metric("Signup saves", payload.counts.signupSaves)}
        ${metric("Code", payload.referralCode)}
      </div>
    </header>
    ${payload.batches.map(renderBatchHtml).join("")}
  </main>
</body>
</html>
`;
}

function renderBatchHtml(batch) {
  return `<section class="card">
    <h2>${escapeHtml(batch.priority)} ${escapeHtml(batch.owner)} / ${escapeHtml(batch.platform)}</h2>
    <p><strong>Audience:</strong> ${escapeHtml(batch.audience)}<br><strong>Asset:</strong> <code>${escapeHtml(batch.asset)}</code></p>
    <div class="links">
      <a class="button alt" href="${escapeAttr(batch.whatsappWeb)}">WhatsApp</a>
      <a class="button" href="${escapeAttr(batch.telegram)}">Telegram</a>
      <a class="button" href="${escapeAttr(batch.link)}">Open link</a>
    </div>
    <pre>${escapeHtml(batch.copy)}</pre>
    <pre>${escapeHtml(batch.quickLogCommand)}</pre>
    <pre>${escapeHtml(batch.proofCommand)}</pre>
  </section>`;
}

function metric(label, value) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function indent(value) {
  return String(value).split("\n").map((line) => `  ${line}`).join("\n");
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function formatEestLogTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", "");
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--quiet") parsed.quiet = true;
    else if (token === "--root") parsed.root = argv[++index];
    else if (token === "--now") parsed.now = argv[++index];
  }
  return parsed;
}
