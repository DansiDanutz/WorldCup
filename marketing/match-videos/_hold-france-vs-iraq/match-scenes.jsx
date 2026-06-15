// match-scenes.jsx — the twelve scenes of the Match 19 video (300s timeline).
// Scene windows must match the SCENES table in match.html and narration.json.
// IMAGE-BASED: Ken-Burns motion on still PNGs. SOCCER ONLY — round-neck shirts,
// a pitch with goals, never gridiron. REAL-RESULTS-ONLY: the 2-0 is OUR PREDICTION.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// ── 1. Cold open (0–16): a father in Manchester names his son "Zidane" ───────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.2) / 1.4, 0, 1)) * (lt > 10.5 ? Math.max(0, (12.0 - lt) / 1.5) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.3) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* young Zidane Iqbal — the boy named after a legend, now leading Iraq's midfield */}
      <KenBurns src="assets/player-iqbal.png" start={0} dur={16} from={1.18} to={1.32} panY={-30}
        dim={0.5} style={{ filter: 'brightness(0.42) contrast(1.18) saturate(1.05) grayscale(0.35)' }} />
      {/* ember base in Iraq green so the screen never reads as dead air */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(0,166,81,0.16) 0%, transparent 55%)` }} />
      {/* heartbeat glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,166,81,${(0.5 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#e7f4ea',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}>A father in Manchester, during a war back home, named his newborn son after a footballer from another country. He called him Zidane.</div>
      )}
      <Vignette strength={0.85} />
      {lt > 12.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#e7f4ea">A true story</Kicker>
          <TitleReveal text="A NAME FROM ACROSS A BORDER" start={12.4} size={82} color={MV.irq} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (16–28) ────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~10s carries the Ep18 recap line, then the Ep19 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (10.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 10.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.6) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.4) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #060c1c 0%, #0c1430 55%, #060c1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(58,107,255,0.12) 0%, transparent 55%)` }} />
      <AmbientParticles start={16} dur={12} count={34} color="120,160,255" />
      {/* RECAP — OUR PREDICTION from Ep18 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>BELGIUM 2 — 1 EGYPT</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}>Two cursed crowns</div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 9.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.fra}>WorldCup26 Legends · Episode 19</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagFRA w={230} /></Waving>
              <BigTitle size={62} glow={MV.fra}>FRANCE</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagIRQ w={230} /></Waving>
              <BigTitle size={62} glow={MV.irq}>IRAQ</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP I · MATCHDAY 2 · THE CHAMPIONS AND THE IMPOSSIBLE MEETING
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (28–46.5): the impossible meeting + "the fastest man in football" ─
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  // second beat (~40 global → lt ~12): "the boy named Zidane vs the fastest man in football"
  const b = Easing.easeOutBack(clamp((lt - 11.5) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (18.0 - lt) / 1.0));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <PitchBackdrop tint="#0a2540" dim={0.25} />
      <Vignette strength={0.5} />
      <AmbientParticles start={28} dur={18.5} count={26} color="120,160,255" />
      {/* the meeting headline */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <Kicker size={28} color={MV.fra}>The champions · and the impossible meeting</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          A STORY TOO PERFECT TO INVENT
        </div>
      </div>
      {/* the tease */}
      {b > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(b, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(b,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.04em' }}>The boy named Zidane — toe to toe with the fastest man in football</span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 4. History (46.5–98): the real Zidane Iqbal / the Namesake story ─────────
function HistoryPlate({ start, end, year, venue, score, note, accent = MV.gold, stamp }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const p = Easing.easeOutBack(clamp((t - start) / 0.8, 0, 1));
  const fade = t > end - 0.6 ? (end - t) / 0.6 : 1;
  const stampP = stamp ? Easing.easeOutBack(clamp((t - start - 1.6) / 0.5, 0, 1)) : 0;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: clamp(p, 0, 1) * clamp(fade, 0, 1),
    }}>
      <div style={{
        transform: `scale(${0.86 + 0.14 * p})`,
        background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24,
        padding: '52px 100px', textAlign: 'center', position: 'relative',
        boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', maxWidth: 1200,
      }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.30em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 42, color: MV.text, letterSpacing: '0.05em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 900 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.irq}`, color: MV.irq, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.08em',
            background: 'rgba(7,9,15,0.85)',
          }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

function SceneHistory() {
  const S = 46.5;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <KenBurns src="assets/player-iqbal.png" start={S} dur={51.5} from={1.1} to={1.24} panX={-20}
        dim={0.72} style={{ filter: 'brightness(0.26) saturate(0.7) contrast(1.1) grayscale(0.2)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={51.5} count={28} color="120,200,150" maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={MV.irq}>Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          THE BOY NAMED ZIDANE
        </div>
      </div>
      {/* flag, always present */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        <FlagIRQ w={120} />
      </div>
      {/* beats synced to narration (49, 61, 71, 83, 94) */}
      <HistoryPlate start={S + 0.5}  end={S + 14.5} year="BORN IN MANCHESTER · 2003" venue="AN IRAQI-PAKISTANI FAMILY" score="“ZIDANE”" note="Born in the shadow of a war back home — and given a name from another country entirely." accent={MV.irq} />
      <HistoryPlate start={S + 14.5} end={S + 24.5} year="ZINEDINE ZIDANE · 1998" venue="THE FRENCH-ALGERIAN GENIUS" score="WORLD CHAMPION" note="His father named him after the man who won France the World Cup in nineteen ninety-eight." accent={MV.fra} />
      <HistoryPlate start={S + 24.5} end={S + 36.5} year="MANCHESTER UNITED ACADEMY" venue="THE SAME BUILDING AS THE GREATS" score="A FIRST" note="The first British South Asian ever to play for that famous club's first team." accent={MV.gold} stamp="MAN UTD" />
      <HistoryPlate start={S + 36.5} end={S + 47.0} year="“DAD SET THE BAR HIGH”" venue="THE SON · TONIGHT" score="HE LEADS" note="Now the boy named after a French hero leads Iraq's midfield… against France itself." accent={MV.text} />
      <HistoryPlate start={S + 47.0} end={S + 51.5} year="TONIGHT · GROUP I" venue="THE IMPOSSIBLE MEETING" score="FRA × IRQ" note="Everything France is — stands across from him." accent={MV.fra} />
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── Squad montage grid (uses the generated still library) ────────────────────
function SquadGrid({ start, end, players, accent }) {
  const t = useTime();
  if (t < start || t > end) return null;
  const fade = t > end - 0.5 ? (end - t) / 0.5 : 1;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 34, opacity: clamp(fade, 0, 1), padding: '0 90px',
    }}>
      {players.map((p, i) => {
        const cp = Easing.easeOutBack(clamp((t - start - 0.25 - i * 0.28) / 0.7, 0, 1));
        return (
          <div key={i} style={{
            width: 290, transform: `translateY(${(1 - cp) * 90}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1),
            borderRadius: 22, overflow: 'hidden', background: MV.panel, border: `1px solid ${MV.line}`,
            boxShadow: `0 26px 80px rgba(0,0,0,0.6)`,
          }}>
            <div style={{ height: 322, overflow: 'hidden' }}>
              <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * clamp((t - start) / (end - start), 0, 1)})` }} />
            </div>
            <div style={{ padding: '18px 16px 20px', textAlign: 'center', borderTop: `4px solid ${accent}` }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 25, color: MV.text }}>{p.name}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 17, color: MV.muted, letterSpacing: '0.16em', marginTop: 5 }}>{p.role}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 5. France (98–134): Les Bleus, the machine ───────────────────────────────
function SceneFrance() {
  const { localTime: lt } = useSprite();
  const S = 98.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a2550" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,38,84,0.30) 0%, transparent 30%, transparent 70%, rgba(237,41,57,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagFRA w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: MV.text, letterSpacing: '0.10em' }}>LES BLEUS · CHAMPIONS OF THE WORLD 2018</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 9.0} accent={MV.fra} players={[
        { img: 'assets/squad/fra-1-Mbappe.png',     name: 'KYLIAN MBAPPÉ',  role: 'CAPTAIN · SPEED' },
        { img: 'assets/squad/fra-2-Olise.png',      name: 'MICHAEL OLISE',  role: 'THE MAGICIAN' },
        { img: 'assets/squad/fra-3-Dembele.png',    name: 'O. DEMBÉLÉ',     role: 'THE CHAOS' },
        { img: 'assets/squad/fra-4-Saliba.png',     name: 'WILLIAM SALIBA', role: 'THE CALM' },
        { img: 'assets/squad/fra-5-Tchouameni.png', name: 'A. TCHOUAMÉNI',  role: 'THE SHIELD' },
      ]} />
      {/* line beats: 99 champions, 109 Mbappe, 119 Olise/Dembele/Saliba, 130 a team that wins */}
      <Sprite start={109.0} end={119.0}>
        <KenBurns src="assets/player-mbappe.png" start={109} dur={10} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={109.4} name="KYLIAN MBAPPÉ" role="Captain · Forward" line="One of the greatest goal-scorers this tournament has ever seen — and still in his prime." accent={MV.fra} />
      </Sprite>
      <Sprite start={119.0} end={130.0}>
        <KenBurns src="assets/player-olise.png" start={119} dur={11} from={1.04} to={1.16} panX={20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={119.4} name="OLISE · DEMBÉLÉ · SALIBA" role="The Magic & The Wall" line="The Magician who chose France — with Dembélé's chaos and Saliba's calm behind him." accent={MV.fra} />
      </Sprite>
      <Sprite start={130.0} end={134.0}>
        <KenBurns src="assets/player-saliba.png" start={130} dur={4} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={130.3} name="WORLD CHAMPIONS" role="2018 winners · 2022 finalists" line="A machine of speed, depth and ruthless quality — a team that wins because it is supposed to." accent={MV.fraRed} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. Iraq (134–169.5): the Lions of Mesopotamia, the miracle ───────────────
function SceneIraq() {
  const { localTime: lt } = useSprite();
  const S = 134.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a2e1a" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,122,61,0.26) 0%, transparent 30%, transparent 70%, rgba(206,17,38,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagIRQ w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 38, color: MV.text, letterSpacing: '0.10em' }}>LIONS OF MESOPOTAMIA · STILL STANDING</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 10.0} accent={MV.irq} players={[
        { img: 'assets/squad/irq-1-Iqbal.png',    name: 'ZIDANE IQBAL',   role: 'THE NAMESAKE' },
        { img: 'assets/squad/irq-2-Hussein.png',  name: 'AYMEN HUSSEIN',  role: 'THE SPEARHEAD' },
        { img: 'assets/squad/irq-3-AlHamadi.png', name: 'ALI AL-HAMADI',  role: 'THE RUNNER' },
        { img: 'assets/squad/irq-4-AlAmmari.png', name: 'A. AL-AMMARI',   role: 'THE ENGINE' },
        { img: 'assets/squad/irq-5-Sulaka.png',   name: 'REBIN SULAKA',   role: 'THE WALL' },
      ]} />
      {/* line beats: 138 nation in shadow of war, 148 Iqbal/Hussein/Al-Hamadi, 159 nothing to lose */}
      <Sprite start={148.0} end={159.0}>
        <KenBurns src="assets/player-iqbal.png" start={148} dur={11} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={148.3} name="ZIDANE IQBAL" role="Midfield · The Namesake" line="Pulls the strings, calm under any storm — with Hussein's power and Al-Hamadi running beyond." accent={MV.irq} />
      </Sprite>
      <Sprite start={159.0} end={169.5}>
        <KenBurns src="assets/player-hussein.png" start={159} dur={10.5} from={1.04} to={1.16} panX={-20} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={159.3} name="NOTHING TO LOSE" role="A whole country watching" line="Written in the shadow of war and sanctions — and somehow still here, still believing." accent={MV.irqRed} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (169.5–188.5): France's machine vs Iraq's miracle ────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/player-mbappe.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,38,84,0.40), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE MACHINE
          <div style={{ fontSize: 26, fontWeight: 700, color: MV.gold, letterSpacing: '0.18em', marginTop: 8 }}>FRANCE · THE FASTEST MAN ALIVE</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/player-iqbal.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,122,61,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE MIRACLE
          <div style={{ fontSize: 24, fontWeight: 700, color: MV.gold, letterSpacing: '0.16em', marginTop: 8 }}>IRAQ · THE BOY WITH A LEGEND'S NAME</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 'calc(50% - 3px)', width: 6, background: `linear-gradient(180deg, transparent, ${MV.gold}, transparent)`, zIndex: 24, opacity: slideP }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', zIndex: 26,
        transform: `translate(-50%,-50%) scale(${vsP}) rotate(${(1 - vsP) * 20}deg)`, opacity: clamp(vsP, 0, 1),
        width: 210, height: 210, borderRadius: '50%', background: MV.panel, border: `5px solid ${MV.gold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 90px ${MV.gold}66`,
      }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 92, color: MV.gold }}>VS</span>
      </div>
      <Sprite start={183.5} end={188.5}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={64} color={MV.text} style={{ maxWidth: 1400 }}>
            Our prediction — built on French class, on Iraqi heart, and on a moment of poetry no script could match. Watch.
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (188.5–243.5): OUR PREDICTION 2-0 FRANCE ───────────────────
// Min 38: Iqbal stays calm, finds Hussein who shoots just wide (~201, NO goal).
// Class tells: Olise threads, Mbappe 1-0 (~211). Late, a clinical second 2-0
// (~221). Full-time card = OUR PREDICTION.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 188.5;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <KenBurns src="assets/player-iqbal.png" start={S} dur={22} from={1.1} to={1.26} panX={-30} dim={0.18} />
      <Sprite start={210} end={243.5}>
        <KenBurns src="assets/player-mbappe.png" start={210} dur={33.5} from={1.08} to={1.26} panX={20} dim={0.16} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>

      {/* min 38 — Iqbal stays calm, Hussein shoots just wide (no goal) */}
      <Sprite start={188.5} end={211}>
        <ScoreBug start={S + 0.4} fra={0} irq={0} minute="38'" />
      </Sprite>
      {/* "just wide" near-miss flash in Iraq green (deliberately NOT a goal) */}
      <Sprite start={201.0} end={205.0}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 230, textAlign: 'center', zIndex: 27 }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: MV.irq, textShadow: '0 4px 26px rgba(0,0,0,0.9)', letterSpacing: '0.04em' }}>JUST WIDE!</span>
        </div>
      </Sprite>

      {/* Mbappe 1-0 (~211) */}
      <GoalFlash at={S + 22.5} color={MV.fra} />
      <Confetti start={S + 22.7} dur={11} colors={[MV.fra, '#fff', MV.fraRed, MV.gold]} />
      <Sprite start={211} end={221}>
        <ScoreBug start={S + 22.5} fra={1} irq={0} minute="MBAPPÉ" />
      </Sprite>

      {/* late clinical second 2-0 (~221) */}
      <GoalFlash at={S + 32.5} color={MV.fra} />
      <Confetti start={S + 32.7} dur={11} colors={[MV.fra, '#fff', MV.fraRed, MV.gold]} />
      <Sprite start={221} end={233}>
        <ScoreBug start={S + 32.5} fra={2} irq={0} minute="LATE · 2-0" />
      </Sprite>

      <Sprite start={233} end={243.5}>
        <FullTimeCard start={S + 44.5} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

