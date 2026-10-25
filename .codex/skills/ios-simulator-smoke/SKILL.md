---
name: ios-simulator-smoke
description: Run a reproducible iOS Simulator smoke test for World Maps on macOS with Xcode, validating navigation, safe areas, theme and local persistence. Use when an iOS Simulator is available.
---

# iOS Simulator smoke test

## Preconditions and safety
1. Require macOS, Xcode and Xcode command line tools. Check `xcodebuild -version`, `xcrun simctl list devices available` and `xcrun simctl list runtimes`. On Linux/Windows report **BLOCKED: macOS/Xcode required**; do not claim iOS verification.
2. Record git branch, commit, working-tree status, Xcode version, iOS runtime, simulator model and UDID. Preserve uncommitted work.
3. Choose an available **simulator** UDID explicitly. Confirm it appears in `xcrun simctl list devices available` before any boot/install/reset action. Never erase, reset or install to a physical iPhone. Never use personal signing identities or credentials.
4. Check the current app identity from `app.config.ts` and local configuration. Use the World Maps bundle identifier; do not reuse another app's IDs.

## Build and launch
5. Run `npm ci`, `npm run ci`, and `npx expo-doctor` and record results. Fix blockers before claiming success.
6. Boot the selected simulator with `xcrun simctl boot <UDID>` if needed, then `xcrun simctl bootstatus <UDID> -b`. Avoid altering other running simulators.
7. From the **current checkout**, build and install with `npx expo run:ios --device <UDID>` (or use an explicitly documented equivalent Xcode simulator build). Verify the app launches; do not reuse a preexisting .app bundle as evidence.
8. If a native dependency or CocoaPods step fails, report the exact command and failure. Do not silently switch to web or Expo Go and claim native coverage.

## Smoke scenarios
9. Navigate Home and Settings, start each of the four game modes and return. Check top safe area, tab bar bottom inset, hidden-tab game insets, scrolling and modal placement on a notched and, if available, a compact simulator.
10. Test larger accessibility text. Verify legibility, tap targets, VoiceOver labels where practical, and no clipped controls.
11. Test EN/PL/RU switching, relaunch and persisted language. Complete a round, terminate and relaunch the app, and verify scores and learning progress persist.
12. Pan/pinch the map without accidental guesses and use small-country alternatives. Speech may be silent in the simulator; record audible pronunciation as **SKIPPED**, never passed.
13. Review Xcode/Metro logs for uncaught exceptions and serious warnings. Record any reproducible defects.

## Evidence and cleanup
14. Capture screenshots using `xcrun simctl io <UDID> screenshot <path>`; keep paths and test notes in a dated, ignored or external evidence directory. Record each scenario as PASS / FAIL / SKIPPED / BLOCKED with simulator OS, UDID, build commit and command.
15. Restore appearance/accessibility settings you changed. Stop only the simulator you started, if appropriate. Do not erase user data unless explicitly authorized.
16. Report that iOS Simulator evidence does **not** establish real-iPhone, TestFlight, signing, App Store or release-build readiness. Record product-specific regressions in the PR.
