# WorldCup26 Worker Wake Board

Generated: 2026-06-07 20:45 +0300

- Status: ready
- Proof state: critical
- Latest external proof age: 3.5h
- Paid ad state: critical-paid-signup-friction
- Signup conversion state: critical-auth-to-signup-save-unproven
- Warm-contact sprint: active (warm-contact-sprint-needed)
- First human gate: needs-first-human-action; warm attempts 0; signup saves 0
- Paid-source views: 244
- Zero-signup rescue: active (critical-zero-signups)
- Urgent rows: 16
- Posting cockpit: `runtime/posting-cockpit.html`
- Paid ad triage: `runtime/paid-ad-triage.html`
- Signup conversion audit: `runtime/signup-conversion-audit.html`
- Warm-contact sprint: `runtime/warm-contact-sprint.html`
- Proof intake: `runtime/proof-intake.html`

Wake the worker, do the real action, then log proof with proof intake. Do not claim proof from this board alone.

## First Human Gate

- State: needs-first-human-action
- Warm attempts: 0
- Signup saves: 0
- Referral views: 171
- Ad clicks: 227
- Required action: Memo / WhatsApp testers - Send three clean referral signup tests
- WhatsApp: https://wa.me/?text=I%20need%203%20clean%20WorldCup26%20signup%20tests%20now.%0A%0APlease%20send%20this%20to%20three%20trusted%20people%20with%20different%20Google%20accounts.%20They%20should%20open%20it%20on%20a%20fresh%20phone%2Fbrowser%2C%20accept%20the%20invite%2C%20continue%20with%20Google%2C%20and%20pick%203%20teams.%20Do%20not%20pay.%0A%0AAsk%20each%20tester%20to%20reply%20with%20one%20of%20these%3A%0A1.%20%22joined%20%2B%20picked%20teams%22%0A2.%20screenshot%20of%20the%20exact%20screen%20where%20it%20stops%0A%0ACode%2026BC4B90CB%3A%0Ahttps%3A%2F%2Fworldcup26.world%2Flogin%3Fref%3D26BC4B90CB%26utm_source%3Dwhatsapp-testers%26utm_medium%3Dwarm-contact%26utm_campaign%3Dworldcup26_warm_contact_sprint%26utm_content%3Dclean_signup_test
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

## Dexter

- State: wake-now
- Assigned urgent rows: 3
- Next: #warm-4 WhatsApp admins
- Files: `runtime/worker-wake-dexter.html`, `runtime/worker-inbox-dexter.md`, `runtime/posting-cockpit.html`, `runtime/paid-ad-triage.html`, `runtime/signup-conversion-audit.html`, `runtime/warm-contact-sprint.html`, `runtime/proof-intake.html`

```text
Dexter, wake up now. Proof state is critical.
First 10 minutes: send the warm WhatsApp invite first if warm attempts are still zero.
Do this real action: #warm-4 WhatsApp admins - Send warm-contact invite to football group admins.
Use asset: media/worldcup26-referral-16x9.jpg
Use link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-admins&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_admin_permission
Use code: 26BC4B90CB
After the action exists, log proof. Do not log placeholders.
Proof/intake command: node campaign-public-channel-attempts.mjs --add --owner 'Dexter' --platform 'WhatsApp admins' --channel "warm-contact sprint" --status 'requested' --attempt-url 'https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-admins&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_admin_permission' --detail 'WhatsApp admins: requested to <N> football group admins from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-referral-16x9.jpg; code 26BC4B90CB; link included; replies/signups <N>' --next-action "watch replies/signups; help anyone who asks; run referral activity after 15 minutes"

Copy:
Can I share a small World Cup prediction game in the group?

It lets people pick 3 teams free and see a private score preview. If allowed, I will post this invite code: 26BC4B90CB
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-admins&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_admin_permission

Follow-up:
After sending, watch replies and run referral activity after 15 minutes. Use recipient counts or initials only.
```

## Sienna

- State: wake-now
- Assigned urgent rows: 8
- Next: #warm-3 WhatsApp personal
- Files: `runtime/worker-wake-sienna.html`, `runtime/worker-inbox-sienna.md`, `runtime/posting-cockpit.html`, `runtime/paid-ad-triage.html`, `runtime/signup-conversion-audit.html`, `runtime/warm-contact-sprint.html`, `runtime/proof-intake.html`

