import { describe, expect, it } from 'vitest';
import { distanceKm, guess, proximity, startRound, type GeographyPack } from './engine';

const pack: GeographyPack = {
  id: 'sample',
  title: 'Sample',
  kind: 'city',
  locations: [
    { id: 'krakow', name: 'Kraków', latitude: 50.0647, longitude: 19.945 },
    { id: 'warsaw', name: 'Warszawa', latitude: 52.2297, longitude: 21.0122 },
  ],
};

describe('geography engine', () => {
  it('selects a reproducible hidden target', () => {
    expect(startRound(pack, () => 0).targetId).toBe('krakow');
    expect(startRound(pack, () => 0.99).targetId).toBe('warsaw');
  });
  it('keeps previous guesses and completes on correct selection', () => {
    const round = startRound(pack, () => 0, 100);
    const wrong = guess(pack, round, 'warsaw', distanceKm, 200);
    expect(wrong.result).not.toBe('correct');
    expect(wrong.round.guesses).toEqual(['warsaw']);
    const repeat = guess(pack, wrong.round, 'warsaw');
    expect(repeat.repeated).toBe(true);
    expect(repeat.round.guesses).toHaveLength(1);
    const correct = guess(pack, repeat.round, 'krakow', distanceKm, 300);
    expect(correct.result).toBe('correct');
    expect(correct.round.completedAt).toBe(300);
    expect(() => guess(pack, correct.round, 'other')).toThrow();
  });
  it('supports proximity buckets and city distances', () => {
    expect(distanceKm(pack.locations[0], pack.locations[1])).toBeGreaterThan(200);
    expect(proximity(0)).toBe('correct');
    expect(proximity(200)).toBe('very-close');
    expect(proximity(500)).toBe('close');
    expect(proximity(1000)).toBe('far');
    expect(proximity(2000)).toBe('very-far');
  });
  it('rejects empty packs', () => {
    expect(() => startRound({ ...pack, locations: [] })).toThrow();
  });
});
