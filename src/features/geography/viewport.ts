export const MAP_WIDTH = 864;
export const MAP_HEIGHT = 570;
export const MAX_ZOOM = 8;
export type Point = { x: number; y: number };
export interface Viewport { zoom: number; center: Point }
export const INITIAL_VIEWPORT: Viewport = { zoom: 1, center: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 } };
export const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

export function frame(viewport: Viewport) {
  const w = MAP_WIDTH / viewport.zoom;
  const h = MAP_HEIGHT / viewport.zoom;
  return {
    x: clamp(viewport.center.x - w / 2, 0, MAP_WIDTH - w),
    y: clamp(viewport.center.y - h / 2, 0, MAP_HEIGHT - h),
    w, h,
  };
}

export function normalize(viewport: Viewport): Viewport {
  const zoom = clamp(viewport.zoom, 1, MAX_ZOOM);
  const w = MAP_WIDTH / zoom;
  const h = MAP_HEIGHT / zoom;
  return {
    zoom,
    center: {
      x: clamp(viewport.center.x, w / 2, MAP_WIDTH - w / 2),
      y: clamp(viewport.center.y, h / 2, MAP_HEIGHT - h / 2),
    },
  };
}

/** Translate touch deltas in screen pixels into viewBox units. */
export function pan(viewport: Viewport, dx: number, dy: number, screenWidth: number): Viewport {
  const scale = MAP_WIDTH / (screenWidth * viewport.zoom);
  return normalize({ ...viewport, center: {
    x: viewport.center.x - dx * scale,
    y: viewport.center.y - dy * scale,
  } });
}

/** Zoom around a touch focal point, keeping that location under the fingers. */
export function zoomAt(viewport: Viewport, factor: number, focal: Point, screenWidth: number): Viewport {
  const oldFrame = frame(viewport);
  const pointX = oldFrame.x + focal.x / screenWidth * oldFrame.w;
  const pointY = oldFrame.y + focal.y / screenWidth * oldFrame.w;
  const zoom = clamp(viewport.zoom * factor, 1, MAX_ZOOM);
  const newWidth = MAP_WIDTH / zoom;
  return normalize({
    zoom, center: {
      x: pointX + (0.5 - focal.x / screenWidth) * newWidth,
      y: pointY + (MAP_HEIGHT / MAP_WIDTH / 2 - focal.y / screenWidth) * newWidth,
    },
  });
}

/** Small highlighted targets need a useful initial view, including microstates. */
export function focusPoint(point: Point, zoom: number): Viewport {
  return normalize({ zoom, center: point });
}
