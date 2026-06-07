# Video Handoff

The campaign objective says the video is available, but no final `.mp4`, `.mov`, or `.webm` was found under `/Users/davidai/Documents/WorldCup`.

What exists:

- Video project: `marketing/worldcup26-ad`
- Ad README: `marketing/worldcup26-ad/README.md`
- Script: `marketing/worldcup26-ad/narration.json`
- Still: `marketing/worldcup26-ad/shots/passive.png`

## Script Check

The narration currently contains a fixed prize claim:

```text
prize pool of forty-eight thousand dollars
```

Only use that version if the live app currently supports that exact claim. For safer campaign copy, the campaign pack uses `live prize pool` instead of a fixed amount.

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
