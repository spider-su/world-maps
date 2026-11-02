# World Maps

Offline geography learning built with Expo SDK 57 / React Native 0.86, originally
bootstrapped from [mobile_template](https://github.com/spider-su/mobile_template).
The core game needs no account or network. Friends sharing and country photographs
are optional online features.

## Current app

- Six bundled packs: Europe (47), Asia (50), Africa (54), North America (23),
  South America (12), Oceania (14). Shared country IDs count once for discoveries.
- Four modes: Hot & Cold, Find It, Name It and Learn. Find It supports country,
  capital, flag or mixed clues; Name It supports country or capital answers.
- EN/PL/RU names, capitals and controls; light/dark appearance; installed-voice speech.
- Home, Maps, Library, Profile and Settings tabs. A full-screen game and globe hide
  tabs and own their safe edges; modals own their edges separately.
- Canonical v4 local progress, up to 100 retained completed sessions, cumulative
  learning, adaptive/random practice, XP, achievements and explorer customization.
- Optional bundled regional Learn music, independent quiz sounds and a 0–30% volume slider.

Choose the map on Home or Maps. Difficulty is adjusted in Maps: Easy uses the seven
largest projected outlines, Normal includes at least two thirds of each pack and
all Easy targets, and Difficult includes all locations. Learn includes everyone.
Both practice modes avoid up to four recent eligible targets, capped at half the
pool; North America Normal contains 16 of 23 countries.

All six Learn/Maps previews share offline NASA Blue Marble relief, while quizzes
use political fills. Maps fit the primary land bounds; regional insets provide
larger island/crowded-country views. Zoom and Whole map/Main view remain visible.
Quiz names stay hidden until the existing guessed/completed reveal rules allow them.

Learn and Library share country facts, flags, capitals, landmarks, pronunciation
and attributed online photos. Learn details expand photos by default; Library
loads photos after Show photos. Compact country cards remain offline. Unavailable
photos have loading/error/retry UI and do not block facts or navigation.

Profile derives global XP and six achievements from local learning/discoveries.
Three explorers share earned outfits, with simple hair/eye color editing. Library
supports localized country/capital search and an Undiscovered filter. Opening a
country in Learn or Library records discovery; a correct quiz answer is separate.

Home's full-screen globe supports drag, web scrolling, direction/reset controls
and keyboard/accessibility alternatives. A tap drops a pin and opens Learn-style
country details; oceans and unsupported areas show coordinates. The pin moves with
rotation and hides on the far hemisphere. Globe use does not award discovery or XP.

## Friends and sharing

Profile offers explicit sharing consent, email/password or Google sign-in, My QR,
Scan QR, a secondary invitation-link input, and Add friend approval. Async actions
show loading feedback. Cold/warm invitation links open Profile and scroll to the
approval card; scanning never accepts a friendship automatically. The camera is
requested only for scanning. Native share includes the invitation or download URL.

Only the chosen nickname, explorer ID and aggregate progress summary are shared.
Local quiz records remain on-device. Friends are foreground snapshots, not live
presence or cloud-save restoration. Account deletion, remove/revoke UI, last-updated
presentation and robust reconciliation remain release gaps; see
[Friends implementation and limits](docs/firebase-friends.md).

The app/download page and Android HTTPS association are prepared in `firebase/hosting`.
Publishing depends on a successful **main Mobile CI APK** and Hosting deployment.
**At the 2026-11-02 check, `/` and `/friend` still returned 404:** main CI was cancelled
and its downstream Hosting job skipped. Merged source is not a deployed download.
See [current status and evidence](docs/implementation-status.md).

## Development and validation

```sh
npm ci                 # fresh checkout or changed dependencies
npm run ci             # TypeScript, ESLint, Vitest
npx expo-doctor
npx expo start --web
```

Use existing installed dependencies when the lockfile has not changed.
`bash scripts/agent-validate.sh [--baseline-sha COMMIT]` is the clean-workspace
Orchestrator entry point; it performs a locked install and the same checks.
Mobile CI runs source checks for PRs; branch pushes to main/develop or manual
workflow dispatch also build a standalone Android preview. PR APK jobs are skipped.

With JDK 17 and Android SDK, `npm run build:android:preview` creates
`artifacts/world-maps-preview.apk` and `preview-metadata.json`. It embeds JS, uses
**development signing** and needs no Metro. Local architecture can be limited with
`WORLD_MAPS_ARCHITECTURES=arm64-v8a`; CI defaults to arm64-v8a + x86_64. Native
Firebase configuration follows [deployment setup](docs/firebase-github-deploy.md).
This is not a Google Play AAB or a store-signed release.

Identity is `world-maps` / `com.spidersu.worldmaps`; public config and environment
settings must match this app. Preserve native/web SVG adapters, speech queue,
gesture guard, serialized writes and storage keys. Unsupported experimental progress
schemas trigger a read error; there is no legacy migration. Never clear saved data
to make a test pass. Restart and update-over-install must preserve canonical v4.

[Testing coverage](docs/testing.md) separates unit/SSR tests from browser, emulator,
physical-device and iOS evidence. Old test counts and APK hashes remain attached to
the revisions they actually checked; they do not prove current release readiness.

## Project references

- [Current implementation and operational status](docs/implementation-status.md)
- [Roadmap](docs/poc-roadmap.md), [POC acceptance](docs/poc-current-checklist.md),
  [release checklist](docs/release-checklist.md), [historical POC record](docs/poc-roadmap-history.md)
- [Game contract](docs/geography-game-draft.md), [learning](docs/country-learning.md),
  [progression](docs/explorer-progression.md), [Library/details](docs/explore-collections-profile.md)
- [Architecture](docs/architecture.md), [component catalog](docs/component-catalog.md),
  [component ledger](docs/component-ledger.md)
- [Continent coverage](docs/continent-maps.md), [data attribution](docs/country-data.md),
  [atlas sources](docs/atlas-data.md), [photo attribution](docs/wikipedia-gallery.md)
- [Privacy-policy draft](docs/privacy-policy.md) — owner/release approval and a public URL are pending.
