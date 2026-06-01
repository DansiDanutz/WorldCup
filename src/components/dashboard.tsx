"use client";

import {
  BookOpen,
  CalendarClock,
  Check,
  CircleDollarSign,
  GitBranch,
  Lock,
  RefreshCw,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { MINIMUM_AGE } from "@/lib/consent";
import { formatMoneyAmount } from "@/lib/economy";
import {
  calculatePaidPlaces,
  calculatePayoutPlan,
  calculateNetPrizePool,
  formatPrizeAmount,
} from "@/lib/prize-pool";
import {
  formatCoefficient,
  formatKickoff,
  formatPoints,
  getMatchScore,
  getTeamDisplayName,
  groupStagesById,
  groupTeamsById,
} from "@/lib/scoring";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getTeamEligibility } from "@/lib/team-eligibility";
import type {
  DueMatch,
  LeaderboardRow,
  MyAccountStatus,
  WorldCupTournament,
  WorldCupMatch,
  WorldCupStage,
  WorldCupTeam,
} from "@/lib/types";
import type { Session } from "@supabase/supabase-js";

type DashboardProps = {
  tournament: WorldCupTournament;
  teams: WorldCupTeam[];
  stages: WorldCupStage[];
  matches: WorldCupMatch[];
  leaderboard: LeaderboardRow[];
  dueMatches: DueMatch[];
};

type MyReferral = {
  id: string;
  entryId: string | null;
  invitedDisplayName: string;
  referralCode: string;
  feePercent: string;
  acceptedAt: string;
};

const pickColorClasses = ["pick-color-one", "pick-color-two", "pick-color-three"] as const;
const referralAgreementText =
  "If I join through this referral and win a prize, I agree that 5% of my winnings are owed to the inviter.";

