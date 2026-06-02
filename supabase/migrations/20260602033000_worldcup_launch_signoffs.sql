create table if not exists public.worldcup_launch_signoffs (
  key text primary key,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'waived')),
  evidence_note text,
  evidence_url text,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'system',
  raw jsonb not null default '{}'::jsonb
);

alter table public.worldcup_launch_signoffs enable row level security;

revoke all on table public.worldcup_launch_signoffs from anon;
revoke all on table public.worldcup_launch_signoffs from authenticated;

insert into public.worldcup_launch_signoffs (key, status, evidence_note, updated_by)
values
  ('real_usdt_trc20_deposit_test', 'pending', null, 'system'),
  ('real_usdt_erc20_deposit_test', 'pending', null, 'system'),
  ('real_usdt_withdrawal_payout_test', 'pending', null, 'system'),
  ('operator_policy_review', 'pending', null, 'system'),
  ('legal_compliance_review', 'pending', null, 'system')
on conflict (key) do nothing;
