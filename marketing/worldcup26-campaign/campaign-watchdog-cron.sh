#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

START_MARKER="# worldcup26-campaign-watchdog-loop:start"
END_MARKER="# worldcup26-campaign-watchdog-loop:end"
INTERVAL="${CAMPAIGN_WATCHDOG_CRON_INTERVAL:-*/5 * * * *}"
CAMPAIGN_DIR="$(pwd -P)"
CRON_LOG="runtime/campaign-watchdog-loop-cron.log"

tmp_current="$(mktemp)"
tmp_next="$(mktemp)"
tmp_block="$(mktemp)"

cleanup() {
  rm -f "$tmp_current" "$tmp_next" "$tmp_block"
}
trap cleanup EXIT

case "${1:-install}" in
  install)
    crontab -l >"$tmp_current" 2>/dev/null || true
    cat >"$tmp_block" <<EOF
$START_MARKER
$INTERVAL cd $CAMPAIGN_DIR && ./campaign-watchdog-loop.sh start >> $CRON_LOG 2>&1
$END_MARKER
EOF
    awk -v start="$START_MARKER" -v end="$END_MARKER" '
      $0 == start { skip = 1; next }
      $0 == end { skip = 0; next }
      skip != 1 { print }
    ' "$tmp_current" >"$tmp_next"
    cat "$tmp_block" >>"$tmp_next"
    crontab "$tmp_next"
    echo "installed watchdog-loop cron for $CAMPAIGN_DIR"
    ;;
  remove)
    crontab -l >"$tmp_current" 2>/dev/null || true
    awk -v start="$START_MARKER" -v end="$END_MARKER" '
      $0 == start { skip = 1; next }
      $0 == end { skip = 0; next }
      skip != 1 { print }
    ' "$tmp_current" >"$tmp_next"
    crontab "$tmp_next"
    echo "removed watchdog-loop cron for $CAMPAIGN_DIR"
    ;;
  status)
    crontab -l 2>/dev/null | awk -v start="$START_MARKER" -v end="$END_MARKER" '
      $0 == start { show = 1 }
      show == 1 { print }
      $0 == end { show = 0 }
    ' || true
    ;;
  *)
    echo "Usage: ./campaign-watchdog-cron.sh install|status|remove"
    exit 2
    ;;
esac
