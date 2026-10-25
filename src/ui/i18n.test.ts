import { describe, expect, it } from 'vitest';
import { LANGUAGE_OPTIONS, SPEECH_LOCALES, languageFromLocale, messages, translate } from './i18n';
describe('translations', () => {
  it('has equivalent translation keys', () => {
    for (const { id } of LANGUAGE_OPTIONS) expect(Object.keys(messages.en).sort()).toEqual(Object.keys(messages[id]).sort());
  });
  it('translates settings', () => {
    expect(translate('pl', 'settings')).toBe('Ustawienia');
    expect(translate('ru', 'settings')).toBe('Настройки');
    expect(languageFromLocale('ru_RU')).toBe('ru');
    expect(languageFromLocale('pl-PL')).toBe('pl');
    expect(languageFromLocale('fr-FR')).toBe('en');
    expect(SPEECH_LOCALES.ru).toBe('ru-RU');
  });
});
