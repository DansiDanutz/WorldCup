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

### `worldcup_stages`

Stores stage coefficients.

### `worldcup_teams`

Stores team metadata and fixed reward coefficients.

### `worldcup_matches`

Stores all 104 matches, kickoff data, match result fields, and point application state.

### `worldcup_entries`

Stores one leaderboard entry per player.

### `worldcup_entry_teams`

Stores the 3 selected teams for an entry.

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

This should be the production leaderboard once cron jobs are running.

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
