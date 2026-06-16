# WorldCup26 First Human Actions

Generated: 2026-06-08 09:52 +0300

- State: `needs-first-human-action`
- Warm attempts: 0
- Signup saves: 0
- Referral views: 678
- Dashboard clicks: 227
- Signup returned events: 0
- Signup save attempts: 0

First priority is three clean Google signup tests because the live funnel has zero returned/attempt events. Do not log planned work as proof.

## Send three clean referral signup tests

- Owner: Memo
- Channel: WhatsApp testers
- Why: The referral page and Google button are visible, paid clicks are arriving, but zero users have returned from Google or saved the referral. One tester is too fragile now; ask three trusted people.
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test
- WhatsApp: https://wa.me/?text=I%20need%203%20clean%20WorldCup26%20signup%20tests%20now.%0A%0APlease%20send%20this%20to%20three%20trusted%20people%20with%20different%20Google%20accounts.%20They%20should%20open%20it%20on%20a%20fresh%20phone%2Fbrowser%2C%20accept%20the%20invite%2C%20continue%20with%20Google%2C%20and%20pick%203%20teams.%20Do%20not%20pay.%0A%0AAsk%20each%20tester%20to%20reply%20with%20one%20of%20these%3A%0A1.%20%22joined%20%2B%20picked%20teams%22%0A2.%20screenshot%20of%20the%20exact%20screen%20where%20it%20stops%0A%0ACode%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-testers%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dclean_signup_test
- Telegram: https://t.me/share/url?url=https%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-testers%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dclean_signup_test&text=I%20need%203%20clean%20WorldCup26%20signup%20tests%20now.%0A%0APlease%20send%20this%20to%20three%20trusted%20people%20with%20different%20Google%20accounts.%20They%20should%20open%20it%20on%20a%20fresh%20phone%2Fbrowser%2C%20accept%20the%20invite%2C%20continue%20with%20Google%2C%20and%20pick%203%20teams.%20Do%20not%20pay.%0A%0AAsk%20each%20tester%20to%20reply%20with%20one%20of%20these%3A%0A1.%20%22joined%20%2B%20picked%20teams%22%0A2.%20screenshot%20of%20the%20exact%20screen%20where%20it%20stops%0A%0ACode%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-testers%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dclean_signup_test
- SMS: sms:?&body=I%20need%203%20clean%20WorldCup26%20signup%20tests%20now.%0A%0APlease%20send%20this%20to%20three%20trusted%20people%20with%20different%20Google%20accounts.%20They%20should%20open%20it%20on%20a%20fresh%20phone%2Fbrowser%2C%20accept%20the%20invite%2C%20continue%20with%20Google%2C%20and%20pick%203%20teams.%20Do%20not%20pay.%0A%0AAsk%20each%20tester%20to%20reply%20with%20one%20of%20these%3A%0A1.%20%22joined%20%2B%20picked%20teams%22%0A2.%20screenshot%20of%20the%20exact%20screen%20where%20it%20stops%0A%0ACode%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-testers%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dclean_signup_test
- Done when: The tester batch is really sent and logged with count/account, then a real profile plus referral signup-save row appears, or a precise tester screenshot captures the failing step.

```text
I need 3 clean WorldCup26 signup tests now.

Please send this to three trusted people with different Google accounts. They should open it on a fresh phone/browser, accept the invite, continue with Google, and pick 3 teams. Do not pay.

Ask each tester to reply with one of these:
1. "joined + picked teams"
2. screenshot of the exact screen where it stops

Code 26BC4B90CB:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Memo" --platform "WhatsApp testers" --channel "clean signup test batch" --status "sent" --attempt-url "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test" --detail "Sent clean signup test to <N> trusted testers from <account> at YYYY-MM-DD HH:mm EEST; asked each to accept invite, Google signup, pick 3 teams, and reply with success or blocking screenshot; code 26BC4B90CB included" --next-action "run campaign-signup-conversion-audit.mjs after tester replies or after 15 minutes"
```

## Send the first real warm-contact batch

- Owner: Nano
- Channel: WhatsApp personal
- Why: Paid ads have clicks but no signup saves. A warm private send is the fastest proof-safe path to a real user.
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch
- WhatsApp: https://wa.me/?text=Quick%20football%20question%3A%20pick%203%20teams%20for%20WorldCup26.%0A%0AIt%20is%20free%20to%20choose%20teams%20and%20see%20your%20private%20points%20preview.%20Paid%20leaderboard%20is%20optional%20later.%0A%0AUse%20my%20code%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-personal%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dfootball_friends_batch%0A%0ASend%20me%20your%203%20teams%20after%20you%20join.
- Telegram: https://t.me/share/url?url=https%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-personal%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dfootball_friends_batch&text=Quick%20football%20question%3A%20pick%203%20teams%20for%20WorldCup26.%0A%0AIt%20is%20free%20to%20choose%20teams%20and%20see%20your%20private%20points%20preview.%20Paid%20leaderboard%20is%20optional%20later.%0A%0AUse%20my%20code%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-personal%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dfootball_friends_batch%0A%0ASend%20me%20your%203%20teams%20after%20you%20join.
- SMS: sms:?&body=Quick%20football%20question%3A%20pick%203%20teams%20for%20WorldCup26.%0A%0AIt%20is%20free%20to%20choose%20teams%20and%20see%20your%20private%20points%20preview.%20Paid%20leaderboard%20is%20optional%20later.%0A%0AUse%20my%20code%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-personal%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dfootball_friends_batch%0A%0ASend%20me%20your%203%20teams%20after%20you%20join.
- Done when: A public-channel attempt row exists with status sent/requested and a real count/account note.

```text
Quick football question: pick 3 teams for WorldCup26.

It is free to choose teams and see your private points preview. Paid leaderboard is optional later.

Use my code 26BC4B90CB:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch

Send me your 3 teams after you join.
```

```bash
node campaign-warm-send-log.mjs --priority warm-1 --count <N> --account "<account>" --replies 0
```
