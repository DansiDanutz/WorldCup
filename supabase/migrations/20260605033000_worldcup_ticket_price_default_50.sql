-- Ticket price default and zero-price repair --------------------------------
--
-- Admin controls the ticket price. The default is 50 USD/USDT, and zero is
-- not a valid live ticket price because wallet purchases, admin assignments,
-- and prize-pool accounting all depend on this value.

alter table public.worldcup_tournaments
  alter column ticket_price_amount set default 50.00;

alter table public.worldcup_tickets
  alter column price_amount set default 50.00;

alter table public.worldcup_ticket_financial_movements
  alter column ticket_price_amount set default 50.00;

update public.worldcup_tournaments
   set ticket_price_amount = 50.00,
       updated_at = now()
 where coalesce(ticket_price_amount, 0) <= 0;

update public.worldcup_tickets t
   set price_amount = tour.ticket_price_amount
  from public.worldcup_tournaments tour
 where t.tournament_id = tour.id
   and coalesce(t.price_amount, 0) <= 0
   and tour.ticket_price_amount > 0;

update public.worldcup_ticket_financial_movements m
   set ticket_price_amount = tour.ticket_price_amount,
       total_amount = round((tour.ticket_price_amount * m.quantity)::numeric, 2)
  from public.worldcup_tournaments tour
 where m.tournament_id = tour.id
   and m.movement_type in ('admin_to_agent', 'admin_to_user')
   and coalesce(m.ticket_price_amount, 0) <= 0
   and tour.ticket_price_amount > 0;

-- Reconcile existing admin-outgoing movements after repairing zero prices.
do $$
declare
  r record;
  v_accounting jsonb;
  v_gross_amount numeric(12,2);
  v_prize_contribution numeric(12,2);
  v_fee_contribution numeric(12,2);
  v_existing_prize_contribution numeric(12,2);
  v_existing_fee_contribution numeric(12,2);
  v_delta_prize numeric(12,2);
  v_delta_fee numeric(12,2);
begin
  for r in
    select *
    from public.worldcup_ticket_financial_movements
    where movement_type in ('admin_to_agent', 'admin_to_user')
  loop
    v_accounting := public.worldcup_admin_ticket_movement_value(
      r.quantity,
      r.ticket_price_amount,
      r.total_amount,
      r.metadata
    );
    v_gross_amount := (v_accounting ->> 'accountedGrossAmount')::numeric;

    if v_gross_amount <= 0 then
      continue;
    end if;

    v_prize_contribution := round((v_gross_amount * 0.80)::numeric, 2);
    v_fee_contribution := round((v_gross_amount - v_prize_contribution)::numeric, 2);

    select amount
      into v_existing_prize_contribution
      from public.worldcup_prize_pool_contributions
     where tournament_id = r.tournament_id
       and source_type = 'admin_ticket_movement'
       and source_id = r.id;

    if v_existing_prize_contribution is null then
      v_existing_prize_contribution := case
        when coalesce(r.metadata ->> 'prizePoolContribution', '') ~ '^[0-9]+(\.[0-9]+)?$'
          then (r.metadata ->> 'prizePoolContribution')::numeric
        else 0
      end;
    end if;

    select amount
      into v_existing_fee_contribution
      from public.worldcup_fee_pool_contributions
     where tournament_id = r.tournament_id
       and source_type = 'admin_ticket_movement'
       and source_id = r.id;

    if v_existing_fee_contribution is null then
      v_existing_fee_contribution := case
        when coalesce(r.metadata ->> 'feePoolContribution', '') ~ '^[0-9]+(\.[0-9]+)?$'
          then (r.metadata ->> 'feePoolContribution')::numeric
        else 0
      end;
    end if;

    v_delta_prize := v_prize_contribution - coalesce(v_existing_prize_contribution, 0);
    v_delta_fee := v_fee_contribution - coalesce(v_existing_fee_contribution, 0);

    insert into public.worldcup_prize_pool_contributions (
      tournament_id, source_type, source_id, gross_amount, amount, metadata
    )
    values (
      r.tournament_id,
      'admin_ticket_movement',
      r.id,
      v_gross_amount,
      v_prize_contribution,
      coalesce(r.metadata, '{}'::jsonb)
        || v_accounting
        || jsonb_build_object(
          'movementType', r.movement_type,
          'paymentMethod', r.payment_method,
          'splitPercent', 80,
          'accountingPolicy', 'ticket_price_default_50_repair',
          'reconciledAt', now()
        )
    )
    on conflict (tournament_id, source_type, source_id) where source_id is not null
    do update set
      gross_amount = excluded.gross_amount,
      amount = excluded.amount,
      metadata = excluded.metadata;

    insert into public.worldcup_fee_pool_contributions (
      tournament_id, source_type, source_id, gross_amount, amount, metadata
    )
    values (
      r.tournament_id,
      'admin_ticket_movement',
      r.id,
      v_gross_amount,
      v_fee_contribution,
      coalesce(r.metadata, '{}'::jsonb)
        || v_accounting
        || jsonb_build_object(
          'movementType', r.movement_type,
          'paymentMethod', r.payment_method,
          'splitPercent', 20,
          'accountingPolicy', 'ticket_price_default_50_repair',
          'reconciledAt', now()
        )
    )
    on conflict (tournament_id, source_type, source_id) where source_id is not null
    do update set
      gross_amount = excluded.gross_amount,
      amount = excluded.amount,
      metadata = excluded.metadata;

    update public.worldcup_ticket_financial_movements
       set metadata = coalesce(metadata, '{}'::jsonb)
         || v_accounting
         || jsonb_build_object(
           'prizePoolContribution', v_prize_contribution,
           'feePoolContribution', v_fee_contribution,
           'accountingPolicy', 'ticket_price_default_50_repair'
         )
     where id = r.id;

    if v_delta_prize <> 0 or v_delta_fee <> 0 then
      update public.worldcup_tournaments
         set prize_pool_amount = greatest(0, prize_pool_amount + v_delta_prize),
             fee_pool_amount = greatest(0, fee_pool_amount + v_delta_fee),
             updated_at = now()
       where id = r.tournament_id;
    end if;
  end loop;
