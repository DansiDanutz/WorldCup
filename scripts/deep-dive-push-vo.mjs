// deep-dive-push-vo.mjs — make a Deep Dive's Brian VO and commit it to the branch,
// WITHOUT a clone (for machines that hold the ElevenLabs key but can't check out the
// 2.4 GB repo). Reads episode.json from GitHub, calls ElevenLabs with the same settings
// as marketing/deep-dives/engine/gen-vo.mjs, and pushes every vo/beat_NN.mp3 in ONE
// commit through the GitHub git-data API. Nothing is written to disk.
//
//   ELEVENLABS_API_KEY=… node deep-dive-push-vo.mjs [episode-slug] [branch]
//   DRY=1 node deep-dive-push-vo.mjs …   # read the script and list the beats, no TTS, no push
//
// GitHub auth: GITHUB_TOKEN, else `gh auth token`. The ElevenLabs key is read from the
// environment only — never printed, never written anywhere.
import { execFileSync } from 'node:child_process';

const REPO = 'DansiDanutz/WorldCup';
const SLUG = process.argv[2] || '01-yamal-messi-bath-photo';
const BRANCH = process.argv[3] || 'claude/video-continuation-next-subject-nxm76j';
const EP = `marketing/deep-dives/episodes/${SLUG}`;
const VOICE = process.env.ELEVENLABS_BRIAN_VOICE_ID || 'nPczCjzI2devNBz1zQrb'; // Brian — never another voice
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const DRY = process.env.DRY === '1';

const token = process.env.GITHUB_TOKEN || (() => {
  try { return execFileSync('gh', ['auth', 'token'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; }
})();
if (!token) { console.error('No GitHub auth: set GITHUB_TOKEN or log in with `gh auth login`.'); process.exit(2); }
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY && !DRY) { console.error('ELEVENLABS_API_KEY is not set.'); process.exit(2); }

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method || 'GET'} ${path}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// Pin the script to one commit: the audio must match exactly the narration it was made from.
const pinned = (await gh(`repos/${REPO}/git/ref/heads/${BRANCH}`)).object.sha;
const file = await gh(`repos/${REPO}/contents/${EP}/episode.json?ref=${pinned}`);
const ep = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
const texts = ep.beats.map((b) => b.vo.trim());
console.log(`${ep.slug}: ${texts.length} beats, ${texts.join(' ').split(/\s+/).length} words`);
if (DRY) process.exit(0);

const tree = [];
for (let i = 0; i < texts.length; i++) {
  const body = {
    text: texts[i],
    model_id: MODEL,
    // neighbouring sentences keep 34 separate requests sounding like one read
    previous_text: texts.slice(Math.max(0, i - 2), i).join(' ') || undefined,
    next_text: texts.slice(i + 1, i + 3).join(' ') || undefined,
    voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
  };
  let res;
  for (let attempt = 1; attempt <= 4; attempt++) {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(body),
    });
    if (res.ok || (res.status < 500 && res.status !== 429)) break;
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  if (!res.ok) { console.error(`beat ${i + 1}: ElevenLabs ${res.status} ${(await res.text()).slice(0, 300)}`); process.exit(1); }
  const audio = Buffer.from(await res.arrayBuffer());
  if (audio.length < 2000) { console.error(`beat ${i + 1}: ElevenLabs returned only ${audio.length} bytes`); process.exit(1); }
  const blob = await gh(`repos/${REPO}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: audio.toString('base64'), encoding: 'base64' }) });
  const name = `beat_${String(i + 1).padStart(2, '0')}.mp3`;
  tree.push({ path: `${EP}/vo/${name}`, mode: '100644', type: 'blob', sha: blob.sha });
  console.log(`vo  ${name}  ${(audio.length / 1024).toFixed(0)} KB`);
}

// one commit on top of the branch head — but only if the narration hasn't changed since we
// read it (build.mjs pairs audio with beats by file name, so stale audio would mis-speak)
const ref = await gh(`repos/${REPO}/git/ref/heads/${BRANCH}`);
if (ref.object.sha !== pinned) {
  const now = await gh(`repos/${REPO}/contents/${EP}/episode.json?ref=${ref.object.sha}`);
  if (now.sha !== file.sha) {
    console.error(`episode.json changed on ${BRANCH} while the VO was being made (${pinned.slice(0, 7)} -> ${ref.object.sha.slice(0, 7)}). Nothing pushed; run again.`);
    process.exit(1);
  }
}
const head = await gh(`repos/${REPO}/git/commits/${ref.object.sha}`);
const newTree = await gh(`repos/${REPO}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree }) });
const commit = await gh(`repos/${REPO}/git/commits`, {
  method: 'POST',
  body: JSON.stringify({ message: `feat(deep-dives): Brian VO for ${ep.slug} (${tree.length} beats)`, tree: newTree.sha, parents: [ref.object.sha] }),
});
await gh(`repos/${REPO}/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
console.log(`Brian VO pushed: ${tree.length} files in commit ${commit.sha} on ${BRANCH}`);
