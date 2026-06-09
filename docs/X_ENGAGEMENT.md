# X (Twitter) Engagement

Tooling to **engage relevant WorldCup / football conversations on X**, not just
broadcast our own posts. It is a dependency-free CLI backed by a small OAuth
1.0a client (`scripts/lib/x-client.mjs`, `scripts/x-engage.mjs`).

## Why OAuth 1.0a user-context

A single OAuth 1.0a **user-context** credential set authorizes BOTH:

- **read** — recent search (find conversations), and
- **write** — reply, like, and post.

This is what "repairs search auth" without splitting credentials: the same keys
that let us search also let us engage. An app-only **bearer token** is supported
only as a read-only fallback for search; it cannot reply, like, or post.

## Credentials

Create an app in the [X developer portal](https://developer.x.com/) with
**Read and Write** permission, then generate Consumer Keys and an Access
Token/Secret for the posting account. Set them (locally in `.env`, or in the
deploy environment — never commit real values):

```
X_API_KEY=...              # consumer key
X_API_SECRET=...           # consumer secret
X_ACCESS_TOKEN=...         # access token for the posting account
X_ACCESS_TOKEN_SECRET=...  # access token secret
# Optional, search-only fallback:
X_BEARER_TOKEN=...
```

Verify they work:

```
npm run x:engage -- me
```

It prints the authenticated `@handle` and confirms read+write mode. An auth
error here means the keys are wrong or the app lacks Read+Write — fix before
engaging.

## Finding conversations

```
# Curated presets (recommended starting point)
npm run x:engage -- presets
npm run x:engage -- search --preset worldcup --max 30 --lang en
npm run x:engage -- search --preset predictions --min-likes 3

# Free-form query
npm run x:engage -- search "World Cup 2026 bracket" --max 25 --min-likes 5
```

Results are ranked by engagement (likes + weighted replies/retweets/quotes) and
printed with a direct tweet URL, the author handle, metrics, and language, so
you can pick the best conversations to join.

Flags:

- `--preset <name>` — `worldcup`, `predictions`, `fantasy`, `football`
- `--max <n>` — results to request (10–100)
- `--min-likes <n>` — drop low-traction tweets
- `--lang <code>` — restrict by language, e.g. `en`

## Engaging

Write actions are **dry-run by default**. Add `--confirm` (or set
`X_ENGAGE_LIVE=1`) to actually send — posting to X is public and irreversible.

```
# Reply into a conversation (grab the tweetId from search output)
npm run x:engage -- reply 1234567890 "Loved this take — who's your 3 to win it?"
npm run x:engage -- reply 1234567890 "..." --confirm

# Like a tweet
npm run x:engage -- like 1234567890 --confirm

# Broadcast a new post
npm run x:engage -- post "Build your WorldCup26 bracket ⚽" --confirm
```

Without `--confirm` each command prints exactly what it *would* send and exits
without touching the API.

## Tests

`tests/x-client.test.ts` validates the OAuth 1.0a signing against X's published
reference vector (so a bad signature is caught before it ever hits the API) and
checks credential-mode detection. Run with `npm test`.

## Notes & limits

- Recent search covers roughly the **last 7 days**; older conversations won't
  appear.
- Rate limits and search access depend on your X API tier. The client surfaces
  the API's status code and error detail on failure.
- This environment (CI / remote sandbox) does not store X credentials. Run the
  CLI where the secrets are configured.
