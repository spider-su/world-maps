# Component catalog

This is an index, not a substitute for TypeScript signatures. Inspect the linked source before modifying or consuming a component.

| Component / helper | Location | Contract / when to reuse |
|---|---|---|
| `worldMapsTheme` | `src/ui/worldMapsTheme.ts` | App colors, mode tints/icons and map palette |
| `useLanguage`, `LANGUAGE_OPTIONS`, `SPEECH_LOCALES` | `src/ui/LanguageContext.tsx`, `i18n.ts` | EN/PL/RU language definitions, speech locales and saved preference with legacy-key fallback |
| `gameCopy` | `src/features/geography/copy.ts` | EN/PL/RU app text: modes, prompts, feedback, Home and Settings |
| `AppErrorBoundary` | `src/components/AppErrorBoundary.tsx` | Render-crash fallback, not async error handling |
| Safe-area helpers | `src/platform/safeArea.ts` | Single-inset ownership for visible/hidden tabs and modals |
| `ProgressProvider` / `progressStore` | `src/features/geography/ProgressContext.tsx`, `progressStore.ts` | Serialized progress writes; read failure blocks mutation; save failure keeps the snapshot and offers retry |

## Extension decision

Reuse an existing component when its behavior matches. Keep pure rules in feature modules with tests. Add new dependencies only after checking native compatibility and documenting why existing code is insufficient. Update `docs/component-ledger.md` when a contract changes.

## World Maps app components

- `features/geography/EuropeMap`: shared interactive renderer and noninteractive
  Home preview; takes guess results, revealed IDs, label visibility and selection.
  Small countries are drawn as non-interactive markers and selected through
  `selectionAlternatives` buttons.
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
