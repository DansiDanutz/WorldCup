"""Pluggable tweet sources.

Two implementations:
  * FixtureSource  — reads a local JSON file. Runs with zero credentials,
    used for development and demos.
  * XApiV2Source   — hits the official X (Twitter) v2 recent-search endpoint.
    Requires the XAPI_BEARER_TOKEN env var. Never hardcode the token.

`get_source()` picks the live source when a token is present, otherwise
falls back to the fixture and says so loudly.
"""

from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Protocol

from .models import Tweet

_X_RECENT_SEARCH = "https://api.twitter.com/2/tweets/search/recent"


def _parse_dt(raw: str) -> datetime:
    """Parse ISO-8601, tolerating a trailing Z."""
    return datetime.fromisoformat(raw.replace("Z", "+00:00"))


class TweetSource(Protocol):
    def fetch(self, handles: list[str], query: str, limit: int) -> list[Tweet]: ...


class FixtureSource:
    """Offline source backed by a JSON array of tweet objects."""

    def __init__(self, path: str | Path) -> None:
        self._path = Path(path)
        if not self._path.is_file():
            raise FileNotFoundError(f"fixture not found: {self._path}")

    def fetch(self, handles: list[str], query: str, limit: int) -> list[Tweet]:
        raw = json.loads(self._path.read_text(encoding="utf-8"))
        wanted = {h.lstrip("@").lower() for h in handles} if handles else None
        out: list[Tweet] = []
        for r in raw:
            handle = str(r["author_handle"]).lstrip("@")
            if wanted is not None and handle.lower() not in wanted:
                continue
            out.append(
                Tweet(
                    id=str(r["id"]),
                    author_handle=handle,
                    author_name=r.get("author_name", handle),
                    text=r["text"],
                    created_at=_parse_dt(r["created_at"]),
                    likes=int(r.get("likes", 0)),
                    retweets=int(r.get("retweets", 0)),
                    url=r.get("url", ""),
                )
            )
        return out[:limit]


class XApiV2Source:
    """Live source using X API v2 recent search (last ~7 days)."""

    def __init__(self, bearer_token: str) -> None:
        if not bearer_token:
            raise ValueError("XApiV2Source requires a bearer token")
        self._token = bearer_token

    def fetch(self, handles: list[str], query: str, limit: int) -> list[Tweet]:
        froms = " OR ".join(f"from:{h.lstrip('@')}" for h in handles)
        full_query = f"({query}) ({froms}) -is:retweet" if froms else query
        params = {
            "query": full_query,
            "max_results": str(min(max(limit, 10), 100)),
            "tweet.fields": "created_at,public_metrics,author_id",
            "expansions": "author_id",
            "user.fields": "username,name",
        }
        url = f"{_X_RECENT_SEARCH}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {self._token}"})
        with urllib.request.urlopen(req, timeout=20) as resp:  # noqa: S310 (trusted host)
            payload = json.loads(resp.read().decode("utf-8"))
        users = {
            u["id"]: u for u in payload.get("includes", {}).get("users", [])
        }
        out: list[Tweet] = []
        for t in payload.get("data", []):
            user = users.get(t.get("author_id"), {})
            metrics = t.get("public_metrics", {})
            handle = user.get("username", "")
            out.append(
                Tweet(
                    id=t["id"],
                    author_handle=handle,
                    author_name=user.get("name", handle),
                    text=t["text"],
                    created_at=_parse_dt(t["created_at"]),
                    likes=int(metrics.get("like_count", 0)),
                    retweets=int(metrics.get("retweet_count", 0)),
                    url=f"https://x.com/{handle}/status/{t['id']}" if handle else "",
                )
            )
        return out


# Accept either our own var or the fleet's existing social-poster var name.
_BEARER_ENV_VARS = ("XAPI_BEARER_TOKEN", "TWITTER_BEARER_TOKEN")


def get_source(fixture_path: str | Path) -> TweetSource:
    """Live X source if a bearer token env var is set, else the offline fixture."""
    for var in _BEARER_ENV_VARS:
        token = os.environ.get(var, "").strip()
        if token:
            return XApiV2Source(token)
    print(
        f"[vipscript] no bearer token ({' / '.join(_BEARER_ENV_VARS)}) set — "
        f"using offline fixture ({fixture_path}). Set one to pull live tweets."
    )
    return FixtureSource(fixture_path)
