# Release App Bundle — 2026-11-02

Built on owner request for the first Play release, using a newly authorized,
dedicated World Maps **upload** key. No store upload, publication, IAM grant or
Firebase configuration change was performed. This is an artifact validation record,
not a claim that all publication requirements or UI checks pass.

## Artifact

Local file: `artifacts/release-2026-11-02/world-maps-1.0.0-1.aab` (not committed).

- Source `ebce962bd741ca093c17629ef4c8e2d46d7f8c21`, clean tracked tree at build;
  tree identical to emulator-tested `4725e37`.
- World Maps / `com.spidersu.worldmaps`, version **1.0.0**, version code **1**.
- min SDK **24**, target SDK **36**, non-debuggable, embedded JavaScript.
- Native ABIs: **arm64-v8a**, **x86_64**.
- SHA-256: `01432a999b3920207d0b851f9d4683101be85a33f8874fff790a9e43f5ff05ee`.
- Upload certificate SHA-256:
  `6A:8E:D7:B4:3E:D0:49:E2:A3:67:9F:8B:23:63:3A:83:04:06:69:E0:E1:97:61:36:EE:18:36:9C:5E:FC:20:74`.

Public certificate, fingerprints and metadata are included here. The private
keystore and password/config files are outside Git in the owner's local
`~/.android/keystores/world-maps/` directory with restricted permissions. Back up
that directory securely; do not commit or share its private contents.

## Build and verification

Used JDK 17 and the existing generated Expo Android project/public Firebase config.
A local Gradle init script reads local credentials and assigns the release signing
configuration in `androidComponents.finalizeDsl`, after the preview debug-signing
default. Command (from repository root):

```sh
JAVA_HOME=/path/to/jdk17 ANDROID_HOME=/path/to/android-sdk WORLD_MAPS_RELEASE_CREDENTIALS=/path/to/world-maps/upload-key.json android/gradlew -p android --no-daemon   --init-script artifacts/release-2026-11-02/release-signing.init.gradle   bundleRelease -PreactNativeArchitectures=arm64-v8a,x86_64
```

The project preview build command still uses development signing. No reusable
release command or private credential was added to tracked source. Local build
logs and the one-off init script are retained in the ignored artifact directory.

Gradle build: PASS. The final signing configuration build took 14s using cached
native compilation (initial dual-ABI compilation took 58s). Standard `jarsigner`
output canonicalized the signature-container order; every non-`META-INF` bundle
entry was hash-compared and preserved. This removed the JarInputStream ordering
warning. Verification still reports the expected self-signed/untrusted upload
certificate and no trusted timestamp; expiration is 2054-03-20.

- `jarsigner -verify -verbose -certs`: **PASS**, jar verified; certificate matches
  the newly generated upload certificate, not the development key.
- Official Google `bundletool` **1.18.3** `validate`: **PASS**.
- `bundletool dump manifest`: package, version/code, SDKs and debuggable flag checked.
- `bundletool build-apks --mode=universal` from the exact final AAB: **PASS**.
- Generated APK `apksigner verify --verbose --print-certs`: **PASS**, same certificate.
- Generated APK `zipalign -c -P 16 -v 4`: **PASS**.
- ELF PT_LOAD alignment: all **46** bundled native libraries support at least 16KiB
  alignment. This is static validation, not a 16KiB-page device test.

## Runtime and publication limits

The [emulator smoke](../emulator-smoke-2026-11-02/README.md) used a separately
**development-signed preview APK** with the same source tree. The release-generated
APK was not installed over owner data because its new certificate differs. No
release-artifact/device, Play processing or physical-phone acceptance is claimed.
The smoke found large-text Name It prompt clipping and a dark licenses Close-icon
contrast issue; address those before publication and rebuild the exact candidate.

Configure Play App Signing and register the **distributed app's signing certificate**
with Firebase/Google sign-in, App Check and Android HTTPS association as applicable.
The upload certificate alone is not necessarily the Play-distributed app certificate.
See [Android signing guidance](https://developer.android.com/studio/publish/app-signing)
and the [release checklist](../../release-checklist.md). Account-deletion, privacy,
live social integration and other outstanding release gates remain open.
