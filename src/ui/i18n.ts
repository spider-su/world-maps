export const LANGUAGE_OPTIONS = [{ id: 'en', label: 'English' }, { id: 'pl', label: 'Polski' }, { id: 'ru', label: 'Русский' }] as const;
export type Language = typeof LANGUAGE_OPTIONS[number]['id'];
export const SPEECH_LOCALES: Record<Language, string> = { en: 'en-US', pl: 'pl-PL', ru: 'ru-RU' };
export function isLanguage(value: unknown): value is Language { return LANGUAGE_OPTIONS.some(option => option.id === value); }
export function languageFromLocale(locale: string): Language {
  const prefix = locale.toLowerCase().split(/[-_]/)[0];
  return isLanguage(prefix) ? prefix : 'en';
}
