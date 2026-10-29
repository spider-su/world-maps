import { describe, expect, it } from 'vitest';
import { geoArea } from 'd3-geo';
import type { FeatureCollection } from 'geojson';
import land from './data/globe-land.json';
import { GLOBE_CENTERS, globePaths, rotateGlobe } from './globe';

describe('offline rotating globe', () => {
  it('wraps repeated longitude rotations without a jump beyond the valid range', () => {
    expect(rotateGlobe({ longitude: 179, latitude: 20 }, -10, 0)).toEqual({ longitude: -175, latitude: 20 });
    let state = GLOBE_CENTERS.europe;
    for (let i = 0; i < 100; i++) state = rotateGlobe(state, 120, 0);
    expect(state.longitude).toBeCloseTo(GLOBE_CENTERS.europe.longitude);
  });
  it('limits tilt and rejects invalid gesture deltas', () => {
    expect(rotateGlobe(GLOBE_CENTERS.europe, 0, 1000).latitude).toBe(75);
    expect(rotateGlobe(GLOBE_CENTERS.europe, 0, -1000).latitude).toBe(-75);
    expect(rotateGlobe(GLOBE_CENTERS.europe, NaN, 2)).toBe(GLOBE_CENTERS.europe);
  });
  it('ships correctly oriented land polygons rather than their spherical complements', () => {
    const geometry = land as FeatureCollection;
    expect(geometry.features.length).toBeGreaterThan(100);
    for (const feature of geometry.features) expect(geoArea(feature)).toBeLessThan(2 * Math.PI);
    // Real land covers about 29% of the sphere; coarse geometry stays within 25–35%.
    expect(geoArea(geometry) / (4 * Math.PI)).toBeGreaterThan(0.25);
    expect(geoArea(geometry) / (4 * Math.PI)).toBeLessThan(0.35);
  });
  it.each(Object.entries(GLOBE_CENTERS))('clips land to the visible sphere when focused on %s', (_, rotation) => {
    const paths = globePaths(rotation);
    expect(paths.land.length).toBeGreaterThan(100);
    expect(paths.land).not.toMatch(/NaN|Infinity/);
    const coordinates = paths.land.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    expect(Math.min(...coordinates)).toBeGreaterThanOrEqual(7.8);
    expect(Math.max(...coordinates)).toBeLessThanOrEqual(192.2);
  });
  it('reveals different coastlines on the other hemisphere and returns deterministically', () => {
    const initial = globePaths(GLOBE_CENTERS.europe);
    expect(globePaths(rotateGlobe(GLOBE_CENTERS.europe, 300, 0)).land).not.toBe(initial.land);
    expect(globePaths(GLOBE_CENTERS.europe)).toEqual(initial);
  });
});
