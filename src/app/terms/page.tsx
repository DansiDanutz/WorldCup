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
            Effective June 4, 2026. These terms explain the rules for accounts, entries,
            deposits, referrals, prizes, and payouts on WorldCup26.
          </p>
          <div className="rules-content">
            <div className="rule-block">
              <h3>What WorldCup26 is</h3>
              <p>
                WorldCup26 is a skill-based prediction game for the FIFA World Cup 2026. You buy one
                entry ticket, pick three teams before they lock, and earn points from official match
                results under fixed, published scoring rules. The team coefficients, scoring formula,
                prize-pool structure, and paid places are set before the tournament begins and are
                not changed once play starts, so every participant competes under the same rules they
                accepted when they entered.
              </p>
            </div>
            <div className="rule-block">
              <h3>Eligibility and accounts</h3>
              <p>
                WorldCup26 is for adults only. You must be at least {MINIMUM_AGE} years old, sign in
                with your own Google account, and use WorldCup26 only where participation is lawful
                for you. One person may not operate multiple accounts to gain an advantage. By
                entering, you confirm you meet these requirements and accept these Terms and the{" "}
                <Link className="inline-link" href={{ pathname: "/privacy" }}>
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="rule-block">
              <h3>Entry tickets, deposits, and wallet credits</h3>
              <p>
                Each entry costs one ticket, a fixed buy-in paid from your WorldCup26 wallet balance.
                USDT deposits are credited only after the operator verifies the transaction, network,
                amount, and receiving address. Send only the supported asset and network shown in the
                wallet; blockchain transfers are irreversible and unsupported transfers may be lost.
              </p>
            </div>
            <div className="rule-block">
              <h3>Team picks and scoring</h3>
              <p>
                Each valid entry selects three teams. A team remains selectable until one minute
                before its first World Cup 2026 match starts, after which it locks. Points and
                leaderboard positions are calculated from official tournament results and the
                published coefficient rules that are fixed for the event.
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
              <h3>Prizes, payouts, and age verification (18+)</h3>
              <p>
                Prizes follow the published prize-pool and paid-places rules. Because WorldCup26 is
                for adults only, before any withdrawal or prize payout you must prove you are at least
                {" "}
                {MINIMUM_AGE} years old by sending the government photo identification the operator
                requests. Payouts are held until your age is confirmed; if it cannot be confirmed, the
                operator may withhold the payout. Settlement may also require eligibility, sanctions,
                tax, or payment review. The operator may correct obvious errors, void fraudulent
                entries, suspend accounts, or delay settlement while investigating account activity.
              </p>
            </div>
            <div className="rule-block">
              <h3>Fixed rules, changes, and support</h3>
              <p>
                The game rules in force when you enter apply to your participation for that event and
                are not changed mid-tournament. The operator may update these Terms for future events
                or when payment operations or legal requirements change; material updates require you
                to accept the new version before creating another entry. For account, deposit, payout,
                or prize questions, contact support through the operator&apos;s published support
                channel.
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
