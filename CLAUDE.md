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

## YouTube series: WorldCup26 Legends (MANDATORY reading before any video work)

Before producing, editing, or advising on ANY episode of the match-video series,
read ALL of these living knowledge files:
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
10. **NO SUBTITLES / NO ON-SCREEN CAPTION TEXT (hard rule, NO EXCEPTIONS):** the
    videos must NOT burn in subtitles or sentence captions. Brian's voice carries
    the story — do NOT mirror the narration as text on screen. This bans the
    template's `LowerThird` bio sentences, narration captions, and any paragraph
    text. The ONLY text permitted on screen is minimal graphic furniture: the
    episode title card, player NAME labels (name only, no sentence), the score
    bug (e.g. "SWE 2–1 TUN"), the "OUR PREDICTION" watermark, and the
    worldcup26.world CTA. If in doubt, leave the text OFF.
11. **USE THE PAID HIGGSFIELD ANIMATIONS — NOT KEN-BURNS STILLS (hard rule):**
    every player/crowd/stadium shot must use the already-generated, already-paid
    Higgsfield VIDEO clips (in `content/videos/<Team>/`, plus the per-episode
    `jobs-manifest.json` re-downloadable via Higgsfield, and any new clips
    generated through the Higgsfield MCP). Populate `clips.json` with real video
    clips; do NOT ship an episode as "IMAGE-BASED (Ken-Burns on stills)". Stills
    are a last-resort fallback ONLY when no clip exists for that nation/shot —
    and if so, say it explicitly and generate the missing clip.

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
