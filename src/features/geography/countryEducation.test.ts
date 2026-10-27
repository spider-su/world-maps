import { describe, expect, it } from 'vitest';
import { europePack } from './europe';
import { countryFacts } from './countryFacts';
import { countryRegion, educationCopy, landmarkName } from './countryEducation';

describe('Learn country discovery', () => {
  it('has a localized region, flag and capital for all 47 countries', () => {
    expect(europePack.locations).toHaveLength(47);
    for (const country of europePack.locations) {
      expect(countryFacts[country.id]?.flagSvg).toContain('<svg');
      for (const language of ['en', 'pl', 'ru'] as const) {
        expect(countryRegion(country.id, language)).toBeTruthy();
        expect(educationCopy[language].landmark).toBeTruthy();
        expect(countryFacts[country.id]?.capital[language]).toBeTruthy();
      }
    }
  });
  it('provides optional localized landmark names without inventing unknown facts', () => {
    expect(landmarkName('POL', 'pl')).toContain('Wawel');
    expect(landmarkName('FRA', 'en')).toBe('Eiffel Tower');
    expect(landmarkName('NOT_FOUND', 'ru')).toBeUndefined();
  });
});
