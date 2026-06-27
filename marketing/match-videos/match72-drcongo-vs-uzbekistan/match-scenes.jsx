// match-scenes.jsx — Ep72 DR Congo vs Uzbekistan — PHOTOREAL + NO-REPEAT/NO-LOOP.
// "The Outsiders' Revolt" · Group K, two debutants. OUR PREDICTION COD 0–1 UZB
// (Shomurodov header 62' from Fayzullaev's cross — a thirty-year dam breaks).
// Mystic (#21): DR Congo = the Leopard / deepest river / rumba (cold-open motif);
// Uzbekistan = the White Wolf of Samarkand (Asena myth, the Registan) = Legend 072.
// #22 photoreal · #23 player name↔image SYNC (windows set in build_clips) ·
// #24 footer = REAL previous-5 mini-cards + animated phone "collect in the app".
// #10 short labels only · #19 full-frame · #20 15s mystic intro.

const COD_RED = '#ce1126', COD_YEL = '#f7d61e', COD_BLUE = '#0a7fe0';
const UZB_BLUE = '#1aa0c4', UZB_GREEN = '#1eb53a', UZB_RED = '#ce1126', UZB_WHITE = '#eef3f8';
const ACC = '#6fd6e0';           // silver-turquoise — the White Wolf / Samarkand accent
const GRADE = { filter: 'saturate(1.06) contrast(1.04)' };

function FlagCOD({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', background: '#3fa9f5', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ position: 'absolute', left: -w * 0.1, top: h * 0.55, width: w * 1.4, height: h * 0.22, background: COD_RED, border: `${h * 0.03}px solid ${COD_YEL}`, transform: 'rotate(-26deg)', transformOrigin: 'left center' }} />
      <div style={{ position: 'absolute', left: w * 0.1, top: h * 0.12, color: COD_YEL, fontSize: h * 0.3, lineHeight: 1 }}>★</div>
    </div>
  );
}
function FlagUZB({ w = 120 }) {
  const h = w * 2 / 3;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.05, position: 'relative', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}>
      <div style={{ height: '33.3%', background: '#0099b5' }} />
      <div style={{ height: '33.3%', background: '#fff' }} />
      <div style={{ height: '33.4%', background: UZB_GREEN }} />
      <div style={{ position: 'absolute', left: w * 0.08, top: h * 0.16, width: h * 0.2, height: h * 0.2, borderRadius: '50%', boxShadow: `inset ${h * 0.07}px 0 0 #fff`, background: '#0099b5' }} />
    </div>
  );
}

function FS({ id, style }) { return <ClipSprite id={id} fit="cover" style={{ ...GRADE, ...(style || {}) }} />; }
function NightField({ o = 0.6 }) {
  const { localTime: lt } = useSprite();
  const pulse = 0.5 + 0.5 * Math.sin(lt * 1.1);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 44%, #0c1626 0%, #070b14 65%, #05060c 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 42%, rgba(111,214,224,${(0.14 * pulse * o).toFixed(3)}) 0%, transparent 55%)` }} />
    </div>
  );
}

function ScoreBug({ start, cod = 0, uzb = 0, minute, badge = 'OUR PREDICTION', note }) {
  const t = useTime(); const local = t - start; if (local < 0) return null;
  const inP = Easing.easeOutBack(clamp(local / 0.7, 0, 1));
  const cell = { fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: '#fff', padding: '10px 18px' };
  return (
    <div style={{ position: 'absolute', top: 92, left: '50%', zIndex: 30, transform: `translateX(-50%) scale(${inP})`, opacity: clamp(inP, 0, 1), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 14, boxShadow: '0 10px 36px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ ...cell, background: COD_RED }}>COD</div>
        <div style={{ ...cell, fontSize: 38, color: ACC }}>{cod} — {uzb}</div>
        <div style={{ ...cell, background: UZB_BLUE }}>UZB</div>
        {minute && <div style={{ ...cell, fontSize: 26, color: MV.muted, borderLeft: `1px solid ${MV.line}` }}>{minute}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 16, color: ACC, letterSpacing: '0.22em', background: 'rgba(111,214,224,0.14)', border: '1px solid rgba(111,214,224,0.5)', borderRadius: 999, padding: '4px 16px' }}>{badge}</div>
        {note && <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '0.18em', background: UZB_BLUE, border: `1px solid ${UZB_BLUE}`, borderRadius: 999, padding: '4px 16px' }}>{note}</div>}
      </div>
    </div>
  );
}

