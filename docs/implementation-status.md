# Current implementation and evidence — 2026-11-02

Reviewed against released `main` **409a678** (PR #85), which includes the Profile
sharing/QR work from PR #84. This is an evidence snapshot, not a promise that live
services or future builds remain in this state. See [roadmap](poc-roadmap.md) for work
priorities and [testing](testing.md) for coverage boundaries.

## Product state

| Area | Implemented behavior | Remaining gate |
| --- | --- | --- |
| Offline core | Six packs (47/50/54/23/12/14), four modes, variants, difficulty/practice, EN/PL/RU, local v4 progress | Full screen/provider regression; exact-candidate device checks |
| Map/UI | Shared Blue Marble relief, land fit, regional insets, safe-area shell, Library, Profile, hair/eye editor | Physical small-target/gesture/accessibility checks |
| Globe | Rotation, fixed geographic pin, Learn-style details, ocean/unsupported coordinates | Physical touch/screen-reader/iOS checks; no claim of precise border coverage |
| Details/photos | Offline facts/flags; Learn and globe details expand credited online photos; Library opt-in | Exact-candidate online/offline/retry and attribution review |
| Audio | Bundled six-region Learn music, independent quiz cues, 0–30% slider, speech priority | Audible hardware and interruption/failure recovery acceptance |
| Friends | Consent, Google/email auth, aggregate snapshots, QR/scanner/share, Profile approval and cold/warm app links | Real two-account/rules/App Check/optical-scan tests; deletion/reconciliation and UI gaps |
| Public distribution | Static landing/download files and main-artifact Hosting pipeline | Hosting still unavailable; verified install/download/HTTPS flow pending |

Core gameplay needs neither Firebase nor an account. Optional photos, Friends and
public downloads use the network. Startup parses incoming links locally; Firebase
initializes only through opted-in social use. Cloud summaries are not progress backup.

## Release/deployment snapshot

| Check | Observed result |
| --- | --- |
| [Main Mobile CI, run 41412596745](https://github.com/spider-su/world-maps/actions/runs/41412596745) at 409a678 | **CANCELLED** during checks / Expo Doctor; Android job cancelled. No successful current-main APK proof from this run. |
| [Firebase friends deployment, run 41412596806](https://github.com/spider-su/world-maps/actions/runs/41412596806) at 409a678 | **SUCCESS** reported by deployment workflow. This is not a two-account acceptance or rules-integration test. |
| [App landing deployment, run 41412774894](https://github.com/spider-su/world-maps/actions/runs/41412774894) | **SKIPPED**, consistent with its successful-main-Mobile-CI prerequisite. |
| `curl` checks of `https://world-map-1.web.app/` and `/friend` | **404** on 2026-11-02. Do not describe the public download or browser fallback as live. |
| Hosting deploy permission | Missing for the CI deploy identity in the 2026-11-01 inspection; recheck before release. That historical observation is not a new IAM audit. |

No deployment, IAM grant, workflow rerun or merge is performed by the documentation
alignment task. The source/deployment distinction is intentional.

## Existing runtime evidence

- [Map framing](evidence/map-framing/README.md): six-map browser and Android checks,
  regional zoom/drag, small/large-text/dark/navigation layouts at the recorded source.
- [Globe pins](evidence/globe-pin/README.md): browser interaction, Android taps,
  pin/ocean/country details and saved-progress preservation at `8fde8a2`.
- [Profile sharing](evidence/profile-sharing/README.md): local source checks,
  mocked delayed-backend browser flows, Hosting emulator and Android app-link/share
  checks at `e4945d5`. Camera permission/loading UI was captured; preview readiness
  and physical optical decoding were not established.
- [Learn photo defaults](evidence/learn-photos/README.md): source-specific expansion,
  collapse/reopen and Library opt-in checks. Its documented emulator discovery
  side effect must not be hidden by describing all historical runs as data-neutral.
- Owner report on 2026-11-01: an earlier physical Android build installed and the
  primary quiz flow completed. Artifact, device/OS and original test date were not
  supplied. This does not complete current-candidate feature acceptance.

These records retain their own source SHAs, APK hashes and limitations. None is
fresh physical Android, iOS or screen-reader proof for 409a678 or this docs/test change.

## Validation for this alignment

Validated locally on 2026-11-02, using existing installed dependencies (no lockfile
or dependency changes):

- `npx vitest run src/features/social/socialSession.test.ts`: **PASS**, 8 tests.
- `npm run ci`: **PASS**, TypeScript, ESLint, 243 tests / 54 files.
- `npx expo-doctor`: **PASS**, 21/21 checks.
- `git diff --check` and local Markdown file-link audit: **PASS**.

Only documentation, environment-example commentary and tests change; no new native
compatibility claim is made. No emulator, physical-device, iOS or screen-reader
run was performed for this alignment. Deployed services are not exercised by the
mocked social-session unit tests.

## Subsequent emulator and release-artifact evidence

The [2026-11-02 emulator smoke](evidence/emulator-smoke-2026-11-02/README.md)
now supplies fresh source-matched API 35 screenshots, bounded functional checks,
read-error recovery and exact owner-data preservation. It found two UI failures;
physical-device, iOS, screen-reader, optical QR and live social acceptance remain
unverified. The [separate signed AAB](evidence/release-bundle-2026-11-02/README.md)
passes structural/signature checks, but was not runtime-tested or uploaded to Play.
These later results do not retroactively change the earlier deployment snapshot.
