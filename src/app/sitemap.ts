import type { MetadataRoute } from "next";

import { CANONICAL_ORIGIN } from "@/lib/canonical-url";

// Public, indexable routes only. Authenticated (/wallet), operational (/admin),
// and internal (/preview) routes are intentionally excluded — see robots.ts.
const ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/coefficients", priority: 0.8, changeFrequency: "weekly" },
  { path: "/schema", priority: 0.7, changeFrequency: "weekly" },
  { path: "/login", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_ORIGIN;
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
