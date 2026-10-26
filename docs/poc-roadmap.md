# Usable POC implementation — 2026-10-25

Target: a standalone offline Europe app with Home, four modes, country learning,
EN/PL, saved completed scores and voice preference. One map style, individual
rounds, no backend/accounts. No claim of physical-device readiness without proof.

1. Baseline: match Expo patch, CI on develop/codex branches, quiz label rules,
   current documentation. Preserve user lockfile snapshot in named git stash.
2. Map-first shell: Home mode cards, compact game header, shared map renderer,
   bottom feedback/answers, Android Back and safe-area ownership.
3. Complete modes: hide quiz answers, focus small targets, accessible selection,
   consistent feedback and approximate microstate distance.
4. Learn: complete offline EN/PL name, flag and capital coverage with source notes.
5. Daily use: serialized persistence and retry, restore preferences, EN/PL speech,
   honest last-100 statistics, focused game Settings without template biometrics.
6. Delivery: standalone preview APK with embedded JS, emulator + web evidence,
   physical-device and iOS gates recorded separately. Do not publish or merge.

Deferred: terrain themes, photographs/population, timed/10-question runs, streaks,
additional regions, store publication and cloud services.

## Rules

- Hot & Cold: red hotter, blue colder, green found; only guessed countries colored.
- Find It: show the target name, keep unguessed map labels hidden.
- Name It: highlight one target, offer four unique names, no target label leak.
- Learn: freely show names, select country details, never record scored sessions.
- Quiz labels can be explored after completion. No scored Show names assistance.
- Historical metrics describe the most recent 100 retained completed rounds.
- Leaving/mode change abandons an unfinished round; completed scores persist.

## Evidence log

Stage results and any remaining gates are appended as implementation proceeds.

### Stage 1 — baseline

- Expo updated to ~57.0.31; `npm ci` succeeded. Existing lockfile preserved in stash
  `world-maps: original local lockfile before POC dependency refresh`.
- CI now includes develop, codex branches and PRs to develop.
- Label help is restricted to Learn/completed rounds; regression tests cover modes.
- `npm run ci`: PASS (42 unit + 3 setup tests). `npx expo-doctor`: PASS (21/21).
- npm audit reports six high-severity package entries in the dependency/tooling
  tree. No forced major SDK downgrade was applied; this remains an explicit
  dependency limitation, not a claim of a vulnerability-free release.

### Stage 2 — map-first shell

- Integrated existing `feature/world-maps-brand-theme` assets instead of duplicating
  the icon, tokens or cards. Home now routes into a dedicated game with Back.
- Shared `EuropeMap` extracted; prompt/answers/feedback sit directly around the map.
  Game owns both insets with tabs hidden; Home retains visible-tab ownership.
- EN/PL added for new UI. `npm run ci`: PASS (42 unit + 3 setup tests).
- Browser 390×844: Home entry, Back and mode entry PASS. Name It answers and primary
  action fit without scrolling. Zero browser errors; existing pointerEvents warning.

### Stage 3 — gameplay completion

- Small Name It targets initialize at useful zoom; amber highlight and halo remain
  separate from green correct-answer feedback. Country labels remain hidden.
- Web country paths support keyboard Enter/Space without native responder props.
- Small-country proximity now measures marker to polygon outline. Regressions cover
  Malta/Italy, Andorra/France, Monaco/France and Vatican/Italy plus symmetry.
- `npm run ci`: PASS (44 unit + 3 setup tests). Browser checks: target highlight,
  no Name It label leak and keyboard country selection PASS.

### Stage 4 — offline Learn

- Country information card and bundled SVG flags/capitals cover all 47 IDs in EN/PL.
  Data sources, pinned revisions, regeneration and licenses are documented.
- `npm run ci`: PASS (46 unit + 3 setup tests). Browser Learn/Andorra: capital,
  flag and no scored attempts PASS. Flags render via existing SVG dependency.

### Stage 5 — dependable daily use

- One serialized progress writer retains updates across score/preference changes,
  exposes failed-save retry, and blocks writes after read failure. Existing completed
  records and Hot & Cold pack IDs remain compatible; history is explicitly last-100.
- English/Polish game controls, country names, capitals and speech locale integrated.
  Language preserves legacy preferences and ignores late reads after user changes.
- Focused Settings replaces biometric demo, includes voice/history and offline license
  notices. First POC intentionally uses one light theme; no false dark-mode promise.
- Browser: Polish settings + relaunch + Learn card PASS; completed Name It score
  survives relaunch PASS. Pure store regressions cover write ordering/read/save failure.

### Stage 6 — delivered preview and evidence

- Standalone arm64 preview built/installed and verified against its installed hash;
  JavaScript is embedded. Production web export also built and smoke-tested.
- Android API 35 emulator: offline startup, mode flows, saved state, real APK update,
  gestures/buttons, navigation/insets and large text PASS. Browser operational
  read/write fault injection and recovery PASS. Details: `docs/poc-testing.md`.
- All implementation stages are committed. POC source/local preview are ready for
  a personal trial with the explicit remaining physical-device, audio, pinch and
  iOS gates above. No store publication, production signing or merge performed.

### Map-first visual refresh — 2026-10-25

Home now uses decorative offline orbit artwork and four mode cards. Secondary
setup lives in a sheet; the game prioritizes the map, compact feedback and scores.
Full Learn facts and non-gesture map controls remain available on demand.
See [UI implementation and evidence](map-first-ui.md). This is presentation work,
not a new ruleset or completion of physical-device/iOS acceptance gates.
