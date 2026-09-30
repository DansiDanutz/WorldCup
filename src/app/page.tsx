import { LogIn, Search, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";

import { LegendCardCollection } from "@/components/legend-card-collection";
import { LegendCardsPromo } from "@/components/legend-cards-promo";
import { PostLoginRedirectHandler } from "@/components/post-login-redirect-handler";
import { SmartMenu } from "@/components/smart-menu";

// The tournament is over, so the home page is the card album: sign in, browse the
// cards, and unlock each one by watching its video. The prediction game, wallet and
// team coefficients are no longer linked from here — their routes and data are kept
// (the Dashboard component and /play, /wallet, /coefficients still exist), they are
// just off the path a visitor from the channel walks.

// Title comes from the layout default; only the description is page-specific.
export const metadata = {
  description:
    "Collect WorldCup26 Legend cards. Every card unlocks when you watch its story — free to play, just for fun, no prizes.",
};

export default function Home() {
  return (
    <main className="app-shell predictions-shell">
      <PostLoginRedirectHandler />
      <header className="topbar predictions-topbar">
        <Link className="brand landing-brand-lockup" href="/" aria-label="WorldCup26.world home">
          <span className="brand-mark">
            <Trophy size={20} aria-hidden="true" />
          </span>
          <span className="landing-brand-copy">
            <strong>
              WorldCup26<span className="hero-brand__tld">.world</span>
            </strong>
            <small>Legends album</small>
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
                <small>All cards</small>
              </span>
            </a>
            <Link className="nav-item nav-item--identity" href={{ pathname: "/login" }}>
              <LogIn size={16} />
              <span className="nav-item__copy">
                <strong>Account</strong>
                <small>Save your cards</small>
              </span>
            </Link>
          </nav>
        </SmartMenu>
      </header>

      <div className="page predictions-page">
        <LegendCardsPromo />
        <LegendCardCollection />
      </div>
    </main>
  );
}
