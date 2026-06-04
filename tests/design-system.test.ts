import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const globalsCss = readFileSync("src/app/globals.css", "utf8");
const homePage = readFileSync("src/app/page.tsx", "utf8");
const walletPage = readFileSync("src/app/wallet/page.tsx", "utf8");
const loginPage = readFileSync("src/app/login/page.tsx", "utf8");
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
const appIcon = readFileSync("src/app/icon.svg", "utf8");
const brandMark = readFileSync("public/brand-mark.svg", "utf8");
const logoLockup = readFileSync("public/logo-lockup.svg", "utf8");
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
    assert.match(loginRegister, /future referral rate starts at 3%/);
    assert.match(loginRegister, /showReferralForm/);
    assert.match(loginRegister, /showGoogleAuth/);
    assert.match(loginRegister, /Continue with Google/);
    assert.match(loginRegister, /auth-choice-card--referral/);
    assert.match(loginRegister, /auth-choice-card--direct/);
    assert.match(loginRegister, /auth-worldcup-card/);
    assert.match(loginRegister, /auth-worldcup-card__body/);
    assert.match(loginRegister, /auth-info-card/);
    assert.match(loginRegister, /How it works/);
    assert.match(loginRegister, /Referral rates/);
    assert.match(loginRegister, /Agent Wanted/);
    assert.match(loginRegister, /Every 10 paid ticket codes unlock 1 extra free ticket code/);
    assert.match(loginRegister, /Register as an agent in Wallet/);
    assert.match(loginRegister, /All 48 nations/);
    assert.doesNotMatch(loginRegister, /disabled=\{!canContinue\}/);
    assert.match(globalsCss, /\.auth-card\s*{[\s\S]*?linear-gradient\(155deg/);
    assert.match(globalsCss, /\.auth-choice-grid button\.auth-choice-card--referral\s*{[\s\S]*?--choice-accent:\s*#f08a24;/);
    assert.match(globalsCss, /\.auth-choice-grid button\.auth-choice-card--direct\s*{[\s\S]*?--choice-accent:\s*#f3c858;/);
    assert.match(globalsCss, /@keyframes auth-choice-referral-pulse/);
    assert.match(globalsCss, /@keyframes auth-choice-direct-pulse/);
    assert.match(globalsCss, /\.auth-choice-grid button\.active/);
    assert.match(globalsCss, /\.auth-worldcup-card > summary/);
    assert.match(globalsCss, /\.auth-info-card summary/);
    assert.match(globalsCss, /\.auth-google-button/);
    assert.match(globalsCss, /auth-info-grid/);
  });

  it("keeps mobile navigation inside the viewport instead of widening the page", () => {
    assert.match(globalsCss, /\.topbar\s*{[\s\S]*?border-radius:\s*20px;/);
    assert.match(globalsCss, /\.topbar\s*{[\s\S]*?linear-gradient\(135deg/);
    assert.match(globalsCss, /\.nav\s*{[\s\S]*?background:\s*rgba\(4,\s*18,\s*15,\s*0\.34\);/);
    assert.match(globalsCss, /\.nav-item--primary\s*{[\s\S]*?linear-gradient\(180deg,\s*#ffe29a,\s*#e6b653\)/);
    assert.match(globalsCss, /\.smart-menu\.is-closed \.smart-menu__toggle\s*{[\s\S]*?linear-gradient\(180deg,\s*#ffe29a,\s*#e6b653\)/);
    assert.match(globalsCss, /\.nav-more__menu\s*{[\s\S]*?position:\s*absolute;/);
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
    assert.doesNotMatch(
      globalsCss,
      /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.topbar\s*{[\s\S]*?overflow:\s*hidden;/,
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

  it("keeps every topbar brand block clickable back to home", () => {
    assert.match(dashboard, /<Link className="brand landing-brand-lockup" href="\/" aria-label="Go to WorldCup26\.world home">/);
    assert.match(walletScreen, /<Link className="brand" href="\/" aria-label="Go to WorldCup26\.world home">/);
    assert.match(adminConsole, /<Link className="brand" href="\/" aria-label="Go to WorldCup26\.world home">/);
    assert.match(globalsCss, /\.brand:focus-visible\s*{/);
  });

  it("keeps the smart menu clickable and compact on mobile", () => {
    assert.match(smartMenu, /"use client";/);
    assert.match(smartMenu, /const \[expanded, setExpanded\] = useState\(true\);/);
    assert.match(smartMenu, /window\.matchMedia\("\(max-width: 760px\)"\)/);
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
    assert.match(dashboard, /fetch\("\/api\/admin\/me"/);
    assert.match(dashboard, /setIsAdmin\(response\.ok && Boolean\(result\.admin\)\);/);
    assert.match(dashboard, /setIsAdmin\(false\);/);
    assert.match(dashboard, /<main className="app-shell app-shell--landing">/);
    assert.match(dashboard, /<nav className="nav nav--app" aria-label="Primary navigation">/);
    assert.match(dashboard, /className="nav-item nav-item--primary" href="#pick"[\s\S]*?Pick Teams[\s\S]*?Main task[\s\S]*?href="#leaderboard"[\s\S]*?Leaderboard[\s\S]*?Ranking[\s\S]*?pathname: "\/wallet"[\s\S]*?Wallet[\s\S]*?Tickets & USDT[\s\S]*?<details className="nav-more">[\s\S]*?Explore[\s\S]*?Rules & draw/);
    assert.match(dashboard, /<details className="nav-more">[\s\S]*?Explore[\s\S]*?Rules & draw[\s\S]*?href="#rules"[\s\S]*?pathname: "\/schema"/);
    assert.match(dashboard, /\{isAdmin \? \([\s\S]*?pathname: "\/admin"[\s\S]*?Admin[\s\S]*?\) : null\}/);
    assert.match(dashboard, /<details className="nav-more">[\s\S]*?<\/details>[\s\S]*?\{signedInWithGoogle \? \([\s\S]*?className="nav-item nav-item--identity" href="#me"[\s\S]*?Account[\s\S]*?\) : \([\s\S]*?className="nav-item nav-item--identity"[\s\S]*?pathname: "\/login"[\s\S]*?Login/);
    assert.match(walletScreen, /<nav className="nav nav--app" aria-label="Wallet navigation">/);
    assert.match(walletScreen, /className="nav-item nav-item--primary" href=\{\{ pathname: "\/", hash: "pick" \}\}[\s\S]*?Play[\s\S]*?Pick teams/);
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
    assert.match(heroCard, /navigator\.serviceWorker\.register\("\/sw\.js"\)/);
    assert.match(heroCard, /className="hero-cta-row"/);
    assert.match(heroCard, /Play now/);
    assert.match(heroCard, /Install app/);
    assert.match(heroCard, /Add to Home Screen/);
    assert.match(globalsCss, /\.hero-cta-row\s*{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/);
    assert.match(globalsCss, /\.hero-cta--install\s*{/);
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
    assert.match(dashboard, /className="panel pick-panel"/);
    assert.match(dashboard, /const atPickLimit = selectedTeams\.length >= 3 && !selected;/);
    assert.match(dashboard, /const firstMatchStart = formatPickDeadline/);
    assert.match(dashboard, /Pick before first match/);
    assert.match(dashboard, /getTeamColorStyle/);
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
    assert.match(globalsCss, /\.team-row\s*{[\s\S]*?touch-action:\s*pan-y;/);
    assert.match(globalsCss, /\.team-list\s*{[\s\S]*?-webkit-overflow-scrolling:\s*touch;/);
    assert.match(globalsCss, /\.team-list\s*{[\s\S]*?touch-action:\s*pan-y;/);
    assert.match(globalsCss, /\.team-list\s*{[\s\S]*?overscroll-behavior-y:\s*contain;/);
    assert.match(globalsCss, /\.team-list--expanded\s*{[\s\S]*?max-height:\s*min\(760px,\s*72vh\);[\s\S]*?overflow-y:\s*auto;/);
    assert.match(globalsCss, /\.team-list--expanded\s*{[\s\S]*?overscroll-behavior-y:\s*contain;/);
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

  it("keeps ticket purchase guidance visible before locking an entry", () => {
    assert.match(dashboard, /const missingEntryTicket =/);
    assert.match(dashboard, /ticketsAvailable < 1/);
    assert.match(dashboard, /className=\{`ticket-requirement-card/);
    assert.match(dashboard, /You need 1 entry ticket/);
    assert.match(dashboard, /Pay the buy-in with USDT, or use Agent Call after paying an agent directly\./);
    assert.match(dashboard, /Ticket price/);
    assert.match(dashboard, /Your balance/);
    assert.match(dashboard, /Buy with USDT/);
    assert.match(dashboard, /Agent Call/);
    assert.match(dashboard, /Agent code or email/);
    assert.match(dashboard, /Request ticket/);
    assert.match(dashboard, /\/api\/agent-ticket-requests/);
    assert.match(walletScreen, /Agent Call requests/);
    assert.match(walletScreen, /acceptAgentTicketRequest/);
    assert.match(dashboard, /pathname: "\/wallet", hash: "tickets"/);
    assert.match(dashboard, /missingEntryTicket \|\|/);
    assert.match(walletScreen, /<div className="panel" id="tickets">/);
    assert.match(globalsCss, /\.ticket-requirement-card\s*{/);
    assert.match(globalsCss, /\.ticket-requirement-card\.needs-ticket/);
    assert.match(globalsCss, /\.ticket-requirement-actions\s*{/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.ticket-requirement-card\s*{[\s\S]*?grid-template-columns:\s*1fr;/);
  });

  it("keeps the signed-in account cards in the app's colored card system", () => {
    assert.match(myStanding, /standing-card standing-card--rank/);
    assert.match(myStanding, /standing-card standing-card--referrals/);
    assert.match(myStanding, /standing-card standing-card--agent/);
    assert.match(globalsCss, /\.standing-card\s*{[\s\S]*?linear-gradient\(145deg/);
    assert.match(globalsCss, /\.standing-card--rank\s*{[\s\S]*?--standing-accent:\s*#f0c060;/);
    assert.match(globalsCss, /\.standing-card--referrals\s*{[\s\S]*?--standing-accent:\s*#37d7a3;/);
    assert.match(globalsCss, /\.standing-card--agent\s*{[\s\S]*?--standing-accent:\s*#f0a13a;/);
    assert.match(globalsCss, /\.standing-card \.panel-header > svg\s*{[\s\S]*?linear-gradient\(180deg,\s*#ffe29a/);
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
    assert.match(globalsCss, /\.app-shell--landing #pick,[\s\S]*?\.app-shell--landing #leaderboard,[\s\S]*?scroll-margin-top:\s*118px;/);
    assert.match(globalsCss, /\.hero-swiper__slide:first-child \.hero-card\s*{[\s\S]*?height:\s*max\(640px,\s*100svh\);/);
  });

  it("keeps paid-action policy pauses visible before disabled user controls", () => {
    assert.match(homePage, /getPublicPaidActionGates/);
    assert.match(homePage, /publicPaidActionGates/);
    assert.match(walletPage, /getPublicPaidActionGates/);
    assert.match(walletPage, /publicPaidActionGates/);
    assert.match(loginPage, /getPublicPaidActionGates/);
    assert.match(loginPage, /publicPaidActionGates/);
    assert.match(dashboard, /entryPolicyPause/);
    assert.match(dashboard, /launchEvidenceMode/);
    assert.match(dashboard, /<div className="page page--landing">[\s\S]*?<HeroSwiper/);
    assert.doesNotMatch(dashboard, /<strong>Paid actions paused<\/strong>/);
    assert.match(dashboard, /Admin launch evidence mode/);
    assert.match(dashboard, /Your admin account can lock entries/);
    assert.match(dashboard, /\{entryPolicyPause[\s\S]*?Entry locking opens after launch approvals are complete/);
    assert.match(dashboard, /paidActionGates: result\.paidActionGates/);
    assert.match(dashboard, /myAccountStatus\?\.paidActionGates/);
    assert.match(dashboard, /Entry locking opens after launch approvals are complete/);
    assert.doesNotMatch(dashboard, /Operator policy is configured/);
    assert.match(globalsCss, /\.launch-notice/);
    assert.match(globalsCss, /\.launch-evidence-checklist/);
    assert.match(globalsCss, /\.launch-evidence-checklist span\s*{[\s\S]*?overflow-wrap:\s*anywhere;/);
    assert.match(globalsCss, /\.approval-evidence-checklist/);
    assert.match(globalsCss, /\.approval-evidence-checklist span\s*{[\s\S]*?overflow-wrap:\s*anywhere;/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.launch-notice\s*{[\s\S]*?flex-direction:\s*column;/);

    assert.match(walletScreen, /depositPolicyPause/);
    assert.match(walletScreen, /ticketPolicyPause/);
    assert.match(walletScreen, /withdrawalPolicyPause/);
    assert.match(walletScreen, /launchEvidenceMode/);
    assert.match(walletScreen, /Admin launch evidence mode/);
    assert.match(walletScreen, /This admin account can use TRC20\/ERC20/);
    assert.match(walletScreen, /status\?\.paidActionGates/);
    assert.match(walletScreen, /publicPaidActionsPaused/);
    assert.match(walletScreen, /Wallet paid actions paused/);
    assert.match(walletScreen, /Sign in with Google to prepare your wallet/);
    assert.match(walletScreen, /Paid actions open after launch approvals are complete/);
    assert.match(walletScreen, /depositClaimAccountLabel/);
    assert.match(walletScreen, /Deposit claims\s+are tied to/);
    assert.match(walletScreen, /Save the wallet address you send from/);
    assert.match(walletScreen, /Admins use both before crediting your balance/);
    assert.match(walletScreen, /Sending wallet address/);
    assert.doesNotMatch(walletScreen, /Operator policy is configured/);
    assert.match(walletScreen, /Boolean\(depositRestriction \|\| depositPolicyPause\)/);
    assert.match(walletScreen, /Boolean\(ticketRestriction \|\| ticketPolicyPause\)/);
    assert.match(walletScreen, /Boolean\(withdrawalPolicyPause\)/);

    assert.match(loginRegister, /paidActionsPaused/);
    assert.match(loginRegister, /Account setup is open/);
    assert.match(
      loginRegister,
      /Tickets, entries, and USDT deposits open after launch approvals are complete\./,
    );
  });
});
