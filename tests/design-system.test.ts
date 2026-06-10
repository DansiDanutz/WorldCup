import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const globalsCss = readFileSync("src/app/globals.css", "utf8");
const homePage = readFileSync("src/app/page.tsx", "utf8");
const walletPage = readFileSync("src/app/wallet/page.tsx", "utf8");
const loginPage = readFileSync("src/app/login/page.tsx", "utf8");
const loginOgImage = readFileSync("src/app/login/opengraph-image.tsx", "utf8");
const coefficientsPage = readFileSync("src/app/coefficients/page.tsx", "utf8");
const schemaPage = readFileSync("src/app/schema/page.tsx", "utf8");
const previewPage = readFileSync("src/app/preview/page.tsx", "utf8");
const loginRegister = readFileSync("src/components/login-register.tsx", "utf8");
const dashboard = readFileSync("src/components/dashboard.tsx", "utf8");
const rootLayout = readFileSync("src/app/layout.tsx", "utf8");
const appLaunchSplash = readFileSync("src/components/app-launch-splash.tsx", "utf8");
const heroCard = readFileSync("src/components/hero-card.tsx", "utf8");
const heroSwiper = readFileSync("src/components/hero-swiper.tsx", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");
const myStanding = readFileSync("src/components/my-standing.tsx", "utf8");
const smartMenu = readFileSync("src/components/smart-menu.tsx", "utf8");
const adminConsole = readFileSync("src/components/admin-console.tsx", "utf8");
const support = readFileSync("src/lib/support.ts", "utf8");
const appIcon = readFileSync("src/app/icon.svg", "utf8");
const brandMark = readFileSync("public/brand-mark.svg", "utf8");
const logoLockup = readFileSync("public/logo-lockup.svg", "utf8");

function readCssBlock(selector: string) {
  const start = globalsCss.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `Missing CSS block for ${selector}`);
  const end = globalsCss.indexOf("\n}", start);
  assert.notEqual(end, -1, `Unclosed CSS block for ${selector}`);
  return globalsCss.slice(start, end + 2);
}
const webManifest = readFileSync("public/manifest.webmanifest", "utf8");
const serviceWorker = readFileSync("public/sw.js", "utf8");

