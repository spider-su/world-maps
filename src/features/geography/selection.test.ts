import { describe, expect, it } from 'vitest';
import { createSelectionGuard, selectionAlternatives } from './selection';
import { europePack, europeShapes } from './europe';
import { startRound } from './engine';

describe('country selection reliability', () => {
  it('provides alternatives for every tiny outline and marker without duplicate IDs', () => {
    expect(new Set(selectionAlternatives.map(s => s.id)).size).toBe(selectionAlternatives.length);
    for (const shape of europeShapes.filter(s => s.area < 700)) {
      expect(selectionAlternatives.some(s => s.id === shape.id)).toBe(true);
    }
    for (let index = 0; index < europePack.locations.length; index++) {
      expect(startRound(europePack, () => (index + 0.5) / europePack.locations.length).targetId).toBe(europePack.locations[index]!.id);
    }
  });
  it('blocks guesses during movement and the release press, then permits a new tap', () => {
    const guard = createSelectionGuard();
    expect(guard.canSelect(0)).toBe(true);
    guard.begin(); expect(guard.canSelect(1000)).toBe(false);
    guard.end(1100); expect(guard.canSelect(1101)).toBe(false);
    expect(guard.canSelect(1300)).toBe(true);
  });
});
