"use client";

import { Check, CircleDollarSign, Gift, LogIn, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const referralAgreementText =
  "If I join through this referral and win a prize, I agree that 5% of my winnings are owed to the inviter.";

export function LoginRegister() {
  const [session, setSession] = useState<Session | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [referralInviter, setReferralInviter] = useState<string | null>(null);
  const [referralPercent, setReferralPercent] = useState(3);
  const [referralChecked, setReferralChecked] = useState(false);
  const [referralAccepted, setReferralAccepted] = useState(false);
  const [noReferral, setNoReferral] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const canContinueWithReferral = Boolean(referralCode && referralInviter && referralAccepted);
  const canContinue = canContinueWithReferral || noReferral;

  useEffect(() => {
    window.queueMicrotask(() => {
      const initialRef = new URLSearchParams(window.location.search).get("ref");
      const storedRef = window.localStorage.getItem("worldcup_referral_code");
      const nextReferralCode = normalizeReferralCode(initialRef ?? storedRef ?? "");

      setReferralCode(nextReferralCode);
      setReferralAccepted(
        Boolean(nextReferralCode) &&
          window.localStorage.getItem("worldcup_referral_accepted") === "true",
      );
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const normalized = normalizeReferralCode(referralCode);

    const timeout = window.setTimeout(async () => {
      setReferralChecked(false);
      setReferralInviter(null);

      if (!normalized) {
        return;
      }

      const response = await fetch(`/api/referrals/resolve?code=${encodeURIComponent(normalized)}`);
      const result = (await response.json()) as {
        valid?: boolean;
        inviterName?: string | null;
        referralPercent?: number;
      };

      setReferralChecked(true);
      setReferralInviter(result.valid ? result.inviterName ?? "another player" : null);
      setReferralPercent(result.valid ? result.referralPercent ?? 3 : 3);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [referralCode]);

  async function continueWithGoogle() {
    setError(null);
    setMessage(null);

    if (!canContinue) {
      setError("Enter a valid referral code or confirm that you do not have one.");
      return;
    }

    if (referralCode) {
      if (!referralInviter) {
        setError("This referral code is not valid yet. Check the code before continuing.");
        return;
      }

      if (!referralAccepted) {
        setError("Accept the referral agreement before creating your account.");
        return;
      }

      window.localStorage.setItem("worldcup_referral_code", referralCode);
      window.localStorage.setItem("worldcup_referral_accepted", "true");
    } else {
      window.localStorage.removeItem("worldcup_referral_code");
      window.localStorage.removeItem("worldcup_referral_accepted");
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (authError) {
      setError(getOAuthErrorMessage(authError.message));
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setMessage("Signed out.");
  }

  return (
    <main className="auth-page">
      <section className="auth-hero" aria-labelledby="auth-title">
        <Link className="auth-brand" href="/">
          <Image src="/logo-lockup.svg" alt="WorldCup" width={122} height={30} priority />
        </Link>

        <div className="auth-copy">
          <span className="status-pill">Referral entry</span>
          <h1 id="auth-title">Register with Google. Join with a referral. Build your own chain.</h1>
          <p>
            Accepting a referral gives the inviter 5% if you win, and it gives you the same 5%
            earning deal for your own future referrals. Join without a referral and your invite link
            still works, but your rate is 3%.
          </p>
        </div>

        <div className="auth-benefits" aria-label="Referral benefits">
          <div>
            <Gift size={18} />
            <span>Get your own invite code after Google login</span>
          </div>
          <div>
            <CircleDollarSign size={18} />
            <span>Accept a referral to unlock the same 5% deal</span>
          </div>
          <div>
            <Users size={18} />
            <span>Track accepted referrals inside the Invite tab</span>
          </div>
        </div>
      </section>

      <section className="auth-card" aria-label="Register or login">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Login / Register</h2>
            <p className="panel-subtitle">Referral is solved before your Google account is created.</p>
          </div>
          <LogIn size={18} color="var(--green)" />
        </div>

        <div className="entry-form">
          {session ? (
            <div className="auth-box">
              <div>
                <strong>Google account connected</strong>
                <p>{session.user.email}</p>
              </div>
              <button className="button secondary" onClick={signOut} type="button">
                Sign out
              </button>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="login-referral-code">Referral code</label>
            <input
              id="login-referral-code"
              value={referralCode}
              onChange={(event) => {
                setReferralCode(normalizeReferralCode(event.target.value));
                setNoReferral(false);
                setReferralAccepted(false);
                setError(null);
              }}
              placeholder="Enter inviter code"
              disabled={Boolean(session)}
            />
            {referralCode ? (
              <div className={`field-note ${referralInviter ? "success-note" : ""}`}>
                {referralInviter
                  ? `Referral recognized from ${referralInviter}. You keep the ${referralPercent}% referral deal for your own invites.`
                  : referralChecked
                    ? "This referral code was not found."
                    : "Checking referral code..."}
              </div>
            ) : (
              <div className="field-note">
                If someone invited you, enter their code before creating your account.
              </div>
            )}
          </div>

          <label className="check-row">
            <input
              checked={noReferral}
              disabled={Boolean(referralCode) || Boolean(session)}
              onChange={(event) => {
                setNoReferral(event.target.checked);
                setError(null);
              }}
              type="checkbox"
            />
            <span>
              I do not have a referral code, and I understand my own referral rate will be 3%
              instead of 5%.
            </span>
          </label>

          {referralCode ? (
            <label className="check-row referral-consent">
              <input
                checked={referralAccepted}
                disabled={Boolean(session) || !referralInviter}
                onChange={(event) => setReferralAccepted(event.target.checked)}
                type="checkbox"
              />
              <span>
                {referralAgreementText.replace("5%", `${referralPercent}%`)}
              </span>
            </label>
          ) : null}

          <div className="auth-loop">
            <div>
              <Check size={16} />
              <span>
                Your inviter can earn {referralCode ? referralPercent : 3}% if you win.
              </span>
            </div>
            <div>
              <Check size={16} />
              <span>
                You get the same 5% deal when you accept a referral; direct signups get 3%.
              </span>
            </div>
          </div>

          {session ? (
            <Link className="button" href="/">
              Continue to game
            </Link>
          ) : (
            <button
              className="button"
              disabled={!canContinue}
              onClick={continueWithGoogle}
              type="button"
            >
              <LogIn size={16} />
              Continue with Google
            </button>
          )}

          {message ? <div className="message">{message}</div> : null}
          {error ? <div className="message error">{error}</div> : null}
        </div>
      </section>
    </main>
  );
}

function normalizeReferralCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

function getOAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes("unsupported provider")) {
    return "Google login is not enabled in Supabase yet. Enable the Google provider in Supabase Auth before users can register.";
  }

  return message;
}
