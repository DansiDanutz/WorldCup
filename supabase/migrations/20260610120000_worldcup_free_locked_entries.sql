-- Free permanent team lock, decoupled from paying ------------------------------
--
-- Product change: a signed-in player can permanently LOCK their 3 teams for
-- free at sign-up. Once locked the picks can never be changed again, whether or
-- not the player ever buys a ticket.
--
-- A ticket is what moves a locked entry into the paid prize pool / public
-- leaderboard. Free (locked-but-unpaid) players keep a private points preview
-- and a "where you would place if you were paying" shadow rank, but are never
-- counted in the pool and never win money.
--
-- Entry lifecycle / status values:
--   draft     -> picks saved, still editable, free, private preview only.
--   committed -> picks locked forever, free, private preview + shadow rank,
--                NOT in the pool. (NEW free permanent lock.)
--   locked    -> picks locked forever AND paid (a ticket was consumed). In the
--                pool, on the public leaderboard, eligible for money.
--
-- All prize-pool / payout / public-leaderboard / referral money logic continues
-- to key off status = 'locked', so this migration does not touch any of that.
-- We only add the free 'committed' tier and make point snapshots accrue for it
-- so a player who pays later already has a complete points history.

alter table public.worldcup_entries
  add column if not exists committed_at timestamptz;

alter table public.worldcup_entries
  drop constraint if exists worldcup_entries_status_check;

alter table public.worldcup_entries
  add constraint worldcup_entries_status_check
  check (status in ('draft', 'committed', 'locked'));

-- Saving a draft may no longer overwrite picks once they are committed or
-- locked: a committed/locked entry is final.
create or replace function public.worldcup_save_draft_entry(
  p_user_id uuid,
  p_tournament_id uuid,
  p_display_name text,
  p_team_ids text[],
  p_referral_code text,
  p_referrer_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_entry_id uuid;
  v_existing_status text;
  v_effective_referral_code text;
  v_effective_referrer_user_id uuid;
  v_inviter_percent integer;
  v_team_id text;
  v_slot integer;
  v_distinct_team_count integer;
begin
  if array_length(p_team_ids, 1) is distinct from 3 then
    raise exception 'INVALID_TEAM_COUNT';
  end if;

  select count(distinct picked.team_id)
  into v_distinct_team_count
  from unnest(p_team_ids) as picked(team_id);

  if v_distinct_team_count <> 3 then
    raise exception 'INVALID_TEAM_COUNT';
  end if;

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

  v_effective_referral_code := nullif(p_referral_code, '');
  v_effective_referrer_user_id := p_referrer_user_id;

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

  select id, status
  into v_entry_id, v_existing_status
  from public.worldcup_entries
  where tournament_id = p_tournament_id
    and user_id = p_user_id
  for update;

  if v_entry_id is not null and v_existing_status in ('committed', 'locked') then
    raise exception 'TEAMS_LOCKED';
  end if;

  if v_entry_id is null then
    insert into public.worldcup_entries (
      tournament_id, user_id, display_name, status,
      referral_code, referrer_user_id, referral_fee_percent,
      referral_terms_accepted_at, auth_provider
    )
    values (
      p_tournament_id, p_user_id, p_display_name, 'draft',
      v_effective_referral_code, v_effective_referrer_user_id, v_inviter_percent,
      case when v_effective_referrer_user_id is not null then now() else null end, 'google'
    )
    returning id into v_entry_id;
  else
    update public.worldcup_entries
    set display_name = p_display_name,
        status = 'draft',
        referral_code = v_effective_referral_code,
        referrer_user_id = v_effective_referrer_user_id,
        referral_fee_percent = v_inviter_percent,
        referral_terms_accepted_at = case
          when v_effective_referrer_user_id is not null then coalesce(referral_terms_accepted_at, now())
          else null
        end,
        auth_provider = 'google'
    where id = v_entry_id;
  end if;

  delete from public.worldcup_entry_teams
  where entry_id = v_entry_id;

  v_slot := 1;
  foreach v_team_id in array p_team_ids loop
    insert into public.worldcup_entry_teams (entry_id, team_id, pick_slot)
    values (v_entry_id, v_team_id, v_slot);
    v_slot := v_slot + 1;
  end loop;

  if v_effective_referrer_user_id is not null then
    insert into public.worldcup_referrals (
      tournament_id, entry_id, inviter_user_id, invited_user_id,
      referral_code, referral_fee_percent, accepted_at
    )
    values (
      p_tournament_id, v_entry_id, v_effective_referrer_user_id, p_user_id,
      v_effective_referral_code, v_inviter_percent, now()
    )
    on conflict (tournament_id, invited_user_id) do update
      set entry_id = excluded.entry_id,
          inviter_user_id = excluded.inviter_user_id,
          referral_code = excluded.referral_code,
          referral_fee_percent = excluded.referral_fee_percent,
          accepted_at = excluded.accepted_at;
  end if;

  return v_entry_id;
end;
$$;

-- Free permanent lock: turn a draft into a committed entry. No ticket is
-- consumed and the entry does NOT enter the paid pool. Picks become immutable.
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

  -- Already final (committed for free, or already paid+locked): idempotent.
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

  -- Same per-team cutoff as paid locking: a team can no longer be committed
  -- once its first group-stage match is less than one minute away or started.
  if exists (
    select 1
    from public.worldcup_entry_teams et
    join lateral (
      select m.kickoff_at
      from public.worldcup_matches m
      where m.tournament_id = p_tournament_id
        and m.stage_id = 'group_stage'
        and (m.home_team_id = et.team_id or m.away_team_id = et.team_id)
      order by m.kickoff_at
      limit 1
    ) first_match on true
    where et.entry_id = v_entry.id
      and first_match.kickoff_at is not null
      and now() >= first_match.kickoff_at - interval '1 minute'
  ) then
    raise exception 'TEAM_SELECTION_CLOSED';
  end if;

  update public.worldcup_entries
  set status = 'committed',
      committed_at = coalesce(committed_at, now())
  where id = v_entry.id;

  return v_entry.id;
end;
$$;

-- Point snapshots must accrue for committed (free-locked) entries too, so their
-- private preview is live and a later ticket purchase already has full history.
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

-- Entering the paid pool with a ticket. A committed (free-locked) entry has
-- already finalized its teams, so it can enter the pool any time during the
-- tournament with full retroactive points — the per-team kickoff cutoff only
-- applies while the picks are still an editable draft.
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

  -- Cutoff applies only while teams are still being finalized (draft). A
  -- committed entry locked its teams already, so pool entry is unrestricted.
  if v_entry.status = 'draft' and exists (
    select 1
    from public.worldcup_entry_teams et
    join lateral (
      select m.kickoff_at
      from public.worldcup_matches m
      where m.tournament_id = p_tournament_id
        and m.stage_id = 'group_stage'
        and (m.home_team_id = et.team_id or m.away_team_id = et.team_id)
      order by m.kickoff_at
      limit 1
    ) first_match on true
    where et.entry_id = v_entry.id
      and first_match.kickoff_at is not null
      and now() >= first_match.kickoff_at - interval '1 minute'
  ) then
    raise exception 'TEAM_SELECTION_CLOSED';
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

-- Backfill snapshots for any already-completed matches so existing entries pick
-- up the widened status set immediately.
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

revoke execute on function public.worldcup_save_draft_entry(uuid, uuid, text, text[], text, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_save_draft_entry(uuid, uuid, text, text[], text, uuid)
  to service_role;

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
