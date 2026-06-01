-- Add timezone-aware kickoff data and cron-safe point awards for WorldCup.

alter table public.worldcup_matches
  add column if not exists venue_timezone text,
  add column if not exists kickoff_at timestamptz,
  add column if not exists result_check_after timestamptz,
  add column if not exists result_checked_at timestamptz,
  add column if not exists points_applied_at timestamptz;

update public.worldcup_matches m
set
  venue_timezone = seed.venue_timezone,
  kickoff_at = seed.kickoff_at::timestamptz,
  result_check_after = seed.result_check_after::timestamptz
from (
  values
('1', 'America/Mexico_City', '2026-06-11T19:00:00.000Z', '2026-06-11T22:00:00.000Z'),
('2', 'America/Mexico_City', '2026-06-12T02:00:00.000Z', '2026-06-12T05:00:00.000Z'),
('3', 'America/New_York', '2026-06-12T19:00:00.000Z', '2026-06-12T22:00:00.000Z'),
('4', 'America/Los_Angeles', '2026-06-13T01:00:00.000Z', '2026-06-13T04:00:00.000Z'),
('5', 'America/New_York', '2026-06-14T01:00:00.000Z', '2026-06-14T04:00:00.000Z'),
('6', 'America/Vancouver', '2026-06-14T04:00:00.000Z', '2026-06-14T07:00:00.000Z'),
('7', 'America/New_York', '2026-06-13T22:00:00.000Z', '2026-06-14T01:00:00.000Z'),
('8', 'America/Los_Angeles', '2026-06-13T19:00:00.000Z', '2026-06-13T22:00:00.000Z'),
('9', 'America/New_York', '2026-06-14T23:00:00.000Z', '2026-06-15T02:00:00.000Z'),
('10', 'America/Chicago', '2026-06-14T17:00:00.000Z', '2026-06-14T20:00:00.000Z'),
('11', 'America/Chicago', '2026-06-14T20:00:00.000Z', '2026-06-14T23:00:00.000Z'),
('12', 'America/Mexico_City', '2026-06-15T02:00:00.000Z', '2026-06-15T05:00:00.000Z'),
('13', 'America/New_York', '2026-06-15T22:00:00.000Z', '2026-06-16T01:00:00.000Z'),
('14', 'America/New_York', '2026-06-15T16:00:00.000Z', '2026-06-15T19:00:00.000Z'),
('15', 'America/Los_Angeles', '2026-06-16T01:00:00.000Z', '2026-06-16T04:00:00.000Z'),
('16', 'America/Los_Angeles', '2026-06-15T19:00:00.000Z', '2026-06-15T22:00:00.000Z'),
('17', 'America/New_York', '2026-06-16T19:00:00.000Z', '2026-06-16T22:00:00.000Z'),
('18', 'America/New_York', '2026-06-16T22:00:00.000Z', '2026-06-17T01:00:00.000Z'),
('19', 'America/Chicago', '2026-06-17T01:00:00.000Z', '2026-06-17T04:00:00.000Z'),
('20', 'America/Los_Angeles', '2026-06-17T04:00:00.000Z', '2026-06-17T07:00:00.000Z'),
('21', 'America/New_York', '2026-06-17T23:00:00.000Z', '2026-06-18T02:00:00.000Z'),
('22', 'America/Chicago', '2026-06-17T20:00:00.000Z', '2026-06-17T23:00:00.000Z'),
('23', 'America/Chicago', '2026-06-17T17:00:00.000Z', '2026-06-17T20:00:00.000Z'),
('24', 'America/Mexico_City', '2026-06-18T02:00:00.000Z', '2026-06-18T05:00:00.000Z'),
('25', 'America/New_York', '2026-06-18T16:00:00.000Z', '2026-06-18T19:00:00.000Z'),
('26', 'America/Los_Angeles', '2026-06-18T19:00:00.000Z', '2026-06-18T22:00:00.000Z'),
('27', 'America/Vancouver', '2026-06-18T22:00:00.000Z', '2026-06-19T01:00:00.000Z'),
('28', 'America/Mexico_City', '2026-06-19T01:00:00.000Z', '2026-06-19T04:00:00.000Z'),
('29', 'America/New_York', '2026-06-20T01:00:00.000Z', '2026-06-20T04:00:00.000Z'),
('30', 'America/New_York', '2026-06-19T22:00:00.000Z', '2026-06-20T01:00:00.000Z'),
('31', 'America/Los_Angeles', '2026-06-20T03:00:00.000Z', '2026-06-20T06:00:00.000Z'),
('32', 'America/Los_Angeles', '2026-06-19T19:00:00.000Z', '2026-06-19T22:00:00.000Z'),
('33', 'America/New_York', '2026-06-20T20:00:00.000Z', '2026-06-20T23:00:00.000Z'),
('34', 'America/Chicago', '2026-06-21T00:00:00.000Z', '2026-06-21T03:00:00.000Z'),
('35', 'America/Chicago', '2026-06-20T17:00:00.000Z', '2026-06-20T20:00:00.000Z'),
('36', 'America/Mexico_City', '2026-06-21T04:00:00.000Z', '2026-06-21T07:00:00.000Z'),
('37', 'America/New_York', '2026-06-21T22:00:00.000Z', '2026-06-22T01:00:00.000Z'),
('38', 'America/New_York', '2026-06-21T16:00:00.000Z', '2026-06-21T19:00:00.000Z'),
('39', 'America/Los_Angeles', '2026-06-21T19:00:00.000Z', '2026-06-21T22:00:00.000Z'),
('40', 'America/Vancouver', '2026-06-22T01:00:00.000Z', '2026-06-22T04:00:00.000Z'),
('41', 'America/New_York', '2026-06-23T00:00:00.000Z', '2026-06-23T03:00:00.000Z'),
('42', 'America/New_York', '2026-06-22T21:00:00.000Z', '2026-06-23T00:00:00.000Z'),
('43', 'America/Chicago', '2026-06-22T17:00:00.000Z', '2026-06-22T20:00:00.000Z'),
('44', 'America/Los_Angeles', '2026-06-23T03:00:00.000Z', '2026-06-23T06:00:00.000Z'),
('45', 'America/New_York', '2026-06-23T20:00:00.000Z', '2026-06-23T23:00:00.000Z'),
('46', 'America/New_York', '2026-06-23T23:00:00.000Z', '2026-06-24T02:00:00.000Z'),
('47', 'America/Chicago', '2026-06-23T17:00:00.000Z', '2026-06-23T20:00:00.000Z'),
('48', 'America/Mexico_City', '2026-06-24T02:00:00.000Z', '2026-06-24T05:00:00.000Z'),
('49', 'America/New_York', '2026-06-24T22:00:00.000Z', '2026-06-25T01:00:00.000Z'),
('50', 'America/New_York', '2026-06-24T22:00:00.000Z', '2026-06-25T01:00:00.000Z'),
('51', 'America/Vancouver', '2026-06-24T19:00:00.000Z', '2026-06-24T22:00:00.000Z'),
('52', 'America/Los_Angeles', '2026-06-24T19:00:00.000Z', '2026-06-24T22:00:00.000Z'),
('53', 'America/Mexico_City', '2026-06-25T01:00:00.000Z', '2026-06-25T04:00:00.000Z'),
('54', 'America/Mexico_City', '2026-06-25T01:00:00.000Z', '2026-06-25T04:00:00.000Z'),
('55', 'America/New_York', '2026-06-25T20:00:00.000Z', '2026-06-25T23:00:00.000Z'),
('56', 'America/New_York', '2026-06-25T20:00:00.000Z', '2026-06-25T23:00:00.000Z'),
('57', 'America/Chicago', '2026-06-25T23:00:00.000Z', '2026-06-26T02:00:00.000Z'),
('58', 'America/Chicago', '2026-06-25T23:00:00.000Z', '2026-06-26T02:00:00.000Z'),
('59', 'America/Los_Angeles', '2026-06-26T02:00:00.000Z', '2026-06-26T05:00:00.000Z'),
('60', 'America/Los_Angeles', '2026-06-26T02:00:00.000Z', '2026-06-26T05:00:00.000Z'),
('61', 'America/New_York', '2026-06-26T19:00:00.000Z', '2026-06-26T22:00:00.000Z'),
('62', 'America/New_York', '2026-06-26T19:00:00.000Z', '2026-06-26T22:00:00.000Z'),
('63', 'America/Los_Angeles', '2026-06-27T03:00:00.000Z', '2026-06-27T06:00:00.000Z'),
('64', 'America/Vancouver', '2026-06-27T03:00:00.000Z', '2026-06-27T06:00:00.000Z'),
('65', 'America/Chicago', '2026-06-27T00:00:00.000Z', '2026-06-27T03:00:00.000Z'),
('66', 'America/Mexico_City', '2026-06-27T00:00:00.000Z', '2026-06-27T03:00:00.000Z'),
('67', 'America/New_York', '2026-06-27T21:00:00.000Z', '2026-06-28T00:00:00.000Z'),
('68', 'America/New_York', '2026-06-27T21:00:00.000Z', '2026-06-28T00:00:00.000Z'),
('69', 'America/Chicago', '2026-06-28T02:00:00.000Z', '2026-06-28T05:00:00.000Z'),
('70', 'America/Chicago', '2026-06-28T02:00:00.000Z', '2026-06-28T05:00:00.000Z'),
('71', 'America/New_York', '2026-06-27T23:30:00.000Z', '2026-06-28T02:30:00.000Z'),
('72', 'America/New_York', '2026-06-27T23:30:00.000Z', '2026-06-28T02:30:00.000Z'),
('73', 'America/Los_Angeles', '2026-06-28T19:00:00.000Z', '2026-06-28T23:00:00.000Z'),
('74', 'America/New_York', '2026-06-29T20:30:00.000Z', '2026-06-30T00:30:00.000Z'),
('75', 'America/Mexico_City', '2026-06-30T01:00:00.000Z', '2026-06-30T05:00:00.000Z'),
('76', 'America/Chicago', '2026-06-29T17:00:00.000Z', '2026-06-29T21:00:00.000Z'),
('77', 'America/New_York', '2026-06-30T21:00:00.000Z', '2026-07-01T01:00:00.000Z'),
('78', 'America/Chicago', '2026-06-30T17:00:00.000Z', '2026-06-30T21:00:00.000Z'),
('79', 'America/Mexico_City', '2026-07-01T01:00:00.000Z', '2026-07-01T05:00:00.000Z'),
('80', 'America/New_York', '2026-07-01T16:00:00.000Z', '2026-07-01T20:00:00.000Z'),
('81', 'America/Los_Angeles', '2026-07-02T00:00:00.000Z', '2026-07-02T04:00:00.000Z'),
('82', 'America/Los_Angeles', '2026-07-01T20:00:00.000Z', '2026-07-02T00:00:00.000Z'),
('83', 'America/New_York', '2026-07-02T23:00:00.000Z', '2026-07-03T03:00:00.000Z'),
('84', 'America/Los_Angeles', '2026-07-02T19:00:00.000Z', '2026-07-02T23:00:00.000Z'),
('85', 'America/Vancouver', '2026-07-03T03:00:00.000Z', '2026-07-03T07:00:00.000Z'),
('86', 'America/New_York', '2026-07-03T22:00:00.000Z', '2026-07-04T02:00:00.000Z'),
('87', 'America/Chicago', '2026-07-04T01:30:00.000Z', '2026-07-04T05:30:00.000Z'),
('88', 'America/Chicago', '2026-07-03T18:00:00.000Z', '2026-07-03T22:00:00.000Z'),
('89', 'America/New_York', '2026-07-04T21:00:00.000Z', '2026-07-05T01:00:00.000Z'),
('90', 'America/Chicago', '2026-07-04T17:00:00.000Z', '2026-07-04T21:00:00.000Z'),
('91', 'America/New_York', '2026-07-05T20:00:00.000Z', '2026-07-06T00:00:00.000Z'),
('92', 'America/Mexico_City', '2026-07-06T00:00:00.000Z', '2026-07-06T04:00:00.000Z'),
('93', 'America/Chicago', '2026-07-06T19:00:00.000Z', '2026-07-06T23:00:00.000Z'),
('94', 'America/Los_Angeles', '2026-07-07T00:00:00.000Z', '2026-07-07T04:00:00.000Z'),
('95', 'America/New_York', '2026-07-07T16:00:00.000Z', '2026-07-07T20:00:00.000Z'),
('96', 'America/Vancouver', '2026-07-07T20:00:00.000Z', '2026-07-08T00:00:00.000Z'),
('97', 'America/New_York', '2026-07-09T20:00:00.000Z', '2026-07-10T00:00:00.000Z'),
('98', 'America/Los_Angeles', '2026-07-10T19:00:00.000Z', '2026-07-10T23:00:00.000Z'),
('99', 'America/New_York', '2026-07-11T21:00:00.000Z', '2026-07-12T01:00:00.000Z'),
('100', 'America/Chicago', '2026-07-12T01:00:00.000Z', '2026-07-12T05:00:00.000Z'),
('101', 'America/Chicago', '2026-07-14T19:00:00.000Z', '2026-07-14T23:00:00.000Z'),
('102', 'America/New_York', '2026-07-15T19:00:00.000Z', '2026-07-15T23:00:00.000Z'),
('103', 'America/New_York', '2026-07-18T21:00:00.000Z', '2026-07-19T01:00:00.000Z'),
('104', 'America/New_York', '2026-07-19T19:00:00.000Z', '2026-07-19T23:00:00.000Z')
) as seed(match_number, venue_timezone, kickoff_at, result_check_after)
where m.match_number = seed.match_number::integer
  and m.tournament_id = (select id from public.worldcup_tournaments where slug = 'fifa-world-cup-2026');

