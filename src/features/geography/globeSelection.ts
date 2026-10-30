import { geoDistance, geoOrthographic } from 'd3-geo';
import { maps } from './maps';
import { shapeRings } from './mapPresentation';
import type { GlobeRotation } from './globe';

export interface GlobePoint { longitude: number; latitude: number }
const projection = (rotation: GlobeRotation) => geoOrthographic()
  .rotate([-rotation.longitude, -rotation.latitude, 0]).scale(92).translate([100, 100]);

/** Coordinates are in the globe's 200×200 SVG space, not screen pixels. */
export function globePointAt(rotation: GlobeRotation, x: number, y: number): GlobePoint | undefined {
  if (![x, y].every(Number.isFinite) || Math.hypot(x - 100, y - 100) > 92) return undefined;
  const point = projection(rotation).invert?.([x, y]);
  return point ? { longitude: point[0], latitude: point[1] } : undefined;
}
export function globePinPosition(rotation: GlobeRotation, point: GlobePoint) {
  if (geoDistance([rotation.longitude, rotation.latitude], [point.longitude, point.latitude]) >= Math.PI / 2) return undefined;
  return projection(rotation)([point.longitude, point.latitude]) ?? undefined;
}

// Reuse the generated country outlines and their affine projection. No geocoder,
// nearest-capital guesses or second geographic dataset. Even/odd handles holes.
const outlines = Object.values(maps).map(map => ({
  projection: map.projection!, shapes: map.shapes.map(shape => ({ id: shape.id, rings: shapeRings(shape.path) })),
}));
function insideRing(x: number, y: number, ring: { x: number; y: number }[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i]!, b = ring[j]!;
    if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
export function globeCountryAt(point: GlobePoint): string | undefined {
  if (!Number.isFinite(point.longitude) || !Number.isFinite(point.latitude)) return undefined;
  for (const map of outlines) {
    const p = map.projection;
    const y = p.yoff + (p.north - point.latitude) * p.scale;
    for (const longitude of [point.longitude, point.longitude + 360, point.longitude - 360]) {
      const x = p.xoff + (longitude - p.west) * p.cosLatitude * p.scale;
      for (const shape of map.shapes) {
        if (shape.rings.reduce((inside, ring) => inside !== insideRing(x, y, ring), false)) return shape.id;
      }
    }
  }
  return undefined;
}

/** Once a drag crosses the threshold it cannot become a tap by returning home. */
export function createGlobeTap() {
  let start: { x: number; y: number } | undefined;
  let moved = false;
  return {
    begin(x: number, y: number) { start = { x, y }; moved = false; },
    move(x: number, y: number) { if (start && Math.hypot(x - start.x, y - start.y) > 6) moved = true; return moved; },
    end(x: number, y: number) { const tap = !!start && !moved && Math.hypot(x - start.x, y - start.y) <= 6; start = undefined; return tap; },
    cancel() { start = undefined; },
  };
}
