// match-scenes.jsx — the twelve scenes of the Match 20 video (300s timeline).
// Scene windows must match the SCENES table in match.html and narration.json.
// IMAGE-BASED: Ken-Burns motion on still PNGs. SOCCER ONLY — round-neck shirts,
// a pitch with goals, never gridiron. REAL-RESULTS-ONLY: the 1-1 is OUR PREDICTION.
// NOTE: nested <Sprite> windows are GLOBAL seconds (Sprite reads the timeline clock).

// ── 1. Cold open (0–16): "never lost a single game" — the unbeaten hook ───────
function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const line1P = Easing.easeOutCubic(clamp((lt - 1.2) / 1.4, 0, 1)) * (lt > 10.5 ? Math.max(0, (12.0 - lt) / 1.5) : 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 12.3) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      {/* All Whites figure as the symbol of the unbeaten run (dark, dramatic) */}
      <KenBurns src="assets/player-wood.png" start={0} dur={16} from={1.18} to={1.32} panY={-30}
        dim={0.5} style={{ filter: 'brightness(0.44) contrast(1.18) saturate(1.0) grayscale(0.35)' }} />
      {/* silver base glow so the screen never reads as dead air */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 78%, rgba(200,212,228,0.16) 0%, transparent 55%)` }} />
      {/* heartbeat glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(220,230,240,${(0.45 * beat).toFixed(3)}) 0%, transparent 62%)` }} />
      {line1P > 0.01 && (
        <div style={{
          position: 'absolute', left: 160, right: 160, bottom: 200, textAlign: 'center', zIndex: 22,
          opacity: line1P,
          fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 46, color: '#eef2f7',
          letterSpacing: '0.04em', lineHeight: 1.25, textShadow: '0 4px 22px rgba(0,0,0,0.9)',
        }}>They faced the world champions, the runners-up, everyone — and never lost a single game.</div>
      )}
      <Vignette strength={0.85} />
      {lt > 12.3 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color="#dfe6ef">A true story</Kicker>
          <TitleReveal text="THE UNBEATEN" start={12.4} size={130} color={MV.nzl} />
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 2. Recap + title card (16–28) ────────────────────────────────────────────
function SceneTitle() {
  const { localTime: lt } = useSprite();
  // first ~10s carries the Ep19 recap line, then the Ep20 title settles
  const recapP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1)) * Math.max(0, Math.min(1, (10.5 - lt) / 1.0));
  const p1 = Easing.easeOutCubic(clamp((lt - 10.0) / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 10.6) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 11.4) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #0a0f1c 0%, #11182b 55%, #0a0f1c 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, rgba(206,17,38,0.10) 0%, transparent 55%)` }} />
      <AmbientParticles start={16} dur={12} count={34} color="220,230,240" />
      {/* RECAP — OUR PREDICTION from Ep19 (never stated as a real result) */}
      {recapP > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, opacity: recapP }}>
          <Kicker size={26} color={MV.muted}>Last time · our prediction</Kicker>
          <BigTitle size={62} color={MV.text} glow={MV.gold} style={{ maxWidth: 1500 }}>URUGUAY 2 — 1 SAUDI ARABIA</BigTitle>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.06em' }}>La Celeste edge the Green Falcons</div>
        </div>
      )}
      {/* TITLE CARD */}
      {lt >= 9.5 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}>
            <Kicker color={MV.irn}>WorldCup26 Legends · Episode 20</Kicker>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 70, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving><FlagIRN w={230} /></Waving>
              <BigTitle size={62} glow={MV.irn}>IRAN</BigTitle>
            </div>
            <BigTitle size={120} color={MV.gold}>VS</BigTitle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <Waving speed={1.9}><FlagNZL w={230} /></Waving>
              <BigTitle size={62} glow={MV.nzlSilver}>NEW ZEALAND</BigTitle>
            </div>
          </div>
          <div style={{ opacity: p3, transform: `translateY(${(1 - p3) * 26}px)`, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 32, color: MV.muted, letterSpacing: '0.08em' }}>
            GROUP G · TEAM MELLI vs THE ALL WHITES
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 3. Tease (28–46.5): two underdogs + "the strangest unbeaten run" ─────────
function SceneTease() {
  const { localTime: lt } = useSprite();
  const a = Easing.easeOutCubic(clamp((lt - 0.4) / 1.0, 0, 1));
  // second beat (~40 global → lt ~12): "the strangest unbeaten run in World Cup history"
  const b = Easing.easeOutBack(clamp((lt - 11.0) / 1.0, 0, 1)) * Math.max(0, Math.min(1, (18.5 - lt) / 1.0));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a' }}>
      <PitchBackdrop tint="#0a2233" dim={0.25} />
      <Vignette strength={0.5} />
      <AmbientParticles start={28} dur={18.5} count={26} color="220,230,240" />
      {/* two underdogs headline */}
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <Kicker size={28} color={MV.irn}>Two underdogs · everything to prove</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 74, color: MV.text, letterSpacing: '0.03em', marginTop: 18, textShadow: '0 4px 22px rgba(0,0,0,0.85)' }}>
          ONE KNOCKOUT TICKET
        </div>
      </div>
      {/* the tease */}
      {b > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: clamp(b, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(b,0,1)})` }}>
          <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '20px 52px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 30 }}>⚽</span>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.gold, letterSpacing: '0.04em' }}>The strangest unbeaten run in World Cup history</span>
          </div>
        </div>
      )}
      <Letterbox />
    </div>
  );
}

// ── 4. History (46.5–98): the real New Zealand 2010 unbeaten run ──────────────
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
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: MV.muted, letterSpacing: '0.34em' }}>{venue}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 116, color: accent, lineHeight: 1.05, margin: '14px 0 6px', textShadow: `0 0 60px ${accent}44` }}>{score}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 44, color: MV.text, letterSpacing: '0.06em' }}>{year}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 27, color: MV.muted, marginTop: 14, maxWidth: 880 }}>{note}</div>}
        {stamp && stampP > 0 && (
          <div style={{
            position: 'absolute', top: -34, right: -60, transform: `rotate(-12deg) scale(${stampP})`,
            border: `5px solid ${MV.nzlSilver}`, color: MV.nzlSilver, borderRadius: 14, padding: '10px 26px',
            fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 30, letterSpacing: '0.08em',
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
      <KenBurns src="assets/player-wood.png" start={S} dur={51.5} from={1.1} to={1.24} panX={-20}
        dim={0.72} style={{ filter: 'brightness(0.26) saturate(0.7) contrast(1.1) grayscale(0.25)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,6,10,0.82) 100%)' }} />
      <AmbientParticles start={S} dur={51.5} count={28} color="210,222,236" maxR={4} />
      {/* chapter header */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 26 }}>
        <Kicker size={28} color={MV.nzlSilver}>Chapter One · The True History</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 52, color: MV.text, letterSpacing: '0.04em', marginTop: 16, textShadow: '0 4px 22px rgba(0,0,0,0.8)' }}>
          SOUTH AFRICA · 2010
        </div>
      </div>
      {/* flag, always present */}
      <div style={{ position: 'absolute', bottom: 124, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: 0.95 }}>
        <FlagNZL w={120} />
      </div>
      {/* beats synced to narration (49, 61, 73, 85, 94) */}
      <HistoryPlate start={S + 0.5}  end={S + 14.5} year="RANKED NEAR THE BOTTOM" venue="THE ALL WHITES · 2010" score="THE OUTSIDERS" note="New Zealand arrived among the lowest-ranked teams of the whole tournament. Nobody gave them a prayer." accent={MV.nzlSilver} />
      <HistoryPlate start={S + 14.5} end={S + 26.5} year="vs SLOVAKIA" venue="GAME ONE · 93rd MINUTE" score="1 — 1" note="Losing in the dying seconds — Winston Reid rises and heads it home. New Zealand's first ever World Cup point." accent={MV.gold} />
      <HistoryPlate start={S + 26.5} end={S + 38.5} year="vs ITALY" venue="GAME TWO · THE WORLD CHAMPIONS" score="1 — 1" note="They scored first against the defending champions of the world — and held on. The tiny nation would not fall." accent={MV.irn} stamp="HELD ON" />
      <HistoryPlate start={S + 38.5} end={S + 47.5} year="vs PARAGUAY" venue="GAME THREE" score="0 — 0" note="Three games. Three draws. Not one defeat." accent={MV.text} />
      <HistoryPlate start={S + 47.5} end={S + 51.5} year="UNBEATEN — AND OUT" venue="THE ONLY TEAM THAT NEVER LOST" score="HOME UNBEATEN" note="The only side at the entire World Cup not to lose a match. And the champions, Italy? Eliminated, bottom of the group." accent={MV.nzl} />
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

// ── 5. Iran (98–134): Team Melli (opens with the France '98 history beat) ─────
function SceneIran() {
  const { localTime: lt } = useSprite();
  const S = 98.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#0a2e1a" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(206,17,38,0.20) 0%, transparent 30%, transparent 70%, rgba(35,159,64,0.16) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagIRN w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>TEAM MELLI · IRAN</span>
        </div>
      </div>
      {/* France '98 history beat (lt ~16–29 → global ~114–127) */}
      <Sprite start={113.0} end={127.0}>
        <HistoryPlate start={113.5} end={127.0} year="FRANCE · 1998" venue="LYON · A NIGHT HEAVY WITH POLITICS" score="2 — 1" note="Iran beat the United States two-one — their first ever win at a World Cup. Yet Team Melli have never once escaped the group." accent={MV.irn} stamp="FIRST WIN" />
      </Sprite>
      <SquadGrid start={S + 0.4} end={S + 14.5} accent={MV.irn} players={[
        { img: 'assets/squad/irn-1-Taremi.png',       name: 'MEHDI TAREMI',       role: 'THE TALISMAN' },
        { img: 'assets/squad/irn-2-Jahanbakhsh.png',  name: 'JAHANBAKHSH',         role: 'CAPTAIN' },
        { img: 'assets/squad/irn-3-Ghoddos.png',      name: 'SAMAN GHODDOS',       role: 'THE PLAYMAKER' },
        { img: 'assets/squad/irn-4-Ezatolahi.png',    name: 'EZATOLAHI',           role: 'THE SHIELD' },
        { img: 'assets/squad/irn-5-Ghaedi.png',       name: 'MEHDI GHAEDI',        role: 'THE SPARK' },
      ]} />
      {/* line beats: 127 ache → 136 Taremi (Taremi spills into NZ window; carry it here to 134) */}
      <Sprite start={127.0} end={134.0}>
        <KenBurns src="assets/player-taremi.png" start={127} dur={7} from={1.04} to={1.14} dim={0.18} style={{ zIndex: 10 }} />
        <LowerThird start={127.3} name="MEHDI TAREMI" role="Striker · The Iranian Ronaldo" line="Worked a gas station before football gave him a second life — now his nation's greatest scorer." accent={MV.irn} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 6. New Zealand (134–169.5): the All Whites ───────────────────────────────
function SceneNZ() {
  const { localTime: lt } = useSprite();
  const S = 134.0;
  const headerP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c14' }}>
      <PitchBackdrop tint="#11151c" dim={0.4} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 22, pointerEvents: 'none', background: `linear-gradient(90deg, rgba(31,31,31,0.34) 0%, transparent 30%, transparent 70%, rgba(233,237,242,0.12) 100%)` }} />
      <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: headerP, transform: `translateY(${(1 - headerP) * -24}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '16px 44px' }}>
          <FlagNZL w={74} />
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 40, color: MV.text, letterSpacing: '0.10em' }}>THE ALL WHITES · NEW ZEALAND</span>
        </div>
      </div>
      <SquadGrid start={S + 0.4} end={S + 10.0} accent={MV.nzlSilver} players={[
        { img: 'assets/squad/nzl-1-Wood.png',          name: 'CHRIS WOOD',        role: 'THE GIANT' },
        { img: 'assets/squad/nzl-2-Stamenic.png',     name: 'MARKO STAMENIC',     role: 'THE ENGINE' },
        { img: 'assets/squad/nzl-3-Cacace.png',       name: 'LIBERATO CACACE',    role: 'THE LEFT FLANK' },
        { img: 'assets/squad/nzl-4-Barbarouses.png',  name: 'BARBAROUSES',        role: 'THE VETERAN' },
        { img: 'assets/squad/nzl-5-Singh.png',        name: 'SARPREET SINGH',     role: 'THE CREATOR' },
      ]} />
      {/* line beats: 134 All Whites/Wood, 145 Wood spotlight, 154 Stamenic, 164 Cacace */}
      <Sprite start={145.0} end={154.0}>
        <KenBurns src="assets/player-wood.png" start={145} dur={9} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={145.3} name="CHRIS WOOD" role="Striker · The Giant" line="The Auckland boy who became New Zealand's greatest ever goalscorer." accent={MV.nzlSilver} />
      </Sprite>
      <Sprite start={154.0} end={164.0}>
        <KenBurns src="assets/player-stamenic.png" start={154} dur={10} from={1.04} to={1.16} panX={-20} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={154.3} name="MARKO STAMENIC" role="Midfield · The Engine" line="Drives the team forward — the heartbeat of a new generation of All Whites." accent={MV.nzlSilver} />
      </Sprite>
      <Sprite start={164.0} end={169.5}>
        <KenBurns src="assets/player-cacace.png" start={164} dur={5.5} from={1.04} to={1.14} dim={0.2} style={{ zIndex: 10 }} />
        <LowerThird start={164.3} name="CACACE · SINGH" role="The Width & The Vision" line="Cacace flies down the left, Singh threads the passes — hunting one more piece of history." accent={MV.nzlSilver} />
      </Sprite>
      <Vignette strength={0.42} />
      <Letterbox />
    </div>
  );
}

