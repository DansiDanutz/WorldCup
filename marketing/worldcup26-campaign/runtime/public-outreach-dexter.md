# Dexter Public Outreach Sprint

Generated: 2026-06-08 09:30 +0300

- Referral code: `26BC4B90CB`
- Referral link: https://worldcup26.world/login?ref=26BC4B90CB
- Targets: 11
- All targets: [public-outreach-targets.html](public-outreach-targets.html)

This is a target map, not proof. Use owned accounts or approved communities, then log a real URL or private-channel note.

## B1 Dexter / X Search

- Target: World Cup 2026 prediction conversations
- Action: Reply only where useful: ask people their 3 teams and include the free-picks link once.
- Asset: `media/worldcup26-referral-16x9.jpg`
- Open: https://twitter.com/search?q=%22World%20Cup%202026%22%20predictions&src=typed_query&f=live
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x-search&utm_medium=manual-reply&utm_campaign=worldcup26_public_outreach&utm_content=predictions_b1


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x-search&utm_medium=manual-reply&utm_campaign=worldcup26_public_outreach&utm_content=predictions_b1
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "X Search" --channel "World Cup 2026 prediction conversations" --status "posted" --attempt-url "https://twitter.com/search?q=%22World%20Cup%202026%22%20predictions&src=typed_query&f=live" --detail "public-url: X reply/post URL with code/link included at YYYY-MM-DD HH:mm EEST"
```

## B2 Dexter / X Search

- Target: Football prediction posts
- Action: Post or reply with the 3-team challenge; avoid duplicate replies.
- Asset: `media/worldcup26-referral-square.jpg`
- Open: https://twitter.com/search?q=football%20predictions%20World%20Cup&src=typed_query&f=live
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x-search&utm_medium=manual-reply&utm_campaign=worldcup26_public_outreach&utm_content=football_b2


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=x-search&utm_medium=manual-reply&utm_campaign=worldcup26_public_outreach&utm_content=football_b2
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "X Search" --channel "Football prediction posts" --status "posted" --attempt-url "https://twitter.com/search?q=football%20predictions%20World%20Cup&src=typed_query&f=live" --detail "public-url: X reply/post URL with code/link included at YYYY-MM-DD HH:mm EEST"
```

## D1 Dexter / Facebook Groups

- Target: Football and World Cup discussion groups
- Action: Ask admin/moderator permission first; post only where promo links are welcome.
- Asset: `campaign/first-wave-posts.md`
- Open: https://www.facebook.com/search/groups/?q=World%20Cup%202026%20football
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=facebook-groups&utm_medium=approval-first&utm_campaign=worldcup26_public_outreach&utm_content=groups_d1


```text
Pick 3 teams free for WorldCup26 and watch your private points preview. Paid leaderboard entry only needs a ticket later. Code 26BC4B90CB
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=facebook-groups&utm_medium=approval-first&utm_campaign=worldcup26_public_outreach&utm_content=groups_d1
```

```bash
node campaign-proof-log.mjs --priority "4" --proof-url "approval-request-or-public-url: admin asked or approved post URL with code/link included at YYYY-MM-DD HH:mm EEST" --status "posted"
```

## D2 Dexter / Reddit Search

