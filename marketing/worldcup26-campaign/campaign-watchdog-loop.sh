#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PID_FILE="runtime/campaign-watchdog-daemon.pid"
LOG_FILE="runtime/campaign-watchdog-daemon.log"
INTERVAL_SECONDS="${CAMPAIGN_WATCHDOG_INTERVAL_SECONDS:-300}"

mkdir -p runtime

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

running_pid() {
  if [ -s "$PID_FILE" ]; then
    local pid
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "$pid"
      return 0
    fi
  fi

  if command -v pgrep >/dev/null 2>&1 && [ -d /proc ]; then
    local current_dir
    current_dir="$(pwd -P)"
    local pid
    for pid in $(pgrep -f "campaign-watchdog-loop.sh run" 2>/dev/null || true); do
      [ "$pid" = "$$" ] && continue
      local args
      args="$(ps -p "$pid" -o args= 2>/dev/null || true)"
      case "$args" in
        *"bash -c"*|*"pgrep -f"*|*"pgrep -af"*) continue ;;
      esac
      local cwd
      cwd="$(readlink "/proc/$pid/cwd" 2>/dev/null || true)"
      if [ "$cwd" = "$current_dir" ]; then
        echo "$pid"
        return 0
      fi
    done
  fi

  return 1
}

case "${1:-}" in
  start)
    if pid="$(running_pid)"; then
      echo "$pid" > "$PID_FILE"
      echo "campaign-watchdog-loop already running pid=$pid"
      exit 0
    fi
    nohup "$0" run >>"$LOG_FILE" 2>&1 &
    echo "$!" > "$PID_FILE"
    echo "campaign-watchdog-loop started pid=$!"
    ;;
  stop)
    if pid="$(running_pid)"; then
      kill "$pid" 2>/dev/null || true
      echo "stopped campaign-watchdog-loop pid=$pid"
    else
      echo "campaign-watchdog-loop not running"
    fi
    rm -f "$PID_FILE"
    ;;
  status)
    if pid="$(running_pid)"; then
      echo "$pid" > "$PID_FILE"
      echo "campaign-watchdog-loop running pid=$pid"
      ps -p "$pid" -o pid,ppid,stat,etime,args= 2>/dev/null || true
    else
      echo "campaign-watchdog-loop not running"
    fi
    tail -20 "$LOG_FILE" 2>/dev/null || true
    ;;
  run)
    echo "$$" > "$PID_FILE"
    trap 'rm -f "$PID_FILE"; echo "$(timestamp) watchdog-loop stopped"; exit 0' INT TERM
    echo "$(timestamp) watchdog-loop started interval_seconds=$INTERVAL_SECONDS"
    while true; do
      if ./campaign-watchdog.sh; then
        echo "$(timestamp) watchdog check ok"
      else
        echo "$(timestamp) watchdog check failed"
      fi
      sleep "$INTERVAL_SECONDS" &
      wait "$!"
    done
    ;;
  *)
    echo "Usage: ./campaign-watchdog-loop.sh start|status|stop|run"
    exit 2
    ;;
esac