function ChanceTag({ start, end, text, sub, accent }) {
  const t = useTime(); if (t < start || t > end) return null;
  const p = Easing.easeOutBack(clamp((t - start) / 0.5, 0, 1));
  const fade = t > end - 0.4 ? clamp((end - t) / 0.4, 0, 1) : 1;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, textAlign: 'center', zIndex: 26, opacity: fade, transform: `scale(${p})` }}>
      <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>{text}
        {sub && <div style={{ fontSize: 24, fontWeight: 700, color: accent || ACC, letterSpacing: '0.2em', marginTop: 8 }}>{sub}</div>}
      </div>
    </div>
  );
}

function PlayerShowcase({ clipId, name, role, accent, start, end }) {
  const t = useTime(); if (t < start || t > end) return null;
  const inP = Easing.easeOutCubic(clamp((t - start) / 0.4, 0, 1));
  const fade = t > end - 0.3 ? clamp((end - t) / 0.3, 0, 1) : 1;
  const slide = (1 - inP) * 60;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 12, opacity: fade }}>
      <ClipSprite id={clipId} fit="cover" style={GRADE} />
      {/* stronger lower-third scrim also buries any background ad hoardings (monetization rule #1) */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.24) 0%, transparent 18%, transparent 38%, rgba(2,3,8,0.90) 74%, rgba(2,3,8,0.97) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: accent, boxShadow: `0 0 30px ${accent}` }} />
      <div style={{ position: 'absolute', left: 80, bottom: 120, transform: `translateX(${-slide}px)`, opacity: inP }}>
        <div style={{ display: 'inline-block', background: accent, color: '#06121a', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '0.2em', padding: '6px 18px', borderRadius: 6, marginBottom: 14 }}>{role}</div>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 72, color: '#fff', letterSpacing: '0.01em', lineHeight: 1, textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>{name}</div>
      </div>
    </div>
  );
}

function TeamBanner({ flag, label, accent }) {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 26, opacity: p, transform: `translateY(${(1 - p) * -20}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 999, padding: '14px 40px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        {flag}<span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: '0.10em' }}>{label}</span>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: accent, boxShadow: `0 0 16px ${accent}` }} />
      </div>
    </div>
  );
}
function Backdrop() { return <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 50% 45%, #0c0f1c 0%, #05060c 100%)' }} />; }

function SceneColdOpen() {
  const { localTime: lt } = useSprite();
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.1)), 8);
  const teaseP = clamp((lt - 6.5) / 0.8, 0, 1) * clamp((15.0 - lt) / 0.6, 0, 1);
  const titleP = Easing.easeOutCubic(clamp((lt - 19.2) / 1.4, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="cod-leopard" /><FS id="uzb-wolf" /><FS id="cod-kinshasa" /><FS id="uzb-registan" />
      {lt >= 20 && <NightField o={0.9} />}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(111,214,224,${(0.20 * beat).toFixed(3)}) 0%, transparent 60%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.34) 0%, transparent 30%, transparent 58%, rgba(2,3,8,0.72) 100%)' }} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', zIndex: 23, opacity: teaseP }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#bfe9ef', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.85)' }}>WHO DECIDED THEY WERE SMALL?</div>
        </div>
      )}
      {lt > 19.2 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: titleP, zIndex: 22 }}>
          <Kicker size={32} color={ACC}>The Warm-Up Act Revolts</Kicker>
          <TitleReveal text="THE OUTSIDERS" start={20.0} size={100} color={ACC} />
        </div>
      )}
    </div>
  );
}

function SceneTitle() {
  const { localTime: lt } = useSprite();
  const p1 = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  const p2 = Easing.easeOutBack(clamp((lt - 0.8) / 1.0, 0, 1));
  const p3 = Easing.easeOutCubic(clamp((lt - 1.7) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={1} />
      <AmbientParticles start={23.0} dur={10} count={32} color="111,214,224" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 38 }}>
        <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * -30}px)` }}><Kicker>WorldCup26 Legends · Episode 72</Kicker></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 56, opacity: clamp(p2, 0, 1), transform: `scale(${p2})` }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving><FlagCOD w={210} /></Waving><BigTitle size={62} glow={COD_RED}>DR CONGO</BigTitle></div>
          <BigTitle size={108} color={ACC}>VS</BigTitle>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}><Waving speed={1.9}><FlagUZB w={210} /></Waving><BigTitle size={58} glow={UZB_BLUE}>UZBEKISTAN</BigTitle></div>
        </div>
        <div style={{ opacity: p3, fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 30, color: MV.muted, letterSpacing: '0.10em' }}>GROUP K · THE REVOLT</div>
      </div>
    </div>
  );
}

