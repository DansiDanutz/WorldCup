#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REFERRAL_CODE = "26BC4B90CB";
const REFERRAL_LINK = `https://worldcup26.world/login?ref=${REFERRAL_CODE}`;
const REQUIRED_WORKERS = ["Dexter", "Sienna", "Memo", "Nano"];

const TARGETS = [
  {
    priority: "A1",
    queuePriority: "1",
    owner: "Sienna",
    platform: "WhatsApp Status",
    target: "Owned WhatsApp status audience",
    action: "Post the campaign video as a status with the free-picks caption.",
    asset: "media/worldcup26-main-video.mp4",
    link: `${REFERRAL_LINK}&utm_source=whatsapp-status&utm_medium=manual-post&utm_campaign=worldcup26_public_outreach&utm_content=status_a1`,
    proof: "private-whatsapp-status: posted status from <phone/account>; visible to contacts; code/link included",
  },
  {
    priority: "A2",
    queuePriority: "2",
    owner: "Nano",
    platform: "WhatsApp Personal",
    target: "Warm football contacts",
    action: "Send the invite to 20 warm contacts, then follow up with anyone who replies.",
    asset: "media/worldcup26-main-video.mp4",
    link: `${REFERRAL_LINK}&utm_source=whatsapp-personal&utm_medium=manual-outreach&utm_campaign=worldcup26_public_outreach&utm_content=warm_a2`,
    proof: "private-whatsapp: sent to <N> warm contacts; replies <N>; code/link included",
  },
  {
    priority: "A3",
    queuePriority: "3",
    owner: "Sienna",
    platform: "Instagram/Facebook Story",
    target: "Owned Instagram/Facebook story audience",
    action: "Post the story card with a link sticker and referral code.",
    asset: "media/worldcup26-referral-story.jpg",
    link: `${REFERRAL_LINK}&utm_source=instagram-facebook-story&utm_medium=manual-post&utm_campaign=worldcup26_public_outreach&utm_content=story_a3`,
    proof: "private-meta-story: story posted from <account>; screenshot saved; code/link sticker included",
  },
  {
    priority: "B1",
    owner: "Dexter",
    platform: "X Search",
    target: "World Cup 2026 prediction conversations",
    action: "Reply only where useful: ask people their 3 teams and include the free-picks link once.",
    asset: "media/worldcup26-referral-16x9.jpg",
    searchUrl: "https://twitter.com/search?q=%22World%20Cup%202026%22%20predictions&src=typed_query&f=live",
    link: `${REFERRAL_LINK}&utm_source=x-search&utm_medium=manual-reply&utm_campaign=worldcup26_public_outreach&utm_content=predictions_b1`,
    proof: "public-url: X reply/post URL with code/link included",
  },
  {
    priority: "B2",
    owner: "Dexter",
    platform: "X Search",
    target: "Football prediction posts",
    action: "Post or reply with the 3-team challenge; avoid duplicate replies.",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://twitter.com/search?q=football%20predictions%20World%20Cup&src=typed_query&f=live",
    link: `${REFERRAL_LINK}&utm_source=x-search&utm_medium=manual-reply&utm_campaign=worldcup26_public_outreach&utm_content=football_b2`,
    proof: "public-url: X reply/post URL with code/link included",
  },
  {
    priority: "B3",
    owner: "Sienna",
    platform: "YouTube Search",
    target: "World Cup 2026 prediction videos",
    action: "Comment naturally on fresh prediction videos: invite viewers to pick 3 teams free.",
    asset: "media/worldcup26-main-video.mp4",
    searchUrl: "https://www.youtube.com/results?search_query=World+Cup+2026+predictions",
    link: `${REFERRAL_LINK}&utm_source=youtube-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=predictions_b3`,
    proof: "public-url-or-screenshot-note: YouTube comment URL/screenshot note with code/link included",
  },
  {
    priority: "B4",
    owner: "Nano",
    platform: "YouTube Search",
    target: "Football fans choosing favorites",
    action: "Reply to comments asking favorites/underdogs; use the free private-score angle.",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://www.youtube.com/results?search_query=World+Cup+2026+favorites",
    link: `${REFERRAL_LINK}&utm_source=youtube-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=favorites_b4`,
    proof: "public-url-or-screenshot-note: YouTube reply URL/screenshot note with code/link included",
  },
  {
    priority: "C1",
    owner: "Sienna",
    platform: "TikTok/Reels",
    target: "#worldcup2026 and football prediction clips",
    action: "Upload/repost the campaign video with the free-picks hook and code in first line.",
    asset: "media/worldcup26-main-video.mp4",
    searchUrl: "https://www.tiktok.com/search?q=worldcup2026%20predictions",
    link: `${REFERRAL_LINK}&utm_source=tiktok-search&utm_medium=manual-video&utm_campaign=worldcup26_public_outreach&utm_content=video_c1`,
    proof: "public-url: TikTok/Reels URL with code/link included",
  },
  {
    priority: "C2",
    owner: "Sienna",
    platform: "Instagram Hashtags",
    target: "#worldcup2026 #footballpredictions",
    action: "Post story/reel from owned account; ask followers for their 3 teams.",
    asset: "media/worldcup26-referral-story.jpg",
    searchUrl: "https://www.instagram.com/explore/tags/worldcup2026/",
    link: `${REFERRAL_LINK}&utm_source=instagram-hashtag&utm_medium=manual-post&utm_campaign=worldcup26_public_outreach&utm_content=hashtag_c2`,
    proof: "public-url-or-private-story-note: Instagram URL/screenshot note with code/link included",
  },
  {
    priority: "D1",
    queuePriority: "4",
    owner: "Dexter",
    platform: "Facebook Groups",
    target: "Football and World Cup discussion groups",
    action: "Ask admin/moderator permission first; post only where promo links are welcome.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.facebook.com/search/groups/?q=World%20Cup%202026%20football",
    link: `${REFERRAL_LINK}&utm_source=facebook-groups&utm_medium=approval-first&utm_campaign=worldcup26_public_outreach&utm_content=groups_d1`,
    proof: "approval-request-or-public-url: admin asked or approved post URL with code/link included",
  },
  {
    priority: "D2",
    owner: "Dexter",
    platform: "Reddit Search",
    target: "Football prediction discussion threads",
    action: "Use only relevant discussion or self-promo-friendly threads; ask a 3-team question first.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.reddit.com/search/?q=World%20Cup%202026%20predictions",
    link: `${REFERRAL_LINK}&utm_source=reddit-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=threads_d2`,
    proof: "public-url-or-approval-note: Reddit comment/post URL or moderator approval note",
  },
  {
    priority: "E1",
    owner: "Nano",
    platform: "Telegram/Discord",
    target: "Football chats where you already participate",
    action: "Send the free-picks challenge as a normal conversation prompt, not a cold blast.",
    asset: "media/worldcup26-referral-square.jpg",
    link: `${REFERRAL_LINK}&utm_source=telegram-discord&utm_medium=manual-chat&utm_campaign=worldcup26_public_outreach&utm_content=chat_e1`,
    proof: "private-chat-note: posted in <chat/server/channel>; visible to <N>; code/link included",
  },
  {
    priority: "M1",
    owner: "Memo",
    platform: "YouTube Search",
    target: "Fresh World Cup 2026 news and fixture videos",
    action: "Comment on fresh relevant videos with the 3-team question and free private-score angle.",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://www.youtube.com/results?search_query=World+Cup+2026+teams+predictions",
    link: `${REFERRAL_LINK}&utm_source=youtube-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=memo_news_m1`,
    proof: "public-url-or-screenshot-note: Memo YouTube comment URL/screenshot note with code/link included",
  },
  {
    priority: "M2",
    owner: "Memo",
    platform: "Facebook Profile/Page",
    target: "Owned Facebook profile or page",
    action: "Post the free-picks CTA from an owned profile/page and pin or reshare it if possible.",
    asset: "media/worldcup26-referral-16x9.jpg",
    link: `${REFERRAL_LINK}&utm_source=facebook-profile&utm_medium=manual-post&utm_campaign=worldcup26_public_outreach&utm_content=memo_profile_m2`,
    proof: "public-url-or-private-note: Memo Facebook post URL or private post note with code/link included",
  },
  {
    priority: "M3",
    owner: "Memo",
    platform: "Football Forums",
    target: "World Cup 2026 prediction forum threads",
    action: "Find forum threads where prediction games are welcome; ask the 3-team question before sharing the link.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.google.com/search?q=World+Cup+2026+predictions+forum",
    link: `${REFERRAL_LINK}&utm_source=football-forums&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=memo_forums_m3`,
    proof: "public-url-or-approval-note: Memo forum post URL or moderator approval note with code/link included",
  },
  {
    priority: "M4",
    owner: "Memo",
    platform: "X Search",
    target: "Live posts asking who will win World Cup 2026",
    action: "Reply to live winner/favorites posts with the 3-team challenge and the free preview link.",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://twitter.com/search?q=%22win%20World%20Cup%202026%22&src=typed_query&f=live",
    link: `${REFERRAL_LINK}&utm_source=x-search&utm_medium=manual-reply&utm_campaign=worldcup26_public_outreach&utm_content=memo_winner_m4`,
    proof: "public-url: Memo X reply/post URL with code/link included",
  },
];

