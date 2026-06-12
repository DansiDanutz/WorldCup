#!/bin/bash
cd /home/user/WorldCup/marketing/match-videos/match06-argentina-vs-algeria
# ensure server is alive
curl -s -o /dev/null http://127.0.0.1:8094/match.html || { PORT=8094 setsid nohup node serve.mjs >> serve.log 2>&1 < /dev/null & sleep 2; }
for attempt in 1 2 3 4 5 6 7 8; do
  last=$(ls frames/f_*.jpg 2>/dev/null | tail -1 | grep -o '[0-9]\{5\}' || echo "")
  start=0
  [ -n "$last" ] && start=$((10#$last))  # re-render last (possibly truncated) frame
  echo "=== attempt $attempt START=$start ===" >> render.log
  START=$start node render.mjs >> render.log 2>&1
  grep -q "^DONE" render.log && break
  sleep 3
done
