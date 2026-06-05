"use client";

import {
  Activity,
  CircleDollarSign,
  ClipboardCheck,
  Copy,
  Download,
  FileJson,
  GitBranch,
  Lock,
  Phone,
  ShieldCheck,
  Trophy,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { SmartMenu } from "@/components/smart-menu";
import { CURRENT_TERMS_VERSION } from "@/lib/consent";
import { getDepositExplorerAddressUrl, getDepositExplorerTxUrl } from "@/lib/deposits";
import { formatLedgerAmount } from "@/lib/economy";
import {
  getCurrentLegalApprovalEvidenceNoteRequirement,
  getLaunchSignoffEvidenceNoteRequirement,
  getLaunchSignoffEvidenceUrlRequirement,
  isApprovalEvidenceUrlRequiredLaunchSignoffKey,
  isCurrentLegalApprovalEvidenceNote,
  isLaunchSignoffEvidenceUrl,
  isPaymentLaunchSignoffKey,
  isNonWaivableLaunchSignoffKey,
  type LaunchSignoffRow,
  type LaunchSignoffStatus,
} from "@/lib/launch-signoffs";
import { formatPrizeAmount } from "@/lib/prize-pool";
import type { ReadinessActionTarget, ReadinessReport } from "@/lib/production-readiness";
import { SUPPORT_WHATSAPP_URL } from "@/lib/support";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getWithdrawalExplorerTxUrl } from "@/lib/withdrawals";
import { normalizeWorldCupTicketPriceAmount } from "@/lib/worldcup-ticket-price";
import type {
  AdminAccountRow,
  AdminAgeVerificationRow,
  AdminDepositClaimRow,
  AdminReferralReportRow,
  AdminWithdrawalRequestRow,
  DueMatch,
  WorldCupMatch,
  WorldCupTournament,
  WorldCupTeam,
} from "@/lib/types";
import type { Session } from "@supabase/supabase-js";

type AdminConsoleProps = {
  tournament: WorldCupTournament;
  teams: WorldCupTeam[];
  matches: WorldCupMatch[];
  dueMatches: DueMatch[];
};

type DepositClaimReviewDraft = {
  amount: string;
  note: string;
  requireKucoinMatch: boolean;
};

type WithdrawalReviewDraft = {
  note: string;
  externalTxHash: string;
  launchEvidence: boolean;
};

type OperatorPolicyDraft = {
  allowedCountries: string;
  blockedCountries: string;
  maxDepositClaimAmount: string;
  maxDailyDepositClaimAmount: string;
  maxWithdrawalRequestAmount: string;
  maxDailyWithdrawalRequestAmount: string;
  updatedAt: string | null;
  updatedBy: string | null;
  source: string;
};

type OperatorPolicyPreset = {
  label: string;
  description: string;
  draft: Pick<
    OperatorPolicyDraft,
    | "allowedCountries"
    | "blockedCountries"
    | "maxDepositClaimAmount"
    | "maxDailyDepositClaimAmount"
    | "maxWithdrawalRequestAmount"
    | "maxDailyWithdrawalRequestAmount"
  >;
};

type LaunchSignoffDraft = {
  status: LaunchSignoffStatus;
  evidenceNote: string;
  evidenceUrl: string;
};

type LaunchEvidenceSnapshot = {
  generatedAt: string;
  generatedBy: string;
  deployment: {
    canonicalOrigin: string;
    siteUrl: string;
    deploymentUrl: string | null;
    vercelEnv: string | null;
    gitCommitSha: string | null;
    gitCommitRef: string | null;
    source: "vercel" | "local";
  };
  readiness: {
    overallStatus: ReadinessReport["overallStatus"];
    summary: ReadinessReport["summary"];
    warnings: Array<{ id: string; label: string; detail: string; action?: string }>;
    failures: Array<{ id: string; label: string; detail: string; action?: string }>;
    nextActions: ReadinessReport["nextActions"];
  };
  operatorPolicy: {
    allowedCountries: string[];
    blockedCountries: string[];
    maxDepositClaimAmount: string | null;
    maxDailyDepositClaimAmount: string | null;
    maxWithdrawalRequestAmount: string | null;
    maxDailyWithdrawalRequestAmount: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
    source: string;
  };
  paidActionEvidence?: {
    publicPaidActionsPaused: boolean;
    adminEvidenceEmailConfigured: boolean;
    adminEvidenceActionsAllowed: boolean;
    adminEmailCount: number;
    actions: Record<
      "deposit" | "ticket" | "entry" | "withdrawal",
      {
        publicAllowed: boolean;
        adminEvidenceAllowed: boolean;
        publicMissing: string[];
        adminEvidenceMissing: string[];
      }
    >;
  };
  legal: {
    currentTermsVersion: string;
    termsUrl: string;
    privacyUrl: string;
  };
  signoffs: Array<{
    key: string;
    label: string;
    category: string;
    status: LaunchSignoffStatus;
    evidenceReady: boolean;
    evidenceStatus: string | null;
    evidenceRequirement: string;
    evidenceNotePresent: boolean;
    evidenceUrlPresent: boolean;
    evidenceUrl: string | null;
    updatedAt: string | null;
    updatedBy: string;
  }>;
};

type DepositClaimVerification = {
  status: "matched" | "missing" | "unavailable";
  amount?: string;
  amountMatchesClaim?: boolean;
  walletTxId?: string | null;
  message?: string;
};

type SettlementPayoutRow = {
  payout_type: string;
  rank: number | null;
  user_id: string;
  amount: string;
};

type ResultForm = {
  matchId: string;
  finishMethod: "90" | "extra_time" | "penalties";
  homeGoals90: string;
  awayGoals90: string;
  homeGoalsTotal: string;
  awayGoalsTotal: string;
  homePenalties: string;
  awayPenalties: string;
  winnerTeamId: string;
};

const initialResultForm: ResultForm = {
  matchId: "",
  finishMethod: "90",
  homeGoals90: "0",
  awayGoals90: "0",
  homeGoalsTotal: "0",
  awayGoalsTotal: "0",
  homePenalties: "",
  awayPenalties: "",
  winnerTeamId: "",
};

type AdminAgentRow = {
  userId: string;
  email: string | null;
  displayName: string | null;
  contactName: string | null;
  whatsappNumber: string | null;
  paidTickets: number;
  commissionTickets: number;
  availableCodes: number;
  redeemedCodes: number;
  active: boolean;
  activatedAt: string | null;
};

type AgentPool = { total: number; available: number; admin: number; assigned: number; redeemed: number };

type TicketFinancialMovement = {
  id: string;
  movementType: "admin_request" | "admin_to_agent" | "admin_to_user";
  paymentMethod: "internal" | "cash" | "usdt";
  sourceAdminUserId: string | null;
  targetUserId: string | null;
  targetAgentUserId: string | null;
  quantity: number;
  ticketPriceAmount: string;
  totalAmount: string;
  note: string | null;
  metadata: Record<string, unknown> | null;
  createdBy: string;
  createdAt: string;
};

function getMovementLabel(type: TicketFinancialMovement["movementType"]) {
  if (type === "admin_request") return "Request Tickets";
  if (type === "admin_to_agent") return "Admin to Agent";
  return "Admin to User";
}

function getMovementTicketSummary(metadata: TicketFinancialMovement["metadata"]) {
  if (!metadata) return "No ticket numbers stored.";

  const keys = [
    "ticketNumbers",
    "userTicketNumbers",
    "personalTicketNumbers",
    "paidTicketNumbers",
    "commissionTicketNumbers",
  ];
  const ticketNumbers = keys.flatMap((key) => {
    const value = metadata[key];
    if (!Array.isArray(value)) return [];
    return value
      .map((entry) => {
        if (typeof entry === "number") return entry;
        if (entry && typeof entry === "object" && "ticketNumber" in entry) {
          const numberValue = (entry as { ticketNumber?: unknown }).ticketNumber;
          return typeof numberValue === "number" ? numberValue : null;
        }
        return null;
      })
      .filter((entry): entry is number => entry !== null);
  });

  if (ticketNumbers.length === 0) return "No ticket numbers stored.";
  const uniqueNumbers = Array.from(new Set(ticketNumbers)).sort((a, b) => a - b);
  const visible = uniqueNumbers.slice(0, 12).join(", ");
  return `Tickets ${visible}${uniqueNumbers.length > 12 ? ` +${uniqueNumbers.length - 12} more` : ""}`;
}

