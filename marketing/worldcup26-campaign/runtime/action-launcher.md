# WorldCup26 Action Launcher

Generated: 2026-06-08 09:52 +0300

- Action: #warm-1 Nano / WhatsApp personal
- Task: Send warm-contact invite to 10 football friends.
- Asset: `media/worldcup26-main-video.mp4`
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch
- QR: -

This launcher prepares the action only. It is not proof and must not be logged as proof by itself.

## Phone Instruction

After sending, watch replies and run referral activity after 15 minutes. Use recipient counts or initials only.

## Share Links

- WhatsApp: https://wa.me/?text=Quick%20football%20question%3A%20pick%203%20teams%20for%20WorldCup26.%0A%0AIt%20is%20free%20to%20choose%20teams%20and%20see%20your%20private%20points%20preview.%20Paid%20leaderboard%20is%20optional%20later.%0A%0AUse%20my%20code%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-personal%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dfootball_friends_batch%0A%0ASend%20me%20your%203%20teams%20after%20you%20join.
- Telegram: https://t.me/share/url?url=https%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-personal%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dfootball_friends_batch&text=Quick%20football%20question%3A%20pick%203%20teams%20for%20WorldCup26.%0A%0AIt%20is%20free%20to%20choose%20teams%20and%20see%20your%20private%20points%20preview.%20Paid%20leaderboard%20is%20optional%20later.%0A%0AUse%20my%20code%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-personal%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dfootball_friends_batch%0A%0ASend%20me%20your%203%20teams%20after%20you%20join.

## Copy

```text
Quick football question: pick 3 teams for WorldCup26.

It is free to choose teams and see your private points preview. Paid leaderboard is optional later.

Use my code 26BC4B90CB:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch

Send me your 3 teams after you join.
```

## Proof Command

Run this only after the real action exists and placeholders are replaced.

Quick log:

```bash
node campaign-warm-send-log.mjs --priority warm-1 --count <N> --account "<account>" --replies 0
```

Full audit command:


```bash
node campaign-public-channel-attempts.mjs --add --owner 'Nano' --platform 'WhatsApp personal' --channel "warm-contact sprint" --status 'sent' --attempt-url 'https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch' --detail 'WhatsApp personal: sent to <N> 10 football friends from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB; link included; replies/signups <N>' --next-action "watch replies/signups; help anyone who asks; run referral activity after 15 minutes"
```
