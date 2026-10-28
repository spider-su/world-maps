import { describe, expect, it } from 'vitest';
import { DEFAULT_MUSIC, parseMusic } from './MusicContext';

describe('music preferences', () => {
  it('defaults to muted music and a quiet volume', () => {
    expect(parseMusic(null)).toEqual({ enabled: false, volume: 12 });
    expect(DEFAULT_MUSIC.enabled).toBe(false);
  });
  it('validates persisted data, bounds volume, and tolerates corrupt storage', () => {
    expect(parseMusic('{bad')).toEqual(DEFAULT_MUSIC);
    expect(parseMusic(JSON.stringify({ enabled: true, volume: 100 }))).toEqual({ enabled: true, volume: 30 });
    expect(parseMusic(JSON.stringify({ enabled: false, volume: -10 }))).toEqual({ enabled: false, volume: 0 });
    expect(parseMusic(JSON.stringify({ enabled: 'yes', volume: 'loud' }))).toEqual(DEFAULT_MUSIC);
  });
});
