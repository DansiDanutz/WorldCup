#!/usr/bin/env bash
# curl-based Brian VO generator (node fetch can't use the sandbox proxy).
# Same output naming + voice_settings as gen_audio.mjs. Key from env only.
set -uo pipefail
: "${ELEVENLABS_API_KEY:?set ELEVENLABS_API_KEY}"
VOICE="${VOICE_ID:-nPczCjzI2devNBz1zQrb}"
MODEL="${MODEL:-eleven_multilingual_v2}"
mkdir -p audio
N=$(python3 -c "import json;print(len(json.load(open('narration.json'))['lines']))")
fails=0
for ((i=0;i<N;i++)); do
  f="audio/line_$(printf '%02d' $i).mp3"
  [ -s "$f" ] && continue
  TEXT=$(python3 -c "import json,sys;print(json.load(open('narration.json'))['lines'][$i]['text'])")
  BODY=$(python3 -c "import json,sys;print(json.dumps({'text':sys.argv[1],'model_id':'$MODEL','voice_settings':{'stability':0.42,'similarity_boost':0.85,'style':0.40,'use_speaker_boost':True}}))" "$TEXT")
  code=$(curl -s -w '%{http_code}' -o "$f" --max-time 120 \
    -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
    -d "$BODY" \
    "https://api.elevenlabs.io/v1/text-to-speech/$VOICE?output_format=mp3_44100_128")
  if [ "$code" != "200" ] || ! file "$f" | grep -qiE "audio|mpeg|id3"; then
    echo "line $i FAILED http=$code: $(head -c 200 "$f")"; rm -f "$f"; fails=$((fails+1))
    [ $fails -ge 3 ] && { echo "aborting after 3 failures"; exit 1; }
    sleep 3
  else
    echo "line $i ok ($(du -h "$f" | cut -f1))"
  fi
  sleep 0.4
done
echo "VO complete: $(ls audio/line_*.mp3 | wc -l)/$N"
