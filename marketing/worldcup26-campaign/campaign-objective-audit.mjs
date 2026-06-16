#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const state = {
  campaignStatus: await readJson(path.join(runtimeDir, "campaign-status.json"), {}),
  liveAdQa: await readJson(path.join(runtimeDir, "live-ad-qa.json"), {}),
  adPlatformAudit: await readJson(path.join(runtimeDir, "ad-platform-audit.json"), {}),
  conversionGuard: await readJson(path.join(runtimeDir, "conversion-guard.json"), {}),
  proofAudit: await readJson(path.join(runtimeDir, "proof-audit.json"), {}),
  proofSla: await readJson(path.join(runtimeDir, "proof-sla.json"), {}),
  remoteWarRoom: await readJson(path.join(runtimeDir, "remote-war-room.json"), {}),
  phoneActionCenter: await readJson(path.join(runtimeDir, "phone-action-center.json"), {}),
  workerWake: await readJson(path.join(runtimeDir, "worker-wake-board.json"), {}),
  publicAttempts: await readJson(path.join(runtimeDir, "public-channel-attempts.json"), {}),
  socialRescue: await readJson(path.join(runtimeDir, "social-rescue-pack.json"), {}),
  responseKit: await readJson(path.join(runtimeDir, "response-kit.json"), {}),
  firstHumanActions: await readJson(path.join(runtimeDir, "first-human-actions.json"), {}),
};

const payload = buildPayload(state);