const FRESH_DISCOVERY_TARGETS = [
  {
    priority: "F1",
    owner: "Dexter",
    platform: "Reddit",
    target: "r/worldcup official predictions thread",
    action:
      "Join the prediction conversation with a 3-team question. Share the link only if the thread rules allow it or someone asks for the game.",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://www.reddit.com/r/worldcup/comments/1tut1oq/official_world_cup_predictions_thread/",
    link: `${REFERRAL_LINK}&utm_source=reddit-thread&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_worldcup_f1`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: active official World Cup predictions thread.",
  },
  {
    priority: "F2",
    owner: "Memo",
    platform: "Reddit",
    target: "r/SportsProjections group-stage predictions",
    action:
      "Reply with a useful angle: ask people to save their 3-team picks before comparing model projections.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.reddit.com/r/SportsProjections/comments/1tz5hh8/world_cup_2026_group_stage_1_predictions/",
    link: `${REFERRAL_LINK}&utm_source=reddit-sportsprojections&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_group_stage_f2`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: World Cup group-stage predictions thread.",
  },
  {
    priority: "F3",
    owner: "Memo",
    platform: "Reddit",
    target: "r/dataisbeautiful 10,000 simulation discussion",
    action:
      "Comment only if useful: ask readers which 3 teams they would personally pick against the simulation.",
    asset: "media/worldcup26-referral-16x9.jpg",
    searchUrl: "https://www.reddit.com/r/dataisbeautiful/comments/1tycucy/oc_i_simulated_the_2026_world_cup_10000_times_no/",
    link: `${REFERRAL_LINK}&utm_source=reddit-dataisbeautiful&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_simulation_f3`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: high-interest simulation discussion.",
  },
  {
    priority: "F4",
    owner: "Nano",
    platform: "Reddit",
    target: "r/sportsanalytics prediction-game discussion",
    action:
      "Use the builder-to-builder angle: simple 3-team picks, free preview first, ticket only later.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.reddit.com/r/sportsanalytics/comments/1tjn679/world_cup_2026_prediction_game/",
    link: `${REFERRAL_LINK}&utm_source=reddit-sportsanalytics&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_prediction_game_f4`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: prediction-game conversation.",
  },
  {
    priority: "F5",
    owner: "Dexter",
    platform: "Reddit",
    target: "r/soccer model prediction thread",
    action:
      "High-volume but strict community. Do not drop a promo link unless rules and context allow it; ask the 3-team question first.",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://www.reddit.com/r/soccer/comments/1tx8wuy/world_cup_predictions_based_on_the_model_that/",
    link: `${REFERRAL_LINK}&utm_source=reddit-soccer&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_model_thread_f5`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: high-traffic World Cup model thread.",
  },
  {
    priority: "F6",
    owner: "Memo",
    platform: "Digital Spy Forum",
    target: "World Cup predictions thread",
    action:
      "Post only if forum rules allow links. Lead with the 3-team question and free private-score preview.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://forums.digitalspy.com/discussion/2492990/world-cup-predictions-thread",
    link: `${REFERRAL_LINK}&utm_source=digitalspy-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_digitalspy_f6`,
    proof: "public-url-or-approval-note: forum post URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: active World Cup predictions forum thread.",
  },
  {
    priority: "F7",
    owner: "Dexter",
    platform: "RedCafe Forum",
    target: "World Cup 2026 forum",
    action:
      "Find the live prediction/chat thread inside the forum, ask the 3-team challenge, and share link only when welcome.",
    asset: "media/worldcup26-referral-16x9.jpg",
    searchUrl: "https://www.redcafe.net/forums/world-cup-2026-forum.76/",
    link: `${REFERRAL_LINK}&utm_source=redcafe-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_redcafe_f7`,
    proof: "public-url-or-approval-note: forum post URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: dedicated World Cup 2026 forum.",
  },
  {
    priority: "F8",
    owner: "Nano",
    platform: "National Teams Forum",
    target: "Prediction for World Cup 2026 thread",
    action:
      "Ask for three team picks, then invite them to compare in WorldCup26 if links are allowed.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.national-teams.com/forum/index.php?action=lastPost&thread%2F51461-prediction-for-world-cup-2026%2F=",
    link: `${REFERRAL_LINK}&utm_source=national-teams-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_national_teams_f8`,
    proof: "public-url-or-approval-note: forum post URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: national-team prediction thread.",
  },
  {
    priority: "F9",
    owner: "Nano",
    platform: "Softpedia Forum",
    target: "Romanian World Cup 2026 predictions discussion",
    action:
      "Romanian-local angle: ask users for their 3 teams, then share the free-picks invite if forum rules allow it.",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://forum.softpedia.com/topic/1254623-world-cup-2026-pronosticuri-si-discutii/",
    link: `${REFERRAL_LINK}&utm_source=softpedia-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_softpedia_f9`,
    proof: "public-url-or-approval-note: Softpedia post URL or moderator approval note with code/link included",
    copy:
      "Care sunt cele 3 echipe ale tale pentru World Cup 2026? Eu le-am ales aici: poti alege gratis la inceput si vezi preview-ul privat de puncte.\n\nCod invitatie: 26BC4B90CB\n",
    sourceNote: "Fresh search result: Romanian World Cup predictions discussion.",
  },
  {
    priority: "F10",
    owner: "Memo",
    platform: "Operation Sports Forum",
    target: "FIFA World Cup USA/Canada/Mexico 2026 thread",
    action:
      "Use a football-fan tone and ask for three picks; post the link only if discussion rules allow it.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://forums.operationsports.com/forums/forum/soccer/pro-soccer-and-fantasy-talk/26918375-fifa-world-cup-usa-canada-mexico-2026",
    link: `${REFERRAL_LINK}&utm_source=operationsports-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_operationsports_f10`,
    proof: "public-url-or-approval-note: forum post URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: World Cup 2026 forum thread.",
  },
  {
    priority: "F11",
    owner: "Sienna",
    platform: "YouTube Search",
    target: "Fresh World Cup 2026 prediction videos",
    action:
      "Open newest relevant videos and comment naturally with the 3-team question from a logged-in owned YouTube account.",
    asset: "media/worldcup26-main-video-vertical.mp4",
    searchUrl: "https://www.youtube.com/results?search_query=World+Cup+2026+predictions&sp=CAI%253D",
    link: `${REFERRAL_LINK}&utm_source=youtube-fresh&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_youtube_f11`,
    proof: "public-url-or-screenshot-note: YouTube comment URL/screenshot note with code/link included",
    sourceNote: "Fresh search path: newest YouTube prediction videos.",
  },
  {
    priority: "F12",
    owner: "Dexter",
    platform: "Lichess Forum",
    target: "Football World Cup discussion forum",
    action:
      "Only post if off-topic forum rules allow it. Ask the 3-team question first, then share invite if relevant.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://lichess.org/forum/off-topic-discussion/football-world-cup2026-discussion-forum",
    link: `${REFERRAL_LINK}&utm_source=lichess-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_lichess_f12`,
    proof: "public-url-or-approval-note: forum post URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: general World Cup discussion thread.",
  },
  {
    priority: "F13",
    owner: "Nano",
    platform: "Reddit",
    target: "r/sportsanalytics systematic prediction framework",
    action:
      "Reply only if it adds value: compare the 3-team free-pick mechanic with their prediction framework and ask which 3 teams their model would choose.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.reddit.com/r/sportsanalytics/comments/1tuu84m/i_built_a_world_cup_2026_prediction_framework_to/",
    link: `${REFERRAL_LINK}&utm_source=reddit-sportsanalytics&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_framework_f13`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: sportsanalytics World Cup prediction framework thread.",
  },
  {
    priority: "F14",
    owner: "Memo",
    platform: "Reddit",
    target: "r/sportsanalytics printable prediction kit update",
    action:
      "Use the prediction-tracking angle: ask users to save their 3 picks free and compare how they age during the tournament.",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://www.reddit.com/r/sportsanalytics/comments/1tx0gm4/free_world_cup_2026_prediction_kit_updated/",
    link: `${REFERRAL_LINK}&utm_source=reddit-sportsanalytics&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_prediction_kit_f14`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: updated free World Cup prediction kit thread.",
  },
  {
    priority: "F15",
    owner: "Dexter",
    platform: "Reddit",
    target: "r/WorldCup2026Tickets prediction pool thread",
    action:
      "Audience is already prediction-pool aware. Ask for their 3 strongest teams and mention free picks before any paid leaderboard decision.",
    asset: "media/worldcup26-referral-16x9.jpg",
    searchUrl: "https://www.reddit.com/r/WorldCup2026Tickets/comments/1tvwqjm/i_built_a_world_cup_2026_prediction_pool_early/",
    link: `${REFERRAL_LINK}&utm_source=reddit-worldcup2026tickets&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_prediction_pool_f15`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: World Cup prediction pool discussion.",
  },
  {
    priority: "F16",
    owner: "Nano",
    platform: "Reddit",
    target: "r/SideProject printable pool kit thread",
    action:
      "Builder-friendly lane: explain WorldCup26 as the fast mobile version of a pool where users pick only 3 teams first.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.reddit.com/r/SideProject/comments/1tu0lfg/i_built_a_printable_world_cup_2026_pool_kit_after/",
    link: `${REFERRAL_LINK}&utm_source=reddit-sideproject&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_pool_kit_f16`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: SideProject World Cup pool kit thread.",
  },
  {
    priority: "F17",
    owner: "Sienna",
    platform: "Reddit",
    target: "r/SideProject bracket-builder thread",
    action:
      "Do not compete head-on with their product. Comment as a lighter alternative: pick 3 teams in under a minute and follow a private score.",
    asset: "media/worldcup26-main-video-vertical.mp4",
    searchUrl: "https://www.reddit.com/r/SideProject/comments/1t7jb9v/free_world_cup_2026_bracket_builder_predict_every/",
    link: `${REFERRAL_LINK}&utm_source=reddit-sideproject&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_bracket_builder_f17`,
    proof: "public-url-or-mod-note: Reddit comment URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: SideProject bracket-builder leaderboard thread.",
  },
  {
    priority: "F18",
    owner: "Memo",
    platform: "FollowFollow Forum",
    target: "The World Cup 2026 & Predictions thread",
    action:
      "Forum tone should be conversational and not salesy. Ask the 3-team question first; share the invite only if links are accepted.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.followfollow.com/forum/threads/the-world-cup-2026-predictions.325670/",
    link: `${REFERRAL_LINK}&utm_source=followfollow-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_followfollow_predictions_f18`,
    proof: "public-url-or-approval-note: forum post URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: FollowFollow World Cup predictions thread.",
  },
  {
    priority: "F19",
    owner: "Dexter",
    platform: "FollowFollow Forum",
    target: "World Cup 2026 general discussion thread",
    action:
      "Use this only if the forum permits outside links. Lead with a simple question: which 3 teams would you take before kickoff?",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://www.followfollow.com/forum/threads/world-cup-2026.320937/",
    link: `${REFERRAL_LINK}&utm_source=followfollow-forum&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_followfollow_general_f19`,
    proof: "public-url-or-approval-note: forum post URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: FollowFollow World Cup 2026 discussion.",
  },
  {
    priority: "F20",
    owner: "Nano",
    platform: "Arizona Sports Fans Forum",
    target: "2026 World Cup predictions fan thread",
    action:
      "Fan-board lane: ask for 3 teams and offer the free private preview link if the thread welcomes prediction-game links.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://www.arizonasportsfans.com/forum/threads/2026-world-cup-predictions-with-one-year-to-go-here-are-some-very-early-predictions.717141/",
    link: `${REFERRAL_LINK}&utm_source=arizona-sports-fans&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_arizona_f20`,
    proof: "public-url-or-approval-note: forum post URL or moderator approval note with code/link included",
    sourceNote: "Fresh search result: Arizona Sports Fans World Cup predictions thread.",
  },
  {
    priority: "F21",
    owner: "Sienna",
    platform: "FourFourTwo",
    target: "World Cup 2026 sweepstake kit article",
    action:
      "Use this as a timely social-reply angle: office sweepstake readers can also pick 3 teams free on mobile. Post only on allowed comments or social shares.",
    asset: "media/worldcup26-referral-square.jpg",
    searchUrl: "https://www.fourfourtwo.com/competition/world-cup-2026-sweepstakes-kit-download-and-print-our-sweepstake-template",
    link: `${REFERRAL_LINK}&utm_source=fourfourtwo&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_sweepstake_f21`,
    proof: "public-url-or-screenshot-note: FourFourTwo/social comment URL or screenshot note with code/link included",
    sourceNote: "Fresh search result: FourFourTwo World Cup 2026 sweepstake kit article.",
  },
  {
    priority: "F22",
    owner: "Sienna",
    platform: "FourFourTwo",
    target: "World Cup 2026 kit picker article",
    action:
      "Visual hook: reply from the kit/favorites angle and ask which 3 national teams they would take before kickoff.",
    asset: "media/worldcup26-main-video-vertical.mp4",
    searchUrl: "https://www.fourfourtwo.com/competition/pick-your-perfect-world-cup-2026-look-with-fourfourtwos-kit-picker",
    link: `${REFERRAL_LINK}&utm_source=fourfourtwo&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_kit_picker_f22`,
    proof: "public-url-or-screenshot-note: FourFourTwo/social comment URL or screenshot note with code/link included",
    sourceNote: "Fresh search result: FourFourTwo World Cup 2026 kit picker article.",
  },
  {
    priority: "F23",
    owner: "Memo",
    platform: "World Cup Predictor Search",
    target: "WorldCupPredictor.org predictor audience",
    action:
      "Research the predictor audience and look for public share/comment paths. Position WorldCup26 as the 60-second 3-team version with private score preview.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://worldcuppredictor.org/",
    link: `${REFERRAL_LINK}&utm_source=worldcuppredictor-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_predictor_f23`,
    proof: "public-url-or-research-note: public discussion URL or precise no-post research note with next allowed channel",
    sourceNote: "Fresh search result: World Cup 2026 predictor tool audience.",
  },
  {
    priority: "F24",
    owner: "Dexter",
    platform: "Bracket Predictor Search",
    target: "Bracket2026 bracket predictor audience",
    action:
      "Use the bracket angle in public replies where allowed: no full bracket needed, just lock 3 teams and compare points.",
    asset: "media/worldcup26-referral-16x9.jpg",
    searchUrl: "https://bracket2026.com/",
    link: `${REFERRAL_LINK}&utm_source=bracket2026-search&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_bracket2026_f24`,
    proof: "public-url-or-research-note: public discussion URL or precise no-post research note with next allowed channel",
    sourceNote: "Fresh search result: interactive 48-team World Cup bracket predictor.",
  },
  {
    priority: "F25",
    owner: "Nano",
    platform: "My World Cup Guide",
    target: "World Cup 2026 predictor page audience",
    action:
      "Find shareable discussion paths around their predictor. Ask users to choose only 3 teams first, then compare private points over the tournament.",
    asset: "campaign/first-wave-posts.md",
    searchUrl: "https://myworldcupguide.com/predictor/",
    link: `${REFERRAL_LINK}&utm_source=myworldcupguide&utm_medium=manual-comment&utm_campaign=worldcup26_public_outreach&utm_content=fresh_predictor_f25`,
    proof: "public-url-or-research-note: public discussion URL or precise no-post research note with next allowed channel",
    sourceNote: "Fresh search result: World Cup 2026 predictor page.",
  },
];

