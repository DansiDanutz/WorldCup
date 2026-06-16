// match-scenes.jsx — Episode 21: France vs Senegal (300s). The Empire and the Lion.
// CLIP-BASED + TEXTLESS rebuild. Brian's VO carries the story; the paid Higgsfield
// animation clips carry the visuals. NO subtitles / NO caption sentences.
// Allowed on-screen text ONLY: title card, surname NAME labels, FRA—SEN score bug,
// "OUR PREDICTION" watermark, worldcup26.world. SOCCER ONLY.
// Scene windows must match the SCENES table in match.html and narration.json.
const FRA = MV.fra;          // navy
const FRA_RED = MV.fraRed;
const SEN = MV.sen;          // green
const SEN_Y = MV.senYellow;

// ── 0–16  COLD OPEN — the griot mystery + 2002 shock, opening on SoFi ─────────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.0)), 8);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <ClipSprite id="mystery-griot" dim={0.22} style={{ filter: 'brightness(0.66) saturate(1.05) contrast(1.12)' }} />
      <ClipSprite id="cold-stadium" dim={0.12} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.55,
        background: `radial-gradient(ellipse at ${26 + Math.sin(lt * 0.25) * 14}% 70%, rgba(0,133,63,0.22) 0%, transparent 48%), radial-gradient(ellipse at ${74 - Math.sin(lt * 0.2) * 12}% 35%, rgba(26,47,107,0.18) 0%, transparent 52%)` }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, background: `radial-gradient(ellipse at center, rgba(253,239,66,${(0.16 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <Vignette strength={0.72} /><Letterbox />
    </div>
  );
}

// ── 16–28  TITLE CARD (recap is spoken, not written) ─────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp((lt - 0.6) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 1.5) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 2.6) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182c 55%, #0a0f1c 100%)` }}>
      <ClipSprite id="title-stadium" dim={0.55} style={{ filter: 'saturate(0.85)' }} />
      <AmbientParticles start={16} dur={12} count={30} color="0,133,63" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 42, zIndex: 25 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 21</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}><Waving><FlagFRA w={250} /></Waving><BigTitle size={58} glow={'#6f8bd6'}>FRANCE</BigTitle></div>
          <BigTitle size={120} color={MV.gold}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}><Waving speed={1.9}><FlagSEN w={250} /></Waving><BigTitle size={62} glow={SEN}>SENEGAL</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 30, color: MV.muted, letterSpacing: '0.16em' }}>GROUP I · JUNE 16, 2026</div>
      </div>
      <Vignette strength={0.4} /><Letterbox />
    </div>
  );
}

// ── 28–47  TEASE — the greatest shock (fan crowds, no captions) ──────────────
function SceneTease() {
  const { localTime: lt } = useSprite();
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <ClipSprite id="tease-sen" dim={0.1} style={{ filter: 'saturate(1.12) contrast(1.06)' }} />
      <ClipSprite id="tease-fra" dim={0.12} style={{ filter: 'saturate(1.08)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none',
        background: `linear-gradient(90deg, rgba(0,133,63,0.20) 0%, transparent 40%, transparent 62%, rgba(26,47,107,0.20) 100%)` }} />
      <Vignette strength={0.5} /><Letterbox />
    </div>
  );
}

// ── 47–113  HISTORY — the true 2002 story + Bouba Diop tribute (no captions) ──
function SceneHistory() {
  const { localTime: lt } = useSprite();
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <ClipSprite id="history-stadium" style={{ filter: 'brightness(0.34) saturate(0.5) sepia(0.32)' }} />
      <ClipSprite id="history-sen" dim={0.18} style={{ filter: 'saturate(1.1) contrast(1.05)' }} />
      <ClipSprite id="history-griot" dim={0.2} style={{ filter: 'brightness(0.7) saturate(1.05)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 32%, rgba(5,6,10,0.8) 100%)' }} />
      <AmbientParticles start={47} dur={66} count={26} maxR={4} color="253,239,66" />
      <FilmGrain start={47} dur={66} opacity={0.06} />
      <Vignette strength={0.52} /><Letterbox />
    </div>
  );
}

