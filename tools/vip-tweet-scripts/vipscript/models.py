"""Immutable domain models for the VIP-tweet → video-script pipeline.

Everything here is frozen: transforms return new objects, never mutate.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Tweet:
    """A single post from a football personality."""

    id: str
    author_handle: str
    author_name: str
    text: str
    created_at: datetime
    likes: int = 0
    retweets: int = 0
    url: str = ""

    def engagement(self) -> int:
        """Weighted engagement — a retweet is a stronger signal than a like."""
        return self.likes + 2 * self.retweets


@dataclass(frozen=True, slots=True)
class ScriptSegment:
    """One beat of the video: a player and what they posted.

    Channel-compliant by construction (see WorldCup26 CLAUDE.md hard rules):
      * the post is carried by `vo_line` (Brian narration) — never shown on screen
      * `on_screen_label` is labels only (name/handle), no sentence text  (rule #10)
      * `broll_hint` is AI/Pixar animation, never real footage           (rules #5/#11)
      * `source_post` is kept for reference only and is NOT rendered on screen
    """

    player_name: str
    handle: str
    on_screen_label: str
    vo_line: str
    broll_hint: str
    source_post: str


@dataclass(frozen=True, slots=True)
class VideoScript:
    """A finished, channel-ready script plus a prompt for the video pipeline."""

    title: str
    topic: str
    target_seconds: int
    hook: str
    segments: tuple[ScriptSegment, ...]
    outro_cta: str
    pipeline_prompt: str

    def to_markdown(self) -> str:
        lines: list[str] = [
            f"# {self.title}",
            "",
            f"> Auto-generated roundup script · topic: **{self.topic}** · "
            f"target length: **{self.target_seconds}s** · "
            f"{len(self.segments)} segments",
            "",
            "## HOOK — Brian VO (0s)",
            self.hook,
            "",
        ]
        running = 6
        for i, seg in enumerate(self.segments, start=1):
            lines += [
                f"## SEGMENT {i} — {seg.player_name} ({seg.handle}) (~{running}s)",
                f"**On-screen (labels only — NO caption text):** {seg.on_screen_label}",
                "",
                f"**Brian VO:** {seg.vo_line}",
                "",
                f"**B-roll (100% AI / Pixar — no real footage, no logos):** {seg.broll_hint}",
                "",
                f"_Source (provenance — not shown on screen): {seg.source_post}_",
                "",
            ]
            running += 11
        lines += [
            f"## OUTRO / CTA — Brian VO (~{running}s)",
            self.outro_cta,
            "",
            "---",
            "## Pipeline prompt (feed to /youtube-automation-pipeline)",
            "```",
            self.pipeline_prompt,
            "```",
            "",
        ]
        return "\n".join(lines)