const COPY = {
  short:
    "Pick 3 teams free for WorldCup26 and watch your private points preview. Paid leaderboard entry only needs a ticket later. Code 26BC4B90CB",
  question:
    "What are your 3 World Cup teams right now? I made mine here. Pick free first, ticket only if you want the paid leaderboard.",
  story:
    "48 teams are still open. Pick your 3 before everyone copies the favorites. Code 26BC4B90CB",
};

const args = parseArgs(process.argv.slice(2));
const campaignDir = args.root
  ? path.resolve(args.root)
  : path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.join(campaignDir, "runtime");
const now = args.now ? new Date(args.now) : new Date();

await mkdir(runtimeDir, { recursive: true });

const operatorPush = await readJson(path.join(runtimeDir, "operator-push-packet.json"), {});
const payload = buildPayload(now, { operatorPush });
const workerPages = buildWorkerPages(payload);
payload.workerPages = workerPages.map((page) => ({
  owner: page.owner,
  fileName: page.fileName,
  markdownFileName: page.markdownFileName,
  textFileName: page.textFileName,
  targetCount: page.targets.length,
}));

await writeFile(path.join(runtimeDir, "public-outreach-targets.json"), `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(path.join(runtimeDir, "public-outreach-targets.txt"), renderText(payload));
await writeFile(path.join(runtimeDir, "public-outreach-targets.md"), renderMarkdown(payload));
await writeFile(path.join(runtimeDir, "public-outreach-targets.html"), renderHtml(payload));
for (const workerPage of workerPages) {
  await writeFile(path.join(runtimeDir, workerPage.textFileName), renderWorkerText(payload, workerPage));
  await writeFile(path.join(runtimeDir, workerPage.markdownFileName), renderWorkerMarkdown(payload, workerPage));
  await writeFile(path.join(runtimeDir, workerPage.fileName), renderWorkerHtml(payload, workerPage));
}

if (!args.quiet) {
  process.stdout.write(renderText(payload));
}

function buildPayload(nowValue, sources) {
  const sourceTargets = selectTargets(sources);
  const targets = sourceTargets.map((target) => ({
    ...target,
    copy: selectCopy(target),
    shareLinks: buildShareLinks(target),
    proofCommand: buildProofCommand(target),
  }));
  const owners = [...new Set(targets.map((target) => target.owner).filter(Boolean))];
  const missingWorkers = REQUIRED_WORKERS.filter((worker) => !owners.includes(worker));
  const failures = [
    sourceTargets.length < 16 ? "Expected at least 16 public outreach targets." : "",
    missingWorkers.length > 0 ? `Missing worker outreach lanes: ${missingWorkers.join(", ")}` : "",
    targets.some((target) => !target.owner || !target.platform || !target.link || !target.proof)
      ? "One or more targets are missing required owner/platform/link/proof fields."
      : "",
  ].filter(Boolean);
  return {
    schema: "worldcup26-public-outreach-targets-v1",
    generatedAt: nowValue.toISOString(),
    generatedAtEest: formatEestLogTime(nowValue),
    referralCode: REFERRAL_CODE,
    referralLink: REFERRAL_LINK,
    ok: failures.length === 0,
    failures,
    state: "critical-zero-signups",
    targetCount: sourceTargets.length,
    workerCoverage: {
      required: REQUIRED_WORKERS,
      owners,
      missing: missingWorkers,
    },
    targets,
    copyBank: COPY,
    rule:
      "This is a target map, not proof. Use owned accounts or approved communities, then log a real URL or private-channel note.",
  };
}

function buildWorkerPages(payload) {
  return REQUIRED_WORKERS.map((owner) => {
    const slug = owner.toLowerCase();
    return {
      owner,
      slug,
      fileName: `public-outreach-${slug}.html`,
      markdownFileName: `public-outreach-${slug}.md`,
      textFileName: `public-outreach-${slug}.txt`,
      targets: payload.targets.filter((target) => target.owner === owner),
    };
  }).filter((page) => page.targets.length > 0);
}

function selectTargets({ operatorPush }) {
  const operatorActions = Array.isArray(operatorPush.actions) ? operatorPush.actions : [];
  const baseTargets = [...TARGETS, ...FRESH_DISCOVERY_TARGETS];
  if (operatorPush.actionMode !== "zero-signup-rescue" || operatorActions.length < 4) return baseTargets;
  const rescueTargets = operatorActions.slice(0, 4).map((action) => ({
    priority: String(action.priority ?? ""),
    owner: String(action.owner ?? ""),
    platform: String(action.channel ?? ""),
    target: "Zero-signup rescue live action",
    action: String(action.action ?? ""),
    asset: String(action.asset ?? ""),
    link: String(action.trackedLink || action.link || REFERRAL_LINK),
    proof: String(action.proofNote || `${action.channel || "Channel"} proof note`),
    copy: String(action.copy ?? ""),
    proofCommand: String(action.proofCommand || action.attemptCommand || ""),
  }));
  return [...rescueTargets, ...baseTargets];
}

function buildProofCommand(target) {
  if (target.proofCommand) return target.proofCommand;
  const proofNote = `${target.proof} at YYYY-MM-DD HH:mm EEST`;
  if (target.queuePriority) {
    return `node campaign-proof-log.mjs --priority ${shellQuote(target.queuePriority)} --proof-url ${shellQuote(proofNote)} --status "posted"`;
  }
  return [
    "node campaign-public-channel-attempts.mjs --add",
    `--owner ${shellQuote(target.owner)}`,
    `--platform ${shellQuote(target.platform)}`,
    `--channel ${shellQuote(target.target)}`,
    '--status "posted"',
    `--attempt-url ${shellQuote(target.searchUrl || target.link)}`,
    `--detail ${shellQuote(proofNote)}`,
  ].join(" ");
}

function selectCopy(target) {
  if (target.copy) return target.copy.includes(target.link) ? target.copy : `${target.copy}\n${target.link}`;
  if (target.platform.includes("Story") || target.platform.includes("Instagram")) return `${COPY.story}\n${target.link}`;
  if (target.platform.includes("Search") || target.platform.includes("Reddit") || target.platform.includes("Forum")) return `${COPY.question}\n\n${target.link}`;
  return `${COPY.short}\n${target.link}`;
}

function buildShareLinks(target) {
  const copy = selectCopy(target);
  return [
    { label: "Open target", url: target.searchUrl || target.link },
    { label: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(copy)}` },
    { label: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(target.link)}&text=${encodeURIComponent(copy)}` },
    { label: "X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(copy)}` },
    { label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(target.link)}` },
  ];
}

function renderText(payload) {
  const lines = [
    `WorldCup26 public outreach targets ${payload.generatedAtEest}`,
    `ok=${payload.ok ? "yes" : "no"} state=${payload.state} code=${payload.referralCode} targets=${payload.targetCount}`,
    `workers=${payload.workerCoverage.owners.join(",")} missing=${payload.workerCoverage.missing.join(",") || "-"}`,
    `rule=${payload.rule}`,
    "",
  ];
  for (const target of payload.targets) {
    lines.push(
      `${target.priority} ${target.owner} / ${target.platform}`,
      `target=${target.target}`,
      `action=${target.action}`,
      `asset=${target.asset}`,
    `open=${target.searchUrl || target.link}`,
    `link=${target.link}`,
      target.sourceNote ? `source=${target.sourceNote}` : "",
    `copy=${target.copy}`,
    `proof=${target.proofCommand}`,
      "",
    );
  }
  return lines.join("\n");
}

function renderMarkdown(payload) {
  return `# WorldCup26 Public Outreach Targets

