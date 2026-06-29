import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink, Headphones, Sparkles } from "lucide-react";

import { LEGEND_CARDS } from "@/lib/legend-cards";

import "./legend-cards-promo.css";

const FEATURED_CARD_ID = "short-gaetjens-vanished";
const STACK_SIZE = 4;

const collectorSteps = [
  {
    icon: Headphones,
    title: "Listen",
    detail: "Hear the story with Brian inside the app.",
  },
  {
    icon: ExternalLink,
    title: "Watch",
    detail: "Open the exact YouTube episode when a card needs video.",
  },
  {
    icon: Sparkles,
    title: "Collect",
    detail: "Save the unlocked card to your album.",
  },
  {
    icon: Check,
    title: "Save",
    detail: "Claim the exact artefact revealed by the video.",
  },
];

export function LegendCardsPromo() {
  const featured = LEGEND_CARDS.find((card) => card.id === FEATURED_CARD_ID) ?? LEGEND_CARDS[0];

  if (!featured) {
    return null;
  }

  const stack = LEGEND_CARDS.filter((card) => card.id !== featured.id).slice(0, STACK_SIZE);
  const totalCards = LEGEND_CARDS.length;
  const seriesCount = LEGEND_CARDS.filter((card) => card.kind === "episode-special").length;
  const shortsCount = LEGEND_CARDS.filter((card) => card.kind === "did-you-know-short").length;
  const bonusCount = LEGEND_CARDS.filter((card) => card.kind === "legend-bonus").length;

  return (
    <section className="legend-promo" aria-labelledby="legend-promo-title">
      <div className="legend-promo__inner">
        <div className="legend-promo__copy">
          <span className="legend-promo__eyebrow">Main app experience</span>
          <h2 id="legend-promo-title" className="legend-promo__title">
            Collect every WorldCup26 card.
          </h2>
          <p className="legend-promo__lead">
            Every card is unique. No duplicate rewards, no reused unlocks: listen to the story,
            open the exact YouTube episode when the card asks for it, then save the same artefact
            the video revealed.
          </p>
          <div className="legend-promo__actions">
            <Link className="legend-promo__cta" href="/predictions#collector-quest">
              Start today&apos;s quest
            </Link>
            <Link className="legend-promo__ghost" href="/predictions#legend-card-grid">
              Open full album
            </Link>
          </div>
          <div className="legend-promo__stats" aria-label="Card collection totals">
            <span>
              <strong>{totalCards}</strong>
              Cards
            </span>
            <span>
              <strong>{seriesCount}</strong>
              Series
            </span>
            <span>
              <strong>{shortsCount}</strong>
              Shorts
            </span>
            <span>
              <strong>{bonusCount}</strong>
              Bonus
            </span>
          </div>
        </div>

        <div className="legend-promo__showcase">
          <article className="legend-promo__card">
            <div className="legend-promo__art">
              <Image
                src={featured.image}
                alt={`${featured.title} legendary card`}
                fill
                sizes="(max-width: 760px) 60vw, 260px"
                className="legend-promo__img"
              />
              <span className="legend-promo__badge">★ Legendary</span>
              <span className="legend-promo__shine" aria-hidden="true" />
            </div>
            <div className="legend-promo__cardbody">
              <strong className="legend-promo__cardtitle">{featured.title}</strong>
              <span className="legend-promo__cardteams">{featured.teams}</span>
              <span className="legend-promo__unique">
                <Check size={14} aria-hidden="true" />
                Unique unlock
              </span>
            </div>
          </article>

          <ol className="legend-promo__steps" aria-label="How to collect cards">
            {collectorSteps.map((step) => {
              const Icon = step.icon;

              return (
                <li key={step.title}>
                  <span aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <strong>{step.title}</strong>
                  <small>{step.detail}</small>
                </li>
              );
            })}
          </ol>

          <ul className="legend-promo__stack" aria-label="More legendary cards">
            {stack.map((card) => (
              <li key={card.id} className="legend-promo__chip">
                <span className="legend-promo__chipart">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="44px"
                    className="legend-promo__chipimg"
                  />
                </span>
                <span className="legend-promo__chiptitle">{card.title}</span>
              </li>
            ))}
            <li className="legend-promo__chip legend-promo__chip--more">
              +{Math.max(totalCards - STACK_SIZE - 1, 0)} more
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
