import { describe, expect, it } from 'vitest';
import { expandPicker, PICKER_SIZE, pickerTargets } from './mapPicker';
import { maps } from './maps';
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

describe('named Learn targets', () => {
  it('keeps wider labels separate, on-screen and reachable across every map', () => {
    for (const map of Object.values(maps)) {
      const locations = [...map.markers, ...map.shapes.filter(s => s.path && s.area < 700).map(s => ({ id: s.id, x: s.labelX, y: s.labelY }))].map((p, number) => ({ ...p, number }));
      for (const size of [80,112]) for (const [width,height] of [[280,180],[320,480],[412,700]]) for (const zoom of [1.8,4,8]) for (const point of locations) {
        const viewport = normalize({zoom,center:point}, height! / width!);
        const visible = frame(viewport, height! / width!);
        const targets = pickerTargets(locations, viewport, width!, height!, size);
        const ids = locations.filter(p => p.x >= visible.x && p.x <= visible.x + visible.w && p.y >= visible.y && p.y <= visible.y + visible.h).map(p => p.id).sort();
        expect(targets.flatMap(t => t.members.map(m => m.id)).sort()).toEqual(ids);
        for (const [index,t] of targets.entries()) {
          expect(t.x).toBeGreaterThanOrEqual((t.width ?? size)/2);
          expect(t.x).toBeLessThanOrEqual(width! - (t.width ?? size)/2);
          expect(t.y).toBeGreaterThanOrEqual(24);
          expect(t.y).toBeLessThanOrEqual(height! - 24);
          for (const other of targets.slice(index+1)) expect(Math.abs(t.x-other.x) >= ((t.width ?? size) + (other.width ?? size))/2 || Math.abs(t.y-other.y) >= 48).toBe(true);
          if (zoom === 8) expect(t.members).toHaveLength(1);
        }
      }
    }
  });
});
