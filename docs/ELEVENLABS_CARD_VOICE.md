# ElevenLabs Legend Card Voice

Legend cards use the server route `/api/legend-cards/voice` for ElevenLabs MP3 playback.

## Required Production Env Vars

Set these in Vercel Project Settings:

```env
ELEVENLABS_API_KEY=...
ELEVENLABS_BRIAN_VOICE_ID=...
```

`ELEVENLABS_VOICE_ID` is also accepted as an alias for `ELEVENLABS_BRIAN_VOICE_ID`.

Optional:

```env
ELEVENLABS_MODEL=eleven_multilingual_v2
```

## Fallback Behavior

The app no longer silently falls back to robotic browser speech when ElevenLabs is missing.

Browser speech fallback only runs when this public flag is explicitly enabled:

```env
NEXT_PUBLIC_ALLOW_BROWSER_STORY_VOICE_FALLBACK=true
```

Keep this unset in production if every card must use ElevenLabs Brian.

## Quick Verification

After setting env vars and redeploying:

1. Open `/predictions#legend-cards`.
2. Tap `Listen story` on at least two different cards.
3. Confirm the status says the story is playing with `ElevenLabs Brian`.
4. Confirm the Network tab shows a successful `POST /api/legend-cards/voice` returning `audio/mpeg`.
