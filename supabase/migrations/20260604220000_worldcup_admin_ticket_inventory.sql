-- Admin ticket inventory + financial movement ledger -----------------------
--
-- Ticket supply is pre-generated once, then moved in order:
-- generated pool -> admin inventory -> agents/users. Every admin movement is
-- recorded with the exact numbered voucher codes that moved.

alter table public.worldcup_ticket_codes
  add column if not exists ticket_number integer,
  add column if not exists admin_user_id uuid,
  add column if not exists admin_assigned_at timestamptz;

with numbered as (
  select
    id,
    row_number() over (partition by tournament_id order by created_at asc, code asc, id asc)::integer as next_number
  from public.worldcup_ticket_codes
  where ticket_number is null
)
update public.worldcup_ticket_codes c
   set ticket_number = numbered.next_number
from numbered
where c.id = numbered.id;

alter table public.worldcup_ticket_codes
  alter column ticket_number set not null;

create unique index if not exists worldcup_ticket_codes_number_idx
  on public.worldcup_ticket_codes (tournament_id, ticket_number);

alter table public.worldcup_ticket_codes
  drop constraint if exists worldcup_ticket_codes_status_check;

alter table public.worldcup_ticket_codes
  add constraint worldcup_ticket_codes_status_check
  check (status in ('available', 'admin', 'assigned', 'redeemed', 'void'));

create index if not exists worldcup_ticket_codes_admin_idx
  on public.worldcup_ticket_codes (tournament_id, admin_user_id, status, ticket_number);

create table if not exists public.worldcup_ticket_financial_movements (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  movement_type text not null
    check (movement_type in ('admin_request', 'admin_to_agent', 'admin_to_user')),
  payment_method text not null
    check (payment_method in ('internal', 'cash', 'usdt')),
  source_admin_user_id uuid,
  target_user_id uuid,
  target_agent_user_id uuid,
  quantity integer not null check (quantity > 0),
  ticket_price_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_by text not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists worldcup_ticket_financial_movements_tournament_idx
  on public.worldcup_ticket_financial_movements (tournament_id, created_at desc);

create index if not exists worldcup_ticket_financial_movements_admin_idx
  on public.worldcup_ticket_financial_movements (tournament_id, source_admin_user_id, created_at desc);

alter table public.worldcup_ticket_financial_movements enable row level security;

create table if not exists public.worldcup_ticket_financial_movement_codes (
  movement_id uuid not null references public.worldcup_ticket_financial_movements(id) on delete cascade,
  ticket_code_id uuid not null references public.worldcup_ticket_codes(id) on delete restrict,
  ticket_number integer not null,
  code text not null,
  movement_role text not null
    check (movement_role in ('admin_inventory', 'paid_agent', 'commission_agent', 'personal_user', 'user_ticket')),
  created_at timestamptz not null default now(),
  primary key (movement_id, ticket_code_id)
);

create index if not exists worldcup_ticket_financial_movement_codes_ticket_idx
  on public.worldcup_ticket_financial_movement_codes (ticket_code_id);

alter table public.worldcup_ticket_financial_movement_codes enable row level security;

create or replace function public.worldcup_admin_request_ticket_inventory(
  p_tournament_id uuid,
  p_admin_user_id uuid,
  p_quantity integer,
  p_created_by text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_requested integer;
  v_code_ids uuid[] := '{}'::uuid[];
  v_ticket_numbers jsonb := '[]'::jsonb;
  v_movement_id uuid;
begin
  if p_admin_user_id is null then
    raise exception 'ADMIN_ACCOUNT_REQUIRED';
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 10000 then
    raise exception 'INVALID_QUANTITY';
  end if;

  perform 1 from public.worldcup_tournaments where id = p_tournament_id;
  if not found then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_tournament_id::text || ':admin-ticket-inventory'));

  with picked as (
    select id
    from public.worldcup_ticket_codes
    where tournament_id = p_tournament_id
      and status = 'available'
    order by ticket_number asc
    limit p_quantity
    for update skip locked
  ),
  updated as (
    update public.worldcup_ticket_codes c
       set status = 'admin',
           admin_user_id = p_admin_user_id,
           admin_assigned_at = now(),
           assigned_at = coalesce(c.assigned_at, now())
    from picked
    where c.id = picked.id
    returning c.id, c.ticket_number, c.code
  )
  select
    count(*)::integer,
    coalesce(array_agg(id order by ticket_number), '{}'::uuid[]),
    coalesce(
      jsonb_agg(jsonb_build_object('ticketNumber', ticket_number, 'code', code) order by ticket_number),
      '[]'::jsonb
    )
  into v_requested, v_code_ids, v_ticket_numbers
  from updated;

  if v_requested < p_quantity then
    raise exception 'INSUFFICIENT_CODES';
  end if;

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
    p_tournament_id,
    'admin_request',
    'internal',
    p_admin_user_id,
    v_requested,
    0,
    0,
    'Admin requested ticket inventory from generated pool.',
    jsonb_build_object('ticketNumbers', v_ticket_numbers),
    coalesce(nullif(trim(p_created_by), ''), 'admin')
  )
  returning id into v_movement_id;

  insert into public.worldcup_ticket_financial_movement_codes (
    movement_id,
    ticket_code_id,
    ticket_number,
    code,
    movement_role
  )
  select
    v_movement_id,
    id,
    ticket_number,
    code,
    'admin_inventory'
  from public.worldcup_ticket_codes
  where id = any(v_code_ids)
  order by ticket_number asc;

  return jsonb_build_object(
    'ok', true,
    'movementId', v_movement_id,
    'requested', v_requested,
    'adminInventory', (
      select count(*)
      from public.worldcup_ticket_codes
      where tournament_id = p_tournament_id
        and admin_user_id = p_admin_user_id
        and status = 'admin'
    ),
    'ticketNumbers', v_ticket_numbers
  );
