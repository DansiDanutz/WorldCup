#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const BASE_VARIANTS = [
  {
    id: "free-private-score",
    owner: "Memo",
    angle: "Free private score preview",
    headline: "Pick 3 teams free",
    primaryText:
      "Most World Cup predictions are too complicated. Pick 3 teams free first and watch your private score move during the tournament.",
    description: "Ticket only if you later want the paid leaderboard.",
    cta: "Sign up",
    asset: "media/worldcup26-referral-16x9.jpg",
  },
  {
    id: "three-team-question",
    owner: "Dexter",
    angle: "Direct football question",
    headline: "Which 3 teams would you take?",
    primaryText:
      "WorldCup26 is simple: choose 3 national teams, follow their points, and compare your picks. Free pick preview is open now.",
    description: "Use invite code 26BC4B90CB.",
    cta: "Sign up",
    asset: "media/worldcup26-referral-square.jpg",
  },
  {
    id: "forty-eight-open",
    owner: "Sienna",
    angle: "48 teams still open",
    headline: "48 teams. Pick only 3.",
    primaryText:
      "Before the World Cup starts, lock in your 3-team prediction for free. See what your points would do before deciding about the paid leaderboard.",
    description: "Referral code 26BC4B90CB is already applied.",
    cta: "Sign up",
    asset: "media/worldcup26-referral-story.jpg",
  },
  {
    id: "one-minute-picks",
    owner: "Nano",
    angle: "Fast mobile action",
    headline: "Make your picks in 60 seconds",
    primaryText:
      "No bracket, no spreadsheet. Pick 3 World Cup teams free first, then follow your private points preview match by match.",
    description: "Join with code 26BC4B90CB.",
    cta: "Sign up",
    asset: "media/worldcup26-main-video-vertical.mp4",
  },
];

const CHANNELS = [
  {
    key: "meta",
    platform: "Meta Ads Manager",
    managerUrl:
      "https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?act=61071192&ads_manager_write_regions=true&nav_entry_point=lep_176&selected_ad_ids=6971048413400&nav_source=unknown",
  },
  {
    key: "x",
    platform: "X Ads Manager",
    managerUrl: "https://ads.x.com/manager/18ce55rrs16/campaigns",
  },
];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const paidDashboard = await readJson(path.join(runtimeDir, "paid-dashboard-checks.json"), {});
const paidTriage = await readJson(path.join(runtimeDir, "paid-ad-triage.json"), {});
const payload = buildPayload({ paidDashboard, paidTriage });

await writeFile(path.join(runtimeDir, "paid-no-click-rescue.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "paid-no-click-rescue.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "paid-no-click-rescue.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "paid-no-click-rescue.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ paidDashboard, paidTriage }) {
  const dashboardState = String(paidDashboard.state ?? paidTriage.dashboard?.state ?? "");
  const triageState = String(paidTriage.state ?? "");
  const counts = {
    dashboardChecks: Number(paidDashboard.counts?.latestChecks ?? 0),
    impressions: Number(paidDashboard.counts?.totalImpressions ?? paidTriage.dashboard?.totalImpressions ?? 0),
    clicks: Number(paidDashboard.counts?.totalClicks ?? paidTriage.dashboard?.totalClicks ?? 0),
    paidViews: Number(paidDashboard.counts?.paidViews ?? paidTriage.paidViews ?? 0),
    appViews: Number(paidDashboard.counts?.appViews ?? paidTriage.counts?.appViews ?? 0),
    signupSaves: Number(paidDashboard.counts?.signupSaves ?? paidTriage.counts?.signupSaves ?? 0),
  };
  const state = determineState({ dashboardState, triageState, counts });
  const variants = CHANNELS.flatMap((channel) =>
    BASE_VARIANTS.map((variant, index) => ({
      ...variant,
      channelKey: channel.key,
      platform: channel.platform,
      managerUrl: channel.managerUrl,
      landingUrl: buildLandingUrl(channel.key, variant.id),
      priority: `${channel.key.toUpperCase()}-${index + 1}`,
      copy: renderVariantCopy(variant, channel.key),
      dashboardCommand: buildDashboardCommand(channel, variant),
    })),
  );
  const failures = [
    variants.length < 8 ? "Expected at least 8 no-click rescue variants." : "",
    variants.some((variant) => !variant.landingUrl.includes(`ref=${REFERRAL_CODE}`))
      ? "A rescue landing URL is missing the referral code."
      : "",
    variants.some((variant) => !variant.copy.includes(REFERRAL_CODE))
      ? "A rescue copy block is missing the referral code."
      : "",
  ].filter(Boolean);
  return {
    schema: "worldcup26-paid-no-click-rescue-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: failures.length === 0,
    failures,
    state,
    dashboardState,
    triageState,
    counts,
    variantCount: variants.length,
    channels: CHANNELS.map((channel) => ({
      ...channel,
      variants: variants.filter((variant) => variant.channelKey === channel.key).map((variant) => variant.priority),
    })),
    variants,
    rule:
      "Use this only after a real dashboard check shows no clicks, rejected/limited delivery, or review limbo. It is a creative rescue packet, not proof of ad delivery.",
  };
}

