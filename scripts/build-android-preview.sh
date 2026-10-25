#!/usr/bin/env bash
set -euo pipefail
# Standalone development-signed preview; never a store/release signing workflow.
export CI="${CI:-1}"
export EXPO_NO_TELEMETRY=1
npx expo prebuild --platform android --no-install
(
  cd android
  ./gradlew --no-daemon assembleRelease "-PreactNativeArchitectures=${WORLD_MAPS_ARCHITECTURES:-arm64-v8a,x86_64}"
)
mkdir -p artifacts
cp android/app/build/outputs/apk/release/app-release.apk artifacts/world-maps-preview.apk
unzip -Z1 artifacts/world-maps-preview.apk | rg -q '^assets/index.android.bundle$'
node scripts/preview-metadata.mjs
