-- Preserve campaign source tags when an invited visitor becomes a Google
-- account. These fields are aggregate marketing attribution only; the accepted
-- inviter remains locked by signup_referrer_user_id.

alter table public.worldcup_referral_profiles
  add column if not exists signup_utm_source text
    check (signup_utm_source is null or char_length(signup_utm_source) between 1 and 80),
  add column if not exists signup_utm_medium text
    check (signup_utm_medium is null or char_length(signup_utm_medium) between 1 and 80),
  add column if not exists signup_utm_campaign text
    check (signup_utm_campaign is null or char_length(signup_utm_campaign) between 1 and 120),
  add column if not exists signup_utm_content text
    check (signup_utm_content is null or char_length(signup_utm_content) between 1 and 160);

create index if not exists worldcup_referral_profiles_signup_utm_source_idx
  on public.worldcup_referral_profiles (signup_utm_source, signup_referral_accepted_at desc)
  where signup_utm_source is not null;

create index if not exists worldcup_referral_profiles_signup_utm_campaign_idx
  on public.worldcup_referral_profiles (signup_utm_campaign, signup_referral_accepted_at desc)
  where signup_utm_campaign is not null;

comment on column public.worldcup_referral_profiles.signup_utm_source is
  'Optional UTM source from the invitation link that produced the accepted signup referral.';

comment on column public.worldcup_referral_profiles.signup_utm_medium is
  'Optional UTM medium from the invitation link that produced the accepted signup referral.';

comment on column public.worldcup_referral_profiles.signup_utm_campaign is
  'Optional UTM campaign from the invitation link that produced the accepted signup referral.';

comment on column public.worldcup_referral_profiles.signup_utm_content is
  'Optional UTM content from the invitation link that produced the accepted signup referral.';
