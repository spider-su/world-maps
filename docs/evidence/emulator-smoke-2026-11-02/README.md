# Android emulator smoke — 2026-11-02

Executed with [android-emulator-smoke](../../../.codex/skills/android-emulator-smoke/SKILL.md).
This is a bounded smoke run, **not full market/device acceptance**. Two UI checks
failed; remaining cases and skips are listed explicitly below. No runtime code changed.

## Build and environment

- Tested checkout: `4725e37024ec81802d229e2aa70f015122a20195`, initially
  `codex/align-docs-tests-roadmap`. PR #86 merged during the run; merged main
  `ebce962bd741ca093c17629ef4c8e2d46d7f8c21` has an identical source tree.
  Evidence is saved on `codex/android-smoke-evidence`.
- Fresh `npm run build:android:preview`, JDK 17, Android SDK,
  `WORLD_MAPS_ARCHITECTURES=arm64-v8a`, app-specific `GOOGLE_SERVICES_JSON`.
  Build: PASS (1m42s), embedded JS, development signing, not store signing.
- APK SHA-256: `ef12b81b563b4fc1c2aceb2443db779f8e37dd22a75c4cc88e292d8dba86cf66`.
  Installed with `adb -s emulator-5554 install -r artifacts/world-maps-preview.apk`.
  The installed APK digest was verified again after the emulator cold boot.
- AVD `world-maps-poc`, emulator `emulator-5554`, Android API 35,
  `sdk_gphone64_arm64`, 1080×2400, density 420. Additional forced 840×1491
  (~320×568dp), 150% font scale, dark mode and three-button navigation.
  Standard captures use light mode, 100% text and gesture navigation.
- Airplane mode was already enabled; connectivity reported **no active default
  network**. No account was created or signed in, and no real invite was accepted.
- Test actions used newly created user 10, `WorldMapsSmokeNov02`, never owner quiz
  data. Only synthetic progress was changed. The test user was removed afterward.

## Results

| Case | Result | Evidence / boundary |
| --- | --- | --- |
| Offline cold launch, Home and tab controls | PASS | `01-home-offline-light`, `11-maps`, `15-library`, `18-profile`, `23-settings-top` |
| Hot & Cold map input, completion and reward | PASS | `02`–`03`; France solved first try, +20 XP in disposable profile |
| Find It prompt and incorrect map feedback | PASS | `04`, `52`; France guessed for Netherlands, one attempt, Try again. Completion/Next for this mode not exercised |
| Name It wrong answer, completion and Next | PASS | `05`–`07`; Switzerland wrong then Poland correct, +15 XP, new round opens |
| All six Learn maps render offline | PASS | `08-learn-*`; framing visually inspected, not exhaustive border/hit-testing |
| Caribbean region opens and zooms | PASS | `09-caribbean-sheet`, `10-caribbean-zoom`; no optical/pinch or every-country selection claim |
| Learn discovery and expanded photos offline | PASS | `13`–`14`; France adds one discovery; Hide photos, Photo unavailable and Retry photo visible; facts/Close remain available |
| Library collapsed photos, search retained on Back | PASS | `15`–`17`; searched France, opened sheet, Show photos initially; search retained after closing |
| Explorer, red hair and blue eyes persist after force-close | PASS | `19`–`22`; Forest/Red/Blue remain checked; Profile has 45 XP |
| Audio preference controls and preview UI | PASS | `24`–`26`; enabled music/effects, slider changed 12%→25%, Stop preview appears. Audible output/interruption behavior not verified |
| Long licenses scroll, Android Back, separate setup sheet | PASS | `27`–`30`; returned to Settings's previous offset, setup opens at its own top. Settings also exposes Difficulty, unlike Home |
| Globe country/pin, rotation guard and ocean coordinates | PASS | `31`–`36`; Germany expands photos, pin remains after closing, drag does not open sheet, ocean details; XP remains 45 |
| Unsupported progress read protection and Retry | PASS | `37`–`39`; injected schema 999 only into stopped disposable user's DB; Retry retained protection. Original valid progress restored exactly, with hash in `read-error-result.json` |
| Small/dark/large-text Home, Learn, inset, Settings/Profile navigation | PASS, bounded | `40`, `42`–`44`, `46`; scrollable content and regional sheet reachable. System three-button rendering on forced display is not physical-device proof |
| Large-text Name It prompt readability | **FAIL** | `41-name-small-dark-large-threebutton.png`: second line of “Which country is highlighted?” clips. Dock can scroll to the fourth answer (`53`), but that does not repair prompt clipping |
| Dark licenses Close icon contrast | **FAIL** | `45-licenses-small-dark-large-threebutton.png`: black Close glyph on dark surface. Android Back still closes the dialog |
| Cold/warm invitation and explicit approval | PASS, signed out | `47`, `50`; synthetic all-`a` token, Add friend disabled. No live token acceptance or two-account flow |
| Share World Maps includes URL | PASS | `48-share-world-maps`; Android share sheet contains `https://world-map-1.web.app`. This does not prove Hosting availability |
| Camera denial, permission grant and loading UI | PASS, bounded | `49`, `51`; denied permission gives link alternative; granting shows scanner instruction and Loading. Preview-ready and optical QR decode **not proven** |
| Update-over-install / existing owner data preservation | PASS | Actual previously installed APK hash `8edbf793b832c82356a6103cbe9b2c9e427ccebcc77ac4835d2fcb335afd84b6` matches historical `e4945d5` preview. Replaced with fresh APK using `-r`; owner restored to 360 XP (`54`). All four saved progress/preference records match before/after exactly |
| Source checks | PASS | `npm run ci`: TypeScript, ESLint, 243 tests /54 files; `npx expo-doctor`: 21/21; logs alongside this report |

