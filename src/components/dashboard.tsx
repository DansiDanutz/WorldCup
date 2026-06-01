"use client";

import {
  CalendarClock,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Lock,
  RefreshCw,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import {
  formatCoefficient,
  formatKickoff,
  formatPoints,
  getMatchScore,
  getTeamDisplayName,
  groupStagesById,
  groupTeamsById,
} from "@/lib/scoring";
import type {
  DueMatch,
  LeaderboardRow,
  WorldCupMatch,
  WorldCupStage,
  WorldCupTeam,
} from "@/lib/types";

type DashboardProps = {
  teams: WorldCupTeam[];
  stages: WorldCupStage[];
  matches: WorldCupMatch[];
  leaderboard: LeaderboardRow[];
  dueMatches: DueMatch[];
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

export function Dashboard({
  teams,
  stages,
  matches,
  leaderboard,
  dueMatches,
}: DashboardProps) {
  const [query, setQuery] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [entryMessage, setEntryMessage] = useState<string | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [adminState, setAdminState] = useState<AdminResultState>(initialAdminState);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAdminPending, startAdminTransition] = useTransition();

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

  function toggleTeam(teamId: string) {
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

    startTransition(async () => {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          teamIds: selectedTeams,
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
      window.setTimeout(() => window.location.reload(), 900);
    });
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Trophy size={20} />
          </span>
          <span>WorldCup</span>
        </div>
        <nav className="nav" aria-label="Primary navigation">
          <a href="#pick">
            <Users size={16} />
            Pick Teams
          </a>
          <a href="#leaderboard">
            <Trophy size={16} />
            Leaderboard
          </a>
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
                <p className="panel-subtitle">Favorites start at 1.00, longshots reach 3.00.</p>
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

                return (
                  <button
                    className={`team-row ${selected ? "selected" : ""}`}
                    key={team.id}
                    onClick={() => toggleTeam(team.id)}
                    type="button"
                  >
                    <span className="select-dot">{selected ? <Check size={16} /> : null}</span>
                    <span>
                      <span className="team-name">{team.name}</span>
                      <span className="team-meta">
                        Group {team.group_code ?? "-"} · {team.confederation}
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
                <p className="panel-subtitle">Lock exactly 3 teams into the leaderboard.</p>
              </div>
              <Lock size={18} color="var(--green)" />
            </div>
            <div className="entry-form">
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
                    <div className={`selected-team ${team ? "" : "empty-slot"}`} key={slot}>
                      <span>{team ? team.name : `Team slot ${slot + 1}`}</span>
                      <strong>{team ? formatCoefficient(team.reward_coefficient) : "-"}</strong>
                    </div>
                  );
                })}
              </div>
              <button
                className="button"
                disabled={selectedTeams.length !== 3 || !displayName.trim() || isPending}
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
                <div className="leaderboard-row">
                  <div className="leaderboard-name">No locked entries yet.</div>
                  <div className="leaderboard-teams">First entries will appear here.</div>
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
                      {(row.teams ?? []).map((team) => team.team_name).join(" · ")}
                    </div>
                  </div>
                ))
              )}
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
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

