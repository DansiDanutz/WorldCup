alter table public.worldcup_tournaments
  add column if not exists prize_pool_amount numeric(12,2) not null default 0
    check (prize_pool_amount >= 0),
  add column if not exists prize_pool_fee_percent numeric(5,2) not null default 20
    check (prize_pool_fee_percent >= 0 and prize_pool_fee_percent < 100);
