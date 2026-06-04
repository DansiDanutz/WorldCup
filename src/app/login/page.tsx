import type { Metadata } from "next";

import { LoginRegister } from "@/components/login-register";
import { getPublicPaidActionGates } from "@/lib/paid-action-gates";
import { createServerReadSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join WorldCup26",
  description:
    "Use your referral invite, pick 3 teams, and climb the WorldCup26 leaderboard.",
  openGraph: {
    title: "You are invited to WorldCup26",
    description:
      "Pick 3 teams before the FIFA World Cup 2026 and climb the leaderboard with your invite.",
    url: "/login",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "You are invited to WorldCup26",
    description:
      "Use your referral invite, pick 3 teams, and climb the leaderboard.",
  },
};

export default async function LoginPage() {
  const publicPaidActionGates = await getPublicPaidActionGates(createServerReadSupabaseClient());

  return (
    <LoginRegister
      publicPaidActionGates={publicPaidActionGates}
    />
  );
}
