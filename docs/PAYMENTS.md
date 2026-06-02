# USDT Deposits (KuCoin Broker)

Players fund an **internal wallet** with USDT, then buy entry tickets from that
balance. The wallet ledger (`worldcup_wallet_transactions`) stays the single
source of truth for balances; deposits and ticket purchases are ledger entry
types.

Production currently uses shared KuCoin main-account receive addresses for
TRC-20 and ERC-20, shown with QR codes in `/wallet`. Users submit the amount and
transaction hash after sending funds; admins verify the KuCoin deposit and
credit the matching wallet through `/admin`.

## Flow

Current production flow:

```
User → shared USDT receive address (TRC-20 / ERC-20)
     → user submits amount + transaction hash
     → admin verifies the KuCoin deposit
     → admin credits the claim
     → worldcup_credit_deposit() credits the wallet (idempotent)
     → worldcup_purchase_ticket() buys a ticket from the balance
     → entry lock consumes the ticket
```

Withdrawal request flow:

```
User → submits USDT network, payout address, and amount
     → app checks Google session, geo rules, withdrawal limits, and wallet balance
     → admin approves with an audit note
     → worldcup_record_withdrawal() debits the internal wallet
     → operator sends USDT manually outside the app
     → admin marks the request paid with the external transaction hash
```

Supported broker sub-account flow:

```
User → unique KuCoin deposit address (TRC-20 / ERC-20)
     → KuCoin sub-account (one per user)
     → reconciler confirms the deposit on KuCoin
     → worldcup_credit_deposit() credits the wallet (idempotent)
     → worldcup_purchase_ticket() buys a ticket from the balance
     → entry lock consumes the ticket (existing flow)
```

Because TRC-20 / ERC-20 USDT have **no memo/tag**, each user gets a **unique
deposit address per network** (via a KuCoin Broker sub-account) so deposits are
attributable when the broker-address flow is enabled. In shared-address mode,
the submitted transaction hash and admin review provide attribution.

## Components

- **Migration** `20260602014000_worldcup_usdt_deposits.sql`
  - `worldcup_deposit_addresses` (per-user, per-network address)
  - `worldcup_deposits` (confirmed deposits, unique on `(provider, external_id)`)
  - `worldcup_credit_deposit(...)` — idempotent wallet credit
  - `worldcup_purchase_ticket(...)` — atomic, balance-checked ticket purchase
  - extends the wallet `transaction_type` check with `deposit` / `withdrawal` / `ticket_purchase`
- **Migration** `20260602022000_worldcup_wallet_precision.sql`
  - keeps `worldcup_wallet_transactions.amount` at `numeric(20,8)` so confirmed USDT deposits and wallet ledger credits retain the same precision.
- **Migration** `20260602030000_worldcup_withdrawal_requests.sql`
  - `worldcup_withdrawal_requests` (player payout request queue)
  - `worldcup_record_withdrawal(...)` — balance-checked internal wallet debit when an admin approves a request
- **`src/lib/kucoin.ts`** — KuCoin Broker (ND) adapter. The v2 request signing,
  broker base URL, and deposit-list query shape are unit-tested. The sub-account
  deposit-address endpoint remains available for the broker-address flow and
  should be live-tested before switching away from shared addresses.
- **`src/lib/deposits.ts`** — pure network/amount helpers (unit-tested).
- **`src/lib/responsible-play.ts`** — self-exclusion and entry-ticket limit helpers
  enforced before deposits, ticket purchase, admin ticket assignment, and entry locking.
- **Routes**
  - `GET /api/deposits/address` — returns configured shared TRC-20 + ERC-20 addresses, or provisions per-user broker addresses if shared addresses are unset
  - `GET|POST /api/deposits/claims` — lets signed-in users list and submit deposit claims
  - `GET|POST /api/withdrawals` — lets signed-in users list and submit withdrawal requests
  - `GET|POST /api/responsible-play` — lets signed-in users set entry-ticket limits and activate self-exclusion
  - `POST /api/admin/deposit-claims` — lets admins list, credit, or reject submitted claims
  - `POST /api/admin/withdrawals` — lets admins list, approve, reject, or mark withdrawal requests paid
  - `POST /api/tickets/purchase` — buys a ticket from the wallet balance
  - `GET|POST /api/deposits/reconcile` — cron; credits confirmed deposits
