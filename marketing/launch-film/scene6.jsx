// scene6.jsx — WHATSAPP INVITE (global 146–168 → local 0–22).
const { Sprite, useTime, useSprite, Easing, interpolate, animate, clamp } = window;
const { C, FONT, Phone, BrandMark, Eyebrow, Pill, Caption, Tap, PaperBG, rollNum } = window;

const WA = '#25D366', WA_DEEP = '#128C7E';
const appr = (lt, at, d = 0.5) => Easing.easeOutBack(clamp((lt - at) / d, 0, 1));
const apprC = (lt, at, d = 0.5) => Easing.easeOutCubic(clamp((lt - at) / d, 0, 1));

function WAicon({ size = 22, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
      <path d="M16 3C9.2 3 3.7 8.5 3.7 15.3c0 2.4.7 4.6 1.8 6.5L3.4 29l7.4-1.9c1.8 1 3.9 1.6 6.1 1.6h.1c6.8 0 12.3-5.5 12.3-12.3S22.8 3 16 3zm0 22.3c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.4 1.1 1.2-4.3-.3-.4a10 10 0 0 1-1.6-5.4c0-5.6 4.6-10.2 10.2-10.2S26.2 9.6 26.2 15.2 21.6 25.3 16 25.3zm5.6-7.6c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4z" />
    </svg>
  );
}

function InviteScreen({ lt }) {
  const pressed = lt >= 4.3 && lt < 4.9;
  const shared = lt >= 5.2;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT, overflow: 'hidden', background: C.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 18px 10px', borderBottom: `1px solid ${C.border}` }}>
        <BrandMark size={28} radius={7} />
        <span style={{ fontWeight: 800, fontSize: 17, color: C.text }}>WorldCup</span>
        <div style={{ marginLeft: 'auto' }}><Pill bg={C.greenSoft} color={C.p1t} style={{ fontSize: 12, fontWeight: 800 }}>Your rate · 5%</Pill></div>
      </div>

      <div style={{ padding: '16px 20px 8px' }}>
        <Eyebrow>Referrals</Eyebrow>
        <div style={{ fontWeight: 800, fontSize: 30, color: C.text, letterSpacing: '-0.02em', marginTop: 7 }}>Invite Friends</div>
        <div style={{ fontWeight: 400, fontSize: 14, color: C.muted, marginTop: 6, lineHeight: 1.45 }}>Every friend who joins through your link builds your chain.</div>
      </div>

      {/* referral code */}
      <div style={{ margin: '14px 20px 0', padding: '15px 17px', borderRadius: 13, background: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 8px 24px rgba(17,43,36,.06)' }}>
        <div style={{ fontWeight: 760, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.muted }}>Your referral code</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontWeight: 850, fontSize: 30, letterSpacing: '0.1em', color: C.green }}>MARA7QX</span>
          <div style={{ padding: '8px 14px', borderRadius: 8, background: C.greenSoft, fontWeight: 760, fontSize: 13.5, color: C.p1t }}>Copy</div>
        </div>
      </div>

      {/* invite link */}
      <div style={{ margin: '12px 20px 0', height: 50, borderRadius: 11, border: `1px solid ${C.border}`, background: C.paperSoft, display: 'flex', alignItems: 'center', gap: 10, padding: '0 15px' }}>
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M7 10a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" /><path d="M10 7a3 3 0 0 0-4.2 0l-2 2A3 3 0 0 0 8 13.2l1-1" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" /></svg>
        <span style={{ fontWeight: 650, fontSize: 14.5, color: C.text }}>worldcup26.world/r/MARA7QX</span>
      </div>

      {/* WhatsApp button */}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 92 }}>
        <div style={{ height: 60, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          background: shared ? WA_DEEP : WA, transform: `scale(${pressed ? 0.965 : 1})`, boxShadow: `0 14px 32px ${WA}55` }}>
          {shared ? (
            <>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M5 11l4 4 8-9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ fontWeight: 760, fontSize: 18, color: '#fff' }}>Shared with 3 friends</span>
            </>
          ) : (
            <>
              <WAicon size={24} />
              <span style={{ fontWeight: 760, fontSize: 18, color: '#fff' }}>Share on WhatsApp</span>
            </>
          )}
        </div>
      </div>

      {/* terms */}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 30, display: 'flex', gap: 9 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '9px', borderRadius: 9, background: C.greenSoft }}>
          <span style={{ fontWeight: 850, fontSize: 18, color: C.green }}>5%</span>
          <span style={{ fontWeight: 700, fontSize: 12.5, color: C.muted, marginLeft: 6 }}>chain</span>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '9px', borderRadius: 9, background: C.surfaceStrong }}>
          <span style={{ fontWeight: 850, fontSize: 18, color: C.text }}>3%</span>
          <span style={{ fontWeight: 700, fontSize: 12.5, color: C.muted, marginLeft: 6 }}>direct</span>
        </div>
      </div>
    </div>
  );
}

