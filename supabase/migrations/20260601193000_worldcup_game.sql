-- WorldCup team-picking fantasy game.
-- Source baseline: FIFA/WorldCuply 2026 schedule, coefficients agreed in .omx/plans/worldcup-coefficients.md.

create extension if not exists "uuid-ossp";

create table if not exists public.worldcup_tournaments (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  season_year integer not null,
  pick_count integer not null default 3 check (pick_count = 3),
  picks_lock_at timestamptz,
  status text not null default 'setup' check (status in ('setup', 'open', 'locked', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worldcup_stages (
  id text primary key,
  name text not null,
  sort_order integer not null unique,
  stage_coefficient numeric(4,2) not null check (stage_coefficient > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.worldcup_teams (
  id text primary key,
  name text not null unique,
  confederation text not null,
  group_code text check (group_code ~ '^[A-L]$'),
  winner_odds text,
  reward_coefficient numeric(4,2) not null check (reward_coefficient between 1 and 3),
  created_at timestamptz not null default now()
);

create table if not exists public.worldcup_matches (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  match_number integer not null,
  stage_id text not null references public.worldcup_stages(id),
  group_code text check (group_code is null or group_code ~ '^[A-L]$'),
  match_date date not null,
  local_kickoff_time time not null,
  venue text not null,
  city text not null,
  home_team_id text references public.worldcup_teams(id),
  away_team_id text references public.worldcup_teams(id),
  home_slot text not null,
  away_slot text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed')),
  finish_method text check (finish_method is null or finish_method in ('90', 'extra_time', 'penalties')),
  home_goals_90 integer check (home_goals_90 is null or home_goals_90 >= 0),
  away_goals_90 integer check (away_goals_90 is null or away_goals_90 >= 0),
  home_goals_total integer check (home_goals_total is null or home_goals_total >= 0),
  away_goals_total integer check (away_goals_total is null or away_goals_total >= 0),
  home_penalties integer check (home_penalties is null or home_penalties >= 0),
  away_penalties integer check (away_penalties is null or away_penalties >= 0),
  winner_team_id text references public.worldcup_teams(id),
  unique (tournament_id, match_number)
);

create table if not exists public.worldcup_entries (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  display_name text not null,
  status text not null default 'draft' check (status in ('draft', 'locked')),
  created_at timestamptz not null default now(),
  locked_at timestamptz
);

create table if not exists public.worldcup_entry_teams (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid not null references public.worldcup_entries(id) on delete cascade,
  team_id text not null references public.worldcup_teams(id),
  pick_slot integer not null check (pick_slot between 1 and 3),
  created_at timestamptz not null default now(),
  unique (entry_id, team_id),
  unique (entry_id, pick_slot)
);

create index if not exists worldcup_matches_tournament_stage_idx on public.worldcup_matches (tournament_id, stage_id, match_number);
create index if not exists worldcup_entry_teams_entry_idx on public.worldcup_entry_teams (entry_id);
create index if not exists worldcup_entries_tournament_status_idx on public.worldcup_entries (tournament_id, status);

create or replace function public.worldcup_prevent_more_than_three_picks()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.worldcup_entry_teams where entry_id = new.entry_id) >= 3 then
    raise exception 'A WorldCup entry can have at most 3 teams';
  end if;

  return new;
end;
$$;

drop trigger if exists worldcup_entry_teams_max_three on public.worldcup_entry_teams;
create trigger worldcup_entry_teams_max_three
before insert on public.worldcup_entry_teams
for each row execute function public.worldcup_prevent_more_than_three_picks();

create or replace function public.worldcup_finalize_entry(target_entry_id uuid)
returns public.worldcup_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  pick_total integer;
  finalized public.worldcup_entries;
begin
  select count(*) into pick_total
  from public.worldcup_entry_teams
  where entry_id = target_entry_id;

  if pick_total <> 3 then
    raise exception 'A WorldCup entry must have exactly 3 teams before it can be locked';
  end if;

  update public.worldcup_entries
  set status = 'locked', locked_at = coalesce(locked_at, now())
  where id = target_entry_id
  returning * into finalized;

  if finalized.id is null then
    raise exception 'WorldCup entry not found';
  end if;

  return finalized;
end;
$$;

create or replace view public.worldcup_match_team_points as
with match_sides as (
  select
    m.id as match_id,
    m.tournament_id,
    m.match_number,
    m.stage_id,
    s.stage_coefficient,
    side.team_id,
    side.goals_for_90,
    side.goals_against_90,
    side.goals_for_total,
    side.goals_against_total,
    m.status,
    m.finish_method,
    m.winner_team_id
  from public.worldcup_matches m
  join public.worldcup_stages s on s.id = m.stage_id
  cross join lateral (
    values
      (m.home_team_id, m.home_goals_90, m.away_goals_90, m.home_goals_total, m.away_goals_total),
      (m.away_team_id, m.away_goals_90, m.home_goals_90, m.away_goals_total, m.home_goals_total)
  ) as side(team_id, goals_for_90, goals_against_90, goals_for_total, goals_against_total)
  where side.team_id is not null
),
base_points as (
  select
    ms.*,
    case
      when status <> 'completed' then 0::numeric
      when stage_id = 'group_stage' and goals_for_90 > goals_against_90 then 5::numeric
      when stage_id = 'group_stage' and goals_for_90 = goals_against_90 then 2::numeric
      when stage_id = 'group_stage' then 0::numeric
      when winner_team_id = team_id and finish_method = '90' then 5::numeric
      when winner_team_id = team_id and finish_method = 'extra_time' then 4::numeric
      when winner_team_id = team_id and finish_method = 'penalties' then 3::numeric
      when winner_team_id <> team_id and finish_method = 'extra_time' then 1::numeric
      when winner_team_id <> team_id and finish_method = 'penalties' then 1.5::numeric
      else 0::numeric
    end as result_base_points,
    case when status = 'completed' then coalesce(goals_for_total, goals_for_90, 0) * 0.5 else 0 end as goal_bonus_points,
    case when status = 'completed' and goals_against_90 = 0 then 1::numeric else 0::numeric end as clean_sheet_bonus_points
  from match_sides ms
)
select
  bp.match_id,
  bp.tournament_id,
  bp.match_number,
  bp.stage_id,
  bp.team_id,
  t.name as team_name,
  t.reward_coefficient as team_coefficient,
  bp.stage_coefficient,
  bp.result_base_points,
  bp.goal_bonus_points,
  bp.clean_sheet_bonus_points,
  (bp.result_base_points + bp.goal_bonus_points + bp.clean_sheet_bonus_points) as base_points,
  round((bp.result_base_points + bp.goal_bonus_points + bp.clean_sheet_bonus_points) * t.reward_coefficient * bp.stage_coefficient, 2) as final_points
from base_points bp
join public.worldcup_teams t on t.id = bp.team_id;

create or replace view public.worldcup_entry_team_totals as
select
  et.entry_id,
  e.tournament_id,
  et.team_id,
  t.name as team_name,
  t.reward_coefficient as team_coefficient,
  coalesce(sum(mtp.final_points), 0)::numeric(10,2) as total_points
from public.worldcup_entry_teams et
join public.worldcup_entries e on e.id = et.entry_id
join public.worldcup_teams t on t.id = et.team_id
left join public.worldcup_match_team_points mtp on mtp.team_id = et.team_id and mtp.tournament_id = e.tournament_id
group by et.entry_id, e.tournament_id, et.team_id, t.name, t.reward_coefficient;

create or replace view public.worldcup_leaderboard as
select
  e.id as entry_id,
  e.tournament_id,
  e.display_name,
  round(coalesce(sum(ett.total_points), 0), 2)::numeric(10,2) as total_points,
  jsonb_agg(
    jsonb_build_object(
      'team_id', ett.team_id,
      'team_name', ett.team_name,
      'team_coefficient', ett.team_coefficient,
      'total_points', ett.total_points
    )
    order by ett.total_points desc, ett.team_name
  ) filter (where ett.team_id is not null) as teams,
  rank() over (partition by e.tournament_id order by coalesce(sum(ett.total_points), 0) desc, e.locked_at asc nulls last) as leaderboard_rank
from public.worldcup_entries e
left join public.worldcup_entry_team_totals ett on ett.entry_id = e.id
where e.status = 'locked'
group by e.id, e.tournament_id, e.display_name, e.locked_at;

alter table public.worldcup_tournaments enable row level security;
alter table public.worldcup_stages enable row level security;
alter table public.worldcup_teams enable row level security;
alter table public.worldcup_matches enable row level security;
alter table public.worldcup_entries enable row level security;
alter table public.worldcup_entry_teams enable row level security;

drop policy if exists "worldcup_tournaments_read" on public.worldcup_tournaments;
create policy "worldcup_tournaments_read" on public.worldcup_tournaments for select to public using (true);

drop policy if exists "worldcup_stages_read" on public.worldcup_stages;
create policy "worldcup_stages_read" on public.worldcup_stages for select to public using (true);

drop policy if exists "worldcup_teams_read" on public.worldcup_teams;
create policy "worldcup_teams_read" on public.worldcup_teams for select to public using (true);

drop policy if exists "worldcup_matches_read" on public.worldcup_matches;
create policy "worldcup_matches_read" on public.worldcup_matches for select to public using (true);

drop policy if exists "worldcup_entries_read" on public.worldcup_entries;
create policy "worldcup_entries_read" on public.worldcup_entries for select to public using (true);

drop policy if exists "worldcup_entries_create" on public.worldcup_entries;
create policy "worldcup_entries_create" on public.worldcup_entries for insert to public with check (true);

drop policy if exists "worldcup_entry_teams_read" on public.worldcup_entry_teams;
create policy "worldcup_entry_teams_read" on public.worldcup_entry_teams for select to public using (true);

drop policy if exists "worldcup_entry_teams_create" on public.worldcup_entry_teams;
create policy "worldcup_entry_teams_create" on public.worldcup_entry_teams for insert to public with check (true);

insert into public.worldcup_tournaments (slug, name, season_year, picks_lock_at, status)
values ('fifa-world-cup-2026', 'FIFA World Cup 2026', 2026, '2026-06-11 13:00:00-06', 'open')
on conflict (slug) do update set
  name = excluded.name,
  season_year = excluded.season_year,
  picks_lock_at = excluded.picks_lock_at,
  status = excluded.status,
  updated_at = now();

insert into public.worldcup_stages (id, name, sort_order, stage_coefficient)
values
('group_stage', 'Group Stage', 1, 1),
('round_of_32', 'Round of 32', 2, 1.2),
('round_of_16', 'Round of 16', 3, 1.35),
('quarter_final', 'Quarter-final', 4, 1.5),
('semi_final', 'Semi-final', 5, 1.75),
('third_place', 'Third-place Match', 6, 1.25),
('final', 'Final', 7, 2)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  stage_coefficient = excluded.stage_coefficient;

insert into public.worldcup_teams (id, name, confederation, group_code, winner_odds, reward_coefficient)
values
('france', 'France', 'UEFA', 'I', '9/2', 1),
('spain', 'Spain', 'UEFA', 'H', '9/2', 1),
('england', 'England', 'UEFA', 'L', '13/2', 1.12),
('brazil', 'Brazil', 'CONMEBOL', 'C', '8/1', 1.19),
('argentina', 'Argentina', 'CONMEBOL', 'J', '8/1', 1.19),
('portugal', 'Portugal', 'UEFA', 'K', '10/1', 1.27),
('germany', 'Germany', 'UEFA', 'E', '14/1', 1.39),
('netherlands', 'Netherlands', 'UEFA', 'F', '20/1', 1.51),
('norway', 'Norway', 'UEFA', 'I', '25/1', 1.6),
('belgium', 'Belgium', 'UEFA', 'G', '33/1', 1.7),
('morocco', 'Morocco', 'CAF', 'C', '40/1', 1.77),
('united_states', 'United States', 'Concacaf', 'D', '40/1', 1.77),
('colombia', 'Colombia', 'CONMEBOL', 'K', '40/1', 1.77),
('japan', 'Japan', 'AFC', 'F', '50/1', 1.86),
('uruguay', 'Uruguay', 'CONMEBOL', 'H', '50/1', 1.86),
('turkiye', 'Türkiye', 'UEFA', 'D', '66/1', 1.96),
('switzerland', 'Switzerland', 'UEFA', 'B', '66/1', 1.96),
('sweden', 'Sweden', 'UEFA', 'F', '66/1', 1.96),
('mexico', 'Mexico', 'Concacaf', 'A', '66/1', 1.96),
('ecuador', 'Ecuador', 'CONMEBOL', 'E', '66/1', 1.96),
('senegal', 'Senegal', 'CAF', 'I', '66/1', 1.96),
('croatia', 'Croatia', 'UEFA', 'L', '66/1', 1.96),
('austria', 'Austria', 'UEFA', 'J', '100/1', 2.12),
('paraguay', 'Paraguay', 'CONMEBOL', 'D', '150/1', 2.27),
('canada', 'Canada', 'Concacaf', 'B', '150/1', 2.27),
('cote_divoire', 'Côte d''Ivoire', 'CAF', 'E', '200/1', 2.38),
('czechia', 'Czechia', 'UEFA', 'A', '200/1', 2.38),
('scotland', 'Scotland', 'UEFA', 'C', '250/1', 2.47),
('egypt', 'Egypt', 'CAF', 'G', '250/1', 2.47),
('ghana', 'Ghana', 'CAF', 'L', '250/1', 2.47),
('algeria', 'Algeria', 'CAF', 'J', '250/1', 2.47),
('korea_republic', 'Korea Republic', 'AFC', 'A', '250/1', 2.47),
('bosnia_herzegovina', 'Bosnia and Herzegovina', 'UEFA', 'B', '250/1', 2.47),
('tunisia', 'Tunisia', 'CAF', 'F', '500/1', 2.73),
('australia', 'Australia', 'AFC', 'D', '500/1', 2.73),
('ir_iran', 'IR Iran', 'AFC', 'G', '500/1', 2.73),
('new_zealand', 'New Zealand', 'OFC', 'G', '750/1', 2.89),
('congo_dr', 'Congo DR', 'CAF', 'K', '750/1', 2.89),
('saudi_arabia', 'Saudi Arabia', 'AFC', 'H', '750/1', 2.89),
('qatar', 'Qatar', 'AFC', 'B', '750/1', 2.89),
('south_africa', 'South Africa', 'CAF', 'A', '750/1', 2.89),
('curacao', 'Curaçao', 'Concacaf', 'E', '1000/1', 3),
('jordan', 'Jordan', 'AFC', 'J', '1000/1', 3),
('haiti', 'Haiti', 'Concacaf', 'C', '1000/1', 3),
('uzbekistan', 'Uzbekistan', 'AFC', 'K', '1000/1', 3),
('cabo_verde', 'Cabo Verde', 'CAF', 'H', '1000/1', 3),
('iraq', 'Iraq', 'AFC', 'I', '1000/1', 3),
('panama', 'Panama', 'Concacaf', 'L', '1000/1', 3)
on conflict (id) do update set
  name = excluded.name,
  confederation = excluded.confederation,
  group_code = excluded.group_code,
  winner_odds = excluded.winner_odds,
  reward_coefficient = excluded.reward_coefficient;

insert into public.worldcup_matches (
  tournament_id,
  match_number,
  stage_id,
  group_code,
  match_date,
  local_kickoff_time,
  venue,
  city,
  home_team_id,
  away_team_id,
  home_slot,
  away_slot
)
select
  wt.id,
  seed.match_number,
  seed.stage_id,
  seed.group_code,
  seed.match_date::date,
  seed.local_kickoff_time::time,
  seed.venue,
  seed.city,
  seed.home_team_id,
  seed.away_team_id,
  coalesce(seed.home_slot, ht.name),
  coalesce(seed.away_slot, at.name)
from (
  values
(1, 'group_stage', 'A', '2026-06-11', '13:00', 'Estadio Azteca', 'Mexico City', 'mexico', 'south_africa', null, null),
(2, 'group_stage', 'A', '2026-06-11', '20:00', 'Estadio Akron', 'Guadalajara', 'korea_republic', 'czechia', null, null),
(3, 'group_stage', 'B', '2026-06-12', '15:00', 'BMO Field', 'Toronto', 'canada', 'bosnia_herzegovina', null, null),
(4, 'group_stage', 'D', '2026-06-12', '18:00', 'SoFi Stadium', 'Los Angeles', 'united_states', 'paraguay', null, null),
(5, 'group_stage', 'C', '2026-06-13', '21:00', 'Gillette Stadium', 'Boston', 'haiti', 'scotland', null, null),
(6, 'group_stage', 'D', '2026-06-13', '21:00', 'BC Place', 'Vancouver', 'australia', 'turkiye', null, null),
(7, 'group_stage', 'C', '2026-06-13', '18:00', 'MetLife Stadium', 'New York / New Jersey', 'brazil', 'morocco', null, null),
(8, 'group_stage', 'B', '2026-06-13', '12:00', 'Levi''s Stadium', 'San Francisco Bay Area', 'qatar', 'switzerland', null, null),
(9, 'group_stage', 'E', '2026-06-14', '19:00', 'Lincoln Financial Field', 'Philadelphia', 'cote_divoire', 'ecuador', null, null),
(10, 'group_stage', 'E', '2026-06-14', '12:00', 'NRG Stadium', 'Houston', 'germany', 'curacao', null, null),
(11, 'group_stage', 'F', '2026-06-14', '15:00', 'AT&T Stadium', 'Dallas', 'netherlands', 'japan', null, null),
(12, 'group_stage', 'F', '2026-06-14', '20:00', 'Estadio BBVA', 'Monterrey', 'sweden', 'tunisia', null, null),
(13, 'group_stage', 'H', '2026-06-15', '18:00', 'Hard Rock Stadium', 'Miami', 'saudi_arabia', 'uruguay', null, null),
(14, 'group_stage', 'H', '2026-06-15', '12:00', 'Mercedes-Benz Stadium', 'Atlanta', 'spain', 'cabo_verde', null, null),
(15, 'group_stage', 'G', '2026-06-15', '18:00', 'SoFi Stadium', 'Los Angeles', 'ir_iran', 'new_zealand', null, null),
(16, 'group_stage', 'G', '2026-06-15', '12:00', 'Lumen Field', 'Seattle', 'belgium', 'egypt', null, null),
(17, 'group_stage', 'I', '2026-06-16', '15:00', 'MetLife Stadium', 'New York / New Jersey', 'france', 'senegal', null, null),
(18, 'group_stage', 'I', '2026-06-16', '18:00', 'Gillette Stadium', 'Boston', 'iraq', 'norway', null, null),
(19, 'group_stage', 'J', '2026-06-16', '20:00', 'Arrowhead Stadium', 'Kansas City', 'argentina', 'algeria', null, null),
(20, 'group_stage', 'J', '2026-06-16', '21:00', 'Levi''s Stadium', 'San Francisco Bay Area', 'austria', 'jordan', null, null),
(21, 'group_stage', 'L', '2026-06-17', '19:00', 'BMO Field', 'Toronto', 'ghana', 'panama', null, null),
(22, 'group_stage', 'L', '2026-06-17', '15:00', 'AT&T Stadium', 'Dallas', 'england', 'croatia', null, null),
(23, 'group_stage', 'K', '2026-06-17', '12:00', 'NRG Stadium', 'Houston', 'portugal', 'congo_dr', null, null),
(24, 'group_stage', 'K', '2026-06-17', '20:00', 'Estadio Azteca', 'Mexico City', 'uzbekistan', 'colombia', null, null),
(25, 'group_stage', 'A', '2026-06-18', '12:00', 'Mercedes-Benz Stadium', 'Atlanta', 'czechia', 'south_africa', null, null),
(26, 'group_stage', 'B', '2026-06-18', '12:00', 'SoFi Stadium', 'Los Angeles', 'switzerland', 'bosnia_herzegovina', null, null),
(27, 'group_stage', 'B', '2026-06-18', '15:00', 'BC Place', 'Vancouver', 'canada', 'qatar', null, null),
(28, 'group_stage', 'A', '2026-06-18', '19:00', 'Estadio Akron', 'Guadalajara', 'mexico', 'korea_republic', null, null),
(29, 'group_stage', 'C', '2026-06-19', '21:00', 'Lincoln Financial Field', 'Philadelphia', 'brazil', 'haiti', null, null),
(30, 'group_stage', 'C', '2026-06-19', '18:00', 'Gillette Stadium', 'Boston', 'scotland', 'morocco', null, null),
(31, 'group_stage', 'D', '2026-06-19', '20:00', 'Levi''s Stadium', 'San Francisco Bay Area', 'turkiye', 'paraguay', null, null),
(32, 'group_stage', 'D', '2026-06-19', '12:00', 'Lumen Field', 'Seattle', 'united_states', 'australia', null, null),
(33, 'group_stage', 'E', '2026-06-20', '16:00', 'BMO Field', 'Toronto', 'germany', 'cote_divoire', null, null),
(34, 'group_stage', 'E', '2026-06-20', '19:00', 'Arrowhead Stadium', 'Kansas City', 'ecuador', 'curacao', null, null),
(35, 'group_stage', 'F', '2026-06-20', '12:00', 'NRG Stadium', 'Houston', 'netherlands', 'sweden', null, null),
(36, 'group_stage', 'F', '2026-06-20', '22:00', 'Estadio BBVA', 'Monterrey', 'tunisia', 'japan', null, null),
(37, 'group_stage', 'H', '2026-06-21', '18:00', 'Hard Rock Stadium', 'Miami', 'uruguay', 'cabo_verde', null, null),
(38, 'group_stage', 'H', '2026-06-21', '12:00', 'Mercedes-Benz Stadium', 'Atlanta', 'spain', 'saudi_arabia', null, null),
(39, 'group_stage', 'G', '2026-06-21', '12:00', 'SoFi Stadium', 'Los Angeles', 'belgium', 'ir_iran', null, null),
(40, 'group_stage', 'G', '2026-06-21', '18:00', 'BC Place', 'Vancouver', 'new_zealand', 'egypt', null, null),
(41, 'group_stage', 'I', '2026-06-22', '20:00', 'MetLife Stadium', 'New York / New Jersey', 'norway', 'senegal', null, null),
(42, 'group_stage', 'I', '2026-06-22', '17:00', 'Lincoln Financial Field', 'Philadelphia', 'france', 'iraq', null, null),
(43, 'group_stage', 'J', '2026-06-22', '12:00', 'AT&T Stadium', 'Dallas', 'argentina', 'austria', null, null),
(44, 'group_stage', 'J', '2026-06-22', '20:00', 'Levi''s Stadium', 'San Francisco Bay Area', 'jordan', 'algeria', null, null),
(45, 'group_stage', 'L', '2026-06-23', '16:00', 'Gillette Stadium', 'Boston', 'england', 'ghana', null, null),
(46, 'group_stage', 'L', '2026-06-23', '19:00', 'BMO Field', 'Toronto', 'panama', 'croatia', null, null),
(47, 'group_stage', 'K', '2026-06-23', '12:00', 'NRG Stadium', 'Houston', 'portugal', 'uzbekistan', null, null),
(48, 'group_stage', 'K', '2026-06-23', '20:00', 'Estadio Akron', 'Guadalajara', 'colombia', 'congo_dr', null, null),
(49, 'group_stage', 'C', '2026-06-24', '18:00', 'Hard Rock Stadium', 'Miami', 'scotland', 'brazil', null, null),
(50, 'group_stage', 'C', '2026-06-24', '18:00', 'Mercedes-Benz Stadium', 'Atlanta', 'morocco', 'haiti', null, null),
(51, 'group_stage', 'B', '2026-06-24', '12:00', 'BC Place', 'Vancouver', 'switzerland', 'canada', null, null),
(52, 'group_stage', 'B', '2026-06-24', '12:00', 'Lumen Field', 'Seattle', 'bosnia_herzegovina', 'qatar', null, null),
(53, 'group_stage', 'A', '2026-06-24', '19:00', 'Estadio Azteca', 'Mexico City', 'czechia', 'mexico', null, null),
(54, 'group_stage', 'A', '2026-06-24', '19:00', 'Estadio BBVA', 'Monterrey', 'south_africa', 'korea_republic', null, null),
(55, 'group_stage', 'E', '2026-06-25', '16:00', 'Lincoln Financial Field', 'Philadelphia', 'curacao', 'cote_divoire', null, null),
(56, 'group_stage', 'E', '2026-06-25', '16:00', 'MetLife Stadium', 'New York / New Jersey', 'ecuador', 'germany', null, null),
(57, 'group_stage', 'F', '2026-06-25', '18:00', 'AT&T Stadium', 'Dallas', 'japan', 'sweden', null, null),
(58, 'group_stage', 'F', '2026-06-25', '18:00', 'Arrowhead Stadium', 'Kansas City', 'tunisia', 'netherlands', null, null),
(59, 'group_stage', 'D', '2026-06-25', '19:00', 'SoFi Stadium', 'Los Angeles', 'turkiye', 'united_states', null, null),
(60, 'group_stage', 'D', '2026-06-25', '19:00', 'Levi''s Stadium', 'San Francisco Bay Area', 'paraguay', 'australia', null, null),
(61, 'group_stage', 'I', '2026-06-26', '15:00', 'Gillette Stadium', 'Boston', 'norway', 'france', null, null),
(62, 'group_stage', 'I', '2026-06-26', '15:00', 'BMO Field', 'Toronto', 'senegal', 'iraq', null, null),
(63, 'group_stage', 'G', '2026-06-26', '20:00', 'Lumen Field', 'Seattle', 'egypt', 'ir_iran', null, null),
(64, 'group_stage', 'G', '2026-06-26', '20:00', 'BC Place', 'Vancouver', 'new_zealand', 'belgium', null, null),
(65, 'group_stage', 'H', '2026-06-26', '19:00', 'NRG Stadium', 'Houston', 'cabo_verde', 'saudi_arabia', null, null),
(66, 'group_stage', 'H', '2026-06-26', '18:00', 'Estadio Akron', 'Guadalajara', 'uruguay', 'spain', null, null),
(67, 'group_stage', 'L', '2026-06-27', '17:00', 'MetLife Stadium', 'New York / New Jersey', 'panama', 'england', null, null),
(68, 'group_stage', 'L', '2026-06-27', '17:00', 'Lincoln Financial Field', 'Philadelphia', 'croatia', 'ghana', null, null),
(69, 'group_stage', 'J', '2026-06-27', '21:00', 'Arrowhead Stadium', 'Kansas City', 'algeria', 'austria', null, null),
(70, 'group_stage', 'J', '2026-06-27', '21:00', 'AT&T Stadium', 'Dallas', 'jordan', 'argentina', null, null),
(71, 'group_stage', 'K', '2026-06-27', '19:30', 'Hard Rock Stadium', 'Miami', 'colombia', 'portugal', null, null),
(72, 'group_stage', 'K', '2026-06-27', '19:30', 'Mercedes-Benz Stadium', 'Atlanta', 'congo_dr', 'uzbekistan', null, null),
(73, 'round_of_32', null, '2026-06-28', '12:00', 'SoFi Stadium', 'Los Angeles', null, null, 'Group A runners-up', 'Group B runners-up'),
(74, 'round_of_32', null, '2026-06-29', '16:30', 'Gillette Stadium', 'Boston', null, null, 'Group E winners', 'Group A/B/C/D/F third place'),
(75, 'round_of_32', null, '2026-06-29', '19:00', 'Estadio BBVA', 'Monterrey', null, null, 'Group F winners', 'Group C runners-up'),
(76, 'round_of_32', null, '2026-06-29', '12:00', 'NRG Stadium', 'Houston', null, null, 'Group C winners', 'Group F runners-up'),
(77, 'round_of_32', null, '2026-06-30', '17:00', 'MetLife Stadium', 'New York / New Jersey', null, null, 'Group I winners', 'Group C/D/F/G/H third place'),
(78, 'round_of_32', null, '2026-06-30', '12:00', 'AT&T Stadium', 'Dallas', null, null, 'Group E runners-up', 'Group I runners-up'),
(79, 'round_of_32', null, '2026-06-30', '19:00', 'Estadio Azteca', 'Mexico City', null, null, 'Group A winners', 'Group C/E/F/H/I third place'),
(80, 'round_of_32', null, '2026-07-01', '12:00', 'Mercedes-Benz Stadium', 'Atlanta', null, null, 'Group L winners', 'Group E/H/I/J/K third place'),
(81, 'round_of_32', null, '2026-07-01', '17:00', 'Levi''s Stadium', 'San Francisco Bay Area', null, null, 'Group D winners', 'Group B/E/F/I/J third place'),
(82, 'round_of_32', null, '2026-07-01', '13:00', 'Lumen Field', 'Seattle', null, null, 'Group G winners', 'Group A/E/H/I/J third place'),
(83, 'round_of_32', null, '2026-07-02', '19:00', 'BMO Field', 'Toronto', null, null, 'Group K runners-up', 'Group L runners-up'),
(84, 'round_of_32', null, '2026-07-02', '12:00', 'SoFi Stadium', 'Los Angeles', null, null, 'Group H winners', 'Group J runners-up'),
(85, 'round_of_32', null, '2026-07-02', '20:00', 'BC Place', 'Vancouver', null, null, 'Group B winners', 'Group E/F/G/I/J third place'),
(86, 'round_of_32', null, '2026-07-03', '18:00', 'Hard Rock Stadium', 'Miami', null, null, 'Group J winners', 'Group H runners-up'),
(87, 'round_of_32', null, '2026-07-03', '20:30', 'Arrowhead Stadium', 'Kansas City', null, null, 'Group K winners', 'Group D/E/I/J/L third place'),
(88, 'round_of_32', null, '2026-07-03', '13:00', 'AT&T Stadium', 'Dallas', null, null, 'Group D runners-up', 'Group G runners-up'),
(89, 'round_of_16', null, '2026-07-04', '17:00', 'Lincoln Financial Field', 'Philadelphia', null, null, 'Winner Match 74', 'Winner Match 77'),
(90, 'round_of_16', null, '2026-07-04', '12:00', 'NRG Stadium', 'Houston', null, null, 'Winner Match 73', 'Winner Match 75'),
(91, 'round_of_16', null, '2026-07-05', '16:00', 'MetLife Stadium', 'New York / New Jersey', null, null, 'Winner Match 76', 'Winner Match 78'),
(92, 'round_of_16', null, '2026-07-05', '18:00', 'Estadio Azteca', 'Mexico City', null, null, 'Winner Match 79', 'Winner Match 80'),
(93, 'round_of_16', null, '2026-07-06', '14:00', 'AT&T Stadium', 'Dallas', null, null, 'Winner Match 83', 'Winner Match 84'),
(94, 'round_of_16', null, '2026-07-06', '17:00', 'Lumen Field', 'Seattle', null, null, 'Winner Match 81', 'Winner Match 82'),
(95, 'round_of_16', null, '2026-07-07', '12:00', 'Mercedes-Benz Stadium', 'Atlanta', null, null, 'Winner Match 86', 'Winner Match 88'),
(96, 'round_of_16', null, '2026-07-07', '13:00', 'BC Place', 'Vancouver', null, null, 'Winner Match 85', 'Winner Match 87'),
(97, 'quarter_final', null, '2026-07-09', '16:00', 'Gillette Stadium', 'Boston', null, null, 'Winner Match 89', 'Winner Match 90'),
(98, 'quarter_final', null, '2026-07-10', '12:00', 'SoFi Stadium', 'Los Angeles', null, null, 'Winner Match 93', 'Winner Match 94'),
(99, 'quarter_final', null, '2026-07-11', '17:00', 'Hard Rock Stadium', 'Miami', null, null, 'Winner Match 91', 'Winner Match 92'),
(100, 'quarter_final', null, '2026-07-11', '20:00', 'Arrowhead Stadium', 'Kansas City', null, null, 'Winner Match 95', 'Winner Match 96'),
(101, 'semi_final', null, '2026-07-14', '14:00', 'AT&T Stadium', 'Dallas', null, null, 'Winner Match 97', 'Winner Match 98'),
(102, 'semi_final', null, '2026-07-15', '15:00', 'Mercedes-Benz Stadium', 'Atlanta', null, null, 'Winner Match 99', 'Winner Match 100'),
(103, 'third_place', null, '2026-07-18', '17:00', 'Hard Rock Stadium', 'Miami', null, null, 'Loser Match 101', 'Loser Match 102'),
(104, 'final', null, '2026-07-19', '15:00', 'MetLife Stadium', 'New York / New Jersey', null, null, 'Winner Match 101', 'Winner Match 102')
) as seed(match_number, stage_id, group_code, match_date, local_kickoff_time, venue, city, home_team_id, away_team_id, home_slot, away_slot)
cross join public.worldcup_tournaments wt
left join public.worldcup_teams ht on ht.id = seed.home_team_id
left join public.worldcup_teams at on at.id = seed.away_team_id
where wt.slug = 'fifa-world-cup-2026'
on conflict (tournament_id, match_number) do update set
  stage_id = excluded.stage_id,
  group_code = excluded.group_code,
  match_date = excluded.match_date,
  local_kickoff_time = excluded.local_kickoff_time,
  venue = excluded.venue,
  city = excluded.city,
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  home_slot = excluded.home_slot,
  away_slot = excluded.away_slot;
