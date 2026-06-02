import { Crown } from "lucide-react";

import { formatCoefficient, formatPoints } from "@/lib/scoring";

import { podiumClass } from "./utils";

export type PlayerCardTeam = {
  name: string;
  points?: number | string;
  coefficient?: number | string;
};

export type PlayerCardProps = {
  rank: number;
  name: string;
  totalPoints: number | string;
  /** Up to three selected teams, in pick order. */
  teams: PlayerCardTeam[];
};

const PICK_CLASSES = ["pick-color-one", "pick-color-two", "pick-color-three"] as const;
const PODIUM_LABELS: Record<number, string> = {
  1: "Champion",
  2: "Runner-up",
  3: "Third place",
};

export function PlayerCard({ rank, name, totalPoints, teams }: PlayerCardProps) {
  const podium = podiumClass(rank);

  const scored = teams.filter((team) => team.points != null);
  const bestTeam =
    scored.length > 0
      ? scored.reduce((best, team) => (Number(team.points) > Number(best.points) ? team : best))
      : null;
  const subtitle = bestTeam
    ? `Top pick · ${bestTeam.name}`
    : `${teams.length} ${teams.length === 1 ? "team" : "teams"}`;

  return (
    <article
      className={`wc-card player-card${podium ? ` ${podium}` : ""}`}
      aria-label={`Rank ${rank}, ${name}, ${formatPoints(totalPoints)} points`}
    >
      <div className="player-card-top">
        <span className={`player-rank${podium ? ` ${podium}` : ""}`}>
          {rank === 1 ? <Crown size={20} aria-hidden="true" /> : rank}
        </span>
        <div className="player-id">
          <span className="player-name">{name}</span>
          <span className="player-sub">{PODIUM_LABELS[rank] ?? subtitle}</span>
        </div>
        <div className="player-points">
          <strong>{formatPoints(totalPoints)}</strong>
          <span>Points</span>
        </div>
      </div>

      <ul className="player-teams">
        {teams.map((team, index) => (
          <li className={`player-team ${PICK_CLASSES[index] ?? ""}`} key={`${team.name}-${index}`}>
            <span className="player-team-label">Pick {index + 1}</span>
            <span className="player-team-name">
              {team.name}
              {team.coefficient != null ? (
                <small> x{formatCoefficient(team.coefficient)}</small>
              ) : null}
            </span>
            {team.points != null ? (
              <span className="player-team-pts">{formatPoints(team.points)}</span>
            ) : (
              <span className="player-team-pts muted">&ndash;</span>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}
