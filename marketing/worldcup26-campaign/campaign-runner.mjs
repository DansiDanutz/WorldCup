#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = "https://worldcup26.world/login?ref=26BC4B90CB";
const DEFAULT_WINDOW_HOURS = 12;
const DEFAULT_OVERDUE_MINUTES = 60;
const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];
const POSTING_PROOF_HEADER = [
  "timestamp_eest",
  "scheduled_at_eest",
  "owner",
  "channel",
  "asset",
  "copy_used",
  "link",
  "status",
  "proof_url",
  "reply_count",
  "signup_notes",
  "next_followup",
];

const workerBriefs = {
  Dexter: {
    lane: "Football hooks and short feed posts",
    output:
      "Write punchy football-fan copy. Use favorites, underdogs, friends, leaderboard, and pick-three-team angles.",
  },
  Sienna: {
    lane: "Visual captions, stories, reels, and community posts",
    output:
      "Write friendly captions and story/status text for the video and referral images. Keep it clear and human.",
  },
  Memo: {
    lane: "Ops tracker and campaign log",
    output:
      "Keep the log clean, summarize what is due, and identify the next five actions. Do not post automatically.",
  },
  Nano: {
    lane: "Replies, DMs, objections, and micro-posts",
    output:
      "Prepare short replies that answer one question and return to the code/link CTA without pressure.",
  },
};

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const queuePath = path.join(campaignDir, "72h-posting-queue.csv");
const outputDir = path.join(campaignDir, "runtime");
const liveLogPath = path.join(outputDir, "posting-log-live.csv");
const now = args.now ? new Date(args.now) : new Date();
const windowHours = Number.isFinite(Number(args.windowHours))
  ? Number(args.windowHours)
  : DEFAULT_WINDOW_HOURS;
const overdueMinutes = Number.isFinite(Number(args.overdueMinutes))
  ? Number(args.overdueMinutes)
  : DEFAULT_OVERDUE_MINUTES;
const selectedOwner = normalizeOwner(args.owner);

if (args.help) {
  printHelp();
  process.exit(0);
}

const queueText = await readFile(queuePath, "utf8");
const rows = parseCsv(queueText).map(normalizeRow).filter(Boolean);
const activeRows = rows.filter((row) => row.status !== "done" && row.status !== "cancelled");
const postingProof = await readPostingProofLog();
const proofedActiveRows = activeRows
  .map((row) => ({ row, proof: findPostingProof(row, postingProof) }))
  .filter((match) => match.proof);
const unproofedActiveRows = activeRows.filter((row) => !findPostingProof(row, postingProof));
const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000);
const dueRows = unproofedActiveRows.filter((row) => row.scheduledAt <= now);
const upcomingRows = unproofedActiveRows.filter((row) => row.scheduledAt > now && row.scheduledAt <= windowEnd);
const overdueCutoff = new Date(now.getTime() - overdueMinutes * 60 * 1000);
const overdueRows = dueRows.filter((row) => row.scheduledAt < overdueCutoff);
const dueNowRows = dueRows.filter((row) => row.scheduledAt >= overdueCutoff);
const urgentRows = [...overdueRows, ...dueNowRows].sort(sortBySchedule);
const postNowRows = buildPostNowRows(urgentRows);
const owners = selectedOwner ? [selectedOwner] : WORKERS;
const ownerPlans = Object.fromEntries(
  owners.map((owner) => [owner, buildOwnerPlan(owner, dueRows, upcomingRows, now)]),
);
const outboxRows = buildOutboxRows(ownerPlans);
const monitor = buildCampaignMonitor({
  now,
  windowEnd,
  overdueMinutes,
  overdueRows,
  dueNowRows,
  dueRows,
  upcomingRows,
  outboxRows,
  ownerPlans,
  postingProof,
  proofedActiveRows,
});

await mkdir(outputDir, { recursive: true });
const status = {
  generatedAt: now.toISOString(),
  referralCode: REFERRAL_CODE,
  referralLink: REFERRAL_LINK,
  campaignDir,
  queuePath,
  windowHours,
  overdueMinutes,
  dueCount: dueRows.length,
  dueNowCount: dueNowRows.length,
  overdueCount: overdueRows.length,
  upcomingCount: upcomingRows.length,
  postNowCount: postNowRows.length,
  outboxCount: outboxRows.length,
  postingProof: buildPostingProofSummary(postingProof, proofedActiveRows, dueRows),
  monitor: monitor.summary,
  activeHotActions: await readActiveHotActions(outputDir),
  owners: ownerPlans,
};

await writeFile(path.join(outputDir, "campaign-status.json"), `${JSON.stringify(status, null, 2)}\n`);
await writeFile(path.join(outputDir, "live-campaign-monitor.json"), `${JSON.stringify(monitor, null, 2)}\n`);
await writeFile(path.join(outputDir, "live-campaign-monitor.md"), renderCampaignMonitor(monitor));
await writeFile(path.join(outputDir, "posting-proof-report.json"), `${JSON.stringify(status.postingProof, null, 2)}\n`);
await writeFile(path.join(outputDir, "posting-proof-report.md"), renderPostingProofReport(status.postingProof));
await writeFile(path.join(outputDir, "post-now.md"), renderPostNowMarkdown(postNowRows));
await writeFile(path.join(outputDir, "post-now.csv"), renderPostNowCsv(postNowRows));
await writeFile(path.join(outputDir, "post-now-proof-rows.csv"), renderPostProofRowsCsv(postNowRows));
await writeFile(path.join(outputDir, "outbox-ready.csv"), renderOutboxCsv(outboxRows));
await writeFile(path.join(outputDir, "share-links.csv"), renderShareLinksCsv(outboxRows));
await writeFile(path.join(outputDir, "draft-pack-all.md"), renderAllDrafts(ownerPlans));
await writeFile(path.join(outputDir, "share-command-center.html"), renderShareCommandCenter(status, outboxRows, postNowRows));

for (const [owner, plan] of Object.entries(ownerPlans)) {
  await writeFile(path.join(outputDir, `next-actions-${owner.toLowerCase()}.md`), renderOwnerPlan(plan));
  await writeFile(path.join(outputDir, `draft-pack-${owner.toLowerCase()}.md`), renderDraftPack(plan));
}

