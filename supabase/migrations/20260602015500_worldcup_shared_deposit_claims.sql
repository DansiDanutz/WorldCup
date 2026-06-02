-- Shared KuCoin main-wallet deposits need a user-submitted claim because
-- TRC-20 / ERC-20 USDT deposits do not carry a memo/tag that identifies the
-- WorldCup user.

create table if not exists public.worldcup_deposit_claims (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  user_id uuid not null,
  user_email text,
  display_name text,
  network text not null check (network in ('trc20', 'erc20')),
  address text not null,
  amount numeric(20, 8) not null check (amount > 0),
  currency text not null default 'USDT' check (currency = 'USDT'),
  tx_hash text not null,
  status text not null default 'submitted' check (status in ('submitted', 'credited', 'rejected')),
  admin_note text,
  credited_by text,
  credited_at timestamptz,
  worldcup_deposit_id uuid references public.worldcup_deposits(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (network, tx_hash)
);

create index if not exists worldcup_deposit_claims_user_idx
  on public.worldcup_deposit_claims (user_id, created_at desc);

create index if not exists worldcup_deposit_claims_status_idx
  on public.worldcup_deposit_claims (status, created_at desc);

alter table public.worldcup_deposit_claims enable row level security;

drop policy if exists "worldcup_deposit_claims_owner_read" on public.worldcup_deposit_claims;
create policy "worldcup_deposit_claims_owner_read"
on public.worldcup_deposit_claims for select to public
using (auth.uid() = user_id);
