import Link from "next/link";
import { PREDICTIONS } from "@/lib/predictions";

export const metadata = {
  title: "Predictions · WorldCup26 Legends",
  description:
    "Our story prediction for every WorldCup26 match — watch the matching episode of the WorldCup26 Legends series.",
};

export default function PredictionsPage() {
  const episodes = [...PREDICTIONS].sort((a, b) => b.ep - a.ep);
  const liveCount = PREDICTIONS.filter((p) => p.youtube).length;

  return (
    <main className="app-shell">
      <div className="page">
        <article className="panel" style={{ maxWidth: 980, margin: "0 auto" }}>
          <p className="wc-card-eyebrow" style={{ color: "var(--green)" }}>
            WorldCup26 Legends
          </p>
          <h1 className="panel-title" style={{ fontSize: 28 }}>
            Match Predictions
          </h1>
          <p className="panel-subtitle">
            One cinematic episode per match — our <strong>story prediction</strong> for how it
            could unfold. These are predictions from our series, not real results. {liveCount} of{" "}
            {PREDICTIONS.length} episodes are live; the rest premiere before kickoff.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "var(--space-5)",
              marginTop: "var(--space-7)",
            }}
          >
            {episodes.map((p) => {
              const isLive = Boolean(p.youtube);
              return (
                <section
                  key={p.ep}
                  className="wc-card"
                  style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "var(--space-3)",
                    }}
                  >
                    <span className="wc-card-eyebrow" style={{ color: "var(--green)" }}>
                      Episode {p.ep}
                    </span>
                    {p.stage ? (
                      <span style={{ font: "var(--meta)", color: "var(--muted)", textAlign: "right" }}>
                        {p.stage}
                      </span>
                    ) : null}
                  </div>

                  <h2 style={{ font: "var(--h2)", margin: 0 }}>
                    {p.home} <span style={{ color: "var(--muted)", fontWeight: 600 }}>vs</span>{" "}
                    {p.away}
                  </h2>

                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    {p.score ? (
                      <span
                        style={{
                          font: "var(--h1)",
                          fontSize: 30,
                          color: "var(--text)",
                          letterSpacing: "0.02em",
                        }}
                        aria-label={`Predicted score ${p.score}`}
                      >
                        {p.score}
                      </span>
                    ) : (
                      <span
                        style={{
                          font: "var(--meta)",
                          color: "var(--gold)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Score left open
                      </span>
                    )}
                    <span style={{ font: "var(--meta)", color: "var(--muted)" }}>our prediction</span>
                  </div>

                  <p style={{ font: "var(--body)", color: "var(--text)", margin: 0 }}>{p.hook}</p>

                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    {p.date ? (
                      <span style={{ font: "var(--meta)", color: "var(--muted)" }}>{p.date}</span>
                    ) : null}
                    {isLive ? (
                      <a
                        className="button"
                        href={p.youtube as string}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textAlign: "center" }}
                      >
                        ▶ Watch episode
                      </a>
                    ) : (
                      <span
                        className="button secondary"
                        aria-disabled="true"
                        style={{ textAlign: "center", opacity: 0.7, cursor: "default" }}
                      >
                        Premieres before kickoff
                      </span>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "var(--space-8)",
              padding: "var(--space-6)",
              background: "var(--green-soft)",
              borderRadius: "var(--radius-md)",
              textAlign: "center",
            }}
          >
            <p style={{ font: "var(--body-lg)", margin: 0, color: "var(--text)" }}>
              Think you can call them better? Pick 3 teams free and play along.
            </p>
            <Link className="button" href={{ pathname: "/" }} style={{ marginTop: "var(--space-4)" }}>
              Play WorldCup26
            </Link>
          </div>

          <div style={{ marginTop: "var(--space-7)" }}>
            <Link className="button secondary" href={{ pathname: "/" }}>
              ← Back to game
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
