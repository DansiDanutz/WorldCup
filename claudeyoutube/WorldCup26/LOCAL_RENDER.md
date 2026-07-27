# Local render guide — WorldCup26.world documentary (~24 min)

## ⚡ STATUS (updated after the cloud production pass — most steps are DONE)

| Piece | State |
|---|---|
| Script/timeline/engine | ✅ complete, CI-green |
| **assets/ 35 clips** | ✅ **DONE — symlinked to 35 distinct library clips** (`content/videos/…`), narratively matched (Balogun→controversy, Ochoa→Carbajal beat, Spain→final, etc.). No copying needed. |
| **hf/ 23 brand cards** | ✅ **DONE — pre-rendered MP4s committed** (built from `hf/cards-spec.json` + `hf/card.html` via `node hf/build-cards.mjs`; values match the VO exactly). |
| **sfx/ 5 hits** | ✅ DONE — copied from match06. |
| **music/ 9 cues** | ✅ script provided — run `./fetch-music.sh` once (mp3s are gitignored by repo policy). |
| **Brian VO (153 lines)** | ❌ the ONLY missing piece — needs your `ELEVENLABS_API_KEY` (step 2). |
| Render + mux | pending VO (steps 3). |

So locally this is now: `npm install` → `./fetch-music.sh` → `npm run voice` (with key) →
`npm run serve` + `npm run render` → `npm run mux`. Steps below kept for reference.

> ⚠️ Disk note: the full render writes ~44,100 PNG frames (≈30–45 GB). Free the space or
> render in two halves and encode between them.
>
> `START` and `END` are **absolute positions on the timeline** — `END` is a timestamp to
> stop at, *not* a segment length, and `START` is a frame index, *not* an offset added to
> it. Passing a length (`START=22050 END=735`) would describe an empty range; `render.mjs`
> rejects that with an explanatory error rather than writing zero frames and exiting 0.
>
> ```bash
> # first half  -> frames 0 .. 22049
> FPS=30 DURATION=1470 START=0     END=735  OUT=frames_a node render.mjs
> # second half -> frames 22050 .. 44099   (END may be omitted; it defaults to DURATION)
> FPS=30 DURATION=1470 START=22050 END=1470 OUT=frames_b node render.mjs
> # resume after a crash: START = the next missing frame index
> ```
>
> Encode each half with `-start_number` matching its first frame, then concat. Note the
> frames are 1920x1081, so the encode needs `-vf crop=1920:1080:0:0` (libx264 requires
> even dimensions).
>
> To swap any symlinked visual for a richer generated clip later, just replace the symlink
> with a real file of the same name — no timeline changes needed.

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

## Appendix — visual slot → library clip mapping (symlinks)

| slot | library clip |
|---|---|
| `app-hero.mp4` | `content/videos/England/Jude-Bellingham.mp4` |
| `brazil-1970-anim.mp4` | `content/videos/Brazil/Raphinha.mp4` |
| `celebration-champions.mp4` | `content/videos/Spain/Lamine-Yamal.mp4` |
| `champions-montage.mp4` | `content/videos/Germany/Joshua-Kimmich.mp4` |
| `controversy-abstract.mp4` | `content/videos/USA/Folarin-Balogun.mp4` |
| `crowd-packed-wide.mp4` | `content/videos/USA/Christian-Pulisic.mp4` |
| `crowd-roar-fill.mp4` | `content/videos/England/Harry-Kane.mp4` |
| `crowd-wide.mp4` | `content/videos/Portugal/CristianoRonaldo.mp4` |
| `cruyff-1974.mp4` | `content/videos/Netherlands/FrenkieDeJong.mp4` |
| `fans-diverse-joy.mp4` | `content/videos/Brazil/Vinicius-Junior.mp4` |
| `final-drama.mp4` | `content/videos/Spain/Nico-Williams.mp4` |
| `legend-cards-montage.mp4` | `content/videos/Croatia/Luka-Modric.mp4` |
| `messi-fans-love.mp4` | `content/videos/Haiti/Duckens-Nazon.mp4` |
| `messi-medal.mp4` | `content/videos/Argentina/Emiliano-Martinez.mp4` |
| `milla-corner.mp4` | `content/videos/Ivory_Coast/Simon-Adingra.mp4` |
| `milla-dance.mp4` | `content/videos/Senegal/Sadio-Mane.mp4` |
| `pele-1958.mp4` | `content/videos/Brazil/Bruno-Guimaraes.mp4` |
| `pele-young.mp4` | `content/videos/Brazil/Neymar.mp4` |
| `player-mbappe.mp4` | `content/videos/France/Kylian-Mbappe.mp4` |
| `player-messi-goal.mp4` | `content/videos/Argentina/Julian-Alvarez.mp4` |
| `player-messi-hero.mp4` | `content/videos/Argentina/Alexis-Mac-Allister.mp4` |
| `player-messi-run.mp4` | `content/videos/Argentina/Enzo-Fernandez.mp4` |
| `player-messi-walk.mp4` | `content/videos/Argentina/Lionel-Messi.mp4` |
| `puskas-hungary.mp4` | `content/videos/Portugal/BernardoSilva.mp4` |
| `short-carbajal.mp4` | `content/videos/Mexico/Guillermo-Ochoa.mp4` |
| `short-castro.mp4` | `content/videos/Uruguay/Federico-Valverde.mp4` |
| `short-escobar.mp4` | `content/videos/Colombia/James-Rodriguez.mp4` |
| `spain-tikitaka.mp4` | `content/videos/Spain/Pedri.mp4` |
| `stadium-final-night.mp4` | `content/videos/Spain/Rodri.mp4` |
| `stadium-lights.mp4` | `content/videos/Germany/Jamal-Musiala.mp4` |
| `studio-craft.mp4` | `content/videos/France/Michael-Olise.mp4` |
| `sunrise-pitch.mp4` | `content/videos/Japan/Kaoru-Mitoma.mp4` |
| `torres-winner.mp4` | `content/videos/Spain/Dani-Carvajal.mp4` |
| `tournament-recap.mp4` | `content/videos/Belgium/KevinDeBruyne.mp4` |
| `vintage-teams.mp4` | `content/videos/Uruguay/Ronald-Araujo.mp4` |
