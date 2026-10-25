import { describe, expect, it } from 'vitest';
import { countryFacts, countryName } from './countryFacts';
import { europePack } from './europe';

describe('offline country learning data', () => {
  it('covers every selectable polygon and marker in both languages', () => {
    expect(Object.keys(countryFacts).sort()).toEqual(europePack.locations.map(item => item.id).sort());
    for (const location of europePack.locations) {
      const facts = countryFacts[location.id]!;
      for (const language of ['en', 'pl'] as const) {
        expect(facts.name[language].length).toBeGreaterThan(1);
        expect(facts.capital[language].length).toBeGreaterThan(1);
      }
      expect(facts.flagSvg).toContain('<svg');
      expect(facts.flagSvg).not.toMatch(/<script|<image|https?:\/\/(?!www\.w3\.org)/);
    }
  });
  it('uses capitals and Polish names rather than country reference coordinates', () => {
    expect(countryFacts.ITA?.capital).toEqual({ en: 'Rome', pl: 'Rzym' });
    expect(countryFacts.POL?.capital.pl).toBe('Warszawa');
    expect(countryName('DEU', 'pl')).toBe('Niemcy');
    expect(countryFacts.KOS?.flagCode).toBe('XK');
  });
});
