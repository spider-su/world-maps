import type { Language } from '../../ui/i18n';
import type { MapDefinition, MapId, MapShape } from './maps';
import { normalize, type MapBounds, type Point, type Viewport } from './viewport';

export interface MapRegion {
  id: string;
  names: Record<Language, string>;
  countryIds: readonly string[];
}
const regions: Partial<Record<MapId, MapRegion[]>> = {
  europe: [{ id: 'north-atlantic', names: { en: 'North Atlantic', pl: 'Północny Atlantyk', ru: 'Северная Атлантика' }, countryIds: ['ISL'] }],
  asia: [
    { id: 'gulf', names: { en: 'Gulf states', pl: 'Państwa Zatoki', ru: 'Страны Залива' }, countryIds: ['KWT', 'BHR', 'QAT', 'ARE'] },
    { id: 'southeast-islands', names: { en: 'Southeast islands', pl: 'Wyspy płd.-wsch.', ru: 'Юго-восточные острова' }, countryIds: ['SGP', 'BRN', 'TLS'] },
  ],
  africa: [{ id: 'indian-ocean', names: { en: 'Indian Ocean', pl: 'Ocean Indyjski', ru: 'Индийский океан' }, countryIds: ['COM', 'SYC', 'MUS'] }],
  'north-america': [{ id: 'caribbean', names: { en: 'Caribbean', pl: 'Karaiby', ru: 'Карибы' }, countryIds: ['BHS', 'CUB', 'JAM', 'HTI', 'DOM', 'ATG', 'KNA', 'DMA', 'LCA', 'VCT', 'BRB', 'GRD', 'TTO'] }],
  oceania: [
    { id: 'micronesia', names: { en: 'Micronesia', pl: 'Mikronezja', ru: 'Микронезия' }, countryIds: ['PLW', 'FSM', 'MHL', 'KIR', 'NRU'] },
    { id: 'south-pacific', names: { en: 'South Pacific', pl: 'Południowy Pacyfik', ru: 'Южная Океания' }, countryIds: ['SLB', 'VUT', 'FJI', 'TUV', 'WSM', 'TON'] },
  ],
};
export const mapRegions = (id: MapId): readonly MapRegion[] => regions[id] ?? [];

// Bundled generators emit absolute straight-line M…Z rings. No geometry is changed.
export function shapeRings(path: string): Point[][] {
  return path.split('M').filter(part => part.trim()).map(part => {
    const values = (part.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    return Array.from({ length: Math.floor(values.length / 2) }, (_, i) => ({ x: values[i * 2]!, y: values[i * 2 + 1]! }));
  }).filter(points => points.length > 0);
}
function area(points: Point[]) {
  return Math.abs(points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length]!;
    return sum + point.x * next.y - next.x * point.y;
  }, 0));
}
export function boundsForPoints(points: readonly Point[], padding = 12): MapBounds {
  const xs = points.map(point => point.x), ys = points.map(point => point.y);
  const x = Math.min(...xs) - padding, y = Math.min(...ys) - padding;
  return { x, y, w: Math.max(1, Math.max(...xs) - x + padding), h: Math.max(1, Math.max(...ys) - y + padding) };
}
export function regionBounds(map: MapDefinition, region: MapRegion): MapBounds {
  return boundsForPoints(map.shapes.filter(shape => region.countryIds.includes(shape.id)).flatMap(shape => [
    ...shapeRings(shape.path).flat(), { x: shape.labelX, y: shape.labelY },
  ]), 8);
}
/** Mainland fit ignores remote rings; Whole map always retains every original ring. */
export function mapBounds(map: MapDefinition, whole = false): MapBounds {
  const insetIds = whole ? [] : mapRegions(map.id).flatMap(region => [...region.countryIds]);
  const points = map.shapes.filter(shape => !insetIds.includes(shape.id)).flatMap(shape => {
    const rings = shapeRings(shape.path);
    // Far eastern Russia need not shrink all of Asia: its country anchor remains visible.
    const outline = !whole && ((map.id === 'asia' && shape.id === 'RUS') || (map.id === 'europe' && ['RUS', 'TUR'].includes(shape.id))) ? []
      : whole ? rings.flat() : [...rings].sort((a, b) => area(b) - area(a))[0] ?? [];
    return [...outline, { x: shape.labelX, y: shape.labelY }];
  });
  points.push(...map.markers.filter(marker => !insetIds.includes(marker.id)));
  return boundsForPoints(points);
}
export function overviewViewport(map: MapDefinition, aspect: number, whole = false): Viewport {
  const bounds = mapBounds(map, whole);
  return normalize({ bounds, zoom: 1, center: { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 } }, aspect);
}
export function targetViewport(map: MapDefinition, id: string | undefined, aspect: number): Viewport {
  const overview = overviewViewport(map, aspect);
  if (!id || mapRegions(map.id).some(region => region.countryIds.includes(id))) return overview;
  const shape: MapShape | undefined = map.shapes.find(shape => shape.id === id);
  const marker = map.markers.find(marker => marker.id === id);
  const point = marker ?? (shape && { x: shape.labelX, y: shape.labelY });
  if (!point || (shape && shape.area >= 700)) return overview;
  return normalize({ ...overview, zoom: 3, center: point }, aspect);
}
