// scene3.jsx — PICK 3 TEAMS (global 48–82 → local 0–34). Color-coded picks.
const { Sprite, useTime, useSprite, Easing, interpolate, animate, clamp } = window;
const { C, FONT, PICKS, Phone, BrandMark, Eyebrow, Pill, Flag, Caption, Tap, PaperBG } = window;

// curated picker list (coefficient order) — all visible, no scroll
const PICKER = [
  { id: 'france',   name: 'France',   grp: 'I', conf: 'UEFA', coef: 1.00, odds: '9/2' },
  { id: 'england',  name: 'England',  grp: 'L', conf: 'UEFA', coef: 1.12, odds: '13/2' },
  { id: 'germany',  name: 'Germany',  grp: 'E', conf: 'UEFA', coef: 1.39, odds: '14/1' },
  { id: 'morocco',  name: 'Morocco',  grp: 'C', conf: 'CAF',  coef: 1.77, odds: '40/1' },
  { id: 'japan',    name: 'Japan',    grp: 'F', conf: 'AFC',  coef: 1.86, odds: '50/1' },
  { id: 'senegal',  name: 'Senegal',  grp: 'I', conf: 'CAF',  coef: 1.96, odds: '66/1' },
  { id: 'curacao',  name: 'Curaçao',  grp: 'E', conf: 'Concacaf', coef: 3.00, odds: '1000/1' },
];
// pick order: France (idx0), Morocco (idx3), Curaçao (idx6)
const PICK_SEQ = [
  { idx: 0, at: 4.0 },
  { idx: 3, at: 9.0 },
  { idx: 6, at: 14.6 },
];

function TeamRow({ t, pickOrder, justPicked }) {
  const sel = pickOrder >= 0;
  const pc = sel ? PICKS[pickOrder] : null;
  const pop = justPicked ? 1 : 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 13, padding: '11px 15px 11px 13px',
      borderRadius: 11, marginBottom: 8,
      background: sel ? pc.b : C.surface,
      border: `1px solid ${sel ? pc.bd : C.border}`,
      borderLeft: `${sel ? 5 : 1}px solid ${sel ? pc.a : C.border}`,
      boxShadow: justPicked ? `0 8px 22px ${pc.a}22` : 'none',
      transform: `scale(${1 + pop * 0.012})`,
    }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        border: `1.5px solid ${sel ? pc.a : C.borderStrong}`, background: sel ? pc.a : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {sel && <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 8l3 3 6-7.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <Flag id={t.id} w={46} radius={5} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontWeight: 760, fontSize: 19, color: C.text, letterSpacing: '-0.01em' }}>{t.name}</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: C.muted, marginTop: 2 }}>Group {t.grp} · {t.conf}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 21, color: sel ? pc.t : C.green }}>{t.coef.toFixed(2)}</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12.5, color: C.muted, marginTop: 1 }}>{t.odds}</div>
      </div>
    </div>
  );
}

