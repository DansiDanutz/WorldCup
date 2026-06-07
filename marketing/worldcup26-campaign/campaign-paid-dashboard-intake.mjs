#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const CHANNELS = [
  {
    key: "meta",
    platform: "Meta Ads Manager",
    managerUrl:
      "https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?act=61071192&ads_manager_write_regions=true&nav_entry_point=lep_176&selected_ad_ids=6971048413400&nav_source=unknown",
    landingUrl: `${REFERRAL_LINK}&utm_source=meta&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h`,
  },
  {
    key: "x",
    platform: "X Ads Manager",
    managerUrl: "https://ads.x.com/manager/18ce55rrs16/campaigns",
    landingUrl: `${REFERRAL_LINK}&utm_source=x&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h`,
  },
];
const HEADER = [
  "timestamp_eest",
  "owner",
  "platform",
  "manager_url",
  "landing_url",
  "status",
  "spend",
  "impressions",
  "clicks",
  "ctr",
  "warning",
  "screenshot_note",
  "next_action",
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const checksPath = path.join(runtimeDir, "paid-dashboard-checks.csv");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.add) {
  await appendCheck();
}

const rows = await readCsv(checksPath).catch(() => []);
const paidAdTriage = await readJson(path.join(runtimeDir, "paid-ad-triage.json"), {});
const payload = buildPayload({ rows, paidAdTriage });

await writeFile(path.join(runtimeDir, "paid-dashboard-checks.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "paid-dashboard-checks.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "paid-dashboard-checks.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "paid-dashboard-checks.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ rows, paidAdTriage }) {
  const normalized = rows.map(normalizeCheck).filter((row) => row.timestampEest);
  const latestChecks = latestBy(normalized, (row) => row.key);
  const counts = normalizePaidCounts(paidAdTriage);
  const totalSpend = sum(latestChecks, "spend");
  const totalImpressions = sum(latestChecks, "impressions");
  const totalClicks = sum(latestChecks, "clicks");
  const failures = [
    normalized.some((row) => !row.landingUrl.includes(`ref=${REFERRAL_CODE}`))
      ? "One or more paid dashboard checks used a landing URL without the referral code."
      : "",
    normalized.some((row) => row.key && !row.landingUrl.includes(`utm_source=${row.key}`))
      ? "One or more paid dashboard checks used a landing URL without the matching UTM source."
      : "",
  ].filter(Boolean);
  const state = determineState({ latestChecks, counts, totalImpressions, totalClicks });
  return {
    schema: "worldcup26-paid-dashboard-checks-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: failures.length === 0,
    failures,
    state,
    counts: {
      rows: normalized.length,
      latestChecks: latestChecks.length,
      totalSpend,
      totalImpressions,
      totalClicks,
      paidViews: counts.paidViews,
      appViews: counts.appViews,
      referralViews: counts.referralViews,
      signupSaves: counts.signupSaves,
      accepted: counts.accepted,
    },
    latestChecks,
    channels: CHANNELS.map((channel) => ({
      ...channel,
      latest: latestChecks.find((row) => row.key === channel.key) ?? null,
      intakeCommand: buildIntakeCommand(channel),
    })),
    rule:
      "Record only real dashboard observations. Use this to decide whether the paid problem is delivery, creative, tracking, or signup friction.",
  };
}

async function appendCheck() {
  const channel = channelFor(requiredArg("platform"));
  const impressions = numberArg("impressions");
  const clicks = numberArg("clicks");
  const ctr = args.ctr == null || args.ctr === "" ? computeCtr(impressions, clicks) : numberArg("ctr");
  const row = {
    timestamp_eest: args.timestampEest || formatEestLogTime(now),
    owner: args.owner || "Memo",
    platform: channel.platform,
    manager_url: args.managerUrl || channel.managerUrl,
    landing_url: args.landingUrl || channel.landingUrl,
    status: normalizeStatus(requiredArg("status")),
    spend: String(numberArg("spend")),
    impressions: String(impressions),
    clicks: String(clicks),
    ctr: String(ctr),
    warning: args.warning || "none",
    screenshot_note: requiredArg("screenshotNote"),
    next_action: args.nextAction || "",
  };
  const existing = await readCsv(checksPath).catch(() => []);
  await writeFile(checksPath, renderCsv([...existing, row]));
}

