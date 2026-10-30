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
