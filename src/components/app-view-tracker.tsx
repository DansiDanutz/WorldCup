"use client";

import { useEffect, useRef } from "react";

import { getCampaignReferralCode } from "@/lib/campaign-attribution";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const APP_VIEW_SESSION_KEY = "worldcup26-app-view-session-id";
const APP_VIEW_DEDUPE_PREFIX = "worldcup26-app-view-sent";
const APP_VIEW_DEDUPE_MS = 30_000;

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateAppViewSessionId() {
  try {
    const stored = window.localStorage.getItem(APP_VIEW_SESSION_KEY);
    if (stored) return stored;

    const next = createSessionId();
    window.localStorage.setItem(APP_VIEW_SESSION_KEY, next);
    return next;
  } catch {
    return createSessionId();
  }
}

function getSearchParam(url: URL, key: string) {
  return url.searchParams.get(key);
}

function shouldSendView(dedupeKey: string) {
  try {
    const key = `${APP_VIEW_DEDUPE_PREFIX}:${dedupeKey}`;
    const previous = Number(window.sessionStorage.getItem(key) ?? 0);
    const now = Date.now();

    if (Number.isFinite(previous) && now - previous < APP_VIEW_DEDUPE_MS) {
      return false;
    }

    window.sessionStorage.setItem(key, String(now));
    return true;
  } catch {
    return true;
  }
}

export function AppViewTracker() {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    const url = new URL(window.location.href);
    const path = `${url.pathname}${url.hash}`;
    const referralCode = getCampaignReferralCode(url.searchParams);
    const utmSource = getSearchParam(url, "utm_source");
    const utmMedium = getSearchParam(url, "utm_medium");
    const utmCampaign = getSearchParam(url, "utm_campaign");
    const utmContent = getSearchParam(url, "utm_content");

    if (referralCode && !url.searchParams.has("ref")) {
      try {
        window.localStorage.setItem("worldcup_referral_code", referralCode);
      } catch {
        // Attribution should help the signup path, but tracking must not depend on storage.
      }
    }

    if (!shouldSendView([path, referralCode, utmSource, utmMedium, utmCampaign, utmContent].join("|"))) return;

    const supabase = createBrowserSupabaseClient();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (data.session?.access_token) {
          headers.Authorization = `Bearer ${data.session.access_token}`;
        }

        return fetch("/api/analytics/view", {
          method: "POST",
          headers,
          keepalive: true,
          body: JSON.stringify({
            path,
            referrer: document.referrer || null,
            referralCode,
            sessionId: getOrCreateAppViewSessionId(),
            utmSource,
            utmMedium,
            utmCampaign,
            utmContent,
          }),
        });
      })
      .catch(() => undefined);
  }, []);

  return null;
}