function determineState({ latestChecks, counts, totalImpressions, totalClicks }) {
  if (counts.signupSaves > 0 || counts.accepted > 0) return "paid-signup-detected";
  if (latestChecks.length === 0) return "needs-dashboard-check";
  if (latestChecks.length < CHANNELS.length) return "partial-dashboard-check";
  const blocked = latestChecks.find((row) =>
    ["paused", "rejected", "limited", "blocked", "not_found"].includes(row.status),
  );
  if (blocked) return "delivery-blocked";
  if (totalImpressions === 0) return "no-impressions";
  if (totalClicks === 0) return "impressions-no-clicks";
  if (counts.paidViews === 0) return "paid-clicks-not-reaching-app";
  if (counts.signupSaves === 0 && counts.accepted === 0) return "paid-clicks-no-signups";
  return "paid-dashboard-ok-watch";
}

function normalizeCheck(row) {
  const platform = String(row.platform ?? "").trim();
  const key = channelKey(platform);
  const impressions = Number(row.impressions ?? 0);
  const clicks = Number(row.clicks ?? 0);
  return {
    timestampEest: String(row.timestamp_eest ?? "").trim(),
    owner: String(row.owner ?? "").trim(),
    key,
    platform,
    managerUrl: String(row.manager_url ?? "").trim(),
    landingUrl: String(row.landing_url ?? "").trim(),
    status: normalizeStatus(row.status),
    spend: Number(row.spend ?? 0),
    impressions,
    clicks,
    ctr: row.ctr == null || row.ctr === "" ? computeCtr(impressions, clicks) : Number(row.ctr),
    warning: String(row.warning ?? "").trim(),
    screenshotNote: String(row.screenshot_note ?? "").trim(),
    nextAction: String(row.next_action ?? "").trim(),
  };
}

