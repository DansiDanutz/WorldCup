"""vipscript — scrape VIP footballer posts about the World Cup and turn them
into channel-ready video scripts."""

from .models import ScriptSegment, Tweet, VideoScript
from .curate import curate, is_worldcup_relevant, score
from .scriptgen import build_script
from .fetch import FixtureSource, XApiV2Source, get_source

__all__ = [
    "Tweet",
    "ScriptSegment",
    "VideoScript",
    "curate",
    "is_worldcup_relevant",
    "score",
    "build_script",
    "FixtureSource",
    "XApiV2Source",
    "get_source",
]