Generated: ${payload.generatedAtEest}

- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}
- Targets: ${payload.targetCount}
- Worker coverage: ${payload.workerCoverage.owners.join(", ")}
- Missing workers: ${payload.workerCoverage.missing.join(", ") || "-"}

${payload.rule}

## Worker Sprint Pages

${(payload.workerPages ?? []).map((page) => `- ${page.owner}: [${page.fileName}](${page.fileName}) (${page.targetCount} targets)`).join("\n")}

${payload.targets.map(renderTargetMarkdown).join("\n\n")}
`;
}

function renderWorkerText(payload, page) {
  const lines = [
    `WorldCup26 public outreach sprint ${payload.generatedAtEest}`,
    `worker=${page.owner} targets=${page.targets.length} code=${payload.referralCode}`,
    `rule=${payload.rule}`,
    "",
  ];
  for (const target of page.targets) {
    lines.push(
      `${target.priority} ${target.platform}`,
      `target=${target.target}`,
      `action=${target.action}`,
      `asset=${target.asset}`,
      `open=${target.searchUrl || target.link}`,
      `link=${target.link}`,
      target.sourceNote ? `source=${target.sourceNote}` : "",
      `copy=${target.copy}`,
      `proof=${target.proofCommand}`,
      "",
    );
  }
  return lines.join("\n");
}

function renderWorkerMarkdown(payload, page) {
  return `# ${page.owner} Public Outreach Sprint

