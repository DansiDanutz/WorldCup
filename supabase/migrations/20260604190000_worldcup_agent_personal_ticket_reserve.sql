-- Agent paid-code assignments must keep every active agent playable as a user.
--
-- If an agent does not already have a personal WorldCup ticket or entry, the
-- first paid unit in the next admin assignment is reserved as a normal user
-- ticket. The remaining paid units become sellable agent ticket codes. If the
-- agent already has a personal ticket/entry, the full paid quantity becomes
-- agent codes.

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
  v_agent_code_quantity integer;
  v_assigned integer := 0;
  v_paid integer;
  v_awarded integer;
  v_new_free integer := 0;
  v_personal_ticket_assigned integer := 0;
  v_has_personal_ticket boolean;
  v_ticket_price numeric(12,2);
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 1000 then
    raise exception 'INVALID_QUANTITY';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_tournament_id::text || ':codes'));
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
    );

    v_personal_ticket_assigned := 1;
  end if;

  if v_agent_code_quantity > 0 then
    with picked as (
      select id from public.worldcup_ticket_codes
      where tournament_id = p_tournament_id and status = 'available'
      order by created_at asc
      limit v_agent_code_quantity
      for update skip locked
    )
    update public.worldcup_ticket_codes c
       set status = 'assigned',
           kind = 'paid',
           agent_user_id = p_agent_user_id,
           assigned_at = now()
    from picked where c.id = picked.id;
    get diagnostics v_assigned = row_count;

    if v_assigned < v_agent_code_quantity then
      raise exception 'INSUFFICIENT_CODES';
    end if;
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
         active = true,
         activated_at = coalesce(activated_at, now()),
         updated_at = now()
   where user_id = p_agent_user_id and tournament_id = p_tournament_id;

  return jsonb_build_object(
    'assigned', v_assigned,
    'agentCodesAssigned', v_assigned,
    'personalTicketAssigned', v_personal_ticket_assigned,
    'commissionAwarded', v_new_free,
    'paidTickets', v_paid,
    'commissionTickets', v_awarded + v_new_free
  );
end;
$$;

revoke execute on function public.worldcup_agent_assign_codes(uuid, uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_agent_assign_codes(uuid, uuid, integer, text)
  to service_role;
