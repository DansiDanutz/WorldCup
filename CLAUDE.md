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
    - **NO INTERNAL LOOPING — MECHANICAL GUARD (owner-flagged on Ep70: the verdict
      handshake clip was stretched to 40.7s and visibly looped ~7×; the owner saw
      "they shake hands for 35 seconds"). NEVER set a clip's display `dur` in
      `clips.json` longer than the clip's ACTUAL source length** — `VideoSprite`
      loops frames (`idx % seq.n`) whenever the window exceeds the source, which is
      the forbidden visible loop. RULE: for every clip, `dur ≤ realSourceSeconds`
      (probe with `ffprobe`); a couple of held/again-paused frames at the very end is
      fine, a re-loop is not. **A long scene (verdict, outro, history, drama) is
      covered by MULTIPLE DISTINCT clips back-to-back — never one clip held open.**
      If the verdict/outro needs 40s of backdrop, that is 4–5 distinct ~8–10s clips
      (different angles/players/crowd), not one looped clip. Pre-render check
      (MANDATORY): for each clip assert `dur` ≤ `ffprobe` duration of its source — if
      any clip exceeds it, GENERATE more distinct clips to fill the gap, never widen
      the window. Dimming a clip behind a panel does NOT exempt it from this rule.
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
15. **NO "UNDERDOG" WORDING — EVER (owner-mandated, hard rule, NO EXCEPTIONS):**
    the word "underdog"/"underdogs" (and overt slogans built on it, e.g. "the
    overlooked", "nobody believes in them") must NEVER appear in ANY script,
    narration (`narration.json`), on-screen text/title/thumbnail, scene file
    (`match-scenes.jsx`), upload-pack title/description/tags, or anywhere the
    audience can see or hear it. Anchor episodes on other emotions (rivalry,
    history, a ghost/legacy, heartbreak, redemption, craft, hunger, pride) and
    pick fresh framing per match. **ENFORCEMENT:** before rendering/delivering any
    episode, grep every text artifact for "underdog" (case-insensitive) — it must
    return ZERO. This applies to existing episodes too: strip it and re-render.
16. **MYSTERY CARD — DEEPER MYSTERY, STORY-WOVEN, FULLY DESIGNED (owner-mandated,
    from Ep63 on, hard rule):** the Mystery Supporter / Legend card must carry a
    STRONGER mystery, and its story must be UNDERLINED and woven through the WHOLE
    episode — never a tacked-on end card.
    - **TEASE EARLY → PAY OFF LATE:** plant a hidden clue/question about the Legend
      in the COLD OPEN (a silhouette, an object, a riddle line — "who really carries
      this nation?"), echo it at least once mid-episode, and resolve it at the reveal.
      A real "who/what is it?" arc runs across the full ~5 minutes.
    - **CONNECT TO THE SPINE:** the card's craft/legend must thematically rhyme with
      the episode's emotional spine AND the match story, and the reveal narration must
      STATE that connection out loud (e.g. Turkey "Ghosts of Empires" ↔ the Ebru
      master "where the ink is never dry"; the metaphor links the football story to
      the legend). Pick the Legend so this connection is strong, not generic.
    - **ANIMATE & DESIGN the reveal as a set-piece:** the REAL app-card artwork (the
      exact card unlocked in the app), a designed build (flip / parallax / glow /
      sparkle), the craft motion playing behind it, the Legend number, a one-line
      story stamp, and the sign-up CTA — richer and more cinematic each episode.
    - **ENFORCEMENT:** every episode's cold open must contain the Legend tease, and
      the reveal narration must contain the explicit spine↔legend connection line.
17. **COLLECTIBLE-CARD REVEAL — MAKE THEM ADDICTED TO COLLECT (owner-mandated, from
    Ep66 on, hard rule):** the Legend card reveal is the funnel's hook — it must look
    and feel like pulling a RARE HOLOGRAPHIC TRADING CARD, so viewers sign up to
    collect the whole set. The reveal (SceneMystery) must include ALL of:
    - **A living, animated card** — not a static image: a continuous slow 3D
      tilt/parallax PLUS a holographic SHINE-SWEEP bar that travels across the foil
      on a loop (the classic "tilt-the-holo" shimmer), a glow pulse and rarity
      sparkle. The card never sits still.
    - **An UNLOCK beat** — a "LEGEND UNLOCKED" stamp, the Legend number (e.g. "Nº 065"),
      and a rarity tier (e.g. ✦✦✦ / "ULTRA RARE").
    - **COLLECTION mechanics (the addiction driver)** — a strip/row of the recent
      Legend cards (copy the last ~5 `public/special-cards/legend-0NN-portrait.png`
      into the episode `assets/` and show them as a row) with the NEW one popping in
      and highlighted, a progress line ("LEGEND 065 OF 65 · COLLECT THEM ALL"), and a
      "complete your collection" call. The viewer must FEEL the set growing.
    - **The sign-up CTA** ties unlocking to worldcup26.world (one card per sign-up /
      per match), reinforcing "create your free account to claim this Legend."
    - Raise the bar each episode; the app `collection` page should also animate the
      cards (holo shimmer / hover tilt) so the in-app set feels just as collectible.
    - **ENFORCEMENT:** every reveal from Ep66 on must show the animated holo card, the
      UNLOCK beat, and the growing-collection strip with the progress/collect line.
18. **PREDICTION RESULT CARD — PREMIUM, NOT COMMON (owner-mandated, from Ep66 on,
    hard rule):** the full-time prediction card (the broadcast scoreline shown after
    the prediction, `PredictionCard`) must look PREMIUM and distinctly WorldCup26
    Legends — never a plain/generic scorebox. REDESIGN it to include:
    - **A branded, layered frame** — split team-colour side panels behind the score,
      a soft holographic/gloss sheen sweep, an ornate gold accent line, depth and
      shadow (a designed broadcast graphic, not a flat rectangle).
    - **Strong hierarchy** — crest-style circular flag badges with team-colour rings,
      big glowing scoreline with a gold divider, the minute/scorer beats as clean
      chips with goal/woodwork icons, a one-line story tagline.
    - **Identity** — the "WorldCup26 Legends" wordmark / gold seal, "OUR PREDICTION ·
      NOT PLAYED" ribbon (keeps the real-results-only rule #7 visible), the group
      label, and a subtle worldcup26.world watermark.
    - **Motion** — the card animates in (scale/settle) and carries a gentle sheen or
      pulse while on screen, matching the premium feel of the Legend card.
    - **ENFORCEMENT:** from Ep66 on, the prediction card must be the redesigned
      premium version; keep raising its quality each episode.

20. **15-SECOND MYSTIC INTRO ON EVERY EPISODE (owner-mandated, from Ep69 on, hard
    rule):** every episode opens with a ~15s mysterious, atmospheric intro that sets
    up the face-off between the TWO nations playing — mist, embers, a deep braam, the
    two flags/crests rising from shadow on either side, the nation names, a glowing
    "VS" igniting between them, the "WorldCup26 Legends" wordmark, then a whoosh into
    the cold open. Wordless (music + SFX only) — the mood carries it. This is a 15s
    PRE-ROLL **concatenated to the front of the finished 318s body** (keeps the
    carefully-timed main timeline untouched → final video ≈ **333s**). Implemented as
    `intro.html` + `SceneIntro` (in `intro-scenes.jsx`, reusing the kit + the episode's
    Flag components), rendered to `intro.mp4`, then `ffmpeg concat` intro + body. Apply
    to ALL stories from Ep69 on; keep raising its quality.

19. **NO LETTERBOX / FULL-FRAME 16:9 (owner-mandated, from Ep69 on, hard rule, NO
    EXCEPTIONS):** the video MUST fill the entire 1920×1080 frame. NEVER render the
    black cinematic top/bottom bars — on YouTube (already 16:9) they read as a broken
    "black gap" covering the video, top and bottom (owner flagged this on Ep68). The
    `Letterbox` component MUST be a no-op (`function Letterbox() { return null; }`) in
    `match-kit.jsx`; leaving the `<Letterbox/>` calls in the scenes is fine as long as
    it renders nothing. **VERIFY every episode:** the topmost and bottommost rows of a
    rendered frame are live video, not solid black — check a smoke frame before the
    full render. (Episodes ≤Ep68 shipped with the bars; do NOT re-render them, just
    keep every episode from Ep69 on full-frame.)

21. **NATION-UNIQUE MYSTIC STORY — RESEARCH EVERY NATION BEFORE EVERY SCRIPT
    (owner-mandated, from Ep71 on, hard rule, NO EXCEPTIONS):** usual narration of
    usual stories does NOT engage — it bores. Every episode must be a MOTIVATIONAL
    short film built on something SPECIFIC and UNIQUE to one (or both) of the two
    nations playing: real history, mythology, mysticism, folklore, a legend, a
    sacred symbol, a national obsession, an unbelievable-but-true fact. This is what
    makes the channel unlike anyone else's — it is the addiction engine.
    - **RESEARCH FIRST, ALWAYS.** Before writing a single narration line, WEB-SEARCH
      the two nations and find a genuinely special, VERIFIED angle (cite sources in
      the episode README). Never reuse a generic "they have a point to prove" arc.
      Each nation gets its OWN researched hook — dig into that nation specifically.
      (Examples of the bar: Panama's Guna *mola* — identity stitched in layers, never
      erased; a nation's mythic creature, founding legend, or world-first.)
    - **WEAVE IT INTO THE MYSTIC INTRO + COLD OPEN.** The 15s mystic intro (rule #20)
      and the cold open must plant this nation-specific mystery as a question
      ("what cannot be erased?"), then pay it off at the Legend reveal. The mystery
      is the spine of the whole script, not a footnote.
    - **LENGTH IS ALLOWED TO GROW for a better story.** If a richer, more cinematic
      mystic build needs a few more seconds (longer intro, a deeper cold-open beat),
      ADD them — engagement/retention beats a fixed runtime. Never cut the mystery
      short to hit a number.
    - **TONE = motivational, curiosity-driven, addictive** ("the secret nobody
      talks about…", "they should never have survived…") — a story you cannot stop
      watching, not a match preview. Builds on rule #9 (HOOK = MYSTERY + HISTORY) and
      feeds rule #16 (Mystery Card) + #17 (collectible Legend). Log what landed in
      `SERIES_PLAYBOOK.md` and raise the bar every episode.

22. **PHOTOREAL FOOTBALL ACTION — NOT CARTOON ANIMATION (owner-mandated, from Ep71
    on, hard rule):** the owner rejected the Pixar/cartoon look for players in motion
    ("stupid animation… use real football"). From Ep71 on, ALL player/match/action,
    duel, goal, crowd, and stadium clips must be generated in a **PHOTOREALISTIC,
    cinematic live-action style** — looks like a real broadcast match (realistic
    players, kits, skin, grass, floodlights), NOT a 3D animated cartoon.
    - **STILL 100% AI — MONETIZATION-SAFE (rule #5 is absolute):** NEVER use real
      match footage, broadcast clips, or any copyrighted video. "Real football" means
      photoreal AI generation, not real footage. Every frame is AI-made.
    - **HOW:** generate photoreal player STILLS first (e.g. `flux-pro/v1.1-ultra`,
      photoreal not stylized, correct real-player likeness + correct kit), then
      animate them with **image-to-video** (kling v2.1 master i2v) so motion stays
      sharp, on-model, and photoreal — the same i2v technique proven on Ep70 but with
      photoreal source images instead of Pixar stills. Pure text-to-video tends to
      garble kits/faces — anchor on a still. Build a photoreal still+clip DB under
      `content/images/<Team>/` (photoreal variants) and `content/videos/<Team>/` and
      REUSE it across episodes; only generate what's missing.
    - **REVIEW EVERY ACTION CLIP** before using: correct sport (soccer, no NFL/
      helmets), correct real-player likeness, clean kit, no melted faces/limbs,
      photoreal (not cartoon). Reject and regenerate anything that looks animated.
    - **The Legend collectible card (#17) may stay premium-stylized/illustrated** —
      this rule governs the MATCH ACTION, not the trading-card art.

23. **PLAYER NAME ↔ IMAGE SYNC (owner-mandated, from Ep72 on, hard rule):** when the
    narration names players, each player's showcase clip + on-screen NAME label must
    appear EXACTLY when Brian says that name. If the image on screen does not match the
    name being spoken, it reads as a BUG (owner flagged on Ep71). Do NOT guess the
    showcase windows: derive each player's `start` from the VO — find where that
    surname falls inside the player-intro line (split the line into per-player phrases
    and sum their rendered mp3 durations, or position by word offset), and set each
    `PlayerShowcase start/end` to that exact moment. VERIFY on a spot-render: the name
    shown == the name spoken, for every player.

24. **LEGEND FOOTER = REAL MINI-CARDS + ANIMATED PHONE "COLLECT IN THE APP"
    (owner-mandated, from Ep72 on, hard rule — this is the app-conversion engine):**
    the end of every episode must SELL the collection and drive app installs.
    - **REAL collection strip, never empty boxes.** The strip beside/below the Legend
      reveal shows the **previous 5 legends' actual card art** (`legend-(NNN-5 …
      NNN-1)-portrait.png`, copied into the episode `assets/`) as 5 mini-cards with the
      NEW Legend highlighted — a real, filling collection. (Ep71 shipped empty
      placeholder squares — NEVER do that again.)
    - **Animated phone collect.** In the app/CTA footer, animate a phone mockup: the
      Legend card flies/scales into the phone screen and snaps into a collection grid (a
      satisfying "collected!" beat), with the worldcup26.world CTA. Show viewers how
      collecting works so they download the app. ~6–10s, premium, full-frame.

25. **NO BLANK / DEAD-AIR FRAMES — every frame must carry imagery (owner-mandated, from
    Ep73 on, hard rule):** the owner flagged a near-black interstitial on Ep72 (the
    "NOT A DILUTION — AN INVITATION" text beat) — a frame that is mostly empty dark
    background with only floating text. NEVER ship a frame whose background is basically
    black with just text/scorebug on it.
    - Every second of the body must show EITHER a photoreal clip (DIMMED, ~0.4–0.6, when
      text/graphics overlay it) OR rich FULL-BLEED motion graphics (imagery + drifting
      particles + a real gradient that fills the frame) — never a flat near-black panel.
    - The text interstitials that bridge the ≤5s action clips (e.g. "84TH MINUTE",
      "TRADING BLOWS") must sit OVER a dimmed photoreal clip or a full-bleed atmospheric
      clip, not empty dark. To respect NO-LOOP, GENERATE enough distinct clips (incl. a
      few dedicated dimmed "texture/atmosphere" backdrop clips — gold dust, mist, crowd,
      stadium glow) so text always lands on imagery, never emptiness.
    - QA EVERY graphic/title/transition/interstitial frame: if the background is mostly
      black, add a dimmed clip behind it or richer full-frame motion graphics before the
      full render. (Builds on the Ep37 "never dead air — always a clip behind" principle.)

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

### Rule #26 — CHECK the asset libraries FIRST, then get sign-off before generating (HARD GATE)

**MANDATORY, every episode, before generating a single image or clip.** We do NOT
generate blindly for every new video — credits are finite (a from-scratch episode costs
~285–340) and we already own a large catalogue of per-nation art. The order is fixed:

1. **SEARCH BOTH LIBRARIES FIRST (mandatory, non-skippable).**
   - **Higgsfield** via MCP: `show_generations` (image+video history, each labelled by its
     prompt — the richest source), `show_medias` (uploaded reference media),
     `show_reference_elements` (saved Elements). Also consult prior episodes'
     `assets/_vid_manifest.json` / `_still_ids.json` — they index which job IDs map to which clip.
   - **fal.ai** library: check our fal.ai stored/generated assets too. Both libraries must be
     reviewed before concluding anything is "missing".
   - **Same-team reuse:** if a team/nation already appeared in a prior episode, its player
     stills, motion clips, crowd, motif and texture art likely already exist — REUSE them.
     A repeat nation should reuse most of its assets, not regenerate them.

2. **BUILD A REUSE-vs-MISSING PLAN and GET AGREEMENT before generating.** List exactly which
   assets are being reused (from which library/job IDs) and which are genuinely missing and
   would need generating, with a rough credit estimate. **Only AFTER we agree to generate the
   missing artefacts** do you call any `generate_*` tool. Never fan out a full new asset set
   on autopilot.

3. **Reuse modes, in order of preference:**
   - **Reuse a FINISHED clip → 0 credits.** Download its existing CloudFront `rawUrl` straight
     into the new episode's `assets/clips/<name>.mp4`. No generation at all.
   - **Reuse an existing STILL as the i2v seed → ~7.5 credits** (skip the still, pay only the
     5s animation): pass the still's `job_id` as `medias[].value` role `start_image`.

Genuinely-missing-only generation = a brand-new player not in either library, the nation-unique
Legend card (#21), and the match-specific drama beats (the exact goals/saves in the predicted
scoreline). For a repeat matchup or repeat nation this typically cuts an episode from ~300
credits to ~30–60. Log roughly how many credits were saved by reuse in the episode README.

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
Legend card voice must match the movie canon: **Brian (ElevenLabs)**. The card
"Listen story" action uses the server-only `/api/legend-cards/voice` route with
`ELEVENLABS_API_KEY`, `ELEVENLABS_BRIAN_VOICE_ID`, and `ELEVENLABS_MODEL`. Never
put ElevenLabs keys in client code, never use random browser voices, and only use
browser speech as a last-resort fallback when the installed English voice is
explicitly named Brian.

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
- **MANDATORY (owner rule): EVERY time you finish a video, add that episode's
  Legend special card into the collection in the SAME pass — generate both
  orientations, save to `public/special-cards/`, update `cards.json` AND the
  `/collection` page's `CARDS` array, then commit + push.** A finished episode is
  NOT done until its Legend card is in the collection. No exceptions, every episode.

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
