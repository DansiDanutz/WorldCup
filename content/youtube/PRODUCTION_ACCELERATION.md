# WorldCup26 Legends — Production Acceleration (2026-06-14)

> **Goal:** every episode is POSTED (scheduled Premiere) **24–48h before its
> match kicks off — target the full 48h** — while keeping the **chronological
> methodology** (episodes follow the fixture order, never skipped or reordered).
> Today we post only a few hours ahead. This file is how we buy that lead time.

## Why we're posting late (root cause)

We produce **reactively, one episode at a time**, finishing right before kickoff.
Three things make that slow:
1. **No buffer** — when an episode slips, there's nothing finished behind it.
2. **The slow pole isn't batched** — Higgsfield asset generation (player
   animations, crowd clips) is queue-based and is the longest step; generating
   per-episode, last-minute, sets the whole schedule.
3. **The build is manual & serial** — serve → render → voice → mux run by hand,
   one after another, babysat.

The fixture list is **known weeks ahead**, so none of this needs to be reactive.

## The fix #1 — a ROLLING BUFFER (chronological)

**Always keep the next 2 episodes fully finished and scheduled.** When you
publish episode N (its match ~48h out), N+1 and N+2 are already rendered and
queued as Premieres. A single slow episode then never makes you post late — the
buffer absorbs it. Order is preserved: you're just working *ahead* in the same
chronological line.

- **Catch-up sprint (one time):** build 2 episodes back-to-back to get ahead of
  the live fixture front. After that you only need to stay even.
- **Steady state:** finish 1 new episode per matchday slot you cover, the day its
  predecessor goes live — buffer stays at 2.

## The fix #2 — work BACKWARDS from kickoff (the timebox)

Let **K** = real kickoff. Hard gate: **POSTED by K−48h.** Plan every stage back
from there:

| Deadline | Stage |
|---|---|
| K − 72h | Script + narration.json locked (Story already in `content/Stories/`) |
| K − 66h | All Higgsfield assets generated & fetched |
| K − 60h | Frames rendered **and** Brian VO generated (run in parallel) |
| K − 56h | Mux complete (final MP4) |
| K − 54h | Thumbnail + QA (motion/audio/soccer-only/canon checks) |
| **K − 48h** | **Premiere scheduled & first Short posted** |

So each episode **starts ~3 days before its kickoff**. With the 2-episode buffer
you're effectively working **5–7 days ahead** of the live match — comfortable.

## The fix #3 — make each episode FASTER

1. **Templatized skeleton (already true):** every episode is the Ep2 template
   (`match-kit.jsx` / `match-scenes.jsx` / 300s timeline). A new episode is a
   **content swap** (story text, player images, `clips.json`, `narration.json`,
   `thumbnail.jpg`) — never a rebuild of structure.
2. **Batch the slow pole up front:** generate the Higgsfield assets for the
   **next 3–4 chronological episodes in one sitting**, so the generation queue
   runs while you script/edit. Never let asset-gen sit on the critical path.
3. **Reuse the asset library:** repeat nations/players recur (Brazil = Ep5 & Ep7,
   Haiti = Ep7 & Ep10; stars like Neymar/Messi reappear). Pull existing clips
   from `content/videos/` + previous episode folders instead of regenerating
   (also a `SERIES_PLAYBOOK.md` DO).
4. **Parallelize render + VO:** frame render (CPU) and ElevenLabs VO (network)
   are independent — run them at the same time. `build-episode.sh` does this.
5. **One-command unattended build:** `marketing/match-videos/build-episode.sh
   <dir>` chains install → fetch-assets → serve → (render ‖ voice) → mux so an
   episode builds **overnight without babysitting**. Batch several:
   `for ep in match14-... match15-...; do ./build-episode.sh $ep; done`.
6. **Pre-write scripts in batch:** Stories for *every* matchup already exist in
   `content/Stories/` — draft the next several narration scripts in one pass so
   production is never waiting on writing.

## The fix #4 — the LOCKED script prompt (research → script, fast + factual)

Adapted from the Romayroh faceless-automation pipeline (`ROMAYROH_KNOWLEDGE.md`):
feed the model REAL sources, then generate with a fixed prompt. This makes the
"pre-write scripts in batch" step (#6 above) repeatable and on-canon.

**Step 1 — Research (the hook is the job, CLAUDE.md #9):** web-search the fixture
for a VERIFIED "Did you know?" secret (nation/player/event). Save 2–3 credible
sources + the key facts into the episode README and `SCHEDULE.md` hook log.

**Step 2 — Generate with this exact prompt** (paste sources after it):

```
You are writing the Brian (ElevenLabs) narration for WorldCup26 Legends,
Episode N: <TEAM A> vs <TEAM B>, <group>, real kickoff <date/time>.
Use ONLY the VERIFIED facts I paste below — never invent history; if unsure, omit.

Structure (≈300s, ~30 short lines, each its own line of audio — never tempo-stretch):
1) COLD OPEN HOOK in the FIRST 7 SECONDS — front-load the curiosity gap / shock in
   line 1; do NOT open with scene-setting or a logo.
2) One-line recap of the PREVIOUS episode's prediction, labeled as OUR PREDICTION.
3) "Welcome back to WorldCup twenty-six Legends, episode N. <A> vs <B>."
4) Tease the Mystery Supporter / Legend 0NN (pay it off at the end).
5) The true HISTORY chapter (the verified hook) — captivating, curiosity-driven.
6) The two squads / the duel.
7) The match drama → OUR PREDICTION scoreline, stated EXPLICITLY as "our prediction
   / our story", NEVER as a real result.
8) Mystery Supporter payoff.
9) CTA: play free at worldcup26.world — pick 3 nations, live prize pool, underdogs
   pay triple (never a fixed amount). Tease Episode N+1.

HARD RULES: soccer/football ONLY (round-neck shirts, a pitch with goals; NO
helmets/pads/American football). No on-screen subtitle/caption sentences — Brian's
voice carries it. Spell numbers/dates as words for clean TTS. Keep every line short.
Output JSON: { "voice":"Brian", "lines":[ { "at": <seconds>, "text": "..." }, ... ] }.
```

**Step 3 — QA the output** against the per-episode checklist + hard rules, then
drop it in as `narration.json` and run `build-episode.sh` (render ‖ VO).

## Cadence vs fixture density (still chronological)

The group stage runs several matches a day — we can't cover all 104. **Pick the
big-audience chronological subset** (the star nations, per
`PREMIERE_CALENDAR.md` + `MONETIZATION_STATUS.md`) and stay in order *within that
subset*. Quality + timing + star power beats volume every time.

## Definition of done (the 48h gate)

An episode is "done" only when, **≥48h before kickoff**, ALL of these are true:
- [ ] Final MP4 rendered, QA-passed (motion, audio −14 LUFS, soccer-only, canon)
- [ ] Thumbnail + hook-first title + description + tags + pinned comment ready
- [ ] Premiere scheduled on `@DansLab-Kimi`, "No, not made for kids"
- [ ] 3 Shorts cut and scheduled around it
- [ ] First-hour push assets staged (WhatsApp/Telegram/X/community)

If any item can't make K−48h, **flag it now** so the schedule flexes — never
quietly ship a few hours before kickoff again.
