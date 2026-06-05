-- Store frozen USDT sender wallets separately by network.
-- The sender wallet is also the withdrawal destination for that network.

alter table public.worldcup_referral_profiles
  add column if not exists usdt_sender_wallet_trc20_address text,
  add column if not exists usdt_sender_wallet_trc20_updated_at timestamptz,
  add column if not exists usdt_sender_wallet_erc20_address text,
  add column if not exists usdt_sender_wallet_erc20_updated_at timestamptz;

update public.worldcup_referral_profiles
set
  usdt_sender_wallet_trc20_address = usdt_sender_wallet_address,
  usdt_sender_wallet_trc20_updated_at = usdt_sender_wallet_updated_at
where usdt_sender_wallet_network = 'trc20'
  and usdt_sender_wallet_address is not null
  and usdt_sender_wallet_trc20_address is null;

update public.worldcup_referral_profiles
set
  usdt_sender_wallet_erc20_address = usdt_sender_wallet_address,
  usdt_sender_wallet_erc20_updated_at = usdt_sender_wallet_updated_at
where usdt_sender_wallet_network = 'erc20'
  and usdt_sender_wallet_address is not null
  and usdt_sender_wallet_erc20_address is null;

create index if not exists worldcup_referral_profiles_usdt_sender_wallet_trc20_idx
  on public.worldcup_referral_profiles (usdt_sender_wallet_trc20_address)
  where usdt_sender_wallet_trc20_address is not null;

create index if not exists worldcup_referral_profiles_usdt_sender_wallet_erc20_idx
  on public.worldcup_referral_profiles (usdt_sender_wallet_erc20_address)
  where usdt_sender_wallet_erc20_address is not null;

create or replace function public.worldcup_prevent_usdt_sender_wallet_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.usdt_sender_wallet_trc20_address is not null
     and new.usdt_sender_wallet_trc20_address is distinct from old.usdt_sender_wallet_trc20_address then
    raise exception 'USDT_TRC20_SENDER_WALLET_LOCKED'
      using errcode = '23514';
  end if;

  if old.usdt_sender_wallet_erc20_address is not null
     and new.usdt_sender_wallet_erc20_address is distinct from old.usdt_sender_wallet_erc20_address then
    raise exception 'USDT_ERC20_SENDER_WALLET_LOCKED'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists worldcup_prevent_usdt_sender_wallet_change
  on public.worldcup_referral_profiles;

create trigger worldcup_prevent_usdt_sender_wallet_change
before update of usdt_sender_wallet_trc20_address, usdt_sender_wallet_erc20_address
on public.worldcup_referral_profiles
for each row
execute function public.worldcup_prevent_usdt_sender_wallet_change();
