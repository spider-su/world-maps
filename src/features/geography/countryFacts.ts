import type { Language } from '../../ui/i18n';
import data from './data/country-facts.json';

export interface CountryFacts {
  name: Record<Language, string>;
  capital: Record<Language, string>;
  flagCode: string;
  flagSvg: string;
}
export const countryFacts: Readonly<Record<string, CountryFacts>> = data.countries;
export function countryName(id: string, language: Language): string {
  return countryFacts[id]?.name[language] ?? id;
}