Generated: ${payload.generatedAtEest}

- Referral code: \`${payload.referralCode}\`
- Referral link: ${payload.referralLink}
- Targets: ${page.targets.length}
- All targets: [public-outreach-targets.html](public-outreach-targets.html)

${payload.rule}

${page.targets.map(renderTargetMarkdown).join("\n\n")}
`;
}

function renderTargetMarkdown(target) {
  return `## ${target.priority} ${target.owner} / ${target.platform}

- Target: ${target.target}
- Action: ${target.action}
- Asset: \`${target.asset}\`
- Open: ${target.searchUrl || target.link}
- Link: ${target.link}
${target.sourceNote ? `- Source: ${target.sourceNote}\n` : ""}

\`\`\`text
${target.copy}
\`\`\`

\`\`\`bash
${target.proofCommand}
\`\`\``;
}

function renderHtml(payload) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WorldCup26 Public Outreach Targets</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2c22; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bed3ca; --gold: #ffd974; --mint: #74f0b2; --red: #ffb4a8; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: radial-gradient(circle at 10% 0%, rgba(255,217,116,.2), transparent 22rem), radial-gradient(circle at 100% 0%, rgba(116,240,178,.16), transparent 24rem), var(--bg); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1040px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, section { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,44,34,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(32px, 7vw, 62px); line-height: .92; }
    h2 { margin: 0 0 6px; font-size: 20px; }
    p { color: var(--muted); line-height: 1.4; margin: 0 0 8px; }
    a { color: var(--gold); overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.28); padding: 10px; }
    button, .share { border: 1px solid var(--line); border-radius: 8px; color: #03140f; background: linear-gradient(135deg, var(--gold), var(--mint)); font-weight: 950; padding: 10px 12px; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; min-height: 42px; }
    .grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .meta, .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .pill { border-radius: 999px; padding: 6px 9px; background: rgba(255,255,255,.08); color: var(--muted); font-weight: 800; }
    .urgent { color: #03140f; background: linear-gradient(135deg, var(--red), var(--gold)); }
    .copy-state { color: var(--mint); font-size: 13px; min-height: 18px; margin-top: 6px; }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Public Outreach Targets</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="meta">
        <span class="pill urgent">zero signups rescue</span>
        <span class="pill">${escapeHtml(String(payload.targetCount))} targets</span>
        <span class="pill">workers ${escapeHtml(payload.workerCoverage.owners.join(", "))}</span>
        <span class="pill">code ${escapeHtml(payload.referralCode)}</span>
      </div>
      ${renderWorkerLinks(payload)}
    </header>
    <div class="grid">
      ${payload.targets.map(renderTargetHtml).join("\n")}
    </div>
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const target = document.querySelector(button.getAttribute("data-copy"));
      if (!target) return;
      await navigator.clipboard.writeText(target.textContent.trim());
      const state = button.parentElement.querySelector(".copy-state");
      if (state) state.textContent = "Copied";
      setTimeout(() => { if (state) state.textContent = ""; }, 1600);
    });
  </script>
