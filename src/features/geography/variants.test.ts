import { describe, expect, it } from 'vitest';
import { findClueForRound, canReplayPrompt, publicMode, GAME_MODES } from './modes';
import { europePack } from './europe';
import { countryFacts } from './countryFacts';

describe('quiz variants', () => {
  it('cycles mixed prompts without randomness or repetition within three rounds', () => {
    expect([0, 1, 2, 3].map(i => findClueForRound('mixed', i))).toEqual(['name', 'capital', 'flag', 'name']);
    expect(findClueForRound('flag', 42)).toBe('flag');
  });
  it('never reveals the country by audio during an unsolved flag round', () => {
    expect(canReplayPrompt('find-it', 'flag', false)).toBe(false);
    expect(canReplayPrompt('find-it', findClueForRound('mixed', 2), false)).toBe(false);
    expect(canReplayPrompt('find-it', 'flag', true)).toBe(true);
    expect(canReplayPrompt('find-it', 'name', false)).toBe(true);
    expect(canReplayPrompt('find-it', 'capital', false)).toBe(true);
    expect(canReplayPrompt('capital-find', 'capital', false)).toBe(true);
  });
  it('keeps old progress identifiers but removes duplicate home cards', () => {
    expect(publicMode('capital-find')).toBe('find-it');
    expect(publicMode('capital-name')).toBe('name-it');
    expect(GAME_MODES).toEqual(['hot-cold', 'find-it', 'name-it', 'learn']);
  });
  it('has an offline flag and capital for each selectable country', () => {
    for (const location of europePack.locations) {
      expect(countryFacts[location.id]?.flagSvg).toContain('<svg');
      expect(countryFacts[location.id]?.capital.en).toBeTruthy();
    }
  });
});
