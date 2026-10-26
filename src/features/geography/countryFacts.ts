import type { Language } from '../../ui/i18n';
import data from './data/country-facts.json';
import continents from './data/continent-maps.json';

export interface CountryFacts {
  name: Record<Language, string>;
  capital: Record<Language, string>;
  flagCode: string;
  flagSvg: string;
}
export const countryFacts: Readonly<Record<string, CountryFacts>> = { ...continents.facts, ...data.countries };
export function capitalName(id: string, language: Language): string {
  return countryFacts[id]?.capital[language] ?? id;
}
export function countryName(id: string, language: Language): string {
  return countryFacts[id]?.name[language] ?? id;
}
