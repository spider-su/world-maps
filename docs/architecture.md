# Architecture and ownership map

Read this before adding a feature. World Maps is an offline Expo SDK 57 / React Native 0.86 geography game for Europe. It is a hobby app, not a reusable starter.

## Startup and runtime

`App.tsx` composes the safe-area provider, error boundary, `LanguageProvider`, `ProgressProvider` and navigation. `src/navigation.tsx` owns the NavigationContainer and the Home/Settings bottom tabs. `src/screens/` contains route-level UI: `HomeScreen` (mode cards with difficulty/practice in a modal), `GeographyGameScreen` (one mounted round, large responsive map and compact dock, tabs hidden) and `SettingsScreen` (language, voice, learning summary and data licenses). `src/features/geography/` contains the game engine, modes, map rendering, bundled data, progress persistence and speech. `src/ui/` contains language definitions, the language context and the app theme. `src/platform/` contains safe-area contracts. `app.config.ts` reads non-secret app identity from environment variables.

## Ownership rules

| Concern | Owner | Agent rule |
|---|---|---|
| App name, IDs, native plugins | `app.config.ts`, `.env.example` | Do not hardcode another app's identity or commit secrets |
| Tabs, navigation and bottom inset | `src/navigation.tsx`, `src/platform/safeArea.ts` | Register tabs here; avoid a second bottom inset in screens |
| Rounds, guesses, scoring | `src/features/geography/engine.ts`, `modes.ts` | Keep pure and unit-tested; screens orchestrate only |
| Map rendering and gestures | `EuropeMap.tsx`, `CountryPath(.web).tsx`, `selection.ts`, `viewport.ts` | Keep native/web event adapters separate; keep the selection guard |
| Bundled geography | `europe.ts`, `data/`, `scripts/build-*` | Regenerate with the scripts; keep source metadata and licenses |
| Text and language | `src/ui/i18n.ts`, `LanguageContext.tsx`, `features/geography/copy.ts` | Provide EN, PL and RU text; no hardcoded user-facing copy |
| Persistence | `progress.ts`, `progressStore.ts`, `progressStorage.ts`, `learning.ts` | Keep keys stable; migrate schemas with tests; serialize writes |
| Pronunciation | `speechController.ts`, `useCountrySpeech.ts` | Keep the queue, cancellation and voice discovery timeout |
| Native quality evidence | `.codex/skills/`, `docs/evidence/` | Tests/builds are not proof of real-device behavior |

## Dependency direction

Screens may depend on feature modules, UI and platform helpers. Pure feature models (`engine`, `modes`, `learning`, `difficulty`, `progress`) must not import React components. Platform helpers must remain isolated and tested. Do not add a state-management library, router, database, analytics or auth SDK.

## Safe areas and errors

With visible tabs the screen owns the top inset and the tab navigator owns the bottom. The game screen hides tabs and owns both edges, exactly once; see [navigation and scroll recipe](navigation-and-scroll.md). Modal content owns its own edges. Error boundaries catch render errors, not rejected promises; progress read/save failures are surfaced explicitly with retry. See [state consistency guidance](local-state-consistency.md).

## How to navigate unfamiliar code

Start with `AGENTS.md` -> this map -> `docs/component-catalog.md` -> the relevant source file -> colocated tests -> `docs/agent-workflow.md`. Inspect current code before following documentation if they differ. Update documentation when contracts change.
