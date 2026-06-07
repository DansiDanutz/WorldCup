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
"[project]/src/app/api/admin/me/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/admin-auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/http.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-route] (ecmascript)");
;
;
;
;
async function GET(request) {
    const limited = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["enforceRateLimit"])(request, "admin", {
        limit: 90,
        windowMs: 60_000
    });
    if (limited) {
        return limited;
    }
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServiceSupabaseClient"])();
    const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$admin$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAdmin"])(request, supabase);
    if (!auth.ok) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$http$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsonError"])(auth.error, auth.status);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        admin: true,
        email: auth.adminEmail,
        via: auth.via
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0x4-mje._.js.map