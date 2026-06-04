"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
    navigator: Navigator & { standalone?: boolean };
  };

const launchStars = [
  { x: "10%", y: "18%", size: "3px", delay: "0s" },
  { x: "22%", y: "30%", size: "2px", delay: "0.45s" },
  { x: "35%", y: "14%", size: "4px", delay: "0.9s" },
  { x: "49%", y: "24%", size: "2px", delay: "1.2s" },
  { x: "63%", y: "16%", size: "3px", delay: "0.25s" },
  { x: "78%", y: "28%", size: "2px", delay: "0.7s" },
  { x: "88%", y: "20%", size: "4px", delay: "1.45s" },
  { x: "16%", y: "62%", size: "2px", delay: "1.1s" },
  { x: "30%", y: "70%", size: "3px", delay: "0.35s" },
  { x: "52%", y: "76%", size: "2px", delay: "1.65s" },
  { x: "70%", y: "66%", size: "3px", delay: "0.55s" },
  { x: "84%", y: "74%", size: "2px", delay: "1.85s" },
] as const;

function isInstalledAppLaunch() {
  if (typeof window === "undefined") {
    return false;
  }

  const audioWindow = window as AudioWindow;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    audioWindow.navigator.standalone === true ||
    document.referrer.startsWith("android-app://")
  );
}

async function playCrowdRoar() {
  const audioWindow = window as AudioWindow;
  const AudioContextConstructor = window.AudioContext || audioWindow.webkitAudioContext;

  if (!AudioContextConstructor) {
    return;
  }

  const context = new AudioContextConstructor();
  const duration = 1.55;
  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
  const data = buffer.getChannelData(0);
  let rumble = 0;

  for (let index = 0; index < data.length; index += 1) {
    const time = index / sampleRate;
    const attack = Math.min(1, time / 0.28);
    const release = Math.min(1, (duration - time) / 0.72);
    const envelope = Math.max(0, Math.min(attack, release));
    const wave = Math.sin(time * 65) * 0.22 + Math.sin(time * 117) * 0.14;
    rumble = rumble * 0.985 + (Math.random() * 2 - 1) * 0.015;
    data[index] = (Math.random() * 2 - 1 + wave + rumble * 7) * envelope * 0.42;
  }

  const source = context.createBufferSource();
  const lowCrowd = context.createBiquadFilter();
  const highCrowd = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = buffer;
  lowCrowd.type = "bandpass";
  lowCrowd.frequency.value = 520;
  lowCrowd.Q.value = 0.8;
  highCrowd.type = "peaking";
  highCrowd.frequency.value = 1800;
  highCrowd.gain.value = 4;
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(0.06, context.currentTime + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

  source.connect(lowCrowd);
  lowCrowd.connect(highCrowd);
  highCrowd.connect(gain);
  gain.connect(context.destination);

  try {
    if (context.state === "suspended") {
      await context.resume();
    }
    source.start();
    window.setTimeout(() => void context.close(), Math.ceil(duration * 1000) + 250);
  } catch {
    void context.close();
    throw new Error("crowd-audio-blocked");
  }
}

export function AppLaunchSplash() {
  const [visible, setVisible] = useState(true);
  const crowdStarted = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const standaloneLaunch = isInstalledAppLaunch();

    async function startCrowdAudio() {
      if (!standaloneLaunch || prefersReducedMotion || crowdStarted.current) {
        return;
      }

      crowdStarted.current = true;
      try {
        await playCrowdRoar();
      } catch {
        crowdStarted.current = false;
      }
    }

    void startCrowdAudio();

    const unlockAudio = () => {
      void startCrowdAudio();
    };
    window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    const hideDelay = prefersReducedMotion ? 650 : 1650;
    const hideTimer = window.setTimeout(() => setVisible(false), hideDelay);

    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div aria-label="WorldCup26 loading" className="app-launch-splash" role="status">
      <div className="app-launch-splash__stars" aria-hidden="true">
        {launchStars.map((star, index) => (
          <span
            className="app-launch-splash__star"
            key={`${star.x}-${star.y}`}
            style={
              {
                "--star-x": star.x,
                "--star-y": star.y,
                "--star-size": star.size,
                "--star-delay": star.delay,
            } as CSSProperties
            }
          >
            {index % 3 === 0 ? "+" : ""}
          </span>
        ))}
      </div>
      <div className="app-launch-splash__lights" aria-hidden="true" />
      <div className="app-launch-splash__badge">
        <Image
          alt=""
          className="app-launch-splash__icon"
          height={72}
          priority
          src="/icons/maskable-512.png"
          width={72}
        />
        <div>
          <strong>
            WorldCup26<span>.world</span>
          </strong>
          <small>Prediction Game</small>
        </div>
      </div>
    </div>
  );
}
