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
"[project]/src/lib/economy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateWalletBalance",
    ()=>calculateWalletBalance,
    "formatLedgerAmount",
    ()=>formatLedgerAmount,
    "formatMoneyAmount",
    ()=>formatMoneyAmount,
    "normalizeLedgerAmount",
    ()=>normalizeLedgerAmount,
    "normalizeMoneyAmount",
    ()=>normalizeMoneyAmount
]);
function normalizeMoneyAmount(value) {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) {
        return 0;
    }
    return Math.round(amount * 100) / 100;
}
function normalizeLedgerAmount(value) {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) {
        return 0;
    }
    return Math.round(amount * 1e8) / 1e8;
}
function formatMoneyAmount(value) {
    return new Intl.NumberFormat("en", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(normalizeMoneyAmount(value));
}
function formatLedgerAmount(value) {
    return new Intl.NumberFormat("en", {
        maximumFractionDigits: 8,
        minimumFractionDigits: 2
    }).format(normalizeLedgerAmount(value));
}
function calculateWalletBalance(userId, transactions) {
    return transactions.reduce((balance, transaction)=>{
        const amount = normalizeLedgerAmount(transaction.amount);
        if (transaction.to_user_id === userId) {
            return balance + amount;
        }
        if (transaction.from_user_id === userId) {
            return balance - amount;
        }
        return balance;
    }, 0);
}
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
"[project]/src/lib/consent.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Consent policy for the real-money compliance gate. Bump
// CURRENT_TERMS_VERSION whenever the Terms or Privacy Policy change so users
// must re-accept the current public rules before entering.
__turbopack_context__.s([
    "CURRENT_TERMS_VERSION",
    ()=>CURRENT_TERMS_VERSION,
    "MINIMUM_AGE",
    ()=>MINIMUM_AGE,
    "isConsentCurrent",
    ()=>isConsentCurrent
]);
const CURRENT_TERMS_VERSION = "2026-06-04";
const MINIMUM_AGE = 18;
function isConsentCurrent(consent) {
    return Boolean(consent?.age_confirmed) && consent?.terms_version === CURRENT_TERMS_VERSION;
}
}),
"[project]/src/lib/launch-signoffs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APPROVAL_EVIDENCE_URL_REQUIRED_LAUNCH_SIGNOFF_KEYS",
    ()=>APPROVAL_EVIDENCE_URL_REQUIRED_LAUNCH_SIGNOFF_KEYS,
    "LAUNCH_SIGNOFF_STATUSES",
    ()=>LAUNCH_SIGNOFF_STATUSES,
    "NON_WAIVABLE_LAUNCH_SIGNOFF_KEYS",
    ()=>NON_WAIVABLE_LAUNCH_SIGNOFF_KEYS,
    "PAYMENT_LAUNCH_SIGNOFF_KEYS",
    ()=>PAYMENT_LAUNCH_SIGNOFF_KEYS,
    "REQUIRED_LAUNCH_SIGNOFFS",
    ()=>REQUIRED_LAUNCH_SIGNOFFS,
    "buildLaunchSignoffAuditContext",
    ()=>buildLaunchSignoffAuditContext,
    "formatLaunchSignoff",
    ()=>formatLaunchSignoff,
    "getCurrentLegalApprovalEvidenceNoteRequirement",
    ()=>getCurrentLegalApprovalEvidenceNoteRequirement,
    "getLaunchSignoffEvidenceGuidance",
    ()=>getLaunchSignoffEvidenceGuidance,
    "getLaunchSignoffEvidenceNoteRequirement",
    ()=>getLaunchSignoffEvidenceNoteRequirement,
    "getLaunchSignoffEvidenceUrlRequirement",
    ()=>getLaunchSignoffEvidenceUrlRequirement,
    "isApprovalEvidenceUrlRequiredLaunchSignoffKey",
    ()=>isApprovalEvidenceUrlRequiredLaunchSignoffKey,
    "isCurrentLegalApprovalEvidenceNote",
    ()=>isCurrentLegalApprovalEvidenceNote,
    "isLaunchSignoffEvidenceUrl",
    ()=>isLaunchSignoffEvidenceUrl,
    "isLaunchSignoffKey",
    ()=>isLaunchSignoffKey,
    "isNonWaivableLaunchSignoffKey",
    ()=>isNonWaivableLaunchSignoffKey,
    "isPaymentLaunchSignoffKey",
    ()=>isPaymentLaunchSignoffKey,
    "loadLaunchSignoffs",
    ()=>loadLaunchSignoffs,
    "normalizeLaunchSignoffStatus",
    ()=>normalizeLaunchSignoffStatus,
    "requiresLaunchSignoffEvidenceNote",
    ()=>requiresLaunchSignoffEvidenceNote
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$consent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/consent.ts [app-route] (ecmascript)");
;
const LAUNCH_SIGNOFF_STATUSES = [
    "pending",
    "completed",
    "waived"
];
const REQUIRED_LAUNCH_SIGNOFFS = [
    {
        key: "real_usdt_trc20_deposit_test",
        label: "Real USDT TRC20 deposit test",
        category: "payments",
        detail: "Send a small real TRC20 USDT deposit, submit the claim, verify it, and credit the wallet."
    },
    {
        key: "real_usdt_erc20_deposit_test",
        label: "Real USDT ERC20 deposit test",
        category: "payments",
        detail: "Send a small real ERC20 USDT deposit, submit the claim, verify it, and credit the wallet."
    },
    {
        key: "real_usdt_withdrawal_payout_test",
        label: "Real USDT withdrawal payout test",
        category: "payments",
        detail: "Request a small payout, approve it, send the external transfer, and record the payout hash."
    },
    {
        key: "operator_policy_review",
        label: "Operator policy review",
        category: "operations",
        detail: "Confirm country policy plus deposit and withdrawal caps are ready for launch."
    },
    {
        key: "legal_compliance_review",
        label: "Legal and compliance review",
        category: "compliance",
        detail: "Confirm Terms, Privacy, eligibility, and operational compliance are approved for production."
    }
];
const PAYMENT_LAUNCH_SIGNOFF_KEYS = [
    "real_usdt_trc20_deposit_test",
    "real_usdt_erc20_deposit_test",
    "real_usdt_withdrawal_payout_test"
];
const NON_WAIVABLE_LAUNCH_SIGNOFF_KEYS = [
    ...PAYMENT_LAUNCH_SIGNOFF_KEYS,
    "operator_policy_review",
    "legal_compliance_review"
];
const APPROVAL_EVIDENCE_URL_REQUIRED_LAUNCH_SIGNOFF_KEYS = [
    "operator_policy_review",
    "legal_compliance_review"
];
const requiredByKey = new Map(REQUIRED_LAUNCH_SIGNOFFS.map((definition)=>[
        definition.key,
        definition
    ]));
