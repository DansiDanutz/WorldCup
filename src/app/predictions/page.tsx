import { ArrowLeft, PlayCircle } from "lucide-react";
import Link from "next/link";

import { LegendCardCollection } from "@/components/legend-card-collection";
import { MatchScheduleExplorer } from "@/components/match-schedule-explorer";
import { LEGEND_CARDS } from "@/lib/legend-cards";
import { PREDICTIONS } from "@/lib/predictions";
import { getDashboardData } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Legend Cards · WorldCup26 Legends",
  description:
    "Collect WorldCup26 Legends episode cards by opening the matching YouTube stories.",
};

export default async function PredictionsPage() {
  const [{ teams, stages, matches }] = await Promise.all([getDashboardData()]);
  const episodes = [...PREDICTIONS].sort((a, b) => b.ep - a.ep);
  const liveCount = PREDICTIONS.filter((p) => p.youtube).length;
  const legendCardAnchorByEpisode = new Map<number, string>();

  for (const card of LEGEND_CARDS) {
    if (!legendCardAnchorByEpisode.has(card.episode)) {
      legendCardAnchorByEpisode.set(card.episode, `legend-card-${card.id}`);
    }
  }

  return (
    <main className="app-shell">
      <div className="page predictions-page">
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
