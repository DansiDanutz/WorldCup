#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

LOG_FILE="runtime/campaign-watchdog.log"
MONITOR_FILE="runtime/live-campaign-monitor.json"
STALE_SECONDS="${CAMPAIGN_STALE_SECONDS:-2100}"
VIDEO_FILE="media/worldcup26-main-video.mp4"
mkdir -p runtime

export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.local/bin:$PATH"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

mtime_epoch() {
  if [ ! -f "$1" ]; then
    echo 0
    return
  fi
  stat -c %Y "$1" 2>/dev/null || stat -f %m "$1" 2>/dev/null || echo 0
}

{
  echo "$(timestamp) watchdog check"
  now_epoch="$(date +%s)"
  monitor_epoch="$(mtime_epoch "$MONITOR_FILE")"
  if [ "$monitor_epoch" -gt 0 ]; then
    monitor_age=$((now_epoch - monitor_epoch))
    echo "$(timestamp) monitor_age_seconds=$monitor_age stale_after_seconds=$STALE_SECONDS"
    if [ "$monitor_age" -gt "$STALE_SECONDS" ]; then
      echo "$(timestamp) monitor stale; restarting campaign loop"
      ./campaign-loop.sh stop || true
    fi
  else
    echo "$(timestamp) monitor missing; ensuring campaign loop is running"
  fi

  if [ -f "$VIDEO_FILE" ]; then
    video_size="$(wc -c < "$VIDEO_FILE" | tr -d ' ')"
    echo "$(timestamp) media_ok $VIDEO_FILE bytes=$video_size"
  else
    echo "$(timestamp) media_missing $VIDEO_FILE"
  fi

  if [ -f campaign-link-sentinel.mjs ]; then
    if node campaign-link-sentinel.mjs --quiet; then
      echo "$(timestamp) link_sentinel_ok"
    else
      echo "$(timestamp) link_sentinel_failed"
    fi
  else
    echo "$(timestamp) link_sentinel_missing"
  fi

  ./campaign-loop.sh start
  ./campaign-loop.sh status | sed -n '1,24p'
} >>"$LOG_FILE" 2>&1