describe("WorldCup design system integration", () => {
  it("keeps the core brand color tokens in the global stylesheet", () => {
    assert.match(globalsCss, /--green:\s*#106b4f/);
    assert.match(globalsCss, /--green-soft:\s*#e5f3ee/);
    assert.match(globalsCss, /--gold:\s*#c9942e/);
    assert.match(globalsCss, /--red:\s*#b84a45/);
    assert.match(globalsCss, /--text:\s*#0c1d1a/);
    assert.match(globalsCss, /--muted:\s*#5d6f69/);
    assert.match(globalsCss, /--border:\s*#d8e3df/);
    assert.match(globalsCss, /--shadow:\s*0 16px 45px rgba\(17, 43, 36, 0\.08\)/);
  });

  it("keeps the three-pick accent system available for rows and chips", () => {
    assert.match(globalsCss, /--pick-one-accent:\s*#106b4f/);
    assert.match(globalsCss, /--pick-two-accent:\s*#2f5fbd/);
    assert.match(globalsCss, /--pick-three-accent:\s*#b66b16/);
    assert.match(globalsCss, /\.pick-color-one/);
    assert.match(globalsCss, /\.pick-color-two/);
    assert.match(globalsCss, /\.pick-color-three/);
  });

  it("keeps the handoff brand assets wired into auth and app metadata", () => {
    assert.match(loginRegister, /\/logo-lockup\.svg/);

    for (const asset of [appIcon, brandMark, logoLockup]) {
      assert.match(asset, /#106b4f/);
      assert.match(asset, /WorldCup/);
      assert.match(asset, /stroke-linecap="round"/);
      assert.match(asset, /stroke-linejoin="round"/);
    }
  });

  it("keeps referral invites polished for WhatsApp sharing", () => {
    const invitePanelRule = readCssBlock(".invite-panel");
    const accountStatusRule = readCssBlock(".invite-panel .account-status-grid div");
    const referralCodeRule = readCssBlock(".referral-code-card strong");

    assert.match(
      dashboard,
      /I invited you to WorldCup26\.[\s\S]*?Pick 3 teams free, track your private points preview/,
    );
    assert.match(dashboard, /Use my referral code \$\{myReferralCode\}/);
    assert.match(dashboard, /className="invite-preview-card"/);
    assert.match(dashboard, /className="invite-link-card"/);
    assert.match(dashboard, /<MessageCircle size=\{16\} \/>[\s\S]*?Send invite/);
    assert.match(dashboard, /<ClipboardCopy size=\{16\} \/>[\s\S]*?Copy link/);
    assert.match(globalsCss, /\.invite-preview-card\s*{[\s\S]*?linear-gradient\(135deg/);
    assert.match(invitePanelRule, /linear-gradient\(145deg,\s*rgba\(5,\s*42,\s*32,\s*0\.98\)/);
    assert.match(accountStatusRule, /rgba\(0,\s*0,\s*0,\s*0\.16\)/);
    assert.match(referralCodeRule, /font-size:\s*clamp\(22px,\s*7vw,\s*28px\);/);
    assert.match(referralCodeRule, /white-space:\s*nowrap;/);
    assert.doesNotMatch(referralCodeRule, /overflow-wrap:\s*anywhere;/);
    assert.match(loginPage, /title:\s*"Join WorldCup26"/);
    assert.match(loginPage, /You are invited to WorldCup26/);
    assert.match(loginOgImage, /Referral invite/);
    assert.match(loginOgImage, /Pick 3 teams free before kickoff\./);
    assert.match(loginOgImage, /Track your private points preview, then use a ticket for the paid leaderboard\./);
  });

  it("keeps WhatsApp support reachable from user-facing app surfaces", () => {
    assert.match(support, /SUPPORT_WHATSAPP_E164 = "\+40750257337"/);
    assert.match(support, /SUPPORT_WHATSAPP_URL = `https:\/\/wa\.me\/\$\{SUPPORT_WHATSAPP_NUMBER\}`/);
    assert.match(support, /export function buildSupportWhatsAppUrl\(message: string\)/);
    assert.match(support, /url\.searchParams\.set\("text", trimmed\)/);
    assert.match(dashboard, /SUPPORT_WHATSAPP_URL/);
    assert.match(dashboard, /buildSupportWhatsAppUrl/);
    assert.match(dashboard, /WhatsApp support/);
    assert.match(dashboard, /WhatsApp pick help/);
    assert.match(dashboard, /WhatsApp deposit help/);
    assert.match(dashboard, /WhatsApp agent-code help/);
    assert.match(dashboard, /WhatsApp passive income help/);
    assert.match(walletScreen, /SUPPORT_WHATSAPP_URL/);
    assert.match(walletScreen, /buildSupportWhatsAppUrl/);
    assert.match(walletScreen, /WhatsApp support/);
    assert.match(walletScreen, /WhatsApp deposit help/);
    assert.match(walletScreen, /WhatsApp agent help/);
    assert.match(walletScreen, /WhatsApp passive income help/);
    assert.match(heroSwiper, /WhatsApp help/);
    assert.match(heroSwiper, /WhatsApp agent help/);
    assert.match(loginRegister, /Need help\?/);
    assert.match(loginRegister, /href=\{SUPPORT_WHATSAPP_URL\}/);
    assert.doesNotMatch(loginRegister, /Need help\? WhatsApp/);
    assert.doesNotMatch(loginRegister, /SUPPORT_WHATSAPP_E164/);
    assert.match(adminConsole, /SUPPORT_WHATSAPP_URL/);
    assert.match(globalsCss, /\.auth-support-link\s*{[\s\S]*?display:\s*inline-flex;/);
    assert.match(globalsCss, /\.auth-support-link\s*{[\s\S]*?text-decoration:\s*none;/);
    assert.match(globalsCss, /\.whatsapp-help-link\s*{[\s\S]*?rgba\(37,\s*211,\s*102,\s*0\.36\)/);
    assert.match(globalsCss, /\.hero-cta--whatsapp\s*{/);
    assert.match(globalsCss, /\.panel-header-actions\s*{/);
    assert.match(globalsCss, /\.auth-connected-card\s*{[\s\S]*?linear-gradient\(135deg,\s*rgba\(17,\s*123,\s*88,\s*0\.64\)/);
    assert.match(globalsCss, /\.auth-connected-card strong\s*{[\s\S]*?color:\s*#ffffff;/);
  });

  it("keeps the root layout from forcing mobile horizontal overflow", () => {
    assert.match(globalsCss, /html\s*{[\s\S]*?min-width:\s*0;/);
    assert.doesNotMatch(globalsCss, /html\s*{[\s\S]*?min-width:\s*320px;/);
  });

  it("keeps the design handoff flag-wall identity on the auth screen", () => {
    assert.match(loginRegister, /flagTeams/);
    assert.match(loginRegister, /flagcdn\.com\/w80/);
    assert.match(loginRegister, /flag-wall/);
    assert.match(loginRegister, /Predict the Game/);
    assert.match(loginRegister, /motto-accent/);
    assert.match(globalsCss, /\.flag-wall/);
    assert.match(globalsCss, /\.flag-grid/);
    assert.match(globalsCss, /\.motto-accent\s*{[\s\S]*?color:\s*var\(--gold\);/);
  });

  it("keeps registration first with two tappable referral path cards", () => {
    assert.match(loginRegister, /Register first/);
    assert.match(loginRegister, /const \[signupPath, setSignupPath\]/);
    assert.match(loginRegister, /auth-choice-grid auth-choice-grid--buttons/);
    assert.match(loginRegister, /I have an inviter/);
    assert.match(loginRegister, /Your own future referrals can earn 5%/);
    assert.match(loginRegister, /Direct signup/);
    assert.match(loginRegister, /invite friends and earn 5%/);
    assert.match(loginPage, /searchParams/);
    assert.match(loginPage, /initialReferralCode=\{refParam \?\? null\}/);
    assert.match(loginRegister, /initialReferralCode/);
    assert.match(loginRegister, /normalizedInitialReferralCode/);
    assert.match(loginRegister, /referralCodeAppliedFromLink/);
    assert.match(loginRegister, /showSignupPathOptions = !referralCodeAppliedFromLink/);
    assert.match(loginRegister, /\{showSignupPathOptions \? \(/);
    assert.match(loginRegister, /<span className="field-label">Inviter code<\/span>/);
    assert.match(loginRegister, /applied-referral-code/);
    assert.match(loginRegister, /Code applied/);
    assert.match(loginRegister, /htmlFor="login-referral-code"/);
    assert.match(loginRegister, /setSignupPath\(nextReferralCode \? "referral" : null\)/);
    assert.match(loginRegister, /showReferralForm/);
    assert.match(loginRegister, /showGoogleAuth/);
    assert.match(loginRegister, /const canContinueWithReferral = Boolean\(referralCode && referralInviter && referralAccepted\)/);
    assert.match(loginRegister, /referral-acceptance/);
    assert.match(loginRegister, /I accept/);
    assert.match(loginRegister, /referralAgreementText/);
    assert.doesNotMatch(loginRegister, /referralAgreementText\.replace/);
    assert.doesNotMatch(loginRegister, /referralAutoAcceptText/);
    assert.match(loginRegister, /disabled=\{!referralInviter \|\| referralAccepted\}/);
    assert.match(loginRegister, /Accept the referral agreement to continue with Google/);
    assert.match(loginRegister, /disabled=\{!canContinue\}/);
    assert.doesNotMatch(loginRegister, /referral-consent/);
    assert.match(loginRegister, /prompt:\s*"select_account"/);
    assert.match(loginRegister, /Continue with Google/);
    assert.match(loginRegister, /auth-choice-card--referral/);
    assert.match(loginRegister, /auth-choice-card--direct/);
    assert.match(globalsCss, /\.referral-acceptance/);
    assert.match(globalsCss, /\.applied-referral-code/);
    assert.match(globalsCss, /\.field label,\n\.field-label/);
    assert.match(loginRegister, /auth-worldcup-card/);
    assert.match(loginRegister, /auth-worldcup-card__body/);
    assert.match(loginRegister, /auth-info-card/);
    assert.match(loginRegister, /How it works/);
    assert.match(loginRegister, /Referral rates/);
    assert.match(loginRegister, /Agent Wanted/);
    assert.match(loginRegister, /Every 10 paid ticket codes unlock 1 extra free ticket code/);
    assert.match(loginRegister, /Register as an agent in Wallet/);
    assert.match(loginRegister, /All 48 teams/);
    assert.match(loginRegister, /All 48 teams can still be chosen/);
    assert.match(loginRegister, /The event has not started yet, so every team is still available for new entries/);
    assert.match(dashboard, /The event has not started yet, so all 48 teams are still available/);
    assert.match(loginRegister, /disabled=\{!canContinue\}/);
    assert.doesNotMatch(globalsCss, /\.referral-consent/);
    assert.match(globalsCss, /\.auth-card\s*{[\s\S]*?linear-gradient\(155deg/);
    assert.match(globalsCss, /\.auth-choice-grid button\.auth-choice-card--referral\s*{[\s\S]*?--choice-accent:\s*#f08a24;/);
    assert.match(globalsCss, /\.auth-choice-grid button\.auth-choice-card--direct\s*{[\s\S]*?--choice-accent:\s*#f3c858;/);
    assert.match(globalsCss, /@keyframes auth-choice-referral-pulse/);
    assert.match(globalsCss, /@keyframes auth-choice-direct-pulse/);
    assert.match(globalsCss, /\.auth-choice-grid button\.active/);
    assert.match(globalsCss, /\.auth-worldcup-card > summary/);
    assert.match(globalsCss, /\.auth-info-card summary/);
    assert.match(globalsCss, /\.flag-wall-note/);
    assert.match(globalsCss, /\.auth-google-button/);
    assert.match(globalsCss, /auth-info-grid/);
  });

  it("keeps mobile navigation inside the viewport instead of widening the page", () => {
    assert.match(globalsCss, /\.topbar\s*{[\s\S]*?border-radius:\s*20px;/);
    assert.match(globalsCss, /\.topbar\s*{[\s\S]*?linear-gradient\(135deg/);
    assert.match(globalsCss, /\.landing-brand-lockup\s*{[\s\S]*?flex:\s*0\s+0\s+auto;/);
    assert.match(globalsCss, /\.landing-brand-copy\s*{[\s\S]*?flex:\s*0\s+0\s+auto;/);
    assert.doesNotMatch(globalsCss.match(/\.landing-brand-copy strong\s*{[^}]*}/)?.[0] ?? "", /text-overflow/);
    assert.match(globalsCss, /\.nav\s*{[\s\S]*?background:\s*rgba\(4,\s*18,\s*15,\s*0\.34\);/);
    assert.match(globalsCss, /\.nav-item--primary\s*{[\s\S]*?linear-gradient\(180deg,\s*#ffe29a,\s*#e6b653\)/);
    assert.match(globalsCss, /\.nav-item--admin\s*{[\s\S]*?linear-gradient\(135deg/);
    assert.match(globalsCss, /\.smart-menu\.is-closed \.smart-menu__toggle\s*{[\s\S]*?linear-gradient\(180deg,\s*#ffe29a,\s*#e6b653\)/);
    assert.match(globalsCss, /\.nav-more__menu\s*{[\s\S]*?position:\s*absolute;/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--landing \.smart-menu__toggle\s*{[\s\S]*?display:\s*none;/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--landing \.nav-item__copy strong,[\s\S]*?text-overflow:\s*ellipsis;/);
    assert.match(globalsCss, /@media \(min-width:\s*761px\) and \(max-width:\s*1180px\)\s*{[\s\S]*?\.app-shell--landing \.topbar\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\) auto;/);
    assert.match(globalsCss, /@media \(min-width:\s*761px\) and \(max-width:\s*1180px\)\s*{[\s\S]*?\.app-shell--landing \.smart-menu\s*{[\s\S]*?grid-column:\s*1 \/ -1;/);
    assert.match(globalsCss, /\.nav a,[\s\S]*?\.nav-more summary\s*{[\s\S]*?white-space:\s*nowrap;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.topbar\s*{[\s\S]*?flex-direction:\s*column;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.smart-menu\s*{[\s\S]*?flex-direction:\s*column;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.grid,[\s\S]*?\.auth-page,[\s\S]*?\.coefficients-hero,[\s\S]*?\.schema-hero,[\s\S]*?\.matches-section,[\s\S]*?\.knockout-board,[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.knockout-board\s*{[\s\S]*?overflow-x:\s*visible;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.knockout-column\s*{[\s\S]*?min-width:\s*0;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?display:\s*grid;/);
    assert.match(
      globalsCss,
      /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/,
    );
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.nav-more\s*{[\s\S]*?grid-column:\s*1\s*\/\s*-1;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.nav-more__menu\s*{[\s\S]*?position:\s*static;/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?display:\s*grid;/);
    assert.match(
      globalsCss,
      /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/,
    );
    assert.match(globalsCss, /@media \(max-width:\s*420px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.nav a,\s*\n\s*\.nav button,\s*\n\s*\.nav-more summary\s*{[\s\S]*?width:\s*100%;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.nav a,\s*\n\s*\.nav button,\s*\n\s*\.nav-more summary\s*{[\s\S]*?height:\s*auto;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.nav-item__copy strong,[\s\S]*?white-space:\s*normal;/);
    assert.match(globalsCss, /\.admin-referral-row span\s*{[\s\S]*?overflow-wrap:\s*anywhere;/);
    assert.match(
      globalsCss,
      /@media \(max-width:\s*700px\)\s*{[\s\S]*?\.admin-report-header,\s*\n\s*\.admin-referral-row\s*{[\s\S]*?flex-direction:\s*column;/,
    );
    assert.match(
      globalsCss,
      /@media \(max-width:\s*700px\)\s*{[\s\S]*?\.admin-referral-row > div:last-child\s*{[\s\S]*?justify-items:\s*start;/,
    );
    assert.doesNotMatch(
      globalsCss,
      /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?overflow-x:\s*auto;/,
    );
    assert.doesNotMatch(globalsCss, /\.nav a:first-child/);
    assert.match(
      globalsCss,
      /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.topbar\s*{[^}]*overflow:\s*visible;/,
    );
    assert.doesNotMatch(
      globalsCss,
      /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.topbar\s*{[^}]*overflow:\s*hidden;/,
    );
  });

  it("keeps app topbars on the same card-style menu system", () => {
    const topbarSurfaces = [
      ["dashboard", dashboard],
      ["wallet", walletScreen],
      ["coefficients", coefficientsPage],
      ["schema", schemaPage],
      ["preview", previewPage],
      ["admin", adminConsole],
    ] as const;

    for (const [label, source] of topbarSurfaces) {
      assert.match(source, /<SmartMenu[\s\S]*?>/, `${label} can minimize and maximize nav cards`);
      assert.match(source, /<nav className="nav nav--app"/, `${label} uses nav--app`);
      assert.match(source, /className="nav-item nav-item--primary"/, `${label} has a primary action`);
      assert.match(source, /nav-item__copy/, `${label} gives nav items readable subcopy`);
    }
  });

  it("keeps admin ticket accounting previews responsive and on-brand", () => {
    assert.match(adminConsole, /ticket-admin-preview/);
    assert.match(globalsCss, /\.ticket-admin-preview\s*{[\s\S]*?linear-gradient\(135deg/);
    assert.match(globalsCss, /\.ticket-admin-preview__grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\);/);
    assert.match(globalsCss, /\.ticket-admin-preview__grid strong\s*{[\s\S]*?color:\s*#ffe29a;/);
    assert.match(globalsCss, /\.ticket-admin-preview--warning\s*{/);
    assert.match(
      globalsCss,
      /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.ticket-admin-preview__grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/,
    );
    assert.match(
      globalsCss,
      /@media \(max-width:\s*700px\)\s*{[\s\S]*?\.ticket-admin-preview__grid\s*{[\s\S]*?grid-template-columns:\s*1fr;/,
    );
  });

  it("keeps every topbar brand block clickable back to home", () => {
    assert.match(dashboard, /<Link className="brand landing-brand-lockup" href="\/" aria-label="Go to WorldCup26\.world home">/);
    assert.match(walletScreen, /<Link className="brand" href="\/" aria-label="Go to WorldCup26\.world home">/);
    assert.match(adminConsole, /<Link className="brand" href="\/" aria-label="Go to WorldCup26\.world home">/);
    assert.match(globalsCss, /\.brand:focus-visible\s*{/);
  });

  it("keeps the smart menu clickable and compact on mobile", () => {
    assert.match(smartMenu, /"use client";/);
    assert.match(smartMenu, /const \[expanded, setExpanded\] = useState\(true\);/);
    assert.match(smartMenu, /window\.matchMedia\("\(max-width: 1180px\)"\)/);
    assert.match(smartMenu, /const syncExpandedState = \(\) => setExpanded\(!mediaQuery\.matches\);/);
    assert.match(smartMenu, /function closeAfterDestinationClick\(event: MouseEvent<HTMLDivElement>\)/);
    assert.match(smartMenu, /target\.closest\("a, button"\)/);
    assert.match(smartMenu, /setExpanded\(false\);/);
    assert.match(smartMenu, /className="smart-menu__mark"/);
    assert.match(smartMenu, /<div[\s\S]*?className="smart-menu__panel"[\s\S]*?hidden=\{!expanded\}[\s\S]*?id=\{panelId\}[\s\S]*?onClick=\{closeAfterDestinationClick\}[\s\S]*?\{children\}[\s\S]*?<\/div>[\s\S]*?<button/);
    assert.match(smartMenu, /aria-expanded=\{expanded\}/);
    assert.match(smartMenu, /aria-label=\{expanded \? "Hide navigation cards" : "Show navigation cards"\}/);
    assert.match(smartMenu, /onClick=\{\(\) => setExpanded\(\(current\) => !current\)\}/);
    assert.match(smartMenu, /hidden=\{!expanded\}/);
    assert.match(smartMenu, /summary = "Tap for pages"/);
    assert.match(smartMenu, /expanded \? "Tabs open" : summary/);
    assert.doesNotMatch(smartMenu, /Minimize cards/);
  });

  it("uses the active Supabase session for logged-in navigation and wallet state", () => {
    assert.match(dashboard, /const signedInWithGoogle = Boolean\(session\?\.access_token && session\.user\.email\);/);
    assert.match(walletScreen, /const signedIn = Boolean\(session\?\.access_token && session\.user\.email\);/);
    assert.match(dashboard, /const ownerAdminEmail = "semebitcoin@gmail\.com"/);
    assert.match(walletScreen, /const ownerAdminEmail = "semebitcoin@gmail\.com"/);
    assert.match(dashboard, /fetch\("\/api\/admin\/me"/);
    assert.match(dashboard, /setIsAdmin\(response\.ok && Boolean\(result\.admin\)\);/);
    assert.match(dashboard, /setIsAdmin\(false\);/);
    assert.match(walletScreen, /fetch\("\/api\/admin\/me"/);
    assert.match(walletScreen, /setIsAdmin\(Boolean\(data\.admin\)\);/);
    assert.match(walletScreen, /setIsAdmin\(false\);/);
    assert.match(dashboard, /const showAdminNav = session\?\.user\.email\?\.trim\(\)\.toLowerCase\(\) === ownerAdminEmail/);
    assert.match(walletScreen, /const showAdminNav = session\?\.user\.email\?\.trim\(\)\.toLowerCase\(\) === ownerAdminEmail/);
    assert.doesNotMatch(dashboard, /const showAdminNav =[\s\S]*?isAdmin \|\|/);
    assert.doesNotMatch(walletScreen, /const showAdminNav =[\s\S]*?isAdmin \|\|/);
    assert.match(dashboard, /<main className=\{`app-shell app-shell--landing \$\{showPickWorkflow \? "" : "app-shell--post-entry"\}`\}>/);
    assert.match(dashboard, /<nav className="nav nav--app" aria-label="Primary navigation">/);
    assert.match(dashboard, /const showPickWorkflow = !accountHasEntry && !waitingForAccountStatus;/);
    assert.match(dashboard, /className="nav-item nav-item--primary" href=\{showPickWorkflow \? "#pick" : "#me"\}/);
    assert.match(dashboard, /showPickWorkflow \? "Pick Teams" : "Account"/);
    assert.match(dashboard, /showPickWorkflow \? "Main task" : "Your entry"/);
    assert.match(dashboard, /href="#leaderboard"[\s\S]*?Leaderboard[\s\S]*?Ranking[\s\S]*?pathname: "\/wallet"[\s\S]*?Wallet[\s\S]*?Tickets & USDT[\s\S]*?nav-item--admin[\s\S]*?pathname: "\/admin"[\s\S]*?Admin[\s\S]*?Manage[\s\S]*?<details className="nav-more">[\s\S]*?Explore[\s\S]*?Rules & draw/);
    assert.match(dashboard, /<details className="nav-more">[\s\S]*?Explore[\s\S]*?Rules & draw[\s\S]*?href="#rules"[\s\S]*?pathname: "\/schema"/);
    assert.match(dashboard, /\{showAdminNav \? \([\s\S]*?pathname: "\/admin"[\s\S]*?Admin[\s\S]*?\) : null\}/);
    assert.match(dashboard, /<details className="nav-more">[\s\S]*?<\/details>[\s\S]*?\{signedInWithGoogle && showPickWorkflow \? \([\s\S]*?className="nav-item nav-item--identity" href="#me"[\s\S]*?Account[\s\S]*?\) : !signedInWithGoogle \? \([\s\S]*?className="nav-item nav-item--identity"[\s\S]*?pathname: "\/login"[\s\S]*?Login[\s\S]*?\) : null\}/);
    assert.match(walletScreen, /<nav className="nav nav--app" aria-label="Wallet navigation">/);
    assert.match(walletScreen, /className="nav-item nav-item--primary" href=\{\{ pathname: "\/", hash: "pick" \}\}[\s\S]*?Play[\s\S]*?Pick teams/);
    assert.match(walletScreen, /nav-item--admin[\s\S]*?pathname: "\/admin"[\s\S]*?Admin[\s\S]*?Manage/);
    assert.match(walletScreen, /<details className="nav-more">[\s\S]*?Explore[\s\S]*?Rules & game/);
    assert.match(walletScreen, /<details className="nav-more">[\s\S]*?<\/details>[\s\S]*?\{signedIn \? \([\s\S]*?className="nav-item nav-item--identity"[\s\S]*?Account[\s\S]*?\) : \([\s\S]*?className="nav-item nav-item--identity"[\s\S]*?pathname: "\/login"[\s\S]*?Login/);
    assert.doesNotMatch(dashboard, /const signedInWithGoogle = session\?\.user\.app_metadata\.provider === "google";/);
    assert.doesNotMatch(walletScreen, /const signedIn = session\?\.user\.app_metadata\.provider === "google";/);
  });

  it("keeps the agent deal surfaced in the landing swiper", () => {
    assert.match(heroSwiper, /"Agent Deal"/);
    assert.match(heroSwiper, /function AgentDealPoster/);
    assert.match(heroSwiper, /Every 10 paid codes earns 1 extra ticket code\./);
    assert.match(heroSwiper, /Open Agent Codes/);
    assert.match(heroSwiper, /hero-card__photo/);
    assert.match(globalsCss, /\.hero-card--agent/);
    assert.match(globalsCss, /--hero-photo:\s*url\("\/agent-deal-bg\.png"\)/);
    assert.equal(existsSync("public/agent-deal-bg.png"), true);
  });

  it("keeps the landing brand lockup in the fixed menu bar", () => {
    assert.match(dashboard, /className="brand landing-brand-lockup"/);
    assert.match(dashboard, /WorldCup26<span className="hero-brand__tld">\.world<\/span>/);
    assert.match(dashboard, /Prediction Game/);
    assert.match(dashboard, /className="landing-brand-year"/);
    assert.match(dashboard, /2026/);
    assert.match(globalsCss, /\.landing-brand-lockup\s*{/);
    assert.match(globalsCss, /\.landing-brand-copy strong\s*{[\s\S]*?white-space:\s*nowrap;/);
    assert.match(globalsCss, /\.landing-brand-year\s*{[\s\S]*?border-radius:\s*999px;/);
    assert.match(globalsCss, /@media \(max-width:\s*420px\)/);
    assert.match(globalsCss, /\.app-shell--landing \.topbar\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\) auto;/);
    assert.match(globalsCss, /\.landing-brand-year \.hero-edition__dot\s*{[\s\S]*?width:\s*6px;/);
    assert.doesNotMatch(dashboard, /<span>WorldCup<\/span>/);
  });

  it("does not duplicate the brand mini-card inside the first matchup poster", () => {
    assert.doesNotMatch(heroCard, /className="hero-mini hero-brand"/);
    assert.doesNotMatch(heroCard, /className="hero-edition"/);
    assert.doesNotMatch(heroCard, /Predict the Game/);
    assert.match(heroCard, /Pick 3 Teams/);
    assert.match(heroCard, /Top 10 Rewarded/);
  });

  it("keeps the first poster installable as a PWA without hiding Play now", () => {
    assert.match(rootLayout, /manifest:\s*"\/manifest\.webmanifest"/);
    assert.match(rootLayout, /appleWebApp:\s*{/);
    assert.match(rootLayout, /\/icons\/icon-192\.png/);
    assert.match(rootLayout, /\/icons\/apple-touch-icon\.png/);
    assert.match(webManifest, /"display":\s*"standalone"/);
    assert.match(webManifest, /"start_url":\s*"\/\?source=pwa"/);
    assert.match(webManifest, /"purpose":\s*"maskable"/);
    assert.match(serviceWorker, /self\.addEventListener\("fetch"/);
    assert.match(serviceWorker, /event\.request\.destination !== "document"/);
    assert.match(heroCard, /beforeinstallprompt/);
    assert.match(heroCard, /INSTALL_CONFIRMATION_KEY/);
    assert.match(heroCard, /function isLocalDevelopmentHost/);
    assert.match(heroCard, /navigator\.serviceWorker\.getRegistrations\(\)/);
    assert.match(heroCard, /key\.startsWith\("worldcup26-shell"\)/);
    assert.match(heroCard, /navigator\.serviceWorker\.register\("\/sw\.js"\)/);
    assert.match(heroCard, /installState === "available" \? "hero-cta-row" : "hero-cta-row hero-cta-row--single"/);
    assert.match(heroCard, /Play now/);
    assert.match(heroCard, /Install app/);
    assert.match(heroCard, /showInstalledConfirmation/);
    assert.match(heroCard, /window\.localStorage\.setItem\(INSTALL_CONFIRMATION_KEY,\s*"true"\)/);
    assert.match(heroCard, /App installed\. Open WorldCup26 from your apps to stay signed in\./);
    assert.doesNotMatch(heroCard, /\{installed \? "App installed" : "Install app"\}/);
    assert.match(heroCard, /Add to Home Screen/);
    assert.match(globalsCss, /\.hero-cta-row\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
    assert.match(globalsCss, /\.hero-cta-row--single\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);/);
    assert.match(globalsCss, /\.hero-cta--install\s*{/);
    assert.match(globalsCss, /\.hero-cta--install\s*{[\s\S]*?linear-gradient\(180deg,\s*#d94a3f,\s*#a92923\)/);
    assert.match(globalsCss, /\.hero-install-note--success\s*{/);
    assert.match(globalsCss, /\.hero-install-help\s*{/);
    for (const icon of [
      "public/icons/icon-192.png",
      "public/icons/icon-512.png",
      "public/icons/maskable-512.png",
      "public/icons/apple-touch-icon.png",
    ]) {
      assert.equal(existsSync(icon), true);
    }
  });

  it("keeps installed-app launches branded with stars and best-effort crowd audio", () => {
    assert.match(rootLayout, /import \{ AppLaunchSplash \}/);
    assert.match(rootLayout, /<AppLaunchSplash \/>/);
    assert.match(appLaunchSplash, /"use client";/);
    assert.match(appLaunchSplash, /display-mode:\s*standalone/);
    assert.match(appLaunchSplash, /android-app:\/\//);
    assert.match(appLaunchSplash, /webkitAudioContext/);
    assert.match(appLaunchSplash, /createBuffer/);
    assert.match(appLaunchSplash, /pointerdown/);
    assert.match(appLaunchSplash, /keydown/);
    assert.match(appLaunchSplash, /\/icons\/maskable-512\.png/);
    assert.match(globalsCss, /\.app-launch-splash\s*{/);
    assert.match(globalsCss, /\.app-launch-splash__stars/);
    assert.match(globalsCss, /\.app-launch-splash__lights/);
    assert.match(globalsCss, /@keyframes launch-star-twinkle/);
    assert.match(globalsCss, /@keyframes launch-stadium-sweep/);
    assert.match(globalsCss, /prefers-reduced-motion:\s*reduce/);
  });

  it("keeps the three-team pick workflow guided on mobile", () => {
    assert.match(dashboard, /const remainingPickCount = Math\.max\(0, 3 - selectedTeams\.length\);/);
    assert.match(dashboard, /const pickInstruction =/);
    assert.match(dashboard, /function removeTeam\(teamId: string\)/);
    assert.match(dashboard, /function clearSelectedTeams\(\)/);
    assert.match(dashboard, /className="pick-flow"/);
    assert.match(dashboard, /aria-label="Team pick progress"/);
    assert.match(dashboard, /className="pick-slot-strip"/);
    assert.match(dashboard, /Continue to Entry/);
    assert.match(dashboard, /compactTeamCount/);
    assert.match(dashboard, /showAllTeams/);
    assert.match(dashboard, /All Teams/);
    assert.match(dashboard, /teamListRef/);
    assert.match(dashboard, /teamListExpanded/);
    assert.match(dashboard, /function handleTeamListTouchMove/);
    assert.match(dashboard, /onTouchMove=\{handleTeamListTouchMove\}/);
    assert.match(dashboard, /window\.scrollTo\(\{ top: Math\.max\(0, targetTop\), behavior: "smooth" \}\);/);
    assert.match(dashboard, /function handleTeamRowPointerMove/);
    assert.match(dashboard, /suppressTeamRowClick/);
    assert.match(dashboard, /role="button"/);
    assert.match(dashboard, /aria-disabled=\{unavailable\}/);
    assert.match(dashboard, /className="panel pick-panel"/);
    assert.match(dashboard, /const atPickLimit = selectedTeams\.length >= 3 && !selected;/);
    assert.match(dashboard, /const firstMatchStart = formatPickDeadline/);
    assert.match(dashboard, /function formatDateTime[\s\S]*?timeZone:\s*"UTC"/);
    assert.match(dashboard, /function formatPickDeadline[\s\S]*?timeZone:\s*"UTC"/);
    assert.doesNotMatch(dashboard, /new Date\(pendingAgentTicketRequest\.expiresAt\)\.toLocaleString\(\)/);
    assert.match(dashboard, /Pick before first match/);
    assert.match(dashboard, /getTeamColorStyle/);
    assert.equal(
      dashboard.match(/style=\{team \? getTeamColorStyle\(team\.id\) : undefined\}/g)?.length,
      3,
    );
    assert.match(dashboard, /one-minute-before-first-match lock time/);
    assert.match(dashboard, /Matchday 1 runs 11-17 June 2026/);
    assert.match(dashboard, /className="team-row-action"/);
    assert.match(dashboard, /className="team-coef-badge"/);
    assert.match(dashboard, /className="team-deadline"/);
    assert.match(dashboard, /No teams found/);
    assert.match(dashboard, /<div className="panel" id="entry">/);
    assert.match(globalsCss, /\.pick-flow\s*{/);
    assert.match(globalsCss, /\.pick-panel\s*{/);
    assert.match(globalsCss, /\.all-teams-toggle\s*{/);
    assert.match(globalsCss, /\.pick-slot-strip\s*{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
    assert.match(globalsCss, /\.team-row\s*{[\s\S]*?grid-template-columns:\s*36px minmax\(0,\s*1fr\) 74px 72px 76px;/);
    assert.match(globalsCss, /\.team-row\s*{[\s\S]*?--team-color-one/);
    assert.match(globalsCss, /\.pick-slot-card:not\(\.empty-slot\)\s*{[\s\S]*?--team-color-one/);
    assert.match(globalsCss, /\.selected-team:not\(\.empty-slot\)\s*{[\s\S]*?--team-color-one/);
    assert.match(globalsCss, /\.team-row\s*{[\s\S]*?touch-action:\s*pan-y;/);
    assert.match(globalsCss, /\.team-row > \*\s*{[\s\S]*?pointer-events:\s*none;[\s\S]*?touch-action:\s*pan-y;/);
    assert.match(globalsCss, /\.team-list\s*{[\s\S]*?-webkit-overflow-scrolling:\s*touch;/);
    assert.match(globalsCss, /\.team-list\s*{[\s\S]*?touch-action:\s*pan-y;/);
    assert.match(globalsCss, /\.team-list\s*{[\s\S]*?overscroll-behavior-y:\s*contain;/);
    assert.match(globalsCss, /\.team-list--expanded\s*{[\s\S]*?max-height:\s*min\(760px,\s*72vh\);[\s\S]*?overflow-y:\s*auto;/);
    assert.match(globalsCss, /\.team-list--expanded\s*{[\s\S]*?overscroll-behavior-y:\s*contain;/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.team-list\.team-list--expanded\s*{[\s\S]*?max-height:\s*min\(760px,\s*72vh\);[\s\S]*?overflow-y:\s*auto;/);
    assert.match(globalsCss, /\.leaderboard-list,[\s\S]*?\.match-list\s*{[\s\S]*?overscroll-behavior-y:\s*contain;/);
    assert.match(globalsCss, /\.code-list\s*{[\s\S]*?overscroll-behavior-y:\s*contain;/);
    assert.match(globalsCss, /\.ref-list\s*{[\s\S]*?overscroll-behavior-y:\s*contain;/);
    assert.match(globalsCss, /\.team-coef-badge\s*{/);
    assert.match(globalsCss, /\.team-deadline\s*{/);
    assert.match(globalsCss, /\.team-deadline\s*{[\s\S]*?color:\s*#ffb44c;/);
    assert.match(globalsCss, /\.team-row-action\s*{/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.pick-slot-strip\s*{[\s\S]*?grid-template-columns:\s*1fr;/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.team-row\s*{[\s\S]*?grid-template-columns:\s*30px minmax\(0,\s*1fr\) auto auto;/);
    assert.match(globalsCss, /@media \(max-width:\s*420px\)\s*{[\s\S]*?\.team-row \.coefficient\s*{[\s\S]*?display:\s*none;/);
  });

  it("keeps free preview first with ticket guidance before paid leaderboard locking", () => {
    assert.match(dashboard, /const accountStatusLoaded = myAccountStatus !== null/);
    assert.match(dashboard, /const hasEntryTicket = ticketsAvailable > 0/);
    assert.match(dashboard, /const needsEntryTicketPurchase = signedInWithGoogle && accountStatusLoaded && !hasEntryTicket/);
    assert.match(dashboard, /const showEntryTicketPurchase = !hasEntryTicket && needsEntryTicketPurchase/);
    assert.match(dashboard, /page--post-entry/);
    assert.match(dashboard, /const missingEntryTicket =/);
    assert.match(dashboard, /const entryDraftBlocker = getEntryDraftBlocker/);
    assert.match(dashboard, /const entryLockBlocker = getEntryLockBlocker/);
    assert.match(dashboard, /const entryActionBlocker = hasEntryTicket \? entryLockBlocker : entryDraftBlocker/);
    assert.match(dashboard, /const entryActionLabel = hasEntryTicket/);
    assert.match(dashboard, /const entryLockHint =/);
    assert.match(dashboard, /Ticket is ready\. \$\{entryLockBlocker\}/);
    assert.match(dashboard, /selectedTeams\.length === 3 && !hasEntryTicket/);
    assert.match(dashboard, /displayName\?: string \| null/);
    assert.match(dashboard, /setDisplayName\(\(current\) =>/);
    assert.match(dashboard, /result\.entry\?\.displayName\?\.trim\(\)/);
    assert.match(dashboard, /result\.displayName\?\.trim\(\)/);
    assert.match(dashboard, /hasEntryTicket \? \(/);
    assert.match(dashboard, /\) : showEntryTicketPurchase \? \(/);
    assert.match(dashboard, /className=\{`ticket-requirement-card/);
    assert.match(dashboard, /Free picks first/);
    assert.match(dashboard, /Free preview is live/);
    assert.match(dashboard, /Paid leaderboard lock is mandatory ticket-based/);
    assert.match(dashboard, /must assign 1 ticket first/);
    assert.match(dashboard, /what\s+would happen if the draft were paid/);
    assert.match(dashboard, /Buy-in is covered\. Locking your saved picks will use 1 assigned ticket/);
    assert.match(dashboard, /The paid leaderboard is mandatory ticket-based/);
    assert.match(dashboard, /Ticket price/);
    assert.match(dashboard, /Your balance/);
    assert.match(dashboard, /USDT is manual: save your sender wallet/);
    assert.doesNotMatch(dashboard, /Buy with USDT/);
    assert.match(dashboard, /Agent Call/);
    assert.match(dashboard, /Enter only the agent code you received/);
    assert.match(dashboard, /htmlFor="agent-call-code"/);
    assert.match(dashboard, /placeholder="Paste agent code"/);
    assert.match(dashboard, /data-testid="agent-call-code"/);
    assert.doesNotMatch(dashboard, /Agent code or email/);
    assert.doesNotMatch(dashboard, /placeholder="Age"/);
    assert.match(dashboard, /Request ticket/);
    assert.match(dashboard, /\/api\/agent-ticket-requests/);
    assert.match(walletScreen, /Agent Call requests/);
    assert.match(walletScreen, /acceptAgentTicketRequest/);
    assert.match(dashboard, /disabled=\{Boolean\(entryActionBlocker\) \|\| isPending\}/);
    assert.match(dashboard, /submitEntry\(entryPrimaryAction\)/);
    assert.match(dashboard, /Save a draft to preview first/);
    assert.match(dashboard, /Update saved draft/);
    assert.match(dashboard, /Lock & enter prize pool/);
    assert.match(dashboard, /Lock my 3 teams/);
    assert.match(dashboard, /function getEntryLockBlocker/);
    assert.match(dashboard, /function getEntryDraftBlocker/);
    assert.doesNotMatch(dashboard, /signedInWithGoogle && consented !== true/);
    assert.doesNotMatch(dashboard, /Confirm once here if your Terms status is still loading/);
    assert.doesNotMatch(dashboard, /Accept the Terms below before locking/);
    assert.doesNotMatch(dashboard, /ageConfirmed|termsAccepted|submitConsent|MINIMUM_AGE/);
    assert.doesNotMatch(dashboard, /I confirm I am at least/);
    assert.match(walletScreen, /id="tickets"/);
    assert.match(walletScreen, /walletView === "agent" \? "wallet-panel-hidden" : ""/);
    assert.match(globalsCss, /\.ticket-requirement-card\s*{/);
    assert.match(globalsCss, /\.ticket-requirement-card\.needs-ticket/);
    assert.match(globalsCss, /\.ticket-requirement-actions\s*{/);
    assert.match(globalsCss, /\.ticket-ready-note\s*{/);
    assert.match(globalsCss, /\.agent-call-form\s*{[\s\S]*?grid-template-columns:\s*1fr;/);
    assert.match(globalsCss, /\.agent-call-form \.search,\s*[\s\S]*?\.agent-call-form \.button\s*{[\s\S]*?width:\s*100%;/);
    assert.match(globalsCss, /\.entry-lock-hint\s*{/);
    assert.match(globalsCss, /\.app-shell--landing \.page--post-entry\s*{[\s\S]*?padding-top:\s*112px;/);
    assert.match(globalsCss, /\.app-shell--landing\.app-shell--post-entry \.topbar\s*{[\s\S]*?position:\s*sticky;/);
    assert.match(globalsCss, /\.app-shell--landing\.app-shell--post-entry \.topbar\s*{[\s\S]*?transform:\s*none;/);
    assert.match(globalsCss, /\.topbar\s*{[\s\S]*?width:\s*min\(1680px,\s*calc\(100% - 24px\)\);/);
    assert.match(globalsCss, /\.app-shell--landing\.app-shell--post-entry \.page--post-entry\s*{[\s\S]*?width:\s*min\(1680px,\s*100%\);/);
    assert.match(globalsCss, /\.app-shell--landing\.app-shell--post-entry \.page--post-entry\s*{[\s\S]*?padding-top:\s*clamp\(16px,\s*1\.7vw,\s*28px\);/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--post-entry \.grid\.grid--entry-complete\s*{[\s\S]*?grid-template-columns:\s*minmax\(340px,\s*0\.76fr\) minmax\(520px,\s*1\.24fr\);/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--post-entry \.grid\.grid--entry-complete \.rules-panel\s*{[\s\S]*?grid-column:\s*1 \/ -1;/);
    assert.match(globalsCss, /@media \(min-width:\s*761px\) and \(max-width:\s*1180px\)\s*{[\s\S]*?\.app-shell--landing \.page--post-entry\s*{[\s\S]*?padding-top:\s*176px;/);
    assert.match(globalsCss, /@media \(min-width:\s*761px\) and \(max-width:\s*1180px\)\s*{[\s\S]*?\.app-shell--landing\.app-shell--post-entry \.page--post-entry\s*{[\s\S]*?padding-top:\s*20px;/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.app-shell--landing \.page--post-entry\s*{[\s\S]*?padding-top:\s*132px;/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.app-shell--landing\.app-shell--post-entry \.page--post-entry\s*{[\s\S]*?padding-top:\s*16px;/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.ticket-requirement-card\s*{[\s\S]*?grid-template-columns:\s*1fr;/);
  });

  it("keeps the signed-in account cards in the app's colored card system", () => {
    assert.match(myStanding, /standing-card standing-card--rank/);
    assert.match(myStanding, /standing-card standing-card--referrals/);
    assert.match(myStanding, /standing-card standing-card--agent/);
    assert.match(myStanding, /my-standing--agent/);
    assert.match(myStanding, /async function signOut/);
    assert.match(myStanding, /standing-signout/);
    assert.match(myStanding, /Sign out/);
    assert.match(myStanding, /standingModalOpen, setStandingModalOpen/);
    assert.match(myStanding, /standing-trophy-trigger/);
    assert.match(myStanding, /aria-controls="standing-leaderboard-modal"/);
    assert.match(myStanding, /standing-modal-backdrop/);
    assert.match(myStanding, /Top 10 leaderboard/);
    assert.match(myStanding, /Referral positions/);
    assert.match(myStanding, /referralsOpen, setReferralsOpen/);
    assert.match(myStanding, /referrals-trigger/);
    assert.match(myStanding, /aria-controls="standing-referrals-list"/);
    assert.match(myStanding, /referrals-list-panel--revealed/);
    assert.match(myStanding, /referral-position-row/);
    assert.match(myStanding, /formatPoints\(referral\.totalPoints\)/);
    assert.match(myStanding, /agent-gift-trigger/);
    assert.match(myStanding, /aria-controls="standing-agent-code"/);
    assert.match(myStanding, /AgentRecordTime label="Last assigned"/);
    assert.match(myStanding, /AgentRecordTime label="Last bought"/);
    assert.match(myStanding, /AgentRecordTime label="Last bonus"/);
    assert.match(myStanding, /className="agent-stat-date"/);
    assert.match(globalsCss, /\.standing-card\s*{[\s\S]*?linear-gradient\(145deg/);
    assert.match(globalsCss, /\.standing-card--rank\s*{[\s\S]*?--standing-accent:\s*#f0c060;/);
    assert.match(globalsCss, /\.standing-card--referrals\s*{[\s\S]*?--standing-accent:\s*#37d7a3;/);
    assert.match(globalsCss, /\.standing-card--agent\s*{[\s\S]*?--standing-accent:\s*#f0a13a;/);
    assert.match(globalsCss, /\.standing-main\s*{[\s\S]*?0 28px 76px/);
    assert.match(globalsCss, /\.standing-main::after\s*{[\s\S]*?repeating-linear-gradient\(90deg/);
    assert.match(globalsCss, /\.standing-main \.standing-rank__big:first-child\s*{[\s\S]*?rgba\(255,\s*226,\s*154,\s*0\.24\)/);
    assert.match(globalsCss, /\.standing-card \.panel-header > svg\s*{[\s\S]*?linear-gradient\(180deg,\s*#ffe29a/);
    assert.match(globalsCss, /\.standing-trophy-trigger\s*{[\s\S]*?animation:\s*wc-standing-trophy-breathe/);
    assert.match(globalsCss, /\.standing-modal-backdrop\s*{[\s\S]*?position:\s*fixed;/);
    assert.match(globalsCss, /\.standing-modal--revealed\s*{[\s\S]*?animation:\s*wc-standing-modal-reveal/);
    assert.match(globalsCss, /\.referrals-trigger\s*{[\s\S]*?linear-gradient\(180deg,\s*#dfffe9/);
    assert.match(globalsCss, /\.referrals-list-panel\s*{[\s\S]*?rgba\(84,\s*224,\s*179,\s*0\.16\)/);
    assert.match(globalsCss, /@keyframes wc-referrals-pulse/);
    assert.match(globalsCss, /@keyframes wc-referrals-list-reveal/);
    assert.match(globalsCss, /\.agent-gift-trigger\s*{[\s\S]*?animation:\s*wc-agent-gift-breathe/);
    assert.match(globalsCss, /\.standing-agent-code--revealed\s*{[\s\S]*?animation:\s*wc-agent-code-reveal/);
    assert.match(globalsCss, /\.standing-signout\s*{[\s\S]*?background:\s*rgba\(132,\s*43,\s*30,\s*0\.28\);/);
    assert.match(globalsCss, /\.standing-main \.standing-signout\s*{[\s\S]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.08\);/);
    assert.match(globalsCss, /@media \(max-width:\s*520px\)\s*{[\s\S]*?\.standing-main \.standing-signout\s*{[\s\S]*?font-size:\s*0;/);
    assert.match(globalsCss, /\.standing-agent \.account-status-grid \.agent-stat-date\s*{[\s\S]*?text-transform:\s*none;/);
    assert.match(globalsCss, /url\("\/leaderboard-players-bg\.png"\)/);
    assert.equal(existsSync("public/leaderboard-players-bg.png"), true);
    assert.match(globalsCss, /#leaderboard \.payout-strip\s*{[\s\S]*?rgba\(255,\s*226,\s*154,\s*0\.08\)/);
    assert.match(globalsCss, /#leaderboard \.leaderboard-list\s*{[\s\S]*?repeating-linear-gradient\(90deg/);
    assert.match(globalsCss, /#leaderboard \.leaderboard-row:nth-child\(1\)\s*{[\s\S]*?rgba\(255,\s*226,\s*154,\s*0\.2\)/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--post-entry \.my-standing\s*{[\s\S]*?width:\s*min\(1560px,\s*100%\);/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--post-entry \.my-standing--agent\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.08fr\) minmax\(420px,\s*0\.82fr\);/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--post-entry \.my-standing--agent\s*{[\s\S]*?width:\s*min\(1680px,\s*100%\);/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--post-entry \.standing-grid\s*{[\s\S]*?grid-template-columns:\s*minmax\(560px,\s*1\.12fr\) minmax\(420px,\s*0\.88fr\);/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--post-entry \.my-standing--agent \.standing-grid\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
    assert.match(globalsCss, /@media \(min-width:\s*1181px\)\s*{[\s\S]*?\.app-shell--post-entry \.my-standing--agent \.standing-agent\s*{[\s\S]*?grid-column:\s*2;/);
    assert.match(globalsCss, /@media \(min-width:\s*1441px\)\s*{[\s\S]*?\.app-shell--post-entry \.my-standing--agent\s*{[\s\S]*?grid-template-columns:\s*minmax\(760px,\s*1\.02fr\) minmax\(520px,\s*0\.78fr\);/);
    assert.match(globalsCss, /@media \(min-width:\s*761px\) and \(max-width:\s*1180px\)\s*{[\s\S]*?\.app-shell--post-entry \.standing-grid\s*{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);/);
    assert.match(globalsCss, /@media \(min-width:\s*761px\) and \(max-width:\s*1180px\)\s*{[\s\S]*?\.app-shell--post-entry \.my-standing--agent\s*{[\s\S]*?width:\s*min\(980px,\s*100%\);/);
  });

  it("keeps every non-matchup swiper poster image-backed like Agent Deal", () => {
    const posterAssets = [
      ["HowToPoster", "howto-bg.png"],
      ["PrizePoster", "prize-bg.png"],
      ["PointsPoster", "points-bg.png"],
      ["ExamplePoster", "example-bg.png"],
      ["CoefficientsPoster", "coefficients-bg.png"],
      ["InvitePoster", "invite-bg.png"],
      ["AgentDealPoster", "agent-deal-bg.png"],
      ["LoginPoster", "login-bg.png"],
    ] as const;

    for (const [functionName, asset] of posterAssets) {
      assert.match(heroSwiper, new RegExp(`function ${functionName}[\\s\\S]*?hero-card__photo`));
      assert.match(globalsCss, new RegExp(`--hero-photo:\\s*url\\("\\/${asset.replace(".", "\\.")}"\\)`));
      assert.equal(existsSync(`public/${asset}`), true);
    }

    assert.match(heroSwiper, /className=\{`hero-swiper__slide\$\{index === active \? " is-active" : ""\}`\}/);
    assert.match(globalsCss, /@keyframes wc-poster-caption/);
    assert.match(globalsCss, /\.hero-swiper__slide\.is-active \.hero-poster__lede/);
    assert.doesNotMatch(globalsCss, /--poster-lede-y:/);
    assert.match(globalsCss, /\.hero-swiper__controls\s*{[\s\S]*?position:\s*absolute;/);
    assert.match(globalsCss, /\.hero-swiper__controls\s*{[\s\S]*?bottom:\s*18px;/);
    assert.match(globalsCss, /\.hero-swiper__slide:not\(:first-child\) \.hero-card__content\s*{[\s\S]*?padding-top:\s*clamp\(62px,\s*10svh,\s*92px\);/);
    assert.match(globalsCss, /\.hero-swiper__slide:not\(:first-child\) \.hero-card__content\s*{[\s\S]*?padding-bottom:\s*clamp\(74px,\s*10svh,\s*96px\);/);
    assert.match(globalsCss, /\.hero-list__row span\s*{[\s\S]*?min-width:\s*0;/);
    assert.match(globalsCss, /\.hero-list__row strong\s*{[\s\S]*?max-width:\s*48%;/);
    assert.match(globalsCss, /\.hero-list__row strong\s*{[\s\S]*?white-space:\s*normal;/);
    assert.match(globalsCss, /@media \(max-width:\s*420px\)\s*{[\s\S]*?\.hero-swiper__slide:not\(:first-child\) \.hero-card__content\s*{[\s\S]*?padding-top:\s*86px;/);
    assert.match(globalsCss, /@media \(max-width:\s*420px\)\s*{[\s\S]*?\.hero-swiper__slide:not\(:first-child\) \.hero-card__content\s*{[\s\S]*?padding-bottom:\s*74px;/);
    assert.match(globalsCss, /@media \(max-width:\s*420px\)\s*{[\s\S]*?\.hero-swiper__slide:not\(:first-child\) \.hero-card\s*{[\s\S]*?max-height:\s*calc\(100svh - 154px\);/);
    assert.match(globalsCss, /\.hero-swiper\s*{[\s\S]*?width:\s*100vw;/);
    assert.match(globalsCss, /\.hero-swiper__slide:first-child \.hero-card\s*{[\s\S]*?width:\s*100vw;/);
    assert.match(globalsCss, /\.app-shell--landing \.topbar\s*{[\s\S]*?position:\s*fixed;/);
    assert.match(globalsCss, /\.app-shell--landing \.smart-menu__panel\s*{[\s\S]*?position:\s*fixed;/);
    assert.match(globalsCss, /\.app-shell--landing #pick,[\s\S]*?\.app-shell--landing #leaderboard,[\s\S]*?scroll-margin-top:\s*150px;/);
    assert.match(globalsCss, /\.hero-swiper__slide:first-child \.hero-card\s*{[\s\S]*?height:\s*max\(640px,\s*100svh\);/);
  });

  it("keeps the rules panel in the same dark app card system", () => {
    assert.match(dashboard, /<div className="panel rules-panel" id="rules">/);
    assert.match(dashboard, /<h2 className="panel-title">Rules<\/h2>/);
    assert.match(dashboard, /Points formula/);
    assert.match(globalsCss, /\.rules-panel\s*{[\s\S]*?linear-gradient\(145deg,\s*rgba\(5,\s*42,\s*32,\s*0\.98\)/);
    assert.match(globalsCss, /\.rules-panel::before\s*{[\s\S]*?repeating-linear-gradient\(90deg/);
    assert.match(globalsCss, /\.rules-panel \.panel-header > svg\s*{[\s\S]*?color:\s*#ffe29a;/);
    assert.match(globalsCss, /\.rules-content\s*{[\s\S]*?rgba\(255,\s*226,\s*154,\s*0\.055\)/);
    assert.match(globalsCss, /\.formula\s*{[\s\S]*?color:\s*#ffe29a;/);
    assert.match(globalsCss, /\.rule-card,\s*[\s\S]*?\.stage-rule\s*{[\s\S]*?--rule-accent:\s*#54e0b3;/);
    assert.match(globalsCss, /\.rule-card::before,[\s\S]*?\.stage-rule::before\s*{[\s\S]*?background:\s*var\(--rule-accent\);/);
    assert.match(globalsCss, /\.stage-rule:nth-child\(2n\)\s*{[\s\S]*?--rule-accent:\s*#ffc868;/);
  });

  it("keeps paid-action policy pauses visible before disabled user controls", () => {
    assert.match(homePage, /getPublicPaidActionGates/);
    assert.match(homePage, /publicPaidActionGates/);
    assert.match(walletPage, /WALLET_ACCOUNT_SETUP_GATES/);
    assert.match(walletPage, /publicPaidActionGates/);
    assert.match(loginPage, /LOGIN_ACCOUNT_SETUP_GATES/);
    assert.match(loginPage, /publicPaidActionGates/);
    assert.match(dashboard, /launchEvidenceMode/);
    assert.match(dashboard, /page page--landing/);
    assert.match(dashboard, /showPickWorkflow \? "" : "page--post-entry"/);
    assert.match(dashboard, /<HeroSwiper/);
    assert.doesNotMatch(dashboard, /<strong>Paid actions paused<\/strong>/);
    assert.match(dashboard, /Admin launch evidence mode/);
    assert.match(dashboard, /assign paid ticket codes\s+manually from the Admin panel/);
    assert.match(dashboard, /paidActionGates: result\.paidActionGates/);
    assert.match(dashboard, /myAccountStatus\?\.paidActionGates/);
    assert.match(dashboard, /The event has not started yet, so all 48 teams are still available/);
    assert.doesNotMatch(dashboard, /Entry locking opens after launch approvals are complete/);
    assert.doesNotMatch(dashboard, /Operator policy is configured/);
    assert.match(globalsCss, /\.launch-notice/);
    assert.match(globalsCss, /\.launch-evidence-checklist/);
    assert.match(globalsCss, /\.launch-evidence-checklist span\s*{[\s\S]*?overflow-wrap:\s*anywhere;/);
    assert.match(globalsCss, /\.approval-evidence-checklist/);
    assert.match(globalsCss, /\.approval-evidence-checklist span\s*{[\s\S]*?overflow-wrap:\s*anywhere;/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.launch-notice\s*{[\s\S]*?flex-direction:\s*column;/);

    assert.match(walletScreen, /depositPolicyPause/);
    assert.match(walletScreen, /launchEvidenceMode/);
    assert.match(walletScreen, /Admin launch evidence mode/);
    assert.match(walletScreen, /This admin account can use TRC20\/ERC20/);
    assert.match(walletScreen, /status\?\.paidActionGates/);
    assert.match(walletScreen, /publicPaidActionsPaused/);
    assert.doesNotMatch(walletScreen, /Wallet paid actions paused/);
    assert.doesNotMatch(walletScreen, /Login, referrals, and account setup are available/);
    assert.doesNotMatch(walletScreen, /Deposit \/ withdraw/);
    assert.doesNotMatch(walletScreen, /Use USDT queues with admin review and audit notes/);
    assert.match(walletScreen, /Deposit USDT/);
    assert.match(walletScreen, /Payout after World Cup/);
    assert.match(walletScreen, /No withdrawal request is open during the tournament/);
    assert.match(walletScreen, /USDT payout is available only if this account used USDT deposit at least once/);
    assert.match(walletScreen, /Sign in with Google to prepare your locked USDT sender wallet/);
    assert.match(walletScreen, /USDT deposits are admin-reviewed/);
    assert.match(walletScreen, /accepted USDT can auto-issue the first ticket/);
    assert.match(walletScreen, /depositClaimAccountLabel/);
    assert.match(walletScreen, /Deposit claims\s+are tied to/);
    assert.match(walletScreen, /Paste/);
    assert.match(walletScreen, /Save wallet/);
    assert.match(walletScreen, /Confirm locked wallet/);
    assert.match(walletScreen, /Check for deposit reads KuCoin/);
    assert.match(walletScreen, /TRC20 and ERC20 are separate/);
    assert.doesNotMatch(walletScreen, /Operator policy is configured/);
    assert.match(walletScreen, /Boolean\(depositRestriction \|\| depositPolicyPause\)/);
    assert.doesNotMatch(walletScreen, /Boolean\(ticketRestriction \|\| ticketPolicyPause\)/);
    assert.doesNotMatch(walletScreen, /Boolean\(withdrawalPolicyPause\)/);

    assert.match(loginRegister, /paidActionsPaused/);
    assert.match(loginRegister, /Account setup is open until June 18, 2026/);
    assert.match(
      loginRegister,
      /Create the free account first\. Tickets and payment can be handled later\./,
    );
    assert.match(
      loginRegister,
      /All 48 teams are still available to choose because the event has not started yet\./,
    );
  });
});
