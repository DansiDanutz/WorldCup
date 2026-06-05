-- Admin ticket sale price guard ---------------------------------------------
--
-- Admin-to-user and admin-to-agent movements are the ledger source for prize
-- pool and fee pool funding. A zero ticket price would create tickets without
-- funding the pools, so block those movements structurally.

update public.worldcup_tournaments
   set ticket_price_amount = 50.00,
       updated_at = now()
 where coalesce(ticket_price_amount, 0) <= 0;

alter table public.worldcup_tournaments
  alter column ticket_price_amount set default 50.00;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'worldcup_tournaments_ticket_price_positive'
      and conrelid = 'public.worldcup_tournaments'::regclass
  ) then
    alter table public.worldcup_tournaments
      add constraint worldcup_tournaments_ticket_price_positive
      check (ticket_price_amount > 0);
  end if;
end;
$$;

create or replace function public.worldcup_guard_admin_ticket_sale_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.movement_type not in ('admin_to_agent', 'admin_to_user') then
    return new;
  end if;

  if coalesce(new.quantity, 0) <= 0 then
    raise exception 'INVALID_QUANTITY';
  end if;

  if coalesce(new.ticket_price_amount, 0) <= 0
     or coalesce(new.total_amount, 0) <= 0 then
    raise exception 'INVALID_TICKET_PRICE';
  end if;

  return new;
end;
$$;

drop trigger if exists worldcup_guard_admin_ticket_sale_price_trg
  on public.worldcup_ticket_financial_movements;
create trigger worldcup_guard_admin_ticket_sale_price_trg
before insert or update of movement_type, quantity, ticket_price_amount, total_amount
on public.worldcup_ticket_financial_movements
for each row
execute function public.worldcup_guard_admin_ticket_sale_price();

revoke execute on function public.worldcup_guard_admin_ticket_sale_price()
  from public, anon, authenticated;
grant execute on function public.worldcup_guard_admin_ticket_sale_price()
  to service_role;
