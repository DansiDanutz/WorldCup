export const POST_LOGIN_REDIRECT_KEY = "worldcup_post_login_redirect";

const redirectBaseUrl = "https://worldcup26.world";
const blockedRedirectPrefixes = [
  "/api",
  "/_next",
  "/login",
  "/opengraph-image",
  "/icon.svg",
  "/robots.txt",
  "/sitemap.xml",
];

export function normalizePostLoginRedirect(value: string | null | undefined) {
  const candidate = value?.trim();

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(candidate, redirectBaseUrl);

    if (parsed.origin !== redirectBaseUrl) {
      return null;
    }

    if (
      blockedRedirectPrefixes.some(
        (prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`),
      )
    ) {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function consumePostLoginRedirect(storage: Storage) {
  const nextPath = normalizePostLoginRedirect(storage.getItem(POST_LOGIN_REDIRECT_KEY));
  storage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return nextPath;
}
