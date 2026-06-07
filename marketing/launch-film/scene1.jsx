// scene1.jsx — MYSTERY HOOK (local 0–26s). Deep pitch-green field.
// Flags shuffle like a slot reel, odds flicker, the winner is a "?",
// then the WorldCup26 logo assembles. Lead: nobody knows who wins.
const { Sprite, useTime, useSprite, Easing, interpolate, animate, clamp } = window;
const { C, FONT, Trophy, BrandMark, flag } = window;

const S1_TEAMS = (window.WC_TEAMS || []);

// Deep-green stadium field background with center circle + glow
function PitchBG({ lt }) {
  const glow = 0.35 + 0.12 * Math.sin(lt * 0.9);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background:
      `radial-gradient(120% 80% at 50% 18%, ${C.greenMid} 0%, ${C.greenDeep} 46%, ${C.greenNight} 100%)` }}>
      {/* faint pitch stripes */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, background:
        'repeating-linear-gradient(90deg, #ffffff 0 2px, transparent 2px 160px)' }} />
      {/* center circle + halfway line */}
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: 0.10 }}>
        <circle cx="960" cy="540" r="300" fill="none" stroke="#fff" strokeWidth="2.5" />
        <circle cx="960" cy="540" r="6" fill="#fff" />
        <line x1="0" y1="540" x2="1920" y2="540" stroke="#fff" strokeWidth="2.5" />
      </svg>
      {/* top glow orb */}
      <div style={{ position: 'absolute', top: -260, left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 600, borderRadius: '50%', filter: 'blur(120px)',
        background: `radial-gradient(circle, rgba(201,148,46,${glow * 0.5}) 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 320px rgba(0,0,0,.55)' }} />
    </div>
  );
}

// A single big flag card that flickers through nations (slot reel) then settles on "?"
function FlagReel({ lt }) {
  // reel runs 3.0 → 13.5s, decelerating; after 13.8 shows "?"
  const reelStart = 3.0, reelEnd = 13.2;
  const active = lt >= reelStart && lt < reelEnd;
  const settled = lt >= reelEnd;
  // decelerating index: integrate a speed that ramps down
  let idx = 0;
  if (active) {
    const u = (lt - reelStart) / (reelEnd - reelStart); // 0..1
    const phase = (1 - Math.pow(1 - u, 2.2)); // eased progress of "distance"
    idx = Math.floor(phase * 230) % S1_TEAMS.length;
  }
  const team = S1_TEAMS[idx] || S1_TEAMS[0];
  const cardScale = lt < reelStart ? Easing.easeOutBack(clamp((lt - 1.4) / 0.7, 0, 1)) : 1;
  if (lt < 1.4) return null;
  const settleScale = settled ? 1 + 0.05 * Math.max(0, 1 - (lt - reelEnd) / 0.5) : 1;

  return (
    <div style={{ position: 'absolute', left: '50%', top: 332, transform: `translateX(-50%) scale(${cardScale * settleScale})`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: 300, height: 204, borderRadius: 18, overflow: 'hidden', position: 'relative',
        boxShadow: '0 30px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.12)',
        background: '#0a1713',
      }}>
        {settled ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(160deg, ${C.greenMid}, ${C.greenDeep})` }}>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 130, color: C.gold, textShadow: '0 8px 30px rgba(201,148,46,.5)' }}>?</span>
          </div>
        ) : (
          <img src={flag(team.id, 320)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: active ? 'blur(1.5px)' : 'none' }} />
        )}
        {/* motion sheen while spinning */}
        {active && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,.35), transparent 30%, transparent 70%, rgba(0,0,0,.35))' }} />}
      </div>
      {/* name / odds line */}
      <div style={{ marginTop: 22, height: 44, display: 'flex', alignItems: 'center', gap: 16 }}>
        {settled ? (
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: '-0.01em', color: 'rgba(255,255,255,.92)' }}>Unknown</span>
        ) : active ? (
          <>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#fff', minWidth: 10 }}>{team.name}</span>
            <span style={{ fontFamily: FONT, fontWeight: 850, fontSize: 26, color: C.gold }}>{team.odds}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Scene1() {
  const { localTime: lt } = useSprite();
  // headline copy swaps
  const fade = (a, b) => clamp(Math.min((lt - a) / 0.6, (b - lt) / 0.5), 0, 1);
  const op1 = fade(0.6, 3.2);   // eyebrow line
  const opQ = fade(4.6, 13.0);  // "Who will win?"
  const opN = fade(13.6, 20.4); // "Nobody knows yet."

  // logo assembly 20.8 → 26
  const logoIn = clamp((lt - 20.8) / 0.9, 0, 1);
  const logoE = Easing.easeOutBack(logoIn);
  const showLogo = lt >= 20.6;

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT }}>
      <PitchBG lt={lt} />

      {/* eyebrow */}
      <div style={{ position: 'absolute', top: 232, left: 0, right: 0, textAlign: 'center', opacity: op1 }}>
        <span style={{ fontFamily: FONT, fontWeight: 850, fontSize: 19, letterSpacing: '0.42em', textTransform: 'uppercase', color: 'rgba(255,255,255,.62)' }}>FIFA World Cup 2026</span>
      </div>

      {!showLogo && <FlagReel lt={lt} />}

      {/* Who will win? */}
      {opQ > 0 && !showLogo && (
        <div style={{ position: 'absolute', top: 612, left: 0, right: 0, textAlign: 'center', opacity: opQ }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 96, letterSpacing: '-0.03em', color: '#fff', textShadow: '0 6px 40px rgba(0,0,0,.5)' }}>
            Who will <span style={{ color: C.gold }}>win?</span>
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 28, color: 'rgba(255,255,255,.66)', marginTop: 18 }}>
            48 nations. One trophy.
          </div>
        </div>
      )}

      {/* Nobody knows yet */}
      {opN > 0 && !showLogo && (
        <div style={{ position: 'absolute', top: 624, left: 0, right: 0, textAlign: 'center', opacity: opN }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 84, letterSpacing: '-0.03em', color: '#fff' }}>
            Nobody knows yet.
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 28, color: 'rgba(255,255,255,.66)', marginTop: 18 }}>
            And that's the whole game.
          </div>
        </div>
      )}

      {/* Logo assembly + motto */}
      {showLogo && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: clamp(logoIn * 1.2, 0, 1) }}>
          <div style={{ transform: `scale(${0.8 + 0.2 * logoE})`, display: 'flex', alignItems: 'center', gap: 22 }}>
            <BrandMark size={92} radius={20} />
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, letterSpacing: '-0.03em', color: '#fff' }}>WorldCup</span>
          </div>
          <div style={{ marginTop: 30, fontFamily: FONT, fontWeight: 800, fontSize: 38, letterSpacing: '-0.01em', color: 'rgba(255,255,255,.92)', opacity: clamp((lt - 22) / 0.8, 0, 1) }}>
            Predict the Game · <span style={{ color: '#5fcf9f' }}>WorldCup26</span>
          </div>
        </div>
      )}
    </div>
  );
}

window.Scene1 = Scene1;
