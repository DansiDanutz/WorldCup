# WorldCup26 Proof Closeout

Generated: 2026-06-07 20:45 +0300

- Status: ok
- Proof state: critical
- Latest external proof age: 3.5h
- Referral code: `26BC4B90CB`

Run one of these commands only after the matching real post, story, message batch, upload, reply, or approval request exists. Edit account/audience if the suggested value is not true.

## #1 Sienna / WhatsApp Status

- Action: Post story asset with video caption 1
- Suggested account: personal phone
- Suggested audience: WhatsApp contacts
- Status: posted

```bash
node campaign-proof-intake.mjs --priority 1 --account 'personal phone' --audience 'WhatsApp contacts' --happened-at '2026-06-07 20:45 +0300' --status posted
```

## #2 Nano / WhatsApp personal

- Action: Send personal invite to warm contacts
- Suggested account: personal phone
- Suggested audience: warm contacts
- Status: sent

```bash
node campaign-proof-intake.mjs --priority 2 --account 'personal phone' --audience 'warm contacts' --happened-at '2026-06-07 20:45 +0300' --status sent
```

## #3 Sienna / Instagram/Facebook story

- Action: Story: Code 26BC4B90CB + link sticker
- Suggested account: Meta account
- Suggested audience: story followers
- Status: posted

```bash
node campaign-proof-intake.mjs --priority 3 --account 'Meta account' --audience 'story followers' --happened-at '2026-06-07 20:45 +0300' --status posted
```

## #4 Dexter / Football groups

- Action: Ask approved group admin for permission; post group variant only if allowed
- Suggested account: posting account
- Suggested audience: football group admin or approved group
- Status: requested

```bash
node campaign-proof-intake.mjs --priority 4 --account 'posting account' --audience 'football group admin or approved group' --happened-at '2026-06-07 20:45 +0300' --status requested
```

## #5 Sienna / TikTok/Reels/Shorts

- Action: Upload main video with short caption and code in first line
- Suggested account: TikTok account
- Suggested audience: public TikTok viewers
- Status: uploaded

```bash
node campaign-proof-intake.mjs --priority 5 --account 'TikTok account' --audience 'public TikTok viewers' --happened-at '2026-06-07 20:45 +0300' --status uploaded
```

## #6 Nano / DM follow-up

- Action: Reply to first reactions and send the simple how-it-works answer
- Suggested account: posting account
- Suggested audience: reply thread or contact initials
- Status: replied

```bash
node campaign-proof-intake.mjs --priority 6 --account 'posting account' --audience 'reply thread or contact initials' --happened-at '2026-06-07 20:45 +0300' --status replied
```
