module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/geo-eligibility.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGeoEligibility",
    ()=>getGeoEligibility,
    "getRequestCountry",
    ()=>getRequestCountry,
    "parseCountryList",
    ()=>parseCountryList
]);
const COUNTRY_HEADERS = [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "x-country-code",
    "x-appengine-country"
];
function getRequestCountry(request) {
    for (const header of COUNTRY_HEADERS){
        const country = normalizeCountryCode(request.headers.get(header));
        if (country) {
            return country;
        }
    }
    return null;
}
function getGeoEligibility(request, env = process.env) {
    const allowedCountries = parseCountryList(env.WORLDCUP_ALLOWED_COUNTRIES);
    const blockedCountries = parseCountryList(env.WORLDCUP_BLOCKED_COUNTRIES);
    const configured = allowedCountries.size > 0 || blockedCountries.size > 0;
    const country = getRequestCountry(request);
    if (!configured) {
        return {
            allowed: true,
            country,
            reason: "not-configured"
        };
    }
    if (!country) {
        return {
            allowed: false,
            country: null,
            reason: "unknown"
        };
    }
    if (blockedCountries.has(country)) {
        return {
            allowed: false,
            country,
            reason: "blocked"
        };
    }
    if (allowedCountries.size > 0 && !allowedCountries.has(country)) {
        return {
            allowed: false,
            country,
            reason: "not-allowed"
        };
    }
    return {
        allowed: true,
        country,
        reason: "allowed"
    };
}
function parseCountryList(value) {
    return new Set((value ?? "").split(",").map((country)=>normalizeCountryCode(country)).filter((country)=>Boolean(country)));
}
function normalizeCountryCode(value) {
    const normalized = value?.trim().toUpperCase();
    return normalized && /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}
}),
"[project]/src/lib/rate-limit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure, dependency-free sliding-window limiter. In a serverless deployment each
// instance keeps its own buckets, so this is a best-effort guard against bursts
// and brute-force, not a globally exact quota. For strict limits use a shared
// store (Supabase/Redis). The Next-aware wrapper lives in http.ts.
__turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit
]);
const buckets = new Map();
function checkRateLimit(key, limit, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;
    const bucket = buckets.get(key) ?? {
        hits: []
    };
    bucket.hits = bucket.hits.filter((timestamp)=>timestamp > windowStart);
    if (bucket.hits.length >= limit) {
        const oldest = bucket.hits[0] ?? now;
        const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
        buckets.set(key, bucket);
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds
        };
    }
    bucket.hits.push(now);
    buckets.set(key, bucket);
    // Opportunistic cleanup so the map does not grow without bound.
    if (buckets.size > 5000) {
        for (const [bucketKey, value] of buckets){
            value.hits = value.hits.filter((timestamp)=>timestamp > windowStart);
            if (value.hits.length === 0) {
                buckets.delete(bucketKey);
            }
        }
    }
    return {
        allowed: true,
        remaining: limit - bucket.hits.length,
        retryAfterSeconds: 0
    };
}
}),
"[project]/src/lib/request.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Pure request helpers with no framework dependency, so they can be unit
// tested and imported without pulling in `next/server`.
__turbopack_context__.s([
    "getBearerToken",
    ()=>getBearerToken,
    "getClientIp",
    ()=>getClientIp
]);
function getClientIp(request) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) {
            return first;
        }
    }
    return request.headers.get("x-real-ip")?.trim() || "unknown";
}
function getBearerToken(request) {
    const header = request.headers.get("authorization");
    if (!header) {
        return null;
    }
    const match = header.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : null;
}
}),
"[project]/src/lib/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPublicSupabaseEnv",
    ()=>getPublicSupabaseEnv,
    "requireEnv",
    ()=>requireEnv
]);
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function getPublicSupabaseEnv() {
    const url = ("TURBOPACK compile-time value", "https://api.worldcup26.world");
    const anonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGpmZHhvd3B4enJ5YnhkYXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNzY2MDMsImV4cCI6MjA4MDY1MjYwM30.osOl_He3r9DRiUMebrTI_mU2Xnhy-Nvp1uxx7wur2MU");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return {
        url,
        anonKey
    };
}
}),
"[project]/src/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBrowserSupabaseClient",
    ()=>createBrowserSupabaseClient,
    "createPublicSupabaseClient",
    ()=>createPublicSupabaseClient,
    "createServerReadSupabaseClient",
    ()=>createServerReadSupabaseClient,
    "createServiceSupabaseClient",
    ()=>createServiceSupabaseClient,
    "getServerReadSupabaseKey",
    ()=>getServerReadSupabaseKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
