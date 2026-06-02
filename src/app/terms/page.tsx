import Link from "next/link";

import { MINIMUM_AGE } from "@/lib/consent";

export const metadata = {
  title: "Terms of Use · WorldCup26",
};

export default function TermsPage() {
  return (
    <main className="app-shell">
      <div className="page">
        <article className="panel" style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 className="panel-title">WorldCup26 Terms of Use</h1>
          <p className="panel-subtitle">
            Effective June 2, 2026. These terms explain the rules for accounts, entries,
            deposits, referrals, and prizes on WorldCup26.
          </p>
          <div className="rules-content">
            <div className="rule-block">
              <h3>Eligibility and accounts</h3>
              <p>
                You must be at least {MINIMUM_AGE} years old, sign in with your own Google account,
                and use WorldCup26 only where participation is lawful for you. One person may not
                operate multiple accounts to gain an advantage. By entering, you accept these Terms
                and the{" "}
                <Link className="inline-link" href={{ pathname: "/privacy" }}>
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="rule-block">
              <h3>Tickets, deposits, and wallet credits</h3>
              <p>
                Entry tickets are paid from your WorldCup26 wallet balance. USDT deposits are
                credited only after the operator verifies the transaction, network, amount, and
                receiving address. Send only the supported asset and network shown in the wallet;
                blockchain transfers are irreversible and unsupported transfers may be lost.
              </p>
            </div>
            <div className="rule-block">
              <h3>Team picks and scoring</h3>
              <p>
                Each valid entry selects three teams. A team remains selectable until its second
                group match starts, after which it locks. Points and leaderboard positions are
                calculated from official tournament results and the published coefficient rules.
              </p>
            </div>
            <div className="rule-block">
              <h3>Referrals</h3>
              <p>
                Referral rewards apply only when a referred player creates a valid entry and accepts
                the referral terms shown in the entry flow. The operator may reject self-referrals,
                duplicate accounts, abuse, chargebacks, or entries that violate these Terms.
              </p>
            </div>
            <div className="rule-block">
              <h3>Prizes and account review</h3>
              <p>
                Prize calculations follow the published prize-pool and paid-places rules. Prize
                settlement may require identity, eligibility, sanctions, tax, or payment review
                before funds are released. The operator may correct obvious errors, void fraudulent
                entries, suspend accounts, or delay settlement while investigating account activity.
              </p>
            </div>
            <div className="rule-block">
              <h3>Changes and support</h3>
              <p>
                The operator may update these Terms when product rules, payment operations, or legal
                requirements change. Material updates require users to accept the new version before
                creating another entry. For account, deposit, or prize questions, contact support
                through the operator&apos;s published support channel.
              </p>
            </div>
          </div>
          <Link className="button secondary" href={{ pathname: "/" }}>
            Back to game
          </Link>
        </article>
      </div>
    </main>
  );
}
