import { ArrowLeft, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { formatCoefficient } from "@/lib/scoring";
import { getTeamCoefficientData } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team Coefficients | WorldCup",
  description: "Full list of fixed WorldCup team coefficients.",
};

export default async function CoefficientsPage() {
  const teams = await getTeamCoefficientData();

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Trophy size={20} />
          </span>
          <span>WorldCup</span>
        </Link>
        <nav className="nav" aria-label="Coefficient navigation">
          <Link href="/">
            <ArrowLeft size={16} />
            Back
          </Link>
          <Link href="/#rules">Rules</Link>
        </nav>
      </header>

      <div className="page">
        <section className="coefficients-hero">
          <div>
            <p className="eyebrow">Fixed tournament multipliers</p>
            <h1>Team Coefficients</h1>
            <p>
              Favorites carry a lower multiplier. The most favored teams start at 1.00, while the
              biggest underdogs can reach 3.00. These coefficients stay fixed for the whole
              competition.
            </p>
          </div>
          <div className="coefficient-summary">
            <span>{teams.length} teams</span>
            <strong>1.00 to 3.00</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Full List</h2>
              <p className="panel-subtitle">Sorted from strongest favorites to biggest underdogs.</p>
            </div>
          </div>
          <div className="coefficient-table" role="table" aria-label="Team coefficients">
            <div className="coefficient-table-head" role="row">
              <span role="columnheader">Team</span>
              <span role="columnheader">Group</span>
              <span role="columnheader">Confederation</span>
              <span role="columnheader">Coefficient</span>
              <span role="columnheader">Odds</span>
            </div>
            {teams.map((team) => (
              <div className="coefficient-table-row" key={team.id} role="row">
                <strong role="cell">{team.name}</strong>
                <span role="cell">{team.group_code ?? "-"}</span>
                <span role="cell">{team.confederation}</span>
                <span className="coefficient-value" role="cell">
                  {formatCoefficient(team.reward_coefficient)}
                </span>
                <span className="odds-value" role="cell">{team.winner_odds ?? "-"}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
