"""Curation: keep World-Cup-relevant posts, rank them, drop duplicates."""

from __future__ import annotations

from datetime import datetime, timezone

from .models import Tweet

# Lowercase substrings that mark a post as World-Cup relevant.
WORLDCUP_KEYWORDS: tuple[str, ...] = (
    "world cup",
    "worldcup",
    "wc26",
    "world cup 2026",
    "#worldcup",
    "mundial",
    "coupe du monde",
    "copa do mundo",
    "national team",
    "qualifier",
    "group stage",
    "knockout",
    "final",
)

_RECENCY_HALF_LIFE_DAYS = 3.0


def is_worldcup_relevant(tweet: Tweet) -> bool:
    text = tweet.text.lower()
    return any(kw in text for kw in WORLDCUP_KEYWORDS)


def _recency_factor(tweet: Tweet, now: datetime) -> float:
    """1.0 for a brand-new post, decaying smoothly with age."""
    age_days = max((now - tweet.created_at).total_seconds() / 86_400.0, 0.0)
    return 0.5 ** (age_days / _RECENCY_HALF_LIFE_DAYS)


def score(tweet: Tweet, now: datetime | None = None) -> float:
    """Rank score: engagement weighted by how fresh the post is."""
    now = now or datetime.now(timezone.utc)
    # +1 baseline so zero-engagement items (e.g. news-sourced) still rank by recency
    return (tweet.engagement() + 1) * _recency_factor(tweet, now)


def curate(
    tweets: list[Tweet],
    max_results: int = 5,
    now: datetime | None = None,
) -> list[Tweet]:
    """Filter to relevant posts, de-dupe per author, return the top N by score."""
    if max_results <= 0:
        raise ValueError("max_results must be positive")
    now = now or datetime.now(timezone.utc)

    relevant = [t for t in tweets if is_worldcup_relevant(t)]
    ranked = sorted(relevant, key=lambda t: score(t, now), reverse=True)

    seen_authors: set[str] = set()
    deduped: list[Tweet] = []
    for t in ranked:
        key = t.author_handle.lower()
        if key in seen_authors:
            continue
        seen_authors.add(key)
        deduped.append(t)
        if len(deduped) >= max_results:
            break
    return deduped
