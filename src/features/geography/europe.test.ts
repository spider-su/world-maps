import { describe, expect, it } from 'vitest';
import { europePack, europeShapes, europeContextShapes } from './europe';
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
  it('keeps islands and geographic context while including missing countries', () => {
    const italy = europeShapes.find(shape => shape.id === 'ITA')!;
    expect(italy.path.split('M').length).toBeGreaterThan(3);
    expect(europeShapes.some(shape => shape.id === 'LUX')).toBe(true);
    expect(europeShapes.some(shape => shape.id === 'CYP')).toBe(true);
    expect(europeContextShapes.some(shape => shape.id === 'DZA')).toBe(true);
    expect(europePack.locations.some(location => location.id === 'DZA')).toBe(false);
  });
  it('keeps generated coordinates inside the shared map viewport', () => {
    for (const shape of [...europeShapes, ...europeContextShapes]) {
      const coordinates = shape.path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
      expect(coordinates.length % 2).toBe(0);
      coordinates.forEach((coordinate, index) => {
        expect(coordinate).toBeGreaterThanOrEqual(0);
        expect(coordinate).toBeLessThanOrEqual(index % 2 === 0 ? 864 : 570);
      });
    }
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

it('contains finite nondegenerate closed rings for multipart country selection', () => {
  for (const shape of europeShapes) {
    for (const ring of shape.path.split('Z').filter(Boolean)) {
      const values = ring.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
      expect(values.every(Number.isFinite)).toBe(true);
      const points = Array.from({ length: values.length / 2 }, (_, i) => [values[i * 2]!, values[i * 2 + 1]!]);
      const area = points.reduce((sum, a, i) => { const b = points[(i + 1) % points.length]!; return sum + a[0]! * b[1]! - b[0]! * a[1]!; }, 0);
      expect(Math.abs(area)).toBeGreaterThan(0);
    }
  }
});
