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

const actionLauncher = await readJson(path.join(runtimeDir, "action-launcher.json"), {});
const signupAudit = await readJson(path.join(runtimeDir, "signup-conversion-audit.json"), {});
const warmFollowup = await readJson(path.join(runtimeDir, "warm-followup-monitor.json"), {});
const responseKit = await readJson(path.join(runtimeDir, "response-kit.json"), {});
const payload = buildPayload({ actionLauncher, signupAudit, warmFollowup, responseKit });

await writeFile(path.join(runtimeDir, "first-human-actions.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "first-human-actions.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "first-human-actions.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "first-human-actions.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ actionLauncher, signupAudit, warmFollowup, responseKit }) {
  const action = actionLauncher.action ?? {};
  const warmAttempts = Number(warmFollowup.counts?.warmAttempts ?? responseKit.counts?.warmAttempts ?? 0);
  const signupSaves = Number(signupAudit.counts?.signupSaves ?? responseKit.counts?.signupSaves ?? 0);
  const referralViews = Number(signupAudit.counts?.referralViews ?? warmFollowup.counts?.referralViews ?? 0);
  const dashboardClicks = Number(signupAudit.dashboard?.clicks ?? 0);
  const signupReturned = Number(signupAudit.counts?.signupReturned ?? 0);
  const signupAttempts = Number(signupAudit.counts?.signupAttempts ?? 0);
  const needsCleanSignupTest = signupSaves === 0 && signupReturned === 0 && signupAttempts === 0;
  const cleanSignupTestLink = `${REFERRAL_LINK}&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test`;
  const actions = [
    {
      id: "real-warm-send",
      owner: String(action.owner ?? "Nano"),
      channel: String(action.channel ?? "WhatsApp personal"),
      title: "Send the first real warm-contact batch",
      why: "Paid ads have clicks but no signup saves. A warm private send is the fastest proof-safe path to a real user.",
      copy: String(action.copy ?? "").trim(),
      link: String(action.trackedLink ?? REFERRAL_LINK),
      command:
        String(action.quickLogCommand ?? "").trim() ||
        "node campaign-warm-send-log.mjs --priority warm-1 --count <N> --account \"<account>\" --replies 0",
      doneWhen: "A public-channel attempt row exists with status sent/requested and a real count/account note.",
    },
    {
      id: "clean-signup-test-batch",
      owner: "Memo",
      channel: "WhatsApp testers",
      title: "Send three clean referral signup tests",
      why: "The referral page and Google button are visible, paid clicks are arriving, but zero users have returned from Google or saved the referral. One tester is too fragile now; ask three trusted people.",
      copy:
        `I need 3 clean WorldCup26 signup tests now.\n\nPlease send this to three trusted people with different Google accounts. They should open it on a fresh phone/browser, accept the invite, continue with Google, and pick 3 teams. Do not pay.\n\nAsk each tester to reply with one of these:\n1. "joined + picked teams"\n2. screenshot of the exact screen where it stops\n\nCode 26BC4B90CB:\n${cleanSignupTestLink}`,
      link: cleanSignupTestLink,
      command:
        `node campaign-public-channel-attempts.mjs --add --owner "Memo" --platform "WhatsApp testers" --channel "clean signup test batch" --status "sent" --attempt-url "${cleanSignupTestLink}" --detail "Sent clean signup test to <N> trusted testers from <account> at YYYY-MM-DD HH:mm EEST; asked each to accept invite, Google signup, pick 3 teams, and reply with success or blocking screenshot; code 26BC4B90CB included" --next-action "run campaign-signup-conversion-audit.mjs after tester replies or after 15 minutes"`,
      doneWhen:
        "The tester batch is really sent and logged with count/account, then a real profile plus referral signup-save row appears, or a precise tester screenshot captures the failing step.",
    },
  ]
    .sort((left, right) => {
      if (!needsCleanSignupTest) return 0;
      if (left.id === "clean-signup-test-batch") return -1;
      if (right.id === "clean-signup-test-batch") return 1;
      return 0;
    })
    .map(enrichAction);

  return {
    schema: "worldcup26-first-human-actions-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: actions.every((row) => row.command && row.link),
    state:
      signupSaves > 0
        ? "signup-save-proven"
        : warmAttempts > 0
          ? "warm-send-logged-awaiting-signup"
          : "needs-first-human-action",
    counts: { warmAttempts, signupSaves, referralViews, dashboardClicks, signupReturned, signupAttempts },
    firstAction: actions[0],
    actions,
    rule:
      needsCleanSignupTest
        ? "First priority is three clean Google signup tests because the live funnel has zero returned/attempt events. Do not log planned work as proof."
        : "These are the only two actions that matter until a real warm send or a real signup-save/failing-step proof exists. Do not log planned work as proof.",
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 first human actions ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} warm_attempts=${payload.counts.warmAttempts} signup_saves=${payload.counts.signupSaves} referral_views=${payload.counts.referralViews} dashboard_clicks=${payload.counts.dashboardClicks} signup_returned=${payload.counts.signupReturned} signup_attempts=${payload.counts.signupAttempts}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `rule=${payload.rule}`,
    "",
    "do_first:",
  ];
  for (const action of payload.actions) {
    lines.push(
      `- ${action.id}: ${action.owner} / ${action.channel}`,
      `  title=${action.title}`,
      `  why=${action.why}`,
      `  link=${action.link}`,
      `  whatsapp=${action.share.whatsapp}`,
      `  telegram=${action.share.telegram}`,
      `  sms=${action.share.sms}`,
      `  command=${action.command}`,
      `  done_when=${action.doneWhen}`,
    );
    if (action.copy) {
      lines.push("  copy:", indent(action.copy, "    "));
    }
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 First Human Actions

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Warm attempts: ${payload.counts.warmAttempts}
- Signup saves: ${payload.counts.signupSaves}
- Referral views: ${payload.counts.referralViews}
- Dashboard clicks: ${payload.counts.dashboardClicks}
- Signup returned events: ${payload.counts.signupReturned}
- Signup save attempts: ${payload.counts.signupAttempts}

${payload.rule}

${payload.actions.map(renderActionMarkdown).join("\n\n")}
`;
}

function renderActionMarkdown(action) {
  return `## ${action.title}

- Owner: ${action.owner}
- Channel: ${action.channel}
- Why: ${action.why}
- Link: ${action.link}
- WhatsApp: ${action.share.whatsapp}
- Telegram: ${action.share.telegram}
- SMS: ${action.share.sms}
- Done when: ${action.doneWhen}

\`\`\`text
${action.copy}
\`\`\`

\`\`\`bash
${action.command}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 First Human Actions</title>
  <style>
    :root{color-scheme:dark;--bg:#03140f;--line:rgba(255,255,255,.16);--text:#f8fff9;--muted:#bad0c6;--gold:#ffd974;--mint:#74f0b2}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 10% 0%,rgba(255,217,116,.18),transparent 24rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(920px,100%);margin:0 auto;padding:14px 10px 48px}header,section{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:14px;margin-bottom:10px}
    h1{margin:0 0 8px;font-size:clamp(34px,8vw,62px);line-height:.92}h2{margin:0 0 8px;font-size:22px}p{color:var(--muted);line-height:1.4;margin:0 0 8px}
    .pill{display:inline-flex;padding:6px 9px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.stat{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(255,255,255,.06)}.stat span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:900}.stat strong{font-size:24px;color:var(--gold)}
    a{color:var(--gold);overflow-wrap:anywhere}.buttons{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.button{display:flex;align-items:center;justify-content:center;min-height:44px;border-radius:8px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-decoration:none}.button.secondary{background:rgba(255,255,255,.08);color:var(--text);border:1px solid var(--line)}pre{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.24);padding:10px}
    @media(max-width:760px){.stats{grid-template-columns:1fr 1fr}.buttons{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <header>
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>First Human Actions</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="stats">
        ${metric("Warm attempts", payload.counts.warmAttempts)}
        ${metric("Signup saves", payload.counts.signupSaves)}
        ${metric("Referral views", payload.counts.referralViews)}
        ${metric("Ad clicks", payload.counts.dashboardClicks)}
        ${metric("Returned", payload.counts.signupReturned)}
        ${metric("Attempts", payload.counts.signupAttempts)}
      </div>
    </header>
    ${payload.actions.map(renderActionHtml).join("")}
  </main>
</body>
</html>`;
}

