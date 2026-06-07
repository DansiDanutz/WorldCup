update public.worldcup_entries
set referral_fee_percent = case
  when referrer_user_id is not null then 5
  else 0
end
where (referrer_user_id is not null and referral_fee_percent <> 5)
   or (referrer_user_id is null and referral_fee_percent <> 0);

update public.worldcup_referrals
set referral_fee_percent = 5
where referral_fee_percent <> 5;

alter table public.worldcup_entries
  drop constraint if exists worldcup_entries_referral_fee_percent_check;

alter table public.worldcup_entries
  add constraint worldcup_entries_referral_fee_percent_check
  check (referral_fee_percent in (0, 5));

alter table public.worldcup_referrals
  drop constraint if exists worldcup_referrals_referral_fee_percent_check;

alter table public.worldcup_referrals
  add constraint worldcup_referrals_referral_fee_percent_check
  check (referral_fee_percent = 5);

create or replace function public.worldcup_force_flat_referral_percent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'worldcup_entries' then
    new.referral_fee_percent := case
      when new.referrer_user_id is not null then 5
      else 0
    end;
    return new;
  end if;

  if tg_table_name = 'worldcup_referrals' then
    new.referral_fee_percent := 5;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists worldcup_entries_flat_referral_percent on public.worldcup_entries;
create trigger worldcup_entries_flat_referral_percent
before insert or update of referrer_user_id, referral_fee_percent
on public.worldcup_entries
for each row
execute function public.worldcup_force_flat_referral_percent();

drop trigger if exists worldcup_referrals_flat_referral_percent on public.worldcup_referrals;
create trigger worldcup_referrals_flat_referral_percent
before insert or update of referral_fee_percent
on public.worldcup_referrals
for each row
execute function public.worldcup_force_flat_referral_percent();

revoke execute on function public.worldcup_force_flat_referral_percent()
from public, anon, authenticated;
