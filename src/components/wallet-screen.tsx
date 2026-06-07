"use client";

import {
  BookOpen,
  CircleDollarSign,
  Copy,
  ClipboardPaste,
  Gift,
  Lock,
  MessageCircle,
  Phone,
  QrCode,
  RefreshCw,
  Send,
  ShieldCheck,
  Ticket,
  Trophy,
  UserPlus,
  UserRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { SmartMenu } from "@/components/smart-menu";
import {
  formatMaskedWalletAddress,
  getDepositNetworkShortLabel,
  getDepositExplorerAddressUrl,
  getDepositExplorerTxUrl,
} from "@/lib/deposits";
import type { DepositNetwork } from "@/lib/deposits";
import { formatLedgerAmount, formatMoneyAmount } from "@/lib/economy";
import { buildSupportWhatsAppUrl, SUPPORT_WHATSAPP_URL } from "@/lib/support";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type {
  MyAccountStatus,
  PaidActionGate,
  PaidActionGates,
} from "@/lib/types";
import {
  normalizeWorldCupTicketPriceAmount,
  normalizeWorldCupTicketPriceNumber,
} from "@/lib/worldcup-ticket-price";
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

const ownerAdminEmail = "semebitcoin@gmail.com";
const depositNetworkOptions: DepositNetwork[] = ["trc20", "erc20"];

function toDepositNetwork(value: string): DepositNetwork {
  return value === "erc20" ? "erc20" : "trc20";
}

function toKnownDepositNetwork(value: string): DepositNetwork | null {
  if (value === "trc20" || value === "erc20") return value;
  return null;
}

export function WalletScreen({ publicPaidActionGates }: WalletScreenProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<MyAccountStatus | null>(null);
  const [addresses, setAddresses] = useState<DepositAddress[]>([]);
  const [depositsConfigured, setDepositsConfigured] = useState<boolean | null>(null);
  const [sharedDepositAddresses, setSharedDepositAddresses] = useState(false);
  const [depositClaims, setDepositClaims] = useState<DepositClaim[]>([]);
  const [claimNetwork, setClaimNetwork] = useState<DepositNetwork>("trc20");
  const [claimAmount, setClaimAmount] = useState("");
  const [claimSenderWalletAddress, setClaimSenderWalletAddress] = useState("");
  const [senderWalletReview, setSenderWalletReview] = useState<{
    network: DepositNetwork;
    address: string;
  } | null>(null);
  const [claimTxHash, setClaimTxHash] = useState("");
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPending, startTransition] = useTransition();
  const senderWalletSetupRef = useRef<HTMLDivElement | null>(null);

  const signedIn = Boolean(session?.access_token && session.user.email);
  const showAdminNav = session?.user.email?.trim().toLowerCase() === ownerAdminEmail;
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
  const ticketPrice = normalizeWorldCupTicketPriceNumber(status?.ticketPriceAmount);
  const walletBalance = Number(status?.walletBalance ?? 0);
  const accountStatusLoaded = status !== null;
  const userTicketsAvailable = status?.ticketsAvailable ?? 0;
  const userTicketsAssigned = status?.ticketsAssigned ?? 0;
  const userEntryStatus = status?.entry?.status ?? null;
  const userHasAvailableEntryTicket = userTicketsAvailable > 0;
  const userHasPersonalTicketRecord =
    userTicketsAssigned > 0 || userHasAvailableEntryTicket || Boolean(userEntryStatus);
  const userNeedsEntryTicket = accountStatusLoaded && !userHasPersonalTicketRecord;
  const savedSenderWallets = useMemo(
    () => ({
      trc20:
        status?.usdtSenderWalletTrc20Address ??
        (status?.usdtSenderWalletNetwork === "trc20"
          ? status.usdtSenderWalletAddress ?? null
          : null),
      erc20:
        status?.usdtSenderWalletErc20Address ??
        (status?.usdtSenderWalletNetwork === "erc20"
          ? status.usdtSenderWalletAddress ?? null
          : null),
    }),
    [status],
  );
  const lockedClaimSenderWallet = savedSenderWallets[claimNetwork];
  const hasLockedSenderWallet = depositNetworkOptions.some((network) => Boolean(savedSenderWallets[network]));
  const lockedDepositAddresses = useMemo(
    () =>
      addresses.filter((entry) => {
        const network = toKnownDepositNetwork(entry.network);
        return Boolean(network && savedSenderWallets[network]);
      }),
    [addresses, savedSenderWallets],
  );
  const senderWalletReviewAddress =
    senderWalletReview?.network === claimNetwork ? senderWalletReview.address : null;
  const claimNetworkLabel = getDepositNetworkShortLabel(claimNetwork);
  const nextAgentCode = agent?.availableCodes[0] ?? null;
  const whatsappDepositHelpUrl = buildSupportWhatsAppUrl(
    "Hi, I need help with my WorldCup26 USDT deposit and ticket assignment.",
  );
  const whatsappAgentHelpUrl = buildSupportWhatsAppUrl(
    "Hi, I want help becoming a WorldCup26 agent and receiving agent ticket codes.",
  );
  const whatsappPassiveIncomeHelpUrl = buildSupportWhatsAppUrl(
    "Hi, I want help understanding WorldCup26 passive income, referrals, and agent commissions.",
  );

  const applyAccountStatus = useCallback((me: Partial<MyAccountStatus>) => {
    setStatus({
      walletBalance: me.walletBalance ?? "0.00",
      ticketsAvailable: me.ticketsAvailable ?? 0,
      ticketsAssigned: me.ticketsAssigned ?? 0,
      ticketPriceAmount: normalizeWorldCupTicketPriceAmount(me.ticketPriceAmount),
      usdtSenderWalletAddress: me.usdtSenderWalletAddress ?? null,
      usdtSenderWalletNetwork: me.usdtSenderWalletNetwork ?? null,
      usdtSenderWalletUpdatedAt: me.usdtSenderWalletUpdatedAt ?? null,
      usdtSenderWalletTrc20Address: me.usdtSenderWalletTrc20Address ?? null,
      usdtSenderWalletTrc20UpdatedAt: me.usdtSenderWalletTrc20UpdatedAt ?? null,
      usdtSenderWalletErc20Address: me.usdtSenderWalletErc20Address ?? null,
      usdtSenderWalletErc20UpdatedAt: me.usdtSenderWalletErc20UpdatedAt ?? null,
      entry: me.entry ?? null,
      paidActionGates: me.paidActionGates,
    });

    const nextSavedSenderWallets = {
      trc20:
        me.usdtSenderWalletTrc20Address ??
        (me.usdtSenderWalletNetwork === "trc20" ? me.usdtSenderWalletAddress ?? null : null),
      erc20:
        me.usdtSenderWalletErc20Address ??
        (me.usdtSenderWalletNetwork === "erc20" ? me.usdtSenderWalletAddress ?? null : null),
    };

    if (nextSavedSenderWallets[claimNetwork]) {
      setClaimSenderWalletAddress(nextSavedSenderWallets[claimNetwork] ?? "");
    } else if (me.usdtSenderWalletTrc20Address) {
      setClaimSenderWalletAddress(me.usdtSenderWalletTrc20Address);
      setClaimNetwork("trc20");
    } else if (me.usdtSenderWalletErc20Address) {
      setClaimSenderWalletAddress(me.usdtSenderWalletErc20Address);
      setClaimNetwork("erc20");
    } else if (me.usdtSenderWalletAddress) {
      setClaimSenderWalletAddress(me.usdtSenderWalletAddress);
      if (me.usdtSenderWalletNetwork === "trc20" || me.usdtSenderWalletNetwork === "erc20") {
        setClaimNetwork(me.usdtSenderWalletNetwork);
      }
    }
  }, [claimNetwork]);

  function applyResponsiblePlay(data: ResponsiblePlayStatus) {
    setResponsiblePlay(data);
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null));
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
        setSenderWalletReview(null);
        setResponsiblePlay(null);
        setAgent(null);
        setIsAdmin(false);
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
          responsibleResponse,
          agentResponse,
          adminResponse,
        ] = await Promise.all([
          fetch("/api/referrals/me", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/deposits/address", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/deposits/claims", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/responsible-play", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/agent/me", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/admin/me", { headers: { Authorization: `Bearer ${token}` } }),
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

        if (adminResponse.ok) {
          const data = (await adminResponse.json()) as { admin?: boolean };
          setIsAdmin(Boolean(data.admin));
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
        setError("Could not load your wallet.");
      }
    });
  }, [applyAccountStatus, session?.access_token, signedIn]);

  function refreshStatus(token: string) {
    return fetch("/api/referrals/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((me: Partial<MyAccountStatus>) => applyAccountStatus(me))
      .catch(() => undefined);
  }

  function checkForDeposit() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    if (!lockedClaimSenderWallet) {
      setError(`Lock your ${claimNetworkLabel} sender wallet before checking deposits.`);
      return;
    }

    setError(null);
    setMessage("Checking for new deposits…");
    startTransition(async () => {
      try {
        const response = await fetch("/api/deposits/check", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ network: claimNetwork }),
        });
        const result = (await response.json()) as {
          error?: string;
          message?: string;
          matched?: boolean;
          claim?: DepositClaim;
        };

        if (!response.ok) {
          setError(result.error ?? "Could not check KuCoin deposits just now.");
          setMessage(null);
          return;
        }

        if (result.claim) {
          setDepositClaims((current) => {
            if (current.some((claim) => claim.id === result.claim?.id)) {
              return current;
            }

            return [result.claim!, ...current];
          });
        }

        await Promise.all([refreshStatus(token), refreshDepositClaims(token)]);
        setMessage(result.message ?? "Deposit check complete.");
      } catch {
        setError("Could not check KuCoin deposits just now. Try again in a moment.");
      }
    });
  }

  function refreshDepositClaims(token: string) {
    return fetch("/api/deposits/claims", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((data: { claims?: DepositClaim[] }) => setDepositClaims(data.claims ?? []))
      .catch(() => undefined);
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

  useEffect(() => {
    const token = session?.access_token;

    if (!token || !signedIn || walletView !== "agent" || agent?.applicationStatus !== "active") {
      return;
    }

    let active = true;
    const loadAgent = async () => {
      try {
        const response = await fetch("/api/agent/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active || !response.ok) {
          return;
        }

        const data = (await response.json()) as AgentStatus;
        setAgent(data.isAgent || data.applicationStatus === "pending" ? data : null);
      } catch {
        // Keep the current code visible if a background refresh fails.
      }
    };

    const intervalId = window.setInterval(loadAgent, 15_000);
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") {
        void loadAgent();
      }
    };

    window.addEventListener("focus", loadAgent);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadAgent);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [agent?.applicationStatus, session?.access_token, signedIn, walletView]);

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
          : "Agent registration saved. Your account activates after your first personal ticket is assigned.",
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

  function lockSenderWallet() {
    const token = session?.access_token;
    if (!token) {
      return;
    }

    const senderWalletAddress = (senderWalletReviewAddress ?? claimSenderWalletAddress).trim();
    if (!senderWalletAddress) {
      setError(`Enter the ${claimNetworkLabel} sender wallet first.`);
      return;
    }

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/deposits/sender-wallet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: claimNetwork,
          senderWalletAddress,
        }),
      });
      const result = (await response.json()) as { error?: string; senderWalletAddress?: string };

      if (!response.ok) {
        setError(result.error ?? `Could not lock your ${claimNetworkLabel} sender wallet.`);
        return;
      }

      if (result.senderWalletAddress) {
        setClaimSenderWalletAddress(result.senderWalletAddress);
      }
      setSenderWalletReview(null);
      setMessage(`${claimNetworkLabel} sender wallet locked. Future deposits and any later USDT payout for this network use this saved sender wallet.`);
      refreshStatus(token);
    });
  }

  function chooseClaimNetwork(network: DepositNetwork) {
    setClaimNetwork(network);
    setClaimSenderWalletAddress(savedSenderWallets[network] ?? "");
    setSenderWalletReview(null);
  }

  function openSenderWalletSetup(network: DepositNetwork) {
    chooseClaimNetwork(network);
    setWalletView("user");
    setMessage(`Paste your ${getDepositNetworkShortLabel(network)} sender wallet before sending USDT.`);
    setError(null);
    window.setTimeout(() => {
      senderWalletSetupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      senderWalletSetupRef.current?.querySelector("input")?.focus();
    }, 80);
  }

  async function pasteSenderWallet() {
    try {
      const text = await navigator.clipboard.readText();
      setClaimSenderWalletAddress(text.trim());
      setSenderWalletReview(null);
      setMessage("Sender wallet pasted. Save it to review before locking.");
    } catch {
      setError("Could not read clipboard. Paste the wallet address manually.");
    }
  }

  function saveSenderWalletForReview() {
    const senderWalletAddress = claimSenderWalletAddress.trim();
    if (!senderWalletAddress) {
      setError(`Paste your ${claimNetworkLabel} sender wallet first.`);
      return;
    }

    setError(null);
    setSenderWalletReview({ network: claimNetwork, address: senderWalletAddress });
    setMessage(`Review ${formatMaskedWalletAddress(senderWalletAddress)}. Confirm once more to lock it permanently.`);
  }

  function renderSenderWalletSetup() {
    return (
      <div className="sender-wallet-lock-box" id="usdt-sender-wallet" ref={senderWalletSetupRef}>
        <div className="panel-header compact">
          <div>
            <h3 className="panel-title">USDT sender wallets</h3>
            <p className="panel-subtitle">
              Before any USDT deposit, lock the wallet you send from. TRC20 and ERC20 are separate.
              Once a wallet is saved, it cannot be changed. Deposits from another wallet may be lost.
              If you win and choose USDT after the World Cup, admin uses the saved sender wallet.
            </p>
          </div>
          <div className="panel-header-actions">
            <ShieldCheck size={18} color="var(--gold)" />
            <a
              className="button secondary whatsapp-help-link"
              href={whatsappDepositHelpUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle size={16} />
              WhatsApp deposit help
            </a>
          </div>
        </div>
        <div className="sender-wallet-card-grid" aria-label="Locked USDT sender wallets">
          {depositNetworkOptions.map((network) => {
            const savedWallet = savedSenderWallets[network];
            const label = getDepositNetworkShortLabel(network);

            return (
              <button
                aria-pressed={claimNetwork === network}
                className={`sender-wallet-card ${claimNetwork === network ? "active" : ""} ${savedWallet ? "locked" : "empty"}`}
                key={network}
                onClick={() => chooseClaimNetwork(network)}
                type="button"
              >
                <span>{label} sender wallet</span>
                <strong>{savedWallet ? "Locked" : "Not set"}</strong>
                {savedWallet ? (
                  <code>{formatMaskedWalletAddress(savedWallet)}</code>
                ) : (
                  <small>Required before deposit</small>
                )}
              </button>
            );
          })}
        </div>
        <div className={`sender-wallet-entry ${lockedClaimSenderWallet ? "locked" : ""}`}>
          <div>
            <span>{claimNetworkLabel} sender wallet</span>
            <strong>
              {lockedClaimSenderWallet
                ? formatMaskedWalletAddress(lockedClaimSenderWallet)
                : senderWalletReviewAddress
                  ? formatMaskedWalletAddress(senderWalletReviewAddress)
                  : "Paste the wallet you will send from"}
            </strong>
            <small>
              {lockedClaimSenderWallet
                ? "Locked permanently for deposit checks and any later USDT payout on this network."
                : senderWalletReviewAddress
                  ? "Confirm once more to lock this wallet permanently."
                  : "Copy your full wallet address, then use Paste here."}
            </small>
          </div>
          {!lockedClaimSenderWallet && !senderWalletReviewAddress ? (
            <div className="sender-wallet-entry__form">
              <input
                aria-label={`${claimNetworkLabel} sender wallet`}
                value={claimSenderWalletAddress}
                onChange={(event) => {
                  setClaimSenderWalletAddress(event.target.value);
                  setSenderWalletReview(null);
                }}
                placeholder={claimNetwork === "trc20" ? "TRC20 wallet starts with T" : "ERC20 wallet starts with 0x"}
              />
              <button className="button secondary" onClick={pasteSenderWallet} type="button">
                <ClipboardPaste size={16} />
                Paste
              </button>
              <button
                className="button secondary"
                disabled={!claimSenderWalletAddress || isPending}
                onClick={saveSenderWalletForReview}
                type="button"
              >
                Save wallet
              </button>
            </div>
          ) : null}
          {!lockedClaimSenderWallet && senderWalletReviewAddress ? (
            <div className="sender-wallet-entry__actions">
              <button className="button secondary" onClick={() => setSenderWalletReview(null)} type="button">
                Edit
              </button>
              <button className="button secondary" disabled={isPending} onClick={lockSenderWallet} type="button">
                <ShieldCheck size={16} />
                Confirm locked wallet
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
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
                <a href={SUPPORT_WHATSAPP_URL} rel="noreferrer" target="_blank">
                  <Phone size={16} />
                  WhatsApp support
                </a>
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
        ) : publicPaidActionsPaused && signedIn && walletView === "user" && userHasPersonalTicketRecord ? (
          <section className="launch-notice" aria-label="User wallet ticket covered">
            <div>
              <strong>User Wallet ticket covered</strong>
              <span>
                Your personal ticket is assigned or already used for your entry, so User Wallet
                USDT deposit actions are hidden. Use Agent Wallet only for agent inventory deposits.
              </span>
            </div>
            <Link className="button secondary" href={{ pathname: "/", hash: "entry" }}>
              Lock entry
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
                      ? "Sign in with Google to prepare your locked USDT sender wallet for manual admin review."
                      : "Sign in with Google to prepare your wallet and receive manually assigned tickets."}
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
                    <small>Receive a ticket from Admin or an agent.</small>
                  </div>
                  <div>
                    <span>3</span>
                    <strong>Deposit USDT</strong>
                    <small>Buy tickets by locking your sender wallet, then admin verifies the payment.</small>
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
                    <strong>
                      {formatMoneyAmount(
                        normalizeWorldCupTicketPriceAmount(status?.ticketPriceAmount),
                      )}
                    </strong>
                    <small>per entry</small>
                  </div>
                </div>
                <div className="wallet-ticket-math">
                  <Ticket size={18} aria-hidden="true" />
                  <div>
                    <strong>
                      {!accountStatusLoaded
                        ? "Loading your ticket balance..."
                        : userHasAvailableEntryTicket
                        ? "Your personal entry ticket is ready. Lock your teams from Play."
                        : userHasPersonalTicketRecord
                        ? "Your personal entry ticket is already assigned or used for your entry."
                        : "Cash is assigned by Admin. Accepted USDT turns the first 50 USDT into one ticket."}
                    </strong>
                    <span>
                      {!accountStatusLoaded
                        ? "Deposit actions stay hidden until your wallet status is loaded."
                        : userHasPersonalTicketRecord
                        ? "User Wallet deposits are hidden once your entry ticket is assigned or used. Use Agent Wallet for agent inventory deposits."
                        : "Send USDT only from your frozen sender wallet. Admin accepts the matching transfer before balance is credited."}
                    </span>
                    {userNeedsEntryTicket && ticketPrice > 0 ? <small>Ticket price: {formatMoneyAmount(ticketPrice)}.</small> : null}
                  </div>
                </div>
                <div className="wallet-usdt-quick-actions" aria-label="Prepare USDT sender wallet">
                  <div>
                    <strong>USDT sender wallet</strong>
                    <span>Add the wallet you will send from before any payment.</span>
                  </div>
                  <button className="button secondary" onClick={() => openSenderWalletSetup("trc20")} type="button">
                    <Wallet size={16} />
                    TRC20 wallet
                  </button>
                  <button className="button secondary" onClick={() => openSenderWalletSetup("erc20")} type="button">
                    <Wallet size={16} />
                    ERC20 wallet
                  </button>
                  <a
                    className="button secondary whatsapp-help-link"
                    href={whatsappDepositHelpUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle size={16} />
                    WhatsApp deposit help
                  </a>
                </div>
                <div className="wallet-action-list compact wallet-action-list--steps" aria-label="Wallet next actions">
                  <div>
                    <span>Ticket</span>
                    <strong>
                      {userHasAvailableEntryTicket
                        ? "Ticket ready"
                        : userHasPersonalTicketRecord
                        ? "Ticket covered"
                        : "Admin assigned"}
                    </strong>
                    <small>
                      {userHasAvailableEntryTicket
                        ? "Use your ticket to lock one entry."
                        : userHasPersonalTicketRecord
                        ? "Your personal ticket is already assigned or used."
                        : "Cash or USDT payment is confirmed manually."}
                    </small>
                  </div>
                  <div>
                    <span>Friend</span>
                    <strong>Transfer ticket</strong>
                    <small>Email must already have a WorldCup account.</small>
                  </div>
                </div>
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
                          Boolean(ticketRestriction)
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
              {renderSenderWalletSetup()}
            </div>

            {userNeedsEntryTicket ? (
            <div className={`panel ${walletView === "agent" ? "wallet-panel-hidden" : ""}`}>
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Deposit USDT</h2>
                  <p className="panel-subtitle">
                    {sharedDepositAddresses
                      ? "Lock your sender wallet first. The matching receive QR appears only after that."
                      : "Send only USDT on the matching network after your sender wallet is locked."}
                  </p>
                </div>
                <div className="panel-header-actions">
                  <QrCode size={18} color="var(--green)" />
                  <a
                    className="button secondary whatsapp-help-link"
                    href={whatsappDepositHelpUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle size={16} />
                    WhatsApp deposit help
                  </a>
                </div>
              </div>
              {sharedDepositAddresses ? (
                <div className="message">
                  Shared receive wallet. The matching QR and receive address appear here only
                  after your sender wallet is locked. Deposit claims are tied to {depositClaimAccountLabel}.
                </div>
              ) : null}
              {depositPolicyPause ? (
                <div className="message error">{depositPolicyPause}</div>
              ) : depositsConfigured === false ? (
                <div className="message">
                  USDT deposits are not enabled yet. Check back soon.
                </div>
              ) : !hasLockedSenderWallet ? (
                <div className="message">
                  Lock your TRC20 or ERC20 sender wallet above before sending USDT. The deposit
                  QR and receive address stay hidden until your wallet is saved.
                </div>
              ) : addresses.length === 0 ? (
                <div className="field-note">Generating your deposit addresses…</div>
              ) : lockedDepositAddresses.length === 0 ? (
                <div className="message">
                  The receive wallet for your locked sender network is not configured yet.
                  Contact Admin before sending USDT.
                </div>
              ) : (
                <div className="deposit-list">
                  {lockedDepositAddresses.map((entry) => {
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
                {lockedClaimSenderWallet
                  ? "Only send USDT on the exact network shown from your locked sender wallet. Sending any other asset, network, or sender wallet may result in permanent loss."
                  : `Select TRC20 or ERC20 above and lock your ${claimNetworkLabel} sender wallet before sending USDT.`}
              </div>
              <div className="deposit-refresh">
                <p className="field-note">
                  Check only after sending from the locked wallet. KuCoin matches the deposit,
                  then Admin reviews and credits it.
                </p>
                <button
                  className="button secondary"
                  disabled={!lockedClaimSenderWallet || isPending}
                  onClick={checkForDeposit}
                  type="button"
                >
                  <RefreshCw size={16} />
                  {isPending ? "Checking…" : "Check for deposit"}
                </button>
                <a
                  className="button secondary whatsapp-help-link"
                  href={whatsappDepositHelpUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle size={16} />
                  WhatsApp deposit help
                </a>
              </div>
              {sharedDepositAddresses ? (
                <div className="deposit-claim-box">
                  <div className="panel-header compact">
                    <div>
                      <h3 className="panel-title">Admin review queue</h3>
                      <p className="panel-subtitle">
                        After you send USDT, Check for deposit reads KuCoin and creates a review row for Admin.
                        When Admin accepts it, your wallet is credited and the first 50 USDT becomes a ticket.
                      </p>
                    </div>
                    <CircleDollarSign size={18} color="var(--green)" />
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
                  <h2 className="panel-title">Payout after World Cup</h2>
                  <p className="panel-subtitle">
                    No withdrawal request is open during the tournament.
                  </p>
                </div>
                <Trophy size={18} color="var(--gold)" />
              </div>
              <div className="withdrawal-box">
                <div className="message">
                  Winnings are paid manually after all matches are finished and every point is final.
                  Until then, this wallet only handles tickets, transfers, and USDT deposit proof.
                </div>
                <div className="wallet-action-list compact wallet-action-list--steps" aria-label="Manual payout options">
                  <div>
                    <span>Cash</span>
                    <strong>Manual payout</strong>
                    <small>Admin can pay winnings in cash after the tournament is closed.</small>
                  </div>
                  <div>
                    <span>USDT</span>
                    <strong>
                      {savedSenderWallets.trc20 || savedSenderWallets.erc20
                        ? "Wallet saved"
                        : "Deposit required"}
                    </strong>
                    <small>
                      USDT payout is available only if this account used USDT deposit at least once,
                      so the sender wallet is stored.
                    </small>
                  </div>
                </div>
                {savedSenderWallets.trc20 || savedSenderWallets.erc20 ? (
                  <div className="deposit-claim-list">
                    {depositNetworkOptions.map((network) => {
                      const savedWallet = savedSenderWallets[network];

                      return savedWallet ? (
                        <div className="deposit-claim-row" key={`payout-${network}`}>
                          <div>
                            <strong>{getDepositNetworkShortLabel(network)} payout wallet saved</strong>
                            <code>{savedWallet}</code>
                          </div>
                          <span className="claim-status credited">stored</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="field-note">
                    No USDT sender wallet is saved yet. A verified USDT deposit stores the wallet
                    if the winner later chooses USDT instead of cash.
                  </div>
                )}
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
                        : "Apply to sell tickets. Agent tools unlock after your first personal ticket is assigned."}
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
                      <strong>Commission ticket</strong>
                      <span>Every 10 paid tickets assigned gives the agent 1 free ticket code.</span>
                    </div>
                    <div>
                      <UserPlus size={18} aria-hidden="true" />
                      <strong>Referral credit</strong>
                      <span>Players without an inviter become your referral. Existing inviter links stay unchanged.</span>
                    </div>
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
                  <div className="agent-deposit-box">
                    <div className="panel-header compact">
                      <div>
                        <h3 className="panel-title">Deposit USDT for agent tickets</h3>
                        <p className="panel-subtitle">
                          Lock your sender wallet first. Admin assigns paid agent ticket codes after the USDT payment is verified.
                        </p>
                      </div>
                      <div className="panel-header-actions">
                        <QrCode size={18} color="var(--gold)" />
                        <a
                          className="button secondary whatsapp-help-link"
                          href={whatsappAgentHelpUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <MessageCircle size={16} />
                          WhatsApp agent help
                        </a>
                      </div>
                    </div>
                    {renderSenderWalletSetup()}
                    {depositPolicyPause ? (
                      <div className="message error">{depositPolicyPause}</div>
                    ) : depositsConfigured === false ? (
                      <div className="message">USDT deposits are not enabled yet. Check back soon.</div>
                    ) : !hasLockedSenderWallet ? (
                      <div className="message">
                        Lock your TRC20 or ERC20 sender wallet first. Agent deposit QR codes and
                        receive addresses stay hidden until the matching sender wallet is saved.
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="field-note">Generating your agent deposit address...</div>
                    ) : lockedDepositAddresses.length === 0 ? (
                      <div className="message">
                        The receive wallet for your locked sender network is not configured yet.
                        Contact Admin before sending agent inventory funds.
                      </div>
                    ) : (
                      <>
                        <div className="deposit-list agent-deposit-list">
                          {lockedDepositAddresses.map((entry) => {
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
                              onChange={(event) => chooseClaimNetwork(toDepositNetwork(event.target.value))}
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
                            <label htmlFor="agent-claim-sender-wallet">{claimNetworkLabel} sender wallet address</label>
                            {lockedClaimSenderWallet ? (
                              <input
                                disabled
                                id="agent-claim-sender-wallet"
                                value={formatMaskedWalletAddress(lockedClaimSenderWallet)}
                                readOnly
                              />
                            ) : (
                              <div className="sender-wallet-required" id="agent-claim-sender-wallet">
                                <strong>Not locked yet</strong>
                                <span>
                                  Use the USDT sender wallets box above. Paste the full wallet,
                                  save it for review, then confirm once more before sending funds.
                                </span>
                              </div>
                            )}
                            <div className="field-note">
                              {lockedClaimSenderWallet
                                ? `${claimNetworkLabel} sender wallet is locked for agent deposits too.`
                                : `Lock the ${claimNetworkLabel} sender wallet with the two-step review before sending agent inventory funds.`}
                            </div>
                            {!lockedClaimSenderWallet ? (
                              <button
                                className="button secondary"
                                onClick={() => openSenderWalletSetup(claimNetwork)}
                                type="button"
                              >
                                <ShieldCheck size={16} />
                                Prepare {claimNetworkLabel} sender wallet
                              </button>
                            ) : null}
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
                              !lockedClaimSenderWallet ||
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
                          Agent registration received. Receive one personal ticket from Admin or an agent to activate your agent account.
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
                        <a
                          className="button secondary whatsapp-help-link"
                          href={whatsappAgentHelpUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <MessageCircle size={16} />
                          WhatsApp agent help
                        </a>
                      </div>
                      <div className="agent-activation-guide">
                        <strong>Activation steps</strong>
                        <div>
                          <span>1</span>
                          <small>Create your agent username and WhatsApp contact.</small>
                        </div>
                        <div>
                          <span>2</span>
                          <small>Receive one personal ticket from admin or an agent.</small>
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
                      <div className="next-agent-code-card" aria-label="Next available agent ticket code">
                        <div className="next-agent-code-card__header">
                          <div>
                            <span>Next code to sell</span>
                            <strong>
                              {nextAgentCode ? nextAgentCode.code : "No code available"}
                            </strong>
                            <small>
                              {nextAgentCode
                                ? `${nextAgentCode.kind} code. Copy it and send it to the player.`
                                : "Ask admin to assign more paid agent tickets."}
                            </small>
                          </div>
                          <span className="code-tag">
                            {nextAgentCode?.kind ?? "empty"}
                          </span>
                        </div>
                        <div className="next-agent-code-card__actions">
                          <button
                            className="button"
                            disabled={!nextAgentCode || isPending}
                            onClick={() => nextAgentCode && copyText(nextAgentCode.code, "Next agent code")}
                            type="button"
                          >
                            <Copy size={16} />
                            Copy code
                          </button>
                        </div>
                        <p>
                          This card refreshes while Agent Wallet is open. When the copied code is redeemed,
                          the next available code moves here and the counters update.
                        </p>
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
  return gate && !gate.allowed
    ? "USDT deposits are admin-reviewed. You can still prepare your locked sender wallet; accepted USDT can auto-issue the first ticket."
    : null;
}
