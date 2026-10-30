// Build-time only: node scripts/build-globe.mjs /path/to/ne_110m_land.geojson
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { geoArea } from 'd3-geo';

const raw = readFileSync(process.argv[2]);
const input = JSON.parse(raw);
const features = input.features.flatMap(feature => {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  return polygons.map(rings => {
    let coordinates = rings.map(ring => ring.map(point => point.slice(0, 2).map(n => Math.round(n * 100) / 100)));
    // D3 spherical polygons use clockwise exteriors for land smaller than a hemisphere.
    if (geoArea({ type: 'Polygon', coordinates }) > 2 * Math.PI) coordinates = coordinates.map(ring => ring.reverse());
    return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates } };
  });
});
const output = JSON.stringify({ type: 'FeatureCollection', features }) + '\n';
writeFileSync(new URL('../src/features/geography/data/globe-land.json', import.meta.url), output);
const sha256 = value => createHash('sha256').update(value).digest('hex');
writeFileSync(new URL('../src/features/geography/data/globe-source.json', import.meta.url), JSON.stringify({
  source: 'Natural Earth 1:110m land, v5.1.2',
  url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_land.geojson',
  license: 'Public domain', sourceSha256: sha256(raw), assetSha256: sha256(output),
  features: features.length, coordinatePrecision: '0.01 degrees',
}, null, 2) + '\n');
const software = ['d3-geo', 'd3-array', 'internmap'].map(name => {
  const directory = new URL(`../node_modules/${name}/`, import.meta.url);
  const { version } = JSON.parse(readFileSync(new URL('package.json', directory)));
  return `${name} ${version}\n\n${readFileSync(new URL('LICENSE', directory), 'utf8')}`;
}).join('\n\n');
writeFileSync(new URL('../src/features/geography/data/globe-licenses.json', import.meta.url), JSON.stringify({
  land: 'Natural Earth 1:110m land, v5.1.2 · Public domain\nMade with Natural Earth. naturalearthdata.com', software,
}, null, 2) + '\n');
console.log(`${features.length} land polygons, ${Buffer.byteLength(output)} bytes`);
