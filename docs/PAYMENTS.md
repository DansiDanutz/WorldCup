# USDT Deposits (KuCoin Broker)

Players fund an **internal wallet** with USDT, then buy entry tickets from that
balance. The wallet ledger (`worldcup_wallet_transactions`) stays the single
source of truth for balances; deposits and ticket purchases are new ledger
entry types.

## Flow

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
attributable.

## Components

- **Migration** `20260602014000_worldcup_usdt_deposits.sql`
  - `worldcup_deposit_addresses` (per-user, per-network address)
  - `worldcup_deposits` (confirmed deposits, unique on `(provider, external_id)`)
  - `worldcup_credit_deposit(...)` — idempotent wallet credit
  - `worldcup_purchase_ticket(...)` — atomic, balance-checked ticket purchase
  - extends the wallet `transaction_type` check with `deposit` / `withdrawal` / `ticket_purchase`
- **`src/lib/kucoin.ts`** — KuCoin Broker (ND) adapter. The v2 request signing
  is unit-tested. The broker **endpoint paths are isolated constants and must be
  verified against the current KuCoin Broker API docs with live credentials**
  before production.
- **`src/lib/deposits.ts`** — pure network/amount helpers (unit-tested).
- **Routes**
  - `GET /api/deposits/address` — returns/provisions the user's TRC-20 + ERC-20 addresses
  - `POST /api/tickets/purchase` — buys a ticket from the wallet balance
  - `GET|POST /api/deposits/reconcile` — cron; credits confirmed deposits
- **`/wallet`** page — balance, deposit addresses (copy), buy ticket.
- **Cron** — `/api/deposits/reconcile` every 10 minutes (`vercel.json`).

## Environment

Set on the server only (never commit real values):

```text
KUCOIN_API_BASE=https://api.kucoin.com
KUCOIN_API_KEY=
KUCOIN_API_SECRET=
KUCOIN_API_PASSPHRASE=
KUCOIN_BROKER_NAME=
KUCOIN_BROKER_KEY=
```

If these are unset, deposit provisioning reports `configured: false` and the
wallet/ticket flow degrades gracefully (no crashes).

## Before going live — checklist

1. **Verify the KuCoin Broker endpoint paths** in `src/lib/kucoin.ts`
   (`createSubAccount`, `subAccountDepositAddress`, `brokerDepositList`) and the
   deposit list field names against your account's API docs; adjust constants.
2. Set the `KUCOIN_*` env vars and run an end-to-end test deposit on TRC-20 and
   ERC-20 with a small amount.
3. Decide a **minimum confirmations / minimum deposit** policy if needed.
4. **Withdrawals** are not implemented yet (prizes settle into the wallet); add a
   reviewed withdrawal flow before paying out.
5. **Compliance is mandatory** for real-money crypto: KYC/AML, sanctions
   screening, licensing, and tax. See `docs/COMPLIANCE.md`.