end;
$$;

-- Reconcile existing direct wallet purchases after repairing zero prices.
do $$
declare
  r record;
  v_gross_amount numeric(12,2);
  v_prize_contribution numeric(12,2);
  v_fee_contribution numeric(12,2);
  v_existing_prize_contribution numeric(12,2);
  v_existing_fee_contribution numeric(12,2);
  v_delta_prize numeric(12,2);
  v_delta_fee numeric(12,2);
begin
  for r in
    select *
    from public.worldcup_tickets
    where assigned_by = 'wallet'
      and price_amount > 0
  loop
    v_gross_amount := round(r.price_amount::numeric, 2);
    v_prize_contribution := round((v_gross_amount * 0.80)::numeric, 2);
    v_fee_contribution := round((v_gross_amount - v_prize_contribution)::numeric, 2);

    select amount
      into v_existing_prize_contribution
      from public.worldcup_prize_pool_contributions
     where tournament_id = r.tournament_id
       and source_type = 'wallet_ticket'
       and source_id = r.id;

    select amount
      into v_existing_fee_contribution
      from public.worldcup_fee_pool_contributions
     where tournament_id = r.tournament_id
       and source_type = 'wallet_ticket'
       and source_id = r.id;

    v_delta_prize := v_prize_contribution - coalesce(v_existing_prize_contribution, 0);
    v_delta_fee := v_fee_contribution - coalesce(v_existing_fee_contribution, 0);

    insert into public.worldcup_prize_pool_contributions (
      tournament_id, source_type, source_id, gross_amount, amount, metadata
    )
    values (
      r.tournament_id,
      'wallet_ticket',
      r.id,
      v_gross_amount,
      v_prize_contribution,
      jsonb_build_object(
        'ticketId', r.id,
        'splitPercent', 80,
        'accountingPolicy', 'ticket_price_default_50_repair',
        'reconciledAt', now()
      )
    )
    on conflict (tournament_id, source_type, source_id) where source_id is not null
    do update set
      gross_amount = excluded.gross_amount,
      amount = excluded.amount,
      metadata = excluded.metadata;

    insert into public.worldcup_fee_pool_contributions (
      tournament_id, source_type, source_id, gross_amount, amount, metadata
    )
    values (
      r.tournament_id,
      'wallet_ticket',
      r.id,
      v_gross_amount,
      v_fee_contribution,
      jsonb_build_object(
        'ticketId', r.id,
        'splitPercent', 20,
        'accountingPolicy', 'ticket_price_default_50_repair',
        'reconciledAt', now()
      )
    )
    on conflict (tournament_id, source_type, source_id) where source_id is not null
    do update set
      gross_amount = excluded.gross_amount,
      amount = excluded.amount,
      metadata = excluded.metadata;

    if v_delta_prize <> 0 or v_delta_fee <> 0 then
      update public.worldcup_tournaments
         set prize_pool_amount = greatest(0, prize_pool_amount + v_delta_prize),
             fee_pool_amount = greatest(0, fee_pool_amount + v_delta_fee),
             updated_at = now()
       where id = r.tournament_id;
    end if;
  end loop;
