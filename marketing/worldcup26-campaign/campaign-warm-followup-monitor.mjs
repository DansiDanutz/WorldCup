#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const FOLLOWUP_MINUTES = 15;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const attempts = await readCsv(path.join(runtimeDir, "public-channel-attempts.csv"));
const referralActivity = await readJson(path.join(runtimeDir, "referral-activity.json"), {});
const signupAudit = await readJson(path.join(runtimeDir, "signup-conversion-audit.json"), {});
const payload = buildPayload({ attempts, referralActivity, signupAudit });

await writeFile(path.join(runtimeDir, "warm-followup-monitor.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "warm-followup-monitor.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "warm-followup-monitor.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "warm-followup-monitor.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ attempts, referralActivity, signupAudit }) {
  const eligibleAttempts = attempts
    .map(normalizeAttempt)
    .filter(isFollowupAttempt)
    .filter((row) => ["sent", "requested", "posted", "published"].includes(row.status))
    .sort((left, right) => (right.timestamp?.getTime() ?? 0) - (left.timestamp?.getTime() ?? 0));
  const warmAttempts = eligibleAttempts.filter((row) => row.channel === "warm-contact sprint");
  const testerAttempts = eligibleAttempts.filter((row) => isTesterAttempt(row));
  const latest = eligibleAttempts[0] ?? null;
  const ageMinutes = latest?.timestamp
    ? Math.max(0, Math.floor((now.getTime() - latest.timestamp.getTime()) / 60_000))
    : null;
  const due = ageMinutes != null && ageMinutes >= FOLLOWUP_MINUTES;
  const counts = {
    warmAttempts: warmAttempts.length,
    testerAttempts: testerAttempts.length,
    followupAttempts: eligibleAttempts.length,
    appViews: numberFrom(referralActivity.counts?.appViews, signupAudit.counts?.appViews),
    referralViews: numberFrom(referralActivity.counts?.referralViews, signupAudit.counts?.referralViews),
    signupSaves: numberFrom(referralActivity.counts?.signupReferralSaves, signupAudit.counts?.signupSaves),
    accepted: numberFrom(referralActivity.counts?.acceptedReferrals, signupAudit.counts?.accepted),
    profiles: numberFrom(referralActivity.counts?.profiles, signupAudit.counts?.profiles),
    entries: numberFrom(referralActivity.counts?.referredEntries, signupAudit.counts?.entries),
  };
  const state = !latest
    ? "awaiting-first-human-send"
    : due && counts.signupSaves === 0
      ? "followup-due-no-signup-save"
      : due
        ? "followup-due"
        : "waiting-followup-window";

  return {
    schema: "worldcup26-warm-followup-monitor-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: true,
    state,
    followupMinutes: FOLLOWUP_MINUTES,
    counts,
    latestFollowupAttempt: latest
      ? {
          timestampEest: latest.timestampEest,
          owner: latest.owner,
          platform: latest.platform,
          channel: latest.channel,
          status: latest.status,
          attemptUrl: latest.attemptUrl,
          detail: latest.detail,
          ageMinutes,
          due,
      }
      : null,
    latestWarmAttempt: latest && latest.channel === "warm-contact sprint" ? {
      timestampEest: latest.timestampEest,
      owner: latest.owner,
      platform: latest.platform,
      status: latest.status,
      attemptUrl: latest.attemptUrl,
      detail: latest.detail,
      ageMinutes,
      due,
    } : null,
    nextAction: nextActionFor({ latest, due, counts }),
    checkCommand: "node campaign-referral-activity.mjs && node campaign-signup-conversion-audit.mjs && node campaign-warm-followup-monitor.mjs && sed -n '1,100p' runtime/warm-followup-monitor.txt",
    proofRule:
      "This monitor does not prove a send. It only reacts after a real warm-contact or clean tester-batch attempt has been logged.",
  };
}

