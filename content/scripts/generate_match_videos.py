#!/usr/bin/env python3
"""
World Cup 2026 — Match Video Assembler
Combines player character videos into match preview compilations.

For each match in Stories/:
  1. Read the match story
  2. Collect player videos from both teams
  3. Stitch together with ffmpeg: team A players → title card → team B players
  4. Add text overlays with player names and match info

Usage:
    python3 generate_match_videos.py                    # all matches
    python3 generate_match_videos.py --match "Brazil-vs-Haiti"  # one match
    python3 generate_match_videos.py --dry-run          # preview
    python3 generate_match_videos.py --status           # progress
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from dataclasses import dataclass, field

WORLDCUP_ROOT = Path(__file__).resolve().parent.parent
VIDEOS_DIR = WORLDCUP_ROOT / "videos"
STORIES_DIR = WORLDCUP_ROOT / "Stories"
OUTPUT_DIR = WORLDCUP_ROOT / "match_videos"
PROGRESS_FILE = WORLDCUP_ROOT / "scripts" / "match_video_progress.json"

TITLE_CARD_DURATION = 3  # seconds


@dataclass
class Progress:
    completed: dict[str, str] = field(default_factory=dict)
    failed: dict[str, str] = field(default_factory=dict)

    def save(self):
        PROGRESS_FILE.write_text(json.dumps({"completed": self.completed, "failed": self.failed}, indent=2))

    @classmethod
    def load(cls):
        if PROGRESS_FILE.exists():
            data = json.loads(PROGRESS_FILE.read_text())
            return cls(completed=data.get("completed", {}), failed=data.get("failed", {}))
        return cls()


def parse_match_name(story_file: Path) -> tuple[str, str]:
    """Parse 'Brazil-vs-Haiti.md' into ('Brazil', 'Haiti')."""
    stem = story_file.stem
    # Handle various separators
    parts = re.split(r"-vs-", stem, maxsplit=1)
    if len(parts) == 2:
        return parts[0].replace("-", " ").replace("_", " "), parts[1].replace("-", " ").replace("_", " ")
    return "", ""


def normalize_team_name(name: str) -> str:
    """Convert display name to folder name, e.g. 'Bosnia and Herzegovina' -> 'Bosnia_and_Herzegovina'."""
    return name.replace(" ", "_").replace("  ", "_")


def find_player_videos(team_name: str) -> list[Path]:
    """Find all player videos for a team."""
    team_dir = VIDEOS_DIR / normalize_team_name(team_name)
    if team_dir.exists():
        return sorted(team_dir.glob("*.mp4"))
    return []


def create_title_card(match_name: str, output: Path) -> bool:
    """Create a title card image with ffmpeg drawtext."""
    output.parent.mkdir(parents=True, exist_ok=True)

    # Clean up match name for display
    display = match_name.replace("-", " ").replace("_", " ")
    team_a, team_b = display.split(" vs ") if " vs " in display else (display, "")

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"color=c=black:s=1280x720:d={TITLE_CARD_DURATION}:r=30",
        "-vf",
        f"drawtext=text='WORLD CUP 2026':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60,"
        f"drawtext=text='{team_a} vs {team_b}':fontsize=48:fontcolor=gold:x=(w-text_w)/2:y=(h-text_h)/2+10,"
        f"drawtext=text='GROUP STAGE':fontsize=24:fontcolor=gray:x=(w-text_w)/2:y=(h-text_h)/2+70",
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-t", str(TITLE_CARD_DURATION),
        str(output),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def assemble_match_video(match_name: str, team_a_videos: list[Path], team_b_videos: list[Path]) -> bool:
    """Assemble a match video from player videos + title card."""
    output = OUTPUT_DIR / f"{match_name}.mp4"
    output.parent.mkdir(parents=True, exist_ok=True)

    # Create title card
    title_card = OUTPUT_DIR / f"{match_name}_title.mp4"
    if not create_title_card(match_name, title_card):
        return False

    # Collect all video segments
    segments = []

    # Team A players (up to 3)
    for v in team_a_videos[:3]:
        segments.append(v)

    # Title card
    segments.append(title_card)

    # Team B players (up to 3)
    for v in team_b_videos[:3]:
        segments.append(v)

    if len(segments) < 3:  # Need at least title + 1 player from each side
        return False

    # Create concat file
    concat_file = OUTPUT_DIR / f"{match_name}_concat.txt"
    concat_content = "\n".join(f"file '{s}'" for s in segments)
    concat_file.write_text(concat_content)

    # Concatenate with ffmpeg
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        str(output),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    # Cleanup temp files
    title_card.unlink(missing_ok=True)
    concat_file.unlink(missing_ok=True)

    return result.returncode == 0


def show_status(progress: Progress):
    stories = sorted(STORIES_DIR.glob("*.md"))
    matches_with_videos = []
    matches_missing = []

    for story in stories:
        match_name = story.stem
        output = OUTPUT_DIR / f"{match_name}.mp4"
        team_a, team_b = parse_match_name(story)

        a_videos = find_player_videos(team_a)
        b_videos = find_player_videos(team_b)

        if output.exists() or match_name in progress.completed:
            matches_with_videos.append(match_name)
        elif a_videos and b_videos:
            matches_missing.append(f"{match_name} ({len(a_videos)}+{len(b_videos)} videos ready)")
        else:
            a_status = f"{len(a_videos)} vids" if a_videos else "NO VIDS"
            b_status = f"{len(b_videos)} vids" if b_videos else "NO VIDS"
            matches_missing.append(f"{match_name} (A:{a_status} B:{b_status})")

    print(f"\n=== World Cup Match Video Status ===")
    print(f"Total matches:    {len(stories)}")
    print(f"Assembled:        {len(matches_with_videos)}")
    print(f"Pending:          {len(matches_missing)}")

    total_player_videos = sum(1 for _ in VIDEOS_DIR.rglob("*.mp4"))
    print(f"Player videos:    {total_player_videos}")

    if matches_missing:
        print(f"\nReady to assemble (have videos):")
        for m in matches_missing[:10]:
            print(f"  {m}")
        if len(matches_missing) > 10:
            print(f"  ... and {len(matches_missing) - 10} more")
    print()


def main():
    parser = argparse.ArgumentParser(description="Assemble World Cup match videos")
    parser.add_argument("--match", help="Assemble one match only")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--status", action="store_true")
    parser.add_argument("--retry-failed", action="store_true")
    args = parser.parse_args()

    progress = Progress.load()

    if args.status:
        show_status(progress)
        return

    # Find stories
    if args.match:
        story = STORIES_DIR / f"{args.match}.md"
        if not story.exists():
            # Try with hyphens
            story = STORIES_DIR / f"{args.match.replace(' ', '-')}.md"
        if not story.exists():
            print(f"ERROR: Story not found for '{args.match}'")
            sys.exit(1)
        stories = [story]
    else:
        stories = sorted(STORIES_DIR.glob("*.md"))

    assembled = 0
    failed = 0
    skipped = 0

    for story in stories:
        match_name = story.stem

        # Skip if already done
        if match_name in progress.completed and not args.retry_failed:
            skipped += 1
            continue

        team_a, team_b = parse_match_name(story)
        if not team_a or not team_b:
            failed += 1
            progress.failed[match_name] = "Could not parse team names"
            progress.save()
            continue

        a_videos = find_player_videos(team_a)
        b_videos = find_player_videos(team_b)

        if args.dry_run:
            output = OUTPUT_DIR / f"{match_name}.mp4"
            print(f"  [{team_a} vs {team_b}] {len(a_videos)}+{len(b_videos)} videos -> {output.name}")
            continue

        if not a_videos or not b_videos:
            # Not all videos generated yet
            continue

        print(f"Assembling {team_a} vs {team_b} ({len(a_videos)}+{len(b_videos)} videos)...")

        if assemble_match_video(match_name, a_videos, b_videos):
            output = OUTPUT_DIR / f"{match_name}.mp4"
            progress.completed[match_name] = str(output)
            progress.failed.pop(match_name, None)
            assembled += 1
            print(f"  [OK] {output.name}")
        else:
            progress.failed[match_name] = "Assembly failed"
            failed += 1
            print(f"  [FAIL] {match_name}")

        progress.save()

    print(f"\nAssembled: {assembled}, Failed: {failed}, Skipped: {skipped}")
    show_status(progress)


if __name__ == "__main__":
    main()
