#!/usr/bin/env bash
# CANONICAL episode render — ALWAYS gates on preflight first, so we never render
# an incomplete/broken episode twice. Usage:
#   bash scripts/render-episode.sh <port> <epNumber> <dirUnderMarketing> <outfile.mp4>
# e.g. bash scripts/render-episode.sh 8700 33 match-videos/match33-x-vs-y WorldCup26_Match33_X_Y.mp4
set -uo pipefail
PORT="$1"; EPNUM="$2"; DIR="$3"; OUT="$4"
ROOT=/home/user/WorldCup
FULL="$ROOT/marketing/$DIR"
LOG=/tmp/render-$EPNUM.log

echo "[render] preflight Ep$EPNUM …"
if ! node "$ROOT/scripts/preflight-episode.mjs" "marketing/$DIR" "$EPNUM"; then
  echo "[render] ❌ PREFLIGHT FAILED — NOT rendering. Fix the items above first."
  exit 1
fi
echo "[render] ✅ preflight passed — rendering Ep$EPNUM"
cd "$FULL" || exit 1
START=$(ls frames 2>/dev/null | grep -c '^f_')
( while true; do PORT=$PORT node serve.mjs >/tmp/serve-$PORT.log 2>&1; sleep 0.4; done ) & SV=$!
until curl -s -o /dev/null 127.0.0.1:$PORT; do sleep 1; done
URL=http://127.0.0.1:$PORT/match.html FPS=30 DURATION=300 OUT=frames START=$START node render.mjs >"$LOG" 2>&1
echo "[render] frames=$(ls frames|wc -l) exit=$?"
OUTFILE="$OUT" node mux.mjs >/tmp/mux-$EPNUM.log 2>&1
echo "[render] DONE mux=$? size=$(stat -c%s "$OUT" 2>/dev/null)"
kill $SV 2>/dev/null
