# Globe overview data and projection

Home's rotating overview uses Natural Earth 1:110m land v5.1.2, public domain.
Made with Natural Earth: https://www.naturalearthdata.com/about/terms-of-use/ .

Pinned source:
https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_land.geojson

The source and output hashes are in `src/features/geography/data/globe-source.json`.
Regenerate with `node scripts/build-globe.mjs /path/to/ne_110m_land.geojson`.
The generator rounds coordinates to 0.01 degrees and normalizes polygon winding
for spherical clipping. This is a coarse world overview, separate from gameplay
outlines and official country coverage. No runtime download is used.

Projection uses pinned d3-geo 3.1.1 and its pure-JavaScript dependencies. The
full d3-geo (ISC plus included GeographicLib MIT), d3-array (ISC), and internmap
(ISC) notices are generated into `data/globe-licenses.json` and are available
offline in Settings → Data sources and licenses.
