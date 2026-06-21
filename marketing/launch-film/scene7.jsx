// scene7.jsx — CTA (global 168–180 → local 0–12). Deep pitch-green bookend.
const { Sprite, useTime, useSprite, Easing, interpolate, animate, clamp } = window;
const { C, FONT, BrandMark, Trophy, Flag } = window;

const c7 = (lt, at, d = 0.6) => Easing.easeOutCubic(clamp((lt - at) / d, 0, 1));
const FLAG_ROW = ['france', 'spain', 'england', 'brazil', 'argentina', 'morocco', 'japan', 'germany', 'portugal', 'curacao'];

function Scene7() {
  const { localTime: lt } = useSprite();
  const logoIn = Easing.easeOutBack(clamp(lt / 0.9, 0, 1));
  const float = Math.sin(lt * 1.1) * 6;
  const glow = 0.4 + 0.12 * Math.sin(lt * 1.3);

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT, overflow: 'hidden',
      background: `radial-gradient(120% 90% at 50% 30%, ${C.greenMid} 0%, ${C.greenDeep} 48%, ${C.greenNight} 100%)` }}>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
        <circle cx="960" cy="470" r="320" fill="none" stroke="#fff" strokeWidth="2.5" />
        <line x1="0" y1="470" x2="1920" y2="470" stroke="#fff" strokeWidth="2.5" />
      </svg>
      <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 1000, height: 620, borderRadius: '50%', filter: 'blur(140px)', background: `radial-gradient(circle, rgba(201,148,46,${glow * 0.45}), transparent 70%)` }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, transform: `scale(${0.85 + 0.15 * logoIn}) translateY(${float}px)`, opacity: clamp(logoIn * 1.3, 0, 1) }}>
          <BrandMark size={104} radius={22} />
          <span style={{ fontWeight: 800, fontSize: 88, letterSpacing: '-0.03em', color: '#fff' }}>WorldCup</span>
        </div>

        {/* tagline */}
        <div style={{ marginTop: 40, opacity: c7(lt, 1.6), transform: `translateY(${(1 - c7(lt, 1.6)) * 18}px)` }}>
          <span style={{ fontWeight: 800, fontSize: 54, letterSpacing: '-0.02em', color: 'rgba(255,255,255,.95)' }}>
            Pick 3. <span style={{ color: '#5fcf9f' }}>Climb.</span> <span style={{ color: C.gold }}>Win.</span>
          </span>
        </div>

        {/* URL */}
        <div style={{ marginTop: 48, opacity: c7(lt, 3.0), transform: `translateY(${(1 - c7(lt, 3.0)) * 18}px)` }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '20px 40px', borderRadius: 999,
            background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.16)', backdropFilter: 'blur(4px)' }}>
            <Trophy size={34} stroke={C.gold} sw={2.2} />
            <span style={{ fontWeight: 850, fontSize: 46, letterSpacing: '-0.01em', color: '#fff' }}>worldcup26.world</span>
          </div>
        </div>

        {/* motto */}
        <div style={{ marginTop: 34, opacity: c7(lt, 4.4), fontWeight: 700, fontSize: 26, letterSpacing: '0.02em', color: 'rgba(255,255,255,.62)' }}>
          Predict the Game · WorldCup26
        </div>
      </div>

      {/* flag row at bottom */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, opacity: c7(lt, 5.0) * 0.9 }}>
        {FLAG_ROW.map((id, i) => (
          <div key={id} style={{ opacity: c7(lt, 5.0 + i * 0.08), transform: `translateY(${(1 - c7(lt, 5.0 + i * 0.08)) * 14}px)` }}>
            <Flag id={id} w={56} radius={6} />
          </div>
        ))}
      </div>
    </div>
  );
}

window.Scene7 = Scene7;
