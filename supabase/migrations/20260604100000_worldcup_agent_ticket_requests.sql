-- Agent Call ticket requests -------------------------------------------------
--
-- Players can ask an agent for one entry ticket after paying the agent
-- off-platform. The agent accepts only after confirming payment was received.
-- Accepting consumes one available agent ticket code and mints one entry ticket
-- for the requesting player in the same transaction. If the agent has no
-- available code, the request remains pending until its 24-hour expiry.

create table if not exists public.worldcup_agent_ticket_requests (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  requester_user_id uuid not null,
  requester_email text,
  requester_display_name text not null,
  agent_user_id uuid not null,
  agent_email text,
  agent_display_name text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  accepted_at timestamptz,
  accepted_ticket_code_id uuid references public.worldcup_ticket_codes(id) on delete set null,
  ticket_id uuid references public.worldcup_tickets(id) on delete set null,
  updated_at timestamptz not null default now(),
  check (requester_user_id <> agent_user_id)
);

create index if not exists worldcup_agent_ticket_requests_requester_idx
  on public.worldcup_agent_ticket_requests (tournament_id, requester_user_id, requested_at desc);

create index if not exists worldcup_agent_ticket_requests_agent_idx
  on public.worldcup_agent_ticket_requests (tournament_id, agent_user_id, status, requested_at desc);

create unique index if not exists worldcup_agent_ticket_requests_one_pending_idx
  on public.worldcup_agent_ticket_requests (tournament_id, requester_user_id)
  where status = 'pending';

alter table public.worldcup_agent_ticket_requests enable row level security;
-- No client policies: server routes read/write through the service-role key.

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
begin
  select * into v_request
  from public.worldcup_agent_ticket_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'REQUEST_NOT_FOUND';
  end if;

  if v_request.agent_user_id <> p_agent_user_id then
    raise exception 'REQUEST_NOT_FOR_AGENT';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'REQUEST_NOT_PENDING';
  end if;

  if v_request.expires_at <= now() then
    update public.worldcup_agent_ticket_requests
       set status = 'expired', updated_at = now()
     where id = p_request_id;
    raise exception 'REQUEST_EXPIRED';
  end if;

  perform 1
  from public.worldcup_agents
  where tournament_id = v_request.tournament_id
    and user_id = p_agent_user_id
    and active;

  if not found then
    raise exception 'AGENT_NOT_FOUND';
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
    source_agent_id
  )
  values (
    v_request.tournament_id,
    v_request.requester_user_id,
    0,
    'agent_call',
    p_agent_user_id
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

revoke execute on function public.worldcup_accept_agent_ticket_request(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_accept_agent_ticket_request(uuid, uuid)
  to service_role;
