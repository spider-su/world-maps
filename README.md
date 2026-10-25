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

## Standalone POC preview

Use JDK 17 / Android SDK, then `npm run build:android:preview`. The generated
`artifacts/world-maps-preview.apk` embeds JavaScript and uses development signing.
It does not require Metro. The local verified preview is arm64-v8a; CI defaults to
arm64-v8a + x86_64. This is not a store build.

2026-10-25 validation: 53 tests, Expo Doctor 21/21, Android API 35 emulator and
production web smoke pass. Physical Android, audible speech and iOS remain pending.
See [exact build/device evidence and limitations](docs/poc-testing.md).

Completed scores and voice/language preferences survive relaunch; unfinished rounds
are intentionally not restored. Statistics describe the most recent 100 completed
rounds. One light theme is supported in this POC. Learning data is bundled and its
licenses are available in Settings and [data attribution](docs/country-data.md).

### Country learning

Home offers Adaptive or Random practice. Adaptive revisits recent misses and older
practice while reducing repeats of mastered countries. Home/Settings show local
Europe learning statistics and per-country accuracy. Existing scores migrate once
without being reset; misses from unfinished rounds are retained. See
[learning model and migration](docs/country-learning.md).
