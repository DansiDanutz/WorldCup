#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const PAID_CHANNELS = [
  {
    key: "meta",
    owner: "Memo",
    platform: "Meta Ads Manager",
    managerUrl:
      "https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?act=61071192&ads_manager_write_regions=true&nav_entry_point=lep_176&selected_ad_ids=6971048413400&nav_source=unknown",
    landingUrl: `${REFERRAL_LINK}&utm_source=meta&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h&utm_content=triage`,
    checks: [
      "Campaign, ad set, and ad are active or scheduled.",
      "Landing URL includes ref=26BC4B90CB and utm_source=meta.",
      "Creative text leads with free 3-team picks and private points preview.",
      "Dashboard shows impressions, clicks, spend, CTR, delivery status, and rejection warnings.",
    ],
  },
  {
    key: "x",
    owner: "Memo",
    platform: "X Ads Manager",
    managerUrl: "https://ads.x.com/manager/18ce55rrs16/campaigns",
    landingUrl: `${REFERRAL_LINK}&utm_source=x&utm_medium=paid-social&utm_campaign=worldcup26_referral_72h&utm_content=triage`,
    checks: [
      "Campaign exists inside account 18ce55rrs16.",
      "Campaign, ad group, and ad are active or scheduled.",
      "Landing URL includes ref=26BC4B90CB and utm_source=x.",
      "Dashboard shows impressions, clicks, spend, CTR, delivery status, and rejection warnings.",
    ],
  },
];
const PAID_SOURCE_KEYS = new Set([
  "meta",
  "facebook",
  "fb",
  "instagram",
  "ig",
  "an",
  "audience_network",
  "audience-network",
  "messenger",
  "x",
  "twitter",
  "tiktok",
  "tt",
]);
const PAID_MEDIUM_KEYS = new Set(["paid", "paid-social", "paid_social", "cpc", "ads", "ad"]);
const KNOWN_PAID_CAMPAIGNS = new Set(["6971048256000", "worldcup26_referral_72h"]);

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const referralActivity = await readJson(path.join(runtimeDir, "referral-activity.json"), {});
const paidTraffic = await readJson(path.join(runtimeDir, "paid-traffic-guard.json"), {});
const adOps = await readJson(path.join(runtimeDir, "ad-ops-links.json"), {});
const paidDashboard = await readJson(path.join(runtimeDir, "paid-dashboard-checks.json"), {});
const payload = buildPayload({ referralActivity, paidTraffic, adOps, paidDashboard });

