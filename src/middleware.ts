import { NextResponse, type NextRequest } from "next/server";

import { CANONICAL_HOST, shouldRedirectToCanonicalHost } from "@/lib/canonical-url";

export function middleware(request: NextRequest) {
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

