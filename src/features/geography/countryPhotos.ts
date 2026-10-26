import type { ImageSourcePropType } from 'react-native';
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

/** RN 0.86 forwards native request headers through the array source form.
 * React Native Web requires the object form and supplies the browser user agent.
 */
export function countryPhotoSource(url: string, platform: string): ImageSourcePropType {
  return platform === 'web' ? { uri: url } : [{ uri: url,
    headers: { 'User-Agent': 'WorldMaps/0.1 (https://github.com/spider-su/world-maps)' },
  }];
}
