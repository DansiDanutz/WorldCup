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