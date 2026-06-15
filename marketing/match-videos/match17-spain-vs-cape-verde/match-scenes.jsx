// match-scenes.jsx — the eleven scenes of the Match 17 video (300s timeline).
// Scene windows must match the SCENES table in match.html and narration.json.
// IMAGE-BASED: Ken-Burns motion on still PNGs. SOCCER ONLY — round-neck shirts,
// a pitch with goals, never gridiron (NO helmets/pads). REAL-RESULTS-ONLY: the
// 3-1 is OUR PREDICTION (and Cape Verde's "first goal" is part of OUR STORY).
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// ── 1. Cold open (0–20): ten volcanic islands · diaspora · the lighthouse ────
// narration: 0.8 "Ten volcanic islands... sent their sons to play for other flags"
//            13   "for the very first time, the islands play for themselves...
//                  a keeper is lighting his lamp"
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 0.9)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.0) / 1.4, 0, 1)) * (lt > 11.5 ? Math.max(0, (13.0 - lt) / 1.5) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 13.3) / 1.4, 0, 1));
  // a slow lighthouse beam sweeping the dark sea
  const beam = (Math.sin(lt * 0.7) + 1) / 2;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* Cape Verde captain as the symbol of the islands — dark, dramatic, blue cast */}
      <KenBurns src="assets/player-mendes.png" start={0} dur={20} from={1.18} to={1.34} panY={-28}
        dim={0.5} style={{ filter: 'brightness(0.40) contrast(1.18) saturate(1.05) grayscale(0.30)' }} />
      {/* ocean-deep base so the screen never reads as dead air (CPV blue) */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 82%, rgba(0,56,147,0.22) 0%, transparent 58%)` }} />
      {/* lighthouse beam sweep */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
        background: `linear-gradient(${90 + beam * 60}deg, transparent ${30 + beam * 20}%, rgba(249,214,22,0.10) ${48 + beam * 20}%, transparent ${64 + beam * 20}%)`,
      }} />
      {/* heartbeat glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,56,147,${(0.4 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#cfe0ff',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}>Ten volcanic islands. Half a million people. For sixty years they sent their sons to play for other people's flags.</div>
      )}
      <Vignette strength={0.85} />
      {lt > 13.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#cfe0ff">A true story</Kicker>
          <TitleReveal text="THE ISLANDS COME HOME" start={13.4} size={104} color={MV.cpv === '#003893' ? '#5b8dff' : MV.cpv} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (20–49) ────────────────────────────────────────────
// narration: 20 recap (SWE-TUN our prediction 1-1), 30 "Welcome back... episode
//   seventeen. Spain versus Cape Verde. Forty-seven million... against half a million",
//   41 "an island that was never supposed to score... scores"
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~9s carries the Ep16 recap line, then the Ep17 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (9.2 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 9.5) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.1) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 10.9) / 0.9, 0, 1));
  // "an island that scores" tease lands ~lt 21 (global ~41)
  const teaseP = Easing.easeOutBack(clamp((lt - 20.5) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (28.5 - lt) / 1.0));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(0,56,147,0.12) 0%, transparent 55%)` }} />
      <AmbientParticles start={20} dur={29} count={34} color="249,214,22" />
      {/* RECAP — OUR PREDICTION from Ep16 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>SWEDEN 1 — 1 TUNISIA</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}>Frost against fire — tonight, an empire against an island</div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 9.0 && lt < 19.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.esp}>WorldCup26 Legends · Episode 17</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagESP w={230} /></Waving>
              <BigTitle size={66} glow={MV.esp}>SPAIN</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagCPV w={230} /></Waving>
              <BigTitle size={66} glow="#5b8dff">CAPE VERDE</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP H · 47 MILLION vs HALF A MILLION · THE EMPIRE AND THE ISLAND
          </div>
        </div>
      )}
      {/* the tease: "an island that was never supposed to score... scores" */}
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(teaseP, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(teaseP,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.04em' }}>Stay with me — tonight, an island that was never supposed to score… scores</span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. History (49–94): the true Cape Verde story — diaspora + maiden World Cup ─
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
        boxShadow: '0 30px 110px rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', maxWidth: 1220,
      }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.34em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 100, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.06em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 900 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.cpvRed}`, color: MV.cpvRed, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 32, letterSpacing: '0.08em',
            background: 'rgba(7,9,15,0.85)',
          }}>{stamp}</div>
        )}
      </div>
    </div>
  );
}

function SceneHistory() {
  const S = 49.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <KenBurns src="assets/player-garry.png" start={S} dur={45} from={1.1} to={1.24} panX={-20}
        dim={0.72} style={{ filter: 'brightness(0.26) saturate(0.7) contrast(1.1) grayscale(0.2)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={45} count={28} color="0,56,147" maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color="#5b8dff">Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          THE ISLANDS THAT KEPT NO STARS
        </div>
      </div>
      {/* flag, always present */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        <FlagCPV w={120} />
      </div>
      {/* beats synced to narration (49, 61, 74, 84, 94) */}
      <HistoryPlate start={S + 0.5}  end={S + 12.0} year="TEN ISLANDS" venue="350 MILES OFF AFRICA" score="~525,000" note="Smaller than a single Spanish city — ten volcanic islands in the middle of the Atlantic." accent="#5b8dff" />
      <HistoryPlate start={S + 12.0} end={S + 25.0} year="THE DIASPORA" venue="A NURSERY FOR THE WORLD" score="LARSSON · NANI" note="Henrik Larsson lit up Sweden. Nani lifted trophies with Portugal. Gelson Martins, born on the islands, played for Lisbon." accent={MV.gold} />
      <HistoryPlate start={S + 25.0} end={S + 35.0} year="EVERYONE ELSE'S SHIRT" venue="THE BLOOD WAS CAPE VERDEAN" score="KEPT NONE" note="The islands gave the game its stars… and kept none of them." accent={MV.text} stamp="UNTIL NOW" />
      <HistoryPlate start={S + 35.0} end={S + 45.0} year="2026" venue="THEIR FIRST WORLD CUP · EVER" score="FINALLY HOME" note="The sons of the islands, finally home, finally in blue. And the team they meet first? The empire itself." accent="#5b8dff" />
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

// ── 4. Spain (94–142): the empire ────────────────────────────────────────────
// narration: 94 "the empire itself", 99 "Spain. Champions... most complete machine",
//   109 "Lamine Yamal. Eighteen... bathed by Messi", 121 "Rodri. 2024 Ballon d'Or",
//   132 "A team that does not lose. A teenager who does not fear..."
function SceneSpain() {
  const { localTime: lt } = useSprite();
  const S = 94.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#2a0a12" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(198,11,30,0.22) 0%, transparent 30%, transparent 70%, rgba(249,214,22,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagESP w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>LA ROJA · CHAMPIONS OF THE WORLD</span>
        </div>
      </div>
      {/* squad grid sits over the "Spain... most complete machine" line */}
      <SquadGrid start={S + 5.4} end={S + 14.5} accent={MV.esp} players={[
        { img: 'assets/squad/esp-1-Yamal.png',    name: 'LAMINE YAMAL',  role: 'THE PRODIGY' },
        { img: 'assets/squad/esp-2-Rodri.png',    name: 'RODRI',         role: 'BALLON D’OR' },
        { img: 'assets/squad/esp-3-Pedri.png',    name: 'PEDRI',         role: 'THE METRONOME' },
        { img: 'assets/squad/esp-4-Nico.png',     name: 'NICO WILLIAMS', role: 'THE WINGER' },
        { img: 'assets/squad/esp-5-Carvajal.png', name: 'DANI CARVAJAL', role: 'THE WARRIOR' },
      ]} />
      {/* line beats: 99 champions montage, 109 Yamal, 121 Rodri, 132 closing */}
      <Sprite start={109.0} end={121.0}>
        <KenBurns src="assets/player-yamal.png" start={109} dur={12} from={1.04} to={1.16} panX={18} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={109.4} name="LAMINE YAMAL" role="18 · Barcelona" line="Once photographed as a baby, bathed by Messi in a charity calendar — now the most dangerous teenager in the world." accent={MV.esp} />
      </Sprite>
      <Sprite start={121.0} end={132.0}>
        <KenBurns src="assets/player-rodri.png" start={121} dur={11} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={121.4} name="RODRI" role="2024 Ballon d'Or" line="The first defensive midfielder of the modern era to win the game's greatest prize. He anchors it all." accent={MV.espGold} />
      </Sprite>
      <Sprite start={132.0} end={142.0}>
        <KenBurns src="assets/player-yamal.png" start={132} dur={10} from={1.06} to={1.16} panX={-14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={132.3} name="THEY DO NOT LOSE" role="2010 World · 2024 Europe" line="A team that does not lose. A teenager who does not fear. But across from them stands a captain who has waited his whole life." accent={MV.espGold} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 5. Cape Verde (142–170): the islands' line-up ────────────────────────────
// narration: 142 "Ryan Mendes — the old leader... carried these islands for a decade",
//   152 "Garry Rodrigues and his trickery, a young defence that refuses to believe...",
//   162 "They did not cross the Atlantic to be a footnote."
function SceneCapeVerde() {
  const { localTime: lt } = useSprite();
  const S = 142.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a2348" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(0,56,147,0.26) 0%, transparent 30%, transparent 70%, rgba(207,32,39,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagCPV w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>OS TUBARÕES AZUIS · THE BLUE SHARKS</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 9.0} accent={MV.cpv} players={[
        { img: 'assets/squad/cpv-1-Mendes.png', name: 'RYAN MENDES',     role: 'CAPTAIN' },
        { img: 'assets/squad/cpv-2-Garry.png',  name: 'GARRY RODRIGUES', role: 'THE TRICKERY' },
        { img: 'assets/squad/cpv-3-Logan.png',  name: 'LOGAN COSTA',     role: 'THE DEFENCE' },
        { img: 'assets/squad/cpv-4-Jamiro.png', name: 'JAMIRO MONTEIRO', role: 'THE ENGINE' },
        { img: 'assets/squad/cpv-5-Lopes.png',  name: 'ROBERTO LOPES',   role: 'THE ROCK' },
      ]} />
      {/* line beats: 142 Ryan Mendes, 152 Garry + young defence, 162 not a footnote */}
      <Sprite start={142.0} end={152.0}>
        <KenBurns src="assets/player-mendes.png" start={142} dur={10} from={1.04} to={1.16} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={142.4} name="RYAN MENDES" role="Captain · The old leader" line="The man who carried these islands for over a decade — so that this very night could exist." accent={MV.cpv} />
      </Sprite>
      <Sprite start={152.0} end={162.0}>
        <KenBurns src="assets/player-garry.png" start={152} dur={10} from={1.04} to={1.16} panX={20} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={152.3} name="GARRY RODRIGUES" role="The Trickery" line="A young defence that refuses to believe small nations should be grateful just to be here." accent={MV.cpvRed} />
      </Sprite>
      <Sprite start={162.0} end={170.0}>
        <KenBurns src="assets/player-lopes.png" start={162} dur={8} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={162.3} name="NOT A FOOTNOTE" role="They crossed the Atlantic" line="They did not come to make up the numbers. They came to write their own chapter." accent={MV.cpv} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. The duel (170–189): empire vs island ──────────────────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/player-yamal.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(198,11,30,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE EMPIRE
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>SPAIN · THE BOY WHO FEARS NOTHING</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/player-mendes.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.15) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(0,56,147,0.42), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE ISLAND
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>CAPE VERDE · THE CAPTAIN WHO WAITED</div>
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
      {/* "Our prediction... and one goal sung about for a hundred years. Watch." (~180 → lt 10) */}
      <Sprite start={180.0} end={189.0}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 27, background: 'rgba(0,0,0,0.55)' }}>
          <BigTitle size={66} color={MV.text} style={{ maxWidth: 1450 }}>
            Our prediction — built on Spanish class, on island courage, and on one goal that will be sung about for a hundred years. Watch.
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 7. Match drama (189–247): OUR PREDICTION 3-1 ─────────────────────────────
// narration: 189 Yamal 1-0, 200 "a second... Two-nil", 209 "the moment. Garry
//   Rodrigues... swing of that left boot", 217 "the islands score... first goal
//   ever. Two-one", 228 "Spain answer late... three-one", 238 recap 3-1 our story.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 189.0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <KenBurns src="assets/player-yamal.png" start={S} dur={28} from={1.1} to={1.28} panX={-30} dim={0.18} />
      <Sprite start={209} end={228}>
        <KenBurns src="assets/player-garry.png" start={209} dur={19} from={1.08} to={1.24} panX={20} dim={0.16} />
      </Sprite>
      <Sprite start={228} end={247}>
        <KenBurns src="assets/player-yamal.png" start={228} dur={19} from={1.08} to={1.2} panX={-16} dim={0.18} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>

      {/* 0-0 until Yamal opens it ~197 */}
      <Sprite start={189.0} end={197.0}>
        <ScoreBug start={S + 0.4} esp={0} cpv={0} minute="1st half" />
      </Sprite>
      {/* Yamal 1-0 (~197) */}
      <GoalFlash at={S + 8.0} color={MV.esp} />
      <Confetti start={S + 8.2} dur={11} colors={[MV.esp, MV.gold, '#fff', MV.esp]} />
      <Sprite start={197.0} end={208}>
        <ScoreBug start={S + 8.0} esp={1} cpv={0} minute="YAMAL" />
      </Sprite>
      {/* Spain second 2-0 (~208) */}
      <GoalFlash at={S + 19.0} color={MV.espGold} />
      <Confetti start={S + 19.2} dur={9} colors={[MV.esp, MV.gold, '#fff', MV.esp]} />
      <Sprite start={208} end={219}>
        <ScoreBug start={S + 19.0} esp={2} cpv={0} minute="SPAIN" />
      </Sprite>
      {/* THE MOMENT — Garry Rodrigues 2-1 (~219), Cape Verde's HISTORIC first ever */}
      <GoalFlash at={S + 30.0} color={MV.cpv} />
      <Confetti start={S + 30.2} dur={13} count={120} colors={[MV.cpv, '#5b8dff', '#fff', MV.cpvRed]} />
      <Sprite start={219} end={233}>
        <ScoreBug start={S + 30.0} esp={2} cpv={1} minute="G. RODRIGUES" />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 196, textAlign: 'center', zIndex: 28 }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,56,147,0.82)', border: '2px solid #5b8dff', borderRadius: 999, padding: '14px 38px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', letterSpacing: '0.05em', boxShadow: '0 0 60px rgba(0,56,147,0.6)' }}>
            ⚓ CAPE VERDE'S FIRST WORLD CUP GOAL — EVER
          </div>
        </div>
      </Sprite>
      {/* Spain finish 3-1 (~233) */}
      <GoalFlash at={S + 44.0} color={MV.espGold} />
      <Sprite start={233} end={239}>
        <ScoreBug start={S + 44.0} esp={3} cpv={1} minute="SPAIN" />
      </Sprite>

      <Sprite start={239} end={247}>
        <FullTimeCard start={S + 50.0} />
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
            <FlagESP w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>SPAIN</span>
          </div>
          <BigTitle size={170} color={MV.gold}>3 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagCPV w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>CAPE VERDE</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 34, maxWidth: 1000 }}>
          The empire took the points — but the island left a mark that will never be erased: their very first World Cup goal.
        </div>
      </div>
    </div>
  );
}

// ── 8. Verdict (247–256): do you agree? EMPIRE / ISLAND ──────────────────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 247.0;
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.2) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.6) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <PitchBackdrop tint="#101a2a" dim={0.45} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30} color={MV.text}>The empire wins — but the island made history</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.gold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(198,11,30,0.14)', border: `2px solid ${MV.esp}`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: MV.esp, letterSpacing: '0.06em' }}>“EMPIRE”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Spain are simply too good</div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(0,56,147,0.2)', border: `2px solid #5b8dff`, borderRadius: 22, padding: '34px 60px', textAlign: 'center', minWidth: 420 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: '#5b8dff', letterSpacing: '0.06em' }}>“ISLAND”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Cape Verde's first goal is the moment of the round</div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 9. Mystery Supporter (256–273): Legend 017 — the Lighthouse Keeper ────────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 256.0;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 3.8) / 0.9, 0, 1));
  // a steady lighthouse pulse over the dark sea
  const beam = (Math.sin(lt * 0.9) + 1) / 2;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <KenBurns src="assets/player-mendes.png" start={S} dur={17} from={1.16} to={1.3} panY={-20}
        dim={0.32} style={{ filter: 'brightness(0.4) contrast(1.1) saturate(1.0) grayscale(0.3)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.55,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 70%, rgba(249,214,22,0.18) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(0,56,147,0.16) 0%, transparent 50%)`,
      }} />
      {/* sweeping beam from the keeper's lamp */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', opacity: 0.45,
        background: `linear-gradient(${80 + beam * 50}deg, transparent ${34 + beam * 16}%, rgba(249,214,22,0.16) ${50 + beam * 16}%, transparent ${66 + beam * 16}%)`,
      }} />
      <AmbientParticles start={S} dur={17} count={46} color="255,224,150" maxR={3.5} zIndex={23} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#f4c98a">The Mystery Supporter · Legend No. 017</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(14,12,8,0.9)', border: '1px solid rgba(255,200,120,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff3e2', letterSpacing: '0.02em' }}>THE LIGHTHOUSE KEEPER</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#f4c98a', letterSpacing: '0.16em', marginTop: 8, maxWidth: 780 }}>FOR SIXTY YEARS HE KEPT A LIGHT BURNING FOR THE SONS WHO SAILED AWAY — TONIGHT IT GUIDED THEM HOME</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 18, background: 'rgba(249,214,22,0.12)', border: '1px solid rgba(249,214,22,0.5)', borderRadius: 999, padding: '10px 24px' }}>
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

// ── 10. App promo (273–290): worldcup26.world ────────────────────────────────
function SceneApp() {
  const { localTime: lt } = useSprite();
  const S = 273.0;
  const inP = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const cards = [
    { name: 'SPAIN', coef: 'x1.25', pts: '+0.00', flag: <FlagESP w={86} /> },
    { name: 'CAPE VERDE', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagCPV w={86} />, hot: true },
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
                background: 'rgba(255,255,255,0.07)', border: `1px solid ${c.hot ? 'rgba(249,214,22,0.5)' : 'rgba(255,255,255,0.18)'}`, borderRadius: 22,
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

// ── 11. CTA outro (290–300) ──────────────────────────────────────────────────
function SceneCTA() {
  const { localTime: lt } = useSprite();
  const S = 290;
  const inP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07090f' }}>
      <PitchBackdrop tint="#0a2348" dim={0.55} />
      <AmbientParticles start={S} dur={10} count={28} color="0,56,147" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.esp}>The legends are only beginning</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#c60b1e" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#003893" x={960} />
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
        <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, color: MV.gold }}>⚓ THE ISLANDS PLAY ON · worldcup26.world</span>
      </div>
    </div>
  );
}
