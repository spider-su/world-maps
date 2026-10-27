import { describe, expect, it } from 'vitest';
import { profileCopy } from './profileCopy';
import { ACHIEVEMENTS } from './explorerProgress';
import { EXPLORERS, EXPLORER_STAGES } from './explorer';

describe('explorer localization',()=>{
  it('covers all outfits, identities and milestone descriptions in every language',()=>{
    for(const copy of Object.values(profileCopy)) {
      expect(Object.keys(copy).sort()).toEqual(Object.keys(profileCopy.en).sort());
      expect(copy.ranks).toHaveLength(EXPLORER_STAGES.length);
      expect(copy.outfits).toHaveLength(EXPLORER_STAGES.length);
      expect(Object.keys(copy.explorers)).toEqual([...EXPLORERS]);
      expect(Object.keys(copy.badges)).toEqual([...ACHIEVEMENTS]);
      for(const badge of Object.values(copy.badges)) expect(badge.title.length + badge.detail.length).toBeGreaterThan(10);
    }
  });
});
