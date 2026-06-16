// match-scenes.jsx — "Lukaku — The Promise" (300s player drama film).
// CLIP-BASED: fal video animations via VideoSprite. NO SUBTITLES / NO sentence
// captions (CLAUDE.md #10) — Brian's VO carries the story. Only minimal furniture:
// the title card, short factual labels (≤4 words), a name tag, and the CTA.
// SOCCER ONLY. Clip windows are GLOBAL seconds, synced to narration.json.

// Small corner label (factual furniture, NOT a sentence)
function Tag({ start, dur, text, sub }) {
  const t = useTime();
  const lt = t - start;
  if (lt < 0 || lt > dur) return null;
  const p = Easing.easeOutCubic(clamp(lt / 0.7, 0, 1)) * clamp((dur - lt) / 0.6, 0, 1);
  return (
    <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 26, opacity: clamp(p, 0, 1), transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ background: 'rgba(8,10,18,0.78)', border: '1px solid rgba(255,210,74,0.4)', borderRadius: 14, padding: '16px 30px', backdropFilter: 'blur(4px)' }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#ffd24a', letterSpacing: '0.04em' }}>{text}</div>
        {sub && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: '#cfe9de', letterSpacing: '0.14em', marginTop: 6 }}>{sub}</div>}
      </div>
    </div>
  );
}

function FilmLukaku() {
  const t = useTime();
  // title card (over the opening goal), then a steady name tag
  const titleP = Easing.easeOutCubic(clamp((t - 2.0) / 1.2, 0, 1)) * clamp((15.5 - t) / 1.2, 0, 1);
  const nameP = Easing.easeOutCubic(clamp((t - 16.0) / 1.0, 0, 1)) * clamp((296 - t) / 1.5, 0, 1);
  const ctaP = Easing.easeOutCubic(clamp((t - 287.0) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#04060c' }}>
      {/* ── clip timeline (sequential, full-bleed) ───────────────────────────── */}
      <VideoSprite src="assets/goal-roar.mp4"       start={0}   dur={22}  fit="cover" dim={0.12} />
      <VideoSprite src="assets/boy-fridge.mp4"      start={22}  dur={28}  fit="cover" dim={0.05} />
      <VideoSprite src="assets/flat-dark.mp4"       start={50}  dur={22}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/grandfather.mp4"     start={72}  dur={17}  fit="cover" dim={0.06} />
      <VideoSprite src="assets/boy-train.mp4"       start={89}  dur={29}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/debut-16.mp4"        start={118} dur={18}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/epl-red.mp4"         start={136} dur={12}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/inter-title.mp4"     start={148} dur={11}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/belgium-record.mp4"  start={159} dur={37}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/idol-final.mp4"      start={196} dur={36}  fit="cover" dim={0.14} />
      <VideoSprite src="assets/mother-proud.mp4"    start={232} dur={29}  fit="cover" dim={0.06} />
      <VideoSprite src="assets/idol-final.mp4"      start={261} dur={39}  fit="cover" dim={0.16} />

      <Vignette strength={0.6} />

      {/* TITLE CARD (≤4 words) */}
      {titleP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: clamp(titleP, 0, 1), zIndex: 25 }}>
          <Kicker size={30} color="#ffd24a">WorldCup26 Bonus</Kicker>
          <BigTitle size={120} color="#fff" glow="#ffd24a">ROMELU LUKAKU</BigTitle>
          <Kicker size={32} color="#cfe9de">The Promise</Kicker>
        </div>
      )}

      {/* steady NAME tag (top-left, furniture) */}
      {nameP > 0.01 && (
        <div style={{ position: 'absolute', top: 96, left: 110, zIndex: 26, opacity: clamp(nameP, 0, 1) }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: '#e7f3ea', letterSpacing: '0.18em' }}>ROMELU LUKAKU</span>
        </div>
      )}

      {/* short factual LABELS (no sentences) synced to beats */}
      <Tag start={26}  dur={20} text="ANTWERP" sub="WHERE IT BEGAN" />
      <Tag start={120} dur={14} text="DEBUT AT 16" sub="THE PROMISE KEPT" />
      <Tag start={138} dur={18} text="ENGLAND" sub="UNITED · 42 GOALS" />
      <Tag start={159} dur={18} text="INTER · SERIE A" sub="64 GOALS" />
      <Tag start={178} dur={16} text="BELGIUM · 89" sub="ALL-TIME RECORD" />
      <Tag start={236} dur={20} text="FOR HER" sub="EVERY GOAL" />

      {/* CTA */}
      {ctaP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: clamp(ctaP, 0, 1), zIndex: 27, background: 'rgba(2,3,6,0.45)' }}>
          <Kicker size={26} color="#7fd6b5">WorldCup26 Legends</Kicker>
          <BigTitle size={92} color="#fff" glow="#16a34a">worldcup26.world</BigTitle>
        </div>
      )}

      <Letterbox />
    </div>
  );
}