end;
$$;

create or replace function public.worldcup_admin_assign_user_ticket(
  p_tournament_id uuid,
  p_admin_user_id uuid,
  p_to_user_id uuid,
  p_quantity integer,
  p_payment_method text,
  p_created_by text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket_price numeric(12,2);
  v_payment_method text := lower(trim(coalesce(p_payment_method, '')));
  v_code record;
  v_ticket_id uuid;
  v_assigned integer := 0;
  v_code_ids uuid[] := '{}'::uuid[];
  v_ticket_numbers jsonb := '[]'::jsonb;
  v_movement_id uuid;
begin
  if p_admin_user_id is null then
    raise exception 'ADMIN_ACCOUNT_REQUIRED';
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 1000 then
    raise exception 'INVALID_QUANTITY';
  end if;

  if v_payment_method not in ('cash', 'usdt') then
    raise exception 'INVALID_PAYMENT_METHOD';
  end if;

  select ticket_price_amount into v_ticket_price
  from public.worldcup_tournaments
  where id = p_tournament_id;

  if not found then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

  perform 1 from public.worldcup_referral_profiles where user_id = p_to_user_id;
  if not found then
    raise exception 'RECIPIENT_NOT_FOUND';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_tournament_id::text || ':admin-ticket-inventory'));

  for v_code in
    select *
    from public.worldcup_ticket_codes
    where tournament_id = p_tournament_id
      and status = 'admin'
      and admin_user_id = p_admin_user_id
    order by ticket_number asc
    limit p_quantity
    for update skip locked
  loop
    insert into public.worldcup_tickets (
      tournament_id,
      user_id,
      price_amount,
      assigned_by
    )
    values (
      p_tournament_id,
      p_to_user_id,
      v_ticket_price,
      coalesce(nullif(trim(p_created_by), ''), 'admin') || ':admin_' || v_payment_method
    )
    returning id into v_ticket_id;

    update public.worldcup_ticket_codes
       set status = 'redeemed',
           kind = 'paid',
           redeemed_by_user_id = p_to_user_id,
           redeemed_at = now(),
           ticket_id = v_ticket_id
     where id = v_code.id;

    v_assigned := v_assigned + 1;
    v_code_ids := array_append(v_code_ids, v_code.id);
  end loop;

  if v_assigned < p_quantity then
    raise exception 'INSUFFICIENT_ADMIN_CODES';
  end if;

  select coalesce(
    jsonb_agg(jsonb_build_object('ticketNumber', ticket_number, 'code', code) order by ticket_number),
    '[]'::jsonb
  )
  into v_ticket_numbers
  from public.worldcup_ticket_codes
  where id = any(v_code_ids);

  insert into public.worldcup_ticket_financial_movements (
    tournament_id,
    movement_type,
    payment_method,
    source_admin_user_id,
    target_user_id,
    quantity,
    ticket_price_amount,
    total_amount,
    note,
    metadata,
    created_by
  )
  values (
    p_tournament_id,
    'admin_to_user',
    v_payment_method,
    p_admin_user_id,
    p_to_user_id,
    v_assigned,
    v_ticket_price,
    v_ticket_price * v_assigned,
    nullif(trim(coalesce(p_note, '')), ''),
    jsonb_build_object('userTicketNumbers', v_ticket_numbers),
    coalesce(nullif(trim(p_created_by), ''), 'admin')
  )
  returning id into v_movement_id;

  insert into public.worldcup_ticket_financial_movement_codes (
    movement_id,
    ticket_code_id,
    ticket_number,
    code,
    movement_role
  )
  select
    v_movement_id,
    id,
    ticket_number,
    code,
    'user_ticket'
  from public.worldcup_ticket_codes
  where id = any(v_code_ids)
  order by ticket_number asc;

  return jsonb_build_object(
    'ok', true,
    'movementId', v_movement_id,
    'assignedTickets', v_assigned,
    'ticketPriceAmount', v_ticket_price,
    'totalAmount', v_ticket_price * v_assigned,
    'ticketNumbers', v_ticket_numbers
  );
