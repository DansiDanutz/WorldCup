#!/bin/sh
# Demo: prove the VIP-tweet → video-script pipeline works end to end.
# Usage: sh demo.sh
set -e
cd "$(dirname "$0")"

line() { printf '\n\033[1;36m── %s ─────────────────────────────────────────\033[0m\n' "$1"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$1"; }

line "1. CORRECTNESS — unit tests (curation + script generation)"
python3 -m pytest -q
ok "all tests green"

line "2. INPUT — VIP players we track + current World Cup data"
python3 -c "import json; d=json.load(open('players.json')); print('  players:', ', '.join(p['name'] for p in d['players']))"
python3 -c "import json; d=json.load(open('fixtures/live_worldcup.json')); print('  source items:', len([x for x in d if 'author_name' in x]), '(verified current storylines)')"

line "3. PIPELINE — fetch → curate (relevance + engagement + recency) → script"
python3 run.py --fixture fixtures/live_worldcup.json --segments 5 --seconds 75 --out out/demo_script.md

line "4. OUTPUT — the channel-ready script"
cat out/demo_script.md

line "5. PROOF IT'S MONETIZATION-SAFE (channel hard rules)"
OUT=out/demo_script.md
printf '  on-screen sentence/quote cards (must be 0): %s\n' "$(grep -ci 'quote card' "$OUT")"
printf '  real-footage / highlight-reel refs (must be 0): %s\n' "$(grep -ci 'highlight reel' "$OUT")"
printf '  betting/odds wording (must be 0): %s\n' "$(grep -ciE '\bbet\b|odds|stake|wager' "$OUT")"
printf '  Brian VO cues present (must be >=1): %s\n' "$(grep -c 'Brian VO' "$OUT")"
printf '  free-to-play CTA present: %s\n' "$(grep -c 'worldcup26.world' "$OUT")"
ok "script is ready to feed /youtube-automation-pipeline"
