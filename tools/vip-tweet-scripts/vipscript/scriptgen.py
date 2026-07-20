"""Arrange curated tweets into a channel-ready video script."""

from __future__ import annotations

from .models import ScriptSegment, Tweet, VideoScript

# Channel constants — keep the brand voice consistent across every script.
CHANNEL_HANDLE = "@DansLab-Kimi"
CHANNEL_SITE = "worldcup26.world"

_SECONDS_PER_SEGMENT = 11
_FRAME_SECONDS = 12  # hook + outro budget


def _max_segments(target_seconds: int) -> int:
    usable = max(target_seconds - _FRAME_SECONDS, _SECONDS_PER_SEGMENT)
    return max(3, usable // _SECONDS_PER_SEGMENT)


def _segment_for(tweet: Tweet) -> ScriptSegment:
    name = tweet.author_name
    return ScriptSegment(
        player_name=name,
        handle=f"@{tweet.author_handle}",
        # Labels only — name + handle. No sentence/caption text (CLAUDE.md rule #10).
        on_screen_label=f"{name}  ·  @{tweet.author_handle}",
        # Brian narrates the verified storyline; never shown on screen (rule #10).
        vo_line=tweet.text.strip(),
        # 100% AI / Pixar animation — never real footage or logos (rules #5 / #11).
        broll_hint=(
            f"Pixar-style animated {name} avatar reacting (Higgsfield image→video "
            f"from content/images/<Team>/); stadium + fans in national colours. "
            "Soccer only — no helmets/pads, no real footage, no club/FIFA logos."
        ),
        # Provenance link when available (for fact-checking), else the raw text.
        source_post=tweet.url or tweet.text.strip(),
    )


def build_script(
    tweets: list[Tweet],
    topic: str = "What the superstars are saying about World Cup 26",
    target_seconds: int = 60,
) -> VideoScript:
    """Turn curated tweets into a finished VideoScript."""
    if not tweets:
        raise ValueError("cannot build a script from zero tweets")
    if target_seconds <= 0:
        raise ValueError("target_seconds must be positive")

    chosen = tweets[: _max_segments(target_seconds)]
    segments = tuple(_segment_for(t) for t in chosen)
    names = [s.player_name for s in segments]
    headline_names = ", ".join(names[:-1]) + (f" & {names[-1]}" if len(names) > 1 else names[0])

    hook = (
        f"From {names[0]} to the rest of the squad — here's what football's "
        f"biggest names are doing at World Cup 26. Stay to the end for the "
        f"hottest moment. 🔥"
    )
    outro_cta = (
        f"Whose take do you back? Drop it in the comments. Subscribe to "
        f"{CHANNEL_HANDLE} for a new one before every match — and make your own "
        f"prediction free at {CHANNEL_SITE}."
    )
    pipeline_prompt = (
        f"Build a {target_seconds}s WorldCup26 Legends video: an energetic, "
        f"editorial roundup of what football superstars ({headline_names}) are "
        f"doing at the World Cup. Brian (ElevenLabs) narrates throughout; "
        f"the storylines are spoken, NOT shown as on-screen text. Visuals are 100% "
        f"AI/Pixar-style animated player avatars (Higgsfield) plus stadium and "
        f"fans — soccer only, no real footage, no subtitles, no logos. On-screen "
        f"text is labels only (player name + handle). Cleared music (Kevin "
        f"MacLeod). End with a CTA to {CHANNEL_HANDLE} and the free-to-play "
        f"prediction game at {CHANNEL_SITE} (no prizes)."
    )

    return VideoScript(
        title=f"WorldCup26 Legends — {topic}",
        topic=topic,
        target_seconds=target_seconds,
        hook=hook,
        segments=segments,
        outro_cta=outro_cta,
        pipeline_prompt=pipeline_prompt,
    )
