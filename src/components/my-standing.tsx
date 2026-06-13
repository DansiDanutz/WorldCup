"use client";

import { ArrowRight, ClipboardCopy, Crown, Gift, LogOut, Trophy, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { formatMoneyAmount } from "@/lib/economy";
import { formatPoints } from "@/lib/scoring";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type AgentCodeRecord = { code: string; kind: string; assignedAt: string };

type Standing = {
  signedIn: boolean;
  me:
    | { hasEntry: false }
    | {
        hasEntry: true;
        locked: boolean;
        committed: boolean;
        picksLocked: boolean;
        displayName: string;
        totalPoints: number;
        rank: number | null;
        teams: Array<{ name: string; points: number }>;
        inPaidPlaces: boolean;
        share: number | null;
      };
  tournament: { participants: number; paidPlaces: number; netPrizePool: number };
  referrals: Array<{
    displayName: string;
    totalPoints: number;
    rank: number | null;
    locked: boolean;
    inPaidPlaces: boolean;
    share: number | null;
    feePercent: number;
    myCut: number | null;
  }>;
  referralCutTotal: number;
  leaderboardTop: Array<{
    displayName: string;
    totalPoints: number;
    rank: number;
    isPaid?: boolean;
    teams: Array<{ name: string; points: number }>;
  }>;
  agent: {
    isAgent: boolean;
    paidTickets: number;
    commissionTickets: number;
    availableCodes: number;
    nextAvailableCode: { code: string; kind: string } | null;
    lastAssignedCode: AgentCodeRecord | null;
    lastPaidCode: AgentCodeRecord | null;
    lastCommissionCode: AgentCodeRecord | null;
    toNextFree: number;
  } | null;
};

async function fetchStanding(token: string): Promise<Standing | null> {
  const response = await fetch("/api/me/standing", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.ok ? ((await response.json()) as Standing) : null;
}

function formatAgentRecordDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function AgentRecordTime({
  label,
  record,
}: {
  label: string;
  record: AgentCodeRecord | null;
}) {
  return record?.assignedAt ? (
    <time className="agent-stat-date" dateTime={record.assignedAt} title={`${label}: ${record.code}`}>
      {label} {formatAgentRecordDate(record.assignedAt)}
    </time>
  ) : (
    <span className="agent-stat-date agent-stat-date--empty">{label} not recorded yet</span>
  );
}

export function MyStanding() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<Standing | null>(null);
  const [agentCodeMessage, setAgentCodeMessage] = useState<string | null>(null);
  // Agents land here to sell codes, so surface the next sellable code by
  // default instead of hiding it behind the gift toggle.
  const [agentCodeOpen, setAgentCodeOpen] = useState(true);
  const [referralsOpen, setReferralsOpen] = useState(false);
  const [standingModalOpen, setStandingModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: sessionData }) => setSession(sessionData.session))
      .catch(() => setSession(null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const signedIn = session?.user.app_metadata.provider === "google";

  useEffect(() => {
    const token = session?.access_token;
    let cancelled = false;

    const refreshStanding = async () => {
      if (!token || !signedIn) {
        if (!cancelled) setData(null);
        return;
      }
      try {
        const result = await fetchStanding(token);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData(null);
      }
    };

    void refreshStanding();
    window.addEventListener("worldcup-account-updated", refreshStanding);

    return () => {
      cancelled = true;
      window.removeEventListener("worldcup-account-updated", refreshStanding);
    };
  }, [session?.access_token, signedIn]);

  const hasAgentStanding = Boolean(data?.agent);
  const referralCount = data?.referrals.length ?? 0;

  useEffect(() => {
    const token = session?.access_token;
    if (!token || !signedIn || !hasAgentStanding) {
      return;
    }

    let active = true;
    const refreshStanding = async () => {
      try {
        const result = await fetchStanding(token);
        if (active) setData(result);
      } catch {
        // Keep the currently visible code if a background refresh fails.
      }
    };
    const refreshOnVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshStanding();
      }
    };

    const intervalId = window.setInterval(refreshStanding, 15_000);
    window.addEventListener("focus", refreshStanding);
    document.addEventListener("visibilitychange", refreshOnVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshStanding);
      document.removeEventListener("visibilitychange", refreshOnVisible);
    };
  }, [hasAgentStanding, session?.access_token, signedIn]);

  async function copyAgentCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setAgentCodeMessage("Code copied.");
    } catch {
      setAgentCodeMessage("Copy failed. Select the code manually.");
    }
    window.setTimeout(() => setAgentCodeMessage(null), 1800);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setData(null);
    setAgentCodeMessage(null);
    setAgentCodeOpen(false);
    setReferralsOpen(false);
    setStandingModalOpen(false);
  }

  if (!signedIn) {
    return null;
  }

  const me = data?.me;
  const hasReferrals = referralCount > 0;
  const referralsListOpen = referralsOpen && hasReferrals;
  const modalMe = me && me.hasEntry ? me : null;
  const leaderboardTop = data?.leaderboardTop ?? [];

  return (
    <section
      className={`my-standing${data?.agent ? " my-standing--agent" : ""}`}
      id="me"
      aria-label="My account"
    >
      <div className="standing-grid">
        <div className="panel standing-main standing-card standing-card--rank">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">My standing</h2>
              <p className="panel-subtitle">
                {me && me.hasEntry ? me.displayName : "Your team, points and rank"}
              </p>
            </div>
            <div className="panel-header-actions standing-card-actions">
              <button
                aria-controls="standing-leaderboard-modal"
                aria-expanded={standingModalOpen}
                aria-label="Open standing leaderboard popup"
                className={`standing-trophy-trigger${standingModalOpen ? " is-open" : ""}`}
                disabled={!data}
                onClick={() => setStandingModalOpen(true)}
                type="button"
              >
                <Trophy size={20} aria-hidden="true" />
              </button>
              <button className="button secondary standing-signout" onClick={signOut} type="button">
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
          <div className="panel-body">
            {!data ? (
              <div className="field-note">Loading your standing…</div>
            ) : me && me.hasEntry ? (
              <>
                <div className="standing-rank">
                  <div className="standing-rank__big">
                    <span>{me.locked ? "Rank" : "Preview rank"}</span>
                    <strong>{me.rank ? `#${me.rank}` : "TBA"}</strong>
                    <small>
                      {me.locked
                        ? me.rank
                          ? `of ${data.tournament.participants}`
                          : "ranking pending"
                        : me.rank
                          ? me.committed
                            ? "if you were paying"
                            : "if locked now"
                          : "preview pending"}
                    </small>
                  </div>
                  <div className="standing-rank__big">
                    <span>Points</span>
                    <strong>{formatPoints(me.totalPoints)}</strong>
                    <small>{me.locked ? "total" : "private preview"}</small>
                  </div>
                </div>

                {me.teams.length > 0 ? (
                  <div className="standing-teams">
                    {me.teams.map((team) => (
                      <div className="standing-team" key={team.name}>
                        <span>{team.name}</span>
                        <strong>{formatPoints(team.points)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="field-note">Your entry is locked. Team points appear after leaderboard data updates.</p>
                )}

                {me.inPaidPlaces && me.share != null ? (
                  <div className="standing-share">
                    <Crown size={20} aria-hidden="true" />
                    <div>
                      <span>
                        {me.locked
                          ? "In the money — projected share"
                          : me.committed
                            ? "If you were paying — projected share"
                            : "If locked — projected share"}
                      </span>
                      <strong>{formatMoneyAmount(me.share)} USDT</strong>
                    </div>
                  </div>
                ) : (
                  <p className="field-note">
                    {me.committed
                      ? "Your 3 teams are locked. You're playing for fun — buy a ticket to enter the prize pool. This preview shows where you'd place if you were paying."
                      : !me.locked
                      ? "Free preview only. Your points are live here; lock your teams, then add a ticket to enter the paid prize pool."
                      : me.rank
                      ? `Top ${data.tournament.paidPlaces} share the prize pool. Keep climbing to break in.`
                      : "Leaderboard ranking appears after the first points refresh."}
                  </p>
                )}
              </>
            ) : (
              <div className="standing-empty">
                <p>
                  {me && me.hasEntry
                    ? "Your entry is still a draft — lock it to join the leaderboard."
                    : "You haven't joined yet. Pick 3 teams for a free points preview."}
                </p>
                <a className="button" href="#pick">
                  {me && me.hasEntry ? "Lock my entry" : "Pick 3 teams"}
                  <ArrowRight size={16} />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="panel standing-card standing-card--referrals">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">My referrals</h2>
              <p className="panel-subtitle">
                {data && data.referrals.length > 0
                  ? `${data.referrals.length} invited · your cut so far ${formatMoneyAmount(data.referralCutTotal)}`
                  : "Earn a cut of everyone you invite"}
              </p>
            </div>
            <button
              aria-controls="standing-referrals-list"
              aria-expanded={referralsListOpen}
              aria-label={hasReferrals ? "Show referral leaderboard list" : "No referrals yet"}
              className={`referrals-trigger${hasReferrals ? " has-referrals" : ""}${
                referralsListOpen ? " is-open" : ""
              }`}
              disabled={!hasReferrals}
              onClick={() => setReferralsOpen((current) => !current)}
              type="button"
            >
              <Users size={20} aria-hidden="true" />
              {hasReferrals ? <span className="referrals-trigger__count">{referralCount}</span> : null}
            </button>
          </div>
          <div className="panel-body">
            {!data ? (
              <div className="field-note">Loading…</div>
            ) : data.referrals.length === 0 ? (
              <div className="standing-empty">
                <p>Invite friends — earn 5% of their winnings.</p>
                <a className="button secondary" href="#invite">
                  Invite a friend
                  <ArrowRight size={16} />
                </a>
              </div>
            ) : referralsListOpen ? (
              <div
                className="referrals-list-panel referrals-list-panel--revealed"
                id="standing-referrals-list"
                aria-label="Referral leaderboard positions"
              >
                <div className="referrals-list-head" aria-hidden="true">
                  <span>Player</span>
                  <span>Rank</span>
                  <span>Points</span>
                  <span>Your cut</span>
                </div>
                <div className="referral-position-list">
                  {data.referrals.map((referral, index) => (
                    <div className="referral-position-row" key={`${referral.displayName}-${index}`}>
                      <div className="referral-player">
                        <strong>{referral.displayName}</strong>
                        <small>{referral.locked ? "Locked entry" : "Waiting for locked entry"}</small>
                      </div>
                      <div className="referral-stat-cell">
                        <span>Rank</span>
                        <strong>{referral.rank ? `#${referral.rank}` : "TBA"}</strong>
                      </div>
                      <div className="referral-stat-cell">
                        <span>Points</span>
                        <strong>{formatPoints(referral.totalPoints)}</strong>
                      </div>
                      <div className="referral-stat-cell referral-stat-cell--cut">
                        <span>{referral.feePercent}% cut</span>
                        <strong>
                          {referral.inPaidPlaces && referral.myCut != null
                            ? formatMoneyAmount(referral.myCut)
                            : "—"}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="referrals-summary-strip" aria-label="Referral summary">
                <div>
                  <span>Invited</span>
                  <strong>{data.referrals.length}</strong>
                </div>
                <div>
                  <span>Projected cut</span>
                  <strong>{formatMoneyAmount(data.referralCutTotal)}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {data?.agent ? (
        <div className="panel standing-agent standing-card standing-card--agent">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Agent — tickets &amp; commission</h2>
              <p className="panel-subtitle">Codes you can sell and the free tickets you&#39;ve earned.</p>
            </div>
            <button
              aria-controls="standing-agent-code"
              aria-expanded={agentCodeOpen}
              aria-label={agentCodeOpen ? "Hide next agent code" : "Show next agent code"}
              className={`agent-gift-trigger${agentCodeOpen ? " is-open" : ""}`}
              onClick={() => setAgentCodeOpen((current) => !current)}
              type="button"
            >
              <Gift size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="panel-body">
            {agentCodeOpen ? (
              <div
                className="standing-agent-code standing-agent-code--revealed"
                id="standing-agent-code"
                aria-label="Next available agent ticket code"
              >
                <div className="standing-agent-code__copy">
                  <span>Next code to sell</span>
                  <strong>{data.agent.nextAvailableCode?.code ?? "No code available"}</strong>
                  <small>{data.agent.nextAvailableCode?.kind ?? "empty"}</small>
                </div>
                <div className="standing-agent-code__actions">
                  <button
                    className="button"
                    disabled={!data.agent.nextAvailableCode}
                    onClick={() =>
                      data.agent?.nextAvailableCode &&
                      copyAgentCode(data.agent.nextAvailableCode.code)
                    }
                    type="button"
                  >
                    <ClipboardCopy size={16} />
                    Copy code
                  </button>
                </div>
                {agentCodeMessage ? <p role="status">{agentCodeMessage}</p> : null}
              </div>
            ) : null}
            <div className="account-status-grid">
              <div>
                <span>Codes to sell</span>
                <strong>{data.agent.availableCodes}</strong>
                <small>available now</small>
                <AgentRecordTime label="Last assigned" record={data.agent.lastAssignedCode} />
              </div>
              <div>
                <span>Paid tickets</span>
                <strong>{data.agent.paidTickets}</strong>
                <small>lifetime</small>
                <AgentRecordTime label="Last bought" record={data.agent.lastPaidCode} />
              </div>
              <div>
                <span>Free tickets won</span>
                <strong>{data.agent.commissionTickets}</strong>
                <small>commission</small>
                <AgentRecordTime label="Last bonus" record={data.agent.lastCommissionCode} />
              </div>
            </div>
            <div
              className="commission-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={10 - data.agent.toNextFree}
            >
              <span style={{ width: `${((10 - data.agent.toNextFree) / 10) * 100}%` }} />
            </div>
            <p className="field-note">
              Sell <b>{data.agent.toNextFree}</b> more {data.agent.toNextFree === 1 ? "ticket" : "tickets"} to
              earn your next free one.
            </p>
          </div>
        </div>
      ) : null}

      {standingModalOpen && data ? (
        <div
          className="standing-modal-backdrop"
          onClick={() => setStandingModalOpen(false)}
          role="presentation"
        >
          <div
            className="standing-modal standing-modal--revealed"
            id="standing-leaderboard-modal"
            aria-label="Standing leaderboard"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="standing-modal__header">
              <div>
                <h2>Standing leaderboard</h2>
                <p>Top 10, your current position, and referral positions.</p>
              </div>
              <button
                aria-label="Close standing leaderboard"
                className="standing-modal__close"
                onClick={() => setStandingModalOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="standing-modal__body">
              <section className="standing-modal-current" aria-label="Your current leaderboard position">
                <span>{modalMe?.locked ? "Your position" : "Your free preview"}</span>
                {modalMe ? (
                  <>
                    <div>
                      <strong>{modalMe.displayName}</strong>
                      <b>{modalMe.rank ? `#${modalMe.rank}` : "TBA"}</b>
                    </div>
                    <small>
                      {formatPoints(modalMe.totalPoints)} points
                      {modalMe.locked
                        ? ""
                        : modalMe.committed
                          ? " · if you were paying"
                          : " · if locked now"}
                      {modalMe.teams.length > 0
                        ? ` · ${modalMe.teams.map((team) => team.name).join(", ")}`
                        : ""}
                    </small>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>No locked entry yet</strong>
                      <b>TBA</b>
                    </div>
                    <small>Pick 3 teams free to see points and a preview rank.</small>
                  </>
                )}
              </section>

              <section className="standing-modal-section" aria-label="Top 10 community leaderboard">
                <div className="standing-modal-section__title">
                  <strong>Top 10 · Free Play community</strong>
                  <span>{leaderboardTop.length} shown</span>
                </div>
                {leaderboardTop.length > 0 ? (
                  <div className="standing-modal-list">
                    {leaderboardTop.map((row) => (
                      <div
                        className={`standing-modal-row${
                          modalMe?.rank === row.rank ? " standing-modal-row--me" : ""
                        }`}
                        key={`${row.rank}-${row.displayName}`}
                      >
                        <span className="standing-modal-rank">#{row.rank}</span>
                        <div>
                          <strong>
                            {row.displayName}
                            <span className={`board-tag${row.isPaid ? " board-tag--paid" : ""}`}>
                              {row.isPaid ? "PRIZE POOL" : "FREE"}
                            </span>
                          </strong>
                          <small>{row.teams.map((team) => team.name).join(" · ") || "Teams pending"}</small>
                        </div>
                        <b>{formatPoints(row.totalPoints)}</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="standing-modal-empty">
                    Be the first — pick 3 teams free and your points appear here live.
                  </p>
                )}
              </section>

              <section className="standing-modal-section" aria-label="Referral leaderboard positions">
                <div className="standing-modal-section__title">
                  <strong>Referral positions</strong>
                  <span>{data.referrals.length} invited</span>
                </div>
                {data.referrals.length > 0 ? (
                  <div className="standing-modal-list">
                    {data.referrals.map((referral, index) => (
                      <div className="standing-modal-row" key={`${referral.displayName}-${index}`}>
                        <span className="standing-modal-rank">{referral.rank ? `#${referral.rank}` : "TBA"}</span>
                        <div>
                          <strong>{referral.displayName}</strong>
                          <small>{referral.locked ? "Locked entry" : "Waiting for locked entry"}</small>
                        </div>
                        <b>{formatPoints(referral.totalPoints)}</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="standing-modal-empty">No referral leaderboard positions yet.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
