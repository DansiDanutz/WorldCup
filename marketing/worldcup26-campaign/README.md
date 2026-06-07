# WorldCup26 72-Hour Referral Campaign

Referral owner: `26BC4B90CB`

Primary invite:

```text
I invited you to WorldCup26.

Pick 3 teams for free, see your private points preview, and use a ticket only if you want to enter the paid leaderboard.

Use my referral code 26BC4B90CB when you join:
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=campaign-readme&utm_medium=operator-doc&utm_campaign=worldcup26_referral_72h&utm_content=primary_invite
```

Primary CTA: `Join with code 26BC4B90CB`

Campaign window: next 72 hours from activation.

## Assets

- Landing page fallback: `https://worldcup26.world/login?ref=26BC4B90CB&utm_source=campaign-readme&utm_medium=operator-doc&utm_campaign=worldcup26_referral_72h&utm_content=asset_list`
- Video source project: `/Users/davidai/Documents/WorldCup/marketing/worldcup26-ad`
- Existing video renderer: `/Users/davidai/Documents/WorldCup/marketing/worldcup26-ad/README.md`
- Still frame found in repo: `/Users/davidai/Documents/WorldCup/marketing/worldcup26-ad/shots/passive.png`
- Generated promo kit: `/Users/davidai/Desktop/DavidAi/worldcup26-promo-kit.zip`
- Current video candidate inside kit: `media/worldcup26-main-video.mp4`
- Referral image assets: `marketing/worldcup26-campaign/assets/`
- QR share cards: `media/worldcup26-qr-story.jpg`, `media/worldcup26-qr-square.jpg`, `media/worldcup26-referral-qr.png`

No final MP4 was found inside the WorldCup repo. If the final rendered video exists outside the repo, use it as the lead media on every post. If not, render it from `marketing/worldcup26-ad` before wide posting.

## Operating Rules

- Use owned accounts, groups where posting is allowed, direct friends, and communities where invitation links are welcome.
- Do not spam the same message repeatedly into the same place.
- Always vary copy and lead angle.
- Keep prize wording dynamic: say `live prize pool` or `top leaderboard rewards`, not a fixed amount unless the site shows that amount at posting time.
- Every post must include either a tracked referral link or the referral code.
- Every reply should answer one question and then return to the CTA: join, save 3 picks free, use a ticket later only for paid leaderboard entry, invite friends.

## 72-Hour Rhythm

Use four lanes in parallel:

1. Short-form video posts: TikTok, Instagram Reels, YouTube Shorts, Facebook Reels.
2. Social feed posts: X, Facebook profile/page/groups, Instagram caption, LinkedIn personal post if relevant.
3. Direct community invites: WhatsApp, Telegram, Discord, Messenger, private football groups.
4. Comment/reply work: answer questions, clarify rules, invite friends to use the code.

Posting target per 24 hours:

- 4 video posts per major owned short-form channel.
- 6-10 feed/story posts spread across channels.
- 30-50 direct personal/community conversations where the context is welcome.
- 2 refresh posts using screenshots from the site: leaderboard, pick teams, agent deal.
- Use the QR story/square cards for WhatsApp Status, Instagram/Facebook Story, and in-person sharing when a scan is easier than typing the code.

## Worker Assignment

- Dexter: football fan copy, short punchy hooks, group/forum variations.
- Sienna: visual captions, story copy, friendlier community posts.
- Memo: operations tracker, channel log, repost timing, UTM/referral consistency.
- Nano: reply bank, objections, micro-posts, WhatsApp/Telegram variants.

Detailed missions are in `worker-missions.md`.

The timestamped execution queue is in `72h-posting-queue.csv`.

Latest queue expansion: `75` campaign actions across the 72-hour window, including short video, stories/status, X/feed posts, Facebook, WhatsApp/Telegram, creator/group outreach, replies, ops checks, and the live X fallback row for blocked Meta/WhatsApp proof windows.

## First Hour Checklist

- Confirm final MP4 location or render it from `marketing/worldcup26-ad`.
- Post the main invite once to owned WhatsApp/Telegram contacts.
- Publish one video post with the direct referral link in caption.
- Publish one feed post explaining the simple game: pick 3 teams free first, then paid leaderboard only with ticket.
- Start a campaign log from `posting-log-template.csv`.
- Fill partner targets in `partner-targets-template.csv`.
- Assign worker lanes from `worker-missions.md`.

## Worker Runner

Use the no-dependency runner to keep the next 72 hours organized:

