# WorldCup26 Proof Sprint

Generated: 2026-06-08T06:48:19.568Z
Referral code: `26BC4B90CB`
Referral link: https://worldcup26.world/login?ref=26BC4B90CB

Live proof rows: 49
Urgent proof gaps: 16

This is the short execution sheet. Do the real action first. Then run the matching proof command with a public URL or a precise private note.

## Escalation Board

- Dexter: 3 open / hot / oldest 49.8h open / next #4 Football groups
  - Command: `node campaign-proof-log.mjs --priority "4" --proof-url "approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset campaign/first-wave-posts.md; code 26BC4B90CB and link included; post only after allowed" --status "requested"`
- Sienna: 8 open / hot / oldest 53.8h open / next #1 WhatsApp Status
  - Command: `node campaign-proof-log.mjs --priority "1" --proof-url "private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"`
- Memo: clear. Keep monitoring pulse actions and replies.
- Nano: 5 open / hot / oldest 51.8h open / next #2 WhatsApp personal
  - Command: `node campaign-proof-log.mjs --priority "2" --proof-url "private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>" --status "sent"`

## Worker Focus

- Dexter: priority 4 / Football groups / status requested / oldest 49.8h open
- Sienna: priority 1 / WhatsApp Status / status posted / oldest 53.8h open
- Memo: no urgent proof row. Keep pulse/audit moving.
- Nano: priority 2 / WhatsApp personal / status sent / oldest 51.8h open

## All Open Proof Gaps

### 1. Sienna - WhatsApp Status

- Status to log: `posted`
- Action: Post story asset with video caption 1
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-status&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h0
- Proof note template: private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included

```bash
node campaign-proof-log.mjs --priority "1" --proof-url "private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"
```

### 2. Nano - WhatsApp personal

- Status to log: `sent`
- Action: Send personal invite to warm contacts
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_h2
- Proof note template: private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>

```bash
node campaign-proof-log.mjs --priority "2" --proof-url "private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>" --status "sent"
```

### 3. Sienna - Instagram/Facebook story

- Status to log: `posted`
- Action: Story: Code 26BC4B90CB + link sticker
- Asset: `media/worldcup26-referral-story.jpg`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=instagram-facebook-story&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h3
- Proof note template: private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset media/worldcup26-referral-story.jpg; code/link sticker or caption included

```bash
node campaign-proof-log.mjs --priority "3" --proof-url "private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset media/worldcup26-referral-story.jpg; code/link sticker or caption included" --status "posted"
```

### 4. Dexter - Football groups

- Status to log: `requested`
- Action: Ask approved group admin for permission; post group variant only if allowed
- Asset: `campaign/first-wave-posts.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=football-groups&utm_medium=approval-first&utm_campaign=worldcup26_referral_72h&utm_content=dexter_h4
- Proof note template: approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset campaign/first-wave-posts.md; code 26BC4B90CB and link included; post only after allowed

```bash
node campaign-proof-log.mjs --priority "4" --proof-url "approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset campaign/first-wave-posts.md; code 26BC4B90CB and link included; post only after allowed" --status "requested"
```

### 5. Sienna - TikTok/Reels/Shorts

- Status to log: `posted`
- Action: Upload main video with short caption and code in first line
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=tiktok-reels-shorts&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h5
- Proof note template: public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included

```bash
node campaign-proof-log.mjs --priority "5" --proof-url "public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"
```

### 6. Nano - DM follow-up

- Status to log: `replied`
- Action: Reply to first reactions and send the simple how-it-works answer
- Asset: `campaign/copy-bank.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=dm-follow-up&utm_medium=manual-replies&utm_campaign=worldcup26_referral_72h&utm_content=nano_h7
- Proof note template: private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; code 26BC4B90CB and link included; next follow-up <date/action>

```bash
node campaign-proof-log.mjs --priority "6" --proof-url "private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; code 26BC4B90CB and link included; next follow-up <date/action>" --status "replied"
```

### 7. Sienna - YouTube Shorts

- Status to log: `posted`
- Action: Post main video as Shorts with code and link in description
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=youtube-shorts&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h8
- Proof note template: public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included

```bash
node campaign-proof-log.mjs --priority "7" --proof-url "public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"
```

### 8. Dexter - Facebook profile/page