end;
$$;

create or replace function public.worldcup_admin_assign_agent_tickets(
  p_tournament_id uuid,
  p_admin_user_id uuid,
  p_agent_user_id uuid,
  p_quantity integer,
  p_payment_method text,
  p_created_by text,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_agent_code_quantity integer;
  v_assigned integer := 0;
  v_paid integer;
  v_awarded integer;
  v_new_free integer := 0;
  v_personal_ticket_assigned integer := 0;
  v_has_personal_ticket boolean;
  v_ticket_price numeric(12,2);
  v_payment_method text := lower(trim(coalesce(p_payment_method, '')));
  v_code record;
  v_ticket_id uuid;
  v_personal_code_ids uuid[] := '{}'::uuid[];
  v_paid_code_ids uuid[] := '{}'::uuid[];
  v_commission_code_ids uuid[] := '{}'::uuid[];
  v_personal_ticket_numbers jsonb := '[]'::jsonb;
  v_paid_ticket_numbers jsonb := '[]'::jsonb;
  v_commission_ticket_numbers jsonb := '[]'::jsonb;
  v_movement_id uuid;
begin
  if p_admin_user_id is null then
    raise exception 'ADMIN_ACCOUNT_REQUIRED';
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 1000 then
    raise exception 'INVALID_QUANTITY';
  end if;

  if v_payment_method not in ('cash', 'usdt') then
    raise exception 'INVALID_PAYMENT_METHOD';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_tournament_id::text || ':admin-ticket-inventory'));
  perform pg_advisory_xact_lock(
    hashtext(p_tournament_id::text || ':' || p_agent_user_id::text || ':agent-personal-ticket')
  );

  perform 1 from public.worldcup_agents
   where user_id = p_agent_user_id and tournament_id = p_tournament_id;
  if not found then
    raise exception 'AGENT_NOT_FOUND';
  end if;

  select ticket_price_amount into v_ticket_price
  from public.worldcup_tournaments
  where id = p_tournament_id;

  if not found then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

  select exists (
    select 1
    from public.worldcup_tickets
    where tournament_id = p_tournament_id
      and user_id = p_agent_user_id
    union all
    select 1
    from public.worldcup_entries
    where tournament_id = p_tournament_id
      and user_id = p_agent_user_id
  )
  into v_has_personal_ticket;

  v_agent_code_quantity := case
    when v_has_personal_ticket then p_quantity
    else p_quantity - 1
  end;

  if not v_has_personal_ticket then
    select * into v_code
    from public.worldcup_ticket_codes
    where tournament_id = p_tournament_id
      and status = 'admin'
      and admin_user_id = p_admin_user_id
    order by ticket_number asc
    limit 1
    for update skip locked;

    if not found then
      raise exception 'INSUFFICIENT_ADMIN_CODES';
    end if;

    insert into public.worldcup_tickets (
      tournament_id,
      user_id,
      price_amount,
      assigned_by
    )
    values (
      p_tournament_id,
      p_agent_user_id,
      v_ticket_price,
      coalesce(nullif(trim(p_created_by), ''), 'admin') || ':agent_personal_reserve'
    )
    returning id into v_ticket_id;

    update public.worldcup_ticket_codes
       set status = 'redeemed',
           kind = 'paid',
           agent_user_id = p_agent_user_id,
           redeemed_by_user_id = p_agent_user_id,
           redeemed_at = now(),
           ticket_id = v_ticket_id
     where id = v_code.id;

    v_personal_code_ids := array_append(v_personal_code_ids, v_code.id);
    v_personal_ticket_assigned := 1;
  end if;

  if v_agent_code_quantity > 0 then
    with picked as (
      select id
      from public.worldcup_ticket_codes
      where tournament_id = p_tournament_id
        and status = 'admin'
        and admin_user_id = p_admin_user_id
      order by ticket_number asc
      limit v_agent_code_quantity
      for update skip locked
    ),
    updated as (
      update public.worldcup_ticket_codes c
         set status = 'assigned',
             kind = 'paid',
             agent_user_id = p_agent_user_id,
             assigned_at = now()
      from picked
      where c.id = picked.id
      returning c.id
    )
    select
      count(*)::integer,
      coalesce(array_agg(id), '{}'::uuid[])
    into v_assigned, v_paid_code_ids
    from updated;

    if v_assigned < v_agent_code_quantity then
      raise exception 'INSUFFICIENT_ADMIN_CODES';
    end if;
  end if;

  select count(*) into v_paid from public.worldcup_ticket_codes
   where tournament_id = p_tournament_id and agent_user_id = p_agent_user_id and kind = 'paid' and status = 'assigned';
  select count(*) into v_awarded from public.worldcup_ticket_codes
   where tournament_id = p_tournament_id and agent_user_id = p_agent_user_id and kind = 'commission' and status = 'assigned';

  v_new_free := greatest(floor(v_paid / 10)::integer - v_awarded, 0);

  if v_new_free > 0 then
    with picked as (
      select id
      from public.worldcup_ticket_codes
      where tournament_id = p_tournament_id
        and status = 'admin'
        and admin_user_id = p_admin_user_id
      order by ticket_number asc
      limit v_new_free
      for update skip locked
    ),
    updated as (
      update public.worldcup_ticket_codes c
         set status = 'assigned',
             kind = 'commission',
             agent_user_id = p_agent_user_id,
             assigned_at = now()
      from picked
      where c.id = picked.id
      returning c.id
    )
    select
      count(*)::integer,
      coalesce(array_agg(id), '{}'::uuid[])
    into v_new_free, v_commission_code_ids
    from updated;

    if v_new_free < greatest(floor(v_paid / 10)::integer - v_awarded, 0) then
      raise exception 'INSUFFICIENT_ADMIN_CODES';
    end if;
  end if;

  select coalesce(
    jsonb_agg(jsonb_build_object('ticketNumber', ticket_number, 'code', code) order by ticket_number),
    '[]'::jsonb
  )
  into v_personal_ticket_numbers
  from public.worldcup_ticket_codes
  where id = any(v_personal_code_ids);

  select coalesce(
    jsonb_agg(jsonb_build_object('ticketNumber', ticket_number, 'code', code) order by ticket_number),
    '[]'::jsonb
  )
  into v_paid_ticket_numbers
  from public.worldcup_ticket_codes
  where id = any(v_paid_code_ids);

  select coalesce(
    jsonb_agg(jsonb_build_object('ticketNumber', ticket_number, 'code', code) order by ticket_number),
    '[]'::jsonb
  )
  into v_commission_ticket_numbers
  from public.worldcup_ticket_codes
  where id = any(v_commission_code_ids);

  update public.worldcup_agents
     set paid_tickets = v_paid,
         commission_tickets = v_awarded + v_new_free,
         active = true,
         activated_at = coalesce(activated_at, now()),
         updated_at = now()
   where user_id = p_agent_user_id and tournament_id = p_tournament_id;

  insert into public.worldcup_ticket_financial_movements (
    tournament_id,
    movement_type,
    payment_method,
    source_admin_user_id,
    target_agent_user_id,
    quantity,
    ticket_price_amount,
    total_amount,
    note,
    metadata,
    created_by
  )
  values (
    p_tournament_id,
    'admin_to_agent',
    v_payment_method,
    p_admin_user_id,
    p_agent_user_id,
    p_quantity,
    v_ticket_price,
    v_ticket_price * p_quantity,
    nullif(trim(coalesce(p_note, '')), ''),
    jsonb_build_object(
      'paidTicketNumbers', v_paid_ticket_numbers,
      'personalTicketNumbers', v_personal_ticket_numbers,
      'commissionTicketNumbers', v_commission_ticket_numbers,
      'agentCodesAssigned', v_assigned,
      'personalTicketAssigned', v_personal_ticket_assigned,
      'commissionAwarded', v_new_free
    ),
    coalesce(nullif(trim(p_created_by), ''), 'admin')
  )
  returning id into v_movement_id;

  insert into public.worldcup_ticket_financial_movement_codes (
    movement_id,
    ticket_code_id,
    ticket_number,
    code,
    movement_role
  )
  select v_movement_id, id, ticket_number, code, 'personal_user'
  from public.worldcup_ticket_codes
  where id = any(v_personal_code_ids)
  union all
  select v_movement_id, id, ticket_number, code, 'paid_agent'
  from public.worldcup_ticket_codes
  where id = any(v_paid_code_ids)
  union all
  select v_movement_id, id, ticket_number, code, 'commission_agent'
  from public.worldcup_ticket_codes
  where id = any(v_commission_code_ids);

  return jsonb_build_object(
    'ok', true,
    'movementId', v_movement_id,
    'assigned', v_assigned,
    'agentCodesAssigned', v_assigned,
    'personalTicketAssigned', v_personal_ticket_assigned,
    'commissionAwarded', v_new_free,
    'paidTickets', v_paid,
    'commissionTickets', v_awarded + v_new_free,
    'ticketPriceAmount', v_ticket_price,
    'totalAmount', v_ticket_price * p_quantity,
    'paidTicketNumbers', v_paid_ticket_numbers,
    'personalTicketNumbers', v_personal_ticket_numbers,
    'commissionTicketNumbers', v_commission_ticket_numbers
  );
