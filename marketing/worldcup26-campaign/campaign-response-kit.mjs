#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const REPLIES = [
  {
    id: "what-is-it",
    trigger: "What is this?",
    goal: "Explain the game in one message.",
    copy:
      "You pick 3 World Cup teams for free. They score points from real match results and goals, and you can see your private preview. Use a ticket only if you want the paid leaderboard.\n\nJoin with my code 26BC4B90CB:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=manual-reply&utm_campaign=worldcup26_referral_72h&utm_content=what_is_it",
  },
  {
    id: "is-it-free",
    trigger: "Is it free?",
    goal: "Remove signup friction.",
    copy:
      "Yes. You can sign in, accept the invite, and pick 3 teams for free. You only need a ticket if you later want to enter the paid leaderboard.\n\nUse my code: 26BC4B90CB\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=manual-reply&utm_campaign=worldcup26_referral_72h&utm_content=is_it_free",
  },
  {
    id: "how-many-teams",
    trigger: "How many teams?",
    goal: "Get them to the pick step.",
    copy:
      "Three teams. The event has not started yet, so all 48 teams are still available right now. Pick the 3 you believe will score best.\n\nCode: 26BC4B90CB\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=manual-reply&utm_campaign=worldcup26_referral_72h&utm_content=how_many_teams",
  },
  {
    id: "why-code",
    trigger: "Why use the code?",
    goal: "Explain referral tracking without overexplaining.",
    copy:
      "The code connects your account to my invite so the app knows you joined through me. It should be filled automatically from the link, but the code is 26BC4B90CB if you need it.\n\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=manual-reply&utm_campaign=worldcup26_referral_72h&utm_content=why_code",
  },
  {
    id: "signup-stuck",
    trigger: "Signup stopped or confusing",
    goal: "Find the exact conversion blocker.",
    copy:
      "Can you tell me the exact screen where it stopped? The normal path is: open link, accept invite, continue with Google, then pick 3 teams. Do not pay for this test.\n\nLink:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=manual-reply&utm_campaign=worldcup26_referral_72h&utm_content=signup_stuck",
  },
  {
    id: "after-they-pick",
    trigger: "They picked teams",
    goal: "Turn a tester into a referrer.",
    copy:
      "Nice. Send me your 3 teams. If you want, invite two football friends too. They can also pick free first with code 26BC4B90CB:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=manual-reply&utm_campaign=worldcup26_referral_72h&utm_content=after_pick",
  },
  {
    id: "agent-interest",
    trigger: "Can I invite/sell tickets?",
    goal: "Open the agent path without making payment the first step.",
    copy:
      "Yes. First create the account from my link and pick your 3 teams. After that, I can help you use the agent/referral area. The free pick is the first step.\n\nCode: 26BC4B90CB\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=manual-reply&utm_campaign=worldcup26_referral_72h&utm_content=agent_interest",
  },
  {
    id: "x-public-thread",
    trigger: "X thread asks for World Cup picks",
    goal: "Create a low-friction public reply that feels like a football question first.",
    copy:
      "My current challenge: pick only 3 teams, not a full bracket. Who are your 3?\n\nI saved mine here free first, ticket only later if you want the paid board:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=x-reply&utm_campaign=worldcup26_referral_72h&utm_content=x_public_thread",
  },
  {
    id: "youtube-comment",
    trigger: "YouTube video/comment about favorites",
    goal: "Invite prediction-video viewers without sounding like a spam blast.",
    copy:
      "Good picks. I am testing a simple version: choose 3 teams before kickoff and watch the private points preview as the tournament moves.\n\nFree to pick first, code 26BC4B90CB:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=youtube-comment&utm_campaign=worldcup26_referral_72h&utm_content=youtube_comment",
  },
  {
    id: "reddit-forum-soft",
    trigger: "Reddit/forum prediction discussion",
    goal: "Use a softer, permission-friendly wording for communities with stricter promo norms.",
    copy:
      "Question for the thread: if you had to lock only 3 teams before the World Cup starts, who would you take?\n\nI built a tiny free-pick tracker for this. If links are welcome here, this is mine with invite code 26BC4B90CB:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=forum-comment&utm_campaign=worldcup26_referral_72h&utm_content=reddit_forum_soft",
  },
  {
    id: "romanian-local",
    trigger: "Romanian football chat/forum",
    goal: "Give Nano/Memo a natural Romanian-local reply for Softpedia and WhatsApp groups.",
    copy:
      "Intrebare simpla: ce 3 echipe ai alege pentru World Cup 2026?\n\nEu testez aici o varianta rapida: alegi 3 echipe gratis si vezi preview privat de puncte. Cod invitatie 26BC4B90CB:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=romanian-reply&utm_campaign=worldcup26_referral_72h&utm_content=romanian_local",
  },
  {
    id: "why-google",
    trigger: "Why Google sign-in?",
    goal: "Reduce auth fear while keeping the answer short.",
    copy:
      "Google is only for one-account login, so nobody needs a password and the picks stay attached to the right player. First step is still free: accept invite, Google login, pick 3 teams.\n\nCode 26BC4B90CB:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=manual-reply&utm_campaign=worldcup26_referral_72h&utm_content=why_google",
  },
  {
    id: "post-google-check",
    trigger: "Tester says they signed in",
    goal: "Confirm the exact post-auth save/pick step that campaign metrics are missing.",
    copy:
      "Perfect. After Google, did you land in the app and see the team picker? Please pick any 3 teams and tell me if the page shows your account. That is the exact step I am checking now.\n\nInvite link again:\nhttps://worldcup26.world/login?ref=26BC4B90CB&utm_source=reply-bank&utm_medium=tester-followup&utm_campaign=worldcup26_referral_72h&utm_content=post_google_check",
  },
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const referralActivity = await readJson(path.join(runtimeDir, "referral-activity.json"), {});
const warmFollowup = await readJson(path.join(runtimeDir, "warm-followup-monitor.json"), {});
const actionLauncher = await readJson(path.join(runtimeDir, "action-launcher.json"), {});
const payload = buildPayload({ referralActivity, warmFollowup, actionLauncher });