- **`/wallet`** page — balance, responsible-play controls, QR-coded deposit addresses, claim form/history, withdrawal request form/history, buy ticket.
- **Cron** — `/api/deposits/reconcile` every 10 minutes (`vercel.json`).

## Environment

Set on the server only (never commit real values):

```text
KUCOIN_BROKER_API_BASE=https://api-broker.kucoin.com
KUCOIN_API_KEY=
KUCOIN_API_SECRET=
KUCOIN_API_PASSPHRASE=
KUCOIN_BROKER_NAME=
KUCOIN_BROKER_KEY=

# Optional shared main-account receive addresses. These are public receive
# addresses, not API secrets. Use only when deposits are matched manually.
KUCOIN_MAIN_USDT_TRC20_ADDRESS=
KUCOIN_MAIN_USDT_ERC20_ADDRESS=

# Optional read-only main-account API key for live smoke checks and admin claim verification.
KUCOIN_MAIN_API_BASE=https://api.kucoin.com
KUCOIN_MAIN_API_KEY=
KUCOIN_MAIN_API_SECRET=
KUCOIN_MAIN_API_PASSPHRASE=

# Optional responsible deposit limits.
WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT=
WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT=

# Optional responsible withdrawal request limits.
WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT=
WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT=
```

If both shared receive-address variables are unset, deposit provisioning falls
back to the KuCoin Broker sub-account path. If neither shared addresses nor
working broker credentials are configured, deposit provisioning reports
`configured: false` and the wallet/ticket flow degrades gracefully (no crashes).

Production paid-action launch gate:

- Deposits are paused until Operator policy has a paid-action country policy and
  at least one deposit claim cap.
- Withdrawal requests are paused until Operator policy has a paid-action country
  policy and at least one withdrawal request cap.
- Ticket purchases and entry locking are paused until Operator policy has a
  paid-action country policy.

Read-only wallet/account views remain available while the gate is incomplete.
The authenticated account endpoint returns the gate state for deposits,
ticket purchase, entry locking, and withdrawals, so the wallet and entry card
show the Operator policy pause before disabling those paid-action controls.

When both `KUCOIN_MAIN_USDT_TRC20_ADDRESS` and
`KUCOIN_MAIN_USDT_ERC20_ADDRESS` are set, the wallet page shows those shared
main-account receive addresses with local QR-code SVGs. Shared receive
addresses cannot automatically attribute deposits to a player because USDT
TRC-20 / ERC-20 deposits have no memo/tag; users must keep the transaction hash
so deposits can be matched manually.

For shared receive addresses, users submit a deposit claim after sending USDT.
The claim stores `user_id`, email, display name, network, receive address,
amount, and transaction hash in `worldcup_deposit_claims`. Admins review the
claim against KuCoin deposit history and credit it through the admin console,
which calls `worldcup_credit_deposit(...)` so the wallet ledger remains
idempotent on the transaction hash. While an admin credit is in progress the
claim is reserved as `processing`, then finalized as `credited`; duplicate
admin actions return a conflict instead of creating a second wallet credit.
The admin console also exposes a read-only **Verify KuCoin** action that checks
the claim's network, receive address, and transaction hash against recent
successful USDT deposits from the KuCoin main-account API and can prefill the
credit amount from KuCoin. If KuCoin cannot be reached from the production
server, the verifier reports `unavailable` and admins should verify the deposit
manually in KuCoin before crediting.

Every credited shared-address claim must include an admin note. Use the note to
record how the transaction was verified, for example `KuCoin matched walletTxId
123456` or `Manually verified in KuCoin at 2026-06-02 12:30 UTC`. The admin API
rejects credits without this note so the wallet ledger keeps an audit trail for
real-money operations.

Optional responsible deposit claim limits can be set with
`WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT` and
`WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT`. These values cap the user claim
amount before a claim is saved. The daily cap uses a rolling 24-hour window over
submitted, processing, and credited claims; rejected claims do not count.

