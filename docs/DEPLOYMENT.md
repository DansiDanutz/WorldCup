# Deployment

The recommended production host is Vercel.

## Domain

Canonical production domain:

```text
https://worldcup26.world
```

The Vercel project has these custom domains attached:

```text
worldcup26.world
www.worldcup26.world
```

Add these DNS records at the domain registrar:

```text
Type  Name  Value
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

If the registrar does not support `@`, use the blank/root host field for the A record. The app redirects `worldcup-ten-eta.vercel.app` and `www.worldcup26.world` to `https://worldcup26.world`. Branch preview `*.vercel.app` URLs stay directly viewable for QA.

### Custom-domain assignment guard

The Vercel project is connected to GitHub, but the production branch can lag
behind the verified local deployment tree while launch work is in progress.
Keep automatic custom-domain assignment disabled so a stale Git production
deployment cannot take over `worldcup26.world` after a manually verified
deployment.

Verify the setting before and after launch deploys:

```bash
npm run vercel:domain-guard
```

If it fails because `autoAssignCustomDomains` is enabled, turn it off:

```bash
npm run vercel:domain-guard:fix
```

After every verified deployment, explicitly bind both domains to the deployment
that passed smoke checks:

```bash
npx vercel alias set <latest-deployment-url> worldcup26.world
npx vercel alias set <latest-deployment-url> www.worldcup26.world
```

## Production Environment Variables

Set these in Vercel Project Settings:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_RESULT_SECRET
CRON_SECRET
OWNER_ADMIN_EMAIL
PAID_ACTION_LAUNCH_TEST_BYPASS
WORLDCUP_ALLOWED_COUNTRIES
WORLDCUP_BLOCKED_COUNTRIES
WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT
WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT
WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT
WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT
RESULT_API_URL
RESULT_API_KEY
```

Required immediately:

- `NEXT_PUBLIC_SITE_URL=https://worldcup26.world`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_RESULT_SECRET`
- `CRON_SECRET`

Optional admin controls:

- `OWNER_ADMIN_EMAIL`
- `PAID_ACTION_LAUNCH_TEST_BYPASS`

`OWNER_ADMIN_EMAIL` rotates the built-in owner admin account. Set it to
`none` or `disabled` to remove the built-in owner from the admin allowlist
entirely; break-glass access through `ADMIN_RESULT_SECRET` still works.
`PAID_ACTION_LAUNCH_TEST_BYPASS` lets allowlisted admins bypass paid-action
launch gates and geo checks only during controlled pre-launch evidence tests.
Leave it empty outside those test windows.

Optional until a real result provider is connected:

- `RESULT_API_URL`
- `RESULT_API_KEY`

Optional jurisdiction controls:

- `WORLDCUP_ALLOWED_COUNTRIES`
- `WORLDCUP_BLOCKED_COUNTRIES`

Use comma-separated ISO-3166 alpha-2 country codes. Leave both empty to allow
all countries. If `WORLDCUP_ALLOWED_COUNTRIES` is set, deposit addresses,
deposit claims, ticket purchases, and entry creation are allowed only from those
countries. `WORLDCUP_BLOCKED_COUNTRIES` always blocks listed countries.
These values can also be set from `/admin` in **Operator policy** after the
database migrations are applied; database policy takes effect without a Vercel
redeploy and falls back to environment values when empty.

Optional responsible deposit limits:

- `WORLDCUP_MAX_DEPOSIT_CLAIM_AMOUNT_USDT`
- `WORLDCUP_MAX_DAILY_DEPOSIT_CLAIM_AMOUNT_USDT`

Optional responsible withdrawal request limits:

- `WORLDCUP_MAX_WITHDRAWAL_REQUEST_AMOUNT_USDT`
- `WORLDCUP_MAX_DAILY_WITHDRAWAL_REQUEST_AMOUNT_USDT`

