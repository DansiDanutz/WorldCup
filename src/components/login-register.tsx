"use client";

import { Check, CircleDollarSign, Gift, LogIn, MousePointer2, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { PaidActionGate, PaidActionGates } from "@/lib/types";
import type { Session } from "@supabase/supabase-js";

const referralAgreementText =
  "If I join through this referral and win a prize, I agree that 5% of my winnings are owed to the inviter.";

const flagTeams = [
  ["france", "France", "fr"],
  ["spain", "Spain", "es"],
  ["england", "England", "gb-eng"],
  ["brazil", "Brazil", "br"],
  ["argentina", "Argentina", "ar"],
  ["portugal", "Portugal", "pt"],
  ["germany", "Germany", "de"],
  ["netherlands", "Netherlands", "nl"],
  ["norway", "Norway", "no"],
  ["belgium", "Belgium", "be"],
  ["morocco", "Morocco", "ma"],
  ["united_states", "United States", "us"],
  ["colombia", "Colombia", "co"],
  ["japan", "Japan", "jp"],
  ["uruguay", "Uruguay", "uy"],
  ["turkiye", "Turkiye", "tr"],
  ["switzerland", "Switzerland", "ch"],
  ["sweden", "Sweden", "se"],
  ["mexico", "Mexico", "mx"],
  ["ecuador", "Ecuador", "ec"],
  ["senegal", "Senegal", "sn"],
  ["croatia", "Croatia", "hr"],
  ["austria", "Austria", "at"],
  ["paraguay", "Paraguay", "py"],
  ["canada", "Canada", "ca"],
  ["cote_divoire", "Cote d'Ivoire", "ci"],
  ["czechia", "Czechia", "cz"],
  ["scotland", "Scotland", "gb-sct"],
  ["egypt", "Egypt", "eg"],
  ["ghana", "Ghana", "gh"],
  ["algeria", "Algeria", "dz"],
  ["korea_republic", "Korea Republic", "kr"],
  ["bosnia_herzegovina", "Bosnia and Herzegovina", "ba"],
  ["tunisia", "Tunisia", "tn"],
  ["australia", "Australia", "au"],
  ["ir_iran", "IR Iran", "ir"],
  ["new_zealand", "New Zealand", "nz"],
  ["congo_dr", "Congo DR", "cd"],
  ["saudi_arabia", "Saudi Arabia", "sa"],
  ["qatar", "Qatar", "qa"],
  ["south_africa", "South Africa", "za"],
  ["curacao", "Curacao", "cw"],
  ["jordan", "Jordan", "jo"],
  ["haiti", "Haiti", "ht"],
  ["uzbekistan", "Uzbekistan", "uz"],
  ["cabo_verde", "Cabo Verde", "cv"],
  ["iraq", "Iraq", "iq"],
  ["panama", "Panama", "pa"],
] as const;

type LoginRegisterProps = {
  publicPaidActionGates?: PaidActionGates;
};

export function LoginRegister({ publicPaidActionGates }: LoginRegisterProps) {
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
  const depositPolicyPause = getGatePauseMessage(publicPaidActionGates?.deposit);
  const ticketPolicyPause = getGatePauseMessage(publicPaidActionGates?.ticket);
  const entryPolicyPause = getGatePauseMessage(publicPaidActionGates?.entry);
  const paidActionsPaused = Boolean(depositPolicyPause || ticketPolicyPause || entryPolicyPause);

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
          <span className="status-pill">FIFA World Cup 2026</span>
          <h1 className="motto" id="auth-title">
            Predict the Game <span className="motto-accent">WorldCup26</span>
          </h1>
          <p>
            Create your account and choose three teams. Use Wallet for tickets and USDT after
            launch approvals open. Referral terms are handled before Google sign-in.
          </p>
        </div>

        <div className="auth-steps" aria-label="Signup steps">
          <div>
            <span>1</span>
            <strong>Referral</strong>
            <small>Enter an inviter code or choose direct signup.</small>
          </div>
          <div>
            <span>2</span>
            <strong>Google</strong>
            <small>One account, no password to manage.</small>
          </div>
          <div>
            <span>3</span>
            <strong>Play</strong>
            <small>Pick teams, buy tickets, track wallet activity.</small>
          </div>
        </div>

        <div className="flag-wall" aria-label="All 48 qualified nations">
          <div className="flag-wall-head">
            <span className="ds-label">All 48 Nations</span>
            <span>Pick 3 to play</span>
          </div>
          <div className="flag-grid">
            {flagTeams.map(([id, name, code]) => (
              <Image
                alt={name}
                className="flag"
                height={22}
                key={id}
                loading="lazy"
                src={`https://flagcdn.com/w80/${code}.png`}
                width={32}
              />
            ))}
          </div>
        </div>

        <div className="auth-benefits" aria-label="Referral benefits">
          <div>
            <Gift size={18} />
            <span>Referral accepted: your own invites can earn 5%</span>
          </div>
          <div>
            <CircleDollarSign size={18} />
            <span>Direct signup: your own invites earn 3%</span>
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
            <p className="panel-subtitle">Choose a signup path, then continue with Google.</p>
          </div>
          <LogIn size={18} color="var(--green)" />
        </div>

        <div className="entry-form">
          {paidActionsPaused ? (
            <div className="launch-notice" aria-label="Launch status">
              <div>
                <strong>Account setup is open</strong>
                <span>
                  Tickets, entries, and USDT deposits open after launch approvals are complete.
                </span>
              </div>
            </div>
          ) : null}

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

          <div className="auth-choice-grid" aria-label="Signup path options">
            <div className={referralCode ? "active" : ""}>
              <MousePointer2 size={16} />
              <strong>Using a referral</strong>
              <span>Paste the inviter code, then accept the prize-share agreement.</span>
            </div>
            <div className={noReferral ? "active" : ""}>
              <ShieldCheck size={16} />
              <strong>Direct signup</strong>
              <span>No inviter code. Your future referral rate starts at 3%.</span>
            </div>
          </div>

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
            <>
              {!canContinue ? (
                <div className="auth-next-step">
                  Choose one path: enter a valid referral code and accept it, or confirm direct signup.
                </div>
              ) : null}
              <button
                className="button"
                disabled={!canContinue}
                onClick={continueWithGoogle}
                type="button"
              >
                <LogIn size={16} />
                Create account with Google
              </button>
            </>
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

function getGatePauseMessage(gate: PaidActionGate | undefined) {
  return gate?.allowed === false ? gate.message : null;
}