// ── 7. The duel (169.5–188.5): craft vs power ────────────────────────────────
function SceneDuel() {
  const { localTime: lt } = useSprite();
  const slideP = Easing.easeOutQuart(clamp(lt / 1.1, 0, 1));
  const vsP = Easing.easeOutBack(clamp((lt - 0.9) / 0.8, 0, 1));
  const shake = lt > 0.9 && lt < 1.25 ? Math.sin(lt * 160) * 7 * (1.25 - lt) / 0.35 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05060a', transform: `translate(${shake}px, ${-shake}px)` }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * -100}%)` }}>
        <img src="assets/player-taremi.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.12) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(206,17,38,0.34), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, left: 90, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE CRAFT
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>IRAN · TAREMI'S TOUCH</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', transform: `translateX(${(1 - slideP) * 100}%)` }}>
        <img src="assets/player-wood.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.05) brightness(0.92)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(31,31,31,0.5), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: 150, right: 90, textAlign: 'right', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>
          THE POWER
          <div style={{ fontSize: 27, fontWeight: 700, color: MV.gold, letterSpacing: '0.2em', marginTop: 8 }}>NEW ZEALAND · WOOD'S MENACE</div>
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
          <BigTitle size={68} color={MV.text} style={{ maxWidth: 1400 }}>
            Our prediction — built on two proud underdogs who hate to lose, with a knockout place on the line. Watch.
          </BigTitle>
        </div>
      </Sprite>
      <Letterbox />
    </div>
  );
}

