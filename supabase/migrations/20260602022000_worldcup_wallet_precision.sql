-- Preserve USDT ledger precision. Deposits already store numeric(20,8); wallet
-- transactions must match so verified USDT credits are not rounded to cents.

alter table public.worldcup_wallet_transactions
  alter column amount type numeric(20,8)
  using amount::numeric(20,8);
