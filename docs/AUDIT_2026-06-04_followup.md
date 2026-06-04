# Follow-up Audit — WorldCup26.world (money-engine expansion)

**Date:** 2026-06-04 (follow-up; same day as [`AUDIT_2026-06-04.md`](./AUDIT_2026-06-04.md))
**Target:** `worldcup` repository powering **https://worldcup26.world** (Next.js 16 · React 19 · Supabase/Postgres real-money fantasy game)
**Scope:** The 11 commits landed **after** the previous audit (`de0617d`) — a new **fee pool**, **multi-level referral-tree settlement**, an **admin ticket-inventory ledger**, a **split-wallet / agent direct ticket-transfer flow**, an **owner-agent bootstrap**, the migration-replay fix, the Greptile review config, and the `marketing/worldcup26-ad` render pipeline. 5 new SQL migrations (~1.5k lines of plpgsql), 1 new API route, changes to 6 API routes / 5 components / 3 libs.
**Type:** Independent security, money-integrity, correctness, and quality audit of the new surface, plus re-verification of the prior report's open findings.
**Method:** Full source read of the new money migrations and routes; three parallel breadth passes (gate coverage, money conservation/RPC-lockdown, test-depth/frontend); objective `typecheck`/`lint`/`test`/`build`/`npm audit` on a fresh `npm install`; every High/Medium re-verified by hand at `file:line`.

> This follow-up **supersedes [`AUDIT_2026-06-04.md`](./AUDIT_2026-06-04.md) for the money engine** and carries forward its still-open items. Headline: the new money math (80/20 split, referral tree) is **well-engineered and conserves money**, and the **RPC lockdown holds for all 14 new SECURITY DEFINER functions**. But three things moved the wrong way or stayed open: the **paid-action gate gap widened** (a new ungated ticket path — H-1), a **net/gross contradiction was introduced** around `prize_pool_amount` (NEW H-2), and the **real-money math has zero executing test coverage** (it is asserted only by grepping the SQL text — M-4). Compliance (KYC/AML/legal) remains the dominant launch blocker, unchanged.

---

## 1. Verification results (objective)

Node 22.22, fresh `npm install`, current `claude/exciting-meitner-FVHpV`:

| Check | Command | Result |
|---|---|---|
| Type safety | `npm run typecheck` | ✅ clean |
| Lint | `npm run lint` | ✅ clean |
| Unit tests | `npm test` | ✅ **340 passed**, 0 failed (76 suites) |
| Dependency audit | `npm audit` | ✅ **0 vulnerabilities** |
| Production build | `npm run build` | ✅ compiled, 44 static pages |

Test count grew **294 → 340**, suites **67 → 76**. No committed secrets; service-role client still imported only in server libs; no `dangerouslySetInnerHTML`/`eval`/`innerHTML` anywhere in `src` or the new `marketing/` JS.

---

## 2. What changed since the 2026-06-04 audit

| Prior ID | Finding | Current state |
|---|---|---|
| **M-1** | Migrations don't replay cleanly (dup timestamp + grant-after-drop) | 🟠 **Partially closed.** Duplicate `20260602014000` renamed to `…014100`; the finalize-entry grant removed from the hardening migration; a **static** guard test added (`tests/migration-history.test.ts`). **But CI still runs no real `supabase db reset`,** and a **new** ordering fragility was introduced (see M-2 below). |
| **L-2** | `ensureOwnerAgent` used the hardcoded `OWNER_ADMIN_EMAIL` constant, not the env-effective owner | 🟢 **Closed.** `src/lib/referrals.ts` now reads `getOwnerAdminEmail()` and null-guards (`OWNER_ADMIN_EMAIL=none` now disables it). New wrinkle in **M-2/L-1** below. |
| **H-3** | Age gate self-attested only | 🟠 **Improved (withdrawals only).** `20260604180000_worldcup_age_verification.sql` adds an admin-reviewed 18+ document state gating **withdrawals**. Entry/play is still self-attested, and the review is **manual/off-platform**, not an automated KYC vendor — so **C-1 is unchanged**. |
| **H-1** | Paid-action gating is per-route opt-in; ticket paths ship gate-less | 🔴 **Open and widened** — a new ungated path (`agent/tickets/transfer`) was added; the recommended central wrapper was not adopted. See H-1 below. |
| **C-1 / C-2** | No KYC/AML/sanctions; no legal classification/licensing | 🔴 **Unchanged** — still intentionally deferred. |
| **H-2 (USDT), M-2 (SW), M-3 (FKs), M-5 (error leak), M-7 (route tests), M-8 (CI), L-1 (reconcile timing)** | — | 🟠 **Carried, still open** (see §6). |

