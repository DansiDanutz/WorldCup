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

const payload = buildPayload({
  signup: await readJson(path.join(runtimeDir, "signup-conversion-audit.json"), {}),
  tester: await readJson(path.join(runtimeDir, "tester-batch-operator.json"), {}),
  openclaw: await readJson(path.join(runtimeDir, "x-football-openclaw.json"), {}),
  accountWatchlist: await readJson(path.join(runtimeDir, "x-account-watchlist.json"), {}),
  proofHelper: await readJson(path.join(runtimeDir, "x-reply-proof-helper.json"), {}),
  publicAttempts: await readJson(path.join(runtimeDir, "public-channel-attempts.json"), {}),
  warRoom: await readJson(path.join(runtimeDir, "remote-war-room.json"), {}),
});

await writeFile(path.join(runtimeDir, "action-command-center.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "action-command-center.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "action-command-center.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "action-command-center.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ signup, tester, openclaw, accountWatchlist, proofHelper, publicAttempts, warRoom }) {
  const counts = {
    appViews: numberAt(signup, ["counts", "appViews"], numberAt(signup, ["appViews"], 0)),
    referralViews: numberAt(signup, ["counts", "referralViews"], numberAt(signup, ["referralViews"], 0)),
    paidViews: numberAt(signup, ["counts", "paidViews"], numberAt(signup, ["paidViews"], numberAt(signup, ["dashboard", "paidViews"], 0))),
    dashboardClicks: numberAt(signup, ["dashboardClicks"], numberAt(signup, ["dashboard", "clicks"], 0)),
    signupSaves: numberAt(signup, ["signupSaves"], numberAt(signup, ["counts", "signupSaves"], 0)),
    profiles: numberAt(signup, ["profiles"], numberAt(signup, ["counts", "profiles"], 0)),
    accepted: numberAt(signup, ["accepted"], numberAt(signup, ["counts", "accepted"], 0)),
    publicAttempts: numberAt(publicAttempts, ["counts", "attempts"], numberAt(publicAttempts, ["attempts"], 0)),
    xActions: Array.isArray(openclaw.actions) ? openclaw.actions.length : 0,
    xWorkerPacks: Array.isArray(openclaw.workerPacks) ? openclaw.workerPacks.length : 0,
    xAccountTargets: Number(accountWatchlist.accountCount ?? (Array.isArray(accountWatchlist.accounts) ? accountWatchlist.accounts.length : 0)),
    xAccountWorkerPacks: Array.isArray(accountWatchlist.workerPacks) ? accountWatchlist.workerPacks.length : 0,
    xProofReadyWorkers: Array.isArray(proofHelper.helpers)
      ? proofHelper.helpers.filter((helper) => helper.ok).length
      : 0,
  };
  const testerLink = stringAt(tester, ["testerLink"], stringAt(tester, ["tester_link"], withUtm(REFERRAL_LINK, {
    utm_source: "whatsapp-testers",
    utm_medium: "warm-contact",
    utm_campaign: "worldcup26_warm_contact_sprint",
    utm_content: "clean_signup_test",
  })));
  const testerCopy = stringAt(tester, ["copy"], stringAt(tester, ["message"], [
    "I need 3 clean WorldCup26 signup tests now.",
    "",
    "Open this on a fresh phone/browser, accept the invite, continue with Google, and pick 3 teams. Do not pay.",
    "",
    `Code ${REFERRAL_CODE}:`,
    testerLink,
  ].join("\n")));
  const testerLogCommand = stringAt(tester, ["logCommand"], stringAt(tester, ["log_after_real_send"], stringAt(signup, ["memoCommand"], stringAt(signup, ["memo_command"], ""))));
  const helpers = Array.isArray(proofHelper.helpers) ? proofHelper.helpers : [];
  const watchlistWorkers = Array.isArray(accountWatchlist.workerPacks)
    ? accountWatchlist.workerPacks.map((pack) => ({
        worker: String(pack.worker ?? ""),
        packFile: `x-account-watchlist-${pack.slug || slugify(pack.worker)}.html`,
        accounts: Array.isArray(pack.accounts) ? pack.accounts.length : 0,
        firstAccount: pack.firstAccount ?? null,
      }))
    : [];
  const xFirst = Array.isArray(openclaw.workerPacks)
    ? openclaw.workerPacks.map((pack) => ({
        worker: String(pack.worker ?? ""),
        packFile: `x-openclaw-${pack.slug || slugify(pack.worker)}.html`,
        firstAction: pack.firstAction ?? null,
        actions: Array.isArray(pack.actions) ? pack.actions.length : 0,
      }))
    : [];
  const blocker = counts.signupSaves === 0
    ? "No proven referral signup-save exists yet. Do the tester batch before changing ads again."
    : "Signup-save proof exists. Keep X replies and warm follow-up moving.";
  const failures = [
    counts.signupSaves === 0 ? "signup-save-unproven" : "",
    counts.xActions <= 0 ? "x-openclaw-actions-missing" : "",
    counts.xAccountTargets <= 0 ? "x-account-watchlist-missing" : "",
    counts.xProofReadyWorkers < 4 ? "x-proof-helper-not-ready-for-all-workers" : "",
  ].filter(Boolean);
  return {
    schema: "worldcup26-action-command-center-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: counts.xActions > 0 && counts.xProofReadyWorkers === 4,
    state: counts.signupSaves === 0 ? "critical-first-human-action" : "outreach-and-proof-active",
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    blocker,
    failures,
    counts,
    firstAction: {
      owner: "Memo",
      title: "Send 3 clean signup tests",
      why: "Paid and referral views exist, but no completed signup-save event exists. This proves or isolates the Google signup path.",
      link: testerLink,
      whatsappUrl: stringAt(tester, ["whatsappUrl"], stringAt(tester, ["whatsapp"], `https://wa.me/?text=${encodeURIComponent(testerCopy)}`)),
      copy: testerCopy,
      logAfterRealSend: testerLogCommand,
    },
    secondAction: {
      title: "Run one X OpenClaw reply from each worker",
      why: "The droplets can find football conversations and prepare replies; proof begins only after a real reply URL or precise private note.",
      operatorAccount: stringAt(openclaw, ["operatorAccount"], "david2015bestai@gmail.com"),
      overviewFile: "x-football-openclaw.html",
      proofHelperFile: "x-reply-proof-helper.html",
      workers: xFirst,
      proofTemplates: helpers.map((helper) => ({
        worker: String(helper.worker ?? ""),
        query: String(helper.firstQuery ?? ""),
        command: String(helper.proofCommandTemplate ?? ""),
      })),
    },
    thirdAction: {
      title: "Run targeted X account replies",
      why: "The account watchlist gives each worker real football accounts to inspect, reducing time lost in generic search results.",
      operatorAccount: stringAt(accountWatchlist, ["operatorAccount"], "david2015bestai@gmail.com"),
      overviewFile: "x-account-watchlist.html",
      accountCount: counts.xAccountTargets,
      workers: watchlistWorkers,
    },
    proofRule: "Do not log proof for plans, generated packs, or intended posts. Log only a real post/reply URL or a precise private-channel note with account, target, timestamp, and action.",
    sourceFiles: [
      "signup-conversion-audit.html",
      "tester-batch-operator.html",
      "x-football-openclaw.html",
      "x-account-watchlist.html",
      "x-reply-proof-helper.html",
      "remote-war-room.html",
    ],
    warRoomGeneratedAt: stringAt(warRoom, ["generatedAt"], ""),
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 action command center ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `blocker=${payload.blocker}`,
    `counts=views:${payload.counts.appViews} referral_views:${payload.counts.referralViews} paid_views:${payload.counts.paidViews} dashboard_clicks:${payload.counts.dashboardClicks} profiles:${payload.counts.profiles} accepted:${payload.counts.accepted} signup_saves:${payload.counts.signupSaves} public_attempts:${payload.counts.publicAttempts}`,
    `x=openclaw_actions:${payload.counts.xActions} worker_packs:${payload.counts.xWorkerPacks} account_targets:${payload.counts.xAccountTargets} account_worker_packs:${payload.counts.xAccountWorkerPacks} proof_ready_workers:${payload.counts.xProofReadyWorkers}`,
    "",
    `first_action=${payload.firstAction.owner}: ${payload.firstAction.title}`,
    `why=${payload.firstAction.why}`,
    `tester_link=${payload.firstAction.link}`,
    `whatsapp=${payload.firstAction.whatsappUrl}`,
    "copy:",
    indent(payload.firstAction.copy, "  "),
    "",
    "log_after_real_send:",
    payload.firstAction.logAfterRealSend || "  missing log command",
    "",
    `second_action=${payload.secondAction.title}`,
    `x_account=${payload.secondAction.operatorAccount}`,
    `openclaw=runtime/${payload.secondAction.overviewFile}`,
    `proof_helper=runtime/${payload.secondAction.proofHelperFile}`,
  ];
  for (const worker of payload.secondAction.workers) {
    lines.push(`- ${worker.worker}: runtime/${worker.packFile} actions=${worker.actions} first=${worker.firstAction?.id || "-"}`);
  }
  lines.push(
    "",
    `third_action=${payload.thirdAction.title}`,
    `watchlist_account=${payload.thirdAction.operatorAccount}`,
    `watchlist=runtime/${payload.thirdAction.overviewFile}`,
    `watchlist_targets=${payload.thirdAction.accountCount}`,
  );
  for (const worker of payload.thirdAction.workers) {
    lines.push(`- ${worker.worker}: runtime/${worker.packFile} accounts=${worker.accounts} first=@${worker.firstAccount?.handle || "-"}`);
  }
  lines.push("", `proof_rule=${payload.proofRule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Action Command Center

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}
- Blocker: ${payload.blocker}

## Counts

- Views: ${payload.counts.appViews}
- Referral views: ${payload.counts.referralViews}
- Paid views: ${payload.counts.paidViews}
- Dashboard clicks: ${payload.counts.dashboardClicks}
- Profiles: ${payload.counts.profiles}
- Signup saves: ${payload.counts.signupSaves}
- X actions ready: ${payload.counts.xActions}
- X account targets: ${payload.counts.xAccountTargets}
- X proof workers ready: ${payload.counts.xProofReadyWorkers}

## First Action

${payload.firstAction.why}

[Open WhatsApp tester send](${payload.firstAction.whatsappUrl})

\`\`\`text
${payload.firstAction.copy}
\`\`\`

\`\`\`bash
${payload.firstAction.logAfterRealSend || "missing log command"}
\`\`\`

## X OpenClaw

[Overview](${payload.secondAction.overviewFile}) | [Proof helper](${payload.secondAction.proofHelperFile})

${payload.secondAction.workers.map((worker) => `- [${worker.worker}](${worker.packFile}) - ${worker.actions} actions, first \`${worker.firstAction?.id || "-"}\``).join("\n")}