await ensureLiveLog();

if (args.json) {
  process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
} else {
  process.stdout.write(renderConsole(status));
}

process.exit(0);

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") result.help = true;
    else if (arg === "--json") result.json = true;
    else if (arg === "--owner") result.owner = argv[++index];
    else if (arg === "--root") result.root = argv[++index];
    else if (arg === "--now") result.now = argv[++index];
    else if (arg === "--window-hours") result.windowHours = argv[++index];
    else if (arg === "--overdue-minutes") result.overdueMinutes = argv[++index];
  }
  return result;
}

function printHelp() {
  process.stdout.write(`WorldCup26 campaign runner

Usage:
  node campaign-runner.mjs [--owner Dexter|Sienna|Memo|Nano] [--window-hours 12] [--json]

Writes:
  runtime/campaign-status.json
  runtime/next-actions-dexter.md
  runtime/next-actions-sienna.md
  runtime/next-actions-memo.md
  runtime/next-actions-nano.md
  runtime/draft-pack-all.md
  runtime/draft-pack-dexter.md
  runtime/draft-pack-sienna.md
  runtime/draft-pack-memo.md
  runtime/draft-pack-nano.md
  runtime/outbox-ready.csv
  runtime/share-links.csv
  runtime/share-command-center.html
  runtime/live-campaign-monitor.json
  runtime/live-campaign-monitor.md
  runtime/posting-proof-report.json
  runtime/posting-proof-report.md
  runtime/post-now.md
  runtime/post-now.csv
  runtime/post-now-proof-rows.csv
  runtime/posting-log-live.csv

This runner prepares actions only. Actual posting stays manual on owned or approved channels.
`);
}

function normalizeOwner(value) {
  if (!value) return null;
  const owner = WORKERS.find((candidate) => candidate.toLowerCase() === String(value).toLowerCase());
  if (!owner) {
    throw new Error(`Unknown owner "${value}". Use one of: ${WORKERS.join(", ")}`);
  }
  return owner;
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

  const [header, ...data] = rows;
  return data.map((values) =>
    Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])),
  );
}

function normalizeRow(row) {
  const scheduledAt = parseEestDate(row.scheduled_at_eest);
  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) return null;
  const normalized = {
    scheduledAt,
    scheduledLabel: row.scheduled_at_eest,
    hour: row.hour,
    owner: row.owner,
    channel: row.channel,
    action: row.action,
    asset: row.asset,
    assetHint: getAssetHint(row.asset),
    mode: row.mode,
    referralCode: row.referral_code || REFERRAL_CODE,
    referralLink: row.referral_link || REFERRAL_LINK,
    status: row.status || "queued",
    notes: row.notes || "",
  };
  normalized.trackedLink = buildTrackedLink(normalized);
  return normalized;
}

function parseEestDate(value) {
  if (!value) return null;
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) ([+-]\d{2})(\d{2})$/,
  );
  if (!match) return new Date(value);
  const [, year, month, day, hour, minute, offsetHour, offsetMinute] = match;
  return new Date(
    `${year}-${month}-${day}T${hour}:${minute}:00${offsetHour}:${offsetMinute}`,
  );
}

function getAssetHint(asset) {
  if (!asset) return "No asset required";
  if (asset.startsWith("media/") || asset.startsWith("campaign/")) return asset;
  if (asset.endsWith(".mp4") || asset.endsWith(".jpg") || asset.endsWith(".png")) {
    return `media/${asset}`;
  }
  return `campaign/${asset}`;
}

function buildOwnerPlan(owner, due, upcoming, currentTime) {
  const relevantDue = due.filter((row) => row.owner === owner).sort(sortBySchedule);
  const relevantUpcoming = upcoming.filter((row) => row.owner === owner).sort(sortBySchedule);
  const next = relevantDue[0] ?? relevantUpcoming[0] ?? null;
  const draftRows = [...relevantDue, ...relevantUpcoming].slice(0, 8);
  return {
    owner,
    generatedAt: currentTime.toISOString(),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    brief: workerBriefs[owner],
    due: relevantDue,
    upcoming: relevantUpcoming,
    next,
    drafts: draftRows.map((row) => buildDraft(owner, row)),
    prompt: buildWorkerPrompt(owner, next, relevantDue, relevantUpcoming),
  };
}

function sortBySchedule(left, right) {
  return left.scheduledAt.getTime() - right.scheduledAt.getTime();
}

function buildWorkerPrompt(owner, next, due, upcoming) {
  const brief = workerBriefs[owner];
  const nextLine = next
    ? `${next.channel}: ${next.action} using ${next.assetHint}`
    : "No immediate queued action in this window. Prepare backup copy and monitor replies.";
  return [
    `You are ${owner}, assigned to ${brief.lane} for WorldCup26.`,
    brief.output,
    `Referral code: ${REFERRAL_CODE}`,
    `Referral link: ${REFERRAL_LINK}`,
    "Do not claim a fixed prize amount unless the live site is checked at posting time.",
    "Do not post automatically. Prepare copy, channel notes, and a log-ready summary.",
    `Immediate next action: ${nextLine}`,
    `Due actions for you: ${due.length}`,
    `Upcoming actions for you in this window: ${upcoming.length}`,
  ].join("\n");
}

function renderOwnerPlan(plan) {
  return `# ${plan.owner} Next Actions

Generated: ${plan.generatedAt}

Referral code: \`${plan.referralCode}\`
Referral link: ${plan.referralLink}

Lane: ${plan.brief.lane}

## Immediate Next

${plan.next ? renderAction(plan.next) : "No immediate queued action in this window."}

## Due Now

${plan.due.length ? plan.due.map(renderAction).join("\n\n") : "No overdue/current actions."}

## Upcoming Window

${plan.upcoming.length ? plan.upcoming.map(renderAction).join("\n\n") : "No upcoming actions in this window."}

## Draft Prompt

\`\`\`text
${plan.prompt}
\`\`\`

## Ready Copy

${plan.drafts.length ? plan.drafts.map(renderDraft).join("\n\n") : "No copy drafts needed in this window."}

## Posting Reminder

- Use owned accounts or approved communities only.
- Vary the copy. Do not paste the same text everywhere.
- Every post or reply needs the code or link.
- Add completed work to \`runtime/posting-log-live.csv\`.
`;
}

