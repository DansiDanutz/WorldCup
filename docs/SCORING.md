# Scoring Rules

## User Entry

Each user chooses exactly 3 teams.

```text
user_total_points =
  selected_team_1_points
  + selected_team_2_points
  + selected_team_3_points
```

An entry can be finalized only when exactly 3 teams are selected.

Users can still join after the tournament starts, as long as every selected team is still open for new picks.

A team becomes unavailable for new entries when its second group-stage match starts. This means a late user can join with teams that have played only their first group match, but cannot select a team whose second group match has already started.

## Final Points Formula

```text
final_points =
  base_points
  * team_coefficient
  * stage_coefficient
```

Where:

```text
base_points =
  result_base_points
  + goal_bonus_points
  + clean_sheet_bonus_points
```

## Base Points

| Result | Base Points |
| --- | ---: |
| Qualification in 90 minutes | 5 |
| Qualification after extra time | 4 |
| Qualification after penalties | 3 |
| Loses after extra time | 1 |
| Loses after penalties | 1.5 |
| Loses in 90 minutes | 0 |
| Group-stage win | 5 |
| Group-stage draw | 2 |
| Group-stage loss | 0 |
| Goal scored bonus | +0.5 per goal |
| Clean sheet in 90 minutes | +1 |

Clean sheet means the team does not concede a goal in the first 90 minutes.

## Team Coefficient

The strongest favorites have coefficient `1.00`.

The biggest underdogs have coefficient `3.00`.

Examples:

| Team | Coefficient |
| --- | ---: |
| Spain | 1.00 |
| France | 1.00 |
| England | 1.12 |
| Brazil | 1.19 |
| Japan | 1.86 |
| Ghana | 2.47 |
| Australia | 2.73 |
| Curaçao | 3.00 |
| Panama | 3.00 |

## Stage Coefficient

| Stage | Coefficient |
| --- | ---: |
| Group Stage | 1.00 |
| Round of 32 | 1.20 |
| Round of 16 | 1.35 |
| Quarter-final | 1.50 |
| Semi-final | 1.75 |
| Third-place Match | 1.25 |
| Final | 2.00 |

## Example

Curaçao wins a group match 2-0:

```text
base_points = 5 + 1.0 + 1 = 7
final_points = 7 * 3.00 * 1.00 = 21
```

Spain wins the final 2-0:

```text
base_points = 5 + 1.0 + 1 = 7
final_points = 7 * 1.00 * 2.00 = 14
```
