# WorldCup26 Worker Launchers

Generated: 2026-06-08 09:30 +0300

- Status: ok
- Active workers: 4/4
- Referral code: `26BC4B90CB`
- Referral link: https://worldcup26.world/login?ref=26BC4B90CB

These launchers prepare worker actions only. Log proof only after the real post, story, message batch, upload, reply, or approval request exists.

## First Send Bridge

- State: send-now
- Owner: Memo
- Channel: WhatsApp testers
- Open: runtime/first-send-bridge.html
- WhatsApp: https://wa.me/?text=I%20need%203%20clean%20WorldCup26%20signup%20tests%20now.%0A%0APlease%20send%20this%20to%20three%20trusted%20people%20with%20different%20Google%20accounts.%20They%20should%20open%20it%20on%20a%20fresh%20phone%2Fbrowser%2C%20accept%20the%20invite%2C%20continue%20with%20Google%2C%20and%20pick%203%20teams.%20Do%20not%20pay.%0A%0AAsk%20each%20tester%20to%20reply%20with%20one%20of%20these%3A%0A1.%20%22joined%20%2B%20picked%20teams%22%0A2.%20screenshot%20of%20the%20exact%20screen%20where%20it%20stops%0A%0ACode%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-testers%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dclean_signup_test
- Log command: `node campaign-public-channel-attempts.mjs --add --owner "Memo" --platform "WhatsApp testers" --channel "clean signup test batch" --status "sent" --attempt-url "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test" --detail "Sent clean signup test to <N> trusted testers from <account> at YYYY-MM-DD HH:mm EEST; asked each to accept invite, Google signup, pick 3 teams, and reply with success or blocking screenshot; code 26BC4B90CB included" --next-action "run campaign-signup-conversion-audit.mjs after tester replies or after 15 minutes"`
- Counts: warm attempts 0, signup saves 0, referral views 678, ad clicks 227

## Workers

- Nano: ready - #warm-1 WhatsApp personal
- Sienna: ready - #warm-3 WhatsApp personal
- Dexter: ready - #warm-4 WhatsApp admins
- Memo: ready - #warm-5 WhatsApp testers
