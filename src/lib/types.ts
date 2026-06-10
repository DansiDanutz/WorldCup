export type WorldCupTeam = {
  id: string;
  name: string;
  confederation: string;
  group_code: string | null;
  winner_odds: string | null;
  reward_coefficient: string;
};

export type WorldCupTournament = {
  id: string;
  slug: string;
  name: string;
  season_year: number;
  status: "setup" | "open" | "locked" | "in_progress" | "completed";
  prize_pool_amount: string;
  prize_pool_fee_percent: string;
  fee_pool_amount?: string;
  ticket_price_amount: string;
};

export type WorldCupStage = {
  id: string;
  name: string;
  sort_order: number;
  stage_coefficient: string;
};

export type WorldCupMatch = {
  id: string;
  match_number: number;
  stage_id: string;
  group_code: string | null;
  match_date: string;
  local_kickoff_time: string;
  kickoff_at: string;
  result_check_after: string;
  venue: string;
  city: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_slot: string;
  away_slot: string;
  status: "scheduled" | "completed";
  finish_method: "90" | "extra_time" | "penalties" | null;
  home_goals_90: number | null;
  away_goals_90: number | null;
  home_goals_total: number | null;
  away_goals_total: number | null;
  home_penalties: number | null;
  away_penalties: number | null;
  winner_team_id: string | null;
  points_applied_at: string | null;
};

export type LeaderboardRow = {
  entry_id: string;
  tournament_id: string;
  display_name: string;
  total_points: string;
  teams:
    | Array<{
        team_id: string;
        team_name: string;
        team_coefficient: string;
        total_points?: string;
      }>
    | null;
  leaderboard_rank: number;
};

export type DueMatch = {
  id: string;
  tournament_id: string;
  match_number: number;
  stage_id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_slot: string;
  away_slot: string;
  kickoff_at: string;
  result_check_after: string;
  result_checked_at: string | null;
  status: "scheduled" | "completed";
  points_applied_at: string | null;
};

export type MatchTeamPoints = {
  match_id: string;
  tournament_id: string;
  match_number: number;
  stage_id: string;
  team_id: string;
  team_name: string;
  team_coefficient: string;
  stage_coefficient: string;
  result_base_points: string;
  goal_bonus_points: string;
  clean_sheet_bonus_points: string;
  base_points: string;
  final_points: string;
};

export type EntryPayload = {
  action?: "save-draft" | "lock";
  displayName: string;
  teamIds: string[];
  referralCode?: string;
  referralTermsAccepted?: boolean;
};

export type AdminAccountRow = {
  userId: string;
  displayName: string;
  email: string | null;
  referralCode: string;
  accountRole: "agent" | "user";
  usdtSenderWalletAddress: string | null;
  usdtSenderWalletNetwork: string | null;
  usdtSenderWalletUpdatedAt: string | null;
  usdtSenderWalletTrc20Address: string | null;
  usdtSenderWalletTrc20UpdatedAt: string | null;
  usdtSenderWalletErc20Address: string | null;
  usdtSenderWalletErc20UpdatedAt: string | null;
  walletBalance: string;
  ticketsAssigned: number;
  ticketsAvailable: number;
};

export type AdminMetrics = {
  generatedAt: string;
  accountsTotal: number;
  freeAccounts: number;
  paidAccounts: number;
  lockedPaidEntries: number;
  draftEntries: number;
  ticketsAssigned: number;
  ticketsAvailable: number;
  appViews: {
    total: number;
    today: number;
    last24Hours: number;
    lastViewedAt: string | null;
    topSources: Array<{
      source: string;
      medium: string | null;
      campaign: string | null;
      content: string | null;
      count: number;
      lastViewedAt: string | null;
    }>;
    trackingReady: boolean;
  };
};

export type AdminDepositClaimRow = {
  id: string;
  userId: string;
  userEmail: string | null;
  displayName: string;
  network: string;
  address: string;
  senderWalletAddress: string | null;
  amount: string;
  currency: string;
  txHash: string;
  status: string;
  accountRole: "agent" | "user";
  adminNote: string | null;
  createdAt: string;
  creditedAt: string | null;
  creditedBy: string | null;
  worldcupDepositId: string | null;
};

export type WithdrawalRequestRow = {
  id: string;
  network: string;
  address: string;
  amount: string;
  currency: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  paidAt: string | null;
  externalTxHash: string | null;
};

export type AdminWithdrawalRequestRow = WithdrawalRequestRow & {
  userId: string;
  userEmail: string | null;
  displayName: string;
  reviewedBy: string | null;
  paidBy: string | null;
  walletTransactionId: string | null;
  payoutEvidenceReady: boolean;
};

export type WalletAgeVerification = {
  status: "unverified" | "pending" | "verified" | "rejected";
  note: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  contact: string;
};

export type AdminAgeVerificationRow = {
  userId: string;
  email: string | null;
  displayName: string;
  status: "unverified" | "pending" | "verified" | "rejected";
  note: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
};

export type PaidActionGate = {
  allowed: boolean;
  missing: string[];
  message: string | null;
};

export type PaidActionGates = {
  deposit: PaidActionGate;
  ticket: PaidActionGate;
  entry: PaidActionGate;
  withdrawal: PaidActionGate;
};

export type MyAccountStatus = {
  walletBalance: string;
  ticketsAssigned: number;
  ticketsAvailable: number;
  ticketPriceAmount: string;
  entry?: {
    id: string;
    status: "draft" | "committed" | "locked";
    displayName: string;
    teamIds: string[];
    lockedAt: string | null;
    committedAt?: string | null;
  } | null;
  entryPreview?: {
    totalPoints: number;
    rank: number | null;
    paidPlaces: number;
    projectedShare: number | null;
  } | null;
  usdtSenderWalletAddress?: string | null;
  usdtSenderWalletNetwork?: string | null;
  usdtSenderWalletUpdatedAt?: string | null;
  usdtSenderWalletTrc20Address?: string | null;
  usdtSenderWalletTrc20UpdatedAt?: string | null;
  usdtSenderWalletErc20Address?: string | null;
  usdtSenderWalletErc20UpdatedAt?: string | null;
  paidActionGates?: PaidActionGates;
};

export type AdminReferralReportRow = {
  id: string;
  referralCode: string;
  inviterDisplayName: string;
  inviterReferralCode: string;
  invitedDisplayName: string;
  acceptedAt: string;
  feePercent: string;
  invitedTotalPoints: string;
  invitedLeaderboardRank: number | null;
};

export type ResultPayload = {
  adminSecret: string;
  matchId: string;
  finishMethod: "90" | "extra_time" | "penalties";
  homeGoals90: number;
  awayGoals90: number;
  homeGoalsTotal: number;
  awayGoalsTotal: number;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  winnerTeamId?: string | null;
};
