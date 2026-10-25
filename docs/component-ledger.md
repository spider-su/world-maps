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

- Europe map views: bundled 1:50m country/context geometry and collision-filtered labels share the existing 864×570 coordinates. `mapLabels` exposes names only when explicitly enabled or already guessed. `CountryMarker` uses native SVG press events and DOM click events on web, matching `CountryPath`. No dependencies added. Web evidence and current native limitations are recorded in `docs/europe-map-assets.md`.

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

- `LANGUAGE_OPTIONS`, `SPEECH_LOCALES`: shared EN/PL/RU language/voice locale contract.
- `speechController`: serialized stop/speak queue, installed-voice matching, stale
  callback guards and recoverable unavailable state. Hook stops on blur, mute,
  language change and unmount. Physical audible speech remains a separate gate.
