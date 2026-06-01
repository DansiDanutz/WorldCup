alter table public.worldcup_referrals
  drop constraint if exists worldcup_referrals_referral_fee_percent_check;

alter table public.worldcup_referrals
  add constraint worldcup_referrals_referral_fee_percent_check
  check (referral_fee_percent in (3, 5));

update public.worldcup_referrals r
set referral_fee_percent = case
  when exists (
    select 1
    from public.worldcup_entries inviter_entry
    where inviter_entry.tournament_id = r.tournament_id
      and inviter_entry.user_id = r.inviter_user_id
      and inviter_entry.referrer_user_id is not null
  ) then 5
  else 3
end;
