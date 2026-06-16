# Nano Public Outreach Sprint

Generated: 2026-06-08 09:30 +0300

- Referral code: `26BC4B90CB`
- Referral link: https://worldcup26.world/login?ref=26BC4B90CB
- Targets: 10
- All targets: [public-outreach-targets.html](public-outreach-targets.html)

This is a target map, not proof. Use owned accounts or approved communities, then log a real URL or private-channel note.

## A2 Nano / WhatsApp Personal

- Target: Warm football contacts
- Action: Send the invite to 20 warm contacts, then follow up with anyone who replies.
- Asset: `media/worldcup26-main-video.mp4`
- Open: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_public_outreach&utm_content=warm_a2
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_public_outreach&utm_content=warm_a2


```text
Pick 3 teams free for WorldCup26 and watch your private points preview. Paid leaderboard entry only needs a ticket later. Code 26BC4B90CB
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_public_outreach&utm_content=warm_a2
```

```bash
node campaign-proof-log.mjs --priority "2" --proof-url "private-whatsapp: sent to <N> warm contacts; replies <N>; code/link included at YYYY-MM-DD HH:mm EEST" --status "posted"
```

## B4 Nano / YouTube Search

- Target: Football fans choosing favorites
- Action: Reply to comments asking favorites/underdogs; use the free private-score angle.
- Asset: `media/worldcup26-referral-square.jpg`
- Open: https://www.youtube.com/results?search_query=World+Cup+2026+favorites
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=youtube-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=favorites_b4


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=youtube-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=favorites_b4
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Nano" --platform "YouTube Search" --channel "Football fans choosing favorites" --status "posted" --attempt-url "https://www.youtube.com/results?search_query=World+Cup+2026+favorites" --detail "public-url-or-screenshot-note: YouTube reply URL/screenshot note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## E1 Nano / Telegram/Discord

- Target: Football chats where you already participate
- Action: Send the free-picks challenge as a normal conversation prompt, not a cold blast.
- Asset: `media/worldcup26-referral-square.jpg`
- Open: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=telegram-discord&utm_medium=manual-chat&utm_campaign=worldcup26_public_outreach&utm_content=chat_e1
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=telegram-discord&utm_medium=manual-chat&utm_campaign=worldcup26_public_outreach&utm_content=chat_e1


```text
Pick 3 teams free for WorldCup26 and watch your private points preview. Paid leaderboard entry only needs a ticket later. Code 26BC4B90CB
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=telegram-discord&utm_medium=manual-chat&utm_campaign=worldcup26_public_outreach&utm_content=chat_e1
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Nano" --platform "Telegram/Discord" --channel "Football chats where you already participate" --status "posted" --attempt-url "https://worldcup26.world/login?ref=26BC4B90CB&utm_source=telegram-discord&utm_medium=manual-chat&utm_campaign=worldcup26_public_outreach&utm_content=chat_e1" --detail "private-chat-note: posted in <chat/server/channel>; visible to <N>; code/link included at YYYY-MM-DD HH:mm EEST"
```

## F4 Nano / Reddit

- Target: r/sportsanalytics prediction-game discussion
- Action: Use the builder-to-builder angle: simple 3-team picks, free preview first, ticket only later.
- Asset: `campaign/first-wave-posts.md`
- Open: https://www.reddit.com/r/sportsanalytics/comments/1tjn679/world_cup_2026_prediction_game/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-sportsanalytics&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_prediction_game_f4
- Source: Fresh search result: prediction-game conversation.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-sportsanalytics&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_prediction_game_f4
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Nano" --platform "Reddit" --channel "r/sportsanalytics prediction-game discussion" --status "posted" --attempt-url "https://www.reddit.com/r/sportsanalytics/comments/1tjn679/world_cup_2026_prediction_game/" --detail "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F8 Nano / National Teams Forum

- Target: Prediction for World Cup 2026 thread
- Action: Ask for three team picks, then invite them to compare in WorldCup26 if links are allowed.
- Asset: `campaign/first-wave-posts.md`
- Open: https://www.national-teams.com/forum/index.php?action=lastPost&thread%2F51461-prediction-for-world-cup-2026%2F=
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=national-teams-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_national_teams_f8
- Source: Fresh search result: national-team prediction thread.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=national-teams-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_national_teams_f8
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Nano" --platform "National Teams Forum" --channel "Prediction for World Cup 2026 thread" --status "posted" --attempt-url "https://www.national-teams.com/forum/index.php?action=lastPost&thread%2F51461-prediction-for-world-cup-2026%2F=" --detail "public-url-or-approval-note: forum post URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F9 Nano / Softpedia Forum

