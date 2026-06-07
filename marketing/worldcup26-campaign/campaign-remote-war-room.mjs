#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_HOSTS = ["dexter", "sienna", "memo", "nano"];
const CAMPAIGN_REMOTE_DIR = "~/DavidAi/worldcup26-promo-kit/campaign";
const DEFAULT_FRESH_SECONDS = 2_100;

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const hosts = args.hosts.length > 0 ? args.hosts : DEFAULT_HOSTS;
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const payload = {
  generatedAt: now.toISOString(),
  generatedAtEest: formatEestLogTime(now),
  localFunnel: normalizeLocalFunnel(await readLocalReferralActivity()),
  hosts: hosts.map(loadHostState),
};
payload.summary = summarize(payload.hosts, payload.localFunnel);

await writeFile(path.join(runtimeDir, "remote-war-room.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "remote-war-room.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "remote-war-room.html"), renderHtml(payload));
await writeFile(path.join(runtimeDir, "remote-war-room.txt"), renderText(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function loadHostState(host) {
  try {
    const output = execFileSync("ssh", [host, remoteCommand()], {
      encoding: "utf8",
      timeout: args.timeoutMs,
      maxBuffer: 2 * 1024 * 1024,
    });
    const [jsonPart, linkAndPaidTraffic = ""] = output.split("\n---LINK---\n");
    const [linkPart = "{}", paidTrafficAndLiveAdQa = ""] = linkAndPaidTraffic.split("\n---PAID_TRAFFIC---\n");
    const [paidTrafficPart = "{}", liveAdQaAndAdPlatform = ""] = paidTrafficAndLiveAdQa.split("\n---LIVE_AD_QA---\n");
    const [liveAdQaPart = "{}", adPlatformAndConversion = ""] = liveAdQaAndAdPlatform.split("\n---AD_PLATFORM---\n");
    const [adPlatformPart = "{}", conversionAndSprint = ""] = adPlatformAndConversion.split("\n---CONVERSION---\n");
    const [conversionPart = "{}", sprintAndProofStall = ""] = conversionAndSprint.split("\n---SPRINT---\n");
    const [sprintPart = "{}", proofStallAndRest = ""] = sprintAndProofStall.split("\n---PROOF_STALL---\n");
    const [proofStallPart = "{}", proofSlaAndRest = ""] = proofStallAndRest.split("\n---PROOF_SLA---\n");
    const [proofSlaPart = "{}", proofRescueAndRest = ""] = proofSlaAndRest.split("\n---PROOF_RESCUE---\n");
    const [proofRescuePart = "{}", proofUrlRecoveryAndRest = ""] = proofRescueAndRest.split("\n---PROOF_URL_RECOVERY---\n");
    const [proofUrlRecoveryPart = "{}", socialRescueAndRest = ""] = proofUrlRecoveryAndRest.split("\n---SOCIAL_RESCUE---\n");
    const [socialRescuePart = "{}", zeroSignupAndRest = ""] = socialRescueAndRest.split("\n---ZERO_SIGNUP_RESCUE---\n");
    const [zeroSignupPart = "{}", realActionAndRest = ""] = zeroSignupAndRest.split("\n---REAL_ACTION_BRIDGE---\n");
    const [realActionPart = "{}", oneClickShareAndRest = ""] = realActionAndRest.split("\n---ONE_CLICK_SHARE---\n");
    const [oneClickSharePart = "{}", publicOutreachAndRest = ""] = oneClickShareAndRest.split("\n---PUBLIC_OUTREACH_TARGETS---\n");
    const [publicOutreachPart = "{}", adOpsAndRest = ""] = publicOutreachAndRest.split("\n---AD_OPS_LINKS---\n");
    const [adOpsPart = "{}", paidAdTriageAndRest = ""] = adOpsAndRest.split("\n---PAID_AD_TRIAGE---\n");
    const [paidAdTriagePart = "{}", paidNoClickAndRest = ""] = paidAdTriageAndRest.split("\n---PAID_NO_CLICK_RESCUE---\n");
    const [paidNoClickPart = "{}", paidDashboardAndRest = ""] = paidNoClickAndRest.split("\n---PAID_DASHBOARD_CHECKS---\n");
    const [paidDashboardPart = "{}", referralActivityAndRest = ""] = paidDashboardAndRest.split("\n---REFERRAL_ACTIVITY---\n");
    const [referralActivityPart = "{}", signupConversionAndRest = ""] = referralActivityAndRest.split("\n---SIGNUP_CONVERSION---\n");
    const [signupConversionPart = "{}", warmContactAndRest = ""] = signupConversionAndRest.split("\n---WARM_CONTACT---\n");
    const [warmContactPart = "{}", warmFollowupAndRest = ""] = warmContactAndRest.split("\n---WARM_FOLLOWUP---\n");
    const [warmFollowupPart = "{}", responseKitAndRest = ""] = warmFollowupAndRest.split("\n---RESPONSE_KIT---\n");
    const [responseKitPart = "{}", firstHumanAndRest = ""] = responseKitAndRest.split("\n---FIRST_HUMAN_ACTIONS---\n");
    const [firstHumanPart = "{}", firstSendBridgeAndRest = ""] = firstHumanAndRest.split("\n---FIRST_SEND_BRIDGE---\n");
    const [firstSendBridgePart = "{}", postingCockpitAndRest = ""] = firstSendBridgeAndRest.split("\n---POSTING_COCKPIT---\n");
    const [postingCockpitPart = "{}", phoneActionAndProofCloseout = ""] = postingCockpitAndRest.split("\n---PHONE_ACTION---\n");
    const [phoneActionPart = "{}", proofCloseoutAndWorkerWake = ""] = phoneActionAndProofCloseout.split("\n---PROOF_CLOSEOUT---\n");
    const [proofCloseoutPart = "{}", workerWakeAndRest = ""] = proofCloseoutAndWorkerWake.split("\n---WORKER_WAKE---\n");
    const [workerWakePart = "{}", sessionRecoveryAndRest = ""] = workerWakeAndRest.split("\n---SESSION_RECOVERY---\n");
    const [sessionRecoveryPart = "{}", escalationAndRest = ""] = sessionRecoveryAndRest.split("\n---ESCALATION---\n");
    const [escalationPart = "{}", publicAttemptsAndRest = ""] = escalationAndRest.split("\n---PUBLIC_ATTEMPTS---\n");
    const [publicAttemptsPart = "{}", loginUnlockAndRest = ""] = publicAttemptsAndRest.split("\n---LOGIN_UNLOCK---\n");
    const [loginUnlockPart = "{}", objectiveAuditAndRest = ""] = loginUnlockAndRest.split("\n---OBJECTIVE_AUDIT---\n");
    const [objectiveAuditPart = "{}", operatorPushAndRest = ""] = objectiveAuditAndRest.split("\n---OPERATOR_PUSH---\n");
    const [operatorPushPart = "{}", rest = ""] = operatorPushAndRest.split("\n---LOG---\n");
    const [logPart = "", psAndCronPart = ""] = rest.split("\n---PS---\n");
    const [psPart = "", cronPart = ""] = psAndCronPart.split("\n---CRON---\n");
    const hotPing = JSON.parse(jsonPart);
    const linkSentinel = parseJson(linkPart, { ok: false, checks: [] });
    const paidTrafficGuard = parseJson(paidTrafficPart, { ok: false, checks: { pages: [] } });
    const liveAdQa = parseJson(liveAdQaPart, { ok: false, checks: { pages: [] } });
    const adPlatformAudit = parseJson(adPlatformPart, { ok: false, checks: { pages: [] } });
    const conversionGuard = parseJson(conversionPart, { ok: false, checks: { firstPaint: [] } });
    const postingSprint = parseJson(sprintPart, { cards: [] });
    const proofStall = parseJson(proofStallPart, { ok: false });
    const proofSla = parseJson(proofSlaPart, { ok: false });
    const proofRescue = parseJson(proofRescuePart, { ok: false });
    const proofUrlRecovery = parseJson(proofUrlRecoveryPart, { ok: false });
    const socialRescue = parseJson(socialRescuePart, { ok: false });
    const zeroSignupRescue = parseJson(zeroSignupPart, { ok: false });
    const realActionBridge = parseJson(realActionPart, { ok: false });
    const oneClickShare = parseJson(oneClickSharePart, { ok: false });
    const publicOutreachTargets = parseJson(publicOutreachPart, { ok: false });
    const adOpsLinks = parseJson(adOpsPart, { ok: false });
    const paidAdTriage = parseJson(paidAdTriagePart, { ok: false });
    const paidNoClickRescue = parseJson(paidNoClickPart, { ok: false });
    const paidDashboard = parseJson(paidDashboardPart, { ok: false });
    const referralActivity = parseJson(referralActivityPart, { ok: false });
    const signupConversion = parseJson(signupConversionPart, { ok: false });
    const warmContact = parseJson(warmContactPart, { ok: false });
    const warmFollowup = parseJson(warmFollowupPart, { ok: false });
    const responseKit = parseJson(responseKitPart, { ok: false });
    const firstHumanActions = parseJson(firstHumanPart, { ok: false });
    const firstSendBridge = parseJson(firstSendBridgePart, { ok: false });
    const postingCockpit = parseJson(postingCockpitPart, { ok: false });
    const phoneActionCenter = parseJson(phoneActionPart, { ok: false });
    const proofCloseout = parseJson(proofCloseoutPart, { ok: false });
    const workerWake = parseJson(workerWakePart, { ok: false });
    const sessionRecovery = parseJson(sessionRecoveryPart, { recoveryActions: [] });
    const escalation = parseJson(escalationPart, { byWorker: [] });
    const publicAttempts = parseJson(publicAttemptsPart, { ok: false });
    const loginUnlock = parseJson(loginUnlockPart, { ok: false });
    const objectiveAudit = parseJson(objectiveAuditPart, { ok: false });
    const operatorPush = parseJson(operatorPushPart, { ok: false });
    const loopRows = psPart
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.includes("campaign-loop.sh run"))
      .filter((line) => !line.includes("bash -c") && !line.includes("awk"));
    const watchdogRows = psPart
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.includes("campaign-watchdog-loop.sh run"))
      .filter((line) => !line.includes("bash -c") && !line.includes("awk"));
    const logLines = logPart.split(/\n/).map((line) => line.trim()).filter(Boolean);
    const cronInstalled =
      cronPart.includes("worldcup26-campaign-watchdog-loop:start") &&
      cronPart.includes("campaign-watchdog-loop.sh start");
    const workers = (hotPing.workers ?? []).map(normalizeWorker);
    const hotPingFresh = isFreshIso(hotPing.generatedAt);
    return {
      host,
      ok: true,
      generatedAtEest: hotPing.generatedAtEest,
      hotPingFresh,
      proof: Number(hotPing.liveProofRows ?? 0),
      urgent: Number(hotPing.urgentProofGaps ?? 0),
      hotWorkers: Number(hotPing.hotWorkers ?? 0),
      first: normalizeFirst(selectHostWorker(hotPing, host)),
      workers,
      loopRows,
      loopRunning: loopRows.length > 0,
      watchdogRows,
      watchdogRunning: watchdogRows.length > 0,
      watchdogCronInstalled: cronInstalled,
      hotPingHookOk: hotPingFresh || logLines.some((line) => line.includes("hot-proof-ping ok")),
      linkSentinelOk: Boolean(linkSentinel.ok),
      linkSentinelFresh: isFreshIso(linkSentinel.generatedAt),
      linkGeneratedAtEest: linkSentinel.generatedAtEest ? String(linkSentinel.generatedAtEest) : "",
      linkChecks: Array.isArray(linkSentinel.checks) ? linkSentinel.checks.map(normalizeLinkCheck) : [],
      paidTrafficOk: isPaidTrafficOk(paidTrafficGuard),
      paidTrafficFresh: isFreshIso(paidTrafficGuard.generatedAt),
      paidTrafficGeneratedAtEest: paidTrafficGuard.generatedAtEest ? String(paidTrafficGuard.generatedAtEest) : "",
      paidTraffic: normalizePaidTraffic(paidTrafficGuard),
      liveAdQaOk: isLiveAdQaOk(liveAdQa),
      liveAdQaFresh: isFreshIso(liveAdQa.generatedAt),
      liveAdQaGeneratedAtEest: liveAdQa.generatedAtEest ? String(liveAdQa.generatedAtEest) : "",
      liveAdQa: normalizeLiveAdQa(liveAdQa),
      adPlatformAuditOk: isAdPlatformAuditOk(adPlatformAudit),
      adPlatformAuditFresh: isFreshIso(adPlatformAudit.generatedAt),
      adPlatformAuditGeneratedAtEest: adPlatformAudit.generatedAtEest
        ? String(adPlatformAudit.generatedAtEest)
        : "",
      adPlatformAudit: normalizeAdPlatformAudit(adPlatformAudit),
      conversionGuardOk: isConversionGuardOk(conversionGuard),
      conversionGuardFresh: isFreshIso(conversionGuard.generatedAt),
      conversionGuardGeneratedAtEest: conversionGuard.generatedAtEest
        ? String(conversionGuard.generatedAtEest)
        : "",
      conversionGuard: normalizeConversionGuard(conversionGuard),
      postingSprintOk: isPostingSprintOk(postingSprint, hotPing),
      postingSprintFresh: isFreshIso(postingSprint.generatedAt),
      postingSprintGeneratedAtEest: postingSprint.generatedAtEest ? String(postingSprint.generatedAtEest) : "",
      postingSprintCards: Array.isArray(postingSprint.cards) ? postingSprint.cards.map(normalizeSprintCard) : [],
      proofActivityOk: Boolean(proofStall.ok),
      proofStallFresh: isFreshIso(proofStall.generatedAt),
      proofStallGeneratedAtEest: proofStall.generatedAtEest ? String(proofStall.generatedAtEest) : "",
      proofStall: normalizeProofStall(proofStall),
      proofSlaOk: isProofSlaOk(proofSla),
      proofSlaFresh: isFreshIso(proofSla.generatedAt),
      proofSlaGeneratedAtEest: proofSla.generatedAtEest ? String(proofSla.generatedAtEest) : "",
      proofSla: normalizeProofSla(proofSla),
      proofRescueOk: isProofRescueOk(proofRescue),
      proofRescueFresh: isFreshIso(proofRescue.generatedAt),
      proofRescueGeneratedAtEest: proofRescue.generatedAtEest ? String(proofRescue.generatedAtEest) : "",
      proofRescue: normalizeProofRescue(proofRescue),
      proofUrlRecoveryOk: isProofUrlRecoveryOk(proofUrlRecovery),
      proofUrlRecoveryFresh: isFreshIso(proofUrlRecovery.generatedAt),
      proofUrlRecoveryGeneratedAtEest: proofUrlRecovery.generatedAtEest ? String(proofUrlRecovery.generatedAtEest) : "",
      proofUrlRecovery: normalizeProofUrlRecovery(proofUrlRecovery),
      socialRescueOk: isSocialRescueOk(socialRescue),
      socialRescueFresh: isFreshIso(socialRescue.generatedAt),
      socialRescueGeneratedAtEest: socialRescue.generatedAtEest ? String(socialRescue.generatedAtEest) : "",
      socialRescue: normalizeSocialRescue(socialRescue),
      zeroSignupRescueOk: Boolean(zeroSignupRescue.ok),
      zeroSignupRescueFresh: isFreshIso(zeroSignupRescue.generatedAt),
      zeroSignupRescueGeneratedAtEest: zeroSignupRescue.generatedAtEest
        ? String(zeroSignupRescue.generatedAtEest)
        : "",
      zeroSignupRescue: normalizeZeroSignupRescue(zeroSignupRescue),
      realActionBridgeOk: isRealActionBridgeOk(realActionBridge),
      realActionBridgeFresh: isFreshIso(realActionBridge.generatedAt),
      realActionBridgeGeneratedAtEest: realActionBridge.generatedAtEest
        ? String(realActionBridge.generatedAtEest)
        : "",
      realActionBridge: normalizeRealActionBridge(realActionBridge),
      oneClickShareOk: isOneClickShareOk(oneClickShare),
      oneClickShareFresh: isFreshIso(oneClickShare.generatedAt),
      oneClickShareGeneratedAtEest: oneClickShare.generatedAtEest
        ? String(oneClickShare.generatedAtEest)
        : "",
      oneClickShare: normalizeOneClickShare(oneClickShare),
      publicOutreachTargetsOk: isPublicOutreachTargetsOk(publicOutreachTargets),
      publicOutreachTargetsFresh: isFreshIso(publicOutreachTargets.generatedAt),
      publicOutreachTargetsGeneratedAtEest: publicOutreachTargets.generatedAtEest
        ? String(publicOutreachTargets.generatedAtEest)
        : "",
      publicOutreachTargets: normalizePublicOutreachTargets(publicOutreachTargets),
      adOpsLinksOk: isAdOpsLinksOk(adOpsLinks),
      adOpsLinksFresh: isFreshIso(adOpsLinks.generatedAt),
      adOpsLinksGeneratedAtEest: adOpsLinks.generatedAtEest ? String(adOpsLinks.generatedAtEest) : "",
      adOpsLinks: normalizeAdOpsLinks(adOpsLinks),
      paidAdTriageOk: isPaidAdTriageOk(paidAdTriage),
      paidAdTriageFresh: isFreshIso(paidAdTriage.generatedAt),
      paidAdTriageGeneratedAtEest: paidAdTriage.generatedAtEest
        ? String(paidAdTriage.generatedAtEest)
        : "",
      paidAdTriage: normalizePaidAdTriage(paidAdTriage),
      paidNoClickRescueOk: isPaidNoClickRescueOk(paidNoClickRescue),
      paidNoClickRescueFresh: isFreshIso(paidNoClickRescue.generatedAt),
      paidNoClickRescueGeneratedAtEest: paidNoClickRescue.generatedAtEest
        ? String(paidNoClickRescue.generatedAtEest)
        : "",
      paidNoClickRescue: normalizePaidNoClickRescue(paidNoClickRescue),
      paidDashboardOk: isPaidDashboardOk(paidDashboard),
      paidDashboardFresh: isFreshIso(paidDashboard.generatedAt),
      paidDashboardGeneratedAtEest: paidDashboard.generatedAtEest ? String(paidDashboard.generatedAtEest) : "",
      paidDashboard: normalizePaidDashboard(paidDashboard),
      referralActivityOk: isReferralActivityOk(referralActivity),
      referralActivityFresh: isFreshIso(referralActivity.generatedAt),
      referralActivityAvailable: Boolean(referralActivity.available),
      referralActivityGeneratedAtEest: referralActivity.generatedAtEest
        ? String(referralActivity.generatedAtEest)
        : "",
      referralActivity: normalizeReferralActivity(referralActivity),
      signupConversionOk: isSignupConversionOk(signupConversion),
      signupConversionFresh: isFreshIso(signupConversion.generatedAt),
      signupConversionGeneratedAtEest: signupConversion.generatedAtEest
        ? String(signupConversion.generatedAtEest)
        : "",
      signupConversion: normalizeSignupConversion(signupConversion),
      warmContactOk: isWarmContactOk(warmContact),
      warmContactFresh: isFreshIso(warmContact.generatedAt),
      warmContactGeneratedAtEest: warmContact.generatedAtEest ? String(warmContact.generatedAtEest) : "",
      warmContact: normalizeWarmContact(warmContact),
      warmFollowupOk: isWarmFollowupOk(warmFollowup),
      warmFollowupFresh: isFreshIso(warmFollowup.generatedAt),
      warmFollowupGeneratedAtEest: warmFollowup.generatedAtEest ? String(warmFollowup.generatedAtEest) : "",
      warmFollowup: normalizeWarmFollowup(warmFollowup),
      responseKitOk: isResponseKitOk(responseKit),
      responseKitFresh: isFreshIso(responseKit.generatedAt),
      responseKitGeneratedAtEest: responseKit.generatedAtEest ? String(responseKit.generatedAtEest) : "",
      responseKit: normalizeResponseKit(responseKit),
      firstHumanActionsOk: isFirstHumanActionsOk(firstHumanActions),
      firstHumanActionsFresh: isFreshIso(firstHumanActions.generatedAt),
      firstHumanActionsGeneratedAtEest: firstHumanActions.generatedAtEest
        ? String(firstHumanActions.generatedAtEest)
        : "",
      firstHumanActions: normalizeFirstHumanActions(firstHumanActions),
      firstSendBridgeOk: isFirstSendBridgeOk(firstSendBridge),
      firstSendBridgeFresh: isFreshIso(firstSendBridge.generatedAt),
      firstSendBridgeGeneratedAtEest: firstSendBridge.generatedAtEest
        ? String(firstSendBridge.generatedAtEest)
        : "",
      firstSendBridge: normalizeFirstSendBridge(firstSendBridge),
      postingCockpitOk: isPostingCockpitOk(postingCockpit),
      postingCockpitFresh: isFreshIso(postingCockpit.generatedAt),
      postingCockpitGeneratedAtEest: postingCockpit.generatedAtEest ? String(postingCockpit.generatedAtEest) : "",
      postingCockpit: normalizePostingCockpit(postingCockpit),
      phoneActionCenterOk: isPhoneActionCenterOk(phoneActionCenter),
      phoneActionCenterFresh: isFreshIso(phoneActionCenter.generatedAt),
      phoneActionCenterGeneratedAtEest: phoneActionCenter.generatedAtEest
        ? String(phoneActionCenter.generatedAtEest)
        : "",
      phoneActionCenter: normalizePhoneActionCenter(phoneActionCenter),
      proofCloseoutOk: isProofCloseoutOk(proofCloseout),
      proofCloseoutFresh: isFreshIso(proofCloseout.generatedAt),
      proofCloseoutGeneratedAtEest: proofCloseout.generatedAtEest
        ? String(proofCloseout.generatedAtEest)
        : "",
      proofCloseout: normalizeProofCloseout(proofCloseout),
      workerWakeOk: isWorkerWakeOk(workerWake),
      workerWakeFresh: isFreshIso(workerWake.generatedAt),
      workerWakeGeneratedAtEest: workerWake.generatedAtEest ? String(workerWake.generatedAtEest) : "",
      workerWake: normalizeWorkerWake(workerWake),
      sessionRecoveryOk: isSessionRecoveryOk(sessionRecovery),
      sessionRecoveryFresh: isFreshIso(sessionRecovery.generatedAt),
      sessionRecoveryGeneratedAtEest: sessionRecovery.generatedAtEest ? String(sessionRecovery.generatedAtEest) : "",
      sessionRecovery: normalizeSessionRecovery(sessionRecovery),
      escalationOk: isEscalationOk(escalation, hotPing),
      escalationFresh: isFreshIso(escalation.generatedAt),
      escalationGeneratedAtEest: escalation.generatedAtEest ? String(escalation.generatedAtEest) : "",
      escalation: normalizeEscalation(escalation),
      publicAttemptsOk: isPublicAttemptsOk(publicAttempts),
      publicAttemptsFresh: isFreshIso(publicAttempts.generatedAt),
      publicAttemptsGeneratedAtEest: publicAttempts.generatedAtEest
        ? String(publicAttempts.generatedAtEest)
        : "",
      publicAttempts: normalizePublicAttempts(publicAttempts),
      loginUnlockOk: isLoginUnlockOk(loginUnlock),
      loginUnlockFresh: isFreshIso(loginUnlock.generatedAt),
      loginUnlockGeneratedAtEest: loginUnlock.generatedAtEest ? String(loginUnlock.generatedAtEest) : "",
      loginUnlock: normalizeLoginUnlock(loginUnlock),
      objectiveAuditOk: isObjectiveAuditOk(objectiveAudit),
      objectiveAuditFresh: isFreshIso(objectiveAudit.generatedAt),
      objectiveAuditGeneratedAtEest: objectiveAudit.generatedAtEest
        ? String(objectiveAudit.generatedAtEest)
        : "",
      objectiveAudit: normalizeObjectiveAudit(objectiveAudit),
      operatorPushOk: isOperatorPushOk(operatorPush),
      operatorPushFresh: isFreshIso(operatorPush.generatedAt),
      operatorPushGeneratedAtEest: operatorPush.generatedAtEest
        ? String(operatorPush.generatedAtEest)
        : "",
      operatorPush: normalizeOperatorPush(operatorPush),
      lastLogLines: logLines.slice(-8),
    };
  } catch (error) {
    return {
      host,
      ok: false,
      error: error.message,
      proof: 0,
      urgent: 0,
      hotWorkers: 0,
      first: null,
      workers: [],
      loopRows: [],
      loopRunning: false,
      watchdogRows: [],
      watchdogRunning: false,
      watchdogCronInstalled: false,
      hotPingHookOk: false,
      hotPingFresh: false,
      linkSentinelOk: false,
      linkSentinelFresh: false,
      linkGeneratedAtEest: "",
      linkChecks: [],
      paidTrafficOk: false,
      paidTrafficFresh: false,
      paidTrafficGeneratedAtEest: "",
      paidTraffic: normalizePaidTraffic({}),
      liveAdQaOk: false,
      liveAdQaFresh: false,
      liveAdQaGeneratedAtEest: "",
      liveAdQa: normalizeLiveAdQa({}),
      adPlatformAuditOk: false,
      adPlatformAuditFresh: false,
      adPlatformAuditGeneratedAtEest: "",
      adPlatformAudit: normalizeAdPlatformAudit({}),
      conversionGuardOk: false,
      conversionGuardFresh: false,
      conversionGuardGeneratedAtEest: "",
      conversionGuard: normalizeConversionGuard({}),
      postingSprintOk: false,
      postingSprintFresh: false,
      postingSprintGeneratedAtEest: "",
      postingSprintCards: [],
      proofActivityOk: false,
      proofStallFresh: false,
      proofStallGeneratedAtEest: "",
      proofStall: normalizeProofStall({}),
      proofSlaOk: false,
      proofSlaFresh: false,
      proofSlaGeneratedAtEest: "",
      proofSla: normalizeProofSla({}),
      proofRescueOk: false,
      proofRescueFresh: false,
      proofRescueGeneratedAtEest: "",
      proofRescue: normalizeProofRescue({}),
      proofUrlRecoveryOk: false,
      proofUrlRecoveryFresh: false,
      proofUrlRecoveryGeneratedAtEest: "",
      proofUrlRecovery: normalizeProofUrlRecovery({}),
      socialRescueOk: false,
      socialRescueFresh: false,
      socialRescueGeneratedAtEest: "",
      socialRescue: normalizeSocialRescue({}),
      zeroSignupRescueOk: false,
      zeroSignupRescueFresh: false,
      zeroSignupRescueGeneratedAtEest: "",
      zeroSignupRescue: normalizeZeroSignupRescue({}),
      realActionBridgeOk: false,
      realActionBridgeFresh: false,
      realActionBridgeGeneratedAtEest: "",
      realActionBridge: normalizeRealActionBridge({}),
      oneClickShareOk: false,
      oneClickShareFresh: false,
      oneClickShareGeneratedAtEest: "",
      oneClickShare: normalizeOneClickShare({}),
      publicOutreachTargetsOk: false,
      publicOutreachTargetsFresh: false,
      publicOutreachTargetsGeneratedAtEest: "",
      publicOutreachTargets: normalizePublicOutreachTargets({}),
      adOpsLinksOk: false,
      adOpsLinksFresh: false,
      adOpsLinksGeneratedAtEest: "",
      adOpsLinks: normalizeAdOpsLinks({}),
      paidAdTriageOk: false,
      paidAdTriageFresh: false,
      paidAdTriageGeneratedAtEest: "",
      paidAdTriage: normalizePaidAdTriage({}),
      paidNoClickRescueOk: false,
      paidNoClickRescueFresh: false,
      paidNoClickRescueGeneratedAtEest: "",
      paidNoClickRescue: normalizePaidNoClickRescue({}),
      paidDashboardOk: false,
      paidDashboardFresh: false,
      paidDashboardGeneratedAtEest: "",
      paidDashboard: normalizePaidDashboard({}),
      referralActivityOk: false,
      referralActivityFresh: false,
      referralActivityAvailable: false,
      referralActivityGeneratedAtEest: "",
      referralActivity: normalizeReferralActivity({}),
      signupConversionOk: false,
      signupConversionFresh: false,
      signupConversionGeneratedAtEest: "",
      signupConversion: normalizeSignupConversion({}),
      warmContactOk: false,
      warmContactFresh: false,
      warmContactGeneratedAtEest: "",
      warmContact: normalizeWarmContact({}),
      warmFollowupOk: false,
      warmFollowupFresh: false,
      warmFollowupGeneratedAtEest: "",
      warmFollowup: normalizeWarmFollowup({}),
      responseKitOk: false,
      responseKitFresh: false,
      responseKitGeneratedAtEest: "",
      responseKit: normalizeResponseKit({}),
      firstHumanActionsOk: false,
      firstHumanActionsFresh: false,
      firstHumanActionsGeneratedAtEest: "",
      firstHumanActions: normalizeFirstHumanActions({}),
      firstSendBridgeOk: false,
      firstSendBridgeFresh: false,
      firstSendBridgeGeneratedAtEest: "",
      firstSendBridge: normalizeFirstSendBridge({}),
      postingCockpitOk: false,
      postingCockpitFresh: false,
      postingCockpitGeneratedAtEest: "",
      postingCockpit: normalizePostingCockpit({}),
      phoneActionCenterOk: false,
      phoneActionCenterFresh: false,
      phoneActionCenterGeneratedAtEest: "",
      phoneActionCenter: normalizePhoneActionCenter({}),
      proofCloseoutOk: false,
      proofCloseoutFresh: false,
      proofCloseoutGeneratedAtEest: "",
      proofCloseout: normalizeProofCloseout({}),
      workerWakeOk: false,
      workerWakeFresh: false,
      workerWakeGeneratedAtEest: "",
      workerWake: normalizeWorkerWake({}),
      sessionRecoveryOk: false,
      sessionRecoveryFresh: false,
      sessionRecoveryGeneratedAtEest: "",
      sessionRecovery: normalizeSessionRecovery({}),
      escalationOk: false,
      escalationFresh: false,
      escalationGeneratedAtEest: "",
      escalation: normalizeEscalation({}),
      publicAttemptsOk: false,
      publicAttemptsFresh: false,
      publicAttemptsGeneratedAtEest: "",
      publicAttempts: normalizePublicAttempts({}),
      loginUnlockOk: false,
      loginUnlockFresh: false,
      loginUnlockGeneratedAtEest: "",
      loginUnlock: normalizeLoginUnlock({}),
      objectiveAuditOk: false,
      objectiveAuditFresh: false,
      objectiveAuditGeneratedAtEest: "",
      objectiveAudit: normalizeObjectiveAudit({}),
      operatorPushOk: false,
      operatorPushFresh: false,
      operatorPushGeneratedAtEest: "",
      operatorPush: normalizeOperatorPush({}),
      lastLogLines: [],
    };
  }
}

