import { describe, expect, it } from 'vitest';
import { initialProgress, parseProgress } from './progress';
import { attempts, learningSummary, mastered, practiceTarget, practiceWeight, recordPractice, type LearningProgress } from './learning';
import type { GeographyPack, Round } from './engine';
import { maps } from './maps';
import { difficultyPack } from './difficulty';
const round: Round = { packId: 'europe', targetId: 'POL', guesses: [], startedAt: 1 };
const pack: GeographyPack = { id: 'europe', title: 'Europe', kind: 'country', locations: ['POL', 'DEU', 'FRA'].map(id => ({ id, name: id, latitude: 50, longitude: 10 })) };

describe('country learning and adaptive practice', () => {
  it('keeps abandoned misses, counts unique answers and first-try successes by target/mode', () => {
    const missed = recordPractice({}, 'europe:find-it', round, 'DEU', 2);
    expect(missed['europe:find-it']!.POL!.incorrect).toBe(1);
    expect(recordPractice(missed, 'europe:find-it', round, 'DEU', 3)).toBe(missed);
    const correct = recordPractice(missed, 'europe:find-it', { ...round, guesses: ['DEU'] }, 'POL', 4);
    expect(correct['europe:find-it']!.POL).toMatchObject({ correct: 1, incorrect: 1, firstTry: 0, recent: [false, true], lastPracticed: 4 });
    const first = recordPractice(correct, 'europe:name-it', { ...round, startedAt: 5 }, 'POL', 6);
    expect(first['europe:name-it']!.POL!.firstTry).toBe(1);
    expect(recordPractice(first, 'europe:name-it', { ...round, completedAt: 8 }, 'POL', 9)).toBe(first);
  });
  it('round-trips canonical v4 learning and rejects legacy documents', () => {
    const learning = recordPractice({}, 'europe', round, 'DEU', 2);
    const progress = { ...initialProgress, learning, voiceEnabled: false };
    expect(parseProgress(JSON.stringify(progress))).toEqual(progress);
    expect(() => parseProgress(JSON.stringify({ ...progress, schemaVersion: 2 }))).toThrow('Unsupported progress version');
  });
  it('preserves records with lastRound -1 (unplayed sentinel)', () => {
    const record = { correct: 0, incorrect: 0, firstTry: 0, lastPracticed: 0, recent: [], lastRound: -1, lastGuesses: [] };
    const progress = { ...initialProgress, learning: { europe: { POL: record } } };
    expect(parseProgress(JSON.stringify(progress)).learning.europe?.POL).toEqual(record);
  });
  it('bounds recent answers and reports mastered, missed, unpracticed and accuracy', () => {
    let learning: LearningProgress = {};
    for (let i = 1; i <= 12; i++) learning = recordPractice(learning, 'europe', { ...round, startedAt: i * 10 }, 'POL', i * 10 + 1);
    const record = learning.europe!.POL!;
    expect(mastered(record)).toBe(true);
    expect(record.recent).toHaveLength(10);
    expect(attempts(record)).toBe(12);
    learning = recordPractice(learning, 'europe:find-it', { ...round, targetId: 'DEU', startedAt: 150 }, 'FRA', 151);
    expect(learningSummary(learning, 'europe', ['POL', 'DEU', 'FRA'])).toEqual({ practiced: 2, mastered: 1, needingPractice: 1, accuracy: 92, attempts: 13 });
    expect(learningSummary(learning, 'other', ['POL']).practiced).toBe(0);
  });
  it('samples missed countries more often, revisits older practice and supports uniform random', () => {
    const learning = recordPractice({}, 'europe', round, 'DEU', 2);
    const count = (mode: 'adaptive' | 'random') => {
      const result = { POL: 0, DEU: 0, FRA: 0 };
      for (let i = 0; i < 1000; i++) result[practiceTarget(pack, learning, 'europe', mode, 'FRA', () => (i + 0.5) / 1000, 3) as keyof typeof result]++;
      return result;
    };
    expect(count('adaptive').POL).toBeGreaterThan(count('adaptive').DEU);
    expect(count('random')).toEqual({ POL: 500, DEU: 500, FRA: 0 });
    const r = learning.europe!.POL!;
    expect(practiceWeight(r, 30 * 86_400_000)).toBeGreaterThan(practiceWeight(r, 3));
    // Initial/reopened rounds also avoid the most recently practiced target.
    expect(practiceTarget(pack, learning, 'europe', 'adaptive', undefined, () => 0, 3)).not.toBe('POL');
    expect(() => practiceTarget({ ...pack, locations: [] }, {}, 'europe', 'random')).toThrow();
    expect(practiceTarget({ ...pack, locations: [pack.locations[0]!] }, {}, 'europe', 'random', 'POL')).toBe('POL');
    expect(initialProgress.practiceMode).toBe('adaptive');
  });
  it('discards malformed learning records without losing valid scored history', () => {
    const source = { ...initialProgress, learning: { europe: { POL: { correct: -1 } } } };
    expect(parseProgress(JSON.stringify(source)).learning).toEqual({});
  });
  it('spaces recent targets in both practice modes, including after reopening', () => {
    const largePack = { ...pack, locations: Array.from({ length: 12 }, (_, i) => ({ ...pack.locations[0]!, id: `C${i}` })) };
    let learning: LearningProgress = {};
    for (let i = 0; i < 5; i++) learning = recordPractice(learning, pack.id, { ...round, targetId: `C${i}`, startedAt: i + 10 }, 'wrong', i + 10);
    for (const mode of ['adaptive', 'random'] as const) {
      for (let i = 0; i < 100; i++) {
        const target = practiceTarget(largePack, learning, pack.id, mode, undefined, () => i / 100, 20);
        expect(['C1', 'C2', 'C3', 'C4']).not.toContain(target);
      }
      // An explicitly skipped round also gets a cooldown slot.
      expect(practiceTarget(largePack, learning, pack.id, mode, 'C0', () => 0, 20)).not.toBe('C0');
    }
  });
  it('keeps cooldown scoped to the active map/mode and leaves small pools playable', () => {
    const learning = recordPractice({}, 'other-mode', round, 'DEU', 2);
    expect(practiceTarget(pack, learning, pack.id, 'random', undefined, () => 0)).toBe('POL');
    const two = { ...pack, locations: pack.locations.slice(0, 2) };
    expect(practiceTarget(two, learning, pack.id, 'random', 'POL', () => 0)).toBe('DEU');
    const outside = recordPractice({}, pack.id, { ...round, targetId: 'OUTSIDE' }, 'wrong', 10);
    expect(practiceTarget(pack, outside, pack.id, 'random', undefined, () => 0)).toBe('POL');
  });
  it('gives North America varied quiz runs without repeating the last four targets', () => {
    const pool = difficultyPack('normal', maps['north-america']);
    for (const mode of ['adaptive', 'random'] as const) {
      let learning: LearningProgress = {};
      let seed = 42;
      const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };
      const targets: string[] = [];
      for (let i = 0; i < 80; i++) {
        const id = practiceTarget(pool, learning, pool.id, mode, targets.at(-1), random, i + 1);
        expect(targets.slice(-4)).not.toContain(id);
        targets.push(id);
        learning = recordPractice(learning, pool.id, { packId: pool.id, targetId: id, guesses: [], startedAt: i + 1 }, id, i + 1);
      }
      expect(new Set(targets).size).toBe(pool.locations.length);
    }
  });
});
