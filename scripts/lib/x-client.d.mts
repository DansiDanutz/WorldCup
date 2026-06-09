// Type declarations for the dependency-free X client (implementation in
// x-client.mjs). Lets `tsc --noEmit` typecheck tests/x-client.test.ts, which
// imports this module, without enabling allowJs for the .mjs runtime sources.

export interface OAuth1Credentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export interface XCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  bearerToken?: string;
  hasUserContext: boolean;
  hasBearer: boolean;
}

export function rfc3986Encode(value: unknown): string;

export function buildSignatureBaseString(input: {
  method: string;
  url: string;
  params: Record<string, string>;
}): string;

export function signOAuth1(input: {
  method: string;
  url: string;
  query?: Record<string, string>;
  creds: OAuth1Credentials;
  nonce?: string;
  timestamp?: string;
}): string;

export function loadCredentials(env?: Record<string, string | undefined>): XCredentials;

export interface XApiResponse {
  data?: Record<string, unknown> & { id?: string; username?: string; name?: string };
  includes?: { users?: Array<Record<string, unknown>> };
  [key: string]: unknown;
}

export interface XClient {
  creds: XCredentials;
  me(): Promise<XApiResponse>;
  searchRecent(
    queryString: string,
    options?: { maxResults?: number; preferBearer?: boolean },
  ): Promise<XApiResponse>;
  postTweet(text: string, options?: { replyToTweetId?: string }): Promise<XApiResponse>;
  reply(replyToTweetId: string, text: string): Promise<XApiResponse>;
  like(tweetId: string): Promise<XApiResponse>;
}

export function createXClient(creds?: XCredentials): XClient;
