#!/bin/bash
cd /home/user/WorldCup/marketing/match-videos/match07-brazil-vs-haiti
# 1. Wait for render to complete (9000 frames = f_08999.jpg)
for i in $(seq 1 240); do
  [ -f frames/f_08999.jpg ] && break
  sleep 15
done
[ -f frames/f_08999.jpg ] || { echo "RENDER NOT DONE after wait"; exit 1; }
echo "RENDER COMPLETE -> muxing"
# 2. Mux
OUTFILE=WorldCup26_Match07_BRA_HAI.mp4 node mux.mjs > mux.log 2>&1 || { echo "MUX FAILED"; exit 2; }
grep -q "MUX DONE" mux.log || { echo "MUX no DONE marker"; exit 2; }
echo "MUX DONE -> upload encode"
# 3. CRF26 upload encode
node_modules/ffmpeg-static/ffmpeg -y -loglevel error -i WorldCup26_Match07_BRA_HAI.mp4 \
  -c:v libx264 -crf 26 -preset medium -pix_fmt yuv420p -c:a copy -movflags +faststart \
  WorldCup26_Match07_BRA_HAI_upload.mp4 || { echo "ENCODE FAILED"; exit 3; }
echo "ENCODE DONE -> subtitles + shorts"
# 4. Subtitles + Shorts
node gen_srt.mjs >> mux.log 2>&1
node gen_shorts.mjs WorldCup26_Match07_BRA_HAI.mp4 >> mux.log 2>&1
echo "EP7 FINISH PIPELINE COMPLETE"
ls -la WorldCup26_Match07_BRA_HAI_upload.mp4 short*.mp4
