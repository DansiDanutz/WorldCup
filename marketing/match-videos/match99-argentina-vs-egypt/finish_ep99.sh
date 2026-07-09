#!/usr/bin/env bash
# Ep99 finish script — documents the ACTUAL chunked pipeline used this episode (disk-constrained
# shared environment, see README "Chunked render note"). Not a one-shot re-run script: the body
# frames were rendered/encoded in 12 sequential ~800-frame chunks via render_local.mjs, each
# immediately encoded to chunk_NN.mp4 and deleted, to survive critically low shared disk. This
# script assumes chunk_00..chunk_11.mp4 already exist in chunks/ (re-render them with
# `PORT=8199 FPS=30 DURATION=318.05 QUALITY=80 OUT=frames START=<n> END=<n+800> node render_local.mjs`
# per chunk, encoding each with the same grade filter as below, if starting from scratch).
set -e
cd "$(dirname "$0")"
FF="node_modules/ffmpeg-static/ffmpeg"
GRADE="crop=1920:1080:0:0,fps=30,eq=contrast=1.06:saturation=1.07:gamma=0.98,vignette=angle=PI/6,noise=alls=3:allf=t,format=yuv420p"

echo "== concat 12 body chunks -> body_video.mp4 =="
for i in 00 01 02 03 04 05 06 07 08 09 10 11; do echo "file 'chunk_${i}.mp4'"; done > chunks/concat_body.txt
"$FF" -y -f concat -safe 0 -i chunks/concat_body.txt -c copy body_video.mp4 >/tmp/concat99.log 2>&1

echo "== mux2.mjs: audio master (Brian VO + FX + SFX + music) + mux against body_video.mp4 -> body_s.mp4 =="
node mux2.mjs

echo "== intro audio =="
"$FF" -y -i music/cue-tense.mp3 -i sfx/braam.mp3 -i sfx/mystic.mp3 -i sfx/whoosh.mp3 \
  -filter_complex "[0:a]atrim=0:15,volume=0.55,afade=t=in:st=0:d=0.4,afade=t=out:st=13:d=2,aresample=44100[m];[1:a]volume=0.8,adelay=200:all=1,aresample=44100[b];[2:a]volume=0.7,adelay=7600:all=1,aresample=44100[my];[3:a]volume=0.6,adelay=13400:all=1,aresample=44100[w];[m][b][my][w]amix=inputs=4:normalize=0:dropout_transition=0,loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.97,apad,atrim=0:15,aformat=channel_layouts=stereo:sample_rates=44100[a]" \
  -map "[a]" -c:a aac -b:a 192k -t 15 intro_audio.m4a >/tmp/i99a.log 2>&1

echo "== intro.mp4 (render frames_intro/ via render_local.mjs PAGE=intro.html DURATION=15 first) =="
"$FF" -y -framerate 30 -start_number 0 -i frames_intro/f_%05d.jpg -i intro_audio.m4a \
  -filter_complex "[0:v]${GRADE}[v]" \
  -map "[v]" -map 1:a -c:v libx264 -pix_fmt yuv420p -crf 26 -preset medium -r 30 -c:a aac -b:a 160k -t 15 -movflags +faststart intro.mp4 >/tmp/i99e.log 2>&1

echo "== concat intro + body =="
printf "file 'intro.mp4'\nfile 'body_s.mp4'\n" > concat_list.txt
OUT="WorldCup26_Ep99_Argentina_Egypt.mp4"
"$FF" -y -f concat -safe 0 -i concat_list.txt -c copy "$OUT" >/tmp/c99.log 2>&1 || \
  "$FF" -y -f concat -safe 0 -i concat_list.txt -c:v libx264 -pix_fmt yuv420p -crf 26 -preset medium -c:a aac -b:a 160k -movflags +faststart "$OUT" >/tmp/c99.log 2>&1
echo "  FINAL $(ls -la "$OUT"|awk '{print $5/1048576" MiB"}')"
"$FF" -i "$OUT" 2>&1 | grep -E 'Duration|Stream'
echo "FINISH_DONE"
