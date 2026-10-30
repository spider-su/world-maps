import { describe, expect, it } from 'vitest';
import { createGlobeTap, globeCountryAt, globePinPosition, globePointAt } from './globeSelection';
import { GLOBE_CENTERS } from './globe';

describe('globe place selection', () => {
  it.each([
    ['DEU', 13.4, 52.5], ['BRA', -47.9, -15.8], ['USA', -100, 40],
    ['AUS', 134, -25], ['JPN', 139.7, 35.7], ['ZAF', 28.2, -25.7],
    ['FJI', 178.1, -17.8], ['RUS', -175, 66], ['LSO', 28.2, -29.5],
  ])('finds %s using bundled outlines, including date-line wrapping', (id, longitude, latitude) => {
    expect(globeCountryAt({ longitude, latitude })).toBe(id);
  });
  it('does not turn ocean or unsupported land into a nearby country', () => {
    expect(globeCountryAt({ longitude: -30, latitude: 0 })).toBeUndefined();
    expect(globeCountryAt({ longitude: 0, latitude: -85 })).toBeUndefined();
    expect(globeCountryAt({ longitude: NaN, latitude: 0 })).toBeUndefined();
  });
  it('inverts the tapped point and rejects space outside the visible sphere', () => {
    const centre = globePointAt(GLOBE_CENTERS.europe, 100, 100)!;
    expect(centre.longitude).toBeCloseTo(20);
    expect(centre.latitude).toBeCloseTo(48);
    expect(globePointAt(GLOBE_CENTERS.europe, 0, 0)).toBeUndefined();
    expect(globePointAt(GLOBE_CENTERS.europe, NaN, 100)).toBeUndefined();
    const point = { longitude: 13.4, latitude: 52.5 };
    const pin = globePinPosition(GLOBE_CENTERS.europe, point)!;
    const inverse = globePointAt(GLOBE_CENTERS.europe, ...pin)!;
    expect(inverse.longitude).toBeCloseTo(point.longitude);
    expect(inverse.latitude).toBeCloseTo(point.latitude);
  });
  it('moves the pin with the sphere and hides it on the far hemisphere', () => {
    const point = { longitude: 20, latitude: 48 };
    expect(globePinPosition(GLOBE_CENTERS.europe, point)).toEqual([100, 100]);
    expect(globePinPosition({ longitude: 30, latitude: 48 }, point)).not.toEqual([100, 100]);
    expect(globePinPosition({ longitude: -160, latitude: -48 }, point)).toBeUndefined();
  });
  it('accepts a tap with minor jitter, but rejects drags, return trips and cancellations', () => {
    const tap = createGlobeTap();
    tap.begin(10, 10); expect(tap.move(12, 11)).toBe(false); expect(tap.end(12, 11)).toBe(true);
    tap.begin(10, 10); expect(tap.move(50, 10)).toBe(true); tap.move(10, 10); expect(tap.end(10, 10)).toBe(false);
    tap.begin(10, 10); expect(tap.end(30, 10)).toBe(false);
    tap.begin(10, 10); tap.cancel(); expect(tap.end(10, 10)).toBe(false);
  });
});
