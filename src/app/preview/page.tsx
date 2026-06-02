import {
  ArrowLeft,
  CalendarClock,
  CircleCheck,
  Globe,
  Trophy,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SmartMenu } from "@/components/smart-menu";
import {
  FixtureCard,
  PayoutCard,
  PlayerCard,
  PrizePoolCard,
  StatCard,
  type FixtureCardProps,
  type PlayerCardProps,
} from "@/components/cards";
import {
  calculateNetPrizePool,
  calculatePaidPlaces,
  calculatePayoutPlan,
} from "@/lib/prize-pool";

export const metadata: Metadata = {
  title: "Card Library | WorldCup",
  description: "Preview of the reusable WorldCup design-system cards.",
};

const fixtures: Array<{ caption: string; props: FixtureCardProps }> = [
  {
    caption: "Completed · 90 minutes",
    props: {
      matchNumber: 1,
      stageName: "Group Stage",
      groupCode: "A",
      kickoff: "2026-06-11T20:00:00Z",
      venue: "Estadio Azteca",
      city: "Mexico City",
      status: "completed",
      finishMethod: "90",
      home: { name: "Mexico", flag: "🇲🇽", score: 3 },
      away: { name: "Croatia", flag: "🇭🇷", score: 1 },
    },
  },
  {
    caption: "Completed · penalty shoot-out",
    props: {
      matchNumber: 76,
      stageName: "Round of 16",
      kickoff: "2026-07-01T19:00:00Z",
      venue: "MetLife Stadium",
      city: "New York",
      status: "completed",
      finishMethod: "penalties",
      penaltyScore: { home: 4, away: 2 },
      winner: "home",
      home: { name: "Brazil", flag: "🇧🇷", score: 1 },
      away: { name: "Spain", flag: "🇪🇸", score: 1 },
    },
  },
  {
    caption: "Completed · after extra time",
    props: {
      matchNumber: 80,
      stageName: "Round of 16",
      kickoff: "2026-07-03T23:00:00Z",
      venue: "Hard Rock Stadium",
      city: "Miami",
      status: "completed",
      finishMethod: "extra_time",
      winner: "away",
      home: { name: "Portugal", flag: "🇵🇹", score: 1 },
      away: { name: "Uruguay", flag: "🇺🇾", score: 2 },
    },
  },
  {
    caption: "Kicks off soon",
    props: {
      matchNumber: 51,
      stageName: "Group Stage",
      groupCode: "F",
      kickoff: "2026-06-24T18:00:00Z",
      venue: "AT&T Stadium",
      city: "Dallas",
      status: "due",
      home: { name: "France", flag: "🇫🇷" },
      away: { name: "Germany", flag: "🇩🇪" },
    },
  },
  {
    caption: "Scheduled",
    props: {
      matchNumber: 64,
      stageName: "Group Stage",
      groupCode: "D",
      kickoff: "2026-06-27T22:00:00Z",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      status: "scheduled",
      home: { name: "United States", flag: "🇺🇸" },
      away: { name: "Netherlands", flag: "🇳🇱" },
    },
  },
  {
    caption: "Scheduled · monogram fallback",
    props: {
      matchNumber: 99,
      stageName: "Quarter-final",
      kickoff: "2026-07-10T23:00:00Z",
      venue: "Mercedes-Benz Stadium",
      city: "Atlanta",
      status: "scheduled",
      home: { name: "Argentina" },
      away: { name: "England" },
    },
  },
];

const players: PlayerCardProps[] = [
  {
    rank: 1,
    name: "Alex Morgan",
    totalPoints: 248.5,
    teams: [
      { name: "Brazil", coefficient: 1.0, points: 96.0 },
      { name: "France", coefficient: 1.1, points: 88.5 },
      { name: "Mexico", coefficient: 1.6, points: 64.0 },
    ],
  },
  {
    rank: 2,
    name: "Diego Hernández",
    totalPoints: 232.0,
    teams: [
      { name: "Argentina", coefficient: 1.05, points: 102.0 },
      { name: "Spain", coefficient: 1.2, points: 78.0 },
      { name: "Croatia", coefficient: 2.1, points: 52.0 },
    ],
  },
  {
    rank: 3,
    name: "Yuki Tanaka",
    totalPoints: 221.75,
    teams: [
      { name: "Portugal", coefficient: 1.25, points: 90.5 },
      { name: "Netherlands", coefficient: 1.4, points: 71.25 },
      { name: "Japan", coefficient: 2.4, points: 60.0 },
    ],
  },
  {
    rank: 7,
    name: "Sam Carter",
    totalPoints: 184.2,
    teams: [
      { name: "England", coefficient: 1.15, points: 80.2 },
      { name: "Uruguay", coefficient: 1.9, points: 58.0 },
      { name: "Morocco", coefficient: 2.6, points: 46.0 },
    ],
  },
];

