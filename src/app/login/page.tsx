import type { Metadata } from "next";

import { LoginRegister } from "@/components/login-register";
import type { PaidActionGates } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join WorldCup26",
  description:
    "Sign in to save your WorldCup26 Legend cards. Watch a legend's story to unlock their card. Free to play, just for fun, no prizes.",
  openGraph: {
    title: "You are invited to WorldCup26",
    description:
      "Collect the Legends. Watch a legend's story to unlock their card. Free, no prizes.",
    url: "/login",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "You are invited to WorldCup26",
    description:
      "Sign in to save your WorldCup26 Legend cards. Watch a legend's story to unlock their card. Free to play, just for fun, no prizes.",
  },
};

type LoginPageSearchParams = {
  ref?: string | string[];
  returnTo?: string | string[];
};

type LoginPageProps = {
  searchParams?: Promise<LoginPageSearchParams> | LoginPageSearchParams;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const refParam = Array.isArray(resolvedSearchParams.ref)
    ? resolvedSearchParams.ref[0]
    : resolvedSearchParams.ref;
  const returnToParam = Array.isArray(resolvedSearchParams.returnTo)
    ? resolvedSearchParams.returnTo[0]
    : resolvedSearchParams.returnTo;

  return (
    <LoginRegister
      initialReferralCode={refParam ?? null}
      returnTo={returnToParam ?? null}
      publicPaidActionGates={LOGIN_ACCOUNT_SETUP_GATES}
    />
  );
}

const accountSetupGate = {
  allowed: false,
  missing: ["paid launch"],
  message: "Free account setup is open. Paid actions are not live yet.",
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
