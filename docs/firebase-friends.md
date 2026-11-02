# Optional Firebase Friends — current implementation

Core gameplay and canonical local v4 progress remain offline and authoritative.
Friends is optional, enabled from Profile; consent gates Firebase initialization.
Startup parses incoming links locally without signing in or accepting invitations.
Cloud summaries are not progress backups or a cross-device restore mechanism.

## Implemented client behavior

- Profile provides nickname, email/password and Google authentication controls,
  sharing opt-in/out, sign-out, friend summaries and QR/link invitation actions.
- Localized busy states prevent duplicate actions. Failed preference writes retain
  confirmed consent. Incoming links open Profile and require explicit approval.
- QR images encode opaque invitations. The focused scanner requests camera access
  only while open; QR decoding does not save photos or request microphone access.
  Manual link entry remains an alternative.
- HTTPS links use `world-map-1.web.app`; the parser also accepts the legacy host
  and `worldmaps://friend` scheme. A link contains no UID, email or quiz records.
- `FriendsPanel` debounces summary synchronization by 1.2 seconds. The stable
  fingerprint excludes timestamps and badge order. `socialSession` persists a
  per-account acknowledgment only after the server write succeeds.
- Friend index and profile reads occur on foreground focus, refresh or acceptance.
  There is no background polling or permanent per-friend listener.

The shared snapshot contains nickname, explorer ID, XP, level, discovered/mastered
counts, earned badge IDs and update time. It excludes raw attempts, country IDs,
voice preferences and email. Firebase Authentication still handles account email
and credentials; App Check handles attestation. Do not extend the snapshot whitelist
without reviewing the data flow and publication draft.

## Server contract

`firebase/firestore.rules` allows profile access to its owner and accepted friends.
Clients cannot directly forge friendships or read invitation documents.
Authenticated, App Check-protected callables in `firebase/functions/index.js`:

- `createFriendInvite`: random, 24-hour token; database stores its SHA-256 ID.
- `acceptFriendInvite`: atomic mutual friendship and one-use token consumption.
- `revokeFriendInvite` and `removeFriend`: server actions without current client UI.

These are source contracts. Expiry/replay/concurrent acceptance, stranger access,
removal and recovery still require deployed integration/rules evidence.

## Current limits

- No serialized concurrent sync coordinator, durable retry queue, connectivity
  backoff or automatic cloud restore. A later foreground call can retry a failed upload.
- Device-local acknowledgment can become stale after opt-out or server deletion;
  reconciliation is unfinished. Do not treat it as proof the remote record exists.
- Every list refresh reads the index and profiles. Revision-aware caching and fetch
  throttling are planned; the tested `needsFriendFetch` helper is not wired into UI.
- Update time exists in the payload but is not displayed as a freshness indicator.
- Opt-out deletes the shared profile; this is not complete account deletion.
  Account, relationships and outstanding invitations need a complete deletion flow.
- Friend removal/revocation UI and end-to-end two-account acceptance remain open.

## Configuration and deployment

Public Web configuration in `firebaseConfig.ts` identifies project `world-map-1`;
API keys in client configuration are not privileged service-account credentials.
Security depends on authentication, rules and attestation. Native Google sign-in
and App Check plugins are already integrated; generated `google-services.json`
is ignored and must not be committed. See [deployment setup](firebase-github-deploy.md).

Android invitation calls attach native App Check tokens and Firebase Auth tokens.
Configure the package and signing certificate in Firebase/Play Integrity for the
actual distribution channel. For emulator development, register an App Check debug
token separately; never distribute a build embedding a registered debug token.
Do not globally enforce Firestore App Check until the JS Firestore client supplies
attestation. Native callable support does not prove web/iOS attestation works.

As of 2026-11-02, the main Friends deployment workflow reports success, while main
Mobile CI was cancelled and Hosting deployment skipped. Both public `/` and
`/friend` URLs returned HTTP 404. See [dated status and run links](implementation-status.md).
Workflow success does not prove physical scanning, rules isolation or two-account flows.

A browser URL 404 concerns Hosting. A callable `functions/not-found` may mean a
missing endpoint or an expired/consumed/missing invite, depending on the action.
Check the callable, region (`us-central1`) and server error before diagnosing it.
Hosting publishes only an APK from successful main CI, with verified source,
digest and signing association; a PR check is not a public release.

## Verification boundaries

See [testing](testing.md) and [sharing evidence](evidence/profile-sharing/README.md).
Unit tests cover parsing, summaries, fingerprint decisions and session acknowledgment
failures. Prior runtime evidence covers mocked backend/loading flows, Android links
and scanner permission/loading. Physical optical scanning, camera preview readiness,
iOS, screen readers and real two-account approval are not established by those checks.
