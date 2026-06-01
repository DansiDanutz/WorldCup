# Cron Workflow

The cron job should check match results after each match's expected finish window.

## Timing Fields

Each match has:

| Field | Meaning |
| --- | --- |
| `venue_timezone` | IANA timezone for the venue |
| `kickoff_at` | Absolute UTC kickoff timestamp |
| `result_check_after` | Earliest time cron should check the result |
| `result_checked_at` | Last time cron checked the result |
| `points_applied_at` | Time points were awarded |

Group matches are checked 3 hours after kickoff.

Knockout matches are checked 4 hours after kickoff.

## Cron Query

Cron should start with:

```sql
select *
from public.worldcup_matches_due_for_result_check;
```

For each returned match:

1. Query the official result source.
2. If the result is not available, call:

```sql
select public.worldcup_mark_match_result_checked('<match_id>');
```

3. If the result is available, update `worldcup_matches`.
4. Apply points:

```sql
select public.worldcup_apply_match_points('<match_id>');
```

## Result Update Fields

For a completed match, set:

```sql
status = 'completed'
finish_method = '90' | 'extra_time' | 'penalties'
home_goals_90 = ...
away_goals_90 = ...
home_goals_total = ...
away_goals_total = ...
home_penalties = ...
away_penalties = ...
winner_team_id = ...
```

For group-stage draws:

```sql
status = 'completed'
finish_method = '90'
winner_team_id = null
home_goals_90 = away_goals_90
home_goals_total = home_goals_90
away_goals_total = away_goals_90
```

## Safe Retry Behavior

The award ledger uses:

```text
unique (entry_id, match_id, team_id)
```

That means cron can retry safely. If points already exist for the same entry, match, and team, the row is updated rather than duplicated.

## Bulk Apply

If results are already updated and cron only needs to apply points:

```sql
select public.worldcup_apply_completed_match_points();
```

## Production Leaderboard

Use:

```sql
select *
from public.worldcup_awarded_leaderboard
order by leaderboard_rank;
```

