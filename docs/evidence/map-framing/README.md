# Continent framing and regional map insets — 2026-10-30

## Scope and behavior

All six continents were inspected on the Android emulator in Learn and Find It before changes. The common 864×570 fit plus fixed phone zoom left large empty water areas, particularly for South America and Oceania. North America's Central American/Caribbean picker became a dense label fan.

The play surface now fits primary mainland geometry and country anchors. Remote/crowded locations use real offline regional maps inside the existing map area, with one locator per region instead of a separate long connector for every country. Remaining picker clusters use a single centroid connector. Inset maps expand into a safe-area sheet with an enlarged geographic view with drag/zoom/reset and 48dp choices. Learn shows country names; unsolved quizzes use anonymous numbers. Name It's enlarged region is read-only, with no redundant disabled answer buttons or unguessed country names. Country choices in Find It/Hot & Cold/Learn reuse the existing guarded `onSelect` path and eligible difficulty pool.

| Continent | Adjustment |
|---|---|
| Europe | Mainland fit, distant Atlantic islands in a North Atlantic inset; far Russian/Turkish extents no longer determine the fit |
| Asia | Mainland fit without far eastern Russian extent; Gulf and southeast-island insets |
| Africa | Tighter mainland/Madagascar view; Indian Ocean islands inset |
| North America | Mainland fit instead of letting Alaska/remote rings dominate; Caribbean inset for 13 countries |
| South America | Tall mainland fit instead of the wide shared canvas; distant rings remain available in Whole map |
| Oceania | Larger Australia/PNG/New Zealand view; Micronesia and South Pacific insets |

Visible Zoom out/in and Whole map/Main view controls stay above the insets. Whole map fits every original country ring and marker; Main view restores the mainland fit. No geography, map projection, pack IDs, storage schema, scores or learning facts are changed. Insets are derived display bounds over the same bundled shapes and relief, not new country geometry or online maps. When a source lies beyond the mainland crop, its connector follows its true coordinates and enters from the view edge; it is not moved to a false location.

At browser 390×844 Learn dimensions, the original world-space width was 640 for Europe and 691.2 for the other maps. New main widths: Europe 630.2, Asia 556.4, Africa 564.9, North America 425.2, South America 347.2 and Oceania 445.5. This gives roughly 24% larger Asia, 22% Africa, 63% North America, 99% South America and 55% Oceania geometry at the same screen width. These are projection-scale comparisons, not measurements of land pixel coverage or performance. Europe primarily gains the separate island view and useful framing rather than a large scale increase.

Maps-tab previews also follow each continent's proportions rather than always using the same wide thumbnail. Short/large-text play layouts retain compact expandable inset cards and scrollable enlarged choices.

## Source and automated verification

Baseline source: `d3097fbe0d13012ee8ed90bdffa73043a937b0a4`.
Final runtime source: `a5e9e2259976964cf7e3167f51ad111c9b3a1b22`.

- `npm ci`: PASS before baseline build; no dependency changes in this work.
- `npm run ci`: PASS — TypeScript, ESLint, 202 tests / 46 files.
- `npx expo-doctor`: PASS — 21/21.
- Focused new tests cover every original ring in Whole map at portrait/landscape aspects, every country anchor in the main view or an inset, valid/disjoint regional membership, narrower mainland bounds, small-target focus, retained bounds during pan/zoom, generated SVG ring format, closed-inset quiz secrecy and suppression of empty difficulty regions.
- `npx expo export --platform web --output-dir artifacts/map-framing-web`: PASS.
- Production-export `web-smoke.js`: all six Learn maps; visible zoom, Whole map/Main view restoration on each; Learn selection of Barbados, Palau and Tonga, plus a direct mainland Cuba selection; correct discovery without scored Learn history; regional zoom/drag/reset; read-only anonymous Name It inset followed by correct completion; PL/RU 320×568 dark layouts and regional sheets. External requests blocked. Zero uncaught JavaScript errors in the completed final run.

## Android source/artifact boundary

Build command:

```sh
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home WORLD_MAPS_ARCHITECTURES=arm64-v8a npm run build:android:preview
```

Baseline standalone APK: source `d3097fb…`, SHA-256 `82276f92856246c36e53ba09dfe4dd3103b085ee5d7e7471ed9b17348e6af74b`.
Final standalone APK: source `a5e9e22…`, SHA-256 `e2deb92087785c9c944a1f3148cfe409b5dc5ef159c2e4aea8b731bc123e5c3a`.
Both use embedded JavaScript, arm64 and development signing; trackedChanges=false when packaged. Installed with `adb -s emulator-5554 install -r artifacts/world-maps-preview.apk`. No uninstall or storage clearing.

Native target: verified emulator-5554 (`ro.kernel.qemu=1`), Android API 35, 1080×2400, gesture navigation, airplane mode. `native-smoke.py` captures all six continents in Learn/Find It, opens every inset, verifies zoom/reset and system Back (including pixel comparison of Caribbean zoom/drag), checks Name It is read-only, opens Hot & Cold's anonymous region controls, pans without submitting a discovery, and samples North America/Oceania at simulated 320×568 with 150% text, dark appearance and three-button navigation. It restores the original map, display size, font, night and navigation settings, and checks XP/restart persistence. PASS: all six map cases plus the resumed small-layout/preservation cases completed on the same final APK. `native-first-pass.json` and `native-result.json` record that boundary. XP stayed at 350, the original Europe choice restored across restart, and size/font/night/navigation settings restored. The installed base APK hash matched the packaged hash.

Native country/answer buttons are not submitted against existing user data. The actual country-selection and completion callbacks are exercised in isolated browser fixtures. Native walkthrough covers rendering, accessible controls, modal/Back behavior and preservation, not audible speech or real screen-reader use.

## Screenshot comparison

| Map | Before | After |
|---|---|---|
| Europe | [before](before-europe-learn.png) | [after](europe-learn.png) |
| Asia | [before](before-asia-learn.png) | [after](asia-learn.png) |
| Africa | [before](before-africa-learn.png) | [after](africa-learn.png) |
| North America | [before](before-north-america-learn.png) | [after](north-america-learn.png) |
| South America | [before](before-south-america-learn.png) | [after](south-america-learn.png) |
| Oceania | [before](before-oceania-learn.png) | [after](oceania-learn.png) |

Curated additional screenshots capture regional sheets, quiz anonymity, and small-screen dark/large-text layouts. Extra run screenshots and raw UI XML stay under ignored `artifacts/map-framing-extra` and `artifacts/map-framing-native`; build logs remain temporary.

## Explicit remaining limits

No physical Android, iOS, actual screen-reader, audible audio or native pinch proof is claimed. Pan and button zoom are covered; the existing pinch implementation is retained. Screen-size/theme samples are not an exhaustive device matrix. This work does not resolve unrelated preference-recovery/audio findings from the prior usability review, or change the optional social foundation.