// referral chain node
function Node({ x, y, label, color, sub, show }) {
  const s = show;
  if (s <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.5 + s * 0.5})`, opacity: clamp(s * 1.4, 0, 1), textAlign: 'center' }}>
      <div style={{ width: sub ? 58 : 84, height: sub ? 58 : 84, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
        boxShadow: `0 10px 26px ${color}55`, border: '3px solid #fff' }}>
        <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: sub ? 22 : 32, color: '#fff' }}>{label}</span>
      </div>
    </div>
  );
}

function Scene6() {
  const { localTime: lt } = useSprite();
  const enter = Easing.easeOutCubic(clamp(lt / 0.85, 0, 1));

  // chain node show factors
  const nYou = apprC(lt, 6.0, 0.5);
  const f = [apprC(lt, 7.0), apprC(lt, 7.8), apprC(lt, 8.6)];
  const g = [apprC(lt, 10.4), apprC(lt, 11.0), apprC(lt, 11.8), apprC(lt, 12.6)];
  // line draw factors
  const youX = 1086, youY = 540;
  const fX = 1392; const fY = [392, 540, 688];
  const gX = 1690; const gY = [330, 470, 612, 760];
  // earnings
  const earn = (16.5 * Easing.easeOutCubic(clamp((lt - 7) / 9, 0, 1))).toFixed(2);

  // message bubble flying from phone to first friend (lt 5.0–6.6)
  const bubT = clamp((lt - 5.0) / 1.4, 0, 1);
  const bubShow = lt >= 5.0 && lt < 6.8;

  const linkOp = (sf, ef) => clamp(Math.min(sf, ef) * 1.6, 0, 1);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PaperBG />
      <div style={{ position: 'absolute', left: 100, top: 72, transform: `translateY(${(1 - enter) * 110}px)`, opacity: enter }}>
        <Phone screenBg={C.bg}><InviteScreen lt={lt} /></Phone>
        <Tap x={226} y={760} at={146 + 4.3} />
      </div>

      {/* Right: caption + referral chain */}
      <Caption start={146.5} end={153.5} x={690} y={120} eyebrow="Go viral" w={1140}
        title={<>Invite friends on WhatsApp.</>}
        sub="One tap shares your link straight into the chat. Every friend who joins becomes part of your chain." titleSize={58} />

      {/* chain area */}
      <div style={{ position: 'absolute', left: 600, top: 300, right: 40, bottom: 60 }}>
        {/* connectors */}
        <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width="100%" height="100%">
          {fY.map((y, i) => (
            <line key={'f' + i} x1={youX - 600} y1={youY - 300} x2={fX - 600} y2={y - 300}
              stroke={C.p1bd} strokeWidth="3" opacity={linkOp(nYou, f[i])} />
          ))}
          {/* friend -> sub links: friend0->g0,g1 ; friend1->g2 ; friend2->g3 */}
          <line x1={fX - 600} y1={fY[0] - 300} x2={gX - 600} y2={gY[0] - 300} stroke={C.p2bd} strokeWidth="2.5" opacity={linkOp(f[0], g[0])} />
          <line x1={fX - 600} y1={fY[0] - 300} x2={gX - 600} y2={gY[1] - 300} stroke={C.p2bd} strokeWidth="2.5" opacity={linkOp(f[0], g[1])} />
          <line x1={fX - 600} y1={fY[1] - 300} x2={gX - 600} y2={gY[2] - 300} stroke={C.p2bd} strokeWidth="2.5" opacity={linkOp(f[1], g[2])} />
          <line x1={fX - 600} y1={fY[2] - 300} x2={gX - 600} y2={gY[3] - 300} stroke={C.p2bd} strokeWidth="2.5" opacity={linkOp(f[2], g[3])} />
        </svg>
        {/* nodes (coords relative to this container: subtract 600/300) */}
        <Node x={youX - 600} y={youY - 300} label="You" color={C.green} show={nYou} />
        <Node x={fX - 600} y={fY[0] - 300} label="A" color={C.p2a} show={f[0]} />
        <Node x={fX - 600} y={fY[1] - 300} label="J" color={C.p2a} show={f[1]} />
        <Node x={fX - 600} y={fY[2] - 300} label="M" color={C.p2a} show={f[2]} />
        <Node x={gX - 600} y={gY[0] - 300} label="R" color={C.p3a} sub show={g[0]} />
        <Node x={gX - 600} y={gY[1] - 300} label="S" color={C.p3a} sub show={g[1]} />
        <Node x={gX - 600} y={gY[2] - 300} label="K" color={C.p3a} sub show={g[2]} />
        <Node x={gX - 600} y={gY[3] - 300} label="T" color={C.p3a} sub show={g[3]} />

        {/* labels */}
        <div style={{ position: 'absolute', left: fX - 600, top: fY[2] - 300 + 60, transform: 'translate(-50%,0)', opacity: clamp(f[2] * 1.4, 0, 1), fontFamily: FONT, fontWeight: 760, fontSize: 15, color: C.p2t, whiteSpace: 'nowrap' }}>Direct invites · 3%</div>
        <div style={{ position: 'absolute', left: gX - 600, top: gY[3] - 300 + 44, transform: 'translate(-50%,0)', opacity: clamp(g[3] * 1.4, 0, 1), fontFamily: FONT, fontWeight: 760, fontSize: 15, color: C.p3t, whiteSpace: 'nowrap' }}>Their friends · 5% chain</div>
      </div>

      {/* earnings card */}
      <div style={{ position: 'absolute', left: 690, top: 300, opacity: clamp((lt - 7) / 0.8, 0, 1) }}>
        <div style={{ padding: '16px 22px', borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 12px 30px rgba(17,43,36,.08)' }}>
          <div style={{ fontFamily: FONT, fontWeight: 760, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.muted }}>Referral earnings</div>
          <div style={{ fontFamily: FONT, fontWeight: 850, fontSize: 46, color: C.gold, lineHeight: 1.1 }}>${earn}</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: C.muted }}>{lt >= 12 ? 7 : Math.min(3 + Math.floor((lt - 7)), 7)} friends in your chain</div>
        </div>
      </div>

      {/* flying whatsapp bubble */}
      {bubShow && (
        <div style={{ position: 'absolute', left: 326 + bubT * (1392 - 326), top: 760 - bubT * (760 - 392) - Math.sin(bubT * Math.PI) * 80,
          transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * Math.sin(bubT * Math.PI)})`, opacity: clamp(Math.sin(bubT * Math.PI) * 2, 0, 1) }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: WA, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${WA}66` }}>
            <WAicon size={26} />
          </div>
        </div>
      )}

      {/* payoff line */}
      {lt >= 16.4 && (
        <div style={{ position: 'absolute', left: 690, bottom: 70, opacity: clamp((lt - 16.6) / 0.6, 0, 1) }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', color: C.text }}>Build your chain. Earn as they win.</div>
        </div>
      )}
    </div>
  );
}

window.Scene6 = Scene6;