end;
$$;

create or replace function public.worldcup_redeem_ticket_code(
  p_code text,
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code record;
  v_ticket_id uuid;
  v_agent_referral_code text;
  v_ticket_price numeric(12,2);
begin
  select * into v_code
  from public.worldcup_ticket_codes
  where code = upper(trim(p_code))
  for update;

  if not found then
    raise exception 'INVALID_CODE';
  end if;
  if v_code.status = 'redeemed' then
    raise exception 'ALREADY_CLAIMED';
  end if;
  if v_code.status <> 'assigned' then
    raise exception 'CODE_NOT_ACTIVE';
  end if;

  select referral_code into v_agent_referral_code
  from public.worldcup_referral_profiles
  where user_id = v_code.agent_user_id;

  if v_code.agent_user_id is not null and v_agent_referral_code is null then
    raise exception 'AGENT_PROFILE_NOT_FOUND';
  end if;

  select ticket_price_amount into v_ticket_price
  from public.worldcup_tournaments
  where id = v_code.tournament_id;

  if v_ticket_price is null or v_ticket_price <= 0 then
    raise exception 'INVALID_TICKET_PRICE';
  end if;

  insert into public.worldcup_tickets (
    tournament_id,
    user_id,
    price_amount,
    assigned_by,
    source_agent_id,
    source_referrer_user_id,
    source_referral_code
  )
  values (
    v_code.tournament_id,
    p_user_id,
    v_ticket_price,
    'agent_code',
    v_code.agent_user_id,
    v_code.agent_user_id,
    v_agent_referral_code
  )
  returning id into v_ticket_id;

  update public.worldcup_ticket_codes
     set status = 'redeemed',
         redeemed_by_user_id = p_user_id,
         redeemed_at = now(),
         ticket_id = v_ticket_id
   where id = v_code.id;

  return v_ticket_id;
end;
$$;

create or replace function public.worldcup_accept_agent_ticket_request(
  p_request_id uuid,
  p_agent_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request record;
  v_code record;
  v_ticket_id uuid;
  v_agent_referral_code text;
  v_ticket_price numeric(12,2);
begin
  select * into v_request
  from public.worldcup_agent_ticket_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND';
  end if;
  if v_request.agent_user_id <> p_agent_user_id then
    raise exception 'AGENT_MISMATCH';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'REQUEST_NOT_PENDING';
  end if;
  if v_request.expires_at <= now() then
    update public.worldcup_agent_ticket_requests
       set status = 'expired',
           updated_at = now()
     where id = p_request_id;
    raise exception 'REQUEST_EXPIRED';
  end if;

  perform 1 from public.worldcup_agents
  where tournament_id = v_request.tournament_id
    and user_id = p_agent_user_id
    and active = true;

  if not found then
    raise exception 'AGENT_NOT_FOUND';
  end if;

  select referral_code into v_agent_referral_code
  from public.worldcup_referral_profiles
  where user_id = p_agent_user_id;

  if v_agent_referral_code is null then
    raise exception 'AGENT_PROFILE_NOT_FOUND';
  end if;

  select ticket_price_amount into v_ticket_price
  from public.worldcup_tournaments
  where id = v_request.tournament_id;

  if v_ticket_price is null or v_ticket_price <= 0 then
    raise exception 'INVALID_TICKET_PRICE';
  end if;

  select * into v_code
  from public.worldcup_ticket_codes
  where tournament_id = v_request.tournament_id
    and agent_user_id = p_agent_user_id
    and status = 'assigned'
  order by assigned_at asc
  limit 1
  for update skip locked;

  if not found then
    raise exception 'AGENT_NO_TICKETS';
  end if;

  insert into public.worldcup_tickets (
    tournament_id,
    user_id,
    price_amount,
    assigned_by,
    source_agent_id,
    source_referrer_user_id,
    source_referral_code
  )
  values (
    v_request.tournament_id,
    v_request.requester_user_id,
    v_ticket_price,
    'agent_call',
    p_agent_user_id,
    p_agent_user_id,
    v_agent_referral_code
  )
  returning id into v_ticket_id;

  update public.worldcup_ticket_codes
     set status = 'redeemed',
         redeemed_by_user_id = v_request.requester_user_id,
         redeemed_at = now(),
         ticket_id = v_ticket_id
   where id = v_code.id;

  update public.worldcup_agent_ticket_requests
     set status = 'accepted',
         accepted_at = now(),
         accepted_ticket_code_id = v_code.id,
         ticket_id = v_ticket_id,
         updated_at = now()
   where id = p_request_id;

  return jsonb_build_object(
    'requestId', p_request_id,
    'ticketId', v_ticket_id,
    'codeId', v_code.id
  );
end;
$$;

create or replace function public.worldcup_agent_transfer_ticket(
  p_tournament_id uuid,
  p_agent_user_id uuid,
  p_to_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code record;
  v_ticket_id uuid;
  v_agent_referral_code text;
  v_ticket_price numeric(12,2);
begin
  if p_agent_user_id = p_to_user_id then
    raise exception 'SAME_ACCOUNT';
  end if;

  perform pg_advisory_xact_lock(
    hashtext('agent-ticket-transfer:' || p_tournament_id::text || ':' || p_agent_user_id::text)
  );

  perform 1 from public.worldcup_referral_profiles where user_id = p_to_user_id;
  if not found then
    raise exception 'RECIPIENT_NOT_FOUND';
  end if;

  perform 1 from public.worldcup_agents
  where tournament_id = p_tournament_id
    and user_id = p_agent_user_id
    and active = true;

  if not found then
    raise exception 'AGENT_NOT_FOUND';
  end if;

  select referral_code into v_agent_referral_code
  from public.worldcup_referral_profiles
  where user_id = p_agent_user_id;

  if v_agent_referral_code is null then
    raise exception 'AGENT_PROFILE_NOT_FOUND';
  end if;

  select ticket_price_amount into v_ticket_price
  from public.worldcup_tournaments
  where id = p_tournament_id;

  if v_ticket_price is null or v_ticket_price <= 0 then
    raise exception 'INVALID_TICKET_PRICE';
  end if;

  select * into v_code
  from public.worldcup_ticket_codes
  where tournament_id = p_tournament_id
    and agent_user_id = p_agent_user_id
    and status = 'assigned'
  order by assigned_at asc
  limit 1
  for update skip locked;

  if not found then
    raise exception 'AGENT_NO_TICKETS';
  end if;

  insert into public.worldcup_tickets (
    tournament_id,
    user_id,
    price_amount,
    assigned_by,
    source_agent_id,
    source_referrer_user_id,
    source_referral_code
  )
  values (
    p_tournament_id,
    p_to_user_id,
    v_ticket_price,
    'agent_transfer',
    p_agent_user_id,
    p_agent_user_id,
    v_agent_referral_code
  )
  returning id into v_ticket_id;

  update public.worldcup_ticket_codes
     set status = 'redeemed',
         redeemed_by_user_id = p_to_user_id,
         redeemed_at = now(),
         ticket_id = v_ticket_id
   where id = v_code.id;

  return jsonb_build_object(
    'ticketId', v_ticket_id,
    'codeId', v_code.id
  );
end;
$$;

revoke execute on function public.worldcup_redeem_ticket_code(text, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_redeem_ticket_code(text, uuid)
  to service_role;

revoke execute on function public.worldcup_accept_agent_ticket_request(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_accept_agent_ticket_request(uuid, uuid)
  to service_role;

revoke execute on function public.worldcup_agent_transfer_ticket(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_agent_transfer_ticket(uuid, uuid, uuid)
  to service_role;