---

## 3. Findings by severity (this cycle)

| Sev | Count | IDs |
|---|---|---|
| 🔴 Critical (compliance/launch-blocking) | 2 | C-1, C-2 (carried, unchanged) |
| 🟠 High | 2 | **H-1** (widened), **H-2** (new) |
| 🟡 Medium | 5 | **M-1**…**M-5** |
| 🔵 Low | 6 | **L-1**…**L-6** |

---

## 4. High-severity findings

### 🟠 H-1 — Paid-action gate gap **widened**: a new ticket-acquisition path ships with no geo / launch-gate / responsible-play / consent
There is still **no API middleware** (`src/proxy.ts:21-23` matcher explicitly excludes `/api`), so every paid route re-implements the gate chain by hand. The previous audit flagged 2 gate-less ticket paths; the new agent flow added a **third**, and the request-create path is a fourth:

| Route (user-facing, mints/transfers a ticket) | auth | geo | launch-gate | responsible-play | consent |
|---|---|---|---|---|---|
| `tickets/purchase` (reference — correct) | ✅ | ✅ | ✅ | ✅ | ✗ |
| `entries` (lock — correct, full stack) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `tickets/claim/route.ts` | ✅ | ❌ | ❌ | ❌ | ❌ |
| **`agent/tickets/transfer/route.ts` (NEW)** | ✅ (L37) | ❌ | ❌ | ❌ | ❌ |
| `agent-ticket-requests/[requestId]/accept` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `agent-ticket-requests` (POST create) | ✅ | ❌ | ❌ | ❌ | ❌ |

The new `src/app/api/agent/tickets/transfer/route.ts` runs only `enforceRateLimit` (L17) + Google auth (L37) before calling `worldcup_agent_transfer_ticket`, which mints a price-0 playable ticket to **any** recipient by email. A **self-excluded** or **geo-blocked** recipient — or any recipient **before public-launch sign-offs complete** — can receive and hold a live ticket.

**Mitigation (verified, unchanged):** locking an entry (`src/app/api/entries/route.ts`) enforces the full stack — auth (L74), geo (L80), launch-gate (L86), consent (L105), responsible-play (L130). So a self-excluded user still cannot ultimately **lock** an entry. The residual harm is **acquiring/holding a playable ticket while excluded** and **pre-launch issuance**, now across four paths.

**Remediation:** add `enforceGeoEligibility` + `getUserPaidActionGate(…,"ticket")` + `getResponsiblePlayRestriction` (against the **recipient**) to all four routes, and introduce a shared `withPaidActionGates(...)` wrapper (or an `/api` middleware allowlist) so a new paid route **cannot** ship gate-less. This was the prior audit's recommendation; the new path shipping gate-less is direct evidence it is needed.

### 🟠 H-2 — `prize_pool_amount` has two contradictory meanings (net vs. gross); the live admin "set prize pool" path overpays by the 20% fee *(new)*
The new model takes the fee at contribution time: ticket revenue splits **80% → `prize_pool_amount`, 20% → `fee_pool_amount`** in two triggers (`…224000:84-119, 136-200`). Consistent with that, the **live** settlement treats the pool as **already net** and deliberately does **not** subtract a fee again:

```
-- 20260604224000_worldcup_fee_pool_referral_tree.sql:355-357
-- The tournament prize pool is already net of the fee split. Do not subtract
-- prize_pool_fee_percent again here.
v_net_cents := round(v_gross * 100);
```

But the **manual admin override is still wired and still treats the column as gross**:
- `src/app/api/admin/prize-pool/route.ts:36-38` **sets** `prize_pool_amount := grossAmount` (an absolute operator value) and `prize_pool_fee_percent := 20`.
- The admin console input is literally labelled **"Prize pool (gross collected)"** (`src/components/admin-console.tsx:2256`, POSTing at L410-413).
- `docs/DATABASE.md:52,56` documents `prize_pool_amount` as *"gross amount set by the operator"* and *"the visible prize pool is calculated as gross amount minus the fee."*

So if an operator uses the prize-pool field as the UI/docs instruct (enter the **gross collected**), settlement pays out the **entire** figure with **no 20% withheld** — a systematic **~20% overpayment** of real USDT. Separately, this absolute `set` **clobbers** whatever the 80/20 triggers accumulated (or a later trigger increment adds on top of the operator value): the auto-accumulator and the manual setter write the **same column with incompatible semantics**.

