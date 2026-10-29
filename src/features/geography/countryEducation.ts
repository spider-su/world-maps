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

export const educationCopy: Record<Language, { landmark: string }> = {
  en: { landmark: 'Known for' },
  pl: { landmark: 'Znane miejsce' },
  ru: { landmark: 'Известное место' },
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
