"use client";

import { ArrowRight, Timer } from "lucide-react";
import { useEffect, useState } from "react";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

// Live urgency strip: counts down to the first kickoff, then flips to
// "tournament live" mode (teams keep locking one by one at their own kickoff).
export function KickoffCountdown({
  kickoffAt,
  ctaHref = "#pick",
  ctaLabel = "Pick 3 teams free",
}: {
  kickoffAt: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setNow(Date.now()));
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  const kickoffTime = Date.parse(kickoffAt);
  if (!Number.isFinite(kickoffTime)) {
    return null;
  }

  const remaining = now == null ? null : kickoffTime - now;
  const live = remaining != null && remaining <= 0;

  return (
    <section
      className={`kickoff-strip${live ? " kickoff-strip--live" : ""}`}
      aria-label="World Cup countdown"
    >
      <div className="kickoff-strip__copy">
        <span className="kickoff-strip__label">
          <Timer size={15} aria-hidden="true" />
          {live ? "World Cup 2026 is live" : "World Cup 2026 kicks off in"}
        </span>
        <strong className="kickoff-strip__clock">
          {live
            ? "Teams lock at their first match"
            : remaining == null
              ? "—"
              : formatRemaining(remaining)}
        </strong>
        <small>
          {live
            ? "You can still join free with teams that have not played yet."
            : "Free entry. Every team locks at its own kickoff — pick while all 48 are open."}
        </small>
      </div>
      <a className="kickoff-strip__cta" href={ctaHref}>
        {ctaLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