;
;
let browserSupabaseClient = null;
function createPublicSupabaseClient() {
    const { url, anonKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPublicSupabaseEnv"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, anonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });
}
function createBrowserSupabaseClient() {
    if (browserSupabaseClient) {
        return browserSupabaseClient;
    }
    const { url, anonKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPublicSupabaseEnv"])();
    browserSupabaseClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, anonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: "pkce"
        }
    });
    return browserSupabaseClient;
}
function createServerReadSupabaseClient() {
    const { url } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPublicSupabaseEnv"])();
    return createSupabaseClient(url, getServerReadSupabaseKey());
}
function createServiceSupabaseClient() {
    const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireEnv"])("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireEnv"])("SUPABASE_SERVICE_ROLE_KEY");
    return createSupabaseClient(url, serviceRoleKey);
}
function createSupabaseClient(url, key) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });
}
function getServerReadSupabaseKey(env = process.env) {
    if (env.SUPABASE_SERVICE_ROLE_KEY) {
        return env.SUPABASE_SERVICE_ROLE_KEY;
    }
    if (env.VERCEL_ENV === "production") {
        throw new Error("Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY");
    }
    if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    return env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
}),
"[project]/src/lib/http.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "enforceGeoEligibility",
    ()=>enforceGeoEligibility,
    "enforceRateLimit",
    ()=>enforceRateLimit,
    "jsonError",
    ()=>jsonError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$eligibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/geo-eligibility.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rate-limit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/request.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
