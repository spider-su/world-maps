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

The Orchestrator runs `bash scripts/agent-validate.sh` in a fresh issue workspace.
It installs locked dependencies and runs the same CI checks and Expo Doctor. The
optional `--baseline-sha COMMIT` argument verifies the supplied baseline exists.
Android APK validation remains a separate required GitHub CI job.

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

Choose a level on Home before starting a quiz. **Normal** is the default (34
large/medium countries); **Easy** uses the seven largest outlines on the displayed
map; **Difficult** uses all 47 countries, including small-country markers. Size is
projected map area, not a ranking by national land area. Excluded countries remain
visible in muted gray and cannot be guessed. Name It draws all four options from
the selected pool. Learn always includes every country.

The level is saved with preferences and completed rounds; quiz history is filtered
by mode and level. Older rounds remain intact and count as Difficult because they
used the full pool. See [difficulty validation](docs/difficulty-testing.md).

### Country learning

Home offers Adaptive or Random practice. Adaptive revisits recent misses and older
practice while reducing repeats of mastered countries. Home/Settings show local
Europe learning statistics and per-country accuracy. Existing scores migrate once
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
