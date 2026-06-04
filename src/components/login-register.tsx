"use client";

import {
  Check,
  ChevronDown,
  CircleDollarSign,
  Gift,
  LogIn,
  MousePointer2,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [signupPath, setSignupPath] = useState<"referral" | "direct" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const referralInputRef = useRef<HTMLInputElement | null>(null);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const canContinueWithReferral = Boolean(referralCode && referralInviter && referralAccepted);
  const canContinue = canContinueWithReferral || noReferral;
  const selectedSignupPath = signupPath ?? (referralCode ? "referral" : noReferral ? "direct" : null);
  const showReferralForm = selectedSignupPath === "referral";
  const showGoogleAuth = Boolean(session || canContinue);
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
      setSignupPath(nextReferralCode ? "referral" : null);
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
      <section className="auth-card auth-card--register" aria-label="Register">
        <div className="panel-header">
          <div>
            <span className="ds-label">Register first</span>
            <h1 className="panel-title">Choose your signup path</h1>
            <p className="panel-subtitle">
              Tap one card. Google appears after your referral choice is ready.
            </p>
          </div>
          <LogIn size={18} color="var(--gold)" />
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

          <div className="auth-choice-grid auth-choice-grid--buttons" aria-label="Signup path options">
            <button
              className={`auth-choice-card auth-choice-card--referral ${
                selectedSignupPath === "referral" ? "active" : ""
              }`}
              disabled={Boolean(session)}
              onClick={() => {
                setNoReferral(false);
                setSignupPath("referral");
                setReferralAccepted(false);
                setError(null);
                window.setTimeout(() => referralInputRef.current?.focus(), 0);
              }}
              type="button"
            >
              <MousePointer2 size={17} />
              <strong>I have an inviter</strong>
              <span>Add their code. Your own future referrals can earn 5%.</span>
            </button>
            <button
              className={`auth-choice-card auth-choice-card--direct ${
                selectedSignupPath === "direct" ? "active" : ""
              }`}
              disabled={Boolean(session)}
              onClick={() => {
                setReferralCode("");
                setSignupPath("direct");
                setReferralAccepted(false);
                setReferralInviter(null);
                setReferralChecked(false);
                setNoReferral(true);
                setError(null);
              }}
              type="button"
            >
              <ShieldCheck size={17} />
              <strong>Direct signup</strong>
              <span>No inviter. I accept my own future referral rate starts at 3%.</span>
            </button>
          </div>

          {showReferralForm ? (
            <div className="auth-path-panel">
              <div className="field">
                <label htmlFor="login-referral-code">Inviter code</label>
                <input
                  id="login-referral-code"
                  ref={referralInputRef}
                  value={referralCode}
                  onChange={(event) => {
                    setReferralCode(normalizeReferralCode(event.target.value));
                    setNoReferral(false);
                    setSignupPath("referral");
                    setReferralAccepted(false);
                    setError(null);
                  }}
                  placeholder="Enter inviter code"
                  disabled={Boolean(session)}
                />
                {referralCode ? (
                  <div className={`field-note ${referralInviter ? "success-note" : ""}`}>
                    {referralInviter
                      ? `Referral recognized from ${referralInviter}. Your own invites can earn 5%.`
                      : referralChecked
                        ? "This referral code was not found."
                        : "Checking referral code..."}
                  </div>
                ) : (
                  <div className="field-note">
                    Enter the code from the person who invited you.
                  </div>
                )}
              </div>

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
            </div>
          ) : null}

          {selectedSignupPath === "direct" ? (
            <div className="auth-path-panel auth-path-panel--accepted">
              <Check size={16} />
              <span>
                Direct signup selected. You can still invite friends, but your own referral rate
                starts at 3% instead of 5%.
              </span>
            </div>
          ) : null}

          {!selectedSignupPath ? (
            <div className="auth-next-step">
              Choose one card above to unlock Google registration.
            </div>
          ) : !canContinue && showReferralForm ? (
            <div className="auth-next-step">
              Enter a valid inviter code, then accept the referral agreement.
            </div>
          ) : null}

          {showGoogleAuth ? (
            session ? (
              <Link className="button" href="/">
                Continue to game
              </Link>
            ) : (
              <button
                className="button auth-google-button"
                onClick={continueWithGoogle}
                type="button"
              >
                <LogIn size={16} />
                Continue with Google
              </button>
            )
          ) : null}

          {message ? <div className="message">{message}</div> : null}
          {error ? <div className="message error">{error}</div> : null}
        </div>
      </section>

      <section className="auth-hero" aria-labelledby="auth-title">
        <Link className="auth-brand" href="/">
          <Image src="/logo-lockup.svg" alt="WorldCup" width={122} height={30} priority />
        </Link>

        <details className="auth-worldcup-card" aria-labelledby="auth-title">
          <summary>
            <span>FIFA World Cup 2026</span>
            <ChevronDown size={16} />
          </summary>
          <div className="auth-worldcup-card__body">
            <div className="auth-copy">
              <h1 className="motto" id="auth-title">
                Predict the Game <span className="motto-accent">WorldCup26</span>
              </h1>
              <p>
                Create your account, pick three teams, then use Wallet for tickets and USDT after
                launch approvals open.
              </p>
            </div>

            <div className="auth-info-grid" aria-label="Signup details">
              <details className="auth-info-card" open>
                <summary>
                  <span>How it works</span>
                  <ChevronDown size={16} />
                </summary>
                <div className="auth-steps" aria-label="Signup steps">
                  <div>
                    <span>1</span>
                    <strong>Register</strong>
                    <small>Choose referral or direct signup.</small>
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
              </details>

              <details className="auth-info-card">
                <summary>
                  <span>Referral rates</span>
                  <ChevronDown size={16} />
                </summary>
                <div className="auth-benefits" aria-label="Referral benefits">
                  <div>
                    <Gift size={18} />
                    <span>Referral accepted: your own invites can earn 5%.</span>
                  </div>
                  <div>
                    <CircleDollarSign size={18} />
                    <span>Direct signup: your own invites earn 3%.</span>
                  </div>
                  <div>
                    <Users size={18} />
                    <span>Track accepted referrals inside the Invite tab.</span>
                  </div>
                </div>
              </details>

              <details className="auth-info-card">
                <summary>
                  <span>Agent Wanted</span>
                  <ChevronDown size={16} />
                </summary>
                <div className="auth-benefits" aria-label="Agent program">
                  <div>
                    <CircleDollarSign size={18} />
                    <span>Pay upfront for ticket codes you can assign to players.</span>
                  </div>
                  <div>
                    <Gift size={18} />
                    <span>Every 10 paid ticket codes unlock 1 extra free ticket code.</span>
                  </div>
                  <div>
                    <Users size={18} />
                    <span>Register as an agent in Wallet, then activate after your first ticket deposit.</span>
                  </div>
                </div>
              </details>

              <details className="auth-info-card">
                <summary>
                  <span>All 48 nations</span>
                  <ChevronDown size={16} />
                </summary>
                <div className="flag-wall" aria-label="All 48 qualified nations">
                  <div className="flag-wall-head">
                    <span className="ds-label">Pick 3 to play</span>
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
              </details>
            </div>
          </div>
        </details>
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
