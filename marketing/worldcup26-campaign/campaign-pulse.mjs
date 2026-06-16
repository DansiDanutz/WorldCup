#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = "https://worldcup26.world/login?ref=26BC4B90CB";
const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];
const DEFAULT_WINDOW_HOURS = 72;
const DEFAULT_INTERVAL_MINUTES = 15;

const xPublicFallbackCopies = [
  `WorldCup26 is open.

Pick 3 teams for free. See your private points preview.

Use a ticket only when you want to enter the paid leaderboard.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}`,
  `If you already have strong World Cup takes, make your 3 picks.

WorldCup26 now lets you save the picks first and decide later if you want the paid leaderboard:
${REFERRAL_LINK}

Code: ${REFERRAL_CODE}`,
  `Favorites or underdogs?

Pick 3 teams free first. Watch what your score would be.

Join with code ${REFERRAL_CODE}:
${REFERRAL_LINK}`,
  `One month of football. Three picks. Free preview first.

Join WorldCup26 with my code:
${REFERRAL_CODE}

${REFERRAL_LINK}`,
];

const workerCycles = {
  Dexter: [
    {
      channel: "X / public fallback",
      lane: "Short feed",
      asset: "media/worldcup26-referral-16x9.jpg",
      mode: "manual post",
      action: "Publish or prepare a short public CTA if X is logged in.",
      copy: `WorldCup26 is open.

Pick 3 teams for free. See your private points preview.

Use a ticket only when you want to enter the paid leaderboard.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}`,
      proof: "public-post-url",
    },
    {
      channel: "Football groups",
      lane: "Permission first",
      asset: "campaign/first-wave-posts.md",
      mode: "approval first",
      action: "Ask one football group admin for approval; post only if welcome.",
      copy: `For football fans here:

WorldCup26 lets you pick 3 teams free first and see what your points would do.

If you want the real paid leaderboard, use a ticket after.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}`,
      proof: "admin-approved-url-or-note",
    },
    {
      channel: "Facebook/feed fallback",
      lane: "Friends feed",
      asset: "media/worldcup26-referral-square.jpg",
      mode: "manual post",
      action: "Post a friendly feed variant if Facebook is logged in.",
      copy: `WorldCup26 is live for signups.

Pick 3 teams before they lock. You can save the picks for free and watch your private points preview.

Use a ticket only if you want to enter the paid leaderboard.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}`,
      proof: "public-post-url",
    },
    {
      channel: "Creator outreach",
      lane: "Partner DM",
      asset: "campaign/first-wave-posts.md",
      mode: "manual outreach",
      action: "Send one approved partner DM to a football micro-creator.",
      copy: `Hey - I am promoting WorldCup26, a World Cup prediction game where users pick 3 teams free first, see a private points preview, and can use a ticket later for the paid leaderboard.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}

Would one story or post fit your football audience?`,
      proof: "private-dm-note",
    },
  ],
  Sienna: [
    {
      channel: "WhatsApp Status",
      lane: "Status/story",
      asset: "media/worldcup26-main-video.mp4",
      mode: "manual post",
      action: "Post the video/status copy if WhatsApp is available.",
      copy: `I invited you to WorldCup26.

Pick 3 teams for free first. You can see what your points would be, then use a ticket only if you want to enter the paid leaderboard.

Use my referral code ${REFERRAL_CODE} when you join:
${REFERRAL_LINK}

All teams are still available right now.`,
      proof: "private-whatsapp-status-note",
    },
    {
      channel: "Instagram/Facebook Story",
      lane: "Story",
      asset: "media/worldcup26-referral-story.jpg",
      mode: "manual post",
      action: "Post story image with code and link sticker if logged in.",
      copy: `Pick 3 teams before they lock.

Free preview first. Paid leaderboard only when you use a ticket.

Join with code ${REFERRAL_CODE}:
${REFERRAL_LINK}`,
      proof: "story-url-or-account-note",
    },
    {
      channel: "Shorts/Reels/TikTok",
      lane: "Video",
      asset: "media/worldcup26-main-video.mp4",
      mode: "manual post",
      action: "Upload the main video with code in the first line.",
      copy: `Pick 3 teams before they lock. Free preview first, paid leaderboard after ticket.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}`,
      proof: "video-url",
    },
    {
      channel: "Community caption",
      lane: "Friendly caption",
      asset: "media/worldcup26-referral-square.jpg",
      mode: "manual post",
      action: "Post a friendly invite where promo links are welcome.",
      copy: `I want a small football group inside WorldCup26.

Pick your 3 teams free first and compare what your points would be.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}`,
      proof: "public-post-url-or-private-note",
    },
  ],
  Memo: [
    {
      channel: "Proof audit",
      lane: "Ops",
      asset: "runtime/posting-log-live.csv",
      mode: "internal",
      action: "Check proof log, list unproven current rows, and flag blocked channels.",
      copy: `Ops pulse: verify proof rows, urgent rows, and blocked channels.

Referral: ${REFERRAL_LINK}
Code: ${REFERRAL_CODE}`,
      proof: "internal-log-note",
    },
    {
      channel: "Asset audit",
      lane: "Ops",
      asset: "promo-kit-manifest.md",
      mode: "internal",
      action: "Confirm video and image assets are present on this worker.",
      copy: "Ops pulse: verify MP4, story image, square image, and command center are present.",
      proof: "internal-log-note",
    },
    {
      channel: "Copy rotation",
      lane: "Ops",
      asset: "copy-bank.md",
      mode: "internal",
      action: "Prepare one fresh short hook and one reply answer for the next worker.",
      copy: `Ops pulse: rotate copy without fixed prize claims.

Keep the free-picks hook visible: users save 3 picks first, watch a private points preview, and use a ticket only for paid leaderboard entry.

Use code ${REFERRAL_CODE} and link ${REFERRAL_LINK}.`,
      proof: "internal-log-note",
    },
    {
      channel: "Next best channel",
      lane: "Ops",
      asset: "runtime/dispatch-board.md",
      mode: "internal",
      action: "Choose the next unblocked public or private channel and keep the board moving.",
      copy: "Ops pulse: if a channel is logged out, pick the next owned channel. Do not log proof until real posting happens.",
      proof: "internal-log-note",
    },
  ],
  Nano: [
    {
      channel: "WhatsApp personal",
      lane: "Warm contacts",
      asset: "media/worldcup26-main-video.mp4",
      mode: "manual outreach",
      action: "Send one warm-contact batch if WhatsApp is available.",
      copy: `I am inviting friends to WorldCup26.

You can pick 3 teams for free and see your private points preview during the tournament.
Use a ticket only if you want to enter the paid leaderboard.
Use my code when you join: ${REFERRAL_CODE}

${REFERRAL_LINK}`,
      proof: "private-whatsapp-note",
    },
    {
      channel: "Telegram personal",
      lane: "Warm contacts",
      asset: "campaign/copy-bank.md",
      mode: "manual outreach",
      action: "Send the invite to one approved Telegram contact or group where welcome.",
      copy: `WorldCup26 = pick 3 teams free first, score through real matches, and see what your points would be.

Paid leaderboard entry happens only when you use a ticket.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}`,
      proof: "private-telegram-note",
    },
    {
      channel: "Replies",
      lane: "Objections",
      asset: "campaign/copy-bank.md",
      mode: "manual replies",
      action: "Answer one pending question and return to the code/link CTA.",
      copy: `Quick version: you pick 3 World Cup teams for free first. They score from real results and you can see your private preview.

Use a ticket only if you want to enter the paid leaderboard.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}`,
      proof: "reply-url-or-private-note",
    },
    {
      channel: "DM follow-up",
      lane: "Follow-up",
      asset: "campaign/copy-bank.md",
      mode: "manual outreach",
      action: "Follow up once with someone who reacted but did not join.",
      copy: `Still want the WorldCup26 invite?

You can save your 3 picks free first and decide about the paid leaderboard later.

Code: ${REFERRAL_CODE}
${REFERRAL_LINK}`,
      proof: "private-dm-note",
    },
  ],
};

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const pulseStatePath = path.join(runtimeDir, "nonstop-pulse-state.json");
const pulsePath = path.join(runtimeDir, "nonstop-pulse.json");
const now = args.now ? new Date(args.now) : new Date();
const windowHours = positiveNumber(args.windowHours, DEFAULT_WINDOW_HOURS);
const intervalMinutes = positiveNumber(args.intervalMinutes, DEFAULT_INTERVAL_MINUTES);

