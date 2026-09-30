"use client";

import { useEffect } from "react";

import { consumePostLoginRedirect } from "@/lib/post-login-redirect";
import { createBrowserSupabaseClient } from "@/lib/supabase";

// Google sign-in always returns to the site root. If the visitor started sign-in
// from somewhere specific (a card, the album), LoginRegister stored that path; this
// sends them back to it once a session exists. It used to live inside the prediction
// Dashboard, so it stopped running when the home page became the card album.
function redirectToPostLoginPath() {
  const nextPath = consumePostLoginRedirect(window.localStorage);
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextPath && nextPath !== currentPath) {
    window.location.replace(nextPath);
  }
}

export function PostLoginRedirectHandler() {
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          redirectToPostLoginPath();
        }
      })
      .catch(() => {});

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        redirectToPostLoginPath();
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}
