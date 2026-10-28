import { describe, expect, it } from 'vitest';
import { DEFAULT_MUSIC, parseMusic } from './musicPreferences';

describe('music preferences', () => {
  it('defaults to muted music and a quiet volume', () => {
    expect(parseMusic(null)).toEqual({ enabled: false, volume: 12, effectsEnabled: false });
    expect(DEFAULT_MUSIC.enabled).toBe(false);
  });
  it('validates persisted data, bounds volume, and tolerates corrupt storage', () => {
    expect(parseMusic('{bad')).toEqual(DEFAULT_MUSIC);
    expect(parseMusic(JSON.stringify({ enabled: true, volume: 100 }))).toEqual({ enabled: true, volume: 30, effectsEnabled: false });
    expect(parseMusic(JSON.stringify({ enabled: false, volume: -10 }))).toEqual({ enabled: false, volume: 0, effectsEnabled: false });
    expect(parseMusic(JSON.stringify({ enabled: 'yes', volume: 'loud' }))).toEqual(DEFAULT_MUSIC);
    expect(parseMusic(JSON.stringify({ enabled: true, volume: 15, effectsEnabled: true })))
      .toEqual({ enabled: true, volume: 15, effectsEnabled: true });
    // Older Europe-only settings migrate without unexpectedly enabling quiz cues.
    expect(parseMusic(JSON.stringify({ enabled: true, volume: 12 })).effectsEnabled).toBe(false);
  });
});
