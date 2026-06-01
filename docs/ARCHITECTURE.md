# Architecture

WorldCup is implemented as a Supabase-backed fantasy leaderboard game.

The application layer is a Next.js app. Public tournament data is read through the Supabase anon key. Result updates and cron operations run through server routes that use the Supabase service-role key.

## Product Model

The user does not predict every match. Instead:

1. A user enters a referral code or confirms that they do not have one.
2. A user signs in with Google.
3. The user creates an entry.
4. The user selects exactly 3 teams.
5. The selected teams earn points throughout the tournament.
6. The final user score is the sum of all awarded team points.
7. The leaderboard ranks locked entries by total score.

## Data Flow

```mermaid
flowchart TD
  Referral["Referral code + tiered agreement"] --> Auth["Google sign-in"]
  Auth --> User["User picks 3 teams"]
  User --> Entry["worldcup_entries"]
  Entry --> Picks["worldcup_entry_teams"]
  Entry --> Referrals["worldcup_referrals"]
  Match["worldcup_matches"] --> Result["Result update"]
  Result --> TeamPoints["worldcup_match_team_points"]
  Picks --> Awards["worldcup_entry_match_points"]
  TeamPoints --> Awards
  Awards --> Leaderboard["worldcup_awarded_leaderboard"]
```

## Design Principles

- Keep team coefficients fixed for the whole competition.
- Keep stage coefficients separate from team coefficients.
- Store raw match results once, then derive team points.
- Use an award ledger to avoid double-counting when cron jobs retry.
- Keep the existing generic Games tables untouched.
- Show the public prize pool as the configured gross amount minus the tournament fee.

## Supabase Layers

### Reference Data

- `worldcup_tournaments`
- `worldcup_stages`
- `worldcup_teams`
- `worldcup_matches`

### User Game Data

- `worldcup_entries`
- `worldcup_entry_teams`

### Scoring Data

- `worldcup_match_team_points`
- `worldcup_entry_match_points`
- `worldcup_entry_team_totals`
- `worldcup_leaderboard`
- `worldcup_awarded_leaderboard`

## Why Dedicated Tables

The Games project already has generic tables such as `games`, `tournaments`, and `player_scores`. WorldCup uses dedicated `worldcup_*` tables so football scoring, fixtures, coefficients, and cron processing stay clean and do not disturb existing game features.

## Web Application Routes

### `/`

Main dashboard:

- choose exactly 3 teams
- read the in-app rules and scoring formula
- open the full tournament schema from group stage to final
- lock entry
- view leaderboard
- inspect match schedule
- manually enter results through the admin fallback form

### `/login`

Dedicated login/register gate. Users enter a referral code or confirm that they do not have one before creating an account with Google. Referral codes are resolved on this page, the referred player accepts the referred-winner agreement, and then OAuth redirects back to the dashboard. Users who join through a referral can earn 5% from their own referred winners; users who join without a referral can still invite, but earn 3%.

### `/schema`

Shows all 104 matches from group stage through the final. The page includes group standings, winner/runner-up/third-place qualification paths, a knockout draw board, and detailed match rows. Completed matches display the calculated team points that are added to users who selected each team; scheduled matches show points as pending.

### `/api/entries`

Creates and locks a user entry after exactly 3 valid teams are selected. Late entries are allowed, but each selected team must still be before kickoff of its second group-stage match. The database also enforces this cutoff on `worldcup_entry_teams` inserts.

### `/api/admin/results`

Server-only result fallback. Requires `ADMIN_RESULT_SECRET` and updates one match result, then applies points for that match.

### `/api/admin/referrals`

Server-only referral report. Requires `ADMIN_RESULT_SECRET` and returns accepted referral agreements with inviter, referred entry, accepted timestamp, percentage tier, and current leaderboard position for payout auditing.

### `/api/admin/prize-pool`

Server-only prize pool update. Requires `ADMIN_RESULT_SECRET`, stores the gross prize amount on the tournament, and keeps the public prize pool calculated as gross amount minus the 20% fee.

### `/api/cron/results`

Cron endpoint. Requires `CRON_SECRET`. It checks due matches, optionally fetches results from `RESULT_API_URL`, updates completed matches, and applies points.

### `/api/cron/apply`

Cron helper endpoint. Requires `CRON_SECRET`. It applies points for all completed matches that have not yet been awarded.
