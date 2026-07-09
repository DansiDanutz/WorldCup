#!/usr/bin/env bash
# Ep73 finish: render intro -> mux body -> build intro audio -> encode intro -> concat.
set -e
cd "$(dirname "$0")"
FF="/tmp/ep38git/marketing/match-videos/match66-uruguay-vs-spain/node_modules/ffmpeg-static/ffmpeg"
DUR=318.05

echo "== [1/5] render intro frames (450) =="
rm -rf frames_intro; mkdir -p frames_intro
PAGE=intro.html PORT=8103 DURATION=15 FPS=30 OUT=frames_intro node render_local.mjs >/tmp/introrender.log 2>&1
echo "  intro frames: $(ls frames_intro | wc -l)"

echo "== [2/5] mux body (frames + VO + music + sfx) -> body.mp4 =="
OUTFILE=body.mp4 DURATION=$DUR FPS=30 node mux.mjs >/tmp/bodymux.log 2>&1
echo "  body.mp4: $(ls -la body.mp4 | awk '{print $5}') bytes"

echo "== [3/5] build intro audio (15s wordless mix) =="
"$FF" -y -i music/cue-tense.mp3 -i sfx/braam.mp3 -i sfx/mystic.mp3 -i sfx/whoosh.mp3 \
  -filter_complex "\
[0:a]atrim=0:15,volume=0.55,afade=t=in:st=0:d=0.4,afade=t=out:st=13:d=2,aresample=44100[m];\
[1:a]volume=0.8,adelay=200:all=1,aresample=44100[b];\
[2:a]volume=0.7,adelay=7600:all=1,aresample=44100[my];\
[3:a]volume=0.6,adelay=13400:all=1,aresample=44100[w];\
[m][b][my][w]amix=inputs=4:normalize=0:dropout_transition=0,\
loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.97,apad,atrim=0:15,aformat=channel_layouts=stereo:sample_rates=44100[a]" \
  -map "[a]" -c:a aac -b:a 192k -t 15 intro_audio.m4a >/tmp/introaudio.log 2>&1
echo "  intro_audio.m4a ok"

echo "== [4/5] encode intro.mp4 (same grade as body) =="
"$FF" -y -framerate 30 -start_number 0 -i frames_intro/f_%05d.jpg -i intro_audio.m4a \
  -filter_complex "[0:v]crop=1920:1080:0:0,fps=30,eq=contrast=1.06:saturation=1.07:gamma=0.98,vignette=angle=PI/6,noise=alls=3:allf=t,format=yuv420p[v]" \
  -map "[v]" -map 1:a -c:v libx264 -pix_fmt yuv420p -crf 23 -preset medium -r 30 -c:a aac -b:a 192k -t 15 -movflags +faststart intro.mp4 >/tmp/introenc.log 2>&1
echo "  intro.mp4: $(ls -la intro.mp4 | awk '{print $5}') bytes"

echo "== [5/5] concat intro + body -> final =="
printf "file 'intro.mp4'\nfile 'body.mp4'\n" > concat_list.txt
OUT="WorldCup26_Ep74_Argentina_Jordan.mp4"
"$FF" -y -f concat -safe 0 -i concat_list.txt -c copy -movflags +faststart "$OUT" >/tmp/concat.log 2>&1 || {
  echo "  copy-concat failed, re-encoding"; \
  "$FF" -y -f concat -safe 0 -i concat_list.txt -c:v libx264 -pix_fmt yuv420p -crf 23 -preset medium -c:a aac -b:a 192k -movflags +faststart "$OUT" >/tmp/concat.log 2>&1; }
echo "  FINAL: $OUT  $(ls -la "$OUT" | awk '{print $5}') bytes"
"$FF" -i "$OUT" 2>&1 | grep -E 'Duration|Stream'
echo "FINISH_DONE"