const paymentSignoffKeys = new Set(PAYMENT_LAUNCH_SIGNOFF_KEYS);
const nonWaivableSignoffKeys = new Set(NON_WAIVABLE_LAUNCH_SIGNOFF_KEYS);
const approvalEvidenceUrlRequiredSignoffKeys = new Set(APPROVAL_EVIDENCE_URL_REQUIRED_LAUNCH_SIGNOFF_KEYS);
function isLaunchSignoffKey(key) {
    return requiredByKey.has(key);
}
function isPaymentLaunchSignoffKey(key) {
    return paymentSignoffKeys.has(key);
}
function isNonWaivableLaunchSignoffKey(key) {
    return nonWaivableSignoffKeys.has(key);
}
function isApprovalEvidenceUrlRequiredLaunchSignoffKey(key) {
    return approvalEvidenceUrlRequiredSignoffKeys.has(key);
}
function normalizeLaunchSignoffStatus(value) {
    return LAUNCH_SIGNOFF_STATUSES.includes(value) ? value : "pending";
}
function requiresLaunchSignoffEvidenceNote(status) {
    return status === "completed" || status === "waived";
}
function getLaunchSignoffEvidenceNoteRequirement() {
    return "Evidence note is required for completed or waived launch sign-offs.";
}
function isLaunchSignoffEvidenceUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" && Boolean(url.hostname);
    } catch  {
        return false;
    }
}
function getLaunchSignoffEvidenceUrlRequirement() {
    return "Evidence URL must be a valid https:// URL.";
}
function isCurrentLegalApprovalEvidenceNote(evidenceNote) {
    return evidenceNote.includes(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$consent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CURRENT_TERMS_VERSION"]);
}
function getCurrentLegalApprovalEvidenceNoteRequirement() {
    return `Evidence note must include Terms/Privacy version ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$consent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CURRENT_TERMS_VERSION"]}.`;
}
function getLaunchSignoffEvidenceGuidance(key) {
    if (key === "real_usdt_trc20_deposit_test") {
        return {
            evidenceTarget: "deposit_claims",
            evidenceActionLabel: "Open Deposit Claims",
            evidenceRequirement: "A credited TRC20 deposit claim linked to a KuCoin-verified wallet deposit, with claim id, deposit id, tx hash, credited amount, and credited time."
        };
    }
    if (key === "real_usdt_erc20_deposit_test") {
        return {
            evidenceTarget: "deposit_claims",
            evidenceActionLabel: "Open Deposit Claims",
            evidenceRequirement: "A credited ERC20 deposit claim linked to a KuCoin-verified wallet deposit, with claim id, deposit id, tx hash, credited amount, and credited time."
        };
    }
    if (key === "real_usdt_withdrawal_payout_test") {
        return {
            evidenceTarget: "withdrawal_requests",
            evidenceActionLabel: "Open Withdrawal Requests",
            evidenceRequirement: "A paid withdrawal request marked as real launch payout evidence, with withdrawal id, wallet debit id, payout tx hash, amount, and paid time."
        };
    }
    if (key === "operator_policy_review") {
        return {
            evidenceTarget: "operator_policy",
            evidenceActionLabel: "Open Operator Policy",
            evidenceRequirement: "Saved operator policy with country rules, deposit cap, withdrawal cap, reviewer note, and HTTPS approval evidence URL."
        };
    }
    return {
        evidenceTarget: "legal_review",
        evidenceActionLabel: "Open Legal Evidence",
        evidenceRequirement: `Manual legal/compliance approval for Terms/Privacy version ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$consent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CURRENT_TERMS_VERSION"]}, with HTTPS evidence URL and a note that includes that version.`
    };
}
function buildLaunchSignoffAuditContext({ key, status, via, capturedAt, paymentEvidenceStatus, operatorPolicy }) {
    const raw = {
        via,
        capturedAt
    };
    if (status !== "completed") {
        return raw;
    }
    if (paymentEvidenceStatus) {
        raw.launchEvidence = {
            kind: "payment",
            status: paymentEvidenceStatus.evidenceStatus
        };
    }
    if (key === "operator_policy_review" && operatorPolicy) {
        raw.launchEvidence = {
            kind: "operator_policy",
            policy: {
                allowedCountries: operatorPolicy.allowedCountries,
                blockedCountries: operatorPolicy.blockedCountries,
                maxDepositClaimAmount: operatorPolicy.maxDepositClaimAmount,
                maxDailyDepositClaimAmount: operatorPolicy.maxDailyDepositClaimAmount,
                maxWithdrawalRequestAmount: operatorPolicy.maxWithdrawalRequestAmount,
                maxDailyWithdrawalRequestAmount: operatorPolicy.maxDailyWithdrawalRequestAmount,
                source: operatorPolicy.source,
                updatedAt: operatorPolicy.updatedAt,
                updatedBy: operatorPolicy.updatedBy
            }
        };
    }
    if (key === "legal_compliance_review") {
        raw.launchEvidence = {
            kind: "legal_compliance",
            termsVersion: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$consent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CURRENT_TERMS_VERSION"]
        };
    }
    return raw;
}
function formatLaunchSignoff(definition, row) {
    return {
        ...definition,
        ...getLaunchSignoffEvidenceGuidance(definition.key),
        status: normalizeLaunchSignoffStatus(row?.status),
        evidenceNote: row?.evidence_note ?? null,
        evidenceUrl: row?.evidence_url ?? null,
        updatedAt: row?.updated_at ?? null,
        updatedBy: row?.updated_by ?? "system",
        raw: row?.raw ?? {}
    };
}
async function loadLaunchSignoffs(supabase) {
    const keys = REQUIRED_LAUNCH_SIGNOFFS.map((definition)=>definition.key);
    const result = await supabase.from("worldcup_launch_signoffs").select("key,status,evidence_note,evidence_url,updated_at,updated_by,raw").in("key", keys);
    if (result.error) {
        throw result.error;
    }
    const rowsByKey = new Map((result.data ?? []).map((row)=>[
            row.key,
            row
        ]));
    return REQUIRED_LAUNCH_SIGNOFFS.map((definition)=>formatLaunchSignoff(definition, rowsByKey.get(definition.key)));
}
}),
"[project]/src/lib/deposits.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS",
    ()=>DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS,
    "KUCOIN_CHAIN",
    ()=>KUCOIN_CHAIN,
    "NETWORK_LABELS",
    ()=>NETWORK_LABELS,
    "NETWORK_SHORT_LABELS",
    ()=>NETWORK_SHORT_LABELS,
    "SUPPORTED_NETWORKS",
    ()=>SUPPORTED_NETWORKS,
    "buildFrozenSenderWalletUpdate",
    ()=>buildFrozenSenderWalletUpdate,
    "formatMaskedWalletAddress",
    ()=>formatMaskedWalletAddress,
    "getConfiguredMainDepositAddress",
    ()=>getConfiguredMainDepositAddress,
    "getConfiguredMainDepositAddresses",
    ()=>getConfiguredMainDepositAddresses,
    "getDepositClaimLimitConfig",
    ()=>getDepositClaimLimitConfig,
    "getDepositClaimLimitViolation",
    ()=>getDepositClaimLimitViolation,
    "getDepositExplorerAddressUrl",
    ()=>getDepositExplorerAddressUrl,
    "getDepositExplorerTxUrl",
    ()=>getDepositExplorerTxUrl,
    "getDepositNetworkShortLabel",
    ()=>getDepositNetworkShortLabel,
    "getSavedSenderWalletForNetwork",
    ()=>getSavedSenderWalletForNetwork,
    "getSavedSenderWalletUpdatedAtForNetwork",
    ()=>getSavedSenderWalletUpdatedAtForNetwork,
    "getSenderWalletLockMismatchMessage",
    ()=>getSenderWalletLockMismatchMessage,
    "isSupportedNetwork",
    ()=>isSupportedNetwork,
    "normalizeDepositAddress",
    ()=>normalizeDepositAddress,
    "normalizeDepositTxHash",
    ()=>normalizeDepositTxHash,
    "normalizeNetwork",
    ()=>normalizeNetwork,
    "parseDepositAmount",
    ()=>parseDepositAmount,
    "subAccountName",
    ()=>subAccountName,
    "sumActiveDepositClaimAmounts",
    ()=>sumActiveDepositClaimAmounts
]);
// Pure helpers for the USDT deposit flow (no I/O, unit-tested).
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/economy.ts [app-route] (ecmascript)");
;
const SUPPORTED_NETWORKS = [
    "trc20",
    "erc20"
];
const NETWORK_SHORT_LABELS = {
    trc20: "TRC20",
    erc20: "ERC20"
};
const NETWORK_LABELS = {
    trc20: "USDT · TRC-20 (Tron)",
    erc20: "USDT · ERC-20 (Ethereum)"
};
const KUCOIN_CHAIN = {
    trc20: "trc20",
    erc20: "eth"
};
const MAIN_DEPOSIT_ADDRESS_CONFIG = {
    trc20: {
        envKey: "KUCOIN_MAIN_USDT_TRC20_ADDRESS",
        qrCodePath: "/usdt-trc20-address-qr.svg"
    },
    erc20: {
        envKey: "KUCOIN_MAIN_USDT_ERC20_ADDRESS",
        qrCodePath: "/usdt-erc20-address-qr.svg"
    }
};
const DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS = 24;
function isSupportedNetwork(value) {
    return typeof value === "string" && SUPPORTED_NETWORKS.includes(value);
}
function normalizeNetwork(value) {
    if (typeof value !== "string") {
        return null;
    }
    const lower = value.trim().toLowerCase();
    if (isSupportedNetwork(lower)) {
        return lower;
    }
    // Accept a few friendly aliases.
    if (lower === "tron" || lower === "trx") {
        return "trc20";
    }
    if (lower === "eth" || lower === "ethereum") {
        return "erc20";
    }
    return null;
}
function parseDepositAmount(value) {
    const amount = typeof value === "string" ? parseDecimalAmountString(value) : value;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        return null;
    }
    const rounded = Math.round(amount * 1e8) / 1e8;
    return rounded > 0 ? rounded : null;
}
function parseDecimalAmountString(value) {
    const trimmed = value.trim();
    if (!/^(?:\d+(?:\.\d{1,8})?|\.\d{1,8})$/.test(trimmed)) {
        return null;
    }
    return Number(trimmed);
}
function getDepositClaimLimitConfig(env) {
    return {
        maxPerClaimAmount: parseOptionalLimitAmount(env.WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT),
        maxDailyClaimAmount: parseOptionalLimitAmount(env.WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT)
    };
}
function getDepositClaimLimitViolation(amount, rollingDailyClaimTotal, config) {
    if (config.maxPerClaimAmount !== null && amount > config.maxPerClaimAmount) {
        return `Deposit claim exceeds the per-claim limit of ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatLedgerAmount"])(config.maxPerClaimAmount)} USDT.`;
    }
    if (config.maxDailyClaimAmount !== null && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLedgerAmount"])(rollingDailyClaimTotal + amount) > config.maxDailyClaimAmount) {
        return `Deposit claim exceeds the ${DEPOSIT_CLAIM_LIMIT_WINDOW_HOURS}-hour limit of ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatLedgerAmount"])(config.maxDailyClaimAmount)} USDT.`;
    }
    return null;
}
function sumActiveDepositClaimAmounts(claims) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLedgerAmount"])(claims.reduce((total, claim)=>{
        if (claim.status === "rejected") {
            return total;
        }
        return total + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLedgerAmount"])(claim.amount);
    }, 0));
}
function parseOptionalLimitAmount(value) {
    if (!value?.trim()) {
        return null;
    }
    return parseDepositAmount(value);
}
function subAccountName(userId) {
    return `wc_${userId.replace(/-/g, "").slice(0, 20)}`;
}
function getConfiguredMainDepositAddresses(env) {
    const addresses = SUPPORTED_NETWORKS.map((network)=>{
        const value = env[MAIN_DEPOSIT_ADDRESS_CONFIG[network].envKey]?.trim();
        if (!value || value === "..." || value.toLowerCase().startsWith("replace-with-")) {
            return null;
        }
        const address = normalizeDepositAddress(network, value);
        if (!address) {
            return null;
        }
        return {
            network,
            label: NETWORK_LABELS[network],
            address,
            memo: null,
            qrCodePath: MAIN_DEPOSIT_ADDRESS_CONFIG[network].qrCodePath,
            shared: true
        };
    });
    return addresses.every(Boolean) ? addresses : [];
}
function getConfiguredMainDepositAddress(env, network) {
    return getConfiguredMainDepositAddresses(env).find((address)=>address.network === network) ?? null;
}
function normalizeDepositTxHash(network, value) {
    const normalized = value.trim().toLowerCase();
    if (network === "trc20") {
        const withoutPrefix = normalized.startsWith("0x") ? normalized.slice(2) : normalized;
        return /^[a-f0-9]{64}$/.test(withoutPrefix) ? withoutPrefix : null;
    }
    const withPrefix = normalized.startsWith("0x") ? normalized : `0x${normalized}`;
    return /^0x[a-f0-9]{64}$/.test(withPrefix) ? withPrefix : null;
}
function normalizeDepositAddress(networkValue, value) {
    const network = normalizeNetwork(networkValue);
    const normalized = value.trim();
    if (!network || !normalized) {
        return null;
    }
    if (network === "trc20") {
        return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(normalized) ? normalized : null;
    }
    return /^0x[a-fA-F0-9]{40}$/.test(normalized) ? normalized : null;
}
function getDepositNetworkShortLabel(network) {
    return NETWORK_SHORT_LABELS[network];
}
function formatMaskedWalletAddress(value) {
    const trimmed = value?.trim() ?? "";
    if (trimmed.length <= 10) {
        return trimmed;
    }
    return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}
