#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const TESTER_LINK = `${REFERRAL_LINK}&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test`;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const signupAudit = await readJson(path.join(runtimeDir, "signup-conversion-audit.json"), {});
const warmFollowup = await readJson(path.join(runtimeDir, "warm-followup-monitor.json"), {});
const firstHumanActions = await readJson(path.join(runtimeDir, "first-human-actions.json"), {});

const payload = buildPayload({ signupAudit, warmFollowup, firstHumanActions });

await writeFile(path.join(runtimeDir, "tester-batch-operator.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "tester-batch-operator.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "tester-batch-operator.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "tester-batch-operator.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ signupAudit, warmFollowup, firstHumanActions }) {
  const counts = {
    paidViews: Number(signupAudit.paidViews ?? signupAudit.counts?.paidViews ?? 0),
    referralViews: Number(signupAudit.counts?.referralViews ?? signupAudit.referralViews ?? 0),
    dashboardClicks: Number(signupAudit.dashboardClicks ?? signupAudit.counts?.dashboardClicks ?? 0),
    signupSaves: Number(signupAudit.counts?.signupSaves ?? signupAudit.signupSaves ?? 0),
    returned: Number(signupAudit.signupFunnel?.returned ?? signupAudit.signup_funnel?.returned ?? 0),
    attempts: Number(signupAudit.signupFunnel?.attempts ?? signupAudit.signup_funnel?.attempts ?? 0),
    testerAttempts: Number(warmFollowup.counts?.testerAttempts ?? 0),
    warmAttempts: Number(warmFollowup.counts?.warmAttempts ?? 0),
  };
  const first = firstHumanActions.firstAction ?? {};
  const copy = String(first.copy ?? "").trim() || [
    "I need 3 clean WorldCup26 signup tests now.",
    "",
    "Please open this on a fresh phone/browser, accept the invite, continue with Google, and pick 3 teams. Do not pay.",
    "",
    "Reply with one of these:",
    "1. joined + picked teams",
    "2. screenshot of the exact screen where it stops",
    "",
    `Code ${REFERRAL_CODE}:`,
    TESTER_LINK,
  ].join("\n");
  const command = String(first.command ?? "").trim() ||
    `node campaign-public-channel-attempts.mjs --add --owner "Memo" --platform "WhatsApp testers" --channel "clean signup test batch" --status "sent" --attempt-url "${TESTER_LINK}" --detail "Sent clean signup test to <N> trusted testers from <account> at YYYY-MM-DD HH:mm EEST; asked each to accept invite, Google signup, pick 3 teams, and reply with success or blocking screenshot; code ${REFERRAL_CODE} included" --next-action "run campaign-signup-conversion-audit.mjs after tester replies or after 15 minutes"`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(copy)}`;
  const state = counts.signupSaves > 0
    ? "signup-save-proven"
    : counts.testerAttempts > 0
      ? "tester-send-logged-awaiting-result"
      : "send-tester-batch-now";

  return {
    schema: "worldcup26-tester-batch-operator-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: Boolean(copy && command && TESTER_LINK),
    state,
    owner: "Memo",
    platform: "WhatsApp testers",
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    testerLink: TESTER_LINK,
    whatsapp,
    referralQr: qrUrl(TESTER_LINK),
    whatsappQr: qrUrl(whatsapp),
    counts,
    copy,
    command,
    proofRule: "Only run the log command after the tester batch was really sent. Replace <N>, <account>, and timestamp with the real private-channel note.",
    doneWhen: "A real tester reply proves joined + picked teams, or a screenshot captures the exact blocking screen, and signup-conversion-audit is rerun.",
  };
}

function renderText(payload) {
  return [
    `WorldCup26 tester batch operator ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state}`,
    `owner=${payload.owner}`,
    `platform=${payload.platform}`,
    `code=${payload.referralCode}`,
    `tester_link=${payload.testerLink}`,
    `whatsapp=${payload.whatsapp}`,
    `referral_qr=${payload.referralQr}`,
    `whatsapp_qr=${payload.whatsappQr}`,
    `counts=paid_views:${payload.counts.paidViews} referral_views:${payload.counts.referralViews} dashboard_clicks:${payload.counts.dashboardClicks} returned:${payload.counts.returned} attempts:${payload.counts.attempts} signup_saves:${payload.counts.signupSaves} tester_attempts:${payload.counts.testerAttempts}`,
    `done_when=${payload.doneWhen}`,
    `rule=${payload.proofRule}`,
    "",
    "copy:",
    indent(payload.copy, "  "),
    "",
    "log_after_real_send:",
    payload.command,
    "",
  ].join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Tester Batch Operator

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Owner: ${payload.owner}
- Platform: ${payload.platform}
- Referral code: \`${payload.referralCode}\`
- Tester attempts: ${payload.counts.testerAttempts}
- Signup saves: ${payload.counts.signupSaves}
- Google returns: ${payload.counts.returned}
- Dashboard clicks: ${payload.counts.dashboardClicks}

${payload.proofRule}

## Send Now

- WhatsApp: ${payload.whatsapp}
- Tester link: ${payload.testerLink}
- QR: ${payload.referralQr}

\`\`\`text
${payload.copy}
\`\`\`

## Log After Real Send

\`\`\`bash
${payload.command}
\`\`\`

## Done When

${payload.doneWhen}
`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Tester Batch Operator</title>
  <style>
    :root{color-scheme:dark;--bg:#03140f;--panel:#0b2a20;--panel2:#143626;--line:rgba(255,255,255,.16);--text:#f8fff9;--muted:#bad0c6;--gold:#ffd974;--mint:#74f0b2;--danger:#ff7d6e;--green:#0f7b5d}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0%,rgba(255,217,116,.22),transparent 24rem),radial-gradient(circle at 92% 4%,rgba(116,240,178,.18),transparent 24rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(820px,100%);margin:0 auto;padding:12px 10px 42px}section{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:14px;margin-bottom:10px}
    .hero{border-color:rgba(255,217,116,.72);background:linear-gradient(135deg,rgba(255,217,116,.2),rgba(11,42,32,.96))}
    .pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    h1{margin:0 0 8px;font-size:clamp(38px,11vw,74px);line-height:.88}h2{margin:0 0 10px;font-size:22px}p{margin:0 0 8px;color:var(--muted);line-height:1.35}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.stats div{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(255,255,255,.06)}.stats span{display:block;color:var(--muted);font-size:11px;font-weight:900;text-transform:uppercase}.stats strong{font-size:22px;color:var(--gold)}
    .buttons{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.button,button{min-height:48px;border:1px solid rgba(116,240,178,.42);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:950;display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;padding:10px;cursor:pointer}.gold{background:var(--gold);color:#03140f;border-color:var(--gold)}
    .qr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.qr img{width:100%;border-radius:8px;background:#fff;padding:8px}.qr label{display:block;margin:0 0 6px;color:var(--gold);font-weight:900}
    .warning{border-color:rgba(255,125,110,.55);background:rgba(255,125,110,.11);color:#ffe5df}
    pre{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.25);padding:10px;line-height:1.35}code{overflow-wrap:anywhere}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace}
    @media(max-width:680px){.stats,.buttons,.qr{grid-template-columns:1fr}h1{font-size:42px}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>Send 3 Clean Tests</h1>
      <p>Paid clicks exist, but signup save proof is still missing. This is the action that tells us whether Google signup works or where it stops.</p>
      <div class="stats">
        ${metric("Paid views", payload.counts.paidViews)}
        ${metric("Ref views", payload.counts.referralViews)}
        ${metric("Google returns", payload.counts.returned)}
        ${metric("Signup saves", payload.counts.signupSaves)}
      </div>
    </section>
    <section>
      <h2>Send Now</h2>
      <div class="buttons">
        <a class="button gold" href="${escapeAttr(payload.whatsapp)}">Open WhatsApp</a>
        <button data-copy="${escapeAttr(payload.copy)}">Copy tester text</button>
        <button data-copy="${escapeAttr(payload.testerLink)}">Copy tester link</button>
        <button data-copy="${escapeAttr(payload.command)}">Copy log command</button>
      </div>
      <div class="qr">
        <div><label>Tester link QR</label><img alt="Tester link QR" src="${escapeAttr(payload.referralQr)}" /></div>
        <div><label>WhatsApp QR</label><img alt="WhatsApp QR" src="${escapeAttr(payload.whatsappQr)}" /></div>
      </div>
    </section>
    <section>
      <h2>Message</h2>
      <pre>${escapeHtml(payload.copy)}</pre>
      <h2>Log Only After Real Send</h2>
      <pre class="mono">${escapeHtml(payload.command)}</pre>
    </section>
    <section class="warning">
      <h2>Proof Rule</h2>
      <p>${escapeHtml(payload.proofRule)}</p>
      <p>${escapeHtml(payload.doneWhen)}</p>
    </section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = old; }, 1200);
      } catch {
        window.prompt("Copy this", value);
      }
    });
  </script>
</body>
</html>`;
}

function metric(label, value) {
  return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function qrUrl(value) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(value)}`;
}

function indent(value, prefix) {
  return String(value ?? "")
    .split("\n")
    .map((line) => `${prefix}${line}`)
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
  }).format(date).replace(",", "");
}

async function readJson(file, fallback = {}) {
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