- Target: Romanian World Cup 2026 predictions discussion
- Action: Romanian-local angle: ask users for their 3 teams, then share the free-picks invite if forum rules allow it.
- Asset: `media/worldcup26-referral-square.jpg`
- Open: https://forum.softpedia.com/topic/1254623-world-cup-2026-pronosticuri-si-discutii/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=softpedia-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_softpedia_f9
- Source: Fresh search result: Romanian World Cup predictions discussion.


```text
Care sunt cele 3 echipe ale tale pentru World Cup 2026? Eu le-am ales aici: poti alege gratis la inceput si vezi preview-ul privat de puncte.

Cod invitatie: 26BC4B90CB

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=softpedia-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_softpedia_f9
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Nano" --platform "Softpedia Forum" --channel "Romanian World Cup 2026 predictions discussion" --status "posted" --attempt-url "https://forum.softpedia.com/topic/1254623-world-cup-2026-pronosticuri-si-discutii/" --detail "public-url-or-approval-note: Softpedia post URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F13 Nano / Reddit

- Target: r/sportsanalytics systematic prediction framework
- Action: Reply only if it adds value: compare the 3-team free-pick mechanic with their prediction framework and ask which 3 teams their model would choose.
- Asset: `campaign/first-wave-posts.md`
- Open: https://www.reddit.com/r/sportsanalytics/comments/1tuu84m/i_built_a_world_cup_2026_prediction_framework_to/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-sportsanalytics&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_framework_f13
- Source: Fresh search result: sportsanalytics World Cup prediction framework thread.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-sportsanalytics&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_framework_f13
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Nano" --platform "Reddit" --channel "r/sportsanalytics systematic prediction framework" --status "posted" --attempt-url "https://www.reddit.com/r/sportsanalytics/comments/1tuu84m/i_built_a_world_cup_2026_prediction_framework_to/" --detail "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F16 Nano / Reddit

- Target: r/SideProject printable pool kit thread
- Action: Builder-friendly lane: explain WorldCup26 as the fast mobile version of a pool where users pick only 3 teams first.
- Asset: `campaign/first-wave-posts.md`
- Open: https://www.reddit.com/r/SideProject/comments/1tu0lfg/i_built_a_printable_world_cup_2026_pool_kit_after/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-sideproject&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_pool_kit_f16
- Source: Fresh search result: SideProject World Cup pool kit thread.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=reddit-sideproject&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_pool_kit_f16
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Nano" --platform "Reddit" --channel "r/SideProject printable pool kit thread" --status "posted" --attempt-url "https://www.reddit.com/r/SideProject/comments/1tu0lfg/i_built_a_printable_world_cup_2026_pool_kit_after/" --detail "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F20 Nano / Arizona Sports Fans Forum

- Target: 2026 World Cup predictions fan thread
- Action: Fan-board lane: ask for 3 teams and offer the free private preview link if the thread welcomes prediction-game links.
- Asset: `campaign/first-wave-posts.md`
- Open: https://www.arizonasportsfans.com/forum/threads/2026-world-cup-predictions-with-one-year-to-go-here-are-some-very-early-predictions.717141/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=arizona-sports-fans&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_arizona_f20
- Source: Fresh search result: Arizona Sports Fans World Cup predictions thread.


```text
What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.

https://worldcup26.world/login?ref=26BC4B90CB&utm_source=arizona-sports-fans&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_arizona_f20
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Nano" --platform "Arizona Sports Fans Forum" --channel "2026 World Cup predictions fan thread" --status "posted" --attempt-url "https://www.arizonasportsfans.com/forum/threads/2026-world-cup-predictions-with-one-year-to-go-here-are-some-very-early-predictions.717141/" --detail "public-url-or-approval-note: forum post URL or moderator approval note with code/link included at YYYY-MM-DD HH:mm EEST"
```

## F25 Nano / My World Cup Guide

- Target: World Cup 2026 predictor page audience
- Action: Find shareable discussion paths around their predictor. Ask users to choose only 3 teams first, then compare private points over the tournament.
- Asset: `campaign/first-wave-posts.md`
- Open: https://myworldcupguide.com/predictor/
- Link: https://worldcup26.world/login?ref=26BC4B90CB&utm_source=myworldcupguide&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_predictor_f25
- Source: Fresh search result: World Cup 2026 predictor page.


```text
Pick 3 teams free for WorldCup26 and watch your private points preview. Paid leaderboard entry only needs a ticket later. Code 26BC4B90CB
https://worldcup26.world/login?ref=26BC4B90CB&utm_source=myworldcupguide&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_predictor_f25
```

```bash
node campaign-public-channel-attempts.mjs --add --owner "Nano" --platform "My World Cup Guide" --channel "World Cup 2026 predictor page audience" --status "posted" --attempt-url "https://myworldcupguide.com/predictor/" --detail "public-url-or-research-note: public discussion URL or precise no-post research note with next allowed channel at YYYY-MM-DD HH:mm EEST"
```
