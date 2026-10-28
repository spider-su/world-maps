# World Maps release checklist

## Source and configuration
- [ ] Review app.config.ts, .env, app icon and permissions; the app needs no runtime permissions
- [ ] Confirm no credentials, signing keys or personal data are committed
- [ ] Run `npm ci`, `npm run ci` and `npx expo-doctor`
- [ ] Run a production web export (`npx expo export --platform web`)

## Canonical data contract
- [ ] Confirm the build uses the current `develop` canonical progress schema v4, not older main-based APK logic
- [ ] Use clean test data for old experimental schemas; do not claim compatibility migrations
- [ ] Verify fresh install, force-stop, restart and update-over-install retain canonical v4 progress

## Device acceptance
- [ ] Validate continent and Find It/Name It variant preferences survive force-stop and app upgrade
- [ ] Check all six maps, Polish/Russian capital localization, and both dark/light appearances
- [ ] Check offline region music previews and optional quiz sounds on real hardware (media volume, focus, speech priority)
- [ ] Use [current POC checklist](poc-current-checklist.md) for detailed feature-by-feature regression checks

- [ ] Run `.codex/skills/ios-simulator-smoke/SKILL.md` on macOS/Xcode; record iOS Simulator evidence separately from real-device testing
- [ ] Build `npm run build:android:preview` and launch the APK offline (airplane mode)
- [ ] Confirm preview APKs are for install testing; Google Play uploads require a correctly signed release AAB
- [ ] Keep the Android package name and upload signing identity stable; increment versionCode for every new Play upload
- [ ] Install the new build over the previous one without uninstalling; verify scores, learning records, language and voice settings survive
- [ ] Play all four modes, all difficulty levels and adaptive/random practice
- [ ] Tap countries and small-country alternatives; pan and pinch without accidental guesses
- [ ] Test Android gesture and three-button navigation and system insets
- [ ] Test large font scaling, screen reader labels and a small screen
- [ ] Verify EN/PL/RU text, speech controls and persistence after process restart
- [ ] Verify recovery from unreadable saved progress (retry, no data loss)
- [ ] Capture device model, OS version, artifact SHA and date in the PR

## Distribution (only if applicable)
- [ ] Verify unique app IDs, version and signing configuration
- [ ] Verify release build, privacy policy, support link and store metadata
- [ ] Test the exact release artifact before distributing
