-- Agent program + ticket-code pool ------------------------------------------
--
-- A fixed pool of pre-generated ticket codes (vouchers) is the supply of entry
-- tickets. Admin-promoted agents pay off-platform; the admin records the
-- payment and assigns codes from the pool to the agent. For every 10 paid
-- codes an agent accrues, the system assigns 1 extra code free as commission.
-- Agents hand codes to players, who redeem them one by one into entry tickets.
--
-- All mutations go through security-definer RPCs called only with the
-- service-role key from server routes, matching the wallet/ticket pattern.

create table if not exists public.worldcup_agents (
  user_id uuid not null,
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  email text,
  display_name text,
  paid_tickets integer not null default 0 check (paid_tickets >= 0),
  commission_tickets integer not null default 0 check (commission_tickets >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by text not null default 'admin',
  updated_at timestamptz not null default now(),
  primary key (tournament_id, user_id)
);

-- Trace a redeemed entry ticket back to the agent whose code created it.
alter table public.worldcup_tickets
  add column if not exists source_agent_id uuid;

create table if not exists public.worldcup_ticket_codes (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  code text not null unique,
  status text not null default 'available'
    check (status in ('available', 'assigned', 'redeemed', 'void')),
  kind text check (kind in ('paid', 'commission')),
  agent_user_id uuid,
  assigned_at timestamptz,
  redeemed_by_user_id uuid,
  redeemed_at timestamptz,
  ticket_id uuid references public.worldcup_tickets(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists worldcup_ticket_codes_agent_idx
  on public.worldcup_ticket_codes (tournament_id, agent_user_id, status);

create index if not exists worldcup_ticket_codes_status_idx
  on public.worldcup_ticket_codes (tournament_id, status);

alter table public.worldcup_agents enable row level security;
alter table public.worldcup_ticket_codes enable row level security;
-- No policies: read/written only by server routes through the service role.

-- Pre-generate a pool of 10,000 available, unique ticket codes. -------------
do $$
declare
  v_tid uuid;
  v_have integer;
  v_round integer;
begin
  select id into v_tid from public.worldcup_tournaments
   where slug = 'fifa-world-cup-2026';
  if v_tid is null then
    return;
  end if;

  for v_round in 1..5 loop
    select count(*) into v_have
    from public.worldcup_ticket_codes where tournament_id = v_tid;
    exit when v_have >= 10000;

    insert into public.worldcup_ticket_codes (tournament_id, code, status)
    select v_tid,
           upper(substr(md5(gen_random_uuid()::text || g::text), 1, 10)),
           'available'
    from generate_series(1, 10000 - v_have) as g
    on conflict (code) do nothing;
  end loop;
end $$;

-- Admin records a manual payment and assigns p_quantity codes to an agent,
-- then tops up commission so the agent holds floor(paid / 10) free codes.
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
  v_assigned integer;
  v_paid integer;
  v_awarded integer;
  v_new_free integer;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 1000 then
    raise exception 'INVALID_QUANTITY';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_tournament_id::text || ':codes'));

  perform 1 from public.worldcup_agents
   where user_id = p_agent_user_id and tournament_id = p_tournament_id and active;
  if not found then
    raise exception 'AGENT_NOT_FOUND';
  end if;

  with picked as (
    select id from public.worldcup_ticket_codes
    where tournament_id = p_tournament_id and status = 'available'
    order by created_at asc
    limit p_quantity
    for update skip locked
  )
  update public.worldcup_ticket_codes c
     set status = 'assigned', kind = 'paid', agent_user_id = p_agent_user_id, assigned_at = now()
  from picked where c.id = picked.id;
  get diagnostics v_assigned = row_count;

  if v_assigned < p_quantity then
    raise exception 'INSUFFICIENT_CODES';
  end if;

  select count(*) into v_paid from public.worldcup_ticket_codes
   where tournament_id = p_tournament_id and agent_user_id = p_agent_user_id and kind = 'paid';
  select count(*) into v_awarded from public.worldcup_ticket_codes
   where tournament_id = p_tournament_id and agent_user_id = p_agent_user_id and kind = 'commission';

  v_new_free := greatest(floor(v_paid / 10)::integer - v_awarded, 0);

  if v_new_free > 0 then
    with picked as (
      select id from public.worldcup_ticket_codes
      where tournament_id = p_tournament_id and status = 'available'
      order by created_at asc
      limit v_new_free
      for update skip locked
    )
    update public.worldcup_ticket_codes c
       set status = 'assigned', kind = 'commission', agent_user_id = p_agent_user_id, assigned_at = now()
    from picked where c.id = picked.id;
    get diagnostics v_new_free = row_count;
  end if;

  update public.worldcup_agents
     set paid_tickets = v_paid,
         commission_tickets = v_awarded + v_new_free,
         updated_at = now()
   where user_id = p_agent_user_id and tournament_id = p_tournament_id;

  return jsonb_build_object(
    'assigned', v_assigned,
    'commissionAwarded', v_new_free,
    'paidTickets', v_paid,
    'commissionTickets', v_awarded + v_new_free
  );
end;
$$;

-- A player redeems a code; it mints one entry ticket on their account.
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

  insert into public.worldcup_tickets (tournament_id, user_id, price_amount, assigned_by, source_agent_id)
  values (v_code.tournament_id, p_user_id, 0, 'agent_code', v_code.agent_user_id)
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

-- Server-only RPC permissions (service-role key from server routes). ---------
revoke execute on function public.worldcup_agent_assign_codes(uuid, uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_agent_assign_codes(uuid, uuid, integer, text)
  to service_role;

revoke execute on function public.worldcup_redeem_ticket_code(text, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_redeem_ticket_code(text, uuid)
  to service_role;
