import { describe, expect, it } from 'vitest';
import { initialProgress, parseProgress, sessionFromRound } from './progress';
import { attempts, learningSummary, mastered, migrateLearning, practiceTarget, practiceWeight, recordPractice, type LearningProgress } from './learning';
import type { GeographyPack, Round } from './engine';
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
  it('migrates existing history once and retains scored sessions and preferences', () => {
    const session = sessionFromRound({ ...round, guesses: ['DEU', 'POL'], completedAt: 3 });
    const migrated = parseProgress(JSON.stringify({ sessions: [session], voiceEnabled: false }));
    expect(migrated.sessions).toEqual([session]);
    expect(migrated.voiceEnabled).toBe(false);
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.learning.europe!.POL).toMatchObject({ correct: 1, incorrect: 1, firstTry: 0 });
    const withMiss = { ...migrated, learning: recordPractice(migrated.learning, 'europe', { ...round, startedAt: 8 }, 'FRA', 9) };
    expect(parseProgress(JSON.stringify(withMiss))).toEqual(withMiss);
    expect(migrateLearning([session, session])).toEqual(migrateLearning([session]));
    expect(() => parseProgress('{"schemaVersion":99}')).toThrow('Unsupported progress version');
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
});
