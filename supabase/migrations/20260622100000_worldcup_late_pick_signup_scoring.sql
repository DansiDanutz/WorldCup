-- Late-pick fairness ---------------------------------------------------------
--
-- Players may now pick any 3 teams, even after those teams have already
-- played. Fairness comes from the scoring window: an entry only earns points
-- for matches that kick off at or after that entry's created_at/signup time.
-- This removes the old per-team pick cutoff while preventing retroactive
-- points for late signups.

drop trigger if exists worldcup_entry_teams_pick_cutoff on public.worldcup_entry_teams;

create or replace function public.worldcup_assert_team_pick_is_open()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  return new;
end;
$$;

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
left join public.worldcup_matches m
  on m.tournament_id = e.tournament_id
  and m.status = 'completed'
  and m.kickoff_at >= e.created_at
  and (m.home_team_id = et.team_id or m.away_team_id = et.team_id)
left join public.worldcup_match_team_points mtp
  on mtp.match_id = m.id
  and mtp.team_id = et.team_id
group by et.entry_id, e.tournament_id, et.team_id, t.name, t.reward_coefficient;

alter view public.worldcup_entry_team_totals
  set (security_invoker = true);

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

  delete from public.worldcup_entry_match_points emp
  using public.worldcup_entries e, public.worldcup_matches m
  where emp.entry_id = e.id
    and emp.match_id = m.id
    and emp.match_id = target_match_id
    and m.kickoff_at < e.created_at;

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
  join public.worldcup_matches m on m.id = mtp.match_id
  join public.worldcup_entry_teams et on et.team_id = mtp.team_id
  join public.worldcup_entries e on e.id = et.entry_id and e.tournament_id = mtp.tournament_id
  where mtp.match_id = target_match_id
    and m.kickoff_at >= e.created_at
    and e.status in ('draft', 'committed', 'locked')
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

create or replace function public.worldcup_commit_entry(
  p_user_id uuid,
  p_tournament_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_entry record;
  v_pick_total integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_tournament_id::text));

  select status into v_status
  from public.worldcup_tournaments
  where id = p_tournament_id
  for share;

  if v_status is null then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

  if v_status not in ('setup', 'open', 'in_progress') then
    raise exception 'TEAM_SELECTION_CLOSED';
  end if;

  select *
  into v_entry
  from public.worldcup_entries
  where tournament_id = p_tournament_id
    and user_id = p_user_id
  for update;

  if v_entry.id is null then
    raise exception 'NO_DRAFT';
  end if;

  if v_entry.status in ('committed', 'locked') then
    return v_entry.id;
  end if;

  select count(*)
  into v_pick_total
  from public.worldcup_entry_teams
  where entry_id = v_entry.id;

  if v_pick_total <> 3 then
    raise exception 'INVALID_TEAM_COUNT';
  end if;

  update public.worldcup_entries
  set status = 'committed',
      committed_at = coalesce(committed_at, now())
  where id = v_entry.id;

  return v_entry.id;
end;
$$;

create or replace function public.worldcup_lock_draft_entry(
  p_user_id uuid,
  p_tournament_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_ticket record;
  v_entry record;
  v_pick_total integer;
  v_effective_referral_code text;
  v_effective_referrer_user_id uuid;
  v_inviter_percent integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_tournament_id::text));

  select status into v_status
  from public.worldcup_tournaments
  where id = p_tournament_id
  for share;

  if v_status is null then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

  if v_status not in ('setup', 'open', 'in_progress') then
    raise exception 'TEAM_SELECTION_CLOSED';
  end if;

  select *
  into v_entry
  from public.worldcup_entries
  where tournament_id = p_tournament_id
    and user_id = p_user_id
  for update;

  if v_entry.id is null then
    raise exception 'NO_DRAFT';
  end if;

  if v_entry.status = 'locked' then
    return v_entry.id;
  end if;

  select count(*)
  into v_pick_total
  from public.worldcup_entry_teams
  where entry_id = v_entry.id;

  if v_pick_total <> 3 then
    raise exception 'INVALID_TEAM_COUNT';
  end if;

  select * into v_ticket
  from public.worldcup_tickets
  where tournament_id = p_tournament_id
    and user_id = p_user_id
    and consumed_at is null
  order by assigned_at
  for update skip locked
  limit 1;

  if v_ticket.id is null then
    raise exception 'NO_TICKET';
  end if;

  v_effective_referral_code := nullif(v_entry.referral_code, '');
  v_effective_referrer_user_id := v_entry.referrer_user_id;

  if v_effective_referrer_user_id is null
     and v_ticket.source_referrer_user_id is not null
     and v_ticket.source_referrer_user_id <> p_user_id then
    v_effective_referrer_user_id := v_ticket.source_referrer_user_id;
    v_effective_referral_code := v_ticket.source_referral_code;
  end if;

  if v_effective_referrer_user_id is not null then
    v_inviter_percent := case
      when exists (
        select 1 from public.worldcup_entries inviter_entry
        where inviter_entry.tournament_id = p_tournament_id
          and inviter_entry.user_id = v_effective_referrer_user_id
          and inviter_entry.referrer_user_id is not null
      ) then 5
      else 3
    end;
  else
    v_inviter_percent := 0;
  end if;

  update public.worldcup_entries
  set status = 'locked',
      locked_at = coalesce(locked_at, now()),
      referral_code = v_effective_referral_code,
      referrer_user_id = v_effective_referrer_user_id,
      referral_fee_percent = v_inviter_percent,
      referral_terms_accepted_at = case
        when v_effective_referrer_user_id is not null then coalesce(referral_terms_accepted_at, now())
        else null
      end
  where id = v_entry.id;

  update public.worldcup_tickets
  set consumed_by_entry_id = v_entry.id, consumed_at = now()
  where id = v_ticket.id and consumed_at is null;

  if v_effective_referrer_user_id is not null then
    insert into public.worldcup_referrals (
      tournament_id, entry_id, inviter_user_id, invited_user_id,
      referral_code, referral_fee_percent, accepted_at
    )
    values (
      p_tournament_id, v_entry.id, v_effective_referrer_user_id, p_user_id,
      v_effective_referral_code, v_inviter_percent, now()
    )
    on conflict (tournament_id, invited_user_id) do update
      set entry_id = excluded.entry_id,
          inviter_user_id = excluded.inviter_user_id,
          referral_code = excluded.referral_code,
          referral_fee_percent = excluded.referral_fee_percent,
          accepted_at = excluded.accepted_at;
  end if;

  return v_entry.id;
end;
$$;

delete from public.worldcup_entry_match_points emp
using public.worldcup_entries e, public.worldcup_matches m
where emp.entry_id = e.id
  and emp.match_id = m.id
  and m.kickoff_at < e.created_at;

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

revoke execute on function public.worldcup_commit_entry(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_commit_entry(uuid, uuid)
  to service_role;

revoke execute on function public.worldcup_lock_draft_entry(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_lock_draft_entry(uuid, uuid)
  to service_role;

revoke execute on function public.worldcup_apply_match_points(uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_apply_match_points(uuid)
  to service_role;