// Full-bleed player still with a slow zoom + surname-only NAME label.
function PlayerStill({ src, start, dur, name, accent, from = 1.04, to = 1.16, panX = 0 }) {
  const t = useTime();
  if (t < start || t > start + dur) return null;
  const fade = t > start + dur - 0.4 ? (start + dur - t) / 0.4 : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: clamp(fade, 0, 1) }}>
      <KenBurns src={src} start={start} dur={dur} from={from} to={to} panX={panX} dim={0.06} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none',
        background: `linear-gradient(0deg, rgba(3,4,8,0.72) 0%, transparent 42%), linear-gradient(90deg, ${accent}22 0%, transparent 30%)` }} />
      <NameLabel start={start + 0.15} name={name} accent={accent} />
    </div>
  );
}

// ── 113–156  FRANCE line-up (player stills + surname labels; fra crowd clips) ─
function SceneFrance() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <ClipSprite id="fra-crowd" dim={0.34} style={{ filter: 'saturate(0.9)' }} />
      <ClipSprite id="fra-jub" dim={0.28} style={{ filter: 'saturate(1.1)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none',
        background: `linear-gradient(90deg, rgba(26,47,107,0.30) 0%, transparent 38%, transparent 72%, rgba(227,27,35,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '14px 40px' }}>
          <FlagFRA w={72} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.14em' }}>LES BLEUS</span>
        </div>
      </div>
      <PlayerStill src="assets/player-mbappe.png"     start={113.0} dur={10.0} name="MBAPPÉ"     accent={FRA} panX={-40} />
      <PlayerStill src="assets/player-dembele.png"    start={123.0} dur={10.0} name="DEMBÉLÉ"    accent={FRA} panX={36} />
      <PlayerStill src="assets/player-olise.png"      start={133.0} dur={10.0} name="OLISE"      accent={FRA} panX={-30} />
      <PlayerStill src="assets/player-tchouameni.png" start={143.0} dur={6.0}  name="TCHOUAMÉNI" accent={FRA} panX={28} />
      <PlayerStill src="assets/player-saliba.png"     start={149.0} dur={7.0}  name="SALIBA"     accent={FRA} panX={-24} />
      <Vignette strength={0.42} /><Letterbox />
    </div>
  );
}

// ── 156–200  SENEGAL line-up (player stills + surname labels; sen crowd clips) ─
function SceneSenegal() {
  const { localTime: lt } = useSprite();
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a120c' }}>
      <ClipSprite id="sen-crowd" dim={0.34} style={{ filter: 'saturate(1.0)' }} />
      <ClipSprite id="sen-believe" dim={0.26} style={{ filter: 'saturate(1.12)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none',
        background: `linear-gradient(90deg, rgba(0,133,63,0.30) 0%, transparent 38%, transparent 72%, rgba(253,239,66,0.14) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '14px 40px' }}>
          <FlagSEN w={72} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.14em' }}>LIONS OF TERANGA</span>
        </div>
      </div>
      <PlayerStill src="assets/player-mane.png"      start={156.0} dur={11.0} name="MANÉ"      accent={SEN} panX={-40} />
      <PlayerStill src="assets/player-koulibaly.png" start={167.0} dur={8.0}  name="KOULIBALY" accent={SEN} panX={34} />
      <PlayerStill src="assets/player-camara.png"    start={175.0} dur={8.0}  name="CAMARA"    accent={SEN} panX={-28} />
      <PlayerStill src="assets/player-mendy.png"     start={183.0} dur={7.0}  name="MENDY"     accent={SEN} panX={26} />
      <PlayerStill src="assets/player-jackson.png"   start={190.0} dur={10.0} name="JACKSON"   accent={SEN} panX={-30} />
      <Vignette strength={0.42} /><Letterbox />
    </div>
  );
}

