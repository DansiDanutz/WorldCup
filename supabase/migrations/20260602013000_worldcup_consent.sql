-- Consent capture for real-money compliance scaffolding.
--
-- Records that a user confirmed they meet the minimum age and accepted the
-- current Terms & Privacy version. The entry API requires a current consent
-- row before an entry can be locked. Policy values (age threshold, terms
-- content/version) are product/legal decisions; this only provides the
-- mechanism and the audit trail. See docs/COMPLIANCE.md.

create table if not exists public.worldcup_consent (
  user_id uuid primary key,
  age_confirmed boolean not null default false,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  ip text,
  updated_at timestamptz not null default now()
);

alter table public.worldcup_consent enable row level security;

drop policy if exists "worldcup_consent_owner_read" on public.worldcup_consent;
create policy "worldcup_consent_owner_read"
on public.worldcup_consent for select to public
using (auth.uid() = user_id);
-- Writes happen only through the service role in the consent API.
