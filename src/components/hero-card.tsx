import { ArrowRight, Award, Trophy, Users } from "lucide-react";

// "The Matchup" — the 9:16 portrait hero poster for WorldCup26.world.
// A cinematic face-off backdrop carries three glass mini-cards: the brand
// lockup, the Pick-3-Teams pitch, and the Top-10-rewarded payoff, with a
// full-width call to action beneath them. The photo is optional — drop a 9:16
// image at /public/hero-matchup.jpg and it layers over the on-brand gradient,
// which stays as a graceful fallback.
export function HeroCard() {
  return (
    <section className="hero-card" aria-label="WorldCup26.world — Prediction Game">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />

      <div className="hero-card__content">
        <div className="hero-card__top">
          <div className="hero-mini hero-brand">
            <span className="hero-brand__mark">
              <Trophy size={20} aria-hidden="true" />
            </span>
            <span className="hero-brand__text">
              <strong>
                WorldCup26<span className="hero-brand__tld">.world</span>
              </strong>
              <small>Predict the Game</small>
            </span>
          </div>

          <span className="hero-edition">
            <span className="hero-edition__dot" aria-hidden="true" />
            2026
          </span>
        </div>

        <div className="hero-card__center">
          <span className="hero-vs" aria-hidden="true">
            VS
          </span>
        </div>

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
