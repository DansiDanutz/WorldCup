import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "./cards.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://worldcup.example.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WorldCup — Predict the Game · WorldCup26",
    template: "%s · WorldCup",
  },
  description:
    "Pick 3 teams before the FIFA World Cup 2026 and climb the leaderboard as they earn points.",
  applicationName: "WorldCup",
  openGraph: {
    title: "WorldCup — Predict the Game · WorldCup26",
    description:
      "Pick 3 teams before the FIFA World Cup 2026 and climb the leaderboard as they earn points.",
    siteName: "WorldCup",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorldCup — Predict the Game · WorldCup26",
    description:
      "Pick 3 teams before the FIFA World Cup 2026 and climb the leaderboard as they earn points.",
  },
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}

