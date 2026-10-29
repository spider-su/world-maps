# Component catalog

This is an index, not a substitute for TypeScript signatures. Inspect the linked source before modifying or consuming a component.

| Component / helper | Location | Contract / when to reuse |
|---|---|---|
| `worldMapsTheme` | `src/ui/worldMapsTheme.ts` | System-aware light/dark app colors, mode tints/icons and map palette |
| `useLanguage`, `LANGUAGE_OPTIONS`, `SPEECH_LOCALES` | `src/ui/LanguageContext.tsx`, `i18n.ts` | EN/PL/RU language definitions, speech locales and saved preference with legacy-key fallback |
| `gameCopy`, `gamePrompt` | `src/features/geography/copy.ts` | EN/PL/RU app text: modes, prompts, feedback, Home and Settings; prompts support country/capital/flag variants |
| `AppErrorBoundary` | `src/components/AppErrorBoundary.tsx` | Render-crash fallback, not async error handling |
| Safe-area helpers | `src/platform/safeArea.ts` | Single-inset ownership for visible/hidden tabs and modals |
| `ProgressProvider` / `progressStore` | `src/features/geography/ProgressContext.tsx`, `progressStore.ts` | Serialized progress writes; read failure blocks mutation; save failure keeps the snapshot and offers retry |

## Extension decision

Reuse an existing component when its behavior matches. Keep pure rules in feature modules with tests. Add new dependencies only after checking native compatibility and documenting why existing code is insufficient. Update `docs/component-ledger.md` when a contract changes.

## World Maps app components

- `features/geography/EuropeMap`: shared interactive renderer and noninteractive
  Home preview; takes guess results, revealed IDs, label visibility and selection.
  Small countries have 48dp on-map picker targets connected to their geographic
  anchors. Crowded targets cluster and zoom on tap; polygon hit areas are unchanged.
- `features/geography/ModeSelector`: four icon-led mode cards in `GAME_MODES`
  order, localized through `gameCopy`, no round state.
- `screens/GeographyGameScreen`: one game mode/round, compact prompt and answers.
- `features/geography/DifficultySelector`: saved Home level selection.
  `difficultyPack` supplies eligible quiz locations; `EuropeMap.selectableIds`
  restricts interactions while retaining geographic context.
- `features/geography/learning`: per-country/mode canonical v4 attempt records,
  adaptive/random sampling and pure summaries. `LearningOverview` is displayed in
  Profile’s learning sheet; `PracticeSelector` saves the sampling preference.
- `EuropeMap.atlas` / `showBorders`: bundled relief registered to the shared viewBox.
- `speechController`: serialized pronunciation with installed-voice matching,
  cancellation and bounded voice discovery. EN/PL/RU share `LANGUAGE_OPTIONS`.

- `CountryInfoCard` / `CountryInfoHeading`: compact country identity and expanded
  essentials with localized capital, region, optional landmark and opt-in gallery.
- `GAME_MODES` contains four public Home modes; `GameMode` also accepts legacy
  capital mode IDs for stored progress. `modePackId` preserves all existing IDs.

## Map-first presentation

- `EuropeMap.fill`: fills a flex-height play surface without distorting outlines.
  Non-European maps start at full extent; Europe uses a balanced phone overview.
  Small highlighted quiz targets are focused, and Whole map always restores full extent.
  Map tools disclose zoom and directional controls without removing keyboard or
  non-gesture access. `viewport` helpers accept optional height/width aspect ratio.
- `OptionsSheet`: shared dismissible, scrollable modal for secondary play controls;
  owns its modal safe areas and handles Android Back. It does not persist settings.
- `ModeSelector` / `QuizOptions`: mode cards stay on Home; existing clue and answer
  variants are composed in the shared launch setup sheet. Difficulty
  and practice selectors use the same saved progress contract as before.
- `CountryInfoCard.compact` / `onDetails`: selected country's flag, capital and
  pronunciation remain below the map; full offline facts open in a separate sheet.