// ── 200–220  THE DUEL — empire vs lion (split crowds, no caption) ────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <ClipSprite id="duel-fra" style={{ filter: 'saturate(1.12) brightness(0.95)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(26,47,107,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', left: 80, bottom: 150, zIndex: 5 }}><FlagFRA w={150} /></div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <ClipSprite id="duel-sen" style={{ filter: 'saturate(1.14) brightness(0.94)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,133,63,0.46), transparent 65%)' }} />
        <div style={{ position: 'absolute', right: 80, bottom: 150, zIndex: 5 }}><FlagSEN w={150} /></div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 26, transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1), width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 90px ${MV.gold}66` }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 220–263  OUR PREDICTION — France 2–1 Senegal (Mbappé, Jackson, Mbappé) ───
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 220.0;
  const punch = (at, mag) => { const d = lt + S - at; return d > 0 && d < 0.4 ? 1 + mag * (1 - d / 0.4) : 1; };
  const zoom = punch(220.8, 0.05) * punch(231.2, 0.06) * punch(242.2, 0.07);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', transform: `scale(${zoom})` }}>
      <ClipSprite id="drama-fra-bg" dim={0.12} />
      <ClipSprite id="goal-fra-1" dim={0.04} style={{ filter: 'saturate(1.15) contrast(1.08)' }} />
      <ClipSprite id="goal-sen-eq" dim={0.02} style={{ filter: 'saturate(1.18) contrast(1.08)' }} />
      <ClipSprite id="goal-fra-2" dim={0.02} style={{ filter: 'saturate(1.18) contrast(1.1)' }} />
      <ClipSprite id="ft-fra" dim={0.1} />
      <FilmGrain start={220} dur={43} opacity={0.07} />
      <PredictionMark start={220.4} />

      {/* 1–0 Mbappé (22') */}
      <Sprite start={220.0} end={231.0}><ScoreBug start={S + 0.4} fra={1} sen={0} minute="22'" /></Sprite>
      <GoalFlash at={220.8} color={'#6f8bd6'} />
      <Confetti start={221.0} dur={4} colors={[MV.fra, '#fff', FRA_RED, MV.gold]} />

      {/* 1–1 Jackson (54') */}
      <Sprite start={231.0} end={242.0}><ScoreBug start={231.0} fra={1} sen={1} minute="54'" /></Sprite>
      <GoalFlash at={231.2} color={SEN} />
      <Confetti start={231.4} dur={4} colors={[SEN, SEN_Y, '#fff', MV.gold]} />

      {/* 2–1 Mbappé winner (88') */}
      <Sprite start={242.0} end={263.0}><ScoreBug start={242.0} fra={2} sen={1} minute="88'" /></Sprite>
      <GoalFlash at={242.2} color={'#6f8bd6'} />
      <Confetti start={242.4} dur={6} colors={[MV.fra, '#fff', FRA_RED, MV.gold]} />

      {/* Full-time card (253–263) — score + OUR PREDICTION only, no sentence */}
      <Sprite start={253.0} end={263.0}><FullTimeCard start={253.4} /></Sprite>
      <Vignette strength={0.42} /><Letterbox />
    </div>
  );
}

function FullTimeCard({ start }) {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - start) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.6)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '44px 96px', textAlign: 'center', boxShadow: '0 30px 120px rgba(0,0,0,0.7)' }}>
        <Kicker size={26}>Full Time · Our Prediction</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50, marginTop: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}><FlagFRA w={134} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>FRANCE</span></div>
          <BigTitle size={150} color={MV.gold}>2 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}><FlagSEN w={134} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.text }}>SENEGAL</span></div>
        </div>
      </div>
    </div>
  );
}

// ── 263–271  VERDICT — LES BLEUS / LIONS (single-word prompts, allowed) ──────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutBack(clamp((lt - 0.4) / 0.8, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 1.0) / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <ClipSprite id="verdict-stadium" dim={0.6} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 25 }}>
        <div style={{ opacity: clamp(p1, 0, 1), transform: `scale(${p1})`, background: 'rgba(7,9,15,0.7)', border: `2px solid ${MV.fra}`, borderRadius: 18, padding: '28px 56px', display: 'flex', alignItems: 'center', gap: 22 }}>
          <FlagFRA w={90} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', letterSpacing: '0.08em' }}>LES BLEUS</span>
        </div>
        <BigTitle size={70} color={MV.gold}>OR</BigTitle>
        <div style={{ opacity: clamp(p2, 0, 1), transform: `scale(${p2})`, background: 'rgba(7,9,15,0.7)', border: `2px solid ${MV.sen}`, borderRadius: 18, padding: '28px 56px', display: 'flex', alignItems: 'center', gap: 22 }}>
          <FlagSEN w={90} /><span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', letterSpacing: '0.08em' }}>LIONS</span>
        </div>
      </div>
      <Vignette strength={0.5} /><Letterbox />
    </div>
  );
}

// ── 271–288.5  MYSTERY — Legend 021, the Dancing Lion (griot clip) ───────────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 271.0;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.6) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#06120c' }}>
      <ClipSprite id="legend-griot" dim={0.1} style={{ filter: 'saturate(1.08) contrast(1.08)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5, background: `radial-gradient(ellipse at ${24 + Math.sin(lt * 0.3) * 14}% 75%, rgba(0,133,63,0.2) 0%, transparent 45%), radial-gradient(ellipse at 70% 30%, rgba(253,239,66,0.12) 0%, transparent 50%)` }} />
      <AmbientParticles start={S} dur={18} count={46} color="253,239,66" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#9fe0bf">Mystery Supporter · Legend No. 021</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{ position: 'absolute', left: 110, bottom: 150, zIndex: 25, opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)` }}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ width: 16, background: SEN, borderRadius: '6px 0 0 6px' }} />
            <div style={{ background: MV.panel, backdropFilter: 'blur(6px)', padding: '22px 52px 22px 38px', borderRadius: '0 14px 14px 0', border: `1px solid ${MV.line}`, borderLeft: 'none' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#eafff2', letterSpacing: '0.03em' }}>THE DANCING LION</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 14, background: 'rgba(0,133,63,0.14)', border: '1px solid rgba(0,133,63,0.5)', borderRadius: 999, padding: '8px 22px' }}>
                <span style={{ fontSize: 22 }}>✦</span>
                <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, color: '#9fe0bf', letterSpacing: '0.08em' }}>worldcup26.world</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} /><Letterbox />
    </div>
  );
}

