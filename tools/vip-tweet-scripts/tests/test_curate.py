"""Tests for curation: relevance filtering, ranking, de-duplication."""

from datetime import datetime, timezone

import pytest

from vipscript import Tweet, curate, is_worldcup_relevant, score

NOW = datetime(2026, 6, 25, 12, 0, tzinfo=timezone.utc)


def _tweet(handle, text, likes=0, rts=0, day=25):
    return Tweet(
        id=f"{handle}-{day}",
        author_handle=handle,
        author_name=handle,
        text=text,
        created_at=datetime(2026, 6, day, 12, 0, tzinfo=timezone.utc),
        likes=likes,
        retweets=rts,
    )


def test_detects_worldcup_relevance():
    # Arrange / Act / Assert
    assert is_worldcup_relevant(_tweet("a", "Ready for the World Cup 🇧🇷"))
    assert is_worldcup_relevant(_tweet("b", "O Mundial está chegando"))
    assert not is_worldcup_relevant(_tweet("c", "New gym PR today 💪"))


def test_curate_drops_irrelevant_posts():
    tweets = [
        _tweet("star", "World Cup dreams", likes=100),
        _tweet("noise", "happy birthday to me", likes=999999),
    ]
    result = curate(tweets, max_results=5, now=NOW)
    assert [t.author_handle for t in result] == ["star"]


def test_curate_dedupes_by_author_keeping_best():
    tweets = [
        _tweet("kane", "World Cup believe", likes=10, day=20),
        _tweet("kane", "World Cup all the way", likes=500, day=25),
    ]
    result = curate(tweets, max_results=5, now=NOW)
    assert len(result) == 1
    assert result[0].likes == 500  # the stronger, fresher post wins


def test_curate_ranks_by_engagement_and_recency():
    older_big = _tweet("a", "World Cup", likes=1000, day=18)
    newer_small = _tweet("b", "World Cup", likes=300, day=25)
    result = curate([older_big, newer_small], max_results=2, now=NOW)
    # recency decay should lift the fresher post above the stale large one
    assert result[0].author_handle == "b"


def test_curate_rejects_nonpositive_max():
    with pytest.raises(ValueError):
        curate([], max_results=0)


def test_score_decays_with_age():
    fresh = _tweet("x", "World Cup", likes=100, day=25)
    stale = _tweet("y", "World Cup", likes=100, day=15)
    assert score(fresh, NOW) > score(stale, NOW)