function remoteCommand() {
  return [
    `cd ${CAMPAIGN_REMOTE_DIR}`,
    "cat runtime/hot-proof-ping.json",
    "printf '\\n---LINK---\\n'",
    "cat runtime/link-sentinel.json 2>/dev/null || printf '{}'",
    "printf '\\n---PAID_TRAFFIC---\\n'",
    "cat runtime/paid-traffic-guard.json 2>/dev/null || printf '{}'",
    "printf '\\n---LIVE_AD_QA---\\n'",
    "cat runtime/live-ad-qa.json 2>/dev/null || printf '{}'",
    "printf '\\n---AD_PLATFORM---\\n'",
    "cat runtime/ad-platform-audit.json 2>/dev/null || printf '{}'",
    "printf '\\n---CONVERSION---\\n'",
    "cat runtime/conversion-guard.json 2>/dev/null || printf '{}'",
    "printf '\\n---SPRINT---\\n'",
    "cat runtime/posting-sprint.json 2>/dev/null || printf '{}'",
    "printf '\\n---PROOF_STALL---\\n'",
    "cat runtime/proof-stall.json 2>/dev/null || printf '{}'",
    "printf '\\n---PROOF_SLA---\\n'",
    "cat runtime/proof-sla.json 2>/dev/null || printf '{}'",
    "printf '\\n---PROOF_RESCUE---\\n'",
    "cat runtime/proof-rescue.json 2>/dev/null || printf '{}'",
    "printf '\\n---PROOF_URL_RECOVERY---\\n'",
    "cat runtime/proof-url-recovery.json 2>/dev/null || printf '{}'",
    "printf '\\n---SOCIAL_RESCUE---\\n'",
    "cat runtime/social-rescue-pack.json 2>/dev/null || printf '{}'",
    "printf '\\n---ZERO_SIGNUP_RESCUE---\\n'",
    "cat runtime/zero-signup-rescue.json 2>/dev/null || printf '{}'",
    "printf '\\n---REAL_ACTION_BRIDGE---\\n'",
    "cat runtime/real-action-bridge.json 2>/dev/null || printf '{}'",
    "printf '\\n---ONE_CLICK_SHARE---\\n'",
    "cat runtime/one-click-share.json 2>/dev/null || printf '{}'",
    "printf '\\n---PUBLIC_OUTREACH_TARGETS---\\n'",
    "cat runtime/public-outreach-targets.json 2>/dev/null || printf '{}'",
    "printf '\\n---AD_OPS_LINKS---\\n'",
    "cat runtime/ad-ops-links.json 2>/dev/null || printf '{}'",
    "printf '\\n---PAID_AD_TRIAGE---\\n'",
    "cat runtime/paid-ad-triage.json 2>/dev/null || printf '{}'",
    "printf '\\n---PAID_NO_CLICK_RESCUE---\\n'",
    "cat runtime/paid-no-click-rescue.json 2>/dev/null || printf '{}'",
    "printf '\\n---PAID_DASHBOARD_CHECKS---\\n'",
    "cat runtime/paid-dashboard-checks.json 2>/dev/null || printf '{}'",
    "printf '\\n---REFERRAL_ACTIVITY---\\n'",
    "cat runtime/referral-activity.json 2>/dev/null || printf '{}'",
    "printf '\\n---SIGNUP_CONVERSION---\\n'",
    "cat runtime/signup-conversion-audit.json 2>/dev/null || printf '{}'",
    "printf '\\n---WARM_CONTACT---\\n'",
    "cat runtime/warm-contact-sprint.json 2>/dev/null || printf '{}'",
    "printf '\\n---WARM_FOLLOWUP---\\n'",
    "cat runtime/warm-followup-monitor.json 2>/dev/null || printf '{}'",
    "printf '\\n---RESPONSE_KIT---\\n'",
    "cat runtime/response-kit.json 2>/dev/null || printf '{}'",
    "printf '\\n---FIRST_HUMAN_ACTIONS---\\n'",
    "cat runtime/first-human-actions.json 2>/dev/null || printf '{}'",
    "printf '\\n---FIRST_SEND_BRIDGE---\\n'",
    "cat runtime/first-send-bridge.json 2>/dev/null || printf '{}'",
    "printf '\\n---POSTING_COCKPIT---\\n'",
    "cat runtime/posting-cockpit.json 2>/dev/null || printf '{}'",
    "printf '\\n---PHONE_ACTION---\\n'",
    "cat runtime/phone-action-center.json 2>/dev/null || printf '{}'",
    "printf '\\n---PROOF_CLOSEOUT---\\n'",
    "cat runtime/proof-closeout.json 2>/dev/null || printf '{}'",
    "printf '\\n---WORKER_WAKE---\\n'",
    "cat runtime/worker-wake-board.json 2>/dev/null || printf '{}'",
    "printf '\\n---SESSION_RECOVERY---\\n'",
    "cat runtime/session-recovery.json 2>/dev/null || printf '{}'",
    "printf '\\n---ESCALATION---\\n'",
    "cat runtime/escalation-board.json 2>/dev/null || printf '{}'",
    "printf '\\n---PUBLIC_ATTEMPTS---\\n'",
    "cat runtime/public-channel-attempts.json 2>/dev/null || printf '{}'",
    "printf '\\n---LOGIN_UNLOCK---\\n'",
    "cat runtime/login-unlock-board.json 2>/dev/null || printf '{}'",
    "printf '\\n---OBJECTIVE_AUDIT---\\n'",
    "cat runtime/objective-audit.json 2>/dev/null || printf '{}'",
    "printf '\\n---OPERATOR_PUSH---\\n'",
    "cat runtime/operator-push-packet.json 2>/dev/null || printf '{}'",
    "printf '\\n---LOG---\\n'",
    "tail -500 runtime/campaign-loop.log 2>/dev/null || true",
    "printf '\\n---PS---\\n'",
    "ps -axo pid,ppid,stat,etime,args | awk '/campaign-loop.sh run|campaign-watchdog-loop.sh run/ && !/awk/ { print }' || true",
    "printf '\\n---CRON---\\n'",
    "crontab -l 2>/dev/null || true",
  ].join(" && ");
}

function summarize(hosts, localFunnel) {
  const okHosts = hosts.filter((host) => host.ok);
  const unhealthy = hosts.filter((host) => !isHostAligned(host));
  const maxUrgent = Math.max(0, ...hosts.map((host) => host.urgent));
  const proofCounts = [...new Set(okHosts.map((host) => host.proof))];
  const urgentCounts = [...new Set(okHosts.map((host) => host.urgent))];
  const firstActions = new Map();
  for (const host of okHosts) {
    const key = host.first
      ? `${host.first.worker} #${host.first.nextPriority} ${host.first.nextChannel}`
      : "none";
    firstActions.set(key, (firstActions.get(key) ?? 0) + 1);
  }
  return {
    totalHosts: hosts.length,
    okHosts: okHosts.length,
    loopsRunning: hosts.filter((host) => host.loopRunning).length,
    hotPingHooksOk: hosts.filter((host) => host.hotPingHookOk).length,
    hotPingsFresh: hosts.filter((host) => host.hotPingFresh).length,
    linkSentinelsOk: hosts.filter((host) => host.linkSentinelOk).length,
    linkSentinelsFresh: hosts.filter((host) => host.linkSentinelFresh).length,
    paidTrafficGuardsOk: hosts.filter((host) => host.paidTrafficOk).length,
    paidTrafficGuardsFresh: hosts.filter((host) => host.paidTrafficFresh).length,
    liveAdQasOk: hosts.filter((host) => host.liveAdQaOk).length,
    liveAdQasFresh: hosts.filter((host) => host.liveAdQaFresh).length,
    adPlatformAuditsOk: hosts.filter((host) => host.adPlatformAuditOk).length,
    adPlatformAuditsFresh: hosts.filter((host) => host.adPlatformAuditFresh).length,
    conversionGuardsOk: hosts.filter((host) => host.conversionGuardOk).length,
    conversionGuardsFresh: hosts.filter((host) => host.conversionGuardFresh).length,
    conversionGuardsBrowserVerified: hosts.filter((host) => host.conversionGuard.browserVerified).length,
    postingSprintsOk: hosts.filter((host) => host.postingSprintOk).length,
    postingSprintsFresh: hosts.filter((host) => host.postingSprintFresh).length,
    proofActivitiesOk: hosts.filter((host) => host.proofActivityOk).length,
    proofStallsFresh: hosts.filter((host) => host.proofStallFresh).length,
    proofSlasOk: hosts.filter((host) => host.proofSlaOk).length,
    proofSlasFresh: hosts.filter((host) => host.proofSlaFresh).length,
    proofSlaStates: [...new Set(okHosts.map((host) => host.proofSla.state).filter(Boolean))],
    proofRescuesOk: hosts.filter((host) => host.proofRescueOk).length,
    proofRescuesFresh: hosts.filter((host) => host.proofRescueFresh).length,
    proofUrlRecoveriesOk: hosts.filter((host) => host.proofUrlRecoveryOk).length,
    proofUrlRecoveriesFresh: hosts.filter((host) => host.proofUrlRecoveryFresh).length,
    proofUrlRecoveryPending: Math.max(0, ...hosts.map((host) => host.proofUrlRecovery.pendingCount)),
    socialRescuesOk: hosts.filter((host) => host.socialRescueOk).length,
    socialRescuesFresh: hosts.filter((host) => host.socialRescueFresh).length,
    zeroSignupRescuesOk: hosts.filter((host) => host.zeroSignupRescueOk).length,
    zeroSignupRescuesFresh: hosts.filter((host) => host.zeroSignupRescueFresh).length,
    zeroSignupStates: [...new Set(okHosts.map((host) => host.zeroSignupRescue.state).filter(Boolean))],
    zeroSignupCounts: [...new Set(okHosts.map((host) => host.zeroSignupRescue.entries))],
    realActionBridgesOk: hosts.filter((host) => host.realActionBridgeOk).length,
    realActionBridgesFresh: hosts.filter((host) => host.realActionBridgeFresh).length,
    realActionStates: [...new Set(okHosts.map((host) => host.realActionBridge.state).filter(Boolean))],
    realActionCounts: Math.max(0, ...hosts.map((host) => host.realActionBridge.actionCount)),
    realActionVariants: Math.max(0, ...hosts.map((host) => host.realActionBridge.rescueVariantCount)),
    oneClickSharesOk: hosts.filter((host) => host.oneClickShareOk).length,
    oneClickSharesFresh: hosts.filter((host) => host.oneClickShareFresh).length,
    oneClickShareActions: Math.max(0, ...hosts.map((host) => host.oneClickShare.actionCount)),
    oneClickShareLinks: Math.max(0, ...hosts.map((host) => host.oneClickShare.shareLinkCount)),
    publicOutreachTargetsOk: hosts.filter((host) => host.publicOutreachTargetsOk).length,
    publicOutreachTargetsFresh: hosts.filter((host) => host.publicOutreachTargetsFresh).length,
    publicOutreachTargetCount: Math.max(0, ...hosts.map((host) => host.publicOutreachTargets.targetCount)),
    publicOutreachOwners: [
      ...new Set(hosts.flatMap((host) => host.publicOutreachTargets.workerCoverage.owners)),
    ],
    publicOutreachMissingOwners: [
      ...new Set(hosts.flatMap((host) => host.publicOutreachTargets.workerCoverage.missing)),
    ],
    adOpsLinksOk: hosts.filter((host) => host.adOpsLinksOk).length,
    adOpsLinksFresh: hosts.filter((host) => host.adOpsLinksFresh).length,
    adOpsChannels: Math.max(0, ...hosts.map((host) => host.adOpsLinks.channelCount)),
    adOpsPlatforms: [...new Set(hosts.flatMap((host) => host.adOpsLinks.platforms))],
    paidAdTriagesOk: hosts.filter((host) => host.paidAdTriageOk).length,
    paidAdTriagesFresh: hosts.filter((host) => host.paidAdTriageFresh).length,
    paidAdTriageStates: [...new Set(okHosts.map((host) => host.paidAdTriage.state).filter(Boolean))],
    paidAdTriagePaidViews: Math.max(0, ...hosts.map((host) => host.paidAdTriage.paidViews)),
    paidAdTriageAppViews: Math.max(0, ...hosts.map((host) => host.paidAdTriage.appViews)),
    paidAdTriageReferralViews: Math.max(0, ...hosts.map((host) => host.paidAdTriage.referralViews)),
    paidAdTriageSignupSaves: Math.max(0, ...hosts.map((host) => host.paidAdTriage.signupSaves)),
    paidAdDashboardStates: [...new Set(okHosts.map((host) => host.paidAdTriage.dashboardState).filter(Boolean))],
    paidAdDashboardChecks: Math.max(0, ...hosts.map((host) => host.paidAdTriage.dashboardChecks)),
    paidAdDashboardImpressions: Math.max(0, ...hosts.map((host) => host.paidAdTriage.dashboardImpressions)),
    paidAdDashboardClicks: Math.max(0, ...hosts.map((host) => host.paidAdTriage.dashboardClicks)),
    paidNoClickRescuesOk: hosts.filter((host) => host.paidNoClickRescueOk).length,
    paidNoClickRescuesFresh: hosts.filter((host) => host.paidNoClickRescueFresh).length,
    paidNoClickStates: [...new Set(okHosts.map((host) => host.paidNoClickRescue.state).filter(Boolean))],
    paidNoClickVariants: Math.max(0, ...hosts.map((host) => host.paidNoClickRescue.variantCount)),
    paidDashboardsOk: hosts.filter((host) => host.paidDashboardOk).length,
    paidDashboardsFresh: hosts.filter((host) => host.paidDashboardFresh).length,
    paidDashboardDirectStates: [...new Set(okHosts.map((host) => host.paidDashboard.state).filter(Boolean))],
    paidDashboardDirectChecks: Math.max(0, ...hosts.map((host) => host.paidDashboard.latestChecks)),
    paidDashboardDirectImpressions: Math.max(0, ...hosts.map((host) => host.paidDashboard.totalImpressions)),
    paidDashboardDirectClicks: Math.max(0, ...hosts.map((host) => host.paidDashboard.totalClicks)),
    referralActivitiesOk: hosts.filter((host) => host.referralActivityOk).length,
    referralActivitiesFresh: hosts.filter((host) => host.referralActivityFresh).length,
    referralActivitiesAvailable: hosts.filter((host) => host.referralActivityAvailable).length,
    funnelAcceptedReferrals: Math.max(0, ...hosts.map((host) => host.referralActivity.acceptedReferrals)),
    funnelSignupSaves: Math.max(0, ...hosts.map((host) => host.referralActivity.signupReferralSaves)),
    funnelReferredEntries: Math.max(0, ...hosts.map((host) => host.referralActivity.referredEntries)),
    funnelProfiles: Math.max(0, ...hosts.map((host) => host.referralActivity.profiles)),
    funnelFreeAccounts: Math.max(0, ...hosts.map((host) => host.referralActivity.freeAccounts)),
    funnelPaidAccounts: Math.max(0, ...hosts.map((host) => host.referralActivity.paidAccounts)),
    funnelAppViews: Math.max(0, ...hosts.map((host) => host.referralActivity.appViews)),
    funnelAppViews24h: Math.max(0, ...hosts.map((host) => host.referralActivity.appViews24h)),
    funnelReferralViews: Math.max(0, ...hosts.map((host) => host.referralActivity.referralViews)),
    funnelReferralViews24h: Math.max(0, ...hosts.map((host) => host.referralActivity.referralViews24h)),
    funnelSignupReturned: Math.max(0, ...hosts.map((host) => host.referralActivity.signupReturned)),
    funnelSignupMissingAcceptance: Math.max(0, ...hosts.map((host) => host.referralActivity.signupMissingAcceptance)),
    funnelSignupAttempts: Math.max(0, ...hosts.map((host) => host.referralActivity.signupAttempts)),
    funnelSignupSavedEvents: Math.max(0, ...hosts.map((host) => host.referralActivity.signupSavedEvents)),
    funnelSignupFailedEvents: Math.max(0, ...hosts.map((host) => host.referralActivity.signupFailedEvents)),
    funnelSignupErrorEvents: Math.max(0, ...hosts.map((host) => host.referralActivity.signupErrorEvents)),
    signupConversionsOk: hosts.filter((host) => host.signupConversionOk).length,
    signupConversionsFresh: hosts.filter((host) => host.signupConversionFresh).length,
    signupConversionStates: [...new Set(okHosts.map((host) => host.signupConversion.state).filter(Boolean))],
    signupConversionSignupSaves: Math.max(0, ...hosts.map((host) => host.signupConversion.signupSaves)),
    signupConversionAccepted: Math.max(0, ...hosts.map((host) => host.signupConversion.accepted)),
    signupConversionProfiles: Math.max(0, ...hosts.map((host) => host.signupConversion.profiles)),
    signupConversionPaidViews: Math.max(0, ...hosts.map((host) => host.signupConversion.paidViews)),
    signupConversionReferralViews: Math.max(0, ...hosts.map((host) => host.signupConversion.referralViews)),
    signupConversionDashboardClicks: Math.max(0, ...hosts.map((host) => host.signupConversion.dashboardClicks)),
    signupConversionReturned: Math.max(0, ...hosts.map((host) => host.signupConversion.signupReturned)),
    signupConversionMissingAcceptance: Math.max(0, ...hosts.map((host) => host.signupConversion.signupMissingAcceptance)),
    signupConversionAttempts: Math.max(0, ...hosts.map((host) => host.signupConversion.signupAttempts)),
    signupConversionSavedEvents: Math.max(0, ...hosts.map((host) => host.signupConversion.signupSavedEvents)),
    signupConversionFailedEvents: Math.max(0, ...hosts.map((host) => host.signupConversion.signupFailedEvents)),
    signupConversionErrorEvents: Math.max(0, ...hosts.map((host) => host.signupConversion.signupErrorEvents)),
    warmContactsOk: hosts.filter((host) => host.warmContactOk).length,
    warmContactsFresh: hosts.filter((host) => host.warmContactFresh).length,
    warmContactStates: [...new Set(okHosts.map((host) => host.warmContact.state).filter(Boolean))],
    warmContactBatches: Math.max(0, ...hosts.map((host) => host.warmContact.batches)),
    warmContactBlockedPublic: Math.max(0, ...hosts.map((host) => host.warmContact.blockedPublic)),
    warmContactSignupSaves: Math.max(0, ...hosts.map((host) => host.warmContact.signupSaves)),
    warmContactFirstActions: [...new Set(okHosts.map((host) => host.warmContact.firstAction).filter(Boolean))],
    warmFollowupsOk: hosts.filter((host) => host.warmFollowupOk).length,
    warmFollowupsFresh: hosts.filter((host) => host.warmFollowupFresh).length,
    warmFollowupStates: [...new Set(okHosts.map((host) => host.warmFollowup.state).filter(Boolean))],
    warmFollowupAttempts: Math.max(0, ...hosts.map((host) => host.warmFollowup.warmAttempts)),
    warmFollowupTesterAttempts: Math.max(0, ...hosts.map((host) => host.warmFollowup.testerAttempts)),
    warmFollowupTotalAttempts: Math.max(0, ...hosts.map((host) => host.warmFollowup.followupAttempts)),
    warmFollowupSignupSaves: Math.max(0, ...hosts.map((host) => host.warmFollowup.signupSaves)),
    warmFollowupReferralViews: Math.max(0, ...hosts.map((host) => host.warmFollowup.referralViews)),
    warmFollowupDue: Math.max(0, ...hosts.map((host) => host.warmFollowup.due ? 1 : 0)),
    responseKitsOk: hosts.filter((host) => host.responseKitOk).length,
    responseKitsFresh: hosts.filter((host) => host.responseKitFresh).length,
    responseKitStates: [...new Set(okHosts.map((host) => host.responseKit.state).filter(Boolean))],
    responseKitReplies: Math.max(0, ...hosts.map((host) => host.responseKit.replies)),
    responseKitWarmAttempts: Math.max(0, ...hosts.map((host) => host.responseKit.warmAttempts)),
    responseKitSignupSaves: Math.max(0, ...hosts.map((host) => host.responseKit.signupSaves)),
    firstHumanActionsOk: hosts.filter((host) => host.firstHumanActionsOk).length,
    firstHumanActionsFresh: hosts.filter((host) => host.firstHumanActionsFresh).length,
    firstHumanActionStates: [...new Set(okHosts.map((host) => host.firstHumanActions.state).filter(Boolean))],
    firstHumanWarmAttempts: Math.max(0, ...hosts.map((host) => host.firstHumanActions.warmAttempts)),
    firstHumanSignupSaves: Math.max(0, ...hosts.map((host) => host.firstHumanActions.signupSaves)),
    firstHumanReferralViews: Math.max(0, ...hosts.map((host) => host.firstHumanActions.referralViews)),
    firstHumanDashboardClicks: Math.max(0, ...hosts.map((host) => host.firstHumanActions.dashboardClicks)),
    firstHumanActionCount: Math.max(0, ...hosts.map((host) => host.firstHumanActions.actionCount)),
    firstHumanFirstActions: [
      ...new Set(
        okHosts
          .map((host) => host.firstHumanActions.firstAction)
          .filter(Boolean)
          .map((action) => `${action.owner}/${action.channel}/${action.id}`),
      ),
    ],
    firstSendBridgesOk: hosts.filter((host) => host.firstSendBridgeOk).length,
    firstSendBridgesFresh: hosts.filter((host) => host.firstSendBridgeFresh).length,
    firstSendBridgeStates: [...new Set(okHosts.map((host) => host.firstSendBridge.state).filter(Boolean))],
    firstSendBridgeWarmAttempts: Math.max(0, ...hosts.map((host) => host.firstSendBridge.warmAttempts)),
    firstSendBridgeSignupSaves: Math.max(0, ...hosts.map((host) => host.firstSendBridge.signupSaves)),
    firstSendBridgeAdClicks: Math.max(0, ...hosts.map((host) => host.firstSendBridge.adClicks)),
    firstSendBridgeOwners: [...new Set(okHosts.map((host) => host.firstSendBridge.owner).filter(Boolean))],
    localFunnelOk: Boolean(localFunnel.ok),
    localFunnelFresh: Boolean(localFunnel.fresh),
    localFunnelAvailable: Boolean(localFunnel.available),
    localFunnelStatus: String(localFunnel.status ?? ""),
    localFunnelGeneratedAtEest: String(localFunnel.generatedAtEest ?? ""),
    localFunnelProfiles: Number(localFunnel.profiles ?? 0),
    localFunnelFreeAccounts: Number(localFunnel.freeAccounts ?? 0),
    localFunnelPaidAccounts: Number(localFunnel.paidAccounts ?? 0),
    localFunnelAppViews: Number(localFunnel.appViews ?? 0),
    localFunnelAppViews24h: Number(localFunnel.appViews24h ?? 0),
    localFunnelReferralViews: Number(localFunnel.referralViews ?? 0),
    localFunnelReferralViews24h: Number(localFunnel.referralViews24h ?? 0),
    localFunnelSignupReturned: Number(localFunnel.signupReturned ?? 0),
    localFunnelSignupMissingAcceptance: Number(localFunnel.signupMissingAcceptance ?? 0),
    localFunnelSignupAttempts: Number(localFunnel.signupAttempts ?? 0),
    localFunnelSignupSavedEvents: Number(localFunnel.signupSavedEvents ?? 0),
    localFunnelSignupFailedEvents: Number(localFunnel.signupFailedEvents ?? 0),
    localFunnelSignupErrorEvents: Number(localFunnel.signupErrorEvents ?? 0),
    localFunnelTopSource: localFunnel.topSource ?? null,
    localFunnelTopSignupSource: localFunnel.topSignupSource ?? null,
    localFunnelAcceptedReferrals: Number(localFunnel.acceptedReferrals ?? 0),
    localFunnelSignupSaves: Number(localFunnel.signupReferralSaves ?? 0),
    localFunnelReferredEntries: Number(localFunnel.referredEntries ?? 0),
    postingCockpitsOk: hosts.filter((host) => host.postingCockpitOk).length,
    postingCockpitsFresh: hosts.filter((host) => host.postingCockpitFresh).length,
    phoneActionCentersOk: hosts.filter((host) => host.phoneActionCenterOk).length,
    phoneActionCentersFresh: hosts.filter((host) => host.phoneActionCenterFresh).length,
    proofCloseoutsOk: hosts.filter((host) => host.proofCloseoutOk).length,
    proofCloseoutsFresh: hosts.filter((host) => host.proofCloseoutFresh).length,
    proofCloseoutCommands: Math.max(0, ...hosts.map((host) => host.proofCloseout.commandCount)),
    publicAttemptsOk: hosts.filter((host) => host.publicAttemptsOk).length,
    publicAttemptsFresh: hosts.filter((host) => host.publicAttemptsFresh).length,
    publicAttemptsBlocked: Math.max(0, ...hosts.map((host) => host.publicAttempts.blocked)),
    publicAttemptsLoginRequired: Math.max(0, ...hosts.map((host) => host.publicAttempts.loginRequired)),
    loginUnlocksOk: hosts.filter((host) => host.loginUnlockOk).length,
    loginUnlocksFresh: hosts.filter((host) => host.loginUnlockFresh).length,
    loginUnlockCards: Math.max(0, ...hosts.map((host) => host.loginUnlock.cards)),
    loginUnlockBlocked: Math.max(0, ...hosts.map((host) => host.loginUnlock.blocked)),
    loginUnlockLoginRequired: Math.max(0, ...hosts.map((host) => host.loginUnlock.loginRequired)),
    loginUnlockPlatforms: [...new Set(hosts.flatMap((host) => host.loginUnlock.platforms))],
    objectiveAuditsOk: hosts.filter((host) => host.objectiveAuditOk).length,
    objectiveAuditsFresh: hosts.filter((host) => host.objectiveAuditFresh).length,
    objectiveAuditStates: [...new Set(okHosts.map((host) => host.objectiveAudit.state).filter(Boolean))],
    objectiveAuditCriticalOpen: Math.max(0, ...hosts.map((host) => host.objectiveAudit.criticalOpen)),
    objectiveAuditComplete: hosts.filter((host) => host.objectiveAudit.complete).length,
    operatorPushesOk: hosts.filter((host) => host.operatorPushOk).length,
    operatorPushesFresh: hosts.filter((host) => host.operatorPushFresh).length,
    operatorPushStates: [...new Set(okHosts.map((host) => host.operatorPush.state).filter(Boolean))],
    operatorPushActions: Math.max(0, ...hosts.map((host) => host.operatorPush.actionCount)),
    operatorPushBlocked: Math.max(0, ...hosts.map((host) => host.operatorPush.publicBlocked)),
    operatorPushLoginRequired: Math.max(0, ...hosts.map((host) => host.operatorPush.publicLoginRequired)),
    workerWakesOk: hosts.filter((host) => host.workerWakeOk).length,
    workerWakesFresh: hosts.filter((host) => host.workerWakeFresh).length,
    sessionRecoveriesOk: hosts.filter((host) => host.sessionRecoveryOk).length,
    sessionRecoveriesFresh: hosts.filter((host) => host.sessionRecoveryFresh).length,
    escalationsOk: hosts.filter((host) => host.escalationOk).length,
    escalationsFresh: hosts.filter((host) => host.escalationFresh).length,
    criticalEscalations: Math.max(0, ...hosts.map((host) => host.escalation.critical)),
    hotEscalations: Math.max(0, ...hosts.map((host) => host.escalation.hot)),
    watchdogLoopsRunning: hosts.filter((host) => host.watchdogRunning).length,
    watchdogCronInstalled: hosts.filter((host) => host.watchdogCronInstalled).length,
    maxUrgent,
    proofCounts,
    urgentCounts,
    firstActions: [...firstActions.entries()].map(([action, count]) => ({ action, count })),
    unhealthyHosts: unhealthy.map((host) => host.host),
    aligned:
      okHosts.length === hosts.length &&
      hosts.every(isHostAligned) &&
      proofCounts.length === 1 &&
      urgentCounts.length === 1,
  };
}

