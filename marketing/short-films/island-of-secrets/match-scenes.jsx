// match-scenes.jsx — "The Island of Secrets" (165s vertical 1080x1920 mystery romance).
// CLIP-BASED: real Higgsfield/Kling video animations via VideoSprite. NO SUBTITLES /
// NO sentence captions (CLAUDE.md #10) — Brian's VO carries the story. Only furniture:
// opening title card + closing title (≤4-word labels). Identity: the woman is anchored
// to the owner's reference photo; the prince to a fixed portrait. NO-REPEAT: every src
// appears exactly once. Story beat: she REFUSES the kiss mid-film (the secret); the
// prince finally kisses her at the climax. Clip windows are GLOBAL seconds.

function FilmGrain({ opacity = 0.05 }) {
  const t = useTime();
  const x = (Math.sin(t * 12.9) * 0.5 + 0.5) * 100;
  const y = (Math.cos(t * 7.3) * 0.5 + 0.5) * 100;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', opacity,
      backgroundImage: `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.5) 0.5px, transparent 1px), radial-gradient(circle at ${100 - x}% ${y}%, rgba(0,0,0,0.5) 0.5px, transparent 1px)`,
      backgroundSize: '3px 3px, 4px 4px', mixBlendMode: 'overlay',
    }} />
  );
}

// Soft top/bottom cinematic gradient (no hard letterbox — better for 9:16 mobile).
function EdgeGrade() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 19, pointerEvents: 'none',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 18%, transparent 80%, rgba(0,0,0,0.65) 100%)' }} />
  );
}

function FilmIsland() {
  const t = useTime();
  const titleP = Easing.easeOutCubic(clamp((t - 1.6) / 1.4, 0, 1)) * clamp((7.0 - t) / 1.2, 0, 1);
  const endP   = Easing.easeOutCubic(clamp((t - 169.5) / 1.6, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#04060c' }}>
      {/* ── clip timeline (sequential, full-bleed, NO repeats) ─────────────────
          5s source clips slowed via per-clip rate so none loops across its window. */}
      <VideoSprite src="assets/c01_island-aerial.webm"   start={0}     dur={7.5} rate={0.64} fit="cover" dim={0.10} />
      <VideoSprite src="assets/c02_house-ext.webm"       start={7.5}   dur={7.0} rate={0.69} fit="cover" dim={0.10} />
      <VideoSprite src="assets/c03_her-window.webm"      start={14.5}  dur={7.5} rate={0.64} fit="cover" dim={0.08} />
      <VideoSprite src="assets/c04_hair.webm"            start={22.0}  dur={7.0} rate={0.69} fit="cover" dim={0.08} />
      <VideoSprite src="assets/c05_eyes.webm"            start={29.0}  dur={7.0} rate={0.69} fit="cover" dim={0.06} />
      <VideoSprite src="assets/c06_dock.webm"            start={36.0}  dur={7.5} rate={0.64} fit="cover" dim={0.08} />
      <VideoSprite src="assets/c07_storm-boat.webm"      start={43.5}  dur={7.0} rate={0.69} fit="cover" dim={0.10} />
      <VideoSprite src="assets/c08_prince-portrait.webm" start={50.5}  dur={6.0} rate={0.80} fit="cover" dim={0.08} />
      <VideoSprite src="assets/c09_prince-shore.webm"    start={56.5}  dur={6.5} rate={0.74} fit="cover" dim={0.10} />
      <VideoSprite src="assets/c10_fireside.webm"        start={63.0}  dur={6.5} rate={0.74} fit="cover" dim={0.06} />
      <VideoSprite src="assets/c11_house-int.webm"       start={69.5}  dur={5.5} rate={0.87} fit="cover" dim={0.07} />
      <VideoSprite src="assets/c12_smile.webm"           start={75.0}  dur={6.0} rate={0.80} fit="cover" dim={0.06} />
      <VideoSprite src="assets/c24_refuse.webm"          start={81.0}  dur={7.0} rate={0.69} fit="cover" dim={0.07} />
      <VideoSprite src="assets/c14_shore-walk.webm"      start={88.0}  dur={7.0} rate={0.69} fit="cover" dim={0.08} />
      <VideoSprite src="assets/c15_hands-ring.webm"      start={95.0}  dur={6.5} rate={0.74} fit="cover" dim={0.06} />
      <VideoSprite src="assets/c16_prince-ring.webm"     start={101.5} dur={6.5} rate={0.74} fit="cover" dim={0.08} />
      <VideoSprite src="assets/c17_castle-queen.webm"    start={108.0} dur={6.5} rate={0.74} fit="cover" dim={0.10} />
      <VideoSprite src="assets/c18_longing.webm"         start={114.5} dur={7.0} rate={0.69} fit="cover" dim={0.08} />
      <VideoSprite src="assets/c19_white-sail.webm"      start={121.5} dur={6.5} rate={0.74} fit="cover" dim={0.08} />
      <VideoSprite src="assets/c21_reunion.webm"         start={128.0} dur={6.5} rate={0.74} fit="cover" dim={0.07} />
      <VideoSprite src="assets/c20_embrace.webm"         start={134.5} dur={6.5} rate={0.74} fit="cover" dim={0.07} />
      <VideoSprite src="assets/c13_kiss.webm"            start={141.0} dur={7.0} rate={0.69} fit="cover" dim={0.05} />
      <VideoSprite src="assets/c25_box-hide.webm"        start={148.0} dur={6.5} rate={0.74} fit="cover" dim={0.07} />
      <VideoSprite src="assets/c22_final-eyes.webm"      start={154.5} dur={6.5} rate={0.74} fit="cover" dim={0.06} />
      <VideoSprite src="assets/c26_box-hidden.webm"      start={161.0} dur={6.5} rate={0.74} fit="cover" dim={0.08} />
      <VideoSprite src="assets/c23_pullaway.webm"        start={167.5} dur={9.5} rate={0.51} fit="cover" dim={0.14} />

      <Vignette strength={0.62} />
      <EdgeGrade />
      <AmbientParticles start={0} dur={177} count={30} color="255,235,200" maxR={3} zIndex={21} />
      <FilmGrain opacity={0.05} />

      {/* OPENING TITLE CARD (≤4-word labels only — no sentences) */}
      {titleP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: clamp(titleP, 0, 1), zIndex: 26, padding: '0 60px' }}>
          <Kicker size={28} color="#e7c98a">A Mystery</Kicker>
          <BigTitle size={104} color="#fff" glow="#e7c98a" style={{ lineHeight: 1.05 }}>THE ISLAND<br/>OF SECRETS</BigTitle>
        </div>
      )}

      {/* CLOSING TITLE */}
      {endP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: clamp(endP, 0, 1), zIndex: 27, background: 'rgba(2,3,6,0.35)', padding: '0 60px' }}>
          <BigTitle size={92} color="#fff" glow="#e7c98a">THE ISLAND<br/>OF SECRETS</BigTitle>
          <Kicker size={24} color="#cfd8e6">To be continued</Kicker>
        </div>
      )}
    </div>
  );
}
