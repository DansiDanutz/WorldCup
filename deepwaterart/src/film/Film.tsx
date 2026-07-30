import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * "Deep Water" — a 26-second film, composed in Remotion and played in-page
 * through @remotion/player. Same type and palette as the site: the motion
 * cards are designed, not captioned.
 */

export const FPS = 30;
export const DURATION = 800; // ~26.7s
export const WIDTH = 1080;
export const HEIGHT = 1350;

const ART = "/artwork.webp";
const MUSIC = "/score.mp3";
const DEEP = "#0d2a3a";
const ABYSS = "#071820";
const EMBER = "#d08a5e";
const PAPER = "#e7eef0";
const DISPLAY = "'Bodoni Moda', Georgia, serif";
const UI = "'Archivo', system-ui, sans-serif";
const TEXT = "'Newsreader', Georgia, serif";

const ease = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/* Eyebrow with letterspacing, used as the film's connective tissue. */
function Eyebrow({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: UI, fontSize: 20, fontWeight: 600, letterSpacing: ".28em",
        textTransform: "uppercase", color: "rgba(231,238,240,.55)",
        opacity: ease(f, delay, delay + 18, 0, 1),
        transform: `translateY(${ease(f, delay, delay + 24, 8, 0)}px)`,
      }}
    >
      {children}
    </div>
  );
}

/* ── 1. Title ─────────────────────────────────────────────── */
function Title() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 8, fps, config: { damping: 200, mass: 1.1 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
      <Eyebrow delay={4}>One of one · 2026</Eyebrow>
      <div
        style={{
          fontFamily: DISPLAY, fontSize: 168, lineHeight: 0.9, color: PAPER,
          textAlign: "center", letterSpacing: "-.02em",
          transform: `scale(${interpolate(s, [0, 1], [0.86, 1])})`,
          opacity: ease(f, 6, 40, 0, 1),
        }}
      >
        Deep
        <br />
        <span style={{ fontStyle: "italic" }}>Water</span>
      </div>
      <div
        style={{
          fontFamily: TEXT, fontSize: 30, color: "rgba(231,238,240,.75)",
          opacity: ease(f, 44, 70, 0, 1),
        }}
      >
        Acrylic on canvas · 100 × 80 cm
      </div>
    </AbsoluteFill>
  );
}

/* ── 2. The painting arrives ──────────────────────────────── */
function Reveal() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: 620,
          opacity: ease(f, 0, 45, 0, 1),
          transform: `scale(${ease(f, 0, 170, 1.06, 1.0)}) translateY(${ease(f, 0, 170, 18, 0)}px)`,
          boxShadow: "0 40px 90px -30px rgba(0,0,0,.9)",
          filter: `brightness(${ease(f, 0, 60, 0.55, 1)})`,
        }}
      >
        <Img src={ART} style={{ width: "100%", display: "block" }} />
      </div>
    </AbsoluteFill>
  );
}

/* ── 3. Detail push-ins ───────────────────────────────────── */
function Detail({ x, y, label, note }: { x: number; y: number; label: string; note: string }) {
  const f = useCurrentFrame();
  const scale = ease(f, 0, 110, 2.5, 2.85);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: ABYSS }}>
      <AbsoluteFill style={{ opacity: ease(f, 0, 20, 0, 1) }}>
        <Img
          src={ART}
          style={{
            position: "absolute",
            width: `${scale * 100}%`,
            left: `${50 - x * scale}%`,
            top: `${50 - y * scale}%`,
            maxWidth: "none",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(7,24,32,0) 45%, rgba(7,24,32,.92) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 84, right: 84, bottom: 96 }}>
        <div
          style={{
            fontFamily: UI, fontSize: 18, fontWeight: 600, letterSpacing: ".26em",
            textTransform: "uppercase", color: EMBER,
            opacity: ease(f, 14, 34, 0, 1),
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: TEXT, fontSize: 34, lineHeight: 1.38, color: PAPER, marginTop: 14,
            opacity: ease(f, 22, 46, 0, 1),
            transform: `translateY(${ease(f, 22, 50, 12, 0)}px)`,
          }}
        >
          {note}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── 4. The line ──────────────────────────────────────────── */