Use decimal USDT amounts with up to 8 decimals. Leave empty for no configured
cap. Deposit daily caps count submitted, processing, and credited claims.
Withdrawal daily caps count submitted, approved, and paid requests. Rejected
claims or requests do not count.
These guardrails can also be set from `/admin` in **Operator policy**. Use
runtime operator policy for launch changes that should not wait for a Vercel
redeploy.
In production, new paid actions stay paused until the relevant operator policy
items are configured: deposits require a country policy plus a deposit cap,
withdrawal requests require a country policy plus a withdrawal cap, and ticket
purchases / entry locking require a country policy.
Public paid actions also stay paused until all required launch sign-offs are
completed. Allowlisted admins can use the paid-action APIs before public launch
only when `PAID_ACTION_LAUNCH_TEST_BYPASS` is explicitly enabled for controlled
TRC20 deposit, ERC20 deposit, and withdrawal payout evidence tests.

Responsible-play self-exclusion and entry-ticket limits are stored in
`worldcup_responsible_play_settings` and do not require extra environment
variables. Withdrawal review data is stored in
`worldcup_withdrawal_requests`. Apply the latest Supabase migrations before
deploying code that enforces these settings.

`RESULT_API_URL` must implement the contract documented in [CRON.md](./CRON.md). The app will call it as:

```http
GET <RESULT_API_URL>?match_number=<number>
```

Return `404` until the result is official. Return official scores with `winner: "home" | "away" | "draw"` so the app can map the result to the currently assigned teams.

## Security Rules

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe for browser reads because Row Level Security is enabled and private WorldCup tables do not allow public raw reads/writes.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser.
- `ADMIN_RESULT_SECRET` protects the temporary admin APIs and is checked server-side.
- `CRON_SECRET` protects scheduled result ingestion.
- Security headers are configured in `next.config.ts`.

## Supabase Auth

Google login must be enabled in the Supabase **Games** project before users or admins can sign in.

1. In Google Cloud Console, create an OAuth 2.0 Client ID for a web application.
2. Add this authorized redirect URI:

```text
https://your-project-ref.supabase.co/auth/v1/callback
```

If Supabase Custom Domains are active, also add the branded callback URL:

```text
https://api.worldcup26.world/auth/v1/callback
```

3. Enable Google in Supabase with one of these paths:

```bash
SUPABASE_ACCESS_TOKEN="sbp_..." \
GOOGLE_CLIENT_ID="..." \
GOOGLE_CLIENT_SECRET="..." \
NEXT_PUBLIC_SUPABASE_ANON_KEY="..." \
npm run supabase:enable-google-auth
```

Or open Supabase Dashboard, go to **Authentication > Providers > Google**, enable Google, paste the Google Client ID and Client Secret, and save the provider settings.

4. Confirm these allowlisted admin emails can sign in at `/admin`:

```text
semebitcoin@gmail.com
seme@kryptostack.com
```

If Google is not enabled, Supabase returns:

