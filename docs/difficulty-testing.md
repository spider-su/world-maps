# Country difficulty and PR reconciliation

2026-10-25. Based on origin/develop `a0713a1` (includes the merged POC #13).
Fetched origin and reviewed PRs #5 and #11: both are merged, and their head
commits are ancestors of this checkout. Their DOM event adapters, detailed
Natural Earth map and name visibility are retained; no duplicate cherry-pick.

## Behavior

- Easy: seven largest projected map outlines (Russia, Turkey, Sweden, Ukraine,
  France, Finland, Norway). This measures visible tap size, not national land area.
- Normal (default): 34 outlines with projected area >= 700 square map units,
  matching the existing small-target focus boundary.
- Difficult: all 47 locations, including small-country markers.
- All three quizzes restrict targets, guesses and Name It distractors to the pool.
  Other outlines remain muted context; Learn is unrestricted.
- Saved level and per-level histories retain existing sessions. Legacy sessions
  count as Difficult; Settings continues to show aggregate history.
- Home keys game instances by mode/level so asynchronous preference restoration
  cannot leave a target from the wrong pool.

## Validation

- `npm run ci`: PASS (53 unit tests + 3 setup tests, TypeScript, ESLint).
- `npx expo-doctor`: PASS (21/21).
- Focused tests cover nested pools, every eligible target and its four answer
  choices, rejection of excluded guesses, legacy history, level-separated scores,
  and serialized score/preference persistence.
- Production web export: PASS at 390×844. Interactive outlines count 7/34/41
  (Difficult additionally has six small-country controls); radio checked state,
  Easy reload persistence, unrestricted Learn, four unique Easy Name It choices,
  keyboard quiz completion and separate Normal/Easy history verified. No horizontal
  overflow. SVG bounding-box center clicks can land in sea; keyboard selection was
  used for the automated completion check.
- Android: PASS on emulator-5554, API 35, 1080×2400, gesture navigation. Installed
  fresh standalone arm64 APK over the POC; Normal default, level selection, Easy
  Name It, force-stop/relaunch preference persistence, Difficult small-country
  controls and unrestricted Learn at Easy verified.
- Screenshots and result JSON: `artifacts/evidence/difficulty-*` (local, ignored).
  This focused smoke does not repeat every previous navigation/accessibility case.

APK source: `4d962307865224ebc7b9541da64e7489d768a43d` (documentation follows).
SHA-256: `adf7cf2e036926c6cc7195db07ccb9cc39d7dc67258b15de0d63f521a8904a70`.
`artifacts/world-maps-preview.apk` embeds JS and uses development signing;
`artifacts/preview-metadata.json` records provenance. The previous POC APK is
preserved locally as `artifacts/world-maps-preview-poc-original.apk`.

Physical Android and iOS testing remain pending. Earlier POC evidence describes
an earlier APK; it does not establish testing of these difficulty controls.
