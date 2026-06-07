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

const state = {
  proofAudit: await readJson(path.join(runtimeDir, "proof-audit.json"), {}),
  publicAttempts: await readJson(path.join(runtimeDir, "public-channel-attempts.json"), {}),
  socialRescue: await readJson(path.join(runtimeDir, "social-rescue-pack.json"), {}),
  zeroSignupRescue: await readJson(path.join(runtimeDir, "zero-signup-rescue.json"), {}),
  workerWake: await readJson(path.join(runtimeDir, "worker-wake-board.json"), {}),
  objectiveAudit: await readJson(path.join(runtimeDir, "objective-audit.json"), {}),
  paidAdTriage: await readJson(path.join(runtimeDir, "paid-ad-triage.json"), {}),
};

const payload = buildPayload(state);

await writeFile(path.join(runtimeDir, "operator-push-packet.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "operator-push-packet.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "operator-push-packet.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "operator-push-packet.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload(state) {
  const limit = Number(args.limit || 4);
  const warmContactActions = shouldUseWarmContactActions(state)
    ? normalizeWarmContactActions(state.workerWake).slice(0, limit)
    : [];
  const socialActions = Array.isArray(state.socialRescue.actions)
    ? state.socialRescue.actions.slice(0, Number(args.limit || 4)).map(normalizeAction)
    : [];
  const zeroSignupActions = shouldUseZeroSignupRescue(state)
    ? normalizeZeroSignupActions(state.zeroSignupRescue).slice(0, limit)
    : [];
  const actions =
    warmContactActions.length > 0
      ? warmContactActions
      : zeroSignupActions.length > 0
        ? zeroSignupActions
        : socialActions;
  const first = actions[0] ?? null;
  const blockers = Array.isArray(state.publicAttempts.latestAttempts)
    ? state.publicAttempts.latestAttempts
        .filter((row) => ["blocked", "login_required", "approval_required"].includes(String(row.status ?? "")))
        .slice(0, 4)
        .map(normalizeBlocker)
    : [];
  const paidDashboardChecks = Array.isArray(state.paidAdTriage.channels)
    ? state.paidAdTriage.channels.map(normalizePaidDashboardCheck)
    : [];

  return {
    schema: "worldcup26-operator-push-packet-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: actions.length > 0 && actions.every((action) => action.proofCommand && action.copy && action.trackedLink),
    state: state.objectiveAudit.state || state.proofAudit.proofState || "missing",
    actionMode:
      warmContactActions.length > 0
        ? "warm-contact-sprint"
        : zeroSignupActions.length > 0
          ? "zero-signup-rescue"
          : "social-rescue",
    complete: Boolean(state.objectiveAudit.complete),
    latestExternalProofAge: state.proofAudit.latestExternalProofAgeLabel || "none",
    urgentOpenRows: Number(state.proofAudit.counts?.urgentOpenRows ?? 0),
    proofRows: Number(state.proofAudit.counts?.proofRows ?? 0),
    publicBlocked: Number(state.publicAttempts.counts?.blocked ?? blockers.length),
    publicLoginRequired: Number(state.publicAttempts.counts?.loginRequired ?? 0),
    paidAdState: String(state.paidAdTriage.state ?? "missing"),
    paidViews: Number(state.paidAdTriage.paidViews ?? 0),
    paidAppViews: Number(state.paidAdTriage.counts?.appViews ?? 0),
    paidReferralViews: Number(state.paidAdTriage.counts?.referralViews ?? 0),
    paidSignupSaves: Number(state.paidAdTriage.counts?.signupSaves ?? 0),
    firstAction: first,
    actions,
    blockers,
    paidDashboardChecks,
    proofRule:
      "Do not log proof until the real post, story, message batch, upload, reply, or approval request exists.",
  };
}

function shouldUseWarmContactActions(state) {
  const paid = state.paidAdTriage ?? {};
  const workerWake = state.workerWake ?? {};
  const signupSaves = Number(paid.counts?.signupSaves ?? 0);
  const firstPriority = String(workerWake.firstAction?.priority ?? "");
  const workerActions = Array.isArray(workerWake.workers)
    ? workerWake.workers.map((worker) => worker.current).filter(Boolean)
    : [];
  return signupSaves === 0 && (firstPriority.startsWith("warm-") || workerActions.some((row) => String(row.priority ?? "").startsWith("warm-")));
}

function normalizeWarmContactActions(workerWake) {
  const workerActions = Array.isArray(workerWake.workers)
    ? workerWake.workers.map((worker) => worker.current).filter(Boolean)
    : [];
  return workerActions
    .filter((action) => String(action.priority ?? "").startsWith("warm-"))
    .sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority))
    .map((action) => ({
      priority: String(action.priority ?? ""),
      owner: String(action.owner ?? ""),
      channel: String(action.channel ?? ""),
      action: String(action.action ?? ""),
      asset: String(action.asset ?? ""),
      ageLabel: "now",
      trackedLink: String(action.trackedLink ?? REFERRAL_LINK),
      trackedQr: "",
      copy: String(action.copy ?? "").trim(),
      phoneInstruction:
        String(action.firstComment ?? "").trim() ||
        "Send this warm-contact message manually, then log recipient count and replies.",
      quickLogCommand: String(action.quickLogCommand ?? "").trim(),
      proofCommand: String(action.proofIntakeCommand ?? "").trim(),
      shareLinks: normalizeWarmShareLinks(action.share),
    }))
    .filter((action) => action.owner && action.channel);
}

