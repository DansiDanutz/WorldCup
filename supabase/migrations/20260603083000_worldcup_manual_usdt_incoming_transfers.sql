alter table public.worldcup_deposit_claims
  add column if not exists sender_wallet_address text;

alter table public.worldcup_referral_profiles
  add column if not exists usdt_sender_wallet_address text,
  add column if not exists usdt_sender_wallet_network text
    check (usdt_sender_wallet_network is null or usdt_sender_wallet_network in ('trc20', 'erc20')),
  add column if not exists usdt_sender_wallet_updated_at timestamptz;

create index if not exists worldcup_deposit_claims_sender_wallet_idx
  on public.worldcup_deposit_claims (sender_wallet_address)
  where sender_wallet_address is not null;

create index if not exists worldcup_referral_profiles_usdt_sender_wallet_idx
  on public.worldcup_referral_profiles (usdt_sender_wallet_address)
  where usdt_sender_wallet_address is not null;
