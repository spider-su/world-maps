#!/usr/bin/env bash
set -euo pipefail
# Standalone development-signed preview; never a store/release signing workflow.
export CI="${CI:-1}"
export EXPO_NO_TELEMETRY=1
npx expo prebuild --platform android --no-install
# Print the certificate actually configured for the preview APK.
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep -E 'SHA1:|SHA256:'
(
  cd android
  ./gradlew --no-daemon assembleRelease "-PreactNativeArchitectures=${WORLD_MAPS_ARCHITECTURES:-arm64-v8a,x86_64}"
)
mkdir -p artifacts
cp android/app/build/outputs/apk/release/app-release.apk artifacts/world-maps-preview.apk
unzip -Z1 artifacts/world-maps-preview.apk | grep -Fx 'assets/index.android.bundle' > /dev/null
node scripts/preview-metadata.mjs