function SceneStadium() {
  const { localTime: lt } = useSprite();
  const stripP = Easing.easeOutCubic(clamp((lt - 1.2) / 0.9, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FS id="pitch-walkout" /><FS id="stadium-wide" />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(2,3,8,0.8) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: stripP, transform: `translateY(${(1 - stripP) * 30}px)` }}>
        <div style={{ display: 'flex', background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 16, overflow: 'hidden', backdropFilter: 'blur(6px)' }}>
          {[['GROUP K', 'THE REVOLT'], ['LÉOPARDS', 'vs WHITE WOLVES'], ['DEBUT', 'BOTH NATIONS'], ['48 TEAMS', 'AN INVITATION']].map(([v, l], i) => (
            <div key={i} style={{ padding: '22px 34px', borderLeft: i ? `1px solid ${MV.line}` : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 28, color: ACC }}>{v}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 15, color: MV.muted, letterSpacing: '0.12em', marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneCongo() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={44} end={49}><div style={{ position: 'absolute', inset: 0 }}><FS id="cod-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagCOD w={64} />} label="LES LÉOPARDS · DR CONGO" accent={COD_RED} /></div></Sprite>
      <Sprite start={49} end={55}><div style={{ position: 'absolute', inset: 0 }}><FS id="cod-tifo" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,8,0.32)' }} /></div></Sprite>
      <PlayerShowcase clipId="s-wissa" name="YOANE WISSA" role="THE LEADER · 11" accent={COD_RED} start={55.0} end={60.0} />
      <Sprite start={60.0} end={62.6}><div style={{ position: 'absolute', inset: 0 }}><FS id="cod-attack" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(206,17,38,0.30), transparent 55%)' }} /></div></Sprite>
      <PlayerShowcase clipId="s-silas" name="SILAS" role="THE SPEED" accent={COD_YEL} start={62.6} end={65.5} />
      <PlayerShowcase clipId="s-bakambu" name="CEDRIC BAKAMBU" role="THE POACHER" accent={COD_RED} start={65.5} end={67.2} />
      <PlayerShowcase clipId="s-wanbissaka" name="WAN-BISSAKA" role="THE TACKLE" accent={COD_BLUE} start={67.2} end={70.0} />
      <PlayerShowcase clipId="s-mbemba" name="CHANCEL MBEMBA" role="THE ROCK · CAPTAIN" accent={COD_RED} start={70.0} end={75.0} />
      <Sprite start={75.0} end={79.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="cod-defend" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,8,0.3)' }} /></div></Sprite>
    </div>
  );
}

