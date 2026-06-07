# WorldCup26 Warm Follow-up Monitor

Generated: 2026-06-07 20:45 +0300

- State: awaiting-first-human-send
- Warm attempts: 0
- Tester attempts: 0
- Follow-up attempts: 0
- Follow-up window: 15 minutes
- Views: 509
- Referral views: 171
- Profiles: 5
- Accepted referrals: 0
- Signup saves: 0
- Entries: 0

No warm-contact or clean tester-batch attempt has been logged yet.

## Next Action

Send the first clean tester batch or warm-contact batch, then log it with the real count/account note.

```bash
node campaign-referral-activity.mjs && node campaign-signup-conversion-audit.mjs && node campaign-warm-followup-monitor.mjs && sed -n '1,100p' runtime/warm-followup-monitor.txt
```

This monitor does not prove a send. It only reacts after a real warm-contact or clean tester-batch attempt has been logged.
