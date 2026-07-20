import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  PlayCircle,
  Search,
  Sparkles,
  Trophy,
  Video,
} from "lucide-react";
import Link from "next/link";

import { LegendCardCollection } from "@/components/legend-card-collection";
import { MatchScheduleExplorer } from "@/components/match-schedule-explorer";
import { SmartMenu } from "@/components/smart-menu";
import { LEGEND_CARDS } from "@/lib/legend-cards";
import { getMatchScheduleData } from "@/lib/match-schedule-data";
import { PREDICTIONS } from "@/lib/predictions";
import { getMatchScore, getTeamDisplayName, groupTeamsById } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Legend Cards · WorldCup26 Legends",
  description:
    "Collect WorldCup26 Legends episode cards by opening the matching YouTube stories.",
};

export default async function PredictionsPage() {
  const { teams, stages, matches } = await getMatchScheduleData();
  const episodes = [...PREDICTIONS].sort((a, b) => b.ep - a.ep);
  const liveCount = PREDICTIONS.filter((p) => p.youtube).length;
  const completedCount = matches.filter((match) => match.status === "completed").length;
  const scoredCount = matches.filter((match) => Boolean(match.points_applied_at)).length;
  const teamsById = groupTeamsById(teams);
  const final = matches.find((match) => match.match_number === 104);
  const champion = final?.winner_team_id
    ? getTeamDisplayName(final.winner_team_id, "Champion", teamsById)
    : "Champion";
  const finalScore = final?.status === "completed" ? getMatchScore(final) : null;
  const legendCardAnchorByEpisode = new Map<number, string>();

  for (const card of LEGEND_CARDS) {
    if (!legendCardAnchorByEpisode.has(card.episode)) {
      legendCardAnchorByEpisode.set(card.episode, `legend-card-${card.id}`);
    }
  }

  return (
    <main className="app-shell predictions-shell">
      <header className="topbar predictions-topbar">
        <Link className="brand landing-brand-lockup" href="/" aria-label="Go to WorldCup26.world home">
          <span className="brand-mark">
            <Trophy size={20} aria-hidden="true" />
          </span>
          <span className="landing-brand-copy">
            <strong>
              WorldCup26<span className="hero-brand__tld">.world</span>
            </strong>
            <small>Legends album</small>
          </span>
          <span className="landing-brand-year" aria-label="2026 season">
            <span className="hero-edition__dot" aria-hidden="true" />
            2026
          </span>
        </Link>

        <SmartMenu label="Menu" summary="Browse cards">
          <nav className="nav nav--app" aria-label="Legends navigation">
            <a className="nav-item nav-item--primary" href="#collector-quest">
              <Sparkles size={16} />
              <span className="nav-item__copy">
                <strong>Quest</strong>
                <small>Next card</small>
              </span>
            </a>
            <a className="nav-item" href="#legend-card-grid">
              <Search size={16} />
              <span className="nav-item__copy">
                <strong>Album</strong>
                <small>Cards</small>
              </span>
            </a>
            <a className="nav-item" href="#matches">
              <CalendarClock size={16} />
              <span className="nav-item__copy">
                <strong>Matches</strong>
                <small>Schedule</small>
              </span>
            </a>
            <a className="nav-item" href="#episode-library-title">
              <Video size={16} />
              <span className="nav-item__copy">
                <strong>Episodes</strong>
                <small>YouTube</small>
              </span>
            </a>
            <Link className="nav-item" href={{ pathname: "/" }}>
              <ArrowLeft size={16} />
              <span className="nav-item__copy">
                <strong>Game</strong>
                <small>Dashboard</small>
              </span>
            </Link>
          </nav>
        </SmartMenu>
      </header>

      <div className="page predictions-page">
        <section className="tournament-finale" aria-labelledby="tournament-finale-title">
          <div className="tournament-finale__icon" aria-hidden="true">
            <Trophy size={28} />
          </div>
          <div className="tournament-finale__copy">
            <p className="wc-card-eyebrow">The final chapter · July 19, 2026</p>
            <h1 id="tournament-finale-title">{champion}, world champions</h1>
            <p>
              The tournament is complete. Explore the final scores, the finished leaderboard,
              and every WorldCup26 Legends story from our YouTube season.
            </p>
          </div>
          <dl className="tournament-finale__stats">
            <div>
              <dt>Final</dt>
              <dd>{finalScore ?? "Complete"}</dd>
            </div>
            <div>
              <dt>Matches scored</dt>
              <dd>{scoredCount}/{matches.length}</dd>
            </div>
            <div>
              <dt>Legend cards</dt>
              <dd>{LEGEND_CARDS.length}</dd>
            </div>
          </dl>
          {completedCount === matches.length && scoredCount === matches.length ? (
            <span className="tournament-finale__verified">
              <CheckCircle2 size={16} /> Final scoring complete
            </span>
          ) : null}
        </section>

        <LegendCardCollection />

        <MatchScheduleExplorer matches={matches} stages={stages} teams={teams} />

        <section className="episode-library" aria-labelledby="episode-library-title">
          <div className="episode-library__header">
            <div>
              <p className="wc-card-eyebrow">Episode library</p>
              <h2 id="episode-library-title">Legend Story Cards</h2>
              <p>
                Every YouTube story becomes a collectible Legend card. {liveCount} of{" "}
                {PREDICTIONS.length} episodes are live, and each live episode links straight to
                the card it unlocks.
              </p>
            </div>
            <Link className="button secondary episode-library__back" href={{ pathname: "/" }}>
              <ArrowLeft size={16} />
              Back to game
            </Link>
          </div>

          <div className="episode-grid">
            {episodes.map((prediction) => {
              const isLive = Boolean(prediction.youtube);
              const legendCardAnchor = legendCardAnchorByEpisode.get(prediction.ep);

              return (
                <article key={prediction.ep} className="episode-card">
                  <div className="episode-card__topline">
                    <span>Episode {prediction.ep}</span>
                    {prediction.stage ? <small>{prediction.stage}</small> : null}
                  </div>

                  <h3>
                    {prediction.home} <span>vs</span> {prediction.away}
                  </h3>

                  <div className="episode-card__score">
                    {prediction.score ? (
                      <strong aria-label={`Predicted score ${prediction.score}`}>
                        {prediction.score}
                      </strong>
                    ) : (
                      <strong>Open</strong>
                    )}
                    <span>story prediction</span>
                  </div>

                  <p>{prediction.hook}</p>

                  <div className="episode-card__footer">
                    {prediction.date ? <small>{prediction.date}</small> : null}
                    {isLive && legendCardAnchor ? (
                      <Link
                        className="button episode-card__watch"
                        href={`/predictions#${legendCardAnchor}`}
                      >
                        <PlayCircle size={16} />
                        Open & collect
                      </Link>
                    ) : isLive ? (
                      <a
                        className="button episode-card__watch"
                        href={prediction.youtube as string}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <PlayCircle size={16} />
                        Open episode
                      </a>
                    ) : (
                      <span className="button secondary episode-card__pending" aria-disabled="true">
                        Premieres before kickoff
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
