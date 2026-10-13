#!/usr/bin/env bash
# run.sh <episode-dir> — one command from episode.json to a finished MP4.
#   Brian VO -> timeline -> card + thumbnail -> PREFLIGHT GATE -> frames -> audio -> encode/QA -> upload kit
# PREVIEW=1 skips the VO (estimated timing, music + sfx only) to review picture early.
# Resumes: VO files, rendered frames and art are kept between runs.
set -euo pipefail
ENGINE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$ENGINE/../../.." && pwd)"
EP="$(cd "$1" && pwd)"
CHROME="${CHROMIUM_PATH:-$(command -v google-chrome || echo /opt/google/chrome/chrome)}"
PORT="${PORT:-8140}"
cd "$ENGINE"
[ -x node_modules/ffmpeg-static/ffmpeg ] || { pnpm install --silent; node node_modules/ffmpeg-static/install.js; }
bash fetch-music.sh >/dev/null

if [ "${PREVIEW:-0}" != "1" ]; then node gen-vo.mjs "$EP"; fi
node build.mjs "$EP"
CHROMIUM_PATH="$CHROME" node make-art.mjs "$EP"
node preflight.mjs "$EP"

DUR=$(node -e "console.log(require('$EP/build/film.json').duration)")
FRAMES="$EP/build/frames"; mkdir -p "$FRAMES"
# Frames are only reusable for the exact film.json that produced them (a preview's
# estimated timing or an edited scene must never leak into the final cut).
FILM_HASH=$(sha256sum "$EP/build/film.json" | cut -d' ' -f1)
if [ "$(cat "$FRAMES/.film-hash" 2>/dev/null)" != "$FILM_HASH" ]; then
  find "$FRAMES" -name 'f_*.jpg' -delete
  echo "$FILM_HASH" > "$FRAMES/.film-hash"
fi
# resume from the first missing frame (renders are long; never restart from zero)
START=$(node -e "
const fs=require('fs');const have=new Set(fs.readdirSync('$FRAMES').map(f=>+f.slice(2,-4)));
let i=0;while(have.has(i))i++;console.log(i)")
( cd "$ROOT" && PORT=$PORT node "$ENGINE/serve.mjs" >/dev/null 2>&1 & echo $! > "$EP/build/serve.pid" )
trap 'kill $(cat "$EP/build/serve.pid") 2>/dev/null || true' EXIT
sleep 1
URL="http://127.0.0.1:$PORT/marketing/deep-dives/engine/deep-dive.html?film=/${EP#$ROOT/}/build/film.json"
TOTAL=$(node -e "console.log(Math.round($DUR*30))")
if [ "$START" -lt "$TOTAL" ]; then
  URL="$URL" FPS=30 DURATION="$DUR" START="$START" OUT="$FRAMES" QUALITY=88 CHROMIUM_PATH="$CHROME" node render.mjs
else
  echo "all $TOTAL frames present — skipping render"
fi
node mux-audio.mjs "$EP"
node finish.mjs "$EP"
node kit.mjs "$EP"