await writeFile(path.join(runtimeDir, "paid-ad-triage.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "paid-ad-triage.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "paid-ad-triage.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "paid-ad-triage.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({ referralActivity, paidTraffic, adOps, paidDashboard }) {
  const counts = normalizeCounts(referralActivity?.counts, referralActivity?.viewCounts);
  const topSource = normalizeText(referralActivity?.topSource?.source);
  const topSignupSource = normalizeText(referralActivity?.topSignupSource?.source);
  const sourceBreakdown = normalizeBreakdown(
    referralActivity?.allSourceBreakdown ?? referralActivity?.sourceBreakdown,
  );
  const paidSources = sourceBreakdown.filter(isPaidTrafficRow);
  const paidViews = paidSources.reduce((sum, row) => sum + row.views, 0);
  const dashboard = normalizeDashboard(paidDashboard);
  const state = determineState({ counts, paidViews, dashboard });
  const adOpsChannels = Array.isArray(adOps?.channels) ? adOps.channels : [];
  const guardUrls = Array.isArray(paidTraffic?.checkedUrls) ? paidTraffic.checkedUrls : [];
  const channels = PAID_CHANNELS.map((channel) => {
    const adOpsChannel = adOpsChannels.find((row) => normalizeText(row.key) === channel.key) ?? {};
    const guardUrl = guardUrls.find((row) => normalizeText(row.key) === channel.key) ?? {};
    const managerUrl = normalizeText(adOpsChannel.managerUrl) || channel.managerUrl;
    const landingUrl = normalizeText(adOpsChannel.campaignUrl) || channel.landingUrl;
    return {
      ...channel,
      managerUrl,
      landingUrl,
      guardStatus: Boolean(guardUrl.ok),
      dashboardProofCommand: buildProofCommand({ ...channel, managerUrl, landingUrl }),
      decisionRules: buildDecisionRules(channel),
      latestDashboardCheck: dashboard.latestChecks.find((row) => row.key === channel.key) ?? null,
    };
  });
  const failures = [
    channels.length !== 2 ? "Expected Meta and X paid channels." : "",
    channels.some((channel) => !channel.managerUrl || !channel.landingUrl)
      ? "A paid channel is missing manager or landing URL."
      : "",
    channels.some((channel) => !channel.landingUrl.includes(`ref=${REFERRAL_CODE}`))
      ? "A paid landing URL is missing the referral code."
      : "",
  ].filter(Boolean);

  return {
    schema: "worldcup26-paid-ad-triage-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: failures.length === 0,
    failures,
    state,
    counts,
    paidViews,
    paidSources,
    dashboard,
    topSource: topSource || "-",
    topSignupSource: topSignupSource || "-",
    channels,
    rule:
      "This is an operator triage page. It proves paid delivery only after Memo records real dashboard status, spend, impressions, clicks, landing URL, and screenshot/note details.",
  };
}

function determineState({ counts, paidViews, dashboard }) {
  if (!counts.available) return "needs-local-service-role";
  if (counts.signupSaves > 0 || counts.accepted > 0) return "referral-signup-detected";
  if (dashboard.state === "needs-dashboard-check") return "critical-dashboard-check-missing";
  if (dashboard.state === "partial-dashboard-check") return "critical-partial-dashboard-check";
  if (dashboard.state === "delivery-blocked") return "critical-ad-delivery-blocked";
  if (dashboard.state === "no-impressions") return "critical-no-paid-impressions";
  if (dashboard.state === "impressions-no-clicks") return "critical-ad-creative-no-clicks";
  if (dashboard.state === "paid-clicks-not-reaching-app") return "critical-paid-click-tracking-gap";
  if (dashboard.state === "paid-clicks-no-signups") return "critical-paid-signup-friction";
  if (paidViews > 0) return "paid-clicks-reaching-app";
  if (counts.appViews > 0) return "critical-no-paid-source-views";
  return "critical-zero-paid-clicks";
}

function buildProofCommand(channel) {
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

function buildDecisionRules(channel) {
  return [
    `No impressions: check budget, schedule, audience, approval status, and whether ${channel.platform} is paused.`,
    "Impressions but zero clicks: change hook/creative toward 'Pick 3 teams free first' and try a stronger football question.",
    "Clicks but no app views with this UTM source: landing URL is wrong, redirecting, blocked, or ad link tracking stripped.",
    "Clicks and app views but no signup saves: signup screen or Google auth friction is the next conversion problem.",
    "Rejected or limited delivery: fix the dashboard warning before adding more creative variants.",
  ];
}

function renderText(payload) {
  const lines = [
    `WorldCup26 paid ad triage ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} code=${payload.referralCode}`,
    `app_views=${payload.counts.appViews} referral_views=${payload.counts.referralViews} paid_views=${payload.paidViews} signup_saves=${payload.counts.signupSaves} accepted=${payload.counts.accepted}`,
    payload.paidSources.length
      ? `paid_sources=${payload.paidSources.map((row) => `${row.source}:${row.views}`).join(",")}`
      : "paid_sources=-",
    `dashboard_state=${payload.dashboard.state} dashboard_checks=${payload.dashboard.latestChecks.length} dashboard_impressions=${payload.dashboard.totalImpressions} dashboard_clicks=${payload.dashboard.totalClicks} dashboard_spend=${payload.dashboard.totalSpend}`,
    `top_source=${payload.topSource} top_signup_source=${payload.topSignupSource}`,
    `rule=${payload.rule}`,
    "",
  ];
  for (const channel of payload.channels) {
    lines.push(
      `${channel.platform}`,
      `manager=${channel.managerUrl}`,
      `landing=${channel.landingUrl}`,
      `guard=${channel.guardStatus ? "ok" : "unknown"}`,
      "checklist:",
      ...channel.checks.map((check) => `- ${check}`),
      "decision_rules:",
      ...channel.decisionRules.map((rule) => `- ${rule}`),
      "log_after_dashboard_check:",
      channel.dashboardProofCommand,
      "",
    );
  }
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Paid Ad Triage

Generated: ${payload.generatedAtEest}

- State: \`${payload.state}\`
- Referral code: \`${payload.referralCode}\`
- App views: ${payload.counts.appViews}
- Referral views: ${payload.counts.referralViews}
- Paid-source views: ${payload.paidViews}
- Signup saves: ${payload.counts.signupSaves}
- Accepted referrals: ${payload.counts.accepted}
- Dashboard state: \`${payload.dashboard.state}\`
- Dashboard checks: ${payload.dashboard.latestChecks.length}
- Dashboard impressions: ${payload.dashboard.totalImpressions}
- Dashboard clicks: ${payload.dashboard.totalClicks}
- Dashboard spend: ${payload.dashboard.totalSpend}
- Top source: ${payload.topSource}
- Top signup source: ${payload.topSignupSource}

${payload.rule}

${payload.channels.map(renderChannelMarkdown).join("\n\n")}
`;
}

function renderChannelMarkdown(channel) {
  return `## ${channel.platform}

- Manager: ${channel.managerUrl}
- Landing URL: ${channel.landingUrl}
- Landing guard: ${channel.guardStatus ? "ok" : "unknown"}

${channel.checks.map((check) => `- ${check}`).join("\n")}

### Decision Rules

${channel.decisionRules.map((rule) => `- ${rule}`).join("\n")}

\`\`\`bash
${channel.dashboardProofCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Paid Ad Triage</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2c22; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bed3ca; --gold: #ffd974; --mint: #74f0b2; --red: #ffb4a8; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: radial-gradient(circle at 12% 0%, rgba(255,217,116,.22), transparent 22rem), radial-gradient(circle at 100% 0%, rgba(116,240,178,.16), transparent 24rem), var(--bg); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1040px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, section { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,44,34,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 7vw, 62px); line-height: .92; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p, li { color: var(--muted); line-height: 1.45; }
    a { color: var(--gold); overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.28); padding: 10px; }
    button, .button { border: 1px solid var(--line); border-radius: 8px; color: #03140f; background: linear-gradient(135deg, var(--gold), var(--mint)); font-weight: 950; padding: 10px 12px; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; min-height: 42px; }
    .secondary { color: var(--text); background: rgba(255,255,255,.08); }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .stats { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 12px; font-weight: 850; text-transform: uppercase; }
    .stat strong { display: block; color: var(--gold); font-size: 26px; line-height: 1; margin-top: 6px; }
    .state { display: inline-block; border-radius: 999px; padding: 7px 10px; color: #03140f; background: linear-gradient(135deg, var(--red), var(--gold)); font-weight: 950; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .copy-state { color: var(--mint); min-height: 18px; font-size: 13px; }
    @media (max-width: 760px) { .grid, .stats { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Paid Ad Triage</h1>
      <span class="state">${escapeHtml(payload.state)}</span>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="stats">
        <div class="stat"><span>App views</span><strong>${payload.counts.appViews}</strong></div>
        <div class="stat"><span>Referral views</span><strong>${payload.counts.referralViews}</strong></div>
        <div class="stat"><span>Paid views</span><strong>${payload.paidViews}</strong></div>
        <div class="stat"><span>Signup saves</span><strong>${payload.counts.signupSaves}</strong></div>
        <div class="stat"><span>Dashboard</span><strong>${payload.dashboard.state}</strong></div>
        <div class="stat"><span>Ad clicks</span><strong>${payload.dashboard.totalClicks}</strong></div>
      </div>
    </header>
    <div class="grid">
      ${payload.channels.map(renderChannelHtml).join("\n")}
    </div>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      await navigator.clipboard.writeText(button.getAttribute("data-copy"));
      const state = button.parentElement.querySelector(".copy-state");
      if (state) state.textContent = "Copied";
      setTimeout(() => { if (state) state.textContent = ""; }, 1600);
    });
  </script>
</body>
</html>`;
}

function renderChannelHtml(channel) {
  return `<section>
    <h2>${escapeHtml(channel.platform)}</h2>
    <p><strong>Manager</strong>: <a href="${escapeAttr(channel.managerUrl)}" target="_blank" rel="noreferrer">${escapeHtml(channel.managerUrl)}</a></p>
    <p><strong>Landing</strong>: <a href="${escapeAttr(channel.landingUrl)}" target="_blank" rel="noreferrer">${escapeHtml(channel.landingUrl)}</a></p>
    ${channel.latestDashboardCheck ? `<p><strong>Dashboard check</strong>: ${escapeHtml(channel.latestDashboardCheck.status)} / impressions ${channel.latestDashboardCheck.impressions} / clicks ${channel.latestDashboardCheck.clicks} / spend ${channel.latestDashboardCheck.spend}</p>` : "<p><strong>Dashboard check</strong>: not logged yet</p>"}
    <ul>${channel.checks.map((check) => `<li>${escapeHtml(check)}</li>`).join("")}</ul>
    <h3>Decision Rules</h3>
    <ul>${channel.decisionRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ul>
    <div class="actions">
      <a class="button" href="${escapeAttr(channel.managerUrl)}" target="_blank" rel="noreferrer">Open manager</a>
      <button class="secondary" data-copy="${escapeAttr(channel.landingUrl)}">Copy landing</button>
      <button data-copy="${escapeAttr(channel.dashboardProofCommand)}">Copy proof command</button>
      <div class="copy-state"></div>
    </div>
    <pre>${escapeHtml(channel.dashboardProofCommand)}</pre>
  </section>`;
}

function normalizeDashboard(row) {
  const counts = row.counts ?? {};
  const latestChecks = Array.isArray(row.latestChecks)
    ? row.latestChecks.map((check) => ({
        key: normalizeText(check.key),
        platform: normalizeText(check.platform),
        status: normalizeText(check.status),
        spend: Number(check.spend ?? 0),
        impressions: Number(check.impressions ?? 0),
        clicks: Number(check.clicks ?? 0),
        ctr: Number(check.ctr ?? 0),
        landingUrl: normalizeText(check.landingUrl),
        warning: normalizeText(check.warning),
        screenshotNote: normalizeText(check.screenshotNote),
        nextAction: normalizeText(check.nextAction),
      }))
    : [];
  return {
    ok: Boolean(row.ok),
    state: normalizeText(row.state) || "needs-dashboard-check",
    latestChecks,
    totalSpend: Number(counts.totalSpend ?? 0),
    totalImpressions: Number(counts.totalImpressions ?? 0),
    totalClicks: Number(counts.totalClicks ?? 0),
  };
}

function normalizeCounts(counts, viewCounts = {}) {
  return {
    available: Boolean(counts) || Boolean(viewCounts),
    appViews: Number(viewCounts?.appViews ?? counts?.appViews?.total ?? 0),
    referralViews: Number(viewCounts?.referralViews ?? counts?.appViews?.referralTotal ?? 0),
    signupSaves: Number(counts?.signupReferralSaves ?? counts?.signupSaves?.total ?? 0),
    accepted: Number(counts?.acceptedReferrals ?? counts?.accepted?.total ?? 0),
    entries: Number(counts?.referredEntries ?? counts?.entries?.total ?? 0),
  };
}

function normalizeBreakdown(value) {
  return (Array.isArray(value) ? value : [])
    .map((row) => ({
      source: normalizeText(row.source),
      medium: normalizeText(row.medium),
      campaign: normalizeText(row.campaign),
      content: normalizeText(row.content),
      views: Number(row.views ?? row.count ?? 0),
    }))
    .filter((row) => row.source);
}

function isPaidTrafficRow(row) {
  const source = normalizeTrafficToken(row.source);
  const medium = normalizeTrafficToken(row.medium);
  const campaign = normalizeTrafficToken(row.campaign);
  return PAID_SOURCE_KEYS.has(source) || PAID_MEDIUM_KEYS.has(medium) || KNOWN_PAID_CAMPAIGNS.has(campaign);
}

function normalizeTrafficToken(value) {
  return normalizeText(value).toLowerCase();
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
    else if (arg === "--root") parsed.root = String(rawArgs[++index] ?? "");
    else if (arg === "--now") parsed.now = String(rawArgs[++index] ?? "");
  }
  return parsed;
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

function normalizeText(value) {
  return String(value ?? "").trim();
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
