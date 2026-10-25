# POC testing and preview delivery

## Build

Use JDK 17 and an Android SDK. Install dependencies with `npm ci`, then:

```sh
npm run ci
npx expo-doctor
npm run build:android:preview
```

`artifacts/world-maps-preview.apk` embeds the JavaScript bundle and uses development
signing from the generated Expo Android project. It is a POC preview, not store
signing or a production release. Default ABIs: arm64-v8a and x86_64. For one ABI:
`WORLD_MAPS_ARCHITECTURES=arm64-v8a npm run build:android:preview`.
`preview-metadata.json` records source SHA, tracked dirty state, ABIs and APK hash.
Do not infer installed runtime SHA from a mutable filename or a successful build.

The app identity is com.spidersu.worldmaps. On a tester's device, only install with
permission; do not uninstall another build if that would discard saved progress.
No personal/downstream signing key is used. CI uploads preview artifacts for 14 days.

## Acceptance matrix

Record model, OS/API, build source/hash, commands and PASS/FAIL/SKIP for:

- Standalone cold launch without Metro, airplane mode, map and country card offline.
- Home -> each mode -> Home; Android system Back and Settings tab.
- Hot & Cold repeated guesses, correct match, no label assistance before completion.
- Find It named target; Name It four options, wrong-answer disable and tiny targets.
- Learn flag/capital/pronunciation, no scored session recorded.
- EN/PL switching, mute, force-stop/relaunch and completed-score restoration.
- Pan/zoom, small-country targets, compact screen, larger text and system insets.
- Storage read/save failure and retry (pure store tests + browser fault injection).
- License modal, deep scroll and Android Back dismissal.

Web/emulator evidence never establishes physical Android or iOS compatibility.
Offline speech depends on installed device voices; absence is reported gracefully.

## Results

Pending final preview build and emulator/browser checks. Physical Android and iOS
remain explicit gates; they cannot be replaced by source checks or an APK artifact.