function renderAction(row) {
  return `- Time: ${row.scheduledLabel}
- Channel: ${row.channel}
- Mode: ${row.mode}
- Action: ${row.action}
- Asset: ${row.assetHint}
- CTA: ${row.referralLink} / code ${row.referralCode}
- Tracked link: ${row.trackedLink}`;
}

function renderConsole(status) {
  const lines = [
    "WorldCup26 campaign runner ready",
    `Generated: ${status.generatedAt}`,
    `Referral: ${status.referralCode} ${status.referralLink}`,
    `Due actions: ${status.dueCount}`,
    `Due now: ${status.dueNowCount}`,
    `Overdue actions (${status.overdueMinutes}+ min): ${status.overdueCount}`,
    `Post-now rows: ${status.postNowCount}`,
    `Upcoming actions (${status.windowHours}h): ${status.upcomingCount}`,
    `Ready outbox rows: ${status.outboxCount}`,
    `Logged proof rows: ${status.postingProof.loggedCount}`,
    `Due rows still needing proof: ${status.postingProof.unloggedDueCount}`,
    "",
  ];

  if (status.activeHotActions.length > 0) {
    lines.push("Active hot actions from worker wake board:");
    for (const action of status.activeHotActions) {
      lines.push(`${action.owner}: ${action.channel} - ${action.action}`);
    }
    lines.push("");
  }

  for (const owner of Object.keys(status.owners)) {
    const plan = status.owners[owner];
    const next = plan.next ? `${plan.next.channel} - ${plan.next.action}` : "No immediate action";
    lines.push(`${owner}: ${next}`);
  }

  lines.push("", `Outputs written to: ${outputDir}`, "");
  return lines.join("\n");
}

async function readActiveHotActions(outputDir) {
  try {
    const text = await readFile(path.join(outputDir, "worker-wake-board.json"), "utf8");
    const board = JSON.parse(text);
    const workers = Array.isArray(board.workers) ? board.workers : [];
    return workers
      .map((worker) => worker.current)
      .filter((action) => action && String(action.priority ?? "").startsWith("warm-"))
      .sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority))
      .map((action) => ({
        owner: String(action.owner ?? ""),
        channel: String(action.channel ?? ""),
        action: String(action.action ?? ""),
      }));
  } catch {
    return [];
  }
}

