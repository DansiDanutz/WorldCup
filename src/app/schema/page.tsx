import { ArrowLeft, CheckCircle2, Clock, GitBranch, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  formatCoefficient,
  formatKickoff,
  formatPoints,
  getMatchScore,
  getTeamDisplayName,
  groupStagesById,
  groupTeamsById,
} from "@/lib/scoring";
import type { MatchTeamPoints, WorldCupMatch } from "@/lib/types";
import { getTournamentSchemaData } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tournament Schema | WorldCup",
  description: "Full World Cup 2026 match schema from group stage to final.",
};

export default async function SchemaPage() {
  const { teams, stages, matches, matchTeamPoints } = await getTournamentSchemaData();
  const teamsById = groupTeamsById(teams);
  const stagesById = groupStagesById(stages);
  const pointsByMatchId = groupPointsByMatch(matchTeamPoints);
  const matchesByStage = groupMatchesByStage(matches);
  const completedCount = matches.filter((match) => match.status === "completed").length;

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Trophy size={20} />
          </span>
          <span>WorldCup</span>
        </Link>
        <nav className="nav" aria-label="Schema navigation">
          <Link href="/">
            <ArrowLeft size={16} />
            Back
          </Link>
          <Link href="/#matches">Matches</Link>
          <Link href="/#rules">Rules</Link>
        </nav>
      </header>

      <div className="page">
        <section className="schema-hero">
          <div>
            <p className="eyebrow">Group stage to final</p>
            <h1>Tournament Schema</h1>
            <p>
              Every match is shown in competition order. When a result is completed, the team
              points shown here are the points added to users who selected that team.
            </p>
          </div>
          <div className="schema-summary">
            <span>{completedCount}/{matches.length} completed</span>
            <strong>{stages.length} stages</strong>
          </div>
        </section>

        <section className="schema-stages">
          {stages.map((stage) => {
            const stageMatches = matchesByStage.get(stage.id) ?? [];

            return (
              <div className="panel schema-stage" key={stage.id}>
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">{stage.name}</h2>
                    <p className="panel-subtitle">
                      Stage coefficient {formatCoefficient(stage.stage_coefficient)} ·{" "}
                      {stageMatches.length} matches
                    </p>
                  </div>
                  <GitBranch size={18} color="var(--green)" />
                </div>

                <div className="schema-match-list">
                  {stageMatches.map((match) => (
                    <SchemaMatch
                      key={match.id}
                      match={match}
                      points={pointsByMatchId.get(match.id) ?? []}
                      stageName={stagesById.get(match.stage_id)?.name ?? match.stage_id}
                      teamsById={teamsById}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function SchemaMatch({
  match,
  points,
  stageName,
  teamsById,
}: {
  match: WorldCupMatch;
  points: MatchTeamPoints[];
  stageName: string;
  teamsById: ReturnType<typeof groupTeamsById>;
}) {
  const homeName = getTeamDisplayName(match.home_team_id, match.home_slot, teamsById);
  const awayName = getTeamDisplayName(match.away_team_id, match.away_slot, teamsById);
  const homePoints = match.home_team_id
    ? points.find((point) => point.team_id === match.home_team_id)
    : null;
  const awayPoints = match.away_team_id
    ? points.find((point) => point.team_id === match.away_team_id)
    : null;

  return (
    <article className="schema-match">
      <div className="schema-match-top">
        <div>
          <span className="schema-match-number">Match #{match.match_number}</span>
          <h3>
            {homeName} vs {awayName}
          </h3>
        </div>
        <span className={`status-pill ${match.status}`}>
          {match.status === "completed" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
          {match.status === "completed" ? getMatchScore(match) : "Scheduled"}
        </span>
      </div>

      <div className="schema-match-meta">
        {stageName}
        {match.group_code ? ` · Group ${match.group_code}` : ""} · {formatKickoff(match.kickoff_at)} ·{" "}
        {match.venue}
      </div>

      <div className="schema-points">
        <TeamPointLine
          label="Home"
          name={homeName}
          points={homePoints}
          status={match.status}
        />
        <TeamPointLine
          label="Away"
          name={awayName}
          points={awayPoints}
          status={match.status}
        />
      </div>

      <div className="schema-award-state">
        {match.status !== "completed"
          ? "Points will be calculated when the match is completed."
          : match.points_applied_at
            ? `Points applied ${formatKickoff(match.points_applied_at)}.`
            : "Result completed; points are waiting to be applied."}
      </div>
    </article>
  );
}

function TeamPointLine({
  label,
  name,
  points,
  status,
}: {
  label: string;
  name: string;
  points: MatchTeamPoints | null | undefined;
  status: WorldCupMatch["status"];
}) {
  return (
    <div className="schema-point-line">
      <div>
        <span>{label}</span>
        <strong>{name}</strong>
      </div>
      {points && status === "completed" ? (
        <div className="schema-point-value">
          <strong>{formatPoints(points.final_points)}</strong>
          <span>
            base {formatPoints(points.base_points)} x team{" "}
            {formatCoefficient(points.team_coefficient)} x stage{" "}
            {formatCoefficient(points.stage_coefficient)}
          </span>
        </div>
      ) : (
        <div className="schema-point-value pending">
          <strong>-</strong>
          <span>{points ? "Pending result" : "Team not assigned yet"}</span>
        </div>
      )}
    </div>
  );
}

function groupPointsByMatch(points: MatchTeamPoints[]) {
  const grouped = new Map<string, MatchTeamPoints[]>();

  for (const point of points) {
    grouped.set(point.match_id, [...(grouped.get(point.match_id) ?? []), point]);
  }

  return grouped;
}

function groupMatchesByStage(matches: WorldCupMatch[]) {
  const grouped = new Map<string, WorldCupMatch[]>();

  for (const match of matches) {
    grouped.set(match.stage_id, [...(grouped.get(match.stage_id) ?? []), match]);
  }

  return grouped;
}
