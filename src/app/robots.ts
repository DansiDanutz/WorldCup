import type { MetadataRoute } from "next";

import { CANONICAL_ORIGIN } from "@/lib/canonical-url";

// Let search engines and social crawlers index the public marketing surface
// while keeping authenticated and operational routes out of the index.
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_ORIGIN;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/wallet", "/api/", "/preview"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