await writeFile(path.join(runtimeDir, "response-kit.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "response-kit.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "response-kit.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "response-kit.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ referralActivity, warmFollowup, actionLauncher }) {
  const counts = {
    appViews: Number(referralActivity.counts?.appViews ?? 0),
    referralViews: Number(referralActivity.counts?.referralViews ?? 0),
    profiles: Number(referralActivity.counts?.profiles ?? 0),
    signupSaves: Number(referralActivity.counts?.signupReferralSaves ?? 0),
    warmAttempts: Number(warmFollowup.counts?.warmAttempts ?? 0),
  };
  const replies = REPLIES.map((reply) => ({
    ...reply,
    whatsappWeb: `https://wa.me/?text=${encodeURIComponent(reply.copy)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(REFERRAL_LINK)}&text=${encodeURIComponent(reply.copy)}`,
    proofCommand:
      `node campaign-proof-log.mjs --priority "9" --proof-url "private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; code ${REFERRAL_CODE} and link included; reply=${reply.id}; next follow-up <date/action>" --status "replied" --next-followup "check signup/referral activity after 15 minutes"`,
  }));
  return {
    schema: "worldcup26-response-kit-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok:
      replies.length >= 6 &&
      replies.every((reply) => reply.copy.includes(REFERRAL_CODE) && reply.copy.includes("worldcup26.world/login")),
    state: counts.signupSaves > 0 ? "signup-save-detected" : "ready-for-warm-replies",
    counts,
    currentFirstAction: actionLauncher.action
      ? {
          priority: String(actionLauncher.action.priority ?? ""),
          owner: String(actionLauncher.action.owner ?? ""),
          channel: String(actionLauncher.action.channel ?? ""),
          task: String(actionLauncher.action.task ?? ""),
        }
      : null,
    replies,
    proofRule:
      "Use these only as replies after a real person responds or asks. Log proof only after the reply happened.",
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 response kit ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} replies=${payload.replies.length} warm_attempts=${payload.counts.warmAttempts} signup_saves=${payload.counts.signupSaves}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `rule=${payload.proofRule}`,
  ];
  if (payload.currentFirstAction) {
    lines.push(
      `first_action=#${payload.currentFirstAction.priority} ${payload.currentFirstAction.owner} / ${payload.currentFirstAction.channel}`,
      `first_task=${payload.currentFirstAction.task}`,
    );
  }
  lines.push("");
  for (const reply of payload.replies) {
    lines.push(
      `${reply.id} - ${reply.trigger}`,
      `goal=${reply.goal}`,
      "copy:",
      indent(reply.copy),
      `whatsapp=${reply.whatsappWeb}`,
      `telegram=${reply.telegram}`,
      "proof_after_real_reply:",
      reply.proofCommand,
      "",
    );
  }
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Response Kit

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Code: \`${payload.referralCode}\`
- Warm attempts: ${payload.counts.warmAttempts}
- Signup saves: ${payload.counts.signupSaves}
- First action: ${payload.currentFirstAction ? `#${payload.currentFirstAction.priority} ${payload.currentFirstAction.owner} / ${payload.currentFirstAction.channel}` : "-"}

