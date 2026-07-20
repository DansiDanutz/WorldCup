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
  standard (rule #11): library-first video assets, fans + stadium + Mystery
  Supporter, gold standard Ep2/Ep6. NEVER image-based/Ken-Burns, and NEVER spend
  Higgsfield credits before checking the existing asset library.
- **`content/youtube/CHANNEL_GROWTH_ACTION_PLAN.md`** — channel config + the
  growth law, the canonical channel (`@DansLab-Kimi`), and the packaging rules.
- **`content/youtube/PREMIERE_CALENDAR.md`** — which episode premieres WHEN,
  mapped to the real WC2026 fixtures, plus the Shorts posting schedule.
- **`content/youtube/MONETIZATION_STATUS.md`** — real YPP eligibility, the
  watch-hours path, and the channel-consolidation blocker (only the watch-time
  requirement is unmet; content is split across two channels = 0 watch hours).
- **`content/youtube/PRODUCTION_ACCELERATION.md`** — how we stay 48h ahead: the
  rolling 2-episode buffer, the backwards-from-kickoff timebox, batching the
  asset-selection step, and the one-command `build-episode.sh` (render ‖ VO).
- **`content/youtube/PREUPLOAD_CHECKLIST.md`** — the one-screen checklist to run
  before EVERY upload (the ⚠️ monetization-safe items: made-for-kids=No, AI
  disclosure, cleared music, no prize wording, non-affiliation line).

After every published episode, UPDATE the playbook (log results at 48h + new
learnings) and tick the episode off in the premiere calendar.

### Channel positioning and packaging direction (GLOBAL ENGLISH -- do not pivot Romanian-only)

WorldCup Central stays a global English channel. Do NOT reposition the channel
as Romanian-only or local-only. The winning lane is:

**WorldCup Central = cinematic World Cup stories, match myths, predictions, and
forgotten legends.**

Use the WorldCup26 Legends / mythic storytelling identity as the creative wrapper,
but make every next video easy to understand and click from global YouTube search.
Before writing a script, title, description, thumbnail prompt, Short, or pinned
comment, apply these rules:

1. **Searchable promise first, myth second.** A viewer must instantly understand
   the match/topic and the reason to click today. Put the clear search phrase in
   the title first; use the mythic phrase in the thumbnail, intro, description,
   or second half of the title.
   - Weak pattern: `England vs DR Congo: The Lions and the Leopard -- WorldCup26 Legends Ep.84`
   - Stronger pattern: `England vs DR Congo Preview: Can the Leopards Shock England? | World Cup 2026`
2. **First 5 seconds = stakes before poetry.** Open with the match/topic, the
   tension, and the curiosity gap before the mythic narration. Formula:
   `match/stakes -> mystery/history hook -> mythic framing -> story/prediction`.
3. **Keep the formats separate and recognizable.**
   - `WorldCup26 Legends`: cinematic match myth/previews with verified history,
     Brian narration, Mystery Supporter, and predictions clearly labelled.
   - `Match Myths`: timely searchable previews, upset angles, rivalry angles,
     squad questions, and draw/qualifier reactions.
   - `Forgotten World Cup Stories`: evergreen "Did you know?" stories about
     players, nations, old matches, records, and almost-forgotten legends.
4. **Thumbnail rule:** one dominant face/player/team/emblem conflict, <=4 words,
   a clear question or tension, and no clutter. The image sells the myth; the
   title sells the search intent.
5. **Product CTA rule:** worldcup26.world is a companion layer, not the cold
   open. Earn attention first, then place the app/free-game CTA after the story
   payoff, in the end card, pinned comment, and description. Keep the safety line:
   "free to play, just for fun, no prizes."
6. **No generic highlight/news channel drift.** We are not competing on match
   footage or breaking-news volume. Stay original: AI visuals, self-made
   graphics, verified history, transparent prediction framing, and no unlicensed
   match footage, broadcast clips, betting language, or rights-risk assets.
7. **Every next-video package must answer:** "I came for the match. Why do I
   stay for the story?" If the title/intro/thumbnail cannot answer that, rewrite
   before production.

Research-backed additions for next videos:

1. **Optimize for watch-time quality, not clickbait CTR.** YouTube's title /
   thumbnail guidance says titles must accurately represent the video, keep the
   most important words near the beginning, and use thumbnails that are readable
   across devices. If CTR is good but retention drops fast, the package overpromised.
   Fix the intro or make the thumbnail/title more honest.
2. **Use A/B tests after Premieres convert to normal long-form videos.** When
   available in YouTube Studio, test up to 3 meaningfully different title /
   thumbnail combinations. Do not test tiny variations. Judge winners by watch
   time, not only CTR. Keep a default "safe/searchable" version as variant A.
3. **Avoid the "mass-produced template" monetization risk.** The series may keep
   the same structure, but each episode must be materially different in substance:
   a unique verified history hook, a unique match tension, custom country/team
   visuals, and original commentary. If two episodes can be swapped by only
   changing team names, rewrite before rendering.
4. **Treat official FIFA/broadcaster content as unbeatable on raw footage.** FIFA,
   media partners, and rights holders will own official highlights, archives, and
   premium access. WorldCup Central wins with original mythic framing, verified
   story research, prediction transparency, custom AI visuals, and the
   worldcup26.world companion game layer.
5. **Do not make the channel or app look officially affiliated.** Use "World Cup"
   descriptively/editorially, but avoid recurring official FIFA marks, emblem,
   trophy art, mascot, official typeface, host-city marks, or official-looking
   layout language near `worldcup26.world`, sponsors, CTAs, thumbnails, or merch.
   Prefer generic soccer imagery, country colors, flags where permitted, and
   custom original tournament-neutral branding.
6. **Analytics loop per upload:** at 24h and 48h, log impressions, CTR, average
   view duration, first-30-second retention, traffic sources, new viewers, subs
   gained, comments, and which title/thumbnail was live. Diagnosis rule:
   low impressions = topic/timing/distribution problem; high impressions + low
   CTR = packaging problem; high CTR + low retention = promise/intro problem;
   strong retention + weak subs = CTA/community problem.

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
11. **CLIP-BASED ONLY -- LIBRARY-FIRST VIDEO ASSETS, NEVER STILLS, HIGGSFIELD
    CREDITS ARE RATIONED (hard rule, NO EXCEPTIONS, NO "SIMPLIFY"):** EVERY
    episode is built from real VIDEO clips, but the default source is the asset
    library we already paid for and generated, NOT new Higgsfield generations.
    **Before calling Higgsfield for any video, search the existing library first**
    (`content/videos/<Team>/`, other `content/videos/` folders, prior-episode
    `assets/`, `jobs-manifest.json`, and reusable stadium/fan/supporter/player
    clips). Build the shot list from owned/reusable clips first, then decide what
    the video actually needs.

    **NO-REPEAT RULE (hard, owner-mandated): every clip plays at most ONCE in a
    video** -- never reuse the same animation file twice, and never stretch a
    short clip across a long window so it visibly loops. A 5-min (300s) video
    needs ~25-34 DISTINCT clips (one per narration beat, ~8-12s each). If the
    first library pass does not give enough unique clips, widen the search across
    compatible countries, fans, stadiums, neutral soccer atmosphere, player
    closeups, flags/colors, Mystery Supporter material, and prior approved
    episodes before spending any credits. Before rendering, grep the scene file:
    no `src=` value may appear more than once.

    `clips.json` `clips[]` is **always non-empty (~25-34 clips)** and covers both
    teams' star players (animated), fans/ultras, the stadium, and the animated
    Mystery Supporter(s) -- supporters and the story are the SUBJECT, not a photo
    slideshow. Gold standard = **Ep2 & Ep6**; the next episode matches them or
    better, never less. Full recipe + pipeline:
    **`EPISODE_PRODUCTION_STANDARD.md`**.

    - **Higgsfield credit rule:** use Higgsfield ONLY for special assets, hero
      moments, missing must-have characters, or unique story beats that cannot be
      solved with the existing library. NEVER use Higgsfield for the entire video,
      every scene, generic filler, routine crowd shots, routine stadium shots, or
      clips that are "nice to have" but not essential. Generate the smallest
      number of clips needed, then stop.
    - **Required workflow before generation:** (1) search and inventory the owned
      library, (2) choose the clips that will actually be used in the video, (3)
      identify only the remaining special gaps, (4) generate only those special
      gaps if they are truly necessary, and (5) log the reason for each new
      generation in the episode README / production notes.
    - **ABSOLUTELY FORBIDDEN:** shipping `clips: []`, "IMAGE-BASED (Ken-Burns on
      stills)", a photo slideshow, any "bulk"/simplified episode, or a full-video
      Higgsfield generation spree. There is NO stills fallback -- use the library
      intelligently, and spend credits only when the video genuinely needs a
      special missing asset.

