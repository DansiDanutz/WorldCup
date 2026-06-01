alter table public.worldcup_tournaments
  add column if not exists ticket_price_amount numeric(12,2) not null default 0
    check (ticket_price_amount >= 0);

alter table public.worldcup_referral_profiles
  add column if not exists email text;

create table if not exists public.worldcup_wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  from_user_id uuid,
  to_user_id uuid,
  amount numeric(12,2) not null check (amount > 0),
  transaction_type text not null default 'transfer'
    check (transaction_type in ('transfer', 'admin_credit', 'admin_debit')),
  note text,
  created_at timestamptz not null default now(),
  created_by text not null default 'admin',
  check (from_user_id is not null or to_user_id is not null),
  check (from_user_id is null or to_user_id is null or from_user_id <> to_user_id)
);

create table if not exists public.worldcup_tickets (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  user_id uuid not null,
  price_amount numeric(12,2) not null default 0 check (price_amount >= 0),
  assigned_at timestamptz not null default now(),
  assigned_by text not null default 'admin',
  consumed_by_entry_id uuid references public.worldcup_entries(id) on delete set null,
  consumed_at timestamptz
);

create index if not exists worldcup_wallet_transactions_tournament_idx
  on public.worldcup_wallet_transactions (tournament_id, created_at desc);

create index if not exists worldcup_wallet_transactions_from_idx
  on public.worldcup_wallet_transactions (from_user_id);

create index if not exists worldcup_wallet_transactions_to_idx
  on public.worldcup_wallet_transactions (to_user_id);

create index if not exists worldcup_tickets_user_idx
  on public.worldcup_tickets (tournament_id, user_id, consumed_at);

alter table public.worldcup_wallet_transactions enable row level security;
alter table public.worldcup_tickets enable row level security;

drop policy if exists "worldcup_wallet_transactions_read" on public.worldcup_wallet_transactions;
create policy "worldcup_wallet_transactions_read"
on public.worldcup_wallet_transactions for select to public using (true);

drop policy if exists "worldcup_tickets_read" on public.worldcup_tickets;
create policy "worldcup_tickets_read"
on public.worldcup_tickets for select to public using (true);
