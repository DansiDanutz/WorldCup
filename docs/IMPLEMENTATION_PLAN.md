# Implementation Plan

This plan records the current professional build order.

## Completed

- Supabase project linked to Games.
- Dedicated `worldcup_*` schema created.
- 48 teams seeded with fixed reward coefficients.
- 7 stages seeded with stage coefficients.
- 104 matches seeded.
- Timezone-aware kickoff/check timestamps added.
- Cron-safe award ledger added.
- Next.js app created.
- Pick-3 entry workflow implemented.
- Leaderboard implemented.
- Admin result fallback implemented.
- Cron endpoints implemented.
- Responsive mobile/tablet/desktop layout pass implemented.
- Vercel deployment configuration and health check implemented.
- Google-only referral invite flow implemented.
- Admin referral agreement report implemented.
- Dedicated login/register page with referral-code resolution implemented.
- Admin ticket assignment, ticket price, and internal wallet transfer ledger implemented.

## Hardening & completeness pass (see docs/AUDIT.md)

- Row-Level Security hardened: removed public PII reads and public INSERTs.
- Atomic, ticket-gated entry creation via `worldcup_create_entry`.
- Race-safe wallet transfers via `worldcup_wallet_transfer`.
- Prize payout settlement via `worldcup_settle_payouts` + `worldcup_payouts`.
- Full knockout-stage progression (incl. best-third-place allocation) with an
  admin override.
- Admin console moved to its own `/admin` route, gated by a Google email
  allowlist, with a break-glass secret header.
- Rate limiting, request validation, security headers, cron resilience and
  fetch timeouts.
- New unit tests for bracket, validation, rate limiting and admin allowlist.

## Next

1. Apply the three new migrations and set `ADMIN_EMAILS` (see docs/AUDIT.md).
2. Connect an official or trusted result API.
3. Work through `docs/COMPLIANCE.md` before accepting real money.
4. Move rate limiting to a shared store for multi-instance accuracy.
5. Add end-to-end tests for login/register, referral acceptance, ticket-gated
   entry creation, result entry, bracket advancement, and payout settlement.
6. Run usability testing on real phones before launch.
