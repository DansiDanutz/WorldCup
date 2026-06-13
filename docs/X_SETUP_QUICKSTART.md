# X (Twitter) Posting — 10-Minute Quickstart

Goal: get the **4 OAuth 1.0a keys** that let `npm run x:engage` post, reply, like,
and search on X. This is the *only* credential set that can post tweets.

> ⚠️ An **xAI / Grok key (`xai-...`) is NOT one of these** and cannot post to X.
> It talks to Grok AI models and is unrelated to this campaign tooling. Don't use
> it here.

## Step 1 — Create an X Developer App

1. Go to <https://developer.x.com/> and sign in with the account you want to post
   from (the **posting account**).
2. Open the **Developer Portal** → **Projects & Apps** → create a Project, then an
   App inside it (the free tier is enough to post).

## Step 2 — Set the App to Read **and** Write

1. In your App → **Settings** → **User authentication settings** → **Set up / Edit**.
2. Under **App permissions**, choose **Read and write**.
3. App type: **Web App / Automated App or Bot** is fine.
4. Callback URL / Website URL: any valid URL works for our use (e.g.
   `https://worldcup26.world`). Save.

> If you set the app to Read+Write *after* generating tokens, you must
> **regenerate** the Access Token & Secret (Step 4) — otherwise they stay
> read-only and posting will fail.

## Step 3 — Copy the Consumer Keys

App → **Keys and tokens** → **Consumer Keys**:

- **API Key**  → this is `X_API_KEY`
- **API Key Secret** → this is `X_API_SECRET`

## Step 4 — Generate the Access Token & Secret

Same page → **Authentication Tokens** → **Access Token and Secret** → Generate.
Confirm it shows **Read and Write**:

- **Access Token** → `X_ACCESS_TOKEN`
- **Access Token Secret** → `X_ACCESS_TOKEN_SECRET`

## Step 5 — Put the keys in `.env` (never in chat, never committed)

Create/edit a `.env` file in the project root (it is gitignored):

```
X_API_KEY=your_consumer_key
X_API_SECRET=your_consumer_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret
```

## Step 6 — Verify

```bash
npm run x:engage -- me
```

Expected: it prints your authenticated `@handle` and confirms **read+write** mode.
An auth error means the keys are wrong or the app is still read-only (redo Step 2
then Step 4).

## Step 7 — Run the campaign

Copy is ready in `marketing/LAUNCH_KIT.md`. Write actions are **dry-run by
default**; add `--confirm` to actually send.

```bash
# Broadcast the launch post
npm run x:engage -- post "3 teams. 104 matches. 1 leaderboard. Who's your World Cup 2026 trio? ⚽ worldcup26.world" --confirm

# Find conversations to join, then reply with value
npm run x:engage -- search --preset worldcup --max 30 --lang en
npm run x:engage -- reply <tweetId> "Loved this take — who's your 3 to win it?" --confirm
```

See `docs/X_ENGAGEMENT.md` for all commands, presets, and flags.
