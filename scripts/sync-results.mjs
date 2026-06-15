#!/usr/bin/env node
// Standalone results sync — apply real World Cup results + points with NO deploy.
//
// Pulls the live FIFA World Cup feed from football-data.org, matches each of the
// tournament's fixtures to our teams, writes the score, and applies points via
// the same idempotent worldcup_apply_match_points() the app uses. Safe to re-run
// (idempotent); only FINISHED matches with a real score are written.
//
// Usage:
//   SUPABASE_URL=...                       (or NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY=...          (service role — bypasses RLS)
//   FOOTBALL_DATA_API_KEY=...              (football-data.org token)
//   [FOOTBALL_DATA_COMPETITION=WC]         (default WC)
//   [TOURNAMENT_SLUG=fifa-world-cup-2026]  (default)
//   node scripts/sync-results.mjs [--dry-run]
//
// --dry-run prints what WOULD be applied without writing anything.

import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const FD_KEY = process.env.FOOTBALL_DATA_API_KEY;
const COMPETITION = process.env.FOOTBALL_DATA_COMPETITION || "WC";
const TOURNAMENT_SLUG = process.env.TOURNAMENT_SLUG || "fifa-world-cup-2026";

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!SUPABASE_URL) fail("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL).");
if (!SERVICE_KEY) fail("Set SUPABASE_SERVICE_ROLE_KEY.");
if (!FD_KEY) fail("Set FOOTBALL_DATA_API_KEY.");

// app team id -> extra normalized names the feed may use (only the divergent ones)
const TEAM_ALIASES = {
  united_states: ["unitedstates", "usa", "unitedstatesofamerica"],
  congo_dr: ["drcongo", "congodr", "democraticrepublicofcongo"],
  ir_iran: ["iran", "iriran"],
  korea_republic: ["southkorea", "korearepublic", "republicofkorea"],
  turkiye: ["turkiye", "turkey"],
  czechia: ["czechia", "czechrepublic"],
  cote_divoire: ["cotedivoire", "ivorycoast"],
  cabo_verde: ["caboverde", "capeverde", "capeverdeislands"],
  bosnia_herzegovina: ["bosniaandherzegovina", "bosniaherzegovina"],
  saudi_arabia: ["saudiarabia"],
  south_africa: ["southafrica"],
  new_zealand: ["newzealand"],
};

const norm = (value) =>
  (value ?? "").normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g, "");

const candidates = (appId) => [norm(appId), ...(TEAM_ALIASES[appId] ?? [])];

const teamMatches = (appId, fdTeam) => {
  if (!appId || !fdTeam) return false;
  const names = new Set([norm(fdTeam.name), norm(fdTeam.shortName)]);
  return candidates(appId).some((c) => c.length > 0 && names.has(c));
};

