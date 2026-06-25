"use client";

import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

import styles from "./account-entry-audit-client.module.css";

type AuditEntryStatus = "none" | "draft" | "committed" | "locked";
type AuditFilter = "problem" | "all" | AuditEntryStatus | "top50" | "outside";

type AuditAccount = {
  userId: string;
  displayName: string;
  email: string | null;
  referralCode: string | null;
  hasAuthAccount: boolean;
  hasReferralProfile: boolean;
  authCreatedAt: string | null;
  lastSignInAt: string | null;
  entryId: string | null;
  entryStatus: AuditEntryStatus;
  entryCreatedAt: string | null;
  committedAt: string | null;
  lockedAt: string | null;
  pickCount: number;
  teams: Array<{
    teamId: string;
    teamName: string;
    pickSlot: number;
  }>;
  leaderboardRank: number | null;
  homepageVisible: boolean;
  paidEntry: boolean;
  totalPoints: string | null;
  reason: string;
};

type AuditResponse = {
  generatedAt: string;
  homepageLeaderboardLimit: number;
  auditLeaderboardLimit: number;
  summary: {
    authUsers: number;
    authUsersCapped: boolean;
    referralProfiles: number;
    accounts: number;
    noEntry: number;
    draftOnly: number;
    committed: number;
    locked: number;
    pickedThree: number;
    incompletePicks: number;
    noPicks: number;
    publicLeaderboardRows: number;
    homepageVisible: number;
    finalizedOutsideHomepage: number;
  };
  accounts: AuditAccount[];
};

const filters: Array<{ id: AuditFilter; label: string }> = [
  { id: "problem", label: "Needs attention" },
  { id: "all", label: "All accounts" },
  { id: "none", label: "No entry" },
  { id: "draft", label: "Draft" },
  { id: "committed", label: "Committed" },
  { id: "locked", label: "Locked" },
  { id: "top50", label: "Top 50" },
  { id: "outside", label: "Outside home" },
];

