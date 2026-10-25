import { describe, expect, it } from 'vitest';
import { LANGUAGE_OPTIONS, SPEECH_LOCALES, isLanguage, languageFromLocale } from './i18n';

describe('language definitions', () => {
  it('supports English, Polish and Russian with a speech locale each', () => {
    expect(LANGUAGE_OPTIONS.map(option => option.id)).toEqual(['en', 'pl', 'ru']);
    expect(SPEECH_LOCALES).toEqual({ en: 'en-US', pl: 'pl-PL', ru: 'ru-RU' });
  });
  it('maps device locales and validates saved preferences', () => {
    expect(languageFromLocale('ru_RU')).toBe('ru');
    expect(languageFromLocale('pl-PL')).toBe('pl');
    expect(languageFromLocale('fr-FR')).toBe('en');
    expect(isLanguage('pl')).toBe(true);
    expect(isLanguage('de')).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });
});
