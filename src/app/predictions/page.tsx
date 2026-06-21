import { ArrowLeft, PlayCircle } from "lucide-react";
import Link from "next/link";

import { LegendCardCollection } from "@/components/legend-card-collection";
import { PREDICTIONS } from "@/lib/predictions";

export const metadata = {
  title: "Legend Cards · WorldCup26 Legends",
  description:
    "Collect WorldCup26 Legends episode cards by watching the matching YouTube stories.",
};

export default function PredictionsPage() {
  const episodes = [...PREDICTIONS].sort((a, b) => b.ep - a.ep);
  const liveCount = PREDICTIONS.filter((p) => p.youtube).length;

  return (
    <main className="app-shell">
      <div className="page predictions-page">
        <LegendCardCollection />

        <section className="episode-library" aria-labelledby="episode-library-title">
          <div className="episode-library__header">
            <div>
              <p className="wc-card-eyebrow">Episode library</p>
              <h2 id="episode-library-title">Match Predictions</h2>
              <p>
                Story predictions from the WorldCup26 Legends series. {liveCount} of{" "}
                {PREDICTIONS.length} episodes are live; new card unlocks appear here as videos go
                public.
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
                    {isLive ? (
                      <a
                        className="button episode-card__watch"
                        href={prediction.youtube as string}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <PlayCircle size={16} />
                        Watch episode
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
