# WorldCup26 Tester Batch Operator

Generated: 07/06/2026 21:54

- State: `send-tester-batch-now`
- Owner: Memo
- Platform: WhatsApp testers
- Referral code: `26BC4B90CB`
- Tester attempts: 0
- Signup saves: 0
- Google returns: 0
- Dashboard clicks: 227

Only run the log command after the tester batch was really sent. Replace <N>, <account>, and timestamp with the real private-channel note.

## Send Now

- WhatsApp: https://wa.me/?text=I%20need%203%20clean%20WorldCup26%20signup%20tests%20now.%0A%0APlease%20send%20this%20to%20three%20trusted%20people%20with%20different%20Google%20accounts.%20They%20should%20open%20it%20on%20a%20fresh%20phone%2Fbrowser%2C%20accept%20the%20invite%2C%20continue%20with%20Google%2C%20and%20pick%203%20teams.%20Do%20not%20pay.%0A%0AAsk%20each%20tester%20to%20reply%20with%20one%20of%20these%3A%0A1.%20%22joined%20%2B%20picked%20teams%22%0A2.%20screenshot%20of%20the%20exact%20screen%20where%20it%20stops%0A%0ACode%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-testers%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dclean_signup_test
- Tester link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test
- QR: https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=https%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-testers%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dclean_signup_test

```text
I need 3 clean WorldCup26 signup tests now.

Please send this to three trusted people with different Google accounts. They should open it on a fresh phone/browser, accept the invite, continue with Google, and pick 3 teams. Do not pay.

Ask each tester to reply with one of these:
1. "joined + picked teams"
2. screenshot of the exact screen where it stops

Code 26BC4B90CB:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test
```

## Log After Real Send

```bash
node campaign-public-channel-attempts.mjs --add --owner "Memo" --platform "WhatsApp testers" --channel "clean signup test batch" --status "sent" --attempt-url "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test" --detail "Sent clean signup test to <N> trusted testers from <account> at YYYY-MM-DD HH:mm EEST; asked each to accept invite, Google signup, pick 3 teams, and reply with success or blocking screenshot; code 26BC4B90CB included" --next-action "run campaign-signup-conversion-audit.mjs after tester replies or after 15 minutes"
```

## Done When

A real tester reply proves joined + picked teams, or a screenshot captures the exact blocking screen, and signup-conversion-audit is rerun.
