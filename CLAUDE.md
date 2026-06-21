# CLAUDE.md — WorldCup26 project guide

## NORTH STAR (read first): enable monetization ASAP

The current single objective is to cross the YouTube Partner Program (YPP)
watch-time threshold and switch on fan funding, then ads. Subscribers (1,327) and
uploads are already met — **only watch time is missing, and it reads 0 because
content is split across two channels.** Weigh every decision against one question:
*does this bank VALID PUBLIC WATCH HOURS faster?* Use all leverage we have — the
1,327 existing subscribers, the 13 finished episodes, the 15 rendered Shorts, the
organic campaign machine, the worldcup26.world funnel, Higgsfield, and the live
World Cup discovery window happening right now.

**Priority levers, in order (detail in `MONETIZATION_STATUS.md`):**
1. **Consolidate** every episode onto `@DansLab-Kimi`, public — the 0-hours root cause.
2. **Verify "No, not made for kids"** on every video — made-for-kids silently
   disables fan funding and voids personalized features; Pixar style is
   high-risk, so check it TODAY.
3. **Point the ORGANIC campaign** (WhatsApp/Telegram/X/community + the site
   funnel) at the long-form episodes — organic external watch time counts toward
   the 3,000h. Keep PAID ads aimed at the site, not YouTube (paid-driven watch
   time risks being ruled non-valid).
4. **Premiere ≥48h ahead + autoplay "All Episodes" playlist** — concentrated live
   + binge watch time.
5. **Shorts 2–4/day during the tournament** — funnel to long-form & subs, and a
   hedge toward the 3M-Shorts path.

**Daily operating loop (improve every single day):** post the day's Shorts + run
the first-hour push on any premiere → ship/schedule the next buffered episode
(stay 2 ahead, chronological) → read yesterday's analytics and log watch-hours,
subs and Shorts views in `MONETIZATION_STATUS.md` → reply to every comment → if a
lever is underperforming, change it.

**Change the approach if:** after a week of consolidated, fully-pushed uploads the
watch-hours velocity won't reach 3,000h within ~60–90 days → escalate (more
premieres, higher-retention/longer episodes, heavier organic distribution) or
shift effort to the Shorts-views path. Never keep doing what isn't moving the KPI.

## ⛔ MONETIZATION-SAFETY (HARD RULE #0 — overrides everything; never ship a video that fails this)

The whole point is to monetize. A single demonetization-trigger can void the channel.
Treat these as non-negotiable on EVERY video, Short, thumbnail, title, description and
tag — check and re-check before every render and every upload (see
`content/youtube/PREUPLOAD_CHECKLIST.md`):

1. **NO gambling / betting look.** Never show odds, decimal "coefficients" (x2.10),
   bookmaker styling, "bet/stake/wager/win money". The prediction game is shown ONLY as
   free-game points (e.g. "N× PER GOAL") and always labelled **"free to play · just for
   fun · no prizes"**. No prize/cash/jackpot wording anywhere.
2. **Made for kids = NO** at upload (Pixar style auto-flags as kids and silently kills
   fan funding). MANDATORY every upload.
3. **AI / altered-content disclosure = YES** at upload.
4. **Music = cleared only** (Kevin MacLeod / incompetech CC-BY 4.0), credited in the
   description. Never uncleared/copyrighted audio.
5. **100% AI-generated visuals** — never real match footage, broadcast clips, club/FIFA
   logos, or copyrighted images.
