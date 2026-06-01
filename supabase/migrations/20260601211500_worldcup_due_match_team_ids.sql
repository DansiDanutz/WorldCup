-- Expose assigned teams to the cron result-ingestion route.

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
  m.points_applied_at,
  m.home_team_id,
  m.away_team_id
from public.worldcup_matches m
where m.result_check_after <= now()
  and (m.result_checked_at is null or m.status <> 'completed' or m.points_applied_at is null);
