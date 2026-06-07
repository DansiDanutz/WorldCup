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

const firstHumanActions = await readJson(path.join(runtimeDir, "first-human-actions.json"), {});
const workerWake = await readJson(path.join(runtimeDir, "worker-wake-board.json"), {});
const hotPing = await readJson(path.join(runtimeDir, "hot-proof-ping.json"), {});
const payload = buildPayload({ firstHumanActions, workerWake, hotPing });

await writeFile(path.join(runtimeDir, "first-send-bridge.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "first-send-bridge.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "first-send-bridge.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "first-send-bridge.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ firstHumanActions, workerWake, hotPing }) {
  const counts = firstHumanActions.counts ?? {};
  const first = firstHumanActions.firstAction ?? {};
  const copy = String(first.copy ?? "").trim();
  const link = String(first.link ?? REFERRAL_LINK).trim();
  const command = String(first.command ?? "").trim() ||
    "node campaign-warm-send-log.mjs --priority warm-1 --count <N> --account \"<account>\" --replies 0";
  const whatsapp = String(first.share?.whatsapp ?? "").trim() ||
    `https://wa.me/?text=${encodeURIComponent(copy || link)}`;
  const telegram = String(first.share?.telegram ?? "").trim() ||
    `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(copy || link)}`;
  const sms = String(first.share?.sms ?? "").trim() || `sms:?&body=${encodeURIComponent(copy || link)}`;
  const warmAttempts = Number(counts.warmAttempts ?? hotPing.firstHuman?.warmAttempts ?? 0);
  const signupSaves = Number(counts.signupSaves ?? hotPing.firstHuman?.signupSaves ?? 0);
  const referralViews = Number(counts.referralViews ?? hotPing.firstHuman?.referralViews ?? 0);
  const adClicks = Number(counts.dashboardClicks ?? hotPing.firstHuman?.dashboardClicks ?? 0);
  const failures = [
    !firstHumanActions.ok ? "First-human action board is not ok." : "",
    !copy ? "First action copy is missing." : "",
    !whatsapp ? "WhatsApp deep link is missing." : "",
    !/campaign-(warm-send-log|signup-conversion-audit|public-channel-attempts)\.mjs/.test(command)
      ? "First-action logger/audit command is missing."
      : "",
  ].filter(Boolean);
  return {
    schema: "worldcup26-first-send-bridge-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: failures.length === 0,
    failures,
    state: warmAttempts > 0 ? "warm-send-logged" : "send-now",
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    owner: String(first.owner ?? "Nano"),
    channel: String(first.channel ?? "WhatsApp personal"),
    title: String(first.title ?? "Send the first real warm-contact batch"),
    doneWhen: String(first.doneWhen ?? "A real count/account note exists in public-channel attempts."),
    counts: { warmAttempts, signupSaves, referralViews, adClicks },
    copy,
    link,
    whatsapp,
    telegram,
    sms,
    command,
    referralQr: qrUrl(link),
    whatsappQr: qrUrl(whatsapp),
    workerWakeState: String(workerWake.proofState ?? "missing"),
    workerWakeFirst: workerWake.firstAction
      ? `${workerWake.firstAction.owner}/${workerWake.firstAction.channel}/${workerWake.firstAction.priority}`
      : "",
    rule:
      "This bridge is an action launcher, not proof. Do the real send or signup test first, then log the real count/account or rerun the audit.",
  };
}

