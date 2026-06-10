# CLAUDE.md

Guidance for AI assistants working in this repository. Read this before making changes.

## What this project is

**WorldCup26** is a **real-money, USDT-backed prediction game** for the FIFA World Cup 2026.
Each player picks exactly **3 teams** before (or shortly after) kickoff; those teams accrue
points after every match, and a player's leaderboard score is the sum of their teams' points.
Paid entries require a ticket; there is an internal wallet, USDT deposits/withdrawals, a
referral program, and an agent/reseller program.

Because money, user eligibility, and database privileges are involved, **security and money
integrity are the highest-priority concerns in every change** (see `.greptile/rules.md` and
`.greptile/config.json` — those rules are enforced in review and you should self-enforce them).

## Tech stack

- **Next.js 16** (App Router, React Server Components) + **React 19** + **TypeScript 5.9** (strict).
- **Supabase** (Postgres + Auth + RLS) — the system of record. Google-only OAuth sign-in.
- **Vercel** hosting (cron jobs defined in `vercel.json`).
- **Node 22** required (`.nvmrc`, `package.json` engines) — the test runner relies on Node 22's
  native TypeScript stripping (`--experimental-strip-types`) and `module.register` loader.
- No CSS framework / no external runtime scripts — styling is hand-written CSS
  (`src/app/globals.css`, `src/app/cards.css`) and the CSP forbids external scripts.

## Commands

```bash
npm install                 # install deps (Node 22)
npm run dev                 # next dev (local)
npm run build               # next build (production)
npm run lint                # eslint .
npm run typecheck           # tsc --noEmit
npm test                    # Node native test runner over tests/*.test.ts
```

**Run the full pre-ship verification** (this mirrors CI in `.github/workflows/ci.yml`, which
runs typecheck → lint → test → build on every PR):

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Run a single test file (the `--import` registers the `@/` path alias):

```bash
node --experimental-strip-types --import ./tests/register.mjs --test tests/scoring.test.ts
```

Other scripts:

```bash
npm run generate:migrations   # regenerate the two generated worldcup SQL migrations
npm run preflight:prod        # production readiness check
npm run smoke:prod            # production smoke test
npm run vercel:domain-guard   # verify Vercel custom-domain auto-assign is OFF
npm run vercel:promote        # promote the verified prod build to the live domains
npm run x:engage              # X/Twitter engagement CLI (scripts/x-engage.mjs)
```

## Repository layout

```
src/
  app/                  Next.js App Router
    page.tsx            "/" main dashboard (RSC, force-dynamic)
    layout.tsx          root layout, metadata, security
    admin/              "/admin" console (separate route + bundle)
    login/ register/ signup/ play/ wallet/ schema/ ...  public pages
    api/                Route handlers (see below)
  components/           React components (dashboard, admin-console, cards/, wallet, etc.)
  lib/                  Server + shared logic (the heart of the app — see below)
  proxy.ts             canonical-host redirect (Next middleware-style)
tests/                  Node test runner *.test.ts files + register/alias hooks
supabase/migrations/    Timestamped SQL migrations (the schema source of truth)
scripts/                Migration generators, prod preflight/smoke, vercel ops, x-engage
docs/                   ARCHITECTURE, SCORING, DATABASE, CRON, DEPLOYMENT, PAYMENTS,
                        COMPLIANCE, plus dated AUDIT_*.md security/money audits
content/                Per-team marketing/content assets (one dir per nation)
marketing/              Vendored ad artifacts + campaign scripts (ESLint-ignored, not the app)
.greptile/              Code-review rules/config — treat as binding conventions
.github/workflows/ci.yml  CI pipeline
```

### API routes (`src/app/api/`)

- `entries/` — create/save-draft/commit/lock an entry (consumes a ticket on `lock`).
- `me/standing/`, `tickets/`, `deposits/`, `withdrawals/`, `referrals/`, `agent/`,
  `agent-ticket-requests/`, `age-verification/`, `consent/`, `responsible-play/`,
  `analytics/view/` — player-facing flows.
- `admin/*` — admin-only management (results, accounts, tickets, wallet-transfer,
  prize-pool, settle-payouts, advance-bracket, readiness, launch-signoffs, metrics, …).
- `cron/results` & `cron/apply` — cron endpoints (auth via `CRON_SECRET`), scheduled in
  `vercel.json` (hourly at :00 and :30).
- `health/` — health probe.

### Key `src/lib/` modules

- `supabase.ts` — the four client factories. **`createServiceSupabaseClient()` (service role)
  is server-only.** Browser code uses `createBrowserSupabaseClient()` / public clients.
- `http.ts` — `jsonError`, `enforceRateLimit` (DB-backed, fail-soft), `enforceGeoEligibility`,
  `getBearerToken`. Use these in route handlers.
- `admin-auth.ts` — `requireAdmin`: email allowlist (`ADMIN_EMAILS` / `OWNER_ADMIN_EMAIL`) or
  break-glass `x-admin-secret` (constant-time compare).
- `validation.ts` — `requireObject/requireString/requireStringArray`, `ValidationError`.
- `paid-action-gates.ts`, `operator-policy.ts`, `geo-eligibility.ts`, `responsible-play.ts`,
  `age-verification.ts`, `consent.ts` — the launch / geo / responsible-play / age / consent gates.
- `scoring.ts`, `bracket.ts`, `bracket-advance.ts`, `schema-draw.ts` — game logic.
- `kucoin.ts`, `deposits.ts`, `withdrawals.ts`, `economy.ts`, `prize-pool.ts` — money flows.
- `worldcup-data.ts` — dashboard data loader. `types.ts` — shared types.

## Architecture & data model (essentials)

