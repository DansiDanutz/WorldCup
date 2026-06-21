// Generate a royalty-free cinematic ambient pad (no samples, fully synthesized)
// as a 16-bit stereo WAV. A slow I–V–vi–IV progression in D major with soft
// attack/release pad voices, gentle tremolo, stereo detune, and a light shimmer
// octave. Mixed low under the VO by mux_music — this is just the bed.
import fs from "node:fs";

const SR = 44100;
const DUR = Number(process.env.DUR || 180);
const OUT = process.env.OUT || "music.wav";

// I–V–vi–IV in D major, voiced low for a warm bed (Hz).
const CHORDS = [
  [146.83, 185.0, 220.0, 293.66], // D  (D3 F#3 A3 D4)
  [110.0, 164.81, 220.0, 277.18], // A  (A2 E3 A3 C#4)
  [123.47, 146.83, 185.0, 246.94], // Bm (B2 D3 F#3 B3)
  [98.0, 146.83, 196.0, 293.66], // G  (G2 D3 G3 D4)
];
const STEP = 6.0; // seconds per chord
const OVERLAP = 1.0; // crossfade between chords
const LEN = STEP + OVERLAP;

const twoPi = Math.PI * 2;
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)); // smoothstep

// Per-chord envelope: fade in over OVERLAP, sustain, fade out over OVERLAP.
function env(local) {
  if (local < 0 || local > LEN) return 0;
  const up = smooth(local / OVERLAP);
  const down = smooth((LEN - local) / OVERLAP);
  return Math.min(up, down);
}

// One detuned, slightly stereo pad voice (sum of two sines).
function voice(t, freq, detune, pan) {
  const a = Math.sin(twoPi * freq * t);
  const b = Math.sin(twoPi * (freq * (1 + detune)) * t + 0.7);
  const mono = (a + b) * 0.5;
  return mono * (pan ? 1.04 : 0.96); // tiny L/R level difference for width
}

const total = Math.floor(DUR * SR);
const buf = Buffer.alloc(44 + total * 2 * 2); // header + stereo 16-bit

// ---- WAV header ----
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + total * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); // PCM
buf.writeUInt16LE(2, 22); // stereo
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(total * 4, 40);

let peak = 0;
const samplesL = new Float64Array(total);
const samplesR = new Float64Array(total);

for (let i = 0; i < total; i++) {
  const t = i / SR;
  // active chords (current + previous during crossfade)
  const k1 = Math.floor(t / STEP);
  let l = 0;
  let r = 0;
  for (let k = k1 - 1; k <= k1; k++) {
    if (k < 0) continue;
    const local = t - k * STEP;
    const e = env(local);
    if (e <= 0) continue;
    const chord = CHORDS[k % CHORDS.length];
    for (let n = 0; n < chord.length; n++) {
      const f = chord[n];
      l += voice(t, f, 0.0015, false) * e;
      r += voice(t, f, -0.0015, true) * e;
      // soft shimmer one octave up, quiet, only on the top two notes
      if (n >= chord.length - 2) {
        l += voice(t, f * 2, 0.002, false) * e * 0.12;
        r += voice(t, f * 2, -0.002, true) * e * 0.12;
      }
    }
  }
  // slow tremolo for movement (~0.12 Hz)
  const trem = 0.85 + 0.15 * Math.sin(twoPi * 0.12 * t);
  l *= trem;
  r *= trem;
  samplesL[i] = l;
  samplesR[i] = r;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}

// Normalize to a calm -6 dBFS bed, with a global 2s fade in / 4s fade out.
const norm = (0.5 / (peak || 1));
const fadeIn = 2 * SR;
const fadeOut = 4 * SR;
let off = 44;
for (let i = 0; i < total; i++) {
  let g = norm;
  if (i < fadeIn) g *= smooth(i / fadeIn);
  if (i > total - fadeOut) g *= smooth((total - i) / fadeOut);
  const li = Math.max(-1, Math.min(1, samplesL[i] * g));
  const ri = Math.max(-1, Math.min(1, samplesR[i] * g));
  buf.writeInt16LE((li * 32767) | 0, off);
  buf.writeInt16LE((ri * 32767) | 0, off + 2);
  off += 4;
}

fs.writeFileSync(OUT, buf);
console.log(`wrote ${OUT}  ${DUR}s stereo  peak ${peak.toFixed(3)} -> normalized`);
