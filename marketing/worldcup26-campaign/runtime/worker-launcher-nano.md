# WorldCup26 Nano Launcher

Generated: 2026-06-07 20:45 +0300


- Action: #warm-1 WhatsApp personal
- Task: Send warm-contact invite to 10 football friends.
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch
- QR: -

These launchers prepare worker actions only. Log proof only after the real post, story, message batch, upload, reply, or approval request exists.

## Instruction

Send warm-contact invite to 10 football friends.

## Copy

```text
Quick football question: pick 3 teams for WorldCup26.

It is free to choose teams and see your private points preview. Paid leaderboard is optional later.

Use my code 26BC4B90CB:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch

Send me your 3 teams after you join.
```

## Proof Command

```bash
node campaign-warm-send-log.mjs --priority warm-1 --count <N> --account "<account>" --replies 0
```

Full audit command:



```bash
node campaign-public-channel-attempts.mjs --add --owner 'Nano' --platform 'WhatsApp personal' --channel "warm-contact sprint" --status 'sent' --attempt-url 'https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch' --detail 'WhatsApp personal: sent to <N> 10 football friends from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB; link included; replies/signups <N>' --next-action "watch replies/signups; help anyone who asks; run referral activity after 15 minutes"
```
