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
              <h3>Nature of the game — a skill competition, not betting or gambling</h3>
              <p>
                WorldCup26 is a single-event, skill-based prediction competition run only for the
                FIFA World Cup 2026; it ends after the final. Your result depends on the teams you
                choose and the fixed, published scoring rules, not on a betting market or a wager
                against the operator or other players. The entry ticket is a fixed fee to take part in
                the competition; it is not a bet, stake, or wager, and WorldCup26 does not offer
                betting, wagering, casino, lottery, or games of chance. The in-game wallet holds entry
                funds and prizes only and is not a bank account, e-money, deposit-taking, or
                investment service.
              </p>
            </div>
            <div className="rule-block">
              <h3>Where the game is available</h3>
              <p>
                WorldCup26 is offered only to adults taking part from places where a paid skill
                competition of this kind is lawful. It is not offered to anyone located in, or
                resident of, a country or territory where such competitions are prohibited or that is
                subject to comprehensive international sanctions or embargoes. The operator may
                restrict or block access based on your location and may void entries, withhold prizes,
                and close accounts that breach this. You are responsible for making sure your
                participation is lawful where you are.
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
                operator may withhold the payout. Settlement may also require eligibility, tax, or
                payment review. The operator may correct obvious errors, void fraudulent
                entries, suspend accounts, or delay settlement while investigating account activity.
              </p>
            </div>
            <div className="rule-block">
              <h3>Entry fees and refunds</h3>
              <p>
                Entry tickets are a fixed entry fee. Once you lock an entry, the ticket is used and
                the entry fee is non-refundable, except where the operator cancels the relevant
                competition or a refund is required by law. Wallet balance that has not been used for
                an entry may be withdrawn subject to these Terms, age verification, and any published
                limits.
              </p>
            </div>
            <div className="rule-block">
              <h3>Fair play and prohibited conduct</h3>
              <p>
                To keep the competition fair you must not operate multiple or fake accounts, collude
                with other players, use bots or automation, exploit bugs, submit fraudulent deposits
                or chargebacks, or take part on behalf of someone who is ineligible. The operator may
                investigate, void affected entries, withhold or reclaim prizes, suspend or close
                accounts, and keep audit records when these rules are broken.
              </p>
            </div>
            <div className="rule-block">
              <h3>No warranties and limitation of liability</h3>
              <p>
                WorldCup26 is provided on an as-available basis without warranties of any kind. To the
                fullest extent permitted by law, the operator is not liable for indirect, incidental,
                or consequential losses, and its total liability to you for any claim relating to the
                game is limited to the entry fees you paid for the affected competition. Nothing here
                limits any rights you have under mandatory local law. You agree to cover losses the
                operator reasonably incurs because you broke these Terms or used the game unlawfully.
              </p>
            </div>
            <div className="rule-block">
              <h3>Governing terms and disputes</h3>
              <p>
                These Terms are governed by the laws applicable at the operator&apos;s principal place
                of business, and any dispute will be handled by the courts there, except where
                mandatory local law gives you the right to bring a claim elsewhere. If any part of
                these Terms is found unenforceable, the rest stays in effect.
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
