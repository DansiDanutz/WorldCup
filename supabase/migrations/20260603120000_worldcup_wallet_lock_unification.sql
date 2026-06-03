-- Wallet lock unification + non-negative balance backstop.
--
-- Audit finding addressed (see docs/AUDIT_2026-06-03.md): H-2.
--
-- Problem: the balance is the signed sum of worldcup_wallet_transactions, and
-- three functions DEBIT it -- worldcup_wallet_transfer (sender),
-- worldcup_purchase_ticket, and worldcup_record_withdrawal. Each took a
-- DIFFERENT pg_advisory_xact_lock key for the same (tournament, user):
--   transfer        -> hashtext('{tid}:{from_uid}')
--   purchase_ticket -> hashtext('{uid}:{tid}:ticket')
--   record_withdraw -> hashtext('{tid}:{uid}:withdrawal')
-- Because the keys differ, two debits of DIFFERENT types on the same wallet do
-- not serialize against each other: each reads the same starting balance, each
-- passes its own "balance >= amount" check, and their combined effect can
-- overdraw the wallet (negative balance). Nothing structurally prevented it.
--
-- Fix, two layers:
--   1. A single canonical lock key derived in ONE place
--      (worldcup_wallet_lock_key) that every balance-debiting function uses, so
--      the keys can never drift apart again.
--   2. A non-negative balance trigger as a structural backstop, so ANY path
--      that inserts a debit row (including future code or a direct admin debit)
--      cannot drive a wallet below zero, lock or no lock.
--
-- worldcup_create_entry intentionally keeps its own '{uid}:{tid}' lock: it
-- serializes TICKET consumption / entry creation and never reads or mutates the
-- wallet balance, so it is a different invariant and a different lock domain.
-- Credit-only movements (deposit, prize_payout, referral_payout, admin_credit)
-- never reduce a balance and are unaffected.

-- 1. Canonical per-(tournament, user) wallet lock key -----------------------
create or replace function public.worldcup_wallet_lock_key(
  p_tournament_id uuid,
  p_user_id uuid
)
returns bigint
language sql
immutable
set search_path = pg_catalog, public
as $$
  select hashtext('wallet:' || p_tournament_id::text || ':' || p_user_id::text)::bigint;
$$;

-- 2. Non-negative balance backstop ------------------------------------------
create or replace function public.worldcup_assert_wallet_nonnegative()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
begin
  -- Only a row that debits an account (from_user_id) can reduce a balance.
  if new.from_user_id is null then
    return new;
  end if;

  select coalesce(sum(
    case
      when to_user_id = new.from_user_id then amount
      when from_user_id = new.from_user_id then -amount
      else 0
    end
  ), 0)
  into v_balance
  from public.worldcup_wallet_transactions
  where tournament_id = new.tournament_id
    and (from_user_id = new.from_user_id or to_user_id = new.from_user_id);

  if v_balance < 0 then
    raise exception 'WALLET_BALANCE_NEGATIVE';
  end if;

  return new;
end;
$$;

drop trigger if exists worldcup_wallet_nonnegative on public.worldcup_wallet_transactions;
create trigger worldcup_wallet_nonnegative
after insert on public.worldcup_wallet_transactions
for each row execute function public.worldcup_assert_wallet_nonnegative();

-- 3. Re-create the three debit functions to share the canonical lock key. ----
--    Bodies are otherwise identical to their defining migrations; only the
--    pg_advisory_xact_lock(...) argument changes.

