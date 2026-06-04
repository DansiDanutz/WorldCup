-- Agent Wallet direct ticket transfers + referral fallback ------------------
--
-- Agent-sold tickets must be tracked as agent inventory sales. They also carry
-- the agent as a fallback referral source, but worldcup_create_entry keeps the
-- existing precedence: an explicit user-link referral supplied at entry lock
-- wins first. This means an agent never overwrites an existing inviter; the
-- agent only becomes the inviter when the player had no referral.

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
    0,
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

  select referral_code into v_agent_referral_code
  from public.worldcup_referral_profiles
  where user_id = p_agent_user_id;

  if v_agent_referral_code is null then
    raise exception 'AGENT_PROFILE_NOT_FOUND';
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
    0,
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
begin
  if p_agent_user_id = p_to_user_id then
    raise exception 'SAME_ACCOUNT';
  end if;

  perform pg_advisory_xact_lock(
    hashtext('agent-ticket-transfer:' || p_tournament_id::text || ':' || p_agent_user_id::text)
  );

  perform 1
  from public.worldcup_agents
  where tournament_id = p_tournament_id
    and user_id = p_agent_user_id
    and active;

  if not found then
    raise exception 'AGENT_NOT_FOUND';
  end if;

  perform 1 from public.worldcup_referral_profiles where user_id = p_to_user_id;
  if not found then
    raise exception 'RECIPIENT_NOT_FOUND';
  end if;

  select referral_code into v_agent_referral_code
  from public.worldcup_referral_profiles
  where user_id = p_agent_user_id;

  if v_agent_referral_code is null then
    raise exception 'AGENT_PROFILE_NOT_FOUND';
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
    0,
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
