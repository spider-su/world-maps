# World Maps release checklist

## Source and configuration
- [ ] Review app.config.ts, .env, app icon and permissions; core gameplay needs no permission; optional QR scanning requests camera access, not microphone/media access
- [ ] Confirm no credentials, signing keys or personal data are committed
- [ ] Run `npm ci`, `npm run ci` and `npx expo-doctor`
- [ ] Run a production web export (`npx expo export --platform web`)

## Canonical data contract
- [ ] Confirm the exact candidate uses canonical progress schema v4 and record its source SHA
- [ ] Use an isolated fresh profile/install for clean-state tests; preserve existing data and verify unsupported schemas block reads instead of claiming migrations
- [ ] Verify fresh install, force-stop, restart and update-over-install retain canonical v4 progress

## Device acceptance
- [ ] Validate continent and Find It/Name It variant preferences survive force-stop and app upgrade
- [ ] Check all six maps, Polish/Russian capital localization, and both dark/light appearances
- [ ] Check offline region music previews and optional quiz sounds on real hardware (media volume, focus, speech priority)
- [ ] Use [current POC checklist](poc-current-checklist.md) for detailed feature-by-feature regression checks

- [ ] Run `.codex/skills/ios-simulator-smoke/SKILL.md` on macOS/Xcode; record iOS Simulator evidence separately from real-device testing
- [ ] Build `npm run build:android:preview` and launch the APK offline (airplane mode)
- [ ] Confirm preview APKs are for install testing; Google Play uploads require a correctly signed release AAB
- [ ] Keep the Android package name and upload signing identity stable; increment versionCode for every new Play upload
- [ ] Install the new build over the previous one without uninstalling; verify scores, learning records, language and voice settings survive
- [ ] Play all four modes, all difficulty levels and adaptive/random practice
- [ ] Tap countries and small-country alternatives; pan and pinch without accidental guesses
- [ ] Test Android gesture and three-button navigation and system insets
- [ ] Test large font scaling, screen reader labels and a small screen
- [ ] Verify EN/PL/RU text, speech controls and persistence after process restart
- [ ] Verify recovery from unreadable saved progress (retry, no data loss)
- [ ] Capture device model, OS version, artifact SHA and date in the PR

## Friends and public download

- [ ] Confirm main source checks and Android APK succeeded; a cancelled run or skipped PR APK is not candidate proof.
- [ ] Deploy Hosting from that successful main artifact; verify `/friend`, download digest/signing certificate and `.well-known/assetlinks.json`.
- [ ] Verify Android HTTPS opening with the exact installed certificate and a real camera scan; retain explicit Profile acceptance.
- [ ] Test App Check/Auth/rules with two accounts, expired/replayed invites and concurrent acceptance.
- [ ] Verify removal/revocation/account deletion and local-acknowledgement reconciliation before claiming those flows available.
- [ ] Validate truthful photo/camera/account/network disclosures; current deployment state is in [implementation status](implementation-status.md).

## Distribution (only if applicable)
- [ ] Verify unique app IDs, version and signing configuration
- [ ] Verify release build, privacy policy, support link and store metadata
- [ ] Test the exact release artifact before distributing

## Historical owner-confirmed Android smoke test (reported 2026-11-01)

**PASS (owner report):** an earlier Android build was installed on a physical device and the main geography-quiz end-to-end flow completed. Device, OS, exact commit/build hash and original test date were not recorded. This supplements 2026-10-25 emulator evidence; it does **not** prove the current Firebase/social, music, collection, UI or store release candidate. Maintain all candidate-specific unchecked gates above.

## Publication, privacy and third-party rights

- [ ] Verify current social/Firebase behavior against [firebase-friends.md](firebase-friends.md): opt-in, authentication, real network transfers, deployed functions, invitation security, profile deletion and consent withdrawal; do not claim offline-only network behavior for social-enabled releases.
- [ ] Finalize and publish the **one** [privacy-policy draft](privacy-policy.md), reflecting optional remote Wikipedia images and actual Firebase/Auth/Firestore/function/analytics usage. Confirm publisher identity, retention, deletion contact and a public URL; complete Play Data safety and account deletion requirements if accounts are enabled.
- [ ] Reuse existing [country data](country-data.md), [atlas attribution](atlas-data.md), and [artwork provenance](licenses/home-artwork.md) instead of duplicating licenses. Preserve the repository MIT license and embedded third-party notices; check all new media assets.
- [ ] Verify store audience/children declarations, permissions, support contact, screenshots, app rating, signed AAB and exact candidate installation/update.
- [ ] Do not mark publication-ready solely from this historical user test.

