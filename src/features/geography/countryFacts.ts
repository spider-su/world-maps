import type { Language } from '../../ui/i18n';
import data from './data/country-facts.json';
import continents from './data/continent-maps.json';
import northAmerica from './data/north-america-map.json';
import { localizedCapitals } from './data/localizedCapitals';

export interface CountryFacts {
  name: Record<Language, string>;
  capital: Record<Language, string>;
  flagCode: string;
  flagSvg: string;
}
// Preserve Europe's editorial facts and North America's new offline geometry.
const regionalFacts: Record<string, CountryFacts> = { ...continents.facts, ...northAmerica.facts };
const localizedRegionalFacts: Record<string, CountryFacts> = Object.fromEntries(
  Object.entries(regionalFacts).map(([id, fact]) => [id, {
    ...fact,
    capital: localizedCapitals[id] ? { ...fact.capital, ...localizedCapitals[id] } : fact.capital,
  }]),
);
export const countryFacts: Readonly<Record<string, CountryFacts>> = { ...localizedRegionalFacts, ...data.countries };
export function capitalName(id: string, language: Language): string {
  return countryFacts[id]?.capital[language] ?? id;
}
export function countryName(id: string, language: Language): string {
  return countryFacts[id]?.name[language] ?? id;
}
