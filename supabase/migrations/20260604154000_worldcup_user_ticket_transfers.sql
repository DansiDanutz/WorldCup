-- User ticket transfers + referral attribution -----------------------------
--
-- A player can transfer one available ticket to another signed-in account by
-- email. The transferred ticket carries the sender's referral identity so the
-- recipient's first locked entry can credit the sender without asking the
-- recipient to paste a code again.

alter table public.worldcup_tickets
  add column if not exists transferred_from_user_id uuid,
  add column if not exists transferred_at timestamptz,
  add column if not exists source_referrer_user_id uuid,
  add column if not exists source_referral_code text;

create index if not exists worldcup_tickets_transfer_referrer_idx
  on public.worldcup_tickets (tournament_id, source_referrer_user_id)
  where source_referrer_user_id is not null;

-- Deposits auto-convert full ticket-price chunks into tickets ---------------
--
-- Examples at a 50 USDT ticket price:
--   60 USDT credited  -> 1 ticket + 10 USDT balance
--   100 USDT credited -> 2 tickets + 0 USDT balance
--
-- The reconciler and manual admin deposit approval both call
-- worldcup_credit_deposit, so keeping this rule in the database makes every
-- deposit path behave the same way.
create or replace function public.worldcup_credit_deposit(
  p_user_id uuid,
  p_tournament_id uuid,
  p_network text,
  p_address text,
  p_external_id text,
  p_amount numeric,
  p_currency text,
  p_raw jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deposit_id uuid;
  v_tx_id uuid;
  v_price numeric;
  v_balance numeric;
  v_tickets_to_purchase integer;
  v_index integer;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  insert into public.worldcup_deposits (
    tournament_id, user_id, network, address, amount, currency, provider, external_id, status, raw, credited_at
  )
  values (
    p_tournament_id, p_user_id, p_network, p_address, p_amount, coalesce(p_currency, 'USDT'),
    'kucoin', p_external_id, 'credited', p_raw, now()
  )
  on conflict (provider, external_id) do nothing
  returning id into v_deposit_id;

  if v_deposit_id is null then
    return null;
  end if;

  insert into public.worldcup_wallet_transactions (
    tournament_id, from_user_id, to_user_id, amount, transaction_type, note, created_by
  )
  values (
    p_tournament_id, null, p_user_id, p_amount, 'deposit',
    'USDT ' || p_network || ' deposit ' || p_external_id, 'reconciler'
  )
  returning id into v_tx_id;

  update public.worldcup_deposits
  set wallet_transaction_id = v_tx_id
  where id = v_deposit_id;

  select ticket_price_amount into v_price
  from public.worldcup_tournaments
  where id = p_tournament_id;

  if v_price is not null and v_price > 0 then
    select coalesce(sum(
      case
        when to_user_id = p_user_id then amount
        when from_user_id = p_user_id then -amount
        else 0
      end
    ), 0)
    into v_balance
    from public.worldcup_wallet_transactions
    where tournament_id = p_tournament_id
      and (from_user_id = p_user_id or to_user_id = p_user_id);

    v_tickets_to_purchase := floor(v_balance / v_price)::integer;
    v_index := 0;

    while v_index < v_tickets_to_purchase loop
      perform public.worldcup_purchase_ticket(p_user_id, p_tournament_id);
      v_index := v_index + 1;
    end loop;
  end if;

  return v_deposit_id;
end;
$$;

create or replace function public.worldcup_transfer_ticket(
  p_tournament_id uuid,
  p_from_user_id uuid,
  p_to_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket record;
  v_sender_referral_code text;
begin
  if p_from_user_id = p_to_user_id then
    raise exception 'SAME_ACCOUNT';
  end if;

  perform pg_advisory_xact_lock(hashtext('ticket-transfer:' || p_tournament_id::text || ':' || p_from_user_id::text));

  perform 1 from public.worldcup_referral_profiles where user_id = p_to_user_id;
  if not found then
    raise exception 'RECIPIENT_NOT_FOUND';
  end if;

  select referral_code into v_sender_referral_code
  from public.worldcup_referral_profiles
  where user_id = p_from_user_id;

  if v_sender_referral_code is null then
    raise exception 'SENDER_NOT_FOUND';
  end if;

  select * into v_ticket
  from public.worldcup_tickets
  where tournament_id = p_tournament_id
    and user_id = p_from_user_id
    and consumed_at is null
  order by assigned_at
  for update skip locked
  limit 1;

  if v_ticket.id is null then
    raise exception 'NO_AVAILABLE_TICKET';
  end if;

  update public.worldcup_tickets
     set user_id = p_to_user_id,
         assigned_by = 'user_transfer',
         transferred_from_user_id = p_from_user_id,
         transferred_at = now(),
         source_referrer_user_id = p_from_user_id,
         source_referral_code = v_sender_referral_code
   where id = v_ticket.id
     and consumed_at is null;

  return v_ticket.id;
end;
$$;

create or replace function public.worldcup_create_entry(
  p_user_id uuid,
  p_tournament_id uuid,
  p_display_name text,
  p_team_ids text[],
  p_referral_code text,
  p_referrer_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_ticket record;
  v_entry_id uuid;
  v_effective_referral_code text;
  v_effective_referrer_user_id uuid;
  v_inviter_percent integer;
  v_team_id text;
  v_slot integer;
begin
  if array_length(p_team_ids, 1) is distinct from 3 then
    raise exception 'INVALID_TEAM_COUNT';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_tournament_id::text));

  select status into v_status
  from public.worldcup_tournaments
  where id = p_tournament_id
  for share;

  if v_status is null then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;
  if v_status not in ('setup', 'open') then
    raise exception 'TEAM_SELECTION_CLOSED';
  end if;

  select * into v_ticket
  from public.worldcup_tickets
  where tournament_id = p_tournament_id
    and user_id = p_user_id
    and consumed_at is null
  order by assigned_at
  for update skip locked
  limit 1;

  if v_ticket.id is null then
    raise exception 'NO_TICKET';
  end if;

  v_effective_referral_code := nullif(p_referral_code, '');
  v_effective_referrer_user_id := p_referrer_user_id;

  if v_effective_referrer_user_id is null
     and v_ticket.source_referrer_user_id is not null
     and v_ticket.source_referrer_user_id <> p_user_id then
    v_effective_referrer_user_id := v_ticket.source_referrer_user_id;
    v_effective_referral_code := v_ticket.source_referral_code;
  end if;

  if v_effective_referrer_user_id is not null then
    v_inviter_percent := case
      when exists (
        select 1 from public.worldcup_entries inviter_entry
        where inviter_entry.tournament_id = p_tournament_id
          and inviter_entry.user_id = v_effective_referrer_user_id
          and inviter_entry.referrer_user_id is not null
      ) then 5
      else 3
    end;
  else
    v_inviter_percent := 0;
  end if;

  insert into public.worldcup_entries (
    tournament_id, user_id, display_name, status,
    referral_code, referrer_user_id, referral_fee_percent,
    referral_terms_accepted_at, auth_provider
  )
  values (
    p_tournament_id, p_user_id, p_display_name, 'draft',
    v_effective_referral_code, v_effective_referrer_user_id, v_inviter_percent,
    case when v_effective_referrer_user_id is not null then now() else null end, 'google'
  )
  returning id into v_entry_id;

  v_slot := 1;
  foreach v_team_id in array p_team_ids loop
    insert into public.worldcup_entry_teams (entry_id, team_id, pick_slot)
    values (v_entry_id, v_team_id, v_slot);
    v_slot := v_slot + 1;
  end loop;

  update public.worldcup_entries
  set status = 'locked', locked_at = coalesce(locked_at, now())
  where id = v_entry_id;

  update public.worldcup_tickets
  set consumed_by_entry_id = v_entry_id, consumed_at = now()
  where id = v_ticket.id and consumed_at is null;

  if v_effective_referrer_user_id is not null then
    insert into public.worldcup_referrals (
      tournament_id, entry_id, inviter_user_id, invited_user_id,
      referral_code, referral_fee_percent, accepted_at
    )
    values (
      p_tournament_id, v_entry_id, v_effective_referrer_user_id, p_user_id,
      v_effective_referral_code, v_inviter_percent, now()
    )
    on conflict (tournament_id, invited_user_id) do update
      set entry_id = excluded.entry_id,
          inviter_user_id = excluded.inviter_user_id,
          referral_code = excluded.referral_code,
          referral_fee_percent = excluded.referral_fee_percent,
          accepted_at = excluded.accepted_at;
  end if;

  return v_entry_id;
end;
$$;

revoke execute on function public.worldcup_transfer_ticket(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_transfer_ticket(uuid, uuid, uuid)
  to service_role;

revoke execute on function public.worldcup_credit_deposit(uuid, uuid, text, text, text, numeric, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.worldcup_credit_deposit(uuid, uuid, text, text, text, numeric, text, jsonb)
  to service_role;
