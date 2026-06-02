alter table public.worldcup_deposit_claims
  drop constraint if exists worldcup_deposit_claims_status_check;

alter table public.worldcup_deposit_claims
  add constraint worldcup_deposit_claims_status_check
  check (status in ('submitted', 'processing', 'credited', 'rejected'));
