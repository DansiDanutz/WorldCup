# WorldCup26 Posting Sprint

Generated: 2026-06-07 20:45 +0300

- Live proof rows: 49
- Urgent rows still needing real proof: 16
- Link sentinel: ok
- Deployment: dpl_4jhJsLzjVMmQ5ipVZC8svAftNoUD

This is the tiny action board for the next push. Open the asset, copy the caption, post/send from the real account, then log proof only after the action happened.

## Dexter - Priority 4

- Channel: Football groups
- Scheduled: 2026-06-06 08:00 +0300
- Action: Ask approved group admin for permission; post group variant only if allowed
- Asset: `campaign/first-wave-posts.md`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=football-groups&utm_medium=approval-first&utm_campaign=worldcup26_referral_72h&utm_content=dexter_h4

Copy:

```text
For football fans here:

WorldCup26 is a prediction game where you pick 3 teams free first and see your private points preview.

Paid leaderboard entry happens only when you use a ticket.

My invite code: 26BC4B90CB
Join here:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=football-groups&utm_medium=approval-first&utm_campaign=worldcup26_referral_72h&utm_content=dexter_h4

Follow-up:
Use only where group rules allow promo links. If unsure, ask the group admin before posting.
```

Proof note after real action:

```text
approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset/copy ready; code 26BC4B90CB and link included; post only after allowed
```

Proof command after real action:

```bash
node campaign-proof-log.mjs --priority "4" --proof-url "approval-request: asked admin <group/channel> at YYYY-MM-DD HH:mm EEST; asset/copy ready; code 26BC4B90CB and link included; post only after allowed" --status "requested"
```

## Sienna - Priority 1

- Channel: WhatsApp Status
- Scheduled: 2026-06-06 04:00 +0300
- Action: Post story asset with video caption 1
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-status&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h0

Copy:

```text
I invited you to WorldCup26.

Pick 3 teams for free, see your private points preview, and use a ticket only if you want to enter the paid leaderboard.

Use my referral code 26BC4B90CB when you join:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-status&utm_medium=manual-post&utm_campaign=worldcup26_referral_72h&utm_content=sienna_h0

The event has not started yet, so all teams are still available right now.

Follow-up:
If they ask what to do: Sign in, use the code, save 3 picks for free, then use a ticket later only if they want the paid leaderboard.
```

Proof note after real action:

```text
private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included
```

Proof command after real action:

```bash
node campaign-proof-log.mjs --priority "1" --proof-url "private-whatsapp-status: posted status from <phone/account> at YYYY-MM-DD HH:mm EEST; visible to contacts; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included" --status "posted"
```

## Memo - Pulse 147

- Channel: Proof audit
- Scheduled: 2026-06-07 21:15 +0300
- Action: Check proof log, list unproven current rows, and flag blocked channels.
- Asset: `runtime/posting-log-live.csv`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=proof-audit&utm_medium=internal&utm_campaign=worldcup26_referral_72h&utm_content=memo_pulse147

Copy:

```text
Ops pulse: verify proof rows, urgent rows, and blocked channels.

Referral: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=proof-audit&utm_medium=internal&utm_campaign=worldcup26_referral_72h&utm_content=memo_pulse147
Code: 26BC4B90CB
```

Proof note after real action:

```text
internal-log: prepared copy/asset handoff at YYYY-MM-DD HH:mm EEST; no public proof claimed; code 26BC4B90CB and link included
```

Proof command after real action:

```bash
node campaign-proof-log.mjs --pulse "147" --proof-url "internal-log: prepared copy/asset handoff at YYYY-MM-DD HH:mm EEST; no public proof claimed; code 26BC4B90CB and link included" --status "logged"
```

## Nano - Priority 2

- Channel: WhatsApp personal
- Scheduled: 2026-06-06 06:00 +0300
- Action: Send personal invite to warm contacts
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_h2

Copy:

```text
I invited you to WorldCup26.

Pick 3 teams for free, see your private points preview, and use a ticket only if you want to enter the paid leaderboard.

Use my referral code 26BC4B90CB when you join:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_referral_72h&utm_content=nano_h2

The event has not started yet, so all teams are still available right now.

Follow-up:
If they ask what to do: Sign in, use the code, save 3 picks for free, then use a ticket later only if they want the paid leaderboard.
```

Proof note after real action:

```text
private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>
```

Proof command after real action:

```bash
node campaign-proof-log.mjs --priority "2" --proof-url "private-whatsapp: sent to <N> warm contacts from <phone/account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB and link included; replies <N>" --status "sent"
```
