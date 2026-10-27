import { describe, expect, it } from 'vitest';
import { initialProgress, parseProgress, recordExploration } from './progress';

describe('country exploration tracking', () => {
  it('counts opening a country once and preserves old learning history', () => {
    const state = recordExploration(initialProgress, 'POL');
    expect(state.explored).toEqual(['POL']);
    expect(recordExploration(state, 'POL')).toBe(state);
    expect(recordExploration(state, 'not an id')).toBe(state);
  });
  it('migrates v2 progress without dropping scores or learning', () => {
    const old = { ...initialProgress, schemaVersion: 2, explored: undefined, sessions: [] };
    const parsed = parseProgress(JSON.stringify(old));
    expect(parsed.schemaVersion).toBe(4);
    expect(parsed.explored).toEqual([]);
    expect(parsed.learning).toEqual(old.learning);
  });
  it('parses explored IDs defensively', () => {
    const parsed = parseProgress(JSON.stringify({ schemaVersion: 3, explored: ['POL', 'POL', 1, 'not-id', 'ITA'] }));
    expect(parsed.explored).toEqual(['POL','ITA']);
  });
});
