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

Implemented: pure TypeScript engine, Europe outline map (39 selectable countries), on-map guesses with heatmap coloring, border-distance approximation, Expo Speech playback/replay, zoom and directional controls, round completion, and unit tests.

Not implemented yet: precise high-resolution border polygons and microstates, gesture-based pinch/pan, persistent sessions, advanced scoring, or device validation. CI must be verified before calling it a validated APK. The current map is a playable draft but uses low-resolution simplified Natural Earth outlines and approximates shortest border distance in a planar projection.

## Map-pack design

- Europe countries is the first production pack.
- South America countries should reuse polygon rendering.
- Poland cities (Warszawa, Kraków, Łódź, etc.) should use coordinate markers.
- City packs may use great-circle point distance (already implemented).
- Country packs use an injected border-to-border distance resolver. Europe currently estimates distance between simplified outline segments in a local planar projection. Replace with a geodesically precomputed lookup when shipping final assets.
- Use bundled map data, offline by default, with verified licensing/attribution.

## Optional scoring/session recipe

Record raw results: pack ID, mode ID, target ID, ordered guesses, start/completion timestamps. Compute scoring by mode instead of embedding a universal score formula in the template. Persist only after the app chooses a storage adapter. Do not introduce XP, leaderboards, or backend dependencies.

## Follow-up implementation order

1. Source and simplify licensed Europe GeoJSON; build SVG projection and touch hit-testing.
2. Add country border-distance lookup and test adjacent/nonadjacent cases.
3. Build Hot & Cold screen with color legend, country label and expo-speech, replay on repeat tap.
4. Add pan/zoom and accessible selection for microstates.
5. Persist local progress, implement Find It and Name It, then run CI and Android device checks.


## Stage 3 — progress and scoring (feature/europe-gameplay-polish)

- Completed Hot & Cold rounds earn 100 points for the first guess, decreasing by 10 per additional guess (minimum 10).
- Sessions are stored locally under a versioned AsyncStorage key; the most recent 100 completed sessions are retained.
- Incomplete, abandoned, and repeated guesses are not counted as completed sessions.
- The Play screen displays number of solved rounds, personal best and total score; voice preference persists across restarts.
- Invalid stored data is ignored rather than causing an app crash. Storage failures surface a nonfatal warning.
- CI and on-device validation required before promoting this feature branch.

### Still outstanding for the stage

- Native gesture pinch-to-zoom and drag-to-pan; current map navigation relies on buttons.
- Higher-resolution country shapes and microstates.
- Theme and layout polish on actual Android devices.
- Persisted in-progress rounds (only completed sessions are recorded intentionally).
