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

Verified 2026-10-25 on the isolated `world-maps-poc` Pixel 7 emulator, API 35,
1080×2400, arm64-v8a, serial emulator-5554. The standalone app was launched with
airplane mode enabled and no ADB reverse/Metro mapping. Source build commit:
`ada26baf2665664d378a2a47120d5e7adfdfdbfe`; tracked build tree was clean.

Delivered APK SHA-256 (also verified on installed base.apk):
`fabe04af24204d91cc6ad951750d1efe74571077ef28441959680047205d84d5`.

| Check | Result |
|---|---|
| Offline cold launch, map, bundled flag/capital | PASS |
| Home / four mode entries / Android Back | PASS |
| Hot & Cold selection and repeated guess | PASS |
| Find It target prompt, labels hidden | PASS |
| Name It wrong/correct answers and completion | PASS |
| Completed score, mute and PL preference after force-stop | PASS |
| Update-over-install retains score and mute | PASS |
| Native map drag, zoom buttons and reset | PASS |
| Gesture + three-button insets; text scale 1.3, scrolling | PASS |
| License modal scroll + Android Back | PASS |
| Production web: all quiz completions, scores, restart, PL offline Learn | PASS |
| Browser read/save fault injection and retry | PASS |
| npm run ci / expo-doctor / web export | PASS: 50 unit + 3 setup, 21/21, export successful |
| Physical Android, audible pronunciation, full TalkBack | SKIP: no physical-device proof; headless emulator audio disabled |
| Native two-finger pinch | SKIP: automated input covered one-finger drag/buttons |
| iOS | NOT TESTED: simulator preflight emitted package-install authorization error |

Artifacts/evidence are local under `artifacts/evidence/`, including screenshots,
smoke scripts and `poc-results.json`. Emulator font scale/navigation/night/airplane
settings were restored after tests. Device configuration changes can recreate an
unfinished round; completed scores persist. Large text may require scrolling.

The initial development-signed preview (`b598c2a`, SHA-256
`aa4bee3aee01879b5fe2fedb50ace748821e27fa4a69027314fc85c4fd0463dc`) was
updated in place to the delivered APK above, with saved results retained.

Dependency limitation: npm audit reports six high-severity entries, including
Expo CLI/signing and test-tool dependency chains. No forced downgrade of Expo was
applied. This POC is not a claim of store readiness or a vulnerability-free release.
