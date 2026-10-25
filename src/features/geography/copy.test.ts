import { describe, expect, it } from 'vitest';
import { gameCopy } from './copy';

function strings(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, item]) => typeof item === 'string'
    ? [`${prefix}${key}`] : strings(item, `${prefix}${key}.`));
}
describe('game language coverage', () => {
  it('provides matching English and Polish keys for every mode and game control', () => {
    expect(strings(gameCopy.en).sort()).toEqual(strings(gameCopy.pl).sort());
    for (const c of Object.values(gameCopy)) expect(c.modes.learn.title.length).toBeGreaterThan(0);
  });
});
