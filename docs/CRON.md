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

In the web app, the cron endpoint supports both `GET` and `POST`:

```http
GET /api/cron/results
Authorization: Bearer <CRON_SECRET>
```

If an external result API is configured, set:

```text
RESULT_API_URL
RESULT_API_KEY
```

The endpoint passes `match_number` as a query parameter to the configured result API.

## Result Provider Contract

`RESULT_API_URL` should return `404` when a match result is not official yet.

When the result is official, return JSON in this shape:

```json
{
  "finishMethod": "90",
  "homeGoals90": 2,
  "awayGoals90": 1,
  "homeGoalsTotal": 2,
  "awayGoalsTotal": 1,
  "homePenalties": null,
  "awayPenalties": null,
  "winner": "home"
}
```

Allowed `finishMethod` values:

| Value | Meaning |
| --- | --- |
| `90` | Finished in normal time |
| `extra_time` | Finished after extra time |
| `penalties` | Finished after penalties |

Allowed `winner` values:

| Value | Meaning |
| --- | --- |
| `home` | Home team won |
| `away` | Away team won |
| `draw` | Group-stage draw |

The provider may return `winnerTeamId` instead of `winner`, but `winner` is preferred because it keeps the external feed independent from Supabase internal IDs.

The app validates provider data before awarding points:

- scores must be non-negative integers
- total goals cannot be lower than 90-minute goals
- 90-minute results must have equal 90-minute and total scores
- extra-time results must have a winner
- penalty results must be tied before penalties and have a shootout winner
- provider winner must not conflict with the score
- resolved winner must be one of the match teams when those teams are known

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

Or through the web app:

```http
GET /api/cron/apply
Authorization: Bearer <CRON_SECRET>
```

## Production Leaderboard

Use:

```sql
select *
from public.worldcup_awarded_leaderboard
order by leaderboard_rank;
```