```bash
cd ~/DavidAi/worldcup26-promo-kit/campaign
node campaign-runner.mjs --window-hours 12
node campaign-runner.mjs --owner Dexter --window-hours 24
node campaign-runner.mjs --owner Sienna --window-hours 24
node campaign-runner.mjs --owner Memo --window-hours 24
node campaign-runner.mjs --owner Nano --window-hours 24
```

The runner writes:

- `runtime/campaign-status.json`
- `runtime/outbox-ready.csv`
- `runtime/draft-pack-all.md`
- `runtime/draft-pack-dexter.md`
- `runtime/draft-pack-sienna.md`
- `runtime/draft-pack-memo.md`
- `runtime/draft-pack-nano.md`
- `runtime/next-actions-dexter.md`
- `runtime/next-actions-sienna.md`
- `runtime/next-actions-memo.md`
- `runtime/next-actions-nano.md`
- `runtime/share-links.csv`
- `runtime/share-command-center.html`
- `runtime/live-campaign-monitor.json`
- `runtime/live-campaign-monitor.md`
- `runtime/posting-proof-report.json`
- `runtime/posting-proof-report.md`
- `runtime/post-now.md`
- `runtime/post-now.csv`
- `runtime/post-now-proof-rows.csv`
- `runtime/posting-log-live.csv`
- `runtime/dispatch-board.md`
- `runtime/paid-traffic-guard.json`
- `runtime/paid-traffic-guard.md`
- `runtime/paid-traffic-guard.txt`
- `runtime/paid-traffic-guard.html`
- `runtime/live-ad-qa.json`
- `runtime/live-ad-qa.md`
- `runtime/live-ad-qa.txt`
- `runtime/live-ad-qa.html`
- `runtime/next-hour-handoff.md`
- `runtime/next-hour-handoff.html`
- `runtime/phone-action-sheet.md`
- `runtime/phone-action-center.html`
- `runtime/top-six-mobile.json`
- `runtime/top-six-mobile.md`
- `runtime/top-six-mobile.txt`
- `runtime/top-six-mobile.html`
- `runtime/proof-sla.json`
- `runtime/proof-sla.md`
- `runtime/proof-sla.txt`
- `runtime/proof-sla.html`
- `runtime/proof-audit.json`
- `runtime/proof-audit.md`
- `runtime/proof-audit.txt`
- `runtime/proof-audit.html`
- `runtime/proof-url-recovery.json`
- `runtime/proof-url-recovery.md`
- `runtime/proof-url-recovery.txt`
- `runtime/proof-url-recovery.html`
- `runtime/proof-rescue.json`
- `runtime/proof-rescue.md`
- `runtime/proof-rescue.txt`
- `runtime/proof-rescue.html`
- `runtime/social-rescue-pack.json`
- `runtime/social-rescue-pack.md`
- `runtime/social-rescue-pack.txt`
- `runtime/social-rescue-pack.html`
- `runtime/proof-intake.json`
- `runtime/proof-intake.md`
- `runtime/proof-intake.txt`
- `runtime/proof-intake.html`
- `runtime/posting-cockpit.json`
- `runtime/posting-cockpit.md`
- `runtime/posting-cockpit.txt`
- `runtime/posting-cockpit.html`
- `runtime/worker-wake-board.json`
- `runtime/worker-wake-board.md`
- `runtime/worker-wake-board.txt`
- `runtime/worker-wake-board.html`
- `runtime/worker-wake-dexter.html`
- `runtime/worker-wake-sienna.html`
- `runtime/worker-wake-memo.html`
- `runtime/worker-wake-nano.html`
- `runtime/urgent-phone-handoff.md`
- `runtime/todays-10-handoff.md`
- `runtime/worker-inbox-dexter.md`
- `runtime/worker-inbox-sienna.md`
- `runtime/worker-inbox-memo.md`
- `runtime/worker-inbox-nano.md`

It prepares actions, exact copy drafts, per-channel tracked share links, live overdue/due-now pressure reports, proof reports, and log-ready outbox rows only. Actual posting stays manual on owned accounts or approved communities.

The runner reads `runtime/posting-log-live.csv` before building the live monitor. A queued action is treated as proven only when the live log has a posted/sent/done/published/logged row matching owner, channel, asset, and link. If the log uses the base referral link instead of a tracked UTM link, include `scheduled_at_eest` so the runner can match the exact queue row without hiding future duplicate actions.

For immediate execution, open `runtime/urgent-phone-handoff.md`, `runtime/phone-action-center.html`, `runtime/post-now.md`, or `runtime/share-command-center.html`. The post-now files list only urgent rows still missing proof, with exact copy and exact proof-log rows. The phone handoff files keep the same urgent queue in a simpler, non-technical format for posting from a phone. `runtime/todays-10-handoff.md` is kept as a compatibility alias. After publishing from an owned account or approved community, append the matching row from `runtime/post-now-proof-rows.csv` to `runtime/posting-log-live.csv`, replacing `ADD_POST_URL_OR_ACCOUNT_NOTE` with the public post URL or a clear private-channel note.

