alter table public.worldcup_legend_card_unlocks
  drop constraint if exists worldcup_legend_card_unlocks_unlock_source_check;

alter table public.worldcup_legend_card_unlocks
  add constraint worldcup_legend_card_unlocks_unlock_source_check
  check (unlock_source in ('youtube', 'story'));
