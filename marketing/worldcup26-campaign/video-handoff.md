# Video Handoff

The campaign objective says the video is available, but no final `.mp4`, `.mov`, or `.webm` was found under `/Users/davidai/Documents/WorldCup`.

What exists:

- Video project: `marketing/worldcup26-ad`
- Ad README: `marketing/worldcup26-ad/README.md`
- Script: `marketing/worldcup26-ad/narration.json`
- Still: `marketing/worldcup26-ad/shots/passive.png`

## Script Check

If any older narration still contains a prize claim like:

```text
prize pool of forty-eight thousand dollars
```

do NOT use it — the game is now free to play, just for fun, with no prizes. Campaign copy uses `free to play` and `climb the leaderboard, just for fun, no prizes` instead of any amount.

## If Final MP4 Exists Outside Repo

Use it as the primary media asset for:

- TikTok
- Instagram Reels
- YouTube Shorts
- Facebook Reels
- WhatsApp Status
- Telegram posts

Caption with one of the `Video Captions` from `copy-bank.md`.

## If Final MP4 Must Be Rendered

Follow `marketing/worldcup26-ad/README.md`.

Minimal local sequence:

```bash
cd /Users/davidai/Documents/WorldCup/marketing/worldcup26-ad
npm install
npx playwright install chromium
npm run serve
npm run render
ELEVENLABS_API_KEY=... VOICE_NAME=Brian npm run voice
npm run mux
```

Expected output:

```text
marketing/worldcup26-ad/WorldCup26_Ad.mp4
```

The MP4 is intentionally gitignored.
