-- Add campaign attribution to app-view analytics.
-- UTM fields are optional so existing view rows and non-campaign visits remain
-- valid. Values are written only through the server analytics route.

alter table public.worldcup_app_views
  add column if not exists utm_source text
    check (utm_source is null or char_length(utm_source) between 1 and 80),
  add column if not exists utm_medium text
    check (utm_medium is null or char_length(utm_medium) between 1 and 80),
  add column if not exists utm_campaign text
    check (utm_campaign is null or char_length(utm_campaign) between 1 and 120),
  add column if not exists utm_content text
    check (utm_content is null or char_length(utm_content) between 1 and 160);

create index if not exists worldcup_app_views_utm_source_created_at_idx
  on public.worldcup_app_views (utm_source, created_at desc)
  where utm_source is not null;

create index if not exists worldcup_app_views_utm_campaign_created_at_idx
  on public.worldcup_app_views (utm_campaign, created_at desc)
  where utm_campaign is not null;

comment on column public.worldcup_app_views.utm_source is
  'Optional UTM source captured from campaign links for aggregate launch-funnel attribution.';

comment on column public.worldcup_app_views.utm_medium is
  'Optional UTM medium captured from campaign links for aggregate launch-funnel attribution.';

comment on column public.worldcup_app_views.utm_campaign is
  'Optional UTM campaign captured from campaign links for aggregate launch-funnel attribution.';

comment on column public.worldcup_app_views.utm_content is
  'Optional UTM content captured from campaign links for aggregate launch-funnel attribution.';
