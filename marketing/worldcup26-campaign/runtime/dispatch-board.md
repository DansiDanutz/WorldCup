# WorldCup26 Worker Dispatch Board

Generated: 2026-06-07T17:46:16.913Z

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

Pulse generated: 2026-06-07T17:46:16.852Z
Pulse actions available: 288
Pulse actions already proofed: 18
Pulse command center: `runtime/pulse-command-center.html`
Phone proof handoff: `runtime/proof-handoff.html`

These are the next live cadence actions. They keep every worker moving between formal queue rows. They do not close the urgent proof queue by themselves.

### Dexter

- Pulse: 149
- Scheduled: 2026-06-07 21:45 +0300
- Channel: Football groups
- Action: Ask one football group admin for approval; post only if welcome.
- Asset: `campaign/first-wave-posts.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=football-groups&utm_medium=approval-first&utm_campaign=worldcup26_referral_72h&utm_content=dexter_pulse149

### Sienna

- Pulse: 146
- Scheduled: 2026-06-07 21:00 +0300
- Channel: WhatsApp Status
- Action: Post the video/status copy if WhatsApp is available.
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-status&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_pulse146

### Memo

- Pulse: 147
- Scheduled: 2026-06-07 21:15 +0300
- Channel: Proof audit
- Action: Check proof log, list unproven current rows, and flag blocked channels.
- Asset: `runtime/posting-log-live.csv`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=proof-audit&utm_medium=internal&utm_campaign=worldcup26_referral_72h&utm_content=memo_pulse147

### Nano

- Pulse: 148
- Scheduled: 2026-06-07 21:30 +0300
- Channel: WhatsApp personal
- Action: Send one warm-contact batch if WhatsApp is available.
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_pulse148

## Rule For This Board

Post from owned accounts or places where the invite is welcome. After the real post, story, reply, or private outreach batch is done, run the proof command from that worker inbox so the monitor stops counting it as unproven.
