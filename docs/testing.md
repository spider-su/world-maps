# Testing World Maps

## Commands and what they establish

Use installed dependencies when unchanged; run `npm ci` for a clean workspace or
changed lockfile. `npm run ci` runs TypeScript, ESLint and Vitest. `npx expo-doctor`
checks Expo/project compatibility. `bash scripts/agent-validate.sh` is the clean
Orchestrator entry point and always performs a locked install first.

Mobile CI checks PRs and main/develop pushes. Its Android APK job runs for branch
push/manual dispatch, **not PR events**; a skipped PR APK is not Android build proof.
A cancelled run is not PASS. Hosting consumes only a successful main CI run and
verifies the source/digest/certificate of its artifact before publication.

## Automated coverage

| Boundary | Existing tests | What is still outside that proof |
| --- | --- | --- |
| Rules and map content | `engine`, `modes`, `variants`, `maps`, `difficulty`, `learning`, distance/data/localization tests | Complete real screen/provider navigation and device hit-testing |
| Saved progress and preferences | `progress`, `progressStore`, `explorerAppearance`, music store and quiz preference tests | Full provider/UI restore/race/retry orchestration, OS backup and physical upgrades |
| Presentation contracts | `EuropeMap`, `CountryPath`, `CountryInfoCard`, `ModeSelector`, `FriendsPanel` SSR tests | Layout pixels, gestures, focus, mounted effects, live camera or actual network actions |
| Globe and insets | `globe`, `globeSelection`, `mapPresentation`, viewport/picker/selection tests | Real touch/pinch, screen-reader gestures and physical small-country usability |
| Social summaries | `socialProfile`, `socialSync`, `socialSession` | Real Firebase Auth/Firestore/Functions behavior and cross-device reconciliation |
| Social/hosting boundaries | Invitation parsing/expiry, callable response errors, config and hosting artifact validation | Full server expiry/replay/atomicity/rules tests and public HTTPS deployment |

`socialSession.test.ts` exercises the actual coordinator with mocked SDK/storage
boundaries: opt-out and signed-out short-circuiting, timestamp-insensitive change
checks, per-account keys, acknowledgement ordering and failure/retry behavior.
It does not prove concurrent uploads are serialized, remote deletion reconciliation,
background retries or a durable outbox—none is implemented by this coordinator.

`needsFriendFetch` tests cover a pure policy helper; runtime `listFriends` does not
use revision caching. `socialError` tests cover a helper no longer called by the
current FriendsPanel; player-facing error mapping is local to that panel. Neither
suite should be cited as end-to-end UI or live-network acceptance.

[Issue #41](https://github.com/spider-su/world-maps/issues/41) remains open for
Home → mode → answer → completion → Next/Back, provider remount/persistence recovery
and LanguageProvider races. Existing pure integration/store tests and SSR are not
substitutes for the requested mounted screen/provider suite.

## Browser and device evidence

Production Expo export is a build check. Browser scripts under `docs/evidence/`
record a separate interaction run; they are not automatically run by `npm run ci`.
The Profile sharing fixture explicitly mocks account/cloud services and decoded-QR
handoff; the separate Hosting emulator test checks rewrites/static downloads.
These tests do not accept a real invitation between real Firebase accounts.

Record source commit, artifact SHA-256, command, platform/device/OS and date for a
native run. Use the Android/iOS skills in `.codex/skills/` for relevant runtime work.
Keep browser, Android emulator, physical Android, iOS Simulator, physical iOS,
audible audio and screen-reader results distinct. Camera permission/loading UI
on a pattern-camera emulator is not optical QR decoding or preview-ready proof.

Never clear saved app data to make a test pass. Use isolated browser storage, a
separate test device/AVD or a disposable Android test profile when fresh state is
needed. Preserve and restore original map/settings, and verify progress after
update-over-install. Do not pass fixture tokens to live acceptance endpoints.

Current command results and release-run links live in
[implementation status](implementation-status.md); historical evidence keeps its
original metrics and source identity. Unchecked release gates remain unchecked.
