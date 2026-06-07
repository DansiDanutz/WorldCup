#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const AD_CHANNELS = [
  {
    key: "meta",
    owner: "Memo",
    platform: "Meta Ads Manager",
    managerUrl:
      "https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?act=61071192&ads_manager_write_regions=true&nav_entry_point=lep_176&selected_ad_ids=6971048413400&nav_source=unknown",
    campaignUrl: `${REFERRAL_LINK}&utm_source=meta&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h`,
    checklist: [
      "Confirm campaign/ad set/ad is active or scheduled.",
      "Confirm landing URL includes ref=26BC4B90CB.",
      "Confirm first text angle is free picks first, ticket only for paid leaderboard.",
      "Check impressions, clicks, CTR, spend, and rejected/ad-limited warnings.",
      "Save a screenshot or note with time, campaign id, spend, clicks, and status.",
    ],
  },
  {
    key: "x",
    owner: "Memo",
    platform: "X Ads Manager",
    managerUrl: "https://ads.x.com/manager/18ce55rrs16/campaigns",
    campaignUrl: `${REFERRAL_LINK}&utm_source=x&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h`,
    checklist: [
      "Confirm the X campaign exists in account 18ce55rrs16.",
      "Confirm campaign/ad group/ad is active or scheduled.",
      "Confirm landing URL includes ref=26BC4B90CB.",
      "Confirm copy leads with free 3-team picks and private score preview.",
      "Save a screenshot or note with time, campaign id, spend, clicks, and status.",
    ],
  },
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const payload = buildPayload(now);

await writeFile(path.join(runtimeDir, "ad-ops-links.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "ad-ops-links.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "ad-ops-links.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "ad-ops-links.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload(nowValue) {
  const channels = AD_CHANNELS.map((channel) => ({
    ...channel,
    attemptCommand: [
      "node campaign-public-channel-attempts.mjs --add",
      `--owner ${shellQuote(channel.owner)}`,
      `--platform ${shellQuote(channel.platform)}`,
      '--channel "paid campaign ops"',
      '--status "ready"',
      `--attempt-url ${shellQuote(channel.managerUrl)}`,
      `--detail ${shellQuote(`${channel.platform} checked at YYYY-MM-DD HH:mm EEST; status <active/scheduled/blocked>; spend <amount>; clicks <N>; landing ${channel.campaignUrl}`)}`,
    ].join(" "),
  }));
  return {
    schema: "worldcup26-ad-ops-links-v1",
    generatedAt: nowValue.toISOString(),
    generatedAtEest: formatEestLogTime(nowValue),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: channels.length === 2 && channels.every((channel) => channel.managerUrl && channel.campaignUrl.includes(REFERRAL_CODE)),
    channels,
    rule:
      "This page tracks paid-channel control links only. It proves nothing about spend or delivery until an operator records real status, spend, clicks, and screenshot/note details.",
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 ad ops links ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} code=${payload.referralCode} channels=${payload.channels.length}`,
    `rule=${payload.rule}`,
    "",
  ];
  for (const channel of payload.channels) {
    lines.push(
      `${channel.platform}`,
      `manager=${channel.managerUrl}`,
      `landing=${channel.campaignUrl}`,
      "checklist:",
      ...channel.checklist.map((item) => `- ${item}`),
      "log_after_real_check:",
      channel.attemptCommand,
      "",
    );
  }
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Ad Ops Links

Generated: ${payload.generatedAtEest}

- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

${payload.rule}

${payload.channels.map(renderChannelMarkdown).join("\n\n")}
`;
}

function renderChannelMarkdown(channel) {
  return `## ${channel.platform}

- Manager: ${channel.managerUrl}
- Landing URL: ${channel.campaignUrl}

${channel.checklist.map((item) => `- ${item}`).join("\n")}

\`\`\`bash
${channel.attemptCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Ad Ops Links</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2c22; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bed3ca; --gold: #ffd974; --mint: #74f0b2; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: radial-gradient(circle at 8% 0%, rgba(255,217,116,.2), transparent 22rem), radial-gradient(circle at 100% 0%, rgba(116,240,178,.16), transparent 24rem), var(--bg); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(920px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, section { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,44,34,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(32px, 7vw, 62px); line-height: .92; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p, li { color: var(--muted); line-height: 1.45; }
    a { color: var(--gold); overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.28); padding: 10px; }
    button, .button { border: 1px solid var(--line); border-radius: 8px; color: #03140f; background: linear-gradient(135deg, var(--gold), var(--mint)); font-weight: 950; padding: 10px 12px; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; min-height: 42px; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .copy-state { color: var(--mint); min-height: 18px; font-size: 13px; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Ad Ops Links</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <p>Referral code: <strong>${escapeHtml(payload.referralCode)}</strong></p>
    </header>
    ${payload.channels.map(renderChannelHtml).join("\n")}
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

function renderChannelHtml(channel) {
  const commandId = `command-${channel.key}`;
  return `<section>
    <h2>${escapeHtml(channel.platform)}</h2>
    <p><strong>Manager:</strong> <a href="${escapeAttr(channel.managerUrl)}">${escapeHtml(channel.managerUrl)}</a></p>
    <p><strong>Landing:</strong> <a href="${escapeAttr(channel.campaignUrl)}">${escapeHtml(channel.campaignUrl)}</a></p>
    <ul>${channel.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <div class="actions">
      <a class="button" href="${escapeAttr(channel.managerUrl)}">Open manager</a>
      <a class="button" href="${escapeAttr(channel.campaignUrl)}">Open landing</a>
      <button type="button" data-copy="#${commandId}">Copy log command</button>
      <span class="copy-state"></span>
    </div>
    <pre id="${commandId}">${escapeHtml(channel.attemptCommand)}</pre>
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

function shellQuote(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
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