alter table public.worldcup_matches
  alter column venue_timezone set not null,
  alter column kickoff_at set not null,
  alter column result_check_after set not null;

create index if not exists worldcup_matches_result_check_idx
  on public.worldcup_matches (status, result_check_after, points_applied_at);

create table if not exists public.worldcup_entry_match_points (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid not null references public.worldcup_entries(id) on delete cascade,
  match_id uuid not null references public.worldcup_matches(id) on delete cascade,
  team_id text not null references public.worldcup_teams(id),
  result_base_points numeric(6,2) not null default 0,
  goal_bonus_points numeric(6,2) not null default 0,
  clean_sheet_bonus_points numeric(6,2) not null default 0,
  base_points numeric(6,2) not null default 0,
  team_coefficient numeric(4,2) not null,
  stage_coefficient numeric(4,2) not null,
  final_points numeric(10,2) not null,
  awarded_at timestamptz not null default now(),
  unique (entry_id, match_id, team_id)
);

create index if not exists worldcup_entry_match_points_entry_idx
  on public.worldcup_entry_match_points (entry_id);

alter table public.worldcup_entry_match_points enable row level security;

drop policy if exists "worldcup_entry_match_points_read" on public.worldcup_entry_match_points;
create policy "worldcup_entry_match_points_read"
on public.worldcup_entry_match_points for select to public using (true);