## Video production pipeline

Each episode is a self-contained project under `marketing/match-videos/<epNN-...>/`
built on the Ep2 template (`match02-south-korea-vs-czech-republic/`):
React/Babel 300s timeline → Playwright frame render → ElevenLabs Brian VO →
two-stage ffmpeg mux (audio master, then video encode). See that project's
README.md for commands. **The visuals are library-first VIDEO clips**
(`content/videos/<Team>/`, other reusable `content/videos/` folders, job IDs in
`jobs-manifest.json`, re-downloadable via `npm run fetch-assets`, prior-episode
`assets/`, or minimal special assets generated/fetched through the Higgsfield
MCP only when truly needed). The timeline plays these clips; it does NOT
pan-and-zoom stills (see hard rules 10 & 11 above: NO subtitles/caption text,
use video animations, and preserve Higgsfield credits). Ep2 (the canonical
template) is clip-based — copy that, not the later image-only shortcuts.

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

## Shorts standard — "DRAMA → IDOL", the 1-minute WOW (MANDATORY for every Short)

Shorts are not trailers or teasers — each one is a **complete, self-contained mini-film**
that must make the viewer go **WOW** in ~60 seconds (target 40–60s, hard ceiling 60s).
If a Short is not wow, it does not ship. The bar is the same as the long-form episodes,
compressed: real animation, real emotion, real payoff.