function getSavedSenderWalletForNetwork(profile, network) {
    if (network === "trc20") {
        return profile.usdt_sender_wallet_trc20_address ?? (profile.usdt_sender_wallet_network === "trc20" ? profile.usdt_sender_wallet_address ?? null : null);
    }
    return profile.usdt_sender_wallet_erc20_address ?? (profile.usdt_sender_wallet_network === "erc20" ? profile.usdt_sender_wallet_address ?? null : null);
}
function getSavedSenderWalletUpdatedAtForNetwork(profile, network) {
    if (network === "trc20") {
        return profile.usdt_sender_wallet_trc20_updated_at ?? (profile.usdt_sender_wallet_network === "trc20" ? profile.usdt_sender_wallet_updated_at ?? null : null);
    }
    return profile.usdt_sender_wallet_erc20_updated_at ?? (profile.usdt_sender_wallet_network === "erc20" ? profile.usdt_sender_wallet_updated_at ?? null : null);
}
function getSenderWalletLockMismatchMessage(network) {
    return `Use your saved ${getDepositNetworkShortLabel(network)} sender wallet. Deposits from another wallet cannot be credited and may be lost.`;
}
function buildFrozenSenderWalletUpdate(profile, network, senderWalletAddress, now) {
    const update = {
        updated_at: now
    };
    if (network === "trc20" && !profile.usdt_sender_wallet_trc20_address) {
        update.usdt_sender_wallet_trc20_address = senderWalletAddress;
        update.usdt_sender_wallet_trc20_updated_at = now;
    }
    if (network === "erc20" && !profile.usdt_sender_wallet_erc20_address) {
        update.usdt_sender_wallet_erc20_address = senderWalletAddress;
        update.usdt_sender_wallet_erc20_updated_at = now;
    }
    if (!profile.usdt_sender_wallet_address || profile.usdt_sender_wallet_network === network) {
        update.usdt_sender_wallet_address = senderWalletAddress;
        update.usdt_sender_wallet_network = network;
        update.usdt_sender_wallet_updated_at = now;
    }
    return update;
}
function getDepositExplorerTxUrl(networkValue, value) {
    const network = normalizeNetwork(networkValue);
    if (!network) {
        return null;
    }
    const txHash = normalizeDepositTxHash(network, value);
    if (!txHash) {
        return null;
    }
    if (network === "trc20") {
        return `https://tronscan.org/#/transaction/${txHash}`;
    }
    return `https://etherscan.io/tx/${txHash}`;
}
function getDepositExplorerAddressUrl(networkValue, address) {
    const network = normalizeNetwork(networkValue);
    const normalizedAddress = address.trim();
    if (!network || !normalizedAddress) {
        return null;
    }
    if (network === "trc20") {
        return `https://tronscan.org/#/address/${encodeURIComponent(normalizedAddress)}`;
    }
    return `https://etherscan.io/address/${encodeURIComponent(normalizedAddress)}`;
}
}),
"[project]/src/lib/validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Minimal dependency-free input validation helpers for API route payloads.
// Each helper throws ValidationError on bad input; routes catch it and return
// a 400 with the message. This keeps untrusted client JSON from flowing into
// the database layer unchecked.
__turbopack_context__.s([
    "ValidationError",
    ()=>ValidationError,
    "isRecord",
    ()=>isRecord,
    "optionalInteger",
    ()=>optionalInteger,
    "optionalString",
    ()=>optionalString,
    "requireEnum",
    ()=>requireEnum,
    "requireFiniteNumber",
    ()=>requireFiniteNumber,
    "requireInteger",
    ()=>requireInteger,
    "requireNonNegativeAmount",
    ()=>requireNonNegativeAmount,
    "requireObject",
    ()=>requireObject,
    "requirePositiveAmount",
    ()=>requirePositiveAmount,
    "requireString",
    ()=>requireString,
    "requireStringArray",
    ()=>requireStringArray
]);
class ValidationError extends Error {
    constructor(message){
        super(message);
        this.name = "ValidationError";
    }
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function requireObject(value) {
    if (!isRecord(value)) {
        throw new ValidationError("Request body must be a JSON object.");
    }
    return value;
}
function requireString(value, field, options = {}) {
    if (typeof value !== "string") {
        throw new ValidationError(`${field} must be a string.`);
    }
    const trimmed = value.trim();
    const { min = 1, max = 200 } = options;
    if (trimmed.length < min) {
        throw new ValidationError(`${field} is required.`);
    }
    if (trimmed.length > max) {
        throw new ValidationError(`${field} must be at most ${max} characters.`);
    }
    return trimmed;
}
function optionalString(value, field, max = 200) {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    return requireString(value, field, {
        min: 1,
        max
    });
}
function requireFiniteNumber(value, field) {
    const parsed = typeof value === "string" ? Number(value) : value;
    if (typeof parsed !== "number" || !Number.isFinite(parsed)) {
        throw new ValidationError(`${field} must be a number.`);
    }
    return parsed;
}
function requireNonNegativeAmount(value, field) {
    const parsed = requireFiniteNumber(value, field);
    if (parsed < 0) {
        throw new ValidationError(`${field} must be zero or higher.`);
    }
    return parsed;
}
function requirePositiveAmount(value, field) {
    const parsed = requireFiniteNumber(value, field);
    if (parsed <= 0) {
        throw new ValidationError(`${field} must be greater than zero.`);
    }
    return parsed;
}
function requireInteger(value, field, options = {}) {
    const parsed = requireFiniteNumber(value, field);
    if (!Number.isInteger(parsed)) {
        throw new ValidationError(`${field} must be a whole number.`);
    }
    if (options.min !== undefined && parsed < options.min) {
        throw new ValidationError(`${field} must be at least ${options.min}.`);
    }
    if (options.max !== undefined && parsed > options.max) {
        throw new ValidationError(`${field} must be at most ${options.max}.`);
    }
    return parsed;
}
function requireEnum(value, field, allowed) {
    if (typeof value !== "string" || !allowed.includes(value)) {
        throw new ValidationError(`${field} must be one of: ${allowed.join(", ")}.`);
    }
    return value;
}
function requireStringArray(value, field, options = {}) {
    if (!Array.isArray(value) || value.some((item)=>typeof item !== "string")) {
        throw new ValidationError(`${field} must be an array of strings.`);
    }
    if (options.length !== undefined && value.length !== options.length) {
        throw new ValidationError(`${field} must contain exactly ${options.length} items.`);
    }
    return value;
}
function optionalInteger(value, field, options = {}) {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    return requireInteger(value, field, options);
}
}),
"[project]/src/lib/withdrawals.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WITHDRAWAL_LIMIT_WINDOW_HOURS",
    ()=>WITHDRAWAL_LIMIT_WINDOW_HOURS,
    "WITHDRAWAL_STATUS",
    ()=>WITHDRAWAL_STATUS,
    "getWithdrawalExplorerTxUrl",
    ()=>getWithdrawalExplorerTxUrl,
    "getWithdrawalLimitViolation",
    ()=>getWithdrawalLimitViolation,
    "getWithdrawalRequestLimitConfig",
    ()=>getWithdrawalRequestLimitConfig,
    "isValidWithdrawalAddress",
    ()=>isValidWithdrawalAddress,
    "normalizeWithdrawalNetwork",
    ()=>normalizeWithdrawalNetwork,
    "normalizeWithdrawalTxHash",
    ()=>normalizeWithdrawalTxHash,
    "parseWithdrawalAmount",
    ()=>parseWithdrawalAmount,
    "sumActiveWithdrawalRequestAmounts",
    ()=>sumActiveWithdrawalRequestAmounts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/economy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$deposits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/deposits.ts [app-route] (ecmascript)");
