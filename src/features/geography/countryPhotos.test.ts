import { describe, expect, it } from 'vitest';
import { countryWikipedia } from './countryPhotos';
import { countryFacts } from './countryFacts';
import { galleryCopy } from './galleryCopy';

describe('Wikipedia country discovery metadata', () => {
  it('covers every bundled country with a direct article and at most three photos', () => {
    expect(Object.keys(countryWikipedia).sort()).toEqual(Object.keys(countryFacts).sort());
    for (const entry of Object.values(countryWikipedia)) {
      expect(new URL(entry.article).origin).toBe('https://en.wikipedia.org');
      expect(new URL(entry.article).pathname).toMatch(/^\/wiki\//);
      expect(entry.photos.length).toBeLessThanOrEqual(3);
      expect(new Set(entry.photos.map(p => p.source)).size).toBe(entry.photos.length);
      for (const photo of entry.photos) {
        expect(['upload.wikimedia.org','thumb.wikimedia.org']).toContain(new URL(photo.url).hostname);
        expect(new URL(photo.url).protocol).toBe('https:');
        expect(new URL(photo.source).origin).toBe('https://commons.wikimedia.org');
        expect(new URL(photo.source).pathname).toMatch(/^\/wiki\/File:/);
        expect(photo.credit.trim().length).toBeGreaterThan(1);
        expect(photo.license.trim().length).toBeGreaterThan(1);
        expect(photo.caption.trim().length).toBeGreaterThan(1);
        expect(photo.credit + photo.caption).not.toMatch(/<[^>]*>/);
        if (photo.licenseUrl) {
          expect(photo.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\/(licenses\/by(-sa)?\/[\w.-]+\/?|publicdomain\/(zero|mark)\/1\.0\/?)$/);
        } else expect(photo.license).toBe('Public domain');
      }
    }
  });
  it('links ambiguous countries to country articles and keeps absent countries absent', () => {
    expect(decodeURIComponent(countryWikipedia.GEO!.article)).toContain('Georgia_(country)');
    expect(countryWikipedia.COG?.article).toContain('Republic_of_the_Congo');
    expect(countryWikipedia.COD?.article).toContain('Democratic_Republic_of_the_Congo');
    expect(countryWikipedia.PSE?.article).toContain('State_of_Palestine');
    expect(countryWikipedia.FSM?.article).toContain('Federated_States_of_Micronesia');
    expect(countryWikipedia.UNKNOWN).toBeUndefined();
  });
  it('has recognizable landmark/landscape examples across continents', () => {
    for (const id of ['POL','ITA','JPN','EGY','AUS']) expect(countryWikipedia[id]!.photos.length).toBeGreaterThan(0);
  });
  it('explains optional online access and failures in every supported language', () => {
    for (const language of ['en','pl','ru'] as const) {
      for (const value of Object.values(galleryCopy[language])) expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
