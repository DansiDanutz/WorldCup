import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WorldCup — Predict the Game · WorldCup26",
    template: "%s · WorldCup",
  },
  description:
    "Pick 3 teams before the FIFA World Cup 2026 and climb the leaderboard as they earn points.",
  applicationName: "WorldCup",
};

export const viewport: Viewport = {
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

