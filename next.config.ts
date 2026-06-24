import type { NextConfig } from "next";

// Content-Security-Policy. The app loads no analytics or external fonts; the
// only embedded cross-origin resources are flag images (flagcdn.com), the
// browser Supabase client (REST over https + realtime over wss, on Supabase or
// the branded Supabase custom domain), and verified Legend watches through the
// official YouTube IFrame Player API.
// 'unsafe-inline' is required for Next's inline bootstrap/streaming scripts and
// React inline styles; the app has no XSS sink (no dangerouslySetInnerHTML/eval),
// so object-src/base-uri/frame-ancestors/form-action locks still make this a
// meaningful hardening. Applied in production only so it does not interfere with
// the eval + websocket HMR the Next dev server relies on.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://flagcdn.com",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.worldcup26.world wss://api.worldcup26.world",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
    : []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/w80/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
