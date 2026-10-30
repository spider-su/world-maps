# Google sign-in for World Maps

Google sign-in is optional, in Profile → Friends. Gameplay needs no account.
The native implementation uses `@react-native-google-signin/google-signin`
and Firebase Auth's Google credential exchange. It **requires a native development
or production build**, not Expo Go.

## Firebase / Google Cloud Console setup

1. Firebase Authentication → Sign-in method → enable **Google** and select a
   support email.
2. Register the real Android debug/release SHA-1 and SHA-256 fingerprints in
   Firebase project `world-map-1`. Download the updated `google-services.json`.
3. Obtain the **Web OAuth 2.0 client ID** created for this Firebase project.
   Supply `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to Expo builds (public client ID).
4. Put the Android Firebase config in a local path and set
   `GOOGLE_SERVICES_JSON` to that path for the Expo config plugin. Never commit
   service-account keys. Do not use the Android API key as an OAuth client ID.
5. For iOS, register the iOS app, add GoogleService-Info.plist and configure the
   corresponding URL scheme/client plugin settings before enabling iOS builds.
6. Regenerate npm lockfile with `npm install`, create a new native build and
   validate actual Google account selection, Firebase user identity, sign-out,
   reinstall persistence, offline play, Android release signing and account errors.

Google authentication preserves the existing Firebase UID and friends only when
the same Firebase account is used. Linking an already-created email/password
account to Google requires an explicit account-linking flow to avoid duplicate
profiles; this is not implemented.

**Status**: client implementation and UI entry are added, but Google Cloud
OAuth credentials, native build validation and deployed Firebase Auth are still
required. Google account picker cannot be tested in Expo Go.
