# Architecture and ownership map

Read this before adding a feature. World Maps is an offline Expo SDK 57 / React Native 0.86 geography game with six offline continent packs. It is a hobby app, not a reusable starter.

## Startup and runtime

`App.tsx` composes the safe-area provider, error boundary, `LanguageProvider`, `ProgressProvider` and navigation. `src/navigation.tsx` owns the NavigationContainer and the Home/Maps/Library/Profile/Settings bottom tabs. `src/screens/` contains route-level UI: `HomeScreen` (four mode cards), `EuropeScreen` (Maps tab, region summary and setup), `ExploreScreen` (Library), `ProfileScreen` (achievements and explorer), `GeographyGameScreen` (one mounted round, large responsive map and compact dock, tabs hidden) and `SettingsScreen` (language, voice, learning summary and data licenses). `src/features/geography/` contains the game engine, modes, map rendering, bundled data, progress persistence and speech. `src/ui/` contains language definitions, the language context and the app theme. `src/platform/` contains safe-area contracts. `app.config.ts` reads non-secret app identity from environment variables.

## Ownership rules

| Concern | Owner | Agent rule |
|---|---|---|
| App name, IDs, native plugins | `app.config.ts`, `.env.example` | Do not hardcode another app's identity or commit secrets |
| Tabs, navigation and bottom inset | `src/navigation.tsx`, `src/platform/safeArea.ts` | Register tabs here; avoid a second bottom inset in screens |
| Rounds, guesses, scoring | `src/features/geography/engine.ts`, `modes.ts` | Keep pure and unit-tested; screens orchestrate only |
| Map rendering and gestures | `EuropeMap.tsx`, `CountryPath(.web).tsx`, `selection.ts`, `viewport.ts` | Keep native/web event adapters separate; keep the selection guard |
| Bundled geography | `europe.ts`, `data/`, `scripts/build-*` | Regenerate with the scripts; keep source metadata and licenses |
| Text and language | `src/ui/i18n.ts`, `LanguageContext.tsx`, `features/geography/copy.ts` | Provide EN, PL and RU text; no hardcoded user-facing copy |
| Persistence | `progress.ts`, `progressStore.ts`, `progressStorage.ts`, `learning.ts` | Canonical schema v4 for pre-release progress; validate reads, block writes after read failure and serialize writes |
| Pronunciation | `speechController.ts`, `useCountrySpeech.ts` | Keep the queue, cancellation and voice discovery timeout |
| Native quality evidence | `.codex/skills/`, `docs/evidence/` | Tests/builds are not proof of real-device behavior |

## Dependency direction

Screens may depend on feature modules, UI and platform helpers. Pure feature models (`engine`, `modes`, `learning`, `difficulty`, `progress`) must not import React components. Platform helpers must remain isolated and tested. Do not add a state-management library, router, database, analytics or auth SDK.

## Safe areas and errors

With visible tabs the screen owns the top inset and the tab navigator owns the bottom. The game screen hides tabs and owns both edges, exactly once; see [navigation and scroll recipe](navigation-and-scroll.md). Modal content owns its own edges. Error boundaries catch render errors, not rejected promises; progress read/save failures are surfaced explicitly with retry. See [state consistency guidance](local-state-consistency.md).

## How to navigate unfamiliar code

Start with `AGENTS.md` -> this map -> `docs/component-catalog.md` -> the relevant source file -> colocated tests -> `docs/agent-workflow.md`. Inspect current code before following documentation if they differ. Update documentation when contracts change.

Quiz clue and answer variants are persisted by MapProvider and supplied through the tab navigator and
passed to Europe setup and Home gameplay. Difficulty/practice remain in the
existing progress store; switching tabs does not create a new storage schema.

`MapProvider` persists continent and quiz variant selection across launches. `maps.ts` owns
the pack registry; Europe IDs/geometry are preserved, while five additional packs
share the renderer and modes. Scores/learning use the existing pack/mode key
contract. See `docs/continent-maps.md` for data coverage and regeneration.


Profile progression is derived by `explorerProgress.ts` from cumulative learning
and unique discoveries, independent of bounded score history. `explorer.ts` owns
cosmetic IDs/stages; `ExplorerAvatar` renders bundled human portraits. Schema 4
persists only the selected cosmetic ID through the existing serialized store.
