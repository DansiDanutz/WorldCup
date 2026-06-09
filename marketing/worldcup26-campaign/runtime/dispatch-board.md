# WorldCup26 Worker Dispatch Board

Generated: 2026-06-08T06:48:19.568Z

Referral code: `26BC4B90CB`
Referral link: https://worldcup26.world/login?ref=26BC4B90CB

Live proof rows: 49
Urgent rows still needing proof: 16

## Worker Current Orders

### Dexter

- Priority: 4
- Channel: Football groups
- Action: Ask approved group admin for permission; post group variant only if allowed
- Asset: `campaign/first-wave-posts.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=football-groups&utm_medium=approval-first&utm_campaign=worldcup26_referral_72h&utm_content=dexter_h4
- Inbox: `runtime/worker-inbox-dexter.md`
- Private proof command template: `node campaign-proof-log.mjs --priority "4" --proof-url "approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset campaign/first-wave-posts.md; code 26BC4B90CB and link included; post only after allowed" --status "requested"`

### Sienna

- Priority: 1
- Channel: WhatsApp Status
- Action: Post story asset with video caption 1
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-status&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h0
- Inbox: `runtime/worker-inbox-sienna.md`
- Private proof command template: `node campaign-proof-log.mjs --priority "1" --proof-url "private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"`

### Memo

No urgent row is assigned right now. Keep monitoring `runtime/next-actions-memo.md`.

### Nano

- Priority: 2
- Channel: WhatsApp personal
- Action: Send personal invite to warm contacts
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_h2
- Inbox: `runtime/worker-inbox-nano.md`
- Private proof command template: `node campaign-proof-log.mjs --priority "2" --proof-url "private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>" --status "sent"`

## Non-Stop Pulse Overlay

Pulse generated: 2026-06-08T06:47:17.664Z
Pulse actions available: 288
Pulse actions already proofed: 18
Pulse command center: `runtime/pulse-command-center.html`
Phone proof handoff: `runtime/proof-handoff.html`

These are the next live cadence actions. They keep every worker moving between formal queue rows. They do not close the urgent proof queue by themselves.

### Dexter

- Pulse: 201
- Scheduled: 2026-06-08 10:45 +0300
- Channel: Facebook/feed fallback
- Action: Post a friendly feed variant if Facebook is logged in.
- Asset: `media/worldcup26-referral-square.jpg`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=facebook-feed-fallback&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=dexter_pulse201

### Sienna

- Pulse: 198
- Scheduled: 2026-06-08 10:00 +0300
- Channel: Instagram/Facebook Story
- Action: Post story image with code and link sticker if logged in.
- Asset: `media/worldcup26-referral-story.jpg`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=instagram-facebook-story&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_pulse198

### Memo

- Pulse: 199
- Scheduled: 2026-06-08 10:15 +0300
- Channel: Asset audit
- Action: Confirm video and image assets are present on this worker.
- Asset: `promo-kit-manifest.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=asset-audit&utm_medium=internal&utm_campaign=worldcup26_referral_72h&utm_content=memo_pulse199

### Nano

- Pulse: 200
- Scheduled: 2026-06-08 10:30 +0300
- Channel: Telegram personal
- Action: Send the invite to one approved Telegram contact or group where welcome.
- Asset: `campaign/copy-bank.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=telegram-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_pulse200

## Rule For This Board

Post from owned accounts or places where the invite is welcome. After the real post, story, reply, or private outreach batch is done, run the proof command from that worker inbox so the monitor stops counting it as unproven.