function normalizeWarmShareLinks(share) {
  const links = [];
  if (share?.whatsapp) {
    links.push({ key: "whatsapp", label: "WhatsApp", url: String(share.whatsapp) });
  }
  if (share?.telegram) {
    links.push({ key: "telegram", label: "Telegram", url: String(share.telegram) });
  }
  return links;
}

function priorityRank(value) {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function shouldUseZeroSignupRescue(state) {
  const zeroSignup = state.zeroSignupRescue ?? {};
  const paid = state.paidAdTriage ?? {};
  const acceptedReferrals = Number(zeroSignup.counts?.acceptedReferrals ?? 0);
  const signupSaves = Number(paid.counts?.signupSaves ?? zeroSignup.counts?.signupSaves ?? 0);
  const entries = Number(zeroSignup.counts?.entries ?? 0);
  const paidViews = Number(paid.paidViews ?? 0);
  const referralViews = Number(paid.counts?.referralViews ?? 0);
  const hasRescue = Array.isArray(zeroSignup.creativeVariants) && zeroSignup.creativeVariants.length > 0;
  const stateFlag = String(zeroSignup.state ?? "").includes("zero-signup") || Boolean(zeroSignup.zeroSignup);
  return hasRescue && acceptedReferrals === 0 && signupSaves === 0 && entries === 0 && (stateFlag || paidViews > 0 || referralViews > 0);
}

function normalizeZeroSignupActions(zeroSignupRescue) {
  const variants = Array.isArray(zeroSignupRescue.creativeVariants)
    ? zeroSignupRescue.creativeVariants
    : [];
  return variants
    .map((row) => {
      const priority = String(row.priority ?? "").trim();
      const owner = String(row.owner ?? "").trim();
      const channel = String(row.channel ?? "").trim();
      const hook = String(row.hook ?? "").trim();
      const caption = String(row.caption ?? "").trim();
      const cta = String(row.cta ?? "").trim();
      return {
        priority: priority ? `zs-${priority}` : "zs",
        owner,
        channel,
        action: hook ? `Publish free-picks-first rescue: ${hook}` : "Publish free-picks-first rescue creative.",
        asset: String(row.asset ?? "").trim(),
        ageLabel: "now",
        trackedLink: String(row.link ?? REFERRAL_LINK).trim(),
        trackedQr: "",
        copy: String(row.copy ?? "").trim() || [hook, caption, cta, String(row.link ?? REFERRAL_LINK)].filter(Boolean).join("\n\n"),
        phoneInstruction:
          String(row.beat ?? "").trim() ||
          `Post or send this ${channel} variant from an owned account. Lead with free 3-team picks, then ask for their picks back.`,
        proofCommand: String(row.attemptCommand ?? "").trim(),
        shareLinks: normalizeVariantShareLinks(row.shareLinks),
      };
    })
    .filter((action) => action.owner && action.channel);
}

function normalizeVariantShareLinks(shareLinks) {
  if (!Array.isArray(shareLinks)) return [];
  return shareLinks
    .map((link) => ({
      key: String(link.key ?? link.label ?? "").toLowerCase(),
      label: String(link.label ?? link.key ?? "Share"),
      url: String(link.url ?? ""),
    }))
    .filter((link) => link.url);
}

function normalizeAction(row) {
  const shareLinks = Array.isArray(row.shareLinks) ? row.shareLinks : [];
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
    proofCommand: String(row.proofCommand ?? "").trim(),
    shareLinks: shareLinks.map((link) => ({
      key: String(link.key ?? ""),
      label: String(link.label ?? ""),
      url: String(link.url ?? ""),
    })),
  };
}