## X Account Watchlist

[Account overview](${payload.thirdAction.overviewFile})

${payload.thirdAction.workers.map((worker) => `- [${worker.worker}](${worker.packFile}) - ${worker.accounts} accounts, first \`@${worker.firstAccount?.handle || "-"}\``).join("\n")}

${payload.proofRule}
`;
}

function renderHtml(payload) {
  const cards = payload.secondAction.workers.map((worker) => `
      <a class="card" href="${escapeAttr(worker.packFile)}">
        <span>${escapeHtml(worker.worker)}</span>
        <strong>${escapeHtml(worker.firstAction?.query || "X football reply")}</strong>
        <small>${worker.actions} actions ready</small>
      </a>`).join("");
  const watchlistCards = payload.thirdAction.workers.map((worker) => `
      <a class="card" href="${escapeAttr(worker.packFile)}">
        <span>${escapeHtml(worker.worker)}</span>
        <strong>@${escapeHtml(worker.firstAccount?.handle || "target")}</strong>
        <small>${worker.accounts} accounts ready</small>
      </a>`).join("");
  const proofTemplates = payload.secondAction.proofTemplates.map((row) => `
      <div class="proof-row">
        <strong>${escapeHtml(row.worker)}</strong>
        <code>${escapeHtml(row.command)}</code>
      </div>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Action Command Center</title>
  <style>
    :root{color-scheme:dark;--bg:#02130e;--panel:#0b2a20;--panel2:#10382b;--line:rgba(255,255,255,.14);--text:#f8fff9;--muted:#bfd2c8;--gold:#ffd974;--mint:#75efb4;--green:#0d7b5d;--red:#ff8377}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0%,rgba(255,217,116,.2),transparent 24rem),radial-gradient(circle at 90% 10%,rgba(117,239,180,.18),transparent 26rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(960px,100%);margin:0 auto;padding:12px 10px 42px}.hero,.panel{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:16px;margin-bottom:10px}.hero{border-color:rgba(255,217,116,.58);background:linear-gradient(135deg,rgba(255,217,116,.2),rgba(11,42,32,.95))}
    h1{margin:0;font-size:clamp(42px,10vw,76px);line-height:.9;letter-spacing:0}h2{margin:0 0 10px;font-size:24px}p{margin:0 0 10px;color:var(--muted);line-height:1.35}.pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.stat{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(0,0,0,.18)}.stat span{display:block;color:var(--muted);font-weight:850;font-size:11px;text-transform:uppercase}.stat strong{display:block;color:var(--gold);font-size:28px;line-height:1}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.button,button{min-height:46px;border:1px solid rgba(117,239,180,.48);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:950;display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;padding:9px;cursor:pointer}.gold{background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;border-color:transparent}
    textarea,pre,code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}textarea{width:100%;min-height:166px;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.24);color:var(--text);padding:10px;resize:vertical}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.card{display:block;border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.06);padding:10px;color:var(--text);text-decoration:none}.card span{display:block;color:var(--gold);font-weight:950}.card strong{display:block;margin-top:6px}.card small{display:block;margin-top:7px;color:var(--muted)}
    .proof-row{border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.2);padding:10px;margin-top:8px}.proof-row code{display:block;margin-top:6px;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--mint)}.warn{border-color:rgba(255,131,119,.55);background:rgba(255,131,119,.1)}
    @media(max-width:760px){.stats,.grid,.cards{grid-template-columns:1fr 1fr}h1{font-size:42px}}@media(max-width:460px){.stats,.grid,.cards{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>Action Center</h1>
      <p>${escapeHtml(payload.blocker)}</p>
      <div class="stats">
        <div class="stat"><span>Views</span><strong>${payload.counts.appViews}</strong></div>
        <div class="stat"><span>Referral</span><strong>${payload.counts.referralViews}</strong></div>
        <div class="stat"><span>Signup Saves</span><strong>${payload.counts.signupSaves}</strong></div>
        <div class="stat"><span>X Targets</span><strong>${payload.counts.xAccountTargets}</strong></div>
      </div>
    </section>
    <section class="panel warn">
      <h2>First: prove signup</h2>
      <p>${escapeHtml(payload.firstAction.why)}</p>
      <div class="grid">
        <a class="button gold" href="${escapeAttr(payload.firstAction.whatsappUrl)}">Open WhatsApp tester send</a>
        <button id="copyTester">Copy tester message</button>
      </div>
      <textarea id="testerCopy" readonly>${escapeHtml(payload.firstAction.copy)}</textarea>
    </section>
    <section class="panel">
      <h2>Log only after real send</h2>
      <p>Replace the placeholders with the real tester count, sender account, and timestamp.</p>
      <div class="grid">
        <button id="copyLog">Copy log command</button>
        <a class="button" href="signup-conversion-audit.html">Open signup audit</a>
      </div>
      <div class="proof-row"><code id="logCommand">${escapeHtml(payload.firstAction.logAfterRealSend || "missing log command")}</code></div>
    </section>
    <section class="panel">
      <h2>Second: X OpenClaw</h2>
      <p>Use ${escapeHtml(payload.secondAction.operatorAccount)} manually. Personalize the first sentence before replying.</p>
      <div class="grid">
        <a class="button gold" href="${escapeAttr(payload.secondAction.overviewFile)}">Open X overview</a>
        <a class="button" href="${escapeAttr(payload.secondAction.proofHelperFile)}">Open proof helper</a>
      </div>
      <div class="cards">${cards}</div>
    </section>
    <section class="panel">
      <h2>Third: X account watchlist</h2>
      <p>Use ${escapeHtml(payload.thirdAction.operatorAccount)} manually. Open a real football account, choose a recent relevant post, then personalize and reply.</p>
      <div class="grid">
        <a class="button gold" href="${escapeAttr(payload.thirdAction.overviewFile)}">Open account watchlist</a>
        <a class="button" href="${escapeAttr(payload.secondAction.proofHelperFile)}">Open proof helper</a>
      </div>
      <div class="cards">${watchlistCards}</div>
    </section>
    <section class="panel">
      <h2>X proof commands</h2>
      ${proofTemplates}
    </section>
    <section class="panel warn">
      <h2>Proof rule</h2>
      <p>${escapeHtml(payload.proofRule)}</p>
    </section>
  </main>
  <script>
    async function copyText(value) {
      try { await navigator.clipboard.writeText(value); }
      catch { window.prompt("Copy this", value); }
    }
    document.getElementById("copyTester").addEventListener("click", () => copyText(document.getElementById("testerCopy").value));
    document.getElementById("copyLog").addEventListener("click", () => copyText(document.getElementById("logCommand").textContent));
  </script>
</body>
</html>`;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--quiet") {
      parsed.quiet = true;
    } else if (arg === "--root") {
      parsed.root = argv[index + 1];
      index += 1;
    } else if (arg === "--now") {
      parsed.now = argv[index + 1];
      index += 1;
    }
  }
  return parsed;
}

function numberAt(object, keys, fallback) {
  const value = valueAt(object, keys);
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stringAt(object, keys, fallback) {
  const value = valueAt(object, keys);
  return typeof value === "string" && value.trim() ? value : fallback;
}

function valueAt(object, keys) {
  let current = object;
  for (const key of keys) {
    if (!current || typeof current !== "object" || !(key in current)) return undefined;
    current = current[key];
  }
  return current;
}

function withUtm(url, params) {
  const parsed = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

function indent(value, prefix) {
  return String(value ?? "").split("\n").map((line) => `${prefix}${line}`).join("\n");
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  }).format(date).replace(",", "");
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
