# Results & Leaderboard Runbook

How match results flow into points and the leaderboard for **every** user
(free `committed` + paid `locked`), and what an operator must do for the live
tournament. Pipeline reference: `docs/SCORING.md`,
`src/app/api/cron/results/route.ts`, `src/app/api/cron/apply/route.ts`,
`src/app/api/admin/results/route.ts`.

## How scoring works (already built & deployed)

1. A match result is saved to `worldcup_matches` (`status='completed'`).
2. `worldcup_apply_match_points(match_id)` writes per-team points into
   `worldcup_entry_match_points` for **all** draft/committed/locked entries.
3. The leaderboard **views** (`worldcup_awarded_leaderboard` = paid prize board,
   `worldcup_public_leaderboard` = free+paid community board) recompute live — no
   refresh job needed. Points = `base × team_coefficient × stage_coefficient`.

Two Vercel crons drive this automatically (`vercel.json`):
- `/api/cron/results` — hourly: fetch results for due matches → apply points.
- `/api/cron/apply` — hourly at :30: idempotent backfill for any completed match
  whose points were not yet applied.

## Operator prerequisites for the LIVE tournament

Merging/deploying code does **not** do these — verify each in **Admin → Readiness**:

| # | Prerequisite | Why | How |
|---|---|---|---|
| 1 | **Migrations applied to prod** | Deploy does not run them | `supabase db push` (incl. `20260613100000_worldcup_public_free_leaderboard.sql`) |
| 2 | **`CRON_SECRET`** set in Vercel | Authorizes the scheduled crons | Vercel → Project → Env |
| 3 | **`RESULT_API_URL`** (+ optional `RESULT_API_KEY`) | Without it `cron/results` ingests nothing | Vercel env, see contract below |
| 4 | **`ADMIN_RESULT_SECRET`** set in Vercel | Break-glass for manual entry / the script | Vercel env |

> If the live leaderboard shows everyone at **0.00** and "tournament not started",
> it means no results have been ingested yet (most often #3 unset, or the matches
> genuinely have not kicked off yet in real time).

## Path A — automatic feed (`RESULT_API_URL`)

`src/lib/result-provider.ts` calls `GET ${RESULT_API_URL}?match_number=<n>` with
`Authorization: Bearer ${RESULT_API_KEY}` (if set) and expects JSON:

```jsonc
{
  "finishMethod": "90" | "extra_time" | "penalties",
  "homeGoals90": 1, "awayGoals90": 0,
  "homeGoalsTotal": 1, "awayGoalsTotal": 0,
  "homePenalties": null, "awayPenalties": null,
  "winnerTeamId": null   // optional; resolved/validated against the match teams
}
```
- Return **HTTP 404** for a match that has not finished yet (treated as "not found").
- Point `RESULT_API_URL` at any provider/adapter that returns this shape keyed by
  `match_number`. The hourly cron then ingests + scores with no manual step.

## Path B — manual entry (script)

Use when there is no feed. Set `ADMIN_RESULT_SECRET` in prod, then:

```bash
BASE_URL=https://worldcup26.world \
ADMIN_RESULT_SECRET=*** \
CRON_SECRET=*** \
  node scripts/enter-results.mjs results.json
```

`results.json` is an array of operator-provided real results (one per played
match). `matchId` is the `worldcup_matches` UUID (from the Admin console or the
table). The script posts each to `/api/admin/results` (which applies points
immediately) and then triggers `/api/cron/apply` to backfill. See the script
header for the exact entry shape. **Only enter results for matches that have
actually been played.**

## Verify

- **Admin → Readiness** — confirms migrations, `CRON_SECRET`, and view presence.
- Live leaderboard (`/` dashboard, or `/api/me/standing`) shows non-zero totals
  for users whose picked teams have completed matches.
- Re-running is safe: `worldcup_apply_match_points` upserts; `/api/cron/apply`
  is idempotent.