create or replace view public.worldcup_matches_due_for_result_check as
select
  m.id,
  m.tournament_id,
  m.match_number,
  m.stage_id,
  m.home_slot,
  m.away_slot,
  m.kickoff_at,
  m.result_check_after,
  m.result_checked_at,
  m.status,
  m.points_applied_at
from public.worldcup_matches m
where m.result_check_after <= now()
  and (m.result_checked_at is null or m.status <> 'completed' or m.points_applied_at is null);

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
    and e.status = 'locked'
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

create or replace function public.worldcup_mark_match_result_checked(target_match_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.worldcup_matches
  set result_checked_at = now()
  where id = target_match_id;
$$;

create or replace function public.worldcup_apply_completed_match_points()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  match_record record;
  total_rows integer := 0;
begin
  for match_record in
    select id
    from public.worldcup_matches
    where status = 'completed'
      and points_applied_at is null
  loop
    total_rows := total_rows + public.worldcup_apply_match_points(match_record.id);
  end loop;

  return total_rows;
end;
$$;

create or replace view public.worldcup_awarded_leaderboard as
select
  e.id as entry_id,
  e.tournament_id,
  e.display_name,
  round(coalesce(sum(emp.final_points), 0), 2)::numeric(10,2) as total_points,
  jsonb_agg(
    distinct jsonb_build_object(
      'team_id', et.team_id,
      'team_name', t.name,
      'team_coefficient', t.reward_coefficient
    )
  ) filter (where et.team_id is not null) as teams,
  rank() over (partition by e.tournament_id order by coalesce(sum(emp.final_points), 0) desc, e.locked_at asc nulls last) as leaderboard_rank
from public.worldcup_entries e
left join public.worldcup_entry_teams et on et.entry_id = e.id
left join public.worldcup_teams t on t.id = et.team_id
left join public.worldcup_entry_match_points emp on emp.entry_id = e.id and emp.team_id = et.team_id
where e.status = 'locked'
group by e.id, e.tournament_id, e.display_name, e.locked_at;