- Target: Football prediction discussion threads
- Action: Use only relevant discussion or self-promo-friendly threads; ask a 3-team question first.
- Asset: `campaign/first-wave-posts.md`
- Open: https://www.reddit.com/search/?q=World%20Cup%202026%20predictions
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=threads_d2


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=threads_d2
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "Reddit Search" --channel "Football prediction discussion threads" --status "posted" --attempt-url "https://www.reddit.com/search/?q=World%20Cup%202026%20predictions" --detail "public-url-or-approval-note: Reddit comment/post URL or moderator approval note at YYYY-MM-DD HH:mm EEST"
```

## F1 Dexter / Reddit

- Target: r/worldcup official predictions thread
- Action: Join the prediction conversation with a 3-team question. Share the link only if the thread rules allow it or someone asks for the game.
- Asset: `media/worldcup26-referral-square.jpg`
- Open: https://www.reddit.com/r/worldcup/comments/1tut1oq/official_world_cup_predictions_thread/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-thread&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_worldcup_f1
- Source: Fresh search result: active official World Cup predictions thread.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-thread&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_worldcup_f1
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "Reddit" --channel "r/worldcup official predictions thread" --status "posted" --attempt-url "https://www.reddit.com/r/worldcup/comments/1tut1oq/official_world_cup_predictions_thread/" --detail "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F5 Dexter / Reddit

- Target: r/soccer model prediction thread
- Action: High-volume but strict community. Do not drop a promo link unless rules and context allow it; ask the 3-team question first.
- Asset: `media/worldcup26-referral-square.jpg`
- Open: https://www.reddit.com/r/soccer/comments/1tx8wuy/world_cup_predictions_based_on_the_model_that/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-soccer&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_model_thread_f5
- Source: Fresh search result: high-traffic World Cup model thread.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-soccer&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_model_thread_f5
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "Reddit" --channel "r/soccer model prediction thread" --status "posted" --attempt-url "https://www.reddit.com/r/soccer/comments/1tx8wuy/world_cup_predictions_based_on_the_model_that/" --detail "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F7 Dexter / RedCafe Forum

- Target: World Cup 2026 forum
- Action: Find the live prediction/chat thread inside the forum, ask the 3-team challenge, and share link only when welcome.
- Asset: `media/worldcup26-referral-16x9.jpg`
- Open: https://www.redcafe.net/forums/world-cup-2026-forum.76/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=redcafe-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_redcafe_f7
- Source: Fresh search result: dedicated World Cup 2026 forum.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=redcafe-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_redcafe_f7
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "RedCafe Forum" --channel "World Cup 2026 forum" --status "posted" --attempt-url "https://www.redcafe.net/forums/world-cup-2026-forum.76/" --detail "public-url-or-approval-note: forum post URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F12 Dexter / Lichess Forum

- Target: Football World Cup discussion forum
- Action: Only post if off-topic forum rules allow it. Ask the 3-team question first, then share invite if relevant.
- Asset: `campaign/first-wave-posts.md`
- Open: https://lichess.org/forum/off-topic-discussion/football-world-cup2026-discussion-forum
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=lichess-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_lichess_f12
- Source: Fresh search result: general World Cup discussion thread.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=lichess-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_lichess_f12
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "Lichess Forum" --channel "Football World Cup discussion forum" --status "posted" --attempt-url "https://lichess.org/forum/off-topic-discussion/football-world-cup2026-discussion-forum" --detail "public-url-or-approval-note: forum post URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F15 Dexter / Reddit

- Target: r/WorldCup2026Tickets prediction pool thread
- Action: Audience is already prediction-pool aware. Ask for their 3 strongest teams and mention free picks before any paid leaderboard decision.
- Asset: `media/worldcup26-referral-16x9.jpg`
- Open: https://www.reddit.com/r/WorldCup2026Tickets/comments/1tvwqjm/i_built_a_world_cup_2026_prediction_pool_early/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-worldcup2026tickets&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_prediction_pool_f15
- Source: Fresh search result: World Cup prediction pool discussion.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-worldcup2026tickets&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_prediction_pool_f15
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "Reddit" --channel "r/WorldCup2026Tickets prediction pool thread" --status "posted" --attempt-url "https://www.reddit.com/r/WorldCup2026Tickets/comments/1tvwqjm/i_built_a_world_cup_2026_prediction_pool_early/" --detail "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F19 Dexter / FollowFollow Forum

- Target: World Cup 2026 general discussion thread
- Action: Use this only if the forum permits outside links. Lead with a simple question: which 3 teams would you take before kickoff?
- Asset: `media/worldcup26-referral-square.jpg`
- Open: https://www.followfollow.com/forum/threads/world-cup-2026.320937/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=followfollow-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_followfollow_general_f19
- Source: Fresh search result: FollowFollow World Cup 2026 discussion.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=followfollow-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_followfollow_general_f19
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "FollowFollow Forum" --channel "World Cup 2026 general discussion thread" --status "posted" --attempt-url "https://www.followfollow.com/forum/threads/world-cup-2026.320937/" --detail "public-url-or-approval-note: forum post URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F24 Dexter / Bracket Predictor Search

- Target: Bracket2026 bracket predictor audience
- Action: Use the bracket angle in public replies where allowed: no full bracket needed, just lock 3 teams and compare points.
- Asset: `media/worldcup26-referral-16x9.jpg`
- Open: https://bracket2026.com/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=bracket2026-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_bracket2026_f24
- Source: Fresh search result: interactive 48-team World Cup bracket predictor.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=bracket2026-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_bracket2026_f24
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Dexter" --platform "Bracket Predictor Search" --channel "Bracket2026 bracket predictor audience" --status "posted" --attempt-url "https://bracket2026.com/" --detail "public-url-or-research-note: public discussion URL or precise no-post research note with next allowed channel at YYYY-MM-DD HH:mm EEST"
```
