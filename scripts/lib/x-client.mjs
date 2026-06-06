// Dependency-free X (Twitter) API v2 client.
//
// Solves the "repair X search auth / engage, not only broadcast" gap: a single
// OAuth 1.0a User Context credential set authorizes BOTH read (recent search)
// and write (post / reply / like), so we can find relevant WorldCup + football
// conversations and engage them programmatically. An app-only Bearer token is
// supported as a read-only fallback for search when user-context creds are
// absent.
//
// No third-party packages: OAuth 1.0a signatures are produced with Node's
// built-in crypto (HMAC-SHA1) and requests use the global fetch.

import crypto from "node:crypto";

const API_BASE = "https://api.twitter.com/2";

// RFC 3986 percent-encoding. encodeURIComponent leaves !*'() unescaped, which
// the OAuth 1.0a spec requires to be encoded; ~ stays unreserved.
export function rfc3986Encode(value) {
  return encodeURIComponent(String(value)).replace(
    /[!*'()]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
}

function encodeParams(params) {
  return Object.keys(params)
    .sort()
    .map((key) => `${rfc3986Encode(key)}=${rfc3986Encode(params[key])}`)
    .join("&");
}

// Builds the OAuth 1.0a signature base string. Only query parameters (not a
// JSON request body) participate in the signature for X API v2 endpoints.
export function buildSignatureBaseString({ method, url, params }) {
  return [
    method.toUpperCase(),
    rfc3986Encode(url),
    rfc3986Encode(encodeParams(params)),
  ].join("&");
}

// Returns the OAuth 1.0a Authorization header value for a request.
export function signOAuth1({ method, url, query = {}, creds, nonce, timestamp }) {
  const oauthParams = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: nonce ?? crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp ?? Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };

  const baseString = buildSignatureBaseString({
    method,
    url,
    params: { ...oauthParams, ...query },
  });
  const signingKey = `${rfc3986Encode(creds.apiSecret)}&${rfc3986Encode(
    creds.accessTokenSecret,
  )}`;
  oauthParams.oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  return (
    "OAuth " +
    Object.keys(oauthParams)
      .sort()
      .map((key) => `${rfc3986Encode(key)}="${rfc3986Encode(oauthParams[key])}"`)
      .join(", ")
  );
}

export function loadCredentials(env = process.env) {
  const creds = {
    apiKey: env.X_API_KEY,
    apiSecret: env.X_API_SECRET,
    accessToken: env.X_ACCESS_TOKEN,
    accessTokenSecret: env.X_ACCESS_TOKEN_SECRET,
    bearerToken: env.X_BEARER_TOKEN,
  };
  creds.hasUserContext = Boolean(
    creds.apiKey && creds.apiSecret && creds.accessToken && creds.accessTokenSecret,
  );
  creds.hasBearer = Boolean(creds.bearerToken);
  return creds;
}

function describeMissingAuth(creds, { needWrite }) {
  if (needWrite) {
    return (
      "Write actions require OAuth 1.0a user-context credentials. Set " +
      "X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, and X_ACCESS_TOKEN_SECRET."
    );
  }
  return (
    "Search requires either OAuth 1.0a user-context credentials " +
    "(X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_TOKEN_SECRET) or a " +
    "read-only X_BEARER_TOKEN."
  );
}

async function request({ method, path, query = {}, body, creds, preferBearer }) {
  const url = `${API_BASE}${path}`;
  const needWrite = method !== "GET";

  let authHeader;
  if (needWrite || !preferBearer || !creds.hasBearer) {
    if (!creds.hasUserContext) {
      if (!needWrite && creds.hasBearer) {
        authHeader = `Bearer ${creds.bearerToken}`;
      } else {
        throw new Error(describeMissingAuth(creds, { needWrite }));
      }
    } else {
      authHeader = signOAuth1({ method, url, query, creds });
    }
  } else {
    authHeader = `Bearer ${creds.bearerToken}`;
  }

  const qs = Object.keys(query).length ? `?${encodeParams(query)}` : "";
  const response = await fetch(url + qs, {
    method,
    headers: {
      Authorization: authHeader,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const detail =
      payload?.detail || payload?.title || payload?.errors?.[0]?.message || text;
    throw new Error(`X API ${method} ${path} failed (${response.status}): ${detail}`);
  }
  return payload;
}

export function createXClient(creds = loadCredentials()) {
  return {
    creds,
    // Verifies credentials and returns the authenticated account.
    me() {
      return request({
        method: "GET",
        path: "/users/me",
        query: { "user.fields": "username,name,public_metrics" },
        creds,
      });
    },
    // Recent search (last ~7 days). Returns tweets with author + metrics so the
    // caller can rank conversations worth engaging.
    searchRecent(queryString, { maxResults = 20, preferBearer = true } = {}) {
      return request({
        method: "GET",
        path: "/tweets/search/recent",
        query: {
          query: queryString,
          max_results: String(Math.min(Math.max(maxResults, 10), 100)),
          "tweet.fields": "created_at,public_metrics,lang,conversation_id",
          expansions: "author_id",
          "user.fields": "username,name,verified,public_metrics",
        },
        creds,
        preferBearer,
      });
    },
    postTweet(text, { replyToTweetId } = {}) {
      const body = { text };
      if (replyToTweetId) {
        body.reply = { in_reply_to_tweet_id: replyToTweetId };
      }
      return request({ method: "POST", path: "/tweets", body, creds });
    },
    reply(replyToTweetId, text) {
      return this.postTweet(text, { replyToTweetId });
    },
    async like(tweetId) {
      const meResp = await this.me();
      const userId = meResp?.data?.id;
      if (!userId) throw new Error("Could not resolve authenticated user id for like.");
      return request({
        method: "POST",
        path: `/users/${userId}/likes`,
        body: { tweet_id: tweetId },
        creds,
      });
    },
  };
}
