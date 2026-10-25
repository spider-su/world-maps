import { describe, expect, it } from 'vitest';
import { europePack } from './europe';
import { countryFacts } from './countryFacts';
import { countryCoordinates, countryRegion, educationCopy, geographicCoordinate, landmarkName } from './countryEducation';

describe('Learn country discovery', () => {
  it('has a localized region, position and atlas identity for all 47 countries', () => {
    expect(europePack.locations).toHaveLength(47);
    for (const country of europePack.locations) {
      expect(countryCoordinates(country.id)).toEqual({ latitude: country.latitude, longitude: country.longitude });
      expect(countryFacts[country.id]?.flagSvg).toContain('<svg');
      for (const language of ['en', 'pl', 'ru'] as const) {
        expect(countryRegion(country.id, language)).toBeTruthy();
        expect(educationCopy[language].atlas).toBeTruthy();
        expect(countryFacts[country.id]?.capital[language]).toBeTruthy();
      }
    }
  });
  it('formats both hemispheres without dropping coordinates', () => {
    expect(geographicCoordinate(52.2, 'latitude')).toBe('52.2°N');
    expect(geographicCoordinate(-1.3, 'longitude')).toBe('1.3°W');
    expect(geographicCoordinate(0, 'longitude')).toBe('0.0°E');
    expect(countryCoordinates('NOT_FOUND')).toBeUndefined();
  });
  it('provides optional localized landmark names without inventing unknown facts', () => {
    expect(landmarkName('POL', 'pl')).toContain('Wawel');
    expect(landmarkName('FRA', 'en')).toBe('Eiffel Tower');
    expect(landmarkName('NOT_FOUND', 'ru')).toBeUndefined();
  });
});
