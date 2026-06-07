# WorldCup26 Sienna Launcher

Generated: 2026-06-07 20:45 +0300


- Action: #warm-3 WhatsApp personal
- Task: Send warm-contact invite to 10 close contacts.
- Asset: `media/worldcup26-referral-story.jpg`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=close_contacts_batch
- QR: -

These launchers prepare worker actions only. Log proof only after the real post, story, message batch, upload, reply, or approval request exists.

## Instruction

Send warm-contact invite to 10 close contacts.

## Copy

```text
Can you test my WorldCup26 invite?

Open this, accept the invite, sign in with Google, and pick 3 teams. It is free to preview points.

Code 26BC4B90CB:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=close_contacts_batch

Please tell me if anything feels confusing.
```

## Proof Command

```bash
node campaign-warm-send-log.mjs --priority warm-3 --count <N> --account "<account>" --replies 0
```

Full audit command:



```bash
node campaign-public-channel-attempts.mjs --add --owner 'Sienna' --platform 'WhatsApp personal' --channel "warm-contact sprint" --status 'sent' --attempt-url 'https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=close_contacts_batch' --detail 'WhatsApp personal: sent to <N> 10 close contacts from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-referral-story.jpg; code 26BC4B90CB; link included; replies/signups <N>' --next-action "watch replies/signups; help anyone who asks; run referral activity after 15 minutes"
```