function priorityRank(value) {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

async function ensureLiveLog() {
  try {
    await readFile(liveLogPath, "utf8");
  } catch {
    await writeFile(liveLogPath, `${POSTING_PROOF_HEADER.join(",")}\n`);
  }
}

function buildPostNowRows(rows) {
  return rows.slice(0, 16).map((row, index) => {
    const draft = buildDraft(row.owner, row);
    const primaryCopy = replaceReferralLink(draft.primaryCopy, row.trackedLink);
    const firstComment = replaceReferralLink(draft.firstComment, row.trackedLink);
    const proofRow = {
      timestamp_eest: formatEestLogTime(now),
      scheduled_at_eest: row.scheduledLabel,
      owner: row.owner,
      channel: row.channel,
      asset: row.assetHint,
      copy_used: primaryCopy,
      link: row.trackedLink,
      status: row.mode.toLowerCase().includes("reply") ? "replied" : "posted",
      proof_url: "ADD_POST_URL_OR_ACCOUNT_NOTE",
      reply_count: "0",
      signup_notes: "",
      next_followup: "",
    };

    return {
      priority: index + 1,
      scheduled_at_eest: row.scheduledLabel,
      owner: row.owner,
      channel: row.channel,
      mode: row.mode,
      action: row.action,
      asset: row.assetHint,
      tracked_link: row.trackedLink,
      primary_copy: primaryCopy,
      first_comment: firstComment,
      proof_log_row: renderProofLogRow(proofRow),
      whatsapp_share_url: shareUrl("whatsapp", primaryCopy, row.trackedLink),
      telegram_share_url: shareUrl("telegram", primaryCopy, row.trackedLink),
      x_share_url: shareUrl("x", primaryCopy, row.trackedLink),
      facebook_share_url: shareUrl("facebook", primaryCopy, row.trackedLink),
      proofRow,
    };
  });
}

function renderPostNowMarkdown(rows) {
  return `# WorldCup26 Post Now

Generated: ${now.toISOString()}

Referral code: \`${REFERRAL_CODE}\`
Referral link: ${REFERRAL_LINK}

These are the urgent rows still missing live proof. Post only from owned accounts or approved communities. After a real post/reply/outreach, append the proof row to \`runtime/posting-log-live.csv\` and replace \`ADD_POST_URL_OR_ACCOUNT_NOTE\` when a public URL or clear channel note exists.

${rows.length ? rows.map(renderPostNowMarkdownRow).join("\n\n") : "No due rows need posting proof right now."}
`;
}

function renderPostNowMarkdownRow(row) {
  return `## ${row.priority}. ${row.owner} / ${row.channel}

- Scheduled: ${row.scheduled_at_eest}
- Mode: ${row.mode}
- Action: ${row.action}
- Asset: \`${row.asset}\`
- Tracked link: ${row.tracked_link}

### Copy

\`\`\`text
${row.primary_copy}
\`\`\`

${row.first_comment ? `### First Comment / Follow-Up\n\n\`\`\`text\n${row.first_comment}\n\`\`\`\n` : ""}
### Proof Row To Append After Posting

\`\`\`csv
${POSTING_PROOF_HEADER.join(",")}
${row.proof_log_row}
\`\`\``;
}

function renderPostNowCsv(rows) {
  const header = [
    "priority",
    "scheduled_at_eest",
    "owner",
    "channel",
    "mode",
    "action",
    "asset",
    "tracked_link",
    "primary_copy",
    "first_comment",
    "proof_log_row",
    "whatsapp_share_url",
    "telegram_share_url",
    "x_share_url",
    "facebook_share_url",
  ];
  return `${header.join(",")}\n${rows.map((row) => header.map((key) => csvEscape(row[key])).join(",")).join("\n")}\n`;
}

function renderPostProofRowsCsv(rows) {
  return `${POSTING_PROOF_HEADER.join(",")}\n${rows
    .map((row) => renderProofLogRow(row.proofRow))
    .join("\n")}\n`;
}

function renderProofLogRow(row) {
  return POSTING_PROOF_HEADER.map((key) => csvEscape(row[key])).join(",");
}

async function readPostingProofLog() {
  try {
    const text = await readFile(liveLogPath, "utf8");
    const entries = parseCsv(text)
      .map(normalizePostingProofEntry)
      .filter(Boolean)
      .filter((entry) => entry.provesPosted);
    return {
      liveLogPath,
      entries,
      keys: new Map(entries.flatMap((entry) => entry.keys.map((key) => [key, entry]))),
    };
  } catch {
    return {
      liveLogPath,
      entries: [],
      keys: new Map(),
    };
  }
}

function normalizePostingProofEntry(row) {
  const status = String(row.status ?? "").trim().toLowerCase();
  const timestamp = String(row.timestamp_eest ?? row.posted_at ?? row.created_at ?? "").trim();
  const negativeStatuses = new Set(["cancelled", "canceled", "failed", "rejected", "blocked", "skipped", "skip"]);
  const positiveStatuses = new Set([
    "posted",
    "sent",
    "done",
    "published",
    "logged",
    "complete",
    "completed",
    "shared",
    "replied",
    "outreach",
  ]);

  if (negativeStatuses.has(status)) return null;

  const provesPosted = positiveStatuses.has(status) || (timestamp.length > 0 && status.length === 0);
  if (!provesPosted) return null;

  const entry = {
    provesPosted,
    timestamp,
    scheduledLabel: String(row.scheduled_at_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    asset: getAssetHint(String(row.asset ?? "").trim()),
    link: String(row.link ?? row.tracked_link ?? row.referral_link ?? "").trim(),
    status: status || "logged",
    proofUrl: String(row.proof_url ?? row.url ?? "").trim(),
    signupNotes: String(row.signup_notes ?? "").trim(),
  };
  entry.keys = buildProofKeys(entry);
  return entry.keys.length ? entry : null;
}

function buildProofKeys(entry) {
  const owner = proofPart(entry.owner);
  const channel = proofPart(entry.channel);
  const asset = proofPart(entry.asset);
  const schedule = proofPart(entry.scheduledLabel);
  if (!owner || !channel || !asset || !entry.link) return [];

  const exactLink = normalizeProofLink(entry.link);
  const canonicalLink = normalizeProofLink(entry.link, { removeTracking: true });
  const keys = [];

  if (schedule) {
    for (const link of [exactLink, canonicalLink].filter(Boolean)) {
      keys.push(`${schedule}|${owner}|${channel}|${asset}|${link}`);
    }
  }

  if (exactLink && hasTrackingParams(entry.link)) {
    keys.push(`${owner}|${channel}|${asset}|${exactLink}`);
  }

  return keys.filter((value, index, all) => all.indexOf(value) === index);
}

function buildQueueProofKeys(row) {
  const owner = proofPart(row.owner);
  const channel = proofPart(row.channel);
  const asset = proofPart(row.assetHint);
  const schedule = proofPart(row.scheduledLabel);
  if (!owner || !channel || !asset) return [];

  const scheduledLinks = [
    normalizeProofLink(row.trackedLink),
    normalizeProofLink(row.trackedLink, { removeTracking: true }),
    normalizeProofLink(row.referralLink),
    normalizeProofLink(row.referralLink, { removeTracking: true }),
  ]
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index);

  const keys = [];
  if (schedule) {
    keys.push(...scheduledLinks.map((link) => `${schedule}|${owner}|${channel}|${asset}|${link}`));
  }

  const trackedLink = normalizeProofLink(row.trackedLink);
  if (trackedLink) {
    keys.push(`${owner}|${channel}|${asset}|${trackedLink}`);
  }

  return keys.filter((value, index, all) => all.indexOf(value) === index);
}

function findPostingProof(row, proofLog) {
  for (const key of buildQueueProofKeys(row)) {
    const entry = proofLog.keys.get(key);
    if (entry) return entry;
  }
  return null;
}

function normalizeProofLink(value, options = {}) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    if (options.removeTracking) {
      for (const key of [...url.searchParams.keys()]) {
        if (key.toLowerCase().startsWith("utm_")) {
          url.searchParams.delete(key);
        }
      }
    }
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return text.toLowerCase();
  }
}

function hasTrackingParams(value) {
  try {
    const url = new URL(String(value ?? ""));
    return [...url.searchParams.keys()].some((key) => key.toLowerCase().startsWith("utm_"));
  } catch {
    return false;
  }
}