function SceneUzbek() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={79.5} end={84.5}><div style={{ position: 'absolute', inset: 0 }}><FS id="uzb-crowd" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.30) 0%, transparent 40%, rgba(2,3,8,0.55) 100%)' }} /><TeamBanner flag={<FlagUZB w={64} />} label="WHITE WOLVES · UZBEKISTAN" accent={UZB_BLUE} /></div></Sprite>
      <Sprite start={84.5} end={90.6}><div style={{ position: 'absolute', inset: 0 }}><FS id="uzb-tifo" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,8,0.32)' }} /></div></Sprite>
      <PlayerShowcase clipId="s-fayzullaev" name="FAYZULLAEV" role="THE CREATOR · 10" accent={UZB_BLUE} start={90.6} end={96.0} />
      <PlayerShowcase clipId="s-shomurodov" name="SHOMURODOV" role="THE SPEARHEAD" accent={UZB_GREEN} start={96.0} end={98.1} />
      <PlayerShowcase clipId="s-masharipov" name="MASHARIPOV" role="THE CREATOR" accent={UZB_BLUE} start={98.1} end={99.5} />
      <PlayerShowcase clipId="s-khamdamov" name="KHAMDAMOV" role="THE SPARK" accent={UZB_GREEN} start={99.5} end={103.0} />
      <PlayerShowcase clipId="s-khusanov" name="ABDUKODIR KHUSANOV" role="THE WALL OF TASHKENT" accent={UZB_BLUE} start={103.0} end={108.0} />
      <Sprite start={108.0} end={113.0}><div style={{ position: 'absolute', inset: 0 }}><FS id="uzb-cross-build" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,8,0.3)' }} /></div></Sprite>
    </div>
  );
}

function SceneRevolt() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={113} end={118}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-mid" /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: '#fff', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>TWO OUTSIDERS</div></div></Sprite>
      <Sprite start={118} end={123}><div style={{ position: 'absolute', inset: 0 }}><FS id="duel-wing" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(26,160,196,0.30), transparent 55%)' }} /></div></Sprite>
      <Sprite start={123} end={132}><div style={{ position: 'absolute', inset: 0 }}><FS id="stadium-aerial" /><div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(2,3,8,0.6) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 48, color: ACC, letterSpacing: '0.14em', textShadow: '0 4px 26px rgba(0,0,0,0.9)' }}>REFUSING THE SCRIPT</div></div></Sprite>
    </div>
  );
}

function PredictionCard({ start }) {
  const t = useTime(); const local = t - start;
  const p = Easing.easeOutCubic(clamp(local / 1.0, 0, 1));
  const stampP = Easing.easeOutBack(clamp((local - 1.0) / 0.6, 0, 1));
  const sheenX = ((local * 26) % 160) - 30;
  const Badge = ({ flag, name, accent }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ padding: 9, borderRadius: '50%', background: `conic-gradient(${accent}, #ffffffaa, ${accent}, #ffffff55, ${accent})`, boxShadow: `0 10px 34px rgba(0,0,0,0.55), 0 0 26px ${accent}66` }}>
        <div style={{ width: 124, height: 124, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b14', border: '3px solid rgba(255,255,255,0.9)' }}>{flag}</div>
      </div>
      <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 25, color: '#fff', letterSpacing: '0.03em' }}>{name}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,3,6,0.62)', opacity: p }}>
      <div style={{ width: 1010, borderRadius: 28, overflow: 'hidden', transform: `scale(${0.92 + 0.08 * p})`, boxShadow: '0 36px 130px rgba(0,0,0,0.8)', position: 'relative', border: '2px solid rgba(111,214,224,0.55)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${COD_RED}30 0%, #070b14 38%, #070b14 62%, ${UZB_BLUE}33 100%)` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-18deg)', pointerEvents: 'none', zIndex: 5 }} />
        <div style={{ position: 'relative', zIndex: 2, background: `linear-gradient(100deg, ${COD_RED} 0%, #11151f 50%, ${UZB_BLUE} 100%)`, padding: '13px 0', textAlign: 'center' }}>
          <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.30em', color: '#fff' }}>WORLDCUP26 LEGENDS · OUR PREDICTION · NOT PLAYED</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, padding: '40px 70px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
            <Badge flag={<FlagCOD w={104} />} name="DR CONGO" accent={COD_RED} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 132, color: '#fff', lineHeight: 1 }}>
                <span style={{ textShadow: `0 0 36px ${COD_RED}99` }}>0</span>
                <span style={{ color: ACC, fontSize: 64, transform: 'translateY(-6px)' }}>—</span>
                <span style={{ textShadow: `0 0 36px ${UZB_BLUE}cc` }}>1</span>
              </div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 17, color: MV.muted, letterSpacing: '0.34em', marginTop: 4 }}>FULL-TIME</div>
            </div>
            <Badge flag={<FlagUZB w={104} />} name="UZBEKISTAN" accent={UZB_BLUE} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 26, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 21, color: '#cdeef4', background: 'rgba(26,160,196,0.18)', border: '1px solid rgba(111,214,224,0.45)', borderRadius: 999, padding: '7px 18px' }}>⚽ 62' SHOMURODOV (HEADER)</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 22, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 23, color: ACC, letterSpacing: '0.16em' }}>★ THE OUTSIDERS STOLE THE SHOW ★</div>
          <div style={{ textAlign: 'center', marginTop: 6, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 16, color: MV.muted, letterSpacing: '0.2em' }}>worldcup26.world</div>
        </div>
        {stampP > 0 && <div style={{ position: 'absolute', top: 70, right: -6, zIndex: 6, transform: `rotate(-12deg) scale(${stampP})`, border: `4px solid ${ACC}`, color: ACC, borderRadius: 12, padding: '8px 22px', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '0.14em', background: 'rgba(7,9,15,0.92)' }}>OUR STORY</div>}
      </div>
    </div>
  );
}