end;
$$;

create or replace function public.worldcup_agent_assign_codes(
  p_agent_user_id uuid,
  p_tournament_id uuid,
  p_quantity integer,
  p_created_by text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_user_id uuid;
begin
  select user_id into v_admin_user_id
  from public.worldcup_referral_profiles
  where email = lower(trim(coalesce(p_created_by, '')))
  limit 1;

  if v_admin_user_id is null then
    raise exception 'ADMIN_ACCOUNT_REQUIRED';
  end if;

  return public.worldcup_admin_assign_agent_tickets(
    p_tournament_id,
    v_admin_user_id,
    p_agent_user_id,
    p_quantity,
    'cash',
    p_created_by,
    null
  );
end;
$$;

revoke execute on function public.worldcup_admin_request_ticket_inventory(uuid, uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_admin_request_ticket_inventory(uuid, uuid, integer, text)
  to service_role;

revoke execute on function public.worldcup_admin_assign_user_ticket(uuid, uuid, uuid, integer, text, text, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_admin_assign_user_ticket(uuid, uuid, uuid, integer, text, text, text)
  to service_role;

revoke execute on function public.worldcup_admin_assign_agent_tickets(uuid, uuid, uuid, integer, text, text, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_admin_assign_agent_tickets(uuid, uuid, uuid, integer, text, text, text)
  to service_role;

revoke execute on function public.worldcup_agent_assign_codes(uuid, uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_agent_assign_codes(uuid, uuid, integer, text)
  to service_role;
