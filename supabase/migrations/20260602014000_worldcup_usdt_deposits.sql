-- USDT deposits via a custodial processor (KuCoin Broker), plus self-service
-- ticket purchase from the internal wallet.
--
-- Flow: each user gets a unique per-network deposit address (TRC-20 / ERC-20)
-- -> they send USDT -> a reconciler confirms the deposit on the processor and
-- credits the user's internal wallet (idempotently) -> they buy entry tickets
-- from their wallet balance. The wallet ledger remains the single source of
-- truth for balances.

-- Allow deposit / withdrawal / ticket-purchase movements in the ledger -------
alter table public.worldcup_wallet_transactions
  drop constraint if exists worldcup_wallet_transactions_transaction_type_check;

alter table public.worldcup_wallet_transactions
  add constraint worldcup_wallet_transactions_transaction_type_check
  check (transaction_type in (
    'transfer', 'admin_credit', 'admin_debit', 'prize_payout', 'referral_payout',
    'deposit', 'withdrawal', 'ticket_purchase'
  ));

-- Per-user, per-network deposit addresses -----------------------------------
create table if not exists public.worldcup_deposit_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  network text not null check (network in ('trc20', 'erc20')),
  address text not null,
  memo text,
  provider text not null default 'kucoin',
  provider_account_id text,
  created_at timestamptz not null default now(),
  unique (user_id, network),
  unique (provider, address)
);

create index if not exists worldcup_deposit_addresses_user_idx
  on public.worldcup_deposit_addresses (user_id);

-- Confirmed deposits (idempotent on the processor's deposit id) --------------
create table if not exists public.worldcup_deposits (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  user_id uuid not null,
  network text not null check (network in ('trc20', 'erc20')),
  address text,
  amount numeric(20, 8) not null check (amount > 0),
  currency text not null default 'USDT',
  provider text not null default 'kucoin',
  external_id text not null,
  status text not null default 'credited' check (status in ('pending', 'credited')),
  wallet_transaction_id uuid references public.worldcup_wallet_transactions(id) on delete set null,
  raw jsonb,
  created_at timestamptz not null default now(),
  credited_at timestamptz,
  unique (provider, external_id)
);

create index if not exists worldcup_deposits_user_idx
  on public.worldcup_deposits (user_id, created_at desc);

alter table public.worldcup_deposit_addresses enable row level security;
alter table public.worldcup_deposits enable row level security;

drop policy if exists "worldcup_deposit_addresses_owner_read" on public.worldcup_deposit_addresses;
create policy "worldcup_deposit_addresses_owner_read"
on public.worldcup_deposit_addresses for select to public
using (auth.uid() = user_id);

drop policy if exists "worldcup_deposits_owner_read" on public.worldcup_deposits;
create policy "worldcup_deposits_owner_read"
on public.worldcup_deposits for select to public
using (auth.uid() = user_id);

-- Idempotently credit a confirmed deposit to the user's wallet ---------------
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
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  -- The unique (provider, external_id) constraint makes this idempotent: a
  -- re-polled deposit inserts nothing and credits nothing.
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
    return null; -- already processed
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

  return v_deposit_id;
end;
$$;

-- Buy one entry ticket from the wallet balance ------------------------------
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
  perform pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_tournament_id::text || ':ticket'));

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

-- Server-only RPC permissions ----------------------------------------------
--
-- Supabase exposes Postgres functions through PostgREST when roles have
-- EXECUTE. These money-moving functions are intentionally called only from
-- server routes using the service-role key.
revoke execute on function public.worldcup_credit_deposit(uuid, uuid, text, text, text, numeric, text, jsonb)
from public, anon, authenticated;
grant execute on function public.worldcup_credit_deposit(uuid, uuid, text, text, text, numeric, text, jsonb)
to service_role;

revoke execute on function public.worldcup_purchase_ticket(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.worldcup_purchase_ticket(uuid, uuid)
to service_role;

revoke execute on function public.worldcup_create_entry(uuid, uuid, text, text[], text, uuid)
from public, anon, authenticated;
grant execute on function public.worldcup_create_entry(uuid, uuid, text, text[], text, uuid)
to service_role;

revoke execute on function public.worldcup_wallet_transfer(uuid, uuid, uuid, numeric, text, text)
from public, anon, authenticated;
grant execute on function public.worldcup_wallet_transfer(uuid, uuid, uuid, numeric, text, text)
to service_role;

revoke execute on function public.worldcup_settle_payouts(uuid)
from public, anon, authenticated;
grant execute on function public.worldcup_settle_payouts(uuid)
to service_role;