function SceneDrama() {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Backdrop />
      <Sprite start={132} end={137}><FS id="cod-chance" /></Sprite>
      <Sprite start={137} end={142}><FS id="keeper-save" /></Sprite>
      <Sprite start={142} end={152.21}><div style={{ position: 'absolute', inset: 0 }}><NightField o={0.7} /><AmbientParticles start={142} dur={10} count={24} color="111,214,224" /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.04em', textAlign: 'center', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>TRADING BLOWS<div style={{ fontSize: 26, fontWeight: 700, color: ACC, letterSpacing: '0.22em', marginTop: 12 }}>NEITHER WILL BLINK</div></div></div></div></Sprite>
      <Sprite start={152.21} end={159}><div style={{ position: 'absolute', inset: 0 }}><FS id="goal-fayzullaev-cross" /><ChanceTag start={152.6} end={159} text="62' — FAYZULLAEV" sub="THE CROSS" accent="#bfe9ef" /></div></Sprite>
      <Sprite start={159} end={164.37}><div style={{ position: 'absolute', inset: 0 }}><NightField o={0.7} /><AmbientParticles start={159} dur={5} count={18} color="111,214,224" /><div style={{ position: 'absolute', left: 0, right: 0, top: '42%', textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 80, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>THE NEAR POST</div></div></Sprite>
      <GoalFlash at={166.5} />
      <Sprite start={164.37} end={172}><div style={{ position: 'absolute', inset: 0 }}><FS id="goal-shomurodov" /><ChanceTag start={166.8} end={172} text="GOAL!" sub="SHOMURODOV · 62'" accent={ACC} /></div></Sprite>
      <Sprite start={172} end={203.32}><ScoreBug start={172.4} cod={0} uzb={1} minute="62'" badge="OUR PREDICTION" note="SHOMURODOV" /></Sprite>
      <Sprite start={178.46} end={194}><div style={{ position: 'absolute', inset: 0 }}><NightField o={0.6} /><AmbientParticles start={178.46} dur={15} count={26} color="111,214,224" /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 60, color: ACC, letterSpacing: '0.05em', textAlign: 'center', textShadow: '0 4px 30px rgba(0,0,0,0.9)' }}>NOT A DILUTION —<br />AN INVITATION</div></div></div></Sprite>
      <Sprite start={194} end={203.32}><PredictionCard start={194.6} /></Sprite>
      <Vignette strength={0.32} />
    </div>
  );
}

