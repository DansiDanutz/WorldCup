-- Production hardening for WorldCup server-side functions.
--
-- These functions are called only from trusted Next.js server routes using the
-- Supabase service-role key. They should not be directly executable through
-- PostgREST by anonymous or signed-in users.

alter function public.worldcup_prevent_more_than_three_picks()
  set search_path = public;

alter function public.worldcup_assert_team_pick_is_open()
  set search_path = public;

-- worldcup_finalize_entry is intentionally omitted here. It was dropped by
-- 20260602014000_worldcup_function_execution_lockdown.sql because it could lock
-- any entry by id without an ownership check. Do not grant dropped functions:
-- fresh migration replay must not fail on grant-after-drop.

revoke execute on function public.worldcup_apply_match_points(uuid)
from public, anon, authenticated;
grant execute on function public.worldcup_apply_match_points(uuid)
to service_role;

revoke execute on function public.worldcup_apply_completed_match_points()
from public, anon, authenticated;
grant execute on function public.worldcup_apply_completed_match_points()
to service_role;

revoke execute on function public.worldcup_mark_match_result_checked(uuid)
from public, anon, authenticated;
grant execute on function public.worldcup_mark_match_result_checked(uuid)
to service_role;

revoke execute on function public.worldcup_rate_limit_hit(text, integer, integer)
from public, anon, authenticated;
grant execute on function public.worldcup_rate_limit_hit(text, integer, integer)
to service_role;

-- Calculated WorldCup views are read by trusted Next.js server routes with the
-- service-role key. Mark them as invoker-safe so direct anon/authenticated
-- PostgREST access cannot bypass base-table RLS.
alter view if exists public.worldcup_leaderboard
  set (security_invoker = true);

alter view if exists public.worldcup_match_team_points
  set (security_invoker = true);

alter view if exists public.worldcup_entry_team_totals
  set (security_invoker = true);

alter view if exists public.worldcup_matches_due_for_result_check
  set (security_invoker = true);

alter view if exists public.worldcup_awarded_leaderboard
  set (security_invoker = true);

-- Legacy generic game tables live in the same Supabase project. WorldCup does
-- not use them, but public INSERT/UPDATE/DELETE policies still expose the
-- production database. Keep public reads intact for compatibility and remove
-- unauthenticated writes.
do $$
begin
  if to_regclass('public.games') is not null then
    drop policy if exists "Allow public game creation" on public.games;
    drop policy if exists "Allow public game updates" on public.games;
    drop policy if exists "Service role can insert games" on public.games;
    drop policy if exists "Service role can update games" on public.games;
  end if;

  if to_regclass('public.player_scores') is not null then
    drop policy if exists "Allow public score creation" on public.player_scores;
    drop policy if exists "Allow public score updates" on public.player_scores;
    drop policy if exists "Service role can insert scores" on public.player_scores;
  end if;

  if to_regclass('public.profiles') is not null then
    drop policy if exists "profiles_delete" on public.profiles;
    drop policy if exists "profiles_insert" on public.profiles;
    drop policy if exists "profiles_update" on public.profiles;
  end if;

  if to_regclass('public.scores') is not null then
    drop policy if exists "scores_insert" on public.scores;
    drop policy if exists "scores_update" on public.scores;
  end if;
end $$;