${payload.proofRule}

${payload.replies.map(renderReplyMarkdown).join("\n\n")}
`;
}

function renderReplyMarkdown(reply) {
  return `## ${reply.trigger}

Goal: ${reply.goal}

\`\`\`text
${reply.copy}
\`\`\`

- WhatsApp: ${reply.whatsappWeb}
- Telegram: ${reply.telegram}

Proof after real reply:

\`\`\`bash
${reply.proofCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Response Kit</title>
  <style>
    :root { color-scheme: dark; --bg:#03140f; --panel:#0a2b21; --line:rgba(255,255,255,.16); --text:#f8fff9; --muted:#bad0c6; --gold:#ffd974; --mint:#74f0b2; }
    * { box-sizing:border-box; }
    body { margin:0; background:radial-gradient(circle at 10% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 90% 0%, rgba(116,240,178,.14), transparent 24rem), var(--bg); color:var(--text); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width:min(960px, 100%); margin:0 auto; padding:14px 10px 48px; }
    header, section { border:1px solid var(--line); border-radius:8px; background:rgba(10,43,33,.94); padding:14px; margin-bottom:10px; }
    h1 { margin:0 0 8px; font-size:clamp(34px, 8vw, 62px); line-height:.92; }
    h2 { margin:0 0 8px; font-size:22px; }
    p { color:var(--muted); line-height:1.4; margin:0 0 8px; }
    .stats { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:8px; margin-top:12px; }
    .stat { border:1px solid var(--line); border-radius:8px; padding:10px; background:rgba(255,255,255,.06); }
    .stat span { display:block; color:var(--muted); font-size:11px; text-transform:uppercase; font-weight:900; }
    .stat strong { display:block; color:var(--gold); font-size:24px; }
    .links { display:flex; flex-wrap:wrap; gap:8px; }
    a.button { display:inline-flex; align-items:center; justify-content:center; min-height:40px; padding:8px 10px; border-radius:8px; background:linear-gradient(135deg, var(--gold), var(--mint)); color:#03140f; font-weight:950; text-decoration:none; }
    pre { white-space:pre-wrap; overflow-wrap:anywhere; border:1px solid var(--line); border-radius:8px; background:rgba(0,0,0,.24); padding:10px; }
    @media (max-width:760px) { .stats { grid-template-columns:1fr 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Response Kit</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
      <div class="stats">
        ${stat("Replies", payload.replies.length)}
        ${stat("Warm attempts", payload.counts.warmAttempts)}
        ${stat("Referral views", payload.counts.referralViews)}
        ${stat("Signup saves", payload.counts.signupSaves)}
      </div>
    </header>
    ${payload.replies.map(renderReplyHtml).join("\n")}
  </main>
</body>
</html>
`;
}

function renderReplyHtml(reply) {
  return `<section>
    <h2>${escapeHtml(reply.trigger)}</h2>
    <p>${escapeHtml(reply.goal)}</p>
    <pre>${escapeHtml(reply.copy)}</pre>
    <div class="links">
      <a class="button" href="${escapeAttr(reply.whatsappWeb)}">WhatsApp</a>
      <a class="button" href="${escapeAttr(reply.telegram)}">Telegram</a>
    </div>
    <p>Proof after real reply:</p>
    <pre>${escapeHtml(reply.proofCommand)}</pre>
  </section>`;
}

function stat(label, value) {
  return `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

function parseArgs(argv) {
  const parsed = { root: "", now: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--root") parsed.root = argv[++index] ?? "";
    else if (arg === "--now") parsed.now = argv[++index] ?? "";
    else if (arg === "--quiet") parsed.quiet = true;
  }
  return parsed;
}

function indent(value) {
  return String(value)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
