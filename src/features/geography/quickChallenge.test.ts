import { describe, expect, it } from 'vitest';
import { challengeQuestions, challengeSummary } from './quickChallenge';
import { difficultyPack } from './difficulty';

describe('Quick Challenge', () => {
  it('creates ten questions with mixed map and multiple-choice mechanics', () => {
    const q = challengeQuestions(difficultyPack('difficult'), () => 0.4);
    expect(q).toHaveLength(10);
    expect(new Set(q.map(item => item.targetId)).size).toBe(10);
    expect(q.filter(item => item.mode === 'find-it')).toHaveLength(5);
    expect(q.filter(item => item.mode === 'name-it')).toHaveLength(5);
    expect(new Set(q.filter(item => item.mode === 'find-it').map(item => item.findClue))).toEqual(new Set(['name', 'capital', 'flag']));
  });
  it('respects easy difficulty without consecutive repeated countries', () => {
    const easy = difficultyPack('easy');
    const q = challengeQuestions(easy, () => 0);
    expect(q).toHaveLength(10);
    for (const item of q) expect(easy.locations.some(loc => loc.id === item.targetId)).toBe(true);
    for (let i = 1; i < q.length; i++) expect(q[i]!.targetId).not.toBe(q[i-1]!.targetId);
  });
  it('summarizes first-try correctness and unique countries to review', () => {
    expect(challengeSummary([{ targetId: 'POL', correct: true }, { targetId: 'DEU', correct: false }, { targetId: 'DEU', correct: false }], 3))
      .toEqual({ correct: 1, total: 3, accuracy: 33, reviewIds: ['DEU'] });
    expect(challengeSummary([], 10)).toEqual({ correct: 0, total: 10, accuracy: 0, reviewIds: [] });
  });
});
