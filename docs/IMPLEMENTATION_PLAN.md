# Implementation Plan

This plan records the current professional build order.

## Completed

- Supabase project linked to Games.
- Dedicated `worldcup_*` schema created.
- 48 teams seeded with fixed reward coefficients.
- 7 stages seeded with stage coefficients.
- 104 matches seeded.
- Timezone-aware kickoff/check timestamps added.
- Cron-safe award ledger added.
- Next.js app created.
- Pick-3 entry workflow implemented.
- Leaderboard implemented.
- Admin result fallback implemented.
- Cron endpoints implemented.
- Responsive mobile/tablet/desktop layout pass implemented.
- Vercel deployment configuration and health check implemented.
- Google-only referral invite flow implemented.
- Admin referral agreement report implemented.
- Dedicated login/register page with referral-code resolution implemented.
- Admin ticket assignment, ticket price, and internal wallet transfer ledger implemented.

## Next

1. Configure deployment environment variables.
2. Deploy the Next.js app.
3. Connect an official or trusted result API.
4. Add a full admin page with result audit history.
5. Add end-to-end tests for login/register, referral acceptance, ticket-gated entry creation, result entry, and leaderboard updates.
6. Run usability testing on real phones before launch.
