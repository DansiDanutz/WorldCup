import { ArrowRight, Award, Users } from "lucide-react";

// "The Matchup" — the 9:16 portrait hero poster for WorldCup26.world.
// A cinematic face-off backdrop carries the Pick-3-Teams pitch and the
// Top-10-rewarded payoff, with a
// full-width call to action beneath them. The face-off photo lives at
// /public/hero-matchup.png and layers over the on-brand gradient, which stays
// as a graceful fallback if the image ever fails to load.
export function HeroCard() {
  return (
    <section className="hero-card" aria-label="WorldCup26.world — Prediction Game">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />

      <div className="hero-card__content">
        {/* Center stays open so the two-player face-off photo reads clearly. */}
        <div className="hero-card__center" aria-hidden="true" />

        <div className="hero-card__cards">
          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Users size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Pick 3 Teams</strong>
              <small>Climb the leaderboard.</small>
            </span>
          </div>

          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Award size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Top 10 Rewarded</strong>
              <small>
                The <b>top 10</b> share the prize pool.
              </small>
            </span>
          </div>

          <a className="hero-cta" href="#pick">
            Play now
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