function normalizePaidCounts(paidAdTriage) {
  const counts = paidAdTriage.counts ?? {};
  return {
    paidViews: Number(paidAdTriage.paidViews ?? 0),
    appViews: Number(counts.appViews ?? 0),
    referralViews: Number(counts.referralViews ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    accepted: Number(counts.accepted ?? 0),
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 paid dashboard checks ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} rows=${payload.counts.rows} latest=${payload.counts.latestChecks} spend=${payload.counts.totalSpend} impressions=${payload.counts.totalImpressions} clicks=${payload.counts.totalClicks}`,
    `paid_views=${payload.counts.paidViews} app_views=${payload.counts.appViews} referral_views=${payload.counts.referralViews} signup_saves=${payload.counts.signupSaves} accepted=${payload.counts.accepted}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `rule=${payload.rule}`,
    "",
    "latest_checks:",
  ];
  for (const row of payload.latestChecks) {
    lines.push(`- ${row.platform} status=${row.status} spend=${row.spend} impressions=${row.impressions} clicks=${row.clicks} ctr=${row.ctr}`);
    lines.push(`  landing=${row.landingUrl}`);
    lines.push(`  warning=${row.warning || "none"}`);
    lines.push(`  screenshot=${row.screenshotNote || "-"}`);
    if (row.nextAction) lines.push(`  next=${row.nextAction}`);
  }
  lines.push("", "log_commands:");
  for (const channel of payload.channels) {
    lines.push(`- ${channel.platform}`);
    lines.push(`  ${channel.intakeCommand}`);
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Paid Dashboard Checks

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Checks: ${payload.counts.latestChecks}/${CHANNELS.length}
- Spend: ${payload.counts.totalSpend}
- Impressions: ${payload.counts.totalImpressions}
- Clicks: ${payload.counts.totalClicks}
- Paid-source views: ${payload.counts.paidViews}
- Signup saves: ${payload.counts.signupSaves}

${payload.rule}

## Latest Checks

${payload.latestChecks.map(renderCheckMarkdown).join("\n\n") || "No dashboard checks logged yet."}

## Log Commands

${payload.channels.map(renderChannelMarkdown).join("\n\n")}
`;
}

function renderCheckMarkdown(row) {
  return `### ${row.platform}

- Time: ${row.timestampEest}
- Status: ${row.status}
- Spend: ${row.spend}
- Impressions: ${row.impressions}
- Clicks: ${row.clicks}
- CTR: ${row.ctr}
- Landing: ${row.landingUrl}
- Warning: ${row.warning || "none"}
- Screenshot/note: ${row.screenshotNote || "-"}
- Next: ${row.nextAction || "-"}`;
}

function renderChannelMarkdown(channel) {
  return `### ${channel.platform}

- Manager: ${channel.managerUrl}
- Landing: ${channel.landingUrl}

\`\`\`bash
${channel.intakeCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Paid Dashboard Checks</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2a20; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --danger: #ff9f9f; --green: #0b7a59; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: radial-gradient(circle at 10% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 92% 0%, rgba(116,240,178,.15), transparent 24rem), var(--bg); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1040px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,42,32,.94); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 8vw, 64px); line-height: .92; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p, li { color: var(--muted); line-height: 1.4; }
    a { color: var(--gold); overflow-wrap: anywhere; }
    .state { display: inline-flex; color: #03140f; background: linear-gradient(135deg, var(--gold), var(--mint)); border-radius: 999px; padding: 7px 10px; font-weight: 950; text-transform: uppercase; }
    .grid, .stats { display: grid; gap: 10px; }
    .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 12px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 24px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; }
    button, .button { border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 9px 10px; font: inherit; font-weight: 900; text-decoration: none; cursor: pointer; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .form-grid { display: grid; gap: 8px; margin-top: 12px; }
    label { display: grid; gap: 4px; color: var(--muted); font-size: 12px; font-weight: 900; text-transform: uppercase; }
    input, select, textarea { width: 100%; border: 1px solid var(--line); border-radius: 8px; background: rgba(255,255,255,.08); color: var(--text); padding: 10px; font: inherit; text-transform: none; }
    textarea { min-height: 74px; resize: vertical; }
    .copy-state { color: var(--mint); min-height: 18px; font-size: 13px; }
    @media (min-width: 760px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .stats { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Paid Dashboard Checks</h1>
      <span class="state">${escapeHtml(payload.state)}</span>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="stats">
        <div class="stat"><span>Checks</span><strong>${payload.counts.latestChecks}/${CHANNELS.length}</strong></div>
        <div class="stat"><span>Spend</span><strong>${payload.counts.totalSpend}</strong></div>
        <div class="stat"><span>Impressions</span><strong>${payload.counts.totalImpressions}</strong></div>
        <div class="stat"><span>Clicks</span><strong>${payload.counts.totalClicks}</strong></div>
        <div class="stat"><span>Paid views</span><strong>${payload.counts.paidViews}</strong></div>
      </div>
    </header>
    <section class="grid">
      ${payload.channels.map(renderChannelHtml).join("")}
    </section>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      const buildButton = event.target.closest("[data-build-command]");
      if (!button && !buildButton) return;
      event.preventDefault();
      const value = buildButton ? buildCommand(buildButton.closest("[data-platform]")) : button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        const target = buildButton || button;
        const old = target.textContent;
        target.textContent = "Copied";
        setTimeout(() => { target.textContent = old; }, 1200);
      } catch {
        window.prompt("Copy this text", value);
      }
    });
    document.addEventListener("input", (event) => {
      const card = event.target.closest("[data-platform]");
      if (!card) return;
      const output = card.querySelector("[data-generated-command]");
      if (output) output.textContent = buildCommand(card);
    });
    function buildCommand(card) {
      if (!card) return "";
      const field = (name) => (card.querySelector('[data-field="' + name + '"]')?.value || "").trim();
      const impressions = Number(field("impressions") || 0);
      const clicks = Number(field("clicks") || 0);
      const ctr = field("ctr") || (impressions ? ((clicks / impressions) * 100).toFixed(2) : "0");
      return [
        "node campaign-paid-dashboard-intake.mjs --add",
        "--platform " + shellArg(card.dataset.platform || ""),
        "--status " + shellArg(field("status") || "active"),
        "--spend " + shellArg(field("spend") || "0"),
        "--impressions " + shellArg(String(impressions)),
        "--clicks " + shellArg(String(clicks)),
        "--ctr " + shellArg(String(ctr)),
        "--landing-url " + shellArg(card.dataset.landing || ""),
        "--warning " + shellArg(field("warning") || "none"),
        "--screenshot-note " + shellArg(field("screenshotNote") || "dashboard checked; screenshot/private note saved"),
        "--next-action " + shellArg(field("nextAction") || "keep/change/fix")
      ].join(" ");
    }
    function shellArg(value) {
      return '"' + String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
    }
  </script>
</body>
</html>`;
}

function renderChannelHtml(channel) {
  const latest = channel.latest;
  return `<article data-platform="${escapeAttr(channel.key)}" data-landing="${escapeAttr(channel.landingUrl)}">
    <h2>${escapeHtml(channel.platform)}</h2>
    <p><strong>Manager:</strong> <a href="${escapeAttr(channel.managerUrl)}" target="_blank" rel="noreferrer">${escapeHtml(channel.managerUrl)}</a></p>
    <p><strong>Landing:</strong> <a href="${escapeAttr(channel.landingUrl)}" target="_blank" rel="noreferrer">${escapeHtml(channel.landingUrl)}</a></p>
    ${
      latest
        ? `<p><strong>Latest:</strong> ${escapeHtml(latest.status)} / spend ${latest.spend} / impressions ${latest.impressions} / clicks ${latest.clicks} / CTR ${latest.ctr}</p><p>${escapeHtml(latest.warning || "No warning recorded.")}</p>`
        : "<p>No dashboard check logged yet.</p>"
    }
    <div class="actions">
      <a class="button" href="${escapeAttr(channel.managerUrl)}" target="_blank" rel="noreferrer">Open manager</a>
      <button data-copy="${escapeAttr(channel.intakeCommand)}">Copy log command</button>
    </div>
    <div class="form-grid">
      <label>Status
        <select data-field="status">
          <option value="active">active</option>
          <option value="scheduled">scheduled</option>
          <option value="paused">paused</option>
          <option value="rejected">rejected</option>
          <option value="limited">limited</option>
          <option value="blocked">blocked</option>
        </select>
      </label>
      <label>Spend <input data-field="spend" inputmode="decimal" value="0" /></label>
      <label>Impressions <input data-field="impressions" inputmode="numeric" value="0" /></label>
      <label>Clicks <input data-field="clicks" inputmode="numeric" value="0" /></label>
      <label>CTR <input data-field="ctr" inputmode="decimal" placeholder="auto" /></label>
      <label>Warning <input data-field="warning" value="none" /></label>
      <label>Screenshot/private note <textarea data-field="screenshotNote">${escapeHtml(channel.platform)} checked at YYYY-MM-DD HH:mm EEST; screenshot/private note saved; campaign/ad ids=&lt;ids&gt;</textarea></label>
      <label>Next action <input data-field="nextAction" value="keep/change/fix" /></label>
    </div>
    <div class="actions">
      <button data-build-command="1">Copy generated command</button>
      <span class="copy-state"></span>
    </div>
    <pre data-generated-command>${escapeHtml(channel.intakeCommand)}</pre>
    <pre>${escapeHtml(channel.intakeCommand)}</pre>
  </article>`;
}

function buildIntakeCommand(channel) {
  return [
    "node campaign-paid-dashboard-intake.mjs --add",
    `--platform ${shellQuote(channel.key)}`,
    '--status "active"',
    '--spend "0"',
    '--impressions "0"',
    '--clicks "0"',
    `--landing-url ${shellQuote(channel.landingUrl)}`,
    '--warning "none"',
    `--screenshot-note ${shellQuote(`${channel.platform} checked at YYYY-MM-DD HH:mm EEST; screenshot/private note saved; campaign/ad ids=<ids>`)}`,
    '--next-action "keep/change/fix"',
  ].join(" ");
}

function channelFor(value) {
  const normalized = channelKey(value);
  const channel = CHANNELS.find((row) => row.key === normalized);
  if (!channel) {
    throw new Error(`Unknown paid platform "${value}". Use meta or x.`);
  }
  return channel;
}

function channelKey(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (text === "meta" || text.includes("meta") || text.includes("facebook")) return "meta";
  if (text === "x" || text.includes("x ads") || text.includes("twitter")) return "x";
  return text;
}

function latestBy(rows, keyFor) {
  const byKey = new Map();
  for (const row of rows) {
    byKey.set(keyFor(row), row);
  }
  return [...byKey.values()];
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
}

function computeCtr(impressions, clicks) {
  if (!impressions) return 0;
  return Number(((clicks / impressions) * 100).toFixed(2));
}

function numberArg(name) {
  const raw = requiredArg(name);
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`--${name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)} must be a non-negative number.`);
  }
  return value;
}

