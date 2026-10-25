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
- Web/native smoke evidence is recorded below after execution.

Physical Android and iOS testing remain pending. Earlier POC evidence describes
an earlier APK; it does not establish testing of these difficulty controls.