await mkdir(runtimeDir, { recursive: true });
const start = await resolvePulseStart(now, intervalMinutes);
const pulses = buildPulses(start, windowHours, intervalMinutes);

await writeFile(
  pulseStatePath,
  `${JSON.stringify({ startedAt: start.toISOString(), intervalMinutes, updatedAt: now.toISOString() }, null, 2)}\n`,
);
await writeFile(pulsePath, `${JSON.stringify({ generatedAt: now.toISOString(), startedAt: start.toISOString(), windowHours, intervalMinutes, referralCode: REFERRAL_CODE, referralLink: REFERRAL_LINK, pulses }, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "nonstop-pulse.csv"), renderCsv(pulses));
await writeFile(path.join(runtimeDir, "nonstop-pulse.md"), renderMarkdown(pulses, now, windowHours, intervalMinutes));

if (!args.quiet) {
  process.stdout.write(
    [
      "WorldCup26 nonstop pulse ready",
      `Generated: ${now.toISOString()}`,
      `Window: ${windowHours}h`,
      `Interval: ${intervalMinutes}m`,
      `Pulses: ${pulses.length}`,
      `First: ${pulses[0]?.scheduledAtEest ?? "none"} / ${pulses[0]?.owner ?? ""} / ${pulses[0]?.channel ?? ""}`,
      "",
    ].join("\n"),
  );
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--quiet") result.quiet = true;
    else if (arg === "--root") result.root = argv[++index];
    else if (arg === "--now") result.now = argv[++index];
    else if (arg === "--window-hours") result.windowHours = argv[++index];
    else if (arg === "--interval-minutes") result.intervalMinutes = argv[++index];
    else if (arg === "--reset-start") result.resetStart = true;
  }
  return result;
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function buildPulses(startTime, hours, minutes) {
  const count = Math.ceil((hours * 60) / minutes);
  const rows = [];
  for (let index = 0; index < count; index += 1) {
    const owner = WORKERS[index % WORKERS.length];
    const cycle = workerCycles[owner];
    const workerCycleIndex = Math.floor(index / WORKERS.length);
    const templateIndex = workerCycleIndex % cycle.length;
    const templateCycle = Math.floor(workerCycleIndex / cycle.length);
    const template = cycle[templateIndex];
    const scheduledAt = new Date(startTime.getTime() + index * minutes * 60_000);
    const trackedLink = buildTrackedLink(owner, template.channel, template.mode, `pulse${index + 1}`);
    const copy = resolvePulseCopy(template, templateCycle);
    rows.push({
      pulse: index + 1,
      scheduledAtEest: formatEestLogTime(scheduledAt),
      owner,
      lane: template.lane,
      channel: template.channel,
      mode: template.mode,
      action: template.action,
      asset: template.asset,
      trackedLink,
      primaryCopy: replaceReferralLink(copy, trackedLink),
      proofHint: template.proof,
      proofInstruction:
        "If this pulse is also the current urgent row, use that priority row's proof command. Otherwise keep the public URL or private note for Memo's proof audit.",
    });
  }
  return rows;
}

async function resolvePulseStart(nowValue, minutes) {
  if (!args.resetStart) {
    const stateStart = await readStartedAtFromJson(pulseStatePath, "startedAt");
    if (stateStart) return stateStart;

    const existingStart = await readExistingPulseStart();
    if (existingStart) return existingStart;
  }

  return roundUpMinutes(nowValue, minutes);
}

async function readExistingPulseStart() {
  const existing = await readStartedAtFromJson(pulsePath, "startedAt");
  if (existing) return existing;

  try {
    const data = JSON.parse(await readFile(pulsePath, "utf8"));
    const firstLabel = data?.pulses?.[0]?.scheduledAtEest;
    return parseEestLogTime(firstLabel);
  } catch {
    return null;
  }
}

async function readStartedAtFromJson(filePath, key) {
  try {
    const data = JSON.parse(await readFile(filePath, "utf8"));
    const parsed = new Date(data?.[key]);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  } catch {
    return null;
  }
}

function parseEestLogTime(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) \+0300$/);
  if (!match) return null;
  const parsed = new Date(`${match[1]}T${match[2]}:00+03:00`);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function resolvePulseCopy(template, templateCycle) {
  if (template.channel === "X / public fallback") {
    return xPublicFallbackCopies[templateCycle % xPublicFallbackCopies.length];
  }
  return template.copy;
}

function renderMarkdown(rows, generatedAt, hours, minutes) {
  const byWorker = WORKERS.map((worker) => buildWorkerPulseGroup(rows, worker, generatedAt));
  const nextRows = getNextRows(rows, generatedAt, 24);
  return `# WorldCup26 Non-Stop Pulse

Generated: ${generatedAt.toISOString()}

Referral code: \`${REFERRAL_CODE}\`
Referral link: ${REFERRAL_LINK}

Window: ${hours} hours
Cadence: one worker action every ${minutes} minutes
Total pulse actions: ${rows.length}

This pulse board keeps Dexter, Sienna, Memo, and Nano moving between formal queue rows. It does not mark anything posted. A social, story, message, or reply is proven only when a real URL or private-channel proof note is added to \`runtime/posting-log-live.csv\`.

## Current Worker Pulses

${byWorker.map(renderWorkerBlock).join("\n\n")}

## Next 24 Pulses

${nextRows.map(renderPulse).join("\n\n")}
`;
}