// ── 8. Match drama (188.5–243.5): OUR PREDICTION 1-1 ─────────────────────────
// Ghoddos crosses, Taremi heads in (1-0, ~196.5). NZ respond. Cacace whips it
// in → Wood climbs and equalises (1-1, ~221). Full-time card = OUR PREDICTION.
function SceneDrama() {
  const { localTime: lt } = useSprite();
  const S = 188.5;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <KenBurns src="assets/player-taremi.png" start={S} dur={32} from={1.1} to={1.28} panX={-30} dim={0.18} />
      <Sprite start={211} end={233}>
        <KenBurns src="assets/player-wood.png" start={211} dur={22} from={1.08} to={1.24} panX={20} dim={0.16} />
      </Sprite>
      {/* OUR PREDICTION watermark — REAL-RESULTS-ONLY rule */}
      <div style={{ position: 'absolute', top: 116, left: 0, right: 0, textAlign: 'center', zIndex: 25 }}>
        <Kicker size={24} color={MV.gold}>Our Prediction · Our Story</Kicker>
      </div>

      <Sprite start={188.5} end={196.5}>
        <ScoreBug start={S + 0.4} irn={0} nzl={0} minute="1st half" />
      </Sprite>
      <GoalFlash at={S + 8.0} color={MV.irn} />
      <Confetti start={S + 8.2} dur={12} colors={[MV.irn, '#fff', MV.irnGreen, MV.gold]} />
      <Sprite start={196.5} end={211}>
        <ScoreBug start={S + 8.0} irn={1} nzl={0} minute="TAREMI" />
      </Sprite>
      <Sprite start={211} end={221}>
        <ScoreBug start={S + 22.5} irn={1} nzl={0} minute="2nd half" />
      </Sprite>
      <GoalFlash at={S + 32.5} color={MV.nzlSilver} />
      <Confetti start={S + 32.7} dur={11} colors={[MV.nzl, '#fff', MV.nzlSilver, '#00247d']} />
      <Sprite start={221} end={233}>
        <ScoreBug start={S + 32.5} irn={1} nzl={1} minute="WOOD" />
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
            <FlagIRN w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>IRAN</span>
          </div>
          <BigTitle size={170} color={MV.gold}>1 — 1</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <FlagNZL w={150} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 34, color: MV.text }}>NEW ZEALAND</span>
          </div>
        </div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, marginTop: 34, maxWidth: 980 }}>
          Taremi strikes, Wood answers — Team Melli's craft against the All Whites' refusal to lose.
        </div>
      </div>
    </div>
  );
}

