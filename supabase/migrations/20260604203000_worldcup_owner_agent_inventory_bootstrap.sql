-- Owner bootstrap inventory -------------------------------------------------
--
-- The owner account must always be usable as a normal player and as an active
-- agent. When 1000 paid units are assigned to a new agent account, reserve one
-- normal user ticket first; the remaining 999 become sellable agent codes. If
-- the owner already has a personal ticket or entry, all 1000 paid units stay in
-- the agent account.

alter table public.worldcup_agents
  add column if not exists contact_name text,
  add column if not exists whatsapp_number text,
  add column if not exists registered_at timestamptz not null default now(),
  add column if not exists activated_at timestamptz;

update public.worldcup_agents
   set registered_at = coalesce(registered_at, created_at),
       activated_at = case
         when active then coalesce(activated_at, updated_at, created_at, now())
         else activated_at
       end;

create or replace function public.worldcup_bootstrap_owner_agent_inventory(
  p_owner_email text default 'semebitcoin@gmail.com',
  p_quantity integer default 1000,
  p_created_by text default 'owner-bootstrap'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tournament_id uuid;
  v_user_id uuid;
  v_email text;
  v_display_name text;
  v_created_by text := coalesce(nullif(trim(p_created_by), ''), 'owner-bootstrap');
  v_has_personal_ticket boolean := false;
  v_final_has_personal_ticket boolean := false;
  v_existing_paid integer := 0;
  v_final_paid integer := 0;
  v_missing_paid integer := 0;
  v_target_paid integer := 0;
  v_assign_quantity integer := 0;
  v_assignment jsonb := '{}'::jsonb;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 1000 then
    raise exception 'INVALID_QUANTITY';
  end if;

  if nullif(trim(p_owner_email), '') is null then
    raise exception 'OWNER_EMAIL_REQUIRED';
  end if;

  select id into v_tournament_id
  from public.worldcup_tournaments
  where slug = 'fifa-world-cup-2026';

  if v_tournament_id is null then
    return jsonb_build_object(
      'ok', false,
      'reason', 'TOURNAMENT_NOT_FOUND',
      'ownerEmail', lower(trim(p_owner_email))
    );
  end if;

  select user_id, email, display_name
    into v_user_id, v_email, v_display_name
  from public.worldcup_referral_profiles
  where lower(email) = lower(trim(p_owner_email))
  order by updated_at desc nulls last, created_at desc
  limit 1;

  if v_user_id is null then
    return jsonb_build_object(
      'ok', false,
      'reason', 'PROFILE_NOT_FOUND',
      'ownerEmail', lower(trim(p_owner_email)),
      'tournamentId', v_tournament_id
    );
  end if;

  perform pg_advisory_xact_lock(hashtext(v_tournament_id::text || ':' || v_user_id::text || ':owner-agent-bootstrap'));

  insert into public.worldcup_agents (
    tournament_id,
    user_id,
    email,
    display_name,
    active,
    created_by,
    registered_at,
    activated_at,
    updated_at
  )
  values (
    v_tournament_id,
    v_user_id,
    v_email,
    v_display_name,
    true,
    v_created_by,
    now(),
    now(),
    now()
  )
  on conflict (tournament_id, user_id)
  do update set
    email = excluded.email,
    display_name = excluded.display_name,
    active = true,
    activated_at = coalesce(public.worldcup_agents.activated_at, now()),
    updated_at = now();

  select exists (
    select 1
    from public.worldcup_tickets
    where tournament_id = v_tournament_id
      and user_id = v_user_id
    union all
    select 1
    from public.worldcup_entries
    where tournament_id = v_tournament_id
      and user_id = v_user_id
  )
  into v_has_personal_ticket;

  select count(*) into v_existing_paid
  from public.worldcup_ticket_codes
  where tournament_id = v_tournament_id
    and agent_user_id = v_user_id
    and kind = 'paid';

  v_target_paid := case
    when v_has_personal_ticket then p_quantity
    else greatest(p_quantity - 1, 0)
  end;
  v_missing_paid := greatest(v_target_paid - v_existing_paid, 0);
  v_assign_quantity := v_missing_paid;

  if not v_has_personal_ticket then
    v_assign_quantity := v_assign_quantity + 1;
  end if;

  if v_assign_quantity > 0 then
    select public.worldcup_agent_assign_codes(
      v_user_id,
      v_tournament_id,
      v_assign_quantity,
      v_created_by
    )
    into v_assignment;
  end if;

  select count(*) into v_final_paid
  from public.worldcup_ticket_codes
  where tournament_id = v_tournament_id
    and agent_user_id = v_user_id
    and kind = 'paid';

  select exists (
    select 1
    from public.worldcup_tickets
    where tournament_id = v_tournament_id
      and user_id = v_user_id
    union all
    select 1
    from public.worldcup_entries
    where tournament_id = v_tournament_id
      and user_id = v_user_id
  )
  into v_final_has_personal_ticket;

  return jsonb_build_object(
    'ok', true,
    'ownerEmail', lower(trim(p_owner_email)),
    'tournamentId', v_tournament_id,
    'userId', v_user_id,
    'hadPersonalTicket', v_has_personal_ticket,
    'hasPersonalTicket', v_final_has_personal_ticket,
    'existingPaidAgentTickets', v_existing_paid,
    'targetPaidAgentTickets', v_target_paid,
    'assignedQuantity', v_assign_quantity,
    'finalPaidAgentTickets', v_final_paid,
    'assignment', v_assignment
  );
end;
$$;

revoke execute on function public.worldcup_bootstrap_owner_agent_inventory(text, integer, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_bootstrap_owner_agent_inventory(text, integer, text)
  to service_role;

select public.worldcup_bootstrap_owner_agent_inventory('semebitcoin@gmail.com', 1000, 'owner-bootstrap');
