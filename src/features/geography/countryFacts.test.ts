import { describe, expect, it } from 'vitest';
import { countryFacts, countryName } from './countryFacts';
import { maps } from './maps';
const locations = [...new Map(Object.values(maps).flatMap(m => m.pack.locations).map(l => [l.id, l])).values()];

describe('offline country learning data', () => {
  it('covers every selectable polygon and marker in all three languages', () => {
    expect(Object.keys(countryFacts).sort()).toEqual(locations.map(item => item.id).sort());
    for (const location of locations) {
      const facts = countryFacts[location.id]!;
      for (const language of ['en', 'pl', 'ru'] as const) {
        expect(facts.name[language].length).toBeGreaterThan(1);
        expect(facts.capital[language].length).toBeGreaterThan(1);
      }
      expect(facts.flagSvg).toContain('<svg');
      expect(facts.flagSvg).not.toMatch(/<script|<image|https?:\/\/(?!www\.w3\.org)/);
    }
  });
  it('uses capitals and Polish names rather than country reference coordinates', () => {
    expect(countryFacts.ITA?.capital).toEqual({ en: 'Rome', pl: 'Rzym', ru: 'Рим' });
    expect(countryFacts.POL?.capital.pl).toBe('Warszawa');
    expect(countryName('DEU', 'pl')).toBe('Niemcy');
    expect(countryName('DEU', 'ru')).toBe('Германия');
    expect(countryFacts.KOS?.flagCode).toBe('XK');
  });
});
