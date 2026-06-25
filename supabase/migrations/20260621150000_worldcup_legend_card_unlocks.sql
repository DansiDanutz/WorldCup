create table if not exists public.worldcup_legend_card_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  episode integer not null check (episode > 0),
  unlock_source text not null default 'youtube' check (unlock_source in ('youtube')),
  video_url text,
  unlocked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id),
  constraint worldcup_legend_card_unlocks_card_id_shape
    check (card_id ~ '^[a-z0-9][a-z0-9-]{2,80}$')
);

alter table public.worldcup_legend_card_unlocks enable row level security;

drop policy if exists "worldcup_legend_card_unlocks_owner_read"
on public.worldcup_legend_card_unlocks;

create policy "worldcup_legend_card_unlocks_owner_read"
on public.worldcup_legend_card_unlocks
for select
to authenticated
using (auth.uid() = user_id);

revoke all on public.worldcup_legend_card_unlocks from anon, authenticated;
grant select on public.worldcup_legend_card_unlocks to authenticated;
