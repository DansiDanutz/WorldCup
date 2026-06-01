"use client";

import { Check, CircleDollarSign, Gift, LogIn, Trophy, Users } from "lucide-react";
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
      };

      setReferralChecked(true);
      setReferralInviter(result.valid ? result.inviterName ?? "another player" : null);
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
        setError("Accept the 5% referral agreement before creating your account.");
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
      setError(authError.message);
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
          <span className="brand-mark">
            <Trophy size={20} />
          </span>
          <span>WorldCup</span>
        </Link>

        <div className="auth-copy">
          <span className="status-pill">Referral entry</span>
          <h1 id="auth-title">Register with Google. Join with a referral. Build your own chain.</h1>
          <p>
            Every player can invite friends. If someone joins through your referral and later wins,
            they accepted that 5% of their prize goes to you. Then they can invite their own friends
            too.
          </p>
        </div>

        <div className="auth-benefits" aria-label="Referral benefits">
          <div>
            <Gift size={18} />
            <span>Get your own invite code after Google login</span>
          </div>
          <div>
            <CircleDollarSign size={18} />
            <span>Earn 5% from every referred winner</span>
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
                  ? `Referral recognized from ${referralInviter}.`
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
            <span>I do not have a referral code.</span>
          </label>

          {referralCode ? (
            <label className="check-row referral-consent">
              <input
                checked={referralAccepted}
                disabled={Boolean(session) || !referralInviter}
                onChange={(event) => setReferralAccepted(event.target.checked)}
                type="checkbox"
              />
              <span>{referralAgreementText}</span>
            </label>
          ) : null}

          <div className="auth-loop">
            <div>
              <Check size={16} />
              <span>Your inviter can earn 5% if you win.</span>
            </div>
            <div>
              <Check size={16} />
              <span>You get your own link and can earn 5% from your referrals.</span>
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
