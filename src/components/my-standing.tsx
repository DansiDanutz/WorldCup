"use client";

import { ArrowRight, Crown, Gift, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { formatMoneyAmount } from "@/lib/economy";
import { formatPoints } from "@/lib/scoring";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type Standing = {
  signedIn: boolean;
  me:
    | { hasEntry: false }
    | {
        hasEntry: true;
        locked: boolean;
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
  agent: {
    isAgent: boolean;
    paidTickets: number;
    commissionTickets: number;
    availableCodes: number;
    toNextFree: number;
  } | null;
};

export function MyStanding() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<Standing | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => setSession(sessionData.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const signedIn = session?.user.app_metadata.provider === "google";

  useEffect(() => {
    const token = session?.access_token;
    let cancelled = false;

    Promise.resolve().then(async () => {
      if (!token || !signedIn) {
        if (!cancelled) setData(null);
        return;
      }
      try {
        const response = await fetch("/api/me/standing", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = response.ok ? ((await response.json()) as Standing) : null;
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session?.access_token, signedIn]);

  if (!signedIn) {
    return null;
  }

  const me = data?.me;
  const hasLockedEntry = Boolean(me && me.hasEntry && me.locked);

  return (
    <section className="my-standing" id="me" aria-label="My account">
      <div className="standing-grid">
        <div className="panel standing-main standing-card standing-card--rank">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">My standing</h2>
              <p className="panel-subtitle">
                {me && me.hasEntry ? me.displayName : "Your team, points and rank"}
              </p>
            </div>
            <Trophy size={18} color="var(--gold)" />
          </div>
          <div className="panel-body">
            {!data ? (
              <div className="field-note">Loading your standing…</div>
            ) : hasLockedEntry && me && me.hasEntry ? (
              <>
                <div className="standing-rank">
                  <div className="standing-rank__big">
                    <span>Rank</span>
                    <strong>{me.rank ? `#${me.rank}` : "TBA"}</strong>
                    <small>{me.rank ? `of ${data.tournament.participants}` : "ranking pending"}</small>
                  </div>
                  <div className="standing-rank__big">
                    <span>Points</span>
                    <strong>{formatPoints(me.totalPoints)}</strong>
                    <small>total</small>
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
                      <span>In the money — projected share</span>
                      <strong>{formatMoneyAmount(me.share)} USDT</strong>
                    </div>
                  </div>
                ) : (
                  <p className="field-note">
                    {me.rank
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
                    : "You haven't joined yet. Pick 3 teams to enter the leaderboard."}
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
            <Users size={18} color="var(--green)" />
          </div>
          <div className="panel-body">
            {!data ? (
              <div className="field-note">Loading…</div>
            ) : data.referrals.length === 0 ? (
              <div className="standing-empty">
                <p>Invite friends — earn 5% (if you were invited) or 3% of their winnings.</p>
                <a className="button secondary" href="#invite">
                  Invite a friend
                  <ArrowRight size={16} />
                </a>
              </div>
            ) : (
              <div className="ref-list">
                {data.referrals.map((referral, index) => (
                  <div className="ref-row" key={`${referral.displayName}-${index}`}>
                    <div className="ref-meta">
                      <strong>{referral.displayName}</strong>
                      <small>
                        {referral.locked
                          ? `#${referral.rank} · ${formatPoints(referral.totalPoints)} pts`
                          : "Not locked yet"}
                      </small>
                    </div>
                    <div className="ref-cut">
                      {referral.inPaidPlaces && referral.myCut != null ? (
                        <>
                          <span>your {referral.feePercent}%</span>
                          <strong>{formatMoneyAmount(referral.myCut)}</strong>
                        </>
                      ) : (
                        <span className="ref-pending">—</span>
                      )}
                    </div>
                  </div>
                ))}
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
            <Gift size={18} color="var(--gold)" />
          </div>
          <div className="panel-body">
            <div className="account-status-grid">
              <div>
                <span>Codes to sell</span>
                <strong>{data.agent.availableCodes}</strong>
                <small>available now</small>
              </div>
              <div>
                <span>Paid tickets</span>
                <strong>{data.agent.paidTickets}</strong>
                <small>lifetime</small>
              </div>
              <div>
                <span>Free tickets won</span>
                <strong>{data.agent.commissionTickets}</strong>
                <small>commission</small>
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
    </section>
  );
}
