-- Lock each team for new entries 1 minute before its first group-stage match starts.

create or replace function public.worldcup_assert_team_pick_is_open()
returns trigger
language plpgsql
as $$
declare
  first_group_kickoff timestamptz;
  pick_lock_at timestamptz;
begin
  select m.kickoff_at into first_group_kickoff
  from public.worldcup_matches m
  join public.worldcup_entries e on e.tournament_id = m.tournament_id
  where e.id = new.entry_id
    and m.stage_id = 'group_stage'
    and (m.home_team_id = new.team_id or m.away_team_id = new.team_id)
  order by m.kickoff_at
  limit 1;

  pick_lock_at := first_group_kickoff - interval '1 minute';

  if first_group_kickoff is not null and now() >= pick_lock_at then
    raise exception 'This team can no longer be selected because its first match starts in less than one minute or already started';
  end if;

  return new;
end;
$$;

alter function public.worldcup_assert_team_pick_is_open()
  set search_path = public;