function FullTimeCard({ start }) {
  const t = useTime();
  const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 26, padding: '54px 100px', textAlign: 'center', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 30px 120px rgba(0,0,0,0.7)' }}>
        <Kicker size={26} color={MV.gold}>Our Prediction · Full Time</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagFRA w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>FRANCE</span>
          </div>
          <BigTitle size={170} color={MV.gold}>2 — 0</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagIRQ w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>IRAQ</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 34, maxWidth: 980 }}>
          The scoreline says champions. But the night belonged to a boy named Zidane — who did not flinch.
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (243.5–252.5): do you agree? BLEUS / IRAQ ─────────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 243.5;
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.2) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.6) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <PitchBackdrop tint="#0a2540" dim={0.45} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30} color={MV.text}>Champions… or the story of the round?</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.gold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(0,38,84,0.20)', border: `2px solid ${MV.fra}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.fra, letterSpacing: '0.06em' }}>“BLEUS”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if France are simply too much</div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(0,122,61,0.18)', border: `2px solid ${MV.irq}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.irq, letterSpacing: '0.06em' }}>“IRAQ”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Iqbal's night is the story of the round</div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (252.5–272.5): Legend 019 — the Namesake ───────────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 252.5;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <KenBurns src="assets/player-iqbal.png" start={S} dur={20} from={1.16} to={1.3} panY={-20}
        dim={0.32} style={{ filter: 'brightness(0.4) contrast(1.1) saturate(1.0) grayscale(0.3)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(0,166,81,0.16) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(58,107,255,0.12) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={20} count={46} color="200,235,210" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#a8e6c0">The Mystery Supporter · Legend No. 019</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(8,14,10,0.9)', border: '1px solid rgba(120,220,160,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#e7f9ee', letterSpacing: '0.02em' }}>THE NAMESAKE</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#a8e6c0', letterSpacing: '0.10em', marginTop: 8, maxWidth: 840 }}>THE FATHER WHO, IN THE WORST OF THE WAR, CHOSE A NAME FROM ACROSS A BORDER</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 18, background: 'rgba(255,210,74,0.12)', border: '1px solid rgba(255,210,74,0.5)', borderRadius: 999, padding: '10px 24px' }}>
              <span style={{ fontSize: 26 }}>✦</span>
              <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 24, color: MV.gold, letterSpacing: '0.08em' }}>COLLECT HIM INSIDE THE GAME · worldcup26.world</span>
            </div>
          </div>
        </div>
      )}
      <Vignette strength={0.55} />
      <Letterbox />
    </div>
  );
}

// ── 11. App promo (272.5–290): worldcup26.world ──────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 272.5;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'FRANCE', coef: 'x1.25', pts: '+0.00', flag: <FlagFRA w={86} /> },
    { name: 'IRAQ', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagIRQ w={86} />, hot: true },
    { name: 'BRAZIL', coef: 'x1.20', pts: '+0.00', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, opacity: inP }}>
        <Kicker color="#7fd6b5" size={30}>The Prediction Game</Kicker>
        <BigTitle size={100} color="#fff" glow={MV.green}>worldcup26.world</BigTitle>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 36, color: '#cfe9de', letterSpacing: '0.04em' }}>
          Pick 3 of the 48 nations. Every goal they score… scores for YOU.
        </div>
        <div style={{ display: 'flex', gap: 36, marginTop: 8 }}>
          {cards.map((c, i) => {
            const cp = Easing.easeOutBack(clamp((lt - 1.2 - i * 0.35) / 0.7, 0, 1));
            return (
              <div key={i} style={{
                transform: `translateY(${(1 - cp) * 60}px) scale(${0.8 + 0.2 * cp})`, opacity: clamp(cp, 0, 1),
                background: 'rgba(255,255,255,0.07)', border: `1px solid ${c.hot ? 'rgba(255,210,74,0.5)' : 'rgba(255,255,255,0.18)'}`, borderRadius: 22,
                padding: '34px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 290,
                boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
              }}>
                {c.flag}
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: '#fff' }}>{c.name}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: MV.gold }}>{c.coef}</div>
                <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 26, color: c.hot ? '#6ee7a8' : '#9fb2a9' }}>{c.pts}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.gold, letterSpacing: '0.05em', marginTop: 6 }}>
          FREE TO PLAY · LIVE PRIZE POOL · UNDERDOGS PAY TRIPLE
        </div>
      </div>
      <Letterbox />
    </div>
  );
}

// ── 12. CTA outro (290–300) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 290;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <PitchBackdrop tint="#0a2540" dim={0.55} />
      <AmbientParticles start={S} dur={10} count={28} color="120,160,255" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.fra}>Football is bigger than borders</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#002654" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#ed2939" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#007a3d" x={1400} />
      </div>
      <Sprite start={294.6} end={300}>
        <NextMatchTease start={S + 4.6} />
      </Sprite>
      <Letterbox />
    </div>
  );
}

function NextMatchTease({ start }) {
  const t = useTime();
  const p = Easing.easeOutCubic(clamp((t - start) / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 54px', display: 'flex', alignItems: 'center', gap: 22 }}>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 26, color: MV.muted, letterSpacing: '0.14em' }}>WORLDCUP26 LEGENDS</span>
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚽ THE LEGENDS PLAY ON · worldcup26.world</span>
      </div>
    </div>
  );
}
