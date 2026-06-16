#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const OPERATOR_ACCOUNT = "david2015bestai@gmail.com";
const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const openclaw = await readJson(path.join(runtimeDir, "x-football-openclaw.json"), {});
const payload = buildPayload(openclaw);

await writeFile(path.join(runtimeDir, "x-reply-proof-helper.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "x-reply-proof-helper.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "x-reply-proof-helper.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "x-reply-proof-helper.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload(openclaw) {
  const workerPacks = Array.isArray(openclaw.workerPacks) ? openclaw.workerPacks : [];
  const helpers = WORKERS.map((worker) => {
    const pack = workerPacks.find((row) => row.worker === worker) ?? {};
    const first = Array.isArray(pack.actions) ? pack.actions[0] : null;
    return {
      worker,
      slug: slugify(worker),
      ok: Boolean(first),
      firstActionId: String(first?.id ?? ""),
      firstQuery: String(first?.query ?? ""),
      firstSearchUrl: String(first?.searchUrl ?? ""),
      proofCommandTemplate: proofCommandFor(worker, first?.query ?? "manual X football reply"),
    };
  });
  const failures = [
    helpers.some((helper) => !helper.ok) ? "One or more worker packs has no X reply action." : "",
    String(openclaw.schema ?? "") !== "worldcup26-x-football-openclaw-v1" ? "OpenClaw source JSON is missing or stale." : "",
  ].filter(Boolean);
  return {
    schema: "worldcup26-x-reply-proof-helper-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    ok: failures.length === 0,
    failures,
    state: failures.length === 0 ? "ready-for-real-x-proof" : "missing-openclaw-actions",
    operatorAccount: OPERATOR_ACCOUNT,
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    helpers,
    proofRule:
      "Use this only after a real manual X reply happened. Proof must be a public X reply URL, or a precise private note with account, target handle/tweet, and timestamp.",
  };
}

function proofCommandFor(worker, query) {
  return `node campaign-x-reply-log.mjs --worker "${worker}" --proof-url "<REAL_X_REPLY_URL_OR_PRIVATE_NOTE>" --target "<@handle or tweet URL>" --query "${escapeShellDouble(String(query))}" --timestamp-eest "<YYYY-MM-DD HH:mm EEST>"`;
}

function renderText(payload) {
  const lines = [
    `WorldCup26 X reply proof helper ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} account=${payload.operatorAccount}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `rule=${payload.proofRule}`,
    "",
    "helpers:",
  ];
  for (const helper of payload.helpers) {
    lines.push(`- ${helper.worker}: ${helper.ok ? "ready" : "missing-action"} first=${helper.firstActionId || "-"} query=${helper.firstQuery || "-"}`);
    lines.push(`  template=${helper.proofCommandTemplate}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 X Reply Proof Helper

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- X account: \`${payload.operatorAccount}\`
- Referral code: \`${payload.referralCode}\`

${payload.proofRule}

${payload.helpers.map((helper) => `## ${helper.worker}

- First action: \`${helper.firstActionId || "-"}\`
- Query: ${helper.firstQuery || "-"}
- Search: ${helper.firstSearchUrl || "-"}

\`\`\`bash
${helper.proofCommandTemplate}
\`\`\`
`).join("\n")}
`;
}

function renderHtml(payload) {
  const workerOptions = payload.helpers.map((helper) => `<option value="${escapeAttr(helper.worker)}">${escapeHtml(helper.worker)}</option>`).join("");
  const helperData = JSON.stringify(Object.fromEntries(payload.helpers.map((helper) => [helper.worker, helper])));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 X Reply Proof Helper</title>
  <style>
    :root{color-scheme:dark;--bg:#03140f;--panel:#0b2a20;--line:rgba(255,255,255,.15);--text:#f8fff9;--muted:#bad0c6;--gold:#ffd974;--mint:#74f0b2;--green:#0f7b5d;--danger:#ff7d6e}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 8% 0%,rgba(255,217,116,.22),transparent 24rem),radial-gradient(circle at 90% 6%,rgba(116,240,178,.15),transparent 26rem),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(860px,100%);margin:0 auto;padding:12px 10px 44px}section{border:1px solid var(--line);border-radius:10px;background:rgba(11,42,32,.94);padding:14px;margin-bottom:10px}.hero{border-color:rgba(255,217,116,.66);background:linear-gradient(135deg,rgba(255,217,116,.18),rgba(11,42,32,.96))}
    h1{margin:0 0 8px;font-size:clamp(38px,10vw,72px);line-height:.9}h2{margin:0 0 10px;font-size:22px}p{margin:0 0 8px;color:var(--muted);line-height:1.35}.pill{display:inline-flex;margin-bottom:10px;padding:7px 10px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--mint));color:#03140f;font-weight:950;text-transform:uppercase;font-size:12px}
    label{display:block;margin:10px 0 5px;color:var(--gold);font-weight:900}select,input,textarea{width:100%;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.26);color:var(--text);font:inherit;padding:10px}textarea{min-height:90px;resize:vertical}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.button,button{min-height:46px;border:1px solid rgba(116,240,178,.42);border-radius:8px;background:var(--green);color:#fff;font:inherit;font-weight:950;display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;padding:9px;cursor:pointer}.gold{background:var(--gold);color:#03140f;border-color:var(--gold)}
    pre{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--line);border-radius:8px;background:rgba(0,0,0,.25);padding:10px;line-height:1.35}.warn{border-color:rgba(255,125,110,.55);background:rgba(255,125,110,.10)}
    @media(max-width:760px){.grid{grid-template-columns:1fr}h1{font-size:42px}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <span class="pill">${escapeHtml(payload.state)}</span>
      <h1>X Proof Helper</h1>
      <p>After a real reply from <strong>${escapeHtml(payload.operatorAccount)}</strong>, paste the public X reply URL or a precise private note. This builds the logging command. It does not create proof by itself.</p>
    </section>
    <section>
      <label for="worker">Worker</label>
      <select id="worker">${workerOptions}</select>
      <div class="grid">
        <div>
          <label for="proof">Real X reply URL or private note</label>
          <textarea id="proof" placeholder="https://x.com/.../status/... or private-reply-note: replied to @handle at YYYY-MM-DD HH:mm EEST"></textarea>
        </div>
        <div>
          <label for="target">Target handle or tweet URL</label>
          <input id="target" placeholder="@handle or https://x.com/.../status/..." />
          <label for="time">Time</label>
          <input id="time" placeholder="YYYY-MM-DD HH:mm EEST" />
        </div>
      </div>
      <div class="grid" style="margin-top:10px">
        <button class="gold" id="build">Build command</button>
        <button id="copy">Copy command</button>
      </div>
    </section>
    <section>
      <h2>Command</h2>
      <pre id="command">Fill the fields above after a real reply.</pre>
    </section>
    <section class="warn">
      <h2>Proof Rule</h2>
      <p>${escapeHtml(payload.proofRule)}</p>
    </section>
  </main>
  <script>
    const helpers = ${helperData};
    const proof = document.getElementById("proof");
    const target = document.getElementById("target");
    const time = document.getElementById("time");
    const worker = document.getElementById("worker");
    const command = document.getElementById("command");
    function shell(value) {
      const tick = String.fromCharCode(96);
      return String(value || "").replaceAll('"', '\\\\"').replaceAll("$", "\\\\$").replaceAll(tick, "\\\\" + tick);
    }
    function buildCommand() {
      const row = helpers[worker.value] || helpers.Dexter;
      const proofValue = proof.value.trim();
      const targetValue = target.value.trim();
      const timeValue = time.value.trim();
      const query = row.firstQuery || "manual X football reply";
      command.textContent = \`node campaign-x-reply-log.mjs --worker "\${shell(worker.value)}" --proof-url "\${shell(proofValue || "<REAL_X_REPLY_URL_OR_PRIVATE_NOTE>")}" --target "\${shell(targetValue || "<@handle or tweet URL>")}" --query "\${shell(query)}" --timestamp-eest "\${shell(timeValue || "<YYYY-MM-DD HH:mm EEST>")}"\`;
    }
    document.getElementById("build").addEventListener("click", buildCommand);
    document.getElementById("copy").addEventListener("click", async () => {
      buildCommand();
      try {
        await navigator.clipboard.writeText(command.textContent);
      } catch {
        window.prompt("Copy this", command.textContent);
      }
    });
    buildCommand();
  </script>
</body>
</html>`;
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
