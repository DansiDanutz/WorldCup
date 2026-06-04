import Link from "next/link";

export const metadata = {
  title: "Privacy Policy · WorldCup26",
};

export default function PrivacyPage() {
  return (
    <main className="app-shell">
      <div className="page">
        <article className="panel" style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 className="panel-title">WorldCup26 Privacy Policy</h1>
          <p className="panel-subtitle">
            Effective June 4, 2026. This policy explains what WorldCup26 collects and how
            it is used to run accounts, entries, deposits, referrals, prizes, and payouts.
          </p>
          <div className="rules-content">
            <div className="rule-block">
              <h3>Information we collect</h3>
              <p>
                WorldCup26 stores the information needed to operate the game: your Google account
                email, display name, user ID, team picks, entries, referral relationships, consent
                records, wallet ledger entries, deposit claims, saved USDT sender wallet addresses,
                age-verification status, admin audit notes, and prize records.
              </p>
            </div>
            <div className="rule-block">
              <h3>Age and identity verification</h3>
              <p>
                WorldCup26 is for adults only. If you request a withdrawal or win a prize, the
                operator asks you to send government photo identification so staff can confirm you are
                at least 18 years old before any payout. The operator reviews those documents to
                confirm your age and retains them only as long as needed to evidence the check,
                prevent fraud, and meet record-keeping obligations. The game database records only the
                review outcome (pending, verified, or rejected), the review timestamp, and an admin
                note; it does not publish your documents.
              </p>
            </div>
            <div className="rule-block">
              <h3>How we use it</h3>
              <p>
                The operator uses this information to authenticate users, prevent duplicate or
                abusive entries, verify USDT deposits, assign tickets, calculate leaderboards,
                process referrals, settle prizes, provide support, and keep auditable records.
              </p>
            </div>
            <div className="rule-block">
              <h3>Payment and blockchain data</h3>
              <p>
                Deposit claims include the network, receiving address, sending wallet address,
                transaction hash, claimed amount, verified amount, and review status. Blockchain
                transactions are public, so transaction hashes and wallet addresses may remain
                visible on external block explorers even if your WorldCup26 account is later deleted.
              </p>
            </div>
            <div className="rule-block">
              <h3>Sharing and processors</h3>
              <p>
                Data is shared only as needed to run the service, including with authentication,
                hosting, database, analytics, payment, compliance, support, or professional-service
                providers. WorldCup26 does not sell player personal information.
              </p>
            </div>
            <div className="rule-block">
              <h3>Retention and requests</h3>
              <p>
                Account and gameplay records are kept for as long as needed to operate the contest,
                resolve disputes, prevent fraud, and satisfy record-keeping obligations. You may
                request access, correction, or deletion through the operator&apos;s published support
                channel, subject to records that must be retained for security, tax, compliance, or
                audit reasons.
              </p>
            </div>
            <div className="rule-block">
              <h3>Security</h3>
              <p>
                WorldCup26 uses Google sign-in, server-side authorization, role-limited admin tools,
                and database access controls to protect account and wallet records. No internet
                service can guarantee absolute security, so users should protect their Google
                account and report suspicious activity promptly.
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
