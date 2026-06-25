# The Island of Secrets — vertical mystery-romance short film

A ~2:45, **1080×1920 (9:16 portrait)** clip-based cinematic short. Built on the
WorldCup26 video engine (React/Babel timeline → Playwright frame render → ffmpeg
mux), but it is a **standalone creative film**, not a WorldCup episode.

## Story
A mysterious woman lives alone in a wooden house on an island the maps forgot.
A storm washes a famous, brilliant, powerful **prince** onto her shore. They fall
for each other — but he wears a ring that is not hers (he belongs to a crown and a
queen across the sea). She **refuses his kiss** while the secret stands between
them; only at the very end does the prince finally kiss her. Heavy on mystery and
an ambiguous, supernatural-tinted ending: *did she call the storm? does the island
ever let him leave?* — **the island never tells.**

## How it was made
- **Character identity:** the woman is anchored to the owner's reference photo
  (Higgsfield `media_id 437931ed…`, used as the `image` reference on every shot of
  her via `nano_banana_pro`). The prince is anchored to a fixed generated portrait.
- **24 unique clips** (NO-REPEAT): each scene still (`nano_banana_pro`, 9:16, 2K)
  animated to a ~5s clip via **Kling 3.0 Turbo** image→video at native 1080×1920,
  then slowed per-clip so none loops across its window.
- **Narration:** Brian (ElevenLabs `nPczCjzI2devNBz1zQrb`, `eleven_multilingual_v2`)
  — fairytale storyteller. **NO subtitles / no on-screen sentences** (only the title
  card). See `narration.json`.
- **Music:** 3 original cinematic cues generated with **fal.ai** (`stable-audio`),
  ducked under the VO in `mux.mjs`.
- **Clips are transcoded to VP9/WebM** because the sandbox Chromium can't decode
  H.264; the renderer reads the `.webm` files.

## Build / render
```bash
# 1) VO (needs ELEVENLABS_API_KEY)
VOICE_ID=nPczCjzI2devNBz1zQrb VOICE_NAME=Brian node gen_audio.mjs
# 2) music (needs FAL_KEY)
node gen_music.mjs
# 3) serve + render frames (1080x1920) — use the bundled Chromium
PORT=8123 node serve.mjs &
CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  URL=http://127.0.0.1:8123/match.html FPS=30 DURATION=165 OUT=frames node render.mjs
# 4) mux VO + music + frames -> MP4
FPS=30 DURATION=165 node mux.mjs   # -> The_Island_of_Secrets.mp4
```

## Files
- `match-scenes.jsx` — the 24-clip portrait timeline + title cards (no sentences).
- `match.html` / `animations.jsx` / `match-kit.jsx` — engine (Stage 1080×1920).
- `narration.json` — Brian VO script + `at` timings.
- `clips.json` — music cues (video comes from VideoSprite in the scene file).
- `assets/` — `cNN_*.mp4` (Kling source) + `cNN_*.webm` (render input).
- `stills/` — the source stills (incl. `00-reference.png`).
- `render.mjs` / `serve.mjs` / `mux.mjs` — render + crash-proof server + mux.
