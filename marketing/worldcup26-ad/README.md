# WorldCup26 — Ad Video

A 90-second, 1920×1080 promo for **WorldCup26.world** rendered from the
self-contained animated HTML ad and narrated with an [ElevenLabs](https://elevenlabs.io)
voiceover (voice: **Brian**, model `eleven_multilingual_v2`).

The finished render is committed as [`WorldCup26_Ad.mp4`](./WorldCup26_Ad.mp4).

## What's here

| File | Purpose |
| --- | --- |
| `ad.html` + `*.jsx` / `*.js` / `*.css` | The animated ad. A React + Babel timeline (`Stage`/`Sprite`) with 7 scenes, driven by an internal clock exposed as `window.__seek(t)`. |
| `narration.json` | The story-driven voiceover script — one line per scene cut, with start times (`at`) in seconds. |
| `render.mjs` | Headless-Chromium (Playwright) frame renderer. Seeks the ad's clock frame-by-frame and screenshots `#stage-canvas`. |
| `gen_audio.mjs` | Generates one MP3 per narration line via the ElevenLabs API. |
| `mux.mjs` | Builds the timed VO track (auto-fits any over-long line into its scene gap) and muxes it with the frames into the final H.264/AAC MP4. |

## Regenerate the video

```bash
cd marketing/worldcup26-ad
npm install                      # playwright + ffmpeg-static

# 1) Serve the ad over HTTP (Babel can't fetch the .jsx over file://)
npm run serve &                  # http://127.0.0.1:8099/ad.html

# 2) Render all frames (30fps × 90s = 2700 JPEGs -> ./frames)
npm run render

# 3) Generate the Brian voiceover (needs your key)
ELEVENLABS_API_KEY=sk_... VOICE_NAME=Brian npm run voice

# 4) Mux frames + voice -> WorldCup26_Ad.mp4
npm run mux
```

### Notes

- **Voice / model:** override with `VOICE_NAME=...` (e.g. `George`), `VOICE_ID=...`,
  or `MODEL=...`. Names match on the leading token, so `Brian` resolves
  `Brian - Deep, Resonant and Comforting`.
- **Sync:** narration lines are placed at their `at` timestamps; `mux.mjs`
  only time-stretches a line (via `atempo`) if it would otherwise spill past
  the next line — currently just the closing CTA, by ~6%.
- **Even dimensions:** the element capture is 1920×1081 (a 1px sub-pixel row);
  `mux.mjs` crops it to 1920×1080 so libx264 is happy.
- The `ELEVENLABS_API_KEY` is read from the environment only — never commit it.