6. **Original, non-repetitious** — the no-repeat clip rule (#11) also protects against
   "reused content" demonetization. Every clip once.
7. **Real-results-only** — scorelines are OUR PREDICTION, never stated as fact (#7).
8. No profanity, no graphic violence, SOCCER-ONLY imagery.

If any item fails: fix the source and re-render BEFORE delivery/upload. When in doubt,
remove the risky element — monetization safety beats every other consideration.

## YouTube series: WorldCup26 Legends (MANDATORY reading before any video work)

Before producing, editing, or advising on ANY episode of the match-video series,
read ALL of these living knowledge files:
- **`content/youtube/SERIES_PLAYBOOK.md`** — DO / DON'T lists, per-episode
  checklist, and the results log.
- **`content/youtube/EPISODE_PRODUCTION_STANDARD.md`** — the clip-based-ONLY
  standard (rule #11): real Higgsfield animations from the team images, fans +
  stadium + Mystery Supporter, gold standard Ep2/Ep6. NEVER image-based/Ken-Burns.
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
- **`content/youtube/PREUPLOAD_CHECKLIST.md`** — the one-screen checklist to run
  before EVERY upload (the ⚠️ monetization-safe items: made-for-kids=No, AI
  disclosure, cleared music, no prize wording, non-affiliation line).

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
10. **NO SUBTITLES / NO ON-SCREEN SENTENCE TEXT (hard rule, NO EXCEPTIONS — the
    owner has flagged this repeatedly):** videos must NOT show subtitles or ANY
    sentence/caption text. Brian's voice carries the story — NEVER mirror or
    paraphrase the narration on screen.
    - **BANNED in every scene file:** `LowerThird` `line=` bio sentences,
      `HistoryPlate` `note=` sentences, the cold-open narration paragraph, the
      "our prediction" sentence, the full-time descriptive sentence, the app
      descriptive sentence, and ANY `<div>`/`<p>` containing a sentence (a phrase
      with a verb / multiple words reading like speech).
    - **ONLY text allowed on screen:** the episode title card (e.g. "IRAQ vs
      NORWAY", "Episode 22"), short SECTION LABELS (≤4 words, e.g. "Chapter One"),
      player NAME labels (name + position only, NO sentence), the score bug
      ("IRQ 1–1 NOR"), the "OUR PREDICTION" watermark, and the worldcup26.world CTA.
    - **ENFORCEMENT:** before rendering ANY episode, grep the scene file — there
      must be ZERO `line=` on LowerThird, ZERO `note=` on HistoryPlate, and no
      narration paragraphs. This applies to EXISTING episodes too: strip them and
      re-render. A render showing any sentence on screen is REJECTED — re-do it.
11. **CLIP-BASED ONLY — REAL HIGGSFIELD ANIMATIONS, NEVER STILLS (hard rule, NO
    EXCEPTIONS, NO "SIMPLIFY"):** EVERY episode is built from real Higgsfield
    VIDEO clips. **NO-REPEAT RULE (hard, owner-mandated): every clip plays at most
    ONCE in a video — NEVER reuse the same animation file twice, and NEVER stretch a
    short clip across a long window so it visibly loops. A 5-min (300s) video needs
    ~33 DISTINCT clips (one per narration beat, ~8–10s each). If you don't have
    enough unique clips, GENERATE more (distinct shots/poses/emotions, Lukaku-film
    method in the worldcup-episode skill) — do NOT loop. Before rendering, grep the
    scene file: no `src=` value may appear more than once.**
    `clips.json` `clips[]` is **always non-empty (≈25–34 clips)** and
    covers **both teams' star players (animated), fans/ultras, the stadium, and the
    animated Mystery Supporter(s)** — supporters and the story are the SUBJECT, not
    a photo slideshow. Gold standard = **Ep2 & Ep6**; the next episode matches them
    or better, never less. Full recipe + pipeline: **`EPISODE_PRODUCTION_STANDARD.md`**.
    - **How:** reuse the paid library first (`content/videos/<Team>/`, prior-episode
      `assets/`, `jobs-manifest.json`); for any missing shot, **GENERATE the clip via
      the Higgsfield MCP from the player image in `content/images/<Team>/`** (image→
      video, ~22.5 credits/5s). Then populate `clips.json` and render.
    - **ABSOLUTELY FORBIDDEN:** shipping `clips: []`, "IMAGE-BASED (Ken-Burns on
      stills)", a photo slideshow, or any "bulk"/simplified episode. There is NO
      stills fallback — if a clip is missing you GENERATE it, you do not downgrade.
      Ep15–Ep25 were made this wrong way; **we do not repeat it and do not rebuild
      them — we move forward, clip-based, every time.**
12. **NARRATION PACING — never rush the VO (owner-mandated, hard rule):** Brian's
    narration must ALWAYS be delivered at a natural, unhurried, cinematic pace.
    NEVER speed up, time-stretch, or compress the narration audio, and NEVER cram
    lines together to force the video into exactly 300s. **~5:00 is a target, not a
    hard cap** — if the story needs more time, EXTEND the video: lengthen the scene
    windows and the total timeline `DURATION` (e.g. 330s, 360s) so every line and
    pause breathes. Set the timeline length to fit the natural VO, not the other way
    round. A slightly longer video that sounds calm and premium always beats a
    rushed 5-minute one. (When extending: bump `DURATION` in render/mux, widen the
    `SCENES` windows in match.html, and shift the later `narration.json`/`clips.json`
    timestamps to match — keep the same beats, just give them room.)
13. **RENDER ONE EPISODE AT A TIME — never in parallel (owner-mandated, hard rule):**
    episodes render strictly SEQUENTIALLY — one fully finished, pushed, and
    delivered for review before the next starts. NEVER run two renders at once
    (it splits the throttled CPU and, worse, risks duplicate/colliding renders).
    Each episode is produced, committed and checkable on its own, so a failure in
    one NEVER cascades to the others: isolate it, surface it, fix that single
    episode, then continue the queue. Always hand over each finished video so the
    owner can check it individually.
14. **QUALITY BAR = Ep37 "close to perfection" (owner-set):** every episode must
    match or beat Ep37 on ALL of: real Higgsfield ANIMATIONS (dense, not stills),
    smooth motion / "hyperframe" feel, pro UI/UX (clean lower-thirds, score bug,
    section labels, the app scene), the MYSTERY beat, the collectible **Legend 0NN
    card**, the cinematic grade + film grain, music, and the EP-NN gold-seal
    thumbnail. Enhancements are ADDED on top of this bar, never traded away for
    speed. Reference master: Ep37 (Ecuador–Curaçao).

## Video production pipeline

Each episode is a self-contained project under `marketing/match-videos/<epNN-...>/`
built on the Ep2 template (`match02-south-korea-vs-czech-republic/`):
React/Babel 300s timeline → Playwright frame render → ElevenLabs Brian VO →
two-stage ffmpeg mux (audio master, then video encode). See that project's
README.md for commands. **The visuals are the paid Higgsfield VIDEO clips**
(`content/videos/<Team>/`, job IDs in `jobs-manifest.json`, re-downloadable via
`npm run fetch-assets`, or generated/fetched through the Higgsfield MCP) — the
timeline plays these clips; it does NOT pan-and-zoom stills (see hard rules 10 &
11 above: NO subtitles/caption text, and use the animations, not Ken-Burns
stills). Ep2 (the canonical template) is clip-based — copy that, not the
later image-only shortcuts.

### Series versioning & insertion (CHECK BEFORE building any episode)

The series is numbered and growing — insert new work in the RIGHT place, never
reuse or skip a number. Before creating an episode:

1. **Find the next number.** Episodes are numbered by **production order**. The
   next number = (highest existing `marketing/match-videos/matchNN-...` folder) + 1.
   Cross-check the `SERIES_PLAYBOOK.md` results log and `UPLOAD_PACKS.md`.
   **Current state: latest is Ep14 (France vs Senegal) → next is Ep15.**
2. **Folder name = `matchNN-teama-vs-teamb`** where `NN` is the zero-padded
   episode number (folder number == episode number; the series starts at
   `match02` — Ep1 was the inaugural one-off).
3. **Keep the number consistent across EVERY artifact:** VO says "episode N";
   the Mystery Supporter is **Legend 0NN**; the upload-pack title ends `(Ep.N)`;
   the next-episode tease points to **Ep N+1**; add the `UPLOAD_PACKS.md` entry
   in sequence and tick the row in `PREMIERE_CALENDAR.md`.
4. **Stay on canon:** scores/dates/players consistent with `content/Stories/`
   and earlier episodes; never contradict `content/README.md`'s group draw.
5. **Reuse, don't duplicate:** build on the Ep2 template (content swap), reuse
   the music/SFX library and any existing player/crowd clips for repeat nations.

## Player drama films — "WorldCup26 Bonus" (naming standard)

Standalone player-life films (a player's path from nobody to idol — the drama of
their life + achievements) are a SEPARATE series from the match episodes. They are
ALWAYS named **`WorldCup26 Bonus - <Player Name>`** (title card, upload title, and
output filename, e.g. `WorldCup26_Bonus_Romelu_Lukaku.mp4`). Same rules as episodes:
clip-based real animation (no Ken-Burns), Brian VO, **NO subtitles**, soccer-only,
mystery+drama structure, verified facts only (cite sources). Built like an episode
(`VideoSprite` engine) under `marketing/player-films/<player>/`. Template: the
Lukaku film (`marketing/player-films/lukaku-the-promise/`).

## Content library

- `content/<Team>/` — Info/ (overviews, players), Character/ (image prompts), Match/
- `content/Stories/` — canonical match narratives (single source of truth for scores/dates)
- `content/images/`, `content/videos/` — generated Pixar character images & animations
- `content/youtube/` — channel strategy, SEO keywords, thumbnail guide, SERIES playbook
- Canonical group draw lives in `content/README.md` — never contradict it.

## App

Next.js app (src/, Supabase, Vercel). The series always advertises
**worldcup26.world** (pick 3 teams, **free to play for fun** — climb the
leaderboard, no prizes; never promise money or prizes).

## Special Cards — the Legends collection (owner-mandated)

Every episode hides one **Mystery Supporter = Legend 0NN**. Each Legend is a
**collectible card** that lives in the app, in BOTH **landscape (16:9)** and
**portrait (9:16)**:
- Art + manifest in **`public/special-cards/`** (`legend-0NN-portrait.png`,
  `legend-0NN-landscape.png`, `cards.json`); gallery page at **`/collection`**
  (`src/app/collection/page.tsx`) — keep `cards.json` and the page's `CARDS`
  array in sync when adding a card.
- **EVERY card must be a UNIQUE character — no two cards share the same person,
  face, or archetype (hard rule).** Derive each from its Legend name + the
  match's nation/history and deliberately VARY age, gender, ethnicity and type
  (elders, youths, women, ghosts/spectres, dancers, musicians, animal-spirits,
  keepers…). Never default everyone to "an old male elder." Two same-named
  legends (e.g. both called "The Falconer") must still be visibly different people.
- Premium look: ornate gold art-deco frame, holographic foil, deep-navy ground,
  gold "LEGEND 0NN" banner + nameplate (name + nation), a soccer ball motif,
  SOCCER-only. Style reference = Legend 037–040.
- Per new episode: generate the two orientations, drop them in the folder, add the
  `cards.json` + page entry. Backfill earlier Legends the same way. Bonus player
  films (`WorldCup26 Bonus`) get their own Legend cards too.

## PRODUCTION PROCESS (mandatory — never render twice for a missed requirement)

**Scaffold a new episode COMPLETELY before anything else.** Copy ALL of these from a
known-good clip-based episode (gold = match06; recent no-repeat = match26), not a subset:
`match-kit.jsx, animations.jsx, match.html, render.mjs, serve.mjs, mux.mjs, package.json,
gen_audio.mjs, clips.json` **AND the `music/` folder (4 cue mp3s)**, plus `node_modules`
(symlink ok). Then add per-episode: `narration.json`, VO `audio/line_NN.mp3` (gen_audio),
team clips in `assets/`, squad photos in `assets/squad/`, flags/colours/score-codes in
match-kit, and the de-duped `match-scenes.jsx`.

**PREFLIGHT GATE — RUN BEFORE EVERY RENDER. No exceptions.** Render only via
`bash scripts/render-episode.sh <port> <epNum> <dir> <outfile>` which first runs
`scripts/preflight-episode.mjs`. It FAILS the render if any of these are not met:
VO complete (one mp3 per line), **music cue files present**, every clip/squad src exists,
**no clip used twice** (no-repeat), no leftover template text (Wunderteam/Nashama/FlagAUT…),
correct on-screen episode number, **no betting/odds wording** (monetization), **no
`line=`/`note=` subtitles**, **no VO overlap / VO speed-up** (rule #12), **no clip looping
>1×** (rule #11, any clip `dur`>~10s fails), balanced JS syntax. A render that starts with
a red preflight is a process failure — fix first.

**MANDATORY RETIME STEP (after VO, before render):** run
`node scripts/retime-episode.mjs <dir> <ffmpeg>`. It measures each VO line, re-spaces the
narration so NO line overlaps the next (Brian is NEVER sped up — `mux.mjs` keeps `tempo=1`),
**extends `DURATION` past 300s as needed** (writes `DURATION.txt`; render/mux read it), then
piecewise-remaps the scene timings (`scripts/remap-scenes.mjs`) and caps every clip `dur`≤9s
so nothing loops more than once. This is why Ep38 (sped-up + overlapping VO, looping clips)
was wrong; Ep39+ run this step and the preflight enforces it.

**Ep33+ PERFECTION BAR (owner-mandated):** everything must be right the first time —
story, verified mystery+history, Brian VO, music, image/animation quality, no-repeat
clips, monetization-safety. Enhancements are ADDED on top of the gold standard, never
replacing what already works (see SERIES_PLAYBOOK "EP33+ ENHANCEMENT SET"). Preflight +
the playbook checklists are the guardrails; use them every time.
