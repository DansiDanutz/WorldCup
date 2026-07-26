# claudeyoutube/WorldCup26/ — folder structure

This folder is **structured to mirror a DansLab match-video episode** (the canonical
`marketing/match-videos/matchNN-*` projects, gold standard = `match06-argentina-vs-algeria`).
Same engine, same file roles — only the *content* differs, because this is a special
**channel-milestone + FIFA-records documentary** (20–25 min) rather than a 5-min match episode.

## How a DansLab episode is structured (the template I copied)

| File / dir | Role |
|---|---|
| `package.json` | scripts: `serve` (Playwright range server) → `render` (frames) → `voice` (ElevenLabs Brian) → `mux` (ffmpeg 2-stage) ; deps: playwright + ffmpeg-static |
| `match.html` | React/Babel host page the renderer screenshots frame-by-frame |
| `match-kit.jsx` | brand kit: colours, flags, score codes, shared UI atoms (title cards, labels, score bug, CTA) |
| `animations.jsx` | reusable animation/transition primitives (Ken-Burns is BANNED — real clip motion, speed-ramps, film grain, chapter bar) |
| `match-scenes.jsx` | **the timeline** — the ordered scenes/acts mapped to narration timestamps (this is the per-video custom file) |
| `narration.json` | Brian VO: `comment` (canon + verified-facts notes) + `voice` + `lines[]` (`at` seconds, `text`) |
| `clips.json` | `clips[]` (src, at, dur, vol, rate — **no-repeat**), `music.cues[]` (Kevin MacLeod CC-BY), `sfx.hits[]` |
| `gen_audio.mjs` | generates one `audio/line_NN.mp3` per narration line via ElevenLabs Brian |
| `render.mjs` / `serve.mjs` / `mux.mjs` | the render + assemble pipeline |
| `assets/` | the VIDEO clips (library-first; Higgsfield only for special gaps) |
| `audio/` | generated Brian VO mp3s | `music/` | cleared cue mp3s | `sfx/` | sound-design hits | `images/` | stills for cards | `hf/` | HyperFrames motion cards (HTML→MP4) |
| `README.md` | production spec + YouTube metadata + music credit |

## This project's files (same layout, milestone-documentary content)

- `README.md` — production spec, chapter map, verified-facts + sources, monetization-safety, pipeline.
- `narration.json` — the full ~20–25 min Brian VO script (timed lines), all facts source-cited in the `comment`.
- `clips.json` — the shot plan (library-first, no-repeat), music cues, sfx.
- `match-scenes.jsx` — timeline scaffold (to be filled per the chapter map in README).
- engine files (`match-kit.jsx`, `animations.jsx`, `match.html`, `render.mjs`, `serve.mjs`, `mux.mjs`, `gen_audio.mjs`, `package.json`) — copied from `match06`, adapted for the longer runtime.

## Pipeline (same as every episode)

```
npm run serve      # range server (port in package.json)
npm run render     # Playwright → frames
npm run voice      # ElevenLabs Brian → audio/line_NN.mp3
npm run mux        # ffmpeg: VO master, then video encode + music + sfx
```

Rules that still apply (from `CLAUDE.md`): NO subtitles / no on-screen sentence text (labels only),
clip-based only / no Ken-Burns / no-repeat clips, soccer-only, cleared music credited,
monetization-safe (made-for-kids = No, AI disclosure = Yes), verified facts only (sources in README).
