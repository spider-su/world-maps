import type { GeographyLocation } from './engine';

/** Marker positions in the same 864x570 draft map coordinates as Europe polygons.
 * Microstates are marker-only until accurate polygons are available.
 */
export const microstates: (GeographyLocation & { x: number; y: number })[] = [
  { id: 'AND', name: 'Andorra', latitude: 42.5063, longitude: 1.5218, x: 330.3, y: 442.4 },
  { id: 'LIE', name: 'Liechtenstein', latitude: 47.166, longitude: 9.555, x: 426.7, y: 372.5 },
  { id: 'MCO', name: 'Monaco', latitude: 43.7384, longitude: 7.4246, x: 401.1, y: 423.9 },
  { id: 'SMR', name: 'San Marino', latitude: 43.9424, longitude: 12.4578, x: 461.5, y: 420.9 },
  { id: 'VAT', name: 'Vatican City', latitude: 41.9029, longitude: 12.4534, x: 461.4, y: 451.5 },
  { id: 'MLT', name: 'Malta', latitude: 35.8992, longitude: 14.5141, x: 486.2, y: 541.5 },
];
