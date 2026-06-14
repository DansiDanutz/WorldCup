#!/usr/bin/env node
// Enter match results into WorldCup26 and recompute every user's points.
//
// Posts each result to /api/admin/results using the break-glass admin secret
// (x-admin-secret: $ADMIN_RESULT_SECRET), which immediately applies points to
// ALL entries (free `committed` + paid `locked`). Then triggers the idempotent
// backfill cron so the leaderboard reflects every completed match.
//
// This script ENTERS operator-provided real results — it never invents scores.
//
// Env:
//   BASE_URL             e.g. https://worldcup26.world  (required)
//   ADMIN_RESULT_SECRET  break-glass admin secret set in Vercel  (required)
//   CRON_SECRET          to trigger the apply/backfill cron      (optional)
//
// Usage:
//   BASE_URL=https://worldcup26.world ADMIN_RESULT_SECRET=... CRON_SECRET=... \
//     node scripts/enter-results.mjs results.json
//
// results.json — array of results (matchId is the worldcup_matches UUID;
// get it from the Admin console or the worldcup_matches table):
// [
//   { "matchId": "uuid", "finishMethod": "90",
//     "homeGoals90": 1, "awayGoals90": 0,
//     "homeGoalsTotal": 1, "awayGoalsTotal": 0,
//     "homePenalties": null, "awayPenalties": null, "winnerTeamId": null },
//   ...
// ]
import fs from 'node:fs';

const BASE_URL = process.env.BASE_URL;
const ADMIN_RESULT_SECRET = process.env.ADMIN_RESULT_SECRET;
const CRON_SECRET = process.env.CRON_SECRET;
const file = process.argv[2] || 'results.json';

if (!BASE_URL || !ADMIN_RESULT_SECRET) {
  console.error('ERROR: set BASE_URL and ADMIN_RESULT_SECRET');
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`ERROR: results file not found: ${file}`);
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!Array.isArray(results) || results.length === 0) {
  console.error('ERROR: results file must be a non-empty JSON array');
  process.exit(1);
}

let ok = 0, fail = 0;
for (const r of results) {
  if (!r.matchId) { console.error('skip: entry missing matchId', r); fail++; continue; }
  try {
    const res = await fetch(`${BASE_URL}/api/admin/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_RESULT_SECRET },
      body: JSON.stringify(r),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) { console.error(`FAIL ${r.matchId}: ${res.status} ${body.error || ''}`); fail++; continue; }
    console.log(`ok   ${r.matchId}: awarded ${body.awardedRows} rows, bracket +${body.bracketAdvanced}`);
    ok++;
  } catch (e) { console.error(`FAIL ${r.matchId}: ${e.message}`); fail++; }
}

// Idempotent backfill so any previously-missed completed match is applied too.
if (CRON_SECRET) {
  try {
    const res = await fetch(`${BASE_URL}/api/cron/apply`, {
      method: 'POST', headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    console.log(`backfill /api/cron/apply -> ${res.status}`);
  } catch (e) { console.error('backfill failed:', e.message); }
} else {
  console.log('(no CRON_SECRET; skipping backfill — the :30 hourly cron will catch up)');
}

console.log(`\nDONE: ${ok} applied, ${fail} failed`);
process.exit(fail ? 1 : 0);
