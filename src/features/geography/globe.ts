import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import type { FeatureCollection } from 'geojson';
import land from './data/globe-land.json';
import type { MapId } from './maps';

export interface GlobeRotation { longitude: number; latitude: number }
export const GLOBE_CENTERS: Record<MapId, GlobeRotation> = {
  europe: { longitude: 20, latitude: 48 }, asia: { longitude: 100, latitude: 30 },
  africa: { longitude: 20, latitude: 0 }, 'north-america': { longitude: -100, latitude: 35 },
  'south-america': { longitude: -60, latitude: -20 }, oceania: { longitude: 155, latitude: -25 },
};
const grid = geoGraticule10();

export function rotateGlobe(current: GlobeRotation, dx: number, dy: number): GlobeRotation {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return current;
  return { longitude: ((current.longitude - dx * 0.6 + 180) % 360 + 360) % 360 - 180,
    latitude: Math.max(-75, Math.min(75, current.latitude + dy * 0.45)) };
}

/** Orthographic sphere: D3 clips the hidden hemisphere and coastline at the horizon. */
export function globePaths(rotation: GlobeRotation) {
  const projection = geoOrthographic().rotate([-rotation.longitude, -rotation.latitude, 0])
    .scale(92).translate([100, 100]).precision(0.7).clipAngle(90);
  const path = geoPath(projection).digits(1);
  return { land: path(land as FeatureCollection) ?? '', grid: path(grid) ?? '' };
}