function buildWorkerPulseGroup(rows, worker, generatedAt) {
  const workerRows = rows
    .filter((row) => row.owner === worker)
    .sort(comparePulseRows);
  const currentIndex = getNextRowIndex(workerRows, generatedAt);
  const current = currentIndex >= 0 ? workerRows[currentIndex] : null;
  const next = currentIndex >= 0 ? workerRows.slice(currentIndex, currentIndex + 8) : [];
  return { worker, current, next };
}

function getNextRows(rows, generatedAt, limit) {
  const sorted = [...rows].sort(comparePulseRows);
  const nextIndex = getNextRowIndex(sorted, generatedAt);
  if (nextIndex >= 0) return sorted.slice(nextIndex, nextIndex + limit);
  return sorted.slice(Math.max(0, sorted.length - limit));
}

function getNextRowIndex(rows, generatedAt) {
  const nowTime = generatedAt.getTime();
  const nextIndex = rows.findIndex((row) => {
    const scheduledAt = parseEestLogTime(row.scheduledAtEest);
    return scheduledAt && scheduledAt.getTime() >= nowTime;
  });
  if (nextIndex >= 0) return nextIndex;
  return rows.length > 0 ? rows.length - 1 : -1;
}

function comparePulseRows(left, right) {
  const leftDate = parseEestLogTime(left.scheduledAtEest);
  const rightDate = parseEestLogTime(right.scheduledAtEest);
  if (leftDate && rightDate) return leftDate.getTime() - rightDate.getTime();
  return Number(left.pulse ?? 0) - Number(right.pulse ?? 0);
}