function proofPart(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function buildPostingProofSummary(proofLog, proofedRows, due) {
  const proofedDueRows = proofedRows
    .filter(({ row }) => row.scheduledAt <= now)
    .map(({ row, proof }) => ({
      scheduledLabel: row.scheduledLabel,
      owner: row.owner,
      channel: row.channel,
      action: row.action,
      asset: row.assetHint,
      trackedLink: row.trackedLink,
      proof: summarizeProofEntry(proof),
    }));

  return {
    generatedAt: now.toISOString(),
    liveLogPath: proofLog.liveLogPath,
    loggedCount: proofLog.entries.length,
    proofedActiveCount: proofedRows.length,
    proofedDueCount: proofedDueRows.length,
    unloggedDueCount: due.length,
    recentLogs: proofLog.entries.slice(-12).map(summarizeProofEntry),
    proofedDueRows,
  };
}

function summarizeProofEntry(entry) {
  return {
    timestamp: entry.timestamp,
    scheduledLabel: entry.scheduledLabel,
    owner: entry.owner,
    channel: entry.channel,
    asset: entry.asset,
    link: entry.link,
    status: entry.status,
    proofUrl: entry.proofUrl,
    signupNotes: entry.signupNotes,
  };
}

function renderPostingProofReport(summary) {
  return `# WorldCup26 Posting Proof Report

Generated: ${summary.generatedAt}

Live log: \`${summary.liveLogPath}\`

| Metric | Count |
| --- | ---: |
| Logged proof rows | ${summary.loggedCount} |
| Active queue rows proven posted | ${summary.proofedActiveCount} |
| Due rows proven posted | ${summary.proofedDueCount} |
| Due rows still needing proof | ${summary.unloggedDueCount} |

## Proven Due Rows

${
  summary.proofedDueRows.length
    ? summary.proofedDueRows
        .map(
          (row) => `- ${row.scheduledLabel} / ${row.owner} / ${row.channel}
  - Action: ${row.action}
  - Asset: ${row.asset}
  - Proof: ${row.proof.status} ${row.proof.timestamp || ""}
  - Link: ${row.proof.link || row.trackedLink}
  - Proof URL: ${row.proof.proofUrl || "not logged"}`,
        )
        .join("\n")
    : "No due queue rows have live-log proof yet."
}

## Recent Live Logs

${
  summary.recentLogs.length
    ? summary.recentLogs
        .map(
          (entry) => `- ${entry.timestamp || "no timestamp"} / ${entry.owner} / ${entry.channel} / ${entry.status}
  - Asset: ${entry.asset}
  - Link: ${entry.link || "not logged"}
  - Proof URL: ${entry.proofUrl || "not logged"}`,
        )
        .join("\n")
    : "No live posting log entries yet."
}
`;
}

function buildOutboxRows(plans) {
  return Object.values(plans)
    .flatMap((plan) => plan.drafts)
    .map((draft) => ({
      scheduled_at_eest: draft.scheduledLabel,
      owner: draft.owner,
      channel: draft.channel,
      mode: draft.mode,
      asset: draft.assetHint,
      tracked_link: draft.trackedLink,
      primary_copy: draft.primaryCopy,
      first_comment: draft.firstComment,
      status: "ready",
    }));
}

function renderOutboxCsv(rows) {
  const header = [
    "scheduled_at_eest",
    "owner",
    "channel",
    "mode",
    "asset",
    "tracked_link",
    "primary_copy",
    "first_comment",
    "status",
  ];
  return `${header.join(",")}\n${rows.map((row) => header.map((key) => csvEscape(row[key])).join(",")).join("\n")}\n`;
}

function renderShareLinksCsv(rows) {
  const header = [
    "scheduled_at_eest",
    "owner",
    "channel",
    "mode",
    "asset",
    "tracked_link",
    "whatsapp_share_url",
    "telegram_share_url",
    "x_share_url",
    "facebook_share_url",
    "status",
  ];
  return `${header.join(",")}\n${rows
    .map((row) => {
      const postText = replaceReferralLink(row.primary_copy, row.tracked_link);
      const values = {
        ...row,
        whatsapp_share_url: shareUrl("whatsapp", postText, row.tracked_link),
        telegram_share_url: shareUrl("telegram", postText, row.tracked_link),
        x_share_url: shareUrl("x", postText, row.tracked_link),
        facebook_share_url: shareUrl("facebook", postText, row.tracked_link),
      };
      return header.map((key) => csvEscape(values[key])).join(",");
    })
    .join("\n")}\n`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function renderAllDrafts(plans) {
  return `# WorldCup26 Draft Pack

Generated: ${now.toISOString()}

Referral code: \`${REFERRAL_CODE}\`
Referral link: ${REFERRAL_LINK}

${Object.values(plans).map(renderDraftPack).join("\n\n")}
`;
}

function buildCampaignMonitor({
  now: currentTime,
  windowEnd: nextWindowEnd,
  overdueMinutes: overdueWindowMinutes,
  overdueRows: overdue,
  dueNowRows: dueNow,
  dueRows: due,
  upcomingRows: upcoming,
  outboxRows: outbox,
  ownerPlans: plans,
  postingProof: proofLog,
  proofedActiveRows: proofedRows,
}) {
  const ownerSummaries = WORKERS.map((owner) => {
    const plan = plans[owner] ?? buildOwnerPlan(owner, [], [], currentTime);
    const ownerOverdue = overdue.filter((row) => row.owner === owner).sort(sortBySchedule);
    const ownerDueNow = dueNow.filter((row) => row.owner === owner).sort(sortBySchedule);
    const ownerUpcoming = upcoming.filter((row) => row.owner === owner).sort(sortBySchedule);
    const ownerOutbox = outbox.filter((row) => row.owner === owner);

    return {
      owner,
      lane: workerBriefs[owner].lane,
      overdueCount: ownerOverdue.length,
      dueNowCount: ownerDueNow.length,
      dueCount: ownerOverdue.length + ownerDueNow.length,
      upcomingCount: ownerUpcoming.length,
      readyCount: ownerOutbox.length,
      next: summarizeAction(plan.next),
      overdue: ownerOverdue.slice(0, 6).map(summarizeAction),
      dueNow: ownerDueNow.slice(0, 6).map(summarizeAction),
      upcoming: ownerUpcoming.slice(0, 8).map(summarizeAction),
    };
  });

  const nextActions = ownerSummaries
    .map((summary) => summary.next)
    .filter(Boolean)
    .sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime());

  return {
    generatedAt: currentTime.toISOString(),
    windowEnd: nextWindowEnd.toISOString(),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    summary: {
      overdueMinutes: overdueWindowMinutes,
      overdueCount: overdue.length,
      dueNowCount: dueNow.length,
      dueCount: due.length,
      upcomingCount: upcoming.length,
      readyOutboxCount: outbox.length,
      loggedProofCount: proofLog.entries.length,
      proofedActiveCount: proofedRows.length,
      proofedDueCount: proofedRows.filter(({ row }) => row.scheduledAt <= currentTime).length,
      unloggedDueCount: due.length,
      workerCount: WORKERS.length,
    },
    owners: ownerSummaries,
    nextActions,
    urgentActions: [...overdue, ...dueNow].sort(sortBySchedule).slice(0, 16).map(summarizeAction),
  };
}

function summarizeAction(row) {
  if (!row) return null;
  return {
    scheduledAt: row.scheduledAt.toISOString(),
    scheduledLabel: row.scheduledLabel,
    owner: row.owner,
    channel: row.channel,
    mode: row.mode,
    action: row.action,
    asset: row.assetHint,
    trackedLink: row.trackedLink,
    status: row.status,
  };
}

function renderCampaignMonitor(monitor) {
  return `# WorldCup26 Live Campaign Monitor

Generated: ${monitor.generatedAt}

Referral code: \`${monitor.referralCode}\`
Referral link: ${monitor.referralLink}

## Current Pressure

| Metric | Count |
| --- | ---: |
| Overdue actions (${monitor.summary.overdueMinutes}+ min) | ${monitor.summary.overdueCount} |
| Due now | ${monitor.summary.dueNowCount} |
| Upcoming in window | ${monitor.summary.upcomingCount} |
| Ready outbox rows | ${monitor.summary.readyOutboxCount} |
| Logged proof rows | ${monitor.summary.loggedProofCount} |
| Proven active queue rows | ${monitor.summary.proofedActiveCount} |
| Proven due rows | ${monitor.summary.proofedDueCount} |
| Due rows still needing proof | ${monitor.summary.unloggedDueCount} |

## Worker Board

| Worker | Lane | Overdue | Due now | Upcoming | Ready | Next |
| --- | --- | ---: | ---: | ---: | ---: | --- |
${monitor.owners
  .map(
    (owner) =>
      `| ${owner.owner} | ${owner.lane} | ${owner.overdueCount} | ${owner.dueNowCount} | ${owner.upcomingCount} | ${owner.readyCount} | ${owner.next ? `${owner.next.channel} - ${owner.next.action}` : "No queued action"} |`,
  )
  .join("\n")}

## Urgent Actions

${monitor.urgentActions.length ? monitor.urgentActions.map(renderMonitorAction).join("\n\n") : "No urgent actions right now."}

## Next Actions By Worker

${monitor.owners.map(renderOwnerMonitor).join("\n\n")}

## Posting Rule

Prepare and log every action from owned accounts or approved communities. This monitor removes logged posts from the urgent queue only when \`runtime/posting-log-live.csv\` proves owner, channel, asset, and link.
`;
}

function renderMonitorAction(action) {
  return `- ${action.scheduledLabel} / ${action.owner} / ${action.channel}
  - Mode: ${action.mode}
  - Action: ${action.action}
  - Asset: ${action.asset}
  - Tracked link: ${action.trackedLink}`;
}

function renderOwnerMonitor(owner) {
  const blocks = [];
  if (owner.overdue.length) {
    blocks.push(`Overdue:\n${owner.overdue.map(renderMonitorAction).join("\n")}`);
  }
  if (owner.dueNow.length) {
    blocks.push(`Due now:\n${owner.dueNow.map(renderMonitorAction).join("\n")}`);
  }
  if (owner.upcoming.length) {
    blocks.push(`Upcoming:\n${owner.upcoming.map(renderMonitorAction).join("\n")}`);
  }
  return `### ${owner.owner}\n\n${blocks.length ? blocks.join("\n\n") : "No actions in this window."}`;
}

function renderShareCommandCenter(status, rows, postNowRows = []) {
  const readyRows = rows.slice(0, 24);
  const dueLabel = `${status.dueCount} due now`;
  const upcomingLabel = `${status.upcomingCount} upcoming in ${status.windowHours}h`;
  const mainTrackedLink = buildTrackedLink({
    referralLink: REFERRAL_LINK,
    owner: "All",
    channel: "command center",
    mode: "manual share",
    hour: "main",
  });
  const mainInvite = `I invited you to WorldCup26.\n\nPick 3 teams for free, see your private points preview, and use a ticket only if you want to enter the paid leaderboard.\n\nUse my referral code ${status.referralCode} when you join:\n${mainTrackedLink}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Share Command Center</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #001812;
      --panel: #07271f;
      --panel-soft: #0b352a;
      --gold: #ffd36a;
      --mint: #70f0b3;
      --text: #f7fff9;
      --muted: #b9cec4;
      --line: rgba(255, 255, 255, 0.14);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 20% 0%, rgba(255, 211, 106, 0.18), transparent 34rem),
        radial-gradient(circle at 90% 12%, rgba(112, 240, 179, 0.14), transparent 28rem),
        var(--bg);
      color: var(--text);
    }
    main { width: min(1120px, 100%); margin: 0 auto; padding: 28px 14px 48px; }
    header {
      display: grid;
      gap: 16px;
      padding: 20px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(7, 39, 31, 0.96), rgba(11, 53, 42, 0.92));
      box-shadow: 0 22px 80px rgba(0, 0, 0, 0.26);
    }
    h1 { margin: 0; font-size: clamp(1.6rem, 5vw, 3.2rem); line-height: 0.96; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); line-height: 1.45; }
    .hero-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.05);
    }
    .metric span { display: block; color: var(--muted); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; }
    .metric strong { display: block; margin-top: 4px; font-size: clamp(1rem, 2.4vw, 1.35rem); color: var(--gold); overflow-wrap: anywhere; }
    .cards { display: grid; gap: 14px; margin-top: 16px; }
    .section-title { margin: 22px 0 0; font-size: 1rem; color: var(--gold); text-transform: uppercase; letter-spacing: 0; }
    .card {
      display: grid;
      gap: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      background: rgba(7, 39, 31, 0.9);
    }
    .card.urgent {
      border-color: rgba(255, 211, 106, 0.42);
      background:
        linear-gradient(135deg, rgba(255, 211, 106, 0.14), rgba(112, 240, 179, 0.06)),
        rgba(7, 39, 31, 0.94);
    }
    .card-head { display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; }
    .card h2 { margin: 0; font-size: 1.05rem; line-height: 1.2; }
    .tag { color: #022015; background: var(--gold); border-radius: 999px; padding: 5px 9px; font-size: 0.75rem; font-weight: 900; white-space: nowrap; }
    pre {
      margin: 0;
      padding: 12px;
      white-space: pre-wrap;
      word-break: break-word;
      border-radius: 8px;
      color: var(--text);
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid var(--line);
      font: 0.92rem/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    button, a.action {
      appearance: none;
      border: 1px solid rgba(112, 240, 179, 0.46);
      border-radius: 8px;
      background: #0f7657;
      color: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
      padding: 9px 12px;
      font-weight: 900;
      text-decoration: none;
    }
    a.action.secondary, button.secondary { background: rgba(255, 255, 255, 0.06); color: var(--mint); }
    .asset { color: var(--gold); font-weight: 800; }
    .footer { margin-top: 20px; color: var(--muted); font-size: 0.9rem; }
    @media (max-width: 640px) {
      .card-head { display: grid; }
      button, a.action { width: 100%; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>WorldCup26 Share Command Center</h1>
        <p>Referral code <strong>${escapeHtml(status.referralCode)}</strong>. Use owned accounts and approved communities. Copy, post, then log.</p>
      </div>
      <div class="hero-grid">
        <div class="metric"><span>Generated</span><strong>${escapeHtml(formatDisplayTime(status.generatedAt))}</strong></div>
        <div class="metric"><span>Queue</span><strong>${escapeHtml(dueLabel)}</strong></div>
        <div class="metric"><span>Next window</span><strong>${escapeHtml(upcomingLabel)}</strong></div>
        <div class="metric"><span>Post now</span><strong>${postNowRows.length}</strong></div>
        <div class="metric"><span>Ready posts</span><strong>${rows.length}</strong></div>
      </div>
      <div class="actions">
        <button data-copy="${escapeAttr(mainInvite)}">Copy main invite</button>
        <a class="action secondary" href="${shareUrl("whatsapp", mainInvite, mainTrackedLink)}" target="_blank" rel="noreferrer">WhatsApp share</a>
        <a class="action secondary" href="${shareUrl("telegram", mainInvite, mainTrackedLink)}" target="_blank" rel="noreferrer">Telegram share</a>
        <a class="action secondary" href="${shareUrl("x", mainInvite, mainTrackedLink)}" target="_blank" rel="noreferrer">X post</a>
      </div>
    </header>
    <h2 class="section-title">Post now, then log proof</h2>
    <section class="cards" aria-label="Urgent posts">
      ${postNowRows.length ? postNowRows.map(renderUrgentShareCard).join("\n") : '<article class="card"><p>No urgent rows need proof right now.</p></article>'}
    </section>
    <h2 class="section-title">Ready queue</h2>
    <section class="cards" aria-label="Ready posts">
      ${readyRows.map(renderShareCard).join("\n")}
    </section>
    <p class="footer">This page prepares posts only. Actual posting stays manual on owned accounts or approved communities. Update <code>runtime/posting-log-live.csv</code> after every post or reply.</p>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      try {
        await navigator.clipboard.writeText(button.getAttribute("data-copy"));
        const previous = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = previous; }, 1200);
      } catch {
        window.prompt("Copy this text", button.getAttribute("data-copy"));
      }
    });
  </script>
</body>
</html>
`;
}

function renderUrgentShareCard(row) {
  const combined = row.first_comment
    ? `${row.primary_copy}\n\nFollow-up:\n${row.first_comment}`
    : row.primary_copy;
  return `<article class="card urgent">
  <div class="card-head">
    <div>
      <h2>${row.priority}. ${escapeHtml(row.owner)} - ${escapeHtml(row.channel)}</h2>
      <p>${escapeHtml(row.scheduled_at_eest)} / ${escapeHtml(row.mode)} / <span class="asset">${escapeHtml(row.asset)}</span></p>
    </div>
    <span class="tag">proof needed</span>
  </div>
  <pre>${escapeHtml(row.primary_copy)}</pre>
  ${row.first_comment ? `<pre>${escapeHtml(row.first_comment)}</pre>` : ""}
  <p>Tracked link: <a class="asset" href="${escapeAttr(row.tracked_link)}" target="_blank" rel="noreferrer">${escapeHtml(row.tracked_link)}</a></p>
  <pre>${escapeHtml(`${POSTING_PROOF_HEADER.join(",")}\n${row.proof_log_row}`)}</pre>
  <div class="actions">
    <button data-copy="${escapeAttr(combined)}">Copy post</button>
    <button class="secondary" data-copy="${escapeAttr(row.tracked_link)}">Copy link</button>
    <button class="secondary" data-copy="${escapeAttr(row.proof_log_row)}">Copy proof row</button>
    <a class="action secondary" href="${row.whatsapp_share_url}" target="_blank" rel="noreferrer">WhatsApp</a>
    <a class="action secondary" href="${row.telegram_share_url}" target="_blank" rel="noreferrer">Telegram</a>
    <a class="action secondary" href="${row.x_share_url}" target="_blank" rel="noreferrer">X</a>
    <a class="action secondary" href="${row.facebook_share_url}" target="_blank" rel="noreferrer">Facebook</a>
  </div>
</article>`;
}

function renderShareCard(row, index) {
  const trackedLink = row.tracked_link || REFERRAL_LINK;
  const postText = replaceReferralLink(row.primary_copy, trackedLink);
  const followup = replaceReferralLink(row.first_comment, trackedLink);
  const combined = followup ? `${postText}\n\nFollow-up:\n${followup}` : postText;
  const isApproval = row.mode.toLowerCase().includes("approval");
  return `<article class="card">
  <div class="card-head">
    <div>
      <h2>${index + 1}. ${escapeHtml(row.channel)} - ${escapeHtml(row.scheduled_at_eest)}</h2>
      <p>${escapeHtml(row.owner)} / ${escapeHtml(row.mode)} / <span class="asset">${escapeHtml(row.asset)}</span>${isApproval ? " / ask admin first" : ""}</p>
    </div>
    <span class="tag">${escapeHtml(row.status)}</span>
  </div>
  <pre>${escapeHtml(postText)}</pre>
  ${followup ? `<pre>${escapeHtml(followup)}</pre>` : ""}
  <p>Tracked link: <a class="asset" href="${escapeAttr(trackedLink)}" target="_blank" rel="noreferrer">${escapeHtml(trackedLink)}</a></p>
  <div class="actions">
    <button data-copy="${escapeAttr(combined)}">Copy post</button>
    <button class="secondary" data-copy="${escapeAttr(trackedLink)}">Copy link</button>
    <a class="action secondary" href="${shareUrl("whatsapp", postText, trackedLink)}" target="_blank" rel="noreferrer">WhatsApp</a>
    <a class="action secondary" href="${shareUrl("telegram", postText, trackedLink)}" target="_blank" rel="noreferrer">Telegram</a>
    <a class="action secondary" href="${shareUrl("x", postText, trackedLink)}" target="_blank" rel="noreferrer">X</a>
    <a class="action secondary" href="${shareUrl("facebook", postText, trackedLink)}" target="_blank" rel="noreferrer">Facebook</a>
  </div>
</article>`;
}

function shareUrl(platform, text, link = REFERRAL_LINK) {
  const encodedText = encodeURIComponent(text);
  const encodedLink = encodeURIComponent(link);
  if (platform === "whatsapp") return `https://wa.me/?text=${encodedText}`;
  if (platform === "telegram") return `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
  if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
  return `https://twitter.com/intent/tweet?text=${encodedText}`;
}

function buildTrackedLink(row) {
  const url = new URL(row.referralLink || REFERRAL_LINK);
  url.searchParams.set("utm_source", slug(row.channel || row.owner || "manual"));
  url.searchParams.set("utm_medium", slug(row.mode || "manual"));
  url.searchParams.set("utm_campaign", "worldcup26_referral_72h");
  url.searchParams.set(
    "utm_content",
    [slug(row.owner || "worker"), row.hour ? `h${slug(row.hour)}` : null].filter(Boolean).join("_"),
  );
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

function formatDisplayTime(value) {
  const text = String(value ?? "");
  return text.replace("T", " ").replace(/\.\d{3}Z$/, "Z");
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

function renderDraftPack(plan) {
  return `# ${plan.owner} Draft Pack

Generated: ${plan.generatedAt}

Lane: ${plan.brief.lane}

${plan.drafts.length ? plan.drafts.map(renderDraft).join("\n\n") : "No draft rows in this window."}
`;
}

function renderDraft(draft) {
  return `### ${draft.channel} - ${draft.scheduledLabel}

Asset: \`${draft.assetHint}\`
Mode: ${draft.mode}

\`\`\`text
${draft.primaryCopy}
\`\`\`

First comment / follow-up:

\`\`\`text
${draft.firstComment}
\`\`\`

Log note: ${draft.logNote}`;
}

function buildDraft(owner, row) {
  const base = {
    owner,
    scheduledLabel: row.scheduledLabel,
    channel: row.channel,
    mode: row.mode,
    assetHint: row.assetHint,
    trackedLink: row.trackedLink,
    logNote: `${owner} prepared ${row.channel} action for ${row.scheduledLabel}.`,
  };

  const lowerChannel = row.channel.toLowerCase();
  const lowerAction = row.action.toLowerCase();

  if (owner === "Memo" || lowerChannel.includes("ops")) {
    return {
      ...base,
      primaryCopy: `Campaign ops check for WorldCup26.

Referral code: ${REFERRAL_CODE}
Referral link: ${REFERRAL_LINK}

Verify the current assets:
- media/worldcup26-main-video.mp4
- media/worldcup26-referral-story.jpg
- media/worldcup26-referral-16x9.jpg
- runtime/outbox-ready.csv

Next action: ${row.action}`,
      firstComment:
        "Update runtime/posting-log-live.csv after each manual post, reply, or outreach. Track channel, copy used, asset, and next follow-up.",
    };
  }

  if (lowerChannel.includes("whatsapp") || lowerChannel.includes("telegram") || lowerAction.includes("warm contacts")) {
    return {
      ...base,
      primaryCopy: `I invited you to WorldCup26.

Pick 3 teams for free, see your private points preview, and use a ticket only if you want to enter the paid leaderboard.

Use my referral code ${REFERRAL_CODE} when you join:
${REFERRAL_LINK}

The event has not started yet, so all teams are still available right now.`,
      firstComment:
        "If they ask what to do: Sign in, use the code, save 3 picks for free, then use a ticket later only if they want the paid leaderboard.",
    };
  }

  if (lowerChannel.includes("story") || lowerChannel.includes("reels") || lowerChannel.includes("shorts")) {
    return {
      ...base,
      primaryCopy: `Pick 3 teams before they lock.

Watch your private points preview move with every match.

Paid leaderboard entry happens only when you use a ticket.

Join with code ${REFERRAL_CODE}:
${REFERRAL_LINK}`,
      firstComment: `Code: ${REFERRAL_CODE}
Join: ${REFERRAL_LINK}`,
    };
  }

  if (lowerChannel.includes("group")) {
    return {
      ...base,
      primaryCopy: `For football fans here:

WorldCup26 is a prediction game where you pick 3 teams free first and see your private points preview.

Paid leaderboard entry happens only when you use a ticket.

My invite code: ${REFERRAL_CODE}
Join here:
${REFERRAL_LINK}`,
      firstComment:
        "Use only where group rules allow promo links. If unsure, ask the group admin before posting.",
    };
  }

  if (lowerAction.includes("partner") || lowerAction.includes("creator")) {
    return {
      ...base,
      primaryCopy: `Hey - I am promoting WorldCup26, a World Cup prediction game where users pick 3 teams free first, see a private points preview, and can use a ticket later for the paid leaderboard.

I have a video, captions, and a referral link ready:
${REFERRAL_LINK}

Code: ${REFERRAL_CODE}

Would you be open to one approved post or story for your football audience?`,
      firstComment: "Follow up once after 24 hours if they react but do not answer.",
    };
  }

  if (owner === "Nano" || lowerChannel.includes("reply") || lowerAction.includes("objection")) {
    return {
      ...base,
      primaryCopy: `Quick version: you pick 3 World Cup teams for free first. They score from real results and you can see your private points preview.

Use a ticket only if you want to enter the paid leaderboard.

Use code ${REFERRAL_CODE} here:
${REFERRAL_LINK}`,
      firstComment: `If they ask why the code matters: it connects the account to the invite. Code ${REFERRAL_CODE}.`,
    };
  }

  return {
    ...base,
    primaryCopy: `WorldCup26 is open.

Pick 3 teams for free. See your private points preview.

Use a ticket only if you want to enter the paid leaderboard.

Join with my code:
${REFERRAL_CODE}

${REFERRAL_LINK}`,
    firstComment: "Favorites or underdogs? Pick your 3 and send me your lineup.",
  };
}
