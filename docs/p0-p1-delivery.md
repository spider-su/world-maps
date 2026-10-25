# World Maps P0–P1 delivery

2026-10-25. Integrated on `fix/android-final-validation`; no remote PRs merged.
The pre-existing `.idea/` directory and saved progress were preserved.

## Implementation status

| Requirement | Delivered behavior | Review |
|---|---|---|
| P0 accurate/selectable Europe | Retained Natural Earth 1:50m, multipart islands, stable 47 IDs, even-odd paths, tiny-country alternatives, no expanded hit areas stealing neighbours | #15 |
| P0 four modes | Repeats do not add guesses; wrong Name It options stay red/disabled; persistent feedback, completion/restart and gesture suppression | #15, #18 |
| P1 country learning | Schema-2 country/mode counters, abandoned misses, first-try/recent results, one-time history migration, coverage/mastery/accuracy UI | #16 |
| P1 adaptive practice | Deterministic weighted draws favor misses and revisit older practice; Random alternative, immediate-repeat avoidance, active difficulty pool respected | #16 + #14 |
| P1 terrain atlas | Bundled Natural Earth relief, identical projection/bounds and viewBox, political hit geometry, Learn border toggle; clean quiz appearance | #17 |
| P1 languages/pronunciation | EN/PL/RU UI/names/capitals and saved locale; installed device voice matching, serialized cancellation, replay, missing/stalled-voice handling | #18 |
| P1 Android stabilization | Local standalone build, final-artifact all-country selection, all scored modes, pinch/drag, offline restart and persistence | #19 |

The app intentionally supports light appearance. OS dark mode was checked for
readability; an alternate dark app theme is not implemented or advertised.

## PRs and source commits