create or replace function public.worldcup_wallet_transfer(
  p_tournament_id uuid,
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount numeric,
  p_note text,
  p_created_by text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_transfer_id uuid;
begin
  if p_from_user_id = p_to_user_id then
    raise exception 'SAME_ACCOUNT';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  -- Canonical wallet lock on the SENDER (the only side that can go negative).
  perform pg_advisory_xact_lock(public.worldcup_wallet_lock_key(p_tournament_id, p_from_user_id));

  select coalesce(sum(
    case
      when to_user_id = p_from_user_id then amount
      when from_user_id = p_from_user_id then -amount
      else 0
    end
  ), 0)
  into v_balance
  from public.worldcup_wallet_transactions
  where tournament_id = p_tournament_id
    and (from_user_id = p_from_user_id or to_user_id = p_from_user_id);

  if v_balance < p_amount then
    raise exception 'INSUFFICIENT_FUNDS';
  end if;

  insert into public.worldcup_wallet_transactions (
    tournament_id, from_user_id, to_user_id, amount, transaction_type, note, created_by
  )
  values (
    p_tournament_id, p_from_user_id, p_to_user_id, p_amount, 'transfer', nullif(p_note, ''), coalesce(p_created_by, 'admin')
  )
  returning id into v_transfer_id;

  return v_transfer_id;
end;
$$;

create or replace function public.worldcup_purchase_ticket(
  p_user_id uuid,
  p_tournament_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price numeric;
  v_balance numeric;
  v_ticket_id uuid;
begin
  -- Canonical wallet lock so a ticket purchase serializes against transfers
  -- and withdrawal debits for the same wallet.
  perform pg_advisory_xact_lock(public.worldcup_wallet_lock_key(p_tournament_id, p_user_id));

  select ticket_price_amount into v_price
  from public.worldcup_tournaments
  where id = p_tournament_id;

  if v_price is null then
    raise exception 'TOURNAMENT_NOT_FOUND';
  end if;

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

  if v_balance < v_price then
    raise exception 'INSUFFICIENT_FUNDS';
  end if;

  if v_price > 0 then
    insert into public.worldcup_wallet_transactions (
      tournament_id, from_user_id, to_user_id, amount, transaction_type, note, created_by
    )
    values (
      p_tournament_id, p_user_id, null, v_price, 'ticket_purchase', 'Entry ticket', 'wallet'
    );
  end if;

  insert into public.worldcup_tickets (tournament_id, user_id, price_amount, assigned_by)
  values (p_tournament_id, p_user_id, v_price, 'wallet')
  returning id into v_ticket_id;

  return v_ticket_id;
end;
$$;

create or replace function public.worldcup_record_withdrawal(
  p_withdrawal_request_id uuid,
  p_tournament_id uuid,
  p_user_id uuid,
  p_amount numeric,
  p_note text,
  p_created_by text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_tx_id uuid;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  -- Canonical wallet lock so a withdrawal debit serializes against transfers
  -- and ticket purchases for the same wallet.
  perform pg_advisory_xact_lock(public.worldcup_wallet_lock_key(p_tournament_id, p_user_id));

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

  if v_balance < p_amount then
    raise exception 'INSUFFICIENT_FUNDS';
  end if;

  insert into public.worldcup_wallet_transactions (
    tournament_id, from_user_id, to_user_id, amount, transaction_type, note, created_by
  )
  values (
    p_tournament_id,
    p_user_id,
    null,
    p_amount,
    'withdrawal',
    coalesce(nullif(p_note, ''), 'USDT withdrawal request ' || p_withdrawal_request_id::text),
    coalesce(p_created_by, 'admin')
  )
  returning id into v_tx_id;

  return v_tx_id;
end;
$$;

-- 4. Server-only RPC permissions (match the wallet/ticket pattern). ----------
--    The lock-key helper and trigger function are not callable over PostgREST.
revoke execute on function public.worldcup_wallet_lock_key(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_wallet_lock_key(uuid, uuid)
  to service_role;

revoke execute on function public.worldcup_assert_wallet_nonnegative()
  from public, anon, authenticated;

revoke execute on function public.worldcup_wallet_transfer(uuid, uuid, uuid, numeric, text, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_wallet_transfer(uuid, uuid, uuid, numeric, text, text)
  to service_role;

revoke execute on function public.worldcup_purchase_ticket(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.worldcup_purchase_ticket(uuid, uuid)
  to service_role;

revoke execute on function public.worldcup_record_withdrawal(uuid, uuid, uuid, numeric, text, text)
  from public, anon, authenticated;
grant execute on function public.worldcup_record_withdrawal(uuid, uuid, uuid, numeric, text, text)
  to service_role;
