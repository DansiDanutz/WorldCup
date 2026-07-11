#!/usr/bin/env bash
#
# build-episode.sh — one-command, unattended build of a WorldCup26 Legends episode.
#
# Runs the full pipeline for a match-video project: install deps, fetch the
# Higgsfield assets (only if missing), serve the timeline over HTTP, then render
# the frames and generate Brian's ElevenLabs VO IN PARALLEL (they are
# independent — this is the main time saving), and finally mux the MP4.
#
# Usage:
#   ./build-episode.sh match07-brazil-vs-haiti
#
# Build several ahead to fill the rolling buffer (see PRODUCTION_ACCELERATION.md):
#   for ep in match21-france-vs-senegal match22-iraq-vs-norway; do
#     ./build-episode.sh "$ep" || break
#   done
#
# Env:
#   ELEVENLABS_API_KEY  required for VO (omit for a music+FX preview: NO_VO=1)
#   VOICE_NAME          defaults to Brian
#
set -euo pipefail

EP="${1:?usage: build-episode.sh <episode-dir, e.g. match07-brazil-vs-haiti>}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
DIR="$ROOT/$EP"
[ -d "$DIR" ] || { echo "✗ no such episode dir: $DIR" >&2; exit 1; }
cd "$DIR"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

log "Building $EP"

# 1) deps (skip if already installed)
[ -d node_modules ] || npm install
npx playwright install chromium >/dev/null 2>&1 || true

# 2) assets — only fetch if the folder is empty
if [ -z "$(ls -A assets 2>/dev/null || true)" ]; then
  log "assets/ empty → fetching from Higgsfield"
  npm run fetch-assets
fi

# 3) serve the timeline (Babel needs HTTP, not file://)
npm run serve >/tmp/serve-$EP.log 2>&1 &
SERVE_PID=$!
cleanup() { kill "$SERVE_PID" 2>/dev/null || true; }
trap cleanup EXIT
# discover the served URL from the serve log (it prints http://127.0.0.1:PORT/...)
URL=""
for _ in $(seq 1 60); do
  URL="$(grep -oE 'http://127\.0\.0\.1:[0-9]+/match\.html' /tmp/serve-$EP.log 2>/dev/null | head -1 || true)"
  [ -n "$URL" ] && curl -sf "$URL" >/dev/null 2>&1 && break
  sleep 0.5
done
[ -n "$URL" ] || { echo "✗ server did not come up; see /tmp/serve-$EP.log" >&2; exit 1; }
log "server up at $URL"

# 4) render frames (CPU) and Brian VO (network) IN PARALLEL
log "render + VO in parallel"
npm run render & RENDER_PID=$!
VOICE_PID=""
if [ -n "${ELEVENLABS_API_KEY:-}" ]; then
  VOICE_NAME="${VOICE_NAME:-Brian}" npm run voice & VOICE_PID=$!
else
  log "no ELEVENLABS_API_KEY → skipping VO (mux will be music+FX only)"
fi

wait "$RENDER_PID"; log "frames rendered"
if [ -n "$VOICE_PID" ]; then wait "$VOICE_PID"; log "VO generated"; fi

# 5) mux frames + VO + music + FX → final MP4
log "muxing"
npm run mux

log "✓ done: $EP"
