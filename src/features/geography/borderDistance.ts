import { microstates } from './microstates';
import { europeShapes } from './europe';
import type { GeographyLocation } from './engine';

type Point = { x: number; y: number };
type Segment = readonly [Point, Point];

// Simplified Natural Earth outlines are projected to a common local-km plane.
// This is an approximation (not a geodesic boundary distance service).
const REFERENCE_LATITUDE = 52;
const X_KM_PER_MAP_UNIT = 111.2 * Math.cos(REFERENCE_LATITUDE * Math.PI / 180) / 12;
const Y_KM_PER_MAP_UNIT = 111.2 / 15;

function segments(path: string): Segment[] {
  const result: Segment[] = [];
  for (const part of path.split('Z')) {
    const values = part.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    if (values.length < 6) continue;
    const points: Point[] = [];
    for (let i = 0; i < values.length - 1; i += 2) {
      points.push({ x: values[i]! * X_KM_PER_MAP_UNIT, y: values[i + 1]! * Y_KM_PER_MAP_UNIT });
    }
    for (let i = 0; i < points.length; i++) {
      const next = points[(i + 1) % points.length];
      result.push([points[i]!, next!]);
    }
  }
  return result;
}

const byId = new Map(europeShapes.map(shape => [shape.id, segments(shape.path)]));
// Marker countries use their position against polygon edges, not the other
// country's reference center (which makes Malta/Italy misleadingly distant).
for (const state of microstates) {
  const point = { x: state.x * X_KM_PER_MAP_UNIT, y: state.y * Y_KM_PER_MAP_UNIT };
  byId.set(state.id, [[point, point]]);
}
const cache = new Map<string, number>();

function dot(a: Point, b: Point): number { return a.x * b.x + a.y * b.y; }
function subtract(a: Point, b: Point): Point { return { x: a.x - b.x, y: a.y - b.y }; }

function pointToSegmentSquared(p: Point, a: Point, b: Point): number {
  const v = subtract(b, a);
  const d = dot(v, v);
  const t = d > 0 ? Math.max(0, Math.min(1, dot(subtract(p, a), v) / d)) : 0;
  const dx = p.x - (a.x + t * v.x);
  const dy = p.y - (a.y + t * v.y);
  return dx * dx + dy * dy;
}

function orientation(a: Point, b: Point, p: Point): number {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

function crosses(a: Point, b: Point, c: Point, d: Point): boolean {
  const a1 = orientation(a, b, c);
  const a2 = orientation(a, b, d);
  const b1 = orientation(c, d, a);
  const b2 = orientation(c, d, b);
  // Strict crossing only. Collinear disjoint segments are not intersections.
  return a1 * a2 < 0 && b1 * b2 < 0;
}

function edgeDistanceSquared([a, b]: Segment, [c, d]: Segment): number {
  if (crosses(a, b, c, d)) return 0;
  return Math.min(
    pointToSegmentSquared(a, c, d),
    pointToSegmentSquared(b, c, d),
    pointToSegmentSquared(c, a, b),
    pointToSegmentSquared(d, a, b),
  );
}

/** Approximate minimum distance between simplified country-outline edges. */
export function europeBorderDistanceKm(a: GeographyLocation, b: GeographyLocation): number {
  if (a.id === b.id) return 0;
  const key = [a.id, b.id].sort().join(':');
  const previous = cache.get(key);
  if (previous !== undefined) return previous;
  const first = byId.get(a.id);
  const second = byId.get(b.id);
  if (!first || !second) throw new Error('Unknown country outline');
  let distanceSquared = Number.POSITIVE_INFINITY;
  for (const x of first) {
    for (const y of second) distanceSquared = Math.min(distanceSquared, edgeDistanceSquared(x, y));
  }
  const distance = Math.sqrt(distanceSquared);
  cache.set(key, distance);
  return distance;
}
