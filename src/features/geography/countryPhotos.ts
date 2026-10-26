import data from './data/wikipedia-gallery.json';

export interface CountryPhoto {
  url: string;
  caption: string;
  credit: string;
  source: string;
  license: string;
  licenseUrl: string;
}
export interface CountryWikipedia { article: string; photos: CountryPhoto[] }
/** Metadata only. Photos are requested only after the user opens the online gallery. */
export const countryWikipedia: Readonly<Record<string, CountryWikipedia>> = data.countries;
