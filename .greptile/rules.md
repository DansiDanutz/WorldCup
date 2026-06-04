# WorldCup26 Review Rules

WorldCup26 is a paid-entry, USDT-backed prediction game. Reviews should treat money integrity, user eligibility, and database privileges as the highest-risk surfaces.

## Review Priorities

- Flag security and money-integrity issues before style issues.
- Treat Supabase migrations and API routes as part of one contract: route code must not assume a database guarantee that the migration does not actually enforce.
- When a change touches wallet, tickets, agents, deposits, withdrawals, entries, referrals, or admin approvals, require a clear test update.
- Prefer concrete, actionable findings. Avoid speculative comments unless the failure mode is realistic for this app.

## Supabase And RLS

- New tables holding user, wallet, ticket, agent, referral, deposit, withdrawal, or admin data must enable RLS before app code uses them.
- Policies should be explicit about owner reads, admin/server writes, and public read-only data.
- Privileged RPCs must be `SECURITY DEFINER`, pin `search_path`, revoke public/anon/authenticated execution, and grant only `service_role` unless there is a deliberate public-safe reason.
- Route code should not expose raw database errors, SQL details, service-role behavior, or private row contents to unauthenticated clients.

## Wallet, Tickets, Agents, And Referrals

- Wallet debits must use the canonical lock and non-negative-balance backstop. Do not add route-level read-then-write debit logic.
- Ticket purchases, ticket claims, ticket transfers, agent assignments, and Agent Call accepts must be atomic and double-spend safe.
- Any path that grants paid participation must apply the launch gates, geo gate, responsible-play gate, and consent/age flow as appropriate.
- Agent flows must preserve the rule that an agent has an active user account with a personal ticket before sellable agent inventory is fully assigned.
- Referral attribution must not be overwritten accidentally and must not trust client-supplied user IDs, emails, or percentages.

## Withdrawals And Compliance

- Withdrawal routes must check age verification, responsible-play state, network/address validity, amount limits, balance availability, and state-specific transitions.
- Admin withdrawal actions must require admin authentication, an audit note, and safe handling of payout transaction hashes.
- The code should not imply KYC/AML/sanctions/legal approval has been automated unless the implementation actually performs those checks.

## Frontend And Mobile UX

- Mobile screens must avoid text overlap, horizontal scrolling, and fixed overlays that block touch scrolling.
- Any full-list or expanded panel must have a clear scroll boundary and must allow scroll gestures from the center of cards, not only screen margins.
- Install/PWA flows must gracefully handle devices where install prompts are unavailable and must not repeatedly show a completed install CTA after installation.

## Tests

- Use the existing Node test pattern in `tests/*.test.ts`.
- For SQL migrations, assert important RLS, grants, lock usage, and trigger/function contracts.
- For route behavior, prefer injectable/executable handler tests when practical instead of only grep-style assertions.