function determineState({ dashboardState, triageState, counts }) {
  if (counts.signupSaves > 0) return "paid-signup-detected";
  if (counts.clicks > 0 && counts.signupSaves === 0) return "clicks-no-signups";
  if (dashboardState === "impressions-no-clicks" || triageState === "critical-ad-creative-no-clicks") return "rescue-ready";
  if (dashboardState === "delivery-blocked" || triageState.includes("blocked")) return "rescue-after-delivery-fix";
  if (counts.impressions === 0) return "needs-delivery-first";
  return "watch";
}

function buildLandingUrl(source, content) {
  return `${REFERRAL_LINK}&utm_source=${encodeURIComponent(source)}&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h&utm_content=${encodeURIComponent(content)}`;
}

function renderVariantCopy(variant, source) {
  return [
    variant.primaryText,
    "",
    `Invite code: ${REFERRAL_CODE}`,
    buildLandingUrl(source, variant.id),
  ].join("\n");
}

function buildDashboardCommand(channel, variant) {
  return [
    "node campaign-paid-dashboard-intake.mjs --add",
    `--platform ${shellQuote(channel.key)}`,
    '--status "active"',
    '--spend "0"',
    '--impressions "0"',
    '--clicks "0"',
    `--landing-url ${shellQuote(buildLandingUrl(channel.key, variant.id))}`,
    `--warning ${shellQuote(`rescue variant ${variant.id} launched or prepared; replace with real dashboard warning`)}`,
    `--screenshot-note ${shellQuote(`${channel.platform} no-click rescue ${variant.id} checked at YYYY-MM-DD HH:mm EEST; screenshot/private note saved`)}`,
    '--next-action "watch CTR for 60-120 minutes; kill if impressions continue with zero clicks"',
  ].join(" ");
}

function renderText(payload) {
  const lines = [
    `WorldCup26 paid no-click rescue ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} dashboard=${payload.dashboardState || "-"} triage=${payload.triageState || "-"} variants=${payload.variantCount}`,
    `impressions=${payload.counts.impressions} clicks=${payload.counts.clicks} paid_views=${payload.counts.paidViews} app_views=${payload.counts.appViews} signup_saves=${payload.counts.signupSaves}`,
    `rule=${payload.rule}`,
    "",
  ];
  for (const variant of payload.variants) {
    lines.push(
      `${variant.priority} ${variant.platform} / ${variant.angle}`,
      `headline=${variant.headline}`,
      `description=${variant.description}`,
      `asset=${variant.asset}`,
      `landing=${variant.landingUrl}`,
      `manager=${variant.managerUrl}`,
      `copy=${variant.copy}`,
      `log_after_real_dashboard_check=${variant.dashboardCommand}`,
      "",
    );
  }
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Paid No-Click Rescue

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Dashboard state: \`${payload.dashboardState || "-"}\`
- Triage state: \`${payload.triageState || "-"}\`
- Impressions: ${payload.counts.impressions}
- Clicks: ${payload.counts.clicks}
- Paid-source views: ${payload.counts.paidViews}
- Signup saves: ${payload.counts.signupSaves}
- Variants: ${payload.variantCount}

${payload.rule}

${payload.variants.map(renderVariantMarkdown).join("\n\n")}
`;
}

