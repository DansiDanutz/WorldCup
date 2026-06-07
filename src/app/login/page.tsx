import type { Metadata } from "next";

import { LoginRegister } from "@/components/login-register";
import type { PaidActionGates } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join WorldCup26",
  description:
    "Use your referral invite, save 3 teams free, and enter the paid leaderboard later with a ticket.",
  openGraph: {
    title: "You are invited to WorldCup26",
    description:
      "Pick 3 teams free before the FIFA World Cup 2026 and track your private points preview.",
    url: "/login",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "You are invited to WorldCup26",
    description:
      "Use your referral invite, save 3 teams free, and enter the paid leaderboard later with a ticket.",
  },
};

type LoginPageProps = {
  searchParams?: Promise<{ ref?: string | string[] }> | { ref?: string | string[] };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const refParam = Array.isArray(resolvedSearchParams.ref)
    ? resolvedSearchParams.ref[0]
    : resolvedSearchParams.ref;

  return (
    <LoginRegister
      initialReferralCode={refParam ?? null}
      publicPaidActionGates={LOGIN_ACCOUNT_SETUP_GATES}
    />
  );
}

const accountSetupGate = {
  allowed: false,
  missing: ["account setup window"],
  message: "Account setup is open until June 18, 2026.",
};

const LOGIN_ACCOUNT_SETUP_GATES: PaidActionGates = {
  deposit: accountSetupGate,
  ticket: accountSetupGate,
  entry: {
    allowed: true,
    missing: [],
    message: null,
  },
  withdrawal: {
    allowed: true,
    missing: [],
    message: null,
  },
};
