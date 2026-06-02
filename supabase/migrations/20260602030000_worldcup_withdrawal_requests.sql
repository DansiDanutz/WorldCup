-- Withdrawal request workflow.
--
-- This does not move external funds. Players request a USDT payout address,
-- and admins review the request after completing any required KYC/AML/manual
-- payout checks. Approval records a wallet `withdrawal` ledger debit.

create table if not exists public.worldcup_withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  user_id uuid not null,
  user_email text,
  display_name text,
  network text not null check (network in ('trc20', 'erc20')),
  address text not null,
  amount numeric(20, 8) not null check (amount > 0),
  currency text not null default 'USDT',
  status text not null default 'submitted'
    check (status in ('submitted', 'approved', 'rejected', 'paid')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  paid_at timestamptz,
  paid_by text,
  external_tx_hash text,
  wallet_transaction_id uuid references public.worldcup_wallet_transactions(id) on delete set null,
  raw jsonb
);

create index if not exists worldcup_withdrawal_requests_user_idx
  on public.worldcup_withdrawal_requests (user_id, created_at desc);

create index if not exists worldcup_withdrawal_requests_status_idx
  on public.worldcup_withdrawal_requests (status, created_at desc);

alter table public.worldcup_withdrawal_requests enable row level security;

drop policy if exists "worldcup_withdrawal_requests_owner_read"
on public.worldcup_withdrawal_requests;
create policy "worldcup_withdrawal_requests_owner_read"
on public.worldcup_withdrawal_requests for select to public
using (auth.uid() = user_id);

-- Writes happen only through authenticated server routes.

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

  perform pg_advisory_xact_lock(hashtext(p_tournament_id::text || ':' || p_user_id::text || ':withdrawal'));

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

revoke execute on function public.worldcup_record_withdrawal(uuid, uuid, uuid, numeric, text, text)
from public, anon, authenticated;
grant execute on function public.worldcup_record_withdrawal(uuid, uuid, uuid, numeric, text, text)
to service_role;