- [#15 geography/gameplay](https://github.com/spider-su/world-maps/pull/15):
  feature `1fe6448`, latest branch `93e56c1`.
- [#16 country learning](https://github.com/spider-su/world-maps/pull/16):
  feature `9f51c9e`, latest branch `1b2b223`.
- [#17 terrain atlas](https://github.com/spider-su/world-maps/pull/17):
  feature `f0ca491`, latest branch `1d24f72`.
- [#18 Russian/speech](https://github.com/spider-su/world-maps/pull/18):
  feature `1bf7e1b`, fixes `9c94324`/`7e24806`, latest branch `4aeb34b`.
- [#14 difficulty](https://github.com/spider-su/world-maps/pull/14) remains included
  in combined validation, latest branch `3c24e29`.
- [#19 combined validation](https://github.com/spider-su/world-maps/pull/19) is a
  draft integration alternative, containing the overlapping-file resolutions and
  Russian translations for the new practice/difficulty/atlas controls. Review the
  focused PRs individually; use this branch as the fully tested combined merge
  candidate. Do not merge it again after merging the equivalent feature changes.

Map/gameplay were consolidated because they share the renderer. The other feature
PRs independently target develop, as requested. Their combined overlap resolutions
are captured in #19; separate source-CI success alone does not validate integration.

## Commands and actual results

- `npm ci`: PASS, existing pinned dependencies installed; no new runtime dependency.
- `npm run ci`: PASS on the integrated application: TypeScript, ESLint,
  **70 Vitest unit tests + 3 Node setup tests**.
- `npx expo-doctor`: PASS, **21/21**.
- `git diff --check`: PASS.
- `node scripts/build-border-distances.mjs`: generated all **1081** distinct pairs.
- `python3 scripts/build-atlas.py /tmp/world-maps-atlas-source/NE1_50M_SR/NE1_50M_SR.tif`:
  generated the committed 356,471-byte JPEG with source/output hashes.
- `python3 scripts/build-country-facts.py /tmp/world-maps-countries-facts.json /tmp/world-maps-flag-source`:
  generated all 47 EN/PL/RU facts using the pinned data/flags.
- `npx expo export --platform web --output-dir artifacts/p1-final-web`: PASS.
- `JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ANDROID_HOME=/opt/homebrew/share/android-commandlinetools ANDROID_SDK_ROOT=/opt/homebrew/share/android-commandlinetools WORLD_MAPS_ARCHITECTURES=arm64-v8a npm run build:android:preview`:
  PASS; standalone development-signed APK, embedded JS, no Metro connection.

Hosted source checks passed on the feature and integrated application commits.
The earlier Android artifact failure was after successful Gradle assembly: the
runner lacked `rg`. `grep -Fx` now verifies the embedded bundle using portable
runner tools; feature pushes validate through PR events once, avoiding duplicate
builds. The integrated hosted run
[40178260059](https://github.com/spider-su/world-maps/actions/runs/40178260059)
passed **both source checks and Android APK assembly/upload** on `2d4166a`.
The follow-up evidence/documentation commit has its own checks; it changes no
runtime source. Individual feature Android jobs are reported separately from this
successful integrated run and from local APK/device proof.

## Android artifact

- File: `artifacts/world-maps-preview.apk`, 34,386,728 bytes, **arm64-v8a**.
- App: `com.spidersu.worldmaps`, development signing (not store credentials).
- Build source: **a4e34c3e748b6d5cf1d33e7ac82873717e916ce3**.
- SHA-256: **45588004348b52408b9bf26ca2806e8571a113582fe14aefe139200907601fe3**.
- Installed emulator `base.apk` was pulled and its SHA-256 matched exactly.
- `artifacts/preview-metadata.json` records provenance and a clean tracked build.
- Subsequent CI/workflow and evidence documentation commits do not alter the
  application's runtime source. Earlier POC APKs/evidence describe earlier builds.

## Runtime evidence

Android emulator `world-maps-poc`, `emulator-5554`, API 35, 1080×2400. No physical
phone was connected. No ADB reverse mappings; airplane-mode cold launch tested.

| Scenario | Result |
|---|---|
| Final APK all 47 countries: 34 real interior polygon taps + 13 explicit small-region alternatives | PASS |
| Three quiz completions offline using physical taps/answer options | PASS |
| Native two-finger pinch changes zoom without adding a guess | PASS |
| Drag without a guess, reset and zoom controls | PASS |
| Microstate repeated guess counted once | PASS |
| Original Name It score retained through update/schema migration | PASS |
| Learning overview and newly completed mode histories after force-stop | PASS |
| Russian offline country/capital/flag and saved language after force-stop | PASS |
| Speech enable/replay/mute remains usable on installed emulator | PASS for request/error UI only; audible quality unverified |
| API35 three-button navigation, text scale 1.3, OS dark with light app | PASS on initial integrated build; lower actions reachable by scrolling |
| Final APK update installed over the initial integrated build | PASS; saved histories retained |
| Logcat fatal/ReactNativeJS errors during final focused smoke | None observed |

The initial integrated build (`0bef96b`) was used for layout/drag checks; the final
build (`a4e34c3`) includes only speech fixes and was retested for all 47 selections,
quiz completion, pinch, offline data, language and persisted histories. Emulator
font scale/navigation/night/airplane settings were restored. The test-created
practice results remain in the isolated emulator; no physical-device data was reset.

Production web at 390×844: **24 scenario checks passed**. Covers all quiz modes,
legacy migration, separate scores, no immediate repeat, four unique answers,
wrong-option color/disabled state, unrestricted Learn, real France-coordinate tap,
registered terrain zoom, Russian settings/facts, reload persistence, loaded-app
offline behavior, no horizontal overflow and zero page errors. A separate mocked
speech check verified Find It replay still uses the target after a wrong answer
and that missing voice discovery reports failure after two seconds. Mocked TTS is
not audible device evidence. Web cold-offline installation/PWA caching is not claimed.

Committed evidence:

- [Native scenarios](evidence/p1-android-results.json)
- [All-country selection](evidence/p1-country-selection.json)
- [Web scenarios](evidence/p1-web-results.json)
- [Russian atlas screenshot](evidence/p1-learn-ru-android.png)
- [Name It completion screenshot](evidence/p1-name-it-android.png)
- [Pinch screenshot](evidence/p1-pinch-android.png)

Full local scripts/screenshots are under ignored `artifacts/evidence/p1-*`.

## Remaining gates and limits

- Physical Android: pending by explicit user choice. Check taps, offline EN/PL/RU
  voices and interruption behavior with a real phone before broader distribution.
- Audible pronunciation quality and offline voice availability are unverified on
  this headless emulator. The app does not download voices; OS voice data is needed.
- iOS and full TalkBack coverage: unverified; no compatibility claim from Android.
- Borders use Natural Earth default de facto conventions; six microstates/islands
  are marker-only. Distances remain a simplified local-plane/marker approximation,
  not exact geodesic boundary measurements. Sources and conventions are documented.
- Mastery is a simple displayed practice heuristic, not a validated retention score.
  Migration can reconstruct only the score history previously retained (up to 100).
- Unfinished round state can reset on app restart/configuration change; its already
  recorded practice attempts remain. Completed scores and preferences persist.
- Existing dependency/tooling audit advisories from the POC remain documented in
  poc-testing.md. No forced SDK downgrade or unrelated dependency upgrade was made.

Next: review the focused diffs and combined resolutions, then run the physical-phone
matrix (especially installed offline TTS), TalkBack and an iOS build if that
platform is in scope. Store signing/publication is a separate future task.
