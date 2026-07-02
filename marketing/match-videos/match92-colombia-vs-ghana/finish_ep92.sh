#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
FF="node_modules/ffmpeg-static/ffmpeg"
echo "== intro audio =="
"$FF" -y -i music/cue-tense.mp3 -i sfx/braam.mp3 -i sfx/mystic.mp3 -i sfx/whoosh.mp3 \
  -filter_complex "[0:a]atrim=0:15,volume=0.55,afade=t=in:st=0:d=0.4,afade=t=out:st=13:d=2,aresample=44100[m];[1:a]volume=0.8,adelay=200:all=1,aresample=44100[b];[2:a]volume=0.7,adelay=7600:all=1,aresample=44100[my];[3:a]volume=0.6,adelay=13400:all=1,aresample=44100[w];[m][b][my][w]amix=inputs=4:normalize=0:dropout_transition=0,loudnorm=I=-14:TP=-1.2:LRA=11,alimiter=limit=0.97,apad,atrim=0:15,aformat=channel_layouts=stereo:sample_rates=44100[a]" \
  -map "[a]" -c:a aac -b:a 192k -t 15 intro_audio.m4a >/tmp/i92a.log 2>&1
echo "== intro.mp4 =="
"$FF" -y -framerate 30 -start_number 0 -i frames_intro/f_%05d.jpg -i intro_audio.m4a \
  -filter_complex "[0:v]crop=1920:1080:0:0,fps=30,eq=contrast=1.06:saturation=1.07:gamma=0.98,vignette=angle=PI/6,noise=alls=3:allf=t,format=yuv420p[v]" \
  -map "[v]" -map 1:a -c:v libx264 -pix_fmt yuv420p -crf 25 -preset medium -r 30 -c:a aac -b:a 160k -t 15 -movflags +faststart intro.mp4 >/tmp/i92e.log 2>&1
echo "== concat =="
printf "file 'intro.mp4'\nfile 'body_s.mp4'\n" > concat_list.txt
OUT="WorldCup26_Ep92_Colombia_Ghana.mp4"
"$FF" -y -f concat -safe 0 -i concat_list.txt -c copy -movflags +faststart "$OUT" >/tmp/c92.log 2>&1 || \
  "$FF" -y -f concat -safe 0 -i concat_list.txt -c:v libx264 -pix_fmt yuv420p -crf 25 -preset medium -c:a aac -b:a 160k -movflags +faststart "$OUT" >/tmp/c92.log 2>&1
echo "  FINAL $(ls -la "$OUT"|awk '{print $5/1048576" MiB"}')"
"$FF" -i "$OUT" 2>&1 | grep -E 'Duration|Stream'
echo "FINISH_DONE"
