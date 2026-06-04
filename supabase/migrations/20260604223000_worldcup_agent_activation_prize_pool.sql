-- Agent activation and automatic prize-pool funding ------------------------
--
-- A player becomes agent-enabled once they own a personal ticket, whether that
-- ticket came from a wallet purchase, admin assignment, or an agent transfer.
-- Sellable inventory still starts after that first personal ticket. Paid
-- tickets leaving admin inventory add 80% of their value to the prize pool.

create or replace function public.worldcup_ensure_active_agent_for_user(
  p_tournament_id uuid,
  p_user_id uuid,
  p_created_by text default 'ticket_activation'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
begin
  if p_tournament_id is null or p_user_id is null then
    raise exception 'INVALID_AGENT_ACTIVATION';
  end if;

  select email, display_name
  into v_profile
  from public.worldcup_referral_profiles
  where user_id = p_user_id;

  insert into public.worldcup_agents (
    tournament_id,
    user_id,
    email,
    display_name,
    contact_name,
    active,
    activated_at,
    created_by,
    updated_at
  )
  values (
    p_tournament_id,
    p_user_id,
    v_profile.email,
    v_profile.display_name,
    v_profile.display_name,
    true,
    now(),
    coalesce(nullif(trim(p_created_by), ''), 'ticket_activation'),
    now()
  )
  on conflict (tournament_id, user_id)
  do update set
    email = coalesce(excluded.email, public.worldcup_agents.email),
    display_name = coalesce(excluded.display_name, public.worldcup_agents.display_name),
    contact_name = coalesce(public.worldcup_agents.contact_name, excluded.contact_name),
    active = true,
    activated_at = coalesce(public.worldcup_agents.activated_at, now()),
    updated_at = now();
end;
$$;

create or replace function public.worldcup_activate_agent_on_personal_ticket()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.worldcup_ensure_active_agent_for_user(
    new.tournament_id,
    new.user_id,
    coalesce(nullif(trim(new.assigned_by), ''), 'ticket_activation')
  );

  if new.assigned_by = 'wallet' and coalesce(new.price_amount, 0) > 0 then
    update public.worldcup_tournaments
       set prize_pool_amount = prize_pool_amount + round((new.price_amount * 0.80)::numeric, 2),
           updated_at = now()
     where id = new.tournament_id;
  end if;

  return new;
end;
$$;

drop trigger if exists worldcup_activate_agent_on_personal_ticket_trg on public.worldcup_tickets;
create trigger worldcup_activate_agent_on_personal_ticket_trg
after insert on public.worldcup_tickets
for each row
execute function public.worldcup_activate_agent_on_personal_ticket();

create or replace function public.worldcup_apply_admin_ticket_prize_pool()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prize_contribution numeric(12,2);
begin
  if new.movement_type not in ('admin_to_agent', 'admin_to_user') then
    return new;
  end if;

  v_prize_contribution := round((coalesce(new.total_amount, 0) * 0.80)::numeric, 2);
  if v_prize_contribution <= 0 then
    return new;
  end if;

  update public.worldcup_tournaments
     set prize_pool_amount = prize_pool_amount + v_prize_contribution,
         updated_at = now()
   where id = new.tournament_id;

  new.metadata := coalesce(new.metadata, '{}'::jsonb)
    || jsonb_build_object('prizePoolContribution', v_prize_contribution);

  return new;
end;
$$;

drop trigger if exists worldcup_apply_admin_ticket_prize_pool_trg
  on public.worldcup_ticket_financial_movements;
create trigger worldcup_apply_admin_ticket_prize_pool_trg
before insert on public.worldcup_ticket_financial_movements
for each row
execute function public.worldcup_apply_admin_ticket_prize_pool();

-- Backfill activation for users who already hold personal tickets.
insert into public.worldcup_agents (
  tournament_id,
  user_id,
  email,
  display_name,
  contact_name,
  active,
  activated_at,
  created_by,
  updated_at
)
select distinct
  t.tournament_id,
  t.user_id,
  p.email,
  p.display_name,
  p.display_name,
  true,
  now(),
  'ticket_activation_backfill',
  now()
from public.worldcup_tickets t
left join public.worldcup_referral_profiles p
  on p.user_id = t.user_id
on conflict (tournament_id, user_id)
do update set
  email = coalesce(excluded.email, public.worldcup_agents.email),
  display_name = coalesce(excluded.display_name, public.worldcup_agents.display_name),
  contact_name = coalesce(public.worldcup_agents.contact_name, excluded.contact_name),
  active = true,
  activated_at = coalesce(public.worldcup_agents.activated_at, now()),
  updated_at = now();

revoke execute on function public.worldcup_ensure_active_agent_for_user(uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_ensure_active_agent_for_user(uuid, uuid, text)
  to service_role;

revoke execute on function public.worldcup_activate_agent_on_personal_ticket()
  from public, anon, authenticated;
grant execute on function public.worldcup_activate_agent_on_personal_ticket()
  to service_role;

revoke execute on function public.worldcup_apply_admin_ticket_prize_pool()
  from public, anon, authenticated;
grant execute on function public.worldcup_apply_admin_ticket_prize_pool()
  to service_role;
