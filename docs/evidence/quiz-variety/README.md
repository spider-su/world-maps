# Quiz country variety — 2026-10-29

## Problem and change

North America Normal previously contained only Canada, the United States, Mexico and Nicaragua: the Europe-scale `area >= 700` cutoff reduced 23 countries to four. It was even smaller than Easy's seven-country pool.

Normal now retains the larger of its existing area-based pool, the seven Easy countries, and two thirds of the region rounded up. North America has 16/23 targets; Europe retains 34/47. Difficult still includes every location; Easy remains the seven largest outlines. All three quizzes draw targets and Name It distractors from the same active pool. Existing small-country targets/clusters handle the additional countries.

Both Adaptive and Random exclude up to four recent targets, capped at half the active pool. Recency comes from existing per-mode learning records, with the previous transient target taking the first slot. Reopening preserves the cooldown for practiced targets. Unanswered skipped rounds do not create durable practice records; the latest skipped target is excluded during the current run. Adaptive weights still favor missed/due countries among the remaining candidates. This is a cooldown, not a guarantee of full coverage before any repeat.

Game options show the real selected-pool count. EN/PL/RU practice hints explain spacing. Progress keys, schema v4, pack IDs, scoring, facts and stored history are unchanged; old scores are preserved even where the Normal pool broadens. No dependency changes.

## Source checks

Runtime source: `7f0009e1b4ce5d9f5b155f5801df9e23899bba01`.

- Existing installed dependencies from the preceding successful `npm ci` were reused; package manifests/lockfile are unchanged.
- `npx vitest run src/features/geography/difficulty.test.ts src/features/geography/learning.test.ts`: PASS, 12 tests.
- `npm run ci`: PASS, TypeScript + ESLint + 177 tests / 42 files.
- `npx expo-doctor`: PASS, 21/21.
- New tests cover nested Normal/Easy pools on all six regions, 16 North America countries, four unique multiple-choice options, mode/map isolation, small pools, reopened recency, and seeded 80-round Adaptive/Random runs visiting all 16 targets with no repeats among the last four.
- `npx expo export --platform web --output-dir artifacts/quiz-variety-web`: PASS.

## Browser

Production export served on loopback port 8111; `web-smoke.js` uses an isolated context with canonical v4 fixture data. It completed 32 North America Name It rounds plus another after reload: 14 unique targets in 33 rounds, no repeat within the prior four, zero uncaught JavaScript errors. It verified setup's 16/23 count and Find It's dynamic game-options count. Wrong choices were deliberately submitted while solving; this is interaction coverage, not a human accuracy measure. The run verifies variety, not a prescribed random sequence.

Screenshots: [pool](web-pool.png), [completion](web-result.png), [game options](web-game-options.png).

## Android artifact

Command:

```sh
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home WORLD_MAPS_ARCHITECTURES=arm64-v8a npm run build:android:preview
```

Fresh standalone preview with embedded JavaScript, arm64, development signing, trackedChanges=false. Source SHA above. APK SHA-256: `1d53cbaf36b5f9ec847abf0a6154b17581c2272dca48bba96b32bcad2ca82694`.

Installed with `adb -s emulator-5554 install -r artifacts/world-maps-preview.apk`; no uninstall or storage clearing. Emulator API 35, 1080×2400, gesture navigation, airplane mode. `native-smoke.py` checks Normal 16/23 in Settings and game options, Name It entry, map restoration after force-stop/relaunch, unchanged XP, and restores the original map preference. It does not submit answers or edit character appearance.

Native smoke: PASS. The original Europe map was restored and XP stayed at 350 before/after upgrade and restart; `native-result.json` records the result. Installed `base.apk` SHA-256 matched the local APK exactly. Screenshots capture setup, Name It with Jamaica and wider answer choices, options, and preserved Profile progress.

No physical Android, iOS, screen-reader or full six-region native quiz run is claimed. The multi-round cooldown run was browser-based; the native walkthrough is targeted setup/navigation/preservation evidence. Historical broader UX checks do not establish these untested platforms.
