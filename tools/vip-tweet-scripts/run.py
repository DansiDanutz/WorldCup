#!/usr/bin/env python3
"""CLI: scrape VIP footballer posts about the World Cup → channel-ready script.

Offline (default — no credentials needed):
    python run.py

Live (uses the X API v2 recent-search endpoint):
    export XAPI_BEARER_TOKEN=...   # never commit this
    python run.py --limit 50 --seconds 60

Output: a Markdown script written to --out (default out/vip_worldcup_script.md),
plus a one-line prompt you can paste into /youtube-automation-pipeline.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

from vipscript import build_script, curate, get_source

ROOT = Path(__file__).resolve().parent
DEFAULT_FIXTURE = ROOT / "fixtures" / "sample_tweets.json"
DEFAULT_PLAYERS = ROOT / "players.json"
DEFAULT_OUT = ROOT / "out" / "vip_worldcup_script.md"


def _load_dotenv(path: Path) -> None:
    """Minimal .env loader (no dependency). Existing env vars win."""
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export "):]
        key, sep, val = line.partition("=")
        if not sep:
            continue
        os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def _load_handles(players_path: Path) -> list[str]:
    data = json.loads(players_path.read_text(encoding="utf-8"))
    return [p["handle"] for p in data.get("players", [])]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--query", default="World Cup OR Mundial OR WC26",
                        help="search query for live mode")
    parser.add_argument("--players", type=Path, default=DEFAULT_PLAYERS,
                        help="JSON file of VIP handles")
    parser.add_argument("--fixture", type=Path, default=DEFAULT_FIXTURE,
                        help="offline tweet fixture (used when no API token)")
    parser.add_argument("--limit", type=int, default=50,
                        help="max tweets to pull before curation")
    parser.add_argument("--segments", type=int, default=5,
                        help="max curated posts to feature")
    parser.add_argument("--seconds", type=int, default=60,
                        help="target video length")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT,
                        help="where to write the script markdown")
    args = parser.parse_args(argv)

    _load_dotenv(ROOT / ".env")

    if args.limit <= 0 or args.segments <= 0 or args.seconds <= 0:
        parser.error("--limit, --segments and --seconds must all be positive")

    try:
        handles = _load_handles(args.players)
    except (OSError, json.JSONDecodeError, KeyError) as exc:
        print(f"[error] could not read players file {args.players}: {exc}", file=sys.stderr)
        return 2

    try:
        source = get_source(args.fixture)
        raw = source.fetch(handles=handles, query=args.query, limit=args.limit)
    except Exception as exc:  # noqa: BLE001 — surface any source failure cleanly
        print(f"[error] fetch failed: {exc}", file=sys.stderr)
        return 1

    if not raw:
        print("[warn] no tweets returned — nothing to script.", file=sys.stderr)
        return 1

    curated = curate(raw, max_results=args.segments)
    if not curated:
        print("[warn] no World-Cup-relevant posts after curation.", file=sys.stderr)
        return 1

    script = build_script(curated, target_seconds=args.seconds)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(script.to_markdown(), encoding="utf-8")

    print(f"[ok] {len(raw)} fetched → {len(curated)} curated → "
          f"{len(script.segments)} featured in {args.seconds}s → {args.out}")
    print(f"[ok] players: {', '.join(s.player_name for s in script.segments)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
