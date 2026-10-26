import { europePack } from './europe';
import type { GeographyPack } from './engine';
import type { Language } from '../../ui/i18n';
import { regionNames, type EuropeRegion } from './countryEducation';

export type RegionId = 'all' | Exclude<EuropeRegion, 'crossroads'>;
export const REGION_IDS: readonly RegionId[] = ['all', 'north', 'west', 'central', 'south', 'east', 'southeast'];
export function regionLabel(region: RegionId, language: Language): string {
  return region === 'all' ? { en: 'All Europe', pl: 'Cała Europa', ru: 'Вся Европа' }[language] : regionNames[language][region];
}
export function regionCountries(region: RegionId): GeographyPack['locations'] {
  return region === 'all' ? europePack.locations :
    europePack.locations.filter(item => countryRegion(item.id, 'en') === regionNames.en[region]);
}
import { countryRegion } from './countryEducation';
function requireRegion(id: string): string { return countryRegion(id, 'en'); }
export function regionPack(region: RegionId): GeographyPack {
  return { ...europePack, locations: regionCountries(region) };
}
