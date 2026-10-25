export const MAP_WIDTH = 864;
export const MAP_HEIGHT = 570;
export const MAX_ZOOM = 8;
export type Point = { x: number; y: number };
export interface Viewport { zoom: number; center: Point }
export const INITIAL_VIEWPORT: Viewport = { zoom: 1, center: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 } };
export const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const DEFAULT_ASPECT = MAP_HEIGHT / MAP_WIDTH;

/** Fit the entire geography at 1x without stretching it on portrait displays. */
function dimensions(zoom: number, aspect: number) {
  const w = Math.max(MAP_WIDTH, MAP_HEIGHT / aspect) / zoom;
  return { w, h: w * aspect };
}
function boundedCenter(value: number, extent: number, size: number) {
  return extent >= size ? size / 2 : clamp(value, extent / 2, size - extent / 2);
}
export function frame(viewport: Viewport, aspect = DEFAULT_ASPECT) {
  const { w, h } = dimensions(viewport.zoom, aspect);
  return { x: boundedCenter(viewport.center.x, w, MAP_WIDTH) - w / 2,
    y: boundedCenter(viewport.center.y, h, MAP_HEIGHT) - h / 2, w, h };
}
export function normalize(viewport: Viewport, aspect = DEFAULT_ASPECT): Viewport {
  const zoom = clamp(viewport.zoom, 1, MAX_ZOOM);
  const { w, h } = dimensions(zoom, aspect);
  return { zoom, center: { x: boundedCenter(viewport.center.x, w, MAP_WIDTH), y: boundedCenter(viewport.center.y, h, MAP_HEIGHT) } };
}
/** Translate touch deltas using the same scale on both axes. */
export function pan(viewport: Viewport, dx: number, dy: number, screenWidth: number, aspect = DEFAULT_ASPECT): Viewport {
  const scale = frame(viewport, aspect).w / screenWidth;
  return normalize({ ...viewport, center: { x: viewport.center.x - dx * scale, y: viewport.center.y - dy * scale } }, aspect);
}
/** Zoom around a screen point, keeping that geographic location under the fingers. */
export function zoomAt(viewport: Viewport, factor: number, focal: Point, screenWidth: number, aspect = DEFAULT_ASPECT): Viewport {
  const old = frame(viewport, aspect);
  const point = { x: old.x + focal.x / screenWidth * old.w, y: old.y + focal.y / screenWidth * old.w };
  const zoom = clamp(viewport.zoom * factor, 1, MAX_ZOOM);
  const next = dimensions(zoom, aspect);
  return normalize({ zoom, center: { x: point.x + next.w / 2 - focal.x / screenWidth * next.w,
    y: point.y + next.h / 2 - focal.y / screenWidth * next.w } }, aspect);
}
/** Small highlighted targets need a useful initial view. */
export function focusPoint(point: Point, zoom: number): Viewport { return normalize({ zoom, center: point }); }
