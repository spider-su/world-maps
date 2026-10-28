import { describe, expect, it } from 'vitest';
import { completionCue } from './soundPolicy';
import { MAP_IDS } from '../geography/maps';

describe('regional audio and quiz cues', () => {
  it('has all five continent IDs for soundtrack selection', () => {
    expect(MAP_IDS).toEqual(['europe','asia','africa','south-america','oceania']);
  });
  it('only plays once when a scored round is completed', () => {
    expect(completionCue('find-it', 1)).toBe('complete');
    expect(completionCue('name-it', 2)).toBe('correct');
    expect(completionCue('hot-cold', 4)).toBe('correct');
    expect(completionCue('learn', 1)).toBeNull();
    expect(completionCue('find-it', 0)).toBeNull();
    expect(completionCue('name-it', -1)).toBeNull();
  });
});