;
;
;
;
;
;
function jsonError(message, status) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: message
    }, {
        status
    });
}
function enforceGeoEligibility(request, env = process.env) {
    const eligibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$eligibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGeoEligibility"])(request, env);
    if (eligibility.allowed) {
        return null;
    }
    return jsonError("WorldCup26 is not available for paid entries or deposits from your current location.", 403);
}
function tooManyRequests(retryAfterSeconds) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Too many requests. Please slow down and try again."
    }, {
        status: 429,
        headers: {
            "Retry-After": String(Math.max(1, retryAfterSeconds))
        }
    });
}
async function enforceRateLimit(request, name, options) {
    const key = `${name}:${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClientIp"])(request)}`;
    const windowSeconds = Math.ceil(options.windowMs / 1000);
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServiceSupabaseClient"])();
        const { data, error } = await supabase.rpc("worldcup_rate_limit_hit", {
            p_key: key,
            p_limit: options.limit,
            p_window_seconds: windowSeconds
        });
        if (error) {
            return fallback(key, options);
        }
        return data === false ? tooManyRequests(windowSeconds) : null;
    } catch  {
        return fallback(key, options);
    }
}
function fallback(key, options) {
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkRateLimit"])(key, options.limit, options.windowMs);
    return result.allowed ? null : tooManyRequests(result.retryAfterSeconds);
}
}),
"[project]/src/lib/prize-pool.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LARGE_CONTEST_PAID_PLACES",
    ()=>LARGE_CONTEST_PAID_PLACES,
    "LARGE_CONTEST_PARTICIPANT_THRESHOLD",
    ()=>LARGE_CONTEST_PARTICIPANT_THRESHOLD,
    "PRIZE_POOL_FEE_PERCENT",
    ()=>PRIZE_POOL_FEE_PERCENT,
    "SMALL_CONTEST_PAID_PERCENT",
    ()=>SMALL_CONTEST_PAID_PERCENT,
    "TOP_TEN_PAYOUT_WEIGHTS",
    ()=>TOP_TEN_PAYOUT_WEIGHTS,
    "calculateNetPrizePool",
    ()=>calculateNetPrizePool,
    "calculatePaidPlaces",
    ()=>calculatePaidPlaces,
    "calculatePayoutPlan",
    ()=>calculatePayoutPlan,
    "formatPrizeAmount",
    ()=>formatPrizeAmount
]);
const PRIZE_POOL_FEE_PERCENT = 20;
const LARGE_CONTEST_PARTICIPANT_THRESHOLD = 100;
const LARGE_CONTEST_PAID_PLACES = 10;
const SMALL_CONTEST_PAID_PERCENT = 10;
const TOP_TEN_PAYOUT_WEIGHTS = [
    35,
    20,
    13,
    9,
    7,
    5,
    4,
    3,
    2,
    2
];
function calculateNetPrizePool(grossAmount, _feePercent = PRIZE_POOL_FEE_PERCENT) {
    const gross = Number(grossAmount ?? 0);
    if (!Number.isFinite(gross) || gross <= 0) {
        return 0;
    }
    return gross;
}
function formatPrizeAmount(value) {
    return new Intl.NumberFormat("en", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(Number(value));
}
function calculatePaidPlaces(participantCount) {
    if (!Number.isFinite(participantCount) || participantCount <= 0) {
        return 0;
    }
    return Math.min(LARGE_CONTEST_PAID_PLACES, Math.floor(participantCount));
}
function calculatePayoutPlan(prizePoolAmount, paidPlaces) {
    if (!Number.isFinite(prizePoolAmount) || prizePoolAmount <= 0 || !Number.isInteger(paidPlaces) || paidPlaces <= 0) {
        return [];
    }
    const cappedPaidPlaces = Math.min(paidPlaces, TOP_TEN_PAYOUT_WEIGHTS.length);
    const weights = TOP_TEN_PAYOUT_WEIGHTS.slice(0, cappedPaidPlaces);
    const totalWeight = weights.reduce((sum, weight)=>sum + weight, 0);
    let allocatedCents = 0;
    const totalCents = Math.round(prizePoolAmount * 100);
    return weights.map((weight, index)=>{
        const rank = index + 1;
        const percent = weight / totalWeight * 100;
        const amountCents = rank === cappedPaidPlaces ? totalCents - allocatedCents : Math.round(totalCents * (weight / totalWeight));
        allocatedCents += amountCents;
        return {
            rank,
            percent,
            amount: amountCents / 100
        };
    });
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/src/lib/secure-compare.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "timingSafeEqualStrings",
    ()=>timingSafeEqualStrings
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
function timingSafeEqualStrings(a, b) {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);
    if (aBuffer.length !== bBuffer.length) {
        // Compare against itself to keep the timing profile stable, then fail.
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(aBuffer, aBuffer);
        return false;
    }
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(aBuffer, bBuffer);
}
}),
"[project]/src/lib/admin-auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OWNER_ADMIN_EMAIL",
    ()=>OWNER_ADMIN_EMAIL,
    "getAdminEmailAllowlist",
    ()=>getAdminEmailAllowlist,
    "getOwnerAdminEmail",
    ()=>getOwnerAdminEmail,
    "isAllowlistedAdminEmail",
    ()=>isAllowlistedAdminEmail,
    "requireAdmin",
    ()=>requireAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/request.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$secure$2d$compare$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/secure-compare.ts [app-route] (ecmascript)");
