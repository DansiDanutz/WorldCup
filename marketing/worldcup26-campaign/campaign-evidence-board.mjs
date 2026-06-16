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
  objective: await readJson(path.join(runtimeDir, "objective-audit.json"), {}),
  remoteWarRoom: await readJson(path.join(runtimeDir, "remote-war-room.json"), {}),
  proofSla: await readJson(path.join(runtimeDir, "proof-sla.json"), {}),
  proofCloseout: await readJson(path.join(runtimeDir, "proof-closeout.json"), {}),
  publicAttempts: await readJson(path.join(runtimeDir, "public-channel-attempts.json"), {}),
  conversionGuard: await readJson(path.join(runtimeDir, "conversion-guard.json"), {}),
  adPlatformAudit: await readJson(path.join(runtimeDir, "ad-platform-audit.json"), {}),
  referralActivity: await readJson(path.join(runtimeDir, "referral-activity.json"), {}),
  responseKit: await readJson(path.join(runtimeDir, "response-kit.json"), {}),
};

const payload = buildPayload(state);

await writeFile(path.join(runtimeDir, "evidence-board.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "evidence-board.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "evidence-board.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "evidence-board.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

function buildPayload(state) {
  const requirements = Array.isArray(state.objective.requirements) ? state.objective.requirements : [];
  const openRequirements = requirements.filter((row) => row.status !== "proven");
  const criticalOpen = openRequirements.filter((row) => row.severity === "critical");
  const proofRequirement = requirements.find((row) => row.id === "advertise-everywhere-proof") ?? null;
  const publicBlockerRequirement = requirements.find((row) => row.id === "public-channel-blockers") ?? null;
  const nextRealAction = state.objective.nextAction?.primary ?? firstProofAction(state);
  const blocker = state.objective.nextAction?.blocker ?? state.publicAttempts.firstBlocked ?? null;
  const closeoutRows = Array.isArray(state.proofCloseout.rows) ? state.proofCloseout.rows : [];
  const activityCounts = state.referralActivity.counts ?? {};
  const closeoutForNext = closeoutRows.find((row) => String(row.priority ?? "") === String(nextRealAction?.priority ?? "")) ?? closeoutRows[0] ?? null;
  const remoteSummary = state.remoteWarRoom.summary ?? {};
  const totalHosts = Number(remoteSummary.totalHosts ?? 0);
  const fleetProof =
    totalHosts >= 4 &&
    Number(remoteSummary.okHosts ?? 0) === totalHosts &&
    Number(remoteSummary.loopsRunning ?? 0) === totalHosts &&
    Number(remoteSummary.watchdogLoopsRunning ?? 0) === totalHosts &&
    Number(remoteSummary.proofCloseoutsOk ?? 0) === totalHosts;
  const fleetLeaderOnly = totalHosts < 4;
  const readiness = [
    statusLine("referral", Boolean(requirements.find((row) => row.id === "referral-code-link" && row.status === "proven")), "Referral code resolves to David Ai at 5%"),
    statusLine("platform", Boolean(requirements.find((row) => row.id === "live-platform" && row.status === "proven")), "Production landing/auth/health checks pass"),
    statusLine("ad-preview", Boolean(requirements.find((row) => row.id === "meta-x-ad-platform-preview" && row.status === "proven")), "Meta/X click and social preview paths pass"),
    statusLine("conversion", Boolean(requirements.find((row) => row.id === "paid-click-conversion-flow" && row.status === "proven")), "Paid-click referral agreement and Google auth path pass"),
    statusLine("assets", Boolean(requirements.find((row) => row.id === "video-design-assets" && row.status === "proven")), "Video, QR, and phone action assets exist"),
    statusLine("workers", Boolean(requirements.find((row) => row.id === "workers-awake" && row.status === "proven")), "Dexter/Sienna/Memo/Nano have current actions"),
    statusLine(
      "response-kit",
      Boolean(requirements.find((row) => row.id === "response-kit-ready" && row.status === "proven")),
      `Reply templates ready: ${Array.isArray(state.responseKit.replies) ? state.responseKit.replies.length : 0}`,
    ),
    statusLine(
      "fleet",
      fleetLeaderOnly || fleetProof,
      fleetLeaderOnly
        ? `Leader-only proof required; this host has local view ${totalHosts || 0}/4`
        : `Fleet ${Number(remoteSummary.okHosts ?? 0)}/${totalHosts}, loops ${Number(remoteSummary.loopsRunning ?? 0)}/${totalHosts}, closeout ${Number(remoteSummary.proofCloseoutsOk ?? 0)}/${totalHosts}`,
      fleetLeaderOnly ? "info" : "critical",
    ),
    statusLine("proof-closeout", Boolean(state.proofCloseout.ok), `Closeout commands ready: ${closeoutRows.length}`),
    statusLine(
      "referral-activity",
      Boolean(state.referralActivity.ok),
      state.referralActivity.available
        ? `Accepted ${Number(activityCounts.acceptedReferrals ?? 0)}, signup saves ${Number(activityCounts.signupReferralSaves ?? 0)}, entries ${Number(activityCounts.referredEntries ?? 0)}`
        : "No server credentials on this host; local monitor can still run where credentials exist",
      state.referralActivity.available ? "critical" : "info",
    ),
  ];
  const proofStatus = {
    state: String(state.proofSla.proofState ?? state.objective.state ?? "missing"),
    latestExternalProofAgeLabel: String(state.proofSla.latestExternalProofAgeLabel ?? "none"),
    urgentOpenRows: Number(state.proofSla.counts?.urgentOpenRows ?? 0),
    publicUrlProofRows: Number(state.proofSla.counts?.publicUrlProofRows ?? 0),
    externalProofRows: Number(state.proofSla.counts?.externalProofRows ?? 0),
    proofRequirementStatus: proofRequirement?.status ?? "missing",
    blockerStatus: publicBlockerRequirement?.status ?? "missing",
  };
  return {
    schema: "worldcup26-evidence-board-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok:
      readiness.filter((row) => row.severity !== "info").every((row) => row.ok) &&
      Boolean(state.proofCloseout.ok) &&
      Boolean(nextRealAction?.priority) &&
      Boolean(closeoutForNext?.command),
    complete: Boolean(state.objective.complete),
    state: state.objective.complete ? "complete" : criticalOpen.length > 0 ? "critical" : "incomplete",
    readiness,
    proofStatus,
    openRequirements: openRequirements.map((row) => ({
      id: String(row.id ?? ""),
      status: String(row.status ?? ""),
      severity: String(row.severity ?? ""),
      label: String(row.label ?? ""),
      next: String(row.next ?? ""),
    })),
    nextRealAction: nextRealAction
      ? {
          priority: String(nextRealAction.priority ?? ""),
          owner: String(nextRealAction.owner ?? ""),
          channel: String(nextRealAction.channel ?? ""),
          action: String(nextRealAction.action ?? ""),
          asset: String(nextRealAction.asset ?? ""),
        }
      : null,
    closeoutCommand: closeoutForNext
      ? {
          priority: String(closeoutForNext.priority ?? ""),
          status: String(closeoutForNext.status ?? ""),
          account: String(closeoutForNext.suggestedAccount ?? ""),
          audience: String(closeoutForNext.suggestedAudience ?? ""),
          command: String(closeoutForNext.command ?? ""),
        }
      : null,
    publicBlocker: blocker
      ? {
          platform: String(blocker.platform ?? ""),
          channel: String(blocker.channel ?? ""),
          status: String(blocker.status ?? ""),
          nextAction: String(blocker.nextAction ?? ""),
        }
      : null,
    rule:
      "This board separates readiness evidence from real external posting proof. Do not mark the campaign complete until the external proof requirement is proven.",
    referralActivity: {
      available: Boolean(state.referralActivity.available),
      status: String(state.referralActivity.status ?? "missing"),
      acceptedReferrals: Number(activityCounts.acceptedReferrals ?? 0),
      acceptedReferrals24h: Number(activityCounts.acceptedReferrals24h ?? 0),
      signupReferralSaves: Number(activityCounts.signupReferralSaves ?? 0),
      signupReferralSaves24h: Number(activityCounts.signupReferralSaves24h ?? 0),
      referredEntries: Number(activityCounts.referredEntries ?? 0),
      latestAcceptedReferralAt: state.referralActivity.latest?.acceptedReferralAt ?? null,
      latestSignupReferralSavedAt: state.referralActivity.latest?.signupReferralSavedAt ?? null,
    },
  };
}

function firstProofAction(state) {
  const doNow = Array.isArray(state.proofSla.doNow) ? state.proofSla.doNow : [];
  const first = doNow[0] ?? null;
  if (!first) return null;
  return {
    priority: String(first.priority ?? ""),
    owner: String(first.owner ?? ""),
    channel: String(first.channel ?? ""),
    action: String(first.action ?? ""),
    asset: String(first.asset ?? ""),
  };
}

function statusLine(id, ok, label, severity = "critical") {
  return { id, ok, label, severity };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 evidence board ${payload.generatedAtEest}`,
    `state=${payload.state} ok=${payload.ok ? "yes" : "no"} complete=${payload.complete ? "yes" : "no"} code=${payload.referralCode}`,
    `proof_state=${payload.proofStatus.state} latest_external=${payload.proofStatus.latestExternalProofAgeLabel} urgent_open=${payload.proofStatus.urgentOpenRows}`,
    "",
    "readiness:",
  ];
  for (const row of payload.readiness) {
    lines.push(`- ${row.ok ? (row.severity === "info" ? "INFO" : "PROVEN") : "MISSING"} ${row.id}: ${row.label}`);
  }
  lines.push("", "open_items:");
  for (const row of payload.openRequirements) {
    lines.push(`- ${row.status.toUpperCase()} ${row.id}: ${row.label}`);
    lines.push(`  next=${row.next}`);
  }
  if (payload.nextRealAction) {
    lines.push("", `next_real_action=#${payload.nextRealAction.priority} ${payload.nextRealAction.owner} / ${payload.nextRealAction.channel}`);
    lines.push(`action=${payload.nextRealAction.action}`);
    lines.push(`asset=${payload.nextRealAction.asset || "-"}`);
  }
  if (payload.closeoutCommand) {
    lines.push("", "closeout_after_real_action:");
    lines.push(`account=${payload.closeoutCommand.account}`);
    lines.push(`audience=${payload.closeoutCommand.audience}`);
    lines.push(`command=${payload.closeoutCommand.command}`);
  }
  if (payload.publicBlocker) {
    lines.push("", `public_blocker=${payload.publicBlocker.platform} / ${payload.publicBlocker.channel} status=${payload.publicBlocker.status}`);
    lines.push(`blocker_next=${payload.publicBlocker.nextAction}`);
  }
  lines.push(
    "",
    `referral_activity=available:${payload.referralActivity.available ? "yes" : "no"} status:${payload.referralActivity.status} accepted:${payload.referralActivity.acceptedReferrals} signup_saves:${payload.referralActivity.signupReferralSaves} entries:${payload.referralActivity.referredEntries}`,
  );
  lines.push("", `Rule: ${payload.rule}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Evidence Board

Generated: ${payload.generatedAtEest}

- State: ${payload.state}
- Complete: ${payload.complete ? "yes" : "no"}
- Referral code: \`${payload.referralCode}\`
- Proof state: ${payload.proofStatus.state}
- Urgent proof rows: ${payload.proofStatus.urgentOpenRows}

${payload.rule}

## Readiness

${payload.readiness.map((row) => `- ${row.ok ? (row.severity === "info" ? "INFO" : "PROVEN") : "MISSING"} ${row.id}: ${row.label}`).join("\n")}

## Open Items

${payload.openRequirements.map((row) => `- ${row.status.toUpperCase()} ${row.id}: ${row.label}\n  - Next: ${row.next}`).join("\n")}

## Next Real Action

${payload.nextRealAction ? `#${payload.nextRealAction.priority} ${payload.nextRealAction.owner} / ${payload.nextRealAction.channel}\n\n${payload.nextRealAction.action}` : "No action found."}

## Closeout Command

\`\`\`bash
${payload.closeoutCommand?.command ?? "No closeout command found."}
\`\`\`
`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WorldCup26 Evidence Board</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #061711; color: #f8fff9; }
    main { max-width: 980px; margin: 0 auto; padding: 20px 12px 46px; }
    header, section { border: 1px solid rgba(255,255,255,.16); border-radius: 8px; background: #0d2a20; padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    h2 { margin: 0 0 8px; font-size: 22px; }
    p, li { color: #cfe2d9; line-height: 1.45; }
    code, pre { color: #ffdc7a; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; background: rgba(0,0,0,.24); padding: 10px; }
    .pill { display: inline-flex; border-radius: 999px; padding: 4px 8px; background: #ffd974; color: #082117; font-weight: 900; text-transform: uppercase; }
    .bad { background: #ff9f9f; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Evidence Board</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <span class="pill ${payload.complete ? "" : "bad"}">${escapeHtml(payload.state)}</span>
    </header>
    <section>
      <h2>Readiness</h2>
      <ul>${payload.readiness.map((row) => `<li>${row.ok ? (row.severity === "info" ? "INFO" : "PROVEN") : "MISSING"} ${escapeHtml(row.id)}: ${escapeHtml(row.label)}</li>`).join("")}</ul>
    </section>
    <section>
      <h2>Open Items</h2>
      <ul>${payload.openRequirements.map((row) => `<li>${escapeHtml(row.status.toUpperCase())} ${escapeHtml(row.id)}: ${escapeHtml(row.label)}<br>${escapeHtml(row.next)}</li>`).join("")}</ul>
    </section>
    <section>
      <h2>Next Real Action</h2>
      <p>${payload.nextRealAction ? `#${escapeHtml(payload.nextRealAction.priority)} ${escapeHtml(payload.nextRealAction.owner)} / ${escapeHtml(payload.nextRealAction.channel)}` : "No action found."}</p>
      <p>${escapeHtml(payload.nextRealAction?.action ?? "")}</p>
      <pre>${escapeHtml(payload.closeoutCommand?.command ?? "No closeout command found.")}</pre>
    </section>
  </main>
</body>
</html>
`;
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
