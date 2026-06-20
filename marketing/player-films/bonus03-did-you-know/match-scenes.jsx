// match-scenes.jsx — WorldCup26 Bonus: "DID YOU KNOW?" (300s documentary).
// CLIP-BASED (VideoSprite), SOCCER ONLY, NO SUBTITLES — only title cards, ≤4-word
// labels, year/stat fact-plates, the worldcup26.world CTA. Verified facts only.
// Structure: mystery cold open → the age without VAR → the rule that reinvented
// football → the machines → the Jota tribute → the future we predict.

// Recurring "DID YOU KNOW?" pill
function DidYouKnow({ start, accent = MV.gold }) {
  const t = useTime();
  const lt = t - start;
  if (lt < 0 || lt > 4.5) return null;
  const p = Easing.easeOutBack(clamp(lt / 0.6, 0, 1)) * (lt > 3.6 ? Math.max(0, (4.5 - lt) / 0.9) : 1);
  return (
    <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 27, opacity: clamp(p, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(p, 0, 1)})` }}>
      <div style={{ background: 'rgba(10,12,20,0.86)', border: `2px solid ${accent}`, borderRadius: 999, padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: `0 0 50px ${accent}55` }}>
        <span style={{ fontSize: 30 }}>👁️</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: accent, letterSpacing: '0.08em' }}>DID YOU KNOW?</span>
      </div>
    </div>
  );
}

// Fact plate: a big year/headline, a label, an optional stat stamp. NO sentences.
function FactPlate({ start, end, head, label, stat, accent = MV.gold }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const p = Easing.easeOutBack(clamp((t - start) / 0.8, 0, 1));
  const fade = t > end - 0.6 ? (end - t) / 0.6 : 1;
  const statP = stat ? Easing.easeOutBack(clamp((t - start - 1.4) / 0.5, 0, 1)) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp(p, 0, 1) * clamp(fade, 0, 1) }}>
      <div style={{ transform: `scale(${0.86 + 0.14 * p})`, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 92px', textAlign: 'center', position: 'relative', boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', maxWidth: 1250 }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 28, color: MV.muted, letterSpacing: '0.28em' }}>{label}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: accent, lineHeight: 1.04, margin: '12px 0 4px', textShadow: `0 0 60px ${accent}44` }}>{head}</div>
        {stat && statP > 0 && (
          <div style={{ position: 'absolute', top: -30, right: -54, transform: `rotate(-11deg) scale(${statP})`, border: `5px solid ${accent}`, color: accent, borderRadius: 14, padding: '10px 24px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, letterSpacing: '0.06em', background: 'rgba(7,9,15,0.88)' }}>{stat}</div>
        )}
      </div>
    </div>
  );
}

function ChapterTag({ text, accent = MV.gold }) {
  return (
    <div style={{ position: 'absolute', top: 112, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
      <Kicker size={28} color={accent}>{text}</Kicker>
    </div>
  );
}

// ── 1. Cold open (0–16) — the mystery + Hand of God tease ────────────────────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.3) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <VideoSprite src="assets/mystery-keeper.mp4" start={0} dur={8} dim={0.28} style={{ filter: 'brightness(0.7) contrast(1.16)' }} />
      <VideoSprite src="assets/handofgod.mp4" start={8} dur={8} dim={0.3} style={{ filter: 'brightness(0.7) sepia(0.4) contrast(1.12)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(255,210,74,${(0.4 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      <Vignette strength={0.85} />
      {lt > 12.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#e9d9b0">A World Cup secret</Kicker>
          <TitleReveal text="DID YOU KNOW?" start={12.4} size={120} color={MV.gold} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Title (16–28) ─────────────────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 1.2) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #14110a 55%, #0a0f1c 100%)` }}>
      <VideoSprite src="assets/crowd-awe.mp4" start={16} dur={12} dim={0.58} fit="cover" style={{ filter: 'brightness(0.62) saturate(1.05)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,10,18,0.45), rgba(7,10,18,0.82))' }} />
      <AmbientParticles start={16} dur={12} count={32} color="255,210,74" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -26}px)` }}>
          <Kicker color={MV.gold} size={30}>WorldCup26 · Bonus</Kicker>
        </div>
        <div style={{ opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <BigTitle size={130} color={MV.text} glow={MV.gold}>DID YOU KNOW?</BigTitle>
        </div>
        <div style={{ opacity: p1, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.1em' }}>
          FIVE SECRETS OF THE WORLD CUP
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (28–46) ─────────────────────────────────────────────────────────
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <VideoSprite src="assets/future-stadium.mp4" start={28} dur={18} dim={0.45} fit="cover" />
      <Vignette strength={0.5} />
      <AmbientParticles start={28} dur={18} count={26} color="120,180,255" />
      <div style={{ position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 22}px)` }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 66, color: MV.text, letterSpacing: '0.03em', textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          INJUSTICE · RULES · THE FUTURE
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 4. Chapter 1 — the age without VAR (46–92) ───────────────────────────────
function SceneNoVAR() {
  const t = useTime();
  const maradona = t < 79;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      {maradona ? (
        <VideoSprite src="assets/handofgod.mp4" start={46} dur={33} dim={0.62} style={{ filter: 'brightness(0.34) sepia(0.4) contrast(1.12)' }} />
      ) : (
        <VideoSprite src="assets/lampard-ghostgoal.mp4" start={79} dur={13} dim={0.6} style={{ filter: 'brightness(0.36) saturate(0.9) contrast(1.1)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={46} dur={46} count={24} color="220,180,120" maxR={4} />
      <ChapterTag text="Chapter One · Before the Machines" accent="#e0b85a" />
      <DidYouKnow start={46.5} accent="#ffd24a" />
      <FactPlate start={56} end={67} head="HAND OF GOD" label="1986 · ARGENTINA v ENGLAND" stat="2-1" accent="#ffd24a" />
      <FactPlate start={67} end={78} head="HE USED HIS HAND" label="THE REFEREE NEVER SAW IT" accent={MV.text} />
      <DidYouKnow start={79} accent="#7fb2ff" />
      <FactPlate start={84.5} end={92} head="THE GHOST GOAL" label="2010 · OVER THE LINE BY A FOOT" stat="NO GOAL" accent="#7fb2ff" />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 5. Chapter 2 — the rule that reinvented football (92–124) ────────────────
function SceneRule() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <VideoSprite src="assets/backpass-1992.mp4" start={92} dur={32} dim={0.58} style={{ filter: 'brightness(0.4) sepia(0.32) contrast(1.08)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.8) 100%)' }} />
      <AmbientParticles start={92} dur={32} count={22} color="120,220,160" maxR={4} />
      <ChapterTag text="Chapter Two · One Rule, A New Game" accent="#5fd39a" />
      <DidYouKnow start={100} accent="#5fd39a" />
      <FactPlate start={106} end={116} head="THE BACK-PASS RULE" label="1992 · NO MORE PICKING IT UP" accent="#5fd39a" />
      <FactPlate start={116} end={124} head="REINVENTED" label="FOOTBALL WAS NEVER SLOW AGAIN" accent={MV.text} />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 6. Chapter 3 — the machines arrive (124–184) ─────────────────────────────
function SceneMachines() {
  const t = useTime();
  let bg;
  if (t < 143) bg = <VideoSprite src="assets/goalline-tech.mp4" start={124} dur={19} dim={0.5} />;
  else if (t < 165) bg = <VideoSprite src="assets/var-screen.mp4" start={143} dur={22} dim={0.52} />;
  else bg = <VideoSprite src="assets/semiauto-offside.mp4" start={165} dur={19} dim={0.5} />;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02040a' }}>
      {bg}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 28%, rgba(2,4,10,0.8) 100%)' }} />
      <AmbientParticles start={124} dur={60} count={30} color="100,170,255" maxR={3.5} />
      <ChapterTag text="Chapter Three · The Machines Arrive" accent="#6ea8ff" />
      <FactPlate start={134} end={143} head="GOAL-LINE TECH" label="2014 · ACCURATE TO THE MILLIMETRE" accent="#6ea8ff" />
      <DidYouKnow start={143} accent="#6ea8ff" />
      <FactPlate start={149} end={159} head="V·A·R" label="2018 · THE FIRST WORLD CUP WITH IT" accent="#6ea8ff" />
      <FactPlate start={159} end={165} head="PENALTIES" label="THEY ALMOST DOUBLED" stat="13 → 29" accent="#ffd24a" />
      <DidYouKnow start={165} accent="#6ea8ff" />
      <FactPlate start={170} end={184} head="THE SMART BALL" label="2022 · A SENSOR INSIDE THE BALL" stat="500× / SEC" accent="#6ea8ff" />
      <Vignette strength={0.46} />
      <Letterbox />
    </div>
  );
}

// ── 7. Chapter 4 — the tribute (184–220) — respectful ────────────────────────
function SceneTribute() {
  const { localTime: lt } = useSprite();
  const S = 184.0;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.6, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 9.5) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#03020a' }}>
      <VideoSprite src="assets/jota-tribute.mp4" start={S} dur={36} from={1.08} to={1.2} dim={0.34} style={{ filter: 'brightness(0.5) saturate(1.02)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(200,40,40,0.12) 0%, transparent 60%)' }} />
      <AmbientParticles start={S} dur={36} count={30} color="255,220,180" maxR={3} />
      <ChapterTag text="Chapter Four · One Extra Name" accent="#f0c98a" />
      <DidYouKnow start={192} accent="#f0c98a" />
      {plateP > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 40}px)` }}>
          <div style={{ background: 'rgba(12,10,8,0.9)', border: '1px solid rgba(240,200,140,0.4)', borderRadius: 18, padding: '26px 56px', textAlign: 'center', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, color: '#fff3e2', letterSpacing: '0.03em' }}>TRIBUTE TO JOTA</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#f0c98a', letterSpacing: '0.16em', marginTop: 8 }}>PORTUGAL · ALWAYS WITH THE TEAM</div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} />
      <Letterbox />
    </div>
  );
}

// ── 8. Chapter 5 — the future we predict (220–262) ───────────────────────────
function SceneFuture() {
  const t = useTime();
  const aiRef = t < 241;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030c' }}>
      {aiRef ? (
        <VideoSprite src="assets/future-ai-ref.mp4" start={220} dur={21} dim={0.46} />
      ) : (
        <VideoSprite src="assets/future-ball.mp4" start={241} dur={21} dim={0.46} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 26%, rgba(2,3,12,0.82) 100%)' }} />
      <AmbientParticles start={220} dur={42} count={36} color="130,160,255" maxR={3.5} />
      <ChapterTag text="Chapter Five · The Future We Predict" accent="#8aa2ff" />
      <DidYouKnow start={221} accent="#8aa2ff" />
      <FactPlate start={232} end={241} head="THE AI REFEREE" label="2034? · DECISIONS IN AN INSTANT" accent="#8aa2ff" />
      <FactPlate start={243} end={252} head="THE THINKING BALL" label="IT CALLS ITS OWN GOALS" accent="#8aa2ff" />
      <FactPlate start={252} end={262} head="ZERO MISTAKES" label="FOR BETTER… OR FOR WORSE" accent="#ffd24a" />
      <Vignette strength={0.46} />
      <Letterbox />
    </div>
  );
}

// ── 9. Engage (262–274) ──────────────────────────────────────────────────────
function SceneEngage() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const nums = ['1', '2', '3', '4', '5'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <VideoSprite src="assets/future-stadium.mp4" start={262} dur={12} dim={0.6} fit="cover" style={{ filter: 'brightness(0.5)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,9,16,0.62)' }} />
      <div style={{ position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: MV.gold, letterSpacing: '0.03em' }}>HOW MANY DID YOU KNOW?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 70, zIndex: 26 }}>
        {nums.map((n, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 1.0 - i * 0.18) / 0.6, 0, 1));
          return (
            <div key={i} style={{ width: 110, height: 110, borderRadius: 20, background: 'rgba(255,210,74,0.12)', border: `2px solid ${MV.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp(cp, 0, 1), transform: `translateY(${(1 - cp) * 40}px) scale(${0.8 + 0.2 * cp})` }}>
              <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.gold }}>{n}</span>
            </div>
          );
        })}
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. App promo (274–288) ──────────────────────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 22%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={104} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 36, color: '#cfe9de', letterSpacing: '0.04em' }}>
          PICK 3 NATIONS · EVERY GOAL SCORES FOR YOU
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.gold, letterSpacing: '0.05em', marginTop: 8 }}>
          FREE TO PLAY · LIVE LEADERBOARD · JUST FOR FUN
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 11. CTA (288–300) ────────────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 288;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <VideoSprite src="assets/future-stadium.mp4" start={S} dur={12} dim={0.62} fit="cover" style={{ filter: 'brightness(0.45)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 196, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <div style={{ marginTop: 22 }}><TitleReveal text="KEEP ASKING WHY" start={S + 0.5} size={84} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#ffd24a" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#6ea8ff" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#5fd39a" x={1400} />
      </div>
      <Sprite start={292.6} end={300}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, display: 'flex', justifyContent: 'center', zIndex: 26 }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 54px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 26, color: MV.muted, letterSpacing: '0.14em' }}>WORLDCUP26 LEGENDS</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>✦ DID YOU KNOW? · worldcup26.world</span>
          </div>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}
