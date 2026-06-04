"use client";

import { ArrowRight, Award, Download, Share2, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(navigatorWithStandalone.standalone)
  );
}

// The 9:16 portrait hero poster for WorldCup26.world.
export function HeroCard() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installMessage, setInstallMessage] = useState<string | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [installed, setInstalled] = useState(isStandaloneDisplayMode);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installation help can still be shown if registration is blocked.
      });
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallMessage(null);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowInstallHelp(false);
      setInstallMessage("Installed. Open WorldCup26 from your apps to stay signed in on this device.");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const installHelp = useMemo(() => {
    if (typeof window === "undefined") {
      return "Use your browser menu to add WorldCup26 to your home screen.";
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS || isSafari) {
      return "Tap Share, then Add to Home Screen. Open WorldCup26 from the new icon after it is added.";
    }

    if (isAndroid) {
      return "Open the browser menu, then tap Install app or Add to Home screen.";
    }

    return "Use the browser install icon in the address bar, or open the browser menu and choose Install app.";
  }, []);

  async function installApp() {
    if (installed) {
      setInstallMessage("WorldCup26 is already installed on this device.");
      return;
    }

    if (!installPrompt) {
      setShowInstallHelp(true);
      setInstallMessage("Your browser needs one manual step to install the app.");
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    if (choice.outcome === "accepted") {
      setInstallMessage("Installing. Open WorldCup26 from your apps after it finishes.");
    } else {
      setShowInstallHelp(true);
      setInstallMessage("Install was dismissed. You can still install it from your browser menu.");
    }
  }

  return (
    <section className="hero-card" aria-label="WorldCup26.world - Prediction Game">
      <div className="hero-card__photo" aria-hidden="true" />
      <div className="hero-card__scrim" aria-hidden="true" />

      <div className="hero-card__content">
        <div className="hero-card__center" aria-hidden="true" />

        <div className="hero-card__cards">
          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Users size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Pick 3 Teams</strong>
              <small>Climb the leaderboard.</small>
            </span>
          </div>

          <div className="hero-mini hero-feature">
            <span className="hero-feature__icon">
              <Award size={20} aria-hidden="true" />
            </span>
            <span className="hero-feature__body">
              <strong>Top 10 Rewarded</strong>
              <small>
                The <b>top 10</b> share the prize pool.
              </small>
            </span>
          </div>

          <div className="hero-cta-row">
            <a className="hero-cta" href="#pick">
              Play now
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <button className="hero-cta hero-cta--install" onClick={installApp} type="button">
              <Download size={16} aria-hidden="true" />
              {installed ? "App installed" : "Install app"}
            </button>
          </div>

          {installMessage ? <p className="hero-install-note">{installMessage}</p> : null}
          {showInstallHelp ? (
            <div className="hero-install-help" role="status">
              <Share2 size={16} aria-hidden="true" />
              <span>{installHelp}</span>
              <button aria-label="Close install help" onClick={() => setShowInstallHelp(false)} type="button">
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
