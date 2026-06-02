"use client";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gift,
  Medal,
  Percent,
  Scale,
  Target,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import { HeroCard } from "@/components/hero-card";

// "The Matchup" landing swiper — a touch-native carousel of 9:16 posters.
// Slide 1 is the live face-off hero; the rest are on-brand poster slides.
// Built on CSS scroll-snap (native momentum + touch) with dots, arrows and
// keyboard support layered on top — no carousel dependency.
const SLIDE_LABELS = [
  "The Matchup",
  "How to play",
  "Prize pool",
  "Scoring",
  "Example",
  "Coefficients",
  "Invite a friend",
  "Agent Deal",
  "Login or register",
] as const;

export function HeroSwiper({
  prizePool,
  playerCount,
}: {
  prizePool?: string;
  playerCount?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const clamped = Math.max(0, Math.min(SLIDE_LABELS.length - 1, index));
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: track.clientWidth * clamped, behavior: reduce ? "auto" : "smooth" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setActive(Math.round(track.scrollLeft / track.clientWidth));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    }
  }

  return (
    <section className="hero-swiper" aria-roledescription="carousel" aria-label="WorldCup26 highlights">
      <div className="hero-swiper__track" ref={trackRef} tabIndex={0} onKeyDown={onKeyDown}>
        {SLIDE_LABELS.map((label, index) => (
          <div
            className={`hero-swiper__slide${index === active ? " is-active" : ""}`}
            key={label}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${SLIDE_LABELS.length}: ${label}`}
          >
            {index === 0 ? (
              <HeroCard />
            ) : index === 1 ? (
              <HowToPoster />
            ) : index === 2 ? (
              <PrizePoster />
            ) : index === 3 ? (
              <PointsPoster onSeeExample={() => goTo(4)} />
            ) : index === 4 ? (
              <ExamplePoster />
            ) : index === 5 ? (
              <CoefficientsPoster />
            ) : index === 6 ? (
              <InvitePoster />
            ) : index === 7 ? (
              <AgentDealPoster />
            ) : (
              <LoginPoster prizePool={prizePool} playerCount={playerCount} />
            )}
          </div>
        ))}
      </div>

      <div className="hero-swiper__controls">
        <button
          className="hero-swiper__arrow"
          type="button"
          aria-label="Previous slide"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className="hero-swiper__dots" role="tablist" aria-label="Choose slide">
          {SLIDE_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`hero-swiper__dot${index === active ? " is-active" : ""}`}
              aria-label={`Go to ${label}`}
              aria-current={index === active}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        <button
          className="hero-swiper__arrow"
          type="button"
          aria-label="Next slide"
          onClick={() => goTo(active + 1)}
          disabled={active === SLIDE_LABELS.length - 1}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <p className="hero-swiper__status" aria-live="polite">
        {`Slide ${active + 1} of ${SLIDE_LABELS.length}: ${SLIDE_LABELS[active]}`}
      </p>
    </section>
  );
}

// Photo poster: the three-step pitch.
function HowToPoster() {
  return (
    <section className="hero-card hero-card--howto" aria-label="How to play">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />
      <div className="hero-card__content">
        <div className="hero-card__top">
          <span className="hero-edition">
            <span className="hero-edition__dot" aria-hidden="true" />
            HOW TO PLAY
          </span>
        </div>

        <div className="hero-card__center hero-poster__lede">
          <strong>
            Three picks.
            <br />
            One climb.
          </strong>
        </div>

        <div className="hero-card__cards">
          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Ticket size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>1 · Buy-in 50 USD</strong>
              <small>Unlocks one entry ticket.</small>
            </span>
          </div>

          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Target size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>2 · Pick 3 teams</strong>
              <small>Lock your entry before kickoff.</small>
            </span>
          </div>

          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Users size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>3 · Earn as they win</strong>
              <small>Points stack through the tournament.</small>
            </span>
          </div>

          <a className="hero-cta" href="#pick">
            Start picking
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Photo poster: the payoff.
function PrizePoster() {
  return (
    <section className="hero-card hero-card--prize" aria-label="Prize pool">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />
      <div className="hero-card__content">
        <div className="hero-card__top">
          <span className="hero-edition">
            <span className="hero-edition__dot" aria-hidden="true" />
            PRIZE POOL
          </span>
        </div>

        <div className="hero-card__center hero-poster__lede">
          <strong>
            Top 10
            <br />
            share the pool.
          </strong>
        </div>

        <div className="hero-card__cards">
          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Crown size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Winner takes the crown</strong>
              <small>The biggest slice of the pool.</small>
            </span>
          </div>

          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Medal size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Top 10 all paid</strong>
              <small>Every finisher in the top 10 earns.</small>
            </span>
          </div>

          <a className="hero-cta" href="#leaderboard">
            See payouts
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Photo poster: how points are awarded.
function PointsPoster({ onSeeExample }: { onSeeExample: () => void }) {
  return (
    <section className="hero-card hero-card--points" aria-label="Points awarded">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />
      <div className="hero-card__content">
        <div className="hero-card__top">
          <span className="hero-edition">
            <span className="hero-edition__dot" aria-hidden="true" />
            POINTS AWARDED
          </span>
        </div>

        <div className="hero-card__center hero-poster__lede">
          <strong>
            Every result
            <br />
            can score.
          </strong>
        </div>

        <div className="hero-card__cards">
          <div className="hero-mini hero-list">
            <div className="hero-list__row">
              <span>Win or qualify in 90′</span>
              <strong>5</strong>
            </div>
            <div className="hero-list__row">
              <span>Group-stage draw</span>
              <strong>2</strong>
            </div>
            <div className="hero-list__row">
              <span>Goal scored</span>
              <strong>+0.5</strong>
            </div>
            <div className="hero-list__row">
              <span>Clean sheet in 90′</span>
              <strong>+1</strong>
            </div>
          </div>

          <p className="hero-formula">(base + goals + clean sheet) × team × stage</p>
          <button className="hero-cta" type="button" onClick={onSeeExample}>
            See example
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

// Photo poster: team and stage coefficients.
function CoefficientsPoster() {
  return (
    <section className="hero-card hero-card--coef" aria-label="Coefficients">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />
      <div className="hero-card__content">
        <div className="hero-card__top">
          <span className="hero-edition">
            <span className="hero-edition__dot" aria-hidden="true" />
            COEFFICIENTS
          </span>
        </div>

        <div className="hero-card__center hero-poster__lede">
          <strong>
            Risk can
            <br />
            multiply.
          </strong>
        </div>

        <div className="hero-card__cards">
          <div className="hero-mini hero-list">
            <div className="hero-list__row hero-list__row--head">
              <span>
                <Scale size={15} aria-hidden="true" />
                Team multiplier
              </span>
              <strong>1.00 → 3.00</strong>
            </div>
            <div className="hero-list__row">
              <span>Group stage</span>
              <strong>×1.0</strong>
            </div>
            <div className="hero-list__row">
              <span>Knockouts rise</span>
              <strong>×1.2 → ×1.75</strong>
            </div>
            <div className="hero-list__row">
              <span>Final</span>
              <strong>×2.0</strong>
            </div>
          </div>

          <p className="hero-formula">Favourites low · underdogs high · fixed all tournament</p>
          <Link className="hero-cta" href={{ pathname: "/coefficients" }}>
            Full team list
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Photo poster: a worked scoring example for a Norway pick.
function ExamplePoster() {
  return (
    <section className="hero-card hero-card--example" aria-label="Scoring example">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />
      <div className="hero-card__content">
        <div className="hero-card__top">
          <span className="hero-edition">
            <span className="hero-edition__dot" aria-hidden="true" />
            EXAMPLE · NORWAY
          </span>
        </div>

        <div className="hero-card__center hero-poster__lede">
          <strong>
            One run.
            <br />
            38.08 pts.
          </strong>
        </div>

        <div className="hero-card__cards">
          <div className="hero-mini hero-list">
            <div className="hero-list__row hero-list__row--stacked">
              <span>
                <b>Group wins</b>
                <small>Iraq 3-0 · Senegal 2-1</small>
              </span>
              <strong>21.60</strong>
            </div>
            <div className="hero-list__row hero-list__row--stacked">
              <span>
                <b>Group draw</b>
                <small>France 1-1</small>
              </span>
              <strong>4.00</strong>
            </div>
            <div className="hero-list__row hero-list__row--stacked">
              <span>
                <b>Round of 32</b>
                <small>won 1-0</small>
              </span>
              <strong>12.48</strong>
            </div>
            <div className="hero-list__row hero-list__row--total">
              <span>Total points</span>
              <strong>38.08</strong>
            </div>
          </div>

          <p className="hero-formula">3 group games + 1 knockout · Norway ×1.6</p>
          <a className="hero-cta" href="#pick">
            Start picking
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Photo poster: the referral / invite rewards.
function InvitePoster() {
  return (
    <section className="hero-card hero-card--invite" aria-label="Invite a friend">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />
      <div className="hero-card__content">
        <div className="hero-card__top">
          <span className="hero-edition">
            <span className="hero-edition__dot" aria-hidden="true" />
            INVITE A FRIEND
          </span>
        </div>

        <div className="hero-card__center hero-poster__lede">
          <strong>
            Invite.
            <br />
            Earn a cut.
          </strong>
        </div>

        <div className="hero-card__cards">
          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Gift size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Earn 5%</strong>
              <small>
                If you were invited, keep the <b>5%</b> cut on friends you invite.
              </small>
            </span>
          </div>

          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Percent size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Earn 3%</strong>
              <small>
                Signed up direct? Still earn <b>3%</b> of your invites&#39; winnings.
              </small>
            </span>
          </div>

          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <TrendingUp size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Track them</strong>
              <small>Follow your invited friends&#39; spots on the leaderboard.</small>
            </span>
          </div>

          <a className="hero-cta" href="#invite">
            Invite a friend
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Photo poster: the agent-ticket deal.
function AgentDealPoster() {
  return (
    <section className="hero-card hero-card--agent" aria-label="Agent Deal">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />
      <div className="hero-card__content">
        <div className="hero-card__top">
          <span className="hero-edition">
            <span className="hero-edition__dot" aria-hidden="true" />
            AGENT DEAL
          </span>
        </div>

        <div className="hero-card__center hero-poster__lede">
          <strong>
            10 paid.
            <br />1 free.
          </strong>
        </div>

        <div className="hero-card__cards">
          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Ticket size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Sell ticket codes</strong>
              <small>Players redeem a code for one entry ticket.</small>
            </span>
          </div>

          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Gift size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Free commission code</strong>
              <small>Every 10 paid codes earns 1 extra ticket code.</small>
            </span>
          </div>

          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Users size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Track in Wallet</strong>
              <small>See available, redeemed, and commission codes.</small>
            </span>
          </div>

          <Link className="hero-cta" href={{ pathname: "/wallet" }}>
            Open Agent Codes
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Photo poster: the final join / login call to action, with live
// prize-pool and player-count stat cards.
function LoginPoster({ prizePool, playerCount }: { prizePool?: string; playerCount?: number }) {
  return (
    <section className="hero-card hero-card--login" aria-label="Login or register">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />
      <div className="hero-card__content">
        <div className="hero-card__top">
          <span className="hero-edition">
            <span className="hero-edition__dot" aria-hidden="true" />
            GET STARTED
          </span>
        </div>

        <div className="hero-card__center hero-poster__lede">
          <strong>
            Join the
            <br />
            game.
          </strong>
        </div>

        <div className="hero-card__cards">
          <div className="hero-login-stats">
            <div className="hero-mini hero-stat hero-stat--gold">
              <span>Prize pool</span>
              <strong>{prizePool ?? "TBA"}</strong>
            </div>
            <div className="hero-mini hero-stat">
              <span>Players</span>
              <strong>{playerCount != null ? playerCount.toLocaleString() : "—"}</strong>
            </div>
          </div>

          <p className="hero-formula">Sign in with Google — one tap, no password</p>

          <Link className="hero-cta" href={{ pathname: "/login" }}>
            Login / Register
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
