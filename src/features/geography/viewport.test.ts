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
