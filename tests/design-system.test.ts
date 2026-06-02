import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const globalsCss = readFileSync("src/app/globals.css", "utf8");
const homePage = readFileSync("src/app/page.tsx", "utf8");
const walletPage = readFileSync("src/app/wallet/page.tsx", "utf8");
const loginPage = readFileSync("src/app/login/page.tsx", "utf8");
const loginRegister = readFileSync("src/components/login-register.tsx", "utf8");
const dashboard = readFileSync("src/components/dashboard.tsx", "utf8");
const heroSwiper = readFileSync("src/components/hero-swiper.tsx", "utf8");
const walletScreen = readFileSync("src/components/wallet-screen.tsx", "utf8");
const appIcon = readFileSync("src/app/icon.svg", "utf8");
const brandMark = readFileSync("public/brand-mark.svg", "utf8");
const logoLockup = readFileSync("public/logo-lockup.svg", "utf8");

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
    assert.match(globalsCss, /\.motto-accent\s*{[\s\S]*?color:\s*var\(--green\);/);
  });

  it("keeps mobile navigation inside the viewport instead of widening the page", () => {
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.topbar\s*{[\s\S]*?flex-direction:\s*column;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.grid,[\s\S]*?\.auth-page,[\s\S]*?\.coefficients-hero,[\s\S]*?\.schema-hero,[\s\S]*?\.matches-section,[\s\S]*?\.knockout-board,[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.knockout-board\s*{[\s\S]*?overflow-x:\s*visible;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.knockout-column\s*{[\s\S]*?min-width:\s*0;/);
    assert.match(globalsCss, /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?display:\s*grid;/);
    assert.match(
      globalsCss,
      /@media \(max-width:\s*980px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(86px,\s*1fr\)\);/,
    );
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?display:\s*grid;/);
    assert.match(
      globalsCss,
      /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(82px,\s*1fr\)\);/,
    );
    assert.match(globalsCss, /@media \(max-width:\s*420px\)\s*{[\s\S]*?\.nav\s*{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/);
    assert.match(globalsCss, /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.nav a,\s*\n\s*\.nav button\s*{[\s\S]*?width:\s*100%;/);
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
    assert.doesNotMatch(
      globalsCss,
      /@media \(max-width:\s*760px\)\s*{[\s\S]*?\.topbar\s*{[\s\S]*?overflow:\s*hidden;/,
    );
  });

  it("uses the active Supabase session for logged-in navigation and wallet state", () => {
    assert.match(dashboard, /const signedInWithGoogle = Boolean\(session\?\.access_token && session\.user\.email\);/);
    assert.match(walletScreen, /const signedIn = Boolean\(session\?\.access_token && session\.user\.email\);/);
    assert.match(dashboard, /fetch\("\/api\/admin\/me"/);
    assert.match(dashboard, /setIsAdmin\(response\.ok && Boolean\(result\.admin\)\);/);
    assert.match(dashboard, /setIsAdmin\(false\);/);
    assert.match(dashboard, /\{isAdmin \? \([\s\S]*?pathname: "\/admin"[\s\S]*?Admin[\s\S]*?\) : null\}/);
    assert.match(dashboard, /\{signedInWithGoogle \? \([\s\S]*?<button onClick=\{signOut\} type="button">[\s\S]*?Logout[\s\S]*?\) : \([\s\S]*?pathname: "\/login"[\s\S]*?Login/);
    assert.doesNotMatch(dashboard, /const signedInWithGoogle = session\?\.user\.app_metadata\.provider === "google";/);
    assert.doesNotMatch(walletScreen, /const signedIn = session\?\.user\.app_metadata\.provider === "google";/);
  });

  it("keeps the agent deal surfaced in the landing swiper", () => {
    assert.match(heroSwiper, /"Agent Deal"/);
    assert.match(heroSwiper, /function AgentDealPoster/);
    assert.match(heroSwiper, /Every 10 paid codes earns 1 extra ticket code\./);
    assert.match(heroSwiper, /Open Agent Codes/);
    assert.match(globalsCss, /\.hero-card--agent/);
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
    assert.match(dashboard, /Admin launch evidence mode/);
    assert.match(dashboard, /Your admin account can lock entries/);
    assert.match(dashboard, /\{entryPolicyPause[\s\S]*?Entry locking opens after launch approvals are complete/);
    assert.match(dashboard, /paidActionGates: result\.paidActionGates/);
    assert.match(dashboard, /myAccountStatus\?\.paidActionGates/);
    assert.match(dashboard, /Paid actions paused/);
    assert.match(dashboard, /Team browsing and referral setup are available/);
    assert.match(dashboard, /open after launch approvals are complete/);
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
    assert.match(walletScreen, /Deposit claims are tied to/);
    assert.match(walletScreen, /account email or user ID before crediting your balance/);
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
