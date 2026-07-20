# ACE × imagine.art — Automated Episode/Shorts Factory (plan)

**Decisions locked:** imagine.art wired as **MCP + REST**; loop autonomy = **human gate before publish**.

## 0. What each piece is
- **imagine.art** — 3rd media backend (REST + official MCP). Text→video & image→video (Veo2 + others),
  image gen, JS/TS/Python SDKs, Bearer-token auth, subscription with an "unlimited" tier. Docs:
  docs.imagine.art · reference.imagine.art · imagine.art/gen-api. The flat-rate tier is the bulk-production unlock
  (an episode = ~30+ clips; per-credit gets expensive).
- **ACE (duocode)** — the visual orchestration brain: boards of agent stages with handoffs, multi-model routing,
  **verification gates**, and **loops**. It DRIVES stages; it does not render pixels.
- **Existing pipeline it plugs into** — `worldcup-episode` skill, `build-episode.sh`, the React/Playwright→ffmpeg
  render, HyperFrames cards, ElevenLabs Brian VO, and the multi-backend media router already started
  (Higgsfield + fal — see memory `video_gen_backends`).

## 1. Media backend router (imagine.art primary)
Every image/clip request: **imagine.art (primary, flat-rate) → Higgsfield → fal (failover)**. Preserve the
character-reference consistency rule (generate one hero ref, pass as reference to every shot). Wiring:
- **MCP:** add the official ImagineArt MCP to `~/.claude.json` (agents + ACE call it directly, like the Higgsfield MCP).
- **REST:** `IMAGINEART_API_KEY` in `~/.openclaw/fleet.env` (chmod 600, masked) + a thin client in the router for the
  headless/cron lane. Confirm exact endpoint from reference.imagine.art at wire-time.

## 2. ACE "Episode Factory" board — stages → gates
| Stage | Model/tool | Gate (loop-back on fail) |
|---|---|---|
| Research | Perplexity/Sonar + Agent-Reach | facts cited, verified mystery+hook (rule #9) |
| Script | Claude | Brian VO cues, NO on-screen sentences (rule #10), real-results-only (#7) |
| Storyboard | Claude | ~30 distinct beats, no-repeat plan (#11) |
| Image-gen | imagine.art | character-consistent, soccer-only, no logos (#5/#6) |
| Clip-gen | imagine.art→HF→fal | image→video per beat, **no clip reused** (#11), no invented signage |
| Voice | ElevenLabs Brian | one voice, cleared music |
| Assemble | HyperFrames/ffmpeg | labels-only text, WorldCup26.world CTA |
| QA | Claude vision | `preflight-episode.mjs`: monetization-safe, **48h-before-kickoff** |
| **Publish** | — | **MANUAL human gate — never auto-post (rule #0)** |

## 3. The loop
ACE iterates `content/youtube/SCHEDULE.md` (chronological fixtures), produces the **next unproduced episode**
each pass, keeps the **2-episode buffer ahead of kickoff**, stops at the publish gate for human approval.
Phase 4: clone the board for the **Did You Know? Shorts** factory (portrait 9:16, the shorts bank now in the app).

## 4. Rollout
- **Phase 0 (David):** subscribe to imagine.art + create API key; reconnect ACE's Claude account and relaunch ACE
  from Finder (NOT inside a Claude Code session).
- **Phase 1 (agent):** wire imagine.art (MCP + fleet.env), add to router with failover, smoke-test 1 image + 1 clip.
- **Phase 2 (agent):** build the Episode Factory board in ACE on the WorldCup repo; run ONE episode end-to-end,
  human-gated at publish.
- **Phase 3:** enable the queue loop (buffer 2 ahead); publish stays manual.
- **Phase 4:** add the Shorts factory loop.

## 5. Hard caveats
- ACE is a local supervised app, not a 24/7 server — use the fleet/cron for unattended runs, ACE for supervised loops.
- Verify imagine.art "unlimited" fair-use/rate limits before relying on it for 33-clip episodes.
- Agent cannot subscribe/pay or create the account (David's action). Keys masked, never printed.
- Publish is ALWAYS human-gated.
