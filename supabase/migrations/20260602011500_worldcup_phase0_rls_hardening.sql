drop policy if exists "worldcup_entries_create" on public.worldcup_entries;
drop policy if exists "worldcup_entry_teams_create" on public.worldcup_entry_teams;

drop policy if exists "worldcup_entries_read" on public.worldcup_entries;
drop policy if exists "worldcup_entry_teams_read" on public.worldcup_entry_teams;

drop policy if exists "worldcup_referral_profiles_read" on public.worldcup_referral_profiles;
drop policy if exists "worldcup_referrals_read" on public.worldcup_referrals;

create policy "worldcup_referral_profiles_self_read"
on public.worldcup_referral_profiles for select
to authenticated
using (auth.uid() = user_id);

create policy "worldcup_referral_profiles_self_insert"
on public.worldcup_referral_profiles for insert
to authenticated
with check (auth.uid() = user_id);

create policy "worldcup_referral_profiles_self_update"
on public.worldcup_referral_profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
