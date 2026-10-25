import { describe, expect, it } from 'vitest';
import { countryFacts, capitalName, countryName } from './countryFacts';
import { europePack } from './europe';
import { answerChoices } from './modes';

describe('European capitals quiz data', () => {
  it('has a capital in all supported languages for every selectable country', () => {
    expect(europePack.locations.length).toBe(47);
    for (const country of europePack.locations) {
      for (const language of ['en', 'pl', 'ru'] as const) {
        expect(capitalName(country.id, language)).toBeTruthy();
        expect(countryName(country.id, language)).toBeTruthy();
        expect(countryFacts[country.id]?.capital[language]).toBe(capitalName(country.id, language));
      }
    }
  });

  it('avoids ambiguous multiple-choice capital answers', () => {
    for (const language of ['en', 'pl', 'ru'] as const) {
      const capitals = europePack.locations.map(country => capitalName(country.id, language).toLocaleLowerCase());
      expect(new Set(capitals).size).toBe(capitals.length);
    }
    const choices = answerChoices(europePack, 'POL', () => 0.3);
    expect(choices).toHaveLength(4);
    expect(choices.some(country => country.id === 'POL')).toBe(true);
    expect(choices.map(country => capitalName(country.id, 'en'))).toContain('Warsaw');
  });

  it('links capital prompts to stable country IDs without altering country data', () => {
    expect(capitalName('POL', 'en')).toBe('Warsaw');
    expect(capitalName('POL', 'pl')).toBe('Warszawa');
    expect(capitalName('POL', 'ru')).toBe('Варшава');
  });
});
