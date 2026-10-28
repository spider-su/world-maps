import { describe, expect, it } from 'vitest';
import { MAP_IDS, maps } from './maps';
import { capitalName, countryFacts } from './countryFacts';
import raw from './data/continent-maps.json';
import { localizedCapitals } from './data/localizedCapitals';

describe('non-European capital localization', () => {
  it('has complete human-readable Polish and Cyrillic Russian values for all generated capitals', () => {
    expect(Object.keys(localizedCapitals).sort()).toEqual(Object.keys(raw.facts).sort());
    for (const [id, facts] of Object.entries(raw.facts)) {
      expect(capitalName(id, 'en')).toBe(facts.capital.en);
      expect(capitalName(id, 'pl').trim()).toBeTruthy();
      expect(capitalName(id, 'ru')).toMatch(/[А-Яа-яЁё]/u);
      expect(countryFacts[id]).toBeDefined();
    }
  });
  it('retains existing European translations and uses localized capitals across all maps', () => {
    expect(capitalName('POL', 'pl')).toBe('Warszawa');
    expect(capitalName('JPN', 'pl')).toBe('Tokio');
    expect(capitalName('JPN', 'ru')).toBe('Токио');
    expect(capitalName('EGY', 'pl')).toBe('Kair');
    expect(capitalName('BRA', 'ru')).toBe('Бразилиа');
    expect(capitalName('NZL', 'ru')).toBe('Веллингтон');
    for (const mapId of MAP_IDS) {
      for (const country of maps[mapId].pack.locations) {
        expect(capitalName(country.id, 'pl')).toBeTruthy();
        expect(capitalName(country.id, 'ru')).toBeTruthy();
      }
    }
  });
});
