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
   where user_id = p_agent_user_id and tournament_id = p_tournament_id;
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
         active = true,
         activated_at = coalesce(activated_at, now()),
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

revoke execute on function public.worldcup_agent_assign_codes(uuid, uuid, integer, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_agent_assign_codes(uuid, uuid, integer, text)
  to service_role;
