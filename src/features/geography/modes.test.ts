import { replayCountryId } from './modes';
import { canRevealNames } from './modes';
import { describe, expect, it } from 'vitest';
import { answerChoices, nameItAnswer, GAME_MODES } from './modes';
import { startRound, type GeographyPack } from './engine';

const pack: GeographyPack = { id: 'test', title: 'Test', kind: 'country', locations:
  ['A', 'B', 'C', 'D', 'E', 'F'].map((id, i) => ({ id, name: id, latitude: i, longitude: i })) };

describe('geography game modes', () => {
  it('exposes four distinct game modes', () => {
    expect(GAME_MODES).toEqual(['hot-cold', 'find-it', 'name-it', 'learn']);
  });
  it('selects four unique choices containing the target', () => {
    const options = answerChoices(pack, 'B', () => 0);
    expect(options).toHaveLength(4);
    expect(new Set(options.map(item => item.id)).size).toBe(4);
    expect(options.some(item => item.id === 'B')).toBe(true);
  });
  it('tracks wrong and correct Name It answers without duplicate guesses', () => {
    const round = startRound(pack, () => 0, 100);
    const wrong = nameItAnswer(round, 'B', 200);
    expect(wrong.correct).toBe(false);
    const repeated = nameItAnswer(wrong.round, 'B', 250);
    expect(repeated.repeated).toBe(true);
    expect(repeated.round.guesses).toHaveLength(1);
    const solved = nameItAnswer(repeated.round, 'A', 300);
    expect(solved.correct).toBe(true);
    expect(solved.round.completedAt).toBe(300);
    expect(nameItAnswer(solved.round, 'C').round).toEqual(solved.round);
  });
  it('rejects invalid or undersized choice packs', () => {
    expect(() => answerChoices(pack, 'X')).toThrow();
    expect(() => answerChoices({ ...pack, locations: pack.locations.slice(0, 3) }, 'A')).toThrow();
  });
});

it('keeps names hidden in every active quiz and permits exploration after completion', () => {
  for (const mode of ['hot-cold', 'find-it', 'name-it', 'capital-find', 'capital-name'] as const) {
    expect(canRevealNames(mode, false)).toBe(false);
    expect(canRevealNames(mode, true)).toBe(true);
  }
  expect(canRevealNames('learn', false)).toBe(true);
});

 it('replays the Find It prompt after mistakes without revealing hidden targets in other modes', () => {
  expect(replayCountryId('find-it', 'POL', 'DEU')).toBe('POL');
  expect(replayCountryId('capital-find', 'POL', 'DEU')).toBe('POL');
  expect(replayCountryId('hot-cold', 'POL', 'DEU')).toBe('DEU');
  expect(replayCountryId('hot-cold', 'POL')).toBeUndefined();
  expect(replayCountryId('learn', 'POL', 'ITA')).toBe('ITA');
 });
