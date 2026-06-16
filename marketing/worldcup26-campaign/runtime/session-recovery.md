# WorldCup26 Session Recovery

Generated: 2026-06-08 09:53 +0300

- Proof rows: 49
- Urgent rows still needing real proof: 16
- Recent login/session blockers: 1
- Referral code: `26BC4B90CB`
- Referral link: https://worldcup26.world/login?ref=26BC4B90CB

Use this when a browser or app is logged out. Log proof only after the real post, story, message, reply, upload, or approval request happened.

## Public Session Recovery

### X public fallback

- Scheduled: 2026-06-08 08:45 +0300
- Action: Publish or prepare a short public CTA if X is logged in.
- Asset: `media/worldcup26-referral-16x9.jpg`
- Login: https://x.com/i/flow/login
- Share: https://twitter.com/intent/tweet?text=WorldCup26%20is%20open.%0A%0APick%203%20teams%20for%20free.%20See%20your%20private%20points%20preview.%0A%0AUse%20a%20ticket%20only%20when%20you%20want%20to%20enter%20the%20paid%20leaderboard.%0A%0ACode%3A%2026BC4B90CB%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dx-public-fallback%26utm_medium%3Dmanual-post%26utm_campaign%3Dworldcup26_referral_72h%26utm_content%3Ddexter_pulse193
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x-public-fallback&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=dexter_pulse193

Copy:

```text
WorldCup26 is open.

Pick 3 teams for free. See your private points preview.

Use a ticket only when you want to enter the paid leaderboard.

Code: 26BC4B90CB
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x-public-fallback&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=dexter_pulse193
```

Proof after real action:

```bash
node campaign-proof-log.mjs --pulse "193" --proof-url "PUBLIC_X_POST_URL" --status "posted"
```

### Facebook feed fallback

- Scheduled: 2026-06-08 06:45 +0300
- Action: Post a friendly feed variant if Facebook is logged in.
- Asset: `media/worldcup26-referral-square.jpg`
- Login: https://www.facebook.com/login/
- Share: https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dfacebook-feed-fallback%26utm_medium%3Dmanual-post%26utm_campaign%3Dworldcup26_referral_72h%26utm_content%3Ddexter_pulse185
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=facebook-feed-fallback&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=dexter_pulse185

Copy:

```text
WorldCup26 is live for signups.

Pick 3 teams before they lock. You can save the picks for free and watch your private points preview.

Use a ticket only if you want to enter the paid leaderboard.

Code: 26BC4B90CB
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=facebook-feed-fallback&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=dexter_pulse185
```

Proof after real action:

```bash
node campaign-proof-log.mjs --pulse "185" --proof-url "PUBLIC_FACEBOOK_POST_URL_OR_ACCOUNT_NOTE" --status "posted"
```

## Phone-First Actions

### #1 Sienna / WhatsApp Status

- Action: Post story asset with video caption 1
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-status&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h0

Proof after real action:

```bash
node campaign-proof-log.mjs --priority "1" --proof-url "private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"
```

### #2 Nano / WhatsApp personal

- Action: Send personal invite to warm contacts
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_h2

Proof after real action:

```bash
node campaign-proof-log.mjs --priority "2" --proof-url "private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>" --status "sent"
```

### #3 Sienna / Instagram/Facebook story

- Action: Story: Code 26BC4B90CB + link sticker
- Asset: `media/worldcup26-referral-story.jpg`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=instagram-facebook-story&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h3

Proof after real action:

```bash
node campaign-proof-log.mjs --priority "3" --proof-url "private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset media/worldcup26-referral-story.jpg; code/link sticker or caption included" --status "posted"
```

### #4 Dexter / Football groups

- Action: Ask approved group admin for permission; post group variant only if allowed
- Asset: `campaign/first-wave-posts.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=football-groups&utm_medium=approval-first&utm_campaign=worldcup26_referral_72h&utm_content=dexter_h4

Proof after real action:

```bash
node campaign-proof-log.mjs --priority "4" --proof-url "approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset campaign/first-wave-posts.md; code 26BC4B90CB and link included; post only after allowed" --status "requested"
```

### #5 Sienna / TikTok/Reels/Shorts

- Action: Upload main video with short caption and code in first line
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=tiktok-reels-shorts&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h5

Proof after real action:

```bash
node campaign-proof-log.mjs --priority "5" --proof-url "public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"
```

### #6 Nano / DM follow-up

- Action: Reply to first reactions and send the simple how-it-works answer
- Asset: `campaign/copy-bank.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=dm-follow-up&utm_medium=manual-replies&utm_campaign=worldcup26_referral_72h&utm_content=nano_h7

Proof after real action:

```bash
node campaign-proof-log.mjs --priority "6" --proof-url "private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; code 26BC4B90CB and link included; next follow-up <date/action>" --status "replied"
```
