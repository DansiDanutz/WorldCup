# WorldCup

WorldCup is a team-picking leaderboard game for the FIFA World Cup 2026.

Each user chooses exactly **3 teams** before the tournament starts. Those teams earn points after every match they play. The user's leaderboard score is the sum of the points earned by their selected teams.

## Application

The repository now includes a Next.js app with:

- team selection workflow
- leaderboard
- signed-in account status for tickets and internal wallet balance
- match schedule
- full tournament schema from group stage to final
- admin result fallback
- cron endpoints for result ingestion and point application
- responsive layouts for mobile, tablet, and desktop

## Core Formula

```text
final_points =
  (result_base_points + goal_bonus_points + clean_sheet_bonus_points)
  * team_coefficient
  * stage_coefficient
```

## Current Status

Implemented in the Supabase **Games** project:

- 48 team coefficient records
- 7 competition stage coefficients
- 104 World Cup 2026 matches
- User entries with exactly 3 selected teams
- Google-only sign-in for locked entries
- Admin-assigned entry tickets with configurable ticket price
- Internal wallet transfer ledger between accounts
- Referral invite links with tiered referred-winner agreement tracking: 5% for referral-chain inviters, 3% for direct inviters
- Player-facing prize pool with paid places and weighted payout preview calculated from participation
- Admin settlement report with gross prize, referral obligation, and winner net amounts
- Hardened RLS for private entry, referral, wallet, ticket, and profile tables
- Cron-ready match timing fields
- Durable point-award ledger
- Leaderboard views

## Repository Structure

```text
docs/
  ARCHITECTURE.md
  CRON.md
  DATABASE.md
  DEPLOYMENT.md
  GITHUB.md
  IMPLEMENTATION_PLAN.md
  SCORING.md
src/
  app/
  components/
  lib/
tests/
  result-validation.test.ts
scripts/
  generate-worldcup-sql.mjs
  generate-worldcup-kickoff-sql.mjs
supabase/
  migrations/
    20260524094443_games_project_baseline.sql
    20260601193000_worldcup_game.sql
    20260601194500_worldcup_kickoff_cron_points.sql
    20260601211500_worldcup_due_match_team_ids.sql
    20260601224500_worldcup_team_pick_cutoff.sql
```

## Supabase Project

The local workspace is linked to the Supabase project named **Games**.

Project ref:

```text
lxhjfdxowpxzrybxdasi
```

## Main Database Objects

- `worldcup_tournaments`
- `worldcup_stages`
- `worldcup_teams`
- `worldcup_matches`
- `worldcup_entries`
- `worldcup_entry_teams`
- `worldcup_referral_profiles`
- `worldcup_referrals`
- `worldcup_tickets`
- `worldcup_wallet_transactions`
- `worldcup_entry_match_points`
- `worldcup_match_team_points`
- `worldcup_entry_team_totals`
- `worldcup_leaderboard`
- `worldcup_awarded_leaderboard`

The production leaderboard view returns selected teams in Pick 1/2/3 order and includes each
team's awarded point contribution.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Scoring Rules](docs/SCORING.md)
- [Database Schema](docs/DATABASE.md)
- [Cron Workflow](docs/CRON.md)
- [Deployment](docs/DEPLOYMENT.md)
- [GitHub Organization](docs/GITHUB.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)

## Development Commands

Regenerate the base WorldCup migration:

```bash
node scripts/generate-worldcup-sql.mjs
```

Regenerate the kickoff/cron migration:

```bash
node scripts/generate-worldcup-kickoff-sql.mjs
```

Check migration history:

```bash
supabase migration list --linked
```

Run the web app:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Run verification before shipping changes:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Required runtime values:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_RESULT_SECRET
CRON_SECRET
```

Server routes that use `SUPABASE_SERVICE_ROLE_KEY` must only run on trusted server infrastructure.
Private player/account tables are not directly readable or writable with the browser anon key; user
entry creation, admin reports, ticket assignment, and wallet transfers go through server routes.

## Data Sources

- FIFA World Cup 2026 official schedule page
- WorldCuply 104-match fixture list
- Public outright-winner market odds used as the baseline for team reward coefficients

The coefficients are intentionally stored as fixed tournament values so the game remains fair after the competition begins.
