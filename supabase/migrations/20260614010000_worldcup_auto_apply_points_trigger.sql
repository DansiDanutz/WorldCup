-- Automatic point updates the moment a match ends.
--
-- As soon as a match row is marked status='completed' (by ANY path — the admin
-- results route, the cron, or a direct result write from a simple operator
-- tool), this trigger applies points to every entry (free `committed` + paid
-- `locked`) via the existing idempotent worldcup_apply_match_points(). The
-- leaderboard views recompute live, so standings update with no manual step and
-- without waiting for the hourly cron. The /api/cron/* routes remain as a
-- safety net and as the external-results fetcher.
--
-- Recursion safety: worldcup_apply_match_points() writes
-- worldcup_matches.points_applied_at, but this trigger is scoped to UPDATE OF
-- the result columns only (points_applied_at is deliberately NOT in that list),
-- so that follow-up write cannot re-fire the trigger. Scoping to the result
-- columns (rather than a points_applied_at IS NULL guard) also means a later
-- score correction re-applies points automatically.

create or replace function public.worldcup_auto_apply_points_on_complete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.worldcup_apply_match_points(new.id);
  return new;
end;
$$;

drop trigger if exists worldcup_apply_points_on_complete on public.worldcup_matches;

create trigger worldcup_apply_points_on_complete
after insert or update of
  status,
  finish_method,
  home_goals_90,
  away_goals_90,
  home_goals_total,
  away_goals_total,
  home_penalties,
  away_penalties,
  winner_team_id
on public.worldcup_matches
for each row
when (new.status = 'completed')
execute function public.worldcup_auto_apply_points_on_complete();

-- Backfill: apply points for any match already completed before this trigger
-- existed, so the leaderboard is correct immediately after `supabase db push`.
do $$
declare
  m record;
begin
  for m in
    select id from public.worldcup_matches where status = 'completed'
  loop
    perform public.worldcup_apply_match_points(m.id);
  end loop;
end;
$$;
