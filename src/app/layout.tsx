import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { AppLaunchSplash } from "@/components/app-launch-splash";
import { CANONICAL_ORIGIN } from "@/lib/canonical-url";

import "./globals.css";
import "./cards.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_ORIGIN;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WorldCup — Predict the Game · WorldCup26",
    template: "%s · WorldCup",
  },
  description:
    "Pick 3 teams before the FIFA World Cup 2026 and climb the leaderboard as they earn points.",
  applicationName: "WorldCup",
  keywords: [
    "World Cup 2026",
    "WorldCup26",
    "football predictions",
    "soccer prediction game",
    "World Cup bracket",
    "pick 3 teams",
    "World Cup leaderboard",
    "FIFA World Cup 2026 game",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WorldCup26",
  },
  icons: {
    icon: [
      { url: "/brand-mark.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "WorldCup — Predict the Game · WorldCup26",
    description:
      "Pick 3 teams before the FIFA World Cup 2026 and climb the leaderboard as they earn points.",
    siteName: "WorldCup",
    type: "website",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorldCup — Predict the Game · WorldCup26",
    description:
      "Pick 3 teams before the FIFA World Cup 2026 and climb the leaderboard as they earn points.",
  },
};

// Structured data for richer search/social results. Kept factual: a brand
// Organization, the WebSite, and the pick-3 game as a WebApplication.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "WorldCup",
      url: siteUrl,
      logo: `${siteUrl}/logo-lockup.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "WorldCup — Predict the Game · WorldCup26",
      description:
        "Pick 3 teams before the FIFA World Cup 2026 and climb the leaderboard as they earn points.",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      name: "WorldCup26 — Predict the Game",
      url: siteUrl,
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      description:
        "A team-picking leaderboard game for the FIFA World Cup 2026: choose 3 teams, earn points after every match they play, and climb the leaderboard.",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Intentionally no maximumScale / userScalable: pinch-zoom stays enabled for
  // accessibility on small screens.
  themeColor: "#106b4f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          // Static, build-time brand metadata — no user input is interpolated.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AppLaunchSplash />
        {children}
      </body>
    </html>
  );
}
