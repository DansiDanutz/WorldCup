import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { AppLaunchSplash } from "@/components/app-launch-splash";
import { AppViewTracker } from "@/components/app-view-tracker";
import { CANONICAL_ORIGIN } from "@/lib/canonical-url";

import "./globals.css";
import "./cards.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_ORIGIN;

// The tournament is over; the site is now the WorldCup26 Legend card album. These
// strings are what search results and every shared link preview show, so they
// describe the album — not the retired pick-3 game — and avoid official marks.
const SITE_TITLE = "WorldCup26 Legend Cards · Watch the story, unlock the card";
const SITE_DESCRIPTION =
  "Collect WorldCup26 Legend cards: every card unlocks when you watch its story. Free to play, just for fun, no prizes.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE,
    template: "%s · WorldCup",
  },
  description:
    SITE_DESCRIPTION,
  applicationName: "WorldCup",
  keywords: [
    "World Cup 2026",
    "WorldCup26",
    "World Cup legend cards",
    "football card collection",
    "World Cup stories",
    "forgotten World Cup legends",
    "World Cup history",
    "soccer legends",
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
    title: SITE_TITLE,
    description:
      SITE_DESCRIPTION,
    siteName: "WorldCup",
    type: "website",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description:
      SITE_DESCRIPTION,
  },
};

// Structured data for richer search/social results. Kept factual: a brand
// Organization, the WebSite, and the card album as a WebApplication.
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
      name: SITE_TITLE,
      description:
        SITE_DESCRIPTION,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "WebApplication",
      name: "WorldCup26 Legend Cards",
      url: siteUrl,
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      description:
        "A free collectible card album of World Cup legends. Each card unlocks when you watch its story. Free to play, just for fun, no prizes.",
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
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          // Static, build-time brand metadata — no user input is interpolated.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AppLaunchSplash />
        <AppViewTracker />
        {children}
      </body>
    </html>
  );
}
