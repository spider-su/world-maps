import { describe, expect, it } from 'vitest';
import { messages, translate } from './i18n';
describe('translations', () => {
  it('has equivalent translation keys', () => {
    expect(Object.keys(messages.en).sort()).toEqual(Object.keys(messages.pl).sort());
  });
  it('translates settings', () => {
    expect(translate('pl', 'settings')).toBe('Ustawienia');
  });
});
