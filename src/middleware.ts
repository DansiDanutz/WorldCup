import { NextResponse, type NextRequest } from "next/server";

import { CANONICAL_HOST, shouldRedirectToCanonicalHost } from "@/lib/canonical-url";

export function middleware(request: NextRequest) {
  // Preview deployments are served on generated *.vercel.app hostnames. Skip the
  // canonical-host redirect there so each branch's preview stays viewable;
  // production still canonicalizes to worldcup26.world.
  if (process.env.VERCEL_ENV === "preview") {
    return NextResponse.next();
  }

  const host = request.headers.get("host");

  if (!shouldRedirectToCanonicalHost(host)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = "https";
  url.hostname = CANONICAL_HOST;
  url.port = "";

  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|icon.svg|brand-mark.svg|logo-lockup.svg).*)"],
};