```json
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

## Vercel Cron

`vercel.json` schedules:

```json
{
  "crons": [
    {
      "path": "/api/cron/results",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/apply",
      "schedule": "15 * * * *"
    }
  ]
}
```

This checks due matches every hour and then runs a follow-up point-application safety net.

Vercel calls cron endpoints with:

```http
Authorization: Bearer <CRON_SECRET>
```

The app validates that header before doing any work.

## Health Check

After deployment, verify:

```http
GET /api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "worldcup",
  "database": "available"
}
```

## Admin Readiness Check

After deployment, open `/admin` with an allowlisted Google account or the
break-glass secret and run **Production readiness**. The check is also available
through:

```http
GET /api/admin/readiness
```

It verifies launch-critical environment variables, Supabase Google auth, core
database tables, USDT receive configuration, KuCoin read-only verification
configuration, runtime operator policy, geo policy, and deposit/withdrawal
limit guardrails. `fail` items are launch blockers; `warning` items require
operator review. Missing country policy or USDT amount guardrails keep the
corresponding paid actions paused until the operator policy is configured.
Warnings and failures include a **Next** action in `/admin` so operators can see
whether to update Vercel environment variables, Operator policy, or Launch
sign-off evidence.

The **Launch sign-offs** panel also has an **Evidence Snapshot** action. It
calls the admin-only `/api/admin/launch-evidence` endpoint and bundles the
current readiness summary, operator policy, Terms/Privacy version, and each
launch sign-off evidence state into one audit-friendly report.

## Production Smoke Test

Run the full production preflight before launch sign-off or after any Vercel
production deployment:

```bash
npm run preflight:prod
```

This loads `.env.local` when present, verifies the Vercel custom-domain guard,
runs the regular smoke checks, runs the full launch smoke, then prints the live
Production readiness summary. It fails on hard launch blockers and leaves
warnings visible for real-world operator, payment, and legal sign-offs.

Run the strict final launch gate only when the operator, payment, and legal
evidence has been completed:

```bash
npm run preflight:prod:launch
```

This runs the same checks as `preflight:prod`, then fails unless Production
readiness is fully green with zero warnings.

Run the non-destructive production smoke checks after each deploy:

```bash
npm run smoke:prod
```

This verifies the homepage, `/admin`, `/api/health`, admin authorization rejection, and baseline
security headers. To also probe the distributed rate limiter with a short anonymous burst:

```bash
npm run smoke:prod -- --rate-limit
```

Run the full launch smoke before operator sign-off. It keeps the normal smoke
checks and also exercises authenticated user flow, both shared-network deposit
credit paths, withdrawal request/admin review, referral/ticket/entry flow, and
KuCoin read-only verification:

```bash
set -a; source .env.local; set +a
npm run smoke:prod:launch
```

To deliberately exercise the live deposit-claim credit path with temporary data
that is cleaned up automatically:

```bash
set -a; source .env.local; set +a
npm run smoke:prod -- --deposit-credit-probe
```

This creates a temporary auth user and submitted TRC-20 plus ERC-20 claims,
proves the live admin API rejects crediting without an audit note, credits each
network through `/api/admin/deposit-claims` with verified amount overrides and
audit notes, verifies the matching deposit rows, wallet ledger amounts, raw
audit fields, and duplicate-credit conflict handling, then deletes the temporary
user, claims, deposits, and wallet transactions.

To deliberately exercise the authenticated user journey with temporary data
that is cleaned up automatically:

```bash
set -a; source .env.local; set +a
npm run smoke:prod -- --auth-flow-probe
```

This creates temporary Google-provider Supabase users, verifies a normal
signed-in player is rejected from `/api/admin/me`, verifies referral code
creation and resolution, loads both TRC-20 and ERC-20 wallet deposit addresses,
submits user deposit claims for both networks, submits a withdrawal request,
proves admin approval records a wallet debit, marks the request paid with a
network-valid fake transaction hash, records consent, assigns a ticket through
the admin API, locks a three-team entry with a referral code, verifies referral
activity, and deletes the temporary users and rows.

To verify the live KuCoin receive-only API can read USDT account and deposit
history without moving funds:

```bash
set -a; source .env.local; set +a
npm run smoke:prod -- --kucoin-live-probe
```

This uses `KUCOIN_MAIN_API_BASE` (default `https://api.kucoin.com`),
`KUCOIN_MAIN_API_KEY`, `KUCOIN_MAIN_API_SECRET`, and
`KUCOIN_MAIN_API_PASSPHRASE`. The same read-only main-account credentials power
the admin console's KuCoin claim verification. If the optional broker
credentials are complete, the smoke probe also checks the broker deposit-list
endpoint; otherwise broker checks are skipped because production currently uses
shared main-account receive addresses.

## Manual Deployment Checklist

1. Connect GitHub repository `DansiDanutz/WorldCup` to Vercel.
2. Add the required environment variables.
3. Deploy `main`.
4. Open `/api/health`.
5. Open `/` and confirm teams, matches, and leaderboard load.
6. Confirm the Vercel Cron job appears in the production deployment.
7. Run one protected cron test:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<deployment-url>/api/cron/results
```

8. Run one protected admin test only on a known safe test match or staging project.

## Plan Notes

Hourly cron requires a Vercel plan that supports hourly cron frequency. If the deployed project is on a plan that only supports daily cron, either upgrade the plan or use an external scheduler that can call `/api/cron/results` with the `CRON_SECRET` header.
