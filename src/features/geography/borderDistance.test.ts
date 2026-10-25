import { describe, expect, it } from 'vitest';
import { europePack } from './europe';
import { europeBorderDistanceKm } from './borderDistance';
import { guess, startRound } from './engine';

const get = (id: string) => europePack.locations.find(location => location.id === id)!;

describe('European border distances', () => {
  it('is symmetric and keeps distant countries farther apart', () => {
    expect(europeBorderDistanceKm(get('POL'), get('DEU'))).toBeLessThan(250);
    expect(europeBorderDistanceKm(get('POL'), get('DEU'))).toBe(europeBorderDistanceKm(get('DEU'), get('POL')));
    expect(europeBorderDistanceKm(get('ESP'), get('UKR'))).toBeGreaterThan(1000);
  });
  it('never treats zero-distance neighbours as the secret country', () => {
    const round = startRound(europePack, () => (europePack.locations.findIndex(location => location.id === 'POL') + 0.5) / europePack.locations.length);
    expect(round.targetId).toBe('POL');
    const wrong = guess(europePack, round, 'DEU', () => 0);
    expect(wrong.result).not.toBe('correct');
    expect(wrong.round.completedAt).toBeUndefined();
  });
});

it('uses marker-to-outline proximity for small countries', () => {
  expect(europeBorderDistanceKm(get('MLT'), get('ITA'))).toBeLessThan(250);
  expect(europeBorderDistanceKm(get('AND'), get('FRA'))).toBeLessThan(50);
  expect(europeBorderDistanceKm(get('MCO'), get('FRA'))).toBeLessThan(50);
  expect(europeBorderDistanceKm(get('VAT'), get('ITA'))).toBeLessThan(100);
  expect(europeBorderDistanceKm(get('MLT'), get('ITA'))).toBe(europeBorderDistanceKm(get('ITA'), get('MLT')));
});
