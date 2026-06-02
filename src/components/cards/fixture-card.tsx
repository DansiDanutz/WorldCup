import { CalendarClock, GitBranch, MapPin } from "lucide-react";

import { formatMatchDay, formatMatchTime, teamMonogram } from "./utils";

export type FixtureCardTeam = {
  name: string;
  /** Optional flag emoji. Falls back to a monogram badge when omitted. */
  flag?: string;
  score?: number | null;
};

export type FixtureStatus = "scheduled" | "due" | "completed";

export type FixtureCardProps = {
  matchNumber?: number;
  stageName: string;
  groupCode?: string | null;
  /** ISO kickoff timestamp. */
  kickoff: string;
  venue?: string;
  city?: string;
  home: FixtureCardTeam;
  away: FixtureCardTeam;
  status?: FixtureStatus;
  finishMethod?: "90" | "extra_time" | "penalties" | null;
  /** Shoot-out score, shown in the divider when finishMethod is "penalties". */
  penaltyScore?: { home: number; away: number };
  /** Overrides score comparison for winner highlighting (needed for shoot-outs). */
  winner?: "home" | "away" | null;
};

const STATUS_META: Record<FixtureStatus, { className: string; label: string }> = {
  completed: { className: "completed", label: "Full Time" },
  due: { className: "due", label: "Kicks off soon" },
  scheduled: { className: "", label: "Scheduled" },
};

function TeamFlag({ team }: { team: FixtureCardTeam }) {
  if (team.flag) {
    return (
      <span className="fixture-team-flag" aria-hidden="true">
        {team.flag}
      </span>
    );
  }

  return (
    <span className="fixture-team-flag monogram" aria-hidden="true">
      {teamMonogram(team.name)}
    </span>
  );
}

export function FixtureCard({
  matchNumber,
  stageName,
  groupCode,
  kickoff,
  venue,
  city,
  home,
  away,
  status = "scheduled",
  finishMethod,
  penaltyScore,
  winner,
}: FixtureCardProps) {
  const isCompleted = status === "completed";
  const pill = STATUS_META[status];

  const homeWins =
    winner === "home" ||
    (winner == null &&
      isCompleted &&
      typeof home.score === "number" &&
      typeof away.score === "number" &&
      home.score > away.score);
  const awayWins =
    winner === "away" ||
    (winner == null &&
      isCompleted &&
      typeof home.score === "number" &&
      typeof away.score === "number" &&
      away.score > home.score);

  const dividerLabel = isCompleted
    ? finishMethod === "penalties"
      ? penaltyScore
        ? `Pens ${penaltyScore.home}–${penaltyScore.away}`
        : "Penalties"
      : finishMethod === "extra_time"
        ? "After Extra Time"
        : "Full Time"
    : formatMatchTime(kickoff);

  const eyebrow = [stageName, groupCode ? `Group ${groupCode}` : null]
    .filter(Boolean)
    .join(" · ");

  const renderTeam = (team: FixtureCardTeam, isWinner: boolean) => (
    <div className={`fixture-team${isWinner ? " winner" : ""}`}>
      <TeamFlag team={team} />
      <span className="fixture-team-name">{team.name}</span>
      {isCompleted ? (
        <span className="fixture-team-score">{team.score ?? 0}</span>
      ) : (
        <span className="fixture-team-score muted" aria-hidden="true">
          &ndash;
        </span>
      )}
    </div>
  );

  return (
    <article
      className="wc-card fixture-card"
      aria-label={`${stageName}: ${home.name} versus ${away.name}, ${pill.label}`}
    >
      <div className="fixture-card-head">
        <span className="wc-card-eyebrow">
          <GitBranch size={13} aria-hidden="true" />
          {eyebrow}
        </span>
        <span className={`status-pill ${pill.className}`}>{pill.label}</span>
      </div>

      <div className="fixture-teams">
        {renderTeam(home, homeWins)}
        <div className="fixture-mid">
          <span className="fixture-mid-chip">{dividerLabel}</span>
        </div>
        {renderTeam(away, awayWins)}
      </div>

      <div className="fixture-foot">
        <span className="fixture-foot-item">
          <CalendarClock size={14} aria-hidden="true" />
          {formatMatchDay(kickoff)}
          {!isCompleted ? ` · ${formatMatchTime(kickoff)}` : ""}
        </span>
        {venue ? (
          <span className="fixture-foot-item">
            <MapPin size={14} aria-hidden="true" />
            {venue}
            {city ? `, ${city}` : ""}
          </span>
        ) : null}
        {typeof matchNumber === "number" ? (
          <span className="fixture-foot-item match-no">Match {matchNumber}</span>
        ) : null}
      </div>
    </article>
  );
}
