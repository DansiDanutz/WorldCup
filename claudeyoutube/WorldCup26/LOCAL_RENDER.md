# Local render guide — WorldCup26.world documentary (~24 min)

The script, timeline and engine are complete and CI-green. To get a postable MP4 you render
**locally** (where the DansLab asset library + ElevenLabs/HyperFrames keys live). Do these in order.

## 0. Get the folder
```
git fetch origin claude/video-continuation-next-subject-nxm76j
git checkout claude/video-continuation-next-subject-nxm76j
cd claudeyoutube/WorldCup26
npm install            # playwright + ffmpeg-static
npx playwright install chromium   # if not already present
```

## 1. Drop in the media (folders are intentionally empty in git)

Follow **library-first** (CLAUDE.md rule #11): search `content/videos/` and prior episode
`assets/` first; only generate the true gaps via Higgsfield. Filenames must match exactly.

### `assets/` — 35 clips (each used once, no-repeat)
```
app-hero.mp4  brazil-1970-anim.mp4  celebration-champions.mp4  champions-montage.mp4
controversy-abstract.mp4  crowd-packed-wide.mp4  crowd-roar-fill.mp4  crowd-wide.mp4
cruyff-1974.mp4  fans-diverse-joy.mp4  final-drama.mp4  legend-cards-montage.mp4
messi-fans-love.mp4  messi-medal.mp4  milla-corner.mp4  milla-dance.mp4  pele-1958.mp4
pele-young.mp4  player-mbappe.mp4  player-messi-goal.mp4  player-messi-hero.mp4
player-messi-run.mp4  player-messi-walk.mp4  puskas-hungary.mp4  short-carbajal.mp4
short-castro.mp4  short-escobar.mp4  spain-tikitaka.mp4  stadium-final-night.mp4
stadium-lights.mp4  studio-craft.mp4  sunrise-pitch.mp4  torres-winner.mp4
tournament-recap.mp4  vintage-teams.mp4
```
(Reusable from the library: crowds, stadiums, Messi clips from Ep6, the Castro/Escobar/Carbajal
shorts, Milla/Pelé/Cruyff/Puskás if already generated. Generate only what's genuinely missing.)

### `hf/` — 23 HyperFrames number/record cards (HTML→MP4, brand-true, ≤4-word labels)
```
card-title.mp4  card-14000.mp4  card-14k-climbing.mp4  card-pick3.mp4  card-legend… (see clips.json)
card-money-growth.mp4  card-50m.mp4  card-655m.mp4  card-355m-clubs.mp4  card-placings.mp4
card-brazil-5.mp4  card-klose-16.mp4  card-308-goals.mp4  card-fastest-goal.mp4
card-scorers-2226.mp4  card-48-104-39.mp4  card-golden-boot.mp4  card-golden-silver.mp4
card-spain-double.mp4  card-spain-1-goal.mp4  card-red-card.mp4  card-usa-belgium-41.mp4
card-app-cta.mp4  card-subscribe-end.mp4
```
Build these with the HyperFrames template (green `#106b4f` + gold, Inter, trophy mark) — the
exact number/label for each is in `clips.json`/`narration.json`. **No on-screen sentences** — number + ≤4-word label only.

### `music/` — 9 cleared cues (Kevin MacLeod / incompetech, CC-BY 4.0 — credit in description)
```
cue-cinematic-open.mp3  cue-warm.mp3  cue-uplift.mp3  cue-drive.mp3  cue-tension.mp3
cue-noble.mp3  cue-reverent.mp3  cue-triumph.mp3  cue-epic.mp3
```
### `sfx/` — 5 hits (reuse from any episode's `sfx/`)
```
braam.mp3  heartbeat.mp3  pop.mp3  stamp.mp3  whoosh.mp3
```

## 2. Brian VO (153 lines → `audio/line_NN.mp3`)
```
export ELEVENLABS_API_KEY=sk-...           # your key
export VOICE_NAME=Brian                     # or VOICE_ID=nPczCjzI2devNBz1zQrb
npm run voice
```

## 3. Render → assemble
```
npm run serve      # terminal A — range server on :8126
npm run render     # terminal B — Playwright → frames/ (1470s @ 30fps ≈ 44,100 frames; long)
npm run mux        # muxes VO + music + sfx, encodes → WorldCup26_Milestone_FIFA_Records.mp4
```
Output: **`WorldCup26_Milestone_FIFA_Records.mp4`** (~24 min, 1920×1080).

> Tip: to preview timing before all media is final, `NO_VO=1 npm run mux` makes a music+FX-only cut.

## 4. Before you upload (monetization-safety — CLAUDE.md rule #0)
- Made for kids = **No** · AI/altered-content disclosure = **Yes** · music credited (Kevin MacLeod, CC-BY 4.0)
- No on-screen sentences (labels/number cards only) · no-repeat clips · soccer-only · no logos/real footage
- Results/figures are real & source-cited (README) · app CTA "free · just for fun · no prizes"

## 5. YouTube package
- **Title:** `World Cup 2026: The Records, The Money & What It Leaves Behind | WorldCup26`
- **Description:** what we built at worldcup26.world, thank-you to 14,000 subscribers, then FIFA
  records — prize money, all-time records, greatest winners — and the moments 2026 will be
  remembered for (Spain's win, Messi's farewell, the Trump red-card controversy). Sources in README.
  Music: Kevin MacLeod (incompetech.com), CC-BY 4.0. Free to play at worldcup26.world — just for fun, no prizes.
- **Pinned comment:** the worldcup26.world free pick-3 CTA + "which WC2026 moment will you remember?"
- Upload as a scheduled **Premiere** if you want the live first-hour push.
