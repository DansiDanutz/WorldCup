-- Age verification for payouts (prove 18+ before withdrawing) ---------------
--
-- Product rule: anyone may sign in, deposit, buy tickets, and play after the
-- self-attested 18+ consent gate. But before a player can WITHDRAW USDT from
-- their wallet, they must prove they are 18 or older by sending a government
-- photo ID to the operator. Documents are reviewed OFF-PLATFORM; this app
-- stores only the review STATE (no ID images), set by an admin through /admin.
--
-- Only withdrawals are gated. Deposits, ticket purchases, transfers, and entry
-- locking are unaffected. The status lives on the per-user referral profile so
-- the withdrawal route already has it on hand.
--
-- Status lifecycle:
--   unverified -> pending     (player marks "documents sent")
--   pending    -> verified    (admin confirms 18+, with a required note)
--   pending    -> rejected    (admin rejects, with a required note)
--   rejected   -> pending     (player re-submits clearer documents)
--
-- Writes happen only through the service role (no client RLS write policy on
-- this table), so a player can never set their own status to 'verified'.

alter table public.worldcup_referral_profiles
  add column if not exists age_verification_status text not null default 'unverified'
    check (age_verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  add column if not exists age_verification_note text,
  add column if not exists age_verification_submitted_at timestamptz,
  add column if not exists age_verified_at timestamptz,
  add column if not exists age_verified_by text;

-- Index the admin review queue (pending/rejected/verified rows), newest first.
create index if not exists worldcup_referral_profiles_age_status_idx
  on public.worldcup_referral_profiles (age_verification_status, age_verification_submitted_at desc);
