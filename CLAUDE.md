# CLAUDE.md — WorldCup26 project guide

## YouTube series: WorldCup26 Legends (MANDATORY reading before any video work)

Before producing, editing, or advising on ANY episode of the match-video series,
read ALL THREE of these living knowledge files:
- **`content/youtube/SERIES_PLAYBOOK.md`** — DO / DON'T lists, per-episode
  checklist, and the results log.
- **`content/youtube/CHANNEL_GROWTH_ACTION_PLAN.md`** — channel config + the
  growth law, the canonical channel (`@DansLab-Kimi`), and the packaging rules.
- **`content/youtube/PREMIERE_CALENDAR.md`** — which episode premieres WHEN,
  mapped to the real WC2026 fixtures, plus the Shorts posting schedule.
- **`content/youtube/MONETIZATION_STATUS.md`** — real YPP eligibility, the
  watch-hours path, and the channel-consolidation blocker (only the watch-time
  requirement is unmet; content is split across two channels = 0 watch hours).
- **`content/youtube/PRODUCTION_ACCELERATION.md`** — how we stay 48h ahead: the
  rolling 2-episode buffer, the backwards-from-kickoff timebox, batching the
  Higgsfield asset step, and the one-command `build-episode.sh` (render ‖ VO).

After every published episode, UPDATE the playbook (log results at 48h + new
learnings) and tick the episode off in the premiere calendar.

**TIMING IS THE JOB — HARD MINIMUM 48h: every episode must already be POSTED
(as a scheduled Premiere) at least 48 hours before its real match kicks off.**
Not "started", not "rendering" — live on the channel with 48h to spare. A great
episode published late is a cold start (see Ep2: 83 views). Check
`PREMIERE_CALENDAR.md` for the next fixture window BEFORE starting any episode
and work BACKWARDS from kickoff: subtract 48h to get the post deadline, then
subtract render + VO + thumbnail + Shorts + QA time to get the start date — and
start then. If you cannot make the 48h deadline, say so immediately so the
schedule can flex; never quietly ship late. If a match window has already
passed, the episode is RESCUE mode (Shorts + retitle), not a Premiere.

Non-negotiables distilled from channel data (details in the playbook):
1. Views = Packaging × Timing × Distribution × Retention — content alone is not enough.
2. Episodes go live (as YouTube **Premieres**) ≥48h BEFORE the real match they cover.
3. Every episode ships with: thumbnail (1 face + ≤4 words), SEO title/description,
   2–3 Shorts cuts, pinned comment, first-hour campaign push.
4. Brian (ElevenLabs) is always the narrator. Mystery Supporter segment in every episode.
5. Keep series canon consistent with `content/Stories/` (Ep1: MEX 0-0 RSA; Ep2: KOR 1-0 CZE, Son 41').
6. **SOCCER ONLY (hard rule):** this channel is about FOOTBALL/SOCCER, never
   American football. Every image/video generation prompt for players,
   avatars, fans, or stadiums MUST say "soccer" explicitly and exclude
   gridiron cues ("NO helmet, NO shoulder pads, NOT american football";
   round-neck football shirts; a soccer pitch with goals, never goalposts).
   AI image models default US players to NFL gear — always review the output
   for the correct sport before using it (an Ep4 thumbnail shipped a
   helmeted NFL player before review caught it).
7. **REAL-RESULTS-ONLY RULE (hard rule):** never state a match result as fact
   unless the real match has actually been played. Our episode endings are
   PREDICTIONS — in any later episode they may only be referenced as
   "our prediction"/"our story" ("we predicted 0-0 in Toronto"), NEVER as
   what happened ("last night: no goals"). Before writing any recap line,
   ask: has this match really been played? If not → label it OUR PREDICTION.

## Video production pipeline

Each episode is a self-contained project under `marketing/match-videos/<epNN-...>/`
built on the Ep2 template (`match02-south-korea-vs-czech-republic/`):
React/Babel 300s timeline → Playwright frame render → ElevenLabs Brian VO →
two-stage ffmpeg mux (audio master, then video encode). See that project's
README.md for commands. Generated media comes from Higgsfield (job IDs in
`jobs-manifest.json`, re-downloadable via `npm run fetch-assets`).

## Content library

- `content/<Team>/` — Info/ (overviews, players), Character/ (image prompts), Match/
- `content/Stories/` — canonical match narratives (single source of truth for scores/dates)
- `content/images/`, `content/videos/` — generated Pixar character images & animations
- `content/youtube/` — channel strategy, SEO keywords, thumbnail guide, SERIES playbook
- Canonical group draw lives in `content/README.md` — never contradict it.

## App

Next.js app (src/, Supabase, Vercel). The series always advertises
**worldcup26.world** (pick 3 teams, free to play; say "live prize pool",
never a fixed amount).
