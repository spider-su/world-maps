# World Maps

Offline Europe geography learning game built with Expo / React Native from
[mobile_template](https://github.com/spider-su/mobile_template).

Four modes share one bundled vector map with 47 selectable locations (41 polygons
and six small-country markers): Hot & Cold, Find It, Name It and Learn. Completed
quiz scores and voice preference are stored locally. No API or account required.

Quiz map names stay hidden until guessed/completed. Learn supports freely shown
labels. Pan/zoom, small-country controls and pronunciation are available. Distance
clues approximate border proximity; they are not authoritative measurements.

```sh
npm ci
npm run ci
npx expo-doctor
npx expo start --web --host lan --port 8081
```

See [POC stages and evidence](docs/poc-roadmap.md),
[map data and attribution](docs/europe-map-assets.md), and
[game rules](docs/geography-game-draft.md). The original template documents remain
as development references; game-specific source and the POC roadmap take priority.

The app identity is `world-maps` / `com.spidersu.worldmaps`. Optional environment
overrides are listed in `.env.example`; never reuse another app's signing or IDs.

Web SVG country paths and markers use DOM click events; native uses SVG press
handlers. Preserve the `.web.tsx` adapters to avoid native responder errors on DOM
nodes. CI/source checks do not establish native or store readiness.
