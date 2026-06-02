import { ArrowRight, Target, Trophy, Users } from "lucide-react";

// "The Matchup" — the 16:9 landing hero for WorldCup26.world.
// A cinematic face-off backdrop carries three glass mini-cards: the brand
// lockup, the Prediction Game pitch, and the Choose-3-Teams call to action.
// The photo is optional — drop a 16:9 image at /public/hero-matchup.jpg and it
// layers over the on-brand gradient, which stays as a graceful fallback.
export function HeroCard() {
  return (
    <section className="hero-card" aria-label="WorldCup26.world — Prediction Game">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />

      <div className="hero-card__content">
        <div className="hero-card__top">
          <div className="hero-mini hero-brand">
            <span className="hero-brand__mark">
              <Trophy size={22} aria-hidden="true" />
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
              <Target size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Prediction Game</strong>
              <small>Pick 3 teams. Climb the leaderboard.</small>
            </span>
          </div>

          <div className="hero-mini hero-feature hero-feature--cta">
            <span className="hero-feature__icon">
              <Users size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Choose 3 Teams</strong>
              <small>
                The <b>top 10</b> best scoring wins.
              </small>
            </span>
            <a className="hero-cta" href="#pick">
              Play now
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
