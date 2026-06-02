import { formatPrizeAmount, type PayoutRow } from "@/lib/prize-pool";

import { podiumClass } from "./utils";

export type PayoutCardProps = {
  /** Payout ladder, typically from calculatePayoutPlan(). */
  rows: PayoutRow[];
  title?: string;
  subtitle?: string;
  currency?: string;
};

export function PayoutCard({
  rows,
  title = "Payout Ladder",
  subtitle = "Weighted split of the prize pool.",
  currency = "$",
}: PayoutCardProps) {
  return (
    <article className="wc-card payout-card" aria-label={title}>
      <div className="payout-card-head">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

      <ol className="payout-ladder">
        {rows.map((row) => {
          const podium = podiumClass(row.rank);

          return (
            <li className={`payout-tier${podium ? ` ${podium}` : ""}`} key={row.rank}>
              <span className="payout-tier-rank">{row.rank}</span>
              <span className="payout-tier-place">
                {row.rank === 1 ? "1st place" : row.rank === 2 ? "2nd place" : row.rank === 3 ? "3rd place" : `${row.rank}th place`}
                <small>{row.percent.toFixed(1)}% of pool</small>
              </span>
              <span className="payout-tier-amount">
                {currency}
                {formatPrizeAmount(row.amount)}
              </span>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
