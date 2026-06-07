# Activation Runbook

Purpose: move the next 72 hours without confusion.

## Current Status

- Campaign copy pack exists.
- Video candidate exists outside the repo.
- Four droplets are reachable.
- Worker wrappers are executable locally.
- Remote opencode configs were backed up and set to `ollama/qwen3:4b`.
- Wrapper `--help` works for Dexter, Sienna, Memo, and Nano.
- Direct generation is still too slow/unreliable for urgent live drafting.
- Promo kit is copied and extracted on all four droplets at `~/DavidAi/worldcup26-promo-kit`.
- `campaign-runner.mjs` is the live action router for the 72-hour queue.

## Immediate Manual Execution

1. Use `first-wave-posts.md`.
2. Attach the video from `media-manifest.md`.
3. Log posts in `posting-log-template.csv`.
4. Use `copy-bank.md` for replies and second-wave variants.
5. Recheck live prize pool before using a number.

## 72-Hour Runner

Run this from each droplet after the promo kit is extracted:

```bash
cd ~/DavidAi/worldcup26-promo-kit/campaign
node campaign-runner.mjs --window-hours 12
```

Worker-specific views:

```bash
node campaign-runner.mjs --owner Dexter --window-hours 24
node campaign-runner.mjs --owner Sienna --window-hours 24
node campaign-runner.mjs --owner Memo --window-hours 24
node campaign-runner.mjs --owner Nano --window-hours 24
```

Read the generated `runtime/next-actions-*.md` and `runtime/draft-pack-*.md` files, execute only allowed manual posts/outreach, then record completed work in `runtime/posting-log-live.csv`.

Use `runtime/outbox-ready.csv` when a spreadsheet-style list of due copy is easier than Markdown.

For the nonstop 72-hour heartbeat:

```bash
cd ~/DavidAi/worldcup26-promo-kit/campaign
./campaign-loop.sh start
./campaign-loop.sh status
```

This keeps the action files fresh every 15 minutes. It does not post externally by itself.

## Worker Repair Follow-Up

The agents can be used for drafting only after a READY generation call returns reliably.

Known model config now targeted:

```text
model: ollama/qwen3:4b
small_model: ollama/qwen3:4b
```

Recommended next technical checks:

```bash
ssh dexter 'ollama ps && systemctl status ollama --no-pager | head -30'
ssh sienna 'ollama ps && systemctl status ollama --no-pager | head -30'
ssh memo 'ollama ps && systemctl status ollama --no-pager | head -30'
ssh nano 'ollama ps && systemctl status ollama --no-pager | head -30'
```

Then test one at a time:

```bash
/Users/davidai/Documents/Claude/Projects/CoWork-Worker/opencode-dexter.sh run "Reply exactly: DEXTER READY"
```

Do not launch all four into long generation until a single READY test is fast. The runner does not depend on model generation, so it can be used even when a worker model is cold or slow.
