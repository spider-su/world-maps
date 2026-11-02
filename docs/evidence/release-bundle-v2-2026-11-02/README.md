# Android release AAB, version code 2 — 2026-11-02

Synchronized the workspace from remote `main` **78a634e**, preserving the existing
local `codex/google-play-assets` branch and its commit. The workspace was clean;
no stash or data reset was needed. Created `codex/release-aab-v2` from that remote
baseline and set `android.versionCode: 2` in `app.config.ts`.

Display version remains **1.0.0**, package **com.spidersu.worldmaps**. This request
increments the Android upload version code, not the marketing major version.

## Artifact and identity

- Built source: **48c922f9157cde948c0d76ecb1c378be3d2ea6c2**, tracked tree clean at build.
- Local artifact: `artifacts/release-v2-2026-11-02/world-maps-1.0.0-2.aab` (not committed).
- SHA-256: `2ca61a696fdf015a858f2f2b6715935662646b27856d0d6ec67188f4f4cfa967`.
- Size: 51,128,070 bytes; arm64-v8a and x86_64; embedded JavaScript;
  non-debuggable; min SDK 24 / target SDK 36.
- Uses the **existing World Maps upload key** from version code 1. No new key was
  generated. Certificate SHA-256:
  `6A:8E:D7:B4:3E:D0:49:E2:A3:67:9F:8B:23:63:3A:83:04:06:69:E0:E1:97:61:36:EE:18:36:9C:5E:FC:20:74`.
- The [version 1 public certificate](../release-bundle-2026-11-02/world-maps-upload-certificate.pem)
  remains applicable. Private credentials remain outside Git. Version 1 artifacts
  were preserved in their original directory.

## Build and checks

Existing dependencies were used because `package.json` and `package-lock.json`
were unchanged. JDK 17, Android SDK, existing app-specific Google Services config
and the public Google Web OAuth client from Mobile CI were supplied to the build.
The compiled JS was checked for that client ID; this does not establish live
sign-in or Play signing-certificate registration.

Commands and results:

- `npm run ci`: **PASS**, TypeScript, ESLint, 243 tests /54 files.
- `npx expo-doctor`: **PASS**, 21/21.
- `npx expo prebuild --platform android --no-install`: **PASS**, generated native
  version code 2 / version name 1.0.0.
- `android/gradlew -p android --no-daemon --init-script <local signing init> bundleRelease -PreactNativeArchitectures=arm64-v8a,x86_64`:
  **PASS**, 1m42s. The init script assigns the existing upload key in
  `androidComponents.finalizeDsl`; no preview/debug certificate is used.
- Standard `jarsigner` signing normalizes the JAR signature-container order;
  non-signature payloads hash-match the Gradle output.
- `jarsigner -verify -verbose -certs`: **PASS**; same certificate as version 1.
  The self-signed upload certificate/no timestamp advisories remain expected.
- Google `bundletool` 1.18.3 `validate` and `dump manifest`: **PASS**; package,
  version code **2**, name **1.0.0**, SDKs and debuggable flag checked.
- `bundletool build-apks --mode=universal`: **PASS** from the final AAB.
- Generated APK `apksigner verify --verbose --print-certs` and `aapt dump badging`:
  **PASS**, matching certificate and version code **2**.
- Generated APK `zipalign -c -P 16 -v 4`: **PASS**.
- All **46** native ELF libraries have PT_LOAD alignment of at least 16KiB.
- `git diff --check`: **PASS**.

Build, checks and validation logs plus the one-off build/signing scripts are kept
in the ignored local artifact directory. No dependency or component contract changed.

## Limits

No Play upload or deployment was performed. No new emulator, physical-device,
iOS or 16KiB-page runtime run was performed for this artifact. Static validation
and successful builds do not establish release-artifact runtime acceptance.
The [previous emulator findings](../emulator-smoke-2026-11-02/README.md),
[owner-reported APK test](../../owner-android-smoke-2026-11-02.md) and remaining
[release gates](../../release-checklist.md) retain their original scope; this build
only bumps the Android version code and supplies the requested signed bundle.
