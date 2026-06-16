#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const WORKERS = ["Nano", "Sienna", "Dexter", "Memo"];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const operatorPush = await readJson(path.join(runtimeDir, "operator-push-packet.json"), {});
const workerWake = await readJson(path.join(runtimeDir, "worker-wake-board.json"), {});
const firstSendBridge = await readJson(path.join(runtimeDir, "first-send-bridge.json"), {});
const payload = buildPayload({ operatorPush, workerWake, firstSendBridge });

await writeFile(path.join(runtimeDir, "worker-launchers.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "worker-launchers.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "worker-launchers.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "worker-launchers.html"), renderHtml(payload));

for (const worker of payload.workers) {
  const slug = slugify(worker.worker);
  await writeFile(path.join(runtimeDir, `worker-launcher-${slug}.json`), `${JSON.stringify(worker, null, 2)}\n`);
  await writeFile(path.join(runtimeDir, `worker-launcher-${slug}.txt`), renderWorkerText(worker, payload));
  await writeFile(path.join(runtimeDir, `worker-launcher-${slug}.md`), renderWorkerMarkdown(worker, payload));
  await writeFile(path.join(runtimeDir, `worker-launcher-${slug}.html`), renderWorkerHtml(worker, payload));
}

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ operatorPush, workerWake, firstSendBridge }) {
  const actions = Array.isArray(operatorPush.actions) ? operatorPush.actions.map(normalizeAction) : [];
  const wakeWorkers = Array.isArray(workerWake.workers) ? workerWake.workers : [];
  const workers = WORKERS.map((worker) => buildWorker(worker, actions, wakeWorkers));
  const bridge = normalizeFirstSendBridge(firstSendBridge);

  return {
    schema: "worldcup26-worker-launchers-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    sourceState: String(operatorPush.state ?? "missing"),
    ok: workers.every((worker) => worker.ok),
    workerCount: workers.length,
    activeWorkerCount: workers.filter((worker) => worker.action).length,
    firstSendBridge: bridge,
    workers,
    proofRule:
      "These launchers prepare worker actions only. Log proof only after the real post, story, message batch, upload, reply, or approval request exists.",
  };
}

function normalizeFirstSendBridge(row) {
  const ok = Boolean(row?.ok);
  return {
    ok,
    state: String(row?.state ?? (ok ? "send-now" : "missing")),
    owner: String(row?.owner ?? ""),
    channel: String(row?.channel ?? ""),
    title: String(row?.title ?? "Send the first real warm-contact batch"),
    doneWhen: String(row?.doneWhen ?? ""),
    warmAttempts: Number(row?.counts?.warmAttempts ?? 0),
    signupSaves: Number(row?.counts?.signupSaves ?? 0),
    referralViews: Number(row?.counts?.referralViews ?? 0),
    adClicks: Number(row?.counts?.adClicks ?? 0),
    link: String(row?.link ?? REFERRAL_LINK),
    whatsapp: String(row?.whatsapp ?? ""),
    telegram: String(row?.telegram ?? ""),
    sms: String(row?.sms ?? ""),
    copy: String(row?.copy ?? "").trim(),
    command: String(row?.command ?? "").trim(),
    referralQr: String(row?.referralQr ?? ""),
    whatsappQr: String(row?.whatsappQr ?? ""),
    htmlPath: "runtime/first-send-bridge.html",
  };
}

function buildWorker(worker, actions, wakeWorkers) {
  const action = actions.find((row) => sameText(row.owner, worker)) ?? null;
  const wake = wakeWorkers.find((row) => sameText(row.worker, worker)) ?? null;
  const wakeAction = wake?.current ? normalizeWakeAction(wake.current, worker) : null;
  const selected = shouldPreferWakeAction(wakeAction) ? wakeAction : action ?? wakeAction;

  return {
    worker,
    slug: slugify(worker),
    state: String(wake?.state ?? (selected ? "wake-now" : "standby")),
    assignedCount: Number(wake?.assignedCount ?? 0),
    ok: worker === "Memo" ? true : Boolean(selected?.priority && selected?.channel && selected?.proofCommand),
    action: selected,
    note:
      worker === "Memo" && !selected
        ? "Run verification, chase Sienna/Nano/Dexter proof, and do not log external proof without a real post/message/story."
        : "",
  };
}

function normalizeWakeAction(row, worker) {
  return {
    priority: String(row.priority ?? ""),
    owner: worker,
    channel: String(row.channel ?? ""),
    action: String(row.action ?? ""),
    asset: String(row.asset ?? ""),
    ageLabel: "",
    trackedLink: String(row.trackedLink ?? ""),
    trackedQr: "",
    copy: String(row.copy ?? "").trim(),
    phoneInstruction: String(row.phoneInstruction ?? row.action ?? "").trim(),
    quickLogCommand: String(row.quickLogCommand ?? "").trim(),
    proofCommand: String(row.proofCommand ?? row.proofIntakeCommand ?? "").trim(),
    shareLinks: shareObjectToLinks(row.share),
  };
}

