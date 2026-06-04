"use client";

import {
  BookOpen,
  CircleDollarSign,
  Copy,
  Gift,
  Lock,
  Phone,
  QrCode,
  Send,
  ShieldCheck,
  Ticket,
  Trophy,
  UserPlus,
  UserRound,
  Upload,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { SmartMenu } from "@/components/smart-menu";
import {
  getDepositExplorerAddressUrl,
  getDepositExplorerTxUrl,
} from "@/lib/deposits";
import { formatLedgerAmount, formatMoneyAmount } from "@/lib/economy";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type {
  MyAccountStatus,
  PaidActionGate,
  PaidActionGates,
  WalletAgeVerification,
  WithdrawalRequestRow,
} from "@/lib/types";
import { getWithdrawalExplorerTxUrl } from "@/lib/withdrawals";
import type { Session } from "@supabase/supabase-js";

type DepositAddress = {
  network: string;
  label: string;
  address: string;
  memo: string | null;
  qrCodePath?: string;
  shared?: boolean;
};

type DepositClaim = {
  id: string;
  network: string;
  address: string;
  senderWalletAddress: string | null;
  amount: string;
  currency: string;
  txHash: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  creditedAt: string | null;
};

type AgentStatus = {
  isAgent: boolean;
  applicationStatus?: "none" | "pending" | "active";
  contactName?: string | null;
  whatsappNumber?: string | null;
  registeredAt?: string | null;
  updatedAt?: string | null;
  paidTickets: number;
  commissionTickets: number;
  availableCount: number;
  redeemedCount: number;
  progressInCycle: number;
  availableCodes: Array<{ code: string; kind: string }>;
  ticketRequests: Array<{
    id: string;
    requesterEmail: string | null;
    requesterDisplayName: string;
    status: string;
    requestedAt: string;
    expiresAt: string;
    acceptedAt: string | null;
    ticketId: string | null;
  }>;
};

type ResponsiblePlayStatus = {
  maxEntries: number | null;
  selfExcluded: boolean;
  selfExcludedUntil: string | null;
  ticketsReserved: number | null;
  entriesUsed: number | null;
  depositRestriction: string | null;
  ticketRestriction: string | null;
  supportResources?: { label: string; url: string }[];
};

type TicketTransferRecipient = {
  userId: string;
  displayName: string | null;
  email: string | null;
};

type WalletScreenProps = {
  publicPaidActionGates?: PaidActionGates;
};

export function WalletScreen({ publicPaidActionGates }: WalletScreenProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<MyAccountStatus | null>(null);
  const [addresses, setAddresses] = useState<DepositAddress[]>([]);
  const [depositsConfigured, setDepositsConfigured] = useState<boolean | null>(null);
  const [sharedDepositAddresses, setSharedDepositAddresses] = useState(false);
  const [depositClaims, setDepositClaims] = useState<DepositClaim[]>([]);
  const [claimNetwork, setClaimNetwork] = useState("trc20");
  const [claimAmount, setClaimAmount] = useState("");
  const [claimSenderWalletAddress, setClaimSenderWalletAddress] = useState("");
  const [claimTxHash, setClaimTxHash] = useState("");
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequestRow[]>([]);
  const [ageVerification, setAgeVerification] = useState<WalletAgeVerification | null>(null);
  const [withdrawalNetwork, setWithdrawalNetwork] = useState("trc20");
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [agent, setAgent] = useState<AgentStatus | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentWhatsapp, setAgentWhatsapp] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [transferRecipient, setTransferRecipient] = useState<TicketTransferRecipient | null>(null);
  const [walletView, setWalletView] = useState<"user" | "agent">("user");
  const [agentTransferEmail, setAgentTransferEmail] = useState("");
  const [agentTransferRecipient, setAgentTransferRecipient] = useState<TicketTransferRecipient | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responsiblePlay, setResponsiblePlay] = useState<ResponsiblePlayStatus | null>(null);
  const [entryLimitDraft, setEntryLimitDraft] = useState("");
  const [selfExclusionDuration, setSelfExclusionDuration] = useState("24h");
  const [selfExclusionReason, setSelfExclusionReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const signedIn = Boolean(session?.access_token && session.user.email);
  const depositClaimAccountLabel =
    session?.user.email ?? session?.user.id ?? "your signed-in account";
  const depositRestriction = responsiblePlay?.depositRestriction ?? null;
  const ticketRestriction = responsiblePlay?.ticketRestriction ?? null;
  const publicDepositPolicyPause = getGatePauseMessage(publicPaidActionGates?.deposit);
  const publicTicketPolicyPause = getGatePauseMessage(publicPaidActionGates?.ticket);
  const publicWithdrawalPolicyPause = getGatePauseMessage(publicPaidActionGates?.withdrawal);
  const depositPolicyPause =
    status?.paidActionGates
      ? getGatePauseMessage(status.paidActionGates.deposit)
      : publicDepositPolicyPause;
  const ticketPolicyPause =
    status?.paidActionGates
      ? getGatePauseMessage(status.paidActionGates.ticket)
      : publicTicketPolicyPause;
  const withdrawalPolicyPause =
    status?.paidActionGates
      ? getGatePauseMessage(status.paidActionGates.withdrawal)
      : publicWithdrawalPolicyPause;
  const publicPaidActionsPaused = Boolean(
    publicDepositPolicyPause || publicTicketPolicyPause || publicWithdrawalPolicyPause,
  );
  const launchEvidenceMode = Boolean(
    signedIn &&
      publicPaidActionsPaused &&
      status?.paidActionGates &&
      status.paidActionGates.deposit.allowed &&
      status.paidActionGates.ticket.allowed &&
      status.paidActionGates.withdrawal.allowed,
  );
  const ticketPrice = Number(status?.ticketPriceAmount ?? 0);
  const walletBalance = Number(status?.walletBalance ?? 0);
  const accountStatusLoaded = status !== null;
  const userHasEntryTicket = (status?.ticketsAvailable ?? 0) > 0;
  const userNeedsEntryTicket = accountStatusLoaded && !userHasEntryTicket;
  const purchasableTickets = ticketPrice > 0 ? Math.floor(walletBalance / ticketPrice) : 0;
  const remainingAfterNextTicket = ticketPrice > 0 ? Math.max(walletBalance - ticketPrice, 0) : walletBalance;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const token = session?.access_token;

    Promise.resolve().then(async () => {
      if (!token || !signedIn) {
        setStatus(null);
        setAddresses([]);
        setDepositsConfigured(null);
        setSharedDepositAddresses(false);
        setDepositClaims([]);
        setClaimSenderWalletAddress("");
        setWithdrawals([]);
        setAgeVerification(null);
        setResponsiblePlay(null);
        setAgent(null);
        setEntryLimitDraft("");
        setTransferEmail("");
        setTransferRecipient(null);
        setAgentTransferEmail("");
        setAgentTransferRecipient(null);
        return;
      }

      try {
        const [
          meResponse,
          addressResponse,
          claimsResponse,
          withdrawalResponse,
          responsibleResponse,
          agentResponse,
        ] = await Promise.all([
          fetch("/api/referrals/me", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/deposits/address", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/deposits/claims", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/withdrawals", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/responsible-play", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/agent/me", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        applyAccountStatus((await meResponse.json()) as Partial<MyAccountStatus>);

        if (addressResponse.ok) {
          const data = (await addressResponse.json()) as {
            configured?: boolean;
            shared?: boolean;
            addresses?: DepositAddress[];
          };
          setDepositsConfigured(Boolean(data.configured));
          setSharedDepositAddresses(Boolean(data.shared));
          setAddresses(data.addresses ?? []);
        } else {
          setDepositsConfigured(false);
          setSharedDepositAddresses(false);
        }

        if (claimsResponse.ok) {
          const data = (await claimsResponse.json()) as { claims?: DepositClaim[] };
          setDepositClaims(data.claims ?? []);
        }

        if (withdrawalResponse.ok) {
          const data = (await withdrawalResponse.json()) as {
            withdrawals?: WithdrawalRequestRow[];
            ageVerification?: WalletAgeVerification;
          };
          setWithdrawals(data.withdrawals ?? []);
          setAgeVerification(data.ageVerification ?? null);
        }

        if (responsibleResponse.ok) {
          applyResponsiblePlay(await responsibleResponse.json());
        } else {
          setResponsiblePlay(null);
        }

        if (agentResponse.ok) {
          const data = (await agentResponse.json()) as AgentStatus;
          setAgent(data.isAgent || data.applicationStatus === "pending" ? data : null);
          if (data.contactName) setAgentName(data.contactName);
          if (data.whatsappNumber) setAgentWhatsapp(data.whatsappNumber);
        } else {
          setAgent(null);
        }
      } catch {
        setError("Could not load your wallet.");
      }
    });
  }, [session?.access_token, signedIn]);

  function refreshStatus(token: string) {
    fetch("/api/referrals/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((me: Partial<MyAccountStatus>) => applyAccountStatus(me))
      .catch(() => undefined);
  }

  function applyAccountStatus(me: Partial<MyAccountStatus>) {
    setStatus({
      walletBalance: me.walletBalance ?? "0.00",
      ticketsAvailable: me.ticketsAvailable ?? 0,
      ticketsAssigned: me.ticketsAssigned ?? 0,
      ticketPriceAmount: me.ticketPriceAmount ?? "0",
      usdtSenderWalletAddress: me.usdtSenderWalletAddress ?? null,
      usdtSenderWalletNetwork: me.usdtSenderWalletNetwork ?? null,
      usdtSenderWalletUpdatedAt: me.usdtSenderWalletUpdatedAt ?? null,
      paidActionGates: me.paidActionGates,
    });

    if (me.usdtSenderWalletAddress) {
      setClaimSenderWalletAddress(me.usdtSenderWalletAddress);
    }

    if (me.usdtSenderWalletNetwork === "trc20" || me.usdtSenderWalletNetwork === "erc20") {
      setClaimNetwork(me.usdtSenderWalletNetwork);
    }
  }

  function refreshAgent(token: string) {
    fetch("/api/agent/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data: AgentStatus) => {
        setAgent(data.isAgent || data.applicationStatus === "pending" ? data : null);
        if (data.contactName) setAgentName(data.contactName);
        if (data.whatsappNumber) setAgentWhatsapp(data.whatsappNumber);
      })
      .catch(() => undefined);
  }

  function registerAsAgent() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/agent/me", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: agentName.trim(),
          whatsapp: agentWhatsapp.trim(),
        }),
      });
      const result = (await response.json()) as AgentStatus & { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not register agent account.");
        return;
      }

      setAgent(result);
      setMessage(
        result.applicationStatus === "active"
          ? "Agent contact details updated."
          : "Agent registration saved. Your account activates after your first personal ticket is bought or assigned.",
      );
    });
  }

  function acceptAgentTicketRequest(requestId: string) {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/agent-ticket-requests/${requestId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = (await response.json()) as { error?: string; ticketId?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not accept Agent Call request.");
        await refreshAgent(token);
        return;
      }

      setMessage("Agent Call accepted. One ticket was assigned to the player.");
      refreshAgent(token);
    });
  }

  function applyResponsiblePlay(data: ResponsiblePlayStatus) {
    setResponsiblePlay(data);
    setEntryLimitDraft(data.maxEntries === null ? "" : String(data.maxEntries));
  }

  function saveEntryLimit() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const trimmed = entryLimitDraft.trim();
      const response = await fetch("/api/responsible-play", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxEntries: trimmed === "" ? null : Number(trimmed),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Could not save responsible play settings.");
        return;
      }

      applyResponsiblePlay(result as ResponsiblePlayStatus);
      setMessage(trimmed === "" ? "Entry limit cleared." : "Entry limit saved.");
    });
  }

  function activateSelfExclusion() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/responsible-play", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selfExclusion: selfExclusionDuration,
          reason: selfExclusionReason.trim() || undefined,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Could not activate self-exclusion.");
        return;
      }

      applyResponsiblePlay(result as ResponsiblePlayStatus);
      setSelfExclusionReason("");
      setMessage("Self-exclusion is active.");
    });
  }

  function buyTicket() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = (await response.json()) as { error?: string; ticketId?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not buy a ticket.");
        return;
      }

      setMessage("Ticket purchased. You can lock an entry now.");
      refreshStatus(token);
      refreshAgent(token);
    });
  }

  function redeemTicket() {
    const token = session?.access_token;
    const code = redeemCode.trim();

    if (!token || !code) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/tickets/claim", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const result = (await response.json()) as { error?: string; ticketId?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not redeem that code.");
        return;
      }

      setRedeemCode("");
      setMessage("Code redeemed. An entry ticket was added to your account.");
      refreshStatus(token);
    });
  }

  function transferTicket(confirm: boolean) {
    const token = session?.access_token;
    const email = transferEmail.trim().toLowerCase();
    if (!token || !email) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/tickets/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, confirm }),
      });
      const result = (await response.json()) as {
        error?: string;
        ticketId?: string;
        recipient?: TicketTransferRecipient;
        requiresConfirmation?: boolean;
      };

      if (!response.ok) {
        setError(result.error ?? "Could not transfer ticket.");
        setTransferRecipient(null);
        return;
      }

      if (result.requiresConfirmation && result.recipient) {
        setTransferRecipient(result.recipient);
        setMessage(`Account found: ${result.recipient.displayName ?? result.recipient.email}. Confirm to send one ticket.`);
        return;
      }

      setTransferEmail("");
      setTransferRecipient(null);
      setMessage("Ticket transferred. That player becomes your referral when they lock their first entry with this ticket.");
      refreshStatus(token);
    });
  }

  function transferAgentTicket(confirm: boolean) {
    const token = session?.access_token;
    const email = agentTransferEmail.trim().toLowerCase();
    if (!token || !email) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/agent/tickets/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, confirm }),
      });
      const result = (await response.json()) as {
        error?: string;
        ticketId?: string;
        recipient?: TicketTransferRecipient;
        requiresConfirmation?: boolean;
      };

      if (!response.ok) {
        setError(result.error ?? "Could not transfer agent ticket.");
        setAgentTransferRecipient(null);
        await refreshAgent(token);
        return;
      }

      if (result.requiresConfirmation && result.recipient) {
        setAgentTransferRecipient(result.recipient);
        setMessage(`Account found: ${result.recipient.displayName ?? result.recipient.email}. Confirm to send one agent ticket.`);
        return;
      }

      setAgentTransferEmail("");
      setAgentTransferRecipient(null);
      setMessage("Agent ticket transferred. The sale is tracked to your agent wallet; existing player referrals are not overwritten.");
      refreshAgent(token);
    });
  }

  async function copyAddress(address: string) {
    await navigator.clipboard.writeText(address);
    setMessage("Address copied.");
    window.setTimeout(() => setMessage(null), 1600);
  }

  async function copyText(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setMessage(`${label} copied.`);
    window.setTimeout(() => setMessage(null), 1600);
  }

  function submitDepositClaim() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    const amount = claimAmount.trim();
    const txHash = claimTxHash.trim();
    const senderWalletAddress = claimSenderWalletAddress.trim();

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/deposits/claims", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: claimNetwork,
          amount,
          senderWalletAddress,
          txHash,
        }),
      });
      const result = (await response.json()) as { error?: string; claim?: DepositClaim };

      if (!response.ok) {
        setError(result.error ?? "Could not submit deposit claim.");
        return;
      }

      if (result.claim) {
        setDepositClaims((current) => [result.claim!, ...current]);
        if (result.claim.senderWalletAddress) {
          setClaimSenderWalletAddress(result.claim.senderWalletAddress);
        }
      }
      setClaimAmount("");
      setClaimTxHash("");
      setMessage("Deposit claim submitted. Sending wallet saved to your account.");
    });
  }

  function submitWithdrawalRequest() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    const address = withdrawalAddress.trim();
    const amount = withdrawalAmount.trim();

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: withdrawalNetwork,
          address,
          amount,
        }),
      });
      const result = (await response.json()) as { error?: string; withdrawal?: WithdrawalRequestRow };

      if (!response.ok) {
        setError(result.error ?? "Could not submit withdrawal request.");
        return;
      }

      if (result.withdrawal) {
        setWithdrawals((current) => [result.withdrawal!, ...current]);
      }
      setWithdrawalAmount("");
      setWithdrawalAddress("");
      setMessage("Withdrawal request submitted for admin review.");
    });
  }

  function submitAgeDocs() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/age-verification", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      const result = (await response.json()) as WalletAgeVerification & { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not submit your age verification.");
        return;
      }

      setAgeVerification({
        status: result.status,
        note: result.note ?? null,
        submittedAt: result.submittedAt ?? null,
        verifiedAt: result.verifiedAt ?? null,
        contact: result.contact,
      });
      setMessage("Thanks — your documents are marked as sent. Withdrawals open after an admin confirms you are 18 or older.");
    });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Go to WorldCup26.world home">
          <span className="brand-mark">
            <Wallet size={20} />
          </span>
          <span>WorldCup Wallet</span>
        </Link>
        <SmartMenu>
          <nav className="nav nav--app" aria-label="Wallet navigation">
            <Link className="nav-item nav-item--primary" href={{ pathname: "/", hash: "pick" }}>
              <Ticket size={16} />
              <span className="nav-item__copy">
                <strong>Play</strong>
                <small>Pick teams</small>
              </span>
            </Link>
            <Link className="nav-item" href={{ pathname: "/", hash: "leaderboard" }}>
              <Trophy size={16} />
              <span className="nav-item__copy">
                <strong>Leaderboard</strong>
                <small>Ranking</small>
              </span>
            </Link>
            <details className="nav-more">
              <summary>
                <BookOpen size={16} />
                <span className="nav-item__copy">
                  <strong>Explore</strong>
                  <small>Rules & game</small>
                </span>
              </summary>
              <div className="nav-more__menu">
                <Link href={{ pathname: "/", hash: "rules" }}>
                  <BookOpen size={16} />
                  Rules
                </Link>
                <Link href={{ pathname: "/" }}>
                  <Trophy size={16} />
                  Game Home
                </Link>
              </div>
            </details>
            {signedIn ? (
              <Link className="nav-item nav-item--identity" href={{ pathname: "/", hash: "me" }}>
                <UserRound size={16} />
                <span className="nav-item__copy">
                  <strong>Account</strong>
                  <small>Your entry</small>
                </span>
              </Link>
            ) : (
              <Link className="nav-item nav-item--identity" href={{ pathname: "/login" }}>
                <Lock size={16} />
                <span className="nav-item__copy">
                  <strong>Login</strong>
                  <small>Start here</small>
                </span>
              </Link>
            )}
          </nav>
        </SmartMenu>
      </header>

      <div className="page">
        {launchEvidenceMode ? (
          <section className="launch-notice" aria-label="Wallet launch evidence mode">
            <div>
              <strong>Admin launch evidence mode</strong>
              <span>
                Public paid actions remain paused. This admin account can use TRC20/ERC20
                deposits and withdrawal requests to record real launch evidence.
              </span>
            </div>
            <Link className="button secondary" href={{ pathname: "/admin" }}>
              Open Admin
            </Link>
          </section>
        ) : publicPaidActionsPaused && signedIn && walletView === "user" && userHasEntryTicket ? (
          <section className="launch-notice" aria-label="User wallet ticket ready">
            <div>
              <strong>User Wallet ticket ready</strong>
              <span>
                You already have an entry ticket, so User Wallet USDT deposit and ticket-buy
                actions are hidden. Use Agent Wallet only for agent inventory deposits.
              </span>
            </div>
            <Link className="button secondary" href={{ pathname: "/", hash: "entry" }}>
              Lock entry
            </Link>
          </section>
        ) : publicPaidActionsPaused ? (
          <section className="launch-notice" aria-label="Wallet launch status">
            <div>
              <strong>Wallet paid actions paused</strong>
              <span>
                {signedIn && walletView === "user" && !accountStatusLoaded
                  ? "Loading your User Wallet ticket status before showing any deposit actions."
                  : signedIn && walletView === "agent"
                    ? "Agent USDT deposit proof is available for admin-reviewed agent inventory. Public user ticket purchases remain paused."
                    : "Login, referrals, and account setup are available. Tickets, USDT deposits, and withdrawals open after launch approvals are complete."}
              </span>
            </div>
            <Link className="button secondary" href={{ pathname: "/" }}>
              View teams
            </Link>
          </section>
        ) : null}

        {!signedIn ? (
          <section className="wallet-solo">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h1 className="panel-title">Wallet</h1>
                  <p className="panel-subtitle">
                    {publicPaidActionsPaused
                      ? "Sign in with Google to prepare your wallet. Paid actions open after launch approvals are complete."
                      : "Sign in with Google to deposit USDT and buy tickets."}
                  </p>
                </div>
                <Lock size={18} color="var(--green)" />
              </div>
              <div className="panel-body">
                <div className="wallet-action-list" aria-label="Wallet setup steps">
                  <div>
                    <span>1</span>
                    <strong>Create account</strong>
                    <small>Referral is resolved before Google sign-in.</small>
                  </div>
                  <div>
                    <span>2</span>
                    <strong>Get tickets</strong>
                    <small>Buy or redeem an entry ticket when paid actions open.</small>
                  </div>
                  <div>
                    <span>3</span>
                    <strong>Deposit / withdraw</strong>
                    <small>Use USDT queues with admin review and audit notes.</small>
                  </div>
                </div>
                <Link className="button" href={{ pathname: "/login" }}>
                  Login / Register
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="wallet-workspace" aria-label="Wallet workspace">
            <div className="wallet-view-switch" role="tablist" aria-label="Wallet type">
              <button
                aria-selected={walletView === "user"}
                className={`wallet-view-tab ${walletView === "user" ? "active" : ""}`}
                onClick={() => setWalletView("user")}
                role="tab"
                type="button"
              >
                <Wallet size={18} />
                <span>User Wallet</span>
                <small>USDT, tickets, transfer</small>
              </button>
              <button
                aria-selected={walletView === "agent"}
                className={`wallet-view-tab ${walletView === "agent" ? "active" : ""}`}
                onClick={() => setWalletView("agent")}
                role="tab"
                type="button"
              >
                <Gift size={18} />
                <span>Agent Wallet</span>
                <small>Sell tickets, requests</small>
              </button>
            </div>
            <div className={`wallet-grid wallet-grid--${walletView}`}>
            <div className={`panel ${walletView === "agent" ? "wallet-panel-hidden" : ""}`} id="tickets">
              <div className="panel-header">
                <div>
                  <h1 className="panel-title">User Wallet</h1>
                  <p className="panel-subtitle">
                    USDT balance, entry tickets, and ticket transfer to friends.
                  </p>
                </div>
                <CircleDollarSign size={18} color="var(--gold)" />
              </div>
              <div className="panel-body">
                <div className="wallet-balance-grid">
                  <div className="wallet-balance-card wallet-balance-card--usdt">
                    <span>Wallet balance</span>
                    <strong>{formatLedgerAmount(status?.walletBalance ?? 0)}</strong>
                    <small>USDT</small>
                  </div>
                  <div className="wallet-balance-card wallet-balance-card--ticket">
                    <span>Tickets available</span>
                    <strong>{status?.ticketsAvailable ?? 0}</strong>
                    <small>{status?.ticketsAssigned ?? 0} total</small>
                  </div>
                  <div className="wallet-balance-card wallet-balance-card--price">
                    <span>Ticket price</span>
                    <strong>{formatMoneyAmount(status?.ticketPriceAmount ?? 0)}</strong>
                    <small>per entry</small>
                  </div>
                </div>
                <div className="wallet-ticket-math">
                  <Ticket size={18} aria-hidden="true" />
                  <div>
                    <strong>
                      {!accountStatusLoaded
                        ? "Loading your ticket balance..."
                        : userHasEntryTicket
                        ? "Your personal entry ticket is ready. Lock your teams from Play."
                        : purchasableTickets > 0
                        ? `${purchasableTickets} ticket${purchasableTickets === 1 ? "" : "s"} can be made from your current USDT balance.`
                        : "Deposit USDT. Full ticket-price chunks convert into tickets automatically."}
                    </strong>
                    <span>
                      {!accountStatusLoaded
                        ? "Deposit actions stay hidden until your wallet status is loaded."
                        : userHasEntryTicket
                        ? "User Wallet deposits are hidden once your entry ticket is available. Use Agent Wallet for agent inventory deposits."
                        : "Example: 100 USDT becomes 2 tickets at 50 USDT each. Use one for your entry and transfer the extra ticket to a friend by email."}
                    </span>
                    {userNeedsEntryTicket && ticketPrice > 0 ? (
                      <small>
                        After buying the next ticket, estimated USDT left: {formatLedgerAmount(remainingAfterNextTicket)}.
                      </small>
                    ) : null}
                  </div>
                </div>
                <div className="wallet-action-list compact wallet-action-list--steps" aria-label="Wallet next actions">
                  <div>
                    <span>Ticket</span>
                    <strong>{userHasEntryTicket ? "Ticket ready" : "Buy or redeem"}</strong>
                    <small>
                      {userHasEntryTicket
                        ? "Use your ticket to lock one entry."
                        : "Required before locking an entry."}
                    </small>
                  </div>
                  <div>
                    <span>Friend</span>
                    <strong>Transfer ticket</strong>
                    <small>Email must already have a WorldCup account.</small>
                  </div>
                </div>
                {userNeedsEntryTicket ? (
                  <button
                    className="button"
                    disabled={Boolean(ticketRestriction || ticketPolicyPause) || isPending}
                    onClick={buyTicket}
                    type="button"
                  >
                    <Lock size={16} />
                    {isPending ? "Processing..." : "Buy entry ticket"}
                  </button>
                ) : null}
                <div className="redeem-row">
                  <label htmlFor="redeem-code">Have a ticket code?</label>
                  <div className="redeem-input">
                    <input
                      className="search"
                      id="redeem-code"
                      maxLength={32}
                      placeholder="Enter code"
                      value={redeemCode}
                      onChange={(event) => setRedeemCode(event.target.value.toUpperCase())}
                    />
                    <button
                      className="button secondary"
                      disabled={isPending || redeemCode.trim().length === 0}
                      onClick={redeemTicket}
                      type="button"
                    >
                      <Ticket size={16} />
                      Redeem
                    </button>
                  </div>
                </div>
                {userNeedsEntryTicket && ticketPolicyPause ? (
                  <div className="message error">{ticketPolicyPause}</div>
                ) : null}
                {userNeedsEntryTicket && ticketRestriction ? (
                  <div className="message error">{ticketRestriction}</div>
                ) : null}
                <div className="ticket-transfer-box">
                  <div>
                    <strong>Transfer ticket to a friend</strong>
                    <span>
                      Step 1: enter their account email. Step 2: confirm the transfer. When they use that ticket, they are tracked as your referral.
                    </span>
                  </div>
                  <div className="redeem-row">
                    <label htmlFor="ticket-transfer-email">Friend email</label>
                    <div className="redeem-input">
                      <input
                        className="search"
                        id="ticket-transfer-email"
                        inputMode="email"
                        placeholder="friend@email.com"
                        value={transferEmail}
                        onChange={(event) => {
                          setTransferEmail(event.target.value);
                          setTransferRecipient(null);
                        }}
                      />
                      <button
                        className="button secondary"
                        disabled={
                          isPending ||
                          transferEmail.trim().length === 0 ||
                          (status?.ticketsAvailable ?? 0) < 1 ||
                          Boolean(ticketRestriction || ticketPolicyPause)
                        }
                        onClick={() => transferTicket(false)}
                        type="button"
                      >
                        Find
                      </button>
                    </div>
                  </div>
                  {transferRecipient ? (
                    <div className="transfer-confirm-card">
                      <div>
                        <span>Account found</span>
                        <strong>{transferRecipient.displayName ?? transferRecipient.email}</strong>
                        <small>{transferRecipient.email}</small>
                      </div>
                      <button
                        className="button"
                        disabled={isPending || (status?.ticketsAvailable ?? 0) < 1}
                        onClick={() => transferTicket(true)}
                        type="button"
                      >
                        <Send size={16} />
                        Send 1 ticket
                      </button>
                    </div>
                  ) : null}
                  {(status?.ticketsAvailable ?? 0) < 1 ? (
                    <div className="field-note">You need at least one available ticket before transferring.</div>
                  ) : null}
                </div>
                {message ? <div className="message">{message}</div> : null}
                {error ? <div className="message error">{error}</div> : null}
              </div>
            </div>

            <div className={`panel ${walletView === "agent" ? "wallet-panel-hidden" : ""}`}>
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Responsible Play</h2>
                  <p className="panel-subtitle">Set account limits before buying tickets or depositing.</p>
                </div>
                <ShieldCheck size={18} color="var(--green)" />
              </div>
              <div className="responsible-play-content">
                {responsiblePlay?.selfExcluded ? (
                  <div className="message error">
                    Self-exclusion is active until{" "}
                    {responsiblePlay.selfExcludedUntil
                      ? new Date(responsiblePlay.selfExcludedUntil).toLocaleString()
                      : "the selected end date"}
                    .
                  </div>
                ) : (
                  <div className="message">
                    These settings are enforced on deposits, ticket purchases, admin ticket assignment,
                    and entry locking.
                  </div>
                )}
                <div className="responsible-play-controls">
                  <div className="field">
                    <label htmlFor="entry-limit">Entry-ticket limit</label>
                    <input
                      id="entry-limit"
                      max="10"
                      min="0"
                      placeholder="No limit"
                      type="number"
                      value={entryLimitDraft}
                      onChange={(event) => setEntryLimitDraft(event.target.value)}
                    />
                    <div className="field-note">
                      Current tickets: {responsiblePlay?.ticketsReserved ?? 0}. Current entries:{" "}
                      {responsiblePlay?.entriesUsed ?? 0}.
                    </div>
                  </div>
                  <button className="button secondary" disabled={isPending} onClick={saveEntryLimit} type="button">
                    Save limit
                  </button>
                  <div className="field">
                    <label htmlFor="self-exclusion-duration">Self-exclusion</label>
                    <select
                      id="self-exclusion-duration"
                      value={selfExclusionDuration}
                      onChange={(event) => setSelfExclusionDuration(event.target.value)}
                    >
                      <option value="24h">24 hours</option>
                      <option value="7d">7 days</option>
                      <option value="30d">30 days</option>
                      <option value="season">Rest of tournament</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="self-exclusion-reason">Note</label>
                    <input
                      id="self-exclusion-reason"
                      maxLength={300}
                      placeholder="Optional"
                      value={selfExclusionReason}
                      onChange={(event) => setSelfExclusionReason(event.target.value)}
                    />
                  </div>
                  <button className="button danger" disabled={isPending} onClick={activateSelfExclusion} type="button">
                    Activate self-exclusion
                  </button>
                </div>
                <div className="support-links" aria-label="Responsible play support resources">
                  {(responsiblePlay?.supportResources ?? [
                    { label: "NCPG help and treatment", url: "https://www.ncpgambling.org/help-treatment/" },
                    { label: "Gambling Therapy support", url: "https://www.gamblingtherapy.org/" },
                  ]).map((resource) => (
                    <a href={resource.url} key={resource.url} rel="noreferrer" target="_blank">
                      {resource.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {userNeedsEntryTicket ? (
            <div className={`panel ${walletView === "agent" ? "wallet-panel-hidden" : ""}`}>
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Deposit USDT</h2>
                  <p className="panel-subtitle">
                    {sharedDepositAddresses
                      ? "Send only USDT on the matching network and keep the transaction hash."
                      : "Send only USDT on the matching network. Deposits credit your wallet after on-chain confirmation."}
                  </p>
                </div>
                <QrCode size={18} color="var(--green)" />
              </div>
              {sharedDepositAddresses ? (
                <div className="message">
                  Shared receive wallet. Save the wallet address you send from and keep your
                  transaction hash so the deposit can be matched to your account. Deposit claims
                  are tied to {depositClaimAccountLabel}.
                </div>
              ) : null}
              {depositPolicyPause ? (
                <div className="message error">{depositPolicyPause}</div>
              ) : depositsConfigured === false ? (
                <div className="message">
                  USDT deposits are not enabled yet. Check back soon.
                </div>
              ) : addresses.length === 0 ? (
                <div className="field-note">Generating your deposit addresses…</div>
              ) : (
                <div className="deposit-list">
                  {addresses.map((entry) => {
                    const explorerUrl = getDepositExplorerAddressUrl(entry.network, entry.address);

                    return (
                      <div className="deposit-row" key={entry.network}>
                        {entry.qrCodePath ? (
                          <Image
                            alt={`${entry.label} deposit QR code`}
                            className="deposit-qr"
                            height={116}
                            src={entry.qrCodePath}
                            unoptimized
                            width={116}
                          />
                        ) : null}
                        <div className="deposit-meta">
                          <span className="pick-slot-label">{entry.label}</span>
                          <code className="deposit-address">{entry.address}</code>
                          {entry.memo ? <small>Memo: {entry.memo}</small> : null}
                          {entry.shared ? <small>Main KuCoin receive wallet</small> : null}
                          {explorerUrl ? (
                            <a
                              className="deposit-explorer-link"
                              href={explorerUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              View receive wallet
                            </a>
                          ) : null}
                        </div>
                        <button
                          className="button secondary"
                          onClick={() => copyAddress(entry.address)}
                          type="button"
                        >
                          <Copy size={16} />
                          Copy
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="field-note">
                Only send USDT on the exact network shown. Sending any other asset or network may
                result in permanent loss.
              </div>
              {sharedDepositAddresses ? (
                <div className="deposit-claim-box">
                  <div className="panel-header compact">
                    <div>
                      <h3 className="panel-title">Submit transaction</h3>
                      <p className="panel-subtitle">
                        Paste the wallet you sent from and the transaction hash after sending USDT.
                        Admins use both before crediting your balance.
                      </p>
                    </div>
                    <Send size={18} color="var(--green)" />
                  </div>
                  <div className="deposit-flow-steps" aria-label="Deposit claim steps">
                    <div>
                      <span>1</span>
                      <strong>Copy receive wallet</strong>
                      <small>Use the exact network shown above.</small>
                    </div>
                    <div>
                      <span>2</span>
                      <strong>Send USDT</strong>
                      <small>Save the wallet you sent from.</small>
                    </div>
                    <div>
                      <span>3</span>
                      <strong>Submit proof</strong>
                      <small>Paste amount, sender wallet, and tx hash.</small>
                    </div>
                  </div>
                  <div className="deposit-claim-form">
                    {depositPolicyPause ? (
                      <div className="message error full-width">{depositPolicyPause}</div>
                    ) : null}
                    {depositRestriction ? (
                      <div className="message error full-width">{depositRestriction}</div>
                    ) : null}
                    <div className="field">
                      <label htmlFor="claim-network">Network</label>
                      <select
                        id="claim-network"
                        value={claimNetwork}
                        onChange={(event) => setClaimNetwork(event.target.value)}
                      >
                        <option value="trc20">TRC20</option>
                        <option value="erc20">ERC20</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="claim-amount">Amount sent</label>
                      <input
                        id="claim-amount"
                        min="0"
                        step="0.000001"
                        type="number"
                        value={claimAmount}
                        onChange={(event) => setClaimAmount(event.target.value)}
                      />
                    </div>
                    <div className="field full-width">
                      <label htmlFor="claim-sender-wallet">Sending wallet address</label>
                      <input
                        id="claim-sender-wallet"
                        value={claimSenderWalletAddress}
                        onChange={(event) => setClaimSenderWalletAddress(event.target.value)}
                        placeholder={claimNetwork === "trc20" ? "TRC20 wallet starts with T" : "ERC20 wallet starts with 0x"}
                      />
                      <div className="field-note">
                        Saved to your account for manual ticket/payment matching after USDT is received.
                      </div>
                    </div>
                    <div className="field full-width">
                      <label htmlFor="claim-tx">Transaction hash</label>
                      <input
                        id="claim-tx"
                        value={claimTxHash}
                        onChange={(event) => setClaimTxHash(event.target.value)}
                        placeholder="Paste tx hash"
                      />
                    </div>
                    <button
                      className="button secondary"
                      disabled={
                        !claimAmount ||
                        !claimSenderWalletAddress ||
                        !claimTxHash ||
                        Boolean(depositRestriction || depositPolicyPause) ||
                        isPending
                      }
                      onClick={submitDepositClaim}
                      type="button"
                    >
                      <Send size={16} />
                      Submit Claim
                    </button>
                  </div>
                  {depositClaims.length > 0 ? (
                    <div className="deposit-claim-list">
                      {depositClaims.map((claim) => {
                        const explorerUrl = getDepositExplorerTxUrl(claim.network, claim.txHash);
                        const receiveWalletUrl = getDepositExplorerAddressUrl(claim.network, claim.address);
                        const senderWalletUrl = claim.senderWalletAddress
                          ? getDepositExplorerAddressUrl(claim.network, claim.senderWalletAddress)
                          : null;

                        return (
                          <div className="deposit-claim-row" key={claim.id}>
                            <div>
                              <strong>
                                {formatLedgerAmount(claim.amount)} {claim.currency} · {claim.network.toUpperCase()}
                              </strong>
                              {claim.senderWalletAddress ? (
                                <>
                                  <span>Sent from</span>
                                  <code>{claim.senderWalletAddress}</code>
                                  {senderWalletUrl ? (
                                    <a
                                      className="deposit-explorer-link"
                                      href={senderWalletUrl}
                                      rel="noreferrer"
                                      target="_blank"
                                    >
                                      View sending wallet
                                    </a>
                                  ) : null}
                                </>
                              ) : null}
                              <span>Received by WorldCup</span>
                              <code>{claim.address}</code>
                              {receiveWalletUrl ? (
                                <a
                                  className="deposit-explorer-link"
                                  href={receiveWalletUrl}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  View receive wallet
                                </a>
                              ) : null}
                              <code>{claim.txHash}</code>
                              {explorerUrl ? (
                                <a
                                  className="deposit-explorer-link"
                                  href={explorerUrl}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  View transaction
                                </a>
                              ) : null}
                              {claim.adminNote ? <small>{claim.adminNote}</small> : null}
                            </div>
                            <span className={`claim-status ${claim.status}`}>{claim.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            ) : null}

            <div className={`panel ${walletView === "agent" ? "wallet-panel-hidden" : ""}`}>
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Withdraw USDT</h2>
                  <p className="panel-subtitle">
                    Request a payout after admin KYC/AML and manual transfer review.
                  </p>
                </div>
                <Upload size={18} color="var(--green)" />
              </div>
              <div className="withdrawal-box">
                <div className="message">
                  Withdrawals are not automatic. Admins review the request, record the wallet
                  debit, then mark the external transfer as paid with its transaction hash.
                </div>
                {withdrawalPolicyPause ? (
                  <div className="message error">{withdrawalPolicyPause}</div>
                ) : null}
                {ageVerification && ageVerification.status !== "verified" ? (
                  <div className={`message${ageVerification.status === "rejected" ? " error" : ""}`}>
                    <strong>Confirm you are 18 or older to withdraw</strong>
                    <p>
                      {ageVerification.status === "pending"
                        ? "Your documents are under review. Withdrawals open once an admin confirms you are 18 or older."
                        : `Send a government photo ID to ${ageVerification.contact}, then tap the button below so an admin can review it.`}
                    </p>
                    {ageVerification.note ? <small>{ageVerification.note}</small> : null}
                    {ageVerification.status !== "pending" ? (
                      <button
                        className="button secondary"
                        disabled={isPending}
                        onClick={submitAgeDocs}
                        type="button"
                      >
                        I&apos;ve sent my documents
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <div className="deposit-claim-form">
                  <div className="field">
                    <label htmlFor="withdrawal-network">Network</label>
                    <select
                      id="withdrawal-network"
                      value={withdrawalNetwork}
                      onChange={(event) => setWithdrawalNetwork(event.target.value)}
                    >
                      <option value="trc20">TRC20</option>
                      <option value="erc20">ERC20</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="withdrawal-amount">Amount</label>
                    <input
                      id="withdrawal-amount"
                      inputMode="decimal"
                      min="0"
                      step="0.000001"
                      type="number"
                      value={withdrawalAmount}
                      onChange={(event) => setWithdrawalAmount(event.target.value)}
                    />
                  </div>
                  <div className="field full-width">
                    <label htmlFor="withdrawal-address">Receive address</label>
                    <input
                      id="withdrawal-address"
                      value={withdrawalAddress}
                      onChange={(event) => setWithdrawalAddress(event.target.value)}
                      placeholder={withdrawalNetwork === "trc20" ? "TRC20 address starts with T" : "ERC20 address starts with 0x"}
                    />
                  </div>
                  <button
                    className="button secondary"
                    disabled={
                      !withdrawalAmount ||
                      !withdrawalAddress ||
                      Boolean(withdrawalPolicyPause) ||
                      ageVerification?.status !== "verified" ||
                      isPending
                    }
                    onClick={submitWithdrawalRequest}
                    type="button"
                  >
                    <Upload size={16} />
                    Request Withdrawal
                  </button>
                </div>
                {withdrawals.length > 0 ? (
                  <div className="deposit-claim-list">
                    {withdrawals.map((withdrawal) => {
                      const explorerUrl =
                        withdrawal.externalTxHash
                          ? getWithdrawalExplorerTxUrl(withdrawal.network, withdrawal.externalTxHash)
                          : null;

                      return (
                        <div className="deposit-claim-row" key={withdrawal.id}>
                          <div>
                            <strong>
                              {formatLedgerAmount(withdrawal.amount)} {withdrawal.currency} ·{" "}
                              {withdrawal.network.toUpperCase()}
                            </strong>
                            <code>{withdrawal.address}</code>
                            {withdrawal.externalTxHash ? <code>{withdrawal.externalTxHash}</code> : null}
                            {explorerUrl ? (
                              <a
                                className="deposit-explorer-link"
                                href={explorerUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                View payout transaction
                              </a>
                            ) : null}
                            {withdrawal.adminNote ? <small>{withdrawal.adminNote}</small> : null}
                          </div>
                          <span className={`claim-status ${withdrawal.status}`}>{withdrawal.status}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            {signedIn ? (
              <div className={`panel wallet-wide agent-wallet-card ${walletView === "user" ? "wallet-panel-hidden" : ""}`}>
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Agent Wallet</h2>
                    <p className="panel-subtitle">
                      {agent?.isAgent
                        ? "Transfer tickets to users, track code inventory, and manage Agent Call requests."
                        : "Apply to sell tickets. Agent tools unlock after your first personal ticket is bought or assigned."}
                    </p>
                  </div>
                  {agent?.isAgent ? (
                    <Gift size={18} color="var(--gold)" />
                  ) : (
                    <UserPlus size={18} color="var(--green)" />
                  )}
                </div>
                <div className="panel-body">
                  <div className="agent-revenue-box">
                    <div>
                      <Gift size={18} aria-hidden="true" />
                      <strong>10 paid tickets = 1 free ticket</strong>
                      <span>Pay upfront for tickets, sell them to players, and receive one commission ticket for every ten paid tickets assigned.</span>
                    </div>
                    <div>
                      <UserPlus size={18} aria-hidden="true" />
                      <strong>5% referral upside</strong>
                      <span>If a player has no inviter, the agent ticket makes you their inviter and upgrades their own future referral rate to 5%. Existing inviter referrals are never overwritten.</span>
                    </div>
                  </div>
                  <div className="agent-deposit-box">
                    <div className="panel-header compact">
                      <div>
                        <h3 className="panel-title">Deposit USDT for agent tickets</h3>
                        <p className="panel-subtitle">
                          Send USDT, submit the proof, then admin assigns paid agent tickets after manual approval.
                        </p>
                      </div>
                      <QrCode size={18} color="var(--gold)" />
                    </div>
                    {depositPolicyPause ? (
                      <div className="message error">{depositPolicyPause}</div>
                    ) : depositsConfigured === false ? (
                      <div className="message">USDT deposits are not enabled yet. Check back soon.</div>
                    ) : addresses.length === 0 ? (
                      <div className="field-note">Generating your agent deposit address...</div>
                    ) : (
                      <>
                        <div className="deposit-list agent-deposit-list">
                          {addresses.map((entry) => {
                            const explorerUrl = getDepositExplorerAddressUrl(entry.network, entry.address);

                            return (
                              <div className="deposit-row" key={`agent-${entry.network}`}>
                                {entry.qrCodePath ? (
                                  <Image
                                    alt={`${entry.label} agent deposit QR code`}
                                    className="deposit-qr"
                                    height={116}
                                    src={entry.qrCodePath}
                                    unoptimized
                                    width={116}
                                  />
                                ) : null}
                                <div className="deposit-meta">
                                  <span className="pick-slot-label">{entry.label}</span>
                                  <code className="deposit-address">{entry.address}</code>
                                  {entry.memo ? <small>Memo: {entry.memo}</small> : null}
                                  {entry.shared ? <small>Main KuCoin receive wallet</small> : null}
                                  {explorerUrl ? (
                                    <a
                                      className="deposit-explorer-link"
                                      href={explorerUrl}
                                      rel="noreferrer"
                                      target="_blank"
                                    >
                                      View receive wallet
                                    </a>
                                  ) : null}
                                </div>
                                <button
                                  className="button secondary"
                                  onClick={() => copyAddress(entry.address)}
                                  type="button"
                                >
                                  <Copy size={16} />
                                  Copy
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="deposit-claim-form agent-deposit-form">
                          <div className="message full-width">
                            This proof is for agent inventory. Admin uses it before assigning paid agent tickets.
                          </div>
                          {depositRestriction ? (
                            <div className="message error full-width">{depositRestriction}</div>
                          ) : null}
                          <div className="field">
                            <label htmlFor="agent-claim-network">Network</label>
                            <select
                              id="agent-claim-network"
                              value={claimNetwork}
                              onChange={(event) => setClaimNetwork(event.target.value)}
                            >
                              <option value="trc20">TRC20</option>
                              <option value="erc20">ERC20</option>
                            </select>
                          </div>
                          <div className="field">
                            <label htmlFor="agent-claim-amount">Amount sent</label>
                            <input
                              id="agent-claim-amount"
                              min="0"
                              step="0.000001"
                              type="number"
                              value={claimAmount}
                              onChange={(event) => setClaimAmount(event.target.value)}
                            />
                          </div>
                          <div className="field full-width">
                            <label htmlFor="agent-claim-sender-wallet">Sending wallet address</label>
                            <input
                              id="agent-claim-sender-wallet"
                              value={claimSenderWalletAddress}
                              onChange={(event) => setClaimSenderWalletAddress(event.target.value)}
                              placeholder={claimNetwork === "trc20" ? "TRC20 wallet starts with T" : "ERC20 wallet starts with 0x"}
                            />
                          </div>
                          <div className="field full-width">
                            <label htmlFor="agent-claim-tx">Transaction hash</label>
                            <input
                              id="agent-claim-tx"
                              value={claimTxHash}
                              onChange={(event) => setClaimTxHash(event.target.value)}
                              placeholder="Paste tx hash"
                            />
                          </div>
                          <button
                            className="button secondary"
                            disabled={
                              !claimAmount ||
                              !claimSenderWalletAddress ||
                              !claimTxHash ||
                              Boolean(depositRestriction || depositPolicyPause) ||
                              isPending
                            }
                            onClick={submitDepositClaim}
                            type="button"
                          >
                            <Send size={16} />
                            Submit agent deposit proof
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  {!agent?.isAgent ? (
                    <div className="agent-register-box">
                      {agent?.applicationStatus === "pending" ? (
                        <div className="message">
                          Agent registration received. Buy one ticket with USDT or receive one from admin or an agent to activate your agent account.
                        </div>
                      ) : null}
                      <div className="deposit-claim-form">
                        <div className="field">
                          <label htmlFor="agent-name">Agent name</label>
                          <input
                            id="agent-name"
                            value={agentName}
                            onChange={(event) => setAgentName(event.target.value)}
                            placeholder="Your public agent name"
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="agent-whatsapp">WhatsApp number</label>
                          <input
                            id="agent-whatsapp"
                            inputMode="tel"
                            value={agentWhatsapp}
                            onChange={(event) => setAgentWhatsapp(event.target.value)}
                            placeholder="+40 700 000 000"
                          />
                        </div>
                        <button
                          className="button secondary"
                          disabled={!agentName.trim() || !agentWhatsapp.trim() || isPending}
                          onClick={registerAsAgent}
                          type="button"
                        >
                          <Phone size={16} />
                          {agent?.applicationStatus === "pending" ? "Update Agent Details" : "Be an Agent"}
                        </button>
                      </div>
                      <div className="agent-activation-guide">
                        <strong>Activation steps</strong>
                        <div>
                          <span>1</span>
                          <small>Create your agent username and WhatsApp contact.</small>
                        </div>
                        <div>
                          <span>2</span>
                          <small>Buy one ticket with USDT, or receive a ticket from admin or an agent.</small>
                        </div>
                        <div>
                          <span>3</span>
                          <small>Your first ticket stays in your user account. Any extra admin-assigned agent tickets become sellable inventory.</small>
                        </div>
                      </div>
                      <div className="message error">
                        Transfer ticket to users is locked until admin activates your agent wallet.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="account-status-grid agent-stats">
                        <div>
                          <span>Available codes</span>
                          <strong>{agent.availableCount}</strong>
                          <small>{agent.redeemedCount} redeemed</small>
                        </div>
                        <div>
                          <span>Paid tickets</span>
                          <strong>{agent.paidTickets}</strong>
                          <small>{agent.commissionTickets} free earned</small>
                        </div>
                        <div>
                          <span>Commission cycle</span>
                          <strong>{agent.progressInCycle}/10</strong>
                          <small>one free per ten paid</small>
                        </div>
                      </div>
                      <div
                        aria-label={`${agent.progressInCycle} of 10 paid tickets in this commission cycle`}
                        aria-valuemax={10}
                        aria-valuemin={0}
                        aria-valuenow={agent.progressInCycle}
                        className="commission-bar"
                        role="progressbar"
                      >
                        <span style={{ width: `${(agent.progressInCycle / 10) * 100}%` }} />
                      </div>
                      <div className="ticket-transfer-box agent-transfer-box">
                        <div>
                          <strong>Transfer ticket to a user</strong>
                          <span>
                            Enter the player email. If they have no inviter, this ticket makes you their inviter and upgrades their own future referral rate to 5%. Existing inviter referrals are not overwritten.
                          </span>
                        </div>
                        <div className="redeem-row">
                          <label htmlFor="agent-ticket-transfer-email">User email</label>
                          <div className="redeem-input">
                            <input
                              className="search"
                              id="agent-ticket-transfer-email"
                              inputMode="email"
                              placeholder="player@email.com"
                              value={agentTransferEmail}
                              onChange={(event) => {
                                setAgentTransferEmail(event.target.value);
                                setAgentTransferRecipient(null);
                              }}
                            />
                            <button
                              className="button secondary"
                              disabled={isPending || agentTransferEmail.trim().length === 0 || agent.availableCount < 1}
                              onClick={() => transferAgentTicket(false)}
                              type="button"
                            >
                              Find
                            </button>
                          </div>
                        </div>
                        {agentTransferRecipient ? (
                          <div className="transfer-confirm-card">
                            <div>
                              <span>Account found</span>
                              <strong>{agentTransferRecipient.displayName ?? agentTransferRecipient.email}</strong>
                              <small>{agentTransferRecipient.email}</small>
                            </div>
                            <button
                              className="button"
                              disabled={isPending || agent.availableCount < 1}
                              onClick={() => transferAgentTicket(true)}
                              type="button"
                            >
                              <Send size={16} />
                              Send 1 agent ticket
                            </button>
                          </div>
                        ) : null}
                        {agent.availableCount < 1 ? (
                          <div className="message error">
                            You need available agent tickets before transferring to users.
                          </div>
                        ) : null}
                      </div>
                      {agent.availableCodes.length === 0 ? (
                        <div className="field-note">No available codes assigned right now.</div>
                      ) : (
                        <div className="code-list">
                          {agent.availableCodes.map((entry) => (
                            <div className="code-row" key={entry.code}>
                              <span className="code-value">{entry.code}</span>
                              <span className="code-tag">{entry.kind}</span>
                              <button
                                className="button secondary"
                                onClick={() => copyText(entry.code, "Code")}
                                type="button"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="agent-request-section">
                        <div>
                          <strong>Agent Call requests</strong>
                          <span>Accept only after you received the player payment. Requests expire after 24 hours.</span>
                        </div>
                        {agent.ticketRequests.filter((request) => request.status === "pending").length === 0 ? (
                          <div className="field-note">No pending Agent Call requests.</div>
                        ) : (
                          <div className="agent-request-list">
                            {agent.ticketRequests
                              .filter((request) => request.status === "pending")
                              .map((request) => (
                                <div className="agent-request-row" key={request.id}>
                                  <div>
                                    <strong>{request.requesterDisplayName}</strong>
                                    <span>{request.requesterEmail ?? "No email"}</span>
                                    <small>Expires {new Date(request.expiresAt).toLocaleString()}</small>
                                  </div>
                                  <button
                                    className="button"
                                    disabled={agent.availableCount < 1 || isPending}
                                    onClick={() => acceptAgentTicketRequest(request.id)}
                                    type="button"
                                  >
                                    <Ticket size={16} />
                                    Accept
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                        {agent.availableCount < 1 ? (
                          <div className="message error">
                            You need available agent tickets before accepting requests. Pending requests stay open until they expire.
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}
                  {walletView === "agent" && message ? <div className="message">{message}</div> : null}
                  {walletView === "agent" && error ? <div className="message error">{error}</div> : null}
                </div>
              </div>
            ) : null}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function getGatePauseMessage(gate: PaidActionGate | undefined) {
  return gate && !gate.allowed ? "Paid actions open after launch approvals are complete." : null;
}