- `GeographyGameScreen`: fixed header, responsive map and bounded scrollable dock;
  secondary options and full Learn details are disclosed in sheets. Score/learning
  rules and hidden-target behavior are unchanged.

- `EuropeScreen`: Maps tab with saved map choice, atlas preview, direct Learn/Find It
  launch and the shared setup sheet. Owns the top safe area; tabs own the bottom.

- `mapPicker.ts`: pure screen-space target grouping and cluster expansion for the
  stable `selectionAlternatives` anchors. Groups avoid overlap and map tools; at
  maximum zoom individual buttons fan to nearby free positions with leader lines.
  `EuropeMap` applies the existing selection guard to these buttons and renders
  them only for enabled, eligible locations. Numbers preserve quiz answer secrecy.

## Continent maps

- `maps.ts`: typed offline registry for Europe/Asia/Africa/North America/South America/Oceania;
  stable pack IDs, shared shapes/markers/context and precomputed distance tables.
- `MapProvider` / `useMap`: persists map and quiz choices across tabs/relaunches through a separate serialized preference key; progress keys are unchanged.
- `MapSelector`: selected-map summary and localized chooser sheet reused by Home
  and map setup; all six maps appear in a vertical list.
- `EuropeMap.map`: optional map definition, defaults to Europe for compatibility.
  Shapes, marker anchors, labels and picker clusters use that definition. Relief
  uses the same projected bundled Blue Marble relief on all six packs, including
  Europe’s original independent x/y projection scales.
- `difficultyPack(level, map?)`: derives eligible countries from each map's outline
  areas; normal retains at least four targets for multiple-choice modes.

## Wikipedia discovery

- `CountryGallery`: expanded Learn/collection details only. Bundled country article
  link, optional horizontal gallery (up to three images), per-image load/error/retry
  and source/license links. Images mount only after Show photos; callers key by
  country ID to reset gallery/error state. Compact cards remain offline.
- `countryPhotos.ts` / `data/wikipedia-gallery.json`: typed article/photo metadata;
  replaced the two automatically loaded curated photos. Refreshed by
  `scripts/build-wikipedia-gallery.py`, with no runtime API or new dependency.
- `countryPhotoSource(url, platform)`: native array source forwards the identifying
  Wikimedia request header in pinned RN 0.86; web receives an object source and
  uses browser headers. Keep this contract when changing the image loader.

## Compact launcher and play surface

- `ModeSelector`: four direct-launch tiles in a wrapping two-column grid; short
  localized captions retain full descriptions as accessible button names.
- `HomeScreen`: neutral world hero, shared map chooser, saved setup summary, Customize
  sheet and repeat-practice action derived from the selected map’s recent history.
- `EuropeMap.toolsVisible`: optional controlled disclosure of directional/zoom
  buttons from play options; zoom and Whole map are always available. `fill` removes rounded
  map edges to join the game's ocean surface. Hit testing/selection are unchanged.
- `GeographyGameScreen`: compact status dock; restart moves to play options.
  Completion hides the prompt and Name It choices, retaining result, score,
  pronunciation, earned XP and Next. Prompt/dock slots retain their height through
  feedback; Learn’s initial dock explains selection and cluster controls.
- Navigation labels are Home / Maps / Library / Profile / Settings; route IDs and
  selected-map sharing are unchanged.

## Learn atlas presentation

- `EuropeMap.learn`: names the polygon/picker controls without exposing quiz
  answers. Named picker chips use 80–112dp width based on font scale, retaining
  48dp tap height, clustering, leader lines and the selection guard. `mapPicker`
  accepts optional label width, narrows max-zoom fans when space is constrained
  and reports the effective width. Default quiz layout is unchanged.
- `mapLabels` accepts optional reserved screen rectangles so country names do not
  overlap Learn's named picker chips.
- `CountryInfoHeading`: shared flag/name/region/pronunciation row. Compact mode
  with `onDetails` makes the identity area a button (capital included in subtitle).
