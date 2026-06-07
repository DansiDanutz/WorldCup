#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];
const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const postNowRows = await readCsv(path.join(runtimeDir, "post-now.csv"));
const proofSla = await readJson(path.join(runtimeDir, "proof-sla.json"), {});
const cockpit = await readJson(path.join(runtimeDir, "posting-cockpit.json"), {});
const paidAdTriage = await readJson(path.join(runtimeDir, "paid-ad-triage.json"), {});
const signupConversionAudit = await readJson(
  path.join(runtimeDir, "signup-conversion-audit.json"),
  {},
);
const warmContactSprint = await readJson(path.join(runtimeDir, "warm-contact-sprint.json"), {});
const zeroSignupRescue = await readJson(path.join(runtimeDir, "zero-signup-rescue.json"), {});
const firstHumanActions = await readJson(path.join(runtimeDir, "first-human-actions.json"), {});
const payload = buildPayload({
  postNowRows,
  proofSla,
  cockpit,
  paidAdTriage,
  signupConversionAudit,
  warmContactSprint,
  zeroSignupRescue,
  firstHumanActions,
});

await writeFile(path.join(runtimeDir, "worker-wake-board.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "worker-wake-board.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "worker-wake-board.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "worker-wake-board.html"), renderHtml(payload));

for (const worker of payload.workers) {
  const slug = worker.worker.toLowerCase();
  await writeFile(path.join(runtimeDir, `worker-wake-${slug}.md`), renderWorkerMarkdown(payload, worker));
  await writeFile(path.join(runtimeDir, `worker-wake-${slug}.txt`), renderWorkerText(payload, worker));
  await writeFile(path.join(runtimeDir, `worker-wake-${slug}.html`), renderWorkerHtml(payload, worker));
}

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload({
  postNowRows,
  proofSla,
  cockpit,
  paidAdTriage,
  signupConversionAudit,
  warmContactSprint,
  zeroSignupRescue,
  firstHumanActions,
}) {
  const rows = postNowRows
    .map(normalizePostNowRow)
    .filter((row) => row.priority)
    .sort((left, right) => Number(left.priority) - Number(right.priority));
  const zeroSignupRows = normalizeZeroSignupRows(zeroSignupRescue);
  const zeroSignupMode = shouldPrioritizeZeroSignup(paidAdTriage, zeroSignupRescue, zeroSignupRows);
  const warmContactRows = normalizeWarmContactRows(warmContactSprint);
  const warmContactMode = shouldPrioritizeWarmContact(paidAdTriage, warmContactSprint, warmContactRows);
  const rowsByWorker = new Map();
  for (const row of rows) {
    const bucket = rowsByWorker.get(row.owner) ?? [];
    bucket.push(row);
    rowsByWorker.set(row.owner, bucket);
  }
  const zeroSignupRowsByWorker = new Map();
  for (const row of zeroSignupRows) {
    const bucket = zeroSignupRowsByWorker.get(row.owner) ?? [];
    bucket.push(row);
    zeroSignupRowsByWorker.set(row.owner, bucket);
  }
  const warmContactRowsByWorker = new Map();
  for (const row of warmContactRows) {
    const bucket = warmContactRowsByWorker.get(row.owner) ?? [];
    bucket.push(row);
    warmContactRowsByWorker.set(row.owner, bucket);
  }
  const proofState = String(proofSla.proofState ?? cockpit.proofState ?? "missing");
  const workers = WORKERS.map((worker) => {
    const assigned = rowsByWorker.get(worker) ?? [];
    const zeroSignupCurrent = worker === "Memo" ? null : zeroSignupRowsByWorker.get(worker)?.[0] ?? null;
    const warmContactCurrent = warmContactRowsByWorker.get(worker)?.[0] ?? null;
    const current =
      (warmContactMode ? warmContactCurrent : null) ??
      (worker === "Memo"
        ? memoFallback(worker, rows, proofState, paidAdTriage, signupConversionAudit)
        : null) ??
      (zeroSignupMode ? zeroSignupCurrent : null) ??
      assigned[0] ??
      memoFallback(worker, rows, proofState, paidAdTriage, signupConversionAudit);
    return {
      worker,
      state: current ? "wake-now" : "watch",
      assignedCount: assigned.length,
      current,
      prompt: current ? workerPrompt(worker, current, proofState) : "",
      files: workerFiles(worker),
    };
  });
  const firstAction = chooseFirstAction({
    workers,
    rows,
    zeroSignupRows,
    zeroSignupMode,
    warmContactRows,
    warmContactMode,
  });
  const firstHumanGate = normalizeFirstHumanGate(firstHumanActions);

  return {
    schema: "worldcup26-worker-wake-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: workers.every((worker) => worker.current),
    proofState,
    latestExternalProofAgeLabel: String(proofSla.latestExternalProofAgeLabel ?? cockpit.latestExternalProofAgeLabel ?? "none"),
    urgentOpenRows: Number(proofSla.counts?.urgentOpenRows ?? cockpit.urgentOpenRows ?? rows.length),
    firstAction,
    firstHumanGate,
    paidAdState: String(paidAdTriage.state ?? "missing"),
    signupConversionState: String(signupConversionAudit.state ?? "missing"),
    warmContactState: String(warmContactSprint.state ?? "missing"),
    paidViews: Number(paidAdTriage.paidViews ?? 0),
    zeroSignupMode,
    warmContactMode,
    zeroSignupState: String(zeroSignupRescue.state ?? "missing"),
    paidDashboardPath: "runtime/paid-ad-triage.html",
    signupConversionPath: "runtime/signup-conversion-audit.html",
    warmContactPath: "runtime/warm-contact-sprint.html",
    cockpitPath: "runtime/posting-cockpit.html",
    proofIntakePath: "runtime/proof-intake.html",
    workers,
    proofRule:
      "Wake the worker, do the real action, then log proof with proof intake. Do not claim proof from this board alone.",
  };
}

function normalizeFirstHumanGate(firstHumanActions) {
  const counts = firstHumanActions.counts ?? {};
  const action = firstHumanActions.firstAction ?? null;
  return {
    ok: Boolean(firstHumanActions.ok && action),
    state: String(firstHumanActions.state ?? "missing"),
    warmAttempts: Number(counts.warmAttempts ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    referralViews: Number(counts.referralViews ?? 0),
    dashboardClicks: Number(counts.dashboardClicks ?? 0),
    action: action
      ? {
          id: String(action.id ?? ""),
          owner: String(action.owner ?? ""),
          channel: String(action.channel ?? ""),
          title: String(action.title ?? ""),
          link: String(action.link ?? REFERRAL_LINK),
          copy: String(action.copy ?? ""),
          command: String(action.command ?? ""),
          whatsapp: String(action.share?.whatsapp ?? ""),
          telegram: String(action.share?.telegram ?? ""),
          sms: String(action.share?.sms ?? ""),
          doneWhen: String(action.doneWhen ?? ""),
        }
      : null,
  };
}

function chooseFirstAction({ workers, rows, zeroSignupRows, zeroSignupMode, warmContactRows, warmContactMode }) {
  if (warmContactMode && warmContactRows.length > 0) return warmContactRows[0];
  if (zeroSignupMode && zeroSignupRows.length > 0) return zeroSignupRows[0];
  return workers.find((worker) => worker.current)?.current ?? rows[0] ?? null;
}

function normalizeWarmContactRows(warmContactSprint) {
  const batches = Array.isArray(warmContactSprint.batches) ? warmContactSprint.batches : [];
  return batches
    .map((batch) => {
      const priority = String(batch.priority ?? "").trim();
      const owner = String(batch.owner ?? "").trim();
      const platform = String(batch.platform ?? "").trim();
      const audience = String(batch.audience ?? "").trim();
      const copy = String(batch.copy ?? "").trim();
      const link = String(batch.link ?? REFERRAL_LINK).trim();
      const proofCommand = String(batch.proofCommand ?? "").trim();
      const quickLogCommand = String(batch.quickLogCommand ?? "").trim();
      return {
        priority: priority || "warm",
        scheduledAtEest: formatEestLogTime(now),
        owner,
        channel: platform,
        mode: "warm contact sprint",
        action: audience ? `Send warm-contact invite to ${audience}.` : "Send warm-contact invite.",
        asset: String(batch.asset ?? "").trim(),
        trackedLink: link,
        copy,
        firstComment:
          "After sending, watch replies and run referral activity after 15 minutes. Use recipient counts or initials only.",
        proofStatus: String(batch.status ?? "sent").trim() || "sent",
        quickLogCommand,
        share: {
          whatsapp: String(batch.whatsappWeb ?? batch.whatsappMobile ?? "").trim(),
          telegram: String(batch.telegram ?? "").trim(),
        },
        proofIntakeCommand:
          proofCommand ||
          `node campaign-public-channel-attempts.mjs --add --owner ${shellQuote(owner)} --platform ${shellQuote(platform)} --channel "warm-contact sprint" --status sent --attempt-url ${shellQuote(link)}`,
      };
    })
    .filter((row) => row.owner && row.channel && row.copy && row.trackedLink);
}

function shouldPrioritizeWarmContact(paidAdTriage, warmContactSprint, warmContactRows) {
  const signupSaves = Number(paidAdTriage.counts?.signupSaves ?? warmContactSprint.counts?.signupSaves ?? 0);
  const blockedPublic = Number(warmContactSprint.counts?.blockedAttempts ?? 0);
  const state = String(warmContactSprint.state ?? "");
  return warmContactRows.length > 0 && signupSaves === 0 && (blockedPublic > 0 || state.includes("needed"));
}

function normalizeZeroSignupRows(zeroSignupRescue) {
  const variants = Array.isArray(zeroSignupRescue.creativeVariants)
    ? zeroSignupRescue.creativeVariants
    : [];
  return variants
    .map((variant) => {
      const priority = String(variant.priority ?? "").trim();
      const owner = String(variant.owner ?? "").trim();
      const channel = String(variant.channel ?? "").trim();
      const hook = String(variant.hook ?? "").trim();
      const cta = String(variant.cta ?? "").trim();
      return {
        priority: priority ? `zs-${priority}` : "zs",
        scheduledAtEest: formatEestLogTime(now),
        owner,
        channel,
        mode: "zero signup rescue",
        action: hook ? `Publish free-picks-first rescue: ${hook}` : "Publish free-picks-first rescue creative.",
        asset: String(variant.asset ?? "").trim(),
        trackedLink: String(variant.link ?? REFERRAL_LINK).trim(),
        copy: String(variant.copy ?? "").trim(),
        firstComment: cta ? `Follow up: ${cta}` : "",
        proofStatus: proofStatusForZeroSignup(variant),
        share: shareLinksToObject(variant.shareLinks),
        proofIntakeCommand:
          String(variant.attemptCommand ?? "").trim() ||
          `node campaign-public-channel-attempts.mjs --add --owner ${shellQuote(owner)} --platform ${shellQuote(channel)} --channel "zero signup rescue" --status posted --attempt-url ${shellQuote(String(variant.link ?? REFERRAL_LINK))}`,
      };
    })
    .filter((row) => row.owner && row.channel);
}

function shouldPrioritizeZeroSignup(paidAdTriage, zeroSignupRescue, zeroSignupRows) {
  const paidViews = Number(paidAdTriage.paidViews ?? 0);
  const referralViews = Number(paidAdTriage.counts?.referralViews ?? 0);
  const signupSaves = Number(
    paidAdTriage.counts?.signupSaves ?? zeroSignupRescue.counts?.signupSaves ?? 0,
  );
  const zeroSignup = Boolean(zeroSignupRescue.zeroSignup) || String(zeroSignupRescue.state ?? "").includes("zero-signup");
  return zeroSignupRows.length > 0 && signupSaves === 0 && (zeroSignup || paidViews > 0 || referralViews > 0);
}

function shareLinksToObject(shareLinks) {
  const share = {};
  if (!Array.isArray(shareLinks)) return share;
  for (const link of shareLinks) {
    const label = String(link.label ?? "").toLowerCase();
    const url = String(link.url ?? "").trim();
    if (!url) continue;
    if (label.includes("whatsapp")) share.whatsapp = url;
    else if (label.includes("telegram")) share.telegram = url;
    else if (label === "x" || label.includes("twitter")) share.x = url;
    else if (label.includes("facebook")) share.facebook = url;
  }
  return share;
}

function proofStatusForZeroSignup(variant) {
  const command = String(variant.attemptCommand ?? "").toLowerCase();
  if (command.includes('--status "sent"') || command.includes("--status sent")) return "sent";
  if (command.includes('--status "requested"') || command.includes("--status requested")) return "requested";
  if (command.includes('--status "replied"') || command.includes("--status replied")) return "replied";
  return "posted";
}

function normalizePostNowRow(row) {
  const priority = String(row.priority ?? "").trim();
  const owner = String(row.owner ?? "").trim();
  const channel = String(row.channel ?? "").trim();
  const mode = String(row.mode ?? "").trim();
  const asset = String(row.asset ?? "").trim();
  const copy = String(row.primary_copy ?? "").trim();
  const firstComment = String(row.first_comment ?? "").trim();
  return {
    priority,
    scheduledAtEest: String(row.scheduled_at_eest ?? "").trim(),
    owner,
    channel,
    mode,
    action: String(row.action ?? "").trim(),
    asset,
    trackedLink: String(row.tracked_link ?? "").trim(),
    copy,
    firstComment,
    proofStatus: proofStatusFor(mode),
    share: {
      whatsapp: String(row.whatsapp_share_url ?? "").trim(),
      telegram: String(row.telegram_share_url ?? "").trim(),
      x: String(row.x_share_url ?? "").trim(),
      facebook: String(row.facebook_share_url ?? "").trim(),
    },
    proofIntakeCommand: proofIntakeCommand(row),
  };
}

function memoFallback(worker, rows, proofState, paidAdTriage, signupConversionAudit = {}) {
  if (worker !== "Memo") return null;
  const paidState = String(paidAdTriage.state ?? "");
  const paidViews = Number(paidAdTriage.paidViews ?? 0);
  const signupSaves = Number(paidAdTriage.counts?.signupSaves ?? 0);
  const referralViews = Number(paidAdTriage.counts?.referralViews ?? 0);
  const dashboard = paidAdTriage.dashboard ?? {};
  const dashboardState = String(dashboard.state ?? "");
  const dashboardClicks = Number(dashboard.totalClicks ?? 0);
  const channels = Array.isArray(paidAdTriage.channels) ? paidAdTriage.channels : [];
  if (requiresPaidDashboardCheck(paidState, paidViews, paidAdTriage) && channels.length > 0) {
    const commands = channels
      .map((channel) => String(channel.dashboardProofCommand ?? "").trim())
      .filter(Boolean)
      .join("\n\n");
    const dashboardLines = channels
      .map(
        (channel) =>
          `${channel.platform}: ${channel.managerUrl}\nLanding: ${channel.landingUrl}`,
      )
      .join("\n\n");
    return {
      priority: "paid",
      scheduledAtEest: formatEestLogTime(now),
      owner: "Memo",
      channel: "Paid ad dashboard check",
      mode: "ops paid",
      action:
        "Paid ad dashboard proof is missing. Open Meta and X dashboards, record status/spend/impressions/clicks/CTR/landing URL, then log both checks.",
      asset: "runtime/paid-ad-triage.html",
      trackedLink: "paid-ad-triage.html",
      copy: `WorldCup26 paid ads need a real dashboard check now.\n\nState: ${paidState}\nPaid-source views detected in app analytics: ${paidViews}\n\nOpen:\n${dashboardLines}\n\nRecord delivery status, spend, impressions, clicks, CTR, landing URL, and any rejection/limited-delivery warning.`,
      firstComment: "",
      proofStatus: "checked",
      share: {},
      proofIntakeCommand: commands || "node campaign-paid-ad-triage.mjs && sed -n '1,120p' runtime/paid-ad-triage.txt",
    };
  }
  if (isPaidSignupFriction(paidState, dashboardState, dashboardClicks, signupSaves)) {
    const auditState = String(signupConversionAudit.state ?? "critical-auth-to-signup-save-unproven");
    const firstAction = String(
      signupConversionAudit.firstAction ??
        "Run one full new-user Google signup from the referral link, then verify a referral signup save row.",
    );
    const proofRule = String(
      signupConversionAudit.proofRule ??
        "Do not claim signup conversion proof without a real saved signup row or clear private-channel tester note.",
    );
    return {
      priority: "conversion",
      scheduledAtEest: formatEestLogTime(now),
      owner: "Memo",
      channel: "Signup conversion audit",
      mode: "ops conversion",
      action:
        "Paid clicks are reaching the app but signup saves are still zero. Audit the referral landing, Google auth return, and post-login referral save path before changing ads again.",
      asset: "runtime/signup-conversion-audit.html",
      trackedLink: `${REFERRAL_LINK}&utm_source=memo-conversion-audit&utm_medium=ops&utm_campaign=worldcup26_zero_signup_rescue&utm_content=signup_friction`,
      copy: `WorldCup26 paid clicks are arriving, but signup saves are still zero.\n\nAudit state: ${auditState}\nPaid state: ${paidState}\nDashboard: ${dashboardState}\nDashboard clicks: ${dashboardClicks}\nPaid-source views: ${paidViews}\nReferral views: ${referralViews}\nSignup saves: ${signupSaves}\n\nFirst action: ${firstAction}\nProof rule: ${proofRule}\n\nAudit the live mobile path: invite code applied, I accept gate, Google button, auth callback, and /api/referrals/signup after auth. Do not change the paid creative until this path is proven.`,
      firstComment: "If the user path is clean, chase Sienna/Nano/Dexter for real warm-contact proof and compare funnel movement.",
      proofStatus: "checked",
      share: {},
      proofIntakeCommand:
        "node campaign-signup-conversion-audit.mjs && sed -n '1,120p' runtime/signup-conversion-audit.txt",
    };
  }
  const first = rows[0] ?? null;
  if (!first) return null;
  return {
    priority: "audit",
    scheduledAtEest: formatEestLogTime(now),
    owner: "Memo",
    channel: "Proof audit",
    mode: "ops chase",
    action: `Proof state is ${proofState}. Chase Sienna, Nano, and Dexter for real proof on their oldest actions; do not log without proof.`,
    asset: "runtime/proof-intake.html",
    trackedLink: REFERRAL_LINK,
    copy: `Critical proof chase for WorldCup26.\n\nFirst stale action: #${first.priority} ${first.owner} / ${first.channel}.\nAsk for the real post/message/story/request proof, then log it through proof intake.`,
    firstComment: "",
    proofStatus: "logged",
    share: {},
    proofIntakeCommand: "node campaign-remote-war-room.mjs && sed -n '1,120p' runtime/proof-intake.txt",
  };
}

function requiresPaidDashboardCheck(paidState, paidViews, paidAdTriage = {}) {
  const state = String(paidState ?? "").toLowerCase();
  const dashboard = paidAdTriage.dashboard ?? {};
  const dashboardState = String(dashboard.state ?? "").toLowerCase();
  const latestChecks = Array.isArray(dashboard.latestChecks) ? dashboard.latestChecks : [];
  const missingDashboardCheck =
    latestChecks.length === 0 ||
    dashboardState.includes("needs") ||
    dashboardState.includes("missing") ||
    state.includes("dashboard-check-missing");
  return (
    missingDashboardCheck ||
    state.includes("dashboard") ||
    state.includes("impression") ||
    state.includes("creative") ||
    state.includes("tracking") ||
    paidViews === 0
  );
}

function isPaidSignupFriction(paidState, dashboardState, dashboardClicks, signupSaves) {
  const state = String(paidState ?? "").toLowerCase();
  const directDashboardState = String(dashboardState ?? "").toLowerCase();
  return (
    signupSaves === 0 &&
    (state.includes("signup-friction") ||
      directDashboardState.includes("clicks-no-signups") ||
      dashboardClicks > 0)
  );
}

function workerFiles(worker) {
  const slug = worker.toLowerCase();
  return [
    `runtime/worker-wake-${slug}.html`,
    `runtime/worker-inbox-${slug}.md`,
    "runtime/posting-cockpit.html",
    "runtime/paid-ad-triage.html",
    "runtime/signup-conversion-audit.html",
    "runtime/warm-contact-sprint.html",
    "runtime/proof-intake.html",
  ];
}

function workerPrompt(worker, action, proofState) {
  const lines = [
    `${worker}, wake up now. Proof state is ${proofState}.`,
    "First 10 minutes: send the warm WhatsApp invite first if warm attempts are still zero.",
    `Do this real action: #${action.priority} ${action.channel} - ${action.action}`,
    `Use asset: ${action.asset}`,
    `Use link: ${action.trackedLink}`,
    `Use code: ${REFERRAL_CODE}`,
    "After the action exists, log proof. Do not log placeholders.",
    `Proof/intake command: ${action.proofIntakeCommand}`,
  ];
  if (action.copy) {
    lines.push("", "Copy:", action.copy);
  }
  if (action.firstComment) {
    lines.push("", "Follow-up:", action.firstComment);
  }
  return lines.join("\n");
}

function proofIntakeCommand(row) {
  const priority = String(row.priority ?? "").trim();
  const mode = String(row.mode ?? "").trim();
  const channel = String(row.channel ?? "").toLowerCase();
  const status = proofStatusFor(mode);
  const account = accountExample(channel);
  const audience = audienceExample(channel);
  return `node campaign-proof-intake.mjs --priority ${shellQuote(priority)} --account ${shellQuote(account)} --audience ${shellQuote(audience)} --happened-at ${shellQuote(formatEestLogTime(now))} --status ${shellQuote(status)}`;
}

function accountExample(channel) {
  if (channel.includes("whatsapp")) return "personal phone";
  if (channel.includes("instagram")) return "Instagram account";
  if (channel.includes("facebook")) return "Facebook account";
  if (channel.includes("tiktok")) return "TikTok account";
  if (channel.includes("youtube")) return "YouTube account";
  if (channel.includes("football")) return "posting account";
  return "posting account";
}

function audienceExample(channel) {
  if (channel.includes("status")) return "WhatsApp contacts";
  if (channel.includes("personal")) return "12 warm contacts";
  if (channel.includes("story")) return "story followers";
  if (channel.includes("football")) return "group admin or approved football group";
  if (channel.includes("dm") || channel.includes("reply")) return "reply thread/contact initials";
  return "destination/channel name";
}

function proofStatusFor(mode) {
  const value = String(mode ?? "").toLowerCase();
  if (value.includes("approval")) return "requested";
  if (value.includes("reply") || value.includes("repl")) return "replied";
  if (value.includes("outreach")) return "sent";
  if (value.includes("internal") || value.includes("ops")) return "logged";
  return "posted";
}

function renderText(payload) {
  const lines = [
    `WorldCup26 worker wake board ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.proofState} latest_external=${payload.latestExternalProofAgeLabel} urgent=${payload.urgentOpenRows}`,
    `first_human=${payload.firstHumanGate.state} warm_attempts=${payload.firstHumanGate.warmAttempts} signup_saves=${payload.firstHumanGate.signupSaves} referral_views=${payload.firstHumanGate.referralViews} ad_clicks=${payload.firstHumanGate.dashboardClicks}`,
    payload.firstHumanGate.action
      ? `first_human_action=${payload.firstHumanGate.action.owner}/${payload.firstHumanGate.action.channel}/${payload.firstHumanGate.action.id}`
      : "first_human_action=-",
    payload.firstHumanGate.action?.whatsapp
      ? `first_human_whatsapp=${payload.firstHumanGate.action.whatsapp}`
      : "first_human_whatsapp=-",
    `open=${payload.cockpitPath}`,
    "",
  ];
  for (const worker of payload.workers) {
    lines.push(`${worker.worker}: ${worker.state} assigned=${worker.assignedCount} next=#${worker.current?.priority ?? "-"} ${worker.current?.channel ?? "-"}`);
    if (worker.current) {
      lines.push(`  action=${worker.current.action}`);
      if (worker.current.quickLogCommand) {
        lines.push(`  quick_log=${worker.current.quickLogCommand}`);
      }
      lines.push(`  intake=${worker.current.proofIntakeCommand}`);
    }
  }
  lines.push("", `Rule: ${payload.proofRule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Worker Wake Board

Generated: ${payload.generatedAtEest}

- Status: ${payload.ok ? "ready" : "not ready"}
- Proof state: ${payload.proofState}
- Latest external proof age: ${payload.latestExternalProofAgeLabel}
- Paid ad state: ${payload.paidAdState}
- Signup conversion state: ${payload.signupConversionState}
- Warm-contact sprint: ${payload.warmContactMode ? "active" : "standby"} (${payload.warmContactState})
- First human gate: ${payload.firstHumanGate.state}; warm attempts ${payload.firstHumanGate.warmAttempts}; signup saves ${payload.firstHumanGate.signupSaves}
- Paid-source views: ${payload.paidViews}
- Zero-signup rescue: ${payload.zeroSignupMode ? "active" : "standby"} (${payload.zeroSignupState})
- Urgent rows: ${payload.urgentOpenRows}
- Posting cockpit: \`${payload.cockpitPath}\`
- Paid ad triage: \`${payload.paidDashboardPath}\`
- Signup conversion audit: \`${payload.signupConversionPath}\`
- Warm-contact sprint: \`${payload.warmContactPath}\`
- Proof intake: \`${payload.proofIntakePath}\`

${payload.proofRule}

${renderFirstHumanMarkdown(payload)}

${payload.workers.map((worker) => renderWorkerMarkdown(payload, worker)).join("\n\n")}
`;
}

function renderFirstHumanMarkdown(payload) {
  const action = payload.firstHumanGate.action;
  if (!action) return "## First Human Gate\n\nRegenerate `campaign-first-human-actions.mjs`.";
  return `## First Human Gate

- State: ${payload.firstHumanGate.state}
- Warm attempts: ${payload.firstHumanGate.warmAttempts}
- Signup saves: ${payload.firstHumanGate.signupSaves}
- Referral views: ${payload.firstHumanGate.referralViews}
- Ad clicks: ${payload.firstHumanGate.dashboardClicks}
- Required action: ${action.owner} / ${action.channel} - ${action.title}
- WhatsApp: ${action.whatsapp || "-"}
- Done when: ${action.doneWhen}

\`\`\`text
${action.copy}
\`\`\`

\`\`\`bash
${action.command}
\`\`\``;
}

function renderWorkerMarkdown(payload, worker) {
  const action = worker.current;
  return `## ${worker.worker}

- State: ${worker.state}
- Assigned urgent rows: ${worker.assignedCount}
- Next: ${action ? `#${action.priority} ${action.channel}` : "-"}
- Files: ${worker.files.map((file) => `\`${file}\``).join(", ")}

\`\`\`text
${worker.prompt || "Watch for the next urgent row."}
\`\`\``;
}

function renderWorkerText(payload, worker) {
  return [
    `WorldCup26 ${worker.worker} wake prompt ${payload.generatedAtEest}`,
    `state=${payload.proofState} latest_external=${payload.latestExternalProofAgeLabel} assigned=${worker.assignedCount}`,
    `first_human=${payload.firstHumanGate.state} warm_attempts=${payload.firstHumanGate.warmAttempts} signup_saves=${payload.firstHumanGate.signupSaves}`,
    payload.firstHumanGate.action?.whatsapp ? `first_human_whatsapp=${payload.firstHumanGate.action.whatsapp}` : "first_human_whatsapp=-",
    "",
    payload.firstHumanGate.action ? firstHumanWorkerPrompt(payload.firstHumanGate) : "",
    "",
    worker.prompt,
    "",
  ].join("\n");
}

function firstHumanWorkerPrompt(firstHumanGate) {
  const action = firstHumanGate.action;
  if (!action) return "";
  return [
    "FIRST HUMAN GATE:",
    `${action.owner} / ${action.channel} - ${action.title}`,
    `Warm attempts: ${firstHumanGate.warmAttempts}`,
    `Signup saves: ${firstHumanGate.signupSaves}`,
    `WhatsApp: ${action.whatsapp || "-"}`,
    `After the real send: ${action.command}`,
  ].join("\n");
}

function renderHtml(payload) {
  return renderHtmlShell(
    "WorldCup26 Worker Wake Board",
    `<header>
      <h1>Worker Wake Board</h1>
      <span class="state ${escapeAttr(payload.proofState)}">${escapeHtml(payload.proofState)}</span>
      <p>${escapeHtml(payload.proofRule)}</p>
      <div class="stats">
        <div><span>Urgent</span><strong>${payload.urgentOpenRows}</strong></div>
        <div><span>External age</span><strong>${escapeHtml(payload.latestExternalProofAgeLabel)}</strong></div>
        <div><span>Paid views</span><strong>${payload.paidViews}</strong></div>
        <div><span>Code</span><strong>${escapeHtml(payload.referralCode)}</strong></div>
      </div>
      <div class="buttons">
        <a class="button gold" href="posting-cockpit.html">Open cockpit</a>
        <a class="button" href="paid-ad-triage.html">Paid ad triage</a>
        <a class="button" href="signup-conversion-audit.html">Signup audit</a>
        <a class="button" href="warm-contact-sprint.html">Warm sprint</a>
        <a class="button" href="proof-intake.html">Open proof intake</a>
      </div>
    </header>
    ${renderFirstHumanHtml(payload)}
    <section class="grid">${payload.workers.map((worker) => renderWorkerCard(worker)).join("")}</section>`,
  );
}

function renderWorkerHtml(payload, worker) {
  return renderHtmlShell(
    `${worker.worker} Wake Prompt`,
    `<header>
      <h1>${escapeHtml(worker.worker)} Wake Prompt</h1>
      <span class="state ${escapeAttr(payload.proofState)}">${escapeHtml(payload.proofState)}</span>
      <p>${escapeHtml(payload.proofRule)}</p>
    </header>
    ${renderFirstHumanHtml(payload)}
    <section class="grid grid-single">${renderWorkerCard(worker)}</section>`,
  );
}

function renderFirstHumanHtml(payload) {
  const action = payload.firstHumanGate.action;
  if (!action) return "";
  return `<section class="first-human">
    <h2>First Human Gate</h2>
    <p><strong>${escapeHtml(payload.firstHumanGate.state)}</strong> / warm attempts ${payload.firstHumanGate.warmAttempts} / signup saves ${payload.firstHumanGate.signupSaves} / ad clicks ${payload.firstHumanGate.dashboardClicks}</p>
    <p>${escapeHtml(action.owner)} / ${escapeHtml(action.channel)} - ${escapeHtml(action.title)}</p>
    <div class="buttons">
      ${action.whatsapp ? `<a class="button gold" href="${escapeAttr(action.whatsapp)}" target="_blank" rel="noreferrer">Open WhatsApp now</a>` : ""}
      ${action.telegram ? `<a class="button" href="${escapeAttr(action.telegram)}" target="_blank" rel="noreferrer">Telegram</a>` : ""}
      ${action.sms ? `<a class="button" href="${escapeAttr(action.sms)}" target="_blank" rel="noreferrer">SMS</a>` : ""}
      <button data-copy="${escapeAttr(action.copy)}">Copy first invite</button>
      <button data-copy="${escapeAttr(action.command)}">Copy quick log</button>
    </div>
    <pre>${escapeHtml(action.copy)}</pre>
    <pre>${escapeHtml(action.command)}</pre>
  </section>`;
}

function renderWorkerCard(worker) {
  const action = worker.current;
  const share = action?.share ?? {};
  return `<article>
    <h2>${escapeHtml(worker.worker)}</h2>
    <p><strong>${escapeHtml(worker.state)}</strong> / assigned ${worker.assignedCount}</p>
    ${action ? `<p>#${escapeHtml(action.priority)} ${escapeHtml(action.channel)} - ${escapeHtml(action.action)}</p>` : "<p>No action assigned.</p>"}
    <pre>${escapeHtml(worker.prompt)}</pre>
    <div class="buttons">
      ${action?.trackedLink ? `<a class="button gold" href="${escapeAttr(action.trackedLink)}" target="_blank" rel="noreferrer">Open link</a>` : ""}
      ${share.whatsapp ? `<a class="button" href="${escapeAttr(share.whatsapp)}" target="_blank" rel="noreferrer">WhatsApp</a>` : ""}
      ${share.telegram ? `<a class="button" href="${escapeAttr(share.telegram)}" target="_blank" rel="noreferrer">Telegram</a>` : ""}
      ${share.x ? `<a class="button" href="${escapeAttr(share.x)}" target="_blank" rel="noreferrer">X</a>` : ""}
      ${share.facebook ? `<a class="button" href="${escapeAttr(share.facebook)}" target="_blank" rel="noreferrer">Facebook</a>` : ""}
      <button data-copy="${escapeAttr(action?.copy ?? "")}">Copy caption</button>
      ${action?.quickLogCommand ? `<button data-copy="${escapeAttr(action.quickLogCommand)}">Copy quick proof</button>` : ""}
      <button data-copy="${escapeAttr(action?.proofIntakeCommand ?? "")}">Copy intake command</button>
    </div>
  </article>`;
}

function renderHtmlShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0a2b21; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --green: #0b7a59; --danger: #ff9f9f; --warn: #ffcc6a; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 92% 4%, rgba(116,240,178,.16), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1080px, 100%); margin: 0 auto; padding: 12px 10px 48px; }
    header, article, .first-human { border: 1px solid var(--line); border-radius: 8px; background: rgba(10,43,33,.94); padding: 14px; margin-bottom: 10px; }
    .first-human { border-color: rgba(255,217,116,.72); background: linear-gradient(135deg, rgba(255,217,116,.18), rgba(10,43,33,.96)); }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 9vw, 68px); line-height: .9; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0 0 8px; color: var(--muted); line-height: 1.4; }
    .state { display: inline-flex; margin: 4px 0 12px; padding: 7px 10px; border-radius: 999px; color: #03140f; background: var(--mint); font-weight: 950; text-transform: uppercase; }
    .state.warning { background: var(--warn); }
    .state.critical, .state.missing { background: var(--danger); }
    .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 12px 0; }
    .stats div { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stats span { display: block; color: var(--muted); font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .stats strong { display: block; color: var(--gold); font-size: 22px; overflow-wrap: anywhere; }
    .grid { display: grid; gap: 10px; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; margin: 10px 0; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; line-height: 1.35; }
    .buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    button, a.button { min-height: 44px; border: 1px solid rgba(116,240,178,.42); border-radius: 8px; color: #fff; background: var(--green); display: inline-flex; align-items: center; justify-content: center; padding: 9px; font: inherit; font-weight: 900; text-align: center; text-decoration: none; cursor: pointer; }
    .gold { color: #03140f; background: var(--gold); border-color: var(--gold); }
    @media (min-width: 760px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .grid-single { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>${body}</main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      event.preventDefault();
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        const old = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = old; }, 1200);
      } catch {
        window.prompt("Copy this text", value);
      }
    });
  </script>
</body>
</html>`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function readCsv(filePath) {
  try {
    return parseCsv(await readFile(filePath, "utf8"));
  } catch {
    return [];
  }
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

function shellQuote(value) {
  const text = String(value ?? "");
  if (/^[A-Za-z0-9_./:=+-]+$/.test(text)) return text;
  return `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function formatEestLogTime(date) {
  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const hour = String(shifted.getUTCHours()).padStart(2, "0");
  const minute = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute} +0300`;
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
