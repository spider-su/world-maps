import type { Language } from '../../ui/i18n';
import type { GeographyPack } from './engine';
import { europePack, europeShapes, europeContextShapes } from './europe';
import { microstates } from './microstates';
import data from './data/continent-maps.json';
import northAmerica from './data/north-america-map.json';

export const MAP_IDS = ['europe', 'asia', 'africa', 'north-america', 'south-america', 'oceania'] as const;
export type MapId = typeof MAP_IDS[number];
export interface MapShape { id: string; path: string; name: string; latitude: number; longitude: number; labelX: number; labelY: number; area: number }
export interface MapDefinition {
  id: MapId; pack: GeographyPack; shapes: MapShape[];
  context: { id: string; path: string }[];
  markers: { id: string; x: number; y: number }[];
  distances?: Readonly<Record<string, number>>;
  projection?: { west: number; north: number; scale: number; cosLatitude: number; xoff: number; yoff: number };
}
function continent(id: Exclude<MapId, 'europe' | 'north-america'>): MapDefinition {
  const map = data.packs[id];
  return {
    id, pack: { id: `${id}-countries`, title: map.title, kind: 'country', locations: map.countries.map(({ id, name, latitude, longitude }) => ({ id, name, latitude, longitude, geometryId: id })) },
    shapes: map.countries, context: map.context, markers: map.countries.filter(s => !s.path).map(s => ({ id: s.id, x: s.labelX, y: s.labelY })), distances: map.distances,
    projection: projectionForBounds(map.bounds),
  };
}
function projectionForBounds(bounds: readonly number[]) {
  const west = bounds[0]!, south = bounds[1]!, east = bounds[2]!, north = bounds[3]!;
  const cosLatitude = Math.cos((north + south) * Math.PI / 360);
  const scale = Math.min(824 / ((east - west) * cosLatitude), 530 / (north - south));
  return { west, north, scale, cosLatitude, xoff: (864 - (east - west) * cosLatitude * scale) / 2, yoff: (570 - (north - south) * scale) / 2 };
}
export const maps: Record<MapId, MapDefinition> = {
  europe: { id: 'europe', pack: europePack, shapes: europeShapes, context: europeContextShapes, markers: microstates },
  asia: continent('asia'), africa: continent('africa'), 'north-america': {
    id: 'north-america',
    pack: { id: 'north-america-countries', title: northAmerica.title, kind: 'country', locations: northAmerica.countries.map(({ id, name, latitude, longitude }) => ({ id, name, latitude, longitude, geometryId: id })) },
    shapes: northAmerica.countries, context: northAmerica.context, markers: northAmerica.countries.filter(s => !s.path).map(s => ({ id: s.id, x: s.labelX, y: s.labelY })), distances: northAmerica.distances,
    projection: northAmerica.projection,
  }, 'south-america': continent('south-america'), oceania: continent('oceania'),
};
const names: Record<Language, Record<MapId, string>> = {
  en: { europe: 'Europe', asia: 'Asia', africa: 'Africa', 'north-america': 'North America', 'south-america': 'South America', oceania: 'Oceania' },
  pl: { europe: 'Europa', asia: 'Azja', africa: 'Afryka', 'north-america': 'Ameryka Północna', 'south-america': 'Ameryka Południowa', oceania: 'Oceania' },
  ru: { europe: 'Европа', asia: 'Азия', africa: 'Африка', 'north-america': 'Северная Америка', 'south-america': 'Южная Америка', oceania: 'Океания' },
};
export const mapName = (id: MapId, language: Language) => names[language][id];
export function mapForCountry(id: string): MapDefinition | undefined {
  return MAP_IDS.map(key => maps[key]).find(map => map.pack.locations.some(country => country.id === id));
}
