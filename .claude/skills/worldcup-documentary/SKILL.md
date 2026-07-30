---
name: worldcup-documentary
description: >-
  Produce or rebuild a long-form WorldCup26 documentary / channel-milestone /
  app-advertising video to the v4 GOLD STANDARD (the 24:30 "What Football Left
  Behind" cut). Use whenever building, rendering, re-rendering, fixing, or
  packaging any long-form non-match video, and whenever a video must show a REAL
  NAMED PERSON. Covers the identity-honesty law, the legend-card visual system,
  the procedural motion-graphics kit, sound-design density, the segmented
  crash-proof render, the preflight gates, and split-part delivery.
  Gold reference: claudeyoutube/WorldCup26 (md5 3301e9b1c787bd8d8a1e7f9768cea96c).
---

# WorldCup26 long-form documentary (v4 gold standard)

Reverse-engineered from the delivered 24:30 milestone documentary in
`claudeyoutube/WorldCup26/`. Read `CLAUDE.md` hard rules #0 and #6–#11 first;
this skill is the HOW, and it exists because **v1 and v2 were both rejected**.

**This is the floor, not the ceiling. Never ship below it.** Every rule below was
paid for by a rejected cut.

## 0. LAW #1 — IDENTITY HONESTY (the rule that got two cuts rejected)

> Never put a face on screen and claim it is a specific real person unless the
> asset genuinely depicts that person.

Owner's words: *"you can say Roger Milla and show another player"* … *"messi is
not messi, rodri is a black boy — this is ridiculous."*

**Root cause, found by auditing `assets/`:** the filenames lie. Nearly every
"named" asset was a symlink to a completely different player:

```
short-castro.mp4  -> Federico-Valverde.mp4      messi-medal.mp4 -> Emiliano-Martinez.mp4
pele-1958.mp4     -> Bruno-Guimaraes.mp4        milla-dance.mp4 -> Sadio-Mane.mp4
cruyff-1974.mp4   -> FrenkieDeJong.mp4          puskas-hungary.mp4 -> BernardoSilva.mp4
```

Of ~35 named assets exactly ONE pointed at the player it named.

**Mandatory audit before using any "named" asset:**

```bash
for f in assets/*.mp4; do t=$(readlink "$f"); [ -n "$t" ] && echo "$(basename $f) -> $(basename $t)"; done
```

If the target does not match the name, the asset is unusable for identity. A
generic Pixar character in a national shirt is ALSO not a likeness — a Spain #16
shirt does not make the character Rodri.

**The safe substitutes, in order of preference:**
1. **The app's own legend card for that person** (`public/legend-cards/`) — this
   is our art *of them*, so it is honest, and it advertises the product.
2. **`NamePlate`** — name + stat + meta as typography. Honest: claims nothing
   visually.
3. **Abstract/procedural** — `BallToNet`, `ClockTick`, `StadiumBowl`. No people.

**Never** substitute a different human being. When in doubt, show no face.

## 1. LAW #2 — the legend cards ARE the product

Owner: *"you have more than 100 legendary cards… advertise them, show them inside
the video — for that is the app all about"* and *"you need to end with a mobile
with the website on it."*

- `CardShowcase` — hero reveal, card + name + meta, shine sweep. Use for every
  named legend we have a card for.
- `CardWall` — parallax grid of real cards, label `100+ LEGEND CARDS` /
  `COLLECT THE LEGENDS`. At least one per third of the runtime.
- `CardDrift` — cards drifting at ~0.42 opacity **behind every typography beat**,
  so no frame is ever a flat text slate.
- `PhoneMock` — the ending. Phone showing `worldcup26.world` with a scrolling
  card/news feed, a `PICK 3 · FREE` button, and `FREE · JUST FOR FUN · NO PRIZES`.

**Card sources must be real cards.** Only `public/legend-cards/` art. Do **not**
mix in `yt-*.jpg` YouTube thumbnails — they carry baked-in headline sentences
("HELD TWO EMPTY CASES") that render as on-screen sentence text and break rule
#10. Populate via `node sync-cards.mjs` (`--check` gates the render).

## 2. LAW #3 — no loops, no black, no dead air

Owner: *"you can't let a 5 sec animated image to loop 4 times. it's bad. it's
amateur. 1 time that's all"* and *"you almost get asleep on the video."*

- **Every clip plays at most ONCE.** No `src=` value may appear twice.
- **Zero uncovered seconds.** v1 shipped 648s of black. Verify programmatically.
- **No flat text slates.** Every typography beat needs motion behind it.
- **No dead stretches.** Audit per 3-minute block; any block whose only card
  presence is background `drift` is a dead block — promote filler `pitch` beats
  into `card` / `cardwall` moments.

## 3. LAW #4 — sound carries the energy

Owner: *"made the video full of actions sound effects."*

Target density ≈ **1 hit per 6.5 s** (224 hits across 1470 s). Every card entry
gets a `whoosh`; every name/number landing gets a `stamp`; chapter turns and wall
reveals get a `braam`. Music: Kevin MacLeod / incompetech CC-BY 4.0 only, cued to
the emotional arc, side-chain ducked under Brian's VO. Master to `loudnorm
I=-14:TP=-1.2:LRA=11`.

## 4. Preflight gates — run ALL of these before every render

```bash
# every second covered, no black
node -e "…build cov[] from graphics[]+clips[]; assert no zero-runs…"
# no clip or card src used twice
node -e "…assert no duplicate src across clips[] and within each srcs[]…"
# no on-screen sentence text (rule #10)
grep -nE "line=|note=" match-scenes.jsx     # ScoreTicker note= must be a ≤4-word label
# no gambling/betting wording (rule #0)
grep -inE "\b(odds|bet|betting|stake|wager|bookmaker|jackpot|prize money)\b" clips.json narration.json
# every asset resolves
node -e "…assert every src/srcs/sfx/music path exists…"
# cards populated
node sync-cards.mjs --check
```

A render that starts with a red gate is a process failure. Fix first.

## 5. Render — segmented, crash-proof, absolute bounds

`render.mjs` env. **`START` and `END` are ABSOLUTE positions on the timeline** —
`END` is a timestamp, not a segment length; `START` is a frame index, not an
offset. Passing a length describes an empty range; the script throws rather than
writing zero frames and exiting 0.

```bash
PORT=8126 node serve.mjs &                       # must be up first
FPS=30 DURATION=1470 START=0     END=735  OUT=frames   QUALITY=85 CHROMIUM_PATH=/opt/google/chrome/chrome node render.mjs
FPS=30 DURATION=1470 START=22050 END=1470 OUT=frames_b QUALITY=85 CHROMIUM_PATH=/opt/google/chrome/chrome node render.mjs
```

- **Chromium can't decode h264** → use real Chrome: `CHROMIUM_PATH=/opt/google/chrome/chrome`.
- **Frames are 1920x1081** → the encode MUST carry `-vf crop=1920:1080:0:0`.
- **DO NOT run two renders concurrently.** It halves wall-clock and then OOMs at
  ~90% (two Chromes + ffmpeg on 15 GB). Run segments **sequentially**.
- **Resume, never restart.** Find the first missing index per dir and resume from
  it. Verify the resume timestamps match the originals so there is no seam:
  `t = min(DURATION - 1e-3, i/FPS)`.
- Smoke-render spot frames first: `SHOTS="130,498,800,1405" OUT=shots`.

## 6. Assemble + QA

```bash
ffmpeg -y -framerate 30 -start_number 0     -i frames/f_%05d.jpg   -vf crop=1920:1080:0:0 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p video_a.mp4
ffmpeg -y -framerate 30 -start_number 22050 -i frames_b/f_%05d.jpg -vf crop=1920:1080:0:0 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p video_b.mp4
rm -rf frames frames_b                          # disk is tight
printf "file 'video_a.mp4'\nfile 'video_b.mp4'\n" > concat.txt
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy video_full.mp4
node mux-from-video.mjs                         # -c:v copy + full audio graph
```

Build `audio_master.m4a` in parallel with the frames via `AUDIO_ONLY=1 node mux.mjs`.
`mux.mjs` must skip clips with no audio stream or the filter graph fails.

**QA gate — never claim done without it:** duration exact, 1920x1080 h264 + AAC
stereo, spot frames at the key card beats each >100 KB and non-black, audio mean
≈ −14 dB, and **actually Read the card-wall and phone-endcard frames** to confirm
real cards and the correct CTA.

## 7. Delivery

Chat caps at 30 MB and external hosts are blocked. Split and push to a delivery
branch:

```bash
split -b 25m -d --additional-suffix=.part <FILE> delivery/WorldCup26_Doc_
md5sum <FILE> > delivery/CHECKSUM.txt
```

**Never `git checkout` the delivery branch** — it clobbers the working tree (this
has bitten us). Use plumbing: seed a temp `GIT_INDEX_FILE` from the remote branch,
`hash-object -w` each part, `update-index --cacheinfo`, `write-tree`,
`commit-tree`, `update-ref`, then `push --force-with-lease`. Run it in the
background; ~460 MB exceeds the 2-minute foreground limit.

Tell the user to `rm -rf` the old folder first — parts reuse filenames and a stale
folder corrupts the join. Always give them the md5 to verify.

## 8. Packaging (see `references/packaging.md`)

Searchable promise first, myth second. Thumbnail: one dominant subject, ≤4 words,
clear tension, no clutter, **no FIFA marks/emblem/trophy art**. At upload:
made-for-kids **No**, AI disclosure **Yes**, Kevin MacLeod CC-BY credit, and the
non-affiliation line.

## 9. Rejection log — do not repeat

| Cut | Why it was rejected |
|---|---|
| v1 | 648 s of black; clips looped 4× each; flat text slates; weak intro |
| v2 | Wrong player shown for every named person; stalled on stills; too quiet |
| v3 (internal) | Trophy graphic read as a lamp; phone mock clipped; CTA overlap |
| v4 | **Shipped.** Zero player footage, cards drive it, 224 sfx, phone endcard |
