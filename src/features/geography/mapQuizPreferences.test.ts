import { describe, expect, it } from 'vitest';
import { DEFAULT_MAP_QUIZ, parseMapQuizPreferences } from './mapQuizPreferences';
import { MAP_IDS } from './maps';

describe('saved map and quiz variant settings', () => {
  it('uses safe defaults on first launch or corrupt data', () => {
    expect(parseMapQuizPreferences(null)).toEqual(DEFAULT_MAP_QUIZ);
    expect(parseMapQuizPreferences('{bad')).toEqual(DEFAULT_MAP_QUIZ);
    expect(parseMapQuizPreferences('{}')).toEqual(DEFAULT_MAP_QUIZ);
  });
  it('round-trips every continent, flag/mixed clues, and capital answer option', () => {
    for (const mapId of MAP_IDS) {
      const saved = { mapId, findClue: 'flag', nameAnswer: 'capital' };
      expect(parseMapQuizPreferences(JSON.stringify(saved))).toEqual(saved);
    }
    expect(parseMapQuizPreferences(JSON.stringify({ mapId: 'asia', findClue: 'mixed', nameAnswer: 'country' }))).toEqual({ mapId: 'asia', findClue: 'mixed', nameAnswer: 'country' });
  });
  it('ignores obsolete values without resetting valid settings', () => {
    expect(parseMapQuizPreferences(JSON.stringify({ mapId: 'moon', findClue: 'capital', nameAnswer: 'capital' }))).toEqual({ mapId: 'europe', findClue: 'capital', nameAnswer: 'capital' });
    expect(parseMapQuizPreferences(JSON.stringify({ mapId: 'oceania', findClue: 'wrong', nameAnswer: 42 }))).toEqual({ mapId: 'oceania', findClue: 'mixed', nameAnswer: 'country' });
  });
});
