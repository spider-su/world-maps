import { describe, expect, it } from 'vitest';
import { initialProgress, parseProgress, recordSession, scoreRound, sessionFromRound, summary, MAX_HISTORY } from './progress';

const completed = {
  packId: 'europe', targetId: 'pl', guesses: ['de', 'pl'],
  startedAt: 100, completedAt: 500,
};

describe('local game progress', () => {
  it('scores by attempts with a nonzero minimum', () => {
    expect(scoreRound(1)).toBe(100);
    expect(scoreRound(2)).toBe(90);
    expect(scoreRound(10)).toBe(10);
    expect(scoreRound(99)).toBe(10);
    expect(scoreRound(0)).toBe(0);
  });
  it('only scores solved rounds', () => {
    expect(sessionFromRound(completed).score).toBe(90);
    expect(() => sessionFromRound({ ...completed, completedAt: undefined })).toThrow();
    expect(() => sessionFromRound({ ...completed, guesses: ['de'] })).toThrow();
  });
  it('is idempotent and summarizes results', () => {
    const session = sessionFromRound(completed);
    const recorded = recordSession(initialProgress, session);
    expect(recordSession(recorded, session)).toBe(recorded);
    expect(summary(recorded, 'europe')).toEqual({ played: 1, bestScore: 90, totalScore: 90, averageGuesses: 2 });
    expect(summary(recorded, 'other').played).toBe(0);
  });
  it('bounds history and recovers from malformed saved data', () => {
    let state = initialProgress;
    for (let i = 0; i < MAX_HISTORY + 5; i++) {
      state = recordSession(state, sessionFromRound({ ...completed, startedAt: i, completedAt: i + 10 }));
    }
    expect(state.sessions).toHaveLength(MAX_HISTORY);
    expect(parseProgress('{bad')).toEqual(initialProgress);
    expect(parseProgress(JSON.stringify({ voiceEnabled: false, sessions: [sessionFromRound(completed), { bad: true }] }))).toEqual({
      voiceEnabled: false, sessions: [sessionFromRound(completed)],
    });
  });
});
