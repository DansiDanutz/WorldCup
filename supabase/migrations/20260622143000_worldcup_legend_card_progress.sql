create table if not exists public.worldcup_legend_card_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  episode integer not null check (episode > 0),
  video_url text,
  pulse_read_at timestamptz,
  listened_at timestamptz,
  youtube_opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id),
  constraint worldcup_legend_card_progress_card_id_shape
    check (card_id ~ '^[a-z0-9][a-z0-9-]{2,80}$'),
  constraint worldcup_legend_card_progress_has_event
    check (
      pulse_read_at is not null
      or listened_at is not null
      or youtube_opened_at is not null
    )
);

alter table public.worldcup_legend_card_progress enable row level security;

drop policy if exists "worldcup_legend_card_progress_owner_read"
on public.worldcup_legend_card_progress;

create policy "worldcup_legend_card_progress_owner_read"
on public.worldcup_legend_card_progress
for select
to authenticated
using (auth.uid() = user_id);

revoke all on public.worldcup_legend_card_progress from anon, authenticated;
grant select on public.worldcup_legend_card_progress to authenticated;