function renderText(payload) {
  return [
    `WorldCup26 first send bridge ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} warm_attempts=${payload.counts.warmAttempts} signup_saves=${payload.counts.signupSaves} referral_views=${payload.counts.referralViews} ad_clicks=${payload.counts.adClicks}`,
    `owner=${payload.owner}`,
    `channel=${payload.channel}`,
    `whatsapp=${payload.whatsapp}`,
    `telegram=${payload.telegram}`,
    `sms=${payload.sms}`,
    `referral_qr=${payload.referralQr}`,
    `whatsapp_qr=${payload.whatsappQr}`,
    `command=${payload.command}`,
    `done_when=${payload.doneWhen}`,
    `rule=${payload.rule}`,
    "",
    "copy:",
    indent(payload.copy, "  "),
    "",
  ].join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 First Send Bridge

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Owner: ${payload.owner}
- Channel: ${payload.channel}
- Warm attempts: ${payload.counts.warmAttempts}
- Signup saves: ${payload.counts.signupSaves}
- Referral views: ${payload.counts.referralViews}
- Ad clicks: ${payload.counts.adClicks}

${payload.rule}

## Send Now

- WhatsApp: ${payload.whatsapp}
- Telegram: ${payload.telegram}
- SMS: ${payload.sms}
- Referral QR: ${payload.referralQr}

\`\`\`text
${payload.copy}
\`\`\`

## Log After Real Send

\`\`\`bash
${payload.command}
\`\`\`
`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 First Send Bridge</title>
  <style>
    :root{color-scheme:dark;--bg:#03140f;--panel:#0b2a20;--line:rgba(255,255,255,.16);--text:#f8fff9;--muted:#bad0c6;--gold:#ffd974;--mint:#74f0b2;--green:#0f7b5d}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 10% 0%,rgba(255,217,116,.2),transparent 24rem),radial-gradient(circle at 90% 8%,rgba(116,240,178,.16),transparent 24rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(780px,100%);margin:0 auto;padding:12px 10px 40px}section{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:14px;margin-bottom:10px}
    .hero{border-color:rgba(255,217,116,.7);background:linear-gradient(135deg,rgba(255,217,116,.18),rgba(11,42,32,.96))}
    h1{margin:0 0 8px;font-size:clamp(34px,10vw,70px);line-height:.88}h2{margin:0 0 10px;font-size:22px}p{margin:0 0 8px;color:var(--muted);line-height:1.35}.pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.stats div{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(255,255,255,.06)}.stats span{display:block;color:var(--muted);font-size:11px;font-weight:900;text-transform:uppercase}.stats strong{font-size:22px;color:var(--gold)}
    .buttons{display:grid;grid-template-columns:1fr;gap:8px;margin:12px 0}.button,button{min-height:48px;border:1px solid rgba(116,240,178,.42);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:950;display:flex;align-items:center;justify-content:center;text-decoration:none;padding:10px;cursor:pointer}.gold{background:var(--gold);color:#03140f;border-color:var(--gold)}
    .qr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.qr img{width:100%;border-radius:8px;background:#fff;padding:8px}.qr label{display:block;margin:0 0 6px;color:var(--gold);font-weight:900}
    pre{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.25);padding:10px;line-height:1.35}code{overflow-wrap:anywhere}
    @media(max-width:680px){.stats,.qr{grid-template-columns:1fr}h1{font-size:42px}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>Do First Action</h1>
      <p>${escapeHtml(payload.owner)} / ${escapeHtml(payload.channel)}. ${escapeHtml(payload.rule)}</p>
      <div class="stats">
        ${metric("Warm sent", payload.counts.warmAttempts)}
        ${metric("Signup saves", payload.counts.signupSaves)}
        ${metric("Ref views", payload.counts.referralViews)}
        ${metric("Ad clicks", payload.counts.adClicks)}
      </div>
    </section>
    <section>
      <h2>Open On Phone</h2>
      <div class="buttons">
        <a class="button gold" href="${escapeAttr(payload.whatsapp)}">Open WhatsApp</a>
        <a class="button" href="${escapeAttr(payload.telegram)}">Open Telegram</a>
        <a class="button" href="${escapeAttr(payload.sms)}">Open SMS</a>
        <button data-copy="${escapeAttr(payload.copy)}">Copy invite text</button>
        <button data-copy="${escapeAttr(payload.command)}">Copy log command</button>
      </div>
      <div class="qr">
        <div><label>Referral QR</label><img alt="Referral QR" src="${escapeAttr(payload.referralQr)}" /></div>
        <div><label>WhatsApp QR</label><img alt="WhatsApp QR" src="${escapeAttr(payload.whatsappQr)}" /></div>
      </div>
    </section>
    <section>
      <h2>Invite Text</h2>
      <pre>${escapeHtml(payload.copy)}</pre>
      <h2>After Real Action</h2>
      <pre>${escapeHtml(payload.command)}</pre>
      <p>Replace placeholders when the command has them. Do not log a planned send or planned test.</p>
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
  return `https://quickchart.io/qr?text=${encodeURIComponent(value)}&size=420&margin=2&ecLevel=M&format=png`;
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
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}