function renderActionHtml(action) {
  return `<section>
    <h2>${escapeHtml(action.title)}</h2>
    <p><strong>${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</strong></p>
    <p>${escapeHtml(action.why)}</p>
    <p><a href="${escapeAttr(action.link)}">${escapeHtml(action.link)}</a></p>
    <div class="buttons">
      <a class="button" href="${escapeAttr(action.share.whatsapp)}">Open WhatsApp</a>
      <a class="button secondary" href="${escapeAttr(action.share.telegram)}">Open Telegram</a>
      <a class="button secondary" href="${escapeAttr(action.share.sms)}">Open SMS</a>
    </div>
    <p><strong>Done when:</strong> ${escapeHtml(action.doneWhen)}</p>
    <pre>${escapeHtml(action.copy)}</pre>
    <pre>${escapeHtml(action.command)}</pre>
  </section>`;
}

function enrichAction(action) {
  const copy = String(action.copy || action.link || REFERRAL_LINK).trim();
  return {
    ...action,
    copy,
    share: {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(copy)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(action.link)}&text=${encodeURIComponent(copy)}`,
      sms: `sms:?&body=${encodeURIComponent(copy)}`,
    },
  };
}

function metric(label, value) {
  return `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
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

function indent(value, prefix) {
  return String(value ?? "")
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
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
