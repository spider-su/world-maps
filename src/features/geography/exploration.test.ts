import { describe, expect, it } from 'vitest';
import { initialProgress, parseProgress, recordExploration } from './progress';

describe('country exploration tracking', () => {
  it('counts opening a country once and preserves old learning history', () => {
    const state = recordExploration(initialProgress, 'POL');
    expect(state.explored).toEqual(['POL']);
    expect(recordExploration(state, 'POL')).toBe(state);
    expect(recordExploration(state, 'not an id')).toBe(state);
  });
  it('rejects obsolete progress schema', () => {
    expect(() => parseProgress(JSON.stringify({ ...initialProgress, schemaVersion: 2 }))).toThrow('Unsupported progress version');
  });
  it('parses explored IDs defensively', () => {
    const parsed = parseProgress(JSON.stringify({ ...initialProgress, explored: ['POL', 'POL', 1, 'not-id', 'ITA'] }));
    expect(parsed.explored).toEqual(['POL','ITA']);
  });
});