function shouldPreferWakeAction(action) {
  const priority = String(action?.priority ?? "").toLowerCase();
  return priority.startsWith("warm-") || priority.startsWith("zs-") || priority === "paid";
}

function shareObjectToLinks(share) {
  if (!share || typeof share !== "object") return [];
  const entries = [
    ["whatsapp", "WhatsApp"],
    ["telegram", "Telegram"],
    ["x", "X"],
    ["facebook", "Facebook"],
  ];
  return entries
    .map(([key, label]) => ({
      key,
      label,
      url: String(share[key] ?? ""),
    }))
    .filter((link) => link.url);
}

function normalizeAction(row) {
  return {
    priority: String(row.priority ?? ""),
    owner: String(row.owner ?? ""),
    channel: String(row.channel ?? ""),
    action: String(row.action ?? ""),
    asset: String(row.asset ?? ""),
    ageLabel: String(row.ageLabel ?? ""),
    trackedLink: String(row.trackedLink ?? ""),
    trackedQr: String(row.trackedQr ?? ""),
    copy: String(row.copy ?? "").trim(),
    phoneInstruction: String(row.phoneInstruction ?? "").trim(),
    quickLogCommand: String(row.quickLogCommand ?? "").trim(),
    proofCommand: String(row.proofCommand ?? "").trim(),
    shareLinks: Array.isArray(row.shareLinks)
      ? row.shareLinks.map((link) => ({
          key: String(link.key ?? ""),
          label: String(link.label ?? ""),
          url: String(link.url ?? ""),
        }))
      : [],
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 worker launchers ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} source_state=${payload.sourceState} active=${payload.activeWorkerCount}/${payload.workerCount}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `rule=${payload.proofRule}`,
    "",
    "first_send_bridge:",
    `- state=${payload.firstSendBridge.state} ok=${payload.firstSendBridge.ok ? "yes" : "no"} owner=${payload.firstSendBridge.owner || "-"} channel=${payload.firstSendBridge.channel || "-"}`,
    `  open=${payload.firstSendBridge.htmlPath}`,
    `  whatsapp=${payload.firstSendBridge.whatsapp || "-"}`,
    `  command=${payload.firstSendBridge.command || "-"}`,
    `  counts=warm_attempts:${payload.firstSendBridge.warmAttempts} signup_saves:${payload.firstSendBridge.signupSaves} referral_views:${payload.firstSendBridge.referralViews} ad_clicks:${payload.firstSendBridge.adClicks}`,
    "",
    "workers:",
  ];
  for (const worker of payload.workers) {
    lines.push(`- ${worker.worker}: ${worker.ok ? "ready" : "needs-attention"} state=${worker.state} assigned=${worker.assignedCount}`);
    if (worker.action) {
      lines.push(`  do_now=#${worker.action.priority} ${worker.action.channel}`);
      lines.push(`  asset=${worker.action.asset || "-"}`);
      lines.push(`  link=${worker.action.trackedLink || "-"}`);
      lines.push(`  open=runtime/worker-launcher-${worker.slug}.html`);
    } else {
      lines.push(`  note=${worker.note || "No active launcher action."}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

function renderWorkerText(worker, payload) {
  const lines = [
    `WorldCup26 ${worker.worker} launcher ${payload.generatedAtEest}`,
    `state=${worker.state} ok=${worker.ok ? "yes" : "no"} assigned=${worker.assignedCount}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `rule=${payload.proofRule}`,
    "",
  ];
  if (shouldShowFirstSendBridge(worker, payload.firstSendBridge)) {
    lines.push("first_send_bridge:");
    lines.push(`state=${payload.firstSendBridge.state} owner=${payload.firstSendBridge.owner} channel=${payload.firstSendBridge.channel}`);
    lines.push(`open=${payload.firstSendBridge.htmlPath}`);
    lines.push(`whatsapp=${payload.firstSendBridge.whatsapp}`);
    lines.push(`command=${payload.firstSendBridge.command}`);
    lines.push("");
  }
  if (!worker.action) {
    lines.push(`note=${worker.note || "No active launcher action."}`, "");
    return lines.join("\n");
  }
  lines.push(`#${worker.action.priority} ${worker.worker} / ${worker.action.channel}`);
  lines.push(`action=${worker.action.action}`);
  lines.push(`asset=${worker.action.asset}`);
  lines.push(`tracked_link=${worker.action.trackedLink}`);
  lines.push(`tracked_qr=${worker.action.trackedQr || "-"}`);
  lines.push(`instruction=${worker.action.phoneInstruction}`);
  lines.push("", "share_links:");
  for (const link of worker.action.shareLinks) {
    lines.push(`- ${link.label || link.key}: ${link.url}`);
  }
  lines.push("", "copy:");
  lines.push(indent(worker.action.copy, "  "));
  lines.push("", "proof_after_real_action:");
  if (worker.action.quickLogCommand) {
    lines.push(worker.action.quickLogCommand);
    lines.push("", "full_audit_command:");
  }
  lines.push(worker.action.proofCommand);
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Worker Launchers

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ok" : "needs attention"}
- Active workers: ${payload.activeWorkerCount}/${payload.workerCount}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

${payload.proofRule}

## First Send Bridge

- State: ${payload.firstSendBridge.state}
- Owner: ${payload.firstSendBridge.owner || "-"}
- Channel: ${payload.firstSendBridge.channel || "-"}
- Open: ${payload.firstSendBridge.htmlPath}
- WhatsApp: ${payload.firstSendBridge.whatsapp || "-"}
- Log command: \`${payload.firstSendBridge.command || "-"}\`
- Counts: warm attempts ${payload.firstSendBridge.warmAttempts}, signup saves ${payload.firstSendBridge.signupSaves}, referral views ${payload.firstSendBridge.referralViews}, ad clicks ${payload.firstSendBridge.adClicks}

## Workers

${payload.workers.map((worker) => `- ${worker.worker}: ${worker.ok ? "ready" : "needs attention"} - ${worker.action ? `#${worker.action.priority} ${worker.action.channel}` : worker.note}`).join("\n")}
`;
}

function renderWorkerMarkdown(worker, payload) {
  if (!worker.action) {
    return `# WorldCup26 ${worker.worker} Launcher

Generated: ${payload.generatedAtEest}

${worker.note || "No active launcher action."}
`;
  }
  const firstSend = shouldShowFirstSendBridge(worker, payload.firstSendBridge)
    ? `## First Send Bridge

- Open: ${payload.firstSendBridge.htmlPath}
- WhatsApp: ${payload.firstSendBridge.whatsapp}
- Log after send: \`${payload.firstSendBridge.command}\`

`
    : "";
  return `# WorldCup26 ${worker.worker} Launcher

Generated: ${payload.generatedAtEest}

${firstSend}
- Action: #${worker.action.priority} ${worker.action.channel}
- Task: ${worker.action.action}
- Asset: \`${worker.action.asset}\`
- Link: ${worker.action.trackedLink}
- QR: ${worker.action.trackedQr || "-"}

${payload.proofRule}

## Instruction

${worker.action.phoneInstruction}

## Copy

\`\`\`text
${worker.action.copy}
\`\`\`

## Proof Command

${worker.action.quickLogCommand ? `\`\`\`bash\n${worker.action.quickLogCommand}\n\`\`\`\n\nFull audit command:\n\n` : ""}

\`\`\`bash
${worker.action.proofCommand}
\`\`\`
`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>${htmlHead("WorldCup26 Worker Launchers")}</head>
<body>
  <main>
    <header>
      <h1>Worker Launchers</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
      <div class="stats">
        <div class="stat"><span>Status</span><strong>${payload.ok ? "ok" : "check"}</strong></div>
        <div class="stat"><span>Active</span><strong>${payload.activeWorkerCount}/${payload.workerCount}</strong></div>
        <div class="stat"><span>Code</span><strong>${payload.referralCode}</strong></div>
      </div>
    </header>
    ${renderFirstSendBridge(payload.firstSendBridge)}
    <section class="grid">
      ${payload.workers.map(renderWorkerCard).join("")}
    </section>
  </main>
</body>
</html>`;
}

function renderWorkerHtml(worker, payload) {
  return `<!doctype html>
<html lang="en">
<head>${htmlHead(`WorldCup26 ${worker.worker} Launcher`)}</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(worker.worker)}</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
      <span class="pill">${worker.ok ? "ready" : "check"}</span>
    </header>
    ${shouldShowFirstSendBridge(worker, payload.firstSendBridge) ? renderFirstSendBridge(payload.firstSendBridge) : ""}
    ${worker.action ? renderActionSection(worker.action) : `<section><h2>Standby</h2><p>${escapeHtml(worker.note || "No active launcher action.")}</p></section>`}
  </main>