- `CountryInfoCard.showHeader`: defaults true for collection/preview; false when
  the surrounding sheet supplies `CountryInfoHeading` as its sticky heading.
  Expanded contents are capital, optional landmark and `CountryGallery`.
- `OptionsSheet.heading`: optional custom heading; the heading and Close remain
  above its scrollable contents. Existing title-only sheets behave as before.
- Learn starts with collision-managed map names and a small selection hint;
  selection removes the hint. Named controls remain available; quizzes stay
  anonymous. The unused second-atlas component and technical display helpers
  were removed; map geometry, source metadata and licenses remain intact.
- `CountryGallery`: one opt-in photos action with Online hint, responsive image
  widths, pagination dots, full credits and source/license links; one Wikipedia
  link below. Per-image loading/retry and native request headers are retained.

## Explorer profile

- `explorerProgress(progress)`: derives global XP, level, outfit stage, six
  achievements and per-map discovery from saved facts. Independent of map choice,
  difficulty and bounded session history; current mastery never reduces rewards.
- `ExplorerAvatar`: bundled human portrait, cosmetic `ExplorerId`, earned stage,
  size and localized accessible label. Shared by Profile and outfit previews.
- `explorer.ts`: stable cosmetic IDs and outfit milestones. `profileCopy` owns
  localized ranks, outfit names, achievements and reward explanation.
- `ProfileScreen`: shared progress, avatar selection through serialized writes,
  secondary outfit/achievement/XP/learning sheets, actionable milestones and map-to-Library navigation. Loading/
  read errors hide unconfirmed progression; save failures retain retry controls.
- Pre-release progress requires canonical schema 4; keys, score history, learning
  and preferences are retained. Experimental older schemas are not migrated. See `docs/explorer-progression.md`.

## Market polish contracts

- `PlaySetup` composes existing map/difficulty/practice/quiz selectors; `QuizSetupSummary`
  exposes the same saved state on Home/Maps. It adds no preference copy or storage key.
- `launch.recentQuizMode` maps the latest retained completed round on the selected pack
  to a public quiz family, including legacy capital aliases. Continue starts a new round.
- `explorerReward` derives XP and newly earned milestones between two journey snapshots;
  it is transient presentation only, and never awards or persists XP itself.
- `ExploreScreen` keeps its list mounted behind `OptionsSheet`/`CountryInfoHeading` so
  closing country details retains search/region/scroll. Route `filter` supports All or
  Undiscovered; discoveries still go through the existing progress writer.
- `ProfileScreen` owns selected-map `LearningOverview` and completed history. Its milestone
  action selects undiscovered countries or the next missing quiz family. Settings owns
  language, pronunciation, optional music/effects and attribution.
- `polishCopy` provides EN/PL/RU launch, cluster, collection and reward guidance.

- `EuropeMap` names are in a separate noninteractive SVG overlay. Native taps on label
  text pass through to country geometry; individual text pointer props alone are insufficient.
- `playLayout` reserves prompt/dock space by mode, font scale and available safe height;
  answer/result state never changes the map size. Short screens scroll the dock while
  keeping at least 180dp for map targets.

- The bounded game dock resets its scroll on completion/new round, so scrolling through
  large-text answers cannot hide newly earned rewards or the next set of choices.

- `musicPreferenceStore`: serializes the existing `@world-maps/music` document.
  Restoring/read failures block edits; read Retry reloads instead of writing defaults,
  and save Retry persists the latest snapshot. `MusicProvider` subscribes to this store.

- `MusicVolumeSlider`: localized 0–30% music volume with 1% steps and a 48dp
  control. Expo-compatible native slider; web uses an HTML range for keyboard
  access. Disabled during preference restore/read/save errors; changes use the
  existing serialized audio store.

- `PlaySetup.showDifficulty` / `QuizSetupSummary.showDifficulty` default true.
  Home passes false so Difficulty appears only in Maps setup and its summary.
  This is presentation only; gameplay still uses the saved difficulty.