// ── 9. Verdict (243.5–252.5): do you agree? TEAM MELLI / ALL WHITES ──────────
function SceneVerdict() {
  const { localTime: lt } = useSprite();
  const S = 243.5;
  const headP = Easing.easeOutCubic(clamp(lt / 0.8, 0, 1));
  const a = Easing.easeOutBack(clamp((lt - 1.2) / 0.7, 0, 1));
  const b = Easing.easeOutBack(clamp((lt - 1.6) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0f1c' }}>
      <PitchBackdrop tint="#10241a" dim={0.45} />
      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}>
        <Kicker size={30} color={MV.text}>Two underdogs, level — and nobody wants to go home</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: MV.gold, marginTop: 18, letterSpacing: '0.04em' }}>DO YOU AGREE?</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, zIndex: 26, marginTop: 60 }}>
        <div style={{ opacity: clamp(a, 0, 1), transform: `translateY(${(1 - a) * 50}px) scale(${0.85 + 0.15 * a})`, background: 'rgba(206,17,38,0.14)', border: `2px solid ${MV.irn}`, borderRadius: 22, padding: '34px 56px', textAlign: 'center', minWidth: 440 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, color: MV.irn, letterSpacing: '0.05em' }}>“TEAM MELLI”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if Iran finally break through</div>
        </div>
        <div style={{ opacity: clamp(b, 0, 1), transform: `translateY(${(1 - b) * 50}px) scale(${0.85 + 0.15 * b})`, background: 'rgba(233,237,242,0.10)', border: `2px solid ${MV.nzlSilver}`, borderRadius: 22, padding: '34px 56px', textAlign: 'center', minWidth: 440 }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 50, color: MV.nzl, letterSpacing: '0.05em' }}>“ALL WHITES”</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 26, color: MV.muted, marginTop: 12 }}>if New Zealand stay unbeaten again</div>
        </div>
      </div>
      <Vignette strength={0.5} />
      <Letterbox />
    </div>
  );
}

