# Offline continent packs

The app includes Europe (47 locations, unchanged), Asia (50), Africa (54),
North America (23), South America (12) and Oceania (14). Choose a map on Home or the map tab; the
selection is shared across tabs and saved across app sessions. All four modes,
country collection, details, difficulty and learning summaries follow that map.
Europe remains the default for new installs, while returning users resume their last selected map. Completed scores and learning persist
under separate `<continent>-countries[:mode]` IDs. Existing Europe IDs, progress
schema, storage keys and preferences are unchanged. Explored IDs and restored
guesses are no longer truncated to the old Europe-sized limits.

## Coverage and source conventions

Membership is explicit in `scripts/build-continent-maps.py`. Africa includes 54
UN member states; South America includes 12 sovereign states; Oceania includes
14 UN member states, including the small Pacific island states. Asia includes
Russia, Türkiye, Cyprus and the Caucasus alongside Palestine and Taiwan. Shared
transcontinental countries may occur in Europe and Asia; quiz learning/scores are
separate, while exploration is a shared country-level record. Other selected
nearby territories are noninteractive geographic context. Natural Earth's default
de facto boundaries are cartographic conventions, not sovereignty claims.

New maps use real Natural Earth outlines and enlarged, clustered small-country
picker targets. In Learn and Map previews they now render a clipped offline NASA Blue Marble relief layer aligned to the same geometry; quizzes retain unambiguous political fills. North America includes sovereign countries across the mainland, Central America and Caribbean; Greenland is non-selectable geographic context. All six regions, including Europe, share the same Blue Marble relief style. Country names are bundled in EN,
PL and RU; new capital names retain the source's Latin-script proper names across
languages (existing Europe editorial translations are preserved). Flags are SVGs,
not operating-system emoji. No new runtime dependency or network service.

## Reproduce the bundled data

Use the same public-domain Natural Earth 1:50m GeoJSON as Europe:
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson

The exact input is identified by SHA-256
`3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb`.
Names, capital relationships and coordinates come from mledoze/countries revision
`6031f5df137c41c76d180c55a0782185ae3ed05b` (ODbL 1.0). Flags are unchanged
flag-icons v7.6.0 (`0d8909b00aa8418802a5abf2afa82356b129a7ef`, MIT).
See [country-data.md](country-data.md) and the bundled [license notices](licenses/).
The generator records input checksums in `data/continent-maps.json`; this derived
facts database is distributed under ODbL 1.0, excluding flag artwork.

```sh
python3 -m venv /tmp/world-maps-gis
/tmp/world-maps-gis/bin/pip install shapely==2.0.7
/tmp/world-maps-gis/bin/python scripts/build-continent-maps.py \
  /path/to/ne_50m_admin_0_countries.geojson /path/to/countries.json /path/to/flags/4x3
```

Shapely is a build-time generator tool only. Output is committed and needs no
Python or GIS package to build/run the app. Each pack fits the shared 864×570
viewBox with a local equirectangular projection. Oceania wraps longitudes across
180° so Fiji, Kiribati, Samoa and Tonga remain together. Approximate minimum
polygon separation is precomputed in that same regional plane. This is a game
clue, not a geodesic distance service. Matching country ID alone wins; touching
countries can have zero border separation without being the correct answer.

## Validation

See [commands, artifact identity and emulator evidence](evidence/continent-maps/README.md).

## North America and physical relief refresh

North America adds 23 selectable sovereign states across Canada, the US, Mexico,
Central America and the Caribbean. The country borders, label anchors and
approximate distances are derived from the same Natural Earth 1:50m and
mledoze/countries sources as the previous continent maps. SVG flags are bundled
from flag-icons (MIT); EN/PL/RU names and capital spellings are bundled offline.
The North America data is in `src/features/geography/data/north-america-map.json`;
its independent pack ID is `north-america-countries`, so earlier saved scores
and map IDs are untouched.

The additional offline global atlas `assets/maps/world-blue-marble.jpg` is
NASA Blue Marble global image data (NASA Goddard Space Flight Center; Reto Stöckli)
reproduced from the public dataset at
https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg .
It is georeferenced in the existing SVG local projection and clipped to
country outlines. This is a geographic relief backdrop, **not a new tap map**.
The accurate polygons remain authoritative. NASA images are generally not
subject to US copyright; NASA endorsement is not implied.
Europe now uses the same Blue Marble source, registered to its original
x=(longitude+26)*12 / y=(72-latitude)*15 geometry. The old Natural Earth
Europe raster and its generator remain historical assets; they are not rendered.
Country labels use fixed dark ink with white edging instead of switching to
white in dark mode, improving legibility over bright terrain.

**Acceptance:** test each continent map in Learn and Maps with light/dark theme;
verify country labels across deserts, snow and islands, markers for small Caribbean
states, and contrast on the actual Android preview. Check the new North America
music and the five existing regional tracks separately. A code build cannot
prove map imagery registration or audio fidelity on real devices.
