// scene5.jsx — LEADERBOARD CLIMB (global 116–146 → local 0–30).
const { Sprite, useTime, useSprite, Easing, interpolate, animate, clamp } = window;
const { C, FONT, Phone, BrandMark, Eyebrow, Pill, Flag, Caption, PaperBG } = window;

const PLAYERS = [
  { name: 'Ava R.',  pts: 412.6, picks: ['spain', 'portugal', 'japan'] },
  { name: 'Liam K.', pts: 388.0, picks: ['argentina', 'england', 'senegal'] },
  { name: 'Noah P.', pts: 371.4, picks: ['brazil', 'germany', 'croatia'] },
  { name: 'Mia T.',  pts: 360.2, picks: ['netherlands', 'japan', 'ghana'] },
  { name: 'Zoe L.',  pts: 351.8, picks: ['england', 'mexico', 'senegal'] },
  { name: 'Kai M.',  pts: 344.0, picks: ['portugal', 'uruguay', 'egypt'] },
  { name: 'Eli S.',  pts: 339.5, picks: ['germany', 'japan', 'tunisia'] },
];
const ROWH = 63;
const logistic = (x, k) => 1 / (1 + Math.exp(-x / k));

// You's points over local time
const youPts = interpolate(
  [0, 2.2, 5, 7.5, 9.5, 12, 15.5, 30],
  [318.0, 318.0, 331.0, 345.6, 354.0, 363.0, 378.0, 378.0],
  Easing.easeInOutCubic
);

function PayCell({ rank, money, pct, hot }) {
  return (
    <div style={{ flex: 1, padding: '9px 11px', borderRadius: 9, background: hot ? '#fbf2e0' : C.paperSoft,
      border: `1px solid ${hot ? C.gold + '99' : C.border}`, transform: `scale(${hot ? 1.04 : 1})`,
      boxShadow: hot ? `0 8px 20px ${C.gold}33` : 'none' }}>
      <div style={{ fontFamily: FONT, fontWeight: 760, fontSize: 11, color: C.muted }}>#{rank}</div>
      <div style={{ fontFamily: FONT, fontWeight: 850, fontSize: 17, color: hot ? '#9a6f17' : C.green, lineHeight: 1.1 }}>{money}</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 10.5, color: C.muted }}>{pct}</div>
    </div>
  );
}

function Row({ p, slot, isYou, pts }) {
  const rank = Math.round(slot) + 1;
  const chips = (p.picks || []).slice(0, 3);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: slot * ROWH, height: ROWH - 8,
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 13px',
      borderRadius: 10, zIndex: isYou ? 5 : 1,
      background: isYou ? C.greenSoft : C.surface,
      border: `1px solid ${isYou ? C.p1bd : C.border}`,
      borderLeft: `${isYou ? 5 : 1}px solid ${isYou ? C.green : C.border}`,
      boxShadow: isYou ? '0 10px 26px rgba(16,107,79,.22)' : '0 1px 2px rgba(17,43,36,.04)' }}>
      <div style={{ width: 26, fontFamily: FONT, fontWeight: 850, fontSize: 19, color: isYou ? C.green : C.muted, textAlign: 'center' }}>{rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontWeight: isYou ? 800 : 720, fontSize: 16.5, color: C.text }}>{isYou ? 'You' : p.name}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {chips.map((c, i) => <Flag key={i} id={c} w={24} radius={3} />)}
        </div>
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 850, fontSize: 19, color: isYou ? C.green : C.text }}>{(isYou ? pts : p.pts).toFixed(1)}</div>
    </div>
  );
}

function LeaderScreen({ lt }) {
  const yp = youPts(lt);
  const you = { name: 'You', pts: yp, picks: ['france', 'morocco', 'curacao'] };
  const all = [...PLAYERS, you];
  // smooth slot for each row
  const slotOf = (row) => all.reduce((s, o) => o === row ? s : s + logistic(o.pts - row.pts, 2.2), 0);
  const youRank = Math.round(slotOf(you)) + 1;
  const youAt3 = youRank <= 3;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT, overflow: 'hidden', background: C.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 18px 10px', borderBottom: `1px solid ${C.border}` }}>
        <BrandMark size={28} radius={7} />
        <span style={{ fontWeight: 800, fontSize: 17, color: C.text }}>WorldCup</span>
        <div style={{ marginLeft: 'auto' }}><Pill bg={C.surfaceStrong} color={C.gold} style={{ fontSize: 12, fontWeight: 800 }}>$48,000 · TOP 10</Pill></div>
      </div>

      <div style={{ padding: '14px 18px 10px' }}>
        <Eyebrow>Standings</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <div style={{ fontWeight: 800, fontSize: 28, color: C.text, letterSpacing: '-0.02em' }}>Leaderboard</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 760, fontSize: 10.5, letterSpacing: '0.04em', color: C.muted, textTransform: 'uppercase' }}>128 players</div>
            <div style={{ fontWeight: 850, fontSize: 22, color: C.green, lineHeight: 1 }}>$48,000</div>
          </div>
        </div>
      </div>

      {/* payout strip */}
      <div style={{ display: 'flex', gap: 8, padding: '4px 18px 14px' }}>
        <PayCell rank="1" money="$15,360" pct="32%" />
        <PayCell rank="2" money="$9,600" pct="20%" />
        <PayCell rank="3" money="$6,720" pct="14%" hot={youAt3} />
      </div>

      {/* rows */}
      <div style={{ position: 'relative', margin: '0 14px', height: all.length * ROWH }}>
        {all.map((p, i) => (
          <Row key={p.name} p={p} slot={slotOf(p)} isYou={p === you} pts={yp} />
        ))}
      </div>
    </div>
  );
}

function Scene5() {
  const { localTime: lt } = useSprite();
  const enter = Easing.easeOutCubic(clamp(lt / 0.85, 0, 1));
  // "+12.4 Morocco" toast around the big jump
  const toast = clamp(Math.min((lt - 5.2) / 0.4, (8.4 - lt) / 0.5), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PaperBG />
      <div style={{ position: 'absolute', left: 168, top: 72, transform: `translateY(${(1 - enter) * 110}px)`, opacity: enter }}>
        <Phone screenBg={C.bg}><LeaderScreen lt={lt} /></Phone>
        {/* points toast */}
        <div style={{ position: 'absolute', left: 250, top: 690, opacity: toast, transform: `translateY(${(1 - toast) * -16}px)` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: C.green, boxShadow: '0 10px 24px rgba(16,107,79,.4)' }}>
            <Flag id="morocco" w={22} radius={3} />
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 16, color: '#fff' }}>Morocco won · +12.4</span>
          </div>
        </div>
      </div>

      <Caption start={116.6} end={123.0} x={760} y={300} eyebrow="The pool"
        title={<>$48,000<br />on the line.</>}
        sub="Your score is the sum of your three teams' points after every match they play." />
      <Caption start={123.2} end={131.0} x={760} y={300} eyebrow="The climb"
        title={<>Watch your<br />teams rise.</>}
        sub="Every result moves you. When your underdog hits, you leap up the board." />
      <Caption start={131.2} end={139.0} x={760} y={310} eyebrow="Top 10 paid"
        title={<>Into the<br />money.</>}
        sub="The top 10 positions share the pool on a weighted curve — #1 takes 32%, #3 takes 14%." />
      <Caption start={139.2} end={145.4} x={760} y={330} eyebrow="Still a mystery"
        title={<>Anyone can<br />still win.</>}
        sub="One upset rewrites everything — right up to the final whistle." />
    </div>
  );
}

window.Scene5 = Scene5;
