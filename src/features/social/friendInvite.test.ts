import { describe, expect, it } from 'vitest';
import { friendInviteUrl, parseFriendInviteUrl, isInviteExpired, INVITE_TTL_MS } from './friendInvite';
const token = '0123456789abcdef0123456789abcdef0123456789abcdef';

describe('QR and share-link invitations', () => {
  it('round-trips valid opaque tokens', () => expect(parseFriendInviteUrl(friendInviteUrl(token))).toBe(token));
  it('rejects third-party domains, tokens in fragment and extra query data', () => {
    for (const url of [
      'https://evil.example/friend?invite=' + token,
      'http://world-maps.web.app/friend?invite=' + token,
      'https://world-maps.web.app/friend?invite=' + token + '&uid=someone',
      'https://world-maps.web.app/friend?invite=abc',
      'https://world-maps.web.app/friend?invite=' + token + '#foo'
    ]) expect(parseFriendInviteUrl(url)).toBeNull();
    expect(() => friendInviteUrl('abc')).toThrow();
  });
  it('expires at 24 hours and rejects future timestamps', () => {
    expect(isInviteExpired(1000, 1000 + INVITE_TTL_MS - 1)).toBe(false);
    expect(isInviteExpired(1000, 1000 + INVITE_TTL_MS)).toBe(true);
    expect(isInviteExpired(2000, 1000)).toBe(true);
  });
});
