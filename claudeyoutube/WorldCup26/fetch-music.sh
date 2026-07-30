#!/usr/bin/env bash
# Fetches the 9 cleared music cues (Kevin MacLeod, incompetech.com, CC-BY 4.0 —
# credit REQUIRED in the video description; see README). Music mp3s are
# gitignored by repo policy, so run this once after cloning.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p music
cd music
BASE="https://incompetech.com/music/royalty-free/mp3-royaltyfree"
fetch() { # out track
  local out="$1" name="$2"
  [ -s "$out" ] && { echo "skip $out (exists)"; return; }
  local url="$BASE/$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "$name").mp3"
  curl -fsS --max-time 90 -o "$out" "$url"
  file "$out" | grep -qiE "audio|mpeg|id3" || { echo "BAD DOWNLOAD: $out"; rm -f "$out"; exit 1; }
  echo "ok  $out  <-  $name"
}
fetch cue-cinematic-open.mp3 "Dreams Become Real"
fetch cue-warm.mp3           "Sincerely"
fetch cue-uplift.mp3         "Inspired"
fetch cue-drive.mp3          "Rising Game"
fetch cue-tension.mp3        "Five Armies"
fetch cue-noble.mp3          "Majestic Hills"
fetch cue-reverent.mp3       "Ascending the Vale"
fetch cue-triumph.mp3        "Fanfare for Space"
fetch cue-epic.mp3           "Heroic Age"
echo "all 9 cues present"
