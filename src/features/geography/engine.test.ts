import { describe, expect, it } from 'vitest';
import { classifyGuess, distanceKm, guess, proximity, startRound, startRoundFor, type GeographyPack } from './engine';

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
    expect(distanceKm(pack.locations[0]!, pack.locations[1]!)).toBeGreaterThan(200);
    expect(proximity(0)).toBe('correct');
    expect(proximity(200)).toBe('very-close');
    expect(proximity(500)).toBe('close');
    expect(proximity(1000)).toBe('far');
    expect(proximity(2000)).toBe('very-far');
  });
  it('rejects empty packs', () => {
    expect(() => startRound({ ...pack, locations: [] })).toThrow();
  });
  it('starts a round for an explicit target in the active pack', () => {
    expect(startRoundFor(pack, 'warsaw', 42)).toEqual({ packId: 'sample', targetId: 'warsaw', guesses: [], startedAt: 42 });
    expect(() => startRoundFor(pack, 'berlin')).toThrow('Target is not in this map pack');
    expect(() => startRoundFor({ ...pack, locations: [] }, 'krakow')).toThrow();
    const smaller = { ...pack, locations: [pack.locations[0]!] };
    expect(() => startRoundFor(smaller, 'warsaw')).toThrow();
  });
  it('classifies selections without starting or mutating a round', () => {
    const zero = () => 0;
    expect(classifyGuess(pack, 'krakow', 'krakow', zero)).toMatchObject({ result: 'correct', distanceKm: 0 });
    // A neighbour at zero border distance is very close, never the target.
    expect(classifyGuess(pack, 'krakow', 'warsaw', zero)).toMatchObject({ result: 'very-close', distanceKm: 0 });
    expect(classifyGuess(pack, 'krakow', 'warsaw', () => 2000).result).toBe('very-far');
    expect(() => classifyGuess(pack, 'krakow', 'berlin')).toThrow();
    expect(() => classifyGuess(pack, 'berlin', 'krakow')).toThrow();
  });
  it('reports the same feedback from guess(), including repeated guesses', () => {
    const round = startRoundFor(pack, 'krakow', 1);
    const first = guess(pack, round, 'warsaw', distanceKm, 2);
    expect(first.result).toBe(classifyGuess(pack, 'krakow', 'warsaw').result);
    const again = guess(pack, first.round, 'warsaw', distanceKm, 3);
    expect(again).toMatchObject({ repeated: true, result: first.result, round: first.round });
    const solved = guess(pack, again.round, 'krakow', distanceKm, 4).round;
    expect(solved).toMatchObject({ guesses: ['warsaw', 'krakow'], completedAt: 4 });
    expect(guess(pack, solved, 'warsaw').round).toBe(solved);
    expect(() => guess({ ...pack, id: 'other' }, solved, 'warsaw')).toThrow();
  });
});
