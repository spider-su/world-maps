/** Curated Commons photos are an optional enhancement. The bundled atlas always works offline.
 * Do not add imagery without verifying rights, creator credit and the destination file.
 */
export interface CountryPhoto {
  url: string;
  credit: string;
  source: string;
  license: string;
}
export const countryPhotos: Readonly<Record<string, CountryPhoto>> = {
  POL: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Wawel_Castle_Krakow.jpg?width=850',
    credit: 'Lotse8 / Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Wawel_Castle_Krakow.jpg',
    license: 'CC BY-SA 4.0',
  },
  ITA: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Photo_of_The_Colosseum_in_Rome,_Italy.jpg?width=850',
    credit: 'Minimum-herb / Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Photo_of_The_Colosseum_in_Rome,_Italy.jpg',
    license: 'CC BY-SA 4.0',
  },
};
