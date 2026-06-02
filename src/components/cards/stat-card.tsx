import type { LucideIcon } from "lucide-react";

export type StatCardTone = "green" | "gold" | "red" | "neutral";

export type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: StatCardTone;
};

export function StatCard({ label, value, hint, icon: Icon, tone = "green" }: StatCardProps) {
  return (
    <article className={`wc-card metric-card tone-${tone}`}>
      <div className="metric-card-head">
        <span className="metric-label">{label}</span>
        {Icon ? (
          <span className="metric-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <div className="metric-value">{value}</div>
      {hint ? <div className="metric-hint">{hint}</div> : null}
    </article>
  );
}
