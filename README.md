# World Maps

Offline geography learning game built with Expo / React Native from
[mobile_template](https://github.com/spider-su/mobile_template).

Five bundled maps cover Europe, Asia, Africa, South America and Oceania.
See [continent coverage and generation](docs/continent-maps.md).

Europe retains 47 selectable locations (41 polygons
and six small-country markers). Every map supports Hot & Cold, Find It, Name It and Learn. Completed
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
[game rules](docs/geography-game-draft.md). Unused template code (demo screens,
generic adapters and the init script) has been removed; remaining template-era
documents are labelled historical. Game source and the POC roadmap take priority.

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

### Difficulty

Choose a level in Play options before starting a quiz. **Normal** is the default
(large/medium outlines, with at least four choices); **Easy** uses the seven largest
outlines on the selected map; **Difficult** uses every location on that map. Size is
projected map area, not a ranking by national land area. Excluded countries remain
visible in muted gray and cannot be guessed. Name It draws all four options from
the selected pool. Learn always includes every country.

The level is saved with preferences and completed rounds; quiz history is filtered
by mode and level. Older rounds remain intact and count as Difficult because they
used the full pool. See [difficulty validation](docs/difficulty-testing.md).

### Country learning

Home offers Adaptive or Random practice. Adaptive revisits recent misses and older
practice while reducing repeats of mastered countries. Home/Settings show local
selected-map learning statistics and per-country accuracy. Existing scores migrate once
without being reset; misses from unfinished rounds are retained. See
[learning model and migration](docs/country-learning.md).

### Atlas and quiz appearance

Home/Learn use bundled Natural Earth shaded relief, registered to the same SVG
country geometry used for taps. Learn offers a border toggle; quizzes keep the
clean political map. [Source, license and regeneration](docs/atlas-data.md).

### Languages and pronunciation

Choose English, Polish or Russian in Settings. All country names/capitals and game
prompts update without changing scores. Pronunciation uses installed device voices;
missing voices produce an inline message. See [speech behavior](docs/languages-and-speech.md).

### P0–P1 validation

The [delivery report](docs/p0-p1-delivery.md) records the focused feature PRs,
combined branch, 73 source/setup tests, offline Android APK provenance and emulator
evidence, including selection of all 47 countries. Physical-phone, audible speech
and iOS validation remain separate pending gates.

The shell and game prompts share `gameCopy` / `gamePrompt` for EN/PL/RU. Find It
clues support country, capital and flag; Name It supports country or capital answers.
Legacy capital mode storage IDs remain compatible with saved progress.

Home and gameplay now use a map-first layout inspired by the UI sketch. The middle Europe tab
contains the offline region summary, difficulty, practice and quiz options. During play, the header
opens voice/label controls; map tools are available on demand. Small countries have direct on-map targets;
crowded targets zoom apart when tapped. Learn keeps a compact country card with expandable offline details.
The [Home artwork and generation prompt](docs/licenses/home-artwork.md) are separate
from the accurate bundled gameplay geography.

## Continent maps

Choose Europe, Asia, Africa, South America or Oceania on Home or the map tab.
All four modes use the selected offline map. Easy selects seven large outlines;
Normal selects large/medium outlines (at least four for answer choices); Difficult
and Learn include every location. Scores and practice are separate for each map.
New continent maps use vector fills; physical relief remains available for Europe.
Map selection lasts for the app session and defaults to Europe on relaunch.
See [coverage, sources and generation](docs/continent-maps.md).
