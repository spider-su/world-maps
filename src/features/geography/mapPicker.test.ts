import { describe, expect, it } from 'vitest';
import { expandPicker, PICKER_SIZE, pickerTargets } from './mapPicker';
import { selectionAlternatives } from './selection';
import { INITIAL_VIEWPORT, MAX_ZOOM, frame, normalize } from './viewport';

const locations = selectionAlternatives.map((p, index) => ({ ...p, number: index + 1 }));
function verify(width: number, height: number, zoom: number, x = 432, y = 285) {
  const viewport = normalize({ zoom, center: { x, y } }, height / width);
  const targets = pickerTargets(locations, viewport, width, height);
  const f = frame(viewport, height / width);
  const visible = locations.filter(p => p.x >= f.x && p.x <= f.x + f.w && p.y >= f.y && p.y <= f.y + f.h);
  expect(targets.flatMap(t => t.members.map(p => p.id)).sort()).toEqual(visible.map(p => p.id).sort());
  for (const [index, target] of targets.entries()) {
    expect(target.x).toBeGreaterThanOrEqual(PICKER_SIZE / 2);
    expect(target.x).toBeLessThanOrEqual(width - PICKER_SIZE / 2);
    expect(target.y).toBeGreaterThanOrEqual(PICKER_SIZE / 2);
    expect(target.y).toBeLessThanOrEqual(height - PICKER_SIZE / 2);
    expect(target.x <= width - 120 || target.y <= height - 76).toBe(true);
    for (const other of targets.slice(index + 1)) {
      expect(Math.abs(target.x - other.x) >= PICKER_SIZE || Math.abs(target.y - other.y) >= PICKER_SIZE).toBe(true);
    }
    if (zoom === MAX_ZOOM) expect(target.members).toHaveLength(1);
  }
  return { viewport, targets };
}
describe('on-map country picker', () => {
  it('keeps every visible small country reachable, without overlapping targets or map tools', () => {
    for (const [width, height] of [[280, 180], [300, 450], [390, 600], [900, 300]]) {
      for (const zoom of [1, 1.8, 3, 5, 8]) {
        for (const point of [{ x: 432, y: 285 }, ...locations]) verify(width!, height!, zoom, point.x, point.y);
      }
    }
  });
  it('expands a crowded group without selecting or dropping a country', () => {
    const { viewport, targets } = verify(300, 450, 1.8);
    const group = targets.find(t => t.members.length > 1)!;
    expect(group).toBeDefined();
    const expanded = expandPicker(group, viewport, 300, 450);
    expect(expanded.zoom).toBeGreaterThan(viewport.zoom);
    expect(expanded.zoom).toBeLessThanOrEqual(MAX_ZOOM);
  });
  it('needs no modal or target lookup for an isolated microstate', () => {
    const andorra = locations.find(p => p.id === 'AND')!;
    const targets = pickerTargets([andorra], INITIAL_VIEWPORT, 390, 500);
    expect(targets).toHaveLength(1);
    expect(targets[0]!.members[0]).toMatchObject({ id: 'AND', number: 1 });
    expect(pickerTargets([], INITIAL_VIEWPORT, 390, 500)).toEqual([]);
  });
});