For the fastest phone push, open `runtime/top-six-mobile.html`. It contains only the first six external actions that need proof, with caption copy, asset links, mobile share links, and proof templates. This is the best handoff when a logged-in phone/social account is available and the full action center is too much to scan.

When external proof starts aging, open `runtime/proof-sla.html` first. It turns the latest proof freshness into a simple state (`fresh`, `warning`, or `critical`) and shows the oldest real-world actions with copy buttons, share links, and exact proof commands. It is a recovery handoff only: it still does not prove that posts, stories, messages, uploads, replies, or approval requests happened.

Open `runtime/proof-audit.html` whenever the campaign status looks green but proof is still stale. It separates real external proof, public URL proof, private-channel notes, internal bookkeeping, invalid proof rows, and the next proof action. This is the truth page: if it says proof is not fresh, no worker should claim the campaign is externally proven yet.

Open `runtime/proof-url-recovery.html` when an X proof row is fresh but only has a private note because the public permalink was not captured. It gives X profile/search links and the exact `--force` proof command to upgrade the row after the public status URL is visible. Do not use it to invent a URL.

When proof is critical, open `runtime/proof-rescue.html`. It strips the whole campaign down to the first few phone actions that unblock proof activity: publish the WhatsApp Status, send the personal WhatsApp batch, publish the Story, and request/post in a football group. It has copy buttons for captions and proof commands, but the same rule applies: do the real action first, then log proof.

For one-tap social sharing, open `runtime/social-rescue-pack.html`. It takes the same first proof-rescue actions and exposes WhatsApp, Telegram, X, and Facebook share buttons plus caption/proof copy buttons. It also links worker-specific pages such as `runtime/social-rescue-sienna.html`, `runtime/social-rescue-nano.html`, and `runtime/social-rescue-dexter.html` with per-action QR codes, tracked-link copy buttons, and asset open/download buttons. It is for performing the real action faster, not for pretending proof exists.

For the simplest operator start page, open `runtime/posting-cockpit.html`. It links the proof SLA, proof rescue, social rescue, top-six mobile handoff, full phone action center, share command center, paid traffic guard, and the current assets from one screen. Use it to perform the real action, then copy the matching proof command only after the action exists.

For the fastest zero-signup rescue handoff, open:

```bash
node campaign-one-click-share.mjs
open runtime/one-click-share.html
```

This creates a compact page with the four urgent real-account actions, direct WhatsApp/Telegram/X/Facebook share links, copy buttons for the post text, and copy buttons for proof commands. It still does not prove an external post happened; it only makes the owned-account step fast enough to execute immediately.

For the broader public outreach map, open:

```bash
node campaign-public-outreach-targets.mjs
open runtime/public-outreach-targets.html
```

This page lists the next owned/social/search targets across WhatsApp, Stories, X, YouTube, TikTok/Reels, Instagram hashtags, Facebook groups, Reddit, Telegram, and Discord. It includes search links, copy blocks, share links, and either the matching proof-log command for the formal urgent rows or a public-attempts command for extra outreach. It is still a target map, not proof.

The public outreach target map must include all four workers: Dexter, Sienna, Memo, and Nano. If any worker has no live outreach lane, `campaign-public-outreach-targets.mjs` reports `ok=no`.

For a sharper four-worker wake-up, open `runtime/worker-wake-board.html` or one of the per-worker pages:

```bash
node campaign-worker-wake.mjs
sed -n '1,120p' runtime/worker-wake-board.txt
```

The wake board gives Dexter, Sienna, Memo, and Nano one current instruction each. It follows the live urgent rows and proof SLA state, but it is still only an instruction board. It does not post, message, or log proof.

After a real action exists, use `runtime/proof-intake.html` or the CLI helper to build a specific proof note without hand-editing CSV:

```bash
node campaign-proof-intake.mjs --priority 1 --account "personal phone" --audience "WhatsApp contacts" --happened-at "2026-06-07 00:55 +0300" --status posted
node campaign-proof-intake.mjs --priority 5 --public-url "https://public-post-url"
```

The helper calls `campaign-proof-log.mjs`, so the same duplicate checks and placeholder-proof refusal still apply.

Use the proof logger after a real post, story, message batch, or outreach action has happened:

```bash
node campaign-proof-log.mjs --list
node campaign-proof-log.mjs --priority 3 --proof-url "https://x.com/your-post" --status posted
node campaign-proof-log.mjs --priority 4 --proof-url "private-whatsapp: 12 warm contacts, 2 replies" --status sent --reply-count 2
```