function SceneVerdict() {
  const t = useTime();
  const panelP = Easing.easeOutCubic(clamp((t - 219.0) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={203.32} end={208.32}><div style={{ position: 'absolute', inset: 0 }}><FS id="vd-handshake" /><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.25) 0%, transparent 45%, rgba(2,3,8,0.55) 100%)' }} /><div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', zIndex: 24 }}><Kicker size={28} color={ACC}>Full Time · Our Prediction</Kicker></div></div></Sprite>
      <Sprite start={208.32} end={213.32}><FS id="vd-applaud" /></Sprite>
      <Sprite start={213.32} end={218.32}><FS id="vd-stadium-night" /></Sprite>
      <Sprite start={218.32} end={244}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <NightField o={0.7} />
          <AmbientParticles start={218.32} dur={25.7} count={26} color="111,214,224" />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
            <div style={{ background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 24, padding: '48px 80px', minWidth: 900, backdropFilter: 'blur(6px)', opacity: panelP, transform: `translateY(${(1 - panelP) * 24}px)` }}>
              <Kicker size={26}>Group K · Our Prediction</Kicker>
              <div style={{ marginTop: 24 }}>
                <StatLine start={219.5} delay={0.0} label="DR CONGO" value="LES LÉOPARDS" accent={COD_RED} />
                <StatLine start={219.5} delay={0.25} label="UZBEKISTAN" value="THE WHITE WOLVES" accent={UZB_BLUE} />
                <StatLine start={219.5} delay={0.5} label="OUR PREDICTION" value="COD 0 — 1 UZB" accent="#fff" />
                <StatLine start={219.5} delay={0.75} label="62' SHOMURODOV" value="THE WARM-UP ACT STOLE THE SHOW" accent={ACC} />
              </div>
            </div>
          </div>
        </div>
      </Sprite>
      <Vignette strength={0.42} />
    </div>
  );
}

function SceneEngage() {
  const { localTime: lt } = useSprite();
  const headP = Easing.easeOutCubic(clamp(lt / 0.9, 0, 1));
  const cards = [
    { label: 'COMMENT CONGO', sub: 'LES LÉOPARDS', flag: <FlagCOD w={76} />, accent: COD_RED },
    { label: 'COMMENT UZBEKISTAN', sub: 'WHITE WOLVES', flag: <FlagUZB w={76} />, accent: UZB_BLUE },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={244} end={249}><FS id="crowd-tense" /></Sprite>
      {lt >= 5 && <NightField o={0.5} />}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,18,0.58)' }} />
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: headP }}><Kicker size={30}>Who Wins The Revolt?</Kicker></div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, zIndex: 25 }}>
        {cards.map((c, i) => {
          const cp = Easing.easeOutBack(clamp((lt - 0.8 - i * 0.4) / 0.7, 0, 1));
          return (
            <div key={i} style={{ transform: `translateY(${(1 - cp) * 60}px) scale(${0.85 + 0.15 * cp})`, opacity: clamp(cp, 0, 1), background: MV.panel, border: `1px solid ${MV.line}`, borderRadius: 22, padding: '38px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, minWidth: 360, boxShadow: '0 24px 70px rgba(0,0,0,0.5)', borderTop: `5px solid ${c.accent}` }}>
              {c.flag}
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 26, color: '#fff' }}>{c.label}</div>
              <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 20, color: MV.muted, letterSpacing: '0.16em' }}>{c.sub}</div>
            </div>
          );
        })}
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}

