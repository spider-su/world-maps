import { focusPoint } from './viewport';
import { describe, expect, it } from 'vitest';
import { frame, INITIAL_VIEWPORT, MAX_ZOOM, normalize, pan, zoomAt } from './viewport';

describe('map viewport gestures', () => {
  it('starts fully zoomed out and clamps pan', () => {
    expect(frame(INITIAL_VIEWPORT)).toEqual({ x: 0, y: 0, w: 864, h: 570 });
    expect(pan(INITIAL_VIEWPORT, 200, 300, 400)).toEqual(INITIAL_VIEWPORT);
    expect(normalize({ zoom: 100, center: { x: -1000, y: 99999 } }).zoom).toBe(MAX_ZOOM);
  });
  it('pans at screen pixel scale', () => {
    const v = normalize({ zoom: 2, center: { x: 432, y: 285 } });
    expect(pan(v, 100, 0, 432).center.x).toBeCloseTo(332);
    expect(pan(v, 0, -50, 432).center.y).toBeCloseTo(335);
  });
  it('keeps point below finger when zooming', () => {
    const zoomed = zoomAt(INITIAL_VIEWPORT, 2, { x: 216, y: 142.5 }, 432);
    expect(zoomed.zoom).toBe(2);
    const f = frame(zoomed);
    expect(f.x + (216 / 432) * f.w).toBeCloseTo(432);
    expect(f.y + (142.5 / 432) * f.w).toBeCloseTo(285);
  });
});

it('focuses a tiny target while respecting the map edges', () => {
  const focused = focusPoint({ x: 330, y: 442 }, 4);
  expect(focused.zoom).toBe(4);
  expect(focused.center).toEqual({ x: 330, y: 442 });
  expect(focusPoint({ x: 0, y: 0 }, 4).center.x).toBe(108);
});


describe('responsive map surface', () => {
  it('fits all map edges on portrait and landscape without unequal axis scales', () => {
    for (const [width, height] of [[390, 480], [900, 300], [320, 240]]) {
      const aspect = height! / width!;
      const fitted = frame(INITIAL_VIEWPORT, aspect);
      expect(fitted.w / fitted.h).toBeCloseTo(width! / height!);
      expect(fitted.x).toBeLessThanOrEqual(0);
      expect(fitted.y).toBeLessThanOrEqual(0);
      expect(fitted.x + fitted.w).toBeGreaterThanOrEqual(864);
      expect(fitted.y + fitted.h).toBeGreaterThanOrEqual(570);
      expect(pan(INITIAL_VIEWPORT, 1000, -1000, width!, aspect)).toEqual(INITIAL_VIEWPORT);
    }
  });
  it('preserves a portrait focal point through zoom and pans at the rendered scale', () => {
    const aspect = 480 / 390;
    const original = normalize({ zoom: 2, center: { x: 432, y: 285 } }, aspect);
    const focal = { x: 160, y: 210 };
    const before = frame(original, aspect);
    const after = frame(zoomAt(original, 1.5, focal, 390, aspect), aspect);
    expect(after.x + focal.x / 390 * after.w).toBeCloseTo(before.x + focal.x / 390 * before.w);
    expect(after.y + focal.y / 390 * after.w).toBeCloseTo(before.y + focal.y / 390 * before.w);
    expect(pan(original, 20, 0, 390, aspect).center.x).toBeCloseTo(432 - 20 * before.w / 390);
  });
  it('keeps tiny targets visible after resizing an already zoomed map', () => {
    for (const aspect of [1.5, 0.4]) {
      const v = normalize(focusPoint({ x: 850, y: 560 }, 4), aspect);
      const visible = frame(v, aspect);
      expect(visible.x).toBeLessThanOrEqual(850);
      expect(visible.x + visible.w).toBeGreaterThanOrEqual(850);
      expect(visible.y).toBeLessThanOrEqual(560);
      expect(visible.y + visible.h).toBeGreaterThanOrEqual(560);
    }
  });
});
