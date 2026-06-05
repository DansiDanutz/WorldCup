-- Signup referral persistence ----------------------------------------------
--
-- A ticket from an agent is only a fallback referral source. If the player
-- accepted an inviter code during registration, store that choice on the
-- referral profile so it survives browser storage loss before entry locking.

alter table public.worldcup_referral_profiles
  add column if not exists signup_referral_code text,
  add column if not exists signup_referrer_user_id uuid,
  add column if not exists signup_referral_accepted_at timestamptz;

create index if not exists worldcup_referral_profiles_signup_referrer_idx
  on public.worldcup_referral_profiles (signup_referrer_user_id)
  where signup_referrer_user_id is not null;
