/** Public deep link contains an opaque short-lived token, never a UID or profile. */
export const FRIEND_INVITE_BASE = 'https://world-map-1.web.app/friend';
const TOKEN = /^[A-Za-z0-9_-]{32,128}$/;
export const INVITE_TTL_MS = 24 * 60 * 60 * 1000;

export function friendInviteUrl(token: string): string {
  if (!TOKEN.test(token)) throw new Error('Invalid invitation token');
  return `${FRIEND_INVITE_BASE}?invite=${encodeURIComponent(token)}`;
}

/** Reject arbitrary URLs, extra parameters, and malformed tokens from QR scans. */
export function parseFriendInviteUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.origin !== 'https://world-map-1.web.app' || url.pathname !== '/friend' ||
      [...url.searchParams.keys()].some(key => key !== 'invite') ||
      url.searchParams.getAll('invite').length !== 1 || url.hash) return null;
    const token = url.searchParams.get('invite');
    return token && TOKEN.test(token) ? token : null;
  } catch { return null; }
}

export function isInviteExpired(createdAt: number, now: number): boolean {
  return !Number.isFinite(createdAt) || now < createdAt || now - createdAt >= INVITE_TTL_MS;
}
