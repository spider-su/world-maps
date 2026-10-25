import type { Language } from '../../ui/i18n';
import { europePack } from './europe';

/** Coarse geographic groupings for learning, not political classifications. */
export type EuropeRegion = 'north' | 'west' | 'central' | 'south' | 'east' | 'southeast' | 'crossroads';
const groups: Record<EuropeRegion, string> = {
  north: 'DNK EST FIN ISL IRL LVA LTU NOR SWE',
  west: 'BEL FRA GBR LUX MCO NLD',
  central: 'AUT CHE CZE DEU HUN LIE POL SVK SVN',
  south: 'AND CYP ESP GRC ITA MLT PRT SMR VAT',
  east: 'BLR MDA RUS UKR',
  southeast: 'ALB BGR BIH HRV KOS MKD MNE ROU SRB TUR',
  crossroads: '',
};
const regionById: Record<string, EuropeRegion> = Object.fromEntries(
  (Object.entries(groups) as [EuropeRegion, string][]).flatMap(([region, ids]) =>
    ids.split(' ').filter(Boolean).map(id => [id, region] as const))
);
export const regionNames: Record<Language, Record<EuropeRegion, string>> = {
  en: { north: 'Northern Europe', west: 'Western Europe', central: 'Central Europe', south: 'Southern Europe', east: 'Eastern Europe', southeast: 'Southeastern Europe', crossroads: 'Europe' },
  pl: { north: 'Europa Północna', west: 'Europa Zachodnia', central: 'Europa Środkowa', south: 'Europa Południowa', east: 'Europa Wschodnia', southeast: 'Europa Południowo-Wschodnia', crossroads: 'Europa' },
  ru: { north: 'Северная Европа', west: 'Западная Европа', central: 'Центральная Европа', south: 'Южная Европа', east: 'Восточная Европа', southeast: 'Юго-Восточная Европа', crossroads: 'Европа' },
};

export function countryRegion(id: string, language: Language): string {
  return regionNames[language][regionById[id] ?? 'crossroads'];
}

export function countryCoordinates(id: string): { latitude: number; longitude: number } | undefined {
  const entry = europePack.locations.find(country => country.id === id);
  return entry && { latitude: entry.latitude, longitude: entry.longitude };
}

export function geographicCoordinate(value: number, axis: 'latitude' | 'longitude'): string {
  const cardinal = axis === 'latitude' ? (value < 0 ? 'S' : 'N') : value < 0 ? 'W' : 'E';
  return `${Math.abs(value).toFixed(1)}°${cardinal}`;
}
