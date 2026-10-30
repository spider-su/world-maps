import { describe, expect, it } from 'vitest';
import { DEFAULT_DIFFICULTY, DIFFICULTIES, difficultyPack } from './difficulty';
import { europePack, europeShapes } from './europe';
import { startRound, guess } from './engine';
import { answerChoices } from './modes';
import { MAP_IDS, maps } from './maps';

describe('country difficulty pools', () => {
  it('offers broad Normal coverage and nested pools on every continent', () => {
    for (const id of MAP_IDS) {
      const map = maps[id];
      const easy = difficultyPack('easy', map).locations;
      const normal = difficultyPack('normal', map).locations;
      expect(normal.length).toBeGreaterThanOrEqual(Math.ceil(map.pack.locations.length * 2 / 3));
      expect(easy.every(location => normal.some(item => item.id === location.id))).toBe(true);
      expect(normal.every(location => map.pack.locations.some(item => item.id === location.id))).toBe(true);
      expect(answerChoices(difficultyPack('normal', map), normal[0]!.id)).toHaveLength(4);
    }
    expect(difficultyPack('normal', maps['north-america']).locations).toHaveLength(16);
    expect(difficultyPack('normal', maps['north-america']).locations.some(item => item.id === 'JAM')).toBe(true);
  });
  it('defaults to medium/large outlines and nests the three pools', () => {
    expect(DEFAULT_DIFFICULTY).toBe('normal');
    const easy = difficultyPack('easy');
    const normal = difficultyPack('normal');
    expect(easy.locations).toHaveLength(7);
    expect(normal.locations).toHaveLength(34);
    expect(difficultyPack('difficult')).toBe(europePack);
    expect(europePack.locations).toHaveLength(47);
    const largest = [...europeShapes].sort((a, b) => b.area - a.area).slice(0, 7).map(s => s.id).sort();
    expect(easy.locations.map(l => l.id).sort()).toEqual(largest);
    expect(normal.locations.every(l => europeShapes.some(s => s.id === l.id && s.area >= 700))).toBe(true);
    expect(easy.locations.every(l => normal.locations.some(n => n.id === l.id))).toBe(true);
  });
  it('uses each pool for targets, guesses and all four Name It choices', () => {
    for (const level of DIFFICULTIES) {
      const pack = difficultyPack(level);
      pack.locations.forEach((location, index) => {
        const round = startRound(pack, () => (index + 0.5) / pack.locations.length, 1);
        expect(round.targetId).toBe(location.id);
        const choices = answerChoices(pack, round.targetId, () => 0.5);
        expect(new Set(choices.map(c => c.id)).size).toBe(4);
        expect(choices.some(c => c.id === round.targetId)).toBe(true);
        expect(choices.every(c => pack.locations.some(l => l.id === c.id))).toBe(true);
        expect(guess(pack, round, location.id, undefined, 2).round.completedAt).toBe(2);
      });
      if (level !== 'difficult') {
        expect(() => guess(pack, startRound(pack), 'VAT')).toThrow('Unknown location');
      }
    }
  });
});
