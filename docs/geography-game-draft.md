# Geography game — feature-branch draft

This is an exploratory implementation, not part of the generic template's default UI.

## Game contract

- The target is randomly chosen and **never shown before discovery** in Hot & Cold.
- Tapping a location reveals its name, speaks it with the device's TTS voice, and colors the selected map feature according to distance from the hidden target.
- Earlier guesses retain their colors; repeating a tap replays pronunciation without adding an attempt.
- Finding the target ends the round; the player explicitly starts the next one.
- Learn mode has no hidden target or scoring. Find It shows and speaks a target name; Name It highlights a location and offers answer choices.
- Map packs provide locations and geometry. Country polygons and city points use the same session logic but different map renderers and distance resolvers.

## Current draft scope

Implemented: pure TypeScript game engine, deterministic random target selection, guesses, proximity categories, completion, and unit tests.

Not implemented yet: actual Europe boundary assets, country-boundary distance matrix, map rendering/zoom/touch targets, speech integration, persistent sessions, scoring UI, or APK validation. Do not describe this branch as a playable APK.

## Map-pack design

- Europe countries is the first production pack.
- South America countries should reuse polygon rendering.
- Poland cities (Warszawa, Kraków, Łódź, etc.) should use coordinate markers.
- City packs may use great-circle point distance (already implemented).
- Country packs must supply a precomputed shortest-border-distance lookup instead of defaulting to country centroids. The resolver is injectable to keep this distinction explicit.
- Use bundled map data, offline by default, with verified licensing/attribution.

## Optional scoring/session recipe

Record raw results: pack ID, mode ID, target ID, ordered guesses, start/completion timestamps. Compute scoring by mode instead of embedding a universal score formula in the template. Persist only after the app chooses a storage adapter. Do not introduce XP, leaderboards, or backend dependencies.

## Follow-up implementation order

1. Source and simplify licensed Europe GeoJSON; build SVG projection and touch hit-testing.
2. Add country border-distance lookup and test adjacent/nonadjacent cases.
3. Build Hot & Cold screen with color legend, country label and expo-speech, replay on repeat tap.
4. Add pan/zoom and accessible selection for microstates.
5. Persist local progress, implement Find It and Name It, then run CI and Android device checks.