await writeFile(path.join(runtimeDir, "objective-audit.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "objective-audit.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "objective-audit.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "objective-audit.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload(state) {
  const requirements = [
    referralRequirement(state),
    livePlatformRequirement(state),
    adPlatformRequirement(state),
    conversionRequirement(state),
    assetRequirement(state),
    workerRequirement(state),
    dropletRequirement(state),
    nonstopRequirement(state),
    responseKitRequirement(state),
    firstHumanRequirement(state),
    advertisingProofRequirement(state),
    blockerRequirement(state),
  ];
  const missing = requirements.filter((row) => row.status !== "proven");
  const critical = requirements.filter((row) => row.severity === "critical" && row.status !== "proven");
  const nextAction = nextActionFrom(state);

  return {
    schema: "worldcup26-objective-audit-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: true,
    complete: missing.length === 0,
    state: critical.length > 0 ? "critical" : missing.length > 0 ? "incomplete" : "complete",
    requirements,
    counts: {
      total: requirements.length,
      proven: requirements.filter((row) => row.status === "proven").length,
      incomplete: requirements.filter((row) => row.status === "incomplete").length,
      blocked: requirements.filter((row) => row.status === "blocked").length,
      unknown: requirements.filter((row) => row.status === "unknown").length,
      critical: critical.length,
    },
    nextAction,
    truth:
      "This objective audit is a completion guard. It proves readiness where evidence exists and keeps the full marketing objective incomplete until real external posting proof exists.",
  };
}

function referralRequirement(state) {
  const resolverOk = Boolean(state.liveAdQa.checks?.resolver?.ok);
  const codeOk =
    state.liveAdQa.referralCode === REFERRAL_CODE &&
    state.proofAudit.referralCode === REFERRAL_CODE &&
    state.publicAttempts.referralCode === REFERRAL_CODE;
  const linkOk =
    state.liveAdQa.referralLink === REFERRAL_LINK &&
    state.proofAudit.referralLink === REFERRAL_LINK &&
    state.publicAttempts.referralLink === REFERRAL_LINK;
  const percentOk = Number(state.liveAdQa.expectedPercent ?? 0) === 5;
  return requirement({
    id: "referral-code-link",
    label: "Referral code/link are correct",
    status: resolverOk && codeOk && linkOk && percentOk ? "proven" : "incomplete",
    severity: "critical",
    evidence: [
      `code=${state.liveAdQa.referralCode || state.proofAudit.referralCode || "-"}`,
      `link=${state.liveAdQa.referralLink || state.proofAudit.referralLink || "-"}`,
      `resolver=${resolverOk ? "ok" : "missing"}`,
      `percent=${state.liveAdQa.expectedPercent ?? "-"}`,
    ],
    next: "Keep every post using code 26BC4B90CB and the worldcup26.world referral link.",
  });
}

function livePlatformRequirement(state) {
  const pages = Array.isArray(state.liveAdQa.checks?.pages) ? state.liveAdQa.checks.pages : [];
  const allPagesOk = pages.length >= 7 && pages.every((page) => page.ok);
  const authOk = Boolean(state.liveAdQa.checks?.auth?.ok);
  const healthOk = Boolean(state.liveAdQa.checks?.health?.ok);
  return requirement({
    id: "live-platform",
    label: "Live platform/ad landing URLs are working",
    status: state.liveAdQa.ok && allPagesOk && authOk && healthOk ? "proven" : "incomplete",
    severity: "critical",
    evidence: [
      `live_ad_qa=${state.liveAdQa.ok ? "ok" : "fail"}`,
      `pages=${pages.filter((page) => page.ok).length}/${pages.length}`,
      `auth=${authOk ? "ok" : "fail"}`,
      `health=${healthOk ? "ok" : "fail"}`,
      `dpl=${Array.isArray(state.liveAdQa.deploymentIds) ? state.liveAdQa.deploymentIds.join(",") : "-"}`,
    ],
    next: "Fix live ad QA before sending traffic if this ever turns red.",
  });
}

function conversionRequirement(state) {
  const firstPaint = Array.isArray(state.conversionGuard.checks?.firstPaint)
    ? state.conversionGuard.checks.firstPaint
    : [];
  const resolverOk = Boolean(state.conversionGuard.checks?.resolver?.ok);
  const authOk = Boolean(state.conversionGuard.checks?.auth?.ok);
  const browserProof = state.conversionGuard.checks?.browserProof ?? {};
  return requirement({
    id: "paid-click-conversion-flow",
    label: "Paid click conversion flow is ready",
    status:
      state.conversionGuard.ok &&
      firstPaint.length >= 4 &&
      firstPaint.every((page) => page.ok) &&
      resolverOk &&
      authOk
        ? "proven"
        : "incomplete",
    severity: "critical",
    evidence: [
      `conversion_guard=${state.conversionGuard.ok ? "ok" : "fail"}`,
      `first_paint=${firstPaint.filter((page) => page.ok).length}/${firstPaint.length}`,
      `resolver=${resolverOk ? "ok" : "fail"}`,
      `auth=${authOk ? "ok" : "fail"}`,
      `browser_verified=${state.conversionGuard.browserVerified ? "yes" : "no"}`,
      `browser_proof=${browserProof.status ?? "-"}`,
    ],
    next: "Fix the conversion guard before scaling paid traffic if this ever turns red.",
  });
}

function adPlatformRequirement(state) {
  const pages = Array.isArray(state.adPlatformAudit.checks?.pages)
    ? state.adPlatformAudit.checks.pages
    : [];
  const socialImages = Array.isArray(state.adPlatformAudit.checks?.socialImages)
    ? state.adPlatformAudit.checks.socialImages
    : [];
  const resolverOk = Boolean(state.adPlatformAudit.checks?.resolver?.ok);
  const healthOk = Boolean(state.adPlatformAudit.checks?.health?.ok);
  return requirement({
    id: "meta-x-ad-platform-preview",
    label: "Meta/X ad click and preview paths are working",
    status:
      state.adPlatformAudit.ok &&
      pages.length >= 9 &&
      pages.every((page) => page.ok) &&
      socialImages.length >= 1 &&
      socialImages.every((image) => image.ok) &&
      resolverOk &&
      healthOk
        ? "proven"
        : "incomplete",
    severity: "critical",
    evidence: [
      `ad_platform=${state.adPlatformAudit.ok ? "ok" : "fail"}`,
      `pages=${pages.filter((page) => page.ok).length}/${pages.length}`,
      `social_images=${socialImages.filter((image) => image.ok).length}/${socialImages.length}`,
      `resolver=${resolverOk ? "ok" : "fail"}`,
      `health=${healthOk ? "ok" : "fail"}`,
      `dpl=${Array.isArray(state.adPlatformAudit.deploymentIds) ? state.adPlatformAudit.deploymentIds.join(",") : "-"}`,
    ],
    next: "Fix ad-platform audit before trusting Meta/X previews or paid clicks.",
  });
}

function assetRequirement(state) {
  const localAssets = Array.isArray(state.liveAdQa.checks?.localAssets)
    ? state.liveAdQa.checks.localAssets
    : [];
  const videoOk = localAssets.some(
    (asset) => asset.ok && String(asset.path ?? "") === "media/worldcup26-main-video.mp4",
  );
  const phoneOk =
    Boolean(state.phoneActionCenter.ok) &&
    Number(state.phoneActionCenter.videoPreviewCount ?? 0) > 0 &&
    Number(state.phoneActionCenter.qrBlockCount ?? 0) >= Number(state.phoneActionCenter.actionCount ?? 0);
  return requirement({
    id: "video-design-assets",
    label: "Video/design assets are available to workers",
    status: videoOk && phoneOk ? "proven" : "incomplete",
    severity: "critical",
    evidence: [
      `video=${videoOk ? "ok" : "missing"}`,
      `local_assets=${localAssets.filter((asset) => asset.ok).length}/${localAssets.length}`,
      `phone_action=${state.phoneActionCenter.ok ? "ok" : "fail"}`,
      `video_previews=${state.phoneActionCenter.videoPreviewCount ?? 0}`,
      `qr=${state.phoneActionCenter.qrBlockCount ?? 0}`,
    ],
    next: "Keep using the main MP4, QR story/square assets, and phone action center.",
  });
}

function workerRequirement(state) {
  const workers = Array.isArray(state.workerWake.workers) ? state.workerWake.workers : [];
  const allWorkers = WORKERS.every((worker) =>
    workers.some((row) => sameText(row.worker, worker) && row.current),
  );
  return requirement({
    id: "workers-awake",
    label: "Dexter/Sienna/Memo/Nano have current actions",
    status: state.workerWake.ok && allWorkers ? "proven" : "incomplete",
    severity: "critical",
    evidence: [
      `worker_wake=${state.workerWake.ok ? "ok" : "fail"}`,
      `workers=${workers.length}`,
      `state=${state.workerWake.proofState ?? "-"}`,
      `first=${formatAction(state.workerWake.firstAction)}`,
    ],
    next: "Wake the worker shown in the board and execute the real action before logging proof.",
  });
}

function dropletRequirement(state) {
  const summary = state.remoteWarRoom.summary ?? {};
  const total = Number(summary.totalHosts ?? 0);
  const requiredFields = [summary.okHosts, summary.workerWakesOk, summary.phoneActionCentersOk, summary.publicAttemptsOk];
  const hasRequiredFields = requiredFields.every((value) => Number.isFinite(Number(value)));
  if (total < 4 || !hasRequiredFields || !isFreshIso(state.remoteWarRoom.generatedAt)) {
    return requirement({
      id: "droplets-awake",
      label: "Four droplets have campaign tooling awake",
      status: "unknown",
      severity: "info",
      evidence: [
        total < 4 ? `fleet_war_room=leader_only_required host_view=${total || 0}/4` : "fleet_war_room=stale_or_missing_new_fields",
      ],
      next: "Use the leader remote war-room report to prove all four droplets together.",
    });
  }
  const ok =
    total >= 4 &&
    Number(summary.okHosts ?? 0) === total &&
    Number(summary.workerWakesOk ?? 0) === total &&
    Number(summary.phoneActionCentersOk ?? 0) === total &&
    Number(summary.publicAttemptsOk ?? 0) === total;
  return requirement({
    id: "droplets-awake",
    label: "Four droplets have campaign tooling awake",
    status: ok ? "proven" : "incomplete",
    severity: "critical",
    evidence: [
      `hosts=${summary.okHosts ?? 0}/${total}`,
      `worker_wake=${summary.workerWakesOk ?? 0}/${total}`,
      `phone_action=${summary.phoneActionCentersOk ?? 0}/${total}`,
      `public_attempts=${summary.publicAttemptsOk ?? 0}/${total}`,
      `unhealthy=${Array.isArray(summary.unhealthyHosts) ? summary.unhealthyHosts.join(",") || "none" : "-"}`,
    ],
    next: "Run the remote war-room and repair any infrastructure host failure before relying on the campaign loop.",
  });
}

function nonstopRequirement(state) {
  const summary = state.remoteWarRoom.summary ?? {};
  const total = Number(summary.totalHosts ?? 0);
  const requiredFields = [summary.loopsRunning, summary.watchdogLoopsRunning, summary.watchdogCronInstalled];
  const hasRequiredFields = requiredFields.every((value) => Number.isFinite(Number(value)));
  if (total < 4 || !hasRequiredFields || !isFreshIso(state.remoteWarRoom.generatedAt)) {
    return requirement({
      id: "nonstop-72h-loop",
      label: "Nonstop 72h campaign loop/watchdog is running",
      status: "unknown",
      severity: "info",
      evidence: [
        total < 4 ? `fleet_war_room=leader_only_required host_view=${total || 0}/4` : "fleet_war_room=stale_or_missing_new_fields",
      ],
      next: "Use the leader remote war-room report to prove all four loops and watchdogs together.",
    });
  }
  const running =
    total >= 4 &&
    Number(summary.loopsRunning ?? 0) === total &&
    Number(summary.watchdogLoopsRunning ?? 0) === total &&
    Number(summary.watchdogCronInstalled ?? 0) === total;
  return requirement({
    id: "nonstop-72h-loop",
    label: "Nonstop 72h campaign loop/watchdog is running",
    status: running ? "proven" : "incomplete",
    severity: "critical",
    evidence: [
      `loops=${summary.loopsRunning ?? 0}/${total}`,
      `watchdogs=${summary.watchdogLoopsRunning ?? 0}/${total}`,
      `watchdog_cron=${summary.watchdogCronInstalled ?? 0}/${total}`,
    ],
    next: "Restart campaign-loop/watchdog on any host that drops out.",
  });
}

function responseKitRequirement(state) {
  const replies = Array.isArray(state.responseKit.replies) ? state.responseKit.replies : [];
  const counts = state.responseKit.counts ?? {};
  const validReplies =
    replies.length >= 6 &&
    replies.every((reply) =>
      String(reply.copy ?? "").includes(REFERRAL_CODE) &&
      String(reply.copy ?? "").includes("worldcup26.world/login") &&
      String(reply.proofCommand ?? "").includes("campaign-proof-log.mjs"),
    );
  return requirement({
    id: "response-kit-ready",
    label: "Reply/conversion response kit is ready",
    status:
      Boolean(state.responseKit.ok) &&
      state.responseKit.referralCode === REFERRAL_CODE &&
      state.responseKit.referralLink === REFERRAL_LINK &&
      validReplies
        ? "proven"
        : "incomplete",
    severity: "critical",
    evidence: [
      `response_kit=${state.responseKit.ok ? "ok" : "fail"}`,
      `state=${state.responseKit.state ?? "-"}`,
      `replies=${replies.length}`,
      `warm_attempts=${counts.warmAttempts ?? 0}`,
      `signup_saves=${counts.signupSaves ?? 0}`,
    ],
    next: "Use the response kit after a real person replies, then log the reply proof only after it happened.",
  });
}

function firstHumanRequirement(state) {
  const actions = Array.isArray(state.firstHumanActions.actions) ? state.firstHumanActions.actions : [];
  const counts = state.firstHumanActions.counts ?? {};
  const realWarmSend = actions.find((action) => String(action.id ?? "") === "real-warm-send");
  const cleanSignupTest = actions.find((action) =>
    ["clean-signup-test", "clean-signup-test-batch"].includes(String(action.id ?? "")),
  );
  const valid =
    Boolean(state.firstHumanActions.ok) &&
    state.firstHumanActions.referralCode === REFERRAL_CODE &&
    state.firstHumanActions.referralLink === REFERRAL_LINK &&
    Boolean(realWarmSend) &&
    String(realWarmSend.command ?? "").includes("campaign-warm-send-log.mjs") &&
    String(realWarmSend.link ?? "").includes("ref=26BC4B90CB") &&
    Boolean(cleanSignupTest) &&
    /campaign-(signup-conversion-audit|public-channel-attempts)\.mjs/.test(String(cleanSignupTest.command ?? "")) &&
    String(state.firstHumanActions.rule ?? "").includes("Do not log planned work as proof");
  const warmAttempts = Number(counts.warmAttempts ?? 0);
  const signupSaves = Number(counts.signupSaves ?? 0);
  return requirement({
    id: "first-human-action-gate",
    label: "First human action gate is explicit",
    status: valid ? "proven" : "incomplete",
    severity: "critical",
    evidence: [
      `first_human=${state.firstHumanActions.ok ? "ok" : "fail"}`,
      `state=${state.firstHumanActions.state ?? "-"}`,
      `actions=${actions.length}`,
      `warm_attempts=${warmAttempts}`,
      `signup_saves=${signupSaves}`,
      `ad_clicks=${counts.dashboardClicks ?? 0}`,
      `first=${state.firstHumanActions.firstAction ? `${state.firstHumanActions.firstAction.owner ?? "-"}/${state.firstHumanActions.firstAction.channel ?? "-"}/${state.firstHumanActions.firstAction.id ?? "-"}` : "-"}`,
    ],
    next:
      warmAttempts > 0 || signupSaves > 0
        ? "Follow up the real warm send or signup-save proof, then update the conversion audit."
        : "Send the first real tester or warm-contact batch, then run the logger with the real count/account.",
  });
}

function advertisingProofRequirement(state) {
  const proofState = String(state.proofAudit.proofState ?? state.proofSla.proofState ?? "missing");
  const counts = state.proofAudit.counts ?? {};
  const urgent = Number(counts.urgentOpenRows ?? state.proofSla.counts?.urgentOpenRows ?? 0);
  const publicRows = Number(counts.publicUrlProofRows ?? 0);
  const externalRows = Number(counts.externalProofRows ?? 0);
  const latestAge = state.proofAudit.latestExternalProofAgeLabel ?? state.proofSla.latestExternalProofAgeLabel ?? "none";
  return requirement({
    id: "advertise-everywhere-proof",
    label: "Real external posting proof is current",
    status: proofState === "fresh" && urgent === 0 ? "proven" : "incomplete",
    severity: "critical",
    evidence: [
      `proof_state=${proofState}`,
      `latest_external=${latestAge}`,
      `external_rows=${externalRows}`,
      `public_rows=${publicRows}`,
      `urgent_open=${urgent}`,
      `next=${formatAction(nextProofAction(state))}`,
    ],
    next: "Do the next real action and log proof with a public URL or precise private-channel note.",
  });
}

function blockerRequirement(state) {
  const counts = state.publicAttempts.counts ?? {};
  const blocked = Number(counts.blocked ?? 0);
  const loginRequired = Number(counts.loginRequired ?? 0);
  return requirement({
    id: "public-channel-blockers",
    label: "Public channel blockers are tracked",
    status: state.publicAttempts.ok ? (blocked > 0 ? "blocked" : "proven") : "unknown",
    severity: blocked > 0 ? "warning" : "info",
    evidence: [
      `attempts=${counts.attempts ?? 0}`,
      `blocked=${blocked}`,
      `login_required=${loginRequired}`,
      `first_blocked=${state.publicAttempts.firstBlocked ? `${state.publicAttempts.firstBlocked.platform} / ${state.publicAttempts.firstBlocked.channel}` : "-"}`,
    ],
    next:
      blocked > 0
        ? "Use a logged-in owned public account or complete the login manually, then log the public URL."
        : "Keep rotating to the next available public channel.",
  });
}

function nextActionFrom(state) {
  const firstHuman = state.firstHumanActions.firstAction ?? null;
  const proofAction = nextProofAction(state);
  const blocked = state.publicAttempts.firstBlocked ?? null;
  return {
    primary: firstHuman
      ? {
          owner: String(firstHuman.owner ?? ""),
          channel: String(firstHuman.channel ?? ""),
          priority: String(firstHuman.id ?? ""),
          action: String(firstHuman.title ?? ""),
          asset: "media/worldcup26-main-video.mp4",
          proofCommand: String(firstHuman.command ?? ""),
        }
      : proofAction
      ? {
          owner: String(proofAction.owner ?? ""),
          channel: String(proofAction.channel ?? ""),
          priority: String(proofAction.priority ?? ""),
          action: String(proofAction.action ?? ""),
          asset: String(proofAction.asset ?? ""),
          proofCommand: String(proofAction.proofCommand ?? proofAction.proofIntakeCommand ?? ""),
        }
      : null,
    blocker: blocked
      ? {
          platform: String(blocked.platform ?? ""),
          channel: String(blocked.channel ?? ""),
          status: String(blocked.status ?? ""),
          nextAction: String(blocked.nextAction ?? ""),
        }
      : null,
  };
}

function nextProofAction(state) {
  const workerAction = state.workerWake.firstAction ?? null;
  if (String(workerAction?.priority ?? "").startsWith("warm-")) {
    return workerAction;
  }
  return state.proofSla.doNow?.[0] ?? state.proofAudit.firstMissingProofAction ?? null;
}

function requirement({ id, label, status, severity, evidence, next }) {
  return {
    id,
    label,
    status,
    severity,
    evidence,
    next,
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 objective audit ${payload.generatedAtEest}`,
    `state=${payload.state} audit_ok=${payload.ok ? "yes" : "no"} complete=${payload.complete ? "yes" : "no"} proven=${payload.counts.proven}/${payload.counts.total} critical_open=${payload.counts.critical}`,
    `code=${payload.referralCode}`,
    `link=${payload.referralLink}`,
    "",
    "requirements:",
  ];
  for (const row of payload.requirements) {
    lines.push(`- ${row.status.toUpperCase()} ${row.id}: ${row.label}`);
    lines.push(`  evidence=${row.evidence.join("; ")}`);
    lines.push(`  next=${row.next}`);
  }
  if (payload.nextAction.primary) {
    lines.push("");
    lines.push(
      `next_real_action=#${payload.nextAction.primary.priority} ${payload.nextAction.primary.owner} / ${payload.nextAction.primary.channel}`,
    );
    lines.push(`action=${payload.nextAction.primary.action}`);
    lines.push(`asset=${payload.nextAction.primary.asset}`);
    lines.push(`proof_command=${payload.nextAction.primary.proofCommand}`);
  }
  if (payload.nextAction.blocker) {
    lines.push("");
    lines.push(
      `public_blocker=${payload.nextAction.blocker.platform} / ${payload.nextAction.blocker.channel} status=${payload.nextAction.blocker.status}`,
    );
    lines.push(`blocker_next=${payload.nextAction.blocker.nextAction}`);
  }
  lines.push("", `Truth: ${payload.truth}`, "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Objective Audit

Generated: ${payload.generatedAtEest}

- State: ${payload.state}
- Audit OK: ${payload.ok ? "yes" : "no"}
- Complete: ${payload.complete ? "yes" : "no"}
- Proven: ${payload.counts.proven}/${payload.counts.total}
- Critical open: ${payload.counts.critical}
- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}

${payload.truth}

## Requirements

${payload.requirements.map(renderRequirementMarkdown).join("\n\n")}

## Next Real Action

${payload.nextAction.primary ? renderPrimaryAction(payload.nextAction.primary) : "No proof action found."}

## Public Blocker

${payload.nextAction.blocker ? renderBlocker(payload.nextAction.blocker) : "No public blocker currently tracked."}
`;
}

function renderRequirementMarkdown(row) {
  return `### ${row.status.toUpperCase()} - ${row.label}

- ID: \`${row.id}\`
- Severity: ${row.severity}
- Evidence: ${row.evidence.join("; ")}
- Next: ${row.next}`;
}

function renderPrimaryAction(action) {
  return `- Priority: #${action.priority}
- Owner: ${action.owner}
- Channel: ${action.channel}
- Action: ${action.action}
- Asset: \`${action.asset}\`

\`\`\`bash
${action.proofCommand}
\`\`\``;
}

function renderBlocker(blocker) {
  return `- Platform: ${blocker.platform}
- Channel: ${blocker.channel}
- Status: ${blocker.status}
- Next: ${blocker.nextAction}`;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Objective Audit</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2a20; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bad0c6; --gold: #ffd974; --mint: #74f0b2; --danger: #ff9f9f; --warn: #ffd08a; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(255,217,116,.18), transparent 24rem), radial-gradient(circle at 92% 4%, rgba(116,240,178,.14), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1080px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, article { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,42,32,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(34px, 8vw, 68px); line-height: .92; }
    h2 { margin: 0 0 8px; font-size: 20px; }
    p { color: var(--muted); line-height: 1.4; margin: 0 0 8px; }
    .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .stat { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 11px; text-transform: uppercase; font-weight: 900; }
    .stat strong { display: block; color: var(--gold); font-size: 22px; }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .pill { display: inline-flex; margin-bottom: 8px; padding: 6px 9px; border-radius: 999px; color: #03140f; background: var(--mint); font-weight: 950; text-transform: uppercase; }
    .pill.incomplete { background: var(--danger); }
    .pill.blocked { background: var(--warn); }
    .pill.unknown { background: #ccd5d2; }
    code, pre { overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.22); padding: 10px; }
    @media (max-width: 760px) { .stats, .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Objective Audit</h1>
      <p>${escapeHtml(payload.truth)}</p>
      <div class="stats">
        <div class="stat"><span>State</span><strong>${escapeHtml(payload.state)}</strong></div>
        <div class="stat"><span>Proven</span><strong>${payload.counts.proven}/${payload.counts.total}</strong></div>
        <div class="stat"><span>Critical Open</span><strong>${payload.counts.critical}</strong></div>
        <div class="stat"><span>Code</span><strong>${payload.referralCode}</strong></div>
      </div>
    </header>
    <section class="grid">
      ${payload.requirements.map(renderRequirementCard).join("")}
    </section>
  </main>
</body>
</html>`;
}

function renderRequirementCard(row) {
  return `<article>
    <span class="pill ${escapeAttr(row.status)}">${escapeHtml(row.status)}</span>
    <h2>${escapeHtml(row.label)}</h2>
    <p>${escapeHtml(row.evidence.join("; "))}</p>
    <p><strong>Next:</strong> ${escapeHtml(row.next)}</p>
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
  const parsed = { quiet: false, root: "", now: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
  }
  return parsed;
}

function formatAction(row) {
  if (!row) return "-";
  const priority = row.priority ?? row.nextPriority ?? "";
  const owner = row.owner ?? row.worker ?? "";
  const channel = row.channel ?? row.nextChannel ?? "";
  return `#${priority} ${owner} / ${channel}`.trim();
}

function sameText(left, right) {
  return String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();
}

function isFreshIso(value, maxSeconds = 2_100) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return false;
  const ageSeconds = Math.max(0, Math.floor((now.getTime() - parsed.getTime()) / 1000));
  return ageSeconds <= maxSeconds;
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
