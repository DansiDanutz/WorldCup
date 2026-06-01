# Compliance Scaffolding (Real-Money Operation)

WorldCup collects paid entry tickets and pays cash-style prizes. That makes it a
paid prize competition / gaming product, which is regulated and varies widely by
jurisdiction. This document is **engineering scaffolding and a checklist**, not
legal advice. Obtain qualified legal counsel for every market you operate in
before launch.

## Required before accepting real money

- [ ] **Legal classification** per target jurisdiction (skill contest vs.
      lottery vs. gambling) and any required licences.
- [ ] **Terms & Conditions** and **Privacy Policy** published and linked from
      the entry flow, with explicit acceptance recorded per user.
- [ ] **Age gating** (commonly 18+; higher in some regions) enforced at sign-up.
- [ ] **Geo-restriction** of prohibited jurisdictions.
- [ ] **KYC / identity verification** for prize payouts above applicable
      thresholds, and AML monitoring.
- [ ] **Responsible-gaming** controls: self-exclusion, deposit/entry limits,
      support resources.
- [ ] **Payment-rail integration** for real deposits/withdrawals. The internal
      `worldcup_wallet_transactions` ledger is accounting only; it does **not**
      move external funds.
- [ ] **Tax handling** for prizes (reporting/withholding as required).
- [ ] **Auditable records**: the `worldcup_payouts` table and settlement wallet
      transactions already provide a per-prize audit trail; retain per your
      record-keeping obligations.

## What the codebase already provides

- Auditable payout ledger (`worldcup_payouts`) tied to wallet credits via
  `worldcup_settle_payouts`.
- Referral agreement acceptance is timestamped (`referral_terms_accepted_at`).
- Admin actions run through an authenticated, allowlisted `/admin` surface and
  are attributed (`created_by` / `assigned_by`).
- Prize pool fee is configurable and kept internal; only the net player-facing
  pool is shown.

## What is intentionally NOT implemented

- KYC/AML, age/geo gating, payment processing, and tax withholding are **not**
  built. They depend on chosen vendors and the legal classification above. The
  entry flow has natural insertion points (the login/register gate and the
  ticket-assignment step) to add them.
