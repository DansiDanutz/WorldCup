"""Tests for script generation."""

from datetime import datetime, timezone

import pytest

from vipscript import Tweet, build_script


def _tweet(handle, name, text, likes=100, rts=10):
    return Tweet(
        id=handle,
        author_handle=handle,
        author_name=name,
        text=text,
        created_at=datetime(2026, 6, 25, 12, 0, tzinfo=timezone.utc),
        likes=likes,
        retweets=rts,
    )


def _sample(n=5):
    return [_tweet(f"p{i}", f"Player {i}", f"World Cup take {i}") for i in range(n)]


def test_build_script_produces_segments():
    script = build_script(_sample(5), target_seconds=60)
    assert len(script.segments) >= 3
    assert script.segments[0].player_name == "Player 0"


def test_segment_count_scales_with_length():
    short = build_script(_sample(10), target_seconds=30)
    long = build_script(_sample(10), target_seconds=120)
    assert len(long.segments) > len(short.segments)


def test_markdown_contains_hook_cta_and_pipeline_prompt():
    md = build_script(_sample(4), target_seconds=60).to_markdown()
    assert "## HOOK" in md
    assert "CTA" in md
    assert "@DansLab-Kimi" in md
    assert "worldcup26.world" in md
    assert "Pipeline prompt" in md


def test_post_carried_by_vo_not_shown_on_screen():
    # Channel rule #10: the post is reference-only, never an on-screen caption.
    tw = _tweet("kane", "Harry Kane", "World Cup all the way")
    seg = build_script([tw], target_seconds=60).segments[0]
    assert seg.source_post == "World Cup all the way"
    assert "NOT shown" not in seg.on_screen_label  # label is name/handle only
    assert tw.text not in seg.on_screen_label


def test_no_real_footage_in_broll():
    # Channel rules #5/#11: AI/Pixar only, never highlight reels or logos.
    seg = build_script(_sample(1), target_seconds=60).segments[0]
    broll = seg.broll_hint.lower()
    assert "highlight reel" not in broll
    assert "real footage" not in broll or "no real footage" in broll


def test_build_script_rejects_empty_input():
    with pytest.raises(ValueError):
        build_script([], target_seconds=60)


def test_build_script_rejects_bad_length():
    with pytest.raises(ValueError):
        build_script(_sample(3), target_seconds=0)