function PickScreen({ lt }) {
  // which picks are active
  const picked = PICK_SEQ.filter(p => lt >= p.at);
  const orderOf = (idx) => picked.findIndex(p => p.idx === idx);
  const count = picked.length;
  const combined = PICK_SEQ.filter(p => lt >= p.at).reduce((s, p) => s + PICKER[p.idx].coef, 0);
  const locked = lt >= 25.5;
  const lockPress = lt >= 24.0 && lt < 24.6;
  // readout pop when count changes
  const lastAt = picked.length ? picked[picked.length - 1].at : -10;
  const readoutPop = clamp(1 - (lt - lastAt) / 0.4, 0, 1);

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT, overflow: 'hidden', background: C.bg }}>
      {/* top nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 20px 10px', borderBottom: `1px solid ${C.border}` }}>
        <BrandMark size={28} radius={7} />
        <span style={{ fontWeight: 800, fontSize: 17, color: C.text }}>WorldCup</span>
        <div style={{ marginLeft: 'auto' }}><Pill bg={C.surfaceStrong} color={C.gold} style={{ fontSize: 12, fontWeight: 800 }}>$48,000 · TOP 10</Pill></div>
      </div>

      <div style={{ padding: '13px 20px 6px' }}>
        <Eyebrow>Your Entry</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <div style={{ fontWeight: 800, fontSize: 29, color: C.text, letterSpacing: '-0.02em' }}>Pick 3 Teams</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.greenSoft, borderRadius: 10, padding: '7px 13px', transform: `scale(${1 + readoutPop * 0.06})` }}>
            <div style={{ fontWeight: 760, fontSize: 10.5, letterSpacing: '0.04em', color: C.p1t, textTransform: 'uppercase', lineHeight: 1.15, whiteSpace: 'nowrap' }}>{count}/3<br />picked</div>
            <div style={{ fontWeight: 850, fontSize: 26, color: C.green, lineHeight: 1 }}>{combined.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* search */}
      <div style={{ padding: '4px 20px 10px' }}>
        <div style={{ height: 42, borderRadius: 9, border: `1px solid ${C.border}`, background: C.paperSoft, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="7" cy="7" r="5.2" stroke={C.muted} strokeWidth="1.6" /><path d="M11 11l3.2 3.2" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round" /></svg>
          <span style={{ fontWeight: 600, fontSize: 14, color: C.borderStrong }}>Search team, group, confederation</span>
        </div>
      </div>

      {/* rows */}
      <div style={{ padding: '0 20px' }}>
        {PICKER.map((t, i) => {
          const o = orderOf(i);
          const jp = o >= 0 && lt - picked[o].at < 0.45;
          return <TeamRow key={t.id} t={t} pickOrder={o} justPicked={jp} />;
        })}
      </div>

      {/* fade behind lock button */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, background: `linear-gradient(180deg, transparent, ${C.bg} 55%)`, pointerEvents: 'none' }} />
      {/* lock button */}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
        <div style={{ height: 58, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11,
          background: locked ? C.p1t : (count === 3 ? C.green : '#9cc3b6'),
          transform: `scale(${lockPress ? 0.97 : 1})`,
          boxShadow: count === 3 ? '0 12px 30px rgba(16,107,79,.32)' : 'none' }}>
          {locked ? (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="2" stroke="#fff" strokeWidth="1.8" /><path d="M6.5 9V7a3.5 3.5 0 0 1 7 0v2" stroke="#fff" strokeWidth="1.8" /></svg>
              <span style={{ fontWeight: 760, fontSize: 17.5, color: '#fff' }}>Entry Locked · 5.77</span>
            </>
          ) : (
            <span style={{ fontWeight: 760, fontSize: 17.5, color: '#fff' }}>{count === 3 ? 'Lock Entry' : `Select ${3 - count} more`}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Scene3() {
  const { localTime: lt } = useSprite();
  const enter = Easing.easeOutCubic(clamp(lt / 0.85, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PaperBG />
      <div style={{ position: 'absolute', left: 168, top: 72, transform: `translateY(${(1 - enter) * 110}px)`, opacity: enter }}>
        <Phone screenBg={C.bg}><PickScreen lt={lt} /></Phone>
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* taps land on each picked row + lock (canvas coords, tuned to layout) */}
          <Tap x={300} y={500} at={48 + 4.0} />
          <Tap x={300} y={648} at={48 + 9.0} />
          <Tap x={300} y={870} at={48 + 14.6} />
          <Tap x={300} y={918} at={48 + 24.0} />
        </div>
      </div>

      <Caption start={48.5} end={55.0} x={760} y={300} eyebrow="Build your entry"
        title={<>Pick 3 of<br />48 nations.</>}
        sub="One favorite, one wildcard, one long shot — your three teams are your whole game." />
      <Caption start={55.2} end={64.0} x={760} y={300} eyebrow="The multiplier"
        title={<>Safe points<br />or big upside.</>}
        sub="France pays 1.00×. Curaçao pays 3.00×. Underdogs are risky — but when they run, they pay." />
      <Caption start={64.2} end={73.2} x={760} y={310} eyebrow="Combined"
        title={<>Balance the<br />three.</>}
        sub="Your combined coefficient sets your ceiling. Mix safety with the long shots nobody sees coming." />
      <Caption start={73.4} end={81.6} x={760} y={330} eyebrow="Commit"
        title={<>Lock your<br />entry.</>}
        sub="Late entries stay open — but a team locks the moment its second group match kicks off." />
    </div>
  );
}

window.Scene3 = Scene3;