const GROSS_PRIZE_POOL = 100000;
const FEE_PERCENT = 20;
const PARTICIPANTS = 1284;

export default function PreviewPage() {
  const netPrizePool = calculateNetPrizePool(GROSS_PRIZE_POOL, FEE_PERCENT);
  const paidPlaces = calculatePaidPlaces(PARTICIPANTS);
  const payoutPlan = calculatePayoutPlan(netPrizePool, paidPlaces);

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Trophy size={20} />
          </span>
          <span>WorldCup</span>
        </Link>
        <SmartMenu>
          <nav className="nav nav--app" aria-label="Preview navigation">
            <Link className="nav-item nav-item--primary" href="/">
              <ArrowLeft size={16} />
              <span className="nav-item__copy">
                <strong>Back</strong>
                <small>Pick teams</small>
              </span>
            </Link>
            <Link className="nav-item" href="/#leaderboard">
              <Users size={16} />
              <span className="nav-item__copy">
                <strong>Leaderboard</strong>
                <small>Ranks</small>
              </span>
            </Link>
            <Link className="nav-item" href="/#matches">
              <CalendarClock size={16} />
              <span className="nav-item__copy">
                <strong>Matches</strong>
                <small>Schedule</small>
              </span>
            </Link>
          </nav>
        </SmartMenu>
      </header>

      <div className="page">
        <section className="coefficients-hero">
          <div>
            <p className="eyebrow">Design system</p>
            <h1>Card Library</h1>
            <p>
              Reusable cards for the WorldCup app, built on the shared tokens — match fixtures,
              player leaderboard entries, and prize/stat cards. Every card is a server component and
              styled entirely with the existing design language.
            </p>
          </div>
          <div className="coefficient-summary">
            <span>3 card families</span>
            <strong>11 variants</strong>
          </div>
        </section>

        <section className="preview-section" aria-labelledby="fixtures-heading">
          <div className="preview-section-head">
            <h2 id="fixtures-heading">Match fixture cards</h2>
            <p>
              Two-team fixtures with stage, group, kickoff, and venue. The status pill and center
              divider adapt to the match state, the winning side is highlighted, and teams fall back
              to an initials monogram when no flag is supplied.
            </p>
          </div>
          <div className="preview-grid">
            {fixtures.map((fixture) => (
              <div className="preview-item" key={fixture.props.matchNumber}>
                <span className="preview-caption">{fixture.caption}</span>
                <FixtureCard {...fixture.props} />
              </div>
            ))}
          </div>
        </section>

        <section className="preview-section" aria-labelledby="players-heading">
          <div className="preview-section-head">
            <h2 id="players-heading">Player leaderboard cards</h2>
            <p>
              A ranked player with total points and their three picks in pick-order colors. The top
              three ranks earn gold, silver, and bronze treatments; the leader gets a crown and a
              warm gold wash.
            </p>
          </div>
          <div className="preview-grid players">
            {players.map((player) => (
              <PlayerCard key={player.rank} {...player} />
            ))}
          </div>
        </section>

        <section className="preview-section" aria-labelledby="stats-heading">
          <div className="preview-section-head">
            <h2 id="stats-heading">Prize &amp; stat cards</h2>
            <p>
              Compact tournament metrics in four tones, the headline prize pool, and the weighted
              payout ladder — driven by the same <code>prize-pool</code> helpers the live app uses.
            </p>
          </div>

          <div className="preview-grid metrics">
            <StatCard label="Teams" value={48} hint="in the final draw" icon={Globe} tone="green" />
            <StatCard
              label="Matches"
              value={104}
              hint="group stage to final"
              icon={CalendarClock}
              tone="green"
            />
            <StatCard
              label="Completed"
              value={32}
              hint="results applied"
              icon={CircleCheck}
              tone="gold"
            />
            <StatCard
              label="Players"
              value={new Intl.NumberFormat("en").format(PARTICIPANTS)}
              hint="entries locked"
              icon={Users}
              tone="neutral"
            />
          </div>

          <div className="preview-grid">
            <PrizePoolCard
              amount={netPrizePool}
              paidPlaces={paidPlaces}
              participants={PARTICIPANTS}
              feePercent={FEE_PERCENT}
              note="Net pool after the platform fee. Top placements share the pool by weighted split."
            />
            <PayoutCard rows={payoutPlan} />
          </div>
        </section>
      </div>
    </main>
  );
}