;
;
const OWNER_ADMIN_EMAIL = "semebitcoin@gmail.com";
const OWNER_ADMIN_DISABLED_VALUES = new Set([
    "none",
    "disabled",
    "off",
    "false"
]);
function getOwnerAdminEmail(env = process.env) {
    const configured = (env.OWNER_ADMIN_EMAIL ?? "").trim().toLowerCase();
    if (OWNER_ADMIN_DISABLED_VALUES.has(configured)) {
        return null;
    }
    return configured || OWNER_ADMIN_EMAIL;
}
function getAdminEmailAllowlist(env = process.env) {
    const configuredEmails = (env.ADMIN_EMAILS ?? "").split(",").map((value)=>value.trim().toLowerCase()).filter(Boolean);
    const ownerEmail = getOwnerAdminEmail(env);
    return Array.from(new Set([
        ...configuredEmails,
        ...ownerEmail ? [
            ownerEmail
        ] : []
    ]));
}
function isAllowlistedAdminEmail(email, env = process.env) {
    if (!email) {
        return false;
    }
    return getAdminEmailAllowlist(env).includes(email.trim().toLowerCase());
}
async function requireAdmin(request, supabase) {
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBearerToken"])(request);
    if (token) {
        const userResult = await supabase.auth.getUser(token);
        const email = userResult.data.user?.email ?? null;
        if (!userResult.error && email && isAllowlistedAdminEmail(email)) {
            return {
                ok: true,
                via: "email",
                adminEmail: email.toLowerCase()
            };
        }
    }
    const breakGlassSecret = request.headers.get("x-admin-secret");
    const expectedSecret = process.env.ADMIN_RESULT_SECRET;
    if (breakGlassSecret && expectedSecret && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$secure$2d$compare$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timingSafeEqualStrings"])(breakGlassSecret, expectedSecret)) {
        return {
            ok: true,
            via: "secret",
            adminEmail: null
        };
    }
    return {
        ok: false,
        status: 401,
        error: "Admin authorization required."
    };
}
}),
"[project]/src/lib/referrals.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAuthProvider",
    ()=>getAuthProvider,
    "getOrCreateReferralProfile",
    ()=>getOrCreateReferralProfile,
    "getUserDisplayName",
    ()=>getUserDisplayName,
    "normalizeReferralCode",
    ()=>normalizeReferralCode
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/admin-auth.ts [app-route] (ecmascript)");
;
;
const referralProfileSelect = "user_id,referral_code,display_name,email,usdt_sender_wallet_address,usdt_sender_wallet_network,usdt_sender_wallet_updated_at,usdt_sender_wallet_trc20_address,usdt_sender_wallet_trc20_updated_at,usdt_sender_wallet_erc20_address,usdt_sender_wallet_erc20_updated_at,signup_referral_code,signup_referrer_user_id,signup_referral_accepted_at";
function normalizeReferralCode(value) {
    return (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function getAuthProvider(user) {
    const provider = user.app_metadata.provider;
    return typeof provider === "string" ? provider : null;
}
function getUserDisplayName(user) {
    const fullName = user.user_metadata.full_name;
    const name = user.user_metadata.name;
    if (typeof fullName === "string" && fullName.trim()) {
        return fullName.trim();
    }
    if (typeof name === "string" && name.trim()) {
        return name.trim();
    }
    return user.email ?? "WorldCup player";
}
async function ensureOwnerAgent(supabase, profile) {
    const ownerAdminEmail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOwnerAdminEmail"])();
    if (!ownerAdminEmail || (profile.email ?? "").trim().toLowerCase() !== ownerAdminEmail) {
        return;
    }
    const tournament = await supabase.from("worldcup_tournaments").select("id").eq("slug", "fifa-world-cup-2026").maybeSingle();
    if (tournament.error || !tournament.data) {
        return;
    }
    const agent = await supabase.from("worldcup_agents").upsert({
        tournament_id: tournament.data.id,
        user_id: profile.user_id,
        email: profile.email,
        display_name: profile.display_name,
        active: true,
        created_by: "owner-bootstrap",
        updated_at: new Date().toISOString()
    }, {
        onConflict: "tournament_id,user_id"
    });
    if (agent.error) {
        return;
    }
    await supabase.rpc("worldcup_bootstrap_owner_agent_inventory", {
        p_owner_email: ownerAdminEmail,
        p_quantity: 100,
        p_created_by: "owner-bootstrap"
    });
}
async function getOrCreateReferralProfile(supabase, user) {
    const existing = await supabase.from("worldcup_referral_profiles").select(referralProfileSelect).eq("user_id", user.id).maybeSingle();
    if (existing.error) {
        throw existing.error;
    }
    if (existing.data) {
        const displayName = getUserDisplayName(user);
        const email = user.email ?? null;
        const profile = {
            ...existing.data,
            display_name: displayName,
            email
        };
        if (existing.data.display_name !== displayName || existing.data.email !== email) {
            await supabase.from("worldcup_referral_profiles").update({
                display_name: displayName,
                email,
                updated_at: new Date().toISOString()
            }).eq("user_id", user.id);
        }
        await ensureOwnerAgent(supabase, profile);
        return profile;
    }
    const displayName = getUserDisplayName(user);
    const email = user.email ?? null;
    for(let attempt = 0; attempt < 5; attempt += 1){
        const referralCode = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(5).toString("hex").toUpperCase();
        const created = await supabase.from("worldcup_referral_profiles").insert({
            user_id: user.id,
            referral_code: referralCode,
            display_name: displayName,
            email
        }).select(referralProfileSelect).single();
        if (!created.error && created.data) {
            const profile = created.data;
            await ensureOwnerAgent(supabase, profile);
            return profile;
        }
        if (created.error?.code !== "23505") {
            throw created.error;
        }
    }
    throw new Error("Could not create a referral code.");
}
}),
"[project]/src/app/api/me/standing/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/request.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prize$2d$pool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prize-pool.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$referrals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/referrals.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
;
;
;
;
;
function formatLeaderboardPreview(row) {
    return {
        displayName: row.display_name ?? "Player",
        totalPoints: Number(row.total_points ?? 0),
        rank: row.leaderboard_rank,
        teams: (row.teams ?? []).map((team)=>({
                name: team.team_name ?? "",
                points: Number(team.total_points ?? 0)
            }))
    };
}
function formatAgentCodeRecord(row) {
    return row?.assigned_at ? {
        code: row.code ?? "",
        kind: row.kind ?? "ticket",
        assignedAt: row.assigned_at
    } : null;
}
function round2(value) {
    return Math.round(value * 100) / 100;
}
async function GET(request) {
    const limited = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["enforceRateLimit"])(request, "me-standing", {
        limit: 30,
        windowMs: 60_000
    });
    if (limited) {
        return limited;
    }
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$request$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBearerToken"])(request);
    if (!token) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsonError"])("Sign in with Google first.", 401);
    }
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServiceSupabaseClient"])();
    const userResult = await supabase.auth.getUser(token);
    if (userResult.error || !userResult.data.user) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsonError"])("Invalid session.", 401);
    }
    const user = userResult.data.user;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$referrals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthProvider"])(user) !== "google") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsonError"])("Only Google sign-in is allowed.", 403);
    }
    const tournament = await supabase.from("worldcup_tournaments").select("id,prize_pool_amount,prize_pool_fee_percent").eq("slug", "fifa-world-cup-2026").single();
    if (tournament.error || !tournament.data) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsonError"])("Tournament is not available.", 500);
    }
    const tournamentId = tournament.data.id;
    const [participantHead, myEntry, referrals, agent, topLeaderboard] = await Promise.all([
        supabase.from("worldcup_awarded_leaderboard").select("entry_id", {
            count: "exact",
            head: true
        }).eq("tournament_id", tournamentId),
        supabase.from("worldcup_entries").select("id,display_name,status").eq("tournament_id", tournamentId).eq("user_id", user.id).order("locked_at", {
            ascending: false,
            nullsFirst: false
        }).limit(1).maybeSingle(),
        supabase.from("worldcup_referrals").select("entry_id,referral_fee_percent,accepted_at").eq("tournament_id", tournamentId).eq("inviter_user_id", user.id),
        supabase.from("worldcup_agents").select("paid_tickets,commission_tickets,active").eq("tournament_id", tournamentId).eq("user_id", user.id).maybeSingle(),
        supabase.from("worldcup_awarded_leaderboard").select("entry_id,display_name,total_points,teams,leaderboard_rank").eq("tournament_id", tournamentId).order("leaderboard_rank", {
            ascending: true
        }).limit(10)
    ]);
    if (participantHead.error || topLeaderboard.error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsonError"])("Could not load the leaderboard.", 500);
    }
    const participants = participantHead.count ?? 0;
    const netPrizePool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prize$2d$pool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateNetPrizePool"])(tournament.data.prize_pool_amount, tournament.data.prize_pool_fee_percent);
    const paidPlaces = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prize$2d$pool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculatePaidPlaces"])(participants);
    const payoutPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prize$2d$pool$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculatePayoutPlan"])(netPrizePool, paidPlaces);
    const shareForRank = (rank)=>rank && rank <= paidPlaces ? payoutPlan[rank - 1]?.amount ?? 0 : null;
    // Collect the entry ids we need leaderboard rows for (mine + referrals').
    const referralRows = referrals.data ?? [];
    const entryIds = new Set();
    if (myEntry.data?.id) {
        entryIds.add(myEntry.data.id);
    }
    for (const referral of referralRows){
        if (referral.entry_id) {
            entryIds.add(referral.entry_id);
        }
    }
    const leaderboardById = new Map();
    if (entryIds.size > 0) {
        const rows = await supabase.from("worldcup_awarded_leaderboard").select("entry_id,display_name,total_points,teams,leaderboard_rank").eq("tournament_id", tournamentId).in("entry_id", Array.from(entryIds));
        if (rows.error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsonError"])("Could not load standings.", 500);
        }
        for (const row of rows.data ?? []){
            leaderboardById.set(row.entry_id, row);
        }
    }
    const myRow = myEntry.data?.id ? leaderboardById.get(myEntry.data.id) : undefined;
    const myRank = myRow?.leaderboard_rank ?? null;
    const myShareAmount = shareForRank(myRank);
    const me = myEntry.data ? {
        hasEntry: true,
        locked: myEntry.data.status === "locked",
        displayName: myRow?.display_name ?? myEntry.data.display_name,
        totalPoints: myRow ? Number(myRow.total_points) : 0,
        rank: myRank,
        teams: (myRow?.teams ?? []).map((team)=>({
                name: team.team_name ?? "",
                points: Number(team.total_points ?? 0)
            })),
        inPaidPlaces: myShareAmount != null,
        share: myShareAmount != null ? round2(myShareAmount) : null
    } : {
        hasEntry: false
    };
    const referralStandings = referralRows.map((referral)=>{
        const row = referral.entry_id ? leaderboardById.get(referral.entry_id) : undefined;
        const rank = row?.leaderboard_rank ?? null;
        const share = shareForRank(rank);
        const feePercent = Number(referral.referral_fee_percent ?? 0);
        return {
            displayName: row?.display_name ?? "Referred player",
            totalPoints: row ? Number(row.total_points) : 0,
            rank,
            locked: Boolean(row),
            inPaidPlaces: share != null,
            share: share != null ? round2(share) : null,
            feePercent,
            myCut: share != null ? round2(share * feePercent / 100) : null
        };
    }).sort((a, b)=>{
        if (a.rank == null) return 1;
        if (b.rank == null) return -1;
        return a.rank - b.rank;
    });
    const referralCutTotal = round2(referralStandings.reduce((sum, referral)=>sum + (referral.myCut ?? 0), 0));
    let agentBlock = null;
    if (agent.data && agent.data.active) {
        const paid = Number(agent.data.paid_tickets ?? 0);
        const [available, lastAssigned, lastPaid, lastCommission] = await Promise.all([
            supabase.from("worldcup_ticket_codes").select("code,kind,assigned_at", {
                count: "exact"
            }).eq("tournament_id", tournamentId).eq("agent_user_id", user.id).eq("status", "assigned").order("assigned_at", {
                ascending: true
            }),
            supabase.from("worldcup_ticket_codes").select("code,kind,assigned_at").eq("tournament_id", tournamentId).eq("agent_user_id", user.id).not("assigned_at", "is", null).order("assigned_at", {
                ascending: false
            }).limit(1).maybeSingle(),
            supabase.from("worldcup_ticket_codes").select("code,kind,assigned_at").eq("tournament_id", tournamentId).eq("agent_user_id", user.id).eq("kind", "paid").not("assigned_at", "is", null).order("assigned_at", {
                ascending: false
            }).limit(1).maybeSingle(),
            supabase.from("worldcup_ticket_codes").select("code,kind,assigned_at").eq("tournament_id", tournamentId).eq("agent_user_id", user.id).eq("kind", "commission").not("assigned_at", "is", null).order("assigned_at", {
                ascending: false
            }).limit(1).maybeSingle()
        ]);
        if (available.error || lastAssigned.error || lastPaid.error || lastCommission.error) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsonError"])("Could not load agent ticket records.", 500);
        }
        const nextCode = (available.data ?? [])[0];
        agentBlock = {
            isAgent: true,
            paidTickets: paid,
            commissionTickets: Number(agent.data.commission_tickets ?? 0),
            availableCodes: available.count ?? available.data?.length ?? 0,
            nextAvailableCode: nextCode?.code ? {
                code: nextCode.code,
                kind: nextCode.kind ?? "ticket"
            } : null,
            lastAssignedCode: formatAgentCodeRecord(lastAssigned.data),
            lastPaidCode: formatAgentCodeRecord(lastPaid.data),
            lastCommissionCode: formatAgentCodeRecord(lastCommission.data),
            toNextFree: 10 - paid % 10
        };
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        signedIn: true,
        me,
        tournament: {
            participants,
            paidPlaces,
            netPrizePool: round2(netPrizePool)
        },
        referrals: referralStandings,
        referralCutTotal,
        leaderboardTop: (topLeaderboard.data ?? []).map(formatLeaderboardPreview),
        agent: agentBlock
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__06a~cd4._.js.map