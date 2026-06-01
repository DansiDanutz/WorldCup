import fs from "node:fs";
import path from "node:path";

const outPath = path.resolve(
  "supabase/migrations/20260601194500_worldcup_kickoff_cron_points.sql",
);

const eastern = "America/New_York";
const central = "America/Chicago";
const mountain = "America/Denver";
const pacific = "America/Los_Angeles";
const vancouver = "America/Vancouver";
const mexico = "America/Mexico_City";

const venueTimezones = {
  "AT&T Stadium": central,
  "Arrowhead Stadium": central,
  "BC Place": vancouver,
  "BMO Field": eastern,
  "Estadio Akron": mexico,
  "Estadio Azteca": mexico,
  "Estadio BBVA": mexico,
  "Gillette Stadium": eastern,
  "Hard Rock Stadium": eastern,
  "Levi's Stadium": pacific,
  "Lincoln Financial Field": eastern,
  "Lumen Field": pacific,
  "Mercedes-Benz Stadium": eastern,
  "MetLife Stadium": eastern,
  "NRG Stadium": central,
  "SoFi Stadium": pacific,
};

const matches = [
  [1, "group_stage", "2026-06-11", "13:00", "Estadio Azteca"],
  [2, "group_stage", "2026-06-11", "20:00", "Estadio Akron"],
  [3, "group_stage", "2026-06-12", "15:00", "BMO Field"],
  [4, "group_stage", "2026-06-12", "18:00", "SoFi Stadium"],
  [5, "group_stage", "2026-06-13", "21:00", "Gillette Stadium"],
  [6, "group_stage", "2026-06-13", "21:00", "BC Place"],
  [7, "group_stage", "2026-06-13", "18:00", "MetLife Stadium"],
  [8, "group_stage", "2026-06-13", "12:00", "Levi's Stadium"],
  [9, "group_stage", "2026-06-14", "19:00", "Lincoln Financial Field"],
  [10, "group_stage", "2026-06-14", "12:00", "NRG Stadium"],
  [11, "group_stage", "2026-06-14", "15:00", "AT&T Stadium"],
  [12, "group_stage", "2026-06-14", "20:00", "Estadio BBVA"],
  [13, "group_stage", "2026-06-15", "18:00", "Hard Rock Stadium"],
  [14, "group_stage", "2026-06-15", "12:00", "Mercedes-Benz Stadium"],
  [15, "group_stage", "2026-06-15", "18:00", "SoFi Stadium"],
  [16, "group_stage", "2026-06-15", "12:00", "Lumen Field"],
  [17, "group_stage", "2026-06-16", "15:00", "MetLife Stadium"],
  [18, "group_stage", "2026-06-16", "18:00", "Gillette Stadium"],
  [19, "group_stage", "2026-06-16", "20:00", "Arrowhead Stadium"],
  [20, "group_stage", "2026-06-16", "21:00", "Levi's Stadium"],
  [21, "group_stage", "2026-06-17", "19:00", "BMO Field"],
  [22, "group_stage", "2026-06-17", "15:00", "AT&T Stadium"],
  [23, "group_stage", "2026-06-17", "12:00", "NRG Stadium"],
  [24, "group_stage", "2026-06-17", "20:00", "Estadio Azteca"],
  [25, "group_stage", "2026-06-18", "12:00", "Mercedes-Benz Stadium"],
  [26, "group_stage", "2026-06-18", "12:00", "SoFi Stadium"],
  [27, "group_stage", "2026-06-18", "15:00", "BC Place"],
  [28, "group_stage", "2026-06-18", "19:00", "Estadio Akron"],
  [29, "group_stage", "2026-06-19", "21:00", "Lincoln Financial Field"],
  [30, "group_stage", "2026-06-19", "18:00", "Gillette Stadium"],
  [31, "group_stage", "2026-06-19", "20:00", "Levi's Stadium"],
  [32, "group_stage", "2026-06-19", "12:00", "Lumen Field"],
  [33, "group_stage", "2026-06-20", "16:00", "BMO Field"],
  [34, "group_stage", "2026-06-20", "19:00", "Arrowhead Stadium"],
  [35, "group_stage", "2026-06-20", "12:00", "NRG Stadium"],
  [36, "group_stage", "2026-06-20", "22:00", "Estadio BBVA"],
  [37, "group_stage", "2026-06-21", "18:00", "Hard Rock Stadium"],
  [38, "group_stage", "2026-06-21", "12:00", "Mercedes-Benz Stadium"],
  [39, "group_stage", "2026-06-21", "12:00", "SoFi Stadium"],
  [40, "group_stage", "2026-06-21", "18:00", "BC Place"],
  [41, "group_stage", "2026-06-22", "20:00", "MetLife Stadium"],
  [42, "group_stage", "2026-06-22", "17:00", "Lincoln Financial Field"],
  [43, "group_stage", "2026-06-22", "12:00", "AT&T Stadium"],
  [44, "group_stage", "2026-06-22", "20:00", "Levi's Stadium"],
  [45, "group_stage", "2026-06-23", "16:00", "Gillette Stadium"],
  [46, "group_stage", "2026-06-23", "19:00", "BMO Field"],
  [47, "group_stage", "2026-06-23", "12:00", "NRG Stadium"],
  [48, "group_stage", "2026-06-23", "20:00", "Estadio Akron"],
  [49, "group_stage", "2026-06-24", "18:00", "Hard Rock Stadium"],
  [50, "group_stage", "2026-06-24", "18:00", "Mercedes-Benz Stadium"],
  [51, "group_stage", "2026-06-24", "12:00", "BC Place"],
  [52, "group_stage", "2026-06-24", "12:00", "Lumen Field"],
  [53, "group_stage", "2026-06-24", "19:00", "Estadio Azteca"],
  [54, "group_stage", "2026-06-24", "19:00", "Estadio BBVA"],
  [55, "group_stage", "2026-06-25", "16:00", "Lincoln Financial Field"],
  [56, "group_stage", "2026-06-25", "16:00", "MetLife Stadium"],
  [57, "group_stage", "2026-06-25", "18:00", "AT&T Stadium"],
  [58, "group_stage", "2026-06-25", "18:00", "Arrowhead Stadium"],
  [59, "group_stage", "2026-06-25", "19:00", "SoFi Stadium"],
  [60, "group_stage", "2026-06-25", "19:00", "Levi's Stadium"],
  [61, "group_stage", "2026-06-26", "15:00", "Gillette Stadium"],
  [62, "group_stage", "2026-06-26", "15:00", "BMO Field"],
  [63, "group_stage", "2026-06-26", "20:00", "Lumen Field"],
  [64, "group_stage", "2026-06-26", "20:00", "BC Place"],
  [65, "group_stage", "2026-06-26", "19:00", "NRG Stadium"],
  [66, "group_stage", "2026-06-26", "18:00", "Estadio Akron"],
  [67, "group_stage", "2026-06-27", "17:00", "MetLife Stadium"],
  [68, "group_stage", "2026-06-27", "17:00", "Lincoln Financial Field"],
  [69, "group_stage", "2026-06-27", "21:00", "Arrowhead Stadium"],
  [70, "group_stage", "2026-06-27", "21:00", "AT&T Stadium"],
  [71, "group_stage", "2026-06-27", "19:30", "Hard Rock Stadium"],
  [72, "group_stage", "2026-06-27", "19:30", "Mercedes-Benz Stadium"],
  [73, "round_of_32", "2026-06-28", "12:00", "SoFi Stadium"],
  [74, "round_of_32", "2026-06-29", "16:30", "Gillette Stadium"],
  [75, "round_of_32", "2026-06-29", "19:00", "Estadio BBVA"],
  [76, "round_of_32", "2026-06-29", "12:00", "NRG Stadium"],
  [77, "round_of_32", "2026-06-30", "17:00", "MetLife Stadium"],
  [78, "round_of_32", "2026-06-30", "12:00", "AT&T Stadium"],
  [79, "round_of_32", "2026-06-30", "19:00", "Estadio Azteca"],
  [80, "round_of_32", "2026-07-01", "12:00", "Mercedes-Benz Stadium"],
  [81, "round_of_32", "2026-07-01", "17:00", "Levi's Stadium"],
  [82, "round_of_32", "2026-07-01", "13:00", "Lumen Field"],
  [83, "round_of_32", "2026-07-02", "19:00", "BMO Field"],
  [84, "round_of_32", "2026-07-02", "12:00", "SoFi Stadium"],
  [85, "round_of_32", "2026-07-02", "20:00", "BC Place"],
  [86, "round_of_32", "2026-07-03", "18:00", "Hard Rock Stadium"],
  [87, "round_of_32", "2026-07-03", "20:30", "Arrowhead Stadium"],
  [88, "round_of_32", "2026-07-03", "13:00", "AT&T Stadium"],
  [89, "round_of_16", "2026-07-04", "17:00", "Lincoln Financial Field"],
  [90, "round_of_16", "2026-07-04", "12:00", "NRG Stadium"],
  [91, "round_of_16", "2026-07-05", "16:00", "MetLife Stadium"],
  [92, "round_of_16", "2026-07-05", "18:00", "Estadio Azteca"],
  [93, "round_of_16", "2026-07-06", "14:00", "AT&T Stadium"],
  [94, "round_of_16", "2026-07-06", "17:00", "Lumen Field"],
  [95, "round_of_16", "2026-07-07", "12:00", "Mercedes-Benz Stadium"],
  [96, "round_of_16", "2026-07-07", "13:00", "BC Place"],
  [97, "quarter_final", "2026-07-09", "16:00", "Gillette Stadium"],
  [98, "quarter_final", "2026-07-10", "12:00", "SoFi Stadium"],
  [99, "quarter_final", "2026-07-11", "17:00", "Hard Rock Stadium"],
  [100, "quarter_final", "2026-07-11", "20:00", "Arrowhead Stadium"],
  [101, "semi_final", "2026-07-14", "14:00", "AT&T Stadium"],
  [102, "semi_final", "2026-07-15", "15:00", "Mercedes-Benz Stadium"],
  [103, "third_place", "2026-07-18", "17:00", "Hard Rock Stadium"],
  [104, "final", "2026-07-19", "15:00", "MetLife Stadium"],
];

const q = (value) => `'${String(value).replaceAll("'", "''")}'`;

function localToUtcIso(date, time, timeZone) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(utcGuess).map((part) => [part.type, part.value]),
  );
  const zonedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const wantedAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(utcGuess.getTime() + wantedAsUtc - zonedAsUtc).toISOString();
}

const rows = matches.map(([matchNumber, stageId, date, time, venue]) => {
  const timeZone = venueTimezones[venue];
  if (!timeZone) throw new Error(`Missing timezone for ${venue}`);
  const kickoffAt = localToUtcIso(date, time, timeZone);
  const checkHours = stageId === "group_stage" ? 3 : 4;
  const checkAfter = new Date(new Date(kickoffAt).getTime() + checkHours * 60 * 60 * 1000).toISOString();
  return [matchNumber, timeZone, kickoffAt, checkAfter];
});

const values = rows.map((row) => `(${row.map(q).join(", ")})`).join(",\n");

const sql = `-- Add timezone-aware kickoff data and cron-safe point awards for WorldCup.

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
${values}
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
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, sql);
console.log(outPath);