function isHostAligned(host) {
  return (
    host.ok &&
    host.loopRunning &&
    host.hotPingHookOk &&
    host.hotPingFresh &&
    host.linkSentinelOk &&
    host.linkSentinelFresh &&
    host.paidTrafficOk &&
    host.paidTrafficFresh &&
    host.liveAdQaOk &&
    host.liveAdQaFresh &&
    host.adPlatformAuditOk &&
    host.adPlatformAuditFresh &&
    host.conversionGuardOk &&
    host.conversionGuardFresh &&
    host.postingSprintOk &&
    host.postingSprintFresh &&
    host.proofActivityOk &&
    host.proofStallFresh &&
    host.proofSlaOk &&
    host.proofSlaFresh &&
    host.proofRescueOk &&
    host.proofRescueFresh &&
    host.proofUrlRecoveryOk &&
    host.proofUrlRecoveryFresh &&
    host.socialRescueOk &&
    host.socialRescueFresh &&
    host.zeroSignupRescueOk &&
    host.zeroSignupRescueFresh &&
    host.realActionBridgeOk &&
    host.realActionBridgeFresh &&
    host.oneClickShareOk &&
    host.oneClickShareFresh &&
    host.publicOutreachTargetsOk &&
    host.publicOutreachTargetsFresh &&
    host.adOpsLinksOk &&
    host.adOpsLinksFresh &&
    host.paidAdTriageOk &&
    host.paidAdTriageFresh &&
    host.paidNoClickRescueOk &&
    host.paidNoClickRescueFresh &&
    host.paidDashboardOk &&
    host.paidDashboardFresh &&
    host.referralActivityOk &&
    host.referralActivityFresh &&
    host.signupConversionOk &&
    host.signupConversionFresh &&
    host.warmContactOk &&
    host.warmContactFresh &&
    host.warmFollowupOk &&
    host.warmFollowupFresh &&
    host.responseKitOk &&
    host.responseKitFresh &&
    host.firstHumanActionsOk &&
    host.firstHumanActionsFresh &&
    host.firstSendBridgeOk &&
    host.firstSendBridgeFresh &&
    host.postingCockpitOk &&
    host.postingCockpitFresh &&
    host.phoneActionCenterOk &&
    host.phoneActionCenterFresh &&
    host.proofCloseoutOk &&
    host.proofCloseoutFresh &&
    host.publicAttemptsOk &&
    host.publicAttemptsFresh &&
    host.loginUnlockOk &&
    host.loginUnlockFresh &&
    host.objectiveAuditOk &&
    host.objectiveAuditFresh &&
    host.operatorPushOk &&
    host.operatorPushFresh &&
    host.workerWakeOk &&
    host.workerWakeFresh &&
    host.sessionRecoveryOk &&
    host.sessionRecoveryFresh &&
    host.escalationOk &&
    host.escalationFresh &&
    host.watchdogRunning &&
    host.watchdogCronInstalled
  );
}

function isFreshIso(value) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return false;
  const ageSeconds = Math.max(0, Math.floor((now.getTime() - parsed.getTime()) / 1000));
  return ageSeconds <= args.freshSeconds;
}

function isPostingSprintOk(postingSprint, hotPing) {
  const cards = Array.isArray(postingSprint.cards) ? postingSprint.cards : [];
  const workers = new Set(cards.map((card) => String(card.worker ?? "").trim()).filter(Boolean));
  return (
    cards.length === 4 &&
    ["Dexter", "Sienna", "Memo", "Nano"].every((worker) => workers.has(worker)) &&
    Number(postingSprint.liveProofRows ?? -1) === Number(hotPing.liveProofRows ?? -2) &&
    Number(postingSprint.urgentRows ?? -1) === Number(hotPing.urgentProofGaps ?? -2) &&
    Boolean(postingSprint.linkOk)
  );
}

function isPaidTrafficOk(paidTrafficGuard) {
  const pages = Array.isArray(paidTrafficGuard.checks?.pages)
    ? paidTrafficGuard.checks.pages
    : [];
  return (
    Boolean(paidTrafficGuard.ok) &&
    pages.length >= 7 &&
    pages.every((page) => Boolean(page.ok)) &&
    Boolean(paidTrafficGuard.checks?.resolver?.ok) &&
    Boolean(paidTrafficGuard.checks?.health?.ok)
  );
}

function isLiveAdQaOk(liveAdQa) {
  const pages = Array.isArray(liveAdQa.checks?.pages)
    ? liveAdQa.checks.pages
    : [];
  const renderedAssets = Array.isArray(liveAdQa.checks?.renderedAssets)
    ? liveAdQa.checks.renderedAssets
    : [];
  const social = Array.isArray(liveAdQa.checks?.social) ? liveAdQa.checks.social : [];
  const localAssets = Array.isArray(liveAdQa.checks?.localAssets) ? liveAdQa.checks.localAssets : [];
  return (
    Boolean(liveAdQa.ok) &&
    pages.length >= 7 &&
    pages.every((page) => Boolean(page.ok)) &&
    renderedAssets.length > 0 &&
    renderedAssets.every((asset) => Boolean(asset.ok)) &&
    Boolean(liveAdQa.checks?.resolver?.ok) &&
    Boolean(liveAdQa.checks?.health?.ok) &&
    Boolean(liveAdQa.checks?.auth?.ok) &&
    social.length >= 2 &&
    social.every((check) => Boolean(check.ok)) &&
    localAssets.length >= 5 &&
    localAssets.every((asset) => Boolean(asset.ok))
  );
}

function isAdPlatformAuditOk(adPlatformAudit) {
  const pages = Array.isArray(adPlatformAudit.checks?.pages)
    ? adPlatformAudit.checks.pages
    : [];
  const socialImages = Array.isArray(adPlatformAudit.checks?.socialImages)
    ? adPlatformAudit.checks.socialImages
    : [];
  return (
    Boolean(adPlatformAudit.ok) &&
    pages.length >= 9 &&
    pages.every((page) => Boolean(page.ok)) &&
    socialImages.length >= 1 &&
    socialImages.every((image) => Boolean(image.ok)) &&
    Boolean(adPlatformAudit.checks?.resolver?.ok) &&
    Boolean(adPlatformAudit.checks?.health?.ok)
  );
}

function isConversionGuardOk(conversionGuard) {
  const firstPaint = Array.isArray(conversionGuard.checks?.firstPaint)
    ? conversionGuard.checks.firstPaint
    : [];
  return (
    Boolean(conversionGuard.ok) &&
    firstPaint.length >= 4 &&
    firstPaint.every((page) => Boolean(page.ok)) &&
    Boolean(conversionGuard.checks?.resolver?.ok) &&
    Boolean(conversionGuard.checks?.auth?.ok)
  );
}

function isSessionRecoveryOk(sessionRecovery) {
  const recoveryActions = Array.isArray(sessionRecovery.recoveryActions)
    ? sessionRecovery.recoveryActions
    : [];
  const phoneActions = Array.isArray(sessionRecovery.phoneActions) ? sessionRecovery.phoneActions : [];
  const hasX = recoveryActions.some((row) => String(row.key ?? "") === "x" && String(row.shareUrl ?? "").includes("twitter.com/intent/tweet"));
  const hasFacebook = recoveryActions.some((row) => String(row.key ?? "") === "facebook" && String(row.shareUrl ?? "").includes("facebook.com/sharer"));
  return (
    hasX &&
    hasFacebook &&
    phoneActions.length >= 4 &&
    Number(sessionRecovery.proofRows ?? -1) >= 1 &&
    Number(sessionRecovery.urgentRows ?? -1) >= 1
  );
}

function isProofSlaOk(proofSla) {
  const state = String(proofSla.proofState ?? "");
  const doNow = Array.isArray(proofSla.doNow) ? proofSla.doNow : [];
  return (
    Boolean(proofSla.ok) &&
    Boolean(proofSla.generatedAt) &&
    ["fresh", "warning", "critical"].includes(state) &&
    (state === "fresh" || doNow.length > 0)
  );
}

function isProofRescueOk(proofRescue) {
  const actions = Array.isArray(proofRescue.actions) ? proofRescue.actions : [];
  return (
    Boolean(proofRescue.ok) &&
    Boolean(proofRescue.generatedAt) &&
    actions.length >= 4 &&
    actions.every((action) => Boolean(action.priority) && Boolean(action.owner) && Boolean(action.channel)) &&
    Boolean(proofRescue.liveAdQaOk)
  );
}

function isProofUrlRecoveryOk(proofUrlRecovery) {
  const rows = Array.isArray(proofUrlRecovery.rows) ? proofUrlRecovery.rows : [];
  return (
    Boolean(proofUrlRecovery.ok) &&
    Boolean(proofUrlRecovery.generatedAt) &&
    rows.every((row) =>
      Boolean(row.pulse) &&
      Boolean(row.xProfileUrl) &&
      Boolean(row.xLiveSearchUrl) &&
      Boolean(row.upgradeCommand) &&
      String(row.upgradeCommand).includes("PUBLIC_X_STATUS_URL"),
    )
  );
}

function isSocialRescueOk(socialRescue) {
  const actions = Array.isArray(socialRescue.actions) ? socialRescue.actions : [];
  const workerPages = Array.isArray(socialRescue.workerPages) ? socialRescue.workerPages : [];
  return (
    Boolean(socialRescue.ok) &&
    Boolean(socialRescue.generatedAt) &&
    Boolean(socialRescue.liveAdQaOk) &&
    actions.length >= 4 &&
    actions.every((action) => {
      const shareLinks = Array.isArray(action.shareLinks) ? action.shareLinks : [];
      return Boolean(action.priority) && Boolean(action.copy) && Boolean(action.proofCommand) && shareLinks.length >= 1;
    }) &&
    workerPages.length >= 3 &&
    workerPages.every(
      (page) =>
        Boolean(page.owner) &&
        String(page.fileName ?? "").endsWith(".html") &&
        Number(page.actionCount ?? 0) > 0,
    )
  );
}

function isPostingCockpitOk(postingCockpit) {
  const pages = Array.isArray(postingCockpit.pages) ? postingCockpit.pages : [];
  const hrefs = pages.map((page) => (typeof page === "string" ? page : String(page.href ?? "")));
  const doNow = Array.isArray(postingCockpit.doNow) ? postingCockpit.doNow : [];
  return (
    Boolean(postingCockpit.ok) &&
    Boolean(postingCockpit.generatedAt) &&
    hrefs.includes("proof-sla.html") &&
    hrefs.includes("top-six-mobile.html") &&
    hrefs.includes("phone-action-center.html") &&
    hrefs.includes("one-click-share.html") &&
    hrefs.includes("public-outreach-targets.html") &&
    hrefs.includes("paid-ad-triage.html") &&
    hrefs.includes("paid-no-click-rescue.html") &&
    hrefs.includes("ad-ops-links.html") &&
    doNow.length > 0
  );
}

