// match-scenes.jsx — "WorldCup26 Bonus — Erling Haaland: The Viking Returns" (300s).
// CLIP-BASED: Higgsfield animations via VideoSprite. NO SUBTITLES / NO sentence
// captions (CLAUDE.md #10) — Brian's VO carries the saga. Only furniture: title
// card, chapter pills, short ≤4-word tags, score bug, OUR PREDICTION watermark,
// and the worldcup26.world CTA. SOCCER ONLY. 30 UNIQUE clips (no repeats; realistic character beats + stylized legend/environment shots), each
// window sized to its measured VO line (see narration.json) and each clip given a
// rate = sourceSeconds/window so it never loops. Story: 1066 Stamford Bridge →
// born in Leeds → father's unfinished dream → Bryne → the prophecy → the rise →
// Norway qualify → the red armada (Ro! Ro! Ro!) → father's prayer → Kane's
// fortress → the battle → Haaland 2-1 (OUR STORY / OUR PREDICTION) → close.

function Tag({ start, dur, text, sub }) {
  const t = useTime();
  const lt = t - start;
  if (lt < 0 || lt > dur) return null;
  const p = Easing.easeOutCubic(clamp(lt / 0.7, 0, 1)) * clamp((dur - lt) / 0.6, 0, 1);
  return (
    <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 26, opacity: clamp(p, 0, 1), transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ background: 'rgba(8,10,18,0.78)', border: '1px solid rgba(215,55,55,0.5)', borderRadius: 14, padding: '16px 30px', backdropFilter: 'blur(4px)' }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: '#ff5a4e', letterSpacing: '0.04em' }}>{text}</div>
        {sub && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: '#dbe7ff', letterSpacing: '0.14em', marginTop: 6 }}>{sub}</div>}
      </div>
    </div>
  );
}

// Chapter pill (open loop / retention) — label only, ≤4 words.
const HV_CHAPTERS = [
  { at: 0,     label: 'The Prophecy' },
  { at: 38.5,  label: 'Born In England' },
  { at: 98.5,  label: 'The Rise' },
  { at: 123,   label: 'The Voyage' },
  { at: 168.3, label: 'The Battle' },
  { at: 257.5, label: 'The Conquest' },
];
function ChapterPill() {
  const t = useTime();
  if (t < 2 || t > 284) return null;
  let ch = HV_CHAPTERS[0];
  for (const c of HV_CHAPTERS) if (t >= c.at) ch = c;
  const idx = HV_CHAPTERS.indexOf(ch);
  const p = clamp((t - 2) / 0.8, 0, 1);
  return (
    <div style={{ position: 'absolute', top: 92, right: 110, zIndex: 26, opacity: p * 0.92 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(6,8,14,0.72)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, padding: '10px 22px' }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 20, color: '#ff5a4e', letterSpacing: '0.1em' }}>{idx + 1}/6</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 20, color: '#eef2ff', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{ch.label}</span>
      </div>
    </div>
  );
}

// Minimal score bug (allowed furniture): NOR n–n ENG, no sentences.
function SagaScoreBug() {
  const t = useTime();
  if (t < 196 || t > 262) return null;
  const nor = t >= 249 ? 2 : (t >= 243.5 ? 1 : 0);
  const eng = t >= 207 ? 1 : 0;
  const p = clamp((t - 196) / 0.8, 0, 1);
  return (
    <div style={{ position: 'absolute', top: 92, left: 110, zIndex: 26, opacity: p, display: 'flex', alignItems: 'center', gap: 0, fontFamily: '"Inter",sans-serif' }}>
      <div style={{ background: '#b3202c', color: '#fff', fontWeight: 900, fontSize: 26, padding: '10px 18px', borderRadius: '12px 0 0 12px', letterSpacing: '0.08em' }}>NOR</div>
      <div style={{ background: 'rgba(6,8,14,0.85)', color: '#fff', fontWeight: 900, fontSize: 26, padding: '10px 20px' }}>{nor} – {eng}</div>
      <div style={{ background: '#f2f4f8', color: '#1a1f2e', fontWeight: 900, fontSize: 26, padding: '10px 18px', borderRadius: '0 12px 12px 0', letterSpacing: '0.08em' }}>ENG</div>
    </div>
  );
}

// OUR PREDICTION watermark — mandatory real-results-only labeling (rule #7).
function PredictionMark() {
  const t = useTime();
  if (t < 193 || t > 284) return null;
  return (
    <div style={{ position: 'absolute', bottom: 118, right: 116, zIndex: 26, opacity: 0.8 }}>
      <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, color: '#ffd24a', letterSpacing: '0.28em', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>OUR PREDICTION</div>
    </div>
  );
}