The logger appends the matching proof row to `runtime/posting-log-live.csv`, refuses duplicate owner/channel/asset/link rows unless `--force` is passed, and refreshes `campaign-runner.mjs` so proven rows disappear from `runtime/post-now.md`.

Use the dispatch generator to write one live inbox per worker:

```bash
node campaign-runner.mjs --window-hours 12
node campaign-dispatch.mjs
sed -n '1,180p' runtime/worker-inbox-dexter.md
sed -n '1,180p' runtime/worker-inbox-sienna.md
sed -n '1,180p' runtime/worker-inbox-memo.md
sed -n '1,180p' runtime/worker-inbox-nano.md
```

The 15-minute heartbeat loop calls `campaign-dispatch.mjs --quiet` after every successful runner refresh when the script is present.

Use the paid traffic guard while Meta/X/social campaigns are active:

```bash
node campaign-paid-traffic-guard.mjs
sed -n '1,80p' runtime/paid-traffic-guard.txt
```

It checks Meta, Facebook, Instagram Story, X, TikTok, YouTube Shorts, and WhatsApp Status landing variants. It verifies the referral code, David Ai inviter, 5% agreement, June 18 setup copy, all-48-teams copy, custom auth CSP, health API, and deployment marker. This proves paid/social clicks can land safely; it does not prove any external post or ad edit happened.

For the stricter live ad QA sentinel, run:

```bash
node campaign-live-ad-qa.mjs
sed -n '1,100p' runtime/live-ad-qa.txt
```

It checks the same seven paid/social landing URLs plus rendered Next.js assets, referral resolver, health API, custom Google auth redirect through `api.worldcup26.world`, social metadata, and the local campaign video/image assets. The heartbeat loop runs it automatically when present. This still does not prove ads are spending or social posts exist; it proves campaign clicks can safely land and start registration.

Paid ad manager links are tracked in one operator page:

```bash
node campaign-ad-ops-links.mjs
open runtime/ad-ops-links.html
```

Current paid-channel control links:

- Meta Ads Manager: `https://adsmanager.facebook.com/adsmanager/manage/ads/edit/standalone?act=61071192&ads_manager_write_regions=true&nav_entry_point=lep_176&selected_ad_ids=6971048413400&nav_source=unknown`
- X Ads Manager: `https://ads.x.com/manager/18ce55rrs16/campaigns`

Use this page to open the manager, confirm the active/scheduled state, check spend/clicks, verify the landing URL still contains `ref=26BC4B90CB`, and copy a public-attempts log command after a real dashboard check. It does not prove spend by itself.

Minimum proof-log columns:

```csv
timestamp_eest,scheduled_at_eest,owner,channel,asset,copy_used,link,status,proof_url,reply_count,signup_notes,next_followup
```

For a safe 72-hour heartbeat loop on a droplet:

```bash
cd ~/DavidAi/worldcup26-promo-kit/campaign
./campaign-loop.sh start
./campaign-loop.sh status
```

The loop refreshes `runtime/next-actions-*.md` every 15 minutes for 72 hours. It does not post externally.
The status command prints the top of `runtime/live-campaign-monitor.md` so every droplet shows overdue, due-now, upcoming, ready, and next-worker actions immediately.

For a more continuous operating rhythm, generate the 15-minute pulse board:

```bash
node campaign-pulse.mjs --window-hours 72 --interval-minutes 15
sed -n '1,180p' runtime/nonstop-pulse.md
```

The heartbeat loop runs the pulse generator automatically when `campaign-pulse.mjs` is present. It writes:

- `runtime/nonstop-pulse.md`
- `runtime/nonstop-pulse.csv`
- `runtime/nonstop-pulse.json`

The pulse board is separate from the proof queue. It gives a fresh action every 15 minutes across Dexter, Sienna, Memo, and Nano, but it never marks an action posted. Real proof still goes through `campaign-proof-log.mjs`.

Use the watchdog when the campaign must stay awake even if the PID file is lost or a shell exits:

```bash
cd ~/DavidAi/worldcup26-promo-kit/campaign
./campaign-watchdog.sh
(crontab -l 2>/dev/null | grep -v 'worldcup26-promo-kit/campaign/campaign-watchdog.sh'; echo '*/5 * * * * cd ~/DavidAi/worldcup26-promo-kit/campaign && ./campaign-watchdog.sh') | crontab -
```

The watchdog repairs missing PID files, avoids duplicate loops, and restarts the 72-hour heartbeat if no matching campaign loop is alive in the campaign folder.
