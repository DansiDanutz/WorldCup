# Legal & Compliance Readiness — WorldCup26

> Updated 2026-06-15. **This is not legal advice.** It's an engineering-level
> readiness map so we run a professional, good-faith operation and know exactly
> what to take to a qualified attorney. The real-money game and the brand/IP both
> have items that ONLY a licensed lawyer (per jurisdiction) can clear.

## ✅ Implemented in this pass (safe, clearly-correct)
- **FIFA non-affiliation + trademark + player-likeness disclaimer** added to the
  Terms page (`src/app/terms/page.tsx`) — previously missing everywhere.
- **Responsible-play & help section** added to Terms: states the limit/self-exclusion
  controls and lists problem-gambling help (US National Problem Gambling Helpline
  1-800-522-4700, ncpgambling.org, Gamblers Anonymous).
- **YouTube upload compliance** baked into `content/youtube/UPLOAD_PACKS.md`:
  verify "No, not made for kids"; tick **"Altered or synthetic content"**; only use
  **licensed/credited music**; and a **non-affiliation + "predictions, not results,
  not betting advice"** line to paste in every video description.
- AI-disclosure rationale already documented in `ALGORITHM_2026_CONFIG_PLAN.md` §B.

## ✅ Verified already in good shape (correcting the audit)
- **Self-excluded users ARE blocked from deposits** — `deposits/claims/route.ts`
  calls `getResponsiblePlayRestriction(status, "deposit")` and the self-exclusion
  branch pauses deposits/tickets/entries (the audit's "H-1" was a false positive).
- **Geo-eligibility fails CLOSED** (unknown country blocked) and gates entries,
  deposits, and withdrawals (`lib/geo-eligibility.ts`, `lib/operator-policy.ts`).
- **Payouts are gated on 18+ document age-verification** (`api/withdrawals`,
  `lib/age-verification.ts`); ID images are reviewed off-platform, not stored.
- **Consent + terms-version pinning** before entry (`api/consent`, `lib/consent.ts`).

## 🚩 MUST clear with a lawyer BEFORE taking real money (blockers)
1. **Legal classification + licensing.** Is "buy a ticket → pick teams → win from a
   prize pool" a *skill game*, *contest/sweepstakes*, or *gambling* in each target
   country/US state? This determines whether you need a license and where you must
   geo-block. We self-label "skill-based" in Terms but that is **not** a legal
   determination. → Get a written per-jurisdiction opinion; encode the allowed list
   in `WORLDCUP_ALLOWED_COUNTRIES` (already enforced).
2. **KYC / AML / sanctions.** There is currently **no** identity (KYC) check, no
   OFAC/sanctions screening, and no AML monitoring — only age verification at payout.
   Taking crypto deposits/withdrawals without this is a serious regulatory risk.
   → Integrate a KYC/AML vendor (Jumio/Onfido/Sumsub) gating deposit and withdrawal.
3. **Full Terms of Use + Privacy Policy.** Current pages are thin. A lawyer should
   add: governing law, dispute resolution/arbitration, prohibited territories, tax
   withholding, AML/KYC terms, and limitation of liability. (Privacy: GDPR/CCPA
   data-subject rights, processors, retention specifics.)
4. **Brand & likeness clearance.** "World Cup", "FIFA", team names/crests are
   trademarks; using real players' names and AI likenesses implicates rights of
   publicity. The disclaimer reduces *implied-endorsement* risk but does not grant
   rights. → Have counsel assess the `WorldCup26` brand/domain and the video content.

## ⚠️ Product decisions to make (then implement)
- **Age-verify (or at least KYC) BEFORE deposit**, not only before withdrawal —
  today a self-attested checkbox lets minors fund an account; payout is the only
  doc-gated step. Decide: gate deposits on `isAgeVerified()` or KYC clearance.
- **Deposit attribution:** shared USDT address + user-submitted tx hash can be
  mis-claimed; move to per-user sub-addresses or a proof-of-sender nonce.
- **Cookie/consent banner & analytics disclosure** if any non-essential cookies are
  set; add GDPR/CCPA rights language.
- **Service worker** (`public/sw.js`) should not cache authenticated `/api/*`
  responses on shared devices (audit M-2).

## ▶️ YouTube owner checklist (Studio — only you can toggle)
- [ ] **"No, not made for kids"** on every video (and channel default).
- [ ] **"Altered or synthetic content"** ticked on every upload + as default.
- [ ] **Music cleared & credited** on every episode (log in each episode README;
      only Ep2's credits are currently recorded — verify the rest).
- [ ] Non-affiliation line (above) in every description.

## Exactly what to ask the lawyer
1. Classify our paid prediction game (skill vs sweepstakes vs gambling) for our
   target markets, and list the countries/states we must block or license in.
2. What KYC/AML/sanctions obligations apply to our USDT deposits/withdrawals?
3. Draft compliant Terms + Privacy (governing law, arbitration, territories, tax,
   AML/KYC, liability) and a sweepstakes "Official Rules" if we go that route.
4. Assess trademark/right-of-publicity exposure of the `WorldCup26` brand and the
   AI player-likeness videos; advise on disclaimers/changes.
