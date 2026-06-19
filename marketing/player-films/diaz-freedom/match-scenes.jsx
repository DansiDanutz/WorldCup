// match-scenes.jsx — "WorldCup26 Bonus — Luis Díaz" (300s player drama film).
// CLIP-BASED: fal video animations via VideoSprite. NO SUBTITLES / NO sentence
// captions (CLAUDE.md #10) — Brian's VO carries the story. Only furniture: the
// title card, a steady name tag, short factual labels (≤4 words), and the CTA.
// SOCCER ONLY. 31 UNIQUE clips (no repeats), each stretched across its beat via a
// per-clip rate (cinematic slow-mo) so none loops. Windows synced to narration.json.
// Story: La Guajira poverty → father's faith → discovery → idol → his father's
// kidnapping (framed respectfully, no violence) → "Libertad para papá" → reunion → idol.

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

function FilmDiaz() {
  const t = useTime();
  const titleP = Easing.easeOutCubic(clamp((t - 2.0) / 1.2, 0, 1)) * clamp((15.5 - t) / 1.2, 0, 1);
  const nameP = Easing.easeOutCubic(clamp((t - 16.0) / 1.0, 0, 1)) * clamp((289 - t) / 1.5, 0, 1);
  const ctaP = Easing.easeOutCubic(clamp((t - 288.0) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#04060c' }}>
      {/* 31 UNIQUE clips — one per narration beat, slow-mo rate so none loops */}
      <VideoSprite src="assets/d00-goal-shirt.mp4"    start={0}   dur={11}  rate={0.44} fit="cover" dim={0.12} />
      <VideoSprite src="assets/d01-plea-sky.mp4"      start={11}  dur={13}  rate={0.37} fit="cover" dim={0.14} />
      <VideoSprite src="assets/d02-desert.mp4"        start={24}  dur={9}   rate={0.53} fit="cover" dim={0.08} />
      <VideoSprite src="assets/d03-village.mp4"       start={33}  dur={9}   rate={0.53} fit="cover" dim={0.07} />
      <VideoSprite src="assets/d04-children.mp4"      start={42}  dur={9}   rate={0.53} fit="cover" dim={0.07} />
      <VideoSprite src="assets/d05-skinny-boy.mp4"    start={51}  dur={9}   rate={0.53} fit="cover" dim={0.06} />
      <VideoSprite src="assets/d06-overlooked.mp4"    start={60}  dur={10}  rate={0.48} fit="cover" dim={0.07} />
      <VideoSprite src="assets/d07-father-coach.mp4"  start={70}  dur={11}  rate={0.44} fit="cover" dim={0.07} />
      <VideoSprite src="assets/d08-friche-stall.mp4"  start={81}  dur={10}  rate={0.48} fit="cover" dim={0.07} />
      <VideoSprite src="assets/d09-father-son-road.mp4" start={91} dur={10} rate={0.48} fit="cover" dim={0.07} />
      <VideoSprite src="assets/d10-tournament.mp4"    start={101} dur={10}  rate={0.48} fit="cover" dim={0.07} />
      <VideoSprite src="assets/d11-legend-stands.mp4" start={111} dur={10}  rate={0.48} fit="cover" dim={0.08} />
      <VideoSprite src="assets/d12-young-dribble.mp4" start={121} dur={10}  rate={0.48} fit="cover" dim={0.08} />
      <VideoSprite src="assets/d13-anfield.mp4"       start={131} dur={11}  rate={0.44} fit="cover" dim={0.08} />
      <VideoSprite src="assets/d14-beat-defenders.mp4" start={142} dur={11} rate={0.44} fit="cover" dim={0.08} />
      <VideoSprite src="assets/d15-phone-dark.mp4"    start={153} dur={8}   rate={0.6}  fit="cover" dim={0.16} />
      <VideoSprite src="assets/d16-night-road.mp4"    start={161} dur={10}  rate={0.48} fit="cover" dim={0.18} />
      <VideoSprite src="assets/d17-mountain-road.mp4" start={171} dur={10}  rate={0.48} fit="cover" dim={0.16} />
      <VideoSprite src="assets/d18-anguish.mp4"       start={181} dur={12}  rate={0.4}  fit="cover" dim={0.14} />
      <VideoSprite src="assets/d19-haunted-pitch.mp4" start={193} dur={11}  rate={0.44} fit="cover" dim={0.1} />
      <VideoSprite src="assets/d20-bench-run.mp4"     start={204} dur={10}  rate={0.48} fit="cover" dim={0.1} />
      <VideoSprite src="assets/d21-score-erupt.mp4"   start={214} dur={9}   rate={0.53} fit="cover" dim={0.1} />
      <VideoSprite src="assets/d22-libertad.mp4"      start={223} dur={11}  rate={0.44} fit="cover" dim={0.12} />
      <VideoSprite src="assets/d23-fans-pray.mp4"     start={234} dur={10}  rate={0.48} fit="cover" dim={0.1} />
      <VideoSprite src="assets/d24-dawn-hope.mp4"     start={244} dur={9}   rate={0.53} fit="cover" dim={0.08} />
      <VideoSprite src="assets/d25-father-home.mp4"   start={253} dur={10}  rate={0.48} fit="cover" dim={0.07} />
      <VideoSprite src="assets/d26-idol-portrait.mp4" start={263} dur={9}   rate={0.53} fit="cover" dim={0.1} />
      <VideoSprite src="assets/d27-relief.mp4"        start={272} dur={9}   rate={0.53} fit="cover" dim={0.08} />
      <VideoSprite src="assets/d28-arms-wide.mp4"     start={281} dur={8}   rate={0.6}  fit="cover" dim={0.1} />
      <VideoSprite src="assets/d29-cta.mp4"           start={289} dur={6}   rate={0.8}  fit="cover" dim={0.16} />
      <VideoSprite src="assets/d30-outro.mp4"         start={295} dur={5}   rate={1}    fit="cover" dim={0.16} />

      <Vignette strength={0.6} />

      {titleP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: clamp(titleP, 0, 1), zIndex: 25 }}>
          <Kicker size={30} color="#ffd24a">WorldCup26 Bonus</Kicker>
          <BigTitle size={120} color="#fff" glow="#ffd24a">LUIS DÍAZ</BigTitle>
          <Kicker size={32} color="#cfe9de">Freedom for my Father</Kicker>
        </div>
      )}

      {nameP > 0.01 && (
        <div style={{ position: 'absolute', top: 96, left: 110, zIndex: 26, opacity: clamp(nameP, 0, 1) }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: '#e7f3ea', letterSpacing: '0.18em' }}>LUIS DÍAZ</span>
        </div>
      )}

      {/* short factual LABELS (≤4 words, no sentences) synced to beats */}
      <Tag start={34}  dur={15} text="LA GUAJIRA" sub="BORN 1997 · WAYUU" />
      <Tag start={61}  dur={16} text="OVERLOOKED" sub="TOO SMALL, THEY SAID" />
      <Tag start={102} dur={16} text="DISCOVERED" sub="2015 · VALDERRAMA" />
      <Tag start={132} dur={18} text="ANFIELD" sub="THE BIGGEST STAGE" />
      <Tag start={162} dur={18} text="28 OCT 2023" sub="HIS FATHER TAKEN" />
      <Tag start={245} dur={16} text="FREE" sub="TWELVE DAYS LATER" />

      {ctaP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: clamp(ctaP, 0, 1), zIndex: 27, background: 'rgba(2,3,6,0.45)' }}>
          <Kicker size={26} color="#7fd6b5">WorldCup26 Bonus</Kicker>
          <BigTitle size={92} color="#fff" glow="#16a34a">worldcup26.world</BigTitle>
        </div>
      )}

      <Letterbox />
    </div>
  );
}
