# VIP Tweet → Video Script

A short tool for **WorldCup26 Legends** (`@DansLab-Kimi`). It pulls what VIP
footballers are posting about the World Cup, curates the best ones, and arranges
them into a **channel-ready video script** plus a one-line prompt for the
existing `/youtube-automation-pipeline`.

## Pipeline

```
fetch (X API or fixture) → curate (relevance + engagement + recency) → script (hook → player segments → CTA)
```

## Run it (offline — no credentials)

```bash
cd tools/vip-tweet-scripts
python run.py
# → writes out/vip_worldcup_script.md
```

Offline mode reads `fixtures/sample_tweets.json` so you can see the full output
shape without any API access. The sample data is illustrative, not real quotes.

## Run it live (real tweets)

Uses the official **X API v2** recent-search endpoint (last ~7 days).

```bash
export XAPI_BEARER_TOKEN=...        # never commit this
python run.py --limit 50 --segments 5 --seconds 60
```

If `XAPI_BEARER_TOKEN` is unset, it automatically falls back to the fixture and
tells you so. Live X scraping requires a credential by design — no token is ever
hardcoded.

## Data source — what actually works today

Three ways to feed the generator, in order of fidelity:

1. **Verbatim tweets (X API v2)** — needs a valid bearer token on at least the
   **Basic** access tier (~$100/mo); the free tier cannot search tweets. Set
   `TWITTER_BEARER_TOKEN` / `XAPI_BEARER_TOKEN` in `.env`.
2. **Curated storylines (works now, no credential)** — gather current
   player World-Cup storylines via web search / an MCP, drop them into a JSON
   fixture (see `fixtures/live_worldcup.json`), and run with `--fixture`. These
   are *verified storylines, not verbatim tweets* — Brian narrates the fact, and
   each segment carries a provenance URL for fact-checking. Engagement is
   optional; when absent, items rank by recency.
3. **Offline sample** — `fixtures/sample_tweets.json` for development.

The generated script never shows post text on screen (channel rule #10) and
attributes nothing it can't source, so storyline mode stays monetization-safe.

## Options

| flag | default | meaning |
|------|---------|---------|
| `--players` | `players.json` | VIP handles to scrape (edit this list freely) |
| `--query` | `World Cup OR Mundial OR WC26` | search query (live mode) |
| `--limit` | `50` | tweets pulled before curation |
| `--segments` | `5` | featured posts in the final script |
| `--seconds` | `60` | target video length (segment count scales with this) |
| `--out` | `out/vip_worldcup_script.md` | output path |

## Output

A Markdown script with a hook, one segment per player (on-screen hook, quote
card, narration, b-roll hint), a CTA, and a pipeline prompt. Paste the prompt
into `/youtube-automation-pipeline` (or `/video-pipeline-v3`) to render the video.

## Tests

```bash
cd tools/vip-tweet-scripts
python -m pytest -q
```

## Swapping the data source

`vipscript/fetch.py` defines a `TweetSource` protocol. To use Firecrawl, Exa,
snscrape, or a cached dataset instead of the X API, implement `fetch(handles,
query, limit) -> list[Tweet]` and return it from `get_source()`. Nothing
downstream changes.

## Layout

```
vip-tweet-scripts/
├── run.py                  # CLI
├── players.json            # VIP handles
├── fixtures/sample_tweets.json
├── vipscript/
│   ├── models.py           # frozen Tweet / ScriptSegment / VideoScript
│   ├── fetch.py            # FixtureSource + XApiV2Source + get_source()
│   ├── curate.py           # relevance + ranking + de-dupe
│   └── scriptgen.py        # tweets → VideoScript
└── tests/
```
