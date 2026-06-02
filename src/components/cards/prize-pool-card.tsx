import { CircleDollarSign, Trophy, Users } from "lucide-react";

import { formatPrizeAmount } from "@/lib/prize-pool";

export type PrizePoolCardProps = {
  amount: number | string;
  /** Currency symbol shown before the amount. */
  currency?: string;
  label?: string;
  paidPlaces?: number;
  participants?: number;
  feePercent?: number | string;
  note?: string;
};

export function PrizePoolCard({
  amount,
  currency = "$",
  label = "Prize Pool",
  paidPlaces,
  participants,
  feePercent,
  note,
}: PrizePoolCardProps) {
  return (
    <article className="wc-card prize-card" aria-label={`${label}: ${currency}${formatPrizeAmount(amount)}`}>
      <span className="wc-card-eyebrow gold">
        <CircleDollarSign size={13} aria-hidden="true" />
        {label}
      </span>

      <div className="prize-amount">
        <span className="currency">{currency}</span>
        <strong>{formatPrizeAmount(amount)}</strong>
      </div>

      <div className="prize-meta">
        {typeof paidPlaces === "number" ? (
          <span className="prize-chip">
            <Trophy size={13} aria-hidden="true" />
            Top <strong>{paidPlaces}</strong> paid
          </span>
        ) : null}
        {typeof participants === "number" ? (
          <span className="prize-chip">
            <Users size={13} aria-hidden="true" />
            <strong>{new Intl.NumberFormat("en").format(participants)}</strong> players
          </span>
        ) : null}
        {feePercent != null ? (
          <span className="prize-chip">
            Net of <strong>{feePercent}%</strong> fee
          </span>
        ) : null}
      </div>

      {note ? <p className="prize-note">{note}</p> : null}
    </article>
  );
}