- Status to log: `posted`
- Action: Publish simple rules feed post for friends and football contacts
- Asset: `media/worldcup26-referral-square.jpg`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=facebook-profile-page&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=dexter_h9
- Proof note template: manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-referral-square.jpg; code 26BC4B90CB and link included; replace with public URL when available

```bash
node campaign-proof-log.mjs --priority "8" --proof-url "manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-referral-square.jpg; code 26BC4B90CB and link included; replace with public URL when available" --status "posted"
```

### 9. Nano - Replies

- Status to log: `replied`
- Action: Answer questions using reply bank; push code/link once per conversation
- Asset: `campaign/copy-bank.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=replies&utm_medium=manual-replies&utm_campaign=worldcup26_referral_72h&utm_content=nano_h10
- Proof note template: private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; code 26BC4B90CB and link included; next follow-up <date/action>

```bash
node campaign-proof-log.mjs --priority "9" --proof-url "private-reply-note: replied to <thread/contact initials> at YYYY-MM-DD HH:mm EEST; code 26BC4B90CB and link included; next follow-up <date/action>" --status "replied"
```

### 10. Sienna - Instagram Story

- Status to log: `posted`
- Action: Post referral story image with link sticker and code overlay
- Asset: `media/worldcup26-referral-story.jpg`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=instagram-story&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h11
- Proof note template: private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset media/worldcup26-referral-story.jpg; code/link sticker or caption included

```bash
node campaign-proof-log.mjs --priority "10" --proof-url "private-meta-story: story posted from <account> at YYYY-MM-DD HH:mm EEST; screenshot saved on phone; asset media/worldcup26-referral-story.jpg; code/link sticker or caption included" --status "posted"
```

### 11. Nano - WhatsApp personal

- Status to log: `sent`
- Action: Send second warm-contact batch with main invite
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_h13
- Proof note template: private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>

```bash
node campaign-proof-log.mjs --priority "11" --proof-url "private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>" --status "sent"
```

### 12. Sienna - Facebook Reels

- Status to log: `posted`
- Action: Upload main video as Reel with code in caption
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=facebook-reels&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h15
- Proof note template: public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included

```bash
node campaign-proof-log.mjs --priority "12" --proof-url "public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"
```

### 13. Sienna - WhatsApp/Telegram groups

- Status to log: `requested`
- Action: Community post variant if promo welcome
- Asset: `media/worldcup26-referral-story.jpg`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-telegram-groups&utm_medium=approval-first&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h16
- Proof note template: approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-referral-story.jpg; code 26BC4B90CB and link included; post only after allowed

```bash
node campaign-proof-log.mjs --priority "13" --proof-url "approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-referral-story.jpg; code 26BC4B90CB and link included; post only after allowed" --status "requested"
```

### 14. Dexter - Creator outreach

- Status to log: `sent`
- Action: Send partner DM to football micro-creators
- Asset: `campaign/first-wave-posts.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=creator-outreach&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=dexter_h17
- Proof note template: manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset campaign/first-wave-posts.md; code 26BC4B90CB and link included; replace with public URL when available

```bash
node campaign-proof-log.mjs --priority "14" --proof-url "manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset campaign/first-wave-posts.md; code 26BC4B90CB and link included; replace with public URL when available" --status "sent"
```

### 15. Nano - Direct DMs

- Status to log: `sent`
- Action: Send one-to-one invite to people who reacted to stories
- Asset: `campaign/copy-bank.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=direct-dms&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_h18
- Proof note template: manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset campaign/copy-bank.md; code 26BC4B90CB and link included; replace with public URL when available

```bash
node campaign-proof-log.mjs --priority "15" --proof-url "manual-post-note: posted from <account/destination> at YYYY-MM-DD HH:mm EEST; asset campaign/copy-bank.md; code 26BC4B90CB and link included; replace with public URL when available" --status "sent"
```

### 16. Sienna - TikTok/Reels/Shorts

- Status to log: `posted`
- Action: Repost video with favorites-or-underdogs caption
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=tiktok-reels-shorts&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h19
- Proof note template: public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included

```bash
node campaign-proof-log.mjs --priority "16" --proof-url "public-video-url-preferred: paste Shorts/Reels/TikTok/YouTube URL; if still processing use private-video-note: uploaded from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"
```