export function Dashboard({
  tournament,
  teams,
  stages,
  matches,
  leaderboard,
  dueMatches,
}: DashboardProps) {
  const [query, setQuery] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [referralInviter, setReferralInviter] = useState<string | null>(null);
  const [referralPercent, setReferralPercent] = useState(3);
  const [referralAccepted, setReferralAccepted] = useState(false);
  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  const [myReferrals, setMyReferrals] = useState<MyReferral[]>([]);
  const [myAccountStatus, setMyAccountStatus] = useState<MyAccountStatus | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [entryMessage, setEntryMessage] = useState<string | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [consented, setConsented] = useState<boolean | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const teamsById = useMemo(() => groupTeamsById(teams), [teams]);
  const stagesById = useMemo(() => groupStagesById(stages), [stages]);

  const filteredTeams = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return teams;
    }

    return teams.filter((team) =>
      `${team.name} ${team.confederation} ${team.group_code ?? ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, teams]);

  const selectedTeamRecords = selectedTeams
    .map((teamId) => teamsById.get(teamId))
    .filter((team): team is WorldCupTeam => Boolean(team));

  const visibleMatches = matches.slice(0, 24);
  const completedCount = matches.filter((match) => match.status === "completed").length;
  const netPrizePool = calculateNetPrizePool(
    tournament.prize_pool_amount,
    tournament.prize_pool_fee_percent,
  );
  const participantCount = leaderboard.length;
  const paidPlaces = calculatePaidPlaces(participantCount);
  const payoutPlan = calculatePayoutPlan(netPrizePool, paidPlaces);
  const teamEligibility = useMemo(
    () => getTeamEligibility(teams.map((team) => team.id), matches),
    [matches, teams],
  );
  const signedInWithGoogle = session?.user.app_metadata.provider === "google";
  const shareUrl =
    typeof window === "undefined" || !myReferralCode
      ? ""
      : `${window.location.origin}/login?ref=${encodeURIComponent(myReferralCode)}`;
  const whatsappUrl = myReferralCode
    ? `https://wa.me/?text=${encodeURIComponent(
        `Join my WorldCup leaderboard. Use my referral link: ${shareUrl}`,
      )}`
    : "";

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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (referralCode) {
      window.localStorage.setItem("worldcup_referral_code", referralCode);
    } else {
      window.localStorage.removeItem("worldcup_referral_code");
      window.localStorage.removeItem("worldcup_referral_accepted");
    }
  }, [referralCode]);

  useEffect(() => {
    if (referralAccepted && referralCode) {
      window.localStorage.setItem("worldcup_referral_accepted", "true");
    } else {
      window.localStorage.removeItem("worldcup_referral_accepted");
    }
  }, [referralAccepted, referralCode]);

  useEffect(() => {
    const normalized = normalizeReferralCode(referralCode);

    const timeout = window.setTimeout(async () => {
      if (!normalized) {
        setReferralInviter(null);
        setReferralPercent(3);
        return;
      }

      const response = await fetch(`/api/referrals/resolve?code=${encodeURIComponent(normalized)}`);
      const result = (await response.json()) as {
        valid?: boolean;
        inviterName?: string | null;
        referralPercent?: number;
      };

      setReferralInviter(result.valid ? result.inviterName ?? "another player" : null);
      setReferralPercent(result.valid ? result.referralPercent ?? 3 : 3);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [referralCode]);

  useEffect(() => {
    const token = session?.access_token;

    Promise.resolve().then(async () => {
      if (!token || !signedInWithGoogle) {
        setMyReferralCode(null);
        setMyReferrals([]);
        setMyAccountStatus(null);
        return;
      }

      try {
        const response = await fetch("/api/referrals/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = (await response.json()) as {
          referralCode?: string;
          referrals?: MyReferral[];
          walletBalance?: string;
          ticketsAssigned?: number;
          ticketsAvailable?: number;
          ticketPriceAmount?: string;
        };

        setMyReferralCode(result.referralCode ?? null);
        setMyReferrals(result.referrals ?? []);
        setMyAccountStatus({
          walletBalance: result.walletBalance ?? "0.00",
          ticketsAssigned: result.ticketsAssigned ?? 0,
          ticketsAvailable: result.ticketsAvailable ?? 0,
          ticketPriceAmount: result.ticketPriceAmount ?? "0",
        });
      } catch {
        setMyReferralCode(null);
        setMyReferrals([]);
        setMyAccountStatus(null);
      }
    });
  }, [session?.access_token, signedInWithGoogle]);

  useEffect(() => {
    const token = session?.access_token;
    let active = true;

    Promise.resolve().then(async () => {
      if (!token || !signedInWithGoogle) {
        if (active) {
          setConsented(null);
        }
        return;
      }

      try {
        const response = await fetch("/api/consent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await response.json()) as { consented?: boolean };
        if (active) {
          setConsented(Boolean(data.consented));
        }
      } catch {
        if (active) {
          setConsented(null);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [session?.access_token, signedInWithGoogle]);

  function submitConsent() {
    setEntryError(null);
    setEntryMessage(null);

    if (!session?.access_token) {
      return;
    }

    if (!ageConfirmed || !termsAccepted) {
      setEntryError("Confirm your age and accept the Terms to continue.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ ageConfirmed, termsAccepted }),
      });

      const result = (await response.json()) as { error?: string; consented?: boolean };

      if (!response.ok) {
        setEntryError(result.error ?? "Could not save consent.");
        return;
      }

      setConsented(true);
      setEntryMessage("Thanks — you are verified. You can lock your entry now.");
    });
  }

  function toggleTeam(teamId: string) {
    if (teamEligibility.get(teamId)?.available === false) {
      return;
    }

    setEntryError(null);
    setEntryMessage(null);
    setSelectedTeams((current) => {
      if (current.includes(teamId)) {
        return current.filter((id) => id !== teamId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, teamId];
    });
  }

  function submitEntry() {
    setEntryError(null);
    setEntryMessage(null);

    if (!session?.access_token || !signedInWithGoogle) {
      setEntryError("Sign in with Google before locking your entry.");
      return;
    }

    if (referralCode && !referralAccepted) {
      setEntryError("Accept the referral agreement before joining with a referral code.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          displayName,
          teamIds: selectedTeams,
          referralCode,
          referralTermsAccepted: referralAccepted,
        }),
      });

      const result = (await response.json()) as { error?: string; entryId?: string };

      if (!response.ok) {
        setEntryError(result.error ?? "Could not save entry.");
        return;
      }

      setEntryMessage("Entry locked. You are on the leaderboard.");
      setDisplayName("");
      setSelectedTeams([]);
      window.localStorage.removeItem("worldcup_referral_code");
      window.localStorage.removeItem("worldcup_referral_accepted");
      window.setTimeout(() => window.location.reload(), 900);
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setMyReferralCode(null);
    setMyReferrals([]);
    setMyAccountStatus(null);
  }

  async function copyInviteLink() {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setInviteMessage("Invite link copied.");
    window.setTimeout(() => setInviteMessage(null), 1800);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Trophy size={20} />
          </span>
          <span>WorldCup</span>
        </div>
        <div className="prize-pool" aria-label="Prize pool">
          <CircleDollarSign size={18} />
          <div>
            <span>Prize Pool</span>
            <strong>{netPrizePool > 0 ? formatPrizeAmount(netPrizePool) : "TBA"}</strong>
          </div>
          <small>{paidPlaces > 0 ? `Top ${paidPlaces} paid` : "Paid places TBA"}</small>
        </div>
        <nav className="nav" aria-label="Primary navigation">
          <a href="#pick">
            <Users size={16} />
            Pick Teams
          </a>
          <a href="#rules">
            <BookOpen size={16} />
            Rules
          </a>
          <Link href={{ pathname: "/schema" }}>
            <GitBranch size={16} />
            Schema
          </Link>
          <a href="#leaderboard">
            <Trophy size={16} />
            Leaderboard
          </a>
          <a href="#invite">
            <Users size={16} />
            Invite
          </a>
          <Link href={{ pathname: "/login" }}>
            <Lock size={16} />
            Login
          </Link>
          <a href="#matches">
            <CalendarClock size={16} />
            Matches
          </a>
        </nav>
      </header>

      <div className="page">
        <section className="status-row" aria-label="Tournament summary">
          <div className="stat">
            <div className="stat-label">Teams</div>
            <div className="stat-value">{teams.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Matches</div>
            <div className="stat-value">{matches.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completedCount}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Due Checks</div>
            <div className="stat-value">{dueMatches.length}</div>
          </div>
        </section>

        <section className="grid">
          <div className="panel" id="pick">
            <div className="panel-header">
              <div>
                <h1 className="panel-title">Choose 3 Teams</h1>
                <p className="panel-subtitle">
                  Late entries are open, but a team locks when its second group match starts.
                </p>
              </div>
              <span className="status-pill">{selectedTeams.length}/3 selected</span>
            </div>
            <div className="panel-tools">
              <div className="field">
                <label htmlFor="team-search">Search teams</label>
                <div style={{ position: "relative" }}>
                  <Search
                    aria-hidden="true"
                    size={16}
                    style={{ left: 12, position: "absolute", top: 13, color: "var(--muted)" }}
                  />
                  <input
                    className="search"
                    id="team-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by team, group, confederation"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
            </div>
            <div className="team-list">
              {filteredTeams.map((team) => {
                const selected = selectedTeams.includes(team.id);
                const selectedIndex = selectedTeams.indexOf(team.id);
                const eligibility = teamEligibility.get(team.id);
                const unavailable = eligibility?.available === false;

                return (
                  <button
                    className={`team-row ${selected ? "selected" : ""} ${getPickColorClass(selectedIndex)} ${
                      unavailable ? "unavailable" : ""
                    }`}
                    disabled={unavailable}
                    key={team.id}
                    onClick={() => toggleTeam(team.id)}
                    type="button"
                    title={
                      unavailable
                        ? "This team can no longer be selected because its second group match has started."
                        : undefined
                    }
                  >
                    <span className="select-dot">{selected ? <Check size={16} /> : null}</span>
                    <span>
                      <span className="team-name">{team.name}</span>
                      <span className="team-meta">
                        Group {team.group_code ?? "-"} · {team.confederation}
                        {unavailable ? " · Locked" : ""}
                      </span>
                    </span>
                    <span className="coefficient">{formatCoefficient(team.reward_coefficient)}</span>
                    <span className="odds">{team.winner_odds}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Entry</h2>
                <p className="panel-subtitle">
                  You need an assigned ticket, then you can join if all 3 teams are still selectable.
                </p>
              </div>
              <Lock size={18} color="var(--green)" />
            </div>
            <div className="entry-form">
              <div className="auth-box">
                <div>
                  <strong>{signedInWithGoogle ? "Google account connected" : "Google sign-in required"}</strong>
                  <p>
                    {signedInWithGoogle
                      ? session.user.email
                      : "Create your account on the Login / Register page so referral codes are solved first."}
                  </p>
                </div>
                {signedInWithGoogle ? (
                  <button className="button secondary" onClick={signOut} type="button">
                    Sign out
                  </button>
                ) : (
                  <Link className="button secondary" href={{ pathname: "/login" }}>
                    Login / Register
                  </Link>
                )}
              </div>

              {referralCode ? (
                <div className="field">
                  <label htmlFor="referral-code">Referral code</label>
                  <input
                    id="referral-code"
                    value={referralCode}
                    onChange={(event) => {
                      setReferralCode(normalizeReferralCode(event.target.value));
                      setReferralAccepted(false);
                    }}
                    placeholder="Ask your inviter for their code"
                    disabled={signedInWithGoogle}
                  />
                  <div className="field-note">
                    {referralInviter
                      ? `Referral recognized from ${referralInviter}. Inviter rate: ${referralPercent}%.`
                      : "This referral code will be checked before your entry is locked."}
                  </div>
                </div>
              ) : null}

              {referralCode ? (
                <label className="check-row referral-consent">
                  <input
                    checked={referralAccepted}
                    onChange={(event) => setReferralAccepted(event.target.checked)}
                    type="checkbox"
                  />
                  <span>{referralAgreementText.replace("5%", `${referralPercent}%`)}</span>
                </label>
              ) : null}

              <div className="field">
                <label htmlFor="display-name">Display name</label>
                <input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your leaderboard name"
                />
              </div>
              <div className="selected-card">
                {[0, 1, 2].map((slot) => {
                  const team = selectedTeamRecords[slot];

                  return (
                    <div
                      className={`selected-team ${team ? getPickColorClass(slot) : "empty-slot"}`}
                      key={slot}
                    >
                      <span className="pick-slot-label">Pick {slot + 1}</span>
                      <span className="selected-team-name">
                        {team ? team.name : `Team slot ${slot + 1}`}
                      </span>
                      <strong>{team ? formatCoefficient(team.reward_coefficient) : "-"}</strong>
                    </div>
                  );
                })}
              </div>
              {signedInWithGoogle && consented === false ? (
                <div className="consent-gate" aria-label="Eligibility confirmation">
                  <label className="check-row">
                    <input
                      checked={ageConfirmed}
                      onChange={(event) => setAgeConfirmed(event.target.checked)}
                      type="checkbox"
                    />
                    <span>I confirm I am at least {MINIMUM_AGE} years old.</span>
                  </label>
                  <label className="check-row">
                    <input
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      type="checkbox"
                    />
                    <span>
                      I accept the{" "}
                      <Link className="inline-link" href={{ pathname: "/terms" }} target="_blank">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link className="inline-link" href={{ pathname: "/privacy" }} target="_blank">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  <button
                    className="button secondary"
                    disabled={!ageConfirmed || !termsAccepted || isPending}
                    onClick={submitConsent}
                    type="button"
                  >
                    Confirm &amp; continue
                  </button>
                </div>
              ) : null}
              <button
                className="button"
                disabled={
                  selectedTeams.length !== 3 ||
                  !displayName.trim() ||
                  !signedInWithGoogle ||
                  (Boolean(referralCode) && !referralAccepted) ||
                  (signedInWithGoogle && consented !== true) ||
                  isPending
                }
                onClick={submitEntry}
                type="button"
              >
                <Lock size={16} />
                {isPending ? "Locking..." : "Lock Entry"}
              </button>
              {entryMessage ? <div className="message">{entryMessage}</div> : null}
              {entryError ? <div className="message error">{entryError}</div> : null}
            </div>
          </div>

          <div className="panel invite-panel" id="invite">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Invite Friend</h2>
                <p className="panel-subtitle">
                  Share your referral link. Referral-chain inviters earn 5%; direct inviters earn 3%.
                </p>
              </div>
              <Users size={18} color="var(--green)" />
            </div>
            <div className="invite-content">
              {signedInWithGoogle && myReferralCode ? (
                <>
                  <div className="account-status-grid">
                    <div>
                      <span>Tickets available</span>
                      <strong>{myAccountStatus?.ticketsAvailable ?? 0}</strong>
                      <small>{myAccountStatus?.ticketsAssigned ?? 0} assigned</small>
                    </div>
                    <div>
                      <span>Wallet balance</span>
                      <strong>{formatMoneyAmount(myAccountStatus?.walletBalance ?? 0)}</strong>
                      <small>Internal funds</small>
                    </div>
                    <div>
                      <span>Ticket price</span>
                      <strong>{formatMoneyAmount(myAccountStatus?.ticketPriceAmount ?? 0)}</strong>
                      <small>Set by admin</small>
                    </div>
                  </div>
                  <div className="referral-code-card">
                    <span>Your referral code</span>
                    <strong>{myReferralCode}</strong>
                  </div>
                  <div className="invite-actions">
                    <a className="button" href={whatsappUrl} rel="noreferrer" target="_blank">
                      Send on WhatsApp
                    </a>
                    <button className="button secondary" onClick={copyInviteLink} type="button">
                      Copy link
                    </button>
                  </div>
                  <div className="referral-activity">
                    <div className="referral-activity-header">
                      <span>Referred players</span>
                      <strong>{myReferrals.length}</strong>
                    </div>
                    {myReferrals.length > 0 ? (
                      <div className="referral-list">
                        {myReferrals.map((referral) => (
                          <div className="referral-row" key={referral.id}>
                            <div>
                              <strong>{referral.invitedDisplayName}</strong>
                              <span>Accepted {formatDateTime(referral.acceptedAt)}</span>
                            </div>
                            <span>{formatCoefficient(referral.feePercent)}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="field-note">
                        No accepted referrals yet. When a friend joins through your link, they will
                        appear here.
                      </div>
                    )}
                  </div>
                  {inviteMessage ? <div className="message">{inviteMessage}</div> : null}
                </>
              ) : (
                <div className="message">
                  Sign in with Google first to generate your referral code and WhatsApp invite link.
                </div>
              )}
            </div>
          </div>

          <div className="panel" id="leaderboard">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Leaderboard</h2>
                <p className="panel-subtitle">
                  {participantCount >= 100
                    ? "Top 10 positions share the prize pool."
                    : paidPlaces > 0
                      ? `Top ${paidPlaces} positions share the prize pool.`
                      : "Paid places are calculated after players lock entries."}
                </p>
              </div>
              <CircleDollarSign size={18} color="var(--gold)" />
            </div>
            {payoutPlan.length > 0 ? (
              <div className="payout-strip" aria-label="Prize payout preview">
                <div className="payout-strip-header">
                  <strong>Payout Preview</strong>
                  <span>Weighted split from the current prize pool.</span>
                </div>
                <div className="payout-grid">
                  {payoutPlan.map((row) => (
                    <div className="payout-cell" key={row.rank}>
                      <span>#{row.rank}</span>
                      <strong>{formatMoneyAmount(row.amount)}</strong>
                      <small>{row.percent.toFixed(2)}%</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="leaderboard-list">
              {leaderboard.length === 0 ? (
                <div className="leaderboard-empty">
                  <div className="empty-icon">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div className="leaderboard-name">No locked entries yet.</div>
                    <p>Be the first on the board by choosing 3 teams and locking your entry.</p>
                  </div>
                  <a className="button secondary" href="#pick">
                    <Users size={16} />
                    Choose teams
                  </a>
                </div>
              ) : (
                leaderboard.map((row) => (
                  <div className="leaderboard-row" key={row.entry_id}>
                    <div className="leaderboard-main">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="rank">{row.leaderboard_rank}</span>
                        <span className="leaderboard-name">{row.display_name}</span>
                      </div>
                      <span className="points">{formatPoints(row.total_points)}</span>
                    </div>
                    <div className="leaderboard-teams">
                      {(row.teams ?? []).map((team, index) => (
                        <span
                          className={`leaderboard-team-chip ${getPickColorClass(index)}`}
                          key={team.team_id}
                          title={`${formatPoints(team.total_points ?? 0)} points, coefficient ${formatCoefficient(team.team_coefficient)}`}
                        >
                          <span className="team-color-dot" aria-hidden="true" />
                          <span className="pick-chip-label">Pick {index + 1}</span>
                          <span>{team.team_name}</span>
                          <strong>{formatPoints(team.total_points ?? 0)} pts</strong>
                          <span className="leaderboard-team-coef">
                            x{formatCoefficient(team.team_coefficient)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel rules-panel" id="rules">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Rules</h2>
                <p className="panel-subtitle">How picks, coefficients, and points work.</p>
              </div>
              <BookOpen size={18} color="var(--green)" />
            </div>
            <div className="rules-content">
              <div className="rule-block">
                <h3>How to join</h3>
                <p>
                  Choose exactly 3 teams. You may join even after the tournament starts, but only
                  with teams that have not started their second group-stage match.
                </p>
                <p>
                  As soon as one of your chosen teams has started its second group match, that team
                  is locked for new users and cannot be selected anymore.
                </p>
              </div>

              <div className="rule-block">
                <h3>Points formula</h3>
                <div className="formula">
                  (base points + goal bonus + clean sheet bonus) x team coefficient x stage
                  coefficient
                </div>
              </div>

              <div className="rule-grid">
                <div className="rule-card">
                  <span>Win / qualify in 90 min</span>
                  <strong>5 pts</strong>
                </div>
                <div className="rule-card">
                  <span>Qualify after extra time</span>
                  <strong>4 pts</strong>
                </div>
                <div className="rule-card">
                  <span>Qualify after penalties</span>
                  <strong>3 pts</strong>
                </div>
                <div className="rule-card">
                  <span>Group draw</span>
                  <strong>2 pts</strong>
                </div>
                <div className="rule-card">
                  <span>Lose after penalties</span>
                  <strong>1.5 pts</strong>
                </div>
                <div className="rule-card">
                  <span>Lose after extra time</span>
                  <strong>1 pt</strong>
                </div>
                <div className="rule-card">
                  <span>Goal scored</span>
                  <strong>+0.5</strong>
                </div>
                <div className="rule-card">
                  <span>Clean sheet in 90 min</span>
                  <strong>+1</strong>
                </div>
              </div>

              <div className="rule-block">
                <h3>Team coefficient</h3>
                <p>
                  Favorites carry a lower multiplier. The most favored teams start at 1.00, while
                  the biggest underdogs can reach 3.00. The team coefficient stays fixed for the
                  whole competition.{" "}
                  <Link className="inline-link" href={{ pathname: "/coefficients" }}>
                    Click here for the full list.
                  </Link>
                </p>
              </div>

              <div className="stage-rules">
                {stages.map((stage) => (
                  <div className="stage-rule" key={stage.id}>
                    <span>{stage.name}</span>
                    <strong>{formatCoefficient(stage.stage_coefficient)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="matches-section" id="matches">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Match Schedule</h2>
                <p className="panel-subtitle">First 24 matches shown for fast operations.</p>
              </div>
              <RefreshCw size={18} color="var(--green)" />
            </div>
            <div className="match-list">
              {visibleMatches.map((match) => {
                const stage = stagesById.get(match.stage_id);

                return (
                  <div className="match-row" key={match.id}>
                    <div className="match-main">
                      <strong>
                        #{match.match_number} ·{" "}
                        {getTeamDisplayName(match.home_team_id, match.home_slot, teamsById)} vs{" "}
                        {getTeamDisplayName(match.away_team_id, match.away_slot, teamsById)}
                      </strong>
                      <span className={`status-pill ${match.status}`}>
                        {match.status === "completed" ? getMatchScore(match) : "Scheduled"}
                      </span>
                    </div>
                    <div className="match-sub">
                      {stage?.name ?? match.stage_id} · {formatKickoff(match.kickoff_at)} · {match.venue}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getPickColorClass(index: number) {
  return pickColorClasses[index] ?? "";
}

function normalizeReferralCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
