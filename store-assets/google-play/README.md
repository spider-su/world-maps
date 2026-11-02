# Google Play listing assets

This package contains existing product branding and genuine Android Emulator screenshots. No application screen was generated or reconstructed. This is a listing package, not proof of production release readiness.

## Files and validation

- `icon-512.png`: 512 × 512, RGBA PNG, ≤1 MiB.
- `feature-graphic-1024x500.png`: 1024 × 500, opaque RGB PNG, ≤15 MiB.
- `phone/phone-*.png`: 1080 × 1920, opaque RGB PNG, ≤8 MiB each, ordered for upload.
- `screenshots.json`: per-screen source SHA, APK hash/version/build, capture time, emulator, transformations and review.
- `validation.json`: exact image dimensions, byte sizes, hashes and copy character counts.
- `store-listing.md`: publication copy. `listing.json` is its editable generation source.

Run from the repository root with Python 3.9+ and Pillow 11.3.0:

```sh
python3 scripts/store_assets.py render
python3 scripts/store_assets.py validate
```

Render reuses the configured source icon/artwork. macOS Arial or Linux DejaVu fonts are supported; set `STORE_FONT` and `STORE_FONT_BOLD` for reproducible custom font paths. Existing artwork provenance and license notices remain in the source asset directories. Rendering is local; no image-generation service is used.

## Recapture

Use a dedicated API 35+ ARM64 emulator. Do not erase existing profiles or clear user data. Install the source-matched standalone APK, navigate the real app, dismiss transient messages, wait for loading/animations and check the foreground. Configure a native 1080 × 1920 display for the Expo apps. Rescue Team uses a documented crop of its 1080 × 2400 framebuffer to remove system bars and empty margins while retaining the complete 1080 × 1920 game surface.

```sh
python3 scripts/store_assets.py capture --serial EMULATOR_SERIAL \
  --apk /path/to/source.apk --source-sha FULL_APK_SOURCE_SHA \
  --build-url BUILD_EVIDENCE_URL --name 'Screen description'
```

Put ADB and aapt on PATH, or supply `--adb` and `--aapt`. The script refuses physical devices and a mismatching APK package, preserves raw captures under ignored `raw/`, and appends to the manifest. For a fresh capture set, archive the previous `phone/` and manifest together; do not mix screenshots from different sessions accidentally. Review each new image and set its `visual_review` to `pass` only after checking actual content. Raw files, APKs, emulator state and credentials are intentionally excluded from Git.

Automated validation checks image decoding, format, dimensions, size limits, near-blank images, duplicate screens, hashes, review status and copy limits. Human review additionally checks personal information, debug overlays, current branding and source-feature correspondence. Those semantic checks cannot be proven by Pillow statistics. All phone screenshots remain subject to final publisher inspection in Play Console.

## Manual upload

1. Open Play Console and select the app by its exact package ID (in `listing.json`).
2. Open **Grow users → Store presence → Main store listing** (some Console versions show **Store listings → Edit default listing**).
3. Select Polish (Poland) for Ryczałt or English (United States) for the games. Paste Title, Short description and Full description from `store-listing.md`.
4. In Graphics, upload `icon-512.png` as the app icon and `feature-graphic-1024x500.png` as the feature graphic.
5. Upload the files in `phone/` in numeric order under Phone screenshots. Use each manifest screen description as concise alt text; inspect previews and ordering.
6. Save the listing. Review Publishing overview and any Console validation messages. Submit changes for review only when the publisher has completed the separate release gates.

Do not upload the JSON, README, raw captures or GitHub artifact ZIP as listing images. Privacy policy URL, Data Safety, audience/content rating, app access, support details and the signed AAB/test track are separate Console tasks. Existing policy drafts must be completed against the actual release; listing assets do not resolve those gates.

Specifications checked against [Google Play preview asset guidance](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en) on 2026-11-02. This package uses 9:16 images to satisfy both the maximum 2:1 edge ratio and the recommended portrait format.

## Capture and checks

- Source: `e24360f95c809832c26907ddc0678b1e17cc490a`; [successful source Mobile CI/APK](https://github.com/spider-su/world-maps/actions/runs/41487483602), artifact `world-maps-preview-apk`.
- APK: standalone development-signed preview, version 1.0.0 / code 1, arm64-v8a and x86_64, embedded JS bundle. The installed APK hash is checked against the local artifact by the capture tool.
- Emulator: dedicated `play-store-assets-api35`, serial `emulator-5560`, Pixel 7-equivalent ARM64, Android 15 / API 35, 1080 × 1920 override / 320 dpi, English, SwiftShader, no audible output. Capture date: 2026-11-02. Android System UI demo broadcasts clean the status bar; app content is unmodified.
- Test data: fresh isolated installation, one country discovery and two real correct quiz answers; XP/profile values were earned through UI interaction. No social account or personal data was entered. Country photos were not opened.
- Local checks: `npm run ci` PASS (typecheck, lint, 54 test files / 243 tests); `npx expo-doctor` PASS (21/21).
- Release limits: Friends/account deletion and policy/deployment work remain separate gates; no social features are promoted or captured. Optional online photographs are described accurately and core offline functionality is distinguished from them. Physical Android, audio and Play upload acceptance remain unverified by this emulator-only evidence.

### Verified image inventory

| File | Dimensions | Bytes |
| --- | --- | ---: |
| `icon-512.png` | 512 × 512 | 72191 |
| `feature-graphic-1024x500.png` | 1024 × 500 | 478040 |
| `phone/phone-01.png` | 1080 × 1920 | 299514 |
| `phone/phone-02.png` | 1080 × 1920 | 511886 |
| `phone/phone-03.png` | 1080 × 1920 | 195169 |
| `phone/phone-04.png` | 1080 × 1920 | 254123 |
| `phone/phone-05.png` | 1080 × 1920 | 761057 |
| `phone/phone-06.png` | 1080 × 1920 | 124040 |

Copy character counts: title: 10, short_description: 76, full_description: 1314.
