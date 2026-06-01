create extension if not exists "uuid-ossp";

alter table public.worldcup_entries
  drop constraint if exists worldcup_entries_user_id_fkey;

alter table public.worldcup_entries
  add column if not exists referral_code text,
  add column if not exists referrer_user_id uuid,
  add column if not exists referral_fee_percent numeric(5,2)
    not null default 0 check (referral_fee_percent in (0, 5)),
  add column if not exists referral_terms_accepted_at timestamptz,
  add column if not exists auth_provider text
    not null default 'google' check (auth_provider = 'google');

create unique index if not exists worldcup_entries_user_tournament_unique
  on public.worldcup_entries (tournament_id, user_id)
  where user_id is not null;

create table if not exists public.worldcup_referral_profiles (
  user_id uuid primary key,
  referral_code text not null unique check (referral_code ~ '^[A-Z0-9]{6,12}$'),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worldcup_referrals (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.worldcup_tournaments(id) on delete cascade,
  entry_id uuid references public.worldcup_entries(id) on delete cascade,
  inviter_user_id uuid not null,
  invited_user_id uuid not null,
  referral_code text not null,
  referral_fee_percent numeric(5,2) not null default 5 check (referral_fee_percent = 5),
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (tournament_id, invited_user_id)
);

create index if not exists worldcup_referral_profiles_code_idx
  on public.worldcup_referral_profiles (referral_code);

create index if not exists worldcup_referrals_inviter_idx
  on public.worldcup_referrals (inviter_user_id);

alter table public.worldcup_referral_profiles enable row level security;
alter table public.worldcup_referrals enable row level security;

drop policy if exists "worldcup_referral_profiles_read" on public.worldcup_referral_profiles;
create policy "worldcup_referral_profiles_read"
on public.worldcup_referral_profiles for select to public using (true);

drop policy if exists "worldcup_referrals_read" on public.worldcup_referrals;
create policy "worldcup_referrals_read"
on public.worldcup_referrals for select to public using (true);