function isPhoneActionCenterOk(phoneActionCenter) {
  return (
    Boolean(phoneActionCenter.ok) &&
    String(phoneActionCenter.referralCode ?? "") === "26BC4B90CB" &&
    String(phoneActionCenter.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    Number(phoneActionCenter.actionCount ?? 0) > 0 &&
    Number(phoneActionCenter.urgentRows ?? 0) >= Number(phoneActionCenter.actionCount ?? 0) &&
    Number(phoneActionCenter.ownerCount ?? 0) >= 3 &&
    Number(phoneActionCenter.qrBlockCount ?? 0) >= Number(phoneActionCenter.actionCount ?? 0) &&
    Number(phoneActionCenter.trackedQrCount ?? 0) >= Number(phoneActionCenter.actionCount ?? 0) &&
    Number(phoneActionCenter.assetBlockCount ?? 0) >= Number(phoneActionCenter.actionCount ?? 0) &&
    Number(phoneActionCenter.videoPreviewCount ?? 0) >= 1 &&
    Number(phoneActionCenter.htmlBytes ?? 0) > 0 &&
    Boolean(phoneActionCenter.firstAction?.priority) &&
    Boolean(phoneActionCenter.firstAction?.owner) &&
    Boolean(phoneActionCenter.firstAction?.channel)
  );
}

function isPublicAttemptsOk(publicAttempts) {
  return (
    Boolean(publicAttempts.ok) &&
    String(publicAttempts.referralCode ?? "") === "26BC4B90CB" &&
    String(publicAttempts.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    Number(publicAttempts.counts?.socialActions ?? 0) >= 4
  );
}

function isLoginUnlockOk(loginUnlock) {
  const cards = Array.isArray(loginUnlock.cards) ? loginUnlock.cards : [];
  return (
    Boolean(loginUnlock.ok) &&
    String(loginUnlock.schema ?? "") === "worldcup26-login-unlock-board-v1" &&
    String(loginUnlock.referralCode ?? "") === "26BC4B90CB" &&
    String(loginUnlock.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    Number(loginUnlock.counts?.blocked ?? 0) > 0 &&
    Number(loginUnlock.counts?.cards ?? 0) === cards.length &&
    cards.length > 0 &&
    cards.every((card) =>
      Boolean(card.owner) &&
      Boolean(card.platform) &&
      Boolean(card.channel) &&
      Boolean(card.authUrl) &&
      Boolean(card.publishUrl) &&
      String(card.copy ?? "").includes("26BC4B90CB") &&
      isRealActionIntakeCommand(card.proofCommand),
    )
  );
}

function isObjectiveAuditOk(objectiveAudit) {
  const requirements = Array.isArray(objectiveAudit.requirements) ? objectiveAudit.requirements : [];
  return (
    Boolean(objectiveAudit.ok) &&
    String(objectiveAudit.schema ?? "") === "worldcup26-objective-audit-v1" &&
    String(objectiveAudit.referralCode ?? "") === "26BC4B90CB" &&
    String(objectiveAudit.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    ["complete", "incomplete", "critical"].includes(String(objectiveAudit.state ?? "")) &&
    requirements.length >= 8
  );
}

function isOperatorPushOk(operatorPush) {
  const actions = Array.isArray(operatorPush.actions) ? operatorPush.actions : [];
  return (
    Boolean(operatorPush.ok) &&
    String(operatorPush.schema ?? "") === "worldcup26-operator-push-packet-v1" &&
    String(operatorPush.referralCode ?? "") === "26BC4B90CB" &&
    String(operatorPush.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    actions.length >= 4 &&
    actions.every((action) =>
      Boolean(action.priority) &&
      Boolean(action.owner) &&
      Boolean(action.channel) &&
      String(action.trackedLink ?? "").includes("26BC4B90CB") &&
      String(action.copy ?? "").includes("26BC4B90CB") &&
      isRealActionIntakeCommand(action.proofCommand),
    )
  );
}

function isRealActionBridgeOk(realActionBridge) {
  const actions = Array.isArray(realActionBridge.actions) ? realActionBridge.actions : [];
  const variants = Array.isArray(realActionBridge.rescueVariants)
    ? realActionBridge.rescueVariants
    : [];
  return (
    Boolean(realActionBridge.ok) &&
    String(realActionBridge.schema ?? "") === "worldcup26-real-action-bridge-v1" &&
    String(realActionBridge.referralCode ?? "") === "26BC4B90CB" &&
    String(realActionBridge.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    actions.length >= 4 &&
    variants.length >= 4 &&
    actions.every((action) =>
      Boolean(action.priority) &&
      Boolean(action.owner) &&
      Boolean(action.channel) &&
      String(action.trackedLink ?? "").includes("26BC4B90CB") &&
      String(action.copy ?? "").includes("26BC4B90CB") &&
      isRealActionIntakeCommand(action.proofCommand),
    )
  );
}

function isRealActionIntakeCommand(command) {
  const value = String(command ?? "");
  return (
    value.includes("campaign-proof-log.mjs") ||
    value.includes("campaign-proof-intake.mjs") ||
    value.includes("campaign-public-channel-attempts.mjs")
  );
}

function isOneClickShareOk(oneClickShare) {
  const actions = Array.isArray(oneClickShare.actions) ? oneClickShare.actions : [];
  return (
    Boolean(oneClickShare.ok) &&
    String(oneClickShare.schema ?? "") === "worldcup26-one-click-share-v1" &&
    String(oneClickShare.referralCode ?? "") === "26BC4B90CB" &&
    String(oneClickShare.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    actions.length >= 4 &&
    actions.every((action) => {
      const shareLinks = Array.isArray(action.shareLinks) ? action.shareLinks : [];
      return (
        Boolean(action.priority) &&
        Boolean(action.owner) &&
        Boolean(action.channel) &&
        String(action.trackedLink ?? "").includes("26BC4B90CB") &&
        String(action.copy ?? "").includes("26BC4B90CB") &&
        isRealActionIntakeCommand(action.proofCommand) &&
        shareLinks.length >= 1
      );
    })
  );
}

function isPublicOutreachTargetsOk(publicOutreachTargets) {
  const targets = Array.isArray(publicOutreachTargets.targets) ? publicOutreachTargets.targets : [];
  const owners = Array.isArray(publicOutreachTargets.workerCoverage?.owners)
    ? publicOutreachTargets.workerCoverage.owners.map(String)
    : [];
  const missing = Array.isArray(publicOutreachTargets.workerCoverage?.missing)
    ? publicOutreachTargets.workerCoverage.missing
    : [];
  return (
    Boolean(publicOutreachTargets.ok) &&
    String(publicOutreachTargets.schema ?? "") === "worldcup26-public-outreach-targets-v1" &&
    String(publicOutreachTargets.referralCode ?? "") === "26BC4B90CB" &&
    String(publicOutreachTargets.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    targets.length >= 16 &&
    ["Dexter", "Sienna", "Memo", "Nano"].every((worker) => owners.includes(worker)) &&
    missing.length === 0 &&
    targets.every((target) =>
      Boolean(target.owner) &&
      Boolean(target.platform) &&
      String(target.link ?? "").includes("26BC4B90CB") &&
      (
        String(target.proofCommand ?? "").includes("campaign-proof-log.mjs") ||
        String(target.proofCommand ?? "").includes("campaign-public-channel-attempts.mjs")
      ),
    )
  );
}

function isAdOpsLinksOk(adOpsLinks) {
  const channels = Array.isArray(adOpsLinks.channels) ? adOpsLinks.channels : [];
  const hasMeta = channels.some(
    (channel) =>
      String(channel.key ?? "") === "meta" &&
      String(channel.managerUrl ?? "").includes("adsmanager.facebook.com") &&
      String(channel.campaignUrl ?? "").includes("ref=26BC4B90CB"),
  );
  const hasX = channels.some(
    (channel) =>
      String(channel.key ?? "") === "x" &&
      String(channel.managerUrl ?? "").includes("ads.x.com/manager/18ce55rrs16/campaigns") &&
      String(channel.campaignUrl ?? "").includes("ref=26BC4B90CB"),
  );
  return (
    Boolean(adOpsLinks.ok) &&
    String(adOpsLinks.schema ?? "") === "worldcup26-ad-ops-links-v1" &&
    String(adOpsLinks.referralCode ?? "") === "26BC4B90CB" &&
    String(adOpsLinks.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    channels.length === 2 &&
    hasMeta &&
    hasX &&
    channels.every((channel) => String(channel.attemptCommand ?? "").includes("campaign-public-channel-attempts.mjs"))
  );
}

function isPaidAdTriageOk(paidAdTriage) {
  const channels = Array.isArray(paidAdTriage.channels) ? paidAdTriage.channels : [];
  const hasMeta = channels.some(
    (channel) =>
      String(channel.key ?? "") === "meta" &&
      String(channel.managerUrl ?? "").includes("adsmanager.facebook.com") &&
      String(channel.landingUrl ?? "").includes("utm_source=meta"),
  );
  const hasX = channels.some(
    (channel) =>
      String(channel.key ?? "") === "x" &&
      String(channel.managerUrl ?? "").includes("ads.x.com/manager/18ce55rrs16/campaigns") &&
      String(channel.landingUrl ?? "").includes("utm_source=x"),
  );
  return (
    Boolean(paidAdTriage.ok) &&
    String(paidAdTriage.schema ?? "") === "worldcup26-paid-ad-triage-v1" &&
    String(paidAdTriage.referralCode ?? "") === "26BC4B90CB" &&
    String(paidAdTriage.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    String(paidAdTriage.state ?? "").length > 0 &&
    channels.length === 2 &&
    hasMeta &&
    hasX &&
    channels.every((channel) =>
      String(channel.dashboardProofCommand ?? "").includes("campaign-paid-dashboard-intake.mjs"),
    )
  );
}

function isPaidNoClickRescueOk(paidNoClickRescue) {
  const variants = Array.isArray(paidNoClickRescue.variants) ? paidNoClickRescue.variants : [];
  const platforms = new Set(variants.map((variant) => String(variant.channelKey ?? "")));
  return (
    Boolean(paidNoClickRescue.ok) &&
    String(paidNoClickRescue.schema ?? "") === "worldcup26-paid-no-click-rescue-v1" &&
    String(paidNoClickRescue.referralCode ?? "") === "26BC4B90CB" &&
    String(paidNoClickRescue.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    variants.length >= 8 &&
    platforms.has("meta") &&
    platforms.has("x") &&
    variants.every((variant) =>
      String(variant.copy ?? "").includes("26BC4B90CB") &&
      String(variant.landingUrl ?? "").includes("ref=26BC4B90CB") &&
      String(variant.dashboardCommand ?? "").includes("campaign-paid-dashboard-intake.mjs"),
    )
  );
}

function isPaidDashboardOk(paidDashboard) {
  const channels = Array.isArray(paidDashboard.channels) ? paidDashboard.channels : [];
  const hasMeta = channels.some(
    (channel) =>
      String(channel.key ?? "") === "meta" &&
      String(channel.managerUrl ?? "").includes("adsmanager.facebook.com") &&
      String(channel.landingUrl ?? "").includes("utm_source=meta"),
  );
  const hasX = channels.some(
    (channel) =>
      String(channel.key ?? "") === "x" &&
      String(channel.managerUrl ?? "").includes("ads.x.com/manager/18ce55rrs16/campaigns") &&
      String(channel.landingUrl ?? "").includes("utm_source=x"),
  );
  return (
    Boolean(paidDashboard.ok) &&
    String(paidDashboard.schema ?? "") === "worldcup26-paid-dashboard-checks-v1" &&
    String(paidDashboard.referralCode ?? "") === "26BC4B90CB" &&
    String(paidDashboard.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    String(paidDashboard.state ?? "").length > 0 &&
    channels.length === 2 &&
    hasMeta &&
    hasX &&
    channels.every((channel) =>
      String(channel.intakeCommand ?? "").includes("campaign-paid-dashboard-intake.mjs"),
    )
  );
}

function isReferralActivityOk(referralActivity) {
  return (
    Boolean(referralActivity.ok) &&
    String(referralActivity.schema ?? "") === "worldcup26-referral-activity-v1" &&
    String(referralActivity.referralCode ?? "") === "26BC4B90CB" &&
    String(referralActivity.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    ["ok", "unavailable", "not_found"].includes(String(referralActivity.status ?? ""))
  );
}

function isSignupConversionOk(signupConversion) {
  return (
    String(signupConversion.schema ?? "") === "worldcup26-signup-conversion-audit-v1" &&
    String(signupConversion.referralCode ?? "") === "26BC4B90CB" &&
    String(signupConversion.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    String(signupConversion.state ?? "").length > 0 &&
    Boolean(signupConversion.pathProof?.firstPaint) &&
    Boolean(signupConversion.pathProof?.browserVerified) &&
    Boolean(signupConversion.pathProof?.inviterFound) &&
    String(signupConversion.proofRule ?? "").includes("Do not claim signup conversion proof")
  );
}

function isWarmContactOk(warmContact) {
  const batches = Array.isArray(warmContact.batches) ? warmContact.batches : [];
  return (
    Boolean(warmContact.ok) &&
    String(warmContact.schema ?? "") === "worldcup26-warm-contact-sprint-v1" &&
    String(warmContact.referralCode ?? "") === "26BC4B90CB" &&
    String(warmContact.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    batches.length >= 5 &&
    batches.every((batch) =>
      String(batch.copy ?? "").includes("26BC4B90CB") &&
      String(batch.link ?? "").includes("ref=26BC4B90CB") &&
      String(batch.proofCommand ?? "").includes("campaign-public-channel-attempts.mjs"),
    )
  );
}

function isWarmFollowupOk(warmFollowup) {
  return (
    Boolean(warmFollowup.ok) &&
    String(warmFollowup.schema ?? "") === "worldcup26-warm-followup-monitor-v1" &&
    String(warmFollowup.referralCode ?? "") === "26BC4B90CB" &&
    String(warmFollowup.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    String(warmFollowup.state ?? "").length > 0 &&
    Number.isFinite(Number(warmFollowup.followupMinutes)) &&
    String(warmFollowup.nextAction ?? "").length > 0 &&
    String(warmFollowup.checkCommand ?? "").includes("campaign-warm-followup-monitor.mjs")
  );
}

function isResponseKitOk(responseKit) {
  const replies = Array.isArray(responseKit.replies) ? responseKit.replies : [];
  return (
    Boolean(responseKit.ok) &&
    String(responseKit.schema ?? "") === "worldcup26-response-kit-v1" &&
    String(responseKit.referralCode ?? "") === "26BC4B90CB" &&
    String(responseKit.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    replies.length >= 6 &&
    replies.every((reply) =>
      String(reply.copy ?? "").includes("26BC4B90CB") &&
      String(reply.copy ?? "").includes("worldcup26.world/login") &&
      String(reply.proofCommand ?? "").includes("campaign-proof-log.mjs"),
    ) &&
    String(responseKit.proofRule ?? "").includes("Log proof only after the reply happened")
  );
}

function isFirstHumanActionsOk(firstHumanActions) {
  const actions = Array.isArray(firstHumanActions.actions) ? firstHumanActions.actions : [];
  return (
    Boolean(firstHumanActions.ok) &&
    String(firstHumanActions.schema ?? "") === "worldcup26-first-human-actions-v1" &&
    String(firstHumanActions.referralCode ?? "") === "26BC4B90CB" &&
    String(firstHumanActions.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    actions.length >= 2 &&
    actions.some((action) =>
      String(action.id ?? "") === "real-warm-send" &&
      String(action.command ?? "").includes("campaign-warm-send-log.mjs") &&
      String(action.link ?? "").includes("ref=26BC4B90CB"),
    ) &&
    actions.some((action) =>
      ["clean-signup-test", "clean-signup-test-batch"].includes(String(action.id ?? "")) &&
      /campaign-(signup-conversion-audit|public-channel-attempts)\.mjs/.test(String(action.command ?? "")),
    ) &&
    String(firstHumanActions.rule ?? "").includes("Do not log planned work as proof")
  );
}

function isFirstSendBridgeOk(firstSendBridge) {
  return (
    Boolean(firstSendBridge.ok) &&
    String(firstSendBridge.schema ?? "") === "worldcup26-first-send-bridge-v1" &&
    String(firstSendBridge.referralCode ?? "") === "26BC4B90CB" &&
    String(firstSendBridge.referralLink ?? "") === "https://worldcup26.world/login?ref=26BC4B90CB" &&
    String(firstSendBridge.state ?? "") &&
    String(firstSendBridge.whatsapp ?? "").startsWith("https://wa.me/") &&
    String(firstSendBridge.referralQr ?? "").includes("quickchart.io/qr") &&
    String(firstSendBridge.whatsappQr ?? "").includes("quickchart.io/qr") &&
    /campaign-(warm-send-log|signup-conversion-audit|public-channel-attempts)\.mjs/.test(String(firstSendBridge.command ?? "")) &&
    String(firstSendBridge.copy ?? "").includes("26BC4B90CB") &&
    String(firstSendBridge.rule ?? "").includes("not proof")
  );
}

function isWorkerWakeOk(workerWake) {
  const workers = Array.isArray(workerWake.workers) ? workerWake.workers : [];
  return (
    Boolean(workerWake.ok) &&
    Boolean(workerWake.generatedAt) &&
    workers.length === 4 &&
    ["Dexter", "Sienna", "Memo", "Nano"].every((worker) =>
      workers.some((row) => sameText(row.worker, worker) && row.current),
    )
  );
}

function isProofCloseoutOk(proofCloseout) {
  const rows = Array.isArray(proofCloseout.rows) ? proofCloseout.rows : [];
  return (
    Boolean(proofCloseout.ok) &&
    Boolean(proofCloseout.generatedAt) &&
    String(proofCloseout.referralCode ?? "") === "26BC4B90CB" &&
    rows.length > 0 &&
    rows.every((row) =>
      Boolean(row.priority) &&
      Boolean(row.command) &&
      String(row.command).includes("campaign-proof-intake.mjs") &&
      String(row.command).includes("--happened-at") &&
      !/[<>]|YYYY-MM-DD|HH:mm/i.test(String(row.command)),
    )
  );
}

function isEscalationOk(escalation, hotPing) {
  const byWorker = Array.isArray(escalation.byWorker) ? escalation.byWorker : [];
  return (
    byWorker.length === 4 &&
    ["Dexter", "Sienna", "Memo", "Nano"].every((worker) =>
      byWorker.some((row) => sameText(row.worker, worker)),
    ) &&
    Boolean(escalation.linkOk) &&
    Number(escalation.counts?.externalOpen ?? -1) === Number(hotPing.urgentProofGaps ?? -2)
  );
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function readLocalReferralActivity() {
  try {
    return JSON.parse(await readFile(path.join(runtimeDir, "referral-activity.json"), "utf8"));
  } catch {
    return {};
  }
}

function normalizeLocalFunnel(row) {
  return {
    ...normalizeReferralActivity(row),
    ok: isReferralActivityOk(row),
    fresh: isFreshIso(row.generatedAt),
    generatedAtEest: row.generatedAtEest ? String(row.generatedAtEest) : "",
  };
}

function normalizeLinkCheck(row) {
  return {
    name: String(row.name ?? ""),
    ok: Boolean(row.ok),
    status: Number(row.status ?? 0),
    dplId: String(row.dplId ?? ""),
    failures: Array.isArray(row.failures) ? row.failures.map(String) : [],
  };
}

function normalizeSprintCard(row) {
  return {
    worker: String(row.worker ?? ""),
    source: String(row.source ?? ""),
    label: String(row.label ?? ""),
    channel: String(row.channel ?? ""),
    asset: String(row.asset ?? ""),
    action: String(row.action ?? ""),
  };
}

function normalizeProofStall(row) {
  return {
    ok: Boolean(row.ok),
    externalStalled: Boolean(row.externalStalled),
    proofStalled: Boolean(row.proofStalled),
    latestExternalProofAgeMinutes: row.latestExternalProofAgeMinutes == null ? null : Number(row.latestExternalProofAgeMinutes),
    latestAnyProofAgeMinutes: row.latestAnyProofAgeMinutes == null ? null : Number(row.latestAnyProofAgeMinutes),
    oldestOpenPriority: row.oldestOpenRow?.priority ? String(row.oldestOpenRow.priority) : "",
    oldestOpenOwner: row.oldestOpenRow?.owner ? String(row.oldestOpenRow.owner) : "",
    oldestOpenChannel: row.oldestOpenRow?.channel ? String(row.oldestOpenRow.channel) : "",
  };
}

function normalizeProofSla(row) {
  const doNow = Array.isArray(row.doNow) ? row.doNow : [];
  const first = doNow[0] ?? null;
  return {
    ok: Boolean(row.ok),
    state: String(row.proofState ?? ""),
    latestExternalProofAgeMinutes:
      row.latestExternalProofAgeMinutes == null ? null : Number(row.latestExternalProofAgeMinutes),
    urgentOpenRows: Number(row.counts?.urgentOpenRows ?? 0),
    doNowRows: Number(row.counts?.doNowRows ?? doNow.length),
    paidTrafficOk: Boolean(row.paidTrafficOk),
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          action: String(first.action ?? ""),
          ageLabel: String(first.ageLabel ?? ""),
          proofCommand: String(first.proofCommand ?? ""),
        }
      : null,
  };
}

function normalizeProofRescue(row) {
  const actions = Array.isArray(row.actions) ? row.actions : [];
  const first = actions[0] ?? null;
  return {
    ok: Boolean(row.ok),
    state: String(row.proofState ?? ""),
    latestExternalProofAgeLabel: String(row.latestExternalProofAgeLabel ?? ""),
    urgentOpenRows: Number(row.urgentOpenRows ?? 0),
    liveAdQaOk: Boolean(row.liveAdQaOk),
    actionCount: Number(row.actionCount ?? actions.length),
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          action: String(first.action ?? ""),
          phoneInstruction: String(first.phoneInstruction ?? ""),
        }
      : null,
  };
}

function normalizeProofUrlRecovery(row) {
  const rows = Array.isArray(row.rows) ? row.rows : [];
  const first = rows[0] ?? null;
  return {
    ok: Boolean(row.ok),
    pendingCount: Number(row.pendingCount ?? rows.length),
    first: first
      ? {
          timestampEest: String(first.timestampEest ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          pulse: String(first.pulse ?? ""),
          searchUrl: String(first.xLiveSearchUrl ?? ""),
          upgradeCommand: String(first.upgradeCommand ?? ""),
        }
      : null,
  };
}

function normalizeSocialRescue(row) {
  const actions = Array.isArray(row.actions) ? row.actions : [];
  const workerPages = Array.isArray(row.workerPages) ? row.workerPages : [];
  const first = actions[0] ?? null;
  return {
    ok: Boolean(row.ok),
    state: String(row.proofState ?? ""),
    latestExternalProofAgeLabel: String(row.latestExternalProofAgeLabel ?? ""),
    liveAdQaOk: Boolean(row.liveAdQaOk),
    actionCount: Number(row.actionCount ?? actions.length),
    workerPageCount: Number(row.workerPageCount ?? workerPages.length),
    workerPages: workerPages.map((page) => ({
      owner: String(page.owner ?? ""),
      fileName: String(page.fileName ?? ""),
      actionCount: Number(page.actionCount ?? 0),
    })),
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          shareLinks: Array.isArray(first.shareLinks) ? first.shareLinks.length : 0,
        }
      : null,
  };
}

function normalizeZeroSignupRescue(row) {
  const variants = Array.isArray(row.creativeVariants) ? row.creativeVariants : [];
  const first = variants[0] ?? null;
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    acceptedReferrals: Number(row.counts?.acceptedReferrals ?? 0),
    signupSaves: Number(row.counts?.signupSaves ?? 0),
    entries: Number(row.counts?.entries ?? 0),
    urgentOpenRows: Number(row.urgentOpenRows ?? 0),
    variantCount: variants.length,
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          hook: String(first.hook ?? ""),
          asset: String(first.asset ?? ""),
          link: String(first.link ?? ""),
        }
      : null,
  };
}

function normalizeRealActionBridge(row) {
  const actions = Array.isArray(row.actions) ? row.actions : [];
  const variants = Array.isArray(row.rescueVariants) ? row.rescueVariants : [];
  const first = actions[0] ?? null;
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    acceptedReferrals: Number(row.counts?.acceptedReferrals ?? 0),
    signupSaves: Number(row.counts?.signupSaves ?? 0),
    entries: Number(row.counts?.entries ?? 0),
    actionCount: Number(row.actionCount ?? actions.length),
    rescueVariantCount: Number(row.rescueVariantCount ?? variants.length),
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          action: String(first.action ?? ""),
          asset: String(first.asset ?? ""),
          trackedLink: String(first.trackedLink ?? ""),
        }
      : null,
  };
}

function normalizeOneClickShare(row) {
  const actions = Array.isArray(row.actions) ? row.actions : [];
  const first = actions[0] ?? null;
  return {
    ok: Boolean(row.ok),
    actionCount: Number(row.actionCount ?? actions.length),
    shareLinkCount: actions.reduce(
      (count, action) => count + (Array.isArray(action.shareLinks) ? action.shareLinks.length : 0),
      0,
    ),
    owners: [...new Set(actions.map((action) => String(action.owner ?? "")).filter(Boolean))],
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          action: String(first.action ?? ""),
          trackedLink: String(first.trackedLink ?? ""),
          shareLinks: Array.isArray(first.shareLinks) ? first.shareLinks.length : 0,
        }
      : null,
  };
}

function normalizePublicOutreachTargets(row) {
  const targets = Array.isArray(row.targets) ? row.targets : [];
  const first = targets[0] ?? null;
  const coverage = row.workerCoverage ?? {};
  return {
    ok: Boolean(row.ok),
    targetCount: Number(row.targetCount ?? targets.length),
    failures: Array.isArray(row.failures) ? row.failures.map(String) : [],
    workerCoverage: {
      required: Array.isArray(coverage.required) ? coverage.required.map(String) : [],
      owners: Array.isArray(coverage.owners) ? coverage.owners.map(String) : [],
      missing: Array.isArray(coverage.missing) ? coverage.missing.map(String) : [],
    },
    platformCount: new Set(targets.map((target) => String(target.platform ?? "")).filter(Boolean)).size,
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          platform: String(first.platform ?? ""),
          target: String(first.target ?? ""),
          link: String(first.link ?? ""),
        }
      : null,
  };
}

function normalizeAdOpsLinks(row) {
  const channels = Array.isArray(row.channels) ? row.channels : [];
  return {
    ok: Boolean(row.ok),
    channelCount: channels.length,
    platforms: channels.map((channel) => String(channel.platform ?? channel.key ?? "")).filter(Boolean),
    channels: channels.map((channel) => ({
      key: String(channel.key ?? ""),
      platform: String(channel.platform ?? ""),
      managerUrl: String(channel.managerUrl ?? ""),
      campaignUrl: String(channel.campaignUrl ?? ""),
      checklistCount: Array.isArray(channel.checklist) ? channel.checklist.length : 0,
      hasAttemptCommand: String(channel.attemptCommand ?? "").includes("campaign-public-channel-attempts.mjs"),
    })),
  };
}

function normalizePaidAdTriage(row) {
  const counts = row.counts ?? {};
  const dashboard = row.dashboard ?? {};
  const channels = Array.isArray(row.channels) ? row.channels : [];
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    paidViews: Number(row.paidViews ?? 0),
    appViews: Number(counts.appViews ?? 0),
    referralViews: Number(counts.referralViews ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    accepted: Number(counts.accepted ?? 0),
    dashboardState: String(dashboard.state ?? ""),
    dashboardChecks: Array.isArray(dashboard.latestChecks) ? dashboard.latestChecks.length : 0,
    dashboardImpressions: Number(dashboard.totalImpressions ?? 0),
    dashboardClicks: Number(dashboard.totalClicks ?? 0),
    dashboardSpend: Number(dashboard.totalSpend ?? 0),
    topSource: String(row.topSource ?? ""),
    topSignupSource: String(row.topSignupSource ?? ""),
    channelCount: channels.length,
    platforms: channels.map((channel) => String(channel.platform ?? channel.key ?? "")).filter(Boolean),
    channels: channels.map((channel) => ({
      key: String(channel.key ?? ""),
      platform: String(channel.platform ?? ""),
      managerUrl: String(channel.managerUrl ?? ""),
      landingUrl: String(channel.landingUrl ?? ""),
      guardStatus: Boolean(channel.guardStatus),
      hasDashboardProofCommand: String(channel.dashboardProofCommand ?? "").includes(
        "campaign-paid-dashboard-intake.mjs",
      ),
    })),
  };
}

function normalizePaidNoClickRescue(row) {
  const counts = row.counts ?? {};
  const variants = Array.isArray(row.variants) ? row.variants : [];
  const channels = Array.isArray(row.channels) ? row.channels : [];
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    dashboardState: String(row.dashboardState ?? ""),
    triageState: String(row.triageState ?? ""),
    dashboardChecks: Number(counts.dashboardChecks ?? 0),
    impressions: Number(counts.impressions ?? 0),
    clicks: Number(counts.clicks ?? 0),
    paidViews: Number(counts.paidViews ?? 0),
    appViews: Number(counts.appViews ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    variantCount: Number(row.variantCount ?? variants.length),
    platforms: channels.map((channel) => String(channel.platform ?? channel.key ?? "")).filter(Boolean),
    first: variants[0]
      ? {
          priority: String(variants[0].priority ?? ""),
          platform: String(variants[0].platform ?? ""),
          angle: String(variants[0].angle ?? ""),
          headline: String(variants[0].headline ?? ""),
          landingUrl: String(variants[0].landingUrl ?? ""),
        }
      : null,
  };
}

function normalizePaidDashboard(row) {
  const counts = row.counts ?? {};
  const latestChecks = Array.isArray(row.latestChecks) ? row.latestChecks : [];
  const channels = Array.isArray(row.channels) ? row.channels : [];
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    latestChecks: Number(counts.latestChecks ?? latestChecks.length),
    totalSpend: Number(counts.totalSpend ?? 0),
    totalImpressions: Number(counts.totalImpressions ?? 0),
    totalClicks: Number(counts.totalClicks ?? 0),
    paidViews: Number(counts.paidViews ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    platforms: channels.map((channel) => String(channel.platform ?? channel.key ?? "")).filter(Boolean),
    checks: latestChecks.map((check) => ({
      key: String(check.key ?? ""),
      platform: String(check.platform ?? ""),
      status: String(check.status ?? ""),
      impressions: Number(check.impressions ?? 0),
      clicks: Number(check.clicks ?? 0),
      spend: Number(check.spend ?? 0),
      warning: String(check.warning ?? ""),
    })),
  };
}

function normalizeReferralActivity(row) {
  const counts = row.counts ?? {};
  const accountCounts = row.accountCounts ?? {};
  const viewCounts = row.viewCounts ?? {};
  const latest = row.latest ?? {};
  const sourceBreakdown = Array.isArray(row.sourceBreakdown)
    ? row.sourceBreakdown
        .map((source) => ({
          source: String(source.source ?? ""),
          medium: source.medium ? String(source.medium) : "",
          campaign: source.campaign ? String(source.campaign) : "",
          content: source.content ? String(source.content) : "",
          count: Number(source.count ?? 0),
          lastViewedAt: source.lastViewedAt ? String(source.lastViewedAt) : "",
        }))
        .filter((source) => source.source && source.count > 0)
    : [];
  const signupSourceBreakdown = Array.isArray(row.signupSourceBreakdown)
    ? row.signupSourceBreakdown
        .map((source) => ({
          source: String(source.source ?? ""),
          medium: source.medium ? String(source.medium) : "",
          campaign: source.campaign ? String(source.campaign) : "",
          content: source.content ? String(source.content) : "",
          count: Number(source.count ?? 0),
          lastViewedAt: source.lastViewedAt ? String(source.lastViewedAt) : "",
        }))
        .filter((source) => source.source && source.count > 0)
    : [];
  return {
    ok: Boolean(row.ok),
    available: Boolean(row.available),
    status: String(row.status ?? ""),
    reason: String(row.reason ?? viewCounts.reason ?? ""),
    inviterFound: Boolean(row.inviterFound),
    inviterName: String(row.inviterName ?? ""),
    acceptedReferrals: Number(counts.acceptedReferrals ?? 0),
    acceptedReferrals24h: Number(counts.acceptedReferrals24h ?? 0),
    acceptedReferrals72h: Number(counts.acceptedReferrals72h ?? 0),
    signupReferralSaves: Number(counts.signupReferralSaves ?? 0),
    signupReferralSaves24h: Number(counts.signupReferralSaves24h ?? 0),
    signupReferralSaves72h: Number(counts.signupReferralSaves72h ?? 0),
    referredEntries: Number(counts.referredEntries ?? 0),
    referredDraftEntries: Number(counts.draftEntries ?? 0),
    referredLockedEntries: Number(counts.lockedEntries ?? 0),
    profiles: Number(accountCounts.profiles ?? 0),
    profiles24h: Number(accountCounts.profiles24h ?? 0),
    profiles72h: Number(accountCounts.profiles72h ?? 0),
    freeAccounts: Number(accountCounts.freeAccounts ?? 0),
    paidAccounts: Number(accountCounts.paidAccounts ?? 0),
    draftAccounts: Number(accountCounts.draftAccounts ?? 0),
    totalEntries: Number(accountCounts.totalEntries ?? 0),
    draftEntries: Number(accountCounts.draftEntries ?? 0),
    lockedEntries: Number(accountCounts.lockedEntries ?? 0),
    lockedEntries24h: Number(accountCounts.lockedEntries24h ?? 0),
    lockedEntries72h: Number(accountCounts.lockedEntries72h ?? 0),
    viewCountsAvailable: Boolean(viewCounts.available),
    appViews: Number(viewCounts.appViews ?? 0),
    appViews24h: Number(viewCounts.appViews24h ?? 0),
    appViews72h: Number(viewCounts.appViews72h ?? 0),
    referralViews: Number(viewCounts.referralViews ?? 0),
    referralViews24h: Number(viewCounts.referralViews24h ?? 0),
    referralViews72h: Number(viewCounts.referralViews72h ?? 0),
    signupReturned: Number(viewCounts.signupReturned ?? 0),
    signupMissingAcceptance: Number(viewCounts.signupMissingAcceptance ?? 0),
    signupAttempts: Number(viewCounts.signupAttempts ?? 0),
    signupSavedEvents: Number(viewCounts.signupSavedEvents ?? 0),
    signupFailedEvents: Number(viewCounts.signupFailedEvents ?? 0),
    signupErrorEvents: Number(viewCounts.signupErrorEvents ?? 0),
    sourceBreakdown,
    topSource: sourceBreakdown[0] ?? null,
    signupSourceBreakdown,
    topSignupSource: signupSourceBreakdown[0] ?? null,
    latestAcceptedReferralAt: latest.acceptedReferralAt ? String(latest.acceptedReferralAt) : "",
    latestSignupReferralSavedAt: latest.signupReferralSavedAt ? String(latest.signupReferralSavedAt) : "",
    latestEntryCreatedAt: latest.entryCreatedAt ? String(latest.entryCreatedAt) : "",
    latestEntryLockedAt: latest.entryLockedAt ? String(latest.entryLockedAt) : "",
  };
}

function normalizeSignupConversion(row) {
  const counts = row.counts ?? {};
  const dashboard = row.dashboard ?? {};
  const pathProof = row.pathProof ?? {};
  const blockers = Array.isArray(row.blockers) ? row.blockers.map(String) : [];
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    appViews: Number(counts.appViews ?? 0),
    referralViews: Number(counts.referralViews ?? 0),
    paidViews: Number(counts.paidViews ?? 0),
    accepted: Number(counts.accepted ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    entries: Number(counts.entries ?? 0),
    profiles: Number(counts.profiles ?? 0),
    free: Number(counts.free ?? 0),
    paid: Number(counts.paid ?? 0),
    signupReturned: Number(counts.signupReturned ?? 0),
    signupMissingAcceptance: Number(counts.signupMissingAcceptance ?? 0),
    signupAttempts: Number(counts.signupAttempts ?? 0),
    signupSavedEvents: Number(counts.signupSavedEvents ?? 0),
    signupFailedEvents: Number(counts.signupFailedEvents ?? 0),
    signupErrorEvents: Number(counts.signupErrorEvents ?? 0),
    dashboardState: String(dashboard.state ?? ""),
    dashboardClicks: Number(dashboard.clicks ?? 0),
    dashboardSpend: Number(dashboard.spend ?? 0),
    firstPaint: Boolean(pathProof.firstPaint),
    browserVerified: Boolean(pathProof.browserVerified),
    inviterFound: Boolean(pathProof.inviterFound),
    inviterName: String(pathProof.inviterName ?? ""),
    referralPercent: Number(pathProof.referralPercent ?? 0),
    blockerCount: blockers.length,
    blockers,
    firstAction: String(row.firstAction ?? ""),
    proofRule: String(row.proofRule ?? ""),
  };
}

function normalizeWarmContact(row) {
  const counts = row.counts ?? {};
  const batches = Array.isArray(row.batches) ? row.batches : [];
  const first = row.firstAction ?? batches[0] ?? null;
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    batches: Number(counts.batches ?? batches.length),
    postedAttempts: Number(counts.postedAttempts ?? 0),
    blockedPublic: Number(counts.blockedAttempts ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    firstAction: first
      ? `${String(first.owner ?? "")}/${String(first.platform ?? "")}/${String(first.audience ?? "")}`
      : "",
    firstLink: first ? String(first.link ?? "") : "",
    proofRule: String(row.proofRule ?? ""),
  };
}

function normalizeWarmFollowup(row) {
  const counts = row.counts ?? {};
  const latest = row.latestFollowupAttempt ?? row.latestWarmAttempt ?? null;
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    warmAttempts: Number(counts.warmAttempts ?? 0),
    testerAttempts: Number(counts.testerAttempts ?? 0),
    followupAttempts: Number(counts.followupAttempts ?? counts.warmAttempts ?? 0),
    followupMinutes: Number(row.followupMinutes ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    referralViews: Number(counts.referralViews ?? 0),
    profiles: Number(counts.profiles ?? 0),
    due: Boolean(latest?.due),
    latest: latest
      ? {
          owner: String(latest.owner ?? ""),
          platform: String(latest.platform ?? ""),
          channel: String(latest.channel ?? ""),
          status: String(latest.status ?? ""),
          ageMinutes: Number(latest.ageMinutes ?? 0),
          due: Boolean(latest.due),
        }
      : null,
    nextAction: String(row.nextAction ?? ""),
  };
}

function normalizeResponseKit(row) {
  const counts = row.counts ?? {};
  const first = row.currentFirstAction ?? null;
  const replies = Array.isArray(row.replies) ? row.replies : [];
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    replies: replies.length,
    warmAttempts: Number(counts.warmAttempts ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    referralViews: Number(counts.referralViews ?? 0),
    firstAction: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          task: String(first.task ?? ""),
        }
      : null,
    firstReply: replies[0]
      ? {
          id: String(replies[0].id ?? ""),
          trigger: String(replies[0].trigger ?? ""),
        }
      : null,
  };
}

function normalizeFirstHumanActions(row) {
  const counts = row.counts ?? {};
  const actions = Array.isArray(row.actions) ? row.actions : [];
  const first = row.firstAction ?? actions[0] ?? null;
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    warmAttempts: Number(counts.warmAttempts ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    referralViews: Number(counts.referralViews ?? 0),
    dashboardClicks: Number(counts.dashboardClicks ?? 0),
    actionCount: actions.length,
    firstAction: first
      ? {
          id: String(first.id ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          title: String(first.title ?? ""),
          link: String(first.link ?? ""),
          command: String(first.command ?? ""),
          doneWhen: String(first.doneWhen ?? ""),
        }
      : null,
  };
}

function normalizeFirstSendBridge(row) {
  const counts = row.counts ?? {};
  return {
    ok: Boolean(row.ok),
    state: String(row.state ?? ""),
    owner: String(row.owner ?? ""),
    channel: String(row.channel ?? ""),
    warmAttempts: Number(counts.warmAttempts ?? 0),
    signupSaves: Number(counts.signupSaves ?? 0),
    referralViews: Number(counts.referralViews ?? 0),
    adClicks: Number(counts.adClicks ?? 0),
    whatsappReady: String(row.whatsapp ?? "").startsWith("https://wa.me/"),
    referralQrReady: String(row.referralQr ?? "").includes("quickchart.io/qr"),
    whatsappQrReady: String(row.whatsappQr ?? "").includes("quickchart.io/qr"),
    command: String(row.command ?? ""),
  };
}

function normalizePostingCockpit(row) {
  const doNow = Array.isArray(row.doNow) ? row.doNow : [];
  const pages = Array.isArray(row.pages) ? row.pages : [];
  const first = doNow[0] ?? null;
  return {
    ok: Boolean(row.ok),
    proofState: String(row.proofState ?? ""),
    latestExternalProofAgeLabel: String(row.latestExternalProofAgeLabel ?? ""),
    urgentOpenRows: Number(row.urgentOpenRows ?? 0),
    paidTrafficOk: Boolean(row.paidTrafficOk),
    pageCount: pages.length,
    pages: pages.map((page) => (typeof page === "string" ? page : String(page.href ?? ""))).filter(Boolean),
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          action: String(first.action ?? ""),
        }
      : null,
  };
}

function normalizePhoneActionCenter(row) {
  const first = row.firstAction ?? null;
  return {
    ok: Boolean(row.ok),
    referralCode: String(row.referralCode ?? ""),
    actionCount: Number(row.actionCount ?? 0),
    urgentRows: Number(row.urgentRows ?? 0),
    ownerCount: Number(row.ownerCount ?? 0),
    qrBlockCount: Number(row.qrBlockCount ?? 0),
    trackedQrCount: Number(row.trackedQrCount ?? 0),
    assetBlockCount: Number(row.assetBlockCount ?? 0),
    videoPreviewCount: Number(row.videoPreviewCount ?? 0),
    imagePreviewCount: Number(row.imagePreviewCount ?? 0),
    shareButtonCount: Number(row.shareButtonCount ?? 0),
    htmlBytes: Number(row.htmlBytes ?? 0),
    failures: Array.isArray(row.failures) ? row.failures.map(String) : [],
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          action: String(first.action ?? ""),
          asset: String(first.asset ?? ""),
        }
      : null,
  };
}

function normalizePublicAttempts(row) {
  const firstBlocked = row.firstBlocked ?? null;
  const firstAction = row.firstAction ?? null;
  return {
    ok: Boolean(row.ok),
    attempts: Number(row.counts?.attempts ?? 0),
    blocked: Number(row.counts?.blocked ?? 0),
    loginRequired: Number(row.counts?.loginRequired ?? 0),
    approvalRequired: Number(row.counts?.approvalRequired ?? 0),
    socialActions: Number(row.counts?.socialActions ?? 0),
    failures: Array.isArray(row.failures) ? row.failures.map(String) : [],
    firstBlocked: firstBlocked
      ? {
          owner: String(firstBlocked.owner ?? ""),
          platform: String(firstBlocked.platform ?? ""),
          channel: String(firstBlocked.channel ?? ""),
          status: String(firstBlocked.status ?? ""),
          detail: String(firstBlocked.detail ?? ""),
          nextAction: String(firstBlocked.nextAction ?? ""),
        }
      : null,
    firstAction: firstAction
      ? {
          priority: String(firstAction.priority ?? ""),
          owner: String(firstAction.owner ?? ""),
          channel: String(firstAction.channel ?? ""),
          action: String(firstAction.action ?? ""),
        }
      : null,
  };
}

function normalizeLoginUnlock(row) {
  const first = Array.isArray(row.cards) ? row.cards[0] : null;
  return {
    ok: Boolean(row.ok),
    cards: Number(row.counts?.cards ?? (Array.isArray(row.cards) ? row.cards.length : 0)),
    blocked: Number(row.counts?.blocked ?? 0),
    loginRequired: Number(row.counts?.loginRequired ?? 0),
    approvalRequired: Number(row.counts?.approvalRequired ?? 0),
    platforms: Array.isArray(row.uniquePlatforms) ? row.uniquePlatforms.map(String).filter(Boolean) : [],
    failures: Array.isArray(row.failures) ? row.failures.map(String) : [],
    first: first
      ? {
          owner: String(first.owner ?? ""),
          platform: String(first.platform ?? ""),
          channel: String(first.channel ?? ""),
          status: String(first.status ?? ""),
          authUrl: String(first.authUrl ?? ""),
          publishUrl: String(first.publishUrl ?? ""),
          verifyUrl: String(first.verifyUrl ?? ""),
          asset: String(first.asset ?? ""),
          proofCommand: String(first.proofCommand ?? ""),
        }
      : null,
  };
}

function normalizeObjectiveAudit(row) {
  const requirements = Array.isArray(row.requirements) ? row.requirements : [];
  const firstOpen =
    requirements.find(
      (requirement) =>
        String(requirement.status ?? "") !== "proven" && String(requirement.severity ?? "") === "critical",
    ) ??
    requirements.find((requirement) => String(requirement.status ?? "") !== "proven") ??
    null;
  return {
    ok: Boolean(row.ok),
    complete: Boolean(row.complete),
    state: String(row.state ?? ""),
    proven: Number(row.counts?.proven ?? requirements.filter((requirement) => requirement.status === "proven").length),
    total: Number(row.counts?.total ?? requirements.length),
    criticalOpen: Number(row.counts?.critical ?? 0),
    firstOpen: firstOpen
      ? {
          id: String(firstOpen.id ?? ""),
          status: String(firstOpen.status ?? ""),
          label: String(firstOpen.label ?? ""),
          next: String(firstOpen.next ?? ""),
        }
      : null,
    primaryAction: row.nextAction?.primary
      ? {
          priority: String(row.nextAction.primary.priority ?? ""),
          owner: String(row.nextAction.primary.owner ?? ""),
          channel: String(row.nextAction.primary.channel ?? ""),
          proofCommand: String(row.nextAction.primary.proofCommand ?? ""),
        }
      : null,
    blocker: row.nextAction?.blocker
      ? {
          platform: String(row.nextAction.blocker.platform ?? ""),
          channel: String(row.nextAction.blocker.channel ?? ""),
          status: String(row.nextAction.blocker.status ?? ""),
        }
      : null,
  };
}

function normalizeOperatorPush(row) {
  const actions = Array.isArray(row.actions) ? row.actions : [];
  const first = row.firstAction ?? actions[0] ?? null;
  return {
    ok: Boolean(row.ok),
    complete: Boolean(row.complete),
    state: String(row.state ?? ""),
    proofRows: Number(row.proofRows ?? 0),
    urgentOpenRows: Number(row.urgentOpenRows ?? 0),
    publicBlocked: Number(row.publicBlocked ?? 0),
    publicLoginRequired: Number(row.publicLoginRequired ?? 0),
    actionCount: actions.length,
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          action: String(first.action ?? ""),
          asset: String(first.asset ?? ""),
          trackedLink: String(first.trackedLink ?? ""),
          proofCommand: String(first.proofCommand ?? ""),
        }
      : null,
    blockers: Array.isArray(row.blockers)
      ? row.blockers.map((blocker) => ({
          status: String(blocker.status ?? ""),
          owner: String(blocker.owner ?? ""),
          platform: String(blocker.platform ?? ""),
          channel: String(blocker.channel ?? ""),
          nextAction: String(blocker.nextAction ?? ""),
        }))
      : [],
  };
}

function normalizeProofCloseout(row) {
  const rows = Array.isArray(row.rows) ? row.rows : [];
  const first = rows[0] ?? null;
  return {
    ok: Boolean(row.ok),
    proofState: String(row.proofState ?? ""),
    latestExternalProofAgeLabel: String(row.latestExternalProofAgeLabel ?? ""),
    commandCount: rows.length,
    first: first
      ? {
          priority: String(first.priority ?? ""),
          owner: String(first.owner ?? ""),
          channel: String(first.channel ?? ""),
          status: String(first.status ?? ""),
          command: String(first.command ?? ""),
        }
      : null,
    failures: rows
      .filter((entry) => !String(entry.command ?? "").includes("campaign-proof-intake.mjs") || /[<>]|YYYY-MM-DD|HH:mm/i.test(String(entry.command ?? "")))
      .map((entry) => `#${entry.priority ?? "-"} invalid command`),
  };
}

function normalizeWorkerWake(row) {
  const workers = Array.isArray(row.workers) ? row.workers : [];
  const firstAction = row.firstAction ?? null;
  return {
    ok: Boolean(row.ok),
    proofState: String(row.proofState ?? ""),
    latestExternalProofAgeLabel: String(row.latestExternalProofAgeLabel ?? ""),
    urgentOpenRows: Number(row.urgentOpenRows ?? 0),
    workerCount: workers.length,
    workers: workers.map((worker) => ({
      worker: String(worker.worker ?? ""),
      state: String(worker.state ?? ""),
      assignedCount: Number(worker.assignedCount ?? 0),
      nextPriority: worker.current?.priority == null ? "" : String(worker.current.priority),
      nextChannel: worker.current?.channel == null ? "" : String(worker.current.channel),
      action: worker.current?.action == null ? "" : String(worker.current.action),
    })),
    nextActions: workers
      .map((worker) => {
        const name = String(worker.worker ?? "");
        const priority = worker.current?.priority == null ? "" : String(worker.current.priority);
        const channel = worker.current?.channel == null ? "" : String(worker.current.channel);
        return name && priority && channel ? `${name}:#${priority}/${channel}` : "";
      })
      .filter(Boolean),
    first: firstAction
      ? {
          priority: String(firstAction.priority ?? ""),
          owner: String(firstAction.owner ?? ""),
          channel: String(firstAction.channel ?? ""),
          action: String(firstAction.action ?? ""),
        }
      : null,
  };
}

function normalizePaidTraffic(row) {
  const pages = Array.isArray(row.checks?.pages) ? row.checks.pages : [];
  return {
    ok: Boolean(row.ok),
    deploymentIds: Array.isArray(row.deploymentIds) ? row.deploymentIds.map(String) : [],
    pageCount: pages.length,
    failedPages: pages
      .filter((page) => !page.ok)
      .map((page) => ({
        name: String(page.name ?? ""),
        failures: Array.isArray(page.failures) ? page.failures.map(String) : [],
      })),
    resolverOk: Boolean(row.checks?.resolver?.ok),
    healthOk: Boolean(row.checks?.health?.ok),
  };
}

function normalizeLiveAdQa(row) {
  const pages = Array.isArray(row.checks?.pages) ? row.checks.pages : [];
  const renderedAssets = Array.isArray(row.checks?.renderedAssets) ? row.checks.renderedAssets : [];
  const social = Array.isArray(row.checks?.social) ? row.checks.social : [];
  const localAssets = Array.isArray(row.checks?.localAssets) ? row.checks.localAssets : [];
  return {
    ok: Boolean(row.ok),
    deploymentIds: Array.isArray(row.deploymentIds) ? row.deploymentIds.map(String) : [],
    pageCount: pages.length,
    renderedAssetCount: renderedAssets.length,
    socialOk: social.filter((check) => check.ok).length,
    socialCount: social.length,
    localAssetOk: localAssets.filter((asset) => asset.ok).length,
    localAssetCount: localAssets.length,
    resolverOk: Boolean(row.checks?.resolver?.ok),
    healthOk: Boolean(row.checks?.health?.ok),
    authOk: Boolean(row.checks?.auth?.ok),
    failedPages: pages
      .filter((page) => !page.ok)
      .map((page) => ({
        name: String(page.name ?? ""),
        failures: Array.isArray(page.failures) ? page.failures.map(String) : [],
      })),
    failedRenderedAssets: renderedAssets
      .filter((asset) => !asset.ok)
      .map((asset) => ({
        url: String(asset.url ?? ""),
        failures: Array.isArray(asset.failures) ? asset.failures.map(String) : [],
      })),
    failedLocalAssets: localAssets
      .filter((asset) => !asset.ok)
      .map((asset) => ({
        path: String(asset.path ?? ""),
        failures: Array.isArray(asset.failures) ? asset.failures.map(String) : [],
      })),
  };
}

function normalizeAdPlatformAudit(row) {
  const pages = Array.isArray(row.checks?.pages) ? row.checks.pages : [];
  const socialImages = Array.isArray(row.checks?.socialImages) ? row.checks.socialImages : [];
  return {
    ok: Boolean(row.ok),
    deploymentIds: Array.isArray(row.deploymentIds) ? row.deploymentIds.map(String) : [],
    pageCount: pages.length,
    socialImageCount: socialImages.length,
    resolverOk: Boolean(row.checks?.resolver?.ok),
    healthOk: Boolean(row.checks?.health?.ok),
    failedPages: pages
      .filter((page) => !page.ok)
      .map((page) => ({
        name: String(page.name ?? ""),
        profile: String(page.profile ?? ""),
        failures: Array.isArray(page.failures) ? page.failures.map(String) : [],
      })),
    failedSocialImages: socialImages
      .filter((image) => !image.ok)
      .map((image) => ({
        url: String(image.url ?? ""),
        failures: Array.isArray(image.failures) ? image.failures.map(String) : [],
      })),
  };
}

function normalizeConversionGuard(row) {
  const firstPaint = Array.isArray(row.checks?.firstPaint) ? row.checks.firstPaint : [];
  return {
    ok: Boolean(row.ok),
    browserVerified: Boolean(row.browserVerified),
    deploymentIds: Array.isArray(row.deploymentIds) ? row.deploymentIds.map(String) : [],
    pageCount: firstPaint.length,
    resolverOk: Boolean(row.checks?.resolver?.ok),
    authOk: Boolean(row.checks?.auth?.ok),
    browserProofStatus: String(row.checks?.browserProof?.status ?? ""),
    failedPages: firstPaint
      .filter((page) => !page.ok)
      .map((page) => ({
        name: String(page.name ?? ""),
        failures: Array.isArray(page.failures) ? page.failures.map(String) : [],
      })),
  };
}

function normalizeSessionRecovery(row) {
  const recoveryActions = Array.isArray(row.recoveryActions) ? row.recoveryActions : [];
  return {
    proofRows: Number(row.proofRows ?? 0),
    urgentRows: Number(row.urgentRows ?? 0),
    blockerCount: Number(row.blockerCount ?? 0),
    recoveryActions: recoveryActions.map((action) => ({
      key: String(action.key ?? ""),
      label: String(action.label ?? ""),
      scheduledAtEest: String(action.scheduledAtEest ?? ""),
      shareUrl: String(action.shareUrl ?? ""),
    })),
  };
}

function normalizeEscalation(row) {
  return {
    linkOk: Boolean(row.linkOk),
    externalOpen: Number(row.counts?.externalOpen ?? 0),
    critical: Number(row.counts?.critical ?? 0),
    hot: Number(row.counts?.hot ?? 0),
    workersWithStale: Number(row.counts?.workersWithStale ?? 0),
    latestExternalProofAgeMinutes:
      row.latestExternalProofAgeMinutes == null ? null : Number(row.latestExternalProofAgeMinutes),
  };
}

function normalizeFirst(row) {
  if (!row) return null;
  if (Number(row.openRows ?? 0) <= 0 || row.nextPriority == null || !String(row.nextPriority).trim()) {
    return null;
  }
  return {
    worker: String(row.worker ?? ""),
    nextPriority: String(row.nextPriority ?? ""),
    nextChannel: String(row.nextChannel ?? ""),
    nextCommand: String(row.nextCommand ?? ""),
    action: row.nextAction?.action ? String(row.nextAction.action) : "",
    asset: row.nextAction?.asset ? String(row.nextAction.asset) : "",
    link: row.nextAction?.trackedLink ? String(row.nextAction.trackedLink) : "",
  };
}

function selectHostWorker(hotPing, host) {
  const hostWorker = workerNameForHost(host);
  const workers = Array.isArray(hotPing.workers) ? hotPing.workers : [];
  return workers.find((worker) => sameText(worker.worker, hostWorker)) ?? null;
}

function workerNameForHost(host) {
  const value = String(host ?? "").trim().toLowerCase();
  if (value === "dexter") return "Dexter";
  if (value === "sienna") return "Sienna";
  if (value === "memo") return "Memo";
  if (value === "nano") return "Nano";
  return value ? value[0].toUpperCase() + value.slice(1) : "";
}

function sameText(left, right) {
  return String(left ?? "").trim().toLowerCase() === String(right ?? "").trim().toLowerCase();
}

function normalizeWorker(row) {
  return {
    worker: String(row.worker ?? ""),
    openRows: Number(row.openRows ?? 0),
    escalation: String(row.escalation ?? ""),
    nextPriority: row.nextPriority == null ? null : String(row.nextPriority),
    nextChannel: row.nextChannel == null ? null : String(row.nextChannel),
    oldestAgeLabel: row.oldestAgeLabel == null ? null : String(row.oldestAgeLabel),
  };
}

function renderText(payload) {
  const lines = [
    `WorldCup26 remote war room ${payload.generatedAtEest}`,
    `hosts=${payload.summary.okHosts}/${payload.summary.totalHosts} loops=${payload.summary.loopsRunning}/${payload.summary.totalHosts} hot_hooks=${payload.summary.hotPingHooksOk}/${payload.summary.totalHosts} hot_fresh=${payload.summary.hotPingsFresh}/${payload.summary.totalHosts} link_sentinels=${payload.summary.linkSentinelsOk}/${payload.summary.totalHosts} link_fresh=${payload.summary.linkSentinelsFresh}/${payload.summary.totalHosts} paid_traffic=${payload.summary.paidTrafficGuardsOk}/${payload.summary.totalHosts} paid_fresh=${payload.summary.paidTrafficGuardsFresh}/${payload.summary.totalHosts} live_ad_qa=${payload.summary.liveAdQasOk}/${payload.summary.totalHosts} live_ad_fresh=${payload.summary.liveAdQasFresh}/${payload.summary.totalHosts} ad_platform=${payload.summary.adPlatformAuditsOk}/${payload.summary.totalHosts} ad_platform_fresh=${payload.summary.adPlatformAuditsFresh}/${payload.summary.totalHosts} conversion=${payload.summary.conversionGuardsOk}/${payload.summary.totalHosts} conversion_fresh=${payload.summary.conversionGuardsFresh}/${payload.summary.totalHosts} conversion_browser=${payload.summary.conversionGuardsBrowserVerified}/${payload.summary.totalHosts} posting_sprints=${payload.summary.postingSprintsOk}/${payload.summary.totalHosts} sprint_fresh=${payload.summary.postingSprintsFresh}/${payload.summary.totalHosts} session_recovery=${payload.summary.sessionRecoveriesOk}/${payload.summary.totalHosts} recovery_fresh=${payload.summary.sessionRecoveriesFresh}/${payload.summary.totalHosts} escalations=${payload.summary.escalationsOk}/${payload.summary.totalHosts} escalation_fresh=${payload.summary.escalationsFresh}/${payload.summary.totalHosts} proof_activity=${payload.summary.proofActivitiesOk}/${payload.summary.totalHosts} proof_stall_fresh=${payload.summary.proofStallsFresh}/${payload.summary.totalHosts} proof_sla=${payload.summary.proofSlasOk}/${payload.summary.totalHosts} sla_fresh=${payload.summary.proofSlasFresh}/${payload.summary.totalHosts} proof_rescue=${payload.summary.proofRescuesOk}/${payload.summary.totalHosts} rescue_fresh=${payload.summary.proofRescuesFresh}/${payload.summary.totalHosts} proof_url_recovery=${payload.summary.proofUrlRecoveriesOk}/${payload.summary.totalHosts} url_recovery_fresh=${payload.summary.proofUrlRecoveriesFresh}/${payload.summary.totalHosts} social_rescue=${payload.summary.socialRescuesOk}/${payload.summary.totalHosts} social_fresh=${payload.summary.socialRescuesFresh}/${payload.summary.totalHosts} cockpit=${payload.summary.postingCockpitsOk}/${payload.summary.totalHosts} cockpit_fresh=${payload.summary.postingCockpitsFresh}/${payload.summary.totalHosts} phone_action=${payload.summary.phoneActionCentersOk}/${payload.summary.totalHosts} phone_fresh=${payload.summary.phoneActionCentersFresh}/${payload.summary.totalHosts} proof_closeout=${payload.summary.proofCloseoutsOk}/${payload.summary.totalHosts} closeout_fresh=${payload.summary.proofCloseoutsFresh}/${payload.summary.totalHosts} closeout_commands=${payload.summary.proofCloseoutCommands} public_attempts=${payload.summary.publicAttemptsOk}/${payload.summary.totalHosts} attempts_fresh=${payload.summary.publicAttemptsFresh}/${payload.summary.totalHosts} login_unlock=${payload.summary.loginUnlocksOk}/${payload.summary.totalHosts} unlock_fresh=${payload.summary.loginUnlocksFresh}/${payload.summary.totalHosts} worker_wake=${payload.summary.workerWakesOk}/${payload.summary.totalHosts} wake_fresh=${payload.summary.workerWakesFresh}/${payload.summary.totalHosts} watchdogs=${payload.summary.watchdogLoopsRunning}/${payload.summary.totalHosts} watchdog_cron=${payload.summary.watchdogCronInstalled}/${payload.summary.totalHosts}`,
    `proof_counts=${payload.summary.proofCounts.join(",") || "-"} urgent_counts=${payload.summary.urgentCounts.join(",") || "-"}`,
    `proof_sla_states=${payload.summary.proofSlaStates.join(",") || "-"}`,
    `zero_signup=${payload.summary.zeroSignupRescuesOk}/${payload.summary.totalHosts} zero_fresh=${payload.summary.zeroSignupRescuesFresh}/${payload.summary.totalHosts} zero_states=${payload.summary.zeroSignupStates.join(",") || "-"} zero_entries=${payload.summary.zeroSignupCounts.join(",") || "-"}`,
    `real_action=${payload.summary.realActionBridgesOk}/${payload.summary.totalHosts} real_fresh=${payload.summary.realActionBridgesFresh}/${payload.summary.totalHosts} real_states=${payload.summary.realActionStates.join(",") || "-"} real_actions=${payload.summary.realActionCounts} real_variants=${payload.summary.realActionVariants}`,
    `proof_url_recovery_pending=${payload.summary.proofUrlRecoveryPending}`,
    `escalation_counts=critical:${payload.summary.criticalEscalations} hot:${payload.summary.hotEscalations}`,
    `public_attempts=blocked:${payload.summary.publicAttemptsBlocked} login_required:${payload.summary.publicAttemptsLoginRequired}`,
    `login_unlock=cards:${payload.summary.loginUnlockCards} blocked:${payload.summary.loginUnlockBlocked} login_required:${payload.summary.loginUnlockLoginRequired} platforms=${payload.summary.loginUnlockPlatforms.join(",") || "-"}`,
    `objective_audit=${payload.summary.objectiveAuditsOk}/${payload.summary.totalHosts} objective_fresh=${payload.summary.objectiveAuditsFresh}/${payload.summary.totalHosts} objective_states=${payload.summary.objectiveAuditStates.join(",") || "-"} objective_complete=${payload.summary.objectiveAuditComplete}/${payload.summary.totalHosts} objective_critical_open=${payload.summary.objectiveAuditCriticalOpen}`,
    `operator_push=${payload.summary.operatorPushesOk}/${payload.summary.totalHosts} operator_fresh=${payload.summary.operatorPushesFresh}/${payload.summary.totalHosts} operator_states=${payload.summary.operatorPushStates.join(",") || "-"} operator_actions=${payload.summary.operatorPushActions} operator_blocked=${payload.summary.operatorPushBlocked} operator_login_required=${payload.summary.operatorPushLoginRequired}`,
    `one_click=${payload.summary.oneClickSharesOk}/${payload.summary.totalHosts} one_click_fresh=${payload.summary.oneClickSharesFresh}/${payload.summary.totalHosts} one_click_actions=${payload.summary.oneClickShareActions} one_click_share_links=${payload.summary.oneClickShareLinks}`,
    `public_targets=${payload.summary.publicOutreachTargetsOk}/${payload.summary.totalHosts} public_targets_fresh=${payload.summary.publicOutreachTargetsFresh}/${payload.summary.totalHosts} target_count=${payload.summary.publicOutreachTargetCount} owners=${payload.summary.publicOutreachOwners.join(",") || "-"} missing=${payload.summary.publicOutreachMissingOwners.join(",") || "none"}`,
    `ad_ops_links=${payload.summary.adOpsLinksOk}/${payload.summary.totalHosts} ad_ops_fresh=${payload.summary.adOpsLinksFresh}/${payload.summary.totalHosts} ad_ops_channels=${payload.summary.adOpsChannels} platforms=${payload.summary.adOpsPlatforms.join(",") || "-"}`,
    `paid_ad_triage=${payload.summary.paidAdTriagesOk}/${payload.summary.totalHosts} paid_ad_fresh=${payload.summary.paidAdTriagesFresh}/${payload.summary.totalHosts} paid_ad_states=${payload.summary.paidAdTriageStates.join(",") || "-"} paid_views=${payload.summary.paidAdTriagePaidViews} paid_app_views=${payload.summary.paidAdTriageAppViews} paid_referral_views=${payload.summary.paidAdTriageReferralViews} paid_signup_saves=${payload.summary.paidAdTriageSignupSaves} dashboard_states=${payload.summary.paidAdDashboardStates.join(",") || "-"} dashboard_checks=${payload.summary.paidAdDashboardChecks} dashboard_impressions=${payload.summary.paidAdDashboardImpressions} dashboard_clicks=${payload.summary.paidAdDashboardClicks}`,
    `signup_conversion=${payload.summary.signupConversionsOk}/${payload.summary.totalHosts} signup_fresh=${payload.summary.signupConversionsFresh}/${payload.summary.totalHosts} signup_states=${payload.summary.signupConversionStates.join(",") || "-"} signup_paid_views=${payload.summary.signupConversionPaidViews} signup_referral_views=${payload.summary.signupConversionReferralViews} signup_dashboard_clicks=${payload.summary.signupConversionDashboardClicks} signup_accepted=${payload.summary.signupConversionAccepted} signup_saves=${payload.summary.signupConversionSignupSaves} signup_profiles=${payload.summary.signupConversionProfiles}`,
    `signup_funnel=returned:${payload.summary.signupConversionReturned} missing_acceptance:${payload.summary.signupConversionMissingAcceptance} attempts:${payload.summary.signupConversionAttempts} saved_events:${payload.summary.signupConversionSavedEvents} failed:${payload.summary.signupConversionFailedEvents} errors:${payload.summary.signupConversionErrorEvents}`,
    `warm_contact=${payload.summary.warmContactsOk}/${payload.summary.totalHosts} warm_fresh=${payload.summary.warmContactsFresh}/${payload.summary.totalHosts} warm_states=${payload.summary.warmContactStates.join(",") || "-"} warm_batches=${payload.summary.warmContactBatches} warm_blocked_public=${payload.summary.warmContactBlockedPublic} warm_signup_saves=${payload.summary.warmContactSignupSaves} warm_first=${payload.summary.warmContactFirstActions.join(";") || "-"}`,
    `warm_followup=${payload.summary.warmFollowupsOk}/${payload.summary.totalHosts} warm_followup_fresh=${payload.summary.warmFollowupsFresh}/${payload.summary.totalHosts} warm_followup_states=${payload.summary.warmFollowupStates.join(",") || "-"} warm_attempts=${payload.summary.warmFollowupAttempts} tester_attempts=${payload.summary.warmFollowupTesterAttempts} followup_attempts=${payload.summary.warmFollowupTotalAttempts} warm_followup_due=${payload.summary.warmFollowupDue} warm_followup_referral_views=${payload.summary.warmFollowupReferralViews} warm_followup_signup_saves=${payload.summary.warmFollowupSignupSaves}`,
    `response_kit=${payload.summary.responseKitsOk}/${payload.summary.totalHosts} response_fresh=${payload.summary.responseKitsFresh}/${payload.summary.totalHosts} response_states=${payload.summary.responseKitStates.join(",") || "-"} response_replies=${payload.summary.responseKitReplies} response_warm_attempts=${payload.summary.responseKitWarmAttempts} response_signup_saves=${payload.summary.responseKitSignupSaves}`,
    `first_human=${payload.summary.firstHumanActionsOk}/${payload.summary.totalHosts} first_human_fresh=${payload.summary.firstHumanActionsFresh}/${payload.summary.totalHosts} first_human_states=${payload.summary.firstHumanActionStates.join(",") || "-"} first_human_actions=${payload.summary.firstHumanActionCount} first_human_warm_attempts=${payload.summary.firstHumanWarmAttempts} first_human_signup_saves=${payload.summary.firstHumanSignupSaves} first_human_referral_views=${payload.summary.firstHumanReferralViews} first_human_ad_clicks=${payload.summary.firstHumanDashboardClicks} first_human_first=${payload.summary.firstHumanFirstActions.join(";") || "-"}`,
    `first_send_bridge=${payload.summary.firstSendBridgesOk}/${payload.summary.totalHosts} first_send_fresh=${payload.summary.firstSendBridgesFresh}/${payload.summary.totalHosts} first_send_states=${payload.summary.firstSendBridgeStates.join(",") || "-"} first_send_warm_attempts=${payload.summary.firstSendBridgeWarmAttempts} first_send_signup_saves=${payload.summary.firstSendBridgeSignupSaves} first_send_ad_clicks=${payload.summary.firstSendBridgeAdClicks} first_send_owners=${payload.summary.firstSendBridgeOwners.join(",") || "-"}`,
    `paid_no_click=${payload.summary.paidNoClickRescuesOk}/${payload.summary.totalHosts} paid_no_click_fresh=${payload.summary.paidNoClickRescuesFresh}/${payload.summary.totalHosts} paid_no_click_states=${payload.summary.paidNoClickStates.join(",") || "-"} paid_no_click_variants=${payload.summary.paidNoClickVariants}`,
    `paid_dashboard=${payload.summary.paidDashboardsOk}/${payload.summary.totalHosts} paid_dashboard_fresh=${payload.summary.paidDashboardsFresh}/${payload.summary.totalHosts} paid_dashboard_states=${payload.summary.paidDashboardDirectStates.join(",") || "-"} paid_dashboard_checks=${payload.summary.paidDashboardDirectChecks} paid_dashboard_impressions=${payload.summary.paidDashboardDirectImpressions} paid_dashboard_clicks=${payload.summary.paidDashboardDirectClicks}`,
    `funnel_monitor=${payload.summary.referralActivitiesOk}/${payload.summary.totalHosts} funnel_fresh=${payload.summary.referralActivitiesFresh}/${payload.summary.totalHosts} funnel_available=${payload.summary.referralActivitiesAvailable}/${payload.summary.totalHosts}`,
    `funnel_counts=views:${payload.summary.funnelAppViews} views_24h:${payload.summary.funnelAppViews24h} referral_views:${payload.summary.funnelReferralViews} referral_views_24h:${payload.summary.funnelReferralViews24h} profiles:${payload.summary.funnelProfiles} free:${payload.summary.funnelFreeAccounts} paid:${payload.summary.funnelPaidAccounts} accepted:${payload.summary.funnelAcceptedReferrals} signup_saves:${payload.summary.funnelSignupSaves} entries:${payload.summary.funnelReferredEntries}`,
    `funnel_signup_events=returned:${payload.summary.funnelSignupReturned} missing_acceptance:${payload.summary.funnelSignupMissingAcceptance} attempts:${payload.summary.funnelSignupAttempts} saved_events:${payload.summary.funnelSignupSavedEvents} failed:${payload.summary.funnelSignupFailedEvents} errors:${payload.summary.funnelSignupErrorEvents}`,
    `local_funnel=${payload.summary.localFunnelOk ? payload.summary.localFunnelStatus || "yes" : "no"} local_fresh=${payload.summary.localFunnelFresh ? "yes" : "no"} local_available=${payload.summary.localFunnelAvailable ? "yes" : "no"} local_generated=${payload.summary.localFunnelGeneratedAtEest || "-"}`,
    `local_counts=views:${payload.summary.localFunnelAppViews} views_24h:${payload.summary.localFunnelAppViews24h} referral_views:${payload.summary.localFunnelReferralViews} referral_views_24h:${payload.summary.localFunnelReferralViews24h} profiles:${payload.summary.localFunnelProfiles} free:${payload.summary.localFunnelFreeAccounts} paid:${payload.summary.localFunnelPaidAccounts} accepted:${payload.summary.localFunnelAcceptedReferrals} signup_saves:${payload.summary.localFunnelSignupSaves} entries:${payload.summary.localFunnelReferredEntries}`,
    `local_signup_events=returned:${payload.summary.localFunnelSignupReturned} missing_acceptance:${payload.summary.localFunnelSignupMissingAcceptance} attempts:${payload.summary.localFunnelSignupAttempts} saved_events:${payload.summary.localFunnelSignupSavedEvents} failed:${payload.summary.localFunnelSignupFailedEvents} errors:${payload.summary.localFunnelSignupErrorEvents}`,
    payload.summary.localFunnelTopSource
      ? `local_top_source=${payload.summary.localFunnelTopSource.source} medium=${payload.summary.localFunnelTopSource.medium || "-"} campaign=${payload.summary.localFunnelTopSource.campaign || "-"} content=${payload.summary.localFunnelTopSource.content || "-"} views=${payload.summary.localFunnelTopSource.count}`
      : "local_top_source=-",
    payload.summary.localFunnelTopSignupSource
      ? `local_top_signup_source=${payload.summary.localFunnelTopSignupSource.source} medium=${payload.summary.localFunnelTopSignupSource.medium || "-"} campaign=${payload.summary.localFunnelTopSignupSource.campaign || "-"} content=${payload.summary.localFunnelTopSignupSource.content || "-"} signups=${payload.summary.localFunnelTopSignupSource.count}`
      : "local_top_signup_source=-",
    `aligned=${payload.summary.aligned ? "yes" : "no"} unhealthy=${payload.summary.unhealthyHosts.join(",") || "none"}`,
    "",
  ];
  for (const host of payload.hosts) {
    lines.push(`${host.host}: ${host.ok ? "ok" : "error"} proof=${host.proof} urgent=${host.urgent} loop=${host.loopRunning ? "yes" : "no"} hook=${host.hotPingHookOk ? "yes" : "no"} hot_fresh=${host.hotPingFresh ? "yes" : "no"} link=${host.linkSentinelOk ? "yes" : "no"} link_fresh=${host.linkSentinelFresh ? "yes" : "no"} paid=${host.paidTrafficOk ? "yes" : "no"} paid_fresh=${host.paidTrafficFresh ? "yes" : "no"} live_ad=${host.liveAdQaOk ? "yes" : "no"} live_ad_fresh=${host.liveAdQaFresh ? "yes" : "no"} ad_platform=${host.adPlatformAuditOk ? "yes" : "no"} ad_platform_fresh=${host.adPlatformAuditFresh ? "yes" : "no"} conversion=${host.conversionGuardOk ? "yes" : "no"} conversion_fresh=${host.conversionGuardFresh ? "yes" : "no"} conversion_browser=${host.conversionGuard.browserVerified ? "yes" : "no"} sprint=${host.postingSprintOk ? "yes" : "no"} sprint_fresh=${host.postingSprintFresh ? "yes" : "no"} recovery=${host.sessionRecoveryOk ? "yes" : "no"} recovery_fresh=${host.sessionRecoveryFresh ? "yes" : "no"} escalation=${host.escalationOk ? "yes" : "no"} escalation_fresh=${host.escalationFresh ? "yes" : "no"} proof_activity=${host.proofActivityOk ? "yes" : "no"} proof_stall_fresh=${host.proofStallFresh ? "yes" : "no"} proof_sla=${host.proofSlaOk ? host.proofSla.state || "yes" : "no"} sla_fresh=${host.proofSlaFresh ? "yes" : "no"} proof_rescue=${host.proofRescueOk ? "yes" : "no"} rescue_fresh=${host.proofRescueFresh ? "yes" : "no"} proof_url_recovery=${host.proofUrlRecoveryOk ? host.proofUrlRecovery.pendingCount : "no"} url_recovery_fresh=${host.proofUrlRecoveryFresh ? "yes" : "no"} social_rescue=${host.socialRescueOk ? "yes" : "no"} social_fresh=${host.socialRescueFresh ? "yes" : "no"} zero_signup=${host.zeroSignupRescueOk ? host.zeroSignupRescue.state || "yes" : "no"} zero_fresh=${host.zeroSignupRescueFresh ? "yes" : "no"} real_action=${host.realActionBridgeOk ? host.realActionBridge.state || "yes" : "no"} real_fresh=${host.realActionBridgeFresh ? "yes" : "no"} cockpit=${host.postingCockpitOk ? "yes" : "no"} cockpit_fresh=${host.postingCockpitFresh ? "yes" : "no"} phone_action=${host.phoneActionCenterOk ? "yes" : "no"} phone_fresh=${host.phoneActionCenterFresh ? "yes" : "no"} proof_closeout=${host.proofCloseoutOk ? host.proofCloseout.commandCount : "no"} closeout_fresh=${host.proofCloseoutFresh ? "yes" : "no"} public_attempts=${host.publicAttemptsOk ? "yes" : "no"} attempts_fresh=${host.publicAttemptsFresh ? "yes" : "no"} worker_wake=${host.workerWakeOk ? "yes" : "no"} wake_fresh=${host.workerWakeFresh ? "yes" : "no"} watchdog=${host.watchdogRunning ? "yes" : "no"} cron=${host.watchdogCronInstalled ? "yes" : "no"}`);
    lines.push(`  objective_audit=${host.objectiveAuditOk ? host.objectiveAudit.state || "yes" : "no"} objective_fresh=${host.objectiveAuditFresh ? "yes" : "no"} complete=${host.objectiveAudit.complete ? "yes" : "no"} proven=${host.objectiveAudit.proven}/${host.objectiveAudit.total} critical_open=${host.objectiveAudit.criticalOpen}`);
    lines.push(`  operator_push=${host.operatorPushOk ? host.operatorPush.state || "yes" : "no"} operator_fresh=${host.operatorPushFresh ? "yes" : "no"} actions=${host.operatorPush.actionCount} blocked=${host.operatorPush.publicBlocked} login_required=${host.operatorPush.publicLoginRequired} first=${host.operatorPush.first ? `#${host.operatorPush.first.priority} ${host.operatorPush.first.owner} / ${host.operatorPush.first.channel}` : "-"}`);
    lines.push(`  one_click=${host.oneClickShareOk ? "yes" : "no"} one_click_fresh=${host.oneClickShareFresh ? "yes" : "no"} actions=${host.oneClickShare.actionCount} share_links=${host.oneClickShare.shareLinkCount} first=${host.oneClickShare.first ? `#${host.oneClickShare.first.priority} ${host.oneClickShare.first.owner} / ${host.oneClickShare.first.channel}` : "-"}`);
    lines.push(`  public_targets=${host.publicOutreachTargetsOk ? "yes" : "no"} public_targets_fresh=${host.publicOutreachTargetsFresh ? "yes" : "no"} targets=${host.publicOutreachTargets.targetCount} owners=${host.publicOutreachTargets.workerCoverage.owners.join(",") || "-"} missing=${host.publicOutreachTargets.workerCoverage.missing.join(",") || "none"} first=${host.publicOutreachTargets.first ? `${host.publicOutreachTargets.first.owner} / ${host.publicOutreachTargets.first.platform}` : "-"}`);
    lines.push(`  ad_ops=${host.adOpsLinksOk ? "yes" : "no"} ad_ops_fresh=${host.adOpsLinksFresh ? "yes" : "no"} channels=${host.adOpsLinks.channelCount} platforms=${host.adOpsLinks.platforms.join(",") || "-"}`);
    lines.push(`  paid_ad_triage=${host.paidAdTriageOk ? host.paidAdTriage.state || "yes" : "no"} paid_ad_fresh=${host.paidAdTriageFresh ? "yes" : "no"} paid_views=${host.paidAdTriage.paidViews} app_views=${host.paidAdTriage.appViews} referral_views=${host.paidAdTriage.referralViews} signup_saves=${host.paidAdTriage.signupSaves} dashboard=${host.paidAdTriage.dashboardState || "-"} dashboard_checks=${host.paidAdTriage.dashboardChecks} dashboard_impressions=${host.paidAdTriage.dashboardImpressions} dashboard_clicks=${host.paidAdTriage.dashboardClicks} platforms=${host.paidAdTriage.platforms.join(",") || "-"}`);
    lines.push(`  signup_conversion=${host.signupConversionOk ? host.signupConversion.state || "yes" : "no"} signup_fresh=${host.signupConversionFresh ? "yes" : "no"} paid_views=${host.signupConversion.paidViews} referral_views=${host.signupConversion.referralViews} dashboard_clicks=${host.signupConversion.dashboardClicks} accepted=${host.signupConversion.accepted} signup_saves=${host.signupConversion.signupSaves} returned=${host.signupConversion.signupReturned} attempts=${host.signupConversion.signupAttempts} saved_events=${host.signupConversion.signupSavedEvents} failed=${host.signupConversion.signupFailedEvents} errors=${host.signupConversion.signupErrorEvents} blockers=${host.signupConversion.blockerCount} first_action=${host.signupConversion.firstAction || "-"}`);
    lines.push(`  warm_contact=${host.warmContactOk ? host.warmContact.state || "yes" : "no"} warm_fresh=${host.warmContactFresh ? "yes" : "no"} batches=${host.warmContact.batches} blocked_public=${host.warmContact.blockedPublic} signup_saves=${host.warmContact.signupSaves} first=${host.warmContact.firstAction || "-"} link=${host.warmContact.firstLink || "-"}`);
    lines.push(`  warm_followup=${host.warmFollowupOk ? host.warmFollowup.state || "yes" : "no"} warm_followup_fresh=${host.warmFollowupFresh ? "yes" : "no"} warm_attempts=${host.warmFollowup.warmAttempts} tester_attempts=${host.warmFollowup.testerAttempts} followup_attempts=${host.warmFollowup.followupAttempts} due=${host.warmFollowup.due ? "yes" : "no"} referral_views=${host.warmFollowup.referralViews} signup_saves=${host.warmFollowup.signupSaves} latest=${host.warmFollowup.latest ? `${host.warmFollowup.latest.owner}/${host.warmFollowup.latest.platform}/${host.warmFollowup.latest.channel || "-"}/${host.warmFollowup.latest.status}` : "-"} next=${host.warmFollowup.nextAction || "-"}`);
    lines.push(`  response_kit=${host.responseKitOk ? host.responseKit.state || "yes" : "no"} response_fresh=${host.responseKitFresh ? "yes" : "no"} replies=${host.responseKit.replies} warm_attempts=${host.responseKit.warmAttempts} signup_saves=${host.responseKit.signupSaves} first_reply=${host.responseKit.firstReply ? `${host.responseKit.firstReply.id}/${host.responseKit.firstReply.trigger}` : "-"} first_action=${host.responseKit.firstAction ? `#${host.responseKit.firstAction.priority} ${host.responseKit.firstAction.owner} / ${host.responseKit.firstAction.channel}` : "-"}`);
    lines.push(`  first_human=${host.firstHumanActionsOk ? host.firstHumanActions.state || "yes" : "no"} first_human_fresh=${host.firstHumanActionsFresh ? "yes" : "no"} actions=${host.firstHumanActions.actionCount} warm_attempts=${host.firstHumanActions.warmAttempts} signup_saves=${host.firstHumanActions.signupSaves} referral_views=${host.firstHumanActions.referralViews} ad_clicks=${host.firstHumanActions.dashboardClicks} first=${host.firstHumanActions.firstAction ? `${host.firstHumanActions.firstAction.owner}/${host.firstHumanActions.firstAction.channel}/${host.firstHumanActions.firstAction.id}` : "-"} command=${host.firstHumanActions.firstAction?.command || "-"}`);
    lines.push(`  first_send_bridge=${host.firstSendBridgeOk ? host.firstSendBridge.state || "yes" : "no"} first_send_fresh=${host.firstSendBridgeFresh ? "yes" : "no"} owner=${host.firstSendBridge.owner || "-"} channel=${host.firstSendBridge.channel || "-"} warm_attempts=${host.firstSendBridge.warmAttempts} signup_saves=${host.firstSendBridge.signupSaves} whatsapp=${host.firstSendBridge.whatsappReady ? "yes" : "no"} qr=${host.firstSendBridge.referralQrReady && host.firstSendBridge.whatsappQrReady ? "yes" : "no"} command=${host.firstSendBridge.command || "-"}`);
    lines.push(`  paid_no_click=${host.paidNoClickRescueOk ? host.paidNoClickRescue.state || "yes" : "no"} paid_no_click_fresh=${host.paidNoClickRescueFresh ? "yes" : "no"} variants=${host.paidNoClickRescue.variantCount} impressions=${host.paidNoClickRescue.impressions} clicks=${host.paidNoClickRescue.clicks} first=${host.paidNoClickRescue.first ? `${host.paidNoClickRescue.first.priority} ${host.paidNoClickRescue.first.platform} / ${host.paidNoClickRescue.first.angle}` : "-"}`);
    lines.push(`  paid_dashboard=${host.paidDashboardOk ? host.paidDashboard.state || "yes" : "no"} paid_dashboard_fresh=${host.paidDashboardFresh ? "yes" : "no"} checks=${host.paidDashboard.latestChecks} impressions=${host.paidDashboard.totalImpressions} clicks=${host.paidDashboard.totalClicks} spend=${host.paidDashboard.totalSpend} platforms=${host.paidDashboard.platforms.join(",") || "-"}`);
    lines.push(`  funnel=${host.referralActivityOk ? host.referralActivity.status || "yes" : "no"} funnel_fresh=${host.referralActivityFresh ? "yes" : "no"} available=${host.referralActivityAvailable ? "yes" : "no"} profiles=${host.referralActivity.profiles} free=${host.referralActivity.freeAccounts} paid=${host.referralActivity.paidAccounts} views=${host.referralActivity.appViews} referral_views=${host.referralActivity.referralViews} accepted=${host.referralActivity.acceptedReferrals} signup_saves=${host.referralActivity.signupReferralSaves} entries=${host.referralActivity.referredEntries} returned=${host.referralActivity.signupReturned} attempts=${host.referralActivity.signupAttempts} saved_events=${host.referralActivity.signupSavedEvents} failed=${host.referralActivity.signupFailedEvents} errors=${host.referralActivity.signupErrorEvents}`);
    if (host.proofSlaOk && host.proofSla.first) {
      lines.push(`  proof_sla=state:${host.proofSla.state} latest_external:${formatAge(host.proofSla.latestExternalProofAgeMinutes)} do_now:#${host.proofSla.first.priority} ${host.proofSla.first.owner} / ${host.proofSla.first.channel} age=${host.proofSla.first.ageLabel}`);
    }
    if (host.proofRescueOk && host.proofRescue.first) {
      lines.push(`  proof_rescue=state:${host.proofRescue.state} actions:${host.proofRescue.actionCount} first:#${host.proofRescue.first.priority} ${host.proofRescue.first.owner} / ${host.proofRescue.first.channel}`);
    }
    if (host.socialRescueOk && host.socialRescue.first) {
      lines.push(`  social_rescue=state:${host.socialRescue.state} actions:${host.socialRescue.actionCount} worker_pages:${host.socialRescue.workerPageCount} first:#${host.socialRescue.first.priority} ${host.socialRescue.first.owner} / ${host.socialRescue.first.channel} share_links=${host.socialRescue.first.shareLinks}`);
    }
    if (host.proofUrlRecoveryOk && host.proofUrlRecovery.first) {
      lines.push(`  proof_url_recovery=pending:${host.proofUrlRecovery.pendingCount} first:${host.proofUrlRecovery.first.pulse} ${host.proofUrlRecovery.first.owner} / ${host.proofUrlRecovery.first.channel}`);
    }
    if (host.escalationOk) {
      lines.push(`  escalation=open:${host.escalation.externalOpen} critical:${host.escalation.critical} hot:${host.escalation.hot} workers_stale:${host.escalation.workersWithStale}`);
    }
    if (host.workerWakeOk) {
      lines.push(`  worker_wake=state:${host.workerWake.proofState} workers:${host.workerWake.workerCount} first:${host.workerWake.first ? `#${host.workerWake.first.priority} ${host.workerWake.first.owner} / ${host.workerWake.first.channel}` : "-"}`);
      lines.push(`  worker_wake_next=${host.workerWake.nextActions.join("; ") || "-"}`);
    }
    if (host.phoneActionCenterOk) {
      lines.push(`  phone_action=actions:${host.phoneActionCenter.actionCount} qr:${host.phoneActionCenter.qrBlockCount} assets:${host.phoneActionCenter.assetBlockCount} video:${host.phoneActionCenter.videoPreviewCount} first:${host.phoneActionCenter.first ? `#${host.phoneActionCenter.first.priority} ${host.phoneActionCenter.first.owner} / ${host.phoneActionCenter.first.channel}` : "-"}`);
    } else {
      lines.push(`  phone_action=failures:${host.phoneActionCenter.failures.join("|") || "missing or invalid"}`);
    }
    if (host.publicAttemptsOk) {
      lines.push(`  public_attempts=attempts:${host.publicAttempts.attempts} blocked:${host.publicAttempts.blocked} login_required:${host.publicAttempts.loginRequired} social_actions:${host.publicAttempts.socialActions} first_blocked:${host.publicAttempts.firstBlocked ? `${host.publicAttempts.firstBlocked.platform} / ${host.publicAttempts.firstBlocked.channel}` : "-"}`);
    } else {
      lines.push(`  public_attempts=failures:${host.publicAttempts.failures.join("|") || "missing or invalid"}`);
    }
    if (host.loginUnlockOk) {
      lines.push(`  login_unlock=cards:${host.loginUnlock.cards} blocked:${host.loginUnlock.blocked} login_required:${host.loginUnlock.loginRequired} platforms:${host.loginUnlock.platforms.join(",") || "-"} first:${host.loginUnlock.first ? `${host.loginUnlock.first.platform} / ${host.loginUnlock.first.channel}` : "-"}`);
    } else {
      lines.push(`  login_unlock=failures:${host.loginUnlock.failures.join("|") || "missing or invalid"}`);
    }
    if (host.objectiveAuditOk && host.objectiveAudit.firstOpen) {
      lines.push(`  objective_open=${host.objectiveAudit.firstOpen.status}:${host.objectiveAudit.firstOpen.id} next=${host.objectiveAudit.firstOpen.next}`);
    }
    if (host.objectiveAuditOk && host.objectiveAudit.primaryAction) {
      lines.push(`  objective_next=#${host.objectiveAudit.primaryAction.priority} ${host.objectiveAudit.primaryAction.owner} / ${host.objectiveAudit.primaryAction.channel}`);
    }
    if (!host.objectiveAuditOk) {
      lines.push("  objective_audit=missing or invalid");
    }
    if (!host.proofActivityOk) {
      lines.push(`  proof_stall=external:${host.proofStall.externalStalled ? "yes" : "no"} any:${host.proofStall.proofStalled ? "yes" : "no"} latest_external_age=${formatAge(host.proofStall.latestExternalProofAgeMinutes)} oldest_open=#${host.proofStall.oldestOpenPriority || "-"} ${host.proofStall.oldestOpenOwner} / ${host.proofStall.oldestOpenChannel}`);
    }
    if (host.linkChecks.some((check) => !check.ok)) {
      lines.push(`  link_failures=${host.linkChecks.filter((check) => !check.ok).map((check) => `${check.name}:${check.failures.join("|")}`).join("; ")}`);
    }
    if (!host.paidTrafficOk) {
      lines.push(`  paid_traffic=pages:${host.paidTraffic.pageCount} resolver:${host.paidTraffic.resolverOk ? "ok" : "fail"} health:${host.paidTraffic.healthOk ? "ok" : "fail"} failures=${host.paidTraffic.failedPages.map((page) => `${page.name}:${page.failures.join("|")}`).join("; ") || "-"}`);
    }
    if (!host.liveAdQaOk) {
      lines.push(`  live_ad_qa=pages:${host.liveAdQa.pageCount} assets:${host.liveAdQa.renderedAssetCount} resolver:${host.liveAdQa.resolverOk ? "ok" : "fail"} health:${host.liveAdQa.healthOk ? "ok" : "fail"} auth:${host.liveAdQa.authOk ? "ok" : "fail"} social:${host.liveAdQa.socialOk}/${host.liveAdQa.socialCount} local_assets:${host.liveAdQa.localAssetOk}/${host.liveAdQa.localAssetCount}`);
      lines.push(`  live_ad_failures=${[
        ...host.liveAdQa.failedPages.map((page) => `${page.name}:${page.failures.join("|")}`),
        ...host.liveAdQa.failedRenderedAssets.map((asset) => `${asset.url}:${asset.failures.join("|")}`),
        ...host.liveAdQa.failedLocalAssets.map((asset) => `${asset.path}:${asset.failures.join("|")}`),
      ].join("; ") || "-"}`);
    }
    if (!host.adPlatformAuditOk) {
      lines.push(`  ad_platform=pages:${host.adPlatformAudit.pageCount} images:${host.adPlatformAudit.socialImageCount} resolver:${host.adPlatformAudit.resolverOk ? "ok" : "fail"} health:${host.adPlatformAudit.healthOk ? "ok" : "fail"} failures=${[
        ...host.adPlatformAudit.failedPages.map((page) => `${page.name}/${page.profile}:${page.failures.join("|")}`),
        ...host.adPlatformAudit.failedSocialImages.map((image) => `${image.url}:${image.failures.join("|")}`),
      ].join("; ") || "-"}`);
    }
    if (!host.proofCloseoutOk) {
      lines.push(`  proof_closeout=commands:${host.proofCloseout.commandCount} state:${host.proofCloseout.proofState || "-"} failures=${host.proofCloseout.failures.join("|") || "missing or invalid"}`);
    }
    if (!host.conversionGuardOk) {
      lines.push(`  conversion=pages:${host.conversionGuard.pageCount} resolver:${host.conversionGuard.resolverOk ? "ok" : "fail"} auth:${host.conversionGuard.authOk ? "ok" : "fail"} browser:${host.conversionGuard.browserProofStatus || "-"} failures=${host.conversionGuard.failedPages.map((page) => `${page.name}:${page.failures.join("|")}`).join("; ") || "-"}`);
    }
    if (host.first) {
      lines.push(`  first=${host.first.worker} #${host.first.nextPriority} ${host.first.nextChannel}`);
      lines.push(`  action=${host.first.action}`);
      lines.push(`  command=${host.first.nextCommand}`);
    }
    if (!host.ok) lines.push(`  error=${host.error}`);
  }
  lines.push("", "Proof rule: this report proves droplet readiness only. External posts/messages need real proof before logging.", "");
  return lines.join("\n");
}

function renderMarkdown(payload) {
  const hostRows = payload.hosts.map(renderHostMarkdown).join("\n\n");
  return `# WorldCup26 Remote War Room

Generated: ${payload.generatedAtEest}

- Hosts OK: ${payload.summary.okHosts}/${payload.summary.totalHosts}
- Loops running: ${payload.summary.loopsRunning}/${payload.summary.totalHosts}
- Hot ping hooks OK: ${payload.summary.hotPingHooksOk}/${payload.summary.totalHosts}
- Hot pings fresh: ${payload.summary.hotPingsFresh}/${payload.summary.totalHosts}
- Link sentinels OK: ${payload.summary.linkSentinelsOk}/${payload.summary.totalHosts}
- Link sentinels fresh: ${payload.summary.linkSentinelsFresh}/${payload.summary.totalHosts}
- Paid traffic guards OK: ${payload.summary.paidTrafficGuardsOk}/${payload.summary.totalHosts}
- Paid traffic guards fresh: ${payload.summary.paidTrafficGuardsFresh}/${payload.summary.totalHosts}
- Live ad QA OK: ${payload.summary.liveAdQasOk}/${payload.summary.totalHosts}
- Live ad QA fresh: ${payload.summary.liveAdQasFresh}/${payload.summary.totalHosts}
- Posting sprints OK: ${payload.summary.postingSprintsOk}/${payload.summary.totalHosts}
- Posting sprints fresh: ${payload.summary.postingSprintsFresh}/${payload.summary.totalHosts}
- Session recovery OK: ${payload.summary.sessionRecoveriesOk}/${payload.summary.totalHosts}
- Session recovery fresh: ${payload.summary.sessionRecoveriesFresh}/${payload.summary.totalHosts}
- Escalation boards OK: ${payload.summary.escalationsOk}/${payload.summary.totalHosts}
- Escalation boards fresh: ${payload.summary.escalationsFresh}/${payload.summary.totalHosts}
- Escalation counts: critical ${payload.summary.criticalEscalations}, hot ${payload.summary.hotEscalations}
- Proof activity OK: ${payload.summary.proofActivitiesOk}/${payload.summary.totalHosts}
- Proof stall reports fresh: ${payload.summary.proofStallsFresh}/${payload.summary.totalHosts}
- Proof SLA reports OK: ${payload.summary.proofSlasOk}/${payload.summary.totalHosts}
- Proof SLA reports fresh: ${payload.summary.proofSlasFresh}/${payload.summary.totalHosts}
- Proof SLA states: ${payload.summary.proofSlaStates.join(", ") || "-"}
- Proof rescue reports OK: ${payload.summary.proofRescuesOk}/${payload.summary.totalHosts}
- Proof rescue reports fresh: ${payload.summary.proofRescuesFresh}/${payload.summary.totalHosts}
- Proof URL recovery reports OK: ${payload.summary.proofUrlRecoveriesOk}/${payload.summary.totalHosts}
- Proof URL recovery reports fresh: ${payload.summary.proofUrlRecoveriesFresh}/${payload.summary.totalHosts}
- Pending public URL recoveries: ${payload.summary.proofUrlRecoveryPending}
- Social rescue reports OK: ${payload.summary.socialRescuesOk}/${payload.summary.totalHosts}
- Social rescue reports fresh: ${payload.summary.socialRescuesFresh}/${payload.summary.totalHosts}
- Zero signup rescue reports OK: ${payload.summary.zeroSignupRescuesOk}/${payload.summary.totalHosts}
- Zero signup rescue reports fresh: ${payload.summary.zeroSignupRescuesFresh}/${payload.summary.totalHosts}
- Zero signup rescue states: ${payload.summary.zeroSignupStates.join(", ") || "-"}
- Real action bridges OK: ${payload.summary.realActionBridgesOk}/${payload.summary.totalHosts}
- Real action bridges fresh: ${payload.summary.realActionBridgesFresh}/${payload.summary.totalHosts}
- Real action bridge states: ${payload.summary.realActionStates.join(", ") || "-"}
- Real action do-now count: ${payload.summary.realActionCounts}
- One-click share kits OK: ${payload.summary.oneClickSharesOk}/${payload.summary.totalHosts}
- One-click share kits fresh: ${payload.summary.oneClickSharesFresh}/${payload.summary.totalHosts}
- One-click share actions: ${payload.summary.oneClickShareActions}
- Public outreach target maps OK: ${payload.summary.publicOutreachTargetsOk}/${payload.summary.totalHosts}
- Public outreach target maps fresh: ${payload.summary.publicOutreachTargetsFresh}/${payload.summary.totalHosts}
- Public outreach target count: ${payload.summary.publicOutreachTargetCount}
- Public outreach owners: ${payload.summary.publicOutreachOwners.join(", ") || "-"}
- Public outreach missing owners: ${payload.summary.publicOutreachMissingOwners.join(", ") || "none"}
- Ad ops links OK: ${payload.summary.adOpsLinksOk}/${payload.summary.totalHosts}
- Ad ops links fresh: ${payload.summary.adOpsLinksFresh}/${payload.summary.totalHosts}
- Ad ops platforms: ${payload.summary.adOpsPlatforms.join(", ") || "-"}
- Paid ad triage OK: ${payload.summary.paidAdTriagesOk}/${payload.summary.totalHosts}
- Paid ad triage fresh: ${payload.summary.paidAdTriagesFresh}/${payload.summary.totalHosts}
- Paid ad triage states: ${payload.summary.paidAdTriageStates.join(", ") || "-"}
- Paid-source views: ${payload.summary.paidAdTriagePaidViews}
- Paid triage app views: ${payload.summary.paidAdTriageAppViews}
- Paid triage referral-code views: ${payload.summary.paidAdTriageReferralViews}
- Paid triage signup saves: ${payload.summary.paidAdTriageSignupSaves}
- Paid dashboard states: ${payload.summary.paidAdDashboardStates.join(", ") || "-"}
- Paid dashboard checks: ${payload.summary.paidAdDashboardChecks}
- Paid dashboard impressions: ${payload.summary.paidAdDashboardImpressions}
- Paid dashboard clicks: ${payload.summary.paidAdDashboardClicks}
- Paid no-click rescue OK: ${payload.summary.paidNoClickRescuesOk}/${payload.summary.totalHosts}
- Paid no-click rescue fresh: ${payload.summary.paidNoClickRescuesFresh}/${payload.summary.totalHosts}
- Paid no-click rescue states: ${payload.summary.paidNoClickStates.join(", ") || "-"}
- Paid no-click rescue variants: ${payload.summary.paidNoClickVariants}
- Direct paid dashboard OK: ${payload.summary.paidDashboardsOk}/${payload.summary.totalHosts}
- Direct paid dashboard fresh: ${payload.summary.paidDashboardsFresh}/${payload.summary.totalHosts}
- Direct paid dashboard states: ${payload.summary.paidDashboardDirectStates.join(", ") || "-"}
- Funnel monitors OK: ${payload.summary.referralActivitiesOk}/${payload.summary.totalHosts}
- Funnel monitors fresh: ${payload.summary.referralActivitiesFresh}/${payload.summary.totalHosts}
- Funnel monitors available: ${payload.summary.referralActivitiesAvailable}/${payload.summary.totalHosts}
- App views: ${payload.summary.funnelAppViews}
- App views 24h: ${payload.summary.funnelAppViews24h}
- Referral-code views: ${payload.summary.funnelReferralViews}
- Referral-code views 24h: ${payload.summary.funnelReferralViews24h}
- Free accounts: ${payload.summary.funnelFreeAccounts}
- Paid accounts: ${payload.summary.funnelPaidAccounts}
- Referral accepted: ${payload.summary.funnelAcceptedReferrals}
- Referral signup saves: ${payload.summary.funnelSignupSaves}
- Local trusted funnel: ${payload.summary.localFunnelOk ? payload.summary.localFunnelStatus || "yes" : "no"}
- Local trusted funnel fresh: ${payload.summary.localFunnelFresh ? "yes" : "no"}
- Local trusted funnel available: ${payload.summary.localFunnelAvailable ? "yes" : "no"}
- Local trusted app views: ${payload.summary.localFunnelAppViews}
- Local trusted app views 24h: ${payload.summary.localFunnelAppViews24h}
- Local trusted referral-code views: ${payload.summary.localFunnelReferralViews}
- Local trusted free accounts: ${payload.summary.localFunnelFreeAccounts}
- Local trusted paid accounts: ${payload.summary.localFunnelPaidAccounts}
- Local trusted referral accepted: ${payload.summary.localFunnelAcceptedReferrals}
- Warm contact follow-up OK: ${payload.summary.warmFollowupsOk}/${payload.summary.totalHosts}
- Warm contact follow-up fresh: ${payload.summary.warmFollowupsFresh}/${payload.summary.totalHosts}
- Warm contact follow-up states: ${payload.summary.warmFollowupStates.join(", ") || "-"}
- Warm contact attempts: ${payload.summary.warmFollowupAttempts}
- Warm contact follow-up due: ${payload.summary.warmFollowupDue}
- Warm contact follow-up signup saves: ${payload.summary.warmFollowupSignupSaves}
- Response kits OK: ${payload.summary.responseKitsOk}/${payload.summary.totalHosts}
- Response kits fresh: ${payload.summary.responseKitsFresh}/${payload.summary.totalHosts}
- Response kit states: ${payload.summary.responseKitStates.join(", ") || "-"}
- Response kit replies: ${payload.summary.responseKitReplies}
- Response kit signup saves: ${payload.summary.responseKitSignupSaves}
- First-human actions OK: ${payload.summary.firstHumanActionsOk}/${payload.summary.totalHosts}
- First-human actions fresh: ${payload.summary.firstHumanActionsFresh}/${payload.summary.totalHosts}
- First-human action states: ${payload.summary.firstHumanActionStates.join(", ") || "-"}
- First-human warm attempts: ${payload.summary.firstHumanWarmAttempts}
- First-human signup saves: ${payload.summary.firstHumanSignupSaves}
- First-human first action: ${payload.summary.firstHumanFirstActions.join(", ") || "-"}
- First-send bridge OK: ${payload.summary.firstSendBridgesOk}/${payload.summary.totalHosts}
- First-send bridge fresh: ${payload.summary.firstSendBridgesFresh}/${payload.summary.totalHosts}
- First-send bridge states: ${payload.summary.firstSendBridgeStates.join(", ") || "-"}
- First-send bridge warm attempts: ${payload.summary.firstSendBridgeWarmAttempts}
- First-send bridge signup saves: ${payload.summary.firstSendBridgeSignupSaves}
- Posting cockpit reports OK: ${payload.summary.postingCockpitsOk}/${payload.summary.totalHosts}
- Posting cockpit reports fresh: ${payload.summary.postingCockpitsFresh}/${payload.summary.totalHosts}
- Phone action centers OK: ${payload.summary.phoneActionCentersOk}/${payload.summary.totalHosts}
- Phone action centers fresh: ${payload.summary.phoneActionCentersFresh}/${payload.summary.totalHosts}
- Public channel attempts OK: ${payload.summary.publicAttemptsOk}/${payload.summary.totalHosts}
- Public channel attempts fresh: ${payload.summary.publicAttemptsFresh}/${payload.summary.totalHosts}
- Public channel blockers: ${payload.summary.publicAttemptsBlocked}
- Public channel login required: ${payload.summary.publicAttemptsLoginRequired}
- Login unlock boards OK: ${payload.summary.loginUnlocksOk}/${payload.summary.totalHosts}
- Login unlock boards fresh: ${payload.summary.loginUnlocksFresh}/${payload.summary.totalHosts}
- Login unlock cards: ${payload.summary.loginUnlockCards}
- Login unlock platforms: ${payload.summary.loginUnlockPlatforms.join(", ") || "-"}
- Objective audits OK: ${payload.summary.objectiveAuditsOk}/${payload.summary.totalHosts}
- Objective audits fresh: ${payload.summary.objectiveAuditsFresh}/${payload.summary.totalHosts}
- Objective audit states: ${payload.summary.objectiveAuditStates.join(", ") || "-"}
- Objective audits complete: ${payload.summary.objectiveAuditComplete}/${payload.summary.totalHosts}
- Objective critical open: ${payload.summary.objectiveAuditCriticalOpen}
- Operator push packets OK: ${payload.summary.operatorPushesOk}/${payload.summary.totalHosts}
- Operator push packets fresh: ${payload.summary.operatorPushesFresh}/${payload.summary.totalHosts}
- Operator push states: ${payload.summary.operatorPushStates.join(", ") || "-"}
- Operator push actions: ${payload.summary.operatorPushActions}
- Operator public blockers: ${payload.summary.operatorPushBlocked}
- Operator login required: ${payload.summary.operatorPushLoginRequired}
- Worker wake boards OK: ${payload.summary.workerWakesOk}/${payload.summary.totalHosts}
- Worker wake boards fresh: ${payload.summary.workerWakesFresh}/${payload.summary.totalHosts}
- Watchdog loops running: ${payload.summary.watchdogLoopsRunning}/${payload.summary.totalHosts}
- Watchdog cron installed: ${payload.summary.watchdogCronInstalled}/${payload.summary.totalHosts}
- Proof counts: ${payload.summary.proofCounts.join(", ") || "-"}
- Urgent counts: ${payload.summary.urgentCounts.join(", ") || "-"}
- Aligned: ${payload.summary.aligned ? "yes" : "no"}
- Unhealthy hosts: ${payload.summary.unhealthyHosts.join(", ") || "none"}

## Hosts

${hostRows}

## Proof Rule

This report proves droplet readiness only. Do not mark social proof done from this report. External posts, stories, messages, replies, uploads, or approval requests need a real URL or clear private-channel note before proof logging.
`;
}

function renderHostMarkdown(host) {
  if (!host.ok) {
    return `### ${host.host}

- Status: error
- Error: ${host.error}`;
  }
  const workerRows = host.workers
    .map((worker) => `  - ${worker.worker}: ${worker.escalation}, open ${worker.openRows}, next ${worker.nextPriority ?? "-"} ${worker.nextChannel ?? ""}`.trimEnd())
    .join("\n");
  const first = host.first
    ? `- First action: ${host.first.worker} #${host.first.nextPriority} / ${host.first.nextChannel}
- Action: ${host.first.action}
- Asset: \`${host.first.asset}\`
- Link: ${host.first.link}
- Proof command:

\`\`\`bash
${host.first.nextCommand}
\`\`\``
    : "- First action: none";
  return `### ${host.host}

- Status: ok
- Generated: ${host.generatedAtEest}
- Proof rows: ${host.proof}
- Urgent proof gaps: ${host.urgent}
- Loop running: ${host.loopRunning ? "yes" : "no"}
- Hot ping hook: ${host.hotPingHookOk ? "yes" : "no"}
- Hot ping fresh: ${host.hotPingFresh ? "yes" : "no"}
- Link sentinel: ${host.linkSentinelOk ? "yes" : "no"}${host.linkGeneratedAtEest ? ` (${host.linkGeneratedAtEest})` : ""}
- Link sentinel fresh: ${host.linkSentinelFresh ? "yes" : "no"}
- Paid traffic guard: ${host.paidTrafficOk ? "yes" : "no"}${host.paidTrafficGeneratedAtEest ? ` (${host.paidTrafficGeneratedAtEest})` : ""}
- Paid traffic guard fresh: ${host.paidTrafficFresh ? "yes" : "no"}
- Paid traffic deployment: ${host.paidTraffic.deploymentIds.join(", ") || "-"}
- Live ad QA: ${host.liveAdQaOk ? "yes" : "no"}${host.liveAdQaGeneratedAtEest ? ` (${host.liveAdQaGeneratedAtEest})` : ""}
- Live ad QA fresh: ${host.liveAdQaFresh ? "yes" : "no"}
- Live ad QA details: pages ${host.liveAdQa.pageCount}, assets ${host.liveAdQa.renderedAssetCount}, auth ${host.liveAdQa.authOk ? "yes" : "no"}, social ${host.liveAdQa.socialOk}/${host.liveAdQa.socialCount}, local assets ${host.liveAdQa.localAssetOk}/${host.liveAdQa.localAssetCount}
- Posting sprint: ${host.postingSprintOk ? "yes" : "no"}${host.postingSprintGeneratedAtEest ? ` (${host.postingSprintGeneratedAtEest})` : ""}
- Posting sprint fresh: ${host.postingSprintFresh ? "yes" : "no"}
- Session recovery: ${host.sessionRecoveryOk ? "yes" : "no"}${host.sessionRecoveryGeneratedAtEest ? ` (${host.sessionRecoveryGeneratedAtEest})` : ""}
- Session recovery fresh: ${host.sessionRecoveryFresh ? "yes" : "no"}
- Escalation board: ${host.escalationOk ? "yes" : "no"}${host.escalationGeneratedAtEest ? ` (${host.escalationGeneratedAtEest})` : ""}
- Escalation board fresh: ${host.escalationFresh ? "yes" : "no"}
- Escalation counts: critical ${host.escalation.critical}, hot ${host.escalation.hot}, stale workers ${host.escalation.workersWithStale}
- Proof activity: ${host.proofActivityOk ? "yes" : "no"}${host.proofStallGeneratedAtEest ? ` (${host.proofStallGeneratedAtEest})` : ""}
- Proof stall fresh: ${host.proofStallFresh ? "yes" : "no"}
- Proof SLA: ${host.proofSlaOk ? host.proofSla.state || "yes" : "no"}${host.proofSlaGeneratedAtEest ? ` (${host.proofSlaGeneratedAtEest})` : ""}
- Proof SLA fresh: ${host.proofSlaFresh ? "yes" : "no"}
- Proof SLA first action: ${host.proofSla.first ? `#${host.proofSla.first.priority} ${host.proofSla.first.owner} / ${host.proofSla.first.channel} (${host.proofSla.first.ageLabel})` : "-"}
- Proof rescue: ${host.proofRescueOk ? host.proofRescue.state || "yes" : "no"}${host.proofRescueGeneratedAtEest ? ` (${host.proofRescueGeneratedAtEest})` : ""}
- Proof rescue fresh: ${host.proofRescueFresh ? "yes" : "no"}
- Proof rescue first action: ${host.proofRescue.first ? `#${host.proofRescue.first.priority} ${host.proofRescue.first.owner} / ${host.proofRescue.first.channel}` : "-"}
- Proof URL recovery: ${host.proofUrlRecoveryOk ? `${host.proofUrlRecovery.pendingCount} pending` : "no"}${host.proofUrlRecoveryGeneratedAtEest ? ` (${host.proofUrlRecoveryGeneratedAtEest})` : ""}
- Proof URL recovery fresh: ${host.proofUrlRecoveryFresh ? "yes" : "no"}
- Proof URL recovery first: ${host.proofUrlRecovery.first ? `${host.proofUrlRecovery.first.pulse} ${host.proofUrlRecovery.first.owner} / ${host.proofUrlRecovery.first.channel}` : "-"}
- Social rescue: ${host.socialRescueOk ? host.socialRescue.state || "yes" : "no"}${host.socialRescueGeneratedAtEest ? ` (${host.socialRescueGeneratedAtEest})` : ""}
- Social rescue fresh: ${host.socialRescueFresh ? "yes" : "no"}
- Social rescue first action: ${host.socialRescue.first ? `#${host.socialRescue.first.priority} ${host.socialRescue.first.owner} / ${host.socialRescue.first.channel} (${host.socialRescue.first.shareLinks} share links)` : "-"}
- Social rescue worker pages: ${host.socialRescue.workerPageCount}${host.socialRescue.workerPages.length ? ` (${host.socialRescue.workerPages.map((page) => `${page.owner}:${page.actionCount}`).join(", ")})` : ""}
- Zero signup rescue: ${host.zeroSignupRescueOk ? host.zeroSignupRescue.state || "yes" : "no"}${host.zeroSignupRescueGeneratedAtEest ? ` (${host.zeroSignupRescueGeneratedAtEest})` : ""}
- Zero signup rescue fresh: ${host.zeroSignupRescueFresh ? "yes" : "no"}
- Zero signup counts: accepted ${host.zeroSignupRescue.acceptedReferrals}, signup saves ${host.zeroSignupRescue.signupSaves}, entries ${host.zeroSignupRescue.entries}
- Zero signup first variant: ${host.zeroSignupRescue.first ? `#${host.zeroSignupRescue.first.priority} ${host.zeroSignupRescue.first.owner} / ${host.zeroSignupRescue.first.channel}` : "-"}
- Real action bridge: ${host.realActionBridgeOk ? host.realActionBridge.state || "yes" : "no"}${host.realActionBridgeGeneratedAtEest ? ` (${host.realActionBridgeGeneratedAtEest})` : ""}
- Real action bridge fresh: ${host.realActionBridgeFresh ? "yes" : "no"}
- Real action bridge details: actions ${host.realActionBridge.actionCount}, rescue variants ${host.realActionBridge.rescueVariantCount}, entries ${host.realActionBridge.entries}
- Real action first: ${host.realActionBridge.first ? `#${host.realActionBridge.first.priority} ${host.realActionBridge.first.owner} / ${host.realActionBridge.first.channel}` : "-"}
- One-click share kit: ${host.oneClickShareOk ? "yes" : "no"}${host.oneClickShareGeneratedAtEest ? ` (${host.oneClickShareGeneratedAtEest})` : ""}
- One-click share fresh: ${host.oneClickShareFresh ? "yes" : "no"}
- One-click share details: actions ${host.oneClickShare.actionCount}, share links ${host.oneClickShare.shareLinkCount}, owners ${host.oneClickShare.owners.join(", ") || "-"}
- Public outreach targets: ${host.publicOutreachTargetsOk ? "yes" : "no"}${host.publicOutreachTargetsGeneratedAtEest ? ` (${host.publicOutreachTargetsGeneratedAtEest})` : ""}
- Public outreach targets fresh: ${host.publicOutreachTargetsFresh ? "yes" : "no"}
- Public outreach details: targets ${host.publicOutreachTargets.targetCount}, platforms ${host.publicOutreachTargets.platformCount}, owners ${host.publicOutreachTargets.workerCoverage.owners.join(", ") || "-"}, missing ${host.publicOutreachTargets.workerCoverage.missing.join(", ") || "none"}
- Ad ops links: ${host.adOpsLinksOk ? "yes" : "no"}${host.adOpsLinksGeneratedAtEest ? ` (${host.adOpsLinksGeneratedAtEest})` : ""}
- Ad ops links fresh: ${host.adOpsLinksFresh ? "yes" : "no"}
- Ad ops details: channels ${host.adOpsLinks.channelCount}, platforms ${host.adOpsLinks.platforms.join(", ") || "-"}
- Paid ad triage: ${host.paidAdTriageOk ? host.paidAdTriage.state || "yes" : "no"}${host.paidAdTriageGeneratedAtEest ? ` (${host.paidAdTriageGeneratedAtEest})` : ""}
- Paid ad triage fresh: ${host.paidAdTriageFresh ? "yes" : "no"}
- Paid ad details: paid views ${host.paidAdTriage.paidViews}, app views ${host.paidAdTriage.appViews}, referral views ${host.paidAdTriage.referralViews}, signup saves ${host.paidAdTriage.signupSaves}, platforms ${host.paidAdTriage.platforms.join(", ") || "-"}
- Paid dashboard details: state ${host.paidAdTriage.dashboardState || "-"}, checks ${host.paidAdTriage.dashboardChecks}, impressions ${host.paidAdTriage.dashboardImpressions}, clicks ${host.paidAdTriage.dashboardClicks}, spend ${host.paidAdTriage.dashboardSpend}
- Paid no-click rescue: ${host.paidNoClickRescueOk ? host.paidNoClickRescue.state || "yes" : "no"}${host.paidNoClickRescueGeneratedAtEest ? ` (${host.paidNoClickRescueGeneratedAtEest})` : ""}
- Paid no-click rescue fresh: ${host.paidNoClickRescueFresh ? "yes" : "no"}
- Paid no-click rescue details: variants ${host.paidNoClickRescue.variantCount}, impressions ${host.paidNoClickRescue.impressions}, clicks ${host.paidNoClickRescue.clicks}, first ${host.paidNoClickRescue.first ? `${host.paidNoClickRescue.first.priority} ${host.paidNoClickRescue.first.platform} / ${host.paidNoClickRescue.first.angle}` : "-"}
- Direct paid dashboard: ${host.paidDashboardOk ? host.paidDashboard.state || "yes" : "no"}${host.paidDashboardGeneratedAtEest ? ` (${host.paidDashboardGeneratedAtEest})` : ""}
- Direct paid dashboard fresh: ${host.paidDashboardFresh ? "yes" : "no"}
- Direct paid dashboard details: checks ${host.paidDashboard.latestChecks}, impressions ${host.paidDashboard.totalImpressions}, clicks ${host.paidDashboard.totalClicks}, spend ${host.paidDashboard.totalSpend}
- Funnel monitor: ${host.referralActivityOk ? host.referralActivity.status || "yes" : "no"}${host.referralActivityGeneratedAtEest ? ` (${host.referralActivityGeneratedAtEest})` : ""}
- Funnel monitor fresh: ${host.referralActivityFresh ? "yes" : "no"}
- Funnel monitor available: ${host.referralActivityAvailable ? "yes" : "no"}
- Funnel accounts: profiles ${host.referralActivity.profiles}, free ${host.referralActivity.freeAccounts}, paid ${host.referralActivity.paidAccounts}
- Funnel views: app ${host.referralActivity.appViews}, app 24h ${host.referralActivity.appViews24h}, referral ${host.referralActivity.referralViews}, referral 24h ${host.referralActivity.referralViews24h}
- Funnel referrals: accepted ${host.referralActivity.acceptedReferrals}, signup saves ${host.referralActivity.signupReferralSaves}, entries ${host.referralActivity.referredEntries}
- Warm follow-up: ${host.warmFollowupOk ? host.warmFollowup.state || "yes" : "no"}${host.warmFollowupGeneratedAtEest ? ` (${host.warmFollowupGeneratedAtEest})` : ""}
- Warm follow-up fresh: ${host.warmFollowupFresh ? "yes" : "no"}
- Warm follow-up details: attempts ${host.warmFollowup.warmAttempts}, due ${host.warmFollowup.due ? "yes" : "no"}, referral views ${host.warmFollowup.referralViews}, signup saves ${host.warmFollowup.signupSaves}
- Warm follow-up next: ${host.warmFollowup.nextAction || "-"}
- Response kit: ${host.responseKitOk ? host.responseKit.state || "yes" : "no"}${host.responseKitGeneratedAtEest ? ` (${host.responseKitGeneratedAtEest})` : ""}
- Response kit fresh: ${host.responseKitFresh ? "yes" : "no"}
- Response kit details: replies ${host.responseKit.replies}, warm attempts ${host.responseKit.warmAttempts}, signup saves ${host.responseKit.signupSaves}, first reply ${host.responseKit.firstReply ? `${host.responseKit.firstReply.id} / ${host.responseKit.firstReply.trigger}` : "-"}
- Posting cockpit: ${host.postingCockpitOk ? "yes" : "no"}${host.postingCockpitGeneratedAtEest ? ` (${host.postingCockpitGeneratedAtEest})` : ""}
- Posting cockpit fresh: ${host.postingCockpitFresh ? "yes" : "no"}
- Posting cockpit first action: ${host.postingCockpit.first ? `#${host.postingCockpit.first.priority} ${host.postingCockpit.first.owner} / ${host.postingCockpit.first.channel}` : "-"}
- Phone action center: ${host.phoneActionCenterOk ? "yes" : "no"}${host.phoneActionCenterGeneratedAtEest ? ` (${host.phoneActionCenterGeneratedAtEest})` : ""}
- Phone action center fresh: ${host.phoneActionCenterFresh ? "yes" : "no"}
- Phone action center details: actions ${host.phoneActionCenter.actionCount}, QR ${host.phoneActionCenter.qrBlockCount}, assets ${host.phoneActionCenter.assetBlockCount}, video ${host.phoneActionCenter.videoPreviewCount}
- Phone action center first action: ${host.phoneActionCenter.first ? `#${host.phoneActionCenter.first.priority} ${host.phoneActionCenter.first.owner} / ${host.phoneActionCenter.first.channel}` : "-"}
- Public channel attempts: ${host.publicAttemptsOk ? "yes" : "no"}${host.publicAttemptsGeneratedAtEest ? ` (${host.publicAttemptsGeneratedAtEest})` : ""}
- Public channel attempts fresh: ${host.publicAttemptsFresh ? "yes" : "no"}
- Public channel attempt details: attempts ${host.publicAttempts.attempts}, blocked ${host.publicAttempts.blocked}, login required ${host.publicAttempts.loginRequired}, social actions ${host.publicAttempts.socialActions}
- Public channel first blocker: ${host.publicAttempts.firstBlocked ? `${host.publicAttempts.firstBlocked.platform} / ${host.publicAttempts.firstBlocked.channel} - ${host.publicAttempts.firstBlocked.status}` : "-"}
- Login unlock board: ${host.loginUnlockOk ? "yes" : "no"}${host.loginUnlockGeneratedAtEest ? ` (${host.loginUnlockGeneratedAtEest})` : ""}
- Login unlock fresh: ${host.loginUnlockFresh ? "yes" : "no"}
- Login unlock details: cards ${host.loginUnlock.cards}, blocked ${host.loginUnlock.blocked}, login required ${host.loginUnlock.loginRequired}, platforms ${host.loginUnlock.platforms.join(", ") || "-"}
- Login unlock first: ${host.loginUnlock.first ? `${host.loginUnlock.first.platform} / ${host.loginUnlock.first.channel} - ${host.loginUnlock.first.status}` : "-"}
- Objective audit: ${host.objectiveAuditOk ? host.objectiveAudit.state || "yes" : "no"}${host.objectiveAuditGeneratedAtEest ? ` (${host.objectiveAuditGeneratedAtEest})` : ""}
- Objective audit fresh: ${host.objectiveAuditFresh ? "yes" : "no"}
- Objective audit details: complete ${host.objectiveAudit.complete ? "yes" : "no"}, proven ${host.objectiveAudit.proven}/${host.objectiveAudit.total}, critical open ${host.objectiveAudit.criticalOpen}
- Objective first open: ${host.objectiveAudit.firstOpen ? `${host.objectiveAudit.firstOpen.status} ${host.objectiveAudit.firstOpen.id} - ${host.objectiveAudit.firstOpen.next}` : "-"}
- Objective next action: ${host.objectiveAudit.primaryAction ? `#${host.objectiveAudit.primaryAction.priority} ${host.objectiveAudit.primaryAction.owner} / ${host.objectiveAudit.primaryAction.channel}` : "-"}
- Operator push packet: ${host.operatorPushOk ? host.operatorPush.state || "yes" : "no"}${host.operatorPushGeneratedAtEest ? ` (${host.operatorPushGeneratedAtEest})` : ""}
- Operator push fresh: ${host.operatorPushFresh ? "yes" : "no"}
- Operator push details: actions ${host.operatorPush.actionCount}, blocked ${host.operatorPush.publicBlocked}, login required ${host.operatorPush.publicLoginRequired}
- Operator first action: ${host.operatorPush.first ? `#${host.operatorPush.first.priority} ${host.operatorPush.first.owner} / ${host.operatorPush.first.channel}` : "-"}
- Worker wake board: ${host.workerWakeOk ? "yes" : "no"}${host.workerWakeGeneratedAtEest ? ` (${host.workerWakeGeneratedAtEest})` : ""}
- Worker wake fresh: ${host.workerWakeFresh ? "yes" : "no"}
- Worker wake first action: ${host.workerWake.first ? `#${host.workerWake.first.priority} ${host.workerWake.first.owner} / ${host.workerWake.first.channel}` : "-"}
- Worker wake next actions: ${host.workerWake.nextActions.join("; ") || "-"}
- Watchdog loop: ${host.watchdogRunning ? "yes" : "no"}
- Watchdog cron: ${host.watchdogCronInstalled ? "yes" : "no"}
${first}

Workers:
${workerRows}`;
}

function renderHtml(payload) {
  const cards = payload.hosts.map(renderHostHtml).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Remote War Room</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2a20; --line: rgba(255,255,255,.16); --text: #f7fff9; --muted: #b8c9c2; --gold: #ffd974; --mint: #78f0b5; --danger: #ff9f9f; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at 8% 0%, rgba(120,240,181,.16), transparent 26rem), radial-gradient(circle at 90% 6%, rgba(255,217,116,.18), transparent 24rem), var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1120px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, article, section { border: 1px solid var(--line); background: rgba(11,42,32,.92); border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.25); }
    header { padding: 18px; margin-bottom: 12px; }
    h1 { margin: 4px 0 8px; font-size: clamp(30px, 6vw, 52px); line-height: .95; }
    .eyebrow { margin: 0; color: var(--gold); text-transform: uppercase; letter-spacing: .08em; font-size: 12px; font-weight: 900; }
    .stats { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
    .stat { border: 1px solid var(--line); border-radius: 12px; padding: 10px; background: rgba(255,255,255,.06); }
    .stat span { display: block; color: var(--muted); font-size: 12px; text-transform: uppercase; font-weight: 800; }
    .stat strong { font-size: 22px; color: var(--gold); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    article { padding: 14px; }
    article.is-bad { border-color: rgba(255,159,159,.55); }
    article h2 { margin: 0; font-size: 24px; }
    .pill-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    .pill { border: 1px solid var(--line); border-radius: 999px; padding: 7px 9px; color: var(--text); background: rgba(255,255,255,.06); font-weight: 800; }
    .pill.hot { color: #062016; background: linear-gradient(135deg, var(--gold), var(--mint)); }
    pre { white-space: pre-wrap; word-break: break-word; border: 1px solid var(--line); border-radius: 12px; padding: 12px; background: rgba(0,0,0,.24); max-height: 180px; overflow: auto; }
    .rule { margin-top: 12px; padding: 14px; color: var(--muted); }
    @media (max-width: 760px) { .stats, .grid { grid-template-columns: 1fr; } h1 { font-size: 34px; } }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Generated ${escapeHtml(payload.generatedAtEest)}</p>
      <h1>Remote War Room</h1>
      <p>Droplet readiness, hot action alignment, and proof-gap status. This is not proof of external posting.</p>
      <div class="stats">
        <div class="stat"><span>Hosts OK</span><strong>${payload.summary.okHosts}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Loops</span><strong>${payload.summary.loopsRunning}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Hooks</span><strong>${payload.summary.hotPingHooksOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Links</span><strong>${payload.summary.linkSentinelsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Paid</span><strong>${payload.summary.paidTrafficGuardsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Live Ad QA</span><strong>${payload.summary.liveAdQasOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Sprints</span><strong>${payload.summary.postingSprintsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Recovery</span><strong>${payload.summary.sessionRecoveriesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Escalation</span><strong>${payload.summary.escalationsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Proof Activity</span><strong>${payload.summary.proofActivitiesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Proof SLA</span><strong>${payload.summary.proofSlasOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Proof Rescue</span><strong>${payload.summary.proofRescuesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>URL Recovery</span><strong>${payload.summary.proofUrlRecoveryPending}</strong></div>
        <div class="stat"><span>Social Rescue</span><strong>${payload.summary.socialRescuesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Real Action</span><strong>${payload.summary.realActionBridgesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>One-Click</span><strong>${payload.summary.oneClickSharesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Public Targets</span><strong>${payload.summary.publicOutreachTargetsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Ad Ops</span><strong>${payload.summary.adOpsLinksOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Paid Ad</span><strong>${payload.summary.paidAdTriagesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>No-Click Rescue</span><strong>${payload.summary.paidNoClickVariants}</strong></div>
        <div class="stat"><span>Ad Dash</span><strong>${payload.summary.paidDashboardsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Paid Views</span><strong>${payload.summary.paidAdTriagePaidViews}</strong></div>
        <div class="stat"><span>Ad Clicks</span><strong>${payload.summary.paidAdDashboardClicks}</strong></div>
        <div class="stat"><span>Funnel</span><strong>${payload.summary.referralActivitiesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>App Views</span><strong>${payload.summary.funnelAppViews}</strong></div>
        <div class="stat"><span>Free/Paid</span><strong>${payload.summary.funnelFreeAccounts}/${payload.summary.funnelPaidAccounts}</strong></div>
        <div class="stat"><span>Local Views</span><strong>${payload.summary.localFunnelAppViews}</strong></div>
        <div class="stat"><span>Local Free/Paid</span><strong>${payload.summary.localFunnelFreeAccounts}/${payload.summary.localFunnelPaidAccounts}</strong></div>
        <div class="stat"><span>Local Referral</span><strong>${payload.summary.localFunnelAcceptedReferrals}</strong></div>
        <div class="stat"><span>Warm Follow-up</span><strong>${payload.summary.warmFollowupsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Warm Attempts</span><strong>${payload.summary.warmFollowupAttempts}</strong></div>
        <div class="stat"><span>Warm Signups</span><strong>${payload.summary.warmFollowupSignupSaves}</strong></div>
        <div class="stat"><span>Response Kit</span><strong>${payload.summary.responseKitsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Replies</span><strong>${payload.summary.responseKitReplies}</strong></div>
        <div class="stat"><span>First Human</span><strong>${payload.summary.firstHumanActionsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>First State</span><strong>${escapeHtml(payload.summary.firstHumanActionStates.join(",") || "-")}</strong></div>
        <div class="stat"><span>First Signups</span><strong>${payload.summary.firstHumanSignupSaves}</strong></div>
        <div class="stat"><span>First Send</span><strong>${payload.summary.firstSendBridgesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Send State</span><strong>${escapeHtml(payload.summary.firstSendBridgeStates.join(",") || "-")}</strong></div>
        <div class="stat"><span>Send Attempts</span><strong>${payload.summary.firstSendBridgeWarmAttempts}</strong></div>
        <div class="stat"><span>Cockpit</span><strong>${payload.summary.postingCockpitsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Phone Action</span><strong>${payload.summary.phoneActionCentersOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Public Attempts</span><strong>${payload.summary.publicAttemptsOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Login Required</span><strong>${payload.summary.publicAttemptsLoginRequired}</strong></div>
        <div class="stat"><span>Unlock Cards</span><strong>${payload.summary.loginUnlockCards}</strong></div>
        <div class="stat"><span>Wake Board</span><strong>${payload.summary.workerWakesOk}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Cron</span><strong>${payload.summary.watchdogCronInstalled}/${payload.summary.totalHosts}</strong></div>
        <div class="stat"><span>Urgent</span><strong>${payload.summary.urgentCounts.join(",") || "-"}</strong></div>
      </div>
    </header>
    <div class="grid">${cards}</div>
    <section class="rule"><strong>Proof rule:</strong> This report proves droplet readiness only. Log proof only after real posts/messages/actions happen.</section>
  </main>
</body>
</html>
`;
}

function renderHostHtml(host) {
  if (!host.ok) {
    return `<article class="is-bad"><p class="eyebrow">error</p><h2>${escapeHtml(host.host)}</h2><p>${escapeHtml(host.error)}</p></article>`;
  }
  const workerPills = host.workers
    .map((worker) => `<span class="pill ${worker.openRows > 0 ? "hot" : ""}">${escapeHtml(worker.worker)} ${worker.openRows}</span>`)
    .join("");
  return `<article class="${isHostAligned(host) ? "" : "is-bad"}">
    <p class="eyebrow">${escapeHtml(host.generatedAtEest)}</p>
    <h2>${escapeHtml(host.host)}</h2>
    <div class="pill-row">
      <span class="pill">proof ${host.proof}</span>
      <span class="pill">urgent ${host.urgent}</span>
      <span class="pill">loop ${host.loopRunning ? "yes" : "no"}</span>
      <span class="pill">hook ${host.hotPingHookOk ? "yes" : "no"}</span>
      <span class="pill">hot fresh ${host.hotPingFresh ? "yes" : "no"}</span>
      <span class="pill">link ${host.linkSentinelOk && host.linkSentinelFresh ? "yes" : "no"}</span>
      <span class="pill">paid ${host.paidTrafficOk && host.paidTrafficFresh ? "yes" : "no"}</span>
      <span class="pill">live ad ${host.liveAdQaOk && host.liveAdQaFresh ? "yes" : "no"}</span>
      <span class="pill">sprint ${host.postingSprintOk && host.postingSprintFresh ? "yes" : "no"}</span>
      <span class="pill">recovery ${host.sessionRecoveryOk && host.sessionRecoveryFresh ? "yes" : "no"}</span>
      <span class="pill">escalation ${host.escalationOk && host.escalationFresh ? "yes" : "no"}</span>
      <span class="pill">critical ${host.escalation.critical}</span>
      <span class="pill">hot ${host.escalation.hot}</span>
      <span class="pill">proof activity ${host.proofActivityOk ? "yes" : "no"}</span>
      <span class="pill">proof sla ${host.proofSlaOk && host.proofSlaFresh ? escapeHtml(host.proofSla.state || "yes") : "no"}</span>
      <span class="pill">rescue ${host.proofRescueOk && host.proofRescueFresh ? escapeHtml(host.proofRescue.state || "yes") : "no"}</span>
      <span class="pill">url recovery ${host.proofUrlRecoveryOk && host.proofUrlRecoveryFresh ? host.proofUrlRecovery.pendingCount : "no"}</span>
      <span class="pill">social ${host.socialRescueOk && host.socialRescueFresh ? escapeHtml(host.socialRescue.state || "yes") : "no"}</span>
      <span class="pill">one-click ${host.oneClickShareOk && host.oneClickShareFresh ? host.oneClickShare.actionCount : "no"}</span>
      <span class="pill">targets ${host.publicOutreachTargetsOk && host.publicOutreachTargetsFresh ? host.publicOutreachTargets.targetCount : "no"}</span>
      <span class="pill">ad ops ${host.adOpsLinksOk && host.adOpsLinksFresh ? host.adOpsLinks.channelCount : "no"}</span>
      <span class="pill">paid ad ${host.paidAdTriageOk && host.paidAdTriageFresh ? escapeHtml(host.paidAdTriage.state || "yes") : "no"}</span>
      <span class="pill">funnel ${host.referralActivityOk && host.referralActivityFresh ? escapeHtml(host.referralActivity.status || "yes") : "no"}</span>
      <span class="pill">warm follow ${host.warmFollowupOk && host.warmFollowupFresh ? escapeHtml(host.warmFollowup.state || "yes") : "no"}</span>
      <span class="pill">responses ${host.responseKitOk && host.responseKitFresh ? host.responseKit.replies : "no"}</span>
      <span class="pill">cockpit ${host.postingCockpitOk && host.postingCockpitFresh ? "yes" : "no"}</span>
      <span class="pill">phone ${host.phoneActionCenterOk && host.phoneActionCenterFresh ? "yes" : "no"}</span>
      <span class="pill">public ${host.publicAttemptsOk && host.publicAttemptsFresh ? "yes" : "no"}</span>
      <span class="pill">login ${host.publicAttempts.loginRequired}</span>
      <span class="pill">wake ${host.workerWakeOk && host.workerWakeFresh ? "yes" : "no"}</span>
      <span class="pill">watch ${host.watchdogRunning ? "yes" : "no"}</span>
      <span class="pill">cron ${host.watchdogCronInstalled ? "yes" : "no"}</span>
    </div>
    <div class="pill-row">${workerPills}</div>
    ${host.first ? `<p><strong>First:</strong> ${escapeHtml(host.first.worker)} #${escapeHtml(host.first.nextPriority)} / ${escapeHtml(host.first.nextChannel)}</p><p>${escapeHtml(host.first.action)}</p><pre>${escapeHtml(host.first.nextCommand)}</pre>` : "<p>No first action.</p>"}
    <p><strong>Live ad QA:</strong> pages ${host.liveAdQa.pageCount}, assets ${host.liveAdQa.renderedAssetCount}, auth ${host.liveAdQa.authOk ? "ok" : "fail"}, social ${host.liveAdQa.socialOk}/${host.liveAdQa.socialCount}, local assets ${host.liveAdQa.localAssetOk}/${host.liveAdQa.localAssetCount}.</p>
    <p><strong>One-click share:</strong> actions ${host.oneClickShare.actionCount}, share links ${host.oneClickShare.shareLinkCount}, owners ${escapeHtml(host.oneClickShare.owners.join(", ") || "-")}.</p>
    <p><strong>Public targets:</strong> ${host.publicOutreachTargets.targetCount} targets, owners ${escapeHtml(host.publicOutreachTargets.workerCoverage.owners.join(", ") || "-")}, missing ${escapeHtml(host.publicOutreachTargets.workerCoverage.missing.join(", ") || "none")}.</p>
    <p><strong>Ad ops:</strong> ${host.adOpsLinks.channelCount} channels, platforms ${escapeHtml(host.adOpsLinks.platforms.join(", ") || "-")}.</p>
    <p><strong>Paid ad triage:</strong> ${escapeHtml(host.paidAdTriage.state || "-")}, paid views ${host.paidAdTriage.paidViews}, app views ${host.paidAdTriage.appViews}, referral views ${host.paidAdTriage.referralViews}, signup saves ${host.paidAdTriage.signupSaves}, platforms ${escapeHtml(host.paidAdTriage.platforms.join(", ") || "-")}.</p>
    <p><strong>Paid dashboard:</strong> ${escapeHtml(host.paidAdTriage.dashboardState || "-")}, checks ${host.paidAdTriage.dashboardChecks}, impressions ${host.paidAdTriage.dashboardImpressions}, clicks ${host.paidAdTriage.dashboardClicks}, spend ${host.paidAdTriage.dashboardSpend}.</p>
    <p><strong>No-click rescue:</strong> ${escapeHtml(host.paidNoClickRescue.state || "-")}, variants ${host.paidNoClickRescue.variantCount}, first ${host.paidNoClickRescue.first ? `${escapeHtml(host.paidNoClickRescue.first.priority)} ${escapeHtml(host.paidNoClickRescue.first.angle)}` : "-"}.</p>
    <p><strong>Direct paid dashboard:</strong> ${escapeHtml(host.paidDashboard.state || "-")}, checks ${host.paidDashboard.latestChecks}, impressions ${host.paidDashboard.totalImpressions}, clicks ${host.paidDashboard.totalClicks}, spend ${host.paidDashboard.totalSpend}.</p>
    <p><strong>Funnel:</strong> profiles ${host.referralActivity.profiles}, free ${host.referralActivity.freeAccounts}, paid ${host.referralActivity.paidAccounts}, app views ${host.referralActivity.appViews}, referral views ${host.referralActivity.referralViews}, accepted ${host.referralActivity.acceptedReferrals}.</p>
    <p><strong>Warm follow-up:</strong> ${escapeHtml(host.warmFollowup.state || "-")}, attempts ${host.warmFollowup.warmAttempts}, due ${host.warmFollowup.due ? "yes" : "no"}, referral views ${host.warmFollowup.referralViews}, signup saves ${host.warmFollowup.signupSaves}. Next: ${escapeHtml(host.warmFollowup.nextAction || "-")}</p>
    <p><strong>Response kit:</strong> ${escapeHtml(host.responseKit.state || "-")}, replies ${host.responseKit.replies}, first reply ${host.responseKit.firstReply ? `${escapeHtml(host.responseKit.firstReply.id)} / ${escapeHtml(host.responseKit.firstReply.trigger)}` : "-"}.</p>
    <p><strong>Phone action center:</strong> actions ${host.phoneActionCenter.actionCount}, QR ${host.phoneActionCenter.qrBlockCount}, assets ${host.phoneActionCenter.assetBlockCount}, video ${host.phoneActionCenter.videoPreviewCount}.</p>
    <p><strong>Public attempts:</strong> attempts ${host.publicAttempts.attempts}, blocked ${host.publicAttempts.blocked}, login required ${host.publicAttempts.loginRequired}.</p>
    <p><strong>Login unlock:</strong> cards ${host.loginUnlock.cards}, platforms ${escapeHtml(host.loginUnlock.platforms.join(", ") || "-")}, first ${host.loginUnlock.first ? `${escapeHtml(host.loginUnlock.first.platform)} / ${escapeHtml(host.loginUnlock.first.channel)}` : "-"}.</p>
    ${host.proofSla.first ? `<p><strong>SLA first:</strong> #${escapeHtml(host.proofSla.first.priority)} ${escapeHtml(host.proofSla.first.owner)} / ${escapeHtml(host.proofSla.first.channel)} (${escapeHtml(host.proofSla.first.ageLabel)})</p>` : ""}
    ${host.proofRescue.first ? `<p><strong>Rescue first:</strong> #${escapeHtml(host.proofRescue.first.priority)} ${escapeHtml(host.proofRescue.first.owner)} / ${escapeHtml(host.proofRescue.first.channel)}</p>` : ""}
    ${host.proofUrlRecovery.first ? `<p><strong>URL recovery:</strong> ${escapeHtml(host.proofUrlRecovery.first.pulse)} ${escapeHtml(host.proofUrlRecovery.first.owner)} / ${escapeHtml(host.proofUrlRecovery.first.channel)}</p>` : ""}
    ${host.socialRescue.first ? `<p><strong>Social first:</strong> #${escapeHtml(host.socialRescue.first.priority)} ${escapeHtml(host.socialRescue.first.owner)} / ${escapeHtml(host.socialRescue.first.channel)} (${host.socialRescue.first.shareLinks} links, ${host.socialRescue.workerPageCount} worker pages)</p>` : ""}
    ${host.workerWake.first ? `<p><strong>Wake first:</strong> #${escapeHtml(host.workerWake.first.priority)} ${escapeHtml(host.workerWake.first.owner)} / ${escapeHtml(host.workerWake.first.channel)}</p>` : ""}
    <p><strong>Wake next:</strong> ${escapeHtml(host.workerWake.nextActions.join("; ") || "-")}.</p>
    ${host.proofActivityOk ? "" : `<p><strong>Proof stall:</strong> external ${host.proofStall.externalStalled ? "stalled" : "ok"}, latest external age ${escapeHtml(formatAge(host.proofStall.latestExternalProofAgeMinutes))}.</p>`}
  </article>`;
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "", hosts: [], timeoutMs: 20_000, freshSeconds: DEFAULT_FRESH_SECONDS };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = rawArgs[++index] ?? "";
    else if (arg === "--now") parsed.now = rawArgs[++index] ?? "";
    else if (arg === "--timeout-ms") parsed.timeoutMs = Number(rawArgs[++index] ?? parsed.timeoutMs);
    else if (arg === "--fresh-seconds") parsed.freshSeconds = Number(rawArgs[++index] ?? parsed.freshSeconds);
    else if (arg === "--hosts") {
      parsed.hosts = String(rawArgs[++index] ?? "")
        .split(",")
        .map((host) => host.trim())
        .filter(Boolean);
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
    .replaceAll("'", "&#39;");
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

function formatAge(minutes) {
  if (minutes == null) return "none";
  if (minutes < 60) return `${minutes}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}
