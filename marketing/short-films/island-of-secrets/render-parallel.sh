#!/bin/bash
# Parallel chunked render for The Island of Secrets (177s @30fps = 5310 frames).
# 3 concurrent Chromium render workers share the :8123 server, each owns a frame range.
set -u
cd "$(dirname "$0")"
export CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
export URL=http://127.0.0.1:8123/match.html
export FPS=30 DURATION=177 OUT=frames QUALITY=90
mkdir -p frames
TOTAL=$(( 177 * 30 ))   # 5310
A=$(( TOTAL/3 )); B=$(( 2*TOTAL/3 ))
echo "chunks: 0-$A, $A-$B, $B-$TOTAL"
START=0  END=$A  node render.mjs > r1.log 2>&1 &
P1=$!
START=$A END=$B  node render.mjs > r2.log 2>&1 &
P2=$!
START=$B END=$TOTAL node render.mjs > r3.log 2>&1 &
P3=$!
wait $P1 $P2 $P3
echo "ALL CHUNKS DONE; frames=$(ls frames/*.jpg 2>/dev/null | wc -l)/$TOTAL"
