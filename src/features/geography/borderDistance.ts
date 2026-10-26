import type { MapDefinition } from './maps';
import type { DistanceResolver } from './engine';
import type { GeographyLocation } from './engine';
import table from './data/border-distances.json';
const distances: Readonly<Record<string, number>> = table.distances;
/** Precomputed approximate minimum edge distance. Same-ID alone means correct. */
export function europeBorderDistanceKm(a: GeographyLocation, b: GeographyLocation): number {
  if (a.id === b.id) return 0;
  const value = distances[[a.id, b.id].sort().join(':')];
  if (value === undefined) throw new Error('Unknown country outline');
  return value;
}

/** Europe retains its historic table; new packs use their generated regional table. */
export function borderDistanceFor(map: MapDefinition): DistanceResolver {
  if (map.id === 'europe') return europeBorderDistanceKm;
  return (a, b) => {
    if (a.id === b.id) return 0;
    const value = map.distances?.[[a.id, b.id].sort().join(':')];
    if (value === undefined) throw new Error('Unknown country outline');
    return value;
  };
}
