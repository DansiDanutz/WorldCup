"use client";

import {
  BookOpen,
  CalendarClock,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  GitBranch,
  Lock,
  RefreshCw,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { formatMoneyAmount } from "@/lib/economy";
import {
  calculateNetPrizePool,
  formatPrizeAmount,
  PRIZE_POOL_FEE_PERCENT,
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
  AdminReferralReportRow,
  AdminAccountRow,
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

type AdminResultState = {
  matchId: string;
  adminSecret: string;
  finishMethod: "90" | "extra_time" | "penalties";
  homeGoals90: string;
  awayGoals90: string;
  homeGoalsTotal: string;
  awayGoalsTotal: string;
  homePenalties: string;
  awayPenalties: string;
  winnerTeamId: string;
};

const initialAdminState: AdminResultState = {
  matchId: "",
  adminSecret: "",
  finishMethod: "90",
  homeGoals90: "0",
  awayGoals90: "0",
  homeGoalsTotal: "0",
  awayGoalsTotal: "0",
  homePenalties: "",
  awayPenalties: "",
  winnerTeamId: "",
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
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [entryMessage, setEntryMessage] = useState<string | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [adminState, setAdminState] = useState<AdminResultState>(initialAdminState);
  const [prizePoolAmount, setPrizePoolAmount] = useState(tournament.prize_pool_amount);
  const [prizePoolFeePercent, setPrizePoolFeePercent] = useState(tournament.prize_pool_fee_percent);
  const [ticketPriceAmount, setTicketPriceAmount] = useState(tournament.ticket_price_amount);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccountRow[]>([]);
  const [ticketUserId, setTicketUserId] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("1");
  const [walletFromUserId, setWalletFromUserId] = useState("");
  const [walletToUserId, setWalletToUserId] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletNote, setWalletNote] = useState("");
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminReferralRows, setAdminReferralRows] = useState<AdminReferralReportRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isAdminPending, startAdminTransition] = useTransition();
  const [isReferralReportPending, startReferralReportTransition] = useTransition();
  const [isAccountsPending, startAccountsTransition] = useTransition();

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
  const netPrizePool = calculateNetPrizePool(prizePoolAmount, prizePoolFeePercent);
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
        return;
      }

      try {
        const response = await fetch("/api/referrals/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = (await response.json()) as {
          referralCode?: string;
          referrals?: MyReferral[];
        };

        setMyReferralCode(result.referralCode ?? null);
        setMyReferrals(result.referrals ?? []);
      } catch {
        setMyReferralCode(null);
        setMyReferrals([]);
      }
    });
  }, [session?.access_token, signedInWithGoogle]);

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
  }

  async function copyInviteLink() {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setInviteMessage("Invite link copied.");
    window.setTimeout(() => setInviteMessage(null), 1800);
  }

  function submitAdminResult() {
    setAdminError(null);
    setAdminMessage(null);

    startAdminTransition(async () => {
      const response = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminSecret: adminState.adminSecret,
          matchId: adminState.matchId,
          finishMethod: adminState.finishMethod,
          homeGoals90: Number(adminState.homeGoals90),
          awayGoals90: Number(adminState.awayGoals90),
          homeGoalsTotal: Number(adminState.homeGoalsTotal),
          awayGoalsTotal: Number(adminState.awayGoalsTotal),
          homePenalties: adminState.homePenalties === "" ? null : Number(adminState.homePenalties),
          awayPenalties: adminState.awayPenalties === "" ? null : Number(adminState.awayPenalties),
          winnerTeamId: adminState.winnerTeamId || null,
        }),
      });

      const result = (await response.json()) as { error?: string; awardedRows?: number };

      if (!response.ok) {
        setAdminError(result.error ?? "Could not apply result.");
        return;
      }

      setAdminMessage(`Result saved. Awarded rows: ${result.awardedRows ?? 0}.`);
      window.setTimeout(() => window.location.reload(), 900);
    });
  }

  function loadReferralReport() {
    setAdminError(null);
    setAdminMessage(null);

    startReferralReportTransition(async () => {
      const response = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret: adminState.adminSecret }),
      });
      const result = (await response.json()) as {
        error?: string;
        referrals?: AdminReferralReportRow[];
      };

      if (!response.ok) {
        setAdminError(result.error ?? "Could not load referral report.");
        return;
      }

      setAdminReferralRows(result.referrals ?? []);
      setAdminMessage(`Referral report loaded. Rows: ${result.referrals?.length ?? 0}.`);
    });
  }

  async function savePrizePool() {
    setAdminError(null);
    setAdminMessage(null);

    const response = await fetch("/api/admin/prize-pool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminSecret: adminState.adminSecret,
        prizePoolAmount: Number(prizePoolAmount),
      }),
    });
    const result = (await response.json()) as {
      error?: string;
      prizePoolAmount?: string;
      prizePoolFeePercent?: string;
    };

    if (!response.ok) {
      setAdminError(result.error ?? "Could not save prize pool.");
      return;
    }

    setPrizePoolAmount(result.prizePoolAmount ?? prizePoolAmount);
    setPrizePoolFeePercent(result.prizePoolFeePercent ?? prizePoolFeePercent);
    setAdminMessage("Prize pool saved.");
  }

  function loadAdminAccounts() {
    setAdminError(null);
    setAdminMessage(null);

    startAccountsTransition(async () => {
      const response = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret: adminState.adminSecret }),
      });
      const result = (await response.json()) as {
        error?: string;
        accounts?: AdminAccountRow[];
        ticketPriceAmount?: string;
      };

      if (!response.ok) {
        setAdminError(result.error ?? "Could not load accounts.");
        return;
      }

      setAdminAccounts(result.accounts ?? []);
      setTicketPriceAmount(result.ticketPriceAmount ?? ticketPriceAmount);
      setAdminMessage(`Accounts loaded. Rows: ${result.accounts?.length ?? 0}.`);
    });
  }

  async function saveTicketPrice() {
    setAdminError(null);
    setAdminMessage(null);

    const response = await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set_price",
        adminSecret: adminState.adminSecret,
        ticketPriceAmount: Number(ticketPriceAmount),
      }),
    });
    const result = (await response.json()) as { error?: string; ticketPriceAmount?: string };

    if (!response.ok) {
      setAdminError(result.error ?? "Could not save ticket price.");
      return;
    }

    setTicketPriceAmount(result.ticketPriceAmount ?? ticketPriceAmount);
    setAdminMessage("Ticket price saved.");
  }

  async function assignTickets() {
    setAdminError(null);
    setAdminMessage(null);

    const response = await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "assign",
        adminSecret: adminState.adminSecret,
        userId: ticketUserId,
        quantity: Number(ticketQuantity),
      }),
    });
    const result = (await response.json()) as { error?: string; assignedTickets?: number };

    if (!response.ok) {
      setAdminError(result.error ?? "Could not assign tickets.");
      return;
    }

    setAdminMessage(`Assigned tickets: ${result.assignedTickets ?? ticketQuantity}.`);
    loadAdminAccounts();
  }

  async function transferWalletFunds() {
    setAdminError(null);
    setAdminMessage(null);

    const response = await fetch("/api/admin/wallet-transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminSecret: adminState.adminSecret,
        fromUserId: walletFromUserId,
        toUserId: walletToUserId,
        amount: Number(walletAmount),
        note: walletNote,
      }),
    });
    const result = (await response.json()) as { error?: string; transferId?: string };

    if (!response.ok) {
      setAdminError(result.error ?? "Could not transfer funds.");
      return;
    }

    setWalletAmount("");
    setWalletNote("");
    setAdminMessage(`Transfer saved: ${result.transferId}.`);
    loadAdminAccounts();
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
          <small>
            {Number(prizePoolFeePercent || PRIZE_POOL_FEE_PERCENT).toFixed(0)}% fee
          </small>
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
          <a href="#admin">
            <ClipboardCheck size={16} />
            Admin
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
              <button
                className="button"
                disabled={
                  selectedTeams.length !== 3 ||
                  !displayName.trim() ||
                  !signedInWithGoogle ||
                  (Boolean(referralCode) && !referralAccepted) ||
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
                <p className="panel-subtitle">Stored awards from completed matches.</p>
              </div>
              <CircleDollarSign size={18} color="var(--gold)" />
            </div>
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

          <div className="panel" id="admin">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Admin Result</h2>
                <p className="panel-subtitle">Manual fallback for result ingestion.</p>
              </div>
              <ClipboardCheck size={18} color="var(--green)" />
            </div>
            <div className="admin-form">
              <div className="admin-report">
                <div className="admin-report-header">
                  <div>
                    <strong>Prize Pool</strong>
                    <span>Visible pool is gross amount minus 20% fee.</span>
                  </div>
                  <strong>{netPrizePool > 0 ? formatPrizeAmount(netPrizePool) : "TBA"}</strong>
                </div>
                <div className="two-col">
                  <div className="field">
                    <label htmlFor="prize-pool-amount">Gross amount</label>
                    <input
                      id="prize-pool-amount"
                      min="0"
                      onChange={(event) => setPrizePoolAmount(event.target.value)}
                      type="number"
                      value={prizePoolAmount}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="prize-pool-fee">Fee</label>
                    <input
                      disabled
                      id="prize-pool-fee"
                      value={`${Number(prizePoolFeePercent || PRIZE_POOL_FEE_PERCENT).toFixed(0)}%`}
                    />
                  </div>
                </div>
                <button
                  className="button secondary"
                  disabled={!adminState.adminSecret}
                  onClick={savePrizePool}
                  type="button"
                >
                  Save Prize Pool
                </button>
              </div>

              <div className="field">
                <label htmlFor="admin-secret">Admin secret</label>
                <input
                  id="admin-secret"
                  type="password"
                  value={adminState.adminSecret}
                  onChange={(event) =>
                    setAdminState((current) => ({ ...current, adminSecret: event.target.value }))
                  }
                />
              </div>
              <div className="admin-report">
                <div className="admin-report-header">
                  <div>
                    <strong>Tickets & Wallets</strong>
                    <span>Assign entry tickets and record internal fund transfers.</span>
                  </div>
                  <button
                    className="button secondary"
                    disabled={!adminState.adminSecret || isAccountsPending}
                    onClick={loadAdminAccounts}
                    type="button"
                  >
                    {isAccountsPending ? "Loading..." : "Load Accounts"}
                  </button>
                </div>
                <div className="two-col">
                  <div className="field">
                    <label htmlFor="ticket-price">Ticket price</label>
                    <input
                      id="ticket-price"
                      min="0"
                      onChange={(event) => setTicketPriceAmount(event.target.value)}
                      type="number"
                      value={ticketPriceAmount}
                    />
                  </div>
                  <button
                    className="button secondary"
                    disabled={!adminState.adminSecret}
                    onClick={saveTicketPrice}
                    type="button"
                  >
                    Save Ticket Price
                  </button>
                </div>
                <div className="two-col">
                  <div className="field">
                    <label htmlFor="ticket-account">Assign ticket to account</label>
                    <select
                      id="ticket-account"
                      onChange={(event) => setTicketUserId(event.target.value)}
                      value={ticketUserId}
                    >
                      <option value="">Select account</option>
                      {adminAccounts.map((account) => (
                        <option key={account.userId} value={account.userId}>
                          {account.displayName} · {account.email ?? account.referralCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="ticket-quantity">Quantity</label>
                    <input
                      id="ticket-quantity"
                      min="1"
                      onChange={(event) => setTicketQuantity(event.target.value)}
                      type="number"
                      value={ticketQuantity}
                    />
                  </div>
                </div>
                <button
                  className="button secondary"
                  disabled={!adminState.adminSecret || !ticketUserId}
                  onClick={assignTickets}
                  type="button"
                >
                  Assign Tickets
                </button>
                <div className="two-col">
                  <div className="field">
                    <label htmlFor="wallet-from">Transfer from</label>
                    <select
                      id="wallet-from"
                      onChange={(event) => setWalletFromUserId(event.target.value)}
                      value={walletFromUserId}
                    >
                      <option value="">Select account</option>
                      {adminAccounts.map((account) => (
                        <option key={account.userId} value={account.userId}>
                          {account.displayName} · balance {formatMoneyAmount(account.walletBalance)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="wallet-to">Transfer to</label>
                    <select
                      id="wallet-to"
                      onChange={(event) => setWalletToUserId(event.target.value)}
                      value={walletToUserId}
                    >
                      <option value="">Select account</option>
                      {adminAccounts.map((account) => (
                        <option key={account.userId} value={account.userId}>
                          {account.displayName} · {account.email ?? account.referralCode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="two-col">
                  <div className="field">
                    <label htmlFor="wallet-amount">Amount</label>
                    <input
                      id="wallet-amount"
                      min="0"
                      onChange={(event) => setWalletAmount(event.target.value)}
                      type="number"
                      value={walletAmount}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="wallet-note">Note</label>
                    <input
                      id="wallet-note"
                      onChange={(event) => setWalletNote(event.target.value)}
                      placeholder="Reason for transfer"
                      value={walletNote}
                    />
                  </div>
                </div>
                <button
                  className="button secondary"
                  disabled={
                    !adminState.adminSecret ||
                    !walletFromUserId ||
                    !walletToUserId ||
                    !walletAmount
                  }
                  onClick={transferWalletFunds}
                  type="button"
                >
                  Transfer Funds
                </button>
                {adminAccounts.length > 0 ? (
                  <div className="admin-referral-list">
                    {adminAccounts.map((account) => (
                      <div className="admin-referral-row" key={account.userId}>
                        <div>
                          <strong>{account.displayName}</strong>
                          <span>{account.email ?? "No email stored"} · {account.referralCode}</span>
                          <span>
                            Tickets: {account.ticketsAvailable}/{account.ticketsAssigned} available
                          </span>
                        </div>
                        <div>
                          <strong>{formatMoneyAmount(account.walletBalance)}</strong>
                          <span>Wallet</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="field-note">
                    Load accounts to assign tickets or transfer funds.
                  </div>
                )}
              </div>
              <div className="field">
                <label htmlFor="match">Match</label>
                <select
                  id="match"
                  value={adminState.matchId}
                  onChange={(event) =>
                    setAdminState((current) => ({ ...current, matchId: event.target.value }))
                  }
                >
                  <option value="">Select match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      #{match.match_number} {match.home_slot} vs {match.away_slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="finish-method">Finish method</label>
                <select
                  id="finish-method"
                  value={adminState.finishMethod}
                  onChange={(event) =>
                    setAdminState((current) => ({
                      ...current,
                      finishMethod: event.target.value as AdminResultState["finishMethod"],
                    }))
                  }
                >
                  <option value="90">90 minutes</option>
                  <option value="extra_time">Extra time</option>
                  <option value="penalties">Penalties</option>
                </select>
              </div>
              <div className="two-col">
                <NumberField
                  label="Home 90"
                  value={adminState.homeGoals90}
                  onChange={(value) =>
                    setAdminState((current) => ({ ...current, homeGoals90: value }))
                  }
                />
                <NumberField
                  label="Away 90"
                  value={adminState.awayGoals90}
                  onChange={(value) =>
                    setAdminState((current) => ({ ...current, awayGoals90: value }))
                  }
                />
              </div>
              <div className="two-col">
                <NumberField
                  label="Home total"
                  value={adminState.homeGoalsTotal}
                  onChange={(value) =>
                    setAdminState((current) => ({ ...current, homeGoalsTotal: value }))
                  }
                />
                <NumberField
                  label="Away total"
                  value={adminState.awayGoalsTotal}
                  onChange={(value) =>
                    setAdminState((current) => ({ ...current, awayGoalsTotal: value }))
                  }
                />
              </div>
              <div className="two-col">
                <NumberField
                  label="Home pens"
                  value={adminState.homePenalties}
                  onChange={(value) =>
                    setAdminState((current) => ({ ...current, homePenalties: value }))
                  }
                />
                <NumberField
                  label="Away pens"
                  value={adminState.awayPenalties}
                  onChange={(value) =>
                    setAdminState((current) => ({ ...current, awayPenalties: value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="winner">Winner</label>
                <select
                  id="winner"
                  value={adminState.winnerTeamId}
                  onChange={(event) =>
                    setAdminState((current) => ({ ...current, winnerTeamId: event.target.value }))
                  }
                >
                  <option value="">No winner / group draw</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="button secondary"
                disabled={!adminState.matchId || !adminState.adminSecret || isAdminPending}
                onClick={submitAdminResult}
                type="button"
              >
                <ClipboardCheck size={16} />
                {isAdminPending ? "Saving..." : "Save Result & Apply Points"}
              </button>
              {adminMessage ? <div className="message">{adminMessage}</div> : null}
              {adminError ? <div className="message error">{adminError}</div> : null}
              <div className="message">
                Due checks: {dueMatches.length}. Cron should call <strong>/api/cron/results</strong>.
              </div>
              <div className="admin-report">
                <div className="admin-report-header">
                  <div>
                    <strong>Referral report</strong>
                    <span>Accepted referral agreements for referred players.</span>
                  </div>
                  <button
                    className="button secondary"
                    disabled={!adminState.adminSecret || isReferralReportPending}
                    onClick={loadReferralReport}
                    type="button"
                  >
                    {isReferralReportPending ? "Loading..." : "Load Report"}
                  </button>
                </div>
                {adminReferralRows.length > 0 ? (
                  <div className="admin-referral-list">
                    {adminReferralRows.map((row) => (
                      <div className="admin-referral-row" key={row.id}>
                        <div>
                          <strong>{row.invitedDisplayName}</strong>
                          <span>
                            Invited by {row.inviterDisplayName} · code {row.referralCode}
                          </span>
                          <span>Accepted {formatDateTime(row.acceptedAt)}</span>
                        </div>
                        <div>
                          <strong>{formatCoefficient(row.feePercent)}%</strong>
                          <span>
                            Rank {row.invitedLeaderboardRank ?? "-"} ·{" "}
                            {formatPoints(row.invitedTotalPoints)} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="field-note">
                    Load the report to see accepted referral agreements.
                  </div>
                )}
              </div>
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

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        min="0"
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