**THE ARC — every Short runs DRAMA → IDOL (hard rule).** Open on the drama (the wound,
the impossible odds, the mystery, the fall), travel the struggle, and land on the IDOL —
the triumph / legend / the thing that made them immortal. The emotional curve must rise:
**hook → drama/struggle → turn → idol/payoff → CTA.** No flat "fact lists." Same
mystery+verified-history law as episodes (hard rule #9): a real "Did you know?" secret,
auto-researched and cited, never invented.

**Format & pipeline (validated gold standard):**
- **Portrait 9:16, 1080×1920**, 30fps. Frame vertical (subject centered/upright); respect
  mobile safe zones (~12% top / ~18% bottom clear of the YouTube UI).
- **Character-locked Pixar visuals** — generate a hero reference frame, then reference it on
  every shot of that player so the face stays consistent (the #1 failure mode). Soccer-only,
  no logos/real footage (hard rules #5/#11); AI hoardings that invent brand text get blurred
  before delivery (monetization rule #0).
- **Real image→video motion**, never Ken-Burns stills: `seedance_2_0` for identity →
  `kling3_0_turbo` fallback (Kling is the reliable workhorse). Atmospheric beats may use a
  slow cinematic push only when a clip is unavailable.
- **Brian VO** (ElevenLabs, voice `nPczCjzI2devNBz1zQrb`, `eleven_flash_v2_5`) carries the
  story — **NO on-screen sentence text** (hard rule #10). Cleared BGM under, ducked.
- **All on-screen text = designed HyperFrames motion cards** (HTML→MP4, GSAP, brand-true),
  never flat ffmpeg/Pillow labels. Brand: WorldCup26 green `#106b4f` + gold "legendary"
  accent + Inter + the real trophy mark (`public/brand-mark.svg`). Cards: a `DID YOU KNOW?`
  opener, a player name lower-third (name + `SCORE · YEAR` only), and the end ad.
- **ADVERTISE WORLDCUP26.WORLD, NOT THE CHANNEL.** Every Short ends on the app, not on
  "@DansLab" — a **"Legendary Cards"** end card: *collect legendary player cards, unlock the
  stories they never told you, **sign up free at worldcup26.world**.* The VO close must drive
  to the site, not just "subscribe."

**References:** story bank + portrait spec in `content/youtube/DID_YOU_KNOW_SHORTS.md`;
gold-standard build = `~/Desktop/DavidAi/Videos/dyk-gaetjens/` (Gaetjens "Did You Know?",
HyperFrames cards in `hf/index.html`). Match it or beat it — never less.

### Story research — Firecrawl (fact-check the hook BEFORE scripting; hard rule #9)

Every Short/episode hook must be auto-researched, verified, and source-cited (never invented).
Use **Firecrawl** for this. The API key lives in `~/.openclaw/fleet.env` as `FIRECRAWL_API_KEY`
(secret store — do **not** paste the raw key into git-tracked files like this one; source it:
`set -a; . ~/.openclaw/fleet.env; set +a`). Endpoints: search `POST https://api.firecrawl.dev/v1/search`,
scrape `POST https://api.firecrawl.dev/v1/scrape` — header `Authorization: Bearer $FIRECRAWL_API_KEY`.

- **Write PRECISE queries with SPECIFIC words** — name the player + the exact hook + a verifier like
  "true story / verified". Use proper nouns, years, and the specific incident; do NOT use vague queries.
  Good: `Carlos Kaiser Henrique Raposo footballer faked entire career never played true story`.
  Bad: `brazil football story`. Specific terms surface the primary source on the first hit.
- These stories are our drama / mystery / "Did You Know?" engine — keep mining genuinely obscure,
  emotional, twist-driven football tales (DRAMA → IDOL). Pull the primary source (Wikipedia / FIFA /
  Britannica), extract the verified facts, cite them in the story entry, and frame any anecdote as
  "it's said." Never invent (rule #9); soccer-only; monetization-safe (rules #0/#8).
- The shorts bank/queue is `content/youtube/DID_YOU_KNOW_SHORTS.md` — append each new researched,
  sourced story there. **Owner-requested addition: Carlos "Kaiser" Raposo — "the greatest footballer
  never to play football" (DC-6, added 2026-06-29).**

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

Legend card "Listen story" playback MUST use ElevenLabs Brian through the
server-only `/api/legend-cards/voice` route (`ELEVENLABS_API_KEY`, optional
`ELEVENLABS_BRIAN_VOICE_ID`). Do not use random browser voices for cards. The
only browser fallback allowed is an installed English voice explicitly named
Brian; otherwise show an env/config error instead of playing a different voice.

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
`line=`/`note=` subtitles**, balanced JS syntax. A render that starts with a red preflight
is a process failure — fix first.

**Ep33+ PERFECTION BAR (owner-mandated):** everything must be right the first time —
story, verified mystery+history, Brian VO, music, image/animation quality, no-repeat
clips, monetization-safety. Enhancements are ADDED on top of the gold standard, never
replacing what already works (see SERIES_PLAYBOOK "EP33+ ENHANCEMENT SET"). Preflight +
the playbook checklists are the guardrails; use them every time.
