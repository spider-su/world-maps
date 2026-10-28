import type { Language } from '../../ui/i18n';
import data from './data/country-facts.json';
import continents from './data/continent-maps.json';
import { localizedCapitals } from './data/localizedCapitals';

export interface CountryFacts {
  name: Record<Language, string>;
  capital: Record<Language, string>;
  flagCode: string;
  flagSvg: string;
}
// Europe uses its existing editorial capitals. Generated continent facts are
// supplemented at runtime so regenerating their geometry cannot reset translations.
const continentFacts: Record<string, CountryFacts> = Object.fromEntries(
  Object.entries(continents.facts).map(([id, fact]) => [id, {
    ...fact,
    capital: localizedCapitals[id] ? { ...fact.capital, ...localizedCapitals[id] } : fact.capital,
  }]),
);
export const countryFacts: Readonly<Record<string, CountryFacts>> = { ...continentFacts, ...data.countries };
export function capitalName(id: string, language: Language): string {
  return countryFacts[id]?.capital[language] ?? id;
}
export function countryName(id: string, language: Language): string {
  return countryFacts[id]?.name[language] ?? id;
}
