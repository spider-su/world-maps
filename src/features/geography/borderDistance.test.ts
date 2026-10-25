import { describe, expect, it } from 'vitest';
import { europePack } from './europe';
import { europeBorderDistanceKm } from './borderDistance';
import { classifyGuess, guess, startRoundFor } from './engine';

const get = (id: string) => europePack.locations.find(location => location.id === id)!;

describe('European border distances', () => {
  it('is symmetric and keeps distant countries farther apart', () => {
    expect(europeBorderDistanceKm(get('POL'), get('DEU'))).toBeLessThan(250);
    expect(europeBorderDistanceKm(get('POL'), get('DEU'))).toBe(europeBorderDistanceKm(get('DEU'), get('POL')));
    expect(europeBorderDistanceKm(get('ESP'), get('UKR'))).toBeGreaterThan(1000);
  });
  it('never treats zero-distance neighbours as the secret country', () => {
    const round = startRoundFor(europePack, 'POL');
    expect(round.targetId).toBe('POL');
    const wrong = guess(europePack, round, 'DEU', () => 0);
    expect(wrong.result).not.toBe('correct');
    expect(wrong.round.completedAt).toBeUndefined();
  });
  it('classifies real adjacent countries for map colors exactly as guess() does', () => {
    const round = startRoundFor(europePack, 'POL', 1);
    for (const id of ['DEU', 'CZE', 'UKR', 'ESP', 'POL']) {
      const shared = classifyGuess(europePack, 'POL', id, europeBorderDistanceKm);
      expect(shared.result).toBe(guess(europePack, round, id, europeBorderDistanceKm, 2).result);
    }
    expect(classifyGuess(europePack, 'POL', 'DEU', europeBorderDistanceKm).result).toBe('very-close');
    expect(classifyGuess(europePack, 'POL', 'POL', europeBorderDistanceKm).result).toBe('correct');
  });
});

it('uses marker-to-outline proximity for small countries', () => {
  expect(europeBorderDistanceKm(get('MLT'), get('ITA'))).toBeLessThan(250);
  expect(europeBorderDistanceKm(get('AND'), get('FRA'))).toBeLessThan(50);
  expect(europeBorderDistanceKm(get('MCO'), get('FRA'))).toBeLessThan(50);
  expect(europeBorderDistanceKm(get('VAT'), get('ITA'))).toBeLessThan(100);
  expect(europeBorderDistanceKm(get('MLT'), get('ITA'))).toBe(europeBorderDistanceKm(get('ITA'), get('MLT')));
});

it('covers all supported pairs with symmetric finite distances and correct marker borders', () => {
  for (const a of europePack.locations) for (const b of europePack.locations) {
    const distance = europeBorderDistanceKm(a, b);
    expect(Number.isFinite(distance)).toBe(true);
    expect(distance).toBeGreaterThanOrEqual(0);
    expect(distance).toBe(europeBorderDistanceKm(b, a));
  }
  expect(europeBorderDistanceKm(get('VAT'), get('ITA'))).toBe(0);
  expect(europeBorderDistanceKm(get('LIE'), get('CHE'))).toBe(0);
  expect(europeBorderDistanceKm(get('GBR'), get('FRA'))).toBeGreaterThan(15);
  expect(europeBorderDistanceKm(get('MLT'), get('ITA'))).toBeGreaterThan(50);
});