function buildResult(fd, swapped, homeTeamId, awayTeamId) {
  const score = fd.score ?? {};
  const duration = (score.duration ?? "REGULAR").toUpperCase();
  const finishMethod =
    duration === "PENALTY_SHOOTOUT" ? "penalties" : duration === "EXTRA_TIME" ? "extra_time" : "90";
  const pick = (line, side) => {
    const home = Number(line?.home ?? 0);
    const away = Number(line?.away ?? 0);
    const want = swapped ? (side === "home" ? "away" : "home") : side;
    return want === "home" ? home : away;
  };
  const full = score.fullTime ?? {};
  const reg = score.regularTime ?? null;
  const pens = score.penalties ?? null;
  const homeTotal = pick(full, "home");
  const awayTotal = pick(full, "away");
  const home90 = reg ? pick(reg, "home") : homeTotal;
  const away90 = reg ? pick(reg, "away") : awayTotal;
  const homePens = finishMethod === "penalties" && pens ? pick(pens, "home") : null;
  const awayPens = finishMethod === "penalties" && pens ? pick(pens, "away") : null;

  let winnerTeamId = null;
  if (finishMethod === "penalties") {
    winnerTeamId = (homePens ?? 0) >= (awayPens ?? 0) ? homeTeamId : awayTeamId;
  } else if (homeTotal > awayTotal) winnerTeamId = homeTeamId;
  else if (homeTotal < awayTotal) winnerTeamId = awayTeamId;

  return {
    finish_method: finishMethod,
    home_goals_90: home90,
    away_goals_90: away90,
    home_goals_total: homeTotal,
    away_goals_total: awayTotal,
    home_penalties: homePens,
    away_penalties: awayPens,
    winner_team_id: winnerTeamId,
  };
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // Feed (one call)
  const res = await fetch(
    `https://api.football-data.org/v4/competitions/${encodeURIComponent(COMPETITION)}/matches`,
    { headers: { "X-Auth-Token": FD_KEY } },
  );
  if (!res.ok) fail(`football-data.org failed with ${res.status}`);
  const feed = (await res.json()).matches ?? [];
  const finished = feed.filter((m) => (m.status ?? "").toUpperCase() === "FINISHED");
  console.log(`Feed: ${feed.length} matches, ${finished.length} FINISHED.`);

  const tournament = await supabase
    .from("worldcup_tournaments")
    .select("id")
    .eq("slug", TOURNAMENT_SLUG)
    .single();
  if (tournament.error || !tournament.data) fail(`Tournament '${TOURNAMENT_SLUG}' not found.`);

  const matches = await supabase
    .from("worldcup_matches")
    .select("id,match_number,home_team_id,away_team_id,status,points_applied_at")
    .eq("tournament_id", tournament.data.id)
    .order("match_number");
  if (matches.error) fail(matches.error.message);

  let applied = 0;
  let skippedNoFeed = 0;
  let alreadyDone = 0;
  let errors = 0;

  for (const match of matches.data ?? []) {
    if (match.status === "completed" && match.points_applied_at) {
      alreadyDone += 1;
      continue;
    }

    // already completed but points not applied -> just (re)apply
    if (match.status === "completed" && !match.points_applied_at) {
      if (DRY_RUN) {
        console.log(`  #${match.match_number} would re-apply points (completed, unapplied)`);
        applied += 1;
        continue;
      }
      const r = await supabase.rpc("worldcup_apply_match_points", { target_match_id: match.id });
      if (r.error) { errors += 1; console.log(`  #${match.match_number} apply error: ${r.error.message}`); }
      else { applied += 1; }
      continue;
    }

    // find a FINISHED feed match for this fixture
    let chosen = null;
    let swapped = false;
    for (const fd of finished) {
      if (teamMatches(match.home_team_id, fd.homeTeam) && teamMatches(match.away_team_id, fd.awayTeam)) {
        chosen = fd; swapped = false; break;
      }
      if (teamMatches(match.home_team_id, fd.awayTeam) && teamMatches(match.away_team_id, fd.homeTeam)) {
        chosen = fd; swapped = true; break;
      }
    }

    const ft = chosen?.score?.fullTime;
    if (!chosen || ft == null || ft.home == null || ft.away == null) {
      skippedNoFeed += 1;
      continue;
    }

    const result = buildResult(chosen, swapped, match.home_team_id, match.away_team_id);
    const label = `#${match.match_number} ${match.home_team_id} ${result.home_goals_total}-${result.away_goals_total} ${match.away_team_id} (${result.finish_method})`;

    if (DRY_RUN) {
      console.log(`  WOULD APPLY ${label}`);
      applied += 1;
      continue;
    }

    const upd = await supabase
      .from("worldcup_matches")
      .update({ status: "completed", ...result, result_checked_at: new Date().toISOString() })
      .eq("id", match.id);
    if (upd.error) { errors += 1; console.log(`  ${label} update error: ${upd.error.message}`); continue; }

    const ap = await supabase.rpc("worldcup_apply_match_points", { target_match_id: match.id });
    if (ap.error) { errors += 1; console.log(`  ${label} apply error: ${ap.error.message}`); continue; }

    console.log(`  APPLIED ${label}`);
    applied += 1;
  }

  console.log(
    `\n${DRY_RUN ? "[DRY RUN] " : ""}Done. applied=${applied} already=${alreadyDone} no-result-yet=${skippedNoFeed} errors=${errors}`,
  );
  if (!DRY_RUN && errors === 0) console.log("Leaderboard points are updated. ✓");
}

main().catch((error) => fail(error?.message ?? String(error)));
