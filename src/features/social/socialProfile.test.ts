import { describe, expect, it } from 'vitest';
import { initialProgress } from '../geography/progress';
import { parseSocialProfile, sharedProfile, validateNickname } from './socialProfile';

describe('social profile data minimization', () => {
  it('publishes only explicit progress summary and nickname', () => {
    const progress = { ...initialProgress, explored: ['POL'], voiceEnabled: false };
    const result = sharedProfile(progress, '  Atlas  ', 123);
    expect(result).toMatchObject({ nickname: 'Atlas', discovered: 1, updatedAt: 123 });
    expect(Object.keys(result).sort()).toEqual(['badges','discovered','explorer','level','mastered','nickname','updatedAt','xp']);
    expect(JSON.stringify(result)).not.toContain('POL');
    expect(JSON.stringify(result)).not.toContain('voiceEnabled');
  });
  it('rejects invalid nickname and invalid snapshots', () => {
    expect(() => validateNickname('X')).toThrow();
    expect(() => validateNickname('<script>')).toThrow();
    expect(parseSocialProfile({ nickname: 'A', xp: 0 })).toBeNull();
    expect(parseSocialProfile({ ...sharedProfile(initialProgress, 'Atlas'), badges: ['unknown'] })).toBeNull();
    expect(parseSocialProfile(sharedProfile(initialProgress, 'Atlas'))?.nickname).toBe('Atlas');
  });
});