function requiredArg(name) {
  const value = args[name];
  if (value == null || value === "") {
    throw new Error(`Missing required --${name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}.`);
  }
  return value;
}

function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readCsv(filePath) {
  return parseCsv(await readFile(filePath, "utf8"));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [header = [], ...data] = rows;
  return data
    .filter((values) => values.some((value) => String(value ?? "").trim().length > 0))
    .map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])));
}

function renderCsv(rows) {
  return `${HEADER.join(",")}\n${rows.map((row) => HEADER.map((key) => csvCell(row[key])).join(",")).join("\n")}\n`;
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "", add: false, help: false };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--add") parsed.add = true;
    else if (arg === "--root") parsed.root = String(rawArgs[++index] ?? "");
    else if (arg === "--now") parsed.now = String(rawArgs[++index] ?? "");
    else if (arg === "--timestamp-eest") parsed.timestampEest = String(rawArgs[++index] ?? "");
    else if (arg === "--owner") parsed.owner = String(rawArgs[++index] ?? "");
    else if (arg === "--platform") parsed.platform = String(rawArgs[++index] ?? "");
    else if (arg === "--manager-url") parsed.managerUrl = String(rawArgs[++index] ?? "");
    else if (arg === "--landing-url") parsed.landingUrl = String(rawArgs[++index] ?? "");
    else if (arg === "--status") parsed.status = String(rawArgs[++index] ?? "");
    else if (arg === "--spend") parsed.spend = String(rawArgs[++index] ?? "");
    else if (arg === "--impressions") parsed.impressions = String(rawArgs[++index] ?? "");
    else if (arg === "--clicks") parsed.clicks = String(rawArgs[++index] ?? "");
    else if (arg === "--ctr") parsed.ctr = String(rawArgs[++index] ?? "");
    else if (arg === "--warning") parsed.warning = String(rawArgs[++index] ?? "");
    else if (arg === "--screenshot-note") parsed.screenshotNote = String(rawArgs[++index] ?? "");
    else if (arg === "--next-action") parsed.nextAction = String(rawArgs[++index] ?? "");
  }
  return parsed;
}

function printHelp() {
  process.stdout.write(`WorldCup26 paid dashboard intake

Usage:
  node campaign-paid-dashboard-intake.mjs --add --platform meta --status active --spend 0 --impressions 0 --clicks 0 --screenshot-note "Meta checked; screenshot saved"
  node campaign-paid-dashboard-intake.mjs --add --platform x --status active --spend 0 --impressions 0 --clicks 0 --screenshot-note "X checked; screenshot saved"

Writes:
  runtime/paid-dashboard-checks.json
  runtime/paid-dashboard-checks.txt
  runtime/paid-dashboard-checks.md
  runtime/paid-dashboard-checks.html
`);
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

function shellQuote(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
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
