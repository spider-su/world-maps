import { describe, expect, it } from 'vitest';
import { difficultyPack } from './difficulty';
import { initialProgress, parseProgress, recordSession, scoreRound, sessionFromRound, summary } from './progress';
import { practiceTarget, recordPractice } from './learning';
import { startRound, startRoundFor, guess } from './engine';
import { europeBorderDistanceKm } from './borderDistance';
import { countryName } from './countryFacts';
import { europePack } from './europe';
import { modePackId } from './modes';

it('preserves legacy scores while migrating and retaining difficulty, voice and learning', () => {
  const pack = difficultyPack('easy');
  const round = startRound(pack, () => 0, 1);
  const completed = guess(pack, round, round.targetId, europeBorderDistanceKm, 2).round;
  const legacy = sessionFromRound(completed);
  const migrated = parseProgress(JSON.stringify({ sessions: [legacy], difficulty: 'easy', voiceEnabled: false }));
  expect(migrated.difficulty).toBe('easy');
  expect(migrated.voiceEnabled).toBe(false);
  expect(summary(migrated, pack.id, 'difficult').played).toBe(1);
  expect(summary(migrated, pack.id, 'normal').played).toBe(0);
  const next = startRound(pack, () => 0.5, 3);
  const learning = recordPractice(migrated.learning, `${pack.id}:find-it`, next, next.targetId, 4);
  const state = recordSession({ ...migrated, learning }, { ...sessionFromRound({ ...next, guesses: [next.targetId], completedAt: 4 }, 'easy'), packId: `${pack.id}:find-it` });
  expect(parseProgress(JSON.stringify(state))).toEqual(state);
  expect(state.sessions[0]).toEqual(legacy);
});

describe('integrated pack practice and localized display', () => {
  it('samples only eligible targets in both practice modes without modifying stored IDs', () => {
    for (const level of ['easy', 'normal', 'difficult'] as const) {
      const pack = difficultyPack(level);
      for (let i = 0; i < 30; i++) for (const mode of ['random', 'adaptive'] as const) {
        const id = practiceTarget(pack, initialProgress.learning, pack.id, mode, pack.locations[0]!.id, () => i / 30, 1);
        expect(pack.locations.some(l => l.id === id)).toBe(true);
        expect(id).not.toBe(pack.locations[0]!.id);
        for (const language of ['en', 'pl', 'ru'] as const) expect(countryName(id, language)).not.toBe(id);
      }
    }
  });
  it('creates explicit-target rounds only within the active difficulty pack', () => {
    for (const level of ['easy', 'normal', 'difficult'] as const) {
      const pack = difficultyPack(level);
      const previous = pack.locations[0]!.id;
      const round = startRoundFor(pack, practiceTarget(pack, initialProgress.learning, modePackId(pack.id, 'find-it'), 'adaptive', previous), 5);
      expect(round.packId).toBe('europe-countries');
      expect(round.startedAt).toBe(5);
      expect(round.targetId).not.toBe(previous);
    }
    const excluded = europePack.locations.find(l => !difficultyPack('easy').locations.some(e => e.id === l.id))!;
    expect(() => startRoundFor(difficultyPack('easy'), excluded.id)).toThrow();
  });
});

describe('saved progress restoration', () => {
  const session = (packId: string, targetId: string, startedAt: number, guesses: string[]) =>
    ({ packId, targetId, guesses, startedAt, completedAt: startedAt + 1, score: scoreRound(guesses.length) });

  it('keeps the exact stored pack IDs for every mode', () => {
    expect(europePack.id).toBe('europe-countries');
    expect(modePackId(europePack.id, 'hot-cold')).toBe('europe-countries');
    expect(modePackId(europePack.id, 'find-it')).toBe('europe-countries:find-it');
    expect(modePackId(europePack.id, 'name-it')).toBe('europe-countries:name-it');
    expect(modePackId(europePack.id, 'capital-find')).toBe('europe-countries:capital-find');
    expect(modePackId(europePack.id, 'capital-name')).toBe('europe-countries:capital-name');
    expect(modePackId(europePack.id, 'learn')).toBe('europe-countries:learn');
    for (const level of ['easy', 'normal', 'difficult'] as const) expect(difficultyPack(level).id).toBe(europePack.id);
  });

  it('restores legacy schema-1 scores under unchanged mode IDs and migrates learning', () => {
    const legacy = JSON.stringify({ voiceEnabled: false, sessions: [
      session('europe-countries', 'POL', 10, ['DEU', 'POL']),
      session('europe-countries:find-it', 'FRA', 20, ['FRA']),
      session('europe-countries:name-it', 'ITA', 30, ['ESP', 'ITA']),
    ] });
    const restored = parseProgress(legacy);
    expect(restored.schemaVersion).toBe(2);
    expect(restored.voiceEnabled).toBe(false);
    expect(restored.difficulty).toBe('normal');
    expect(restored.practiceMode).toBe('adaptive');
    for (const mode of ['hot-cold', 'find-it', 'name-it'] as const) {
      // Legacy rounds without a difficulty count as Difficult.
      expect(summary(restored, modePackId(europePack.id, mode), 'difficult').played).toBe(1);
    }
    expect(restored.learning['europe-countries']?.POL).toMatchObject({ correct: 1, incorrect: 1, firstTry: 0 });
    expect(restored.learning['europe-countries:find-it']?.FRA).toMatchObject({ correct: 1, firstTry: 1 });
    expect(restored.learning['europe-countries:name-it']?.ITA).toMatchObject({ correct: 1, incorrect: 1 });
  });

  it('round-trips current schema-2 progress without re-migrating learning', () => {
    const current = parseProgress(JSON.stringify({
      schemaVersion: 2, difficulty: 'easy', practiceMode: 'random', voiceEnabled: true,
      sessions: [{ ...session('europe-countries:find-it', 'DEU', 40, ['DEU']), difficulty: 'easy' }],
      learning: { 'europe-countries': { POL: { correct: 2, incorrect: 0, firstTry: 2, lastPracticed: 9, recent: [true, true], lastRound: 8, lastGuesses: ['POL'] } } },
    }));
    expect(current.difficulty).toBe('easy');
    expect(current.practiceMode).toBe('random');
    expect(summary(current, modePackId(europePack.id, 'find-it'), 'easy').played).toBe(1);
    // Schema-2 learning is kept as stored rather than rebuilt from sessions.
    expect(Object.keys(current.learning)).toEqual(['europe-countries']);
    expect(parseProgress(JSON.stringify(current))).toEqual(current);
    expect(() => parseProgress(JSON.stringify({ ...current, schemaVersion: 3 }))).toThrow();
  });
});