;
;
const WITHDRAWAL_LIMIT_WINDOW_HOURS = 24;
const WITHDRAWAL_STATUS = [
    "submitted",
    "approved",
    "rejected",
    "paid"
];
function parseWithdrawalAmount(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$deposits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDepositAmount"])(value);
}
function normalizeWithdrawalNetwork(value) {
    return typeof value === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$deposits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeNetwork"])(value) : null;
}
function normalizeWithdrawalTxHash(network, value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    if (typeof value !== "string") {
        return null;
    }
    const normalizedNetwork = normalizeWithdrawalNetwork(network);
    if (!normalizedNetwork) {
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$deposits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeDepositTxHash"])(normalizedNetwork, value);
}
function isValidWithdrawalAddress(network, address) {
    const trimmed = address.trim();
    if (network === "trc20") {
        return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed);
    }
    if (network === "erc20") {
        return /^0x[a-fA-F0-9]{40}$/.test(trimmed);
    }
    return false;
}
function getWithdrawalExplorerTxUrl(network, txHash) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$deposits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDepositExplorerTxUrl"])(network, txHash);
}
function getWithdrawalRequestLimitConfig(env) {
    return {
        maxPerRequestAmount: parseOptionalLimitAmount(env.WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT),
        maxDailyRequestAmount: parseOptionalLimitAmount(env.WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT)
    };
}
function getWithdrawalLimitViolation(amount, rollingDailyRequestTotal, config) {
    if (config.maxPerRequestAmount !== null && amount > config.maxPerRequestAmount) {
        return `Withdrawal requests are limited to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatLedgerAmount"])(config.maxPerRequestAmount)} USDT each.`;
    }
    if (config.maxDailyRequestAmount !== null && rollingDailyRequestTotal + amount > config.maxDailyRequestAmount) {
        return `Withdrawal requests are limited to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatLedgerAmount"])(config.maxDailyRequestAmount)} USDT per 24 hours.`;
    }
    return null;
}
function sumActiveWithdrawalRequestAmounts(rows) {
    return rows.reduce((total, row)=>{
        if (row.status === "rejected") {
            return total;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLedgerAmount"])(total + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeLedgerAmount"])(row.amount));
    }, 0);
}
function parseOptionalLimitAmount(value) {
    if (!value || value.trim() === "") {
        return null;
    }
    return parseWithdrawalAmount(value);
}
}),
"[project]/src/lib/operator-policy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatOperatorPolicy",
    ()=>formatOperatorPolicy,
    "getDepositLimitConfigFromPolicy",
    ()=>getDepositLimitConfigFromPolicy,
    "getEnvironmentOperatorPolicy",
    ()=>getEnvironmentOperatorPolicy,
    "getOperatorPolicyLaunchReadiness",
    ()=>getOperatorPolicyLaunchReadiness,
    "getOperatorPolicyPaidActionGate",
    ()=>getOperatorPolicyPaidActionGate,
    "getPolicyGeoEnv",
    ()=>getPolicyGeoEnv,
    "getWithdrawalLimitConfigFromPolicy",
    ()=>getWithdrawalLimitConfigFromPolicy,
    "loadOperatorPolicy",
    ()=>loadOperatorPolicy,
    "normalizeOperatorPolicyInput",
    ()=>normalizeOperatorPolicyInput,
    "validateOperatorPolicyInput",
    ()=>validateOperatorPolicyInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$deposits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/deposits.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$eligibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/geo-eligibility.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$withdrawals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/withdrawals.ts [app-route] (ecmascript)");
