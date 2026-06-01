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

## Next

1. Configure deployment environment variables.
2. Deploy the Next.js app.
3. Configure a scheduled cron to call `/api/cron/results`.
4. Connect an official or trusted result API.
5. Add authentication if the game should use real user accounts instead of display names.
6. Add a full admin page with result audit history.
7. Add end-to-end tests for entry creation, result entry, and leaderboard updates.
8. Run usability testing on real phones before launch.