## Google Play App content — declaration worksheet (2026-11-02, draft)

Applies to `com.spidersu.worldmaps`. This is **not** evidence that Console declarations have been submitted. Reconcile any subsequent Firebase/social changes and the **exact signed AAB** before committing answers.

| Play Console item | Proposed answer / action | Evidence or unresolved decision |
| --- | --- | --- |
| Privacy policy URL | **Pending:** approve and host existing [privacy policy draft](privacy-policy.md) as a public read-only HTTPS page linked in app | Include Firebase/Google login, camera-based QR invitations, Wikimedia imagery, account/data deletion, publisher and contact |
| Ads declaration | **No ads identified** | No ads SDK in inspected package dependencies; inspect final AAB and UI for any new advertisements |
| App access | **Core quizzes public; Friends restricted by optional login** | If login is needed for review, provide test credentials or usable reviewer access instructions in Console; don't claim all app features are accessible without sign-in |
| Target audience | **Owner decision required** | Education game may appeal to children, but Firebase accounts, Google sign-in, QR camera and remote imagery change Families-policy implications; do not choose 13+ solely to avoid child protections if children are actually targeted |
| Content rating | **Submit actual interactive questionnaire** | Geography quizzes and social friend profiles; consider nickname/user content and communications accurately; no automatic age rating |
| Data safety | **Cannot safely answer 'No data collected' while social sign-in is enabled** | Auth processes email/UID/sign-in information; Firestore handles opt-in nickname/ID/XP/counts/badges, friend graph and invitation state; Firebase App Check and Google sign-in may process technical identifiers; image hosts see network metadata |
| Account deletion | **Release blocker when account creation is offered** | Existing documentation says complete Firebase user, profile, relationship and invitation deletion plus public web deletion URL remains unfinished |

### Data Safety inventory to confirm against live Firebase and exact app bundle

- Offline local: quiz history, learning progress, discovered countries, badge records, audio/voice/language preferences. Do not assert the raw history is uploaded; currently planned public snapshot excludes raw attempts, country IDs and voice preference.
- Optional online: Firebase Auth email and account ID (Google sign-in and email/password), optional nickname, public summary progress (XP/level/discovery/mastered counts/badge IDs/timestamp), friends/invitation tokens, sign-in/security and App Check diagnostic identifiers. Verify which categories Google assigns to each (personal info, app activity, identifiers) and distinguish collection from developer sharing.
- Network fetches: credited Wikimedia images and Firebase Hosting invitation/download pages; inspect request metadata and hosted logs. Camera QR scanning is on-device according to the documented implementation; confirm the release does not upload photos/videos.
- Verify encryption in transit, data retention, account deletion, optional collection and whether any SDK purpose requires disclosure. Do not guess affirmative/negative flags without build/server proof.

### User access, safety and release gates

- [ ] Publisher confirms actual intended age groups and any Families/child-directed obligations
- [ ] Audit sign-in/QR/Firebase service state and provide functioning reviewer instructions or restricted test-account credentials
- [ ] Implement in-app **and external web** account deletion request flows; verify Firebase Auth account, profile, friend edges and invitations cleanup (or disable account creation/social in this release)
- [ ] Finalize privacy policy, public HTTPS URL, in-app link and verified publisher/support contact
- [ ] Submit ads declaration, audience/content, rating and Data Safety based on the actual signed AAB; retain dated evidence
- [ ] Verify camera and network disclosure, Play SDK Index, signing and production manifest
- [ ] Record release SHA/version, public policy/deletion URLs and approved Console declarations

References: https://support.google.com/googleplay/android-developer/answer/9859455 ; https://support.google.com/googleplay/android-developer/answer/18265346 ; https://support.google.com/googleplay/android-developer/answer/9867159