// ── 10. Mystery Supporter (252.5–272.5): Legend 020 — the Unbeaten ───────────
function SceneMystery() {
  const { localTime: lt } = useSprite();
  const S = 252.5;
  const inP = Easing.easeOutCubic(clamp((lt - 0.6) / 1.4, 0, 1));
  const plateP = Easing.easeOutBack(clamp((lt - 4.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#02030a' }}>
      <KenBurns src="assets/player-wood.png" start={S} dur={20} from={1.16} to={1.3} panY={-20}
        dim={0.32} style={{ filter: 'brightness(0.4) contrast(1.1) saturate(0.95) grayscale(0.3)' }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 21, pointerEvents: 'none', opacity: 0.5,
        background: `radial-gradient(ellipse at ${20 + Math.sin(lt * 0.3) * 14}% 75%, rgba(220,230,240,0.16) 0%, transparent 45%),` +
                    `radial-gradient(ellipse at ${78 - Math.sin(lt * 0.22) * 12}% 30%, rgba(206,17,38,0.12) 0%, transparent 50%)`,
      }} />
      <AmbientParticles start={S} dur={20} count={46} color="220,230,240" maxR={3.5} zIndex={22} />
      <div style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={26} color="#dbe4ee">The Mystery Supporter · Legend No. 020</Kicker>
      </div>
      {plateP > 0 && (
        <div style={{
          position: 'absolute', left: 110, bottom: 150, zIndex: 25,
          opacity: clamp(plateP, 0, 1), transform: `translateY(${(1 - plateP) * 50}px)`,
        }}>
          <div style={{ background: 'rgba(10,12,16,0.9)', border: '1px solid rgba(200,212,228,0.4)', borderRadius: 18, padding: '28px 44px', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#eef3f9', letterSpacing: '0.02em' }}>THE UNBEATEN</div>
            <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 24, color: '#c7d2df', letterSpacing: '0.14em', marginTop: 8, maxWidth: 800 }}>HE WAS IN SOUTH AFRICA IN 2010 — AND HAS NEVER SEEN HIS ALL WHITES LOSE AT A WORLD CUP</div>
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
    { name: 'IRAN', coef: 'x3.00', pts: 'UNDERDOG', flag: <FlagIRN w={86} />, hot: true },
    { name: 'NEW ZEALAND', coef: 'x3.50', pts: 'UNDERDOG', flag: <FlagNZL w={86} />, hot: true },
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
      <PitchBackdrop tint="#11151c" dim={0.55} />
      <AmbientParticles start={S} dur={10} count={28} color="220,230,240" />
      <div style={{ position: 'absolute', inset: 0, zIndex: 23, background: 'radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(7,9,15,0.88) 75%)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: inP }}>
        <Kicker size={30} color={MV.irn}>The legends are only beginning</Kicker>
        <div style={{ marginTop: 24 }}><TitleReveal text="JOIN THE LEGENDS" start={S + 0.5} size={86} color={MV.text} /></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 26 }}>
        <CtaButton start={S} delay={1.2} label="SUBSCRIBE" icon="🔔" accent="#ce1126" x={500} />
        <CtaButton start={S} delay={1.6} label="LIKE" icon="👍" accent="#1f1f1f" x={960} />
        <CtaButton start={S} delay={2.0} label="SHARE" icon="📣" accent="#239f40" x={1400} />
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