`prize_pool_fee_percent` is now **vestigial**: the live settle never reads it (only the shadowed pre-existing `…011000` settle did), and the UI's `calculateNetPrizePool` was neutered to a pass-through (`src/lib/prize-pool.ts:13-24`, `return gross`), so the displayed pool does **not** double-discount — but the column is still written (`=20`) and selected by `me/standing` and `dashboard`, where it now means nothing.

**Remediation:** pick one meaning. Either (a) retire the manual prize-pool endpoint/field now that the pool auto-accumulates net, or (b) make it an explicit **net** adjustment (relabel, drop the `*0.80` mental model, stop writing `prize_pool_fee_percent`). Update `docs/DATABASE.md`. Drop or repurpose the `prize_pool_fee_percent` column to remove the contradiction.

---

## 5. Medium-severity findings

### 🟡 M-1 — Owner-agent bootstrap seeds **phantom prize-pool money** and runs on every owner sign-in *(new)*
`src/lib/referrals.ts` `ensureOwnerAgent` now calls `worldcup_bootstrap_owner_agent_inventory(1000)` on **every** authenticated owner request. The bootstrap routes a **1000-ticket `admin_to_agent` "cash" movement** through `worldcup_admin_assign_agent_tickets` (`…220000`), whose `admin_to_agent` movement fires the 80/20 trigger (`…224000:136-156`) and credits **80% × ticket_price × 999** to `prize_pool_amount`. Unlike a real agent sale, **no cash is actually collected** for the owner's seed inventory — so if the **first** owner sign-in occurs while `ticket_price_amount > 0`, the prize pool is seeded with thousands of USDT of liability no participant funded. (If the first bootstrap runs while price = 0, the contribution is 0; subsequent sign-ins are no-ops because the inventory already exists, so the money side is at least idempotent.) The reconciliation work (count/assign/release with two advisory locks) nonetheless re-runs on every owner page load.

This is the same "agent pays upfront, bears resale risk" model the design already uses — but for the **owner bootstrap** the upfront payment is fictional, so the pool can lead collected cash.

**Remediation:** seed the owner's sellable codes via the **internal** (`admin_request`, no split) path, not a priced `admin_to_agent` movement; or exclude the owner bootstrap from the prize-pool trigger; and gate the runtime bootstrap so it runs once (e.g., only when the owner has no agent row) rather than on every request.

### 🟡 M-2 — Migration replay still unverified in CI; new cross-migration ordering fragility *(extends prior M-1)*
The static `migration-history.test.ts` catches the *specific* prior defects (duplicate version, finalize-entry grant-after-drop) but does **not** run an actual replay. A new ordering hazard now exists: `20260604203000_worldcup_owner_agent_inventory_bootstrap.sql:304` executes `select worldcup_bootstrap_owner_agent_inventory(...)`, but the objects it ultimately needs — the `worldcup_ticket_financial_movements` table and the new `worldcup_admin_assign_agent_tickets` / split triggers — are first created in `…220000`/`…223000`, which sort **after** `…203000`. On a fresh replay this survives **only** because an empty DB has no `semebitcoin@gmail.com` referral profile, so the bootstrap returns `PROFILE_NOT_FOUND` and is a **silent no-op** — meaning a disaster-recovery rebuild would **not** actually bootstrap the owner, and any seeded owner profile would make `…203000` error. **Remediation:** add a real `supabase db reset` smoke step to CI; move the bootstrap invocation to a migration that sorts after all objects it depends on (or out of migrations entirely into a one-shot script).

