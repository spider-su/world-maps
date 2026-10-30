# Firebase friends — staged implementation

## Product contract

World Maps remains offline-first. Local canonical v4 progress is authoritative. Firebase is opt-in;
never sign in, publish, or synchronize progress until the player explicitly enables social sharing.

The only public-facing payload is `SocialProfile`: chosen nickname, explorer ID, XP, level,
discovered/mastered counts, earned badge IDs, and updated-at timestamp. Never transmit
raw attempts, learning records, country IDs, voice preference, email or device identifiers.

Friends can view *snapshots*, with an explicit last-updated time; do not imply live data
while offline. Account deletion must remove the profile, relationships and invitation tokens.

## Firestore layout

- `users/{uid}/profile/public`: opt-in social snapshot; read by owner or accepted friends
- `users/{uid}/friends/{friendUid}`: accepted relationship; provision **only by trusted workflow**
- Invitations require an authenticated serverless function (Cloud Functions) or equivalent trusted
  backend for one-time opaque tokens and atomic bidirectional friendship acceptance.

**Important:** The included Firestore rules are deliberately fail-closed for invitations and friend
writes. They cannot create a social graph by themselves. Do **not** loosen friend document writes
to owner-only: that permits one user to forge access grants to another user's profile.

## Setup needed before connecting UI

1. Create a Firebase project and register Android `com.spidersu.worldmaps` and iOS `com.spidersu.worldmaps`.
2. Enable Firebase Authentication (choose a recoverable sign-in provider; do not rely solely
   on anonymous auth for friendships that should survive device loss).
3. Create Firestore and deploy `firebase/firestore.rules`; test owner, stranger, friend and
   blocked/deleted cases with Firebase emulator rule tests.
4. Implement and deploy a trusted invite/accept/revoke workflow, with rate limits and
   predictable friendship state across both users.
5. Integrate the Firebase JavaScript SDK with React Native persistence and lockfile updates;
   gate initialization by build-time public config. Configure authentication, sign-out,
   offline/error state, and explicit opt-in/opt-out.
6. Add Friends to Profile (not another Home card), QR/deep-link invitations, friend list,
   comparison by XP/discoveries, last updated, unlink/block and account deletion.
7. Verify Android/iOS, EN/PL/RU, offline gameplay, rules and consent before enabling.

No Firebase credentials, cloud project, authentication provider, invitation backend or live
synchronization are configured by this foundational PR.

## Minimum Firestore reads and writes

- Never poll on a timer. No background sync and no upload for every tap, guess, or round.
- Once the player opts into sharing, derive the snapshot locally. Compare a stable fingerprint
  excluding `updatedAt` and ignoring badge order. Send **one coalesced upload** only after the
  summary changes, when connected and authenticated; use a short debounce during bursts.
- Save the last **server-acknowledged** fingerprint locally. Do not mark it acknowledged on
  enqueue or failed writes; retry pending changes on the next foreground or connectivity event,
  with backoff. If a newer change arrives during an upload, compare again after acknowledgement.
- On reconnect do **not** blindly read/write every profile. Check existing cached data and known
  revisions. Remote profiles should be fetched only when missing or changed. A periodic refresh
  is not required for the MVP.
- Avoid permanent Firestore listeners on all friends. For a small friends list, read the
  friend index when the Friends screen opens, use a revision/last-updated marker to fetch only
  changed profiles, and reuse cached summaries on subsequent opens. The initial index read
  is still billable. When truly automatic changes are needed later, prefer a single foreground
  listener for the friend index, not one listener per friend.
- Explicitly throttle repeated Friends-screen openings and failed fetches. Never claim zero
  reads: reconnect, listeners, and index refreshes incur actual Firestore reads.
- A friend profile's `updatedAt` changes only when its meaningful fields change. Synchronizing
  local data on another device must not overwrite newer cloud summaries without conflict checks.

The helper functions in `socialSync.ts` codify fingerprint and revision decisions only. The
Firebase SDK, durable acknowledgment cache, retry coordinator and actual network calls are
**not implemented yet**; they must follow this policy when wired.

## QR/link invitations (implementation contract)

`friendInvite.ts` creates/parses an allowlisted HTTPS link with an opaque, random token;
it never includes UID, email or progress. The same link can be encoded into a QR image
or shared through the native share sheet. Its domain must be configured as an actual
Firebase Hosting/App Links/Universal Links domain before distributing invitations.

`firebase/functions/index.js` contains authenticated callable Cloud Functions:
`createFriendInvite` (24-hour token), `acceptFriendInvite` (one-use atomic mutual friendship),
`revokeFriendInvite` and `removeFriend`. Invitation tokens are stored as SHA-256 IDs, not plaintext.
Firestore's catch-all deny rule blocks clients from accessing the invitations collection directly.
App Check enforcement is enabled for the callables; it must be configured for installed apps.
Deploy with Firebase CLI after installing the functions dependencies and generating a lockfile.

These functions have NOT been deployed or exercised against a real Firebase project yet.
Before production, add function integration/emulator tests (expiry, replay, concurrent accept,
unauthorized revoke, remove, blocked users), request throttling, abuse controls and a delete-account
workflow that removes pending invites. The URL parser and expiry logic do have unit tests.

**UI integration remains pending:** QR rendering/scanning, share sheet, deep-link handling,
Firebase client initialization and consent screens require the configured Firebase project
and Expo-compatible SDKs. Do not show a working Invite button until the callable is deployed.

## Registered Firebase project (2026-10-30)