</body>
</html>`;
}

function renderWorkerCard(worker) {
  const href = `worker-launcher-${worker.slug}.html`;
  return `<article>
    <span class="pill">${escapeHtml(worker.worker)}</span>
    <h2>${worker.action ? `#${escapeHtml(worker.action.priority)} ${escapeHtml(worker.action.channel)}` : "Standby"}</h2>
    <p>${escapeHtml(worker.action?.action || worker.note || "No active launcher action.")}</p>
    <p><a href="${escapeAttr(href)}">Open ${escapeHtml(worker.worker)} launcher</a></p>
  </article>`;
}

function renderActionSection(action) {
  return `<section>
    <h2>#${escapeHtml(action.priority)} ${escapeHtml(action.channel)}</h2>
    <p>${escapeHtml(action.action)}</p>
    <p><strong>Asset:</strong> ${escapeHtml(action.asset)}</p>
    <p><a href="${escapeAttr(action.trackedLink)}">${escapeHtml(action.trackedLink)}</a></p>
    ${action.trackedQr ? `<p><a href="${escapeAttr(action.trackedQr)}">Tracked QR</a></p>` : ""}
    <p>${escapeHtml(action.phoneInstruction)}</p>
  </section>
  <section>
    <h2>Copy</h2>
    <pre>${escapeHtml(action.copy)}</pre>
  </section>
  <section>
    <h2>Proof Command</h2>
    ${action.quickLogCommand ? `<pre>${escapeHtml(action.quickLogCommand)}</pre>` : ""}
    <pre>${escapeHtml(action.proofCommand)}</pre>
  </section>`;
}

function renderFirstSendBridge(bridge) {
  if (!bridge?.ok) {
    return `<section class="hero-action">
    <span class="pill">First action</span>
    <h2>First-send bridge missing</h2>
    <p>Regenerate <code>runtime/first-send-bridge.json</code> before sending workers to launcher pages.</p>
  </section>`;
  }
  const localBridgeHref = bridge.htmlPath.split("/").pop() || bridge.htmlPath;
  return `<section class="hero-action">
    <span class="pill">Do this first</span>
    <h2>${escapeHtml(bridge.title)}</h2>
    <p>${escapeHtml(bridge.owner)} / ${escapeHtml(bridge.channel)}. ${escapeHtml(bridge.doneWhen)}</p>
    <div class="cta-row">
      ${bridge.whatsapp ? `<a class="button" href="${escapeAttr(bridge.whatsapp)}">Open WhatsApp</a>` : ""}
      <a class="button secondary" href="${escapeAttr(localBridgeHref)}">Open bridge page</a>
      ${bridge.telegram ? `<a class="button secondary" href="${escapeAttr(bridge.telegram)}">Telegram</a>` : ""}
    </div>
    <div class="stats">
      <div class="stat"><span>Warm attempts</span><strong>${bridge.warmAttempts}</strong></div>
      <div class="stat"><span>Signups saved</span><strong>${bridge.signupSaves}</strong></div>
      <div class="stat"><span>Referral views</span><strong>${bridge.referralViews}</strong></div>
      <div class="stat"><span>Ad clicks</span><strong>${bridge.adClicks}</strong></div>
    </div>
    <h3>Copy</h3>
    <pre>${escapeHtml(bridge.copy)}</pre>
    <h3>Log only after real send</h3>
    <pre>${escapeHtml(bridge.command)}</pre>
  </section>`;
}

function shouldShowFirstSendBridge(worker, bridge) {
  return Boolean(bridge?.ok && bridge.warmAttempts === 0 && sameText(worker?.worker, bridge.owner));
}

function htmlHead(title) {
  return `<meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2a20; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 12% 0%, rgba(255,217,116,.18), transparent 22rem), radial-gradient(circle at 88% 0%, rgba(116,240,178,.14), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(980px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, article, section { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,42,32,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(32px, 7vw, 58px); line-height: .92; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    h3 { margin: 14px 0 6px; font-size: 14px; color: var(--gold); text-transform: uppercase; }
    p { color: var(--muted); line-height: 1.4; margin: 0 0 8px; }
    a { color: var(--gold); overflow-wrap: anywhere; }
    code { color: var(--gold); }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; }
    .pill { color: #03140f; display: inline-flex; padding: 6px 9px; border-radius: 999px; background: linear-gradient(135deg, var(--gold), var(--mint)); font-weight: 950; text-transform: uppercase; }
    .grid, .stats { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .hero-action { background: linear-gradient(145deg, rgba(255,217,116,.18), rgba(11,42,32,.96) 38%, rgba(116,240,178,.12)); border-color: rgba(255,217,116,.52); }
    .cta-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; border-radius: 8px; padding: 10px 14px; background: linear-gradient(135deg, var(--gold), var(--mint)); color: #03140f; font-weight: 950; text-decoration: none; }
    .button.secondary { background: rgba(255,255,255,.08); color: var(--gold); border: 1px solid var(--line); }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; text-transform: uppercase; font-weight: 900; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; }
    @media (max-width: 760px) { .grid, .stats { grid-template-columns: 1fr; } }
  </style>`;
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

function sameText(left, right) {
  return String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();
}

function slugify(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