</body>
</html>`;
}

function renderWorkerHtml(payload, page) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(page.owner)} Public Outreach Sprint</title>
  <style>
    :root { color-scheme: dark; --bg: #03140f; --panel: #0b2c22; --line: rgba(255,255,255,.16); --text: #f8fff9; --muted: #bed3ca; --gold: #ffd974; --mint: #74f0b2; --red: #ffb4a8; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: radial-gradient(circle at 10% 0%, rgba(255,217,116,.2), transparent 22rem), radial-gradient(circle at 100% 0%, rgba(116,240,178,.16), transparent 24rem), var(--bg); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(860px, 100%); margin: 0 auto; padding: 14px 10px 48px; }
    header, section { border: 1px solid var(--line); border-radius: 10px; background: rgba(11,44,34,.92); padding: 14px; margin-bottom: 10px; }
    h1 { margin: 0 0 8px; font-size: clamp(32px, 8vw, 64px); line-height: .92; }
    h2 { margin: 0 0 6px; font-size: 20px; }
    p { color: var(--muted); line-height: 1.4; margin: 0 0 8px; }
    a { color: var(--gold); overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--line); border-radius: 8px; background: rgba(0,0,0,.28); padding: 10px; }
    button, .share { border: 1px solid var(--line); border-radius: 8px; color: #03140f; background: linear-gradient(135deg, var(--gold), var(--mint)); font-weight: 950; padding: 10px 12px; text-decoration: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; min-height: 42px; }
    .actions, .meta { display: flex; flex-wrap: wrap; gap: 8px; }
    .pill { border-radius: 999px; padding: 6px 9px; background: rgba(255,255,255,.08); color: var(--muted); font-weight: 800; }
    .urgent { color: #03140f; background: linear-gradient(135deg, var(--red), var(--gold)); }
    .copy-state { color: var(--mint); font-size: 13px; min-height: 18px; margin-top: 6px; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(page.owner)} Sprint</h1>
      <p>${escapeHtml(payload.rule)}</p>
      <div class="meta">
        <span class="pill urgent">do real action first</span>
        <span class="pill">${escapeHtml(String(page.targets.length))} targets</span>
        <span class="pill">code ${escapeHtml(payload.referralCode)}</span>
        <a class="share" href="public-outreach-targets.html">All targets</a>
      </div>
    </header>
    ${page.targets.map(renderTargetHtml).join("\n")}
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy]");
      if (!button) return;
      const target = document.querySelector(button.getAttribute("data-copy"));
      if (!target) return;
      await navigator.clipboard.writeText(target.textContent.trim());
      const state = button.parentElement.querySelector(".copy-state");
      if (state) state.textContent = "Copied";
      setTimeout(() => { if (state) state.textContent = ""; }, 1600);
    });
  </script>
</body>
</html>`;
}