The owner registered Firebase project `world-map-1` (sender/project number
`923307762389`), Android package `com.spidersu.worldmaps` and Web app
`1:923307762389:web:1c9f78e38e058f204cb85c`. Public Web SDK identifiers
are in `src/features/social/firebaseConfig.ts`. A Firebase Web API key identifies
the client and is **not** a privileged service-account credential. Restrict the key
to the applicable Firebase APIs, enable App Check and enforce Firebase Security
Rules; do not rely on secrecy of client config to protect records.

The project's downloaded `google-services.json` is **not** committed. The
current Expo application plans to use the Firebase JavaScript SDK, so it does not
require manually adding the native Google Services Gradle plugin or BoM.
This commit records configuration only and does **not** initialize Firebase,
add an SDK dependency, make network calls, create accounts or sync data.

Next: add and lock the `firebase` npm dependency, initialize the SDK only after
social opt-in, persist auth safely on React Native, deploy/test the existing
Firestore rules and callable Functions, then connect Friends/QR UI and the
change-only synchronization coordinator. A real Firebase Auth provider,
App Check attestation and callable endpoints must be enabled before activating UI.

## Client integration branch (pending Firebase deployment)

The integration uses public Web app configuration, pinned `firebase@13.1.0`, lazy SDK
initialization, React Native AsyncStorage auth persistence, email/password sign-in,
opt-in profile uploads with a 1.2-second debounce, and small callable friend actions.

Required Firebase Console setup:
- Enable **Email/Password** in Authentication.
- Create a Firestore database and deploy `firebase/firestore.rules`.
- Deploy `firebase/functions` callables (Cloud Functions requires billing setup).
- Enable and configure Firebase App Check on Android and web before using the callable
  endpoints, since the Functions currently use `enforceAppCheck: true`.
- Provide correct Hosting domain configuration and app links for QR invitations.
- Verify the npm lockfile CI regeneration, Android release build and Firestore rules
  emulator tests before releasing.

The UI currently supports pasted invite URLs and native share links. Camera-based
QR scanning and QR image rendering are **not** yet integrated. Cloud access remains
disabled until user opt-in. Firebase itself must be configured by a project admin;
a checked-in Web config does not deploy services or grant access.

### Important limitations before production

- Friends list currently fetches small profiles on an explicit refresh or invitation
  acceptance. This is foreground-only, not real-time live presence.
- Local acknowledged fingerprints are device-local. Sign-out, sign-in on another
  device and server-side deletion require a reconciliation handshake before treating
  the local marker as server truth. Initial upload after enabling consent is allowed.
- Disabling consent locally must also delete the previously uploaded Firestore profile;
  account deletion, friend removal and revocation need complete UI flows.
- Cloud Function authentication, abuse limits, App Check, server rules, expired
  invitations and concurrent acceptance require deployed integration testing.
- Authentication errors are surfaced in the Friends panel. No cloud calls are made
  by ordinary gameplay while sharing is disabled.

## Invitation 404 troubleshooting

The Android `functions/not-found [404]` after **Create invitation link** comes from the
callable `createFriendInvite`, not from URL generation or Firestore rules. App code calls
the default `us-central1` Firebase Functions region; the callable is defined in
`firebase/functions/index.js` but will return 404 until deployed in that same region.
Before deploying, enable Blaze billing, Functions, Firestore, Authentication and App Check
as required by the existing `enforceAppCheck: true` configuration.

Deployment from repository root (Firebase CLI authentication required):

```sh
cd firebase/functions
npm install
cd ../..
npx firebase-tools use world-map-1
npx firebase-tools deploy --only functions:friends,firestore:rules --project world-map-1
npx firebase-tools functions:list --project world-map-1
```

Confirm `createFriendInvite` and `acceptFriendInvite` show **us-central1**. For
another region, change both the callable deployment region and the client
`getFunctions(app, '<region>')` together. The checked-in `.firebaserc` is a project
ID (not a secret); it does not indicate deployment has happened.
App Check must be correctly configured on the client before calls can succeed.
If enabling App Check is not yet possible, use a *development-only* environment,
not a production security-rule bypass.

Deployment and live end-to-end tests are **not** performed by this PR; it prepares
the missing Firebase CLI configuration and makes the error actionable.

## Android App Check (Play Integrity)

The Android Friends callable requests use `@react-native-firebase/app-check`
to obtain a native attestation token and attach it as `X-Firebase-AppCheck`
along with the Firebase Auth bearer token. This preserves the existing JS
Firebase Authentication integration.

**Firebase Console must be configured before testing:**

1. Firebase → App Check → Apps → register Android
   `com.spidersu.worldmaps` for **Play Integrity** with the APK signing
   SHA-256 certificate fingerprint.
2. Link the Play Integrity API to the same Google Cloud/Firebase project.
3. **Sideloaded preview APKs:** turn OFF the `PLAY_RECOGNIZED` and
   `LICENSED` requirements. Those labels require Google Play distribution.
   Choose appropriate device integrity requirements for your test phone.
4. Deploy `firebase/functions`. All four callable Functions currently
   enforce App Check. Firestore security rules separately enforce per-user
   access, regardless of App Check.
5. Install a *new* APK that includes this App Check integration. The previously
   installed APK cannot send valid tokens.
6. Sign in, create an invite, accept it on a second device, and verify friends.

For emulators or builds where Play Integrity cannot attest, the native SDK can
use a Firebase App Check **debug provider** with
`EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN`. Register that debug token under
App Check → Manage debug tokens. Restrict this to development/testing and do not
publish a build embedding a registered debug token; it is a bypass credential.

The SDK is initialized lazily on the first protected invitation call, so
ordinary offline gameplay does not trigger an App Check attestation.
Do not turn on global Firestore App Check enforcement while the app still uses
the Firebase JS Firestore client without an App Check token attachment.
