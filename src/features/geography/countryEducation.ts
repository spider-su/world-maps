import type { Language } from '../../ui/i18n';
import { mapForCountry, mapName } from './maps';

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
  const map = mapForCountry(id);
  return map && map.id !== 'europe' ? mapName(map.id, language) : regionNames[language][regionById[id] ?? 'crossroads'];
}

export function countryCoordinates(id: string): { latitude: number; longitude: number } | undefined {
  const entry = mapForCountry(id)?.pack.locations.find(country => country.id === id);
  return entry && { latitude: entry.latitude, longitude: entry.longitude };
}

export function geographicCoordinate(value: number, axis: 'latitude' | 'longitude'): string {
  const cardinal = axis === 'latitude' ? (value < 0 ? 'S' : 'N') : value < 0 ? 'W' : 'E';
  return `${Math.abs(value).toFixed(1)}°${cardinal}`;
}

export const educationCopy: Record<Language, {
  atlas: string; region: string; coordinates: string; learnMore: string;
  location: string; countryCode: string; explore: string; landmark: string;
}> = {
  en: { atlas: 'Physical atlas · highlighted country', region: 'Region', coordinates: 'Map position', learnMore: 'Discover on the map', location: 'Location', countryCode: 'Country code', explore: 'Tap another country to keep exploring', landmark: 'Famous landmark' },
  pl: { atlas: 'Atlas fizyczny · wyróżnione państwo', region: 'Region', coordinates: 'Położenie na mapie', learnMore: 'Odkrywaj na mapie', location: 'Położenie', countryCode: 'Kod państwa', explore: 'Dotknij kolejnego państwa, aby odkrywać dalej', landmark: 'Znane miejsce' },
  ru: { atlas: 'Физический атлас · выделенная страна', region: 'Регион', coordinates: 'Положение на карте', learnMore: 'Изучайте на карте', location: 'Расположение', countryCode: 'Код страны', explore: 'Нажмите на другую страну, чтобы продолжить', landmark: 'Известное место' },
};

/** Short educational examples; absent entries simply omit this optional tile. */
const landmarkNames: Record<string, Record<Language, string>> = {
  POL: { en: 'Wawel Castle', pl: 'Zamek Królewski na Wawelu', ru: 'Вавельский замок' },
  FRA: { en: 'Eiffel Tower', pl: 'Wieża Eiffla', ru: 'Эйфелева башня' },
  ITA: { en: 'Colosseum', pl: 'Koloseum', ru: 'Колизей' },
  GBR: { en: 'Tower Bridge', pl: 'Tower Bridge', ru: 'Тауэрский мост' },
  DEU: { en: 'Brandenburg Gate', pl: 'Brama Brandenburska', ru: 'Бранденбургские ворота' },
  GRC: { en: 'Acropolis of Athens', pl: 'Akropol ateński', ru: 'Афинский Акрополь' },
  ESP: { en: 'Sagrada Família', pl: 'Sagrada Família', ru: 'Саграда Фамилия' },
  CZE: { en: 'Charles Bridge', pl: 'Most Karola', ru: 'Карлов мост' },
  AUT: { en: 'Schönbrunn Palace', pl: 'Pałac Schönbrunn', ru: 'Дворец Шёнбрунн' },
  PRT: { en: 'Belém Tower', pl: 'Wieża Belém', ru: 'Башня Белен' },
  NLD: { en: 'Kinderdijk windmills', pl: 'Wiatraki w Kinderdijk', ru: 'Мельницы Киндердейка' },
  HRV: { en: 'Old Town of Dubrovnik', pl: 'Stare Miasto w Dubrowniku', ru: 'Старый город Дубровника' },
};
export function landmarkName(id: string, language: Language): string | undefined {
  return landmarkNames[id]?.[language];
}
