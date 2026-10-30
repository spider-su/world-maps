import { describe, expect, it } from 'vitest';
import { DEFAULT_SOCIAL_PREFERENCES, parseSocialPreferences } from './socialPreferences';

describe('social consent is explicitly opt-in', () => {
  it('defaults to disabled for absent or invalid storage', () => {
    expect(parseSocialPreferences(null)).toEqual(DEFAULT_SOCIAL_PREFERENCES);
    expect(parseSocialPreferences('{')).toEqual(DEFAULT_SOCIAL_PREFERENCES);
    expect(parseSocialPreferences('{}').enabled).toBe(false);
  });
  it('preserves explicit opt-in without storing game progress', () => {
    expect(parseSocialPreferences('{"enabled":true,"nickname":"Atlas"}')).toEqual({enabled:true,nickname:'Atlas'});
    expect(parseSocialPreferences('{"enabled":"true","nickname":"Atlas"}').enabled).toBe(false);
  });
});