function normalizeBlocker(row) {
  return {
    owner: String(row.owner ?? ""),
    platform: String(row.platform ?? ""),
    channel: String(row.channel ?? ""),
    status: String(row.status ?? ""),
    detail: String(row.detail ?? ""),
    nextAction: String(row.nextAction ?? ""),
  };
}

function normalizePaidDashboardCheck(row) {
  return {
    key: String(row.key ?? ""),
    owner: String(row.owner ?? "Memo"),
    platform: String(row.platform ?? ""),
    managerUrl: String(row.managerUrl ?? ""),
    landingUrl: String(row.landingUrl ?? ""),
    guardStatus: Boolean(row.guardStatus),
    checks: Array.isArray(row.checks) ? row.checks.map((check) => String(check ?? "")) : [],
    decisionRules: Array.isArray(row.decisionRules)
      ? row.decisionRules.map((rule) => String(rule ?? ""))
      : [],
    proofCommand: String(row.dashboardProofCommand ?? "").trim(),
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 operator push packet ${payload.generatedAtEest}`,
    `state=${payload.state} action_mode=${payload.actionMode} complete=${payload.complete ? "yes" : "no"} urgent=${payload.urgentOpenRows} proof_rows=${payload.proofRows} public_blocked=${payload.publicBlocked} login_required=${payload.publicLoginRequired}`,
    `paid_ad=${payload.paidAdState} paid_views=${payload.paidViews} app_views=${payload.paidAppViews} referral_views=${payload.paidReferralViews} signup_saves=${payload.paidSignupSaves}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    `rule=${payload.proofRule}`,
    "",
    "do_now:",
  ];
  for (const action of payload.actions) {
    lines.push(`- #${action.priority} ${action.owner} / ${action.channel} age=${action.ageLabel}`);
    lines.push(`  action=${action.action}`);
    lines.push(`  asset=${action.asset}`);
    lines.push(`  link=${action.trackedLink}`);
    lines.push(`  instruction=${action.phoneInstruction}`);
    lines.push(`  proof=${action.proofCommand}`);
    lines.push("  copy:");
    lines.push(indent(action.copy, "    "));
  }
  if (payload.blockers.length > 0) {
    lines.push("", "public_access_blockers:");
    for (const blocker of payload.blockers) {
      lines.push(`- ${blocker.status} ${blocker.owner} / ${blocker.platform} / ${blocker.channel}`);
      lines.push(`  detail=${blocker.detail}`);
      if (blocker.nextAction) lines.push(`  next=${blocker.nextAction}`);
    }
  }
  if (payload.paidDashboardChecks.length > 0) {
    lines.push("", "paid_dashboard_checks:");
    for (const check of payload.paidDashboardChecks) {
      lines.push(`- ${check.owner} / ${check.platform}`);
      lines.push(`  manager=${check.managerUrl}`);
      lines.push(`  landing=${check.landingUrl}`);
      lines.push(`  proof=${check.proofCommand}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Operator Push Packet

Generated: ${payload.generatedAtEest}

- State: ${payload.state}
- Action mode: ${payload.actionMode}
- Complete: ${payload.complete ? "yes" : "no"}
- Urgent open rows: ${payload.urgentOpenRows}
- Proof rows: ${payload.proofRows}
- Public blockers: ${payload.publicBlocked}
- Login required: ${payload.publicLoginRequired}
- Paid ad state: ${payload.paidAdState}
- Paid-source views: ${payload.paidViews}
- Paid app views: ${payload.paidAppViews}
- Paid referral views: ${payload.paidReferralViews}
- Paid signup saves: ${payload.paidSignupSaves}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

${payload.proofRule}

## Do Now

${payload.actions.map(renderActionMarkdown).join("\n\n") || "No actions available."}

## Public Access Blockers

${payload.blockers.map(renderBlockerMarkdown).join("\n\n") || "No public access blockers tracked."}

## Paid Dashboard Checks

${payload.paidDashboardChecks.map(renderPaidDashboardMarkdown).join("\n\n") || "No paid dashboard checks tracked."}
`;
}

function renderActionMarkdown(action) {
  return `### #${action.priority} ${action.owner} / ${action.channel}

- Age: ${action.ageLabel || "-"}
- Action: ${action.action}
- Asset: \`${action.asset}\`
- Link: ${action.trackedLink}
- Instruction: ${action.phoneInstruction}

Copy:

\`\`\`text
${action.copy}
\`\`\`

Proof command, only after real action exists:

\`\`\`bash
${action.proofCommand}
\`\`\``;
}

function renderBlockerMarkdown(blocker) {
  return `### ${blocker.status} - ${blocker.owner} / ${blocker.platform} / ${blocker.channel}

- Detail: ${blocker.detail}
- Next: ${blocker.nextAction || "-"}`;
}

function renderPaidDashboardMarkdown(check) {
  return `### ${check.platform}

- Owner: ${check.owner}
- Manager: ${check.managerUrl}
- Landing: ${check.landingUrl}
- Guard: ${check.guardStatus ? "ok" : "unknown"}

Checklist:

${check.checks.map((item) => `- ${item}`).join("\n") || "- Check dashboard status, impressions, clicks, spend, CTR, landing URL, and warnings."}

Proof command, only after the dashboard was checked:

\`\`\`bash
${check.proofCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Operator Push Packet</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2a20; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 12% 0%, rgba(255,217,116,.18), transparent 22rem), radial-gradient(circle at 88% 0%, rgba(116,240,178,.14), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1120px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,42,32,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(32px, 7vw, 62px); line-height: .92; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p { color: var(--muted); line-height: 1.4; margin: 0 0 8px; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; text-transform: uppercase; font-weight: 900; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    a { color: var(--gold); overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; }
    .pill { color: #03140f; display: inline-flex; padding: 6px 9px; border-radius: 999px; background: linear-gradient(135deg, var(--gold), var(--mint)); font-weight: 950; text-transform: uppercase; }
    .blocker { border-color: rgba(255,159,159,.6); }
    @media (max-width: 760px) { .stats, .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Operator Push</h1>
      <p>${escapeHtml(payload.proofRule)}</p>
      <div class="stats">
        <div class="stat"><span>State</span><strong>${escapeHtml(payload.state)}</strong></div>
        <div class="stat"><span>Urgent</span><strong>${payload.urgentOpenRows}</strong></div>
        <div class="stat"><span>Blockers</span><strong>${payload.publicBlocked}</strong></div>
        <div class="stat"><span>Paid Views</span><strong>${payload.paidViews}</strong></div>
        <div class="stat"><span>Code</span><strong>${payload.referralCode}</strong></div>
      </div>
    </header>
    <section class="grid">
      ${payload.actions.map(renderActionCard).join("")}
    </section>
    ${payload.paidDashboardChecks.length ? `<header><h2>Paid Dashboard Checks</h2><p>Memo must record real delivery numbers before we trust paid ads.</p></header><section class="grid">${payload.paidDashboardChecks.map(renderPaidDashboardCard).join("")}</section>` : ""}
    ${payload.blockers.length ? `<header><h2>Public Access Blockers</h2></header><section class="grid">${payload.blockers.map(renderBlockerCard).join("")}</section>` : ""}
  </main>
</body>
</html>`;
}

function renderActionCard(action) {
  return `<article>
    <span class="pill">#${escapeHtml(action.priority)} ${escapeHtml(action.owner)}</span>
    <h2>${escapeHtml(action.channel)}</h2>
    <p>${escapeHtml(action.action)}</p>
    <p><strong>Asset:</strong> ${escapeHtml(action.asset)}</p>
    <p><a href="${escapeAttr(action.trackedLink)}">${escapeHtml(action.trackedLink)}</a></p>
    <p>${escapeHtml(action.phoneInstruction)}</p>
    <pre>${escapeHtml(action.copy)}</pre>
    <pre>${escapeHtml(action.proofCommand)}</pre>
  </article>`;
}

function renderBlockerCard(blocker) {
  return `<article class="blocker">
    <span class="pill">${escapeHtml(blocker.status)}</span>
    <h2>${escapeHtml(blocker.owner)} / ${escapeHtml(blocker.platform)}</h2>
    <p><strong>${escapeHtml(blocker.channel)}</strong></p>
    <p>${escapeHtml(blocker.detail)}</p>
    <p>${escapeHtml(blocker.nextAction)}</p>
  </article>`;
}

function renderPaidDashboardCard(check) {
  return `<article>
    <span class="pill">${escapeHtml(check.owner)}</span>
    <h2>${escapeHtml(check.platform)}</h2>
    <p><strong>Manager:</strong> <a href="${escapeAttr(check.managerUrl)}" target="_blank" rel="noreferrer">${escapeHtml(check.managerUrl)}</a></p>
    <p><strong>Landing:</strong> <a href="${escapeAttr(check.landingUrl)}" target="_blank" rel="noreferrer">${escapeHtml(check.landingUrl)}</a></p>
    <pre>${escapeHtml(check.checks.join("\n"))}</pre>
    <pre>${escapeHtml(check.proofCommand)}</pre>
  </article>`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "", limit: "4" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--limit") parsed.limit = rawArgs[++index] ?? "4";
  }
  return parsed;
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
