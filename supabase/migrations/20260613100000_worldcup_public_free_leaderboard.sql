-- Public / free community leaderboard ----------------------------------------
--
-- Engagement change: with few or no paying users, the public leaderboard
-- (worldcup_awarded_leaderboard, status = 'locked' only) shows empty, which
-- looks dead. Free players who permanently locked their picks ('committed')
-- already accrue points (worldcup_apply_match_points awards draft/committed/
-- locked), but they were never shown.
--
-- This view surfaces EVERY finalized entry — free ('committed') and paid
-- ('locked') — with their live points and a community rank, so the board is
-- full of activity. It is ADDITIVE and does not touch any money logic:
-- prize-pool, payouts, referral cuts and the official paid rank all continue
-- to key off worldcup_awarded_leaderboard (status = 'locked'). An is_paid flag
-- lets the UI mark which players are actually in the cash pool.

create or replace view public.worldcup_public_leaderboard as
with entry_team_points as (
  select
    e.id as entry_id,
    e.tournament_id,
    et.team_id,
    et.pick_slot,
    t.name as team_name,
    t.reward_coefficient as team_coefficient,
    round(coalesce(sum(emp.final_points), 0), 2)::numeric(10,2) as total_points
  from public.worldcup_entries e
  join public.worldcup_entry_teams et on et.entry_id = e.id
  join public.worldcup_teams t on t.id = et.team_id
  left join public.worldcup_entry_match_points emp
    on emp.entry_id = e.id
    and emp.team_id = et.team_id
  where e.status in ('committed', 'locked')
  group by e.id, e.tournament_id, et.team_id, et.pick_slot, t.name, t.reward_coefficient
)
select
  e.id as entry_id,
  e.tournament_id,
  e.display_name,
  (e.status = 'locked') as is_paid,
  round(coalesce(sum(etp.total_points), 0), 2)::numeric(10,2) as total_points,
  jsonb_agg(
    jsonb_build_object(
      'team_id', etp.team_id,
      'team_name', etp.team_name,
      'team_coefficient', etp.team_coefficient,
      'total_points', etp.total_points
    )
    order by etp.pick_slot
  ) filter (where etp.team_id is not null) as teams,
  rank() over (
    partition by e.tournament_id
    order by coalesce(sum(etp.total_points), 0) desc,
             coalesce(e.locked_at, e.committed_at) asc nulls last
  ) as leaderboard_rank
from public.worldcup_entries e
left join entry_team_points etp on etp.entry_id = e.id
where e.status in ('committed', 'locked')
group by e.id, e.tournament_id, e.display_name, e.status, e.locked_at, e.committed_at;

alter view public.worldcup_public_leaderboard set (security_invoker = true);

grant select on public.worldcup_public_leaderboard to anon, authenticated, service_role;
