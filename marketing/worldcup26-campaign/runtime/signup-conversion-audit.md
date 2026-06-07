# WorldCup26 Signup Conversion Audit

Generated: 07/06/2026 20:44

- State: `critical-auth-to-signup-save-unproven`
- Referral code: `26BC4B90CB`
- Referral link: https://worldcup26.world/login?ref=26BC4B90CB
- App views: 509
- Referral views: 171
- Paid-source views: 244
- Dashboard clicks: 227
- Signup saves: 0
- Accepted referral rows: 0
- Signup returned events: 0
- Signup save attempts: 0
- Signup saved events: 0
- Signup failed/error events: 0
- Browser proof: `runtime/proofs/referral-mobile-accepted-google-enabled-20260607-1754.png`
- Post-auth save endpoint: ok unauthenticated HTTP 401

## Diagnosis

The invite landing path is visible and the accepted Google button has browser proof, but the full Google-auth-to-referral-save path is not proven yet.

The `/api/referrals/signup` endpoint exists and correctly requires a Google bearer token. The remaining test must happen after a real Google account returns to the app.

## Blockers

- No saved referral signup exists after Google auth.
- No logged-in dashboard return event exists for the referral code yet.
- No accepted referral agreement row is visible in the campaign counts.
- Paid clicks are present, but none reached a completed signup-save event.

## First Action

Send the clean signup test to 3 trusted people with different Google accounts using https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test. Ask each to accept the invite, continue with Google, pick 3 teams, and reply with either "joined + picked teams" or a screenshot of the exact blocking screen. After the real send is logged, rerun this audit and verify the dashboard POSTs /api/referrals/signup with a bearer token and that worldcup_referral_profiles stores signup_referral_code=26BC4B90CB.

## Proof Rule

Do not claim signup conversion proof until there is a real new user/profile plus referral signup save row, or a clear private-channel tester note with account, timestamp, and screenshot.

## Memo Command

```bash
node campaign-public-channel-attempts.mjs --add --owner "Memo" --platform "WhatsApp testers" --channel "clean signup test batch" --status "sent" --attempt-url "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-testers&utm_medium=warm-contact&utm_campaign=worldcup26_warm_contact_sprint&utm_content=clean_signup_test" --detail "Sent clean signup test to <N> trusted testers from <account> at YYYY-MM-DD HH:mm EEST; asked each to accept invite, Google signup, pick 3 teams, and reply with success or blocking screenshot; code 26BC4B90CB included" --next-action "run campaign-signup-conversion-audit.mjs after tester replies or after 15 minutes"
```
