-- Fee pool ledger + referral-tree settlement ------------------------------
--
-- Ticket revenue is split when money-bearing tickets leave admin inventory or
-- are bought from the wallet:
--   80% -> prize pool
--   20% -> fee pool
--
-- Prize settlement pays the weighted top 10 from the already-net prize pool.
-- Referral payout rolls 5% up the inviter tree, but only creates wallet
-- credits when the resulting payout is at least 10 USDT.

alter table public.worldcup_tournaments
  add column if not exists fee_pool_amount numeric(12,2) not null default 0
    check (fee_pool_amount >= 0);

create table if not exists public.worldcup_prize_pool_contributions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  source_type text not null check (source_type in ('wallet_ticket', 'admin_ticket_movement', 'manual')),
  source_id uuid,
  gross_amount numeric(12,2) not null default 0 check (gross_amount >= 0),
  amount numeric(12,2) not null check (amount >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists worldcup_prize_pool_contributions_source_idx
  on public.worldcup_prize_pool_contributions (tournament_id, source_type, source_id)
  where source_id is not null;

create index if not exists worldcup_prize_pool_contributions_tournament_idx
  on public.worldcup_prize_pool_contributions (tournament_id, created_at desc);

alter table public.worldcup_prize_pool_contributions enable row level security;

create table if not exists public.worldcup_fee_pool_contributions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  source_type text not null check (source_type in ('wallet_ticket', 'admin_ticket_movement', 'manual')),
  source_id uuid,
  gross_amount numeric(12,2) not null default 0 check (gross_amount >= 0),
  amount numeric(12,2) not null check (amount >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists worldcup_fee_pool_contributions_source_idx
  on public.worldcup_fee_pool_contributions (tournament_id, source_type, source_id)
  where source_id is not null;

create index if not exists worldcup_fee_pool_contributions_tournament_idx
  on public.worldcup_fee_pool_contributions (tournament_id, created_at desc);

alter table public.worldcup_fee_pool_contributions enable row level security;

alter table public.worldcup_payouts
  add column if not exists source_user_id uuid,
  add column if not exists referral_level integer not null default 0 check (referral_level >= 0),
  add column if not exists gross_amount numeric(12,2),
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists worldcup_payouts_referral_tree_idx
  on public.worldcup_payouts (tournament_id, entry_id, referral_level)
  where payout_type = 'referral';

create or replace function public.worldcup_activate_agent_on_personal_ticket()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gross_amount numeric(12,2);
  v_prize_contribution numeric(12,2);
  v_fee_contribution numeric(12,2);
begin
  perform public.worldcup_ensure_active_agent_for_user(
    new.tournament_id,
    new.user_id,
    coalesce(nullif(trim(new.assigned_by), ''), 'ticket_activation')
  );

  v_gross_amount := coalesce(new.price_amount, 0);
  if new.assigned_by = 'wallet' and v_gross_amount > 0 then
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
      'wallet_ticket',
      new.id,
      v_gross_amount,
      v_prize_contribution,
      jsonb_build_object('ticketId', new.id, 'splitPercent', 80)
    )
    on conflict do nothing;

    insert into public.worldcup_fee_pool_contributions (
      tournament_id, source_type, source_id, gross_amount, amount, metadata
    )
    values (
      new.tournament_id,
      'wallet_ticket',
      new.id,
      v_gross_amount,
      v_fee_contribution,
      jsonb_build_object('ticketId', new.id, 'splitPercent', 20)
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.worldcup_apply_admin_ticket_prize_pool()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
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

  v_gross_amount := coalesce(new.total_amount, 0);
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
    jsonb_build_object(
      'movementType', new.movement_type,
      'paymentMethod', new.payment_method,
      'quantity', new.quantity,
      'splitPercent', 80
    )
  )
  on conflict do nothing;

  insert into public.worldcup_fee_pool_contributions (
    tournament_id, source_type, source_id, gross_amount, amount, metadata
  )
  values (
    new.tournament_id,
    'admin_ticket_movement',
    new.id,
    v_gross_amount,
    v_fee_contribution,
    jsonb_build_object(
      'movementType', new.movement_type,
      'paymentMethod', new.payment_method,
      'quantity', new.quantity,
      'splitPercent', 20
    )
  )
  on conflict do nothing;

  new.metadata := coalesce(new.metadata, '{}'::jsonb)
    || jsonb_build_object(
      'prizePoolContribution', v_prize_contribution,
      'feePoolContribution', v_fee_contribution
    );

  return new;
end;
$$;

create or replace function public.worldcup_record_settlement_payout(
  p_tournament_id uuid,
  p_entry_id uuid,
  p_user_id uuid,
  p_payout_type text,
  p_rank integer,
  p_amount_cents bigint,
  p_note text,
  p_source_user_id uuid default null,
  p_referral_level integer default 0,
  p_gross_amount_cents bigint default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payout_id uuid;
  v_tx_id uuid;
  v_amount numeric(12,2);
  v_gross_amount numeric(12,2);
  v_transaction_type text;
begin
  if p_user_id is null or p_amount_cents is null or p_amount_cents <= 0 then
    return false;
  end if;

  if p_payout_type not in ('prize', 'referral') then
    raise exception 'INVALID_PAYOUT_TYPE';
  end if;

  v_amount := round((p_amount_cents::numeric / 100.0)::numeric, 2);
  v_gross_amount := case
    when p_gross_amount_cents is null then null
    else round((p_gross_amount_cents::numeric / 100.0)::numeric, 2)
  end;
  v_transaction_type := case
    when p_payout_type = 'prize' then 'prize_payout'
    else 'referral_payout'
  end;

  insert into public.worldcup_payouts (
    tournament_id,
    entry_id,
    user_id,
    payout_type,
    rank,
    amount,
    source_user_id,
    referral_level,
    gross_amount,
    metadata
  )
  values (
    p_tournament_id,
    p_entry_id,
    p_user_id,
    p_payout_type,
    p_rank,
    v_amount,
    p_source_user_id,
    coalesce(p_referral_level, 0),
    v_gross_amount,
    jsonb_build_object('minimumPayoutUsdt', case when p_payout_type = 'referral' then 10 else null end)
  )
  on conflict (tournament_id, payout_type, entry_id, user_id) do nothing
  returning id into v_payout_id;

  if v_payout_id is null then
    return false;
  end if;

  insert into public.worldcup_wallet_transactions (
    tournament_id,
    from_user_id,
    to_user_id,
    amount,
    transaction_type,
    note,
    created_by
  )
  values (
    p_tournament_id,
    null,
    p_user_id,
    v_amount,
    v_transaction_type,
    p_note,
    'settlement'
  )
  returning id into v_tx_id;

  update public.worldcup_payouts
     set wallet_transaction_id = v_tx_id
   where id = v_payout_id;

  return true;
end;
$$;

create or replace function public.worldcup_settle_payouts(p_tournament_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_gross numeric(12,2);
  v_net_cents bigint;
  v_participants integer;
  v_paid_places integer;
  v_weights integer[] := array[35, 20, 13, 9, 7, 5, 4, 3, 2, 2];
  v_total_weight integer := 0;
  v_allocated_cents bigint := 0;
  v_created integer := 0;
  v_place_cents bigint;
  v_prize_cents bigint;
  v_direct_referral_cents bigint;
  v_direct_inviter uuid;
  v_direct_fee_percent numeric(5,2);
  v_current_referral_cents bigint;
  v_current_payout_cents bigint;
  v_pass_up_cents bigint;
  v_current_user_id uuid;
  v_next_inviter_id uuid;
  v_source_user_id uuid;
  v_seen_user_ids uuid[] := '{}'::uuid[];
  v_level integer;
  v_min_referral_payout_cents bigint := 1000;
  r record;
  i integer;
begin
  select status, prize_pool_amount
  into v_status, v_gross
  from public.worldcup_tournaments
  where id = p_tournament_id;

  if v_status is null then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

  if v_status <> 'completed' then
    raise exception 'TOURNAMENT_NOT_COMPLETED';
  end if;

  if v_gross is null or v_gross <= 0 then
    raise exception 'PRIZE_POOL_NOT_SET';
  end if;

  -- The tournament prize pool is already net of the fee split. Do not subtract
  -- prize_pool_fee_percent again here.
  v_net_cents := round(v_gross * 100);

  select count(*) into v_participants
  from public.worldcup_entries
  where tournament_id = p_tournament_id and status = 'locked';

  if v_participants = 0 then
    return 0;
  end if;

  v_paid_places := least(10, array_length(v_weights, 1), v_participants);

  for i in 1 .. v_paid_places loop
    v_total_weight := v_total_weight + v_weights[i];
  end loop;

  for r in
    select
      ranked.entry_id,
      ranked.user_id,
      ranked.position
    from (
      select
        e.id as entry_id,
        e.user_id,
        row_number() over (
          order by coalesce(lb.total_points, 0) desc, e.locked_at asc nulls last, e.id
        ) as position
      from public.worldcup_entries e
      left join public.worldcup_awarded_leaderboard lb on lb.entry_id = e.id
      where e.tournament_id = p_tournament_id and e.status = 'locked'
    ) ranked
    where ranked.position <= v_paid_places
    order by ranked.position
  loop
    if r.position = v_paid_places then
      v_place_cents := v_net_cents - v_allocated_cents;
    else
      v_place_cents := round(v_net_cents * v_weights[r.position]::numeric / v_total_weight);
    end if;

    v_allocated_cents := v_allocated_cents + v_place_cents;

    if r.user_id is null or v_place_cents <= 0 then
      continue;
    end if;

    v_direct_inviter := null;
    v_direct_fee_percent := null;
    v_direct_referral_cents := 0;

    select inviter_user_id, referral_fee_percent
    into v_direct_inviter, v_direct_fee_percent
    from public.worldcup_referrals
    where tournament_id = p_tournament_id and entry_id = r.entry_id;

    if v_direct_inviter is not null and v_direct_inviter <> r.user_id then
      v_direct_referral_cents := floor(
        v_place_cents * coalesce(nullif(v_direct_fee_percent, 0), 5) / 100
      );
    end if;

    if v_direct_referral_cents < v_min_referral_payout_cents then
      v_direct_referral_cents := 0;
    end if;

    v_prize_cents := v_place_cents - v_direct_referral_cents;

    if public.worldcup_record_settlement_payout(
      p_tournament_id,
      r.entry_id,
      r.user_id,
      'prize',
      r.position,
      v_prize_cents,
      'Prize for rank ' || r.position,
      null,
      0,
      v_place_cents
    ) then
      v_created := v_created + 1;
    end if;

    if v_direct_referral_cents <= 0 then
      continue;
    end if;

    v_current_user_id := v_direct_inviter;
    v_current_referral_cents := v_direct_referral_cents;
    v_source_user_id := r.user_id;
    v_seen_user_ids := array[r.user_id, v_direct_inviter];
    v_level := 1;

    while v_current_user_id is not null
      and v_current_referral_cents >= v_min_referral_payout_cents
      and v_level <= 20
    loop
      v_next_inviter_id := null;
      v_pass_up_cents := 0;

      select inviter_user_id
      into v_next_inviter_id
      from public.worldcup_referrals
      where tournament_id = p_tournament_id
        and invited_user_id = v_current_user_id
        and inviter_user_id <> v_current_user_id
      order by accepted_at asc
      limit 1;

      if v_next_inviter_id = any(v_seen_user_ids) then
        v_next_inviter_id := null;
      end if;

      if v_next_inviter_id is not null then
        v_pass_up_cents := floor(v_current_referral_cents * 5 / 100);
        if v_pass_up_cents < v_min_referral_payout_cents then
          v_pass_up_cents := 0;
        end if;
      end if;

      v_current_payout_cents := v_current_referral_cents - v_pass_up_cents;

      if v_current_payout_cents >= v_min_referral_payout_cents then
        if public.worldcup_record_settlement_payout(
          p_tournament_id,
          r.entry_id,
          v_current_user_id,
          'referral',
          r.position,
          v_current_payout_cents,
          'Referral level ' || v_level || ' share of rank ' || r.position || ' prize',
          v_source_user_id,
          v_level,
          v_current_referral_cents
        ) then
          v_created := v_created + 1;
        end if;
      end if;

      if v_pass_up_cents <= 0 or v_next_inviter_id is null then
        exit;
      end if;

      v_seen_user_ids := array_append(v_seen_user_ids, v_next_inviter_id);
      v_source_user_id := v_current_user_id;
      v_current_user_id := v_next_inviter_id;
      v_current_referral_cents := v_pass_up_cents;
      v_level := v_level + 1;
    end loop;
  end loop;

  return v_created;
end;
$$;

revoke execute on function public.worldcup_record_settlement_payout(uuid, uuid, uuid, text, integer, bigint, text, uuid, integer, bigint)
  from public, anon, authenticated;
grant execute on function public.worldcup_record_settlement_payout(uuid, uuid, uuid, text, integer, bigint, text, uuid, integer, bigint)
  to service_role;

revoke execute on function public.worldcup_settle_payouts(uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_settle_payouts(uuid)
  to service_role;

