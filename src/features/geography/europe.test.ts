import { describe, expect, it } from 'vitest';
import { europePack, europeShapes } from './europe';
import { microstates } from './microstates';
import { guess, startRound } from './engine';

describe('Europe Hot & Cold map pack', () => {
  it('contains a unique selectable ID for every rendered shape', () => {
    expect(europeShapes.length).toBeGreaterThanOrEqual(35);
    expect(new Set(europeShapes.map(shape => shape.id)).size).toBe(europeShapes.length);
    expect(europePack.locations.map(location => location.id)).toEqual([...europeShapes, ...microstates].map(shape => shape.id));
    expect(new Set(europePack.locations.map(location => location.id)).size).toBe(europePack.locations.length);
    expect(microstates).toHaveLength(6);
    expect(europeShapes.every(shape => /^M\d/.test(shape.path))).toBe(true);
  });
  it('allows the target to stay hidden until the correct guess', () => {
    const initial = startRound(europePack, () => 0, 1);
    const other = europePack.locations.find(location => location.id !== initial.targetId)!;
    const wrong = guess(europePack, initial, other.id, undefined, 2);
    expect(wrong.result).not.toBe('correct');
    expect(wrong.round.completedAt).toBeUndefined();
    const found = guess(europePack, wrong.round, initial.targetId, undefined, 3);
    expect(found.result).toBe('correct');
    expect(found.round.completedAt).toBe(3);
    expect(found.round.guesses).toEqual([other.id, initial.targetId]);
  });
});