## Skips and interruptions

SKIP: iOS, physical Android, full TalkBack interaction, audible speech/music,
real optical QR scanning, preview readiness, live Firebase/Auth/App Check/rules,
real two-account approval, online photo success, every clue/answer variant, actual
pinch/multitouch, save-error injection and complete mode/provider regression.
Read-error recovery used deliberate isolated invalid input; it was not spontaneous
corruption. No data was cleared to make a check pass.

ADB disconnected, one UIAutomator dump exited 137, and diagnostic logcat showed
`UiAutomationService ... already registered` in the **UIAutomator process**.
Later the emulator process stopped. A windowed restart exited 139; the same AVD
cold-booted successfully headlessly with SwiftShader, `-no-snapshot-load` and
`-no-snapshot-save`, preserving both profiles. Remaining checks resumed there.
These are harness/emulator interruptions, not evidence of an app crash.
Selector corrections for SVG bounds, switch labels and actual “Quiz setup” text
were rerun successfully. No full uninterrupted automation run is claimed.

## Restoration and reproducibility

`restoration-result.json` records owner user 0, unchanged local records, 360 XP,
1080×2400/density 420, 100% text, light appearance, gesture navigation and original
airplane mode 1. Owner record hash before/after is
`e00256f2343666bf2343cc591c7140bddfca54a6ec5c985db1a6ed55a0c2ca1d`.
No owner storage, credentials or raw DB backups are committed. The current preview
APK remains installed; this does not replace it with the separately signed release AAB.

PNG screenshots and companion UI XML are saved for each numbered case. The
`capture-driver.py` helper records the ADB selection/capture approach; it is **not**
a complete unattended test suite. It guards the named disposable user and writes
to `artifacts/android-smoke-captures` by default. Recreate a separate test profile,
install the source-matched APK, follow the case sequence above and adjust selectors
for random quiz targets. Never rerun against owner data or overwrite this snapshot.
`captures.json` contains PNG digests and capture file timestamps in Europe/Warsaw.

See the separate [release AAB evidence](../release-bundle-2026-11-02/README.md).
