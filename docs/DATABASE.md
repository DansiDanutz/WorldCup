# Database

The database is implemented in Supabase project **Games**.

Project ref:

```text
lxhjfdxowpxzrybxdasi
```

## Migrations

### `20260601193000_worldcup_game.sql`

Creates the core WorldCup game model:

- tournament
- stages
- teams
- matches
- user entries
- selected teams
- scoring views
- leaderboard view

Seeded data:

- 48 teams
- 7 stages
- 104 matches

### `20260601194500_worldcup_kickoff_cron_points.sql`

Adds cron-ready timing and durable award storage:

- venue timezone
- absolute kickoff timestamp
- result-check timestamp
- result checked timestamp
- points applied timestamp
- award ledger
- cron helper views/functions

## Tables

### `worldcup_tournaments`

Stores tournament metadata and pick-lock configuration.

Prize pool fields:

- `prize_pool_amount`: gross amount set by the operator
- `prize_pool_fee_percent`: platform/organization fee, currently 20%
- `ticket_price_amount`: admin-set gross price used when assigning new entry tickets

The visible prize pool is calculated as gross amount minus the fee.
The fee is not shown in the player UI. Paid places are top 10 when the tournament has 100 or more
participants; otherwise paid places are the top 10% of participants, rounded up.
The payout preview uses a weighted top-10 curve: 35%, 20%, 13%, 9%, 7%, 5%, 4%, 3%, 2%, 2%.
When fewer than 10 places are paid, the same curve is truncated and normalized to 100%.
The admin settlement report applies the same payout curve and subtracts referral obligations from
the winning player's gross prize to produce an auditable net amount before any wallet transfer.

### `worldcup_stages`

Stores stage coefficients.

### `worldcup_teams`

Stores team metadata and fixed reward coefficients.

### `worldcup_matches`

Stores all 104 matches, kickoff data, match result fields, and point application state.

### `worldcup_entries`

Stores one leaderboard entry per player.
Raw entry rows are private. Public ranking data is exposed through the leaderboard views, while
entry creation goes through the server API so ticket checks cannot be bypassed from the browser.

### `worldcup_entry_teams`

Stores the 3 selected teams for an entry.
Raw pick rows are private; public pick display comes from the awarded leaderboard view.

### `worldcup_tickets`

Stores tickets assigned by admin to Google/referral profiles. A user must have one unused ticket to
lock an entry. When the entry is created, the ticket is marked with `consumed_by_entry_id` and
`consumed_at`.

### `worldcup_wallet_transactions`

Stores the internal wallet ledger. A transfer records the source user, destination user, amount,
note, timestamp, and admin-created audit metadata. This is internal accounting only; it does not move
external bank or card funds.

### `worldcup_referral_profiles`

Stores one referral code per Google-authenticated user. The app uses this code to build direct
invite links and WhatsApp share messages.

Also stores the user's latest Google email so admins can identify accounts when assigning tickets
or transferring internal wallet funds.
Profile rows are private PII. The authenticated owner can access their own profile, and admin/server
routes use the service role for account management.

### `worldcup_referrals`

Stores accepted referral relationships for the tournament. When a referred user locks an entry, the
row records the inviter, invited Google user, referral code, accepted timestamp, and the tiered referred
winner agreement.
Referral rows are private and are exposed only through authenticated user/admin server routes.

Referral payout tiers:

- 5% when the inviter joined through a referral
- 3% when the inviter joined without a referral

### `worldcup_entry_match_points`

Stores durable awarded points per entry, match, and team.

This table protects against double-counting because it has a unique constraint across:

```text
entry_id, match_id, team_id
```

## Views

### `worldcup_match_team_points`

Calculates points for each team in each completed match.

### `worldcup_entry_team_totals`

Calculates live totals for each selected team.

### `worldcup_leaderboard`

Dynamic leaderboard from current match results.

### `worldcup_awarded_leaderboard`

Ledger-based leaderboard from stored awards.

This is the production leaderboard once cron jobs are running. Its `teams` JSON is ordered by
`worldcup_entry_teams.pick_slot`, so the UI can keep Pick 1, Pick 2, and Pick 3 colors stable.
Each team object includes the selected team id, team name, fixed coefficient, and the awarded
`total_points` contributed by that team.

### `worldcup_matches_due_for_result_check`

Lists matches whose result should be checked by cron.

## Functions

### `worldcup_finalize_entry(entry_id)`

Locks a user entry after exactly 3 teams have been selected.

### `worldcup_apply_match_points(match_id)`

Awards points for one completed match to all locked entries that selected either team in that match.

### `worldcup_apply_completed_match_points()`

Awards points for every completed match that has not yet been applied.

### `worldcup_mark_match_result_checked(match_id)`

Marks a match as checked by the result cron.

## Application Access

The frontend reads public data using:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Admin and cron routes write results using:

```text
SUPABASE_SERVICE_ROLE_KEY
```

The service-role key must never be exposed to the browser.

## Hardening additions

These migrations add the security, integrity and settlement layer
(see `docs/AUDIT.md`).

### `20260602010000_worldcup_security_hardening.sql`

Removes the public PII reads and public INSERT policies. Entries, picks,
referral profiles and referrals become owner-scoped (`auth.uid()`). Widens the
entry referral-fee check to `(0, 3, 5)`.

### `20260602010500_worldcup_atomic_entry_wallet.sql`

- `worldcup_create_entry(...)` — atomic, advisory-locked, ticket-gated entry
  creation: validates and consumes a ticket, inserts the entry and 3 picks,
  locks the entry, and records the referral, all in one transaction.
- `worldcup_wallet_transfer(...)` — advisory-locked transfer that recomputes the
  sender balance and inserts the ledger row atomically, preventing double-spend.

### `20260602011000_worldcup_payout_settlement.sql`

- `worldcup_payouts` — auditable payout ledger (prize and referral rows), one
  row per recipient per place, linked to its wallet transaction.
- `worldcup_settle_payouts(tournament_id)` — idempotent settlement that splits
  each paid place into a prize credit (net of any referral owed) and a referral
  credit to the inviter, writing both to `worldcup_payouts` and
  `worldcup_wallet_transactions`. Requires the tournament to be `completed`.

### `20260602011500_worldcup_rate_limits.sql`

- `worldcup_rate_limits` + `worldcup_rate_limit_hit(key, limit, window_seconds)`
  — an atomic fixed-window counter shared across serverless instances. The app
  calls it from `enforceRateLimit` and falls back to the in-memory limiter only
  if the database is unavailable.

### Knockout progression

Knockout participants are resolved in application code (`src/lib/bracket.ts`)
from the seeded slot text and current results, then written back to
`worldcup_matches`. This runs automatically after result ingestion (cron and the
admin result form) and on demand via `/api/admin/advance-bracket`, with
`/api/admin/assign-match-teams` as a manual override.
