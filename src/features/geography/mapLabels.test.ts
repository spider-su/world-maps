import { describe, expect, it } from 'vitest';
import { mapLabels } from './mapLabels';

const countries = [
  { id: 'A', name: 'Alpha', labelX: 100, labelY: 100 },
  { id: 'B', name: 'Beta', labelX: 120, labelY: 100 },
  { id: 'C', name: 'Gamma', labelX: 300, labelY: 100 },
];
const overview = { x: 0, y: 0, w: 400, h: 300 };

describe('map label visibility', () => {
  it('keeps unguessed names hidden by default', () => {
    expect(mapLabels(countries, false, [], overview, 400)).toEqual([]);
    expect(mapLabels(countries, false, ['B'], overview, 400).map(item => item.id)).toEqual(['B']);
  });
  it('prioritizes guessed names and avoids overlapping labels', () => {
    expect(mapLabels(countries, true, ['B'], overview, 400).map(item => item.id)).toEqual(['B', 'C']);
  });
  it('leaves room for the named Learn picker', () => {
    const reserved = [{left: 270, right: 330, top: 76, bottom: 124}];
    expect(mapLabels(countries, true, [], overview, 400, reserved).map(item => item.id)).toEqual(['A']);
  });
  it('reveals more labels when zoom gives them room and excludes offscreen names', () => {
    const detail = { x: 80, y: 80, w: 100, h: 100 };
    expect(mapLabels(countries, true, [], detail, 400).map(item => item.id)).toEqual(['A', 'B']);
  });
});
