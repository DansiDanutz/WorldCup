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
      {/* 33 UNIQUE clips, one per narration beat — NO repeats (was 11 clips looping). */}
      <VideoSprite src="assets/s00-header-goal.mp4"     start={0}     dur={7.2}  fit="cover" dim={0.12} />
      <VideoSprite src="assets/s01-idol-cameras.mp4"    start={7}     dur={9}    fit="cover" dim={0.12} />
      <VideoSprite src="assets/s02-portrait.mp4"        start={15.5}  dur={9}    fit="cover" dim={0.14} />
      <VideoSprite src="assets/s03-boy-fridge.mp4"      start={24}    dur={9}    fit="cover" dim={0.05} />
      <VideoSprite src="assets/s04-milk-water.mp4"      start={32.5}  dur={9.5}  fit="cover" dim={0.05} />
      <VideoSprite src="assets/s05-boy-realize.mp4"     start={41.5}  dur={9.5}  fit="cover" dim={0.06} />
      <VideoSprite src="assets/s06-father-faded.mp4"    start={50.5}  dur={10}   fit="cover" dim={0.07} />
      <VideoSprite src="assets/s07-social-housing.mp4"  start={60}    dur={12.5} fit="cover" dim={0.07} />
      <VideoSprite src="assets/s08-grandfather.mp4"     start={72}    dur={10}   fit="cover" dim={0.06} />
      <VideoSprite src="assets/s09-boy-promise.mp4"     start={81.5}  dur={8.5}  fit="cover" dim={0.07} />
      <VideoSprite src="assets/s10-boy-mother.mp4"      start={89.5}  dur={10}   fit="cover" dim={0.07} />
      <VideoSprite src="assets/s11-youth-train.mp4"     start={99}    dur={9.5}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/s12-academy.mp4"         start={108}   dur={10.5} fit="cover" dim={0.08} />
      <VideoSprite src="assets/s13-debut-16.mp4"        start={118}   dur={11}   fit="cover" dim={0.08} />
      <VideoSprite src="assets/s14-promise-kept.mp4"    start={128.5} dur={8.5}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/s15-epl.mp4"             start={136.5} dur={11.5} fit="cover" dim={0.08} />
      <VideoSprite src="assets/s16-inter-title.mp4"     start={147.5} dur={12.5} fit="cover" dim={0.08} />
      <VideoSprite src="assets/s17-belgium.mp4"         start={159.5} dur={9.5}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/s18-record.mp4"          start={168.5} dur={10}   fit="cover" dim={0.08} />
      <VideoSprite src="assets/s19-montage.mp4"         start={178}   dur={10.5} fit="cover" dim={0.08} />
      <VideoSprite src="assets/s20-idol-crowd.mp4"      start={188}   dur={9}    fit="cover" dim={0.12} />
      <VideoSprite src="assets/s21-tested.mp4"          start={196.5} dur={9}    fit="cover" dim={0.12} />
      <VideoSprite src="assets/s22-headline-praise.mp4" start={205}   dur={9.5}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/s23-headline-racism.mp4" start={214}   dur={9.5}  fit="cover" dim={0.1} />
      <VideoSprite src="assets/s24-answer-goals.mp4"    start={223}   dur={10}   fit="cover" dim={0.1} />
      <VideoSprite src="assets/s25-point-sky.mp4"       start={232.5} dur={8.5}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/s26-mother-callback.mp4" start={240.5} dur={11}   fit="cover" dim={0.06} />
      <VideoSprite src="assets/s27-keep-word.mp4"       start={251}   dur={10}   fit="cover" dim={0.07} />
      <VideoSprite src="assets/s28-debt.mp4"            start={260.5} dur={10.5} fit="cover" dim={0.1} />
      <VideoSprite src="assets/s29-roar.mp4"            start={270.5} dur={9}    fit="cover" dim={0.12} />
      <VideoSprite src="assets/s30-boy-and-man.mp4"     start={279}   dur={9.5}  fit="cover" dim={0.1} />
      <VideoSprite src="assets/s31-cta.mp4"             start={288}   dur={8.5}  fit="cover" dim={0.16} />
      <VideoSprite src="assets/s32-outro.mp4"           start={296}   dur={4.2}  fit="cover" dim={0.16} />

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