function renderVariantMarkdown(variant) {
  return `## ${variant.priority} ${variant.platform} / ${variant.angle}

- Headline: ${variant.headline}
- Description: ${variant.description}
- CTA: ${variant.cta}
- Asset: \`${variant.asset}\`
- Manager: ${variant.managerUrl}
- Landing URL: ${variant.landingUrl}

\`\`\`text
${variant.copy}
\`\`\`

\`\`\`bash
${variant.dashboardCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Paid No-Click Rescue</title>
  <style>
    :root { color-scheme: dark; --bg:#041510; --panel:#0d3126; --line:rgba(255,255,255,.16); --text:#f7fff9; --muted:#bfd5cc; --gold:#ffd66b; --green:#71efad; --red:#ff8f8f; }
    * { box-sizing:border-box; }
    body { margin:0; font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color:var(--text); background:radial-gradient(circle at 10% 0%, rgba(255,214,107,.18), transparent 22rem), radial-gradient(circle at 100% 0%, rgba(113,239,173,.15), transparent 26rem), var(--bg); }
    main { width:min(1040px, 100%); margin:0 auto; padding:16px 10px 48px; }
    header, article { border:1px solid var(--line); border-radius:10px; background:rgba(13,49,38,.92); padding:14px; margin-bottom:10px; }
    h1 { margin:0 0 8px; font-size:clamp(34px, 7vw, 68px); line-height:.92; }
    h2 { margin:0 0 8px; font-size:22px; }
    p, li { color:var(--muted); line-height:1.45; }
    a { color:var(--gold); overflow-wrap:anywhere; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:10px; }
    .pill { display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:5px 8px; margin:0 6px 6px 0; color:var(--muted); }
    pre { white-space:pre-wrap; overflow-wrap:anywhere; border:1px solid var(--line); border-radius:8px; background:rgba(0,0,0,.28); padding:10px; }
    button, .button { border:1px solid var(--line); border-radius:8px; color:#03140f; background:linear-gradient(135deg, var(--gold), var(--green)); font-weight:950; padding:10px 12px; text-decoration:none; cursor:pointer; display:inline-flex; min-height:42px; align-items:center; justify-content:center; }
    .actions { display:flex; flex-wrap:wrap; gap:8px; margin:10px 0; }
    .copy-state { color:var(--green); min-height:18px; font-size:13px; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Paid No-Click Rescue</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <span class="pill">state ${escapeHtml(payload.state)}</span>
      <span class="pill">impressions ${payload.counts.impressions}</span>
      <span class="pill">clicks ${payload.counts.clicks}</span>
      <span class="pill">variants ${payload.variantCount}</span>
    </header>
    <div class="grid">${payload.variants.map(renderVariantHtml).join("")}</div>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const target = document.querySelector(button.getAttribute("data-copy"));
      if (!target) return;
      await navigator.clipboard.writeText(target.textContent.trim());
      const state = button.parentElement.querySelector(".copy-state");
      if (state) state.textContent = "Copied";
      setTimeout(() => { if (state) state.textContent = ""; }, 1600);
    });
  </script>
</body>
</html>`;
}

function renderVariantHtml(variant) {
  const copyId = `copy-${variant.priority}`;
  const commandId = `command-${variant.priority}`;
  return `<article>
    <h2>${escapeHtml(variant.priority)} ${escapeHtml(variant.angle)}</h2>
    <p><strong>${escapeHtml(variant.headline)}</strong></p>
    <p>${escapeHtml(variant.description)}</p>
    <p>Asset: <code>${escapeHtml(variant.asset)}</code></p>
    <p><a href="${escapeAttr(variant.managerUrl)}">Open manager</a></p>
    <p><a href="${escapeAttr(variant.landingUrl)}">Open landing</a></p>
    <div class="actions">
      <button type="button" data-copy="#${copyId}">Copy ad copy</button>
      <button type="button" data-copy="#${commandId}">Copy dashboard log</button>
      <span class="copy-state"></span>
    </div>
    <pre id="${copyId}">${escapeHtml(variant.copy)}</pre>
    <pre id="${commandId}">${escapeHtml(variant.dashboardCommand)}</pre>
  </article>`;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

function formatEestLogTime(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} +0300`;
}

function shellQuote(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
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

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = String(rawArgs[++index] ?? "");
    else if (arg === "--now") parsed.now = String(rawArgs[++index] ?? "");
  }
  return parsed;
}