// ── 288.5–296  APP — worldcup26.world ────────────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const pickP = Easing.easeOutBack(clamp((lt - 1.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <ClipSprite id="app-sen" dim={0.66} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 24%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, opacity: inP, zIndex: 25 }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={104} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <div style={{ display: 'flex', gap: 40, marginTop: 4, opacity: clamp(pickP, 0, 1), transform: `scale(${0.9 + 0.1 * pickP})` }}>
          {[['FRA', FRA, 'x1.40'], ['SEN', SEN, 'x3.10'], ['ARG', '#74acdf', 'x1.20']].map(([lab, col, coef], i) => (
            <div key={i} style={{ width: 240, borderRadius: 22, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: `1px solid ${MV.line}`, boxShadow: '0 22px 70px rgba(0,0,0,0.5)' }}>
              <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${col}55, #0a0c14)` }}>
                {lab === 'FRA' ? <FlagFRA w={130} /> : lab === 'SEN' ? <FlagSEN w={130} /> : <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: col }}>{lab}</span>}
              </div>
              <div style={{ padding: '16px 0 20px', textAlign: 'center', borderTop: `4px solid ${col}` }}>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#fff', letterSpacing: '0.06em' }}>{lab}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: col, marginTop: 4 }}>{coef}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 296–300  CTA outro ───────────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 296;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <ClipSprite id="cta-fra" dim={0.68} /><AmbientParticles start={296} dur={4} count={26} />
      <div style={{ position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <TitleReveal text="JOIN THE LEGENDS" start={S + 0.3} size={86} color={MV.text} />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={0.9} label="SUBSCRIBE" icon="🔔" accent={FRA_RED} x={500} />
        <CtaButton start={S} delay={1.2} label="LIKE" icon="👍" accent={MV.fra} x={960} />
        <CtaButton start={S} delay={1.5} label="SHARE" icon="📣" accent={MV.green} x={1400} />
      </div>
      <Letterbox />
    </div>
  );
}
