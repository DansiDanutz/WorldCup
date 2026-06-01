# GitHub Organization

This repository is organized for a clean first GitHub push.

## Recommended Branches

Use:

```text
main
```

for the stable project state.

Use feature branches for future changes:

```text
codex/worldcup-ui
codex/result-cron
codex/admin-results
```

## Recommended First Commit

Use a Lore-style commit message:

```text
Establish the WorldCup scoring foundation

The project starts as a Supabase-backed team-picking leaderboard game.
This adds the tournament data model, fixed team/stage coefficients,
all 104 World Cup 2026 matches, cron-ready kickoff timestamps, and
a durable award ledger for safe leaderboard scoring.

Constraint: Must preserve the existing Games Supabase tables
Constraint: Team coefficients stay fixed for tournament fairness
Rejected: Reuse generic tournament tables | football scoring would become unclear and risky
Confidence: high
Scope-risk: moderate
Directive: Do not change team coefficients after the first match starts
Tested: Supabase migration applied; row counts verified for 48 teams, 7 stages, 104 matches
Not-tested: External result API integration is not implemented yet
```

## Before Push

Run:

```bash
node --check scripts/generate-worldcup-sql.mjs
node --check scripts/generate-worldcup-kickoff-sql.mjs
supabase migration list --linked
```

## What Not To Commit

Do not commit:

- `.env`
- Supabase temporary metadata
- local logs
- generated secrets

The `.gitignore` file already excludes those paths.

