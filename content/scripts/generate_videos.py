#!/usr/bin/env python3
"""
World Cup 2026 — Batch Video Generator
Takes generated character images and creates 6-8 sec animated videos via Seedance 2.0.

Usage:
    export FAL_KEY=your_key_here
    python3 generate_videos.py                    # generate all pending
    python3 generate_videos.py --team Argentina   # one team
    python3 generate_videos.py --concurrency 2    # parallel requests
    python3 generate_videos.py --dry-run          # preview
    python3 generate_videos.py --status           # progress report
    python3 generate_videos.py --retry-failed     # retry errors
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path

try:
    import fal_client
except ImportError:
    fal_client = None

WORLDCUP_ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = WORLDCUP_ROOT / "images"
OUTPUT_DIR = WORLDCUP_ROOT / "videos"
PROGRESS_FILE = WORLDCUP_ROOT / "scripts" / "video_progress.json"
SEEDANCE_ENDPOINT = "https://fal.run/bytedance/seedance-2.0/image-to-video"

MOTION_PROMPTS = [
    "Cinematic slow-motion camera orbit around a Pixar 3D animated football character, dramatic golden lighting, subtle wind blowing the jersey, epic stadium atmosphere, cinematic depth of field",
    "Dynamic camera push-in on a Pixar-style football character, character turns to camera with confident expression, dramatic lighting shift, volumetric fog, cinematic blockbuster feel",
    "Epic reveal shot of a Pixar 3D animated footballer, camera sweeps from behind to front, character strikes a powerful pose, golden hour lighting with lens flares, stadium crowd blurred in background",
]


@dataclass
class Progress:
    completed: dict[str, str] = field(default_factory=dict)
    failed: dict[str, str] = field(default_factory=dict)

    def save(self):
        data = {"completed": self.completed, "failed": self.failed}
        PROGRESS_FILE.write_text(json.dumps(data, indent=2))

    @classmethod
    def load(cls):
        if PROGRESS_FILE.exists():
            data = json.loads(PROGRESS_FILE.read_text())
            return cls(completed=data.get("completed", {}), failed=data.get("failed", {}))
        return cls()


def find_image_files(team: str | None = None) -> list[Path]:
    """Find all PNG images in the images/ directory."""
    files = []
    if team:
        team_dir = IMAGES_DIR / team
        if team_dir.exists():
            files.extend(sorted(team_dir.glob("*.png")))
        else:
            print(f"ERROR: No images for team '{team}'")
            sys.exit(1)
    else:
        for team_dir in sorted(IMAGES_DIR.iterdir()):
            if team_dir.is_dir():
                files.extend(sorted(team_dir.glob("*.png")))
    return files


def rel_path(filepath: Path) -> str:
    return filepath.relative_to(IMAGES_DIR).as_posix()


def output_filepath(filepath: Path) -> Path:
    team = filepath.parent.name
    player = filepath.stem
    return OUTPUT_DIR / team / f"{player}.mp4"


def upload_image(filepath: Path, fal_key: str) -> str:
    """Upload image to Fal CDN and return public URL."""
    if fal_client:
        os.environ["FAL_KEY"] = fal_key
        return fal_client.upload_file(str(filepath))
    else:
        # Fallback: use Fal REST API
        import base64
        data = filepath.read_bytes()
        filename = filepath.name

        # Get upload URL
        req = urllib.request.Request(
            "https://fal.ai/api/storage/upload/url",
            data=json.dumps({"file_name": filename}).encode(),
            headers={
                "Authorization": f"Key {fal_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            upload_url = result["url"]
            file_url = result["file_url"]

        # Upload file
        req2 = urllib.request.Request(
            upload_url,
            data=data,
            headers={"Content-Type": "image/png"},
            method="PUT",
        )
        with urllib.request.urlopen(req2, timeout=60) as resp:
            pass

        return file_url


def generate_video(image_url: str, fal_key: str, duration: str = "6") -> str:
    """Call Seedance image-to-video and return video URL."""
    prompt = MOTION_PROMPTS[hash(image_url) % len(MOTION_PROMPTS)]

    payload = json.dumps({
        "prompt": prompt,
        "image_url": image_url,
        "resolution": "720p",
        "duration": duration,
        "aspect_ratio": "16:9",
    }).encode()

    max_retries = 3
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                SEEDANCE_ENDPOINT,
                data=payload,
                headers={
                    "Authorization": f"Key {fal_key}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=600) as resp:
                result = json.loads(resp.read().decode())
                video = result.get("video", {})
                video_url = video.get("url")
                if not video_url:
                    raise ValueError(f"No video URL in response: {result}")
                return video_url

        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            if e.code == 429:
                wait = 15 * (attempt + 1)
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            if e.code >= 500 and attempt < max_retries - 1:
                time.sleep(10 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {e.code}: {body[:300]}")
        except urllib.error.URLError as e:
            if attempt < max_retries - 1:
                time.sleep(10 * (attempt + 1))
                continue
            raise RuntimeError(f"Connection error: {e.reason}")

    raise RuntimeError("Max retries exceeded")


def download_video(url: str, output: Path):
    """Download video from URL to file."""
    with urllib.request.urlopen(url, timeout=120) as resp:
        output.write_bytes(resp.read())


def process_file(filepath: Path, fal_key: str, duration: str = "6") -> tuple[str, bool, str]:
    """Process one image. Returns (rel_path, success, message)."""
    rp = rel_path(filepath)
    out = output_filepath(filepath)
    out.parent.mkdir(parents=True, exist_ok=True)

    try:
        # Step 1: Upload image
        image_url = upload_image(filepath, fal_key)

        # Step 2: Generate video
        video_url = generate_video(image_url, fal_key, duration)

        # Step 3: Download video
        download_video(video_url, out)

        return rp, True, str(out)
    except Exception as e:
        return rp, False, str(e)


def show_status(progress: Progress, all_files: list[Path]):
    total = len(all_files)
    done = len(progress.completed)
    failed = len(progress.failed)
    pending = total - done - failed

    print(f"\n=== World Cup Video Generation Status ===")
    print(f"Total images:   {total}")
    print(f"Videos done:    {done} ({done/total*100:.1f}%)" if total else "No images found")
    print(f"Failed:         {failed}")
    print(f"Pending:        {pending}")

    # Check if images even exist yet
    images_exist = len(all_files)
    print(f"Images on disk: {images_exist}")

    if progress.failed:
        print(f"\nFailed files:")
        for rp, err in list(progress.failed.items())[:10]:
            print(f"  {rp}: {err}")
        if len(progress.failed) > 10:
            print(f"  ... and {len(progress.failed) - 10} more")

    # Per-team breakdown
    teams = {}
    for f in all_files:
        team = f.parent.name
        teams.setdefault(team, {"total": 0, "done": 0})
        teams[team]["total"] += 1
        rp = rel_path(f)
        if rp in progress.completed:
            teams[team]["done"] += 1

    print(f"\nPer-team progress:")
    for team in sorted(teams):
        t = teams[team]
        status = "DONE" if t["done"] == t["total"] else f"{t['done']}/{t['total']}"
        print(f"  {team:25s} {status}")
    print()


def main():
    parser = argparse.ArgumentParser(description="Generate World Cup character videos")
    parser.add_argument("--team", help="Generate videos for one team only")
    parser.add_argument("--concurrency", type=int, default=2, help="Parallel requests (default: 2)")
    parser.add_argument("--duration", type=str, default="6", help="Video duration: 4-15 or auto (default: 6)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without calling API")
    parser.add_argument("--status", action="store_true", help="Show progress report only")
    parser.add_argument("--retry-failed", action="store_true", help="Retry previously failed files")
    parser.add_argument("--delay", type=float, default=3.0, help="Delay between requests (default: 3)")
    args = parser.parse_args()

    all_files = find_image_files(args.team)
    progress = Progress.load()

    if args.status:
        show_status(progress, all_files)
        return

    if not all_files:
        print("No images found. Run generate_images.py first.")
        sys.exit(1)

    fal_key = os.environ.get("FAL_KEY", "")
    if not fal_key and not args.dry_run:
        print("ERROR: Set FAL_KEY environment variable")
        sys.exit(1)

    # Determine pending files
    pending = []
    for f in all_files:
        rp = rel_path(f)
        if rp in progress.completed:
            continue
        if rp in progress.failed and not args.retry_failed:
            continue
        pending.append(f)

    if not pending:
        print("All videos already generated!")
        show_status(progress, all_files)
        return

    print(f"Generating {len(pending)} videos (concurrency={args.concurrency}, duration={args.duration}s)")
    print(f"Output: {OUTPUT_DIR}")
    print()

    if args.dry_run:
        for f in pending:
            out = output_filepath(f)
            print(f"  {out.relative_to(WORLDCUP_ROOT)}")
        print(f"\n{len(pending)} videos would be generated")
        return

    completed_count = 0
    failed_count = 0

    def process_with_delay(filepath: Path) -> tuple[str, bool, str]:
        result = process_file(filepath, fal_key, args.duration)
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
                print(f"  [FAIL] {rp}: {msg[:100]} ({completed_count + failed_count}/{len(pending)})")

            progress.save()

    print(f"\nDone! {completed_count} videos generated, {failed_count} failed")
    show_status(progress, all_files)


if __name__ == "__main__":
    main()