function MiniStrip() {
  const prev = ['mini-067', 'mini-068', 'mini-069', 'mini-070', 'mini-071'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {prev.map((id) => (
        <div key={id} style={{ width: 64, height: 86, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', opacity: 0.82 }}>
          <ImageSprite src={`assets/${id}.png`} fit="cover" style={{ width: '100%', height: '100%' }} />
        </div>
      ))}
      <div style={{ width: 78, height: 104, borderRadius: 9, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 10px 28px rgba(0,0,0,0.6), 0 0 26px ${ACC}66` }}>
        <ImageSprite src="assets/legend-072-portrait.png" fit="cover" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

function SceneMystery() {
  const { localTime: lt } = useSprite();
  const teaseP = clamp((lt - 0.3) / 0.5, 0, 1) * clamp((2.4 - lt) / 0.5, 0, 1);
  const cardP = Easing.easeOutBack(clamp((lt - 2.0) / 1.1, 0, 1));
  const tilt = Math.sin(lt * 0.7) * 4;
  const sheenX = ((lt * 26) % 200) - 50;
  const glow = 0.5 + 0.5 * Math.sin(lt * 1.3);
  const txtP = Easing.easeOutCubic(clamp((lt - 3.2) / 1.0, 0, 1));
  const stripP = Easing.easeOutCubic(clamp((lt - 4.6) / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 46%, #14304a 0%, #0a1826 50%, #060a12 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 44%, rgba(111,214,224,${(0.30 * glow).toFixed(3)}) 0%, transparent 55%)` }} />
      <AmbientParticles start={255} dur={26} count={56} color="150,220,235" maxR={4.2} />
      {teaseP > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', opacity: teaseP, zIndex: 20 }}>
          <div style={{ display: 'inline-block', fontFamily: '"Inter",sans-serif', fontWeight: 800, fontSize: 30, color: '#cdeef4', letterSpacing: '0.24em', textShadow: '0 2px 18px rgba(0,0,0,0.7)' }}>THE ONE WHO LEADS THE LOST HOME</div>
        </div>
      )}
      {lt > 1.6 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 22, opacity: clamp(cardP, 0, 1) }}>
          <div style={{ position: 'relative', transform: `perspective(1500px) rotateY(${tilt}deg) scale(${0.92 + 0.08 * Math.min(cardP, 1)})`, marginTop: -34 }}>
            <img data-seq src="assets/legend-072-portrait.png" alt="" style={{ height: 640, display: 'block', borderRadius: 16, boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 80px rgba(111,214,224,0.45)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sheenX}%`, width: '22%', background: 'linear-gradient(105deg, transparent, rgba(200,240,250,0.30), transparent)', transform: 'skewX(-18deg)', borderRadius: 16, pointerEvents: 'none', zIndex: 6 }} />
            <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', background: 'rgba(111,214,224,0.95)', color: '#06121a', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 17, letterSpacing: '0.14em', padding: '5px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>Nº 072 · ✦✦✦ ULTRA RARE</div>
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 24 }}>
        <div style={{ textAlign: 'center', opacity: txtP, transform: `translateY(${(1 - txtP) * 16}px)` }}>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 46, color: ACC, letterSpacing: '0.04em', textShadow: '0 2px 24px rgba(111,214,224,0.5)' }}>THE WHITE WOLF OF SAMARKAND</div>
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 19, color: '#bfe1ea', letterSpacing: '0.18em', marginTop: 6 }}>UZBEKISTAN · LEGEND 072</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: stripP }}>
          <MiniStrip />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: '0.2em' }}>COLLECT THEM ALL</div>
        </div>
      </div>
    </div>
  );
}

function PhoneCollect({ start }) {
  const { localTime: lt } = useSprite();
  const local = lt - start;
  const inP = Easing.easeOutCubic(clamp(local / 0.8, 0, 1));
  const fly = Easing.easeInOutCubic(clamp((local - 1.2) / 1.6, 0, 1));
  const snapped = local > 2.8;
  const flash = snapped ? Math.max(0, 1 - (local - 2.8) * 1.6) : 0;
  const filled = ['mini-068', 'mini-069', 'mini-070', 'mini-071'];
  const cardX = -360 + fly * 360, cardY = -40 + fly * 150, cardS = 1 - fly * 0.62;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 26, opacity: inP }}>
      <div style={{ position: 'relative', width: 300, height: 600, borderRadius: 40, background: 'linear-gradient(160deg,#23262e,#0c0e13)', border: '3px solid #2b2f38', boxShadow: '0 40px 110px rgba(0,0,0,0.8), 0 0 50px rgba(111,214,224,0.25)', padding: 12 }}>
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 90, height: 8, borderRadius: 6, background: '#05070b' }} />
        <div style={{ width: '100%', height: '100%', borderRadius: 30, background: 'radial-gradient(ellipse at 50% 20%, #102234 0%, #070d16 70%)', overflow: 'hidden', position: 'relative', padding: '34px 18px 18px' }}>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 15, color: ACC, letterSpacing: '0.18em' }}>MY LEGENDS</div>
          <div style={{ textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 10, color: '#7fa0b4', letterSpacing: '0.1em', marginTop: 2, marginBottom: 14 }}>worldcup26.world</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {filled.map((id) => (
              <div key={id} style={{ aspectRatio: '3/4', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.16)' }}>
                <ImageSprite src={`assets/${id}.png`} fit="cover" style={{ width: '100%', height: '100%' }} />
              </div>
            ))}
            <div style={{ aspectRatio: '3/4', borderRadius: 6, overflow: 'hidden', border: snapped ? `2px solid ${ACC}` : '1px dashed rgba(111,214,224,0.6)', position: 'relative', boxShadow: flash > 0 ? `0 0 ${20 * flash}px ${ACC}` : 'none' }}>
              {snapped && <ImageSprite src="assets/legend-072-portrait.png" fit="cover" style={{ width: '100%', height: '100%' }} />}
              {flash > 0 && <div style={{ position: 'absolute', inset: 0, background: ACC, opacity: flash * 0.6 }} />}
            </div>
            <div style={{ aspectRatio: '3/4', borderRadius: 6, border: '1px dashed rgba(255,255,255,0.14)' }} />
          </div>
          {snapped && local < 4.4 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 16, color: ACC, letterSpacing: '0.16em', opacity: clamp(1 - (local - 3.6), 0, 1) }}>COLLECTED!</div>}
        </div>
      </div>
      {!snapped && local > 0.4 && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) translate(${cardX}px, ${cardY}px) scale(${cardS})`, width: 200, height: 267, borderRadius: 12, overflow: 'hidden', border: `2px solid ${ACC}`, boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${ACC}88`, zIndex: 30 }}>
          <ImageSprite src="assets/legend-072-portrait.png" fit="cover" style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  );
}

function SceneApp() {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightField o={0.8} />
      <AmbientParticles start={282.5} dur={21} count={24} color="111,214,224" />
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: p }}>
        <Kicker size={30} color={ACC}>Claim The White Wolf</Kicker>
        <div style={{ marginTop: 10, fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 56, color: '#fff', letterSpacing: '0.04em' }}>worldcup26.world</div>
      </div>
      <PhoneCollect start={1.4} />
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', zIndex: 25, opacity: p, fontFamily: '"Inter",sans-serif', fontWeight: 700, fontSize: 22, color: MV.muted, letterSpacing: '0.14em' }}>FREE · PICK 3 NATIONS · EVERY GOAL SCORES · NO PRIZES</div>
    </div>
  );
}

function SceneCTA() {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutCubic(clamp(lt / 1.0, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sprite start={303.05} end={308.05}><FS id="cta-celebrate" /></Sprite>
      {lt >= 5 && <NightField o={0.7} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,3,8,0.45) 0%, rgba(2,3,8,0.30) 45%, rgba(2,3,8,0.72) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, zIndex: 25, opacity: p }}>
        <Kicker size={30} color={ACC}>WorldCup26 Legends</Kicker>
        <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>LIKE · SUBSCRIBE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <FlagCOD w={62} />
          <div style={{ fontFamily: '"Inter",sans-serif', fontWeight: 900, fontSize: 34, color: ACC, letterSpacing: '0.2em' }}>worldcup26.world</div>
          <FlagUZB w={62} />
        </div>
      </div>
      <Vignette strength={0.4} />
    </div>
  );
}
