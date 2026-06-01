import Link from "next/link";

import { MINIMUM_AGE } from "@/lib/consent";

export const metadata = {
  title: "Terms & Conditions · WorldCup",
};

export default function TermsPage() {
  return (
    <main className="app-shell">
      <div className="page">
        <article className="panel" style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 className="panel-title">Terms &amp; Conditions</h1>
          <p className="panel-subtitle">
            Placeholder pending legal review. Do not treat this as final, binding terms.
          </p>
          <div className="rules-content">
            <p>
              WorldCup is a paid-entry prize competition. By creating an entry you confirm that you
              are at least {MINIMUM_AGE} years old, that participation is legal in your jurisdiction,
              and that you accept these Terms and the{" "}
              <Link className="inline-link" href={{ pathname: "/privacy" }}>
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              Entry tickets, the internal wallet, and prize payouts are operated by the tournament
              organizer. Prize settlement follows the published payout structure. The organizer may
              void entries that breach these Terms.
            </p>
            <p>
              The full Terms — including eligibility, refunds, responsible-gaming controls, dispute
              resolution, and jurisdiction-specific clauses — must be completed with qualified legal
              counsel before accepting real money. See the project compliance checklist.
            </p>
          </div>
          <Link className="button secondary" href={{ pathname: "/" }}>
            Back to game
          </Link>
        </article>
      </div>
    </main>
  );
}