function nextActionFor({ latest, due, counts }) {
  if (!latest) {
    return "Send the first clean tester batch or warm-contact batch, then log it with the real count/account note.";
  }
  if (!due) {
    return `Wait until ${FOLLOWUP_MINUTES} minutes after the ${latest.channel} send, then rerun referral activity and signup conversion audit.`;
  }
  if (counts.signupSaves > 0) {
    return "Signup save detected. Inspect referral activity and follow up with the new user if needed.";
  }
  return "Follow-up window is due and signup_saves is still 0: ask the recipient/tester where signup stopped, then rerun referral activity.";
}

function isFollowupAttempt(row) {
  return row.channel === "warm-contact sprint" || isTesterAttempt(row);
}

function isTesterAttempt(row) {
  return row.platform === "WhatsApp testers" || row.channel === "clean signup test batch";
}

function normalizeAttempt(row) {
  return {
    timestampEest: String(row.timestamp_eest ?? "").trim(),
    timestamp: parseEestLogTime(row.timestamp_eest),
    owner: String(row.owner ?? "").trim(),
    platform: String(row.platform ?? "").trim(),
    channel: String(row.channel ?? "").trim(),
    status: normalizeStatus(row.status),
    attemptUrl: String(row.attempt_url ?? "").trim(),
    detail: String(row.detail ?? "").trim(),
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 warm follow-up monitor ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} warm_attempts=${payload.counts.warmAttempts} tester_attempts=${payload.counts.testerAttempts} followup_attempts=${payload.counts.followupAttempts} followup_minutes=${payload.followupMinutes}`,
    `views=${payload.counts.appViews} referral_views=${payload.counts.referralViews} profiles=${payload.counts.profiles} accepted=${payload.counts.accepted} signup_saves=${payload.counts.signupSaves} entries=${payload.counts.entries}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
  ];
  if (payload.latestFollowupAttempt) {
    lines.push("");
    lines.push(`latest=${payload.latestFollowupAttempt.timestampEest} ${payload.latestFollowupAttempt.owner} / ${payload.latestFollowupAttempt.platform} / ${payload.latestFollowupAttempt.channel} status=${payload.latestFollowupAttempt.status} age=${payload.latestFollowupAttempt.ageMinutes}m due=${payload.latestFollowupAttempt.due ? "yes" : "no"}`);
    lines.push(`detail=${payload.latestFollowupAttempt.detail}`);
  }
  lines.push("");
  lines.push(`next=${payload.nextAction}`);
  lines.push(`check=${payload.checkCommand}`);
  lines.push(`rule=${payload.proofRule}`);
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Warm Follow-up Monitor

Generated: ${payload.generatedAtEest}

- State: ${payload.state}
- Warm attempts: ${payload.counts.warmAttempts}
- Tester attempts: ${payload.counts.testerAttempts}
- Follow-up attempts: ${payload.counts.followupAttempts}
- Follow-up window: ${payload.followupMinutes} minutes
- Views: ${payload.counts.appViews}
- Referral views: ${payload.counts.referralViews}
- Profiles: ${payload.counts.profiles}
- Accepted referrals: ${payload.counts.accepted}
- Signup saves: ${payload.counts.signupSaves}
- Entries: ${payload.counts.entries}

${payload.latestFollowupAttempt ? `## Latest Follow-up Attempt

- Time: ${payload.latestFollowupAttempt.timestampEest}
- Owner: ${payload.latestFollowupAttempt.owner}
- Platform: ${payload.latestFollowupAttempt.platform}
- Channel: ${payload.latestFollowupAttempt.channel}
- Status: ${payload.latestFollowupAttempt.status}
- Age: ${payload.latestFollowupAttempt.ageMinutes}m
- Due: ${payload.latestFollowupAttempt.due ? "yes" : "no"}
- Detail: ${payload.latestFollowupAttempt.detail}
` : "No warm-contact or clean tester-batch attempt has been logged yet."}

## Next Action

${payload.nextAction}