;
;
;
;
function getEnvironmentOperatorPolicy(env = process.env) {
    const depositLimits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$deposits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDepositClaimLimitConfig"])(env);
    const withdrawalLimits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$withdrawals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWithdrawalRequestLimitConfig"])(env);
    return {
        allowedCountries: Array.from((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$eligibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseCountryList"])(env.WORLDCUP_ALLOWED_COUNTRIES)).sort(),
        blockedCountries: Array.from((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$geo$2d$eligibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseCountryList"])(env.WORLDCUP_BLOCKED_COUNTRIES)).sort(),
        maxDepositClaimAmount: depositLimits.maxPerClaimAmount,
        maxDailyDepositClaimAmount: depositLimits.maxDailyClaimAmount,
        maxWithdrawalRequestAmount: withdrawalLimits.maxPerRequestAmount,
        maxDailyWithdrawalRequestAmount: withdrawalLimits.maxDailyRequestAmount,
        updatedAt: null,
        updatedBy: null,
        source: "environment"
    };
}
async function loadOperatorPolicy(supabase, env = process.env) {
    const fallback = getEnvironmentOperatorPolicy(env);
    const result = await supabase.from("worldcup_operator_policy").select("allowed_countries,blocked_countries,max_deposit_claim_amount,max_daily_deposit_claim_amount,max_withdrawal_request_amount,max_daily_withdrawal_request_amount,updated_at,updated_by").eq("singleton_id", true).maybeSingle();
    if (result.error || !result.data) {
        return fallback;
    }
    return normalizeOperatorPolicyRow(result.data, fallback);
}
function normalizeOperatorPolicyInput(input) {
    return {
        allowedCountries: normalizeCountryCodes(input.allowedCountries),
        blockedCountries: normalizeCountryCodes(input.blockedCountries),
        maxDepositClaimAmount: parseOptionalPolicyAmount(input.maxDepositClaimAmount),
        maxDailyDepositClaimAmount: parseOptionalPolicyAmount(input.maxDailyDepositClaimAmount),
        maxWithdrawalRequestAmount: parseOptionalPolicyAmount(input.maxWithdrawalRequestAmount),
        maxDailyWithdrawalRequestAmount: parseOptionalPolicyAmount(input.maxDailyWithdrawalRequestAmount)
    };
}
function validateOperatorPolicyInput(input) {
    const allowedCountries = parsePolicyCountryCodes(input.allowedCountries, "Allowed countries", true);
    const blockedCountries = parsePolicyCountryCodes(input.blockedCountries, "Blocked countries", true);
    const overlap = allowedCountries.filter((country)=>blockedCountries.includes(country));
    if (overlap.length > 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"](`Allowed and blocked countries cannot overlap: ${overlap.join(", ")}.`);
    }
    return {
        allowedCountries,
        blockedCountries,
        maxDepositClaimAmount: parsePolicyAmountForAdmin(input.maxDepositClaimAmount, "Max deposit claim"),
        maxDailyDepositClaimAmount: parsePolicyAmountForAdmin(input.maxDailyDepositClaimAmount, "Daily deposit cap"),
        maxWithdrawalRequestAmount: parsePolicyAmountForAdmin(input.maxWithdrawalRequestAmount, "Max withdrawal request"),
        maxDailyWithdrawalRequestAmount: parsePolicyAmountForAdmin(input.maxDailyWithdrawalRequestAmount, "Daily withdrawal cap")
    };
}
function getPolicyGeoEnv(policy) {
    return {
        WORLDCUP_ALLOWED_COUNTRIES: policy.allowedCountries.join(","),
        WORLDCUP_BLOCKED_COUNTRIES: policy.blockedCountries.join(",")
    };
}
function getDepositLimitConfigFromPolicy(policy) {
    return {
        maxPerClaimAmount: policy.maxDepositClaimAmount,
        maxDailyClaimAmount: policy.maxDailyDepositClaimAmount
    };
}
function getWithdrawalLimitConfigFromPolicy(policy) {
    return {
        maxPerRequestAmount: policy.maxWithdrawalRequestAmount,
        maxDailyRequestAmount: policy.maxDailyWithdrawalRequestAmount
    };
}
function getOperatorPolicyLaunchReadiness(policy) {
    const missing = [];
    if (policy.allowedCountries.length === 0 && policy.blockedCountries.length === 0) {
        missing.push("paid-action country policy");
    }
    if (policy.maxDepositClaimAmount === null && policy.maxDailyDepositClaimAmount === null) {
        missing.push("deposit claim cap");
    }
    if (policy.maxWithdrawalRequestAmount === null && policy.maxDailyWithdrawalRequestAmount === null) {
        missing.push("withdrawal request cap");
    }
    return {
        ready: missing.length === 0,
        missing
    };
}
function getOperatorPolicyPaidActionGate(policy, action) {
    const missing = getOperatorPolicyPaidActionMissing(policy, action);
    return {
        allowed: missing.length === 0,
        missing,
        message: missing.length === 0 ? null : `${getPaidActionLabel(action)} are paused until ${formatMissingLaunchGateItems(missing)} configured in Operator policy.`
    };
}
function getOperatorPolicyPaidActionMissing(policy, action) {
    const missing = [];
    if (policy.allowedCountries.length === 0 && policy.blockedCountries.length === 0) {
        missing.push("paid-action country policy");
    }
    if (action === "deposit" && policy.maxDepositClaimAmount === null && policy.maxDailyDepositClaimAmount === null) {
        missing.push("deposit claim cap");
    }
    if (action === "withdrawal" && policy.maxWithdrawalRequestAmount === null && policy.maxDailyWithdrawalRequestAmount === null) {
        missing.push("withdrawal request cap");
    }
    return missing;
}
function getPaidActionLabel(action) {
    if (action === "deposit") {
        return "USDT deposits";
    }
    if (action === "withdrawal") {
        return "Withdrawal requests";
    }
    if (action === "ticket") {
        return "Ticket purchases";
    }
    return "Entry locking";
}
function formatMissingLaunchGateItems(items) {
    if (items.length === 1) {
        return `${items[0]} is`;
    }
    return `${items.slice(0, -1).join(", ")} and ${items.at(-1)} are`;
}
function formatOperatorPolicy(policy) {
    return {
        allowedCountries: policy.allowedCountries,
        blockedCountries: policy.blockedCountries,
        maxDepositClaimAmount: formatPolicyAmount(policy.maxDepositClaimAmount),
        maxDailyDepositClaimAmount: formatPolicyAmount(policy.maxDailyDepositClaimAmount),
        maxWithdrawalRequestAmount: formatPolicyAmount(policy.maxWithdrawalRequestAmount),
        maxDailyWithdrawalRequestAmount: formatPolicyAmount(policy.maxDailyWithdrawalRequestAmount),
        updatedAt: policy.updatedAt,
        updatedBy: policy.updatedBy,
        source: policy.source
    };
}
function normalizeOperatorPolicyRow(row, fallback) {
    return {
        allowedCountries: normalizeCountryCodes(row.allowed_countries).length ? normalizeCountryCodes(row.allowed_countries) : fallback.allowedCountries,
        blockedCountries: normalizeCountryCodes(row.blocked_countries).length ? normalizeCountryCodes(row.blocked_countries) : fallback.blockedCountries,
        maxDepositClaimAmount: parseOptionalPolicyAmount(row.max_deposit_claim_amount) ?? fallback.maxDepositClaimAmount,
        maxDailyDepositClaimAmount: parseOptionalPolicyAmount(row.max_daily_deposit_claim_amount) ?? fallback.maxDailyDepositClaimAmount,
        maxWithdrawalRequestAmount: parseOptionalPolicyAmount(row.max_withdrawal_request_amount) ?? fallback.maxWithdrawalRequestAmount,
        maxDailyWithdrawalRequestAmount: parseOptionalPolicyAmount(row.max_daily_withdrawal_request_amount) ?? fallback.maxDailyWithdrawalRequestAmount,
        updatedAt: row.updated_at,
        updatedBy: row.updated_by,
        source: "database"
    };
}
function normalizeCountryCodes(value) {
    return parsePolicyCountryCodes(value, "Country codes", false);
}
function parsePolicyCountryCodes(value, field, strict) {
    const rawValues = getPolicyCountryRawValues(value, field, strict);
    const codes = [];
    const invalid = [];
    for (const rawValue of rawValues){
        const country = rawValue.trim().toUpperCase();
        if (!country) {
            continue;
        }
        if (/^[A-Z]{2}$/.test(country)) {
            codes.push(country);
        } else if (strict) {
            invalid.push(rawValue.trim());
        }
    }
    if (invalid.length > 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"](`${field} must use two-letter ISO country codes. Invalid: ${invalid.join(", ")}.`);
    }
    return Array.from(new Set(codes)).sort();
}
function getPolicyCountryRawValues(value, field, strict) {
    if (value === undefined || value === null || value === "") {
        return [];
    }
    if (Array.isArray(value)) {
        if (strict && value.some((country)=>typeof country !== "string")) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"](`${field} must be a comma-separated string or array of strings.`);
        }
        return value.filter((country)=>typeof country === "string");
    }
    if (typeof value === "string") {
        return value.split(",");
    }
    if (strict) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"](`${field} must be a comma-separated string or array of strings.`);
    }
    return [];
}
function parsePolicyAmountForAdmin(value, field) {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    const text = typeof value === "number" ? String(value) : String(value).trim();
    if (!/^(?:\d+|\d+\.\d{1,8}|\.\d{1,8})$/.test(text)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"](`${field} must be a USDT amount with up to 8 decimal places.`);
    }
    const parsed = Number(text);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ValidationError"](`${field} must be greater than zero.`);
    }
    return Math.round(parsed * 1e8) / 1e8;
}
function parseOptionalPolicyAmount(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    const text = typeof value === "number" ? String(value) : String(value).trim();
    if (!/^(?:\d+|\d+\.\d{1,8}|\.\d{1,8})$/.test(text)) {
        return null;
    }
    const parsed = Number(text);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }
    return Math.round(parsed * 1e8) / 1e8;
}
function formatPolicyAmount(value) {
    return value === null ? null : value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}
}),
"[project]/src/lib/launch-signoff-evidence.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "attachLaunchSignoffEvidenceStatuses",
    ()=>attachLaunchSignoffEvidenceStatuses,
    "getLaunchSignoffEvidenceStatus",
    ()=>getLaunchSignoffEvidenceStatus,
    "getVerifiedDepositEvidenceStatus",
    ()=>getVerifiedDepositEvidenceStatus,
    "getVerifiedWithdrawalEvidenceStatus",
    ()=>getVerifiedWithdrawalEvidenceStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/launch-signoffs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$consent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/consent.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/operator-policy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$withdrawals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/withdrawals.ts [app-route] (ecmascript)");
