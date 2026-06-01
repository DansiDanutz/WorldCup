# WorldCup

WorldCup is a team-picking leaderboard game for the FIFA World Cup 2026.

Each user chooses exactly **3 teams** before the tournament starts. Those teams earn points after every match they play. The user's leaderboard score is the sum of the points earned by their selected teams.

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
- Cron-ready match timing fields
- Durable point-award ledger
- Leaderboard views

## Repository Structure

```text
docs/
  ARCHITECTURE.md
  CRON.md
  DATABASE.md
  GITHUB.md
  SCORING.md
scripts/
  generate-worldcup-sql.mjs
  generate-worldcup-kickoff-sql.mjs
supabase/
  migrations/
    20260601193000_worldcup_game.sql
    20260601194500_worldcup_kickoff_cron_points.sql
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
- `worldcup_entry_match_points`
- `worldcup_match_team_points`
- `worldcup_entry_team_totals`
- `worldcup_leaderboard`
- `worldcup_awarded_leaderboard`

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Scoring Rules](docs/SCORING.md)
- [Database Schema](docs/DATABASE.md)
- [Cron Workflow](docs/CRON.md)
- [GitHub Organization](docs/GITHUB.md)

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

## Data Sources

- FIFA World Cup 2026 official schedule page
- WorldCuply 104-match fixture list
- Public outright-winner market odds used as the baseline for team reward coefficients

The coefficients are intentionally stored as fixed tournament values so the game remains fair after the competition begins.
