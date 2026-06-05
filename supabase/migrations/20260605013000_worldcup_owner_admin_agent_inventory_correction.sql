-- Owner admin/agent inventory correction -----------------------------------
--
-- semebitcoin@gmail.com is the owner admin, a normal user, and an agent. The
-- large ticket pool must remain in admin inventory; only the first 100 owner
-- units are allocated to agent/user use:
--   1 personal user ticket
--   99 paid sellable agent tickets
--   9 free commission sellable agent tickets
--
-- Any extra assigned owner-agent codes are returned to the owner admin
-- inventory and recorded as a zero-value admin_request movement.

create or replace function public.worldcup_bootstrap_owner_agent_inventory(
  p_owner_email text default 'semebitcoin@gmail.com',
  p_quantity integer default 100,
  p_created_by text default 'owner-admin-normalization'
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
  v_created_by text := coalesce(nullif(trim(p_created_by), ''), 'owner-admin-normalization');
  v_had_personal_ticket boolean := false;
  v_final_has_personal_ticket boolean := false;
  v_existing_paid integer := 0;
  v_existing_commission integer := 0;
  v_final_paid integer := 0;
  v_final_commission integer := 0;
  v_missing_paid integer := 0;
  v_missing_commission integer := 0;
  v_assigned_commission integer := 0;
  v_target_paid integer := 0;
  v_target_commission integer := 0;
  v_personal_ticket_assigned integer := 0;
  v_released_paid integer := 0;
  v_released_commission integer := 0;
  v_ticket_price numeric(12,2);
  v_assignment jsonb := '{}'::jsonb;
  v_returned_code_ids uuid[] := '{}'::uuid[];
  v_returned_ticket_numbers jsonb := '[]'::jsonb;
  v_return_movement_id uuid;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 1000 then
    raise exception 'INVALID_QUANTITY';
  end if;

  if nullif(trim(p_owner_email), '') is null then
    raise exception 'OWNER_EMAIL_REQUIRED';
  end if;

  select id, ticket_price_amount
    into v_tournament_id, v_ticket_price
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

  perform pg_advisory_xact_lock(hashtext(v_tournament_id::text || ':admin-ticket-inventory'));
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
  into v_had_personal_ticket;

  if not v_had_personal_ticket then
    insert into public.worldcup_tickets (
      tournament_id,
      user_id,
      price_amount,
      assigned_by
    )
    values (
      v_tournament_id,
      v_user_id,
      coalesce(v_ticket_price, 0),
      v_created_by || ':agent_personal_reserve'
    );

    v_personal_ticket_assigned := 1;
  end if;

  v_target_paid := greatest(p_quantity - 1, 0);
  v_target_commission := floor(v_target_paid / 10)::integer;

  select count(*) into v_existing_paid
  from public.worldcup_ticket_codes
  where tournament_id = v_tournament_id
    and agent_user_id = v_user_id
    and kind = 'paid'
    and status = 'assigned';

  if v_existing_paid > v_target_paid then
    with released as (
      select id
      from public.worldcup_ticket_codes
      where tournament_id = v_tournament_id
        and agent_user_id = v_user_id
        and kind = 'paid'
        and status = 'assigned'
      order by ticket_number desc
      limit (v_existing_paid - v_target_paid)
      for update skip locked
    ),
    updated as (
      update public.worldcup_ticket_codes c
         set status = 'admin',
             kind = null,
             agent_user_id = null,
             assigned_at = null,
             admin_user_id = v_user_id,
             admin_assigned_at = now()
      from released
      where c.id = released.id
      returning c.id, c.ticket_number, c.code
    )
    select
      count(*)::integer,
      coalesce(array_agg(id order by ticket_number), '{}'::uuid[]),
      coalesce(
        jsonb_agg(jsonb_build_object('ticketNumber', ticket_number, 'code', code) order by ticket_number),
        '[]'::jsonb
      )
    into v_released_paid, v_returned_code_ids, v_returned_ticket_numbers
    from updated;

    if v_released_paid < (v_existing_paid - v_target_paid) then
      raise exception 'CANNOT_RELEASE_AGENT_CODES';
    end if;
  end if;

  select count(*) into v_existing_paid
  from public.worldcup_ticket_codes
  where tournament_id = v_tournament_id
    and agent_user_id = v_user_id
    and kind = 'paid'
    and status = 'assigned';

  v_missing_paid := greatest(v_target_paid - v_existing_paid, 0);

  if v_missing_paid > 0 then
    with picked as (
      select id
      from public.worldcup_ticket_codes
      where tournament_id = v_tournament_id
        and admin_user_id = v_user_id
        and status = 'admin'
      order by ticket_number asc
      limit v_missing_paid
      for update skip locked
    ),
    updated as (
      update public.worldcup_ticket_codes c
         set status = 'assigned',
             agent_user_id = v_user_id,
             kind = 'paid',
             assigned_at = now()
      from picked
      where c.id = picked.id
      returning c.id, c.ticket_number, c.code
    )
    select jsonb_build_object(
      'assigned', count(*)::integer,
      'paidTickets', count(*)::integer,
      'ticketNumbers', coalesce(
        jsonb_agg(jsonb_build_object('ticketNumber', ticket_number, 'code', code) order by ticket_number),
        '[]'::jsonb
      )
    )
    into v_assignment
    from updated;

    if coalesce((v_assignment->>'assigned')::integer, 0) < v_missing_paid then
      raise exception 'INSUFFICIENT_ADMIN_CODES';
    end if;
  end if;

  select count(*) into v_existing_commission
  from public.worldcup_ticket_codes
  where tournament_id = v_tournament_id
    and agent_user_id = v_user_id
    and kind = 'commission'
    and status = 'assigned';

  if v_existing_commission > v_target_commission then
    with released as (
      select id
      from public.worldcup_ticket_codes
      where tournament_id = v_tournament_id
        and agent_user_id = v_user_id
        and kind = 'commission'
        and status = 'assigned'
      order by ticket_number desc
      limit (v_existing_commission - v_target_commission)
      for update skip locked
    ),
    updated as (
      update public.worldcup_ticket_codes c
         set status = 'admin',
             kind = null,
             agent_user_id = null,
             assigned_at = null,
             admin_user_id = v_user_id,
             admin_assigned_at = now()
      from released
      where c.id = released.id
      returning c.id, c.ticket_number, c.code
    ),
    merged as (
      select id, ticket_number, code from updated
      union all
      select id, ticket_number, code
      from public.worldcup_ticket_codes
      where id = any(v_returned_code_ids)
    )
    select
      v_released_paid + count(updated.id)::integer,
      coalesce(array_agg(merged.id order by merged.ticket_number), '{}'::uuid[]),
      coalesce(
        jsonb_agg(jsonb_build_object('ticketNumber', merged.ticket_number, 'code', merged.code) order by merged.ticket_number),
        '[]'::jsonb
      )
    into v_released_commission, v_returned_code_ids, v_returned_ticket_numbers
    from merged
    left join updated on updated.id = merged.id;

    v_released_commission := greatest(v_released_commission - v_released_paid, 0);

    if v_released_commission < (v_existing_commission - v_target_commission) then
      raise exception 'CANNOT_RELEASE_COMMISSION_CODES';
    end if;
  end if;

  select count(*) into v_existing_commission
  from public.worldcup_ticket_codes
  where tournament_id = v_tournament_id
    and agent_user_id = v_user_id
    and kind = 'commission'
    and status = 'assigned';

  v_missing_commission := greatest(v_target_commission - v_existing_commission, 0);

  if v_missing_commission > 0 then
    with picked as (
      select id
      from public.worldcup_ticket_codes
      where tournament_id = v_tournament_id
        and admin_user_id = v_user_id
        and status = 'admin'
      order by ticket_number asc
      limit v_missing_commission
      for update skip locked
    ),
    updated as (
      update public.worldcup_ticket_codes c
         set status = 'assigned',
             agent_user_id = v_user_id,
             kind = 'commission',
             assigned_at = now()
      from picked
      where c.id = picked.id
      returning c.id
    )
    select count(*)::integer into v_assigned_commission
    from updated;

    if v_assigned_commission < v_missing_commission then
      raise exception 'INSUFFICIENT_ADMIN_CODES';
    end if;

    v_assignment := coalesce(v_assignment, '{}'::jsonb)
      || jsonb_build_object('commissionAssigned', v_assigned_commission);
  end if;

  if coalesce(array_length(v_returned_code_ids, 1), 0) > 0 then
    insert into public.worldcup_ticket_financial_movements (
      tournament_id,
      movement_type,
      payment_method,
      source_admin_user_id,
      quantity,
      ticket_price_amount,
      total_amount,
      note,
      metadata,
      created_by
    )
    values (
      v_tournament_id,
      'admin_request',
      'internal',
      v_user_id,
      array_length(v_returned_code_ids, 1),
      0,
      0,
      'Owner correction returned excess agent inventory to admin.',
      jsonb_build_object(
        'reason', 'owner_admin_agent_inventory_correction',
        'targetPaidAgentTickets', v_target_paid,
        'targetCommissionTickets', v_target_commission,
        'releasedPaidAgentTickets', v_released_paid,
        'releasedCommissionTickets', v_released_commission,
        'ticketNumbers', v_returned_ticket_numbers
      ),
      v_created_by
    )
    returning id into v_return_movement_id;

    insert into public.worldcup_ticket_financial_movement_codes (
      movement_id,
      ticket_code_id,
      ticket_number,
      code,
      movement_role
    )
    select
      v_return_movement_id,
      id,
      ticket_number,
      code,
      'admin_inventory'
    from public.worldcup_ticket_codes
    where id = any(v_returned_code_ids)
    order by ticket_number asc
    on conflict do nothing;
  end if;

  select count(*) into v_final_paid
  from public.worldcup_ticket_codes
  where tournament_id = v_tournament_id
    and agent_user_id = v_user_id
    and kind = 'paid'
    and status = 'assigned';

  select count(*) into v_final_commission
  from public.worldcup_ticket_codes
  where tournament_id = v_tournament_id
    and agent_user_id = v_user_id
    and kind = 'commission'
    and status = 'assigned';

  update public.worldcup_agents
     set paid_tickets = v_final_paid,
         commission_tickets = v_final_commission,
         active = true,
         activated_at = coalesce(activated_at, now()),
         updated_at = now()
   where user_id = v_user_id and tournament_id = v_tournament_id;

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
    'hadPersonalTicket', v_had_personal_ticket,
    'hasPersonalTicket', v_final_has_personal_ticket,
    'personalTicketAssigned', v_personal_ticket_assigned,
    'targetPaidAgentTickets', v_target_paid,
    'targetCommissionTickets', v_target_commission,
    'finalPaidAgentTickets', v_final_paid,
    'finalCommissionTickets', v_final_commission,
    'releasedPaidAgentTickets', v_released_paid,
    'releasedCommissionTickets', v_released_commission,
    'assignedCommissionTickets', v_assigned_commission,
    'returnedToAdminInventory', coalesce(array_length(v_returned_code_ids, 1), 0),
    'returnMovementId', v_return_movement_id,
    'assignment', v_assignment
  );
end;
$$;

revoke execute on function public.worldcup_bootstrap_owner_agent_inventory(text, integer, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_bootstrap_owner_agent_inventory(text, integer, text)
  to service_role;

select public.worldcup_bootstrap_owner_agent_inventory('semebitcoin@gmail.com', 100, 'owner-admin-normalization');