;
;
;
;
const DEPOSIT_PAYMENT_SIGNOFFS = {
    real_usdt_trc20_deposit_test: {
        network: "trc20",
        label: "TRC20 deposit"
    },
    real_usdt_erc20_deposit_test: {
        network: "erc20",
        label: "ERC20 deposit"
    }
};
const WITHDRAWAL_PAYMENT_SIGNOFF_KEY = "real_usdt_withdrawal_payout_test";
async function attachLaunchSignoffEvidenceStatuses(supabase, signoffs) {
    const statuses = await Promise.all(signoffs.map((signoff)=>getLaunchSignoffEvidenceStatus(supabase, signoff)));
    return signoffs.map((signoff, index)=>({
            ...signoff,
            ...statuses[index]
        }));
}
async function getLaunchSignoffEvidenceStatus(supabase, signoff) {
    const evidenceNoteStatus = getMissingEvidenceNoteStatus(signoff);
    const evidenceUrlStatus = getInvalidEvidenceUrlStatus(signoff);
    const depositRequirement = DEPOSIT_PAYMENT_SIGNOFFS[signoff.key];
    if (evidenceUrlStatus) {
        return evidenceUrlStatus;
    }
    if (depositRequirement) {
        if (evidenceNoteStatus) {
            return evidenceNoteStatus;
        }
        return getDepositEvidenceStatus(supabase, depositRequirement.network, depositRequirement.label);
    }
    if (signoff.key === WITHDRAWAL_PAYMENT_SIGNOFF_KEY) {
        if (evidenceNoteStatus) {
            return evidenceNoteStatus;
        }
        return getWithdrawalEvidenceStatus(supabase);
    }
    if (signoff.key === "operator_policy_review") {
        const policyReadiness = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyLaunchReadiness"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadOperatorPolicy"])(supabase));
        if (signoff.status === "completed" && !signoff.evidenceUrl) {
            return {
                evidenceReady: false,
                evidenceStatus: "Operator approval evidence URL must be recorded."
            };
        }
        if (!policyReadiness.ready) {
            return {
                evidenceReady: false,
                evidenceStatus: `Operator policy is missing ${policyReadiness.missing.join(", ")}.`
            };
        }
        if (evidenceNoteStatus) {
            return evidenceNoteStatus;
        }
        return {
            evidenceReady: true,
            evidenceStatus: signoff.status === "completed" ? "Operator policy launch gate and approval evidence URL are ready." : "Operator policy launch gate is ready."
        };
    }
    if (signoff.key === "legal_compliance_review") {
        if (signoff.status === "completed" && !signoff.evidenceUrl) {
            return {
                evidenceReady: false,
                evidenceStatus: `Approval evidence URL must be recorded for Terms/Privacy version ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$consent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CURRENT_TERMS_VERSION"]}.`
            };
        }
        if (signoff.status === "completed") {
            if (evidenceNoteStatus) {
                return evidenceNoteStatus;
            }
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCurrentLegalApprovalEvidenceNote"])(signoff.evidenceNote ?? "")) {
                return {
                    evidenceReady: false,
                    evidenceStatus: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCurrentLegalApprovalEvidenceNoteRequirement"])()
                };
            }
            return {
                evidenceReady: true,
                evidenceStatus: `Manual legal approval evidence note and URL are recorded for Terms/Privacy version ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$consent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CURRENT_TERMS_VERSION"]}.`
            };
        }
        return {
            evidenceReady: false,
            evidenceStatus: `Manual legal approval evidence must be recorded by an operator for Terms/Privacy version ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$consent$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CURRENT_TERMS_VERSION"]}.`
        };
    }
    if (signoff.status === "completed" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isApprovalEvidenceUrlRequiredLaunchSignoffKey"])(signoff.key) && !signoff.evidenceUrl) {
        return {
            evidenceReady: false,
            evidenceStatus: "Approval evidence URL must be recorded."
        };
    }
    if (evidenceNoteStatus) {
        return evidenceNoteStatus;
    }
    if (signoff.status === "completed" || signoff.status === "waived") {
        return {
            evidenceReady: true,
            evidenceStatus: "Manual approval evidence note and URL are recorded."
        };
    }
    return {
        evidenceReady: false,
        evidenceStatus: "Manual approval evidence must be recorded by an operator."
    };
}
function getMissingEvidenceNoteStatus(signoff) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requiresLaunchSignoffEvidenceNote"])(signoff.status) || signoff.evidenceNote?.trim()) {
        return null;
    }
    return {
        evidenceReady: false,
        evidenceStatus: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLaunchSignoffEvidenceNoteRequirement"])()
    };
}
function getInvalidEvidenceUrlStatus(signoff) {
    if (!signoff.evidenceUrl || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLaunchSignoffEvidenceUrl"])(signoff.evidenceUrl)) {
        return null;
    }
    return {
        evidenceReady: false,
        evidenceStatus: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLaunchSignoffEvidenceUrlRequirement"])()
    };
}
async function getVerifiedDepositEvidenceStatus(supabase, network, label) {
    const claims = await supabase.from("worldcup_deposit_claims").select("id,amount,currency,tx_hash,credited_at,worldcup_deposit_id").eq("network", network).eq("status", "credited").not("credited_at", "is", null).not("worldcup_deposit_id", "is", null).neq("tx_hash", "").order("credited_at", {
        ascending: false
    }).limit(50);
    if (claims.error) {
        return {
            evidenceReady: false,
            evidenceStatus: `Could not verify ${label} sign-off evidence.`
        };
    }
    const depositIds = Array.from(new Set((claims.data ?? []).map((claim)=>claim.worldcup_deposit_id).filter((id)=>Boolean(id))));
    if (depositIds.length === 0) {
        return {
            evidenceReady: false,
            evidenceStatus: `No credited ${network.toUpperCase()} deposit claim linked to a wallet deposit exists yet.`
        };
    }
    const proof = await supabase.from("worldcup_deposits").select("id,amount,currency,credited_at,external_id,raw").in("id", depositIds).eq("provider", "kucoin").eq("status", "credited").eq("raw->kucoinMainVerification->>status", "matched").eq("raw->kucoinMainVerification->>network", network).order("credited_at", {
        ascending: false
    }).limit(1).maybeSingle();
    if (proof.error) {
        return {
            evidenceReady: false,
            evidenceStatus: `Could not verify server-side KuCoin evidence for ${label}.`
        };
    }
    if (!proof.data) {
        return {
            evidenceReady: false,
            evidenceStatus: `A credited ${network.toUpperCase()} deposit claim exists, but its linked wallet deposit does not have server-side KuCoin verification yet.`
        };
    }
    const proofDeposit = proof.data;
    const proofClaim = (claims.data ?? []).find((claim)=>claim.worldcup_deposit_id === proofDeposit.id);
    if (!proofClaim) {
        return {
            evidenceReady: false,
            evidenceStatus: `Server-side KuCoin evidence for ${label} is missing the linked deposit claim.`
        };
    }
    const proofCurrency = String(proofDeposit.currency ?? "").toUpperCase();
    const claimCurrency = String(proofClaim.currency ?? "").toUpperCase();
    if (proofCurrency !== "USDT" || claimCurrency !== "USDT") {
        return {
            evidenceReady: false,
            evidenceStatus: `Server-side KuCoin evidence for ${label} must be denominated in USDT.`
        };
    }
    if (proofDeposit.external_id !== proofClaim.tx_hash) {
        return {
            evidenceReady: false,
            evidenceStatus: `Server-side KuCoin evidence for ${label} does not match the credited claim transaction hash.`
        };
    }
    if (proofDeposit.raw?.source !== "manual_shared_address_claim" || proofDeposit.raw?.claimId !== proofClaim.id || !amountsMatch(proofDeposit.raw?.amountCredited, proofDeposit.amount)) {
        return {
            evidenceReady: false,
            evidenceStatus: `Server-side KuCoin evidence for ${label} is missing the deposit claim audit link.`
        };
    }
    const amount = proofDeposit.amount;
    const currency = proofDeposit.currency ?? "USDT";
    const creditedAt = proofClaim.credited_at ?? proofDeposit.credited_at;
    const txHash = proofClaim.tx_hash;
    const claimPart = `claim ${proofClaim.id}`;
    const creditedPart = creditedAt ? ` credited ${creditedAt}` : "";
    return {
        evidenceReady: true,
        evidenceStatus: `Credited ${network.toUpperCase()} deposit proof ready: ${claimPart}, deposit ${proofDeposit.id}, ${amount} ${currency}, tx ${txHash}.${creditedPart}`
    };
}
function amountsMatch(left, right) {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    return Number.isFinite(leftNumber) && Number.isFinite(rightNumber) ? Math.round(leftNumber * 1e8) === Math.round(rightNumber * 1e8) : false;
}
async function getDepositEvidenceStatus(supabase, network, label) {
    return getVerifiedDepositEvidenceStatus(supabase, network, label);
}
async function getVerifiedWithdrawalEvidenceStatus(supabase) {
    const proof = await supabase.from("worldcup_withdrawal_requests").select("id,network,amount,currency,paid_at,external_tx_hash,wallet_transaction_id,raw").eq("status", "paid").not("paid_at", "is", null).not("external_tx_hash", "is", null).not("wallet_transaction_id", "is", null).neq("external_tx_hash", "").eq("raw->payoutEvidence->>launchReady", "true").eq("raw->payoutEvidence->>source", "manual_external_transfer").order("paid_at", {
        ascending: false
    }).limit(1).maybeSingle();
    if (proof.error) {
        return {
            evidenceReady: false,
            evidenceStatus: "Could not verify withdrawal payout sign-off evidence."
        };
    }
    if (!proof.data) {
        return {
            evidenceReady: false,
            evidenceStatus: "No paid withdrawal request marked as real launch payout evidence exists yet."
        };
    }
    const withdrawal = proof.data;
    const network = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$withdrawals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWithdrawalNetwork"])(withdrawal.network);
    const normalizedTxHash = network ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$withdrawals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWithdrawalTxHash"])(network, withdrawal.external_tx_hash) : null;
    if (!network) {
        return {
            evidenceReady: false,
            evidenceStatus: "Withdrawal payout evidence must use a supported USDT network."
        };
    }
    if (!normalizedTxHash || normalizedTxHash !== withdrawal.external_tx_hash) {
        return {
            evidenceReady: false,
            evidenceStatus: `Withdrawal payout evidence for ${network.toUpperCase()} must include a normalized network-valid transaction hash.`
        };
    }
    if (String(withdrawal.currency ?? "").toUpperCase() !== "USDT") {
        return {
            evidenceReady: false,
            evidenceStatus: "Withdrawal payout evidence must be denominated in USDT."
        };
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$withdrawals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseWithdrawalAmount"])(withdrawal.amount) === null) {
        return {
            evidenceReady: false,
            evidenceStatus: "Withdrawal payout evidence must include a positive USDT amount."
        };
    }
    const payoutEvidence = withdrawal.raw?.payoutEvidence && typeof withdrawal.raw.payoutEvidence === "object" ? withdrawal.raw.payoutEvidence : null;
    if (payoutEvidence?.source !== "manual_external_transfer" || typeof payoutEvidence.recordedAt !== "string" || typeof payoutEvidence.recordedBy !== "string") {
        return {
            evidenceReady: false,
            evidenceStatus: "Withdrawal payout evidence is missing the admin payout audit link."
        };
    }
    if (!payoutEvidenceMatchesWithdrawal(payoutEvidence, {
        id: withdrawal.id,
        walletTransactionId: withdrawal.wallet_transaction_id,
        network,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        externalTxHash: withdrawal.external_tx_hash
    })) {
        return {
            evidenceReady: false,
            evidenceStatus: "Withdrawal payout evidence does not match the paid withdrawal audit fields."
        };
    }
    const paidPart = withdrawal.paid_at ? ` paid ${withdrawal.paid_at}` : "";
    return {
        evidenceReady: true,
        evidenceStatus: `Paid ${network.toUpperCase()} withdrawal proof ready: withdrawal ${withdrawal.id}, wallet debit ${withdrawal.wallet_transaction_id}, ${withdrawal.amount} ${withdrawal.currency ?? "USDT"}, tx ${withdrawal.external_tx_hash}.${paidPart}`
    };
}
async function getWithdrawalEvidenceStatus(supabase) {
    return getVerifiedWithdrawalEvidenceStatus(supabase);
}
function payoutEvidenceMatchesWithdrawal(payoutEvidence, withdrawal) {
    return payoutEvidence.withdrawalId === withdrawal.id && payoutEvidence.walletTransactionId === withdrawal.walletTransactionId && payoutEvidence.network === withdrawal.network && amountsMatch(payoutEvidence.amount, withdrawal.amount) && String(payoutEvidence.currency ?? "").toUpperCase() === String(withdrawal.currency ?? "").toUpperCase() && payoutEvidence.externalTxHash === withdrawal.externalTxHash;
}
}),
"[project]/src/lib/paid-action-gates.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLaunchSignoffPaidActionGate",
    ()=>getLaunchSignoffPaidActionGate,
    "getPaidActionLaunchEvidenceProbe",
    ()=>getPaidActionLaunchEvidenceProbe,
    "getPublicPaidActionGates",
    ()=>getPublicPaidActionGates,
    "getUserPaidActionGate",
    ()=>getUserPaidActionGate,
    "getUserPaidActionGates",
    ()=>getUserPaidActionGates,
    "isPaidActionLaunchTestAdmin",
    ()=>isPaidActionLaunchTestAdmin,
    "isPaidActionLaunchTestBypassEnabled",
    ()=>isPaidActionLaunchTestBypassEnabled
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/admin-auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoff$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/launch-signoff-evidence.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/launch-signoffs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/operator-policy.ts [app-route] (ecmascript)");
;
;
;
;
const PUBLIC_LAUNCH_SIGNOFF_MESSAGE = "Paid actions are paused until launch sign-offs are completed by an operator.";
function isPaidActionLaunchTestBypassEnabled(env = process.env) {
    const value = (env.PAID_ACTION_LAUNCH_TEST_BYPASS ?? "").trim().toLowerCase();
    return value === "1" || value === "true" || value === "yes" || value === "on";
}
function isPaidActionLaunchTestAdmin(userEmail, env = process.env) {
    if (!isPaidActionLaunchTestBypassEnabled(env)) {
        return false;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAllowlistedAdminEmail"])(userEmail, env);
}
async function getLaunchSignoffPaidActionGate(supabase, options = {}) {
    if (isPaidActionLaunchTestAdmin(options.userEmail)) {
        return allowedGate();
    }
    try {
        const signoffs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoff$2d$evidence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["attachLaunchSignoffEvidenceStatuses"])(supabase, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$launch$2d$signoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadLaunchSignoffs"])(supabase));
        const missing = signoffs.filter((signoff)=>signoff.status !== "completed" || !signoff.evidenceReady).map((signoff)=>signoff.label);
        if (missing.length === 0) {
            return allowedGate();
        }
        return {
            allowed: false,
            missing,
            message: PUBLIC_LAUNCH_SIGNOFF_MESSAGE
        };
    } catch  {
        return {
            allowed: false,
            missing: [
                "launch sign-off verification"
            ],
            message: "Paid actions are paused until launch sign-offs can be verified."
        };
    }
}
async function getPublicPaidActionGates(supabase) {
    const [operatorPolicy, launchGate] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadOperatorPolicy"])(supabase),
        getLaunchSignoffPaidActionGate(supabase)
    ]);
    return {
        deposit: combinePaidActionGates((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyPaidActionGate"])(operatorPolicy, "deposit"), launchGate),
        ticket: combinePaidActionGates((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyPaidActionGate"])(operatorPolicy, "ticket"), launchGate),
        entry: combinePaidActionGates((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyPaidActionGate"])(operatorPolicy, "entry"), launchGate),
        withdrawal: combinePaidActionGates((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyPaidActionGate"])(operatorPolicy, "withdrawal"), launchGate)
    };
}
async function getPaidActionLaunchEvidenceProbe(supabase, env = process.env) {
    const adminEmails = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdminEmailAllowlist"])(env);
    const adminEvidenceEmail = adminEmails[0] ?? null;
    const [publicGates, adminGates] = await Promise.all([
        getPublicPaidActionGates(supabase),
        adminEvidenceEmail ? getUserPaidActionGates(supabase, {
            userEmail: adminEvidenceEmail
        }) : Promise.resolve(null)
    ]);
    const actionNames = [
        "deposit",
        "ticket",
        "entry",
        "withdrawal"
    ];
    const actions = Object.fromEntries(actionNames.map((action)=>{
        const publicGate = publicGates[action];
        const adminGate = adminGates?.[action] ?? {
            allowed: false,
            missing: [
                "admin email allowlist"
            ],
            message: null
        };
        return [
            action,
            {
                publicAllowed: publicGate.allowed,
                adminEvidenceAllowed: adminGate.allowed,
                publicMissing: publicGate.missing,
                adminEvidenceMissing: adminGate.missing
            }
        ];
    }));
    return {
        publicPaidActionsPaused: actionNames.some((action)=>!publicGates[action].allowed),
        adminEvidenceEmailConfigured: Boolean(adminEvidenceEmail),
        adminEvidenceActionsAllowed: actionNames.every((action)=>actions[action].adminEvidenceAllowed),
        adminEmailCount: adminEmails.length,
        actions
    };
}
async function getUserPaidActionGate(supabase, action, options = {}) {
    if (isPaidActionLaunchTestAdmin(options.userEmail)) {
        return allowedGate();
    }
    const [operatorPolicy, launchGate] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadOperatorPolicy"])(supabase),
        getLaunchSignoffPaidActionGate(supabase, options)
    ]);
    return combinePaidActionGates((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyPaidActionGate"])(operatorPolicy, action), launchGate);
}
async function getUserPaidActionGates(supabase, options = {}) {
    if (isPaidActionLaunchTestAdmin(options.userEmail)) {
        return {
            deposit: allowedGate(),
            ticket: allowedGate(),
            entry: allowedGate(),
            withdrawal: allowedGate()
        };
    }
    const [operatorPolicy, launchGate] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadOperatorPolicy"])(supabase),
        getLaunchSignoffPaidActionGate(supabase, options)
    ]);
    return {
        deposit: combinePaidActionGates((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyPaidActionGate"])(operatorPolicy, "deposit"), launchGate),
        ticket: combinePaidActionGates((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyPaidActionGate"])(operatorPolicy, "ticket"), launchGate),
        entry: combinePaidActionGates((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyPaidActionGate"])(operatorPolicy, "entry"), launchGate),
        withdrawal: combinePaidActionGates((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$operator$2d$policy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOperatorPolicyPaidActionGate"])(operatorPolicy, "withdrawal"), launchGate)
    };
}
function combinePaidActionGates(...gates) {
    const blocked = gates.filter((gate)=>!gate.allowed);
    if (blocked.length === 0) {
        return allowedGate();
    }
    return {
        allowed: false,
        missing: Array.from(new Set(blocked.flatMap((gate)=>gate.missing))),
        message: blocked.map((gate)=>gate.message).find(Boolean) ?? "Paid actions are paused."
    };
}
function allowedGate() {
    return {
        allowed: true,
        missing: [],
        message: null
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
"[project]/src/lib/worldcup-ticket-price.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_WORLDCUP_TICKET_PRICE_AMOUNT",
    ()=>DEFAULT_WORLDCUP_TICKET_PRICE_AMOUNT,
    "DEFAULT_WORLDCUP_TICKET_PRICE_USD",
    ()=>DEFAULT_WORLDCUP_TICKET_PRICE_USD,
    "normalizeWorldCupTicketPriceAmount",
    ()=>normalizeWorldCupTicketPriceAmount,
    "normalizeWorldCupTicketPriceNumber",
    ()=>normalizeWorldCupTicketPriceNumber
]);
const DEFAULT_WORLDCUP_TICKET_PRICE_AMOUNT = "50.00";
const DEFAULT_WORLDCUP_TICKET_PRICE_USD = 50;
function normalizeWorldCupTicketPriceAmount(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_WORLDCUP_TICKET_PRICE_AMOUNT;
    }
    return parsed.toFixed(2);
}
function normalizeWorldCupTicketPriceNumber(value) {
    return Number(normalizeWorldCupTicketPriceAmount(value));
}
}),
"[project]/src/app/api/referrals/me/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/economy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$paid$2d$action$2d$gates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/paid-action-gates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$referrals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/referrals.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$worldcup$2d$ticket$2d$price$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/worldcup-ticket-price.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
async function GET(request) {
    const limited = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["enforceRateLimit"])(request, "referrals", {
        limit: 30,
        windowMs: 60_000
    });
    if (limited) {
        return limited;
    }
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Sign in with Google first."
        }, {
            status: 401
        });
    }
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServiceSupabaseClient"])();
    const userResult = await supabase.auth.getUser(token);
    if (userResult.error || !userResult.data.user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid session."
        }, {
            status: 401
        });
    }
    const user = userResult.data.user;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$referrals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthProvider"])(user) !== "google") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Only Google sign-in is allowed."
        }, {
            status: 403
        });
    }
    const [profile, paidActionGates] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$referrals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOrCreateReferralProfile"])(supabase, user),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$paid$2d$action$2d$gates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserPaidActionGates"])(supabase, {
            userEmail: user.email
        })
    ]);
    const referrals = await supabase.from("worldcup_referrals").select("id,entry_id,referral_code,referral_fee_percent,accepted_at").eq("inviter_user_id", user.id).order("accepted_at", {
        ascending: false
    });
    if (referrals.error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Could not load referral activity."
        }, {
            status: 500
        });
    }
    const tournament = await supabase.from("worldcup_tournaments").select("id,ticket_price_amount").eq("slug", "fifa-world-cup-2026").single();
    if (tournament.error || !tournament.data) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Tournament is not available."
        }, {
            status: 500
        });
    }
    const [tickets, transactions, ownEntry] = await Promise.all([
        supabase.from("worldcup_tickets").select("id,consumed_at").eq("tournament_id", tournament.data.id).eq("user_id", user.id),
        supabase.from("worldcup_wallet_transactions").select("from_user_id,to_user_id,amount").eq("tournament_id", tournament.data.id).or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`),
        supabase.from("worldcup_entries").select("id,display_name,status,locked_at").eq("tournament_id", tournament.data.id).eq("user_id", user.id).order("locked_at", {
            ascending: false,
            nullsFirst: false
        }).limit(1).maybeSingle()
    ]);
    if (tickets.error || transactions.error || ownEntry.error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: tickets.error?.message ?? transactions.error?.message ?? ownEntry.error?.message ?? "Could not load account status."
        }, {
            status: 500
        });
    }
    const ownEntryTeams = ownEntry.data?.id ? await supabase.from("worldcup_entry_teams").select("team_id,pick_slot").eq("entry_id", ownEntry.data.id).order("pick_slot", {
        ascending: true
    }) : null;
    if (ownEntryTeams?.error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Could not load your locked teams."
        }, {
            status: 500
        });
    }
    const entryIds = (referrals.data ?? []).map((referral)=>referral.entry_id).filter((entryId)=>Boolean(entryId));
    const entries = entryIds.length > 0 ? await supabase.from("worldcup_entries").select("id,display_name").in("id", entryIds) : null;
    if (entries?.error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Could not load referred entries."
        }, {
            status: 500
        });
    }
    const entriesById = new Map((entries?.data ?? []).map((entry)=>[
            entry.id,
            entry.display_name ?? "Referred player"
        ]));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        referralCode: profile.referral_code,
        displayName: profile.display_name ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$referrals$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserDisplayName"])(user),
        walletBalance: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$economy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateWalletBalance"])(user.id, transactions.data ?? []).toFixed(8),
        ticketsAssigned: tickets.data?.length ?? 0,
        ticketsAvailable: (tickets.data ?? []).filter((ticket)=>!ticket.consumed_at).length,
        ticketPriceAmount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$worldcup$2d$ticket$2d$price$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeWorldCupTicketPriceAmount"])(tournament.data.ticket_price_amount),
        entry: ownEntry.data ? {
            id: ownEntry.data.id,
            status: ownEntry.data.status,
            displayName: ownEntry.data.display_name,
            teamIds: (ownEntryTeams?.data ?? []).map((team)=>team.team_id),
            lockedAt: ownEntry.data.locked_at
        } : null,
        usdtSenderWalletAddress: profile.usdt_sender_wallet_address ?? null,
        usdtSenderWalletNetwork: profile.usdt_sender_wallet_network ?? null,
        usdtSenderWalletUpdatedAt: profile.usdt_sender_wallet_updated_at ?? null,
        usdtSenderWalletTrc20Address: profile.usdt_sender_wallet_trc20_address ?? null,
        usdtSenderWalletTrc20UpdatedAt: profile.usdt_sender_wallet_trc20_updated_at ?? null,
        usdtSenderWalletErc20Address: profile.usdt_sender_wallet_erc20_address ?? null,
        usdtSenderWalletErc20UpdatedAt: profile.usdt_sender_wallet_erc20_updated_at ?? null,
        paidActionGates,
        referrals: (referrals.data ?? []).map((referral)=>({
                id: referral.id,
                entryId: referral.entry_id,
                invitedDisplayName: entriesById.get(referral.entry_id ?? "") ?? "Referred player",
                referralCode: referral.referral_code,
                feePercent: referral.referral_fee_percent,
                acceptedAt: referral.accepted_at
            }))
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0.f8izv._.js.map