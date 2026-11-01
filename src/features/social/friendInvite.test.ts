import { describe, expect, it, vi } from 'vitest';
import { friendInviteUrl, parseFriendInviteUrl, isInviteExpired, INVITE_TTL_MS } from './friendInvite';
const token = '0123456789abcdef0123456789abcdef0123456789abcdef';

describe('QR and share-link invitations', () => {
  it('round-trips valid opaque tokens', () => expect(parseFriendInviteUrl(friendInviteUrl(token))).toBe(token));
  it('rejects third-party domains, tokens in fragment and extra query data', () => {
    for (const url of [
      'https://evil.example/friend?invite=' + token,
      'http://world-map-1.web.app/friend?invite=' + token,
      'https://world-map-1.web.app/friend?invite=' + token + '&uid=someone',
      'https://world-map-1.web.app/friend?invite=abc',
      'https://world-map-1.web.app/friend?invite=' + token + '#foo'
    ]) expect(parseFriendInviteUrl(url)).toBeNull();
    expect(() => friendInviteUrl('abc')).toThrow();
  });
  it('accepts app links and earlier QR domains without widening the token contract', () => {
    for (const base of ['worldmaps://friend','https://world-map-1.web.app/friend','https://world-maps.web.app/friend']) {
      expect(parseFriendInviteUrl(`${base}?invite=${token}`)).toBe(token);
      for(const suffix of ['&invite='+token,'&uid=x','#token','&next=https://evil.example'])expect(parseFriendInviteUrl(`${base}?invite=${token}${suffix}`)).toBeNull();
    }
    for(const base of ['worldmaps://friend.evil','worldmaps://attacker@friend','worldmaps://friend/path','https://world-map-1.web.app.evil/friend'])expect(parseFriendInviteUrl(`${base}?invite=${token}`)).toBeNull();
  });
  it('handles native custom links without browser URL getters', () => {
    vi.stubGlobal('URL', class { constructor() { throw new Error('Native URL does not support custom hostnames'); } });
    try { expect(parseFriendInviteUrl(`worldmaps://friend?invite=${token}`)).toBe(token); } finally { vi.unstubAllGlobals(); }
  });
  it('expires at 24 hours and rejects future timestamps', () => {
    expect(isInviteExpired(1000, 1000 + INVITE_TTL_MS - 1)).toBe(false);
    expect(isInviteExpired(1000, 1000 + INVITE_TTL_MS)).toBe(true);
    expect(isInviteExpired(2000, 1000)).toBe(true);
  });
});
