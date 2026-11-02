---
title: "World Maps Privacy Policy"
permalink: /privacy/
---

# World Maps — privacy policy (publication draft)

**Status: DRAFT — publisher name and contact supplied. Do not publish until release build, SDK inventory, actual server configuration, retention, audience and account deletion flows are verified.** This is the sole intended public privacy-policy document for World Maps. Existing release and Firebase documentation remains technical evidence, not a second policy.

**Publisher / data controller:** Alex Kotik  
**Privacy and support email:** alex.kotik.net@gmail.com  
**Effective date:** [date]  
**Public policy URL:** https://spider-su.github.io/world-maps/privacy/ (planned; not live or verified)  
**Version / Android package:** [release version — pending candidate] / `com.spidersu.worldmaps`

## Core offline geography gameplay

World Maps stores quiz scores, completed rounds, country-learning progress, earned badges, preferences and language/voice settings on the user's device to provide offline learning features. These records are not automatically shared merely by playing offline. The user can control some local settings and may erase local records by deleting application data or uninstalling, subject to device backup behavior. The release must verify whether any other backups, telemetry or SDK transmissions occur.

## Optional online resources

Expanded Learn and globe country details fetch credited Wikimedia-hosted imagery when connected; photos start expanded there. Library photos load only after expansion. A request to a third-party image host may disclose ordinary network-request information such as IP address and user agent to that host. Offline maps and normal gameplay should remain functional without those images. Confirm exact image hosts and behavior for the release build.

## Optional Firebase friends and accounts — conditional section

**This section applies ONLY if the shipped release enables Firebase sign-in or social sharing.** If not enabled, remove or explicitly mark unavailable after auditing the build. When a player explicitly opts in, the current implementation supports Google and email/password authentication and a friend-facing nickname, explorer ID, XP, level, discovered/mastered counts, badge IDs and update time. Account identifiers and relationship/invitation state may be processed by Firebase Authentication, Firestore and Cloud Functions. The technical contract prohibits uploading raw quiz attempts, country IDs, voice settings, email in the *public social snapshot*, and per-tap events; this does not mean Firebase Authentication avoids handling account email. Cloud delivery, storage regions, subprocessors, retention and security must be verified for the actually deployed configuration.

Social sharing is optional. Profile opt-out deletes the shared snapshot, but complete account/relationship/invitation deletion and an account-deletion method in-app and on the web remain unfinished release gates. Verify deletion behavior and disclose retention exceptions before public account release. Describe relevant Firebase and Google privacy terms and cross-border transfers after legal review. **Do not claim social account deletion works merely because it is designed in docs.**

## Camera and download links

The optional QR scanner requests camera permission while open, decodes invitation links locally and does not save photos or record audio. Accepting an invitation sends its token to the protected server action. The app/download and invitation landing pages use Firebase Hosting; verify actual access-log processing and retention before publishing this policy. Native App Check and Google sign-in data flows also require release-specific audit.

## Other data processing and children's privacy

[Audit actual dependencies, crash SDKs, analytics, advertising ID, app permissions, device identifiers and any diagnostic collection; describe verified purposes, recipients, legal bases and retention.]  
[Select the actual intended audience and complete any applicable children's privacy requirements. Do not assume educational content is automatically a child-directed app.]

## Publisher contact

**Publisher / controller:** Alex Kotik, known in Google Play as **smart-box**. Privacy/support contact: **alex.kotik.net@gmail.com**. No physical correspondence address has been supplied; whether it must be displayed is awaiting legal/publisher review.

## Rights and contact

Depending on applicable law, users may have rights to access, correction, erasure, restriction, objection and complaint to a data-protection authority. Contact alex.kotik.net@gmail.com for requests involving data processed by the publisher. For device-only progress not sent to the publisher, the publisher may be unable to retrieve it.

## Changes

Update this policy and store declarations before adding or materially changing services, tracking, accounts, data transfers or deletion behavior.

## Release approval checklist (remove from public HTML)

- [ ] Confirm any required public correspondence address, effective date and release version; obtain owner approval.
- [ ] Verify release-build data flow and third-party recipients; reconcile Firebase feature flags with actual deployment.
- [ ] Verify legal bases, retention and data-subject request/deletion routes.
- [ ] Complete Google Play Data safety and account-deletion declarations.
- [ ] Publish exact approved text at the public HTTPS URL; ensure in-app/store links work.
