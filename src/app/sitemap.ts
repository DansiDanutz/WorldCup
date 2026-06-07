import type { MetadataRoute } from "next";

import { CANONICAL_ORIGIN } from "@/lib/canonical-url";

const MARKETING_ROUTES = ["", "/coefficients", "/login", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return MARKETING_ROUTES.map((route, index) => ({
    url: `${CANONICAL_ORIGIN}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "hourly" : "daily",
    priority: index === 0 ? 1 : 0.6,
  }));
}
