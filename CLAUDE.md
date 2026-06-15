# CLAUDE.md — WorldCup26 project guide

## YouTube series: WorldCup26 Legends (MANDATORY reading before any video work)

Before producing, editing, or advising on ANY episode of the match-video series,
read **`content/youtube/SERIES_PLAYBOOK.md`** — the living knowledge file with
the DO / DON'T lists, the per-episode checklist, and the results log.
After every published episode, UPDATE that file: log the results at 48h and add
any new good/bad learnings.

Non-negotiables distilled from channel data (details in the playbook):
1. Views = Packaging × Timing × Distribution × Retention — content alone is not enough.
2. Episodes go live (as YouTube **Premieres**) ≥24h BEFORE the real match they cover.
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
8. **CHRONOLOGICAL PRODUCTION ORDER (hard rule):** produce and publish episodes
   in the EXACT order the matches are played on TV — by kickoff date, then
   kickoff time within a day. The live broadcast schedule (date + kickoff time,
   e.g. the fixtures grid the owner shares) is the single source of truth for
   ORDER; reconcile it with `content/<Team>/Match/<Opponent>.md` dates. NEVER
   jump ahead to a later-kickoff match while an earlier-kickoff match still has
   no episode. Each episode must be READY ≥48h before its kickoff (hard
   deadline). Episode number = chronological slot; keep
   `content/youtube/SCHEDULE.md` (the ordered fixture list with status) current
   and treat it as the canonical production queue.
9. **HOOK = MYSTERY + HISTORY (the #1 quality bar):** every episode lives or dies
   on a captivating, VERIFIED "Did you know?" hook — a real secret about the
   nation, a player, or a special event (e.g. Tunisia 1978 = first African team
   to win a World Cup match; Zidane Iqbal named after Zinedine Zidane). The
   mystery (the Mystery Supporter / Legend) and the true history are the
   PRIORITY of the script, opened in the cold open and paid off at the end.
   Rules: (a) AUTORESEARCH every episode — web-search to find and fact-check the
   hook before writing; cite sources in the episode README; never invent
   history. (b) Keep it captivating and curiosity-driven ("Did you know…",
   "the secret nobody talks about…"). (c) SELF-IMPROVING: after each episode log
   what worked in `SERIES_PLAYBOOK.md` and raise the bar for both quality and
   cross-episode CONSISTENCY (voice = Brian, soccer-only, same structure, recap
   the previous episode's prediction).

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