// Light film grain for the battle act.
function FilmGrain({ start, dur, opacity = 0.1 }) {
  const t = useTime();
  if (t < start || t > start + dur) return null;
  const jx = ((t * 13.7) % 1) * 140 - 70;
  const jy = ((t * 9.3) % 1) * 140 - 70;
  return (
    <div style={{ position: 'absolute', inset: -80, zIndex: 23, pointerEvents: 'none', opacity,
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 0.6px, transparent 0.7px)',
      backgroundSize: '5px 5px', transform: `translate(${jx}px, ${jy}px)`, mixBlendMode: 'overlay' }} />
  );
}

function FilmHaaland() {
  const t = useTime();
  const titleP = Easing.easeOutCubic(clamp((t - 2.5) / 1.2, 0, 1)) * clamp((12.5 - t) / 1.2, 0, 1);
  const nameP = Easing.easeOutCubic(clamp((t - 14.0) / 1.0, 0, 1)) * clamp((195.5 - t) / 1.5, 0, 1);
  const ctaP = Easing.easeOutCubic(clamp((t - 285.0) / 1.0, 0, 1));
  const dip = clamp((t - 215) / 1.2, 0, 1) * clamp((229 - t) / 0.6, 0, 1); // dread dip
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#04060c' }}>
      {/* ── ACT I · THE PROPHECY (0–38.5) — realistic seer, stylized legend ── */}
      <VideoSprite src="assets/n01-seer.webm"          start={0}     dur={13}   rate={0.61} fit="cover" dim={0.12} />
      <VideoSprite src="assets/v02-fleet.webm"         start={13}    dur={10}   rate={0.8}  fit="cover" dim={0.1} />
      <VideoSprite src="assets/v03-shore-1066.webm"    start={23}    dur={8.5}  rate={0.94} fit="cover" dim={0.12} />
      <VideoSprite src="assets/v04-ships-return.webm"  start={31.5}  dur={7}    rate={1}    fit="cover" dim={0.14} />
      {/* ── ACT II · BORN IN ENGLAND (38.5–98.5) — stylized past ── */}
      <VideoSprite src="assets/v05-leeds-birth.webm"   start={38.5}  dur={10.5} rate={0.76} fit="cover" dim={0.08} />
      <VideoSprite src="assets/v06-father-player.webm" start={49}    dur={9.5}  rate={0.84} fit="cover" dim={0.08} />
      <VideoSprite src="assets/v07-boot-dusk.webm"     start={58.5}  dur={12.5} rate={0.64} fit="cover" dim={0.12} />
      <VideoSprite src="assets/v08-bryne.webm"         start={71}    dur={9}    rate={0.88} fit="cover" dim={0.07} />
      <VideoSprite src="assets/v09-snow-training.webm" start={80}    dur={12.5} rate={0.64} fit="cover" dim={0.07} />
      <VideoSprite src="assets/v10-vision.webm"        start={92.5}  dur={6}    rate={1}    fit="cover" dim={0.1} />
      {/* ── ACT III · THE RISE (98.5–123) — realistic Haaland ── */}
      <VideoSprite src="assets/n02-goals.webm"         start={98.5}  dur={13}   rate={0.61} fit="cover" dim={0.08} />
      <VideoSprite src="assets/n03-qualify.webm"       start={111.5} dur={11.5} rate={0.69} fit="cover" dim={0.07} />
      {/* ── ACT IV · THE VOYAGE (123–168.3) ── */}
      <VideoSprite src="assets/v11-harbor.webm"        start={123}   dur={8.5}  rate={0.94} fit="cover" dim={0.08} />
      <VideoSprite src="assets/n04-crew.webm"          start={131.5} dur={10.5} rate={0.76} fit="cover" dim={0.07} />
      <VideoSprite src="assets/n05-rowing.webm"        start={142}   dur={15}   rate={0.53} fit="cover" dim={0.06} />
      <VideoSprite src="assets/n06-prayer.webm"        start={157}   dur={11.3} rate={0.7}  fit="cover" dim={0.08} />
      {/* ── ACT V · THE BATTLE (168.3–257.5) — realistic ── */}
      <VideoSprite src="assets/v14-fortress.webm"      start={168.3} dur={5.2}  rate={1}    fit="cover" dim={0.1} />
      <VideoSprite src="assets/n07-kane-king.webm"     start={173.5} dur={8.8}  rate={0.9}  fit="cover" dim={0.08} />
      <VideoSprite src="assets/n08-wall.webm"          start={182.3} dur={10.5} rate={0.76} fit="cover" dim={0.08} />
      <VideoSprite src="assets/v15-kickoff.webm"       start={192.8} dur={10.7} rate={0.74} fit="cover" dim={0.08} />
      <VideoSprite src="assets/n09-kane-strike.webm"   start={203.5} dur={11}   rate={0.72} fit="cover" dim={0.1} />
      <VideoSprite src="assets/n10-dread.webm"         start={214.5} dur={14}   rate={0.57} fit="cover" dim={0.16} />
      <VideoSprite src="assets/n11-redwall.webm"       start={228.5} dur={9.5}  rate={0.84} fit="cover" dim={0.06} />
      <VideoSprite src="assets/n12-pass.webm"          start={238}   dur={4.5}  rate={1}    fit="cover" dim={0.08} />
      <VideoSprite src="assets/v18-net-explosion.webm" start={242.5} dur={4}    rate={1}    fit="cover" dim={0.06} />
      <VideoSprite src="assets/n13-roar.webm"          start={246.5} dur={11}   rate={0.72} fit="cover" dim={0.06} />
      {/* ── ACT VI · THE CONQUEST (257.5–300) ── */}
      <VideoSprite src="assets/n14-tears.webm"         start={257.5} dur={9}    rate={0.88} fit="cover" dim={0.08} />
      <VideoSprite src="assets/v22-kids-rowing.webm"   start={266.5} dur={8}    rate={0.98} fit="cover" dim={0.06} />
      <VideoSprite src="assets/n15-flag.webm"          start={274.5} dur={8.5}  rate={0.94} fit="cover" dim={0.07} />
      <VideoSprite src="assets/v23-outro-aurora.webm"  start={283}   dur={17}   rate={0.47} fit="cover" dim={0.14} />

      {/* dread dip-to-dark during the 214.5–228.5 slow-mo beat */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: '#020308', opacity: dip * 0.28 }} />
      <FilmGrain start={193} dur={64} opacity={0.1} />
      <Vignette strength={0.6} />

      {titleP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: clamp(titleP, 0, 1), zIndex: 25 }}>
          <Kicker size={30} color="#ff5a4e">WorldCup26 Bonus</Kicker>
          <BigTitle size={118} color="#fff" glow="#b3202c">ERLING HAALAND</BigTitle>
          <Kicker size={32} color="#dbe7ff">The Viking Returns</Kicker>
        </div>
      )}

      {nameP > 0.01 && (
        <div style={{ position: 'absolute', top: 96, left: 110, zIndex: 25, opacity: clamp(nameP, 0, 1) }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: '#eef2ff', letterSpacing: '0.18em' }}>ERLING HAALAND</span>
        </div>
      )}

      <ChapterPill />
      <SagaScoreBug />
      <PredictionMark />

      {/* short factual LABELS (≤4 words, no sentences) synced to beats */}
      <Tag start={23.5}  dur={12}  text="1066" sub="STAMFORD BRIDGE" />
      <Tag start={39.5}  dur={9}   text="LEEDS · 2000" sub="BORN IN ENGLAND" />
      <Tag start={72}    dur={7}   text="BRYNE" sub="NORWAY" />
      <Tag start={116}   dur={6.5} text="2026" sub="FIRST SINCE 1998" />
      <Tag start={143}   dur={12}  text="RO! RO! RO!" sub="THE RED ARMADA" />
      <Tag start={169}   dur={12}  text="WEMBLEY" sub="THE FORTRESS" />
      <Tag start={275.5} dur={7}   text="OUR STORY" sub="OUR PREDICTION" />

      {t >= 246.5 && t < 257.5 && <Confetti start={246.5} dur={11} count={80} colors={['#b3202c', '#ff5a4e', '#ffffff', '#27336e']} />}
      {t >= 274.5 && t < 283 && <Confetti start={274.5} dur={8.5} count={70} colors={['#b3202c', '#ffffff', '#27336e']} />}

      {ctaP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: clamp(ctaP, 0, 1), zIndex: 27, background: 'rgba(2,3,6,0.45)' }}>
          <Kicker size={26} color="#ff5a4e">WorldCup26 Bonus</Kicker>
          <BigTitle size={92} color="#fff" glow="#b3202c">worldcup26.world</BigTitle>
          <Kicker size={24} color="#dbe7ff">FREE TO PLAY · NO PRIZES</Kicker>
        </div>
      )}

      <Letterbox />
    </div>
  );
}
