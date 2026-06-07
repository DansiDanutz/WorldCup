// scene2.jsx — ONBOARDING (global 26–54 → local 0–28). Phone: login + referral.
const { Sprite, useTime, useSprite, Easing, interpolate, animate, clamp } = window;
const { C, FONT, Phone, BrandMark, Logo, Eyebrow, Pill, Caption, Tap } = window;

// Mint paper background shared by app scenes
function PaperBG() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg }}>
      <div style={{ position: 'absolute', inset: 0, background:
        'linear-gradient(180deg, rgba(229,243,238,.9), rgba(247,250,249,0) 520px)' }} />
      <div style={{ position: 'absolute', top: -180, right: -120, width: 620, height: 620, borderRadius: '50%',
        filter: 'blur(150px)', background: 'radial-gradient(circle, rgba(16,107,79,.10), transparent 70%)' }} />
    </div>
  );
}

function CheckRow({ children, on }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 15px', borderRadius: 10,
      border: `1px solid ${C.border}`, background: on ? C.greenSoft : C.surface, transition: 'none' }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
        background: on ? C.green : '#fff', border: `1.5px solid ${on ? C.green : C.borderStrong}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {on && <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 7l3 3 5-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14.5, lineHeight: 1.4, color: C.text }}>{children}</span>
    </div>
  );
}

// Mobile login screen, driven by local time `lt`
function LoginScreen({ lt }) {
  const code = 'MARA7QX';
  // typing the referral code
  const typed = clamp(Math.floor((lt - 7.0) / 0.22), 0, code.length);
  const showCode = lt >= 7.0 ? code.slice(0, typed) : '';
  const focused = lt >= 6.6 && lt < 10.4;
  const ben1On = lt >= 9.4;     // benefit rows light
  // google button press then success
  const pressed = lt >= 14.8 && lt < 15.35;
  const success = lt >= 15.9;
  const caret = focused && typed < code.length && Math.floor(lt * 2) % 2 === 0;

  return (
    <div style={{ position: 'absolute', inset: 0, padding: '14px 24px 0', fontFamily: FONT, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 20 }}>
        <BrandMark size={34} radius={8} />
        <span style={{ fontWeight: 800, fontSize: 21, color: C.text, letterSpacing: '-0.02em' }}>WorldCup</span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <Pill style={{ fontSize: 12 }}>FIFA World Cup 2026</Pill>
        <div style={{ fontWeight: 800, fontSize: 42, lineHeight: 1.0, letterSpacing: '-0.03em', color: C.text, marginTop: 14 }}>
          Predict the<br />Game <span style={{ color: C.green }}>WorldCup26</span>
        </div>
      </div>

      {success ? (
        <div style={{ marginTop: 26, padding: 30, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 16px 45px rgba(17,43,36,.08)', textAlign: 'center' }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px auto 18px' }}>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none"><path d="M11 22l7 7 14-17" stroke={C.green} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontWeight: 800, fontSize: 26, color: C.text }}>You're in.</div>
          <div style={{ fontWeight: 400, fontSize: 15, color: C.muted, marginTop: 8 }}>Referral solved · chain started</div>
          <div style={{ marginTop: 18, display: 'inline-flex' }}><Pill bg={C.greenSoft} color={C.p1t}>Your rate · 5%</Pill></div>
        </div>
      ) : (
        <div style={{ padding: '20px 20px 22px', borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 16px 45px rgba(17,43,36,.08)' }}>
          <div style={{ fontWeight: 800, fontSize: 19, color: C.text }}>Login / Register</div>
          <div style={{ fontWeight: 400, fontSize: 13.5, color: C.muted, marginTop: 4, marginBottom: 16 }}>Referral is solved before your account is created.</div>

          <div style={{ fontFamily: FONT, fontWeight: 760, fontSize: 11.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Referral code</div>
          <div style={{ height: 50, borderRadius: 9, border: `1.5px solid ${focused ? C.green : C.border}`, background: focused ? '#fff' : C.paperSoft, display: 'flex', alignItems: 'center', padding: '0 15px', boxShadow: focused ? `0 0 0 3px ${C.greenSoft}` : 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.06em', color: showCode ? C.text : C.borderStrong }}>
              {showCode || 'Enter inviter code'}{caret ? '|' : ''}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            <CheckRow on={ben1On}>Your inviter earns 3% when you win</CheckRow>
            <CheckRow on={ben1On}>Accept a referral and you both get the 5% deal</CheckRow>
          </div>

          <div style={{ marginTop: 18, height: 56, borderRadius: 11, background: success ? C.green : (showCode.length ? C.green : '#7fb3a2'),
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            transform: `scale(${pressed ? 0.965 : 1})`, boxShadow: showCode.length ? '0 10px 26px rgba(16,107,79,.30)' : 'none' }}>
            <svg width="22" height="22" viewBox="0 0 22 22"><path fill="#fff" d="M21 11.2c0-.7-.06-1.4-.18-2H11v3.8h5.6c-.24 1.3-.97 2.4-2.06 3.14v2.6h3.33C19.8 16.97 21 14.36 21 11.2z" opacity=".95" /><path fill="#fff" d="M11 21c2.7 0 4.96-.9 6.62-2.43l-3.33-2.58c-.92.62-2.1.98-3.29.98-2.53 0-4.67-1.7-5.44-4H2.13v2.6A10 10 0 0 0 11 21z" opacity=".8" /><path fill="#fff" d="M5.56 12.97A6 6 0 0 1 5.56 9V6.4H2.13a10 10 0 0 0 0 9.17z" opacity=".65" /><path fill="#fff" d="M11 4.96c1.47 0 2.78.5 3.82 1.5l2.86-2.86A10 10 0 0 0 2.13 6.4l3.43 2.6C6.33 6.66 8.47 4.96 11 4.96z" opacity=".9" /></svg>
            <span style={{ fontWeight: 760, fontSize: 17, color: '#fff' }}>Continue with Google</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Scene2() {
  const { localTime: lt } = useSprite();
  const enter = Easing.easeOutCubic(clamp(lt / 0.85, 0, 1));
  const phoneY = (1 - enter) * 120;
  const phoneOp = enter;
  // tap coords (canvas space): phone left=150, screen inner starts ~ +13+? ; we place taps roughly
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PaperBG />
      <div style={{ position: 'absolute', left: 168, top: 72, transform: `translateY(${phoneY}px)`, opacity: phoneOp }}>
        <Phone screenBg={C.bg}><LoginScreen lt={lt} /></Phone>
        {/* taps on the referral field and google button (global times) */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Tap x={226} y={486} at={32.8} />
          <Tap x={226} y={812} at={40.8} />
        </div>
      </div>

      {/* Captions on the right */}
      <Caption start={26.6} end={32.4} x={760} y={300} eyebrow="Get started"
        title={<>Two taps<br />and you're in.</>}
        sub="No forms, no friction. Sign in with Google and you're on the board in seconds." />
      <Caption start={32.6} end={39.4} x={760} y={300} eyebrow="Referrals"
        title={<>Join with a<br />friend's code.</>}
        sub="Enter an inviter code first. Accept a referral and you both unlock the 5% earning deal." />
      <Caption start={39.6} end={47.6} x={760} y={320} eyebrow="One tap"
        title={<>Continue<br />with Google.</>}
        sub="Your referral is solved before the account exists — your chain starts the moment you join." />
    </div>
  );
}

window.Scene2 = Scene2;
window.PaperBG = PaperBG;
