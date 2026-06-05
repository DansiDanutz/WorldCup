export const RESPONSIBLE_PLAY_MAX_ENTRY_LIMIT = 10;
export const RESPONSIBLE_PLAY_SEASON_END_ISO = "2026-07-20T00:00:00.000Z";
export const SELF_EXCLUSION_OPTIONS = ["24h", "7d", "30d", "season"] as const;

export type SelfExclusionOption = (typeof SELF_EXCLUSION_OPTIONS)[number];
export type ResponsiblePlayAction = "deposit" | "ticket" | "entry" | "withdrawal";

export type ResponsiblePlaySettingsRow = {
  max_entries: number | null;
  self_excluded_until: string | null;
  self_exclusion_reason: string | null;
  updated_at: string | null;
};

export type ResponsiblePlayStatus = {
  maxEntries: number | null;
  selfExcludedUntil: string | null;
  selfExclusionReason: string | null;
  selfExcluded: boolean;
  ticketsReserved: number | null;
  entriesUsed: number | null;
  updatedAt: string | null;
};

type SupabaseLike = {
  from: (table: string) => any;
};

type LoadOptions = {
  tournamentId?: string;
  now?: Date;
};

export function getSelfExclusionUntil(option: SelfExclusionOption, now = new Date()): string {
  const start = now.getTime();

  if (option === "24h") {
    return new Date(start + 24 * 60 * 60 * 1000).toISOString();
  }

  if (option === "7d") {
    return new Date(start + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  if (option === "30d") {
    return new Date(start + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  return RESPONSIBLE_PLAY_SEASON_END_ISO;
}

export function keepLongestSelfExclusion(
  currentUntil: string | null | undefined,
  requestedUntil: string,
): string {
  if (!currentUntil) {
    return requestedUntil;
  }

  const currentTime = Date.parse(currentUntil);
  const requestedTime = Date.parse(requestedUntil);

  if (!Number.isFinite(currentTime) || requestedTime > currentTime) {
    return requestedUntil;
  }

  return currentUntil;
}

export function isSelfExcluded(until: string | null | undefined, now = new Date()) {
  if (!until) {
    return false;
  }

  const untilTime = Date.parse(until);
  return Number.isFinite(untilTime) && untilTime > now.getTime();
}

export function formatResponsiblePlayStatus(
  row: ResponsiblePlaySettingsRow | null | undefined,
  options: {
    ticketsReserved?: number | null;
    entriesUsed?: number | null;
    now?: Date;
  } = {},
): ResponsiblePlayStatus {
  return {
    maxEntries: normalizeMaxEntries(row?.max_entries),
    selfExcludedUntil: row?.self_excluded_until ?? null,
    selfExclusionReason: row?.self_exclusion_reason ?? null,
    selfExcluded: isSelfExcluded(row?.self_excluded_until, options.now),
    ticketsReserved: options.ticketsReserved ?? null,
    entriesUsed: options.entriesUsed ?? null,
    updatedAt: row?.updated_at ?? null,
  };
}

export function getResponsiblePlayRestriction(
  status: ResponsiblePlayStatus,
  action: ResponsiblePlayAction,
  options: { requestedTickets?: number } = {},
): string | null {
  if (action === "withdrawal") {
    return null;
  }

  if (status.selfExcluded) {
    return status.selfExcludedUntil
      ? `Account ticket actions are paused until ${new Date(
          status.selfExcludedUntil,
        ).toLocaleString()}. Deposits, ticket transfers, and entries are paused.`
      : "Account ticket actions are paused. Deposits, ticket transfers, and entries are paused.";
  }

  if (status.maxEntries === null || action === "deposit") {
    return null;
  }

  if (action === "ticket") {
    const requestedTickets = options.requestedTickets ?? 1;
    const ticketsReserved = status.ticketsReserved ?? 0;

    if (ticketsReserved + requestedTickets > status.maxEntries) {
      return `Your account entry-ticket limit is ${status.maxEntries}. Lower the ticket quantity or ask Admin to update the account limit.`;
    }
  }

  if (action === "entry" && (status.entriesUsed ?? 0) >= status.maxEntries) {
    return `Your account entry limit is ${status.maxEntries}.`;
  }

  return null;
}

export async function loadResponsiblePlayStatus(
  supabase: SupabaseLike,
  userId: string,
  options: LoadOptions = {},
): Promise<{ status: ResponsiblePlayStatus } | { error: string }> {
  const settings = await supabase
    .from("worldcup_responsible_play_settings")
    .select("max_entries,self_excluded_until,self_exclusion_reason,updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (settings.error) {
    return { error: "Could not verify account ticket limits." };
  }

  let ticketsReserved: number | null = null;
  let entriesUsed: number | null = null;

  if (options.tournamentId) {
    const [tickets, entries] = await Promise.all([
      supabase
        .from("worldcup_tickets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("tournament_id", options.tournamentId),
      supabase
        .from("worldcup_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("tournament_id", options.tournamentId),
    ]);

    if (tickets.error || entries.error) {
      return { error: "Could not verify account ticket limits." };
    }

    ticketsReserved = tickets.count ?? 0;
    entriesUsed = entries.count ?? 0;
  }

  return {
    status: formatResponsiblePlayStatus(settings.data as ResponsiblePlaySettingsRow | null, {
      ticketsReserved,
      entriesUsed,
      now: options.now,
    }),
  };
}

function normalizeMaxEntries(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  if (value < 0 || value > RESPONSIBLE_PLAY_MAX_ENTRY_LIMIT) {
    return null;
  }

  return value;
}
