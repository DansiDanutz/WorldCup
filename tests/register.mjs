import { register } from "node:module";

// Enable the browser story-voice fallback path under test so the unit tests for
// selectBrowserBrianStoryVoice exercise the real selection logic. This flag is
// production-gated via NEXT_PUBLIC_ALLOW_BROWSER_STORY_VOICE_FALLBACK and stays
// off in real builds unless explicitly set; here we only default it on for tests.
process.env.NEXT_PUBLIC_ALLOW_BROWSER_STORY_VOICE_FALLBACK ??= "true";

register("./alias-hooks.mjs", import.meta.url);
