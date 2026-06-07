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

const operatorPush = await readJson(path.join(runtimeDir, "operator-push-packet.json"), {});
const action = selectAction(operatorPush);
const payload = buildPayload({ operatorPush, action });

await writeFile(path.join(runtimeDir, "action-launcher.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "action-launcher.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "action-launcher.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "action-launcher.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function selectAction(operatorPush) {
  const actions = Array.isArray(operatorPush.actions) ? operatorPush.actions : [];
  if (args.priority) {
    const byPriority = actions.find((row) => String(row.priority ?? "") === String(args.priority));
    if (byPriority) return byPriority;
  }
  if (args.owner) {
    const byOwner = actions.find((row) => sameText(row.owner, args.owner));
    if (byOwner) return byOwner;
  }
  return operatorPush.firstAction ?? actions[0] ?? null;
}

function buildPayload({ operatorPush, action }) {
  const shareLinks = Array.isArray(action?.shareLinks) ? action.shareLinks : [];
  return {
    schema: "worldcup26-action-launcher-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    sourceGeneratedAtEest: String(operatorPush.generatedAtEest ?? ""),
    sourceState: String(operatorPush.state ?? "missing"),
    ok: Boolean(action?.priority && action?.copy && action?.proofCommand && action?.trackedLink),
    action: action
      ? {
          priority: String(action.priority ?? ""),
          owner: String(action.owner ?? ""),
          channel: String(action.channel ?? ""),
          task: String(action.action ?? ""),
          asset: String(action.asset ?? ""),
          ageLabel: String(action.ageLabel ?? ""),
          trackedLink: String(action.trackedLink ?? ""),
          trackedQr: String(action.trackedQr ?? ""),
          copy: String(action.copy ?? "").trim(),
          phoneInstruction: String(action.phoneInstruction ?? "").trim(),
          quickLogCommand: String(action.quickLogCommand ?? "").trim(),
          proofCommand: String(action.proofCommand ?? "").trim(),
          shareLinks: shareLinks.map((link) => ({
            key: String(link.key ?? ""),
            label: String(link.label ?? ""),
            url: String(link.url ?? ""),
          })),
        }
      : null,
    nextCommand:
      "After the real action exists, run the proof command with the placeholders replaced by the real account, time, audience, and counts.",
    proofRule:
      "This launcher prepares the action only. It is not proof and must not be logged as proof by itself.",
  };
}

function renderText(payload) {
  if (!payload.action) {
    return [
      `WorldCup26 action launcher ${payload.generatedAtEest}`,
      "ok=no",
      "No action found. Regenerate operator-push-packet first.",
      "",
    ].join("\n");
  }
  const action = payload.action;
  const lines = [
    `WorldCup26 action launcher ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} source_state=${payload.sourceState} source_generated=${payload.sourceGeneratedAtEest}`,
    `do_now=#${action.priority} ${action.owner} / ${action.channel}`,
    `task=${action.task}`,
    `asset=${action.asset}`,
    `tracked_link=${action.trackedLink}`,
    `tracked_qr=${action.trackedQr || "-"}`,
    `phone_instruction=${action.phoneInstruction}`,
    "",
    "share_links:",
  ];
  for (const link of action.shareLinks) {
    lines.push(`- ${link.label || link.key}: ${link.url}`);
  }
  lines.push("", "copy:");
  lines.push(indent(action.copy, "  "));
  lines.push("", "proof_after_real_action:");
  if (action.quickLogCommand) {
    lines.push(action.quickLogCommand);
    lines.push("", "full_audit_command:");
  }
  lines.push(action.proofCommand);
  lines.push("", `Rule: ${payload.proofRule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  if (!payload.action) {
    return `# WorldCup26 Action Launcher

Generated: ${payload.generatedAtEest}

No action found. Regenerate \`operator-push-packet\` first.
`;
  }
  const action = payload.action;
  return `# WorldCup26 Action Launcher

Generated: ${payload.generatedAtEest}

- Action: #${action.priority} ${action.owner} / ${action.channel}
- Task: ${action.task}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}
- QR: ${action.trackedQr || "-"}

${payload.proofRule}

## Phone Instruction

${action.phoneInstruction}

## Share Links

${action.shareLinks.map((link) => `- ${link.label || link.key}: ${link.url}`).join("\n") || "-"}

## Copy

\`\`\`text
${action.copy}
\`\`\`

## Proof Command

Run this only after the real action exists and placeholders are replaced.

${action.quickLogCommand ? `Quick log:\n\n\`\`\`bash\n${action.quickLogCommand}\n\`\`\`\n\nFull audit command:\n` : ""}

\`\`\`bash
${action.proofCommand}
\`\`\`
`;
}

function renderHtml(payload) {
  const action = payload.action;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Action Launcher</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2a20; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 12% 0%, rgba(255,217,116,.2), transparent 22rem), radial-gradient(circle at 86% 0%, rgba(116,240,178,.14), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(880px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, section { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,42,32,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(32px, 7vw, 58px); line-height: .92; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p { color: var(--muted); line-height: 1.4; margin: 0 0 8px; }
    a { color: var(--gold); overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; }
    .pill { color: #03140f; display: inline-flex; padding: 6px 9px; border-radius: 999px; background: linear-gradient(135deg, var(--gold), var(--mint)); font-weight: 950; text-transform: uppercase; }
    .links { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .link { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    @media (max-width: 760px) { .links { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Action Launcher</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
      ${action ? `<span class="pill">#${escapeHtml(action.priority)} ${escapeHtml(action.owner)} / ${escapeHtml(action.channel)}</span>` : `<span class="pill">No action</span>`}
    </header>
    ${action ? renderActionHtml(action) : "<section><h2>No action found</h2><p>Regenerate operator-push-packet first.</p></section>"}
  </main>
</body>
</html>`;
}

function renderActionHtml(action) {
  return `<section>
    <h2>${escapeHtml(action.task)}</h2>
    <p><strong>Asset:</strong> ${escapeHtml(action.asset)}</p>
    <p><strong>Tracked link:</strong> <a href="${escapeAttr(action.trackedLink)}">${escapeHtml(action.trackedLink)}</a></p>
    ${action.trackedQr ? `<p><strong>QR:</strong> <a href="${escapeAttr(action.trackedQr)}">${escapeHtml(action.trackedQr)}</a></p>` : ""}
    <p>${escapeHtml(action.phoneInstruction)}</p>
  </section>
  <section>
    <h2>Share Links</h2>
    <div class="links">
      ${action.shareLinks.map((link) => `<div class="link"><strong>${escapeHtml(link.label || link.key)}</strong><br><a href="${escapeAttr(link.url)}">${escapeHtml(link.url)}</a></div>`).join("")}
    </div>
  </section>
  <section>
    <h2>Copy</h2>
    <pre>${escapeHtml(action.copy)}</pre>
  </section>
  <section>
    <h2>Proof Command</h2>
    <p>Only after the real action exists and placeholders are replaced.</p>
    ${action.quickLogCommand ? `<pre>${escapeHtml(action.quickLogCommand)}</pre>` : ""}
    <pre>${escapeHtml(action.proofCommand)}</pre>
  </section>`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "", priority: "", owner: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--priority") parsed.priority = rawArgs[++index] ?? "";
    else if (arg === "--owner") parsed.owner = rawArgs[++index] ?? "";
  }
  return parsed;
}

function sameText(left, right) {
  return String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();
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
