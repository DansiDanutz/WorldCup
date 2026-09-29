#!/usr/bin/env bash
# Fetches the 4 cleared music cues this film uses (Kevin MacLeod, incompetech.com,
# CC-BY 4.0 — credit REQUIRED in the description; see UPLOAD_KIT.md). Music mp3s are
# gitignored by repo policy, so run this once after cloning.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p music
cd music
BASE="https://incompetech.com/music/royalty-free/mp3-royaltyfree"
fetch() {
  local out="$1" name="$2"
  [ -s "$out" ] && { echo "skip $out (exists)"; return; }
  local url="$BASE/$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$name").mp3"
  curl -fsS --max-time 90 -o "$out" "$url"
  file "$out" | grep -qiE "audio|mpeg|id3" || { echo "BAD DOWNLOAD: $out"; rm -f "$out"; exit 1; }
  echo "ok  $out  <-  $name"
}
fetch cue-cinematic-open.mp3 "Dreams Become Real"   # cold open
fetch cue-reverent.mp3       "Ascending the Vale"   # chapters 1-5
fetch cue-noble.mp3          "Majestic Hills"       # chapters 6-10
fetch cue-triumph.mp3        "Fanfare for Space"    # close / app CTA
echo "all 4 cues present"
