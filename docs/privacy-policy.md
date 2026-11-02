---
layout: default
title: "World Maps Privacy Policy"
permalink: /privacy/
---

# World Maps — privacy policy

**Publisher / data controller:** Alex Kotik (individual publisher, not acting as a JDG business). Google Play developer display name: smart-box.  
**Privacy and support email:** alex.kotik.net@gmail.com  
**Document updated:** 2026-11-02  
**Public policy URL:** https://spider-su.github.io/world-maps/privacy/  
**Android package:** `com.spidersu.worldmaps`

## Core offline geography gameplay

World Maps stores quiz scores, completed rounds, country-learning progress, earned badges, preferences and language/voice settings on the user's device to provide offline learning features. These records are not automatically shared merely by playing offline. The user can control some local settings and may erase local records by deleting application data or uninstalling, subject to device backup behavior. The release must verify whether any other backups, telemetry or SDK transmissions occur.

## Optional online resources

Expanded Learn and globe country details fetch credited Wikimedia-hosted imagery when connected; photos start expanded there. Library photos load only after expansion. A request to a third-party image host may disclose ordinary network-request information such as IP address and user agent to that host. Offline maps and normal gameplay should remain functional without those images. Confirm exact image hosts and behavior for the release build.

## Optional Firebase friends and accounts — conditional section

When a player explicitly opts in, the current implementation supports Google and email/password authentication and a friend-facing nickname, explorer ID, XP, level, discovered/mastered counts, badge IDs and update time. Account identifiers and relationship/invitation state may be processed by Firebase Authentication, Firestore and Cloud Functions. The technical contract prohibits uploading raw quiz attempts, country IDs, voice settings, email in the *public social snapshot*, and per-tap events; this does not mean Firebase Authentication avoids handling account email. Firebase and Google services process account and security information under their applicable service terms. For details about requests for deletion, email alex.kotik.net@gmail.com.

Social sharing is optional. Profile opt-out deletes the shared snapshot, but complete account/relationship/invitation deletion and an account-deletion method in-app and on the web remain unfinished release gates. Account deletion functionality is being completed; until it is released, this draft must not be used to represent the app as Google Play compliant.

## Camera and download links

The optional QR scanner requests camera permission while open, decodes invitation links locally and does not save photos or record audio. Accepting an invitation sends its token to the protected server action. The app/download and invitation landing pages use Firebase Hosting; server providers may process routine request and security logs subject to their service retention practices. Native App Check and Google sign-in data flows also require release-specific audit.

## Other data processing and children's privacy

The app is a geography learning product. The publisher must determine and declare its intended age groups before releasing account/social features.

## Publisher contact

**Publisher / controller:** Alex Kotik, acting as an individual (not as a JDG business), with Google Play display name **smart-box**. Privacy/support contact: **alex.kotik.net@gmail.com**. The publisher can be contacted using the email address above.

## Rights and contact

Depending on applicable law, users may have rights to access, correction, erasure, restriction, objection and complaint to a data-protection authority. Contact alex.kotik.net@gmail.com for requests involving data processed by the publisher. For device-only progress not sent to the publisher, the publisher may be unable to retrieve it.

## Changes

Update this policy and store declarations before adding or materially changing services, tracking, accounts, data transfers or deletion behavior.
