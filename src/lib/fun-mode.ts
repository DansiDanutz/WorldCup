// Free-play "fun mode" switch.
//
// When NEXT_PUBLIC_WORLDCUP_FUN_MODE === "true" the app runs as a FREE leaderboard:
// no USDT deposits, no withdrawals, no paid tickets, no prizes — players lock their
// picks for free and compete for bragging rights only. This is the legally-clean
// mode while real-money classification/KYC/licensing are pending (docs/LEGAL_READINESS.md).
//
// Read the same flag on server and client. NEXT_PUBLIC_ is inlined into the client
// bundle at build time, so changing it requires a redeploy.
export function isFunMode(): boolean {
  return process.env.NEXT_PUBLIC_WORLDCUP_FUN_MODE === "true";
}

// Human-readable reason returned by money endpoints while fun mode is on.
export const FUN_MODE_DISABLED_MESSAGE =
  "WorldCup26 is in free-play mode: deposits, withdrawals, and paid tickets are turned off. Lock your picks for free and climb the leaderboard.";
