import { describe, expect, it } from 'vitest';
import { europePack } from './europe';
import { REGION_IDS, regionCountries, regionLabel } from './regions';

describe('regional country collections', () => {
  it('partitions all 47 countries exactly once', () => {
    const ids = REGION_IDS.filter(id => id !== 'all').flatMap(id => regionCountries(id).map(c => c.id));
    expect(ids).toHaveLength(europePack.locations.length);
    expect(new Set(ids).size).toBe(europePack.locations.length);
    expect(new Set(ids)).toEqual(new Set(europePack.locations.map(c => c.id)));
  });
  it('reuses existing country identifiers and translates labels', () => {
    expect(regionCountries('all')).toHaveLength(47);
    expect(regionCountries('central').some(c => c.id === 'POL')).toBe(true);
    expect(regionLabel('central', 'pl')).toBe('Europa Środkowa');
    expect(regionLabel('all', 'ru')).toBe('Вся Европа');
  });
});
