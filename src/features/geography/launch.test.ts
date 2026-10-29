import { describe, expect, it } from 'vitest';
import { recentQuizMode } from './launch';
import type { CompletedSession } from './progress';
import { polishCopy } from './polishCopy';
const session = (packId: string): CompletedSession => ({ packId, targetId: 'POL', guesses: ['POL'], score: 100, startedAt: 1, completedAt: 2 });
describe('repeat practice launcher', () => {
  it('uses the latest quiz on the selected map, preserving legacy capital aliases', () => {
    expect(recentQuizMode([session('europe-countries:capital-name'), session('asia-countries:find-it')], 'europe-countries')).toBe('name-it');
    expect(recentQuizMode([session('europe-countries:capital-find')], 'europe-countries')).toBe('find-it');
    expect(recentQuizMode([session('europe-countries')], 'europe-countries')).toBe('hot-cold');
    expect(recentQuizMode([session('asia-countries:find-it')], 'europe-countries')).toBeUndefined();
    expect(recentQuizMode([session('europe-countries:learn')], 'europe-countries')).toBeUndefined();
  });
  it('provides all launch and map guidance in EN, PL and RU', () => {
    for (const copy of Object.values(polishCopy)) {
      expect(Object.keys(copy)).toEqual(Object.keys(polishCopy.en));
      expect(Object.values(copy).every(text => text.trim().length > 0)).toBe(true);
    }
  });
});
