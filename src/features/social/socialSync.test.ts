import { describe, expect, it } from 'vitest';
import { initialProgress } from '../geography/progress';
import { sharedProfile } from './socialProfile';
import { needsFriendFetch, needsSocialUpload, socialFingerprint } from './socialSync';

describe('low-traffic social sync policy', () => {
  const profile = sharedProfile(initialProgress, 'Atlas', 100);
  it('ignores timestamp and order of earned badge IDs', () => {
    expect(socialFingerprint({ ...profile, updatedAt: 200 })).toBe(socialFingerprint(profile));
    expect(socialFingerprint({ ...profile, badges: [...profile.badges].reverse() })).toBe(socialFingerprint(profile));
  });
  it('uploads only with consent and connection, after a meaningful change', () => {
    const acknowledged = socialFingerprint(profile);
    expect(needsSocialUpload(profile, null, false, true)).toBe(false);
    expect(needsSocialUpload(profile, null, true, false)).toBe(false);
    expect(needsSocialUpload(profile, acknowledged, true, true)).toBe(false);
    expect(needsSocialUpload({ ...profile, xp: profile.xp + 15 }, acknowledged, true, true)).toBe(true);
    expect(needsSocialUpload(profile, null, true, true)).toBe(true);
  });
  it('does not fetch unchanged friend revisions, even after reconnect', () => {
    expect(needsFriendFetch(4, 4)).toBe(false);
    expect(needsFriendFetch(4, 5)).toBe(true);
    expect(needsFriendFetch(null, 4)).toBe(true);
  });
});
