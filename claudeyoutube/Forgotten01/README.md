# FORGOTTEN — Vol. 1 · Ten World Cup Legends

Evergreen long-form anthology (16:9, 12:23) assembled from the ten finished
"Did You Know?" Shorts in `content/youtube/did-you-know/`.

## Why this exists

The match-preview series is fixture-driven and the 2026 tournament ended on
19 July; the next one is 2030. This format has no fixture dependency, so it keeps
earning through the gap. It also attacks the right YPP door: **3,000 watch hours**
is reachable for a 1,327-sub channel in a way **3,000,000 Shorts views** is not,
so long-form is the destination and the Shorts are the funnel.

## The idea — the cards come alive

Every source clip is 716x1284 (ratio 0.5576) and every legend card is 768x1376
(0.5581). They are the same shape. So the collectible card the app sells **is**
the frame the film plays inside: a chapter opens on the real card, the printed
artwork dissolves, and the legend starts moving in it (`living-card.jsx`).

That also makes the identity rule self-enforcing. Both the card art and the clips
were authored for that specific legend, so this film structurally cannot show the
wrong person — the failure that cost two rebuilds of the milestone documentary.

## Shape

| | |
|---|---|
| Cold open | 58s — music + card walls + typography, no narration |
| Chapters | 10 × (6s plate + Brian VO + 9s close), interlude at the midpoint |
| Close | 82s — card wall, phone showing worldcup26.world, `PICK 3 · FREE` |
| Total | **12:23** · 54 clips + 50 images, each used exactly once |

Brian VO is the existing per-Short narration, trimmed to **story only** — each
Short ends with its own app CTA, and ten of those back to back would grate, so the
film lands one CTA at the end instead. `find-cta.mjs` locates that boundary via
silence detection; the cut is verified per legend in `build/vo-cuts.json`.

## Build

```bash
pnpm install && node node_modules/ffmpeg-static/install.js   # ffmpeg binary
node find-cta.mjs        # locate each Short's CTA boundary
node build-manifest.mjs  # story-only VO + stage clips/images/cards
node build-timeline.mjs  # -> film.json (single source of truth)
node preflight.mjs       # GATE: coverage, no-repeat, refs, VO slots, rule #10, monetization
PORT=8131 node serve.mjs &
URL=http://127.0.0.1:8131/forgotten.html FPS=30 DURATION=743.06 OUT=frames \
  CHROMIUM_PATH=/usr/bin/google-chrome node render.mjs
node mux-audio.mjs       # audio master
```

Real Chrome is required — Chromium cannot decode the h264 source clips. Encode the
frames with `-vf crop=1920:1080:0:0` (they render 1920x1081; libx264 needs even
dimensions).

## Not in Vol. 1

Castro, Pak, Patenaude and Ilunga have finished Shorts but their source
(`assets/audio`, `clips`, `images`) was never committed — only the MP4 and the
script survive. Regenerating their Brian VO needs `ELEVENLABS_API_KEY`, which is
not in this container. They are Vol. 2.

## Upload

Made-for-kids **No** · AI disclosure **Yes** · music credit required:
Kevin MacLeod (incompetech.com), CC-BY 4.0 — *Dreams Become Real, Ascending the
Vale, Majestic Hills, Fanfare for Space*.
