#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];
const HOURS = 72;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const publicTargets = await readJson(path.join(runtimeDir, "public-outreach-targets.json"), {});
const xTargetHunter = await readJson(path.join(runtimeDir, "x-target-hunter.json"), {});
const xOpenclaw = await readJson(path.join(runtimeDir, "x-football-openclaw.json"), {});
const payload = buildPayload({ publicTargets, xTargetHunter, xOpenclaw });

await writeFile(path.join(runtimeDir, "platform-rotation.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "platform-rotation.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "platform-rotation.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "platform-rotation.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

function buildPayload({ publicTargets, xTargetHunter, xOpenclaw }) {
  const publicRows = Array.isArray(publicTargets.targets) ? publicTargets.targets : [];
  const xLanes = Array.isArray(xTargetHunter.lanes) ? xTargetHunter.lanes : [];
  const xActions = Array.isArray(xOpenclaw.actions) ? xOpenclaw.actions : [];
  const pool = [
    ...publicRows.map((target) => normalizeTarget(target, "public-target")),
    ...xLanes.map((lane, index) => normalizeXLane(lane, index)),
    ...xActions.map((action, index) => normalizeXAction(action, index)),
  ].filter((row) => row.owner && row.platform && row.link && row.proofInstruction);
  const workerPools = Object.fromEntries(WORKERS.map((worker) => [worker, pool.filter((row) => row.owner === worker)]));
  const slots = [];
  for (let hour = 0; hour < HOURS; hour += 1) {
    const startsAt = new Date(now.getTime() + hour * 60 * 60 * 1000);
    for (let workerIndex = 0; workerIndex < WORKERS.length; workerIndex += 1) {
      const worker = WORKERS[(hour + workerIndex) % WORKERS.length];
      const workerPool = workerPools[worker] ?? [];
      const source = workerPool.length
        ? workerPool[(hour + workerIndex * 7) % workerPool.length]
        : pool[(hour + workerIndex) % Math.max(pool.length, 1)];
      if (!source) continue;
      slots.push({
        id: `rot-${String(hour + 1).padStart(2, "0")}-${worker.toLowerCase()}`,
        hour: hour + 1,
        startsAt: startsAt.toISOString(),
        startsAtEest: formatEestLogTime(startsAt),
        worker,
        platform: source.platform,
        source: source.source,
        target: source.target,
        action: source.action,
        openUrl: source.openUrl,
        link: addRotationUtm(source.link, hour + 1, worker),
        copy: source.copy,
        proofInstruction: source.proofInstruction,
        proofCommand: source.proofCommand,
      });
    }
  }
  const platforms = [...new Set(slots.map((slot) => slot.platform))].sort();
  const workerCounts = Object.fromEntries(WORKERS.map((worker) => [worker, slots.filter((slot) => slot.worker === worker).length]));
  const platformCounts = Object.fromEntries(platforms.map((platform) => [platform, slots.filter((slot) => slot.platform === platform).length]));
  const failures = [
    publicRows.length < 30 ? `public target map too small (${publicRows.length})` : "",
    xLanes.length < 40 ? `X target hunter lanes too small (${xLanes.length})` : "",
    slots.length < HOURS * WORKERS.length ? `rotation slots too small (${slots.length})` : "",
    WORKERS.some((worker) => workerCounts[worker] < HOURS) ? "one or more workers missing hourly coverage" : "",
  ].filter(Boolean);
  return {
    schema: "worldcup26-platform-rotation-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: failures.length === 0,
    failures,
    state: failures.length === 0 ? "nonstop-72h-platform-rotation-ready" : "rotation-incomplete",
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    hours: HOURS,
    workerCount: WORKERS.length,
    slotCount: slots.length,
    platforms,
    workerCounts,
    platformCounts,
    firstSlots: slots.slice(0, 12),
    slots,
    proofRule:
      "This is a schedule, not proof. Only log proof after a real URL or precise private note exists for the action.",
  };
}

function normalizeTarget(target, source) {
  return {
    source,
    owner: String(target.owner ?? ""),
    platform: String(target.platform ?? ""),
    target: String(target.target ?? ""),
    action: String(target.action ?? ""),
    openUrl: String(target.searchUrl ?? target.openUrl ?? target.link ?? ""),
    link: String(target.link ?? REFERRAL_LINK),
    copy: String(target.copy ?? `Pick 3 teams free for WorldCup26. Code ${REFERRAL_CODE}\n${target.link ?? REFERRAL_LINK}`),
    proofInstruction: String(target.proof ?? "real URL or private proof note required"),
    proofCommand: String(target.proofCommand ?? ""),
  };
}

function normalizeXLane(lane, index) {
  const worker = WORKERS[index % WORKERS.length];
  const link = addUtm(REFERRAL_LINK, {
    utm_source: "x-target-hunter",
    utm_medium: "manual-reply",
    utm_campaign: "worldcup26_platform_rotation",
    utm_content: `${lane.id || `lane_${index + 1}`}_${slugify(lane.query)}`,
  });
  return {
    source: "x-target-hunter",
    owner: worker,
    platform: "X Target Hunter",
    target: String(lane.query ?? ""),
    action: String(lane.next ?? "Open X search and reply only where relevant."),
    openUrl: String(lane.url ?? ""),
    link,
    copy: `Good football question. I am asking people for exactly 3 World Cup picks before the event starts.\n\nPick free first and see your private points preview:\n${link}\n\nCode: ${REFERRAL_CODE}`,
    proofInstruction: "real X reply URL or precise private proof note",
    proofCommand: `node campaign-x-reply-log.mjs --worker "${worker}" --proof-url "<REAL_X_REPLY_URL_OR_PRIVATE_NOTE>" --target "<@handle or tweet URL>" --query "${escapeShellDouble(String(lane.query ?? "World Cup 2026"))}" --timestamp-eest "<YYYY-MM-DD HH:mm EEST>"`,
  };
}

function normalizeXAction(action, index) {
  const worker = String(action.owner ?? WORKERS[index % WORKERS.length]);
  return {
    source: "x-openclaw",
    owner: worker,
    platform: "X OpenClaw Reply",
    target: String(action.query ?? ""),
    action: `Use prepared reply style: ${String(action.replyStyle ?? "reply")}`,
    openUrl: String(action.searchUrl ?? ""),
    link: String(action.link ?? REFERRAL_LINK),
    copy: String(action.copy ?? ""),
    proofInstruction: "real X reply URL or precise private proof note",
    proofCommand: String(action.proofCommand ?? ""),
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 platform rotation ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} code=${payload.referralCode}`,
    `hours=${payload.hours} workers=${payload.workerCount} slots=${payload.slotCount}`,
    `platforms=${payload.platforms.join(",")}`,
    `worker_counts=${Object.entries(payload.workerCounts).map(([worker, count]) => `${worker}:${count}`).join(",")}`,
    `proof_rule=${payload.proofRule}`,
    "",
    "next_12_slots:",
  ];
  for (const slot of payload.firstSlots) {
    lines.push(`- ${slot.id} ${slot.startsAtEest} ${slot.worker} / ${slot.platform}`);
    lines.push(`  target=${slot.target}`);
    lines.push(`  open=${slot.openUrl}`);
    lines.push(`  link=${slot.link}`);
    lines.push(`  proof_after_real_action=${slot.proofCommand || slot.proofInstruction}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 72h Platform Rotation

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Hours: ${payload.hours}
- Slots: ${payload.slotCount}
- Workers: ${Object.entries(payload.workerCounts).map(([worker, count]) => `${worker} ${count}`).join(", ")}
- Platforms: ${payload.platforms.join(", ")}

${payload.proofRule}

## Next 12 Slots

${payload.firstSlots.map(renderSlotMarkdown).join("\n\n")}
`;
}

function renderSlotMarkdown(slot) {
  return `### ${slot.id} ${slot.startsAtEest} - ${slot.worker} / ${slot.platform}

- Target: ${slot.target}
- Open: ${slot.openUrl}
- Link: ${slot.link}

\`\`\`text
${slot.copy}
\`\`\`

\`\`\`bash
${slot.proofCommand || slot.proofInstruction}
\`\`\``;
}

function renderHtml(payload) {
  const workerCards = Object.entries(payload.workerCounts).map(([worker, count]) => `
    <div class="card"><span>${escapeHtml(worker)}</span><strong>${count}</strong><small>slots</small></div>`).join("");
  const rows = payload.slots.slice(0, 96).map((slot) => `
    <tr>
      <td>${slot.hour}</td>
      <td>${escapeHtml(slot.startsAtEest)}</td>
      <td>${escapeHtml(slot.worker)}</td>
      <td>${escapeHtml(slot.platform)}</td>
      <td><a href="${escapeAttr(slot.openUrl)}">${escapeHtml(slot.target)}</a></td>
      <td><button data-copy="${escapeAttr(slot.copy)}">Copy</button></td>
    </tr>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 72h Platform Rotation</title>
  <style>
    :root{color-scheme:dark;--bg:#02130e;--panel:#0b2a20;--line:rgba(255,255,255,.14);--text:#f8fff9;--muted:#bfd2c8;--gold:#ffd974;--mint:#75efb4;--green:#0d7b5d;--red:#ff8377}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0%,rgba(255,217,116,.2),transparent 24rem),radial-gradient(circle at 90% 10%,rgba(117,239,180,.18),transparent 26rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(1120px,100%);margin:0 auto;padding:12px 10px 42px}section{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:16px;margin-bottom:10px}.hero{border-color:rgba(255,217,116,.58);background:linear-gradient(135deg,rgba(255,217,116,.2),rgba(11,42,32,.95))}
    h1{margin:0;font-size:clamp(42px,10vw,76px);line-height:.9}h2{margin:0 0 10px;font-size:24px}p{margin:0 0 10px;color:var(--muted);line-height:1.35}.pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.card{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(0,0,0,.18)}.card span{display:block;color:var(--muted);font-weight:850;font-size:11px;text-transform:uppercase}.card strong{display:block;color:var(--gold);font-size:28px;line-height:1}.card small{color:var(--muted)}
    table{width:100%;border-collapse:collapse}td{border-top:1px solid var(--line);padding:8px;vertical-align:top}a{color:var(--mint);font-weight:850}button{border:1px solid rgba(117,239,180,.5);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:850;padding:8px;cursor:pointer}.warn{border-color:rgba(255,131,119,.55);background:rgba(255,131,119,.1)}
    @media(max-width:760px){.cards{grid-template-columns:1fr 1fr}h1{font-size:42px}td{display:block;border-top:0;padding:4px 0}tr{display:block;border-top:1px solid var(--line);padding:8px 0}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>72h Rotation</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
      <div class="cards">${workerCards}</div>
    </section>
    <section><h2>Next 96 Slots</h2><table><tbody>${rows}</tbody></table></section>
    <section class="warn"><h2>Platforms</h2><p>${escapeHtml(payload.platforms.join(", "))}</p></section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-copy]");
      if (!button) return;
      try { await navigator.clipboard.writeText(button.dataset.copy); }
      catch { window.prompt("Copy this", button.dataset.copy); }
    });
  </script>
</body>
</html>`;
}

function addRotationUtm(value, hour, worker) {
  try {
    return addUtm(value, {
      utm_rotation_hour: String(hour),
      utm_worker: worker.toLowerCase(),
    });
  } catch {
    return value;
  }
}

function addUtm(value, params) {
  const url = new URL(value);
  for (const [key, paramValue] of Object.entries(params)) {
    url.searchParams.set(key, paramValue);
  }
  return url.toString();
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
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") {
      parsed.root = argv[index + 1];
      index += 1;
    } else if (arg === "--now") {
      parsed.now = argv[index + 1];
      index += 1;
    }
  }
  return parsed;
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeShellDouble(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("$", "\\$").replaceAll("`", "\\`");
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
