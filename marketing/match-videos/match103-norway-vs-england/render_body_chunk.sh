#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
S=$1; E=$2; N=$3
FF=node_modules/ffmpeg-static/ffmpeg
export OUT=/dev/shm/ep103/frames FPS=30 DURATION=355.73 QUALITY=90 START=$S END=$E
mkdir -p "$OUT" chunks
node render_local.mjs > /tmp/r103_$N.log 2>&1
tail -1 /tmp/r103_$N.log
CNT=$((E-S))
"$FF" -y -start_number $S -framerate 30 -i "$OUT/f_%05d.jpg" -frames:v $CNT \
  -vf "crop=1920:1080:0:0,fps=30,eq=contrast=1.06:saturation=1.07:gamma=0.98,vignette=angle=PI/6,noise=alls=3:allf=t,format=yuv420p" \
  -c:v libx264 -pix_fmt yuv420p -crf 26 -preset medium -r 30 "chunks/chunk_$(printf %02d $N).mp4" > /tmp/e103_$N.log 2>&1
echo "chunk_$(printf %02d $N) $(du -h chunks/chunk_$(printf %02d $N).mp4|cut -f1)"
rm -f "$OUT"/f_*.jpg
df -m / | tail -1
