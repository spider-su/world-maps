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
- `features/geography/learning`: per-country/mode attempt records, schema migration,
  adaptive/random sampling and pure summaries. `LearningOverview` is reused by
  Home/Settings; `PracticeSelector` saves the sampling preference.
- `EuropeMap.atlas` / `showBorders`: bundled relief registered to the shared viewBox.
- `speechController`: serialized pronunciation with installed-voice matching,
  cancellation and bounded voice discovery. EN/PL/RU share `LANGUAGE_OPTIONS`.

- `CountryInfoCard` / `CountryAtlasPortrait`: offline selected-country card with
  bundled atlas crop, localized capital, region, coordinates and optional landmark.
- `GAME_MODES` contains four public Home modes; `GameMode` also accepts legacy
  capital mode IDs for stored progress. `modePackId` preserves all existing IDs.

## Map-first presentation

- `EuropeMap.fill`: fills a flex-height play surface without distorting outlines.
  A phone starts at a closer view; Show all Europe restores the complete extent.
  Map tools disclose zoom and directional controls without removing keyboard or
  non-gesture access. `viewport` helpers accept optional height/width aspect ratio.
- `OptionsSheet`: shared dismissible, scrollable modal for secondary play controls;
  owns its modal safe areas and handles Android Back. It does not persist settings.
- `ModeSelector` / `QuizOptions`: mode cards stay on Home; existing clue and answer
  variants are composed separately in the middle Europe tab. Difficulty
  and practice selectors use the same saved progress contract as before.
- `CountryInfoCard.compact` / `onDetails`: selected country's flag, capital and
  pronunciation remain below the map; full offline facts open in a separate sheet.
- `GeographyGameScreen`: fixed header, responsive map and bounded scrollable dock;
  secondary options and full Learn details are disclosed in sheets. Score/learning
  rules and hidden-target behavior are unchanged.

- `EuropeScreen`: middle bottom tab with Europe/47-country/offline summary, a
  read-only map preview and existing play setup. Owns the top safe area; tabs own
  the bottom. The tab navigator shares transient quiz variants with Home; saved
  difficulty and practice preferences continue using the existing progress store.

- `mapPicker.ts`: pure screen-space target grouping and cluster expansion for the
  stable `selectionAlternatives` anchors. Groups avoid overlap and map tools; at
  maximum zoom individual buttons fan to nearby free positions with leader lines.
  `EuropeMap` applies the existing selection guard to these buttons and renders
  them only for enabled, eligible locations. Numbers preserve quiz answer secrecy.
