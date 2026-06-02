-- Responsible play controls for paid entry flows.
--
-- Users can set an entry-ticket limit and activate a self-exclusion period.
-- Writes happen through authenticated server routes so the app can enforce
-- monotonic self-exclusion periods and keep the audit fields consistent.

create table if not exists public.worldcup_responsible_play_settings (
  user_id uuid primary key,
  max_entries integer,
  self_excluded_until timestamptz,
  self_exclusion_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint worldcup_responsible_play_max_entries_check
    check (max_entries is null or (max_entries >= 0 and max_entries <= 10)),
  constraint worldcup_responsible_play_reason_check
    check (self_exclusion_reason is null or char_length(self_exclusion_reason) <= 300)
);

alter table public.worldcup_responsible_play_settings enable row level security;

drop policy if exists "worldcup_responsible_play_owner_read"
on public.worldcup_responsible_play_settings;
create policy "worldcup_responsible_play_owner_read"
on public.worldcup_responsible_play_settings for select to public
using (auth.uid() = user_id);

-- No public insert/update/delete policies: server routes use the service role.
