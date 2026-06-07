#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

DURATION_HOURS="${CAMPAIGN_DURATION_HOURS:-72}"
INTERVAL_SECONDS="${CAMPAIGN_INTERVAL_SECONDS:-900}"
WINDOW_HOURS="${CAMPAIGN_WINDOW_HOURS:-12}"
PID_FILE="runtime/campaign-loop.pid"
LOG_FILE="runtime/campaign-loop.log"

mkdir -p runtime

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

cleanup_loop_exit() {
  local status="$?"
  if [ "${LOOP_EXIT_REPORTED:-0}" = "1" ]; then
    return "$status"
  fi
  LOOP_EXIT_REPORTED=1
  if [ "${1:-}" = "signal" ]; then
    echo "$(timestamp) campaign-loop signal exit status=$status pid=$$"
  elif [ "$status" -ne 0 ]; then
    echo "$(timestamp) campaign-loop unexpected exit status=$status pid=$$"
  fi
  return "$status"
}

trap 'cleanup_loop_exit signal' HUP INT TERM
trap 'cleanup_loop_exit' EXIT

running_pid() {
  if [ -f "$PID_FILE" ]; then
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
    for pid in $(pgrep -f "campaign-loop.sh run" 2>/dev/null || true); do
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

if [ "${1:-}" = "status" ]; then
  if pid="$(running_pid)"; then
    echo "$pid" > "$PID_FILE"
    echo "campaign-loop running pid=$pid"
  else
    echo "campaign-loop not running"
  fi
  if [ -s runtime/live-campaign-monitor.md ]; then
    sed -n '1,44p' runtime/live-campaign-monitor.md
  fi
  if [ -s runtime/link-sentinel.txt ]; then
    echo
    sed -n '1,40p' runtime/link-sentinel.txt
  fi
  if [ -s runtime/paid-traffic-guard.txt ]; then
    echo
    sed -n '1,80p' runtime/paid-traffic-guard.txt
  fi
  if [ -s runtime/live-ad-qa.txt ]; then
    echo
    sed -n '1,90p' runtime/live-ad-qa.txt
  fi
  if [ -s runtime/ad-platform-audit.txt ]; then
    echo
    sed -n '1,90p' runtime/ad-platform-audit.txt
  fi
  if [ -s runtime/ad-ops-links.txt ]; then
    echo
    sed -n '1,90p' runtime/ad-ops-links.txt
  fi
  if [ -s runtime/paid-dashboard-checks.txt ]; then
    echo
    sed -n '1,100p' runtime/paid-dashboard-checks.txt
  fi
  if [ -s runtime/paid-ad-triage.txt ]; then
    echo
    sed -n '1,100p' runtime/paid-ad-triage.txt
  fi
  if [ -s runtime/signup-conversion-audit.txt ]; then
    echo
    sed -n '1,120p' runtime/signup-conversion-audit.txt
  fi
  if [ -s runtime/paid-no-click-rescue.txt ]; then
    echo
    sed -n '1,120p' runtime/paid-no-click-rescue.txt
  fi
  if [ -s runtime/conversion-guard.txt ]; then
    echo
    sed -n '1,90p' runtime/conversion-guard.txt
  fi
  if [ -s runtime/referral-activity.txt ]; then
    echo
    sed -n '1,80p' runtime/referral-activity.txt
  fi
  if [ -s runtime/dispatch-board.md ]; then
    echo
    sed -n '1,70p' runtime/dispatch-board.md
  fi
  if [ -s runtime/next-hour-handoff.md ]; then
    echo
    sed -n '1,90p' runtime/next-hour-handoff.md
  fi
  if [ -s runtime/phone-action-sheet.md ]; then
    echo
    sed -n '1,44p' runtime/phone-action-sheet.md
  fi
  if [ -s runtime/top-six-mobile.txt ]; then
    echo
    sed -n '1,90p' runtime/top-six-mobile.txt
  fi
  if [ -s runtime/urgent-phone-handoff.md ]; then
    echo
    sed -n '1,70p' runtime/urgent-phone-handoff.md
  elif [ -s runtime/todays-10-handoff.md ]; then
    echo
    sed -n '1,70p' runtime/todays-10-handoff.md
  fi
  if [ -s runtime/nonstop-pulse.md ]; then
    echo
    sed -n '1,70p' runtime/nonstop-pulse.md
  fi
  if [ -s runtime/hot-proof-ping.txt ]; then
    echo
    sed -n '1,80p' runtime/hot-proof-ping.txt
  fi
  if [ -s runtime/posting-sprint.txt ]; then
    echo
    sed -n '1,80p' runtime/posting-sprint.txt
  fi
  if [ -s runtime/session-recovery.txt ]; then
    echo
    sed -n '1,80p' runtime/session-recovery.txt
  fi
  if [ -s runtime/escalation-board.txt ]; then
    echo
    sed -n '1,90p' runtime/escalation-board.txt
  fi
  if [ -s runtime/proof-stall.txt ]; then
    echo
    sed -n '1,80p' runtime/proof-stall.txt
  fi
  if [ -s runtime/proof-sla.txt ]; then
    echo
    sed -n '1,90p' runtime/proof-sla.txt
  fi
  if [ -s runtime/proof-audit.txt ]; then
    echo
    sed -n '1,90p' runtime/proof-audit.txt
  fi
  if [ -s runtime/proof-url-recovery.txt ]; then
    echo
    sed -n '1,90p' runtime/proof-url-recovery.txt
  fi
  if [ -s runtime/proof-rescue.txt ]; then
    echo
    sed -n '1,100p' runtime/proof-rescue.txt
  fi
  if [ -s runtime/social-rescue-pack.txt ]; then
    echo
    sed -n '1,100p' runtime/social-rescue-pack.txt
  fi
  if [ -s runtime/zero-signup-rescue.txt ]; then
    echo
    sed -n '1,100p' runtime/zero-signup-rescue.txt
  fi
  if [ -s runtime/real-action-bridge.txt ]; then
    echo
    sed -n '1,120p' runtime/real-action-bridge.txt
  fi
  if [ -s runtime/one-click-share.txt ]; then
    echo
    sed -n '1,140p' runtime/one-click-share.txt
  fi
  if [ -s runtime/warm-contact-sprint.txt ]; then
    echo
    sed -n '1,140p' runtime/warm-contact-sprint.txt
  fi
  if [ -s runtime/warm-followup-monitor.txt ]; then
    echo
    sed -n '1,90p' runtime/warm-followup-monitor.txt
  fi
  if [ -s runtime/tester-batch-operator.txt ]; then
    echo
    sed -n '1,110p' runtime/tester-batch-operator.txt
  fi
  if [ -s runtime/response-kit.txt ]; then
    echo
    sed -n '1,120p' runtime/response-kit.txt
  fi
  if [ -s runtime/public-outreach-targets.txt ]; then
    echo
    sed -n '1,140p' runtime/public-outreach-targets.txt
  fi
  if [ -s runtime/public-channel-attempts.txt ]; then
    echo
    sed -n '1,90p' runtime/public-channel-attempts.txt
  fi
  if [ -s runtime/login-unlock-board.txt ]; then
    echo
    sed -n '1,120p' runtime/login-unlock-board.txt
  fi
  if [ -s runtime/objective-audit.txt ]; then
    echo
    sed -n '1,120p' runtime/objective-audit.txt
  fi
  if [ -s runtime/evidence-board.txt ]; then
    echo
    sed -n '1,120p' runtime/evidence-board.txt
  fi
  if [ -s runtime/operator-push-packet.txt ]; then
    echo
    sed -n '1,140p' runtime/operator-push-packet.txt
  fi
  if [ -s runtime/action-launcher.txt ]; then
    echo
    sed -n '1,120p' runtime/action-launcher.txt
  fi
  if [ -s runtime/first-human-actions.txt ]; then
    echo
    sed -n '1,120p' runtime/first-human-actions.txt
  fi
  if [ -s runtime/worker-launchers.txt ]; then
    echo
    sed -n '1,100p' runtime/worker-launchers.txt
  fi
  if [ -s runtime/proof-intake.txt ]; then
    echo
    sed -n '1,80p' runtime/proof-intake.txt
  fi
  if [ -s runtime/proof-closeout.txt ]; then
    echo
    sed -n '1,100p' runtime/proof-closeout.txt
  fi
  if [ -s runtime/posting-cockpit.txt ]; then
    echo
    awk 'NR <= 90 { print substr($0, 1, 240) }' runtime/posting-cockpit.txt
  fi
  if [ -s runtime/worker-wake-board.txt ]; then
    echo
    sed -n '1,90p' runtime/worker-wake-board.txt
  fi
  if [ -f campaign-proof-log.mjs ]; then
    echo
    echo "Proof logger:"
    echo "  node campaign-proof-log.mjs --priority N --proof-url \"POST_URL_OR_PRIVATE_NOTE\" --status posted"
    node campaign-proof-log.mjs --list | sed -n '1,44p' || true
  fi
  tail -20 "$LOG_FILE" 2>/dev/null || true
  exit 0
fi

if [ "${1:-}" = "stop" ]; then
  if pid="$(running_pid)"; then
    kill "$pid"
    echo "stopped campaign-loop pid=$pid"
  else
    echo "campaign-loop not running"
  fi
  rm -f "$PID_FILE"
  exit 0
fi

if [ "${1:-}" = "start" ]; then
  if pid="$(running_pid)"; then
    echo "$pid" > "$PID_FILE"
    echo "campaign-loop already running pid=$pid"
    exit 0
  fi

  nohup "$0" run >>"$LOG_FILE" 2>&1 &
  echo "$!" > "$PID_FILE"
  echo "campaign-loop started pid=$!"
  exit 0
fi

if [ "${1:-}" = "refresh" ]; then
  CAMPAIGN_ONCE=1 "$0" run
  exit $?
fi

if [ "${1:-}" != "run" ]; then
  echo "Usage: ./campaign-loop.sh start|status|stop|refresh|run"
  exit 2
fi

end_epoch=$(($(date +%s) + DURATION_HOURS * 3600))
echo "$(timestamp) campaign-loop run started duration_hours=$DURATION_HOURS interval_seconds=$INTERVAL_SECONDS"

while [ "$(date +%s)" -lt "$end_epoch" ]; do
  if node campaign-runner.mjs --window-hours "$WINDOW_HOURS"; then
    echo "$(timestamp) runner ok"
    if [ -f campaign-pulse.mjs ]; then
      if node campaign-pulse.mjs --window-hours "$DURATION_HOURS" --interval-minutes 15 --quiet; then
        echo "$(timestamp) pulse ok"
      else
        echo "$(timestamp) pulse failed"
      fi
    fi
    if [ -f campaign-dispatch.mjs ]; then
      if node campaign-dispatch.mjs --quiet; then
        echo "$(timestamp) dispatch ok"
      else
        echo "$(timestamp) dispatch failed"
      fi
    fi
    if [ -f campaign-link-sentinel.mjs ]; then
      if node campaign-link-sentinel.mjs --quiet; then
        echo "$(timestamp) link-sentinel ok"
      else
        echo "$(timestamp) link-sentinel failed"
      fi
    fi
    if [ -f campaign-paid-traffic-guard.mjs ]; then
      if node campaign-paid-traffic-guard.mjs --quiet; then
        echo "$(timestamp) paid-traffic-guard ok"
      else
        echo "$(timestamp) paid-traffic-guard failed"
      fi
    fi
    if [ -f campaign-live-ad-qa.mjs ]; then
      if node campaign-live-ad-qa.mjs --quiet; then
        echo "$(timestamp) live-ad-qa ok"
      else
        echo "$(timestamp) live-ad-qa failed"
      fi
    fi
    if [ -f campaign-ad-platform-audit.mjs ]; then
      if node campaign-ad-platform-audit.mjs --quiet; then
        echo "$(timestamp) ad-platform-audit ok"
      else
        echo "$(timestamp) ad-platform-audit failed"
      fi
    fi
    if [ -f campaign-ad-ops-links.mjs ]; then
      if node campaign-ad-ops-links.mjs --quiet; then
        echo "$(timestamp) ad-ops-links ok"
      else
        echo "$(timestamp) ad-ops-links failed"
      fi
    fi
    if [ -f campaign-paid-dashboard-intake.mjs ]; then
      if node campaign-paid-dashboard-intake.mjs --quiet; then
        echo "$(timestamp) paid-dashboard-checks ok"
      else
        echo "$(timestamp) paid-dashboard-checks failed"
      fi
    fi
    if [ -f campaign-paid-ad-triage.mjs ]; then
      if node campaign-paid-ad-triage.mjs --quiet; then
        echo "$(timestamp) paid-ad-triage ok"
      else
        echo "$(timestamp) paid-ad-triage failed"
      fi
    fi
    if [ -f campaign-paid-no-click-rescue.mjs ]; then
      if node campaign-paid-no-click-rescue.mjs --quiet; then
        echo "$(timestamp) paid-no-click-rescue ok"
      else
        echo "$(timestamp) paid-no-click-rescue failed"
      fi
    fi
    if [ -f campaign-conversion-guard.mjs ]; then
      if node campaign-conversion-guard.mjs --quiet; then
        echo "$(timestamp) conversion-guard ok"
      else
        echo "$(timestamp) conversion-guard failed"
      fi
    fi
    if [ -f campaign-referral-activity.mjs ]; then
      if node campaign-referral-activity.mjs --quiet; then
        echo "$(timestamp) referral-activity ok"
      else
        echo "$(timestamp) referral-activity failed"
      fi
    fi
    if [ -f campaign-signup-conversion-audit.mjs ]; then
      if node campaign-signup-conversion-audit.mjs --quiet; then
        echo "$(timestamp) signup-conversion-audit ok"
      else
        echo "$(timestamp) signup-conversion-audit failed"
      fi
    fi
    if [ -f campaign-next-hour.mjs ]; then
      if node campaign-next-hour.mjs --quiet; then
        echo "$(timestamp) next-hour ok"
      else
        echo "$(timestamp) next-hour failed"
      fi
    fi
    if [ -f campaign-phone-action-sheet.mjs ]; then
      if node campaign-phone-action-sheet.mjs --quiet; then
        echo "$(timestamp) phone-action-sheet ok"
      else
        echo "$(timestamp) phone-action-sheet failed"
      fi
    fi
    if [ -f campaign-top-six-mobile.mjs ]; then
      if node campaign-top-six-mobile.mjs --quiet; then
        echo "$(timestamp) top-six-mobile ok"
      else
        echo "$(timestamp) top-six-mobile failed"
      fi
    fi
    if [ -f campaign-warm-contact-sprint.mjs ]; then
      if node campaign-warm-contact-sprint.mjs --quiet; then
        echo "$(timestamp) warm-contact-sprint ok"
      else
        echo "$(timestamp) warm-contact-sprint failed"
      fi
    fi
    if [ -f campaign-warm-followup-monitor.mjs ]; then
      if node campaign-warm-followup-monitor.mjs --quiet; then
        echo "$(timestamp) warm-followup-monitor ok"
      else
        echo "$(timestamp) warm-followup-monitor failed"
      fi
    fi
    if [ -f campaign-response-kit.mjs ]; then
      if node campaign-response-kit.mjs --quiet; then
        echo "$(timestamp) response-kit ok"
      else
        echo "$(timestamp) response-kit failed"
      fi
    fi
    if [ -f campaign-action-launcher.mjs ]; then
      if node campaign-action-launcher.mjs --quiet; then
        echo "$(timestamp) action-launcher ok"
      else
        echo "$(timestamp) action-launcher failed"
      fi
    fi
    if [ -f campaign-first-human-actions.mjs ]; then
      if node campaign-first-human-actions.mjs --quiet; then
        echo "$(timestamp) first-human-actions ok"
      else
        echo "$(timestamp) first-human-actions failed"
      fi
    fi
    if [ -f campaign-first-send-bridge.mjs ]; then
      if node campaign-first-send-bridge.mjs --quiet; then
        echo "$(timestamp) first-send-bridge ok"
      else
        echo "$(timestamp) first-send-bridge failed"
      fi
    fi
    if [ -f campaign-tester-batch-operator.mjs ]; then
      if node campaign-tester-batch-operator.mjs --quiet; then
        echo "$(timestamp) tester-batch-operator ok"
      else
        echo "$(timestamp) tester-batch-operator failed"
      fi
    fi
    if [ -f campaign-hot-ping.mjs ]; then
      if node campaign-hot-ping.mjs --quiet; then
        echo "$(timestamp) hot-proof-ping ok"
      else
        echo "$(timestamp) hot-proof-ping failed"
      fi
    fi
    if [ -f campaign-sprint-board.mjs ]; then
      if node campaign-sprint-board.mjs --quiet; then
        echo "$(timestamp) posting-sprint ok"
      else
        echo "$(timestamp) posting-sprint failed"
      fi
    fi
    if [ -f campaign-session-recovery.mjs ]; then
      if node campaign-session-recovery.mjs --quiet; then
        echo "$(timestamp) session-recovery ok"
      else
        echo "$(timestamp) session-recovery failed"
      fi
    fi
    if [ -f campaign-proof-stall.mjs ]; then
      if node campaign-proof-stall.mjs --quiet; then
        echo "$(timestamp) proof-stall monitor ok"
      else
        echo "$(timestamp) proof-stall monitor failed"
      fi
    fi
    if [ -f campaign-proof-sla.mjs ]; then
      if node campaign-proof-sla.mjs --quiet; then
        echo "$(timestamp) proof-sla ok"
      else
        echo "$(timestamp) proof-sla failed"
      fi
    fi
    if [ -f campaign-proof-audit.mjs ]; then
      if node campaign-proof-audit.mjs --quiet; then
        echo "$(timestamp) proof-audit ok"
      else
        echo "$(timestamp) proof-audit failed"
      fi
    fi
    if [ -f campaign-proof-url-recovery.mjs ]; then
      if node campaign-proof-url-recovery.mjs --quiet; then
        echo "$(timestamp) proof-url-recovery ok"
      else
        echo "$(timestamp) proof-url-recovery failed"
      fi
    fi
    if [ -f campaign-proof-rescue.mjs ]; then
      if node campaign-proof-rescue.mjs --quiet; then
        echo "$(timestamp) proof-rescue ok"
      else
        echo "$(timestamp) proof-rescue failed"
      fi
    fi
    if [ -f campaign-social-rescue-pack.mjs ]; then
      if node campaign-social-rescue-pack.mjs --quiet; then
        echo "$(timestamp) social-rescue-pack ok"
      else
        echo "$(timestamp) social-rescue-pack failed"
      fi
    fi
    if [ -f campaign-zero-signup-rescue.mjs ]; then
      if node campaign-zero-signup-rescue.mjs --quiet; then
        echo "$(timestamp) zero-signup-rescue ok"
      else
        echo "$(timestamp) zero-signup-rescue failed"
      fi
    fi
    if [ -f campaign-public-channel-attempts.mjs ]; then
      if node campaign-public-channel-attempts.mjs --quiet; then
        echo "$(timestamp) public-channel-attempts ok"
      else
        echo "$(timestamp) public-channel-attempts failed"
      fi
    fi
    if [ -f campaign-login-unlock-board.mjs ]; then
      if node campaign-login-unlock-board.mjs --quiet; then
        echo "$(timestamp) login-unlock-board ok"
      else
        echo "$(timestamp) login-unlock-board failed"
      fi
    fi
    if [ -f campaign-proof-intake.mjs ]; then
      if node campaign-proof-intake.mjs --quiet; then
        echo "$(timestamp) proof-intake ok"
      else
        echo "$(timestamp) proof-intake failed"
      fi
    fi
    if [ -f campaign-proof-closeout.mjs ]; then
      if node campaign-proof-closeout.mjs --quiet; then
        echo "$(timestamp) proof-closeout ok"
      else
        echo "$(timestamp) proof-closeout failed"
      fi
    fi
    if [ -f campaign-posting-cockpit.mjs ]; then
      if node campaign-posting-cockpit.mjs --quiet; then
        echo "$(timestamp) posting-cockpit ok"
      else
        echo "$(timestamp) posting-cockpit failed"
      fi
    fi
    if [ -f campaign-worker-wake.mjs ]; then
      if node campaign-worker-wake.mjs --quiet; then
        echo "$(timestamp) worker-wake ok"
      else
        echo "$(timestamp) worker-wake failed"
      fi
    fi
    if [ -f campaign-escalation-board.mjs ]; then
      if node campaign-escalation-board.mjs --quiet; then
        echo "$(timestamp) escalation-board ok"
      else
        echo "$(timestamp) escalation-board failed"
      fi
    fi
    if [ -f campaign-objective-audit.mjs ]; then
      if node campaign-objective-audit.mjs --quiet; then
        echo "$(timestamp) objective-audit ok"
      else
        echo "$(timestamp) objective-audit failed"
      fi
    fi
    if [ -f campaign-evidence-board.mjs ]; then
      if node campaign-evidence-board.mjs --quiet; then
        echo "$(timestamp) evidence-board ok"
      else
        echo "$(timestamp) evidence-board failed"
      fi
    fi
    if [ -f campaign-operator-push.mjs ]; then
      if node campaign-operator-push.mjs --quiet; then
        echo "$(timestamp) operator-push ok"
      else
        echo "$(timestamp) operator-push failed"
      fi
    fi
    if [ -f campaign-real-action-bridge.mjs ]; then
      if node campaign-real-action-bridge.mjs --quiet; then
        echo "$(timestamp) real-action-bridge ok"
      else
        echo "$(timestamp) real-action-bridge failed"
      fi
    fi
    if [ -f campaign-one-click-share.mjs ]; then
      if node campaign-one-click-share.mjs --quiet; then
        echo "$(timestamp) one-click-share ok"
      else
        echo "$(timestamp) one-click-share failed"
      fi
    fi
    if [ -f campaign-public-outreach-targets.mjs ]; then
      if node campaign-public-outreach-targets.mjs --quiet; then
        echo "$(timestamp) public-outreach-targets ok"
      else
        echo "$(timestamp) public-outreach-targets failed"
      fi
    fi
    if [ -f campaign-worker-launchers.mjs ]; then
      if node campaign-worker-launchers.mjs --quiet; then
        echo "$(timestamp) worker-launchers ok"
      else
        echo "$(timestamp) worker-launchers failed"
      fi
    fi
  else
    echo "$(timestamp) runner failed"
  fi
  if [ "${CAMPAIGN_ONCE:-0}" = "1" ]; then
    break
  fi
  sleep "$INTERVAL_SECONDS"
done

echo "$(timestamp) campaign-loop completed"
rm -f "$PID_FILE"
