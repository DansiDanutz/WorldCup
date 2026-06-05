-- Admin-outgoing ticket pool accounting -------------------------------------
--
-- Every ticket code that leaves admin inventory carries value for the pool:
-- paid user tickets, paid agent tickets, the agent's first personal ticket,
-- and commission/bonus tickets. The bonus tickets are affiliate acquisition
-- cost funded by the 20% fee model, so they must be visible in both the
-- prize-pool and fee-pool ledgers.

create or replace function public.worldcup_admin_ticket_movement_value(
  p_quantity integer,
  p_ticket_price_amount numeric,
  p_total_amount numeric,
  p_metadata jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  v_paid_quantity integer := greatest(coalesce(p_quantity, 0), 0);
  v_bonus_quantity integer := 0;
  v_commission_text text := coalesce(v_metadata ->> 'commissionAwarded', '');
  v_ticket_price numeric(12,2) := greatest(coalesce(p_ticket_price_amount, 0), 0);
  v_paid_gross_amount numeric(12,2) := greatest(coalesce(p_total_amount, 0), 0);
  v_bonus_gross_amount numeric(12,2);
  v_accounted_gross_amount numeric(12,2);
begin
  if v_commission_text ~ '^[0-9]+$' then
    v_bonus_quantity := v_commission_text::integer;
  elsif jsonb_typeof(v_metadata -> 'commissionTicketNumbers') = 'array' then
    v_bonus_quantity := jsonb_array_length(v_metadata -> 'commissionTicketNumbers');
  end if;

  v_bonus_gross_amount := round((v_ticket_price * v_bonus_quantity)::numeric, 2);
  v_accounted_gross_amount := round((v_paid_gross_amount + v_bonus_gross_amount)::numeric, 2);

  return jsonb_build_object(
    'paidQuantity', v_paid_quantity,
    'bonusQuantity', v_bonus_quantity,
    'accountedQuantity', v_paid_quantity + v_bonus_quantity,
    'paidGrossAmount', v_paid_gross_amount,
    'bonusGrossAmount', v_bonus_gross_amount,
    'accountedGrossAmount', v_accounted_gross_amount
  );
end;
$$;

create or replace function public.worldcup_apply_admin_ticket_prize_pool()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_accounting jsonb;
  v_gross_amount numeric(12,2);
  v_prize_contribution numeric(12,2);
  v_fee_contribution numeric(12,2);
begin
  if new.movement_type not in ('admin_to_agent', 'admin_to_user') then
    return new;
  end if;

  if new.id is null then
    new.id := gen_random_uuid();
  end if;

  v_accounting := public.worldcup_admin_ticket_movement_value(
    new.quantity,
    new.ticket_price_amount,
    new.total_amount,
    new.metadata
  );
  v_gross_amount := (v_accounting ->> 'accountedGrossAmount')::numeric;

  if v_gross_amount <= 0 then
    return new;
  end if;

  v_prize_contribution := round((v_gross_amount * 0.80)::numeric, 2);
  v_fee_contribution := round((v_gross_amount - v_prize_contribution)::numeric, 2);

  update public.worldcup_tournaments
     set prize_pool_amount = prize_pool_amount + v_prize_contribution,
         fee_pool_amount = fee_pool_amount + v_fee_contribution,
         updated_at = now()
   where id = new.tournament_id;

  insert into public.worldcup_prize_pool_contributions (
    tournament_id, source_type, source_id, gross_amount, amount, metadata
  )
  values (
    new.tournament_id,
    'admin_ticket_movement',
    new.id,
    v_gross_amount,
    v_prize_contribution,
    coalesce(new.metadata, '{}'::jsonb)
      || v_accounting
      || jsonb_build_object(
        'movementType', new.movement_type,
        'paymentMethod', new.payment_method,
        'splitPercent', 80,
        'accountingPolicy', 'all_admin_outgoing_codes'
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
    new.tournament_id,
    'admin_ticket_movement',
    new.id,
    v_gross_amount,
    v_fee_contribution,
    coalesce(new.metadata, '{}'::jsonb)
      || v_accounting
      || jsonb_build_object(
        'movementType', new.movement_type,
        'paymentMethod', new.payment_method,
        'splitPercent', 20,
        'accountingPolicy', 'all_admin_outgoing_codes'
      )
  )
  on conflict (tournament_id, source_type, source_id) where source_id is not null
  do update set
    gross_amount = excluded.gross_amount,
    amount = excluded.amount,
    metadata = excluded.metadata;

  new.metadata := coalesce(new.metadata, '{}'::jsonb)
    || v_accounting
    || jsonb_build_object(
      'prizePoolContribution', v_prize_contribution,
      'feePoolContribution', v_fee_contribution,
      'accountingPolicy', 'all_admin_outgoing_codes'
    );

  return new;
end;
$$;

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
          'accountingPolicy', 'all_admin_outgoing_codes',
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
          'accountingPolicy', 'all_admin_outgoing_codes',
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
           'accountingPolicy', 'all_admin_outgoing_codes'
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

revoke execute on function public.worldcup_admin_ticket_movement_value(integer, numeric, numeric, jsonb)
  from public, anon, authenticated;
grant execute on function public.worldcup_admin_ticket_movement_value(integer, numeric, numeric, jsonb)
  to service_role;

revoke execute on function public.worldcup_apply_admin_ticket_prize_pool()
  from public, anon, authenticated;
grant execute on function public.worldcup_apply_admin_ticket_prize_pool()
  to service_role;
