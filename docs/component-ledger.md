# World Maps component ledger — current ownership

This is the current application inventory. Previous starter-template and early POC claims are historical; they are not evidence of current device acceptance.

| Component | Current owner | Contract / remaining gate |
|---|---|---|
| Navigation / safe areas | `src/navigation.tsx`, `src/platform/safeArea.ts` | Five tabs: Home, Maps, Library, Profile, Settings; game hides tabs and owns both insets; verify native gestures |
| Four game modes and variants | `HomeScreen`, `GeographyGameScreen`, `engine.ts`, `modes.ts` | Hot & Cold, Find It, Name It, Learn; maintain answer secrecy and verify completion flow |
| Six continent registry | `maps.ts`, `EuropeMap.tsx`, bundled `data/` | Europe, Asia, Africa, North America, South America, Oceania; shared Blue Marble relief on all six maps; terrain background does not own hit-testing |
| Country selection | `CountryPath.tsx`, `CountryPath.web.tsx`, `mapPicker.ts`, `selection.ts` | Keep native/web SVG adapters, zoom/pan guard and small-country pickers |
| Local progress | `ProgressContext.tsx`, `progressStore.ts`, `progressStorage.ts`, `progress.ts` | Pre-release canonical v4; serialized saves, read-error protection, retry |
| Learning and XP | `learning.ts`, `explorerProgress.ts`, `explorer.ts` | Adaptive/random practice, discoveries, avatars, achievements; validate restart restoration |
| Map and quiz preferences | `MapContext.tsx`, `mapQuizPreferences.ts` | Persist selected continent, Find It clue and Name It answer variant |
| Language / pronunciation | `LanguageContext.tsx`, `countryFacts.ts`, `speechController.ts` | EN/PL/RU UI and capitals, native voice availability; device test required |
| Audio | `MusicContext.tsx`, `MusicVolumeSlider(.web).tsx`, `musicPreferenceStore.ts`, `musicAssets.ts`, `soundPolicy.ts` | Serialized audio preferences with read/save retry; six optional region themes, optional quiz cues, speech priority, no background playback |
| Country details | `CountryInfoCard`, `CountryGallery`, `ExploreScreen` | Offline facts/flags; attributed online photos are opt-in |
| Launch setup / continue | `PlaySetup`, `QuizSetupSummary`, `launch.ts` | Home hides Difficulty; Maps owns its adjustment. Existing saved contexts; transient route launch; latest completed selected-map family |
| Learning presentation | `ProfileScreen`, `LearningOverview`, `explorerReward` | Profile owns history/statistics; result rewards are derived; Library keeps list mounted behind shared details |
| Native release verification | `.github/workflows/mobile-ci.yml`, `docs/release-checklist.md` | CI and APK build are not physical-device or iOS acceptance |

## Cleanup policy

Remove a helper only after reference checks cover `src/`, `scripts/`, tests, native/web platform variants and code generation. Preserve `outlineDistanceKm` used by the geography generator. Suspected unused `regionPack`, `SEA`, `LAND` and safe-area helpers require verification; do not remove them based on the historical issue description alone. The old `HotColdScreen` component name is not a current route.

## Remaining evidence

Full Home → mode → answer → completion → Next/Back → persisted restore interaction tests are tracked in [issue #41](https://github.com/spider-su/world-maps/issues/41). Real Android, voice/music fidelity, screen-reader and iOS acceptance remain separate from automated checks.
