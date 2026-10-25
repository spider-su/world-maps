import { describe, expect, it } from 'vitest';
import { findClueForRound, publicMode, MODE_DEFINITIONS } from './modes';
import { europePack } from './europe';
import { countryFacts } from './countryFacts';

describe('quiz variants', () => {
  it('cycles mixed prompts without randomness or repetition within three rounds', () => {
    expect([0, 1, 2, 3].map(i => findClueForRound('mixed', i))).toEqual(['name', 'capital', 'flag', 'name']);
    expect(findClueForRound('flag', 42)).toBe('flag');
  });
  it('keeps old progress identifiers but removes duplicate home cards', () => {
    expect(publicMode('capital-find')).toBe('find-it');
    expect(publicMode('capital-name')).toBe('name-it');
    expect(MODE_DEFINITIONS.map(m => m.id)).toEqual(['hot-cold', 'find-it', 'name-it', 'learn']);
  });
  it('has an offline flag and capital for each selectable country', () => {
    for (const location of europePack.locations) {
      expect(countryFacts[location.id]?.flagSvg).toContain('<svg');
      expect(countryFacts[location.id]?.capital.en).toBeTruthy();
    }
  });
});
