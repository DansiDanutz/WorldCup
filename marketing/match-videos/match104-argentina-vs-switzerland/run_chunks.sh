#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
# total frames = round(355.73*30) = 10672
for N in 1 2 3 4 5 6 7 8 9 10 11 12 13; do
  S=$((N*800)); E=$((S+800)); if [ $E -gt 10672 ]; then E=10672; fi
  AV=$(df -m / | tail -1 | awk '{print $4}')
  if [ "$AV" -lt 190 ]; then echo "DISK_LOW $AV MB — STOP at chunk $N"; exit 3; fi
  ./render_body_chunk.sh $S $E $N
done
echo "ALL_CHUNKS_DONE"; ls chunks/ | wc -l; du -sh chunks
