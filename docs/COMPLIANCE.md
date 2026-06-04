# Compliance Scaffolding (Real-Money Operation)

WorldCup collects paid entry tickets and pays cash-style prizes. That makes it a
paid prize competition / gaming product, which is regulated and varies widely by
jurisdiction. This document is **engineering scaffolding and a checklist**, not
legal advice. Obtain qualified legal counsel for every market you operate in
before launch.

## Required before accepting real money

- [ ] **Legal classification** per target jurisdiction (skill contest vs.
      lottery vs. gambling) and any required licences.
- [x] **Terms of Use** and **Privacy Policy** published and linked from
      the entry flow, with explicit acceptance recorded per user.
- [x] **Age gating** enforces self-attested 18+ consent before entry creation,
      **and** requires document-backed 18+ age verification before any
      withdrawal/payout (documents reviewed off-platform; an admin records the
      verified/rejected state, which gates the withdrawal request and the admin
      approval).
- [x] **Configurable geo-restriction** for paid entries and deposits via
      `WORLDCUP_ALLOWED_COUNTRIES` / `WORLDCUP_BLOCKED_COUNTRIES`.
- [ ] **KYC / identity verification** for prize payouts above applicable
      thresholds, and AML monitoring.
- [x] **Responsible-gaming** controls: configurable deposit claim limits,
      self-exclusion, entry-ticket limits, and support-resource surfacing are
      implemented. Operator policy still needs legal review per market.
- [x] **USDT deposit intake** for TRC20/ERC20 shared KuCoin addresses, with
      user-submitted transaction claims and admin verification/crediting.
- [x] **Withdrawal request queue** with admin review, balance-checked internal
      wallet debits, required audit notes, and external transaction-hash
      recording.
- [ ] **External prize payment operations**. The app does **not** send external
      funds automatically; KYC/AML checks, operator approval, and manual USDT
      payout execution remain required.
- [ ] **Tax handling** for prizes (reporting/withholding as required).
- [ ] **Auditable records**: the `worldcup_payouts` table and settlement wallet
      transactions already provide a per-prize audit trail; retain per your
      record-keeping obligations.

## What the codebase already provides

- Public `/terms` and `/privacy` pages with user-facing rules and data-use
  disclosures.
- Versioned consent gate (`CURRENT_TERMS_VERSION`) that requires users to
  re-accept when the public terms or privacy text changes.
- Environment-driven country gating for deposit addresses, deposit claims,
  ticket purchases, and entry creation.
- Admin-managed runtime operator policy (`worldcup_operator_policy`) for
  country gating and USDT deposit/withdrawal guardrails without redeploying.
- New paid actions are launch-gated by that operator policy: deposits require a
  country policy plus a deposit cap, withdrawals require a country policy plus a
  withdrawal cap, and ticket purchase / entry locking require a country policy.
- Google-only login gating for paid entries.
- Document-backed **18+ age verification before payouts**
  (`worldcup_referral_profiles.age_verification_status`). Players send a
  government photo ID off-platform; an admin records `verified`/`rejected` in
  `/admin`. Both the user withdrawal request (`POST /api/withdrawals`) and the
  admin approval refuse to move funds until the account is `verified`. No ID
  images are stored in the app — only the review state, timestamp, and note.
- Shared USDT TRC20/ERC20 deposit addresses with QR assets, user deposit
  claims, admin review, KuCoin lookup support, required audit notes, and wallet
  ledger crediting.
- Operator policy launch gate requires at least one USDT deposit claim cap via
  `WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT` and
  `WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT`, or the matching admin-managed
  Operator policy fields, before deposits can open.
- Operator policy launch gate requires at least one USDT withdrawal request cap
  via `WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT` and
  `WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT`, or the matching
  admin-managed Operator policy fields, before withdrawal requests can open.
- Per-user responsible play settings (`worldcup_responsible_play_settings`) for
  self-exclusion and entry-ticket limits. These are enforced server-side on
  deposit address access, deposit claims, ticket purchase, admin ticket
  assignment, and entry locking. Self-exclusion does not block withdrawal
  requests for an existing wallet balance. The wallet surfaces support-resource
  links.
- Withdrawal request storage (`worldcup_withdrawal_requests`), user request
  API, admin approval/rejection/paid marking, required admin notes, and
  balance-checked wallet debits through `worldcup_record_withdrawal(...)`.
- Auditable payout ledger (`worldcup_payouts`) tied to wallet credits via
  `worldcup_settle_payouts`.
- Referral agreement acceptance is timestamped (`referral_terms_accepted_at`).
- Admin actions run through an authenticated, allowlisted `/admin` surface and
  are attributed (`created_by` / `assigned_by`).
- Prize pool fee is configurable and kept internal; only the net player-facing
  pool is shown.

## What is intentionally NOT implemented

- KYC/AML, sanctions screening, automated external payout execution, and tax
  withholding are **not** built. They depend on chosen vendors and the legal
  classification above. The login, ticket-assignment, payout, and withdrawal
  surfaces are the natural insertion points to add them.
