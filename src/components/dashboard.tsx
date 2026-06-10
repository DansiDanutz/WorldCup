"use client";

import {
  BookOpen,
  CalendarClock,
  Check,
  CircleDollarSign,
  ArrowRight,
  ClipboardCopy,
  GitBranch,
  LinkIcon,
  Lock,
  LogOut,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { HeroSwiper } from "@/components/hero-swiper";
import { KickoffCountdown } from "@/components/kickoff-countdown";
import { MyStanding } from "@/components/my-standing";
import { SmartMenu } from "@/components/smart-menu";
import { formatLedgerAmount, formatMoneyAmount } from "@/lib/economy";
import {
  calculatePaidPlaces,
  calculatePayoutPlan,
  calculateNetPrizePool,
  formatPrizeAmount,
} from "@/lib/prize-pool";
import { getCampaignReferralCode, normalizeCampaignReferralCode } from "@/lib/campaign-attribution";
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
import { filterAndSortTeamsBySearch } from "@/lib/team-search";
import { getTeamEligibility } from "@/lib/team-eligibility";
import {
  normalizeWorldCupTicketPriceAmount,
  normalizeWorldCupTicketPriceNumber,
} from "@/lib/worldcup-ticket-price";
import { buildSupportWhatsAppUrl, SUPPORT_WHATSAPP_URL } from "@/lib/support";
import type {
  DueMatch,
  LeaderboardRow,
  MyAccountStatus,
  PaidActionGate,
  PaidActionGates,
  WorldCupTournament,
  WorldCupMatch,
  WorldCupStage,
  WorldCupTeam,
} from "@/lib/types";
import type { Session } from "@supabase/supabase-js";
import type { CSSProperties, KeyboardEvent, PointerEvent, TouchEvent } from "react";

type DashboardProps = {
  tournament: WorldCupTournament;
  teams: WorldCupTeam[];
  stages: WorldCupStage[];
  matches: WorldCupMatch[];
  leaderboard: LeaderboardRow[];
  dueMatches: DueMatch[];
  publicPaidActionGates?: PaidActionGates;
};

type MyReferral = {
  id: string;
  entryId: string | null;
  invitedDisplayName: string;
  referralCode: string;
  feePercent: string;
  acceptedAt: string;
};

type AgentTicketRequest = {
  id: string;
  agentDisplayName: string | null;
  agentEmail: string | null;
  status: string;
  requestedAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  ticketId: string | null;
};

const pickColorClasses = ["pick-color-one", "pick-color-two", "pick-color-three"] as const;
const ownerAdminEmail = "semebitcoin@gmail.com";
const referralAgreementText =
  "If I join through this referral and win a prize, I agree that 5% of my winnings are owed to the inviter.";
const compactTeamCount = 8;
const SIGNUP_ATTRIBUTION_KEY = "worldcup_signup_attribution";

const teamFlagColors: Record<string, readonly [string, string, string?]> = {
  france: ["#0055a4", "#ffffff", "#ef4135"],
  spain: ["#aa151b", "#f1bf00", "#aa151b"],
  england: ["#ffffff", "#cf142b", "#00247d"],
  brazil: ["#009b3a", "#ffdf00", "#002776"],
  argentina: ["#74acdf", "#ffffff", "#f6b40e"],
  portugal: ["#006600", "#ff0000", "#ffcc00"],
  germany: ["#000000", "#dd0000", "#ffce00"],
  netherlands: ["#ae1c28", "#ffffff", "#21468b"],
  norway: ["#ba0c2f", "#ffffff", "#00205b"],
  belgium: ["#000000", "#ffd90c", "#ef3340"],
  morocco: ["#c1272d", "#006233", "#c1272d"],
  united_states: ["#3c3b6e", "#ffffff", "#b22234"],
  colombia: ["#fcd116", "#003893", "#ce1126"],
  japan: ["#ffffff", "#bc002d", "#ffffff"],
  uruguay: ["#ffffff", "#0038a8", "#fcd116"],
  turkiye: ["#e30a17", "#ffffff", "#e30a17"],
  switzerland: ["#ff0000", "#ffffff", "#ff0000"],
  sweden: ["#006aa7", "#fecc00", "#006aa7"],
  mexico: ["#006847", "#ffffff", "#ce1126"],
  ecuador: ["#ffdd00", "#034ea2", "#ed1c24"],
  senegal: ["#00853f", "#fdef42", "#e31b23"],
  croatia: ["#ff0000", "#ffffff", "#171796"],
  austria: ["#ed2939", "#ffffff", "#ed2939"],
  paraguay: ["#d52b1e", "#ffffff", "#0038a8"],
  canada: ["#ff0000", "#ffffff", "#ff0000"],
  cote_divoire: ["#f77f00", "#ffffff", "#009e60"],
  czechia: ["#11457e", "#ffffff", "#d7141a"],
  scotland: ["#0065bd", "#ffffff", "#0065bd"],
  egypt: ["#ce1126", "#ffffff", "#000000"],
  ghana: ["#ce1126", "#fcd116", "#006b3f"],
  algeria: ["#006233", "#ffffff", "#d21034"],
  korea_republic: ["#ffffff", "#c60c30", "#003478"],
  bosnia_herzegovina: ["#002f6c", "#fecd00", "#ffffff"],
  tunisia: ["#e70013", "#ffffff", "#e70013"],
  australia: ["#00008b", "#ffffff", "#ff0000"],
  ir_iran: ["#239f40", "#ffffff", "#da0000"],
  new_zealand: ["#00247d", "#ffffff", "#cc142b"],
  congo_dr: ["#007fff", "#f7d618", "#ce1021"],
  saudi_arabia: ["#006c35", "#ffffff", "#006c35"],
  qatar: ["#8d1b3d", "#ffffff", "#8d1b3d"],
  south_africa: ["#007a4d", "#ffb612", "#de3831"],
  curacao: ["#002b7f", "#f9e814", "#ffffff"],
  jordan: ["#000000", "#ffffff", "#007a3d"],
  haiti: ["#00209f", "#d21034", "#ffffff"],
  uzbekistan: ["#0099b5", "#ffffff", "#1eb53a"],
  cabo_verde: ["#003893", "#ffffff", "#cf2027"],
  iraq: ["#ce1126", "#ffffff", "#000000"],
  panama: ["#ffffff", "#005293", "#d21034"],
};

export function Dashboard({
  tournament,
  teams,
  stages,
  matches,
  leaderboard,
  publicPaidActionGates,
}: DashboardProps) {
  const [query, setQuery] = useState("");
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralInviter, setReferralInviter] = useState<string | null>(null);
  const [referralAccepted, setReferralAccepted] = useState(false);
  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  const [myReferrals, setMyReferrals] = useState<MyReferral[]>([]);
  const [myAccountStatus, setMyAccountStatus] = useState<MyAccountStatus | null>(null);
  const [agentTicketRequests, setAgentTicketRequests] = useState<AgentTicketRequest[]>([]);
  const [agentId, setAgentId] = useState("");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [agentRequestMessage, setAgentRequestMessage] = useState<string | null>(null);
  const [agentRequestError, setAgentRequestError] = useState<string | null>(null);
  const [entryMessage, setEntryMessage] = useState<string | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const teamListRef = useRef<HTMLDivElement | null>(null);
  const teamListTouchStart = useRef<{ scrollTop: number; y: number } | null>(null);
  const teamRowPointerStart = useRef<{ x: number; y: number } | null>(null);
  const persistedSignupReferralRef = useRef<string | null>(null);
  const signupFunnelEventRef = useRef<Set<string>>(new Set());
  const suppressTeamRowClick = useRef(false);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const teamsById = useMemo(() => groupTeamsById(teams), [teams]);
  const stagesById = useMemo(() => groupStagesById(stages), [stages]);

  const filteredTeams = useMemo(() => {
    return filterAndSortTeamsBySearch(teams, query);
  }, [query, teams]);
  const teamListExpanded = showAllTeams || Boolean(query.trim());
  const visibleTeams = teamListExpanded
    ? filteredTeams
    : filteredTeams.slice(0, compactTeamCount);
  const hiddenTeamCount = Math.max(0, filteredTeams.length - visibleTeams.length);

  const selectedTeamRecords = selectedTeams
    .map((teamId) => teamsById.get(teamId))
    .filter((team): team is WorldCupTeam => Boolean(team));
  const accountEntry = myAccountStatus?.entry ?? null;
  const accountHasDraftEntry = accountEntry?.status === "draft";
  // Teams are permanently locked for both a free "committed" entry and a paid
  // "locked" (in the pool) entry. Only a paid entry is in the prize pool.
  const accountInPool = accountEntry?.status === "locked";
  const accountCommittedFree = accountEntry?.status === "committed";
  const accountTeamsLocked = accountInPool || accountCommittedFree;
  // Kept for existing call sites that mean "the picks workflow is finished".
  const accountHasEntry = accountTeamsLocked;
  const lockedEntryTeamRecords = (accountEntry?.teamIds ?? [])
    .map((teamId) => teamsById.get(teamId))
    .filter((team): team is WorldCupTeam => Boolean(team));
  const remainingPickCount = Math.max(0, 3 - selectedTeams.length);
  const pickInstruction =
    selectedTeams.length === 3
      ? accountHasDraftEntry
        ? "Your free picks are saved. Lock your 3 teams forever, or get a ticket to lock straight into the prize pool."
        : "Your 3 teams are ready. Lock them free forever, or save a draft first to watch the private points preview."
      : `Choose ${remainingPickCount} more ${remainingPickCount === 1 ? "team" : "teams"}.`;

  const visibleMatches = matches.slice(0, 24);
  const completedCount = matches.filter((match) => match.status === "completed").length;
  const netPrizePool = calculateNetPrizePool(
    tournament.prize_pool_amount,
    tournament.prize_pool_fee_percent,
  );
  const participantCount = leaderboard.length;
  const paidPlaces = calculatePaidPlaces(participantCount);
  const payoutPlan = calculatePayoutPlan(netPrizePool, paidPlaces);
  const draftPreview = accountHasDraftEntry ? (myAccountStatus?.entryPreview ?? null) : null;
  const draftFallbackRank =
    leaderboard.filter((row) => Number(row.total_points ?? 0) > 0).length + 1;
  const draftFallbackPaidPlaces = calculatePaidPlaces(participantCount + 1);
  const draftFallbackPayoutPlan = calculatePayoutPlan(netPrizePool, draftFallbackPaidPlaces);
  const draftPreviewFallback = {
    totalPoints: 0,
    rank: draftFallbackRank,
    paidPlaces: draftFallbackPaidPlaces,
    projectedShare:
      draftFallbackRank <= draftFallbackPaidPlaces
        ? (draftFallbackPayoutPlan[draftFallbackRank - 1]?.amount ?? null)
        : null,
  };
  const draftPreviewDisplay = accountHasDraftEntry ? (draftPreview ?? draftPreviewFallback) : null;
  const teamEligibility = useMemo(
    () => getTeamEligibility(teams.map((team) => team.id), matches),
    [matches, teams],
  );
  const firstKickoffAt = useMemo(() => {
    let earliestTime: number | null = null;
    let earliestIso: string | null = null;
    for (const match of matches) {
      const time = Date.parse(match.kickoff_at);
      if (Number.isFinite(time) && (earliestTime === null || time < earliestTime)) {
        earliestTime = time;
        earliestIso = match.kickoff_at;
      }
    }
    return earliestIso;
  }, [matches]);
  const kickoffDateLabel = firstKickoffAt
    ? new Date(firstKickoffAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
    : "Jun 11";
  const signedInWithGoogle = Boolean(session?.access_token && session.user.email);
  const showAdminNav = session?.user.email?.trim().toLowerCase() === ownerAdminEmail;
  const waitingForAccountStatus = signedInWithGoogle && myAccountStatus === null;
  const showPickWorkflow = !accountHasEntry && !waitingForAccountStatus;
  const shareUrl =
    typeof window === "undefined" || !myReferralCode
      ? ""
      : `${window.location.origin}/login?ref=${encodeURIComponent(myReferralCode)}`;
  const whatsappUrl = myReferralCode
    ? `https://wa.me/?text=${encodeURIComponent(
        `I invited you to WorldCup26.\n\nPick 3 teams free, track your private points preview, and use a ticket only if you want the paid leaderboard.\n\nUse my referral code ${myReferralCode} when you join:\n${shareUrl}`,
      )}`
    : "";
  const whatsappPickHelpUrl = buildSupportWhatsAppUrl(
    "Hi, I need help choosing my 3 WorldCup26 teams.",
  );
  const whatsappDepositHelpUrl = buildSupportWhatsAppUrl(
    "Hi, I need help depositing USDT and getting my WorldCup26 ticket assigned.",
  );
  const whatsappAgentCodeHelpUrl = buildSupportWhatsAppUrl(
    "Hi, I have an agent code or need help getting a WorldCup26 ticket from an agent.",
  );
  const whatsappPassiveIncomeHelpUrl = buildSupportWhatsAppUrl(
    "Hi, I want help with WorldCup26 referrals, agent tickets, and passive income.",
  );
  const publicDepositPolicyPause = getGatePauseMessage(publicPaidActionGates?.deposit);
  const publicTicketPolicyPause = getGatePauseMessage(publicPaidActionGates?.ticket);
  const publicPaidActionsPaused = Boolean(publicDepositPolicyPause || publicTicketPolicyPause);
  const ticketsAvailable = myAccountStatus?.ticketsAvailable ?? 0;
  const accountStatusLoaded = myAccountStatus !== null;
  const hasEntryTicket = ticketsAvailable > 0;
  const needsEntryTicketPurchase = signedInWithGoogle && accountStatusLoaded && !hasEntryTicket;
  const showEntryTicketPurchase = !hasEntryTicket && needsEntryTicketPurchase;
  const selectedDraftReadyWithoutTicket = selectedTeams.length === 3 && !hasEntryTicket;
  const walletBalance = myAccountStatus?.walletBalance ?? 0;
  const ticketPriceAmount = normalizeWorldCupTicketPriceNumber(myAccountStatus?.ticketPriceAmount);
  const missingEntryTicket =
    signedInWithGoogle &&
    accountStatusLoaded &&
    accountHasDraftEntry &&
    selectedDraftReadyWithoutTicket;
  const entryDraftBlocker = getEntryDraftBlocker({
    displayName,
    referralAccepted,
    referralCode,
    selectedTeamCount: selectedTeams.length,
    signedInWithGoogle,
  });
  const entryLockBlocker = getEntryLockBlocker({
    displayName,
    missingEntryTicket,
    referralAccepted,
    referralCode,
    selectedTeamCount: selectedTeams.length,
    signedInWithGoogle,
  });
  const journeySteps = [
    { label: "Pick", done: selectedTeams.length === 3 || accountTeamsLocked },
    { label: "Lock teams", done: accountTeamsLocked },
    { label: "Ticket", done: hasEntryTicket || accountInPool },
    { label: "In pool", done: accountInPool },
  ];
  const journeyCurrentStep = journeySteps.findIndex((step) => !step.done);
  // Primary action: with a ticket you lock straight into the paid pool; without
  // one you lock your teams for free forever ("commit"). Both need the same
  // prerequisites (display name, 3 valid teams, referral terms).
  const entryPrimaryAction: "lock" | "commit" = hasEntryTicket ? "lock" : "commit";
  const entryActionBlocker = hasEntryTicket ? entryLockBlocker : entryDraftBlocker;
  const entryActionLabel = hasEntryTicket ? "Lock & enter prize pool" : "Lock my 3 teams";
  const entryLockHint = hasEntryTicket
    ? entryLockBlocker && !missingEntryTicket
      ? `Ticket is ready. ${entryLockBlocker}`
      : entryLockBlocker
    : entryDraftBlocker
      ? entryDraftBlocker
      : "Locking is permanent — your 3 teams can never be changed. No ticket needed; add one anytime to enter the prize pool.";
  const pendingAgentTicketRequest = agentTicketRequests.find((request) => request.status === "pending");
  const launchEvidenceMode = Boolean(
    signedInWithGoogle &&
      publicPaidActionsPaused &&
      myAccountStatus?.paidActionGates &&
      myAccountStatus.paidActionGates.deposit.allowed &&
      myAccountStatus.paidActionGates.ticket.allowed,
  );

  useEffect(() => {
    window.queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const initialRef = getCampaignReferralCode(params);
      const storedRef = window.localStorage.getItem("worldcup_referral_code");
      const nextReferralCode = normalizeReferralCode(initialRef ?? storedRef ?? "");

      if (nextReferralCode && initialRef) {
        window.localStorage.setItem("worldcup_referral_code", nextReferralCode);
        persistSignupAttributionFromUrl(nextReferralCode);
      }

      setReferralCode(nextReferralCode);
      setReferralAccepted(
        Boolean(nextReferralCode) &&
          window.localStorage.getItem("worldcup_referral_accepted") === "true",
      );
    });
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const nextSession = data.session;
        setSession(nextSession);

        if (!nextSession) {
          const campaignLoginHref = getCampaignLoginRedirectHref();
          if (campaignLoginHref) {
            window.location.replace(campaignLoginHref);
          }
        }
      })
      .catch(() => setSession(null));

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

  // Restore an in-progress pick (teams + display name) once, so leaving for the
  // wallet to buy a ticket and coming back does not wipe the user's selection.
  const picksRestoredRef = useRef(false);
  useEffect(() => {
    if (picksRestoredRef.current) {
      return;
    }
    picksRestoredRef.current = true;

    window.queueMicrotask(() => {
      const validTeamIds = new Set(teams.map((team) => team.id));
      try {
        const storedTeams: unknown = JSON.parse(
          window.localStorage.getItem("worldcup_selected_teams") ?? "[]",
        );
        if (Array.isArray(storedTeams)) {
          const restored = storedTeams
            .filter((id): id is string => typeof id === "string" && validTeamIds.has(id))
            .slice(0, 3);
          if (restored.length > 0) {
            setSelectedTeams(restored);
          }
        }
      } catch {
        window.localStorage.removeItem("worldcup_selected_teams");
      }

      const storedName = window.localStorage.getItem("worldcup_display_name");
      if (storedName) {
        setDisplayName(storedName);
      }
    });
  }, [teams]);

  useEffect(() => {
    if (selectedTeams.length > 0) {
      window.localStorage.setItem("worldcup_selected_teams", JSON.stringify(selectedTeams));
    } else {
      window.localStorage.removeItem("worldcup_selected_teams");
    }
  }, [selectedTeams]);

  useEffect(() => {
    if (displayName.trim()) {
      window.localStorage.setItem("worldcup_display_name", displayName);
    } else {
      window.localStorage.removeItem("worldcup_display_name");
    }
  }, [displayName]);

  useEffect(() => {
    const token = session?.access_token;
    const normalizedReferralCode = normalizeReferralCode(referralCode);

    if (!token || !signedInWithGoogle || !normalizedReferralCode) {
      return;
    }

    const signupAttribution = getStoredSignupAttribution(normalizedReferralCode);
    sendSignupFunnelEventOnce({
      eventKey: `${session.user.id}:${normalizedReferralCode}:returned`,
      sentRef: signupFunnelEventRef,
      event: "returned",
      referralCode: normalizedReferralCode,
      token,
      attribution: signupAttribution,
    });

    if (!referralAccepted) {
      sendSignupFunnelEventOnce({
        eventKey: `${session.user.id}:${normalizedReferralCode}:missing-acceptance`,
        sentRef: signupFunnelEventRef,
        event: "missing-acceptance",
        referralCode: normalizedReferralCode,
        token,
        attribution: signupAttribution,
      });
      return;
    }

    const persistKey = `${session.user.id}:${normalizedReferralCode}`;
    if (persistedSignupReferralRef.current === persistKey) {
      return;
    }

    persistedSignupReferralRef.current = persistKey;
    sendSignupFunnelEventOnce({
      eventKey: `${persistKey}:attempt`,
      sentRef: signupFunnelEventRef,
      event: "attempt",
      referralCode: normalizedReferralCode,
      token,
      attribution: signupAttribution,
    });

    void fetch("/api/referrals/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        referralCode: normalizedReferralCode,
        referralTermsAccepted: true,
        ...signupAttribution,
      }),
    })
      .then((response) => {
        if (response.ok) {
          sendSignupFunnelEventOnce({
            eventKey: `${persistKey}:saved`,
            sentRef: signupFunnelEventRef,
            event: "saved",
            referralCode: normalizedReferralCode,
            token,
            attribution: signupAttribution,
          });
          window.localStorage.removeItem(SIGNUP_ATTRIBUTION_KEY);
        } else {
          sendSignupFunnelEventOnce({
            eventKey: `${persistKey}:save-failed`,
            sentRef: signupFunnelEventRef,
            event: "save-failed",
            referralCode: normalizedReferralCode,
            token,
            attribution: signupAttribution,
          });
          persistedSignupReferralRef.current = null;
        }
      })
      .catch(() => {
        sendSignupFunnelEventOnce({
          eventKey: `${persistKey}:save-error`,
          sentRef: signupFunnelEventRef,
          event: "save-error",
          referralCode: normalizedReferralCode,
          token,
          attribution: signupAttribution,
        });
        persistedSignupReferralRef.current = null;
      });
  }, [referralAccepted, referralCode, session?.access_token, session?.user.id, signedInWithGoogle]);

  useEffect(() => {
    if (!showAllTeams) {
      return;
    }

    const list = teamListRef.current;
    if (!list) {
      return;
    }

    list.scrollTop = 0;
    const frame = window.requestAnimationFrame(() => {
      const header = document.querySelector(".topbar");
      const headerBottom = header instanceof HTMLElement ? header.getBoundingClientRect().bottom : 0;
      const targetTop = window.scrollY + list.getBoundingClientRect().top - headerBottom - 12;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [showAllTeams]);

  useEffect(() => {
    const normalized = normalizeReferralCode(referralCode);

    const timeout = window.setTimeout(async () => {
      if (!normalized) {
        setReferralInviter(null);
        return;
      }

      try {
        const response = await fetch(`/api/referrals/resolve?code=${encodeURIComponent(normalized)}`);
        const result = (await response.json()) as {
          valid?: boolean;
          inviterName?: string | null;
        };

        setReferralInviter(response.ok && result.valid ? result.inviterName ?? "another player" : null);
      } catch {
        setReferralInviter(null);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [referralCode]);

  useEffect(() => {
    const token = session?.access_token;
    let active = true;

    Promise.resolve().then(async () => {
      if (!token || !signedInWithGoogle) {
        if (active) {
          setIsAdmin(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = (await response.json()) as { admin?: boolean };

        if (active) {
          setIsAdmin(response.ok && Boolean(result.admin));
        }
      } catch {
        if (active) {
          setIsAdmin(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [session?.access_token, signedInWithGoogle]);

  useEffect(() => {
    const token = session?.access_token;

    Promise.resolve().then(async () => {
      if (!token || !signedInWithGoogle) {
        setMyReferralCode(null);
        setMyReferrals([]);
        setMyAccountStatus(null);
        setAgentTicketRequests([]);
        return;
      }

      try {
        const [response, agentRequestsResponse] = await Promise.all([
          fetch("/api/referrals/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/agent-ticket-requests", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const result = (await response.json()) as {
          referralCode?: string;
          displayName?: string | null;
          referrals?: MyReferral[];
          walletBalance?: string;
          ticketsAssigned?: number;
          ticketsAvailable?: number;
          ticketPriceAmount?: string;
          entry?: MyAccountStatus["entry"];
          usdtSenderWalletAddress?: string | null;
          usdtSenderWalletNetwork?: string | null;
          usdtSenderWalletUpdatedAt?: string | null;
          usdtSenderWalletTrc20Address?: string | null;
          usdtSenderWalletTrc20UpdatedAt?: string | null;
          usdtSenderWalletErc20Address?: string | null;
          usdtSenderWalletErc20UpdatedAt?: string | null;
          paidActionGates?: MyAccountStatus["paidActionGates"];
          entryPreview?: MyAccountStatus["entryPreview"];
        };

        setMyReferralCode(result.referralCode ?? null);
        setMyReferrals(result.referrals ?? []);
        setDisplayName((current) => {
          if (current.trim()) {
            return current;
          }

          return (
            result.entry?.displayName?.trim() ||
            result.displayName?.trim() ||
            session?.user.email?.split("@")[0] ||
            current
          );
        });
        if (agentRequestsResponse.ok) {
          const agentRequestsResult = (await agentRequestsResponse.json()) as {
            requests?: AgentTicketRequest[];
          };
          setAgentTicketRequests(agentRequestsResult.requests ?? []);
        } else {
          setAgentTicketRequests([]);
        }
        setMyAccountStatus({
          walletBalance: result.walletBalance ?? "0.00",
          ticketsAssigned: result.ticketsAssigned ?? 0,
          ticketsAvailable: result.ticketsAvailable ?? 0,
          ticketPriceAmount: normalizeWorldCupTicketPriceAmount(result.ticketPriceAmount),
          entry: result.entry ?? null,
          usdtSenderWalletAddress: result.usdtSenderWalletAddress ?? null,
          usdtSenderWalletNetwork: result.usdtSenderWalletNetwork ?? null,
          usdtSenderWalletUpdatedAt: result.usdtSenderWalletUpdatedAt ?? null,
          usdtSenderWalletTrc20Address: result.usdtSenderWalletTrc20Address ?? null,
          usdtSenderWalletTrc20UpdatedAt: result.usdtSenderWalletTrc20UpdatedAt ?? null,
          usdtSenderWalletErc20Address: result.usdtSenderWalletErc20Address ?? null,
          usdtSenderWalletErc20UpdatedAt: result.usdtSenderWalletErc20UpdatedAt ?? null,
          paidActionGates: result.paidActionGates,
          entryPreview: result.entryPreview ?? null,
        });
        if (result.entry?.status === "draft" && result.entry.teamIds.length > 0) {
          setSelectedTeams(result.entry.teamIds.slice(0, 3));
        }
      } catch {
        setMyReferralCode(null);
        setMyReferrals([]);
        setMyAccountStatus(null);
        setAgentTicketRequests([]);
      }
    });
  }, [session?.access_token, session?.user.email, signedInWithGoogle]);

  function toggleTeam(teamId: string) {
    if (accountHasEntry || waitingForAccountStatus) {
      return;
    }

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

  function handleTeamRowPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      return;
    }

    teamRowPointerStart.current = { x: event.clientX, y: event.clientY };
    suppressTeamRowClick.current = false;
  }

  function handleTeamRowPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" || !teamRowPointerStart.current) {
      return;
    }

    const deltaX = Math.abs(event.clientX - teamRowPointerStart.current.x);
    const deltaY = Math.abs(event.clientY - teamRowPointerStart.current.y);
    if (deltaY > 8 || deltaX > 14) {
      suppressTeamRowClick.current = true;
    }
  }

  function handleTeamRowPointerUp() {
    window.setTimeout(() => {
      teamRowPointerStart.current = null;
      suppressTeamRowClick.current = false;
    }, 160);
  }

  function handleTeamRowClick(teamId: string) {
    if (suppressTeamRowClick.current) {
      return;
    }

    toggleTeam(teamId);
  }

  function handleTeamRowKeyDown(event: KeyboardEvent<HTMLDivElement>, teamId: string) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggleTeam(teamId);
  }

  function handleTeamListTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (!teamListExpanded || event.touches.length !== 1) {
      return;
    }

    teamListTouchStart.current = {
      scrollTop: event.currentTarget.scrollTop,
      y: event.touches[0].clientY,
    };
  }

  function handleTeamListTouchMove(event: TouchEvent<HTMLDivElement>) {
    const start = teamListTouchStart.current;
    if (!teamListExpanded || !start || event.touches.length !== 1) {
      return;
    }

    const list = event.currentTarget;
    if (list.scrollHeight <= list.clientHeight) {
      return;
    }

    const deltaY = start.y - event.touches[0].clientY;
    if (Math.abs(deltaY) < 4) {
      return;
    }

    suppressTeamRowClick.current = true;
    list.scrollTop = start.scrollTop + deltaY;
    event.preventDefault();
  }

  function handleTeamListTouchEnd() {
    teamListTouchStart.current = null;
  }

  function removeTeam(teamId: string) {
    setEntryError(null);
    setEntryMessage(null);
    setSelectedTeams((current) => current.filter((id) => id !== teamId));
  }

  function clearSelectedTeams() {
    setEntryError(null);
    setEntryMessage(null);
    setSelectedTeams([]);
  }

  function refreshAgentTicketRequests(token: string) {
    return fetch("/api/agent-ticket-requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data: { requests?: AgentTicketRequest[] }) => setAgentTicketRequests(data.requests ?? []))
      .catch(() => undefined);
  }

  function submitAgentTicketRequest() {
    const token = session?.access_token;
    if (!token || !signedInWithGoogle) {
      setAgentRequestError("Sign in with Google before requesting an Agent Call ticket.");
      return;
    }

    setAgentRequestError(null);
    setAgentRequestMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/agent-ticket-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agentId,
          displayName: displayName.trim() || session.user.email || "WorldCup player",
        }),
      });

      const result = (await response.json()) as { error?: string; request?: AgentTicketRequest };

      if (!response.ok) {
        setAgentRequestError(result.error ?? "Could not send Agent Call request.");
        return;
      }

      setAgentId("");
      setAgentRequestMessage("Agent code submitted. The agent can now assign your ticket.");
      await refreshAgentTicketRequests(token);
    });
  }

  function submitEntry(
    action: "save-draft" | "commit" | "lock",
    overrideTeamIds?: string[],
  ) {
    setEntryError(null);
    setEntryMessage(null);

    if (!session?.access_token || !signedInWithGoogle) {
      setEntryError("Sign in with Google before saving your picks.");
      return;
    }

    if (referralCode && !referralAccepted) {
      setEntryError("Accept the referral agreement before joining with a referral code.");
      return;
    }

    const teamIds = overrideTeamIds ?? selectedTeams;

    startTransition(async () => {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action,
          displayName,
          teamIds,
          referralCode,
          referralTermsAccepted: referralAccepted,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        entryId?: string;
        status?: "draft" | "committed" | "locked";
      };

      if (!response.ok) {
        setEntryError(result.error ?? "Could not save entry.");
        return;
      }

      const savedDisplayName = displayName.trim();
      const savedTeamIds = [...teamIds];
      const savedStatus =
        result.status ??
        (action === "save-draft" ? "draft" : action === "commit" ? "committed" : "locked");
      const teamsNowLocked = savedStatus === "committed" || savedStatus === "locked";

      setEntryMessage(
        savedStatus === "draft"
          ? "Free picks saved. Your points and preview rank stay visible here; lock your teams when you're sure, then add a ticket to enter the prize pool."
          : savedStatus === "committed"
            ? "Your 3 teams are locked forever. You're playing for fun — your points and a 'where you'd place if paying' preview stay live. Buy a ticket anytime to enter the prize pool."
            : "Entry locked and in the prize pool. Your account is now focused on your entry, wallet, and agent deal.",
      );
      setMyAccountStatus((current) => ({
        walletBalance: current?.walletBalance ?? "0.00",
        ticketsAssigned: current?.ticketsAssigned ?? 0,
        ticketsAvailable:
          savedStatus === "locked"
            ? Math.max(0, (current?.ticketsAvailable ?? 1) - 1)
            : (current?.ticketsAvailable ?? 0),
        ticketPriceAmount: normalizeWorldCupTicketPriceAmount(current?.ticketPriceAmount),
        usdtSenderWalletAddress: current?.usdtSenderWalletAddress ?? null,
        usdtSenderWalletNetwork: current?.usdtSenderWalletNetwork ?? null,
        usdtSenderWalletUpdatedAt: current?.usdtSenderWalletUpdatedAt ?? null,
        usdtSenderWalletTrc20Address: current?.usdtSenderWalletTrc20Address ?? null,
        usdtSenderWalletTrc20UpdatedAt: current?.usdtSenderWalletTrc20UpdatedAt ?? null,
        usdtSenderWalletErc20Address: current?.usdtSenderWalletErc20Address ?? null,
        usdtSenderWalletErc20UpdatedAt: current?.usdtSenderWalletErc20UpdatedAt ?? null,
        paidActionGates: current?.paidActionGates,
        // Drafts and free-locked entries keep the private preview; only a paid
        // (pooled) entry switches to its real leaderboard rank.
        entryPreview:
          savedStatus === "locked" ? null : current?.entryPreview ?? draftPreviewFallback,
        entry: {
          id:
            result.entryId ??
            (savedStatus === "draft"
              ? "draft-entry"
              : savedStatus === "committed"
                ? "committed-entry"
                : "locked-entry"),
          status: savedStatus,
          displayName: savedDisplayName,
          teamIds: savedTeamIds,
          lockedAt: savedStatus === "locked" ? new Date().toISOString() : null,
          committedAt: savedStatus === "committed" ? new Date().toISOString() : null,
        },
      }));
      if (teamsNowLocked) {
        setSelectedTeams([]);
        window.localStorage.removeItem("worldcup_selected_teams");
        window.localStorage.removeItem("worldcup_referral_code");
        window.localStorage.removeItem("worldcup_referral_accepted");
      }
      window.dispatchEvent(new Event("worldcup-account-updated"));
      window.setTimeout(() => document.getElementById("me")?.scrollIntoView({ behavior: "smooth" }), 80);
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
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
    <main className={`app-shell app-shell--landing ${showPickWorkflow ? "" : "app-shell--post-entry"}`}>
      <header className="topbar">
        <Link className="brand landing-brand-lockup" href="/" aria-label="Go to WorldCup26.world home">
          <span className="brand-mark">
            <Trophy size={20} aria-hidden="true" />
          </span>
          <span className="landing-brand-copy">
            <strong>
              WorldCup26<span className="hero-brand__tld">.world</span>
            </strong>
            <small>Prediction Game</small>
          </span>
          <span className="landing-brand-year" aria-label="2026 season">
            <span className="hero-edition__dot" aria-hidden="true" />
            2026
          </span>
        </Link>
        <div
          className="prize-pool"
          aria-label={participantCount >= 100 ? "Players" : "Free to play"}
        >
          <Users size={18} />
          <div>
            {participantCount >= 100 ? (
              <>
                <span>Players</span>
                <strong>{participantCount.toLocaleString()}</strong>
              </>
            ) : (
              <>
                <span>Entry</span>
                <strong>Free</strong>
              </>
            )}
          </div>
          <small>{participantCount >= 100 ? "Free to play" : `${teams.length} nations`}</small>
        </div>
        <SmartMenu>
          <nav className="nav nav--app" aria-label="Primary navigation">
            <a className="nav-item nav-item--primary" href={showPickWorkflow ? "#pick" : "#me"}>
              {showPickWorkflow ? <Users size={16} /> : <UserRound size={16} />}
              <span className="nav-item__copy">
                <strong>{showPickWorkflow ? "Pick Teams" : "Account"}</strong>
                <small>{showPickWorkflow ? "Main task" : "Your entry"}</small>
              </span>
            </a>
            <a className="nav-item" href="#leaderboard">
              <Trophy size={16} />
              <span className="nav-item__copy">
                <strong>Leaderboard</strong>
                <small>Ranking</small>
              </span>
            </a>
            <Link className="nav-item" href={{ pathname: "/wallet" }}>
              <Wallet size={16} />
              <span className="nav-item__copy">
                <strong>Wallet</strong>
                <small>My account</small>
              </span>
            </Link>
            {signedInWithGoogle ? (
              <button className="nav-item nav-item--logout" onClick={signOut} type="button">
                <LogOut size={16} />
                <span className="nav-item__copy">
                  <strong>Logout</strong>
                  <small>End session</small>
                </span>
              </button>
            ) : null}
            {showAdminNav ? (
              <Link className="nav-item nav-item--admin" href={{ pathname: "/admin" }}>
                <ShieldCheck size={16} />
                <span className="nav-item__copy">
                  <strong>Admin</strong>
                  <small>Manage</small>
                </span>
              </Link>
            ) : null}
            <details className="nav-more">
              <summary>
                <GitBranch size={16} />
                <span className="nav-item__copy">
                  <strong>Explore</strong>
                  <small>Rules & draw</small>
                </span>
              </summary>
              <div className="nav-more__menu">
                <a href="#rules">
                  <BookOpen size={16} />
                  Rules
                </a>
                <Link href={{ pathname: "/schema" }}>
                  <GitBranch size={16} />
                  Schema
                </Link>
                <a href="#invite">
                  <Users size={16} />
                  Invite
                </a>
                <a href="#matches">
                  <CalendarClock size={16} />
                  Matches
                </a>
                <a href={SUPPORT_WHATSAPP_URL} rel="noreferrer" target="_blank">
                  <MessageCircle size={16} />
                  WhatsApp support
                </a>
                {showAdminNav ? (
                  <Link href={{ pathname: "/admin" }}>
                    <ShieldCheck size={16} />
                    Admin
                  </Link>
                ) : null}
                {signedInWithGoogle ? (
                  <button onClick={signOut} type="button">
                    <LogOut size={16} />
                    Logout
                  </button>
                ) : null}
              </div>
            </details>
            {signedInWithGoogle && showPickWorkflow ? (
              <a className="nav-item nav-item--identity" href="#me">
                <UserRound size={16} />
                <span className="nav-item__copy">
                  <strong>Account</strong>
                  <small>Your entry</small>
                </span>
              </a>
            ) : !signedInWithGoogle ? (
              <Link className="nav-item nav-item--identity" href={{ pathname: "/login" }}>
                <Lock size={16} />
                <span className="nav-item__copy">
                  <strong>Login</strong>
                  <small>Start here</small>
                </span>
              </Link>
            ) : null}
          </nav>
        </SmartMenu>
      </header>

      <div className={`page page--landing ${showPickWorkflow ? "" : "page--post-entry"}`}>
        {showPickWorkflow ? (
          <>
            {firstKickoffAt ? <KickoffCountdown kickoffAt={firstKickoffAt} /> : null}
            <HeroSwiper
              prizePool={netPrizePool > 0 ? formatPrizeAmount(netPrizePool) : "TBA"}
              playerCount={participantCount >= 100 ? participantCount : undefined}
            />
          </>
        ) : null}

        <MyStanding />

        {launchEvidenceMode ? (
          <section className="launch-notice" aria-label="Launch evidence mode">
            <div>
              <strong>Admin launch evidence mode</strong>
              <span>
                Admin can lock entries, collect USDT evidence, and assign paid ticket codes
                manually from the Admin panel.
              </span>
            </div>
            <Link className="button secondary" href={{ pathname: "/wallet" }}>
              Open Wallet
            </Link>
          </section>
        ) : null}

        <section className="status-row" aria-label="Tournament summary">
          <div className="stat">
            <div className="stat-label">Teams</div>
            <div className="stat-value">{teams.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Matches</div>
            <div className="stat-value">{matches.length}</div>
          </div>
          {completedCount > 0 ? (
            <div className="stat">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{completedCount}</div>
            </div>
          ) : (
            <div className="stat">
              <div className="stat-label">Kickoff</div>
              <div className="stat-value">{kickoffDateLabel}</div>
            </div>
          )}
          <div className="stat">
            <div className="stat-label">Entry</div>
            <div className="stat-value">Free</div>
          </div>
        </section>

        <section className={`grid ${accountHasEntry ? "grid--entry-complete" : ""}`}>
          {waitingForAccountStatus ? (
            <div className="panel pick-panel entry-complete-panel" id="pick">
              <div className="panel-header">
                <div>
                  <h1 className="panel-title">Checking your account</h1>
                  <p className="panel-subtitle">
                    We are loading your entry status before showing any game actions.
                  </p>
                </div>
                <span className="status-pill">Loading</span>
              </div>
              <div className="entry-complete-card">
                <div className="ticket-ready-note">
                  <RefreshCw size={16} />
                  <span>Account status is loading. Finished entries will open directly to account view.</span>
                </div>
              </div>
            </div>
          ) : accountHasEntry ? (
            <div className="panel pick-panel entry-complete-panel" id="pick">
              <div className="panel-header">
                <div>
                  <h1 className="panel-title">
                    {accountInPool ? "Your entry is locked" : "Your 3 teams are locked"}
                  </h1>
                  <p className="panel-subtitle">
                    {accountInPool
                      ? "One entry per account. Your final teams are in the prize pool and can no longer be changed."
                      : "Your 3 teams are locked forever and can no longer be changed. You're playing for fun — add a ticket anytime to enter the prize pool."}
                  </p>
                </div>
                <span className="status-pill">{accountInPool ? "In pool" : "Locked · free"}</span>
              </div>
              <div className="entry-complete-card">
                <div className="entry-complete-card__title">
                  <Check size={18} aria-hidden="true" />
                  <div>
                    <strong>{accountEntry?.displayName ?? "Your WorldCup26 entry"}</strong>
                    <span>
                      {accountInPool
                        ? accountEntry?.lockedAt
                          ? `Locked into the pool ${formatDateTime(accountEntry.lockedAt)}`
                          : "Entry in the pool"
                        : accountEntry?.committedAt
                          ? `Teams locked ${formatDateTime(accountEntry.committedAt)}`
                          : "Teams locked"}
                    </span>
                  </div>
                </div>
                <div className="selected-card locked-entry-teams" aria-label="Locked teams">
                  {[0, 1, 2].map((slot) => {
                    const team = lockedEntryTeamRecords[slot];
                    const fallbackTeamId = accountEntry?.teamIds[slot];

                    return (
                      <div
                        className={`selected-team ${team ? getPickColorClass(slot) : "empty-slot"}`}
                        key={team?.id ?? fallbackTeamId ?? slot}
                        style={team ? getTeamColorStyle(team.id) : undefined}
                      >
                        <span className="pick-slot-label">Team {slot + 1}</span>
                        <span className="selected-team-name">
                          {team?.name ?? fallbackTeamId ?? "Saved team"}
                        </span>
                        <strong>{team ? formatCoefficient(team.reward_coefficient) : "-"}</strong>
                      </div>
                    );
                  })}
                </div>
                {accountCommittedFree ? (
                  <div className="ticket-ready-note entry-pool-note">
                    <Trophy size={16} aria-hidden="true" />
                    <span>
                      Playing for fun: your points and a &ldquo;where you&rsquo;d place if paying&rdquo;
                      preview are live on your account below. A ticket puts you in the prize pool for
                      real money — your full points so far come with you.
                    </span>
                  </div>
                ) : null}
                <div className="entry-complete-actions">
                  {accountCommittedFree ? (
                    hasEntryTicket ? (
                      <button
                        className="button entry-lock-cta is-ready"
                        disabled={isPending}
                        onClick={() => submitEntry("lock", accountEntry?.teamIds ?? [])}
                        type="button"
                      >
                        <Lock size={16} />
                        {isPending ? "Entering…" : "Enter the prize pool"}
                      </button>
                    ) : (
                      <Link className="button" href={{ pathname: "/wallet" }}>
                        <Ticket size={16} />
                        Buy a ticket to enter the pool
                      </Link>
                    )
                  ) : null}
                  <a className={`button${accountCommittedFree ? " secondary" : ""}`} href="#me">
                    <UserRound size={16} />
                    Open account
                  </a>
                  <Link className="button secondary" href={{ pathname: "/wallet" }}>
                    <Wallet size={16} />
                    Wallet / Agent
                  </Link>
                </div>
                {entryMessage ? <div className="message">{entryMessage}</div> : null}
              </div>
            </div>
          ) : (
          <div className="panel pick-panel" id="pick">
            <div className="panel-header">
              <div>
                <h1 className="panel-title">Choose 3 Teams</h1>
                <p className="panel-subtitle">
                  The event has not started yet, so all 48 teams are still available. A team locks
                  1 minute before its first World Cup 2026 match.
                </p>
              </div>
              <span className="status-pill">{selectedTeams.length}/3 selected</span>
            </div>
            <div className="pick-flow" aria-label="Team pick progress">
              <div className="pick-flow__head">
                <div>
                  <strong>{pickInstruction}</strong>
                  <span>
                    Tap a team to add it. Tap a selected team or remove chip to change your picks.
                  </span>
                </div>
                <div className="pick-flow__head-actions">
                  <a
                    className="button secondary whatsapp-help-link"
                    href={whatsappPickHelpUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle size={16} />
                    WhatsApp pick help
                  </a>
                  {selectedTeams.length > 0 ? (
                    <button className="link-button" onClick={clearSelectedTeams} type="button">
                      Clear all
                    </button>
                  ) : null}
                </div>
              </div>
              <div
                className="pick-progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={3}
                aria-valuenow={selectedTeams.length}
                aria-label={`${selectedTeams.length} of 3 teams selected`}
              >
                {[0, 1, 2].map((segment) => (
                  <span
                    className={`pick-progress__seg ${selectedTeams.length > segment ? "is-filled" : ""}`}
                    key={segment}
                  />
                ))}
              </div>
              <div className="pick-slot-strip">
                {[0, 1, 2].map((slot) => {
                  const team = selectedTeamRecords[slot];

                  return (
                    <div
                      className={`pick-slot-card ${team ? getPickColorClass(slot) : "empty-slot"}`}
                      key={slot}
                      style={team ? getTeamColorStyle(team.id) : undefined}
                    >
                      <div>
                        <span className="pick-slot-label">Pick {slot + 1}</span>
                        <strong>{team ? team.name : "Open slot"}</strong>
                        <span>{team ? `Coef ${formatCoefficient(team.reward_coefficient)}` : "Choose from the list"}</span>
                      </div>
                      {team ? (
                        <button
                          aria-label={`Remove ${team.name}`}
                          className="icon-button"
                          onClick={() => removeTeam(team.id)}
                          type="button"
                        >
                          <X size={14} />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className={`pick-flow__action ${selectedTeams.length === 3 ? "is-ready" : ""}`}>
                {selectedTeams.length === 3 ? (
                  <a className="button pick-flow__cta" href="#entry">
                    Continue to Entry
                    <ArrowRight size={16} />
                  </a>
                ) : (
                  <button className="button pick-flow__cta" disabled type="button">
                    {remainingPickCount} more to continue
                  </button>
                )}
              </div>
            </div>
            <div className="panel-tools">
              <div className="field team-search-field">
                <div className="team-search-head">
                  <label htmlFor="team-search">Search teams</label>
                  <button
                    className={`all-teams-toggle ${showAllTeams ? "active" : ""}`}
                    onClick={() => setShowAllTeams((current) => !current)}
                    type="button"
                  >
                    {showAllTeams ? "Compact" : `All Teams (${filteredTeams.length})`}
                  </button>
                </div>
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
                    placeholder="Search team name, group, confederation"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
            </div>
            <div
              className={`team-list ${teamListExpanded ? "team-list--expanded" : "team-list--compact"}`}
              onTouchCancel={handleTeamListTouchEnd}
              onTouchEnd={handleTeamListTouchEnd}
              onTouchMove={handleTeamListTouchMove}
              onTouchStart={handleTeamListTouchStart}
              ref={teamListRef}
            >
              {visibleTeams.map((team) => {
                const selected = selectedTeams.includes(team.id);
                const selectedIndex = selectedTeams.indexOf(team.id);
                const eligibility = teamEligibility.get(team.id);
                const unavailable = eligibility?.available === false;
                const firstMatchStart = formatPickDeadline(eligibility?.firstKickoff ?? null);
                const atPickLimit = selectedTeams.length >= 3 && !selected;
                const nextPickNumber = selected ? selectedIndex + 1 : selectedTeams.length + 1;

                return (
                  <div
                    className={`team-row ${selected ? "selected" : ""} ${getPickColorClass(selectedIndex)} ${
                      unavailable ? "unavailable" : ""
                    } ${atPickLimit ? "at-limit" : ""}`}
                    style={getTeamColorStyle(team.id)}
                    aria-disabled={unavailable}
                    aria-pressed={selected}
                    key={team.id}
                    onClick={() => handleTeamRowClick(team.id)}
                    onKeyDown={(event) => handleTeamRowKeyDown(event, team.id)}
                    onPointerCancel={handleTeamRowPointerUp}
                    onPointerDown={handleTeamRowPointerDown}
                    onPointerMove={handleTeamRowPointerMove}
                    onPointerUp={handleTeamRowPointerUp}
                    role="button"
                    tabIndex={unavailable ? -1 : 0}
                    title={
                      unavailable
                        ? "This team can no longer be selected because its first match starts in less than one minute or already started."
                        : atPickLimit
                          ? "You already selected 3 teams. Remove one pick before adding another."
                        : undefined
                    }
                  >
                    <span className="select-dot">{selected ? <Check size={16} /> : null}</span>
                    <span>
                      <span className="team-name-line">
                        <span className="team-name">{team.name}</span>
                        <span className="team-coef-badge">
                          Coef {formatCoefficient(team.reward_coefficient)}
                        </span>
                      </span>
                      <span className="team-meta">
                        Group {team.group_code ?? "-"} · {team.confederation}
                        {unavailable ? " · Locked" : ""}
                      </span>
                      <span className="team-deadline">
                        {firstMatchStart
                          ? unavailable
                            ? `First match started ${firstMatchStart}`
                            : `Pick before first match: ${firstMatchStart}`
                          : "First match schedule pending"}
                      </span>
                    </span>
                    <span className="coefficient">
                      <span className="coefficient-label">Coef</span>
                      {formatCoefficient(team.reward_coefficient)}
                    </span>
                    <span className="odds">{team.winner_odds}</span>
                    <span className="team-row-action">
                      {selected ? `Pick ${nextPickNumber}` : atPickLimit ? "Full" : `Add ${nextPickNumber}`}
                    </span>
                  </div>
                );
              })}
              {hiddenTeamCount > 0 ? (
                <button
                  className="team-list-expand-card"
                  onClick={() => setShowAllTeams(true)}
                  type="button"
                >
                  Show all {filteredTeams.length} teams
                  <ArrowRight size={16} />
                </button>
              ) : null}
              {filteredTeams.length === 0 ? (
                <div className="empty-list-state">
                  <strong>No teams found</strong>
                  <span>Try a country name, Group A, UEFA, CAF, or another confederation.</span>
                  <button className="button secondary" onClick={() => setQuery("")} type="button">
                    Clear search
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          )}

          {showPickWorkflow ? (
          <div className="panel" id="entry">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Entry</h2>
                <p className="panel-subtitle">
                  Save your 3 picks free. Even without paying, you can follow your points and
                  see what would happen if this draft entered the paid leaderboard.
                </p>
              </div>
              <Lock size={18} color="var(--green)" />
            </div>
            <div className="journey-steps" aria-label="Entry progress">
              {journeySteps.map((step, index) => {
                const state =
                  step.done ? "done" : index === journeyCurrentStep ? "current" : "todo";

                return (
                  <div className={`journey-step is-${state}`} key={step.label}>
                    <span className="journey-step__dot">
                      {step.done ? <Check size={13} /> : index + 1}
                    </span>
                    <span className="journey-step__label">{step.label}</span>
                    {index < journeySteps.length - 1 ? (
                      <span className="journey-step__bar" aria-hidden="true" />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="entry-form">
              <div className="auth-box">
                <div>
                  <strong>{signedInWithGoogle ? "Google account connected" : "Google sign-in required"}</strong>
                  <p>
                    {signedInWithGoogle
                      ? session?.user.email
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
                      ? `Referral recognized from ${referralInviter}. Referral agreement: 5%.`
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
                  <span>{referralAgreementText}</span>
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
                      style={team ? getTeamColorStyle(team.id) : undefined}
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
              <div
                className={`ticket-requirement-card ${missingEntryTicket ? "needs-ticket" : ""}`}
                aria-label="Entry ticket requirement"
              >
                <div className="ticket-requirement-card__icon">
                  <Ticket size={18} />
                </div>
                <div className="ticket-requirement-card__content">
                  <div className="ticket-requirement-card__head">
                    <div>
                      <strong>
                        {hasEntryTicket
                          ? "Ticket ready"
                          : accountHasDraftEntry
                          ? "Free preview is live"
                        : signedInWithGoogle
                          ? "Free picks first"
                            : "Free picks after sign-in"}
                      </strong>
                      <span>
                        {hasEntryTicket
                          ? `${ticketsAvailable} ticket${ticketsAvailable === 1 ? "" : "s"} available for locking entries.`
                          : accountHasDraftEntry
                            ? "Your points, preview rank, and what-if payout stay visible. To go paid, 1 ticket must be assigned first."
                          : "Pick 3 teams and save a free draft. Paid leaderboard lock is mandatory ticket-based and requires 1 assigned ticket."}
                      </span>
                    </div>
                    <span className="ticket-status-pill">
                      {hasEntryTicket
                        ? `${ticketsAvailable} available`
                        : accountHasDraftEntry
                          ? "free preview"
                          : "no ticket needed"}
                    </span>
                  </div>
                  {hasEntryTicket ? (
                    <div className="ticket-ready-note">
                        <Check size={16} />
                        <span>
                          Buy-in is covered. Locking your saved picks will use 1 assigned ticket from your account.
                        </span>
                      </div>
                  ) : !signedInWithGoogle ? (
                    <div className="ticket-ready-note">
                      <Ticket size={16} />
                      <span>
                        Sign in first. Your free picks and preview points are saved to your account; paid lock still needs 1 assigned ticket.
                      </span>
                    </div>
                  ) : !accountHasDraftEntry ? (
                    <div className="ticket-ready-note ticket-ready-note--free">
                      <Check size={16} />
                      <span>
                        Save a free draft now. The paid leaderboard is mandatory ticket-based: Admin, an agent, or accepted USDT must assign 1 ticket first.
                        Your private points show what would happen if the draft were paid.
                      </span>
                    </div>
                  ) : showEntryTicketPurchase ? (
                    <>
                      <div className="ticket-ready-note">
                        <Check size={16} />
                        <span>
                          Free preview is already active. To move it into the paid leaderboard,
                          Admin or an agent must assign 1 ticket to this account.
                        </span>
                      </div>
                      <div className="ticket-option-grid">
                        <div>
                          <span>Ticket price</span>
                          <strong>{formatMoneyAmount(ticketPriceAmount)}</strong>
                        </div>
                        <div>
                          <span>Your balance</span>
                          <strong>{formatLedgerAmount(walletBalance)} USDT</strong>
                        </div>
                      </div>
                      <div className="ticket-ready-note">
                        <Wallet size={16} />
                        <span>
                          USDT is manual: save your sender wallet, send payment from that wallet, then Admin assigns the ticket.
                        </span>
                      </div>
                      <div className="ticket-requirement-actions">
                        <a
                          className="button secondary whatsapp-help-link"
                          href={whatsappDepositHelpUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <MessageCircle size={16} />
                          WhatsApp deposit help
                        </a>
                        <a
                          className="button secondary whatsapp-help-link"
                          href={whatsappAgentCodeHelpUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <MessageCircle size={16} />
                          WhatsApp agent help
                        </a>
                      </div>
                    <div className="agent-call-box">
                      <div>
                        <strong>Agent Call</strong>
                        <span>Enter only the agent code you received.</span>
                      </div>
                      <div className="agent-call-form">
                        <label className="agent-call-code-field" htmlFor="agent-call-code">
                          <span>Agent code</span>
                          <input
                            aria-label="Agent code"
                            autoCapitalize="characters"
                            autoComplete="off"
                            autoCorrect="off"
                            className="search"
                            data-testid="agent-call-code"
                            disabled={Boolean(pendingAgentTicketRequest) || isPending}
                            id="agent-call-code"
                            inputMode="text"
                            maxLength={12}
                            name="agent-code"
                            onChange={(event) => setAgentId(normalizeReferralCode(event.target.value))}
                            placeholder="Paste agent code"
                            spellCheck={false}
                            type="text"
                            value={agentId}
                          />
                        </label>
                        <button
                          className="button secondary"
                          disabled={Boolean(pendingAgentTicketRequest) || agentId.trim().length < 3 || isPending}
                          onClick={submitAgentTicketRequest}
                          type="button"
                        >
                          <Ticket size={16} />
                          Request ticket
                        </button>
                      </div>
                      <a
                        className="button secondary whatsapp-help-link"
                        href={whatsappAgentCodeHelpUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <MessageCircle size={16} />
                        WhatsApp agent-code help
                      </a>
                      {pendingAgentTicketRequest ? (
                        <div className="field-note">
                          Pending with{" "}
                          {pendingAgentTicketRequest.agentDisplayName ??
                            pendingAgentTicketRequest.agentEmail ??
                            "agent"}{" "}
                          until {formatDateTime(pendingAgentTicketRequest.expiresAt)}.
                        </div>
                      ) : null}
                      {agentRequestMessage ? <div className="message">{agentRequestMessage}</div> : null}
                      {agentRequestError ? <div className="message error">{agentRequestError}</div> : null}
                    </div>
                    </>
                  ) : null}
                </div>
              </div>
              {entryLockHint ? (
                <div className="message entry-lock-hint">{entryLockHint}</div>
              ) : null}
              <button
                className={`button entry-lock-cta ${entryActionBlocker ? "" : "is-ready"}`}
                disabled={Boolean(entryActionBlocker) || isPending}
                onClick={() => submitEntry(entryPrimaryAction)}
                type="button"
              >
                <Lock size={16} />
                {isPending ? "Saving..." : entryActionLabel}
              </button>
              <button
                className="button secondary entry-draft-cta"
                disabled={Boolean(entryDraftBlocker) || isPending}
                onClick={() => submitEntry("save-draft")}
                type="button"
              >
                <Check size={16} />
                {accountHasDraftEntry ? "Update saved draft" : "Save a draft to preview first"}
              </button>
              {entryMessage ? <div className="message">{entryMessage}</div> : null}
              {entryError ? <div className="message error">{entryError}</div> : null}
            </div>
          </div>
          ) : null}

          <div className="panel invite-panel" id="invite">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Invite Friend</h2>
                <p className="panel-subtitle">
                  Share your referral link. Every accepted inviter earns 5%.
                </p>
              </div>
              <div className="panel-header-actions">
                <Users size={18} color="var(--green)" />
                <a
                  className="button secondary whatsapp-help-link"
                  href={whatsappPassiveIncomeHelpUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle size={16} />
                  WhatsApp passive income help
                </a>
              </div>
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
                      <strong>{formatLedgerAmount(myAccountStatus?.walletBalance ?? 0)}</strong>
                      <small>Internal funds</small>
                    </div>
                    <div>
                      <span>Ticket price</span>
                      <strong>
                        {formatMoneyAmount(
                          normalizeWorldCupTicketPriceAmount(myAccountStatus?.ticketPriceAmount),
                        )}
                      </strong>
                      <small>Set by admin</small>
                    </div>
                  </div>
                  <div className="invite-preview-card" aria-label="Referral invite preview">
                    <div className="invite-preview-card__top">
                      <span className="invite-preview-card__icon">
                        <Sparkles size={18} />
                      </span>
                      <div>
                        <span>WorldCup26 invite</span>
                        <strong>Pick 3 teams free first.</strong>
                      </div>
                    </div>
                    <div className="referral-code-card">
                      <span>Your code</span>
                      <strong>{myReferralCode}</strong>
                    </div>
                    <div className="invite-link-card">
                      <LinkIcon size={16} />
                      <span>{shareUrl}</span>
                    </div>
                  </div>
                  <div className="invite-actions">
                    <a className="button" href={whatsappUrl} rel="noreferrer" target="_blank">
                      <MessageCircle size={16} />
                      Send invite
                    </a>
                    <button className="button secondary" onClick={copyInviteLink} type="button">
                      <ClipboardCopy size={16} />
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
            <div className="panel-header leaderboard-head">
              <div>
                <h2 className="panel-title">Leaderboard</h2>
                <p className="panel-subtitle">
                  {paidPlaces >= 10
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
            {accountHasDraftEntry ? (
              <div className="leaderboard-private-preview" aria-label="Private points preview">
                <div>
                  <strong>Your free picks are scoring privately.</strong>
                  <p>
                    This is the free tier: your points keep updating, and this card shows what
                    would happen if your draft entered the paid leaderboard.
                  </p>
                </div>
                <div className="leaderboard-preview-stats" aria-label="What-if paid entry preview">
                  <div>
                    <span>Points</span>
                    <strong>{formatPoints(draftPreviewDisplay?.totalPoints ?? 0)}</strong>
                  </div>
                  <div>
                    <span>If paid now</span>
                    <strong>{draftPreviewDisplay?.rank ? `#${draftPreviewDisplay.rank}` : "TBA"}</strong>
                  </div>
                  <div>
                    <span>What-if share</span>
                    <strong>
                      {draftPreviewDisplay?.projectedShare != null
                        ? `${formatMoneyAmount(draftPreviewDisplay.projectedShare)} USDT`
                        : draftPreviewDisplay?.paidPlaces
                          ? `Top ${draftPreviewDisplay.paidPlaces}`
                          : "TBA"}
                    </strong>
                  </div>
                </div>
                <a className="button secondary" href="#me">
                  View my preview
                  <ArrowRight size={16} />
                </a>
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
                    <p>
                      Free picks still keep a private score preview; the public board starts when a
                      ticket locks an entry.
                    </p>
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
                  with teams that have not reached the one-minute-before-first-match lock time.
                </p>
                <p>
                  Matchday 1 runs 11-17 June 2026. Matchday 2 runs 18-23 June 2026.
                  Each team row shows the exact last selectable time before its first match.
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

function getTeamColorStyle(teamId: string) {
  const colors = teamFlagColors[teamId] ?? ["#0f6b4f", "#f0c75e", "#ffffff"];
  const [first, second, third = first] = colors;

  return {
    "--team-color-one": first,
    "--team-color-two": second,
    "--team-color-three": third,
  } as CSSProperties;
}

function getGatePauseMessage(gate: PaidActionGate | undefined) {
  return gate && !gate.allowed
    ? "USDT deposits are admin-reviewed. You can still prepare your locked sender wallet; accepted USDT can auto-issue the first ticket."
    : null;
}

function getEntryDraftBlocker({
  displayName,
  referralAccepted,
  referralCode,
  selectedTeamCount,
  signedInWithGoogle,
}: {
  displayName: string;
  referralAccepted: boolean;
  referralCode: string;
  selectedTeamCount: number;
  signedInWithGoogle: boolean;
}) {
  if (selectedTeamCount !== 3) {
    return `Pick ${3 - selectedTeamCount} more ${selectedTeamCount === 2 ? "team" : "teams"} before saving.`;
  }

  if (!displayName.trim()) {
    return "Add your display name before saving.";
  }

  if (!signedInWithGoogle) {
    return "Sign in with Google before saving your picks.";
  }

  if (referralCode && !referralAccepted) {
    return "Accept the referral agreement before saving with this inviter code.";
  }

  return null;
}

function getEntryLockBlocker({
  displayName,
  missingEntryTicket,
  referralAccepted,
  referralCode,
  selectedTeamCount,
  signedInWithGoogle,
}: {
  displayName: string;
  missingEntryTicket: boolean;
  referralAccepted: boolean;
  referralCode: string;
  selectedTeamCount: number;
  signedInWithGoogle: boolean;
}) {
  if (selectedTeamCount !== 3) {
    return `Pick ${3 - selectedTeamCount} more ${selectedTeamCount === 2 ? "team" : "teams"} before locking.`;
  }

  if (!displayName.trim()) {
    return "Add your leaderboard display name before locking.";
  }

  if (!signedInWithGoogle) {
    return "Sign in with Google before locking your entry.";
  }

  if (referralCode && !referralAccepted) {
    return "Accept the referral agreement before locking with this inviter code.";
  }

  if (missingEntryTicket) {
    return "You need 1 assigned ticket before locking your entry.";
  }

  return null;
}

function normalizeReferralCode(value: string) {
  return normalizeCampaignReferralCode(value);
}

function persistSignupAttributionFromUrl(referralCode: string) {
  try {
    const params = new URLSearchParams(window.location.search);
    const effectiveReferralCode = normalizeReferralCode(referralCode || getCampaignReferralCode(params));
    const attribution = {
      referralCode: effectiveReferralCode,
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
      utmContent: params.get("utm_content") ?? "",
    };
    const hasAttribution = [
      attribution.utmSource,
      attribution.utmMedium,
      attribution.utmCampaign,
      attribution.utmContent,
    ].some(Boolean);

    if (effectiveReferralCode && hasAttribution) {
      window.localStorage.setItem(SIGNUP_ATTRIBUTION_KEY, JSON.stringify(attribution));
    }
  } catch {
    // Attribution improves reporting; picks and signup must still work without storage.
  }
}

function getStoredSignupAttribution(referralCode: string) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SIGNUP_ATTRIBUTION_KEY) ?? "{}") as Record<
      string,
      unknown
    >;
    if (normalizeReferralCode(typeof parsed.referralCode === "string" ? parsed.referralCode : "") !== referralCode) {
      return {};
    }

    const attribution = {
      utmSource: typeof parsed.utmSource === "string" ? parsed.utmSource : "",
      utmMedium: typeof parsed.utmMedium === "string" ? parsed.utmMedium : "",
      utmCampaign: typeof parsed.utmCampaign === "string" ? parsed.utmCampaign : "",
      utmContent: typeof parsed.utmContent === "string" ? parsed.utmContent : "",
    };

    return Object.fromEntries(
      Object.entries(attribution).filter(([, value]) => value.trim()),
    ) as Partial<typeof attribution>;
  } catch {
    return {};
  }
}

function sendSignupFunnelEventOnce({
  eventKey,
  sentRef,
  event,
  referralCode,
  token,
  attribution,
}: {
  eventKey: string;
  sentRef: { current: Set<string> };
  event: "returned" | "missing-acceptance" | "attempt" | "saved" | "save-failed" | "save-error";
  referralCode: string;
  token: string;
  attribution: Partial<{
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmContent: string;
  }>;
}) {
  if (sentRef.current.has(eventKey)) {
    return;
  }
  sentRef.current.add(eventKey);

  void fetch("/api/analytics/view", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    keepalive: true,
    body: JSON.stringify({
      path: `/#signup-referral-${event}`,
      referrer: typeof document === "undefined" ? null : document.referrer || null,
      referralCode,
      sessionId: `signup-referral-${eventKey}`,
      ...attribution,
    }),
  }).catch(() => undefined);
}

function getCampaignLoginRedirectHref() {
  if (typeof window === "undefined" || window.location.pathname !== "/") {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const referralCode = getCampaignReferralCode(params);
  if (!referralCode) {
    return "";
  }

  params.set("ref", referralCode);
  return `/login?${params.toString()}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatPickDeadline(value: number | null) {
  if (value === null) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}
