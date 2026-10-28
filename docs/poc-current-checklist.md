# Current World Maps POC acceptance checklist — 2026-10-28

This is the **current** product acceptance list. Earlier 2026-10-25 POC reports and emulator build hashes are historical snapshots, not evidence that newer features have passed device acceptance.

## Current scope

- [x] Five offline selectable continent maps: Europe (47), Asia (50), Africa (54), South America (12), Oceania (14)
- [x] Four primary modes: Hot & Cold, Find It, Name It, Learn; Find It name/capital/flag/mixed clues and Name It country/capital variants
- [x] EN/PL/RU interface, country names and capital names (editorial overlay for 127 new continent capitals); spoken names depend on installed voices
- [x] Light and dark appearance, map-first navigation, accessibility controls, Library country collection and Profile
- [x] Local history, adaptive practice, explorer XP/achievements, continent choice, quiz variants and preferences across relaunches
- [x] Optional internet-loaded Wikipedia imagery with attribution; offline maps, facts, flags and gameplay
- [x] Optional offline music for all five continents plus separate quiz sound effects, off by default

## Before sharing the next APK with testers

- [ ] Run `npm ci`, `npm run ci`, `npx expo-doctor` on the exact revision being packaged
- [ ] Produce a **new standalone APK with embedded JS** and record Git SHA / APK hash; do not reuse 2026-10-25 artifact evidence
- [ ] Fresh install, airplane mode: test Home, Maps, Library, Profile, Settings and all five continent maps
- [ ] Restart after selecting **Oceania** and Find It **Flag** + Name It **Capital**; verify all selections restore, including after update-over-install
- [ ] Check English / Polish / Russian capital names and speaker prompts for all regions; no Latin-script Russian capitals outside intentional abbreviations
- [ ] Mixed Find It flag prompts must not expose the answer through pronunciation before solving
- [ ] Verify Learn country photo fallback while offline; invalid online photo must not block facts or navigation
- [ ] Verify music starts only when enabled and Learn is in focus, changes with continent, pauses for voice/background and stops when leaving
- [ ] Verify quiz effect toggle independently; correct-vs-first-try cue once per completed round, none for mistakes or Learn taps
- [ ] Validate light **and dark** modes, small screens, large fonts, screen readers, gesture + button navigation and map controls
- [ ] Force storage read/save errors and retry; confirm no silent loss of quiz history, country discoveries or preference changes
- [ ] Test on physical Android with media volume (previous music audibility issue); document device model and OS
- [ ] Test iOS separately; Android APK success does not validate iOS

## Evidence status

Automated source checks are necessary but not sufficient. Historical emulator and browser runs are documented in [poc-testing.md](poc-testing.md). Fresh native-device audio, updated APK smoke and iOS results must be captured independently; unchecked items are **not** claims of failure or completion.

See [continent coverage](continent-maps.md), [music behavior](music-prototype.md), [Learn and collection](explore-collections-profile.md), [game contract](geography-game-draft.md), and [release checklist](release-checklist.md).
