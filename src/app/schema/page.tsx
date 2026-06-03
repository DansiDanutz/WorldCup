import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  GitBranch,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SmartMenu } from "@/components/smart-menu";
import {
  formatCoefficient,
  formatKickoff,
  formatPoints,
  getMatchScore,
  getTeamDisplayName,
  groupStagesById,
  groupTeamsById,
} from "@/lib/scoring";
import {
  buildGroupDraw,
  formatGoalDifference,
  groupMatchesByStage,
  groupPointsByMatch,
} from "@/lib/schema-draw";
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
  const groups = buildGroupDraw(teams, matches);
  const knockoutStages = stages.filter((stage) => stage.id !== "group_stage");
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
        <SmartMenu>
          <nav className="nav nav--app" aria-label="Schema navigation">
            <Link className="nav-item nav-item--primary" href="/">
              <ArrowLeft size={16} />
              <span className="nav-item__copy">
                <strong>Back</strong>
                <small>Pick teams</small>
              </span>
            </Link>
            <Link className="nav-item" href="/#matches">
              <CalendarClock size={16} />
              <span className="nav-item__copy">
                <strong>Matches</strong>
                <small>Schedule</small>
              </span>
            </Link>
            <Link className="nav-item" href="/#rules">
              <BookOpen size={16} />
              <span className="nav-item__copy">
                <strong>Rules</strong>
                <small>Scoring</small>
              </span>
            </Link>
          </nav>
        </SmartMenu>
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

        <section className="draw-section" aria-labelledby="group-draw-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current tables</p>
              <h2 id="group-draw-title">Group Stage Standings</h2>
            </div>
            <span className="status-pill">Winner and runner-up paths</span>
          </div>

          <div className="group-draw-grid">
            {groups.map((group) => (
              <article className="group-card" key={group.code}>
                <div className="group-card-header">
                  <h3>Group {group.code}</h3>
                  <span>{group.teams.length} teams</span>
                </div>

                <div className="standings-table" role="table" aria-label={`Group ${group.code}`}>
                  <div className="standings-head" role="row">
                    <span role="columnheader">Team</span>
                    <span role="columnheader">P</span>
                    <span role="columnheader">GD</span>
                    <span role="columnheader">Pts</span>
                  </div>
                  {group.teams.map((team, index) => (
                    <div className="standings-row" key={team.team.id} role="row">
                      <strong role="cell">
                        {index + 1}. {team.team.name}
                      </strong>
                      <span role="cell">{team.played}</span>
                      <span role="cell">{formatGoalDifference(team.goalDifference)}</span>
                      <span role="cell">{team.points}</span>
                    </div>
                  ))}
                </div>

                <div className="qualification-paths">
                  <PathLine label="Winner" path={group.paths.winner} />
                  <PathLine label="Runner-up" path={group.paths.runnerUp} />
                  <PathLine label="Third-place route" path={group.paths.thirdPlace} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="draw-section" aria-labelledby="knockout-draw-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Road to the trophy</p>
              <h2 id="knockout-draw-title">Knockout Draw</h2>
            </div>
            <span className="status-pill">Round of 32 to Final</span>
          </div>

          <div className="knockout-board">
            {knockoutStages.map((stage) => (
              <div className="knockout-column" key={stage.id}>
                <div className="knockout-column-header">
                  <h3>{stage.name}</h3>
                  <span>x{formatCoefficient(stage.stage_coefficient)}</span>
                </div>
                {(matchesByStage.get(stage.id) ?? []).map((match) => (
                  <DrawMatch
                    key={match.id}
                    match={match}
                    teamsById={teamsById}
                  />
                ))}
              </div>
            ))}
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

function PathLine({ label, path }: { label: string; path: string | null }) {
  return (
    <div className="path-line">
      <span>{label}</span>
      <strong>{path ?? "To be confirmed"}</strong>
    </div>
  );
}

function DrawMatch({
  match,
  teamsById,
}: {
  match: WorldCupMatch;
  teamsById: ReturnType<typeof groupTeamsById>;
}) {
  const homeName = getTeamDisplayName(match.home_team_id, match.home_slot, teamsById);
  const awayName = getTeamDisplayName(match.away_team_id, match.away_slot, teamsById);

  return (
    <article className={`draw-match ${match.status}`}>
      <div className="draw-match-number">#{match.match_number}</div>
      <div className="draw-match-side">{homeName}</div>
      <div className="draw-match-side">{awayName}</div>
      <div className="draw-match-meta">
        {match.status === "completed" ? getMatchScore(match) : formatKickoff(match.kickoff_at)}
      </div>
    </article>
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
