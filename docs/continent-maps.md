# Offline continent packs

The app includes Europe (47 locations, unchanged), Asia (50), Africa (54),
South America (12) and Oceania (14). Choose a map on Home or the map tab; the
selection is shared across tabs for the current app session. All four modes,
country collection, details, difficulty and learning summaries follow that map.
Europe remains the default after relaunch. Completed scores and learning persist
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

New maps use simplified vector outlines and enlarged, clustered small-country
picker targets. Europe keeps its physical relief image; other continents use
vector fills in Learn and country portraits. Country names are bundled in EN,
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