function getMovementMetadataNumber(
  metadata: TicketFinancialMovement["metadata"],
  key: string,
): number | null {
  const value = metadata?.[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getMovementAccounting(movement: TicketFinancialMovement) {
  const metadata = movement.metadata;
  const ticketPrice = Number(movement.ticketPriceAmount ?? 0);
  const paidGross = getMovementMetadataNumber(metadata, "paidGrossAmount") ?? Number(movement.totalAmount ?? 0);
  const bonusQuantity =
    getMovementMetadataNumber(metadata, "bonusQuantity") ??
    getMovementMetadataNumber(metadata, "commissionAwarded") ??
    0;
  const bonusGross = getMovementMetadataNumber(metadata, "bonusGrossAmount") ?? ticketPrice * bonusQuantity;
  const accountedGross = getMovementMetadataNumber(metadata, "accountedGrossAmount") ?? paidGross + bonusGross;
  const prizeContribution =
    getMovementMetadataNumber(metadata, "prizePoolContribution") ?? Math.round(accountedGross * 80) / 100;
  const feeContribution =
    getMovementMetadataNumber(metadata, "feePoolContribution") ??
    Math.round((accountedGross - prizeContribution) * 100) / 100;
  const accountedQuantity =
    getMovementMetadataNumber(metadata, "accountedQuantity") ?? movement.quantity + bonusQuantity;

  return {
    paidGross,
    bonusGross,
    accountedGross,
    prizeContribution,
    feeContribution,
    accountedQuantity,
    bonusQuantity,
  };
}

function getFinancialStatementSummary(movements: TicketFinancialMovement[]) {
  return movements.reduce(
    (summary, movement) => {
      const isMoneyMovement =
        movement.movementType === "admin_to_agent" || movement.movementType === "admin_to_user";

      if (!isMoneyMovement) {
        return summary;
      }

      const accounting = getMovementAccounting(movement);
      summary.movementCount += 1;
      summary.paidTickets += movement.quantity;
      summary.freeTickets += accounting.bonusQuantity;
      summary.accountedTickets += accounting.accountedQuantity;
      summary.paidGross += accounting.paidGross;
      summary.bonusGross += accounting.bonusGross;
      summary.accountedGross += accounting.accountedGross;
      summary.prizeContribution += accounting.prizeContribution;
      summary.feeContribution += accounting.feeContribution;

      if (movement.paymentMethod === "cash") {
        summary.cashGross += accounting.paidGross;
      } else if (movement.paymentMethod === "usdt") {
        summary.usdtGross += accounting.paidGross;
      }

      return summary;
    },
    {
      accountedGross: 0,
      accountedTickets: 0,
      bonusGross: 0,
      cashGross: 0,
      feeContribution: 0,
      freeTickets: 0,
      movementCount: 0,
      paidGross: 0,
      paidTickets: 0,
      prizeContribution: 0,
      usdtGross: 0,
    },
  );
}

export function AdminConsole({ tournament, teams, matches, dueMatches }: AdminConsoleProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [breakGlassSecret, setBreakGlassSecret] = useState("");

  const [resultForm, setResultForm] = useState<ResultForm>(initialResultForm);
  const [prizePoolAmount, setPrizePoolAmount] = useState(tournament.prize_pool_amount);
  const [feePoolAmount, setFeePoolAmount] = useState(tournament.fee_pool_amount ?? "0");
  const [ticketPriceAmount, setTicketPriceAmount] = useState(
    normalizeWorldCupTicketPriceAmount(tournament.ticket_price_amount),
  );
  const [accounts, setAccounts] = useState<AdminAccountRow[]>([]);
  const [ticketUserId, setTicketUserId] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("1");
  const [ticketPaymentMethod, setTicketPaymentMethod] = useState<"cash" | "usdt">("cash");
  const [ticketAssignmentNote, setTicketAssignmentNote] = useState("");
  const [walletFromUserId, setWalletFromUserId] = useState("");
  const [walletToUserId, setWalletToUserId] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletNote, setWalletNote] = useState("");
  const [readinessReport, setReadinessReport] = useState<ReadinessReport | null>(null);
  const [operatorPolicyDraft, setOperatorPolicyDraft] = useState<OperatorPolicyDraft>(emptyPolicyDraft);
  const [launchSignoffs, setLaunchSignoffs] = useState<LaunchSignoffRow[]>([]);
  const [launchEvidenceSnapshot, setLaunchEvidenceSnapshot] =
    useState<LaunchEvidenceSnapshot | null>(null);
  const [launchSignoffDrafts, setLaunchSignoffDrafts] = useState<Record<string, LaunchSignoffDraft>>({});
  const [depositClaims, setDepositClaims] = useState<AdminDepositClaimRow[]>([]);
  const [depositClaimReviewDrafts, setDepositClaimReviewDrafts] = useState<
    Record<string, DepositClaimReviewDraft>
  >({});
  const [depositClaimVerifications, setDepositClaimVerifications] = useState<
    Record<string, DepositClaimVerification>
  >({});
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRequestRow[]>([]);
  const [withdrawalReviewDrafts, setWithdrawalReviewDrafts] = useState<
    Record<string, WithdrawalReviewDraft>
  >({});
  const [ageVerifications, setAgeVerifications] = useState<AdminAgeVerificationRow[]>([]);
  const [ageVerificationNotes, setAgeVerificationNotes] = useState<Record<string, string>>({});
  const [assignMatchId, setAssignMatchId] = useState("");
  const [assignHomeTeamId, setAssignHomeTeamId] = useState("");
  const [assignAwayTeamId, setAssignAwayTeamId] = useState("");
  const [referralRows, setReferralRows] = useState<AdminReferralReportRow[]>([]);
  const [agents, setAgents] = useState<AdminAgentRow[]>([]);
  const [agentPool, setAgentPool] = useState<AgentPool>({
    total: 0,
    available: 0,
    admin: 0,
    assigned: 0,
    redeemed: 0,
  });
  const [requestTicketQty, setRequestTicketQty] = useState("2000");
  const [agentEmail, setAgentEmail] = useState("");
  const [assignAgentUserId, setAssignAgentUserId] = useState("");
  const [assignAgentQty, setAssignAgentQty] = useState("10");
  const [assignAgentPaymentMethod, setAssignAgentPaymentMethod] = useState<"cash" | "usdt">("cash");
  const [assignAgentNote, setAssignAgentNote] = useState("");
  const [financialMovements, setFinancialMovements] = useState<TicketFinancialMovement[]>([]);
  const [settlementPayouts, setSettlementPayouts] = useState<SettlementPayoutRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const financialStatementSummary = useMemo(
    () => getFinancialStatementSummary(financialMovements),
    [financialMovements],
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const signedIn = Boolean(session?.user);
  const operatorPolicyMissing = getOperatorPolicyDraftMissing(operatorPolicyDraft);
  const operatorPolicyActionGates = getOperatorPolicyDraftActionGates(operatorPolicyDraft);
  const operatorPolicyLaunchChecklist = getOperatorPolicyLaunchChecklist(operatorPolicyDraft);
  const readinessLaunchActions = readinessReport?.nextActions ?? [];

  function authHeaders(): HeadersInit {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    if (breakGlassSecret) {
      headers["x-admin-secret"] = breakGlassSecret;
    }

    return headers;
  }

  function run(action: () => Promise<void>) {
    setError(null);
    setMessage(null);
    startTransition(action);
  }

  async function readResult(response: Response) {
    const result = (await response.json()) as Record<string, unknown> & { error?: string };

    if (!response.ok) {
      throw new Error(result.error ?? "Request failed.");
    }

    return result;
  }

  function submitResult() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/results", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            matchId: resultForm.matchId,
            finishMethod: resultForm.finishMethod,
            homeGoals90: Number(resultForm.homeGoals90),
            awayGoals90: Number(resultForm.awayGoals90),
            homeGoalsTotal: Number(resultForm.homeGoalsTotal),
            awayGoalsTotal: Number(resultForm.awayGoalsTotal),
            homePenalties: resultForm.homePenalties === "" ? null : Number(resultForm.homePenalties),
            awayPenalties: resultForm.awayPenalties === "" ? null : Number(resultForm.awayPenalties),
            winnerTeamId: resultForm.winnerTeamId || null,
          }),
        });
        const result = await readResult(response);
        setMessage(
          `Result saved. Awarded rows: ${result.awardedRows ?? 0}. Bracket advanced: ${result.bracketAdvanced ?? 0}.`,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not apply result.");
      }
    });
  }

  function savePrizePool() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/prize-pool", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ prizePoolAmount: Number(prizePoolAmount) }),
        });
        const result = await readResult(response);
        setPrizePoolAmount(String(result.prizePoolAmount ?? prizePoolAmount));
        setMessage("Prize pool saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save prize pool.");
      }
    });
  }

  function advanceBracket() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/advance-bracket", {
          method: "POST",
          headers: authHeaders(),
        });
        const result = await readResult(response);
        setMessage(`Bracket advanced. Matches updated: ${result.assigned ?? 0}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not advance bracket.");
      }
    });
  }

  function settlePayouts() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/settle-payouts", {
          method: "POST",
          headers: authHeaders(),
        });
        const result = (await readResult(response)) as {
          created?: number;
          payouts?: SettlementPayoutRow[];
        };
        setSettlementPayouts(result.payouts ?? []);
        setMessage(
          `Payouts settled. Records created: ${result.created ?? 0}. Audit rows: ${
            result.payouts?.length ?? 0
          }.`,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not settle payouts.");
      }
    });
  }

  function assignMatchTeams() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/assign-match-teams", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            matchId: assignMatchId,
            homeTeamId: assignHomeTeamId || null,
            awayTeamId: assignAwayTeamId || null,
          }),
        });
        await readResult(response);
        setMessage("Match teams assigned.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not assign match teams.");
      }
    });
  }

  function loadAccounts() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/accounts", {
          method: "POST",
          headers: authHeaders(),
        });
        const result = await readResult(response);
        setAccounts((result.accounts as AdminAccountRow[]) ?? []);
        setTicketPriceAmount(
          normalizeWorldCupTicketPriceAmount(result.ticketPriceAmount ?? ticketPriceAmount),
        );
        setMessage(`Accounts loaded. Rows: ${(result.accounts as AdminAccountRow[])?.length ?? 0}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load accounts.");
      }
    });
  }

  function saveTicketPrice() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/tickets", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ action: "set_price", ticketPriceAmount: Number(ticketPriceAmount) }),
        });
        const result = await readResult(response);
        setTicketPriceAmount(
          normalizeWorldCupTicketPriceAmount(result.ticketPriceAmount ?? ticketPriceAmount),
        );
        setMessage("Ticket price saved.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save ticket price.");
      }
    });
  }

  function assignTickets() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/tickets", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            action: "assign",
            userId: ticketUserId,
            quantity: Number(ticketQuantity),
            paymentMethod: ticketPaymentMethod,
            note: ticketAssignmentNote,
          }),
        });
        const result = await readResult(response);
        setTicketAssignmentNote("");
        setMessage(`Assigned tickets: ${result.assignedTickets ?? ticketQuantity}.`);
        await reloadAccounts();
        await loadAgents();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not assign tickets.");
      }
    });
  }

  function transferFunds() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/wallet-transfer", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            fromUserId: walletFromUserId,
            toUserId: walletToUserId,
            amount: Number(walletAmount),
            note: walletNote,
          }),
        });
        const result = await readResult(response);
        setWalletAmount("");
        setWalletNote("");
        setMessage(`Transfer saved: ${result.transferId}.`);
        await reloadAccounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not transfer funds.");
      }
    });
  }

  async function reloadAccounts() {
    const response = await fetch("/api/admin/accounts", { method: "POST", headers: authHeaders() });

    if (response.ok) {
      const result = (await response.json()) as { accounts?: AdminAccountRow[] };
      setAccounts(result.accounts ?? []);
    }
  }

  function loadReadiness() {
    run(async () => {
      try {
        const report = await fetchReadinessReport();
        setMessage(
          report.overallStatus === "pass"
            ? "Production readiness passed."
            : report.overallStatus === "warning"
              ? "Production readiness has warnings."
              : "Production readiness has launch blockers.",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load production readiness.");
      }
    });
  }

  async function fetchReadinessReport() {
    const response = await fetch("/api/admin/readiness", {
      headers: authHeaders(),
    });
    const report = (await readResult(response)) as ReadinessReport;
    setReadinessReport(report);

    return report;
  }

  function runReadinessAction(target: ReadinessActionTarget) {
    if (target === "readiness") {
      scrollToAdminSection("admin-readiness-panel");
      loadReadiness();
      return;
    }

    if (target === "policy") {
      scrollToAdminSection("admin-operator-policy-panel");
      loadOperatorPolicySettings();
      return;
    }

    if (target === "payments") {
      scrollToAdminSection("admin-deposit-claims-panel");
      loadPaymentQueues();
      return;
    }

    scrollToAdminSection("admin-launch-signoffs-panel");
    loadLaunchSignoffSettings();
  }

  function runLaunchSignoffEvidenceAction(key: string) {
    if (key === "real_usdt_trc20_deposit_test" || key === "real_usdt_erc20_deposit_test") {
      scrollToAdminSection("admin-deposit-claims-panel");
      loadDepositClaims();
      return;
    }

    if (key === "real_usdt_withdrawal_payout_test") {
      scrollToAdminSection("admin-withdrawal-requests-panel");
      loadWithdrawals();
      return;
    }

    if (key === "operator_policy_review") {
      scrollToAdminSection("admin-operator-policy-panel");
      loadOperatorPolicySettings();
    }
  }

  function loadOperatorPolicySettings() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/operator-policy", {
          headers: authHeaders(),
        });
        const result = await readResult(response);
        setOperatorPolicyDraft(toPolicyDraft(result.policy));
        setMessage("Operator policy loaded.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load operator policy.");
      }
    });
  }

  function saveOperatorPolicySettings() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/operator-policy", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            allowedCountries: operatorPolicyDraft.allowedCountries,
            blockedCountries: operatorPolicyDraft.blockedCountries,
            maxDepositClaimAmount: emptyToNull(operatorPolicyDraft.maxDepositClaimAmount),
            maxDailyDepositClaimAmount: emptyToNull(operatorPolicyDraft.maxDailyDepositClaimAmount),
            maxWithdrawalRequestAmount: emptyToNull(operatorPolicyDraft.maxWithdrawalRequestAmount),
            maxDailyWithdrawalRequestAmount: emptyToNull(operatorPolicyDraft.maxDailyWithdrawalRequestAmount),
          }),
        });
        const result = await readResult(response);
        setOperatorPolicyDraft(toPolicyDraft(result.policy));
        const refreshed = await tryRefreshLaunchEvidenceState();
        setMessage(
          refreshed
            ? "Operator policy saved. Production readiness and launch sign-offs refreshed."
            : "Operator policy saved. Reload Production readiness and Launch sign-offs to update launch evidence.",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save operator policy.");
      }
    });
  }

  function updateOperatorPolicyDraft(patch: Partial<OperatorPolicyDraft>) {
    setOperatorPolicyDraft((current) => ({
      ...current,
      ...patch,
    }));
  }

  function applyOperatorPolicyPreset(preset: OperatorPolicyPreset) {
    updateOperatorPolicyDraft({
      ...preset.draft,
      updatedAt: null,
      updatedBy: null,
      source: "preset draft",
    });
    setMessage(`${preset.label} filled. Review it, then save Operator Policy.`);
  }

  function loadLaunchSignoffSettings() {
    run(async () => {
      try {
        const signoffs = await fetchLaunchSignoffs();
        setMessage(`Launch sign-offs loaded. Rows: ${signoffs.length}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load launch sign-offs.");
      }
    });
  }

  function loadLaunchEvidenceSnapshot() {
    run(async () => {
      try {
        await fetchLaunchEvidenceSnapshot();
        setMessage("Launch evidence snapshot loaded.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load launch evidence snapshot.");
      }
    });
  }

  function copyLaunchEvidenceSnapshot() {
    if (!launchEvidenceSnapshot) {
      return;
    }

    run(async () => {
      try {
        await navigator.clipboard.writeText(formatLaunchEvidenceSnapshot(launchEvidenceSnapshot));
        setMessage("Launch evidence JSON copied.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not copy launch evidence JSON.");
      }
    });
  }

  function downloadLaunchEvidenceSnapshot() {
    if (!launchEvidenceSnapshot) {
      return;
    }

    const blob = new Blob([formatLaunchEvidenceSnapshot(launchEvidenceSnapshot)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getLaunchEvidenceSnapshotFilename(launchEvidenceSnapshot);
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMessage("Launch evidence JSON downloaded.");
  }

  async function fetchLaunchSignoffs() {
    const response = await fetch("/api/admin/launch-signoffs", {
      headers: authHeaders(),
    });
    const result = await readResult(response);
    const signoffs = (result.signoffs as LaunchSignoffRow[]) ?? [];
    setLaunchSignoffs(signoffs);
    hydrateLaunchSignoffDrafts(signoffs);

    return signoffs;
  }

  async function fetchLaunchEvidenceSnapshot() {
    const response = await fetch("/api/admin/launch-evidence", {
      headers: authHeaders(),
    });
    const snapshot = (await readResult(response)) as LaunchEvidenceSnapshot;
    setLaunchEvidenceSnapshot(snapshot);

    return snapshot;
  }

  async function refreshLaunchEvidenceState() {
    await Promise.all([
      fetchReadinessReport(),
      fetchLaunchSignoffs(),
      launchEvidenceSnapshot ? fetchLaunchEvidenceSnapshot() : Promise.resolve(null),
    ]);
  }

  async function tryRefreshLaunchEvidenceState() {
    try {
      await refreshLaunchEvidenceState();
      return true;
    } catch {
      return false;
    }
  }

  async function tryRefreshReadinessReport() {
    try {
      await fetchReadinessReport();
      return true;
    } catch {
      return false;
    }
  }

  function loadLaunchSignoffSettingsFromPlan() {
    scrollToAdminSection("admin-launch-signoffs-panel");
    loadLaunchSignoffSettings();
  }

  function saveLaunchSignoff(key: string) {
    run(async () => {
      try {
        const draft = launchSignoffDrafts[key] ?? {
          status: "pending",
          evidenceNote: "",
          evidenceUrl: "",
        };
        const response = await fetch("/api/admin/launch-signoffs", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            key,
            status: draft.status,
            evidenceNote: draft.evidenceNote,
            evidenceUrl: draft.evidenceUrl,
          }),
        });
        const result = await readResult(response);
        const signoffs = (result.signoffs as LaunchSignoffRow[]) ?? [];
        setLaunchSignoffs(signoffs);
        hydrateLaunchSignoffDrafts(signoffs);
        const refreshed = await tryRefreshLaunchEvidenceState();
        setMessage(
          refreshed
            ? "Launch sign-off saved. Production readiness and launch evidence refreshed."
            : "Launch sign-off saved. Reload Production readiness and Launch sign-offs to update launch status.",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save launch sign-off.");
      }
    });
  }

  function hydrateLaunchSignoffDrafts(rows: LaunchSignoffRow[]) {
    setLaunchSignoffDrafts((current) => {
      const next: Record<string, LaunchSignoffDraft> = {};

      for (const row of rows) {
        next[row.key] = current[row.key] ?? {
          status: row.status,
          evidenceNote: row.evidenceNote ?? "",
          evidenceUrl: row.evidenceUrl ?? "",
        };
      }

      return next;
    });
  }

  function updateLaunchSignoffDraft(key: string, patch: Partial<LaunchSignoffDraft>) {
    setLaunchSignoffDrafts((current) => ({
      ...current,
      [key]: {
        status: current[key]?.status ?? "pending",
        evidenceNote: current[key]?.evidenceNote ?? "",
        evidenceUrl: current[key]?.evidenceUrl ?? "",
        ...patch,
      },
    }));
  }

  function loadDepositClaims() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/deposit-claims", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ action: "list" }),
        });
        const result = await readResult(response);
        const claims = (result.claims as AdminDepositClaimRow[]) ?? [];
        setDepositClaims(claims);
        hydrateDepositClaimDrafts(claims);
        setMessage(`Incoming transfers loaded. Rows: ${claims.length}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load deposit claims.");
      }
    });
  }

  function loadPaymentQueues() {
    run(async () => {
      try {
        const [claimsResponse, withdrawalsResponse] = await Promise.all([
          fetch("/api/admin/deposit-claims", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ action: "list" }),
          }),
          fetch("/api/admin/withdrawals", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ action: "list" }),
          }),
        ]);
        const [claimsResult, withdrawalsResult] = await Promise.all([
          readResult(claimsResponse),
          readResult(withdrawalsResponse),
        ]);
        const claims = (claimsResult.claims as AdminDepositClaimRow[]) ?? [];
        const rows = (withdrawalsResult.withdrawals as AdminWithdrawalRequestRow[]) ?? [];

        setDepositClaims(claims);
        hydrateDepositClaimDrafts(claims);
        setWithdrawals(rows);
        hydrateWithdrawalDrafts(rows);
        setMessage(`Payment queues loaded. Incoming transfers: ${claims.length}. Withdrawals: ${rows.length}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load payment queues.");
      }
    });
  }

  function reviewDepositClaim(action: "credit" | "reject", claimId: string) {
    run(async () => {
      try {
        const draft = depositClaimReviewDrafts[claimId];
        const response = await fetch("/api/admin/deposit-claims", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            action,
            claimId,
            adminNote: draft?.note ?? undefined,
            amount: action === "credit" ? draft?.amount : undefined,
            requireKucoinMatch:
              action === "credit" ? draft?.requireKucoinMatch === true : undefined,
          }),
        });
        await readResult(response);
        setMessage(action === "credit" ? "Deposit claim credited." : "Deposit claim rejected.");
        await reloadDepositClaims();
        await reloadAccounts();
        if (action === "credit") {
          const refreshed = await tryRefreshLaunchEvidenceState();
          setMessage(
            refreshed
              ? "Deposit claim credited. Production readiness and launch sign-offs refreshed."
              : "Deposit claim credited. Reload Production readiness and Launch sign-offs to update evidence.",
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Could not ${action} deposit claim.`);
      }
    });
  }

  function verifyDepositClaim(claim: AdminDepositClaimRow) {
    run(async () => {
      try {
        const response = await fetch("/api/admin/deposit-claims", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            action: "verify",
            claimId: claim.id,
          }),
        });
        const result = (await readResult(response)) as { verification?: DepositClaimVerification };
        const verification = result.verification;

        if (!verification) {
          throw new Error("KuCoin verification response was empty.");
        }

        setDepositClaimVerifications((current) => ({
          ...current,
          [claim.id]: verification,
        }));

        if (verification.status === "matched" && verification.amount) {
          updateDepositClaimDraft(claim.id, {
            amount: verification.amount,
            requireKucoinMatch: true,
            note:
              depositClaimReviewDrafts[claim.id]?.note ||
              `KuCoin verified ${claim.network.toUpperCase()} tx ${verification.walletTxId ?? claim.txHash}`,
          });
          setMessage("KuCoin receive-wallet deposit matched. Cross-check sender wallet, then credit.");
        } else {
          setMessage(
            verification.status === "unavailable"
              ? "KuCoin verification is unavailable from the server. Verify manually in KuCoin."
              : "KuCoin deposit was not found yet. Check confirmations and reload later.",
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not verify deposit claim with KuCoin.");
      }
    });
  }

  async function reloadDepositClaims() {
    const response = await fetch("/api/admin/deposit-claims", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ action: "list" }),
    });

    if (response.ok) {
      const result = (await response.json()) as { claims?: AdminDepositClaimRow[] };
      const claims = result.claims ?? [];
      setDepositClaims(claims);
      hydrateDepositClaimDrafts(claims);
    }
  }

  function hydrateDepositClaimDrafts(claims: AdminDepositClaimRow[]) {
    setDepositClaimReviewDrafts((current) => {
      const next: Record<string, DepositClaimReviewDraft> = {};

      for (const claim of claims) {
        next[claim.id] = current[claim.id] ?? {
          amount: claim.amount,
          note: claim.adminNote ?? "",
          requireKucoinMatch: claim.status === "submitted",
        };
      }

      return next;
    });
  }

  function updateDepositClaimDraft(
    claimId: string,
    patch: Partial<DepositClaimReviewDraft>,
  ) {
    setDepositClaimReviewDrafts((current) => ({
      ...current,
      [claimId]: {
        amount: current[claimId]?.amount ?? "",
        note: current[claimId]?.note ?? "",
        requireKucoinMatch: current[claimId]?.requireKucoinMatch ?? true,
        ...patch,
      },
    }));
  }

  function loadWithdrawals() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/withdrawals", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ action: "list" }),
        });
        const result = await readResult(response);
        const rows = (result.withdrawals as AdminWithdrawalRequestRow[]) ?? [];
        setWithdrawals(rows);
        hydrateWithdrawalDrafts(rows);
        setMessage(`Withdrawal requests loaded. Rows: ${rows.length}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load withdrawal requests.");
      }
    });
  }

  function reviewWithdrawal(
    action: "approve" | "reject" | "mark_paid",
    withdrawalId: string,
  ) {
    run(async () => {
      try {
        const draft = withdrawalReviewDrafts[withdrawalId];
        const response = await fetch("/api/admin/withdrawals", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            action,
            withdrawalId,
            adminNote: draft?.note ?? undefined,
            externalTxHash: action === "mark_paid" ? draft?.externalTxHash : undefined,
            launchEvidence: action === "mark_paid" ? draft?.launchEvidence === true : undefined,
          }),
        });
        await readResult(response);
        setMessage(
          action === "approve"
            ? "Withdrawal approved and wallet debited."
            : action === "reject"
              ? "Withdrawal request rejected."
              : "Withdrawal marked as paid.",
        );
        await reloadWithdrawals();
        await reloadAccounts();
        if (action === "mark_paid") {
          const refreshed = await tryRefreshLaunchEvidenceState();
          setMessage(
            refreshed
              ? "Withdrawal marked as paid. Production readiness and launch sign-offs refreshed."
              : "Withdrawal marked as paid. Reload Production readiness and Launch sign-offs to update evidence.",
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Could not ${action.replace("_", " ")} withdrawal.`);
      }
    });
  }

  async function reloadWithdrawals() {
    const response = await fetch("/api/admin/withdrawals", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ action: "list" }),
    });

    if (response.ok) {
      const result = (await response.json()) as { withdrawals?: AdminWithdrawalRequestRow[] };
      const rows = result.withdrawals ?? [];
      setWithdrawals(rows);
      hydrateWithdrawalDrafts(rows);
    }
  }

  function hydrateWithdrawalDrafts(rows: AdminWithdrawalRequestRow[]) {
    setWithdrawalReviewDrafts((current) => {
      const next: Record<string, WithdrawalReviewDraft> = {};

      for (const row of rows) {
        next[row.id] = current[row.id] ?? {
          note: row.adminNote ?? "",
          externalTxHash: row.externalTxHash ?? "",
          launchEvidence: row.payoutEvidenceReady === true,
        };
      }

      return next;
    });
  }

  function updateWithdrawalDraft(
    withdrawalId: string,
    patch: Partial<WithdrawalReviewDraft>,
  ) {
    setWithdrawalReviewDrafts((current) => ({
      ...current,
      [withdrawalId]: {
        note: current[withdrawalId]?.note ?? "",
        externalTxHash: current[withdrawalId]?.externalTxHash ?? "",
        launchEvidence: current[withdrawalId]?.launchEvidence ?? false,
        ...patch,
      },
    }));
  }

  function loadAgeVerifications() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/age-verifications", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ action: "list" }),
        });
        const result = await readResult(response);
        const rows = (result.verifications as AdminAgeVerificationRow[]) ?? [];
        setAgeVerifications(rows);
        setMessage(`Age verifications loaded. Rows: ${rows.length}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load age verifications.");
      }
    });
  }

  function updateAgeVerificationNote(userId: string, note: string) {
    setAgeVerificationNotes((current) => ({ ...current, [userId]: note }));
  }

  function reviewAgeVerification(action: "verify" | "reject", userId: string) {
    run(async () => {
      try {
        const note = ageVerificationNotes[userId]?.trim();
        const response = await fetch("/api/admin/age-verifications", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ action, userId, note }),
        });
        const result = await readResult(response);
        const updated = result.verification as AdminAgeVerificationRow | undefined;
        if (updated) {
          setAgeVerifications((current) =>
            current.map((row) => (row.userId === updated.userId ? updated : row)),
          );
        }
        setMessage(
          action === "verify"
            ? "Player marked age-verified (18+). Withdrawals can now be approved."
            : "Age verification rejected.",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : `Could not ${action} age verification.`);
      }
    });
  }

  function loadReferralReport() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/referrals", { method: "POST", headers: authHeaders() });
        const result = await readResult(response);
        setReferralRows((result.referrals as AdminReferralReportRow[]) ?? []);
        setMessage(`Referral report loaded. Rows: ${(result.referrals as AdminReferralReportRow[])?.length ?? 0}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load referral report.");
      }
    });
  }

  async function loadAgents() {
    const response = await fetch("/api/admin/agents", { method: "GET", headers: authHeaders() });
    if (response.ok) {
      const result = (await response.json()) as {
        agents?: AdminAgentRow[];
        pool?: AgentPool;
        accounting?: {
          ticketPriceAmount?: string;
          prizePoolAmount?: string;
          feePoolAmount?: string;
        };
        financialMovements?: TicketFinancialMovement[];
      };
      setAgents(result.agents ?? []);
      if (result.pool) {
        setAgentPool(result.pool);
      }
      if (result.accounting) {
        setTicketPriceAmount(
          normalizeWorldCupTicketPriceAmount(result.accounting.ticketPriceAmount ?? ticketPriceAmount),
        );
        setPrizePoolAmount(String(result.accounting.prizePoolAmount ?? prizePoolAmount));
        setFeePoolAmount(String(result.accounting.feePoolAmount ?? feePoolAmount));
      }
      setFinancialMovements(result.financialMovements ?? []);
    }
  }

  function refreshAgents() {
    run(async () => {
      try {
        await loadAgents();
        setMessage("Agents loaded.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load agents.");
      }
    });
  }

  function addAgent() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/agents", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ action: "add", email: agentEmail }),
        });
        await readResult(response);
        setAgentEmail("");
        setMessage("Agent added.");
        await loadAgents();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not add agent.");
      }
    });
  }

  function requestAdminTickets(quantityOverride?: number) {
    run(async () => {
      try {
        const quantity = quantityOverride ?? Number(requestTicketQty);
        const response = await fetch("/api/admin/agents", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            action: "request_inventory",
            quantity,
          }),
        });
        const result = await readResult(response);
        setMessage(`Admin inventory received: ${result.requested ?? quantity} tickets.`);
        await loadAgents();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not request tickets.");
      }
    });
  }

  function assignAgentCodes() {
    run(async () => {
      try {
        const response = await fetch("/api/admin/agents", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            action: "assign",
            agentUserId: assignAgentUserId,
            quantity: Number(assignAgentQty),
            paymentMethod: assignAgentPaymentMethod,
            note: assignAgentNote,
          }),
        });
        const result = (await readResult(response)) as {
          assigned?: number;
          agentCodesAssigned?: number;
          personalTicketAssigned?: number;
          commissionAwarded?: number;
        };
        const agentCodesAssigned = result.agentCodesAssigned ?? result.assigned ?? 0;
        const personalTicketAssigned = result.personalTicketAssigned ?? 0;
        const personalTicketNote =
          personalTicketAssigned > 0 ? `, plus ${personalTicketAssigned} personal user ticket` : "";
        setMessage(
          `Assigned ${agentCodesAssigned} agent codes${personalTicketNote} (+${
            result.commissionAwarded ?? 0
          } free as commission).`,
        );
        setAssignAgentNote("");
        await loadAgents();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not assign codes.");
      }
    });
  }

  async function signInWithGoogle() {
    setError(null);
    setMessage(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.href : undefined },
    });

    if (authError) {
      setError(getOAuthErrorMessage(authError.message));
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Go to WorldCup26.world home">
          <span className="brand-mark">
            <ShieldCheck size={20} />
          </span>
          <span>WorldCup Admin</span>
        </Link>
        <SmartMenu>
          <nav className="nav nav--app" aria-label="Admin navigation">
            <Link className="nav-item nav-item--primary" href={{ pathname: "/" }}>
              <Trophy size={16} />
              <span className="nav-item__copy">
                <strong>Game</strong>
                <small>Player view</small>
              </span>
            </Link>
            <Link className="nav-item" href={{ pathname: "/schema" }}>
              <GitBranch size={16} />
              <span className="nav-item__copy">
                <strong>Schema</strong>
                <small>Draw view</small>
              </span>
            </Link>
            <a className="nav-item" href={SUPPORT_WHATSAPP_URL} rel="noreferrer" target="_blank">
              <Phone size={16} />
              <span className="nav-item__copy">
                <strong>Support</strong>
                <small>WhatsApp</small>
              </span>
            </a>
          </nav>
        </SmartMenu>
      </header>

      <div className="page">
        <section className="status-row" aria-label="Admin status">
          <div className="stat">
            <div className="stat-label">Signed in</div>
            <div className="stat-value">{signedIn ? "Yes" : "No"}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Prize pool (net)</div>
            <div className="stat-value">{formatPrizeAmount(prizePoolAmount)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Fee pool</div>
            <div className="stat-value">{formatPrizeAmount(feePoolAmount)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Due checks</div>
            <div className="stat-value">{dueMatches.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Accounts loaded</div>
            <div className="stat-value">{accounts.length}</div>
          </div>
        </section>

        <section className="grid">
          <div className="panel" id="admin-readiness-panel">
            <div className="panel-header">
              <div>
                <h1 className="panel-title">Admin access</h1>
                <p className="panel-subtitle">
                  Sign in with an allowlisted Google account. The break-glass secret is only for
                  emergencies when email auth is unavailable.
                </p>
              </div>
              <Lock size={18} color="var(--green)" />
            </div>
            <form
              className="entry-form"
              onSubmit={(event) => {
                event.preventDefault();
                loadAccounts();
              }}
            >
              <div className="auth-box">
                <div>
                  <strong>{signedIn ? "Google account connected" : "Not signed in"}</strong>
                  <p>{signedIn ? session?.user.email : "Use an allowlisted admin email."}</p>
                </div>
                {signedIn ? (
                  <button className="button secondary" onClick={() => supabase.auth.signOut()} type="button">
                    Sign out
                  </button>
                ) : (
                  <button className="button" onClick={signInWithGoogle} type="button">
                    Sign in with Google
                  </button>
                )}
              </div>
              <div className="field">
                <label htmlFor="break-glass">Break-glass secret (optional)</label>
                <input
                  aria-hidden="true"
                  autoComplete="username"
                  className="credential-username"
                  readOnly
                  tabIndex={-1}
                  value="worldcup-admin"
                />
                <input
                  id="break-glass"
                  autoComplete="current-password"
                  type="password"
                  value={breakGlassSecret}
                  onChange={(event) => setBreakGlassSecret(event.target.value)}
                  placeholder="x-admin-secret header"
                />
              </div>
              {message ? <div className="message">{message}</div> : null}
              {error ? <div className="message error">{error}</div> : null}
            </form>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Production readiness</h2>
                <p className="panel-subtitle">Check launch-critical auth, database, payment, and policy wiring.</p>
              </div>
              <button className="button secondary" disabled={isPending} onClick={loadReadiness} type="button">
                <Activity size={16} />
                Check
              </button>
            </div>
            <div className="admin-form">
              {readinessReport ? (
                <>
                  <div className="readiness-summary">
                    <span className={`readiness-badge ${readinessReport.overallStatus}`}>
                      {readinessStatusLabel(readinessReport.overallStatus)}
                    </span>
                    <span>
                      {readinessReport.summary.pass} pass · {readinessReport.summary.warning} warnings ·{" "}
                      {readinessReport.summary.fail} blockers
                    </span>
                  </div>
                  {readinessLaunchActions.length > 0 ? (
                    <div className="readiness-action-plan" aria-label="Launch action plan">
                      <div className="readiness-action-plan-head">
                        <strong>Launch action plan</strong>
                        <span>Work these from top to bottom before opening paid actions.</span>
                      </div>
                      {readinessLaunchActions.map((action, index) => (
                        <div className="readiness-step" key={action.label}>
                          <span className={`readiness-step-index ${action.status}`}>{index + 1}</span>
                          <div>
                            <strong>{action.label}</strong>
                            <span>{action.detail}</span>
                            <span className="readiness-action">Next: {action.action}</span>
                            <div className="readiness-step-actions">
                              <button
                                className="button secondary"
                                disabled={isPending}
                                onClick={() => runReadinessAction(action.target)}
                                type="button"
                              >
                                {action.ctaLabel}
                              </button>
                              {action.target === "payments" ? (
                                <button
                                  className="button secondary"
                                  disabled={isPending}
                                  onClick={loadLaunchSignoffSettingsFromPlan}
                                  type="button"
                                >
                                  Load Sign-offs
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="admin-referral-list">
                    {readinessReport.checks.map((check) => (
                      <div className="admin-referral-row readiness-row" key={check.id}>
                        <div>
                          <strong>{check.label}</strong>
                          <span>{check.detail}</span>
                          {check.action ? <span className="readiness-action">Next: {check.action}</span> : null}
                        </div>
                        <span className={`readiness-badge ${check.status}`}>
                          {readinessStatusLabel(check.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="field-note">
                  Run this before launch and after any Vercel or Supabase configuration change.
                </div>
              )}
            </div>
          </div>

          <div className="panel" id="admin-operator-policy-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Operator policy</h2>
                <p className="panel-subtitle">Set paid-action countries and USDT guardrails without redeploying.</p>
              </div>
              <button className="button secondary" disabled={isPending} onClick={loadOperatorPolicySettings} type="button">
                Load Policy
              </button>
            </div>
              <div className="admin-form">
              <div className="policy-gate-preview" aria-label="Operator policy presets">
                <div className="policy-gate-preview-head">
                  <strong>Policy presets</strong>
                  <span>Fill the draft only. Review jurisdictions and caps before saving.</span>
                </div>
                <div className="policy-preset-grid">
                  {operatorPolicyPresets.map((preset) => (
                    <button
                      className="policy-preset-button"
                      disabled={isPending}
                      key={preset.label}
                      onClick={() => applyOperatorPolicyPreset(preset)}
                      type="button"
                    >
                      <strong>{preset.label}</strong>
                      <span>{preset.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="policy-allowed-countries">Allowed countries</label>
                  <input
                    id="policy-allowed-countries"
                    onChange={(event) => updateOperatorPolicyDraft({ allowedCountries: event.target.value })}
                    placeholder="US, RO"
                    value={operatorPolicyDraft.allowedCountries}
                  />
                  <div className="field-note">
                    Use ISO alpha-2 country codes such as US or RO. Set this or blocked countries before launch.
                    Leave empty only if blocked countries define the policy.
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="policy-blocked-countries">Blocked countries</label>
                  <input
                    id="policy-blocked-countries"
                    onChange={(event) => updateOperatorPolicyDraft({ blockedCountries: event.target.value })}
                    placeholder="GB, CA"
                    value={operatorPolicyDraft.blockedCountries}
                  />
                  <div className="field-note">
                    Comma-separated ISO alpha-2 country codes such as GB or CA. Blocked countries always win,
                    and cannot overlap allowed countries.
                  </div>
                </div>
              </div>
              <div className="two-col">
                <NumberField
                  label="Max deposit claim"
                  note="Optional per-claim cap in USDT. Blocks any single submitted deposit claim above this amount."
                  placeholder="100"
                  step="0.00000001"
                  value={operatorPolicyDraft.maxDepositClaimAmount}
                  onChange={(value) => updateOperatorPolicyDraft({ maxDepositClaimAmount: value })}
                />
                <NumberField
                  label="Daily deposit cap"
                  note="Optional rolling 24-hour cap in USDT. Set this or Max deposit claim before launch."
                  placeholder="250"
                  step="0.00000001"
                  value={operatorPolicyDraft.maxDailyDepositClaimAmount}
                  onChange={(value) => updateOperatorPolicyDraft({ maxDailyDepositClaimAmount: value })}
                />
              </div>
              <div className="two-col">
                <NumberField
                  label="Max withdrawal request"
                  note="Optional per-request cap in USDT. Blocks any single payout request above this amount."
                  placeholder="100"
                  step="0.00000001"
                  value={operatorPolicyDraft.maxWithdrawalRequestAmount}
                  onChange={(value) => updateOperatorPolicyDraft({ maxWithdrawalRequestAmount: value })}
                />
                <NumberField
                  label="Daily withdrawal cap"
                  note="Optional rolling 24-hour cap in USDT. Set this or Max withdrawal request before launch."
                  placeholder="250"
                  step="0.00000001"
                  value={operatorPolicyDraft.maxDailyWithdrawalRequestAmount}
                  onChange={(value) => updateOperatorPolicyDraft({ maxDailyWithdrawalRequestAmount: value })}
                />
              </div>
              <div className="readiness-summary">
                <span className={`readiness-badge ${operatorPolicyMissing.length > 0 ? "warning" : "pass"}`}>
                  {operatorPolicyMissing.length > 0 ? "Review" : "Ready"}
                </span>
                <span>
                  Operator policy launch gate
                  {operatorPolicyMissing.length > 0
                    ? ` needs ${operatorPolicyMissing.join(", ")} before the operator sign-off can be completed.`
                    : " is ready for operator sign-off."}
                </span>
              </div>
              <div className="policy-gate-preview" aria-label="Paid-action gates">
                <div className="policy-gate-preview-head">
                  <strong>Paid-action gates</strong>
                  <span>{operatorPolicyDraft.source ? "Preview from this policy draft." : "Load policy or type values to preview."}</span>
                </div>
                <div className="policy-gate-grid">
                  {operatorPolicyActionGates.map((gate) => (
                    <div className="policy-gate-card" key={gate.label}>
                      <div>
                        <strong>{gate.label}</strong>
                        <span>{gate.detail}</span>
                      </div>
                      <span className={`readiness-badge ${gate.ready ? "pass" : "warning"}`}>
                        {gate.ready ? "Enabled" : "Paused"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="policy-launch-checklist" aria-label="Operator policy launch checklist">
                <div className="policy-gate-preview-head">
                  <strong>Launch policy checklist</strong>
                  <span>Required before operator sign-off.</span>
                </div>
                <div className="policy-checklist-grid">
                  {operatorPolicyLaunchChecklist.map((item) => (
                    <div className="policy-checklist-row" key={item.label}>
                      <div>
                        <strong>{item.label}</strong>
                        <span>{item.detail}</span>
                      </div>
                      <span className={`readiness-badge ${item.ready ? "pass" : "warning"}`}>
                        {item.ready ? "Ready" : "Review"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="button secondary" disabled={isPending} onClick={saveOperatorPolicySettings} type="button">
                Save Operator Policy
              </button>
              <div className="field-note">
                Source: {operatorPolicyDraft.source || "not loaded"}
                {operatorPolicyDraft.updatedAt ? ` · Updated ${new Date(operatorPolicyDraft.updatedAt).toLocaleString()}` : ""}
                {operatorPolicyDraft.updatedBy ? ` · ${operatorPolicyDraft.updatedBy}` : ""}
              </div>
            </div>
          </div>

          <div className="panel" id="admin-launch-signoffs-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Launch sign-offs</h2>
                <p className="panel-subtitle">
                  Record the real-world payment tests and operator approvals needed before launch.
                </p>
              </div>
              <div className="panel-header-actions">
                <button className="button secondary" disabled={isPending} onClick={loadLaunchEvidenceSnapshot} type="button">
                  <FileJson size={16} />
                  Evidence Snapshot
                </button>
                <button className="button secondary" disabled={isPending} onClick={loadLaunchSignoffSettings} type="button">
                  Load Sign-offs
                </button>
              </div>
            </div>
            <div className="admin-form">
              {launchEvidenceSnapshot ? (
                <div className="launch-evidence-snapshot">
                  <div className="readiness-summary">
                    <div>
                      <strong>Evidence snapshot</strong>
                      <span>
                        Generated {new Date(launchEvidenceSnapshot.generatedAt).toLocaleString()} ·{" "}
                        {launchEvidenceSnapshot.generatedBy}
                      </span>
                    </div>
                    <span>
                      {launchEvidenceSnapshot.readiness.summary.pass} pass ·{" "}
                      {launchEvidenceSnapshot.readiness.summary.warning} warning ·{" "}
                      {launchEvidenceSnapshot.readiness.summary.fail} fail
                    </span>
                  </div>
                  <div className="signoff-evidence-actions evidence-snapshot-actions">
                    <button className="button secondary" disabled={isPending} onClick={copyLaunchEvidenceSnapshot} type="button">
                      <Copy size={16} />
                      Copy JSON
                    </button>
                    <button className="button secondary" disabled={isPending} onClick={downloadLaunchEvidenceSnapshot} type="button">
                      <Download size={16} />
                      Download JSON
                    </button>
                  </div>
                  <div className="evidence-snapshot-grid">
                    <div>
                      <span className="ds-label">Deployment</span>
                      <strong>{launchEvidenceSnapshot.deployment.vercelEnv ?? launchEvidenceSnapshot.deployment.source}</strong>
                      <small>{launchEvidenceSnapshot.deployment.canonicalOrigin}</small>
                      <small>
                        {launchEvidenceSnapshot.deployment.deploymentUrl ??
                          launchEvidenceSnapshot.deployment.siteUrl}
                      </small>
                      {launchEvidenceSnapshot.deployment.gitCommitSha ? (
                        <small>
                          Commit {launchEvidenceSnapshot.deployment.gitCommitSha.slice(0, 12)}
                          {launchEvidenceSnapshot.deployment.gitCommitRef
                            ? ` · ${launchEvidenceSnapshot.deployment.gitCommitRef}`
                            : ""}
                        </small>
                      ) : null}
                    </div>
                    <div>
                      <span className="ds-label">Operator policy</span>
                      <strong>{launchEvidenceSnapshot.operatorPolicy.source}</strong>
                      <small>
                        Countries:{" "}
                        {launchEvidenceSnapshot.operatorPolicy.allowedCountries.length +
                          launchEvidenceSnapshot.operatorPolicy.blockedCountries.length}
                      </small>
                      <small>
                        Deposit cap:{" "}
                        {launchEvidenceSnapshot.operatorPolicy.maxDepositClaimAmount ??
                          launchEvidenceSnapshot.operatorPolicy.maxDailyDepositClaimAmount ??
                          "missing"}
                      </small>
                      <small>
                        Withdrawal cap:{" "}
                        {launchEvidenceSnapshot.operatorPolicy.maxWithdrawalRequestAmount ??
                          launchEvidenceSnapshot.operatorPolicy.maxDailyWithdrawalRequestAmount ??
                          "missing"}
                      </small>
                    </div>
                    <div>
                      <span className="ds-label">Legal version</span>
                      <strong>{launchEvidenceSnapshot.legal.currentTermsVersion}</strong>
                      <small>Terms and Privacy evidence must reference this version.</small>
                    </div>
                    <div>
                      <span className="ds-label">Sign-off evidence</span>
                      <strong>
                        {launchEvidenceSnapshot.signoffs.filter((signoff) => signoff.evidenceReady).length}/
                        {launchEvidenceSnapshot.signoffs.length} ready
                      </strong>
                      <small>
                        {launchEvidenceSnapshot.signoffs.filter((signoff) => signoff.status === "completed").length} completed
                      </small>
                    </div>
                    {launchEvidenceSnapshot.paidActionEvidence ? (
                      <div>
                        <span className="ds-label">Admin evidence lane</span>
                        <strong>
                          {launchEvidenceSnapshot.paidActionEvidence.adminEvidenceActionsAllowed
                            ? "ready"
                            : "review"}
                        </strong>
                        <small>
                          Public paid actions{" "}
                          {launchEvidenceSnapshot.paidActionEvidence.publicPaidActionsPaused
                            ? "paused"
                            : "open"}
                        </small>
                        <small>
                          Admin evidence accounts:{" "}
                          {launchEvidenceSnapshot.paidActionEvidence.adminEmailCount}
                        </small>
                        <small>
                          Admin test actions:{" "}
                          {
                            Object.values(launchEvidenceSnapshot.paidActionEvidence.actions).filter(
                              (action) => action.adminEvidenceAllowed,
                            ).length
                          }
                          /4
                        </small>
                      </div>
                    ) : null}
                  </div>
                  <div className="admin-referral-list">
                    {launchEvidenceSnapshot.signoffs.map((signoff) => (
                      <div className="admin-referral-row readiness-row" key={signoff.key}>
                        <div>
                          <strong>{signoff.label}</strong>
                          <span>{signoff.evidenceStatus ?? signoff.evidenceRequirement}</span>
                        </div>
                        <div>
                          <span className={`readiness-badge ${signoff.evidenceReady ? "pass" : "warning"}`}>
                            {signoff.evidenceReady ? "ready" : "pending"}
                          </span>
                          <span>
                            note {signoff.evidenceNotePresent ? "yes" : "no"} · URL{" "}
                            {signoff.evidenceUrlPresent ? "yes" : "no"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {launchSignoffs.length > 0 ? (
                <div className="admin-referral-list">
                  {launchSignoffs.map((signoff) => {
                    const draft = launchSignoffDrafts[signoff.key] ?? {
                      status: signoff.status,
                      evidenceNote: signoff.evidenceNote ?? "",
                      evidenceUrl: signoff.evidenceUrl ?? "",
                    };
                    const suggestedEvidenceNote = getSuggestedLaunchSignoffEvidenceNote(
                      signoff,
                      operatorPolicyDraft,
                    );
                    const needsEvidence = draft.status !== "pending";
                    const approvalEvidenceUrlRequired =
                      draft.status === "completed" &&
                      isApprovalEvidenceUrlRequiredLaunchSignoffKey(signoff.key);
                    const hasEvidenceUrl = Boolean(draft.evidenceUrl.trim());
                    const evidenceUrlInvalid =
                      hasEvidenceUrl && !isLaunchSignoffEvidenceUrl(draft.evidenceUrl.trim());
                    const operatorPolicyEvidenceBlocked =
                      signoff.key === "operator_policy_review" &&
                      draft.status === "completed" &&
                      signoff.evidenceReady === false;
                    const paymentWaiverBlocked =
                      draft.status === "waived" && isPaymentLaunchSignoffKey(signoff.key);
                    const nonWaivableBlocked =
                      draft.status === "waived" && isNonWaivableLaunchSignoffKey(signoff.key);
                    const paymentEvidenceBlocked =
                      draft.status === "completed" &&
                      isPaymentLaunchSignoffKey(signoff.key) &&
                      signoff.evidenceReady === false;
                    const legalVersionEvidenceBlocked =
                      signoff.key === "legal_compliance_review" &&
                      draft.status === "completed" &&
                      !isCurrentLegalApprovalEvidenceNote(draft.evidenceNote);
                    const canSave =
                      !isPending &&
                      !operatorPolicyEvidenceBlocked &&
                      !nonWaivableBlocked &&
                      !paymentEvidenceBlocked &&
                      !legalVersionEvidenceBlocked &&
                      !evidenceUrlInvalid &&
                      (!approvalEvidenceUrlRequired || hasEvidenceUrl) &&
                      (!needsEvidence || Boolean(draft.evidenceNote.trim()));

                    return (
                      <div className="admin-referral-row readiness-row signoff-row" key={signoff.key}>
                        <div>
                          <strong>{signoff.label}</strong>
                          <span>{signoff.detail}</span>
                          <span className="signoff-requirement">
                            Requirement: {signoff.evidenceRequirement}
                          </span>
                          {signoff.evidenceStatus ? (
                            <span className={`signoff-evidence ${signoff.evidenceReady ? "ready" : "pending"}`}>
                              Evidence: {signoff.evidenceStatus}
                            </span>
                          ) : null}
                          <span>
                            Last status: {signoff.status}
                            {signoff.updatedAt ? ` · ${new Date(signoff.updatedAt).toLocaleString()}` : ""}
                            {signoff.updatedBy ? ` · ${signoff.updatedBy}` : ""}
                          </span>
                          {signoff.key === "legal_compliance_review" ? (
                            <div className="signoff-evidence-actions">
                              <Link className="button secondary" href="/terms" rel="noreferrer" target="_blank">
                                Terms
                              </Link>
                              <Link className="button secondary" href="/privacy" rel="noreferrer" target="_blank">
                                Privacy
                              </Link>
                              <span className="field-note">
                                Current Terms/Privacy consent version: {CURRENT_TERMS_VERSION}
                              </span>
                            </div>
                          ) : (
                            <div className="signoff-evidence-actions">
                              <button
                                className="button secondary"
                                disabled={isPending}
                                onClick={() => runLaunchSignoffEvidenceAction(signoff.key)}
                                type="button"
                              >
                                {signoff.evidenceActionLabel}
                              </button>
                            </div>
                          )}
                          {signoff.key === "operator_policy_review" ? (
                            <div className="approval-evidence-checklist" aria-label="Operator approval evidence checklist">
                              <strong>Operator approval evidence</strong>
                              <span>Save country rules plus deposit and withdrawal caps before selecting Completed.</span>
                              <span>Use an HTTPS approval record URL and include reviewer, policy values, and approval time in the note.</span>
                            </div>
                          ) : null}
                          {signoff.key === "legal_compliance_review" ? (
                            <div className="approval-evidence-checklist" aria-label="Legal approval evidence checklist">
                              <strong>Legal approval evidence</strong>
                              <span>Review Terms and Privacy for version {CURRENT_TERMS_VERSION} before selecting Completed.</span>
                              <span>Use an HTTPS approval record URL and include Terms/Privacy version {CURRENT_TERMS_VERSION} in the note.</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="signoff-review">
                          <div className="two-col">
                            <div className="field">
                              <label htmlFor={`signoff-status-${signoff.key}`}>Status</label>
                              <select
                                id={`signoff-status-${signoff.key}`}
                                onChange={(event) =>
                                  updateLaunchSignoffDraft(signoff.key, {
                                    status: event.target.value as LaunchSignoffStatus,
                                  })
                                }
                                value={draft.status}
                              >
                                <option value="pending">Pending</option>
                                <option
                                  value="completed"
                                  disabled={
                                    (isPaymentLaunchSignoffKey(signoff.key) ||
                                      signoff.key === "operator_policy_review") &&
                                    signoff.evidenceReady === false
                                  }
                                >
                                  Completed
                                </option>
                                <option value="waived" disabled={isNonWaivableLaunchSignoffKey(signoff.key)}>
                                  Waived
                                </option>
                              </select>
                            </div>
                            <div className="field">
                              <label htmlFor={`signoff-url-${signoff.key}`}>Evidence URL</label>
                              <input
                                id={`signoff-url-${signoff.key}`}
                                onChange={(event) =>
                                  updateLaunchSignoffDraft(signoff.key, { evidenceUrl: event.target.value })
                                }
                                placeholder={
                                  isApprovalEvidenceUrlRequiredLaunchSignoffKey(signoff.key)
                                    ? "Required HTTPS URL for completed approval"
                                    : "https://..."
                                }
                                type="url"
                                value={draft.evidenceUrl}
                              />
                            </div>
                          </div>
                          <div className="field">
                            <label htmlFor={`signoff-note-${signoff.key}`}>Evidence note</label>
                            <input
                              id={`signoff-note-${signoff.key}`}
                              onChange={(event) =>
                                updateLaunchSignoffDraft(signoff.key, { evidenceNote: event.target.value })
                              }
                              placeholder={getLaunchSignoffEvidenceNotePlaceholder(signoff.key)}
                              value={draft.evidenceNote}
                            />
                          </div>
                          {suggestedEvidenceNote ? (
                            <div className="signoff-note-actions">
                              <button
                                className="button secondary"
                                disabled={isPending}
                                onClick={() =>
                                  updateLaunchSignoffDraft(signoff.key, {
                                    evidenceNote: suggestedEvidenceNote,
                                  })
                                }
                                type="button"
                              >
                                Use Suggested Note
                              </button>
                            </div>
                          ) : null}
                          {needsEvidence && !draft.evidenceNote.trim() ? (
                            <span className="field-note">{getLaunchSignoffEvidenceNoteRequirement()}</span>
                          ) : null}
                          {approvalEvidenceUrlRequired && !draft.evidenceUrl.trim() ? (
                            <span className="field-note">
                              Completed operator, legal, and compliance approvals require an HTTPS evidence URL.
                            </span>
                          ) : null}
                          {evidenceUrlInvalid ? (
                            <span className="field-note">{getLaunchSignoffEvidenceUrlRequirement()}</span>
                          ) : null}
                          {operatorPolicyEvidenceBlocked ? (
                            <span className="field-note">
                              Complete the operator policy launch gate before saving this sign-off as completed.
                            </span>
                          ) : null}
                          {paymentWaiverBlocked ? (
                            <span className="field-note">
                              Real USDT payment tests cannot be waived. Complete the live payment test instead.
                            </span>
                          ) : null}
                          {nonWaivableBlocked && !paymentWaiverBlocked ? (
                            <span className="field-note">
                              This launch sign-off cannot be waived for production.
                            </span>
                          ) : null}
                          {paymentEvidenceBlocked ? (
                            <span className="field-note">
                              This payment sign-off cannot be completed until matching live payment evidence is ready.
                            </span>
                          ) : null}
                          {legalVersionEvidenceBlocked ? (
                            <span className="field-note">
                              {getCurrentLegalApprovalEvidenceNoteRequirement()}
                            </span>
                          ) : null}
                          <button
                            className="button secondary"
                            disabled={!canSave}
                            onClick={() => saveLaunchSignoff(signoff.key)}
                            type="button"
                          >
                            Save Sign-off
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="field-note">
                  Load sign-offs to mark real USDT deposit tests, withdrawal payout tests, and compliance approvals.
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Result entry</h2>
                <p className="panel-subtitle">Manual fallback; also progresses the bracket.</p>
              </div>
              <ClipboardCheck size={18} color="var(--green)" />
            </div>
            <div className="admin-form">
              <div className="field">
                <label htmlFor="result-match">Match</label>
                <select
                  id="result-match"
                  value={resultForm.matchId}
                  onChange={(event) => setResultForm((current) => ({ ...current, matchId: event.target.value }))}
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
                <label htmlFor="result-finish">Finish method</label>
                <select
                  id="result-finish"
                  value={resultForm.finishMethod}
                  onChange={(event) =>
                    setResultForm((current) => ({
                      ...current,
                      finishMethod: event.target.value as ResultForm["finishMethod"],
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
                  value={resultForm.homeGoals90}
                  onChange={(value) => setResultForm((c) => ({ ...c, homeGoals90: value }))}
                />
                <NumberField
                  label="Away 90"
                  value={resultForm.awayGoals90}
                  onChange={(value) => setResultForm((c) => ({ ...c, awayGoals90: value }))}
                />
              </div>
              <div className="two-col">
                <NumberField
                  label="Home total"
                  value={resultForm.homeGoalsTotal}
                  onChange={(value) => setResultForm((c) => ({ ...c, homeGoalsTotal: value }))}
                />
                <NumberField
                  label="Away total"
                  value={resultForm.awayGoalsTotal}
                  onChange={(value) => setResultForm((c) => ({ ...c, awayGoalsTotal: value }))}
                />
              </div>
              <div className="two-col">
                <NumberField
                  label="Home pens"
                  value={resultForm.homePenalties}
                  onChange={(value) => setResultForm((c) => ({ ...c, homePenalties: value }))}
                />
                <NumberField
                  label="Away pens"
                  value={resultForm.awayPenalties}
                  onChange={(value) => setResultForm((c) => ({ ...c, awayPenalties: value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="result-winner">Winner</label>
                <select
                  id="result-winner"
                  value={resultForm.winnerTeamId}
                  onChange={(event) => setResultForm((c) => ({ ...c, winnerTeamId: event.target.value }))}
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
                disabled={!resultForm.matchId || isPending}
                onClick={submitResult}
                type="button"
              >
                <ClipboardCheck size={16} />
                Save Result & Apply Points
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Bracket & payouts</h2>
                <p className="panel-subtitle">Advance knockouts, override pairings, settle prizes.</p>
              </div>
              <GitBranch size={18} color="var(--green)" />
            </div>
            <div className="admin-form">
              <div className="two-col">
                <button className="button secondary" disabled={isPending} onClick={advanceBracket} type="button">
                  Advance Bracket
                </button>
                <button className="button secondary" disabled={isPending} onClick={settlePayouts} type="button">
                  Settle Payouts
                </button>
              </div>
              {settlementPayouts.length > 0 ? (
                <div className="admin-referral-list" aria-label="Settlement payout audit rows">
                  {settlementPayouts.map((payout, index) => (
                    <div
                      className="admin-referral-row"
                      key={`${payout.payout_type}-${payout.user_id}-${payout.rank ?? "none"}-${index}`}
                    >
                      <div>
                        <strong>
                          {payout.payout_type === "referral" ? "Referral payout" : "Prize payout"}
                          {payout.rank ? ` · Rank ${payout.rank}` : ""}
                        </strong>
                        <span>{payout.user_id}</span>
                      </div>
                      <div>
                        <strong>{formatLedgerAmount(payout.amount)}</strong>
                        <span>USDT wallet credit</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="assign-match">Override match teams</label>
                <select
                  id="assign-match"
                  value={assignMatchId}
                  onChange={(event) => setAssignMatchId(event.target.value)}
                >
                  <option value="">Select match</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      #{match.match_number} {match.home_slot} vs {match.away_slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="assign-home">Home team</label>
                  <select id="assign-home" value={assignHomeTeamId} onChange={(e) => setAssignHomeTeamId(e.target.value)}>
                    <option value="">Unchanged</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="assign-away">Away team</label>
                  <select id="assign-away" value={assignAwayTeamId} onChange={(e) => setAssignAwayTeamId(e.target.value)}>
                    <option value="">Unchanged</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                className="button secondary"
                disabled={!assignMatchId || isPending}
                onClick={assignMatchTeams}
                type="button"
              >
                Assign Match Teams
              </button>
              <div className="field">
                <label htmlFor="prize-pool">Manual prize pool override (net)</label>
                <input
                  id="prize-pool"
                  min="0"
                  type="number"
                  value={prizePoolAmount}
                  onChange={(event) => setPrizePoolAmount(event.target.value)}
                />
              </div>
              <button className="button secondary" disabled={isPending} onClick={savePrizePool} type="button">
                Save Override
              </button>
              <div className="field-note">
                Normal ticket revenue updates this automatically. Use the override only to correct audited ledger
                totals.
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Tickets & wallets</h2>
                <p className="panel-subtitle">Assign user tickets from admin inventory and record internal transfers.</p>
              </div>
              <button className="button secondary" disabled={isPending} onClick={loadAccounts} type="button">
                Load Accounts
              </button>
            </div>
            <div className="admin-form">
              <div className="two-col">
                <NumberField
                  label="Ticket price USD"
                  note="Default is 50. Admin can change this before assigning new tickets."
                  step="0.01"
                  value={ticketPriceAmount}
                  onChange={setTicketPriceAmount}
                />
                <button className="button secondary" disabled={isPending} onClick={saveTicketPrice} type="button">
                  Save Ticket Price
                </button>
              </div>
              <div className="field-note">
                User ticket assignments are manual admin approvals. The selected payment method is stored in the
                financial statement.
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="ticket-account">Assign ticket for user</label>
                  <select id="ticket-account" value={ticketUserId} onChange={(e) => setTicketUserId(e.target.value)}>
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.userId} value={account.userId}>
                        {account.displayName} · {account.accountRole === "agent" ? "Agent" : "User"} ·{" "}
                        {account.email ?? account.referralCode}
                      </option>
                    ))}
                  </select>
                </div>
                <NumberField label="Quantity" value={ticketQuantity} onChange={setTicketQuantity} />
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="ticket-payment-method">Payment method</label>
                  <select
                    id="ticket-payment-method"
                    value={ticketPaymentMethod}
                    onChange={(event) => setTicketPaymentMethod(event.target.value as "cash" | "usdt")}
                  >
                    <option value="cash">Cash</option>
                    <option value="usdt">USDT</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="ticket-assignment-note">Approval note</label>
                  <input
                    id="ticket-assignment-note"
                    value={ticketAssignmentNote}
                    onChange={(event) => setTicketAssignmentNote(event.target.value)}
                    placeholder="Receipt, sender wallet, or manual note"
                  />
                </div>
              </div>
              <button
                className="button secondary"
                disabled={!ticketUserId || isPending}
                onClick={assignTickets}
                type="button"
              >
                Assign user ticket
              </button>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="wallet-from">Transfer from</label>
                  <select id="wallet-from" value={walletFromUserId} onChange={(e) => setWalletFromUserId(e.target.value)}>
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.userId} value={account.userId}>
                        {account.displayName} · {account.accountRole === "agent" ? "Agent" : "User"} · balance{" "}
                        {formatLedgerAmount(account.walletBalance)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="wallet-to">Transfer to</label>
                  <select id="wallet-to" value={walletToUserId} onChange={(e) => setWalletToUserId(e.target.value)}>
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.userId} value={account.userId}>
                        {account.displayName} · {account.accountRole === "agent" ? "Agent" : "User"} ·{" "}
                        {account.email ?? account.referralCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="two-col">
                <NumberField label="Amount" value={walletAmount} onChange={setWalletAmount} />
                <div className="field">
                  <label htmlFor="wallet-note">Note</label>
                  <input
                    id="wallet-note"
                    value={walletNote}
                    onChange={(event) => setWalletNote(event.target.value)}
                    placeholder="Reason for transfer"
                  />
                </div>
              </div>
              <button
                className="button secondary"
                disabled={!walletFromUserId || !walletToUserId || !walletAmount || isPending}
                onClick={transferFunds}
                type="button"
              >
                Transfer Funds
              </button>
              {accounts.length > 0 ? (
                <div className="admin-referral-list">
                  {accounts.map((account) => (
                    <div className="admin-referral-row" key={account.userId}>
                      <div>
                        <strong>
                          {account.displayName}
                          <span className={`account-role-badge ${account.accountRole}`}>
                            {account.accountRole}
                          </span>
                        </strong>
                        <span>{account.email ?? "No email stored"} · {account.referralCode}</span>
                        <span>
                          Tickets: {account.ticketsAvailable}/{account.ticketsAssigned} available
                        </span>
                        {account.usdtSenderWalletTrc20Address || account.usdtSenderWalletErc20Address ? (
                          <div className="account-wallet-locks">
                            {account.usdtSenderWalletTrc20Address ? (
                              <code className="deposit-address">
                                TRC20 sender: {account.usdtSenderWalletTrc20Address}
                              </code>
                            ) : null}
                            {account.usdtSenderWalletErc20Address ? (
                              <code className="deposit-address">
                                ERC20 sender: {account.usdtSenderWalletErc20Address}
                              </code>
                            ) : null}
                          </div>
                        ) : (
                          <span>No USDT sender wallet saved yet</span>
                        )}
                      </div>
                      <div>
                        <strong>{formatLedgerAmount(account.walletBalance)}</strong>
                        <span>Wallet</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="field-note">Load accounts to assign tickets or transfer funds.</div>
              )}
            </div>
          </div>

          <div className="panel" id="admin-deposit-claims-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Incoming transfers</h2>
                <p className="panel-subtitle">
                  Manual USDT payment history with sender wallet, amount, and agent/user status.
                </p>
              </div>
              <button className="button secondary" disabled={isPending} onClick={loadDepositClaims} type="button">
                Load Transfers
              </button>
            </div>
            <div className="admin-form">
              <div className="launch-evidence-checklist" aria-label="Real USDT deposit launch checklist">
                <strong>Real USDT deposit launch evidence</strong>
                <span>
                  TRC20 and ERC20 each need one credited USDT claim linked to a server-side KuCoin
                  receive-wallet match.
                </span>
                <span>
                  Keep Require KuCoin match checked, run Verify KuCoin, cross-check the
                  self-reported sender wallet on-chain, then Credit. Manual non-launch credit will
                  not complete these sign-offs.
                </span>
              </div>
              {depositClaims.length > 0 ? (
                <div className="admin-referral-list">
                  {depositClaims.map((claim) => {
                    const explorerUrl = getDepositExplorerTxUrl(claim.network, claim.txHash);
                    const senderWalletUrl = claim.senderWalletAddress
                      ? getDepositExplorerAddressUrl(claim.network, claim.senderWalletAddress)
                      : null;
                    const receiveWalletUrl = getDepositExplorerAddressUrl(claim.network, claim.address);
                    const verification = depositClaimVerifications[claim.id];
                    const reviewDraft = depositClaimReviewDrafts[claim.id] ?? {
                      amount: claim.amount,
                      note: claim.adminNote ?? "",
                      requireKucoinMatch: claim.status === "submitted",
                    };
                    const canReview = claim.status === "submitted" && !isPending;
                    const requiresKucoinMatch = reviewDraft.requireKucoinMatch === true;
                    const canCredit =
                      canReview &&
                      Boolean(reviewDraft.amount) &&
                      Boolean(reviewDraft.note.trim()) &&
                      (!requiresKucoinMatch || verification?.status === "matched");

                    return (
                      <div className="admin-referral-row" key={claim.id}>
                        <div>
                          <strong>
                            {claim.displayName} · {claim.accountRole === "agent" ? "Agent" : "User"} ·{" "}
                            {formatLedgerAmount(claim.amount)} {claim.currency}
                          </strong>
                          <span>
                            {claim.userEmail ?? claim.userId} · {claim.network.toUpperCase()} · {claim.status}
                          </span>
                          <code className="deposit-address">Claim ID: {claim.id}</code>
                          {claim.senderWalletAddress ? (
                            <>
                              <code className="deposit-address">Incoming from: {claim.senderWalletAddress}</code>
                              {senderWalletUrl ? (
                                <a
                                  className="deposit-explorer-link"
                                  href={senderWalletUrl}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  View sender wallet
                                </a>
                              ) : null}
                            </>
                          ) : (
                            <span className="field-note">No sender wallet captured on this older claim.</span>
                          )}
                          <code className="deposit-address">WorldCup receive wallet: {claim.address}</code>
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
                          <code className="deposit-address">{claim.txHash}</code>
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
                          {verification ? (
                            <span className={`field-note ${verification.status === "matched" ? "success-note" : ""}`}>
                              {verification.status === "matched"
                                ? `KuCoin confirmed ${formatLedgerAmount(verification.amount ?? claim.amount)} ${claim.currency} reached the shared receive wallet${
                                    verification.amountMatchesClaim === false ? " (different from claimed amount)" : ""
                                  }. Sender wallet is self-reported; cross-check it against the public transaction before crediting.`
                                : verification.message ?? "KuCoin deposit was not found yet."}
                            </span>
                          ) : null}
                        </div>
                        <div className="deposit-review">
                          <div className="deposit-review-fields">
                            <div className="field">
                              <label htmlFor={`claim-amount-${claim.id}`}>Credit amount</label>
                              <input
                                id={`claim-amount-${claim.id}`}
                                inputMode="decimal"
                                min="0"
                                onChange={(event) =>
                                  updateDepositClaimDraft(claim.id, { amount: event.target.value })
                                }
                                step="0.000001"
                                type="number"
                                value={reviewDraft.amount}
                                disabled={claim.status !== "submitted"}
                              />
                            </div>
                            <div className="field">
                              <label htmlFor={`claim-note-${claim.id}`}>Admin note</label>
                              <input
                                id={`claim-note-${claim.id}`}
                                onChange={(event) =>
                                  updateDepositClaimDraft(claim.id, { note: event.target.value })
                                }
                                placeholder="Required: KuCoin match or manual verification"
                                value={reviewDraft.note}
                                disabled={claim.status !== "submitted"}
                              />
                            </div>
                          </div>
                          {claim.status === "submitted" && !reviewDraft.note.trim() ? (
                            <span className="field-note">
                              Credit requires an admin note for the audit trail.
                            </span>
                          ) : null}
                          {claim.status === "submitted" ? (
                            <label className="check-row" htmlFor={`claim-kucoin-required-${claim.id}`}>
                              <input
                                id={`claim-kucoin-required-${claim.id}`}
                                checked={requiresKucoinMatch}
                                onChange={(event) =>
                                  updateDepositClaimDraft(claim.id, {
                                    requireKucoinMatch: event.target.checked,
                                  })
                                }
                                type="checkbox"
                              />
                              Require KuCoin match for launch evidence
                            </label>
                          ) : null}
                          {claim.status === "submitted" && requiresKucoinMatch && verification?.status !== "matched" ? (
                            <span className="field-note">
                              Run Verify KuCoin first. Manual credit without a server-side receive-wallet
                              match will not satisfy the TRC20/ERC20 launch sign-off.
                            </span>
                          ) : null}
                          {claim.status === "submitted" && !requiresKucoinMatch ? (
                            <span className="field-note">
                              Manual non-launch credit is allowed, but this claim will not count as
                              real USDT launch evidence unless KuCoin verification is matched.
                            </span>
                          ) : null}
                          <div className="deposit-review-actions">
                            <button
                              className="button secondary"
                              disabled={isPending}
                              onClick={() => verifyDepositClaim(claim)}
                              type="button"
                            >
                              Verify KuCoin
                            </button>
                            <button
                              className="button secondary"
                              disabled={!canCredit}
                              onClick={() => reviewDepositClaim("credit", claim.id)}
                              type="button"
                            >
                              <CircleDollarSign size={16} />
                              Credit
                            </button>
                            <button
                              className="button secondary"
                              disabled={!canReview}
                              onClick={() => reviewDepositClaim("reject", claim.id)}
                              type="button"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="field-note">Load claims after a player submits a transaction hash.</div>
              )}
            </div>
          </div>

          <div className="panel" id="admin-withdrawal-requests-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Withdrawal requests</h2>
                <p className="panel-subtitle">Review wallet debits and record manual USDT payouts.</p>
              </div>
              <button className="button secondary" disabled={isPending} onClick={loadWithdrawals} type="button">
                Load Withdrawals
              </button>
            </div>
            <div className="admin-form">
              <div className="launch-evidence-checklist" aria-label="Real USDT withdrawal launch checklist">
                <strong>Real USDT withdrawal launch evidence</strong>
                <span>
                  Approve one submitted withdrawal, send the USDT payout manually on the requested network, then paste the payout tx hash.
                </span>
                <span>
                  Keep Count this paid payout as real launch evidence checked before Mark paid.
                </span>
              </div>
              {withdrawals.length > 0 ? (
                <div className="admin-referral-list">
                  {withdrawals.map((withdrawal) => {
                    const explorerUrl =
                      withdrawal.externalTxHash
                        ? getWithdrawalExplorerTxUrl(withdrawal.network, withdrawal.externalTxHash)
                        : null;
                    const draft = withdrawalReviewDrafts[withdrawal.id] ?? {
                      note: withdrawal.adminNote ?? "",
                      externalTxHash: withdrawal.externalTxHash ?? "",
                      launchEvidence: withdrawal.payoutEvidenceReady === true,
                    };
                    const canReview = withdrawal.status === "submitted" && !isPending;
                    const canApproveOrReject = canReview && Boolean(draft.note.trim());
                    const canMarkPaid =
                      withdrawal.status === "approved" &&
                      !isPending &&
                      Boolean(draft.externalTxHash.trim()) &&
                      Boolean((draft.note || withdrawal.adminNote || "").trim());

                    return (
                      <div className="admin-referral-row" key={withdrawal.id}>
                        <div>
                          <strong>
                            {withdrawal.displayName} · {formatLedgerAmount(withdrawal.amount)}{" "}
                            {withdrawal.currency}
                          </strong>
                          <span>
                            {withdrawal.userEmail ?? withdrawal.userId} · {withdrawal.network.toUpperCase()} ·{" "}
                            {withdrawal.status}
                          </span>
                          <code className="deposit-address">{withdrawal.address}</code>
                          {withdrawal.externalTxHash ? (
                            <code className="deposit-address">{withdrawal.externalTxHash}</code>
                          ) : null}
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
                          {withdrawal.walletTransactionId ? (
                            <span>Wallet debit: {withdrawal.walletTransactionId}</span>
                          ) : null}
                          {withdrawal.payoutEvidenceReady ? (
                            <span className="field-note success-note">
                              Counts as real withdrawal launch evidence.
                            </span>
                          ) : null}
                          {withdrawal.adminNote ? <span>{withdrawal.adminNote}</span> : null}
                        </div>
                        <div className="deposit-review">
                          <div className="deposit-review-fields">
                            <div className="field">
                              <label htmlFor={`withdrawal-note-${withdrawal.id}`}>Admin note</label>
                              <input
                                id={`withdrawal-note-${withdrawal.id}`}
                                onChange={(event) =>
                                  updateWithdrawalDraft(withdrawal.id, { note: event.target.value })
                                }
                                placeholder="Required audit note"
                                value={draft.note}
                                disabled={withdrawal.status === "paid" || withdrawal.status === "rejected"}
                              />
                            </div>
                            <div className="field">
                              <label htmlFor={`withdrawal-tx-${withdrawal.id}`}>Payout tx hash</label>
                              <input
                                id={`withdrawal-tx-${withdrawal.id}`}
                                onChange={(event) =>
                                  updateWithdrawalDraft(withdrawal.id, { externalTxHash: event.target.value })
                                }
                                placeholder="Required after manual payout"
                                value={draft.externalTxHash}
                                disabled={withdrawal.status !== "approved"}
                              />
                            </div>
                          </div>
                          {withdrawal.status === "submitted" && !draft.note.trim() ? (
                            <span className="field-note">Approval or rejection requires an admin note.</span>
                          ) : null}
                          {withdrawal.status === "approved" && !draft.externalTxHash.trim() ? (
                            <span className="field-note">
                              Send USDT manually, then paste the network transaction hash.
                            </span>
                          ) : null}
                          {withdrawal.status === "approved" ? (
                            <label className="check-row" htmlFor={`withdrawal-evidence-${withdrawal.id}`}>
                              <input
                                id={`withdrawal-evidence-${withdrawal.id}`}
                                checked={draft.launchEvidence}
                                onChange={(event) =>
                                  updateWithdrawalDraft(withdrawal.id, {
                                    launchEvidence: event.target.checked,
                                  })
                                }
                                type="checkbox"
                              />
                              Count this paid payout as real launch evidence
                            </label>
                          ) : null}
                          <div className="deposit-review-actions">
                            <button
                              className="button secondary"
                              disabled={!canApproveOrReject}
                              onClick={() => reviewWithdrawal("approve", withdrawal.id)}
                              type="button"
                            >
                              <CircleDollarSign size={16} />
                              Approve
                            </button>
                            <button
                              className="button secondary"
                              disabled={!canApproveOrReject}
                              onClick={() => reviewWithdrawal("reject", withdrawal.id)}
                              type="button"
                            >
                              Reject
                            </button>
                            <button
                              className="button secondary"
                              disabled={!canMarkPaid}
                              onClick={() => reviewWithdrawal("mark_paid", withdrawal.id)}
                              type="button"
                            >
                              <Upload size={16} />
                              Mark Paid
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="field-note">Load withdrawals after a player submits a payout request.</div>
              )}
            </div>
          </div>

          <div className="panel" id="admin-age-verification-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Age verification</h2>
                <p className="panel-subtitle">
                  Confirm players are 18 or older from their submitted ID before approving any payout.
                </p>
              </div>
              <button
                className="button secondary"
                disabled={isPending}
                onClick={loadAgeVerifications}
                type="button"
              >
                Load Age Verifications
              </button>
            </div>
            <div className="admin-form">
              {ageVerifications.length > 0 ? (
                <div className="admin-referral-list">
                  {ageVerifications.map((row) => {
                    const note = ageVerificationNotes[row.userId] ?? row.note ?? "";
                    const canReview = !isPending && Boolean(note.trim());

                    return (
                      <div className="admin-referral-row" key={row.userId}>
                        <div>
                          <strong>{row.displayName}</strong>
                          <span>
                            {row.email ?? row.userId} · {row.status}
                          </span>
                          {row.submittedAt ? (
                            <span>Documents sent: {new Date(row.submittedAt).toLocaleString()}</span>
                          ) : null}
                          {row.verifiedAt ? (
                            <span>
                              Reviewed: {new Date(row.verifiedAt).toLocaleString()}
                              {row.verifiedBy ? ` · ${row.verifiedBy}` : ""}
                            </span>
                          ) : null}
                          {row.note ? <span>{row.note}</span> : null}
                        </div>
                        <div className="deposit-review">
                          <div className="field">
                            <label htmlFor={`age-note-${row.userId}`}>Review note</label>
                            <input
                              id={`age-note-${row.userId}`}
                              onChange={(event) => updateAgeVerificationNote(row.userId, event.target.value)}
                              placeholder="Required audit note (e.g. ID checked, 18+)"
                              value={note}
                            />
                          </div>
                          {!note.trim() ? (
                            <span className="field-note">A review note is required to verify or reject.</span>
                          ) : null}
                          <div className="deposit-review-actions">
                            <button
                              className="button secondary"
                              disabled={!canReview || row.status === "verified"}
                              onClick={() => reviewAgeVerification("verify", row.userId)}
                              type="button"
                            >
                              Mark 18+ Verified
                            </button>
                            <button
                              className="button secondary"
                              disabled={!canReview}
                              onClick={() => reviewAgeVerification("reject", row.userId)}
                              type="button"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="field-note">
                  Load age verifications after a player marks their documents as sent.
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Agents</h2>
                <p className="panel-subtitle">
                  Request numbered tickets into admin inventory, then sell them to agents after manual payment. Every
                  10 paid agent tickets auto-awards 1 free.
                </p>
              </div>
              <button
                className="button secondary"
                disabled={isPending}
                onClick={refreshAgents}
                type="button"
              >
                Refresh
              </button>
            </div>
            <div className="entry-form">
              <div className="status-row" aria-label="Ticket code pool">
                <div className="stat">
                  <div className="stat-label">Pool total</div>
                  <div className="stat-value">{agentPool.total.toLocaleString()}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Available</div>
                  <div className="stat-value">{agentPool.available.toLocaleString()}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Admin</div>
                  <div className="stat-value">{agentPool.admin.toLocaleString()}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Assigned</div>
                  <div className="stat-value">{agentPool.assigned.toLocaleString()}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Redeemed</div>
                  <div className="stat-value">{agentPool.redeemed.toLocaleString()}</div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="request-ticket-qty">Request Tickets</label>
                <div className="inline-row">
                  <input
                    aria-label="Request ticket quantity"
                    className="search agent-qty"
                    max="10000"
                    min="1"
                    onChange={(event) => setRequestTicketQty(event.target.value)}
                    type="number"
                    value={requestTicketQty}
                  />
                  <button
                    className="button"
                    disabled={isPending || Number(requestTicketQty) < 1}
                    onClick={() => requestAdminTickets()}
                    type="button"
                  >
                    Request Tickets
                  </button>
                  <button
                    className="button secondary"
                    disabled={isPending || agentPool.available < 2000}
                    onClick={() => {
                      setRequestTicketQty("2000");
                      requestAdminTickets(2000);
                    }}
                    type="button"
                  >
                    Request 2,000
                  </button>
                </div>
                <span className="field-note">
                  Moves the next numbered tickets from the generated 10,000 pool into admin inventory. Use Request
                  2,000 to refill the owner admin account without moving tickets into agent inventory.
                </span>
              </div>

              <div className="field">
                <label htmlFor="agent-email">Promote a player to agent (email)</label>
                <div className="inline-row">
                  <input
                    className="search"
                    id="agent-email"
                    onChange={(event) => setAgentEmail(event.target.value)}
                    placeholder="player@email.com"
                    type="email"
                    value={agentEmail}
                  />
                  <button
                    className="button"
                    disabled={isPending || agentEmail.trim().length === 0}
                    onClick={addAgent}
                    type="button"
                  >
                    Add agent
                  </button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="assign-agent">Assign Tickets for Agents</label>
                <div className="inline-row">
                  <select
                    className="search"
                    id="assign-agent"
                    onChange={(event) => setAssignAgentUserId(event.target.value)}
                    value={assignAgentUserId}
                  >
                    <option value="">Select agent…</option>
                    {agents.map((agent) => (
                      <option key={agent.userId} value={agent.userId}>
                        {agent.email ?? agent.displayName ?? agent.userId}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="Quantity"
                    className="search agent-qty"
                    max="1000"
                    min="1"
                    onChange={(event) => setAssignAgentQty(event.target.value)}
                    type="number"
                    value={assignAgentQty}
                  />
                  <select
                    aria-label="Agent payment method"
                    className="search agent-qty"
                    onChange={(event) => setAssignAgentPaymentMethod(event.target.value as "cash" | "usdt")}
                    value={assignAgentPaymentMethod}
                  >
                    <option value="cash">Cash</option>
                    <option value="usdt">USDT</option>
                  </select>
                  <button
                    className="button"
                    disabled={isPending || assignAgentUserId.length === 0}
                    onClick={assignAgentCodes}
                    type="button"
                  >
                    Assign agent tickets
                  </button>
                </div>
                <input
                  className="search"
                  onChange={(event) => setAssignAgentNote(event.target.value)}
                  placeholder="Approval note, receipt, wallet, or cash collector"
                  value={assignAgentNote}
                />
                <span className="field-note">
                  Admin inventory goes out in ticket-number order. If the agent has no personal user ticket yet, the
                  first paid ticket is assigned to that agent user account.
                </span>
              </div>

              {agents.length > 0 ? (
                <div className="coefficient-table" role="table" aria-label="Agents">
                  <div className="coefficient-table-head" role="row">
                    <span role="columnheader">Agent</span>
                    <span role="columnheader">Paid</span>
                    <span role="columnheader">Free</span>
                    <span role="columnheader">To give</span>
                    <span role="columnheader">Redeemed</span>
                  </div>
                  {agents.map((agent) => (
                    <div className="coefficient-table-row" key={agent.userId} role="row">
                      <strong role="cell">
                        {agent.email ?? agent.displayName ?? agent.userId}
                        <small>
                          {agent.active ? "Active" : "Pending"} · {agent.contactName ?? "No name"}
                          {agent.whatsappNumber ? ` · WhatsApp ${agent.whatsappNumber}` : ""}
                        </small>
                      </strong>
                      <span role="cell">{agent.paidTickets}</span>
                      <span role="cell">{agent.commissionTickets}</span>
                      <span role="cell">{agent.availableCodes}</span>
                      <span role="cell">{agent.redeemedCodes}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="field-note">No agents loaded. Refresh, or add one by email above.</div>
              )}

              <div className="admin-referral-list" aria-label="Financial statement">
                <h3 className="section-heading">Financial statement</h3>
                <div className="financial-statement-summary" aria-label="Financial statement totals">
                  <div>
                    <span>Cash received</span>
                    <strong>{formatLedgerAmount(financialStatementSummary.cashGross)} USDT</strong>
                  </div>
                  <div>
                    <span>USDT received</span>
                    <strong>{formatLedgerAmount(financialStatementSummary.usdtGross)} USDT</strong>
                  </div>
                  <div>
                    <span>Paid tickets</span>
                    <strong>{financialStatementSummary.paidTickets.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Free tickets</span>
                    <strong>{financialStatementSummary.freeTickets.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Prize contribution</span>
                    <strong>{formatLedgerAmount(financialStatementSummary.prizeContribution)} USDT</strong>
                  </div>
                  <div>
                    <span>Fee contribution</span>
                    <strong>{formatLedgerAmount(financialStatementSummary.feeContribution)} USDT</strong>
                  </div>
                </div>
                <div className="field-note">
                  Money enters the statement only when Admin assigns tickets to users or agents. Agent-to-user
                  transfers do not change prize pool or fee pool because those tickets were already recorded.
                </div>
                {financialMovements.length > 0 ? (
                  financialMovements.map((movement) => {
                    const accounting = getMovementAccounting(movement);
                    const isMoneyMovement =
                      movement.movementType === "admin_to_agent" || movement.movementType === "admin_to_user";

                    return (
                      <div className="admin-referral-row" key={movement.id}>
                        <div>
                          <strong>
                            {getMovementLabel(movement.movementType)} - {movement.paymentMethod.toUpperCase()}
                          </strong>
                          {isMoneyMovement ? (
                            <>
                              <span>
                                Accounted tickets {accounting.accountedQuantity.toLocaleString()} - gross{" "}
                                {formatLedgerAmount(accounting.accountedGross)} USDT
                              </span>
                              <small>
                                Paid value {formatLedgerAmount(accounting.paidGross)} USDT - bonus value{" "}
                                {formatLedgerAmount(accounting.bonusGross)} USDT - bonuses{" "}
                                {accounting.bonusQuantity.toLocaleString()}
                              </small>
                              <small>
                                Prize pool +{formatLedgerAmount(accounting.prizeContribution)} USDT - fee pool +
                                {formatLedgerAmount(accounting.feeContribution)} USDT
                              </small>
                            </>
                          ) : (
                            <span>Moved {movement.quantity.toLocaleString()} generated tickets into admin inventory.</span>
                          )}
                          <small>{getMovementTicketSummary(movement.metadata)}</small>
                          {movement.note ? <small>Note: {movement.note}</small> : null}
                        </div>
                        <span>{new Date(movement.createdAt).toLocaleString()}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="field-note">No ticket financial movements loaded yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Referral report</h2>
                <p className="panel-subtitle">Accepted referral agreements for payout auditing.</p>
              </div>
              <button className="button secondary" disabled={isPending} onClick={loadReferralReport} type="button">
                Load Report
              </button>
            </div>
            <div className="admin-form">
              {referralRows.length > 0 ? (
                <div className="admin-referral-list">
                  {referralRows.map((row) => (
                    <div className="admin-referral-row" key={row.id}>
                      <div>
                        <strong>{row.invitedDisplayName}</strong>
                        <span>
                          Invited by {row.inviterDisplayName} · code {row.referralCode}
                        </span>
                      </div>
                      <div>
                        <strong>{row.feePercent}%</strong>
                        <span>
                          Rank {row.invitedLeaderboardRank ?? "-"} · {row.invitedTotalPoints} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="field-note">Load the report to see accepted referral agreements.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getOAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes("unsupported provider")) {
    return "Google login is not enabled in Supabase yet. Enable the Google provider in Supabase Auth before using the admin console.";
  }

  return message;
}

function scrollToAdminSection(id: string) {
  window.setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
}

const emptyPolicyDraft: OperatorPolicyDraft = {
  allowedCountries: "",
  blockedCountries: "",
  maxDepositClaimAmount: "",
  maxDailyDepositClaimAmount: "",
  maxWithdrawalRequestAmount: "",
  maxDailyWithdrawalRequestAmount: "",
  updatedAt: null,
  updatedBy: null,
  source: "",
};

const operatorPolicyPresets: OperatorPolicyPreset[] = [
  {
    label: "Caps only",
    description: "Adds conservative USDT guardrails while leaving country policy for legal review.",
    draft: {
      allowedCountries: "",
      blockedCountries: "",
      maxDepositClaimAmount: "100",
      maxDailyDepositClaimAmount: "250",
      maxWithdrawalRequestAmount: "100",
      maxDailyWithdrawalRequestAmount: "250",
    },
  },
  {
    label: "RO pilot draft",
    description: "Pilot paid actions for Romania with conservative USDT deposit and withdrawal caps.",
    draft: {
      allowedCountries: "RO",
      blockedCountries: "",
      maxDepositClaimAmount: "100",
      maxDailyDepositClaimAmount: "250",
      maxWithdrawalRequestAmount: "100",
      maxDailyWithdrawalRequestAmount: "250",
    },
  },
  {
    label: "RO + US pilot draft",
    description: "Pilot paid actions for Romania and the United States after operator/legal review.",
    draft: {
      allowedCountries: "RO, US",
      blockedCountries: "",
      maxDepositClaimAmount: "100",
      maxDailyDepositClaimAmount: "250",
      maxWithdrawalRequestAmount: "100",
      maxDailyWithdrawalRequestAmount: "250",
    },
  },
];

function toPolicyDraft(policy: any): OperatorPolicyDraft {
  return {
    allowedCountries: Array.isArray(policy?.allowedCountries) ? policy.allowedCountries.join(", ") : "",
    blockedCountries: Array.isArray(policy?.blockedCountries) ? policy.blockedCountries.join(", ") : "",
    maxDepositClaimAmount: policy?.maxDepositClaimAmount ?? "",
    maxDailyDepositClaimAmount: policy?.maxDailyDepositClaimAmount ?? "",
    maxWithdrawalRequestAmount: policy?.maxWithdrawalRequestAmount ?? "",
    maxDailyWithdrawalRequestAmount: policy?.maxDailyWithdrawalRequestAmount ?? "",
    updatedAt: policy?.updatedAt ?? null,
    updatedBy: policy?.updatedBy ?? null,
    source: policy?.source ?? "",
  };
}

function emptyToNull(value: string) {
  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

function formatLaunchEvidenceSnapshot(snapshot: LaunchEvidenceSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

function getLaunchEvidenceSnapshotFilename(snapshot: LaunchEvidenceSnapshot): string {
  const timestamp = snapshot.generatedAt.replace(/[^0-9a-z]/gi, "-").replace(/-+/g, "-");

  return `worldcup-launch-evidence-${timestamp}.json`;
}

function getOperatorPolicyDraftMissing(policy: OperatorPolicyDraft): string[] {
  const missing: string[] = [];

  if (!policy.allowedCountries.trim() && !policy.blockedCountries.trim()) {
    missing.push("country policy");
  }

  if (!policy.maxDepositClaimAmount.trim() && !policy.maxDailyDepositClaimAmount.trim()) {
    missing.push("deposit cap");
  }

  if (!policy.maxWithdrawalRequestAmount.trim() && !policy.maxDailyWithdrawalRequestAmount.trim()) {
    missing.push("withdrawal cap");
  }

  return missing;
}

function getOperatorPolicyDraftActionGates(policy: OperatorPolicyDraft) {
  const countryMissing = !policy.allowedCountries.trim() && !policy.blockedCountries.trim();
  const depositCapMissing = !policy.maxDepositClaimAmount.trim() && !policy.maxDailyDepositClaimAmount.trim();
  const withdrawalCapMissing =
    !policy.maxWithdrawalRequestAmount.trim() && !policy.maxDailyWithdrawalRequestAmount.trim();

  return [
    {
      label: "USDT deposits",
      ready: !countryMissing && !depositCapMissing,
      detail: formatPolicyGateDetail([
        countryMissing ? "country policy" : null,
        depositCapMissing ? "deposit cap" : null,
      ]),
    },
    {
      label: "Ticket purchases",
      ready: !countryMissing,
      detail: formatPolicyGateDetail([countryMissing ? "country policy" : null]),
    },
    {
      label: "Entry locking",
      ready: !countryMissing,
      detail: formatPolicyGateDetail([countryMissing ? "country policy" : null]),
    },
    {
      label: "Withdrawal requests",
      ready: !countryMissing && !withdrawalCapMissing,
      detail: formatPolicyGateDetail([
        countryMissing ? "country policy" : null,
        withdrawalCapMissing ? "withdrawal cap" : null,
      ]),
    },
  ];
}

function getOperatorPolicyLaunchChecklist(policy: OperatorPolicyDraft) {
  const hasCountryPolicy = Boolean(policy.allowedCountries.trim() || policy.blockedCountries.trim());
  const hasDepositCap = Boolean(
    policy.maxDepositClaimAmount.trim() || policy.maxDailyDepositClaimAmount.trim(),
  );
  const hasWithdrawalCap = Boolean(
    policy.maxWithdrawalRequestAmount.trim() || policy.maxDailyWithdrawalRequestAmount.trim(),
  );

  return [
    {
      label: "Country policy",
      ready: hasCountryPolicy,
      detail: hasCountryPolicy
        ? "Paid-action country policy is present in the draft."
        : "Add allowed or blocked ISO country codes before launch.",
    },
    {
      label: "Deposit cap",
      ready: hasDepositCap,
      detail: hasDepositCap
        ? "USDT deposit guardrail is present in the draft."
        : "Set a per-claim or rolling 24-hour deposit cap.",
    },
    {
      label: "Withdrawal cap",
      ready: hasWithdrawalCap,
      detail: hasWithdrawalCap
        ? "USDT withdrawal guardrail is present in the draft."
        : "Set a per-request or rolling 24-hour withdrawal cap.",
    },
  ];
}

function formatPolicyGateDetail(missing: Array<string | null>) {
  const openItems = missing.filter((item): item is string => Boolean(item));

  if (openItems.length === 0) {
    return "Operator policy gate will allow this action once saved.";
  }

  return `Paused until ${formatList(openItems)} ${openItems.length === 1 ? "is" : "are"} configured.`;
}

function formatList(items: string[]) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function getSuggestedLaunchSignoffEvidenceNote(
  signoff: LaunchSignoffRow,
  policy: OperatorPolicyDraft,
): string | null {
  if (isPaymentLaunchSignoffKey(signoff.key) && signoff.evidenceStatus) {
    return signoff.evidenceStatus;
  }

  if (signoff.key === "operator_policy_review") {
    return formatOperatorPolicyEvidenceNote(policy);
  }

  if (signoff.key === "legal_compliance_review") {
    return `Legal and compliance approval recorded for Terms/Privacy version ${CURRENT_TERMS_VERSION}; eligibility, privacy, and paid-action operating controls reviewed for production.`;
  }

  return null;
}

function formatOperatorPolicyEvidenceNote(policy: OperatorPolicyDraft): string {
  const countryPolicy = policy.allowedCountries.trim()
    ? `allowed countries ${policy.allowedCountries.trim()}`
    : policy.blockedCountries.trim()
      ? `blocked countries ${policy.blockedCountries.trim()}`
      : "country policy pending";
  const depositCap =
    policy.maxDepositClaimAmount.trim() ||
    policy.maxDailyDepositClaimAmount.trim() ||
    "deposit cap pending";
  const withdrawalCap =
    policy.maxWithdrawalRequestAmount.trim() ||
    policy.maxDailyWithdrawalRequestAmount.trim() ||
    "withdrawal cap pending";
  const reviewer = policy.updatedBy?.trim() || "operator";
  const updatedAt = policy.updatedAt ? new Date(policy.updatedAt).toLocaleString() : "pending save";

  return `Operator policy reviewed: ${countryPolicy}; deposit cap ${depositCap} USDT; withdrawal cap ${withdrawalCap} USDT; reviewer ${reviewer}; updated ${updatedAt}.`;
}

function readinessStatusLabel(status: ReadinessReport["overallStatus"]) {
  if (status === "pass") {
    return "Ready";
  }

  if (status === "warning") {
    return "Review";
  }

  return "Fix";
}

function getLaunchSignoffEvidenceNotePlaceholder(key: string) {
  if (key === "real_usdt_trc20_deposit_test") {
    return "TRC20 tx hash, claim id, credited amount, KuCoin verification time";
  }

  if (key === "real_usdt_erc20_deposit_test") {
    return "ERC20 tx hash, claim id, credited amount, KuCoin verification time";
  }

  if (key === "real_usdt_withdrawal_payout_test") {
    return "Payout tx hash, withdrawal id, amount, paid time";
  }

  if (key === "operator_policy_review") {
    return "Approved countries, blocked countries, deposit cap, withdrawal cap, reviewer";
  }

  if (key === "legal_compliance_review") {
    return `Reviewer, approval record, Terms/Privacy version ${CURRENT_TERMS_VERSION}`;
  }

  return "Required for completed or waived";
}

function NumberField({
  label,
  note,
  placeholder,
  step,
  value,
  onChange,
}: {
  label: string;
  note?: string;
  placeholder?: string;
  step?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode="decimal"
        min="0"
        placeholder={placeholder}
        step={step}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {note ? <div className="field-note">{note}</div> : null}
    </div>
  );
}