function Line() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 110 }}>
      <div
        style={{
          fontFamily: DISPLAY, fontStyle: "italic", fontSize: 76, lineHeight: 1.16,
          color: PAPER, textAlign: "center",
          opacity: ease(f, 0, 30, 0, 1),
          transform: `translateY(${ease(f, 0, 60, 16, 0)}px)`,
        }}
      >
        She has her back to you,
        <br />
        <span style={{ opacity: ease(f, 34, 64, 0, 1) }}>
          and that is the whole painting.
        </span>
      </div>
    </AbsoluteFill>
  );
}

/* ── 5. End card ──────────────────────────────────────────── */
function EndCard() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 6, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
      <Eyebrow delay={2}>Available · one of one</Eyebrow>
      <div
        style={{
          fontFamily: DISPLAY, fontSize: 150, color: EMBER, lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`,
          opacity: ease(f, 4, 30, 0, 1),
        }}
      >
        $1,100
      </div>
      <div
        style={{
          fontFamily: TEXT, fontSize: 30, color: "rgba(231,238,240,.78)", textAlign: "center",
          opacity: ease(f, 26, 52, 0, 1),
        }}
      >
        Crate and insured shipping included
      </div>
      <div
        style={{
          marginTop: 26, background: EMBER, color: "#08222d", padding: "22px 44px",
          fontFamily: UI, fontSize: 34, fontWeight: 600, letterSpacing: ".04em",
          fontVariantNumeric: "tabular-nums",
          opacity: ease(f, 40, 66, 0, 1),
          transform: `translateY(${ease(f, 40, 70, 14, 0)}px)`,
        }}
      >
        +40 749 180 355
      </div>
      <div
        style={{
          fontFamily: UI, fontSize: 19, letterSpacing: ".22em", textTransform: "uppercase",
          color: "rgba(231,238,240,.45)", marginTop: 8,
          opacity: ease(f, 54, 78, 0, 1),
        }}
      >
        WhatsApp · replies same day
      </div>
    </AbsoluteFill>
  );
}

/* ── Composition ──────────────────────────────────────────── */
export function DeepWaterFilm() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: DEEP }}>
      {/* Original score - synthesised, not sampled. Ducks under the end card
          so the price and the number land in near-silence. */}
      <Audio
        src={MUSIC}
        volume={(fr) =>
          interpolate(
            fr,
            [0, 45, 690, 726, DURATION - 24, DURATION],
            [0, 0.85, 0.85, 0.42, 0.42, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />
      {/* A slow tide of colour under everything. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${170 + Math.sin(f / 90) * 8}deg, #1c5670 0%, #0d2a3a 55%, #071820 100%)`,
        }}
      />
      <Sequence durationInFrames={130}><Title /></Sequence>
      <Sequence from={130} durationInFrames={175}><Reveal /></Sequence>
      <Sequence from={305} durationInFrames={115}>
        <Detail x={50} y={16} label="01 · The horizon" note="A pale band, laid in thin and left alone. The only exit in the picture — and she is not looking at it." />
      </Sequence>
      <Sequence from={420} durationInFrames={115}>
        <Detail x={63} y={46} label="02 · The shoulder blade" note="One lit edge, dragged in a single pass. The hardest passage here." />
      </Sequence>
      <Sequence from={535} durationInFrames={115}>
        <Detail x={41} y={84} label="03 · The hip" note="Everything cold in the picture exists to make this one passage glow." />
      </Sequence>
      <Sequence from={650} durationInFrames={70}><Line /></Sequence>
      <Sequence from={720} durationInFrames={80}><EndCard /></Sequence>
      {/* Fade at both ends. */}
      <AbsoluteFill
        style={{
          background: ABYSS,
          opacity: Math.max(
            interpolate(f, [0, 22], [1, 0], { extrapolateRight: "clamp" }),
            interpolate(f, [DURATION - 26, DURATION], [0, 1], { extrapolateLeft: "clamp" })
          ),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
}
