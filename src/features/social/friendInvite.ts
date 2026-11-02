/** Public deep link contains an opaque short-lived token, never a UID or profile. */
export const APP_DOWNLOAD_URL = 'https://world-map-1.web.app';
export const FRIEND_INVITE_BASE = `${APP_DOWNLOAD_URL}/friend`;
export const FRIEND_APP_SCHEME = 'worldmaps://friend';
const TOKEN = /^[A-Za-z0-9_-]{32,128}$/;
export const INVITE_TTL_MS = 24 * 60 * 60 * 1000;

export function friendInviteUrl(token: string): string {
  if (!TOKEN.test(token)) throw new Error('Invalid invitation token');
  return `${FRIEND_INVITE_BASE}?invite=${encodeURIComponent(token)}`;
}

/** Match only generated invite URLs. RN's built-in URL.hostname does not handle
 * custom schemes like the browser URL implementation; don't depend on it here.
 * Tokens use URL-safe characters, so no decoding or arbitrary query parser is needed.
 */
export function parseFriendInviteUrl(raw: string): string | null {
  const match = /^(?:https:\/\/(?:world-map-1|world-maps)\.web\.app\/friend|worldmaps:\/\/friend)\?invite=([A-Za-z0-9_-]{32,128})$/.exec(raw);
  return match && match[0] === raw ? match[1]! : null;
}

export function isInviteExpired(createdAt: number, now: number): boolean {
  return !Number.isFinite(createdAt) || now < createdAt || now - createdAt >= INVITE_TTL_MS;
}