Users can request USDT withdrawals from their internal wallet balance. Requests
store the user's Google identity snapshot, selected network, payout address,
amount, status, admin note, and final external transaction hash. Approval calls
`worldcup_record_withdrawal(...)`, which recomputes the user's wallet balance
inside the database and writes a `withdrawal` ledger debit. The app does **not**
send external crypto; the operator must send USDT manually after KYC/AML checks,
then mark the request paid in `/admin` with the payout transaction hash.
Responsible-play self-exclusion pauses new deposits, ticket purchases, and
entries, but it does not block a player from requesting a withdrawal of their
existing balance.

Optional withdrawal limits can be set with
`WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT` and
`WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT`. The daily cap uses a
rolling 24-hour window over submitted, approved, and paid withdrawal requests;
rejected requests do not count.

## KuCoin account policy

The KuCoin account used for WorldCup deposits is **receive-only**. It should only
accept incoming USDT deposits and support read/reconciliation checks. Do not
enable trading, withdrawal, margin, futures, lending, earn, or external transfer
features for this API key or sub-account. Keep API permissions at the minimum
needed for deposit addresses, deposit history, and balance checks.

## Production checks

Run the non-destructive production smoke checks:

```bash
set -a; source .env.local; set +a
npm run smoke:prod
```

Run the opt-in deposit-credit plumbing probe:

```bash
set -a; source .env.local; set +a
npm run smoke:prod -- --deposit-credit-probe
```

The probe creates a temporary auth user and ERC-20 claim, verifies the fake
transaction hash returns `missing` or `unavailable` from the live admin KuCoin
check when main-account credentials are configured, proves the live admin API
rejects crediting without an audit note, credits the claim with a verified amount
override and audit note, verifies the confirmed deposit, wallet ledger amount,
raw audit fields, and duplicate-credit conflict handling, then cleans up all
temporary rows.

Run the opt-in authenticated user-flow probe:

```bash
set -a; source .env.local; set +a
npm run smoke:prod -- --auth-flow-probe
```

This proves a normal signed-in Google-provider user is rejected from
`/api/admin/me`, can load deposit addresses, submit deposit claims, submit a
withdrawal request, have an admin approve it with a wallet debit, have it marked
paid with a network-valid fake transaction hash, accept consent, receive an
admin-assigned ticket, lock an entry, and participate in the referral program.
It uses temporary users and cleans up the rows afterward.

Run the opt-in KuCoin live read-only probe:

```bash
set -a; source .env.local; set +a
npm run smoke:prod -- --kucoin-live-probe
```

This checks that the configured main-account KuCoin API key can read USDT main
account and deposit-history data without moving funds. Broker deposit history is
checked only when all optional broker credentials are complete.

## Before going live — checklist

1. Set the shared TRC-20 and ERC-20 receive-address env vars in Vercel
   Production and confirm both QR assets load.
2. Run the production smoke, deposit-credit probe, authenticated user-flow
   probe, and KuCoin live read-only probe above.
3. Send a small real USDT test deposit on TRC-20 and ERC-20, submit the claim as
   a signed-in user, verify in KuCoin, and credit it through the admin console.
4. If switching to unique per-user broker addresses, verify the KuCoin
   sub-account deposit-address endpoint in `src/lib/kucoin.ts` against your live
   broker account before disabling shared addresses.
5. Complete the KuCoin Broker sub-account KYC workflow before enabling real
   player deposits. KuCoin requires KYC for Exchange Broker sub-accounts before
   those accounts can use deposit-address and money-movement features.
6. Decide a **minimum confirmations / minimum deposit** policy if needed, and
   set maximum per-claim / daily deposit claim limits for the launch market.
7. Complete withdrawal operating policy: KYC/AML threshold, minimum withdrawal,
   review SLA, who sends the manual USDT payout, and how paid transaction hashes
   are retained.
8. **Compliance is mandatory** for real-money crypto: KYC/AML, sanctions
   screening, licensing, and tax. See `docs/COMPLIANCE.md`.
