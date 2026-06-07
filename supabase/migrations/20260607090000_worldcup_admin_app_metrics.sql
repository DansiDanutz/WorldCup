-- Admin analytics: lightweight app-view events for launch funnel reporting.
-- Public users never read this table directly; the app records bounded events
-- through /api/analytics/view and admins read aggregated counts only.

create table if not exists public.worldcup_app_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null check (char_length(path) between 1 and 240),
  referrer text,
  referral_code text check (referral_code is null or referral_code ~ '^[A-Z0-9]{6,12}$'),
  session_id text check (session_id is null or char_length(session_id) <= 128),
  user_id uuid,
  user_agent text check (user_agent is null or char_length(user_agent) <= 500)
);

create index if not exists worldcup_app_views_created_at_idx
  on public.worldcup_app_views (created_at desc);

create index if not exists worldcup_app_views_path_idx
  on public.worldcup_app_views (path);

create index if not exists worldcup_app_views_referral_code_idx
  on public.worldcup_app_views (referral_code)
  where referral_code is not null;

create index if not exists worldcup_app_views_user_idx
  on public.worldcup_app_views (user_id)
  where user_id is not null;

alter table public.worldcup_app_views enable row level security;

revoke all on table public.worldcup_app_views from anon, authenticated;

comment on table public.worldcup_app_views is
  'Bounded app page-view events used only for owner/admin aggregate launch metrics.';
