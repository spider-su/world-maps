# Europe map assets

The supplied references inform the atlas palette (first image) and label treatment
(third image). Hidden and shown names use the same vector geometry, so country
selection and guess colors stay aligned during pan/zoom. The terrain-heavy second
image is not used as a gameplay background; pale country fills keep heatmap clues
legible. The attached raster images are not shipped in the app.

## Source and generation

Country/context outlines: Natural Earth Admin 0 countries, 1:50m, public domain.

- Dataset: https://www.naturalearthdata.com/downloads/50m-cultural-vectors/
- Terms: https://www.naturalearthdata.com/about/terms-of-use/
- GeoJSON: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson

Download that GeoJSON and run:

```sh
python3 scripts/build-europe-map.py /path/to/ne_50m_admin_0_countries.geojson
```

The generated `src/features/geography/data/europe-map.json` records the input
SHA-256. `europe-locations.json` preserves existing country IDs, names and reference
coordinates. The generator clips at 26°W–46°E / 34°N–72°N, projects to the existing
864×570 coordinate system, and simplifies at 0.35 map units. Geometry includes
islands and polygon holes. No runtime download, API key or extra dependency.
Natural Earth uses default de facto boundaries; these are a cartographic source
convention rather than a claim about disputed sovereignty. Border distance remains
a planar approximation, not an authoritative geodesic measurement.

The pack has 41 polygon countries plus six marker countries. Luxembourg and Cyprus
are now included; gray neighboring land provides non-selectable geographic context.
Marker countries keep the existing distance fallback and accessible numbered buttons.

## Label behavior

Names start hidden and become eligible after a guess. Show names explicitly makes
all country labels eligible; larger countries have priority and overlapping/offscreen
labels are omitted until zoom provides room. Small-country button names are shown
when enabled or guessed. Labels do not intercept country taps. Hide names restores
the guessed-only view; a new round hides unguessed names again. Switching label
visibility does not change guesses, scoring, or saved voice preferences. Switching
game modes resets label visibility. In Name It, names stay hidden until completion
and the highlighted target never reveals a marker name or map label before an
answer; in Learn, the selected country can reveal its name without recording a score.

## Validation

Web checks cover hidden/shown names, selection beneath text, microstate selection,
unchanged guesses while switching labels, zoom, and round restart. Unit tests cover
hidden-name filtering, overlap/viewport filtering, geometry IDs and island/context
coverage. Android/iOS runtime and physical-device evidence remain unverified.

Verified on 2026-10-24: desktop (1000×1000) and mobile-width web (390×844), with
zero console errors and no horizontal overflow. The existing dependency
`pointerEvents` deprecation warning remains. `npm run ci` passes typecheck, lint,
37 unit tests and 3 setup tests. `npx expo-doctor` passes 20/21 checks; installed
Expo 57.0.26 differs from expected ~57.0.31. No dependency upgrade is included.
