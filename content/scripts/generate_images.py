#!/usr/bin/env python3
"""
World Cup 2026 — Batch Pixar Character Image Generator
Uses Fal.ai GPT-Image-2 endpoint to generate images from Character/ prompt files.

Usage:
    export FAL_KEY=your_key_here
    python3 generate_images.py                    # generate all pending
    python3 generate_images.py --team Argentina   # generate one team
    python3 generate_images.py --concurrency 3    # parallel requests
    python3 generate_images.py --dry-run          # preview without calling API
    python3 generate_images.py --status           # show progress report
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path

WORLDCUP_ROOT = Path(__file__).resolve().parent.parent
CHARACTER_DIR = WORLDCUP_ROOT
OUTPUT_DIR = WORLDCUP_ROOT / "images"
PROGRESS_FILE = WORLDCUP_ROOT / "scripts" / "progress.json"
FAL_ENDPOINT = "https://fal.run/openai/gpt-image-2"


@dataclass
class Progress:
    completed: dict[str, str] = field(default_factory=dict)  # rel_path -> output_file
    failed: dict[str, str] = field(default_factory=dict)     # rel_path -> error

    def save(self):
        data = {"completed": self.completed, "failed": self.failed}
        PROGRESS_FILE.write_text(json.dumps(data, indent=2))

    @classmethod
    def load(cls):
        if PROGRESS_FILE.exists():
            data = json.loads(PROGRESS_FILE.read_text())
            return cls(completed=data.get("completed", {}), failed=data.get("failed", {}))
        return cls()


def find_prompt_files(team: str | None = None, supporters: bool = False) -> list[Path]:
    """Find all *-prompt.md files in Character/ or Supporters/ subdirs."""
    files = []
    if supporters:
        if team:
            supp_dir = WORLDCUP_ROOT / "Supporters" / team
            if supp_dir.exists():
                files.extend(sorted(supp_dir.glob("*-prompt.md")))
            else:
                print(f"ERROR: No Supporters/ folder for team '{team}'")
                sys.exit(1)
        else:
            supp_root = WORLDCUP_ROOT / "Supporters"
            if supp_root.is_dir():
                for team_dir in sorted(supp_root.iterdir()):
                    if team_dir.is_dir():
                        files.extend(sorted(team_dir.glob("*-prompt.md")))
    else:
        if team:
            team_dir = WORLDCUP_ROOT / team / "Character"
            if team_dir.exists():
                files.extend(sorted(team_dir.glob("*-prompt.md")))
            else:
                print(f"ERROR: No Character/ folder for team '{team}'")
                sys.exit(1)
        else:
            for team_dir in sorted(WORLDCUP_ROOT.iterdir()):
                char_dir = team_dir / "Character"
                if char_dir.is_dir():
                    files.extend(sorted(char_dir.glob("*-prompt.md")))
    return files


def extract_prompt(filepath: Path) -> str | None:
    """Extract the image generation prompt from a prompt file."""
    content = filepath.read_text(encoding="utf-8")
    
    # Character prompts: code block under "## Image Generation Prompt"
    match = re.search(
        r"## Image Generation Prompt\s*\n```\s*\n(.*?)\n```",
        content,
        re.DOTALL,
    )
    if match:
        return match.group(1).strip()
    
    # Supporter prompts: extract from "## Visual Description" to "## Mood"
    match = re.search(
        r"## Visual Description\s*\n(.*?)(?:\n## Mood|\n## Output|\Z)",
        content,
        re.DOTALL,
    )
    if match:
        prompt = match.group(1).strip()
        # Remove markdown bullet formatting for cleaner prompt
        prompt = re.sub(r"^\*\*.*?\*\*\s*\n", "", prompt, flags=re.MULTILINE)
        prompt = re.sub(r"^- ", "", prompt, flags=re.MULTILINE)
        return prompt.strip()
    
    return None


def rel_path(filepath: Path) -> str:
    """Relative path from WorldCup root, e.g. 'Argentina/Character/Messi-prompt.md'."""
    return filepath.relative_to(WORLDCUP_ROOT).as_posix()


def output_filepath(filepath: Path) -> Path:
    """Output image path, e.g. images/Argentina/Lionel-Messi.png or images/Supporters/Algeria/Ultra-Fan.png"""
    # Check if this is a supporter prompt
    if "Supporters" in filepath.parts:
        team = filepath.parent.name
        supporter = filepath.stem.replace("-prompt", "")
        return OUTPUT_DIR / "Supporters" / team / f"{supporter}.png"
    team = filepath.parent.parent.name
    player = filepath.stem.replace("-prompt", "")
    return OUTPUT_DIR / team / f"{player}.png"


def generate_image(prompt: str, fal_key: str) -> bytes:
    """Call Fal.ai GPT-Image-2 and return image bytes."""
    payload = json.dumps({
        "prompt": prompt,
        "image_size": "landscape_4_3",
        "quality": "medium",
        "num_images": 1,
        "output_format": "png",
    }).encode("utf-8")

    req = urllib.request.Request(
        FAL_ENDPOINT,
        data=payload,
        headers={
            "Authorization": f"Key {fal_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    max_retries = 3
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                # Fal returns images array with url or base64
                images = result.get("images", [])
                if not images:
                    raise ValueError(f"No images in response: {result}")

                img_data = images[0]
                if "url" in img_data:
                    # Download from URL
                    img_url = img_data["url"]
                    with urllib.request.urlopen(img_url, timeout=60) as img_resp:
                        return img_resp.read()
                elif "content" in img_data:
                    import base64
                    return base64.b64decode(img_data["content"])
                else:
                    raise ValueError(f"Unexpected image format: {list(img_data.keys())}")

        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            if e.code == 429:
                wait = 10 * (attempt + 1)
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            if e.code >= 500 and attempt < max_retries - 1:
                time.sleep(5 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {e.code}: {body}")
        except urllib.error.URLError as e:
            if attempt < max_retries - 1:
                time.sleep(5 * (attempt + 1))
                continue
            raise RuntimeError(f"Connection error: {e.reason}")

    raise RuntimeError("Max retries exceeded")


def process_file(filepath: Path, fal_key: str) -> tuple[str, bool, str]:
    """Process one prompt file. Returns (rel_path, success, message)."""
    rp = rel_path(filepath)
    prompt = extract_prompt(filepath)
    if not prompt:
        return rp, False, "Could not extract prompt from file"

    out = output_filepath(filepath)
    out.parent.mkdir(parents=True, exist_ok=True)

    try:
        img_bytes = generate_image(prompt, fal_key)
        out.write_bytes(img_bytes)
        return rp, True, str(out)
    except Exception as e:
        return rp, False, str(e)


def show_status(progress: Progress, all_files: list[Path]):
    """Print progress report."""
    total = len(all_files)
    done = len(progress.completed)
    failed = len(progress.failed)
    pending = total - done - failed

    print(f"\n=== World Cup Image Generation Status ===")
    print(f"Total prompts:  {total}")
    print(f"Completed:      {done} ({done/total*100:.1f}%)")
    print(f"Failed:         {failed}")
    print(f"Pending:        {pending}")

    if progress.failed:
        print(f"\nFailed files:")
        for rp, err in list(progress.failed.items())[:10]:
            print(f"  {rp}: {err}")
        if len(progress.failed) > 10:
            print(f"  ... and {len(progress.failed) - 10} more")

    # Per-team breakdown
    teams_done = {}
    for f in all_files:
        if "Supporters" in f.parts:
            team = f.parent.name
        else:
            team = f.parent.parent.name
        teams_done.setdefault(team, {"total": 0, "done": 0})
        teams_done[team]["total"] += 1
        rp = rel_path(f)
        if rp in progress.completed:
            teams_done[team]["done"] += 1

    print(f"\nPer-team progress:")
    for team in sorted(teams_done):
        t = teams_done[team]
        status = "DONE" if t["done"] == t["total"] else f"{t['done']}/{t['total']}"
        print(f"  {team:25s} {status}")
    print()


def main():
    parser = argparse.ArgumentParser(description="Generate World Cup Pixar character images")
    parser.add_argument("--team", help="Generate images for one team only")
    parser.add_argument("--concurrency", type=int, default=2, help="Parallel requests (default: 2)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without calling API")
    parser.add_argument("--status", action="store_true", help="Show progress report only")
    parser.add_argument("--retry-failed", action="store_true", help="Retry previously failed files")
    parser.add_argument("--delay", type=float, default=2.0, help="Delay between requests in seconds (default: 2)")
    parser.add_argument("--supporters", action="store_true", help="Generate supporter images instead of character images")
    args = parser.parse_args()

    all_files = find_prompt_files(args.team, supporters=args.supporters)
    progress = Progress.load()

    if args.status:
        show_status(progress, all_files)
        return

    fal_key = os.environ.get("FAL_KEY", "")
    if not fal_key and not args.dry_run:
        print("ERROR: Set FAL_KEY environment variable")
        print("  export FAL_KEY=your_key_here")
        print("  Get one at https://fal.ai/dashboard/keys")
        sys.exit(1)

    # Determine which files to process
    pending = []
    for f in all_files:
        rp = rel_path(f)
        if rp in progress.completed:
            continue
        if rp in progress.failed and not args.retry_failed:
            continue
        pending.append(f)

    if not pending:
        print("All images already generated!")
        show_status(progress, all_files)
        return

    print(f"Generating {len(pending)} images (concurrency={args.concurrency}, delay={args.delay}s)")
    print(f"Output: {OUTPUT_DIR}")
    print()

    if args.dry_run:
        for f in pending:
            prompt = extract_prompt(f)
            out = output_filepath(f)
            status = "OK" if prompt else "NO PROMPT"
            print(f"  [{status}] {out.name} -> {out}")
        print(f"\n{len(pending)} images would be generated")
        return

    completed_count = 0
    failed_count = 0

    def process_with_delay(filepath: Path) -> tuple[str, bool, str]:
        result = process_file(filepath, fal_key)
        time.sleep(args.delay)
        return result

    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = {executor.submit(process_with_delay, f): f for f in pending}

        for future in as_completed(futures):
            filepath = futures[future]
            try:
                rp, success, msg = future.result()
            except Exception as e:
                rp = rel_path(filepath)
                success = False
                msg = str(e)

            if success:
                progress.completed[rp] = msg
                completed_count += 1
                progress.failed.pop(rp, None)
                print(f"  [OK] {Path(msg).name} ({completed_count + failed_count}/{len(pending)})")
            else:
                progress.failed[rp] = msg
                failed_count += 1
                print(f"  [FAIL] {rp}: {msg} ({completed_count + failed_count}/{len(pending)})")

            # Save progress after each result
            progress.save()

    print(f"\nDone! {completed_count} generated, {failed_count} failed")
    show_status(progress, all_files)


if __name__ == "__main__":
    main()