- All game tables are prefixed **`worldcup_*`** and live in the shared Supabase "Games" project;
  they are deliberately separate from the project's generic `games`/`tournaments` tables.
- **Reference data** (`worldcup_tournaments`, `worldcup_stages`, `worldcup_teams`,
  `worldcup_matches`) is publicly readable.
- **Player data** (entries, picks, tickets, wallet, deposits, withdrawals, referrals, agents,
  payouts) is owner-scoped via RLS and **not** readable/writable with the browser anon key.
- All writes to game/money data go through the **service role inside `SECURITY DEFINER` RPCs**,
  invoked from server route handlers. Public leaderboard/points **views** run with the view
  owner's privileges so they work without exposing base rows.
- See `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/CRON.md`, and `docs/SCORING.md` for the
  full model, the cron/result-provider contract, and the scoring formula.

### Scoring formula (summary)

```
final_points = (result_base + goal_bonus + clean_sheet_bonus) * team_coefficient * stage_coefficient
user_total   = sum of the 3 selected teams' awarded points
```

Team coefficients (1.00 favorites → 3.00 underdogs) and stage coefficients are **fixed for the
whole tournament** so the game stays fair after kickoff. The award ledger is keyed
`unique(entry_id, match_id, team_id)` so cron can retry safely. Full rules in `docs/SCORING.md`.

## Database / migration workflow

- Migrations live in `supabase/migrations/` named `YYYYMMDDHHMMSS_worldcup_<description>.sql`.
  They are the **source of truth for the schema** — keep them and route code in lock-step
  (route code must not assume a guarantee the migration doesn't enforce).
- The two baseline worldcup migrations are **generated**: edit the generators in `scripts/`
  (`generate-worldcup-sql.mjs`, `generate-worldcup-kickoff-sql.mjs`) and run
  `npm run generate:migrations` — don't hand-edit the generated SQL.
- `tests/migration-history.test.ts` enforces migration ordering/hygiene.

### Mandatory SQL rules (enforced in review)

- **Every new table** holding user/wallet/ticket/deposit/withdrawal/referral/agent/admin data
  must enable RLS with explicit owner/admin/server policies **before** app code depends on it.
- **Privileged RPCs** must be `SECURITY DEFINER`, pin `search_path`, `REVOKE` execute from
  public/anon/authenticated, and `GRANT` only to `service_role` (unless deliberately public-safe).
  Avoid dynamic SQL unless strictly necessary and safely parameterized.
- **Wallet & ticket mutations must be atomic / append-only** via RPC — never read-then-write a
  balance in TypeScript. Debits use the canonical wallet lock and non-negative backstop.
- Ticket transfers/claims/purchases, agent accepts, and entry creation must be **double-spend
  safe** at the database level.

## Coding conventions

- **TypeScript strict**; path alias **`@/*` → `src/*`** (used at runtime too — the test alias
  hook in `tests/alias-hooks.mjs` resolves it for the bare Node test runner).
- **Import ordering** (matches existing files): external packages first, blank line, then `@/`
  imports — both groups alphabetized. ESLint (`eslint-config-next` core-web-vitals) is the gate.
- Route handlers: validate input (`@/lib/validation`), authenticate the bearer token, apply
  rate limiting + the relevant gates **before** any mutation, and **never return raw
  Supabase/Postgres/stack/secret error text to clients** — map to stable user-safe messages
  (see `src/app/api/entries/route.ts` and its `*_ERROR_MESSAGES` map for the pattern).
- Admin routes must call `requireAdmin`, **fail closed**, and require admin notes for money-risk
  state transitions; never trust client-supplied admin identity.
- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, admin/cron secrets, KuCoin keys) must never
  be imported into, or exposed through, client components.
- **Tests are required** for any change to auth, admin, wallet, deposits, withdrawals, tickets,
  agents, referrals, launch gates, or RLS. Use the existing `tests/*.test.ts` Node pattern
  (executable route/helper tests for behavior; migration-text tests for SQL privilege/RLS
  contracts). Comment density and naming should match surrounding code.
- Mobile UX matters: avoid horizontal overflow, clipped labels, nested cards, and overlays that
  steal scroll/touch from the center of the screen (see `.greptile/rules.md`).

## Environment variables

Copy `cp .env.example .env.local` and fill in. The required runtime values are
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`ADMIN_EMAILS`/`OWNER_ADMIN_EMAIL`, `ADMIN_RESULT_SECRET`, and `CRON_SECRET`. Optional groups
(documented inline in `.env.example`): geo controls (`WORLDCUP_ALLOWED/BLOCKED_COUNTRIES`),
deposit/withdrawal guardrails, KuCoin deposit keys, result provider (`RESULT_API_URL/_KEY`), and
X/Twitter engagement keys. Never commit real secrets — `.env*` is gitignored except the example.

## Deployment

Production host is Vercel; canonical domain `https://worldcup26.world`. Custom-domain
auto-assignment is intentionally **disabled** — merging to `main` builds a *staged* prod
deployment but does **not** move the live domains. Going live is a deliberate step:
`npm run vercel:promote -- --confirm`. See `docs/DEPLOYMENT.md` for the full flow and
`npm run vercel:domain-guard` for the guardrail.

## Git workflow for this environment

- This is an isolated, ephemeral remote-execution container — commit and push anything worth
  keeping. Develop on the assigned feature branch (do not push to `main` without explicit
  permission); push with `git push -u origin <branch>` and open a **draft PR** afterward.
- Commit messages are short, imperative, and descriptive (see `git log`); PRs are squash-merged
  with a `(#NN)` suffix. Do not include model identifiers or assistant attribution beyond the
  standard footer in commits/PRs/code.
- GitHub interactions go through the `mcp__github__*` tools (no `gh` CLI). Repo scope is
  `dansidanutz/worldcup`.
