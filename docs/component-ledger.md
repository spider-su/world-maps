# Component ledger

This ledger distinguishes source-tested behavior from coverage provided by this starter. Update it when the template changes.

| Component | Source / contract | Test evidence | Compatibility / adoption |
|---|---|---|---|
| App shell owns top safe area; visible tabs own bottom; hidden-tabs screen may own both edges | Ryczałt Android system-bar regression; reusable safe-area contract | Template tests cover both navigation modes and inset sizing | Expo 57 / RN 0.86 baseline; do not double-consume bottom inset |
| Tab bar adds the reported bottom inset once and enforces minimum padding when inset is zero | Shared behavior; height and spacing remain app-configurable | Focused source tests in both apps; starter tests cover positive, zero, and negative inset inputs | Compare tab sizing with product design before adoption |
| Modal/fallback screens account for system edges | Both apps' modal/safe-area conventions | Edge contract source tests; starter tests cover edge constants and modal padding | Modal windows need their own safe area; avoid consuming the same inset twice |
| Theme, auth, API, persistence, notifications, telemetry, release identity | Intentionally omitted from starter | Not applicable | Add and verify per app; do not copy app credentials or product semantics |

## Validation status

- Source-level safe-area contract and unit tests: present in both source apps; starter has equivalent focused tests.
- Automated validation: this starter's CI result is recorded in the initial commit/release notes and GitHub Actions.
- Android three-button navigation: not claimed as verified by the source port audit; validate on a device/emulator using that mode.
- iOS simulator safe areas: not claimed as verified by the source port audit; validate in simulator.
- Physical-device, store-build, and live-service behavior: not established by unit tests or CI.
- Hidden-tab safe-area mode: unit-tested ownership only; device validation still required.
- Local-first consistency, navigation/scroll, and release-upgrade recipes: documented patterns, not prepackaged financial models or tested store deployment.

For each future component, replace generic status with dated evidence and the device/OS/configuration used. A test passing in one app does not prove the receiving app adopted it correctly.

| App error boundary and loading/error/empty UI | Generic template primitives | Storage contract unit tests; UI device evidence pending | Error boundary handles render failures only; async failures require screen-level handling |
| Opt-in typed persistence and native/web adapters | Generic template contract | Unit tests cover round-trip, missing/corrupt data, invalid keys and backend errors | AsyncStorage install required only for adopting native apps; web localStorage is browser-only |
| Codex instructions and skill templates | Adapted from Ryczałt workflow structure, without project-specific paths or credentials | Documentation only; emulator execution not yet verified | Downstream apps must supply app identity, test fixtures and device evidence |

## World Maps game components

- `src/features/geography/CountryPath`: app-owned SVG path adapter. Web uses a DOM `onClick`; native uses `react-native-svg` `onPress`. No new dependencies. Regression test covers web event routing; browser smoke verified selection, repeat guesses, completion, restart, zoom/pan and tab navigation on 2026-10-24. Native runtime remains unverified.
- `HotColdScreen` owns the top safe-area edge; visible tabs own the bottom edge.

- Europe map views: bundled 1:50m country/context geometry and collision-filtered labels share the existing 864×570 coordinates. `mapLabels` exposes names only when explicitly enabled or already guessed. (Historical: an interactive `CountryMarker` adapter existed here; markers are now non-interactive and small countries are selected via `selectionAlternatives`, so it was removed.) No dependencies added. Web evidence and current native limitations are recorded in `docs/europe-map-assets.md`.

- POC shell: `HomeScreen` owns mode entry; `GeographyGameScreen` owns one mounted
  round. Game hides tabs and owns top/bottom insets; Home/Settings own only top.
  `EuropeMap` shares offline geometry, gestures and controls with Home preview.
  `ModeSelector` accepts EN/PL copy and optional selected mode. Existing branding
  branch was integrated, including its app-specific icon and theme tokens.

- `CountryInfoCard`: app-owned offline flag/name/capital/pronunciation card, EN/PL.
  All 47 map IDs covered by a pinned derived country dataset and SVG flag artwork;
  attribution and full licenses in `docs/country-data.md` and `docs/licenses/`.

- `ProgressProvider` uses one feature-owned serialized store for Home/game/Settings.
  Failed reads block mutations; failed saves retain the latest in-memory snapshot
  and expose retry. Tests cover interleaved updates, read failure and save retry.
- Product Settings replaces biometric/demo flows with language, voice, recent-history
  summaries and bundled data license notices. EN/PL covers controls and country names;
  speech uses the matching language, cancels queued pronunciation on blur/unmount.

- `DifficultySelector`: app-owned EN/PL Home radio buttons using the shared progress
  store; blocks changes while loading or after failed reads. `difficultyPack`
  filters quiz targets, guesses and Name It distractors by projected outline area.
- `EuropeMap.selectableIds`: optional eligible country IDs; omitted for unrestricted
  Learn/preview. Excluded outlines are muted and noninteractive; excluded markers
  are hidden. Quiz score summaries accept a difficulty filter; legacy rounds count
  as Difficult. See `docs/difficulty-testing.md` for current evidence.

- P0 map stabilization: even-odd multipart paths; `selectionAlternatives` covers
  marker-only countries and outlines below 700 map-area units. `createSelectionGuard`
  suppresses guesses during/just after movement. Distances are an offline table
  generated from shared geometry; see `docs/p0-geography-gameplay.md`.

