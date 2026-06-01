# Audit & Remediation

This document records the full audit of the WorldCup webapp and the remediation
delivered in this change set. It is the source of truth for what was fixed,
what still requires a manual step (database migration, environment variables),
and what remains intentionally out of scope.

## Summary

The pure domain logic (scoring, prize-pool math, eligibility, result
validation) was already clean and well tested. The gaps were in **security**,
**money integrity**, and a **missing tournament feature** (knockout
progression). All three areas are addressed here.

## Findings and resolutions

### Security & privacy

| # | Finding | Resolution |
|---|---------|-----------|
| 1 | `worldcup_referral_profiles` was world-readable via the anon key, exposing every player's email. | RLS migration restricts reads to the owner (`auth.uid() = user_id`); the server reads via the service role. |
| 2 | Public `INSERT` policies on `worldcup_entries`/`worldcup_entry_teams` let the anon key bypass the ticket gate and forge entries. | Public INSERT policies dropped; entries are written only by the server through the `worldcup_create_entry` RPC. Reads restricted to the owner. |
| 3 | A single shared `ADMIN_RESULT_SECRET` typed into the public dashboard guarded results, money, tickets and emails. | New `/admin` route gated by a Google email allowlist (`ADMIN_EMAILS`). Shared secret retained only as a constant-time **break-glass** header (`x-admin-secret`). Admin UI removed from the public bundle. |
| 4 | No rate limiting. | Cross-instance limiter (Postgres `worldcup_rate_limit_hit`) applied to entries, referral resolution, and all admin routes, with the in-memory limiter as a fail-soft fallback. |
| 5 | No security headers. | `next.config.ts` sets HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. |

### Money integrity

| # | Finding | Resolution |
|---|---------|-----------|
| 6 | Knockout progression was missing — no points past the group stage. | `src/lib/bracket.ts` resolves group winners/runners-up, best-third-place allocation (bipartite matching against the seeded candidate sets), and Winner/Loser-of-match slots. Applied automatically by cron and the admin console, with a manual override endpoint. |
| 7 | Wallet transfers could double-spend (balance computed in app code, no lock). | `worldcup_wallet_transfer` RPC takes a per-account advisory lock, recomputes the balance, and inserts atomically. |
| 8 | Entry creation was a non-atomic multi-step sequence. | `worldcup_create_entry` RPC performs ticket check/consume, entry, picks, lock and referral in one transaction under an advisory lock. |
| 9 | No payout settlement. | `worldcup_settle_payouts` RPC produces an auditable `worldcup_payouts` ledger plus matching wallet credits; referred winners' inviter shares are split out. Idempotent. |
| 11 | Inconsistent referral-percent semantics (entries hardcoded to 5). | Entry/referral tiers (0/3/5) are computed in the RPC and the check constraint widened to match. |

### Robustness

| # | Finding | Resolution |
|---|---------|-----------|
| 12 | Result cron aborted the whole batch on one error. | Per-match try/catch; failures are recorded and the batch continues. |
| 13 | Result fetch had no timeout. | 10s `AbortController` timeout on the provider fetch. |
| 14 | `/api/cron/apply` was never scheduled. | Added to `vercel.json`; both crons also advance the bracket. |
| 15 | Late-entry product/impl mismatch. | The entry RPC allows `open` and `in_progress` tournaments; the per-team cutoff trigger still enforces team availability. |

### Architecture, validation, testing

- Admin console split into its own `/admin` route and client component; removed from `dashboard.tsx`.
- Input validation helpers (`src/lib/validation.ts`) applied to all mutating routes.
- New unit tests: bracket resolution, validation, rate limiting, admin allowlist (61 tests total).

## Manual steps required before this is live

1. **Apply the new migrations** to the Supabase project (in order):
   - `20260602010000_worldcup_security_hardening.sql`
   - `20260602010500_worldcup_atomic_entry_wallet.sql`
   - `20260602011000_worldcup_payout_settlement.sql`
   - `20260602011500_worldcup_rate_limits.sql`
2. **Set `ADMIN_EMAILS`** (comma-separated Google emails) in the deployment env.
3. Keep `ADMIN_RESULT_SECRET` set for break-glass access.
4. Review `docs/COMPLIANCE.md` before handling real money.

## Out of scope (tracked for later)

- Full KYC / identity verification and payment-rail integration.
- i18n and a formal accessibility audit.
- Replacing the dynamic `worldcup_leaderboard` / `worldcup_entry_team_totals`
  views (superseded by the awarded-ledger views) — left in place to avoid
  breaking any external consumers.
