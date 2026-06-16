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
const projectRoot = await findProjectRoot(campaignDir);
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const cachedActivity = await readCachedAvailablePayload(path.join(runtimeDir, "referral-activity.json"));
const env = {
  ...process.env,
  ...(await readEnvFile(path.join(projectRoot, ".env.local"))),
};
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "";
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
const createClient = serviceRoleKey ? await loadSupabaseCreateClient() : null;
let payload = serviceRoleKey
  ? createClient
    ? await buildActivityPayload({ supabaseUrl, serviceRoleKey, createClient })
    : buildUnavailablePayload("@supabase/supabase-js is not installed on this host.")
  : buildUnavailablePayload("SUPABASE_SERVICE_ROLE_KEY is not available on this host.");

if (payload.status === "unavailable" && cachedActivity) {
  payload = buildCachedPayload(cachedActivity, payload.reason);
}

await writeFile(path.join(runtimeDir, "referral-activity.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "referral-activity.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "referral-activity.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "referral-activity.html"), renderHtml(payload));

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

if (!payload.ok) {
  process.exitCode = 1;
}

async function loadSupabaseCreateClient() {
  try {
    const mod = await import("@supabase/supabase-js");
    return typeof mod.createClient === "function" ? mod.createClient : null;
  } catch {
    return null;
  }
}

async function buildActivityPayload({ supabaseUrl, serviceRoleKey, createClient }) {
  if (!supabaseUrl) {
    return buildUnavailablePayload("Supabase URL is not available on this host.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const profileResult = await supabase
    .from("worldcup_referral_profiles")
    .select("user_id,referral_code,display_name")
    .eq("referral_code", REFERRAL_CODE)
    .maybeSingle();

  if (profileResult.error) {
    return buildErrorPayload(`Could not load referral profile: ${profileResult.error.message}`);
  }

  const inviterUserId = profileResult.data?.user_id ?? "";
  if (!inviterUserId) {
    return {
      ...basePayload(),
      ok: true,
      available: true,
      status: "not_found",
      inviterFound: false,
      inviterName: "",
      counts: zeroCounts(),
      latest: {},
      rule: "No profile exists for the referral code, so no referral activity can be attributed.",
    };
  }

  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const since72h = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();

  const [
    referrals,
    referrals24h,
    referrals72h,
    signupSaves,
    signupSaves24h,
    signupSaves72h,
    entriesByCode,
    entriesByReferrer,
    allProfiles,
    profiles24h,
    profiles72h,
    allEntries,
    appViews,
    appViews24h,
    appViews72h,
    referralViews,
    referralViews24h,
    referralViews72h,
    signupReturned,
    signupMissingAcceptance,
    signupAttempts,
    signupSavedEvents,
    signupFailedEvents,
    signupErrorEvents,
    sourceViews,
    allSourceViews,
  ] = await Promise.all([
    supabase
      .from("worldcup_referrals")
      .select("id,entry_id,accepted_at,referral_fee_percent", { count: "exact" })
      .eq("inviter_user_id", inviterUserId),
    supabase
      .from("worldcup_referrals")
      .select("id", { count: "exact", head: true })
      .eq("inviter_user_id", inviterUserId)
      .gte("accepted_at", since24h),
    supabase
      .from("worldcup_referrals")
      .select("id", { count: "exact", head: true })
      .eq("inviter_user_id", inviterUserId)
      .gte("accepted_at", since72h),
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id,signup_referral_accepted_at,signup_utm_source,signup_utm_medium,signup_utm_campaign,signup_utm_content", { count: "exact" })
      .eq("signup_referral_code", REFERRAL_CODE),
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("signup_referral_code", REFERRAL_CODE)
      .gte("signup_referral_accepted_at", since24h),
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("signup_referral_code", REFERRAL_CODE)
      .gte("signup_referral_accepted_at", since72h),
    supabase
      .from("worldcup_entries")
      .select("id,status,created_at,locked_at", { count: "exact" })
      .eq("referral_code", REFERRAL_CODE),
    supabase
      .from("worldcup_entries")
      .select("id,status,created_at,locked_at", { count: "exact" })
      .eq("referrer_user_id", inviterUserId),
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id", { count: "exact", head: true }),
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", since24h),
    supabase
      .from("worldcup_referral_profiles")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", since72h),
    supabase
      .from("worldcup_entries")
      .select("id,user_id,status,created_at,locked_at", { count: "exact" }),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24h),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since72h),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", REFERRAL_CODE),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", REFERRAL_CODE)
      .gte("created_at", since24h),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", REFERRAL_CODE)
      .gte("created_at", since72h),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", REFERRAL_CODE)
      .eq("path", "/#signup-referral-returned"),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", REFERRAL_CODE)
      .eq("path", "/#signup-referral-missing-acceptance"),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", REFERRAL_CODE)
      .eq("path", "/#signup-referral-attempt"),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", REFERRAL_CODE)
      .eq("path", "/#signup-referral-saved"),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", REFERRAL_CODE)
      .eq("path", "/#signup-referral-save-failed"),
    supabase
      .from("worldcup_app_views")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", REFERRAL_CODE)
      .eq("path", "/#signup-referral-save-error"),
    supabase
      .from("worldcup_app_views")
      .select("created_at,utm_source,utm_medium,utm_campaign,utm_content")
      .eq("referral_code", REFERRAL_CODE)
      .not("utm_source", "is", null)
      .gte("created_at", since72h)
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("worldcup_app_views")
      .select("created_at,utm_source,utm_medium,utm_campaign,utm_content,referral_code")
      .not("utm_source", "is", null)
      .gte("created_at", since72h)
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  const firstError = [
    referrals,
    referrals24h,
    referrals72h,
    signupSaves,
    signupSaves24h,
    signupSaves72h,
    entriesByCode,
    entriesByReferrer,
    allProfiles,
    profiles24h,
    profiles72h,
    allEntries,
  ].find((result) => result.error);
  if (firstError?.error) {
    return buildErrorPayload(`Could not load referral activity: ${firstError.error.message}`);
  }

  const viewResults = [
    appViews,
    appViews24h,
    appViews72h,
    referralViews,
    referralViews24h,
    referralViews72h,
    signupReturned,
    signupMissingAcceptance,
    signupAttempts,
    signupSavedEvents,
    signupFailedEvents,
    signupErrorEvents,
  ];
  const viewError = viewResults.find((result) => result.error)?.error ?? null;
  const sourceRows = sourceViews.error ? [] : (sourceViews.data ?? []);
  const allSourceRows = allSourceViews.error ? [] : (allSourceViews.data ?? []);
  const referralRows = referrals.data ?? [];
  const signupRows = signupSaves.data ?? [];
  const entryRows = mergeEntryRows(entriesByCode.data ?? [], entriesByReferrer.data ?? []);
  const allEntryRows = allEntries.data ?? [];
  const draftEntries = entryRows.filter((entry) => entry.status === "draft").length;
  const lockedEntries = entryRows.filter((entry) => entry.status === "locked").length;
  const paidUserIds = new Set(
    allEntryRows
      .filter((entry) => entry.status === "locked")
      .map((entry) => String(entry.user_id ?? ""))
      .filter(Boolean),
  );
  const draftUserIds = new Set(
    allEntryRows
      .filter((entry) => entry.status === "draft")
      .map((entry) => String(entry.user_id ?? ""))
      .filter(Boolean),
  );
  const profileCount = Number(allProfiles.count ?? 0);
  const paidAccountCount = paidUserIds.size;

  return {
    ...basePayload(),
    ok: true,
    available: true,
    status: "ok",
    inviterFound: true,
    inviterName: String(profileResult.data?.display_name ?? "Inviter"),
    counts: {
      acceptedReferrals: Number(referrals.count ?? referralRows.length),
      acceptedReferrals24h: Number(referrals24h.count ?? 0),
      acceptedReferrals72h: Number(referrals72h.count ?? 0),
      signupReferralSaves: Number(signupSaves.count ?? signupRows.length),
      signupReferralSaves24h: Number(signupSaves24h.count ?? 0),
      signupReferralSaves72h: Number(signupSaves72h.count ?? 0),
      referredEntries: entryRows.length,
      draftEntries,
      lockedEntries,
    },
    accountCounts: {
      profiles: profileCount,
      profiles24h: Number(profiles24h.count ?? 0),
      profiles72h: Number(profiles72h.count ?? 0),
      freeAccounts: Math.max(0, profileCount - paidAccountCount),
      paidAccounts: paidAccountCount,
      draftAccounts: draftUserIds.size,
      totalEntries: Number(allEntries.count ?? allEntryRows.length),
      draftEntries: allEntryRows.filter((entry) => entry.status === "draft").length,
      lockedEntries: allEntryRows.filter((entry) => entry.status === "locked").length,
      lockedEntries24h: allEntryRows.filter((entry) => entry.status === "locked" && isSince(entry.locked_at, since24h)).length,
      lockedEntries72h: allEntryRows.filter((entry) => entry.status === "locked" && isSince(entry.locked_at, since72h)).length,
    },
    viewCounts: viewError
      ? {
          available: false,
          reason: viewError.message ?? "App view table is not available.",
          appViews: 0,
          appViews24h: 0,
          appViews72h: 0,
          referralViews: 0,
          referralViews24h: 0,
          referralViews72h: 0,
          signupReturned: 0,
          signupMissingAcceptance: 0,
          signupAttempts: 0,
          signupSavedEvents: 0,
          signupFailedEvents: 0,
          signupErrorEvents: 0,
        }
      : {
          available: true,
          reason: "",
          appViews: Number(appViews.count ?? 0),
          appViews24h: Number(appViews24h.count ?? 0),
          appViews72h: Number(appViews72h.count ?? 0),
          referralViews: Number(referralViews.count ?? 0),
          referralViews24h: Number(referralViews24h.count ?? 0),
          referralViews72h: Number(referralViews72h.count ?? 0),
          signupReturned: Number(signupReturned.count ?? 0),
          signupMissingAcceptance: Number(signupMissingAcceptance.count ?? 0),
          signupAttempts: Number(signupAttempts.count ?? 0),
          signupSavedEvents: Number(signupSavedEvents.count ?? 0),
          signupFailedEvents: Number(signupFailedEvents.count ?? 0),
          signupErrorEvents: Number(signupErrorEvents.count ?? 0),
        },
    sourceBreakdown: buildSourceBreakdown(sourceRows),
    allSourceBreakdown: buildSourceBreakdown(allSourceRows, 25),
    signupSourceBreakdown: buildSignupSourceBreakdown(signupRows),
    latest: {
      acceptedReferralAt: latestIso(referralRows.map((row) => row.accepted_at)),
      signupReferralSavedAt: latestIso(signupRows.map((row) => row.signup_referral_accepted_at)),
      entryCreatedAt: latestIso(entryRows.map((row) => row.created_at)),
      entryLockedAt: latestIso(entryRows.map((row) => row.locked_at)),
    },
    rule:
      "Counts are no-PII attribution evidence for the campaign referral code. This does not prove an external post happened by itself.",
  };
}

function buildUnavailablePayload(reason) {
  return {
    ...basePayload(),
    ok: true,
    available: false,
    status: "unavailable",
    reason,
    inviterFound: false,
    inviterName: "",
    counts: zeroCounts(),
    accountCounts: zeroAccountCounts(),
    viewCounts: zeroViewCounts(false),
    sourceBreakdown: [],
    allSourceBreakdown: [],
    signupSourceBreakdown: [],
    latest: {},
    rule:
      "Referral activity monitoring needs server-side credentials. This host can still run campaign loops without exposing secrets.",
  };
}

function buildCachedPayload(cached, reason) {
  return {
    ...cached,
    ...basePayload(),
    ok: true,
    available: true,
    status: String(cached.status ?? "ok") === "not_found" ? "not_found" : "ok",
    monitorMode: "cached-leader-snapshot",
    cacheReason: reason,
    snapshotGeneratedAt: String(cached.snapshotGeneratedAt ?? cached.generatedAt ?? ""),
    snapshotGeneratedAtEest: String(cached.snapshotGeneratedAtEest ?? cached.generatedAtEest ?? ""),
    rule:
      "This host is using the latest synced leader analytics snapshot because Supabase service credentials are not stored on campaign droplets. Counts are no-PII attribution evidence, not external post proof.",
  };
}

function buildErrorPayload(reason) {
  return {
    ...basePayload(),
    ok: false,
    available: true,
    status: "error",
    reason,
    inviterFound: false,
    inviterName: "",
    counts: zeroCounts(),
    accountCounts: zeroAccountCounts(),
    viewCounts: zeroViewCounts(false),
    sourceBreakdown: [],
    allSourceBreakdown: [],
    signupSourceBreakdown: [],
    latest: {},
    rule: "Referral activity could not be loaded. Fix this before using referral activity as campaign evidence.",
  };
}

function basePayload() {
  return {
    schema: "worldcup26-referral-activity-v1",
    generatedAt: now.toISOString(),
    generatedAtEest: formatEestLogTime(now),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
  };
}

function zeroCounts() {
  return {
    acceptedReferrals: 0,
    acceptedReferrals24h: 0,
    acceptedReferrals72h: 0,
    signupReferralSaves: 0,
    signupReferralSaves24h: 0,
    signupReferralSaves72h: 0,
    referredEntries: 0,
    draftEntries: 0,
    lockedEntries: 0,
  };
}

function zeroAccountCounts() {
  return {
    profiles: 0,
    profiles24h: 0,
    profiles72h: 0,
    freeAccounts: 0,
    paidAccounts: 0,
    draftAccounts: 0,
    totalEntries: 0,
    draftEntries: 0,
    lockedEntries: 0,
    lockedEntries24h: 0,
    lockedEntries72h: 0,
  };
}

function zeroViewCounts(available = true) {
  return {
    available,
    reason: available ? "" : "No app view counts are available.",
    appViews: 0,
    appViews24h: 0,
    appViews72h: 0,
    referralViews: 0,
    referralViews24h: 0,
    referralViews72h: 0,
    signupReturned: 0,
    signupMissingAcceptance: 0,
    signupAttempts: 0,
    signupSavedEvents: 0,
    signupFailedEvents: 0,
    signupErrorEvents: 0,
  };
}

function buildSourceBreakdown(rows, limit = 10) {
  const groups = new Map();

  for (const row of rows) {
    const source = String(row.utm_source ?? "").trim();
    if (!source) continue;

    const medium = String(row.utm_medium ?? "").trim() || null;
    const campaign = String(row.utm_campaign ?? "").trim() || null;
    const content = String(row.utm_content ?? "").trim() || null;
    const key = [source, medium ?? "", campaign ?? "", content ?? ""].join("\u0000");
    const current = groups.get(key) ?? {
      source,
      medium,
      campaign,
      content,
      count: 0,
      lastViewedAt: null,
    };

    current.count += 1;
    if (!current.lastViewedAt || new Date(row.created_at).getTime() > new Date(current.lastViewedAt).getTime()) {
      current.lastViewedAt = row.created_at;
    }
    groups.set(key, current);
  }

  return [...groups.values()]
    .sort((left, right) => {
      if (right.count !== left.count) return right.count - left.count;
      return new Date(right.lastViewedAt ?? 0).getTime() - new Date(left.lastViewedAt ?? 0).getTime();
    })
    .slice(0, limit);
}

function buildSignupSourceBreakdown(rows) {
  return buildSourceBreakdown(
    rows.map((row) => ({
      created_at: row.signup_referral_accepted_at,
      utm_source: row.signup_utm_source,
      utm_medium: row.signup_utm_medium,
      utm_campaign: row.signup_utm_campaign,
      utm_content: row.signup_utm_content,
    })),
  );
}

function mergeEntryRows(left, right) {
  const byId = new Map();
  for (const row of [...left, ...right]) {
    if (row?.id) byId.set(row.id, row);
  }
  return [...byId.values()];
}

function latestIso(values) {
  const timestamps = values
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite);
  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function isSince(value, sinceIso) {
  const time = new Date(value ?? "").getTime();
  const since = new Date(sinceIso).getTime();
  return Number.isFinite(time) && Number.isFinite(since) && time >= since;
}

function renderText(payload) {
  const counts = payload.counts ?? zeroCounts();
  const accountCounts = payload.accountCounts ?? zeroAccountCounts();
  const viewCounts = payload.viewCounts ?? zeroViewCounts(false);
  const topSource = payload.sourceBreakdown?.[0] ?? null;
  const topAllSource = payload.allSourceBreakdown?.[0] ?? null;
  const topSignupSource = payload.signupSourceBreakdown?.[0] ?? null;
  const latest = payload.latest ?? {};
  return [
    `WorldCup26 referral activity ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} available=${payload.available ? "yes" : "no"} status=${payload.status} code=${payload.referralCode}`,
    payload.monitorMode ? `mode=${payload.monitorMode} snapshot=${payload.snapshotGeneratedAtEest || "-"}` : "",
    `inviter_found=${payload.inviterFound ? "yes" : "no"} inviter="${payload.inviterName || "-"}"`,
    `accepted=${counts.acceptedReferrals} accepted_24h=${counts.acceptedReferrals24h} accepted_72h=${counts.acceptedReferrals72h}`,
    `signup_saves=${counts.signupReferralSaves} signup_saves_24h=${counts.signupReferralSaves24h} signup_saves_72h=${counts.signupReferralSaves72h}`,
    `entries=${counts.referredEntries} draft=${counts.draftEntries} locked=${counts.lockedEntries}`,
    `accounts=profiles:${accountCounts.profiles} free:${accountCounts.freeAccounts} paid:${accountCounts.paidAccounts} profiles_24h:${accountCounts.profiles24h} profiles_72h:${accountCounts.profiles72h}`,
    `all_entries=total:${accountCounts.totalEntries} draft:${accountCounts.draftEntries} locked:${accountCounts.lockedEntries} locked_24h:${accountCounts.lockedEntries24h} locked_72h:${accountCounts.lockedEntries72h}`,
    `app_views=available:${viewCounts.available ? "yes" : "no"} total:${viewCounts.appViews} views_24h:${viewCounts.appViews24h} views_72h:${viewCounts.appViews72h} referral_total:${viewCounts.referralViews} referral_24h:${viewCounts.referralViews24h} referral_72h:${viewCounts.referralViews72h}`,
    `signup_funnel=returned:${viewCounts.signupReturned} missing_acceptance:${viewCounts.signupMissingAcceptance} attempts:${viewCounts.signupAttempts} saved_events:${viewCounts.signupSavedEvents} failed:${viewCounts.signupFailedEvents} errors:${viewCounts.signupErrorEvents}`,
    topAllSource ? `top_all_source=${topAllSource.source} medium=${topAllSource.medium || "-"} campaign=${topAllSource.campaign || "-"} content=${topAllSource.content || "-"} views=${topAllSource.count}` : "top_all_source=-",
    topSource ? `top_source=${topSource.source} medium=${topSource.medium || "-"} campaign=${topSource.campaign || "-"} content=${topSource.content || "-"} views=${topSource.count}` : "top_source=-",
    topSignupSource ? `top_signup_source=${topSignupSource.source} medium=${topSignupSource.medium || "-"} campaign=${topSignupSource.campaign || "-"} content=${topSignupSource.content || "-"} signups=${topSignupSource.count}` : "top_signup_source=-",
    viewCounts.available ? "" : `app_views_reason=${viewCounts.reason}`,
    `latest_accepted=${latest.acceptedReferralAt || "-"} latest_signup_save=${latest.signupReferralSavedAt || "-"} latest_entry=${latest.entryCreatedAt || "-"} latest_locked=${latest.entryLockedAt || "-"}`,
    payload.reason ? `reason=${payload.reason}` : "",
    payload.cacheReason ? `cache_reason=${payload.cacheReason}` : "",
    `Rule: ${payload.rule}`,
    "",
  ].filter(Boolean).join("\n");
}

function renderMarkdown(payload) {
  const counts = payload.counts ?? zeroCounts();
  const accountCounts = payload.accountCounts ?? zeroAccountCounts();
  const viewCounts = payload.viewCounts ?? zeroViewCounts(false);
  const topSource = payload.sourceBreakdown?.[0] ?? null;
  const topAllSource = payload.allSourceBreakdown?.[0] ?? null;
  const topSignupSource = payload.signupSourceBreakdown?.[0] ?? null;
  const latest = payload.latest ?? {};
  return `# WorldCup26 Referral Activity

Generated: ${payload.generatedAtEest}

- Status: ${payload.status}
- Available: ${payload.available ? "yes" : "no"}
- Mode: ${payload.monitorMode || "live"}
- Snapshot: ${payload.snapshotGeneratedAtEest || "-"}
- Referral code: \`${payload.referralCode}\`
- Inviter found: ${payload.inviterFound ? "yes" : "no"}
- Accepted referrals: ${counts.acceptedReferrals}
- Signup referral saves: ${counts.signupReferralSaves}
- Referred entries: ${counts.referredEntries}
- Draft entries: ${counts.draftEntries}
- Locked entries: ${counts.lockedEntries}
- Free accounts: ${accountCounts.freeAccounts}
- Paid accounts: ${accountCounts.paidAccounts}
- Total profiles: ${accountCounts.profiles}
- App views available: ${viewCounts.available ? "yes" : "no"}
- App views total: ${viewCounts.appViews}
- App views 24h: ${viewCounts.appViews24h}
- Referral-code app views: ${viewCounts.referralViews}
- Referral-code app views 24h: ${viewCounts.referralViews24h}
- Signup returned events: ${viewCounts.signupReturned}
- Signup save attempts: ${viewCounts.signupAttempts}
- Signup saved events: ${viewCounts.signupSavedEvents}
- Signup failed/error events: ${viewCounts.signupFailedEvents + viewCounts.signupErrorEvents}
- Top all tagged source: ${topAllSource ? `${topAllSource.source} (${topAllSource.count})` : "-"}
- Top tagged source: ${topSource ? `${topSource.source} (${topSource.count})` : "-"}
- Top signup source: ${topSignupSource ? `${topSignupSource.source} (${topSignupSource.count})` : "-"}
- Latest accepted referral: ${latest.acceptedReferralAt || "-"}
- Latest signup save: ${latest.signupReferralSavedAt || "-"}

${payload.rule}
`;
}

function renderHtml(payload) {
  const counts = payload.counts ?? zeroCounts();
  const accountCounts = payload.accountCounts ?? zeroAccountCounts();
  const viewCounts = payload.viewCounts ?? zeroViewCounts(false);
  const topSource = payload.sourceBreakdown?.[0] ?? null;
  const topAllSource = payload.allSourceBreakdown?.[0] ?? null;
  const topSignupSource = payload.signupSourceBreakdown?.[0] ?? null;
  const latest = payload.latest ?? {};
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WorldCup26 Referral Activity</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #061711; color: #f8fff9; }
    main { max-width: 880px; margin: 0 auto; padding: 20px 12px 46px; }
    header, section { border: 1px solid rgba(255,255,255,.16); border-radius: 8px; background: #0d2a20; padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: 32px; }
    p { color: #cfe2d9; line-height: 1.45; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .stat { border: 1px solid rgba(255,255,255,.14); border-radius: 8px; padding: 10px; background: rgba(255,255,255,.05); }
    .stat span { display:block; color:#aac8bd; font-size:12px; text-transform:uppercase; font-weight:800; }
    .stat strong { font-size:28px; color:#ffdc7a; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Referral Activity</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <p>Status: ${escapeHtml(payload.status)} · Available: ${payload.available ? "yes" : "no"} · Mode: ${escapeHtml(payload.monitorMode || "live")}</p>
      ${payload.snapshotGeneratedAtEest ? `<p>Snapshot: ${escapeHtml(payload.snapshotGeneratedAtEest)}</p>` : ""}
    </header>
    <section class="grid">
      ${stat("Accepted", counts.acceptedReferrals)}
      ${stat("Accepted 24h", counts.acceptedReferrals24h)}
      ${stat("Signup Saves", counts.signupReferralSaves)}
      ${stat("Entries", counts.referredEntries)}
      ${stat("Draft", counts.draftEntries)}
      ${stat("Locked", counts.lockedEntries)}
      ${stat("Free Accounts", accountCounts.freeAccounts)}
      ${stat("Paid Accounts", accountCounts.paidAccounts)}
      ${stat("App Views", viewCounts.appViews)}
      ${stat("Referral Views", viewCounts.referralViews)}
      ${stat("Signup Returned", viewCounts.signupReturned)}
      ${stat("Signup Attempts", viewCounts.signupAttempts)}
      ${stat("Signup Saved Events", viewCounts.signupSavedEvents)}
      ${stat("Signup Failed/Error", viewCounts.signupFailedEvents + viewCounts.signupErrorEvents)}
      ${stat("Top All Source", topAllSource?.count ?? 0)}
      ${stat("Top Source Views", topSource?.count ?? 0)}
      ${stat("Top Signup Source", topSignupSource?.count ?? 0)}
    </section>
    <section>
      <p>Top all tagged source: ${escapeHtml(topAllSource ? `${topAllSource.source} / ${topAllSource.medium || "manual"} / ${topAllSource.campaign || "-"}` : "-")}</p>
      <p>Top tagged source: ${escapeHtml(topSource ? `${topSource.source} / ${topSource.medium || "manual"} / ${topSource.campaign || "-"}` : "-")}</p>
      <p>Top signup source: ${escapeHtml(topSignupSource ? `${topSignupSource.source} / ${topSignupSource.medium || "manual"} / ${topSignupSource.campaign || "-"}` : "-")}</p>
      <p>Latest accepted referral: ${escapeHtml(latest.acceptedReferralAt || "-")}</p>
      <p>Latest signup save: ${escapeHtml(latest.signupReferralSavedAt || "-")}</p>
      <p>Latest entry: ${escapeHtml(latest.entryCreatedAt || "-")}</p>
    </section>
  </main>
</body>
</html>
`;
}

function stat(label, value) {
  return `<div class="stat"><span>${escapeHtml(label)}</span><strong>${Number(value ?? 0)}</strong></div>`;
}

async function readEnvFile(filePath) {
  try {
    const text = await readFile(filePath, "utf8");
    return Object.fromEntries(
      text
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const raw = line.slice(index + 1).trim();
          return [key, raw.replace(/^["']|["']$/g, "")];
        }),
    );
  } catch {
    return {};
  }
}

async function readCachedAvailablePayload(filePath) {
  try {
    const cached = JSON.parse(await readFile(filePath, "utf8"));
    const isValid =
      String(cached.schema ?? "") === "worldcup26-referral-activity-v1" &&
      String(cached.referralCode ?? "") === REFERRAL_CODE &&
      String(cached.referralLink ?? "") === REFERRAL_LINK &&
      Boolean(cached.ok) &&
      Boolean(cached.available);
    return isValid ? cached : null;
  } catch {
    return null;
  }
}

async function findProjectRoot(startDir) {
  let current = startDir;
  for (;;) {
    try {
      const pkg = JSON.parse(await readFile(path.join(current, "package.json"), "utf8"));
      if (pkg.name === "worldcup") return current;
    } catch {
      // Keep walking.
    }
    const parent = path.dirname(current);
    if (parent === current) return startDir;
    current = parent;
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