- `learning.ts`: schema-2 country/mode counters, one-time score migration,
  deterministic adaptive/random target sampling, and learning summaries.
- `LearningOverview` / `PracticeSelector`: app-owned saved practice controls and
  expandable country progress; reused on Home/Settings. See country-learning.md.

- `EuropeMap.atlas` / `showBorders`: optional offline relief appearance, sharing
  the existing SVG viewBox and hit geometry; selected terrain is translucent blue.
  Raster registration/asset checksums are tested. See docs/atlas-data.md.

- `LANGUAGE_OPTIONS`, `SPEECH_LOCALES`: shared EN/PL/RU language/voice locale contract.
- `speechController`: serialized stop/speak queue, installed-voice matching, stale
  callback guards and recoverable unavailable state. Hook stops on blur, mute,
  language change and unmount. Physical audible speech remains a separate gate.

- Gameplay internals: `startRoundFor` starts a round for an explicit adaptive/random
  target and rejects IDs outside the active pack; `classifyGuess` is the pure
  proximity result shared by `guess()` and map colors (zero-distance neighbours stay
  non-correct). `modePackId` owns the stored IDs (`europe-countries` for Hot & Cold,
  `europe-countries:<mode>` otherwise). Tabs are typed by `TabParamList`. Shell and gameplay
  text, including tab labels, lives in `gameCopy`; `src/ui/i18n.ts` keeps only
  language and speech-locale definitions.

- Cleanup integration review: `gamePrompt` accepts resolved Find It clues and
  Name It answer types, including legacy capital modes. ModeSelector retains the
  current system-aware icon tints while using the four public `GAME_MODES` IDs.
  Theme and richer Learn components from develop remain intact.

- Map-first UI: Home uses offline decorative orbit artwork and four mode cards.
  Difficulty/practice/quiz variants move to `OptionsSheet`; learning summaries stay
  in Settings. The game removes repeated instructions and the always-visible map
  toolbar, keeps attempts/best score and one round action, and uses a compact Learn
  card with opt-in full details. `EuropeMap.fill` and aspect-aware viewport math
  preserve geography proportions and pointer scale on tall surfaces. Directional
  map controls and numbered small-country selection remain available on demand.

- Navigation follow-up: remove both redundant Home header links to Settings and
  move the Europe summary/setup row into a middle `Europe` tab. Home has only the
  four game cards; tabs are Home / Europe / Settings and still hide during play.
  Quiz variants are shared in the tab navigator; no persistence schema changes.

- Country picker usability: replace the separate small-country sheet with direct
  48dp on-map buttons and screen-space clustering. One tap picks an isolated
  country; a crowded group tap only zooms. The maximum-zoom layout separates
  buttons with leader lines. Preserve stable numbers, difficulty filtering,
  target secrecy, keyboard SVG adapters and pan/pinch suppression. The renderer
  owns the picker; `mapPicker.ts` holds pure, tested layout rules.

- 2026-10-26: Added four offline continent packs and the `maps` registry. Reused
  `EuropeMap` via optional `map`, existing SVG adapters, gestures, picker clusters,
  game modes, speech and progress serialization. Added shared session map choice
  (`MapProvider`, `MapSelector`); collection, profile and Settings follow the map.
  Retained Europe pack/storage IDs and schema. Removed Europe-sized exploration
  and restored-guess truncation without changing record shapes. No runtime
  dependencies; Shapely 2.0.7 is a data-generation tool. Coverage and source
  conventions: `docs/continent-maps.md`.

- 2026-10-27: Replaced the two automatically loaded country images with reusable
  `CountryGallery` in expanded Learn/collection details. Bundles Wikipedia article
  links and credited image metadata, loads photos only on request, retains offline
  map/facts and handles image/link failures. Removed the obsolete per-card single
  photo failure state. Added no runtime dependency or persistence change; see
  `docs/wikipedia-gallery.md` for metadata generation and source attribution.

- 2026-10-27 compact UI: reused mode, map, difficulty and options components for
  a two-column Home launcher and continuous ocean play surface. `MapSelector`
  becomes a summary plus full vertical chooser; `EuropeMap.toolsVisible` lets
  play options disclose secondary controls while keeping Fit visible. Completion
  replaces answers/prompt with compact feedback, audio and Next. Short tab labels
  retain existing route IDs. No dependencies, game rules or storage changes.

- 2026-10-27 Learn atlas: removed the persistent instruction card, duplicate atlas,
  coordinate/code tiles and repeated region/footer. Reused the country heading
  across preview, sticky detail-sheet heading and collection. Learn has named
  small-country chips and collision-managed labels; width-aware picker layout
  preserves every target and quiz defaults. Gallery stays opt-in with concise
  controls, pagination and full attribution. Removed the now-unused
  `CountryAtlasPortrait` and coordinate formatting helpers. No data/schema changes.

- 2026-10-27 Explorer Profile: added pure derived XP/levels and six achievements,
  five earned outfit stages and three bundled human SVG explorers. Profile shares
  one journey across every map; mastery remains separate. Schema 4 adds only the
  chosen cosmetic ID, preserving legacy learning/history/preferences and storage
  keys. Existing serialized save/read recovery is reused, including avatar-sheet
  retry. No runtime dependency or network service. See explorer-progression.md.