export function AccountEntryAuditClient() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [filter, setFilter] = useState<AuditFilter>("problem");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const loadAudit = useCallback(async () => {
    if (!session) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/account-entry-audit", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const payload = (await response.json()) as AuditResponse | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Could not load account audit.");
      }

      setAudit(payload as AuditResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load account audit.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAudit();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAudit]);

  const visibleAccounts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return (audit?.accounts ?? []).filter((account) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "problem" && isProblemAccount(account)) ||
        (filter === "top50" && account.homepageVisible) ||
        (filter === "outside" &&
          account.pickCount === 3 &&
          (account.entryStatus === "committed" || account.entryStatus === "locked") &&
          !account.homepageVisible) ||
        account.entryStatus === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        account.displayName,
        account.email,
        account.referralCode,
        account.userId,
        account.teams.map((team) => team.teamName).join(" "),
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [audit?.accounts, filter, query]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/account-entry-audit`,
      },
    });
  };

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Admin audit</p>
          <h1>Account leaderboard check</h1>
          <p>
            See every signed-in account, profile, entry status, picked teams, and the
            exact reason it is missing from the home leaderboard.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href="/admin">
            Admin console
          </Link>
          <button
            className={styles.primaryButton}
            disabled={!session || loading}
            onClick={() => void loadAudit()}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={18} />
            Refresh
          </button>
        </div>
      </header>

      {!session ? (
        <section className={styles.panel}>
          <ShieldCheck aria-hidden="true" size={34} />
          <h2>Admin sign-in required</h2>
          <p>Sign in with the admin Google account to load the protected audit.</p>
          <button className={styles.primaryButton} onClick={signInWithGoogle} type="button">
            Sign in with Google
          </button>
        </section>
      ) : null}

      {error ? (
        <section className={styles.notice} role="alert">
          <AlertTriangle aria-hidden="true" size={20} />
          {error}
        </section>
      ) : null}

      {audit ? (
        <>
          <section className={styles.metricsGrid} aria-label="Account audit summary">
            <Metric icon={<Users aria-hidden="true" />} label="Auth accounts" value={audit.summary.authUsers} />
            <Metric label="Referral profiles" value={audit.summary.referralProfiles} />
            <Metric label="No entry" tone="warning" value={audit.summary.noEntry} />
            <Metric label="Draft only" tone="warning" value={audit.summary.draftOnly} />
            <Metric icon={<Trophy aria-hidden="true" />} label="Home top 50" value={audit.summary.homepageVisible} />
            <Metric
              label="Finalized outside home"
              tone="warning"
              value={audit.summary.finalizedOutsideHomepage}
            />
          </section>

          <section className={styles.toolbar} aria-label="Audit filters">
            <div className={styles.filters}>
              {filters.map((item) => (
                <button
                  className={item.id === filter ? styles.activeFilter : styles.filterButton}
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className={styles.searchLabel}>
              <span>Search accounts</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, email, referral, team"
                type="search"
                value={query}
              />
            </label>
          </section>

          <section className={styles.contextPanel}>
            <CheckCircle2 aria-hidden="true" size={20} />
            <p>
              Home page leaderboard loads the first {audit.homepageLeaderboardLimit} public
              leaderboard rows. This audit checks up to {audit.auditLeaderboardLimit} finalized
              entries and flags accounts that need action.
            </p>
          </section>

          {audit.summary.authUsersCapped ? (
            <section className={styles.notice} role="status">
              <AlertTriangle aria-hidden="true" size={20} />
              Auth user list reached the audit cap. Narrow the investigation if the project grows
              beyond this page.
            </section>
          ) : null}

          <section className={styles.resultsHeader}>
            <div>
              <p className={styles.eyebrow}>Showing</p>
              <h2>{visibleAccounts.length} accounts</h2>
            </div>
            <p>Updated {formatDateTime(audit.generatedAt)}</p>
          </section>

          <section className={styles.accountList}>
            {visibleAccounts.map((account) => (
              <article className={styles.accountRow} key={account.userId}>
                <div className={styles.accountMain}>
                  <div className={styles.accountTitle}>
                    <strong>{account.displayName}</strong>
                    <StatusBadge status={account.entryStatus} />
                    {!account.hasReferralProfile ? <span className={styles.warningBadge}>No profile</span> : null}
                  </div>
                  <p>{account.email ?? account.referralCode ?? shortId(account.userId)}</p>
                  <div className={styles.teamList}>
                    {account.teams.length > 0
                      ? account.teams.map((team) => (
                          <span key={`${account.entryId}-${team.teamId}`}>
                            {team.pickSlot}. {team.teamName}
                          </span>
                        ))
                      : <span>No teams picked</span>}
                  </div>
                  <small>{account.reason}</small>
                </div>

                <div className={styles.rankBox}>
                  <strong>{account.leaderboardRank ? `#${account.leaderboardRank}` : "-"}</strong>
                  <span>{account.totalPoints ? `${account.totalPoints} pts` : "No score"}</span>
                  <span>{account.homepageVisible ? "Home visible" : "Not on home"}</span>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : session ? (
        <section className={styles.panel}>
          <RefreshCw aria-hidden="true" className={loading ? styles.spin : undefined} size={34} />
          <h2>{loading ? "Loading account audit" : "No audit loaded"}</h2>
          <p>Use refresh to check the current production database state.</p>
        </section>
      ) : null}
    </main>
  );
}

function Metric({
  icon,
  label,
  tone = "neutral",
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  tone?: "neutral" | "warning";
  value: number;
}) {
  return (
    <div className={tone === "warning" ? styles.warningMetric : styles.metric}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {icon ? <div className={styles.metricIcon}>{icon}</div> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: AuditEntryStatus }) {
  const label = status === "none" ? "No entry" : status;

  return <span className={`${styles.statusBadge} ${styles[`status-${status}`]}`}>{label}</span>;
}

function isProblemAccount(account: AuditAccount) {
  if (account.entryStatus === "none" || account.entryStatus === "draft") {
    return true;
  }

  if (account.pickCount !== 3) {
    return true;
  }

  return !account.homepageVisible;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortId(value: string) {
  return `${value.slice(0, 8)}...`;
}