### 🟡 M-3 — Referral inviter lookup relies on per-entry uniqueness the schema doesn't enforce *(new)*
In `worldcup_settle_payouts`, the direct-inviter lookup keys on `entry_id`:
```
-- 20260604224000:408-411
select inviter_user_id, referral_fee_percent into v_direct_inviter, v_direct_fee_percent
from public.worldcup_referrals
where tournament_id = p_tournament_id and entry_id = r.entry_id;
```
But `worldcup_referrals` is `unique (tournament_id, invited_user_id)` (`20260602001000:37`) — `entry_id` is a **nullable, non-unique** column (`:30`). A non-`STRICT` `SELECT … INTO` with no `ORDER BY/LIMIT` silently takes an **arbitrary** row if two referral rows ever share an `entry_id`, making the chosen inviter and `referral_fee_percent` **non-deterministic**. Not a conservation break (the tree still can't pay more than the place prize), but a fairness/correctness risk on real-money payouts. **Remediation:** add `order by accepted_at asc limit 1`, or back the lookup with a uniqueness guarantee.

### 🟡 M-4 — The real-money math (80/20 split + referral tree) has **zero executing test coverage** *(extends prior M-7)*
No test runs real Postgres (no `pg`/`pglite`/testcontainers anywhere). The 80/20 split and the entire multi-level referral cascade live only in plpgsql and are asserted **only by grepping the `.sql` text** — e.g. `tests/agent-activation-prize-pool.test.ts` matches the literal string `* 0.80`, and `tests/referral-payouts.test.ts` matches `floor(... * 5 / 100)`, `:= 1000`, `v_level <= 20`. A behavioral regression that keeps the literal but breaks the result (off-by-one in `v_prize_cents`, a wrong loop interaction, a broken seen-user dedup) is **invisible**. The only executing money arithmetic is the JS weighted top-10 curve (`src/lib/prize-pool.ts` via `prize-pool.test.ts`), and that JS copy does **not** subtract referral cents — so the two implementations can silently diverge. Only **3** route handlers are executed by tests (`admin/wallet-transfer`, `tickets/claim`, `age-verification`); the new money routes (`admin/settle-payouts`, `admin/agents`, `admin/tickets`, `agent/tickets/transfer`, `agent/me`) are grep-only. **Remediation:** add an executing harness (pglite/pg-mem or a disposable Postgres) that runs `worldcup_settle_payouts` and the split triggers against fixtures and asserts the actual cent allocations and referral payouts.

### 🟡 M-5 — Carried-forward open mediums (unchanged)
- **Service worker caches authenticated `/api` responses** (prior M-2): `public/sw.js:39-49` still caches **every** same-origin non-document `GET` whose `response.ok`, with no `/api` or `Authorization` exclusion, and serves `caches.match(request)` (URL-keyed, ignores the bearer) on failure — shared-device cross-user JSON exposure.
- **Raw Postgres `error.message` to clients** (prior M-5): `admin/prize-pool/route.ts:46`, `admin/tickets/route.ts:80`, `admin/agents/route.ts:233`, `referrals/me/route.ts:77`.
- **Broken referential integrity** (prior M-3): the new money tables continue the pattern — `worldcup_ticket_financial_movements` (`source_admin_user_id`, `target_user_id`, `target_agent_user_id`), and `worldcup_payouts.source_user_id` (`…224000:57`) are free-floating UUIDs with no FK.

---

## 6. Low-severity findings

| ID | Finding | Location |
|---|---|---|
| **L-1** | The runtime owner bootstrap call in `ensureOwnerAgent` is fire-and-forget — its `rpc(...)` result is never error-checked, so a failed bootstrap is silently swallowed (and it runs on every owner request). | `src/lib/referrals.ts` (`ensureOwnerAgent`) |
| **L-2** | Owner's **personal email hardcoded in committed SQL** that auto-grants 1000 tickets + agent status and runs on replay (`select worldcup_bootstrap_owner_agent_inventory('semebitcoin@gmail.com', …)`). Can't be reconfigured per-environment; a staging clone re-bootstraps the same identity. | `…203000:23,304`, `…101000:20` |
| **L-3** | `tests/money-rpc-permissions.test.ts` still asserts only the **original 5** RPC signatures; **none of the 14 new** money functions' `revoke/grant` lines are covered (they *are* correctly locked down — verified by hand — but a future omission wouldn't be caught). | `tests/money-rpc-permissions.test.ts:20-26` |
| **L-4** | Latent dedupe asymmetry: the BEFORE-INSERT split trigger UPDATEs `prize_pool_amount` **unconditionally**, while the contribution **ledger** insert is `on conflict do nothing` (deduped). No current path re-fires the trigger, but a future `INSERT … ON CONFLICT` on movements would double the pool while the ledger stays correct. | `…224000:152-200` vs `:27-29,47-49` |
| **L-5** | `admin/tickets` caps `quantity` at **100** (`route.ts:92`) while the RPC and `admin/agents` allow **1000** — inconsistent operator limits with no documented reason. | `src/app/api/admin/tickets/route.ts:92` |
| **L-6** | `deposits/reconcile` still authenticates the cron secret with a non-constant-time `!==` (prior L-1). Dead code also lingers: `…223000` redefines the two trigger functions later superseded by `…224000`, and `…011000` `worldcup_settle_payouts` is shadowed by `…224000`. | `src/app/api/deposits/reconcile/route.ts:12`; `…223000`, `…011000` |

