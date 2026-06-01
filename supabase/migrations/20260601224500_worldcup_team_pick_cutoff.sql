-- Lock each team for new entries once its second group-stage match starts.

create or replace function public.worldcup_assert_team_pick_is_open()
returns trigger
language plpgsql
as $$
declare
  second_group_kickoff timestamptz;
begin
  select ranked.kickoff_at into second_group_kickoff
  from (
    select
      m.kickoff_at,
      row_number() over (order by m.kickoff_at) as match_index
    from public.worldcup_matches m
    join public.worldcup_entries e on e.tournament_id = m.tournament_id
    where e.id = new.entry_id
      and m.stage_id = 'group_stage'
      and (m.home_team_id = new.team_id or m.away_team_id = new.team_id)
  ) ranked
  where ranked.match_index = 2;

  if second_group_kickoff is not null and now() >= second_group_kickoff then
    raise exception 'This team can no longer be selected because its second group-stage match has started';
  end if;

  return new;
end;
$$;

drop trigger if exists worldcup_entry_teams_pick_cutoff on public.worldcup_entry_teams;
create trigger worldcup_entry_teams_pick_cutoff
before insert on public.worldcup_entry_teams
for each row execute function public.worldcup_assert_team_pick_is_open();
