import { describe, expect, it } from 'vitest';
import { LANGUAGE_OPTIONS } from '../../ui/i18n';
import { gameCopy, gamePrompt } from './copy';
import { capitalName, countryName } from './countryFacts';

function strings(value: object, prefix = ''): [string, string][] {
  return Object.entries(value).flatMap(([key, item]): [string, string][] => typeof item === 'string'
    ? [[`${prefix}${key}`, item]] : strings(item, `${prefix}${key}.`));
}
const keys = (value: object) => strings(value).map(([key]) => key).sort();

describe('game language coverage', () => {
  it('provides the same non-empty keys in English, Polish and Russian', () => {
    expect(Object.keys(gameCopy).sort()).toEqual(LANGUAGE_OPTIONS.map(option => option.id).sort());
    for (const copy of Object.values(gameCopy)) {
      expect(keys(copy)).toEqual(keys(gameCopy.en));
      for (const [key, text] of strings(copy)) expect(text.trim(), key).not.toBe('');
    }
  });
  it('owns the shell tab labels', () => {
    expect([gameCopy.en.home, gameCopy.pl.home, gameCopy.ru.home]).toEqual(['Home', 'Główna', 'Главная']);
    expect([gameCopy.en.settings, gameCopy.pl.settings, gameCopy.ru.settings]).toEqual(['Settings', 'Ustawienia', 'Настройки']);
  });
});

describe('game prompts shown by the screen', () => {
  it('names the Find It target in the selected language', () => {
    expect(gamePrompt('en', 'find-it', 'DEU', false)).toBe('Find: Germany');
    expect(gamePrompt('pl', 'find-it', 'DEU', false)).toBe('Znajdź: Niemcy');
    expect(gamePrompt('ru', 'find-it', 'DEU', false)).toBe('Найдите: Германия');
  });
  it('preserves capital, flag and legacy quiz variants in every language', () => {
    for (const { id: language } of LANGUAGE_OPTIONS) {
      const c = gameCopy[language];
      const capitalPrompt = `${c.capitalFindPrompt} ${capitalName('DEU', language)}`;
      const nameCapitalPrompt = `${c.capitalNamePrompt} ${countryName('DEU', language)}`;
      expect(gamePrompt(language, 'find-it', 'DEU', false, 'capital')).toBe(capitalPrompt);
      expect(gamePrompt(language, 'capital-find', 'DEU', false)).toBe(capitalPrompt);
      expect(gamePrompt(language, 'find-it', 'DEU', false, 'flag')).toBe(c.flagPrompt);
      expect(gamePrompt(language, 'name-it', 'DEU', false, 'name', 'capital')).toBe(nameCapitalPrompt);
      expect(gamePrompt(language, 'capital-name', 'DEU', false)).toBe(nameCapitalPrompt);
      for (const mode of ['find-it', 'name-it', 'capital-find', 'capital-name'] as const) {
        expect(gamePrompt(language, mode, 'DEU', true, 'flag', 'capital')).toBe(c.correct);
      }
    }
  });
  it('never reveals hidden targets and reports completion', () => {
    for (const { id: language } of LANGUAGE_OPTIONS) {
      const c = gameCopy[language];
      for (const mode of ['hot-cold', 'name-it', 'learn'] as const) {
        expect(gamePrompt(language, mode, 'DEU', false)).not.toContain(countryName('DEU', language));
      }
      expect(gamePrompt(language, 'hot-cold', 'DEU', false)).toBe(c.hiddenPrompt);
      expect(gamePrompt(language, 'name-it', 'DEU', false)).toBe(c.namePrompt);
      expect(gamePrompt(language, 'learn', 'DEU', false)).toBe(c.learnPrompt);
      for (const mode of ['hot-cold', 'find-it', 'name-it'] as const) expect(gamePrompt(language, mode, 'DEU', true)).toBe(c.correct);
    }
  });
});
