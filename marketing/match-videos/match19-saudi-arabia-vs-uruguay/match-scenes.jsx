// match-scenes.jsx — the twelve scenes of the Match 19 video (300s timeline).
// Scene windows must match the SCENES table in match.html and narration.json.
// IMAGE-BASED: Ken-Burns motion on still PNGs. SOCCER ONLY — round-neck shirts,
// a pitch with goals, never gridiron. REAL-RESULTS-ONLY: the 1-2 is OUR PREDICTION.
// Saudi Arabia (Green Falcons, green/white) HOME vs Uruguay (La Celeste, sky/navy) AWAY.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// ── 1. Cold open (0–18): the 1950 Maracanazo — "they silenced 200,000" ───────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.0)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.2) / 1.4, 0, 1)) * (lt > 11.5 ? Math.max(0, (13.5 - lt) / 1.5) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 13.6) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* a Uruguayan legend image as the symbol of the Maracanazo (dark, dramatic) */}
      <KenBurns src="assets/player-valverde.png" start={0} dur={18} from={1.18} to={1.32} panY={-30}
        dim={0.5} style={{ filter: 'brightness(0.40) contrast(1.18) saturate(1.0) grayscale(0.4)' }} />
      {/* ember base in Celeste sky-blue so the screen never reads as dead air */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(91,154,213,0.16) 0%, transparent 55%)` }} />
      {/* heartbeat glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(91,154,213,${(0.45 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#dceaf7',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}>Two hundred thousand people came to crown Brazil. A nation of three million silenced every one of them.</div>
      )}
      <Vignette strength={0.85} />
      {lt > 13.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#dceaf7">A true story</Kicker>
          <TitleReveal text="THE MARACANAZO" start={13.7} size={120} color={MV.uru} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (18–30) ────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~9s carries the Ep18 recap line, then the Ep19 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (9.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 9.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 9.6) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 10.4) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(91,154,213,0.10) 0%, transparent 55%)` }} />
      <AmbientParticles start={18} dur={12} count={34} color="91,154,213" />
      {/* RECAP — OUR PREDICTION from Ep18 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>BELGIUM 2 — 1 EGYPT</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}>we predicted the Red Devils would edge it</div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 8.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.ksa}>WorldCup26 Legends · Episode 19</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagKSA w={230} /></Waving>
              <BigTitle size={58} glow={MV.ksa}>SAUDI ARABIA</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagURU w={230} /></Waving>
              <BigTitle size={62} glow={MV.uru}>URUGUAY</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP H · THE GIANT-KILLERS · AGAINST THE SMALLEST GIANT
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (30–48): smallest giant + "a man who heard the silence" ─────────
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  // second beat (~41 global → lt ~11): the man who heard that silence
  const b = Easing.easeOutBack(clamp((lt - 10.0) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (18.0 - lt) / 1.0));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <PitchBackdrop tint="#0a2540" dim={0.25} />
      <Vignette strength={0.5} />
      <AmbientParticles start={30} dur={18} count={26} color="242,193,78" />
      {/* smallest-giant headline */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <Kicker size={28} color={MV.uru}>3.4 million people · two world titles</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 76, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          THE SMALLEST GIANT
        </div>
      </div>
      {/* the tease */}
      {b > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(b, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(b,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.04em' }}>In the stands — a man who heard that silence with his own ears</span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── History plate (shared by SceneHistory) ───────────────────────────────────
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
        boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', maxWidth: 1160,
      }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.30em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 110, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.06em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 880 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.uru}`, color: MV.uru, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.08em',
            background: 'rgba(7,9,15,0.85)',
          }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

// ── 4. History (48–118): 1930 first World Cup + the 1950 Maracanazo ──────────
function SceneHistory() {
  const S = 48.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <KenBurns src="assets/player-arrascaeta.png" start={S} dur={70} from={1.1} to={1.26} panX={-20}
        dim={0.72} style={{ filter: 'brightness(0.26) saturate(0.7) contrast(1.1) grayscale(0.25)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={70} count={28} color="91,154,213" maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={MV.uru}>Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          WHAT THIS SHIRT CARRIES
        </div>
      </div>
      {/* flag, always present */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        <FlagURU w={120} />
      </div>
      {/* beats synced to narration (50, 61, 72, 83, 94, 104, 113) */}
      <HistoryPlate start={S + 1.5}  end={S + 12.5} year="MONTEVIDEO · 1930" venue="THE VERY FIRST WORLD CUP" score="4 — 2" note="Hosts Uruguay beat Argentina in the final to become the first world champions ever." accent={MV.uruGold} />
      <HistoryPlate start={S + 12.5} end={S + 23.5} year="16 JULY 1950" venue="THE MARACANÃ · RIO" score="BRAZIL NEEDED A DRAW" note="They printed the victory papers before kickoff. ~200,000 came to celebrate." accent={MV.gold} />
      <HistoryPlate start={S + 23.5} end={S + 35.0} year="79TH MINUTE" venue="ALCIDES GHIGGIA SCORES" score="2 — 1" note="Schiaffino equalised, then Ghiggia slid it past the keeper. Uruguay, champions again." accent={MV.uru} stamp="MARACANAZO" />
      <HistoryPlate start={S + 35.0} end={S + 46.0} year="THE SILENCE" venue="THE BLOW THAT BROKE BRAZIL" score="“…AND ME”" note="“Only three people ever silenced the Maracanã — Frank Sinatra, the Pope, and me.” — Ghiggia" accent={MV.text} />
      <HistoryPlate start={S + 46.0} end={S + 57.0} year="THE NUMBERS" venue="A NATION OF 3.4 MILLION" score="2 + 15" note="Two World Cups and fifteen Copa Américas — nobody has ever punched so far above their weight." accent={MV.uruGold} />
      <HistoryPlate start={S + 57.0} end={S + 70.0} year="TONIGHT · GROUP H" venue="THE SMALLEST GIANT RETURNS" score="KSA × URU" note="And tonight that shirt meets a team that knows how it feels to shock the world." accent={MV.ksa} />
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

// ── 5. Saudi Arabia (118–158): the Green Falcons ─────────────────────────────
function SceneSaudi() {
  const { localTime: lt } = useSprite();
  const S = 118.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a2e1a" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,108,53,0.24) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.10) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagKSA w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE GREEN FALCONS · THEY BEAT MESSI</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 9.0} accent={MV.ksa} players={[
        { img: 'assets/squad/ksa-1-AlDawsari.png',  name: 'AL-DAWSARI',    role: 'THE HERO OF QATAR' },
        { img: 'assets/squad/ksa-2-AlBuraikan.png', name: 'AL-BURAIKAN',   role: 'THE SPEARHEAD' },
        { img: 'assets/squad/ksa-3-AlFaraj.png',    name: 'AL-FARAJ',      role: 'CAPTAIN · CONDUCTOR' },
        { img: 'assets/squad/ksa-4-AlOwais.png',    name: 'AL-OWAIS',      role: 'THE KEEPER' },
        { img: 'assets/squad/ksa-5-AlShahrani.png', name: 'AL-SHAHRANI',   role: 'THE FLANK' },
      ]} />
      {/* line beats: 120 falcons, 128 Al-Dawsari, 138 Al-Buraikan/Al-Faraj, 148 spine */}
      <Sprite start={128.0} end={138.0}>
        <KenBurns src="assets/player-aldawsari.png" start={128} dur={10} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={128.4} name="SALEM AL-DAWSARI" role="Winger · Match-Winner" line="Beat Messi's Argentina with one of the great World Cup goals — two-one in Qatar." accent={MV.ksa} />
      </Sprite>
      <Sprite start={138.0} end={148.0}>
        <KenBurns src="assets/player-alburaikan.png" start={138} dur={10} from={1.04} to={1.16} panX={20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={138.4} name="AL-BURAIKAN · AL-FARAJ" role="Spearhead · Captain" line="A fearless No.9 and the captain who conducts everything from midfield." accent={MV.ksa} />
      </Sprite>
      <Sprite start={148.0} end={158.0}>
        <KenBurns src="assets/player-alowais.png" start={148} dur={10} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={148.3} name="THE SPINE OF QATAR" role="Al-Owais · Al-Shahrani" line="The keeper and the full-back from the night a giant fell. They have done it before." accent={MV.ksaDeep} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. Uruguay (158–194): La Celeste, the smallest giant ─────────────────────
function SceneUruguay() {
  const { localTime: lt } = useSprite();
  const S = 158.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a2540" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(91,154,213,0.26) 0%, transparent 30%, transparent 70%, rgba(16,36,63,0.4) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagURU w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>LA CELESTE · THE SMALLEST GIANT</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 9.0} accent={MV.uru} players={[
        { img: 'assets/squad/uru-1-Valverde.png',   name: 'VALVERDE',     role: 'THE ENGINE' },
        { img: 'assets/squad/uru-2-Nunez.png',      name: 'DARWIN NÚÑEZ', role: 'THE SPEARHEAD' },
        { img: 'assets/squad/uru-3-Araujo.png',     name: 'ARAÚJO',       role: 'STONE WALL' },
        { img: 'assets/squad/uru-4-Gimenez.png',    name: 'GIMÉNEZ',      role: 'STONE WALL' },
        { img: 'assets/squad/uru-5-Arrascaeta.png', name: 'ARRASCAETA',   role: 'THE ARTIST' },
      ]} />
      {/* line beats: 166 Valverde, 175 Nunez/Araujo/Gimenez, 185 Arrascaeta */}
      <Sprite start={166.0} end={175.0}>
        <KenBurns src="assets/player-valverde.png" start={166} dur={9} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={166.3} name="FEDERICO VALVERDE" role="Midfield · The Engine" line="A box-to-box engine who never, ever stops running — the heartbeat of this Uruguay." accent={MV.uru} />
      </Sprite>
      <Sprite start={175.0} end={185.0}>
        <KenBurns src="assets/player-nunez.png" start={175} dur={10} from={1.04} to={1.16} panX={-20} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={175.3} name="NÚÑEZ · ARAÚJO · GIMÉNEZ" role="Spearhead & Wall" line="Darwin raw and fearless up top; two centre-backs carved from stone behind." accent={MV.uru} />
      </Sprite>
      <Sprite start={185.0} end={194.0}>
        <KenBurns src="assets/player-arrascaeta.png" start={185} dur={9} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={185.3} name="DE ARRASCAETA" role="Playmaker · The Artist" line="The man who threads the pass nobody else can even see." accent={MV.uruGold} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (194–201): giant-killers vs smallest giant ───────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/player-aldawsari.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,108,53,0.40), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE GIANT-KILLERS
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>SAUDI ARABIA · THEY BEAT MESSI</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/player-valverde.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(91,154,213,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE SMALLEST GIANT
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>URUGUAY · 2 WORLD CUPS</div>
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
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (201–250): OUR PREDICTION 1-2 ─────────────────────────────
// Al-Dawsari curls Saudi ahead (1-0, ~201.5). Valverde→Nunez levels (1-1, ~221.5).
// De Arrascaeta free kick, Araujo heads in (1-2, ~231.5). Full-time = OUR PREDICTION.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 201.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <KenBurns src="assets/player-aldawsari.png" start={S} dur={20} from={1.1} to={1.26} panX={-30} dim={0.18} />
      <Sprite start={221} end={250}>
        <KenBurns src="assets/player-nunez.png" start={221} dur={11} from={1.08} to={1.2} panX={20} dim={0.16} />
      </Sprite>
      <Sprite start={231} end={244}>
        <KenBurns src="assets/player-araujo.png" start={231} dur={13} from={1.08} to={1.22} panX={-18} dim={0.16} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>

      <Sprite start={201} end={201.5}>
        <ScoreBug start={S + 0.1} ksa={0} uru={0} minute="1st half" />
      </Sprite>
      <GoalFlash at={S + 0.5} color={MV.ksa} />
      <Confetti start={S + 0.7} dur={12} colors={[MV.ksa, '#fff', MV.ksaDeep, MV.gold]} />
      <Sprite start={201.5} end={221}>
        <ScoreBug start={S + 0.5} ksa={1} uru={0} minute="AL-DAWSARI" />
      </Sprite>
      <GoalFlash at={S + 20.5} color={MV.uru} />
      <Confetti start={S + 20.7} dur={11} colors={[MV.uru, '#fff', MV.uruNavy, MV.uruGold]} />
      <Sprite start={221} end={231}>
        <ScoreBug start={S + 20.5} ksa={1} uru={1} minute="NÚÑEZ" />
      </Sprite>
      <GoalFlash at={S + 30.5} color={MV.uruGold} />
      <Confetti start={S + 30.7} dur={13} colors={[MV.uru, '#fff', MV.uruGold, MV.uruNavy]} />
      <Sprite start={231} end={244}>
        <ScoreBug start={S + 30.5} ksa={1} uru={2} minute="ARAÚJO" />
      </Sprite>

      <Sprite start={244} end={250}>
        <FullTimeCard start={S + 43.5} />
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
            <FlagKSA w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 32, color: MV.text }}>SAUDI ARABIA</span>
          </div>
          <BigTitle size={170} color={MV.gold}>1 — 2</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagURU w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>URUGUAY</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 34, maxWidth: 980 }}>
          Al-Dawsari struck first — but Núñez and Araújo answered. The smallest giant finds a way.
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (250–261): do you agree? GREEN FALCONS / CELESTE ──────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.2) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.6) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <PitchBackdrop tint="#0a2540" dim={0.45} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30} color={MV.text}>A giant-killer against the smallest giant</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.gold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(0,108,53,0.16)', border: `2px solid ${MV.ksa}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 440 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.ksa, letterSpacing: '0.06em' }}>“GREEN FALCONS”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Saudi Arabia shock another giant</div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(91,154,213,0.18)', border: `2px solid ${MV.uru}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 440 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.uru, letterSpacing: '0.06em' }}>“CELESTE”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Uruguay's class tells in the end</div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (261–280): Legend 019 — the Ghost of the Maracanã ──
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 261.0;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <KenBurns src="assets/player-araujo.png" start={S} dur={19} from={1.16} to={1.3} panY={-20}
        dim={0.32} style={{ filter: 'brightness(0.4) contrast(1.1) saturate(0.95) grayscale(0.35)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(91,154,213,0.16) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(242,193,78,0.12) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={19} count={46} color="200,215,235" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#bcd3ea">The Mystery Supporter · Legend No. 019</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(8,12,18,0.9)', border: '1px solid rgba(150,190,230,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, color: '#eef5fc', letterSpacing: '0.02em' }}>THE GHOST OF THE MARACANÃ</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#bcd3ea', letterSpacing: '0.14em', marginTop: 8, maxWidth: 800 }}>A BOY IN THAT CROWD IN 1950 — HE STILL CARRIES THE SILENCE THAT FOLLOWED GHIGGIA'S GOAL</div>
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

// ── 11. App promo (280–290): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 280.0;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'SAUDI ARABIA', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagKSA w={86} />, hot: true },
    { name: 'URUGUAY', coef: 'x2.10', pts: '+2.10', flag: <FlagURU w={86} />, hot: true },
    { name: 'BRAZIL', coef: 'x1.20', pts: '+0.00', flag: <div style={{ width: 86, height: 57, borderRadius: 6, background: 'linear-gradient(135deg,#159b46 55%,#ffd24a 55%)' }} /> },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #0d2a20 0%, #07090f 70%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 20%, rgba(16,107,79,0.35) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, opacity: inP }}>
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
      <AmbientParticles start={S} dur={10} count={28} color="91,154,213" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.uru}>The legends are only beginning</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent={MV.ksaDeep} x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent={MV.uruNavy} x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#106b4f" x={1400} />
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>🦅 THE SMALLEST GIANT PLAYS ON · worldcup26.world</span>
      </div>
    </div>
  );
}