function renderWorkerBlock(group) {
  if (!group.current) return `### ${group.worker}\n\nNo pulse action.`;
  return `### ${group.worker}

Current: ${group.current.scheduledAtEest} / ${group.current.channel}

${group.next.map((row) => `- ${row.scheduledAtEest}: ${row.channel} - ${row.action}`).join("\n")}`;
}

function renderPulse(row) {
  return `### ${row.pulse}. ${row.scheduledAtEest} / ${row.owner} / ${row.channel}

- Lane: ${row.lane}
- Mode: ${row.mode}
- Asset: \`${row.asset}\`
- Action: ${row.action}
- Link: ${row.trackedLink}
- Proof hint: ${row.proofHint}

\`\`\`text
${row.primaryCopy}
\`\`\``;
}

function renderCsv(rows) {
  const header = [
    "pulse",
    "scheduled_at_eest",
    "owner",
    "lane",
    "channel",
    "mode",
    "action",
    "asset",
    "tracked_link",
    "primary_copy",
    "proof_hint",
  ];
  return `${header.join(",")}\n${rows.map((row) => header.map((key) => csvEscape(toCsvRow(row)[key])).join(",")).join("\n")}\n`;
}

function toCsvRow(row) {
  return {
    pulse: row.pulse,
    scheduled_at_eest: row.scheduledAtEest,
    owner: row.owner,
    lane: row.lane,
    channel: row.channel,
    mode: row.mode,
    action: row.action,
    asset: row.asset,
    tracked_link: row.trackedLink,
    primary_copy: row.primaryCopy,
    proof_hint: row.proofHint,
  };
}

function roundUpMinutes(date, minutes) {
  const next = new Date(date);
  next.setSeconds(0, 0);
  const remainder = next.getMinutes() % minutes;
  if (remainder !== 0) {
    next.setMinutes(next.getMinutes() + (minutes - remainder));
  }
  if (next < date) {
    next.setMinutes(next.getMinutes() + minutes);
  }
  return next;
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

function buildTrackedLink(owner, channel, mode, content) {
  const url = new URL(REFERRAL_LINK);
  url.searchParams.set("utm_source", slug(channel));
  url.searchParams.set("utm_medium", slug(mode));
  url.searchParams.set("utm_campaign", "worldcup26_referral_72h");
  url.searchParams.set("utm_content", `${slug(owner)}_${slug(content)}`);
  return url.toString();
}

function replaceReferralLink(text, link) {
  return String(text ?? "").replaceAll(REFERRAL_LINK, link || REFERRAL_LINK);
}

function slug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "manual";
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
