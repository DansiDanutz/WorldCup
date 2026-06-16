#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];
const SLOTS_PER_WORKER = 3;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const rotation = await readJson(path.join(runtimeDir, "platform-rotation.json"), {});
const publicAttempts = await readJson(path.join(runtimeDir, "public-channel-attempts.json"), {});
const signupAudit = await readJson(path.join(runtimeDir, "signup-conversion-audit.json"), {});
const payload = buildPayload({ rotation, publicAttempts, signupAudit });

await writeFile(path.join(runtimeDir, "immediate-sprint.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "immediate-sprint.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "immediate-sprint.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "immediate-sprint.html"), renderHtml(payload));

for (const worker of payload.workers) {
  await writeFile(path.join(runtimeDir, `immediate-sprint-${worker.slug}.json`), `${JSON.stringify(worker, null, 2)}\n`);
  await writeFile(path.join(runtimeDir, `immediate-sprint-${worker.slug}.txt`), renderWorkerText(worker, payload));
  await writeFile(path.join(runtimeDir, `immediate-sprint-${worker.slug}.html`), renderWorkerHtml(worker, payload));
}

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

function buildPayload({ rotation, publicAttempts, signupAudit }) {
  const slots = Array.isArray(rotation.slots) ? rotation.slots : [];
  const dueSlots = slots.filter((slot) => new Date(slot.startsAt).getTime() <= now.getTime());
  const upcomingSlots = slots.filter((slot) => new Date(slot.startsAt).getTime() > now.getTime());
  const selected = [];
  for (const worker of WORKERS) {
    const dueForWorker = dueSlots.filter((slot) => slot.worker === worker);
    const upcomingForWorker = upcomingSlots.filter((slot) => slot.worker === worker);
    selected.push(...[...dueForWorker.slice(-SLOTS_PER_WORKER), ...upcomingForWorker.slice(0, SLOTS_PER_WORKER)]
      .slice(0, SLOTS_PER_WORKER)
      .map((slot) => normalizeSlot(slot)));
  }
  const workers = WORKERS.map((worker) => {
    const actions = selected.filter((slot) => slot.worker === worker);
    return {
      worker,
      slug: slugify(worker),
      ok: actions.length >= SLOTS_PER_WORKER,
      actionCount: actions.length,
      actions,
      firstAction: actions[0] ?? null,
    };
  });
  const signupSaves = Number(signupAudit.counts?.signupSaves ?? signupAudit.signupSaves ?? 0);
  const attempts = Number(publicAttempts.counts?.attempts ?? publicAttempts.attempts ?? 0);
  return {
    schema: "worldcup26-immediate-sprint-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok:
      String(rotation.schema ?? "") === "worldcup26-platform-rotation-v1" &&
      workers.every((worker) => worker.ok),
    state: signupSaves === 0 ? "execute-now-signup-and-proof-sprint" : "execute-now-growth-sprint",
    rotationGeneratedAt: String(rotation.generatedAt ?? ""),
    rotationState: String(rotation.state ?? ""),
    dueSlotCount: dueSlots.length,
    selectedSlotCount: selected.length,
    signupSaves,
    publicAttempts: attempts,
    workers,
    proofRule:
      "This is the next action sprint, not proof. Log only after a real post/reply/message exists, using a real URL or precise private proof note.",
    firstAction:
      workers.find((worker) => worker.worker === "Memo")?.firstAction ??
      workers.find((worker) => worker.firstAction)?.firstAction ??
      null,
  };
}

function normalizeSlot(slot) {
  return {
    id: String(slot.id ?? ""),
    hour: Number(slot.hour ?? 0),
    startsAt: String(slot.startsAt ?? ""),
    startsAtEest: String(slot.startsAtEest ?? ""),
    worker: String(slot.worker ?? ""),
    platform: String(slot.platform ?? ""),
    target: String(slot.target ?? ""),
    action: String(slot.action ?? ""),
    openUrl: String(slot.openUrl ?? ""),
    link: String(slot.link ?? ""),
    copy: String(slot.copy ?? ""),
    proofCommand: String(slot.proofCommand ?? ""),
    proofInstruction: String(slot.proofInstruction ?? ""),
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 immediate sprint ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state}`,
    `due_slots=${payload.dueSlotCount} selected=${payload.selectedSlotCount} signup_saves=${payload.signupSaves} public_attempts=${payload.publicAttempts}`,
    `proof_rule=${payload.proofRule}`,
    "",
  ];
  for (const worker of payload.workers) {
    lines.push(`${worker.worker}: actions=${worker.actionCount} first=${worker.firstAction ? `${worker.firstAction.platform} / ${worker.firstAction.target}` : "-"}`);
    for (const action of worker.actions) {
      lines.push(`- ${action.id} ${action.startsAtEest} ${action.platform}`);
      lines.push(`  target=${action.target}`);
      lines.push(`  open=${action.openUrl}`);
      lines.push(`  link=${action.link}`);
      lines.push(`  proof_after_real_action=${action.proofCommand || action.proofInstruction}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function renderWorkerText(worker, payload) {
  return [
    `WorldCup26 immediate sprint / ${worker.worker} ${payload.generatedAtEest}`,
    `ok=${worker.ok ? "yes" : "no"} state=${payload.state} actions=${worker.actionCount}`,
    `rule=${payload.proofRule}`,
    "",
    ...worker.actions.flatMap((action) => [
      `- ${action.id} ${action.startsAtEest} ${action.platform}`,
      `  target=${action.target}`,
      `  open=${action.openUrl}`,
      `  copy=${oneLine(action.copy)}`,
      `  proof_after_real_action=${action.proofCommand || action.proofInstruction}`,
    ]),
    "",
  ].join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Immediate Sprint

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Due rotation slots: ${payload.dueSlotCount}
- Selected actions: ${payload.selectedSlotCount}
- Signup saves: ${payload.signupSaves}
- Public attempts: ${payload.publicAttempts}

${payload.proofRule}

${payload.workers.map((worker) => `## ${worker.worker}

${worker.actions.map(renderActionMarkdown).join("\n\n")}
`).join("\n")}
`;
}

function renderActionMarkdown(action) {
  return `### ${action.id} - ${action.platform}

- Time: ${action.startsAtEest}
- Target: ${action.target}
- Open: ${action.openUrl}
- Link: ${action.link}

\`\`\`text
${action.copy}
\`\`\`

\`\`\`bash
${action.proofCommand || action.proofInstruction}
\`\`\``;
}

function renderHtml(payload) {
  const workerCards = payload.workers.map((worker) => `
    <a class="card" href="immediate-sprint-${escapeAttr(worker.slug)}.html">
      <span>${escapeHtml(worker.worker)}</span>
      <strong>${worker.actionCount}</strong>
      <small>${escapeHtml(worker.firstAction?.platform || "-")}</small>
    </a>`).join("");
  const rows = payload.workers.flatMap((worker) => worker.actions.map((action) => `
    <tr>
      <td>${escapeHtml(worker.worker)}</td>
      <td>${escapeHtml(action.platform)}</td>
      <td><a href="${escapeAttr(action.openUrl)}">${escapeHtml(action.target)}</a></td>
      <td><button data-copy="${escapeAttr(action.copy)}">Copy</button></td>
    </tr>`)).join("");
  return pageShell("WorldCup26 Immediate Sprint", `
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>Immediate Sprint</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
      <div class="cards">${workerCards}</div>
    </section>
    <section><h2>Actions</h2><table><tbody>${rows}</tbody></table></section>
  `);
}

function renderWorkerHtml(worker, payload) {
  const rows = worker.actions.map((action) => `
    <tr>
      <td>${escapeHtml(action.platform)}</td>
      <td><a href="${escapeAttr(action.openUrl)}">${escapeHtml(action.target)}</a></td>
      <td><button data-copy="${escapeAttr(action.copy)}">Copy</button></td>
    </tr>`).join("");
  return pageShell(`WorldCup26 Immediate Sprint / ${worker.worker}`, `
    <section class="hero">
      <span class="pill">${escapeHtml(worker.worker)}</span>
      <h1>Do These Now</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
    </section>
    <section><h2>${escapeHtml(worker.worker)} Actions</h2><table><tbody>${rows}</tbody></table></section>
  `);
}

function pageShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root{color-scheme:dark;--bg:#02130e;--panel:#0b2a20;--line:rgba(255,255,255,.14);--text:#f8fff9;--muted:#bfd2c8;--gold:#ffd974;--mint:#75efb4;--green:#0d7b5d}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0%,rgba(255,217,116,.2),transparent 24rem),radial-gradient(circle at 90% 10%,rgba(117,239,180,.18),transparent 26rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(980px,100%);margin:0 auto;padding:12px 10px 42px}section{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:16px;margin-bottom:10px}.hero{border-color:rgba(255,217,116,.58);background:linear-gradient(135deg,rgba(255,217,116,.2),rgba(11,42,32,.95))}
    h1{margin:0;font-size:clamp(42px,10vw,76px);line-height:.9}h2{margin:0 0 10px;font-size:24px}p{margin:0 0 10px;color:var(--muted);line-height:1.35}.pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.card{border:1px solid var(--line);border-radius:8px;padding:10px;background:rgba(0,0,0,.18);color:var(--text);text-decoration:none}.card span{display:block;color:var(--muted);font-weight:850;font-size:11px;text-transform:uppercase}.card strong{display:block;color:var(--gold);font-size:28px;line-height:1}.card small{color:var(--muted)}
    table{width:100%;border-collapse:collapse}td{border-top:1px solid var(--line);padding:8px;vertical-align:top}a{color:var(--mint);font-weight:850}button{border:1px solid rgba(117,239,180,.5);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:850;padding:8px;cursor:pointer}
    @media(max-width:760px){.cards{grid-template-columns:1fr 1fr}h1{font-size:42px}td{display:block;border-top:0;padding:4px 0}tr{display:block;border-top:1px solid var(--line);padding:8px 0}}
  </style>
</head>
<body><main>${body}</main><script>document.addEventListener("click",async e=>{const b=e.target.closest("button[data-copy]");if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copy)}catch{prompt("Copy this",b.dataset.copy)}})</script></body>
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
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function oneLine(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
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