```text
Sienna, wake up now. Proof state is critical.
First 10 minutes: send the warm WhatsApp invite first if warm attempts are still zero.
Do this real action: #warm-3 WhatsApp personal - Send warm-contact invite to 10 close contacts.
Use asset: media/worldcup26-referral-story.jpg
Use link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=close_contacts_batch
Use code: 26BC4B90CB
After the action exists, log proof. Do not log placeholders.
Proof/intake command: node campaign-public-channel-attempts.mjs --add --owner 'Sienna' --platform 'WhatsApp personal' --channel "warm-contact sprint" --status 'sent' --attempt-url 'https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=close_contacts_batch' --detail 'WhatsApp personal: sent to <N> 10 close contacts from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-referral-story.jpg; code 26BC4B90CB; link included; replies/signups <N>' --next-action "watch replies/signups; help anyone who asks; run referral activity after 15 minutes"

Copy:
Can you test my WorldCup26 invite?

Open this, accept the invite, sign in with Google, and pick 3 teams. It is free to preview points.

Code 26BC4B90CB:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=close_contacts_batch

Please tell me if anything feels confusing.

Follow-up:
After sending, watch replies and run referral activity after 15 minutes. Use recipient counts or initials only.
```

## Memo

- State: wake-now
- Assigned urgent rows: 0
- Next: #warm-5 WhatsApp testers
- Files: `runtime/worker-wake-memo.html`, `runtime/worker-inbox-memo.md`, `runtime/posting-cockpit.html`, `runtime/paid-ad-triage.html`, `runtime/signup-conversion-audit.html`, `runtime/warm-contact-sprint.html`, `runtime/proof-intake.html`

```text
Memo, wake up now. Proof state is critical.
First 10 minutes: send the warm WhatsApp invite first if warm attempts are still zero.
Do this real action: #warm-5 WhatsApp testers - Send warm-contact invite to 3 trusted testers.
Use asset: runtime/signup-conversion-audit.html
Use link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=trusted_tester_signup
Use code: 26BC4B90CB
After the action exists, log proof. Do not log placeholders.
Proof/intake command: node campaign-public-channel-attempts.mjs --add --owner 'Memo' --platform 'WhatsApp testers' --channel "warm-contact sprint" --status 'sent' --attempt-url 'https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=trusted_tester_signup' --detail 'WhatsApp testers: sent to <N> 3 trusted testers from <account> at YYYY-MM-DD HH:mm EEST; asset runtime/signup-conversion-audit.html; code 26BC4B90CB; link included; replies/signups <N>' --next-action "watch replies/signups; help anyone who asks; run referral activity after 15 minutes"

Copy:
I need one clean signup test for WorldCup26.

Please open this link, accept the invite, continue with Google, and pick 3 teams. Do not pay. Tell me the exact step where it stops if anything breaks.

Code 26BC4B90CB:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=trusted_tester_signup

Follow-up:
After sending, watch replies and run referral activity after 15 minutes. Use recipient counts or initials only.
```

## Nano

- State: wake-now
- Assigned urgent rows: 5
- Next: #warm-1 WhatsApp personal
- Files: `runtime/worker-wake-nano.html`, `runtime/worker-inbox-nano.md`, `runtime/posting-cockpit.html`, `runtime/paid-ad-triage.html`, `runtime/signup-conversion-audit.html`, `runtime/warm-contact-sprint.html`, `runtime/proof-intake.html`

```text
Nano, wake up now. Proof state is critical.
First 10 minutes: send the warm WhatsApp invite first if warm attempts are still zero.
Do this real action: #warm-1 WhatsApp personal - Send warm-contact invite to 10 football friends.
Use asset: media/worldcup26-main-video.mp4
Use link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch
Use code: 26BC4B90CB
After the action exists, log proof. Do not log placeholders.
Proof/intake command: node campaign-public-channel-attempts.mjs --add --owner 'Nano' --platform 'WhatsApp personal' --channel "warm-contact sprint" --status 'sent' --attempt-url 'https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch' --detail 'WhatsApp personal: sent to <N> 10 football friends from <account> at YYYY-MM-DD HH:mm EEST; asset media/worldcup26-main-video.mp4; code 26BC4B90CB; link included; replies/signups <N>' --next-action "watch replies/signups; help anyone who asks; run referral activity after 15 minutes"

Copy:
Quick football question: pick 3 teams for WorldCup26.

It is free to choose teams and see your private points preview. Paid leaderboard is optional later.

Use my code 26BC4B90CB:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=football_friends_batch

Send me your 3 teams after you join.

Follow-up:
After sending, watch replies and run referral activity after 15 minutes. Use recipient counts or initials only.
```
