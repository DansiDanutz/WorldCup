-- Operator launch policy for paid-action guardrails.
--
-- This is server/admin managed and lets operators adjust country policy plus
-- deposit/withdrawal limits without redeploying environment variables.

create table if not exists public.worldcup_operator_policy (
  singleton_id boolean primary key default true check (singleton_id),
  allowed_countries text[] not null default '{}',
  blocked_countries text[] not null default '{}',
  max_deposit_claim_amount numeric(20, 8) check (max_deposit_claim_amount is null or max_deposit_claim_amount > 0),
  max_daily_deposit_claim_amount numeric(20, 8) check (max_daily_deposit_claim_amount is null or max_daily_deposit_claim_amount > 0),
  max_withdrawal_request_amount numeric(20, 8) check (max_withdrawal_request_amount is null or max_withdrawal_request_amount > 0),
  max_daily_withdrawal_request_amount numeric(20, 8) check (max_daily_withdrawal_request_amount is null or max_daily_withdrawal_request_amount > 0),
  updated_at timestamptz not null default now(),
  updated_by text not null default 'system'
);

alter table public.worldcup_operator_policy enable row level security;

insert into public.worldcup_operator_policy (singleton_id)
values (true)
on conflict (singleton_id) do nothing;
