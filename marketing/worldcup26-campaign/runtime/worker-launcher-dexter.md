# WorldCup26 Dexter Launcher

Generated: 2026-06-07 20:45 +0300


- Action: #warm-4 WhatsApp admins
- Task: Send warm-contact invite to football group admins.
- Asset: `media/worldcup26-referral-16x9.jpg`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-admins&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_admin_permission
- QR: -

These launchers prepare worker actions only. Log proof only after the real post, story, message batch, upload, reply, or approval request exists.

## Instruction

Send warm-contact invite to football group admins.

## Copy

```text
Can I share a small World Cup prediction game in the group?

It lets people pick 3 teams free and see a private score preview. If allowed, I will post this invite code: 26BC4B90CB
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-admins&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_admin_permission
```

## Proof Command

```bash
node campaign-warm-send-log.mjs --priority warm-4 --count <N> --account "<account>" --replies 0
```

Full audit command:



```bash
node campaign-public-channel-attempts.mjs --add --owner 'Dexter' --platform 'WhatsApp admins' --channel "warm-contact sprint" --status 'requested' --attempt-url 'https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-admins&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_admin_permission' --detail 'WhatsApp admins: requested to <N> football group admins from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-referral-16x9.jpg; code 26BC4B90CB; link included; replies/signups <N>' --next-action "watch replies/signups; help anyone who asks; run referral activity after 15 minutes"
```
