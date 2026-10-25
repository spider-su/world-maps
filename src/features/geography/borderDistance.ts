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
