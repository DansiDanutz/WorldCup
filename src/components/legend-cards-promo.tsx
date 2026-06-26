import Image from "next/image";
import Link from "next/link";

import { LEGEND_CARDS } from "@/lib/legend-cards";

import "./legend-cards-promo.css";

const FEATURED_CARD_ID = "short-gaetjens-vanished";
const STACK_SIZE = 3;

export function LegendCardsPromo() {
  const featured = LEGEND_CARDS.find((card) => card.id === FEATURED_CARD_ID) ?? LEGEND_CARDS[0];

  if (!featured) {
    return null;
  }

  const stack = LEGEND_CARDS.filter((card) => card.id !== featured.id).slice(0, STACK_SIZE);
  const totalCards = LEGEND_CARDS.length;

  return (
    <section className="legend-promo" aria-labelledby="legend-promo-title">
      <div className="legend-promo__inner">
        <div className="legend-promo__copy">
          <span className="legend-promo__eyebrow">WorldCup26 · Legendary Cards</span>
          <h2 id="legend-promo-title" className="legend-promo__title">
            Collect the legends. Unlock the stories they never told you.
          </h2>
          <p className="legend-promo__lead">
            Every legendary card hides a true, untold World Cup story — read it, hear it in the
            legend&apos;s voice, and keep it in your album. Free to collect.
          </p>
          <div className="legend-promo__actions">
            <Link className="legend-promo__cta" href="/predictions#collector-quest">
              Start collecting — free
            </Link>
            <Link className="legend-promo__ghost" href="/signup">
              Create free account
            </Link>
          </div>
          <p className="legend-promo__meta">
            <strong>{totalCards}</strong> legendary cards and counting
          </p>
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
            </div>
          </article>

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