\`\`\`bash
${payload.checkCommand}
\`\`\`

${payload.proofRule}
`;
}

function renderHtml(payload) {
  const latest = payload.latestFollowupAttempt;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Warm Follow-up</title>
  <style>
    :root { color-scheme: dark; --bg:#03140f; --panel:#0a2b21; --line:rgba(255,255,255,.16); --text:#f8fff9; --muted:#bad0c6; --gold:#ffd974; --mint:#74f0b2; --warn:#ffcc6a; }
    * { box-sizing:border-box; }
    body { margin:0; background:radial-gradient(circle at 10% 0%, rgba(255,217,116,.18), transparent 24rem), var(--bg); color:var(--text); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width:min(900px, 100%); margin:0 auto; padding:14px 10px 48px; }
    header, section { border:1px solid var(--line); border-radius:8px; background:rgba(10,43,33,.94); padding:14px; margin-bottom:10px; }
    h1 { margin:0 0 8px; font-size:clamp(34px, 8vw, 62px); line-height:.92; }
    h2 { margin:0 0 8px; font-size:22px; }
    p { color:var(--muted); line-height:1.4; margin:0 0 8px; }
    .pill { display:inline-flex; padding:7px 10px; border-radius:999px; background:var(--warn); color:#03140f; font-weight:950; text-transform:uppercase; }
    .stats { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px; }
    .stat { border:1px solid var(--line); border-radius:8px; padding:10px; background:rgba(255,255,255,.06); }
    .stat span { display:block; color:var(--muted); font-size:11px; text-transform:uppercase; font-weight:900; }
    .stat strong { display:block; color:var(--gold); font-size:24px; }
    pre { white-space:pre-wrap; overflow-wrap:anywhere; border:1px solid var(--line); border-radius:8px; background:rgba(0,0,0,.24); padding:10px; }
    @media (max-width:700px) { .stats { grid-template-columns:1fr 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Warm Follow-up</h1>
      <span class="pill">${escapeHtml(payload.state)}</span>
      <p>${escapeHtml(payload.proofRule)}</p>
    </header>
    <section class="stats">
      ${stat("Warm attempts", payload.counts.warmAttempts)}
      ${stat("Tester attempts", payload.counts.testerAttempts)}
      ${stat("Referral views", payload.counts.referralViews)}
      ${stat("Signup saves", payload.counts.signupSaves)}
      ${stat("Profiles", payload.counts.profiles)}
      ${stat("Accepted", payload.counts.accepted)}
      ${stat("Entries", payload.counts.entries)}
    </section>
    <section>
      <h2>Latest Follow-up Attempt</h2>
      ${latest ? `<p>${escapeHtml(latest.timestampEest)} · ${escapeHtml(latest.owner)} / ${escapeHtml(latest.platform)} / ${escapeHtml(latest.channel)} · ${escapeHtml(latest.status)} · age ${latest.ageMinutes}m · due ${latest.due ? "yes" : "no"}</p><p>${escapeHtml(latest.detail)}</p>` : "<p>No warm-contact or clean tester-batch attempt has been logged yet.</p>"}
    </section>
    <section>
      <h2>Next</h2>
      <p>${escapeHtml(payload.nextAction)}</p>
      <pre>${escapeHtml(payload.checkCommand)}</pre>
    </section>
  </main>
</body>
</html>`;
}

function stat(label, value) {
  return `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readCsv(filePath) {
  try {
    return parseCsv(await readFile(filePath, "utf8"));
  } catch {
    return [];
  }
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
  const [header = [], ...data] = rows;
  return data
    .filter((values) => values.some((value) => String(value ?? "").trim()))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function numberFrom(...values) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizeStatus(value) {
  return String(value ?? "").trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
}

function parseEestLogTime(value) {
  const text = String(value ?? "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}) ([+-]\d{2})(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute, offsetHour, offsetMinute] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00${offsetHour}:${offsetMinute}`);
  return Number.isNaN(date.getTime()) ? null : date;
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