---

## 7. What is done well (credit)

- **RPC lockdown holds for the entire new surface.** All 14 new SECURITY DEFINER functions (`worldcup_settle_payouts`, `worldcup_record_settlement_payout`, the four `admin_*`/`agent_assign_codes` inventory fns, the three agent-transfer fns, `ensure_active_agent_for_user`, `bootstrap_owner_agent_inventory`, and the two trigger fns) carry an explicit `revoke execute … from public, anon, authenticated` and grant only to `service_role` (trigger fns correctly revoke-only). Verified across all five migrations.
- **The referral-tree settlement conserves money.** Per place, prize + the entire up-tree referral cascade ≤ `v_place_cents`, and `Σ v_place_cents = v_net_cents` exactly (last place takes the remainder). The 10-USDT minimum is applied **before** the cut is subtracted from the player's prize, so money is never subtracted-then-dropped; the cycle guard (`v_seen_user_ids`) + `v_level <= 20` + geometric 5% decay guarantee termination; rounding is `floor`/`round`-with-remainder and dust-bounded.
- **Settlement is idempotent.** `worldcup_record_settlement_payout` inserts `on conflict (tournament_id, payout_type, entry_id, user_id) do nothing` and only writes the wallet credit when a brand-new payout row is created — re-running settle never double-pays.
- **No double-counting across the two split triggers.** Wallet purchases (`assigned_by='wallet'`, no movement row) and admin assignments (`admin_to_*` movement, ticket `assigned_by` ≠ `'wallet'`) are disjoint; agent-resale redemptions are price-0 and correctly counted once — at the admin→agent sale.
- **Frontend / client boundary stays clean.** No service-role/secret in any client bundle; `breakGlassSecret` is user-typed into an `x-admin-secret` header (not baked in); `isAdmin` is server-derived and gates UI only (all privileged actions re-check `requireAdmin` server-side); no XSS sink. The new `marketing/worldcup26-ad` pipeline reads keys only from `process.env`, pins CDN scripts with SRI, and gitignores rendered output — no committed secrets.
- **L-2 closed, M-1 partially closed**, age-verification added for withdrawals, Greptile review config + a migration-history guard test added.

---

## 8. Real-money launch readiness (updated)

**Safe in free/pre-launch mode (as today):** yes — paid actions remain gated off behind the operator-policy launch gate, and the money engine is sound and conserves funds.

**Before flipping on real money, in priority order:**
1. **C-1 / H-3** — automated KYC/AML + sanctions screening and verified age at deposit-claim and withdrawal (the manual 18+ doc review is a start, not sufficient).
2. **C-2** — legal classification + per-market licences; encode allowed/blocked jurisdictions into operator policy.
3. **H-2** — resolve the `prize_pool_amount` net/gross contradiction (retire or net-ify the manual setter; fix docs; drop vestigial `prize_pool_fee_percent`) so settlement can't overpay 20%.
4. **H-1** — add the gate stack to the four ungated ticket paths (at minimum block self-excluded/geo-blocked **recipients**) and centralize gating so no paid route ships gate-less.
5. **M-1** — stop the owner bootstrap from seeding phantom prize-pool money and from running on every request.
6. **M-4** — add executing tests for the 80/20 split and referral-tree payout against a real Postgres; **M-2** — add a `supabase db reset` replay step to CI.
7. **M-5** — service-worker `/api` cache exclusion, generic error mapping, FKs on the new money tables.

**Backlog:** M-3 (deterministic inviter lookup) and the Low items.

---

## 9. Methodology & limitations

Full static read of the post-`de0617d` diff plus objective `typecheck`/`lint`/`test`/`build`/`npm audit` on a fresh `npm install`; three parallel breadth passes; every High/Medium re-verified by hand at `file:line`. **No live database** was available, so the RPC-lockdown, money-conservation, and replay conclusions are reasoned from the migrations and the passing (static) regression suite rather than a live PostgREST probe or an actual `supabase db reset` — re-run `money-rpc-permissions` against production after `supabase db push`, and perform a real `supabase db reset` to confirm M-2. The H-2 net/gross overpay is reasoned from source (settlement treats the column as net; the admin UI/docs treat it as gross) and is high-confidence; its realization requires an operator to use the manual prize-pool field, which the UI actively invites.
