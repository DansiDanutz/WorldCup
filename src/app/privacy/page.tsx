import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · WorldCup",
};

export default function PrivacyPage() {
  return (
    <main className="app-shell">
      <div className="page">
        <article className="panel" style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 className="panel-title">Privacy Policy</h1>
          <p className="panel-subtitle">
            Placeholder pending legal review. Do not treat this as a final, binding policy.
          </p>
          <div className="rules-content">
            <p>
              WorldCup processes the data needed to run the competition: your Google account email
              and display name, your team picks and entry, referral relationships, ticket and wallet
              records, and a timestamped record that you confirmed your age and accepted the Terms.
            </p>
            <p>
              This data is stored in the tournament database and is accessible to the operator for
              account management, payouts, and audit. It is not sold. You may request access or
              deletion subject to the operator&apos;s record-keeping and legal obligations.
            </p>
            <p>
              The full Privacy Policy — including lawful basis, retention periods, processors, and
              data-subject rights per jurisdiction — must be completed with qualified legal counsel
              before accepting real money.
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