function renderWorkerLinks(payload) {
  const pages = payload.workerPages ?? [];
  if (pages.length === 0) return "";
  return `<div class="actions">${pages
    .map((page) => `<a class="share" href="${escapeAttr(page.fileName)}">${escapeHtml(page.owner)} (${escapeHtml(String(page.targetCount))})</a>`)
    .join("")}</div>`;
}

function renderTargetHtml(target) {
  const copyId = `copy-${target.priority}`;
  const proofId = `proof-${target.priority}`;
  return `<section>
    <h2>${escapeHtml(target.priority)} ${escapeHtml(target.owner)} / ${escapeHtml(target.platform)}</h2>
    <p><strong>${escapeHtml(target.target)}</strong></p>
    <p>${escapeHtml(target.action)}</p>
    <p>Asset: ${escapeHtml(target.asset)}</p>
    ${target.sourceNote ? `<p><strong>Source:</strong> ${escapeHtml(target.sourceNote)}</p>` : ""}
    <p><a href="${escapeAttr(target.searchUrl || target.link)}">${escapeHtml(target.searchUrl || target.link)}</a></p>
    <div class="actions">
      ${target.shareLinks.map((link) => `<a class="share" href="${escapeAttr(link.url)}">${escapeHtml(link.label)}</a>`).join("")}
      <button type="button" data-copy="#${copyId}">Copy copy</button>
      <button type="button" data-copy="#${proofId}">Copy proof</button>
    </div>
    <div class="copy-state"></div>
    <pre id="${copyId}">${escapeHtml(target.copy)}</pre>
    <pre id="${proofId}">${escapeHtml(target.proofCommand)}</pre>
  </section>`;
}

function formatEestLogTime(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} +0300`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function shellQuote(value) {
  return `"${String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function parseArgs(rawArgs) {
  const parsed = { quiet: false, root: "", now: "" };
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--quiet") parsed.quiet = true;
    else if (arg === "--root") parsed.root = String(rawArgs[++index] ?? "");
    else if (arg === "--now") parsed.now = String(rawArgs[++index] ?? "");
  }
  return parsed;
}
