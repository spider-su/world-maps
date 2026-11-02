# Current World Maps POC acceptance checklist — 2026-11-02

This is the **current** product acceptance list. See [implementation/status evidence](implementation-status.md) for source checks, deployments and recorded runtime results. Earlier 2026-10-25 POC reports and emulator build hashes are historical snapshots, not evidence that newer features have passed device acceptance.

## Current scope

- [x] Six offline selectable continent maps: Europe (47), Asia (50), Africa (54), North America (23), South America (12), Oceania (14)
- [x] Four primary modes: Hot & Cold, Find It, Name It, Learn; Find It name/capital/flag/mixed clues and Name It country/capital variants
- [x] EN/PL/RU interface, country names and capital names (editorial overlay for 127 new continent capitals); spoken names depend on installed voices
- [x] Light and dark appearance, map-first navigation, accessibility controls, Library country collection and Profile
- [x] Local history, adaptive practice, explorer XP/achievements, continent choice, quiz variants and preferences across relaunches
- [x] Optional internet-loaded Wikipedia imagery with attribution; offline maps, facts, flags and gameplay
- [x] Optional offline music for all six continents, separate quiz sound effects and a 0–30% slider, off by default
- [x] Continent fitting/regional insets, globe pins with shared details and explorer hair/eye customization
- [x] Optional Friends consent/auth/snapshot sync, QR rendering/scanner, share URLs and explicit Profile approval (implementation; live and device gates below)

## Before sharing the next APK with testers

- [ ] Run `npm ci`, `npm run ci`, `npx expo-doctor` on the exact revision being packaged
- [ ] Produce a **new standalone APK with embedded JS** and record Git SHA / APK hash; do not reuse 2026-10-25 artifact evidence
- [ ] Fresh install, airplane mode: test Home, Maps, Library, Profile, Settings and all six continent maps
- [ ] Restart after selecting **Oceania** and Find It **Flag** + Name It **Capital**; verify all selections restore, including after update-over-install
- [ ] Check English / Polish / Russian capital names and speaker prompts for all regions; no Latin-script Russian capitals outside intentional abbreviations
- [ ] Mixed Find It flag prompts must not expose the answer through pronunciation before solving
- [ ] Verify Learn country photo fallback while offline; invalid online photo must not block facts or navigation
- [ ] Verify music starts only when enabled and Learn is in focus, changes with continent, pauses for voice/background and stops when leaving
- [ ] Verify quiz effect toggle independently; correct-vs-first-try cue once per completed round, none for mistakes or Learn taps
- [ ] Validate light **and dark** modes, small screens, large fonts, screen readers, gesture + button navigation and map controls
- [ ] Force storage read/save errors and retry; confirm no silent loss of canonical v4 quiz history, country discoveries or preference changes
- [ ] Test on physical Android with media volume (previous music audibility issue); document device model and OS
- [ ] Test iOS separately; Android APK success does not validate iOS

## Optional online features and release gates

- [ ] Complete successful main CI/APK + Hosting deployment; verify root, `/friend`,
  downloadable APK digest and Android domain association (currently 404/skipped in the status snapshot).
- [ ] Test a real phone's QR decode, permission denial/retry, cold/warm links,
  install → return to invite, explicit approval, two-account acceptance and failure states.
- [ ] Verify social opt-out deletes the shared snapshot and test acknowledgement
  reconciliation; do not advertise cloud-save restoration, full deletion or remove/revoke UI.
- [ ] Finish and test account deletion and public privacy/support requirements before public accounts.

## Pre-release data contract

Canonical progress schema v4 is the supported format. Existing keys and pack IDs
remain stable. Older experimental schemas are rejected through read-error handling;
there is no automatic migration. Never clear user/tester storage to make a test pass.
Use a separate fresh test profile/install for clean-state cases, and verify ordinary
restart and update-over-install preserve established v4 records. A future schema
change requires a separately tested migration.

## Evidence status

Automated source checks are necessary but not sufficient. Historical emulator and browser runs are documented in [poc-testing.md](poc-testing.md). Fresh native-device audio, updated APK smoke and iOS results must be captured independently; unchecked items are **not** claims of failure or completion.

See [continent coverage](continent-maps.md), [music behavior](music-prototype.md), [Learn and collection](explore-collections-profile.md), [game contract](geography-game-draft.md), and [release checklist](release-checklist.md).

## Owner physical Android test — historical evidence

Owner confirmed on **2026-11-01** that a prior Android APK installed on a physical phone and the primary quiz end-to-end scenario completed successfully. Mark that historical **install + main flow PASS (owner-reported)**, not a new/current candidate pass. No original build SHA, date, device or OS details supplied. All unchecked feature-specific acceptance tests above remain pending for the exact current release candidate.
