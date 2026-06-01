-- Security hardening: remove the permissive public INSERT/SELECT policies that
-- exposed player PII and let the anon key bypass the ticket-gated entry flow.
--
-- After this migration:
--   * Anonymous clients can no longer read referral profiles (emails) or
--     referrals, and can only read their own entries/picks.
--   * Entries and picks can no longer be inserted with the anon key; they are
--     written exclusively by the server (service role) through the
--     worldcup_create_entry RPC.
--   * Public leaderboard/schema reads keep working because the leaderboard and
--     points views run with the view owner's privileges, not the caller's.

-- worldcup_entries -----------------------------------------------------------
drop policy if exists "worldcup_entries_create" on public.worldcup_entries;

drop policy if exists "worldcup_entries_read" on public.worldcup_entries;
create policy "worldcup_entries_owner_read"
on public.worldcup_entries for select to public
using (auth.uid() = user_id);

-- worldcup_entry_teams -------------------------------------------------------
drop policy if exists "worldcup_entry_teams_create" on public.worldcup_entry_teams;

drop policy if exists "worldcup_entry_teams_read" on public.worldcup_entry_teams;
create policy "worldcup_entry_teams_owner_read"
on public.worldcup_entry_teams for select to public
using (
  exists (
    select 1
    from public.worldcup_entries e
    where e.id = worldcup_entry_teams.entry_id
      and e.user_id = auth.uid()
  )
);

-- worldcup_referral_profiles -------------------------------------------------
drop policy if exists "worldcup_referral_profiles_read" on public.worldcup_referral_profiles;
create policy "worldcup_referral_profiles_owner_read"
on public.worldcup_referral_profiles for select to public
using (auth.uid() = user_id);

-- worldcup_referrals ---------------------------------------------------------
drop policy if exists "worldcup_referrals_read" on public.worldcup_referrals;
create policy "worldcup_referrals_party_read"
on public.worldcup_referrals for select to public
using (auth.uid() = inviter_user_id or auth.uid() = invited_user_id);

-- Allow the documented late-entry path and the resolved referral tiers -------
alter table public.worldcup_entries
  drop constraint if exists worldcup_entries_referral_fee_percent_check;

alter table public.worldcup_entries
  add constraint worldcup_entries_referral_fee_percent_check
  check (referral_fee_percent in (0, 3, 5));
