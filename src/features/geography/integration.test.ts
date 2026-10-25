import { describe, expect, it } from 'vitest';
import { difficultyPack } from './difficulty';
import { initialProgress, parseProgress, recordSession, sessionFromRound, summary } from './progress';
import { practiceTarget, recordPractice } from './learning';
import { startRound, guess } from './engine';
import { europeBorderDistanceKm } from './borderDistance';
import { countryName } from './countryFacts';

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
});
