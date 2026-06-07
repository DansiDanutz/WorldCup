-- Free draft scoring: players can save picks without paying, keep a private
-- point preview, then enter the public paid leaderboard only after a ticket
-- locks the draft.

create or replace function public.worldcup_apply_match_points(target_match_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  if not exists (
    select 1
    from public.worldcup_matches
    where id = target_match_id
      and status = 'completed'
  ) then
    return 0;
  end if;

  insert into public.worldcup_entry_match_points (
    entry_id,
    match_id,
    team_id,
    result_base_points,
    goal_bonus_points,
    clean_sheet_bonus_points,
    base_points,
    team_coefficient,
    stage_coefficient,
    final_points
  )
  select
    et.entry_id,
    mtp.match_id,
    mtp.team_id,
    mtp.result_base_points,
    mtp.goal_bonus_points,
    mtp.clean_sheet_bonus_points,
    mtp.base_points,
    mtp.team_coefficient,
    mtp.stage_coefficient,
    mtp.final_points
  from public.worldcup_match_team_points mtp
  join public.worldcup_entry_teams et on et.team_id = mtp.team_id
  join public.worldcup_entries e on e.id = et.entry_id and e.tournament_id = mtp.tournament_id
  where mtp.match_id = target_match_id
    and e.status in ('draft', 'locked')
  on conflict (entry_id, match_id, team_id) do update set
    result_base_points = excluded.result_base_points,
    goal_bonus_points = excluded.goal_bonus_points,
    clean_sheet_bonus_points = excluded.clean_sheet_bonus_points,
    base_points = excluded.base_points,
    team_coefficient = excluded.team_coefficient,
    stage_coefficient = excluded.stage_coefficient,
    final_points = excluded.final_points,
    awarded_at = now();

  get diagnostics affected_rows = row_count;

  update public.worldcup_matches
  set points_applied_at = now()
  where id = target_match_id;

  return affected_rows;
end;
$$;

do $$
declare
  match_record record;
begin
  for match_record in
    select id
    from public.worldcup_matches
    where status = 'completed'
  loop
    perform public.worldcup_apply_match_points(match_record.id);
  end loop;
end;
$$;

revoke execute on function public.worldcup_apply_match_points(uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_apply_match_points(uuid)
  to service_role;
